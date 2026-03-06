import express from 'express';
import db from '../config/db.js';

const router = express.Router();

// Middleware to ensure admin role (already defined elsewhere)
import { adminOnly } from '../middleware/adminAuth.js';
router.use(adminOnly);

// ---------- Summary ----------
router.get('/summary', async (req, res) => {
    try {
        const { rows: revenueRows } = await db.query(
            `SELECT COALESCE(SUM(total_price),0) AS totalRevenue FROM transactions WHERE status='paid'`
        );
        const { rows: pendingRows } = await db.query(
            `SELECT COALESCE(SUM(total_price),0) AS pendingPayout FROM transactions WHERE status='pending'`
        );
        const { rows: jobsRows } = await db.query(
            `SELECT COUNT(*) AS totalJobs FROM service_requests`
        );
        const summary = {
            totalRevenue: Number(revenueRows[0].totalrevenue),
            pendingPayout: Number(pendingRows[0].pendingpayout),
            totalJobs: Number(jobsRows[0].totaljobs)
        };
        res.json(summary);
    } catch (err) {
        console.error('Admin summary error:', err);
        res.status(500).json({ error: 'Failed to fetch summary' });
    }
});

// ---------- Users ----------
router.get('/users', async (req, res) => {
    try {
        const { rows } = await db.query(
            `SELECT id, email, role, created_at FROM users ORDER BY created_at DESC`
        );
        res.json(rows);
    } catch (err) {
        console.error('Admin users error:', err);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

router.patch('/users/:id/role', async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;
    if (!role) return res.status(400).json({ error: 'Missing role' });
    try {
        await db.query(`UPDATE users SET role=$1 WHERE id=$2`, [role, id]);
        res.json({ success: true });
    } catch (err) {
        console.error('Admin update role error:', err);
        res.status(500).json({ error: 'Failed to update role' });
    }
});

// ---------- Jobs ----------
router.get('/jobs', async (req, res) => {
    try {
        const { rows } = await db.query(
            `SELECT sr.id, sr.status, sr.created_at, u.email AS consumer, p.email AS producer, sr.quoted_cost
       FROM service_requests sr
       LEFT JOIN users u ON sr.consumer_id = u.id
       LEFT JOIN users p ON sr.producer_id = p.id
       ORDER BY sr.created_at DESC`
        );
        res.json(rows);
    } catch (err) {
        console.error('Admin jobs error:', err);
        res.status(500).json({ error: 'Failed to fetch jobs' });
    }
});

router.patch('/jobs/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: 'Missing status' });
    try {
        await db.query(`UPDATE service_requests SET status=$1 WHERE id=$2`, [status, id]);
        // Emit socket updates if needed (optional)
        if (global.io) {
            const jobRes = await db.query(
                `SELECT consumer_id, producer_id FROM service_requests WHERE id=$1`,
                [id]
            );
            if (jobRes.rows.length) {
                const { consumer_id, producer_id } = jobRes.rows[0];
                if (consumer_id) global.io.to(`user_${consumer_id}`).emit('status_update', { requestId: id, status });
                if (producer_id) global.io.to(`user_${producer_id}`).emit('job_updated', { requestId: id, status });
            }
        }
        res.json({ success: true });
    } catch (err) {
        console.error('Admin update job status error:', err);
        res.status(500).json({ error: 'Failed to update job status' });
    }
});

// ---------- Payments ----------
router.get('/payments', async (req, res) => {
    try {
        const { rows } = await db.query(
            `SELECT t.id, t.amount, t.status, t.created_at, cu.email AS consumer, pu.email AS producer
       FROM transactions t
       LEFT JOIN users cu ON t.consumer_id = cu.id
       LEFT JOIN users pu ON t.producer_id = pu.id
       ORDER BY t.created_at DESC`
        );
        res.json(rows);
    } catch (err) {
        console.error('Admin payments error:', err);
        res.status(500).json({ error: 'Failed to fetch payments' });
    }
});

export default router;
