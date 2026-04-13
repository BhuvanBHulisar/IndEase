import express from 'express';
import * as jobController from '../controllers/jobController.js';
import * as reviewController from '../controllers/reviewController.js';
import { protect as auth } from '../middleware/auth.middleware.js';
import { roleCheck } from '../middleware/roleCheck.js';
import db from '../config/db.js';

const router = express.Router();

/**
 * JOB & RADAR ROUTES
 */

// @route   POST api/jobs/broadcast
// @desc    Consumer broadcasts a machine fault
router.post('/broadcast', auth, roleCheck(['consumer']), jobController.broadcastJob);

// @route   GET api/jobs/radar
// @desc    Experts scan the radar for active signals
router.get('/radar', auth, roleCheck(['producer']), jobController.getRadarJobs);

// @route   GET api/jobs/producer-stats
// @desc    Get expert dashboard statistics
router.get('/producer-stats', auth, roleCheck(['producer']), jobController.getProducerStats);

// @route   PATCH api/jobs/:id/accept
// @desc    Expert accepts the assignment
router.patch('/:id/accept', auth, roleCheck(['producer']), jobController.acceptJob);

// @route   PATCH api/jobs/:id/decline
// @desc    Expert declines / skips a broadcast job
router.patch('/:id/decline', auth, roleCheck(['producer']), jobController.declineJob);

// @route   PATCH api/jobs/:id/start-work
// @desc    Expert marks repair as in progress
router.patch('/:id/start-work', auth, roleCheck(['producer']), jobController.startWork);

// @route   PATCH api/jobs/:id/complete-work
// @desc    Expert marks repair as completed
router.patch('/:id/complete-work', auth, roleCheck(['producer']), jobController.completeWork);

// @route   POST api/jobs/:id/invoice
// @desc    Expert sends an invoice/bill
router.post('/:id/invoice', auth, roleCheck(['producer']), jobController.createInvoice);

// @route   POST api/jobs/:id/rating
// @desc    Consumer submits a rating for a completed job (alias for /api/reviews)
router.post('/:id/rating', auth, roleCheck(['consumer']), (req, res) => {
    req.body.requestId = req.params.id;
    return reviewController.createReview(req, res);
});

// @route   PATCH api/jobs/:id/cancel
// @desc    Consumer cancels their pending request
router.patch('/:id/cancel', auth, roleCheck(['consumer']), async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const result = await db.query(
            `UPDATE service_requests 
             SET status = 'cancelled' 
             WHERE id = $1 AND consumer_id = $2 AND status = 'pending'
             RETURNING *`,
            [id, userId]
        );
        if (result.rows.length === 0) {
            return res.status(400).json({ 
                error: 'Cannot cancel — request not found or already accepted' 
            });
        }
        if (global.io) {
            global.io.to(`user_${userId}`).emit('request_cancelled', { requestId: id });
        }
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to cancel request' });
    }
});

// @route   PATCH api/jobs/:id/progress
// @desc    Expert updates job progress stage
router.patch('/:id/progress', auth, roleCheck(['producer']), async (req, res) => {
    try {
        const { stage, note } = req.body;
        const validStages = ['accepted', 'diagnosing', 'repairing', 'testing', 'completed'];
        if (!validStages.includes(stage)) {
            return res.status(400).json({ error: 'Invalid stage' });
        }
        await db.query(
            `UPDATE service_requests SET progress_stage = $1, progress_note = $2, updated_at = NOW()
             WHERE id = $3 AND producer_id = $4`,
            [stage, note || null, req.params.id, req.user.id]
        );
        await db.query(
            `INSERT INTO job_progress_history (job_id, stage, note) VALUES ($1, $2, $3)`,
            [req.params.id, stage, note || null]
        ).catch(() => {});
        const job = await db.query('SELECT consumer_id FROM service_requests WHERE id = $1', [req.params.id]);
        if (job.rows.length && global.io) {
            global.io.to(`user_${job.rows[0].consumer_id}`).emit('job_progress_updated', {
                jobId: req.params.id, stage, note: note || ''
            });
        }
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// @route   GET api/jobs/my
// @desc    Get my active jobs (Chat List)
router.get('/my', auth, jobController.getMyJobs);

export default router;
