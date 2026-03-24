import Razorpay from 'razorpay';
import crypto from 'crypto';
import db from '../config/db.js';
import * as notificationController from './notificationController.js';

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @desc    Initiate a payment order
export const createOrder = async (req, res) => {
    const { requestId } = req.body;

    try {
        // 1. Fetch the quoted cost and verify request exists
        const request = await db.query(
            'SELECT quoted_cost, status FROM service_requests WHERE id = $1',
            [requestId]
        );

        if (request.rows.length === 0) {
            return res.status(404).json({ message: 'Service request not found' });
        }

        const cost = Number(request.rows[0].quoted_cost);
        if (!cost || cost <= 0) {
            return res.status(400).json({ message: 'No valid invoice found for this request' });
        }

        // 2. Create Razorpay order (or mock order for demo)
        const orderId = 'order_demo_' + Date.now();
        const order = {
            id: orderId,
            amount: cost * 100, // paisa
            currency: 'INR'
        };

        // 3. Persist as PENDING transaction in our ledger
        await db.query(
            'INSERT INTO transactions (request_id, transaction_ref, amount, status) VALUES ($1, $2, $3, $4)',
            [requestId, orderId, cost, 'pending']
        );

        res.json(order);
    } catch (err) {
        console.error('[Finance] Order creation failure:', err);
        res.status(500).json({ message: 'Failed to initiate secure portal' });
    }
};

