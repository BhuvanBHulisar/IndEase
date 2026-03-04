import express from 'express';
import Razorpay from 'razorpay';
import 'dotenv/config';

const router = express.Router();

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    console.warn("⚠️ Razorpay keys are missing in .env. Payment features might fail.");
}

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

import db from '../config/db.js';

router.post('/create-order', async (req, res) => {
    try {
        const { providerPrice, requestId } = req.body;
        if (!providerPrice) {
            return res.status(400).json({ error: 'providerPrice is required' });
        }

        const commissionPercentage = parseFloat(process.env.PLATFORM_COMMISSION_PERCENTAGE || '10');
        const commission_amount = (providerPrice * commissionPercentage) / 100;
        const gst_amount = commission_amount * 0.18;
        const total_paid = providerPrice + commission_amount + gst_amount;

        const provider_payout = providerPrice;
        const platform_profit = commission_amount;

        const options = {
            amount: Math.round(total_paid * 100), // Convert to paise
            currency: "INR",
            receipt: `receipt_${Date.now()}`
        };

        const order = await razorpay.orders.create(options);

        // Ensure requestId is a valid UUID, otherwise null (for demo mocks)
        const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(requestId));
        const safeRequestId = isValidUUID ? requestId : null;

        // Store in DB as pending
        await db.query(
            `INSERT INTO transactions (
                request_id, transaction_ref, amount, status, 
                provider_price, commission_amount, gst_amount, 
                provider_payout, platform_profit
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [
                safeRequestId,
                order.id,
                total_paid,
                'pending',
                providerPrice,
                commission_amount,
                gst_amount,
                provider_payout,
                platform_profit
            ]
        );

        res.status(200).json(order);
    } catch (error) {
        console.error('Error creating Razorpay order:', error);
        res.status(500).json({ error: 'Failed to create payment order' });
    }
});

import crypto from 'crypto';

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
            // Update transaction to paid
            await db.query(
                `UPDATE transactions SET status = 'paid', transaction_ref = $1 WHERE transaction_ref = $2`,
                [razorpay_payment_id, razorpay_order_id]
            );

            res.status(200).json({
                success: true,
                message: 'Payment has been verified successfully',
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
