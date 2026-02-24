const Razorpay = require('razorpay');
const crypto = require('crypto');
const db = require('../db');
const notificationController = require('./notificationController');

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @desc    Initiate a payment order
// @route   POST /api/finance/pay-order
exports.createOrder = async (req, res) => {
    // MOCK MODE: Always succeed and return a demo order for payment testing
    const { requestId } = req.body;
    // Simulate a quoted cost for demo
    const quoted_cost = 5000;
    const order = { id: 'order_demo_' + Date.now(), amount: quoted_cost * 100, currency: 'INR' };
    res.json(order);
};

// @desc    Verify payment signature (Secure Webhook/Callback)
// @route   POST /api/finance/verify
exports.verifyPayment = async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    try {
        // 1. Verify cryptographic signature
        let isAuthentic = false;

        if (razorpay_signature === 'mock_signature') {
            isAuthentic = true; // Demo Bypass
        } else {
            const sign = razorpay_order_id + "|" + razorpay_payment_id;
            const expectedSign = crypto
                .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "demo_secret")
                .update(sign.toString())
                .digest("hex");
            isAuthentic = (razorpay_signature === expectedSign);
        }

        if (isAuthentic) {
            // 2. Update transaction status to PAID
            const txResult = await db.query(
                `UPDATE transactions 
                 SET status = $1, transaction_ref = $2 
                 WHERE transaction_ref = $3 
                 RETURNING request_id`,
                ['paid', razorpay_payment_id, razorpay_order_id]
            );

            const requestId = txResult.rows[0].request_id;

            // 3. Update job status to completed & Fetch producer ID to notify
            const jobUpdateResult = await db.query(
                "UPDATE service_requests SET status = 'completed' WHERE id = $1 RETURNING producer_id",
                [requestId]
            );

            const producerId = jobUpdateResult.rows[0].producer_id;

            // 4. Notify Producer via Socket & Persistent Notification
            const io = req.app.get('socketio');
            if (io) {
                io.emit(`status_update_${requestId}`, {
                    status: 'completed',
                    message: "Payment received! Job finalized."
                });
                // Emit real-time chart update for all clients of this user
                io.to(`user_${req.user.id}`).emit('finance_chart_update');
            }

            await notificationController.createNotification(
                producerId,
                'Payment Received',
                `You have received payment for Job #${requestId.substring(0, 6)}. Funds are being processed.`,
                'payment',
                `/finance`
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

// @desc    Get dashboard financial stats
// @route   GET /api/finance/stats
exports.getStats = async (req, res) => {
    // TEMPORARY: Return mock stats so frontend works without DB
    const role = req.user.role;
    let stats;
    if (role === 'producer') {
        stats = { totalRevenue: 100000, pendingPayout: 5000, avgTicket: 2500, totalSpent: 0 };
    } else {
        stats = { totalRevenue: 0, pendingPayout: 0, avgTicket: 0, totalSpent: 42000 };
    }
    res.json(stats);
};

// @desc    Get recent transactions
// @route   GET /api/finance/history
exports.getHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const role = req.user.role;
        let query = '';

        if (role === 'producer') {
            query = `
                SELECT t.id, t.created_at, u.first_name as other_party, sr.id as service_id, t.status, t.amount
                FROM transactions t
                JOIN service_requests sr ON t.request_id = sr.id
                JOIN users u ON sr.consumer_id = u.id
                WHERE sr.producer_id = $1
                ORDER BY t.created_at DESC
                LIMIT 10
            `;
        } else {
            query = `
                SELECT t.id, t.created_at, u.first_name as other_party, sr.id as service_id, t.status, t.amount
                FROM transactions t
                JOIN service_requests sr ON t.request_id = sr.id
                JOIN users u ON sr.producer_id = u.id
                WHERE sr.consumer_id = $1
                ORDER BY t.created_at DESC
                LIMIT 10
            `;
        }

        const result = await db.query(query, [userId]);

        const formatted = result.rows.map(row => ({
            id: row.id,
            date: new Date(row.created_at).toLocaleDateString(),
            client: row.other_party,
            service: `#SR-${row.service_id.toString().substring(0, 6)}`,
            status: row.status.charAt(0).toUpperCase() + row.status.slice(1),
            amount: `₹${row.amount}`
        }));

        res.json(formatted);
    } catch (err) {
        console.error('[Finance] History retrieval failure:', err);
        res.status(500).json({ message: 'Could not fetch transaction history' });
    }
};

// @desc    Get chart data for revenue/spending trends
// @route   GET /api/finance/chart-data
exports.getChartData = async (req, res) => {
    try {
        const userId = req.user.id;
        const role = req.user.role;

        let query = '';
        if (role === 'producer') {
            query = `
                SELECT DATE_TRUNC('day', t.created_at) as date, SUM(amount) as amount
                FROM transactions t
                JOIN service_requests sr ON t.request_id = sr.id
                WHERE sr.producer_id = $1 AND t.status = 'paid'
                GROUP BY date
                ORDER BY date ASC
                LIMIT 30
            `;
        } else {
            query = `
                SELECT DATE_TRUNC('day', t.created_at) as date, SUM(amount) as amount
                FROM transactions t
                JOIN service_requests sr ON t.request_id = sr.id
                WHERE sr.consumer_id = $1 AND t.status = 'paid'
                GROUP BY date
                ORDER BY date ASC
                LIMIT 30
            `;
        }

        const result = await db.query(query, [userId]);

        // Mock data if empty for demo
        let data = result.rows.map(row => ({
            name: new Date(row.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            value: parseFloat(row.amount)
        }));

        if (data.length === 0) {
            data = [
                { name: 'Mon', value: 2400 },
                { name: 'Tue', value: 1398 },
                { name: 'Wed', value: 9800 },
                { name: 'Thu', value: 3908 },
                { name: 'Fri', value: 4800 },
                { name: 'Sat', value: 3800 },
                { name: 'Sun', value: 4300 }
            ];
        }

        res.json(data);
    } catch (err) {
        console.error('[Finance] Chart data failure:', err);
        res.status(500).json({ message: 'Could not fetch chart analytics' });
    }
};
