import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import 'dotenv/config';
import db from '../config/db.js';
import * as paymentController from '../controllers/paymentController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    console.warn("⚠️ Razorpay keys are missing in .env. Payment features might fail.");
}

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ─── Create escrow payment (controller-based) ───────────────────────────
router.post('/create', auth, paymentController.createPayment);

// ─── Create Razorpay order + escrow transaction ─────────────────────────
router.post('/create-order', async (req, res) => {
    try {
        const { providerPrice, requestId } = req.body;
        if (!providerPrice) {
            return res.status(400).json({ error: 'providerPrice is required' });
        }

        // Escrow calculation
        const baseAmount = Number(providerPrice);
        const platformFee = +(baseAmount * 0.10).toFixed(2);
        const gst = +(platformFee * 0.18).toFixed(2);
        const expertAmount = +(baseAmount - platformFee - gst).toFixed(2);
        const totalPaid = +(baseAmount + platformFee + gst).toFixed(2);

        const options = {
            amount: Math.round(totalPaid * 100), // Convert to paise
            currency: "INR",
            receipt: `receipt_${Date.now()}`
        };

        let order;
        try {
            order = await razorpay.orders.create(options);
        } catch (rzpErr) {
            console.warn('[Payment] Razorpay order creation failed, using mock order:', rzpErr.message);
            order = {
                id: `order_mock_${Date.now()}`,
                amount: options.amount,
                currency: options.currency,
                receipt: options.receipt
            };
        }

        // Ensure requestId is a valid UUID, otherwise null (for demo mocks)
        const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(requestId));
        const safeRequestId = isValidUUID ? requestId : null;

        // Look up consumer & expert from the service request
        let consumerId = null;
        let expertId = null;
        if (safeRequestId) {
            const srResult = await db.query(
                'SELECT consumer_id, producer_id FROM service_requests WHERE id = $1',
                [safeRequestId]
            );
            if (srResult.rows.length > 0) {
                consumerId = srResult.rows[0].consumer_id;
                expertId = srResult.rows[0].producer_id;
            }
        }

        // Store in DB as escrow — using actual column names
        await db.query(
            `INSERT INTO transactions (
                request_id, job_id, consumer_id, expert_id,
                base_amount, platform_fee, gst, expert_amount,
                provider_price, provider_payout,
                razorpay_order_id, transaction_ref, status, amount
            ) VALUES ($1, $1, $2, $3, $4, $5, $6, $7, $4, $7, $8, $8, 'escrow', $9)`,
            [
                safeRequestId,
                consumerId,
                expertId,
                baseAmount,
                platformFee,
                gst,
                expertAmount,
                order.id,
                totalPaid
            ]
        );

        // Emit real-time event for admin dashboard
        if (global.io) {
            global.io.emit('payment_update', {
                event: 'new_escrow',
                job_id: safeRequestId,
                base_amount: baseAmount,
                platform_fee: platformFee,
                gst,
                expert_amount: expertAmount,
                status: 'escrow'
            });
        }

        res.status(200).json(order);
    } catch (error) {
        console.error('Error creating Razorpay order:', error);
        res.status(500).json({ error: 'Failed to create payment order' });
    }
});

// ─── Verify Razorpay payment & move to escrow ───────────────────────────
router.post('/verify-payment', async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ error: 'Missing payment verification parameters' });
        }

        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest("hex");

        const isAuthentic = expectedSignature === razorpay_signature;

        if (isAuthentic) {
            // Update payment_ref to the actual payment ID, keep status as 'escrow' 
            // (funds are held until admin releases)
            const transRes = await db.query(
                `UPDATE transactions 
                 SET razorpay_payment_id = $1, transaction_ref = $1
                 WHERE razorpay_order_id = $2 OR transaction_ref = $2
                 RETURNING *`,
                [razorpay_payment_id, razorpay_order_id]
            );

            if (transRes.rows.length > 0) {
                const txn = transRes.rows[0];
                const requestId = txn.request_id || txn.job_id;

                if (requestId) {
                    // Update Job status to payment_pending (waiting for admin release)
                    await db.query(
                        `UPDATE service_requests SET status = 'payment_pending' WHERE id = $1`,
                        [requestId]
                    );

                    // Notify parties via Socket
                    const jobRes = await db.query(
                        `SELECT producer_id, consumer_id, quoted_cost FROM service_requests WHERE id = $1`,
                        [requestId]
                    );

                    if (jobRes.rows.length > 0) {
                        const { producer_id, consumer_id, quoted_cost } = jobRes.rows[0];

                        if (global.io) {
                            if (producer_id) {
                                global.io.to(`user_${producer_id}`).emit('notification', {
                                    id: Date.now(),
                                    type: 'info',
                                    msg: `Payment of ₹${quoted_cost} received and held in escrow. Awaiting release.`,
                                    time: 'Just now',
                                    read: false
                                });
                            }

                            if (consumer_id) {
                                global.io.to(`user_${consumer_id}`).emit('status_update', {
                                    requestId,
                                    status: 'payment_pending',
                                    message: 'Payment confirmed. Funds held in escrow until job completion.'
                                });
                            }

                            // Notify admin dashboard
                            global.io.emit('payment_update', {
                                ...txn,
                                event: 'payment_verified'
                            });
                        }
                    }
                }
            }

            res.status(200).json({
                success: true,
                message: 'Payment verified. Funds held in escrow until admin release.',
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'Invalid payment signature',
            });
        }
    } catch (error) {
        console.error('Error verifying Razorpay payment:', error);
        res.status(500).json({ error: 'Failed to verify payment' });
    }
});

export default router;
