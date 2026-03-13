import express from 'express';
import db from '../config/db.js';
import * as paymentController from '../controllers/paymentController.js';
import { adminOnly } from '../middleware/adminAuth.js';

const router = express.Router();

// All routes require admin authentication
router.use(adminOnly);

// ────────────── Summary ──────────────
router.get('/summary', async (req, res) => {
    try {
        const { rows: revenueRows } = await db.query(
            `SELECT COALESCE(SUM(COALESCE(base_amount, provider_price, amount)),0) AS totalRevenue FROM transactions WHERE status IN ('escrow','completed','paid')`
        );
        const { rows: pendingRows } = await db.query(
            `SELECT COALESCE(SUM(COALESCE(expert_amount, provider_payout, 0)),0) AS pendingPayout FROM transactions WHERE status='escrow'`
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

// ────────────── Users ──────────────
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

// ────────────── Jobs ──────────────
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

// ────────────── Payments (Escrow Ledger) ──────────────
router.get('/payments', paymentController.getAllPayments);

// Release escrow → completed
router.patch('/payments/release/:id', paymentController.releasePayment);

// Dashboard metrics (revenue, commission, escrow)
router.get('/dashboard/metrics', paymentController.getMetrics);

// ────────────── Analytics ──────────────
router.get('/analytics/job-distribution', async (req, res) => {
    try {
        const { rows } = await db.query(
            `SELECT status, COUNT(*) AS count FROM service_requests GROUP BY status`
        );
        res.json({ categories: rows });
    } catch (err) {
        console.error('Job distribution error:', err);
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
});

export default router;
