const Razorpay = require('razorpay');
const crypto = require('crypto');
const db = require('../db');

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @desc    Initiate a payment order
// @route   POST /api/finance/pay-order
exports.createOrder = async (req, res) => {
    const { amount, requestId } = req.body;

    try {
        // 1. Create order in Razorpay cloud
        const options = {
            amount: amount * 100, // Razorpay works in paise (sub-units)
            currency: "INR",
            receipt: `receipt_req_${requestId}`,
        };

        const order = await razorpay.orders.create(options);

        // 2. Log pending transaction in local ledger
        await db.query(
            'INSERT INTO transactions (request_id, transaction_ref, amount, status) VALUES ($1, $2, $3, $4)',
            [requestId, order.id, amount, 'pending']
        );

        res.json(order);
    } catch (err) {
        console.error('[Finance] Order creation failure:', err);
        res.status(500).json({ message: 'Payment gateway connection failure' });
    }
};

// @desc    Verify payment signature (Secure Webhook/Callback)
// @route   POST /api/finance/verify
exports.verifyPayment = async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    try {
        // 1. Verify cryptographic signature
        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(sign.toString())
            .digest("hex");

        if (razorpay_signature === expectedSign) {
            // 2. Update transaction status to PAID
            await db.query(
                'UPDATE transactions SET status = $1, transaction_ref = $2 WHERE transaction_ref = $3',
                ['paid', razorpay_payment_id, razorpay_order_id]
            );

            // 3. Update job status to completed if needed
            // (Simplified: assuming payment completion closes the job)
            await db.query(
                "UPDATE service_requests SET status = 'completed' WHERE id = (SELECT request_id FROM transactions WHERE transaction_ref = $1)",
                [razorpay_payment_id]
            );

            return res.status(200).json({ message: "Transaction authenticated and recorded." });
        } else {
            return res.status(400).json({ message: "Invalid signature. Transaction rejected." });
        }
    } catch (err) {
        console.error('[Finance] Verification failure:', err);
        res.status(500).json({ message: "Internal ledger error" });
    }
};