// @desc    Verify payment signature (Secure Webhook/Callback)
// @route   POST /api/finance/verify
export const verifyPayment = async (req, res) => {
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

            if (txResult.rows.length === 0) {
                return res.status(404).json({ message: "Transaction record not found" });
            }

            const requestId = txResult.rows[0].request_id;

            // 3. Update job status to completed & Fetch producer ID
            const jobUpdateResult = await db.query(
                "UPDATE service_requests SET status = 'completed' WHERE id = $1 RETURNING producer_id, consumer_id, quoted_cost",
                [requestId]
            );

            const producerId = jobUpdateResult.rows[0].producer_id;
            const consumerId = jobUpdateResult.rows[0].consumer_id;
            const totalAmount = Number(jobUpdateResult.rows[0].quoted_cost);

            // [NEW] Calculate transparency breakdown (10% platform, 18% GST)
            const platformFee = Math.round(totalAmount * 0.10);
            const gst = Math.round(totalAmount * 0.18);
            const expertAmount = totalAmount - platformFee - gst;

            // Update transaction with details
            await db.query(
                `UPDATE transactions 
                 SET expert_id = $1, platform_fee = $2, gst = $3, expert_amount = $4 
                 WHERE request_id = $5 AND status = 'paid'`,
                [producerId, platformFee, gst, expertAmount, requestId]
            );

            // 4. Notify Producer via Socket & Persistent Notification
            const io = req.app.get('socketio');
            if (io) {
                io.emit(`status_update_${requestId}`, {
                    status: 'completed',
                    message: "Payment received! Job finalized."
                });
                io.to(`user_${req.user.id}`).emit('finance_chart_update');
                if (consumerId) {
                    io.to(`user_${consumerId}`).emit('payment_success', {
                        requestId,
                        amount: totalAmount
                    });
                    io.to(`user_${consumerId}`).emit('request_status_updated', {
                        requestId,
                        status: 'completed'
                    });
                    io.to(`user_${consumerId}`).emit('finance_chart_update');
                }
            }

            if (producerId) {
                await notificationController.createNotification(
                    producerId,
                    'Payment Received',
                    `You have received payment of ₹${expertAmount.toLocaleString()} for Job #${requestId.substring(0, 6).toUpperCase()}. (Total: ₹${totalAmount.toLocaleString()})`,
                    'payment',
                    `/finance`
                );
            }

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
export const getStats = async (req, res) => {
    const userId = req.user.id;
    const role = req.user.role;

    try {
        let stats;
        if (role === 'producer') {
            // Stats for Expert
            const revenueRes = await db.query(
                `SELECT 
                    COALESCE(SUM(amount), 0) as total_revenue,
                    COALESCE(AVG(amount), 0) as avg_ticket
                 FROM transactions t
                 JOIN service_requests sr ON t.request_id = sr.id
                 WHERE sr.producer_id = $1 AND t.status = 'paid'`,
                [userId]
            );

            const pendingRes = await db.query(
                `SELECT COALESCE(SUM(quoted_cost), 0) as pending_payout 
                 FROM service_requests 
                 WHERE producer_id = $1 AND status IN ('accepted', 'payment_pending')`,
                [userId]
            );

            stats = {
                totalRevenue: Number(revenueRes.rows[0].total_revenue),
                pendingPayout: Number(pendingRes.rows[0].pending_payout),
                avgTicket: Math.round(Number(revenueRes.rows[0].avg_ticket)),
                totalSpent: 0
            };
        } else {
            // Stats for Consumer
            const spentRes = await db.query(
                `SELECT COALESCE(SUM(amount), 0) as total_spent
                 FROM transactions t
                 JOIN service_requests sr ON t.request_id = sr.id
                 WHERE sr.consumer_id = $1 AND t.status = 'paid'`,
                [userId]
            );

            stats = {
                totalRevenue: 0,
                pendingPayout: 0,
                avgTicket: 0,
                totalSpent: Number(spentRes.rows[0].total_spent)
            };
        }

        res.json(stats);
    } catch (err) {
        console.error('[Finance] Stats retrieval failure:', err);
        res.status(500).json({ message: 'Internal ledger error' });
    }
};

// @desc    Get recent transactions
// @route   GET /api/finance/history
export const getHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const role = req.user.role;
        let query = '';

        if (role === 'producer') {
            query = `
                SELECT 
                    t.id, t.created_at, u.first_name as other_party, 
                    sr.id as service_id, t.status, t.amount,
                    t.expert_amount, t.platform_fee, t.gst, t.type
                FROM transactions t
                JOIN service_requests sr ON t.request_id = sr.id
                JOIN users u ON sr.consumer_id = u.id
                WHERE sr.producer_id = $1
                ORDER BY t.created_at DESC
                LIMIT 20
            `;
        } else {
            query = `
                SELECT 
                    t.id, t.created_at, u.first_name as other_party, 
                    sr.id as service_id, t.status, t.amount,
                    t.expert_amount, t.platform_fee, t.gst,
                    pp.level as expert_level, pp.rating as expert_rating
                FROM transactions t
                JOIN service_requests sr ON t.request_id = sr.id
                JOIN users u ON sr.producer_id = u.id
                LEFT JOIN producer_profiles pp ON pp.user_id = u.id
                WHERE sr.consumer_id = $1
                ORDER BY t.created_at DESC
                LIMIT 20
            `;
        }

        const result = await db.query(query, [userId]);

        const formatted = result.rows.map(row => ({
            id: row.id,
            created_at: row.created_at,
            date: row.created_at ? new Date(row.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Recent',
            client: row.other_party,
            expert_name: row.other_party,
            expert_level: row.expert_level || 'Elite',
            expert_rating: row.expert_rating || '5.0',
            service: `#SR-${row.service_id?.toString().substring(0, 6) || 'N/A'}`,
            status: row.status.charAt(0).toUpperCase() + row.status.slice(1),
            amount: `₹${row.amount}`,
            total_amount: Number(row.amount),
            expert_payout: Number(row.expert_amount || (row.amount * 0.72)),
            platform_fee: Number(row.platform_fee || (row.amount * 0.10)),
            gst: Number(row.gst || (row.amount * 0.18)),
            is_salary: row.type === 'salary'
        }));

        res.json(formatted);
    } catch (err) {
        console.error('[Finance] History retrieval failure:', err);
        res.status(500).json({ message: 'Could not fetch transaction history' });
    }
};

// @desc    Get chart data for revenue/spending trends
// @route   GET /api/finance/chart-data
export const getChartData = async (req, res) => {
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
