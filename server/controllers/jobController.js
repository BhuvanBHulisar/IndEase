import db from '../config/db.js';
import * as notificationController from './notificationController.js';
import fs from 'fs';
import path from 'path';
import {
    updateExpertPoints,
    wasAcceptedUnderOneHour,
    wasCompletedUnderTwentyFourHours
} from '../services/expertPerformanceService.js';

// Auto-delete video after job completion
const deleteJobVideo = async (jobId) => {
  try {
    const result = await db.query(
      'SELECT video_url FROM service_requests WHERE id = $1',
      [jobId]
    );
    const videoUrl = result.rows[0]?.video_url;
    if (videoUrl && videoUrl.startsWith('/uploads/videos/')) {
      const filePath = path.join(process.cwd(), videoUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`[Upload] Video deleted for completed job: ${jobId}`);
      }
      await db.query(
        "UPDATE service_requests SET video_url = NULL WHERE id = $1",
        [jobId]
      );
    }
  } catch (err) {
    console.error('[Upload] Failed to delete video:', err.message);
  }
};

// @desc    Broadcast a new machine issue (Consumer)
// @route   POST /api/jobs/broadcast
export const broadcastJob = async (req, res) => {
    const { machineId, issueDescription, priority, videoUrl, aiMachineType, aiIssueSummary, aiConfidence,
            urgencyLevel, preferredDate, preferredTimeSlot } = req.body;
    const io = req.app.get('socketio') || global.io;
    try {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

        // 1. Verify machine ownership
        if (uuidRegex.test(machineId) && uuidRegex.test(req.user.id)) {
            const machine = await db.query('SELECT * FROM machines WHERE id = $1 AND owner_id = $2', [machineId, req.user.id]);
            if (machine.rows.length === 0) {
                return res.status(404).json({ message: 'Machine node not found or access denied' });
            }

            // 2. Insert into service requests ledger (with AI analysis fields)
            const result = await db.query(
                `INSERT INTO service_requests
                    (machine_id, consumer_id, issue_description, priority, video_url, status, is_demo, first_broadcast_at,
                     ai_machine_type, ai_issue_summary, ai_confidence, urgency_level, preferred_date, preferred_time_slot)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), $8, $9, $10, $11, $12, $13)
                 RETURNING *`,
                [machineId, req.user.id, issueDescription, priority || 'normal', videoUrl, 'broadcast', !!req.user.is_demo,
                 aiMachineType || null, aiIssueSummary || null, aiConfidence || null,
                 urgencyLevel || 'normal', preferredDate || null, preferredTimeSlot || 'anytime']
            );

            const newJob = result.rows[0];
            // Always persist notification regardless of socket availability
            await db.query(
                'INSERT INTO notifications (type, message, job_id) VALUES ($1, $2, $3)',
                ['new_job', 'New service request created', newJob.id]
            );
            if (io) {
                io.to('radar_room').emit('new_signal', {
                    ...newJob,
                    machine_name: machine.rows[0].name
                });
                io.to(`user_${req.user.id}`).emit('request_created', { requestId: newJob.id, status: 'broadcast' });
                io.to(`user_${req.user.id}`).emit('request_status_updated', {
                    requestId: newJob.id,
                    status: 'broadcast'
                });
                // Emit admin notification and new job event
                io.emit('admin_notification', {
                    type: 'new_job',
                    message: 'New service request created'
                });
                // Emit new_job_created event for Admin Portal
                io.emit('new_job_created', {
                    type: 'new_job',
                    message: 'New service request created',
                    jobId: newJob.id
                });
            }
            const machineName = machine.rows[0]?.name;
            // Notify matched experts
            const expertsResult = await db.query(
                `SELECT id FROM users WHERE role = 'producer' AND is_deleted = false AND is_suspended = false`
            );
            for (const expert of expertsResult.rows) {
                await notificationController.createNotification(
                    expert.id,
                    'New Service Request',
                    `A consumer needs help with ${machineName || 'a machine'}. Check your dashboard.`,
                    'new_request',
                    null
                );
            }
            return res.status(201).json(newJob);
        } else {
            // Mock Broadcast
            const mockJob = {
                id: 'mock-' + Date.now(),
                machine_id: machineId,
                consumer_id: req.user.id,
                issue_description: issueDescription,
                priority: priority || 'normal',
                status: 'broadcast',
                created_at: new Date()
            };
            if (io) {
                io.to('radar_room').emit('new_signal', {
                    ...mockJob,
                    machine_name: 'Mock Machine'
                });
                io.to(`user_${req.user.id}`).emit('request_created', { requestId: mockJob.id, status: 'broadcast' });
                io.to(`user_${req.user.id}`).emit('request_status_updated', {
                    requestId: mockJob.id,
                    status: 'broadcast'
                });
            }
            return res.status(201).json(mockJob);
        }
    } catch (err) {
        console.error('[Jobs] Broadcast failure:', err);
        res.status(500).json({ message: 'Internal operational failure' });
    }
};

// @desc    Retrieve all active broadcasts in sector (Expert)
// @route   GET /api/jobs/radar
export const getRadarJobs = async (req, res) => {
    const isDemo = !!req.user.is_demo;
    const expertCity = req.user.city || null;
    try {
        let rows = [];

        // Tier 1: jobs from same city (always try first)
        if (expertCity) {
            const nearbyResult = await db.query(`
                SELECT jr.*, m.name as machine_name, m.oem, m.machine_type,
                       u.first_name as client_name, u.city as client_city,
                       true as is_nearby
                FROM service_requests jr
                JOIN machines m ON jr.machine_id = m.id
                JOIN users u ON jr.consumer_id = u.id
                WHERE jr.status = 'broadcast'
                AND jr.is_demo = $1
                AND LOWER(u.city) = LOWER($2)
                AND jr.id NOT IN (
                    SELECT request_id FROM declined_jobs WHERE user_id = $3
                )
                ORDER BY jr.created_at DESC
            `, [isDemo, expertCity, req.user.id]);
            rows = nearbyResult.rows;
        }

        // Tier 2: jobs older than 10 minutes (no-one accepted yet) — show to all experts
        const globalResult = await db.query(`
            SELECT jr.*, m.name as machine_name, m.oem, m.machine_type,
                   u.first_name as client_name, u.city as client_city,
                   false as is_nearby
            FROM service_requests jr
            JOIN machines m ON jr.machine_id = m.id
            JOIN users u ON jr.consumer_id = u.id
            WHERE jr.status = 'broadcast'
            AND jr.is_demo = $1
            AND (jr.first_broadcast_at IS NULL OR jr.first_broadcast_at < NOW() - INTERVAL '10 minutes')
            AND jr.id NOT IN (
                SELECT request_id FROM declined_jobs WHERE user_id = $2
            )
            AND jr.id NOT IN (${rows.map((_, i) => `$${i + 3}`).join(',') || 'NULL'})
            ORDER BY jr.created_at DESC
        `, [isDemo, req.user.id, ...rows.map(r => r.id)]);

        // If no city set, also fetch ALL broadcast jobs
        if (!expertCity) {
            const allResult = await db.query(`
                SELECT jr.*, m.name as machine_name, m.oem, m.machine_type,
                       u.first_name as client_name, u.city as client_city,
                       false as is_nearby
                FROM service_requests jr
                JOIN machines m ON jr.machine_id = m.id
                JOIN users u ON jr.consumer_id = u.id
                WHERE jr.status = 'broadcast'
                AND jr.is_demo = $1
                AND jr.id NOT IN (
                    SELECT request_id FROM declined_jobs WHERE user_id = $2
                )
                ORDER BY jr.created_at DESC
            `, [isDemo, req.user.id]);
            rows = allResult.rows;
        } else {
            rows = [...rows, ...globalResult.rows];
        }

        res.json(rows);
        if (rows.length > 0) {
            console.log('[VideoDebug] job video_url from DB:', rows.map(r => ({ id: r.id, video_url: r.video_url })));
        }
    } catch (err) {
        // fallback — return all broadcast jobs without city filtering
        try {
            const result = await db.query(`
                SELECT jr.*, m.name as machine_name, m.oem, m.machine_type,
                       u.first_name as client_name, false as is_nearby
                FROM service_requests jr
                JOIN machines m ON jr.machine_id = m.id
                JOIN users u ON jr.consumer_id = u.id
                WHERE jr.status = 'broadcast' AND jr.is_demo = $1
                ORDER BY jr.created_at DESC
            `, [isDemo]);
            res.json(result.rows);
        } catch (innerErr) {
            res.json([]);
        }
    }
};

// @desc    Get expert dashboard statistics
// @route   GET /api/jobs/producer-stats
export const getProducerStats = async (req, res) => {
    try {
        const producerId = req.user.id;
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

        if (!uuidRegex.test(producerId)) {
            return res.json({
                earnings: 14500,
                completedJobs: 124,
                rating: 4.9
            });
        }

        const profileRes = await db.query('SELECT rating FROM producer_profiles WHERE user_id = $1', [producerId]);
        const rating = profileRes.rows.length > 0 ? Number(profileRes.rows[0].rating) : 5.0;

        const jobsRes = await db.query("SELECT COUNT(*) FROM service_requests WHERE producer_id = $1 AND status = 'completed'", [producerId]);
        const completedJobs = Number(jobsRes.rows[0].count) || 0;

        const earningsRes = await db.query("SELECT SUM(quoted_cost) FROM service_requests WHERE producer_id = $1 AND status = 'completed'", [producerId]);
        const earnings = Number(earningsRes.rows[0].sum) || 0;

        res.json({ earnings, completedJobs, rating });
    } catch (err) {
        console.error('[Jobs] Stats retrieval failure:', err);
        res.status(500).json({ message: 'Failed to retrieve expert statistics' });
    }
};

// @desc    Accept a job assignment (Expert)
// @route   PATCH /api/jobs/:id/accept
export const acceptJob = async (req, res) => {
    const jobId = req.params.id;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const io = req.app.get('socketio') || global.io;
    try {
        if (uuidRegex.test(jobId) && uuidRegex.test(req.user.id)) {
            const result = await db.query(
                `UPDATE service_requests
                 SET producer_id = $1,
                     status = $2,
                     accepted_at = CURRENT_TIMESTAMP,
                     overdue_penalty_applied = FALSE
                 WHERE id = $3 AND status = $4
                 RETURNING *`,
                [req.user.id, 'accepted', jobId, 'broadcast']
            );

            if (result.rows.length === 0) {
                return res.status(400).json({ message: 'Job no longer available' });
            }

            const acceptedJob = result.rows[0];
            const acceptedWithinOneHour = wasAcceptedUnderOneHour(acceptedJob.created_at, acceptedJob.accepted_at);
            if (acceptedWithinOneHour) {
                await updateExpertPoints(req.user.id, 5, 'Request accepted under 1 hour');
            }

            if (io) {
                io.emit(`status_update_${acceptedJob.id}`, { status: 'accepted', producer_id: req.user.id });
                const cid = acceptedJob.consumer_id;
                if (cid) {
                    io.to(`user_${cid}`).emit('request_accepted', { requestId: acceptedJob.id });
                    io.to(`user_${cid}`).emit('request_status_updated', {
                        requestId: acceptedJob.id,
                        status: 'accepted',
                        producer_id: req.user.id
                    });
                }
            }

            await notificationController.createNotification(
                acceptedJob.consumer_id,
                'Job Accepted',
                `An expert has accepted your request.`,
                'job_update',
                `/workspace/${jobId}`
            );

            return res.json(acceptedJob);
        } else {
            // Mock Acceptance
            if (io) {
                io.emit(`status_update_${jobId}`, { status: 'accepted', producer_id: req.user.id });
                io.emit('request_accepted', { requestId: jobId });
                io.emit('request_status_updated', {
                    requestId: jobId,
                    status: 'accepted',
                    producer_id: req.user.id
                });
            }
            res.json({ id: jobId, status: 'accepted', producer_id: req.user.id });
        }
    } catch (err) {
        console.error('[Jobs] Acceptance failure:', err);
        res.status(500).json({ message: 'Internal failure' });
    }
};

// @desc    Expert starts on-site / remote repair work
// @route   PATCH /api/jobs/:id/start-work
export const startWork = async (req, res) => {
    const jobId = req.params.id;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const io = req.app.get('socketio') || global.io;
    try {
        if (uuidRegex.test(jobId) && uuidRegex.test(req.user.id)) {
            const result = await db.query(
                `UPDATE service_requests SET status = $1
                 WHERE id = $2 AND producer_id = $3 AND status IN ('accepted', 'payment_pending')
                 RETURNING *`,
                ['in_progress', jobId, req.user.id]
            );

            if (result.rows.length === 0) {
                return res.status(400).json({ message: 'Unable to start work on this request' });
            }

            const row = result.rows[0];
            if (io) {
                io.emit(`status_update_${jobId}`, { status: 'in_progress' });
                if (row.consumer_id) {
                    io.to(`user_${row.consumer_id}`).emit('request_status_updated', {
                        requestId: jobId,
                        status: 'in_progress'
                    });
                }
            }
            // Notify consumer that work has started
            await notificationController.createNotification(
                row.consumer_id,
                'Work Started',
                `Expert has started working on your machine repair.`,
                'job_update',
                null
            );
            // Notify expert confirmation
            await notificationController.createNotification(
                req.user.id,
                'Work Started',
                `You have started work on the repair job.`,
                'job_update',
                null
            );
            return res.json(row);
        }
        if (io) {
            io.emit(`status_update_${jobId}`, { status: 'in_progress' });
            io.emit('request_status_updated', { requestId: jobId, status: 'in_progress' });
        }
        return res.json({ id: jobId, status: 'in_progress' });
    } catch (err) {
        console.error('[Jobs] startWork failure:', err);
        res.status(500).json({ message: 'Internal failure' });
    }
};

// @desc    Expert marks repair work as completed
// @route   PATCH /api/jobs/:id/complete-work
export const completeWork = async (req, res) => {
    const jobId = req.params.id;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const io = req.app.get('socketio') || global.io;
    try {
        if (uuidRegex.test(jobId) && uuidRegex.test(req.user.id)) {
            const result = await db.query(
                `UPDATE service_requests SET status = $1, completed_at = CURRENT_TIMESTAMP
                 WHERE id = $2 AND producer_id = $3 AND status IN ('in_progress', 'accepted', 'payment_pending')
                 RETURNING *`,
                ['completed', jobId, req.user.id]
            );

            if (result.rows.length === 0) {
                return res.status(400).json({ message: 'Unable to complete this request' });
            }

            const row = result.rows[0];
            const completedWithinTwentyFourHours = wasCompletedUnderTwentyFourHours(
                row.accepted_at || row.created_at,
                row.completed_at
            );
            await updateExpertPoints(req.user.id, 20, 'Job completed');
            if (completedWithinTwentyFourHours) {
                await updateExpertPoints(req.user.id, 10, 'Job completed under 24 hours');
            }

            // Auto-delete consumer video now that job is done
            await deleteJobVideo(jobId);

            // Set follow-up deadline (7 days) and release escrow
            await db.query(
                `UPDATE service_requests SET follow_up_deadline = NOW() + INTERVAL '7 days', escrow_status = 'released' WHERE id = $1`,
                [jobId]
            );

            if (io) {
                io.emit(`status_update_${jobId}`, { status: 'completed' });
                io.emit('service_completed', { requestId: jobId });
                if (row.consumer_id) {
                    io.to(`user_${row.consumer_id}`).emit('request_status_updated', {
                        requestId: jobId,
                        status: 'completed'
                    });
                    io.to(`user_${row.consumer_id}`).emit('request_completed', { requestId: jobId });
                }
                // Notify expert that escrow is released
                io.to(`user_${req.user.id}`).emit('escrow_released', {
                    requestId: jobId,
                    message: 'Job completed — payment released from escrow.'
                });
            }
            // Notify consumer job is done
            await notificationController.createNotification(
                row.consumer_id,
                'Service Completed',
                `Your machine repair has been completed. Please rate your experience.`,
                'job_update',
                null
            );
            // Notify expert
            await notificationController.createNotification(
                req.user.id,
                'Job Completed',
                `Job marked as complete. +20 points added to your profile.`,
                'achievement',
                null
            );
            return res.json(row);
        }
        if (io) {
            io.emit(`status_update_${jobId}`, { status: 'completed' });
            io.emit('service_completed', { requestId: jobId });
        }
        return res.json({ id: jobId, status: 'completed' });
    } catch (err) {
        console.error('[Jobs] completeWork failure:', err);
        res.status(500).json({ message: 'Internal failure' });
    }
};

// @desc    Decline / skip a job (Expert)
// @route   PATCH /api/jobs/:id/decline
export const declineJob = async (req, res) => {
    const jobId = req.params.id;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const io = req.app.get('socketio') || global.io;
    try {
        if (uuidRegex.test(jobId) && uuidRegex.test(req.user.id)) {
            const declineResult = await db.query(
                `INSERT INTO declined_jobs (user_id, request_id)
                 VALUES ($1, $2)
                 ON CONFLICT DO NOTHING
                 RETURNING request_id`,
                [req.user.id, jobId]
            );

            if (declineResult.rows.length > 0) {
                await updateExpertPoints(req.user.id, -10, 'Expert declined request');
            }

            // Check waitlist — notify next expert in queue
            const waitlistResult = await db.query(
                `SELECT expert_id FROM job_waitlist
                 WHERE job_id = $1
                 ORDER BY position ASC
                 LIMIT 1`,
                [jobId]
            );

            if (waitlistResult.rows.length > 0) {
                const nextExpertId = waitlistResult.rows[0].expert_id;
                // Remove from waitlist now that we're offering it
                await db.query(
                    'DELETE FROM job_waitlist WHERE job_id = $1 AND expert_id = $2',
                    [jobId, nextExpertId]
                );
                // Fetch job details to send with notification
                const jobResult = await db.query(
                    `SELECT sr.*, m.name as machine_name FROM service_requests sr
                     JOIN machines m ON sr.machine_id = m.id
                     WHERE sr.id = $1`,
                    [jobId]
                );
                const job = jobResult.rows[0];
                if (io && job) {
                    io.to(`user_${nextExpertId}`).emit('waitlist_offer', {
                        jobId,
                        machine_name: job.machine_name,
                        issue_description: job.issue_description,
                        message: `A job you waitlisted is now available: ${job.machine_name}`
                    });
                }
            } else {
                // [SMART AUTO-REASSIGN] No one on waitlist
                // Find the next best available expert who has NOT already declined this job
                // Exclude the current decliner too
                const nextExpertResult = await db.query(
                    `SELECT u.id, u.first_name, u.last_name, u.location,
                            COALESCE(pp.rating, 5.0) as rating,
                            pp.points
                     FROM users u
                     JOIN producer_profiles pp ON pp.user_id = u.id
                     WHERE u.role = 'producer'
                       AND pp.status = 'available'
                       AND u.id != $1
                       AND u.id NOT IN (
                           SELECT dj.user_id FROM declined_jobs dj WHERE dj.request_id = $2
                       )
                     ORDER BY pp.points DESC, pp.rating DESC
                     LIMIT 1`,
                    [req.user.id, jobId]
                );

                if (nextExpertResult.rows.length > 0) {
                    // Assign directly to next best expert
                    const nextExpert = nextExpertResult.rows[0];
                    await db.query(
                        `UPDATE service_requests SET status = 'broadcast', producer_id = NULL WHERE id = $1`,
                        [jobId]
                    );
                    const jobResult = await db.query(
                        `SELECT sr.*, m.name as machine_name FROM service_requests sr
                         JOIN machines m ON sr.machine_id = m.id
                         WHERE sr.id = $1`,
                        [jobId]
                    );
                    const job = jobResult.rows[0];
                    if (io && job) {
                        // Notify next best expert directly
                        io.to(`user_${nextExpert.id}`).emit('new_signal', {
                            ...job,
                            _reassigned: true,
                            message: `A service request needs your attention: ${job.machine_name}`
                        });
                        // Also broadcast to radar room for others
                        io.to('radar_room').emit('new_signal', job);
                        console.log(`[AutoReassign] Job ${jobId} reassigned notification sent to expert ${nextExpert.id}`);
                    }
                } else {
                    // No eligible experts at all — revert to full broadcast
                    await db.query(
                        `UPDATE service_requests SET status = 'broadcast', producer_id = NULL WHERE id = $1`,
                        [jobId]
                    );
                    if (io) {
                        const jobResult = await db.query(
                            `SELECT sr.*, m.name as machine_name FROM service_requests sr
                             JOIN machines m ON sr.machine_id = m.id
                             WHERE sr.id = $1`,
                            [jobId]
                        );
                        if (jobResult.rows[0]) {
                            io.to('radar_room').emit('new_signal', jobResult.rows[0]);
                        }
                    }
                }
            }
        }
        res.json({ message: 'Job declined' });
    } catch (err) {
        res.json({ message: 'Job declined (volatile)' });
    }
};

// @desc    Retrieve chat history for a specific request
// @route   GET /api/jobs/my
export const getMyJobs = async (req, res) => {
    try {
        const userId = req.user.id;
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

        if (!uuidRegex.test(userId)) {
            // Return mock jobs for demo accounts
            return res.json([
                { id: 1, status: 'accepted', issue_description: 'Hydraulic leakage', machine_name: 'Press #08', other_party: 'Expert Technician', other_party_id: 'exp-1' }
            ]);
        }

        const isDemo = !!req.user.is_demo;
        let query;
        if (req.user.role === 'consumer') {
            query = `
                SELECT sr.id, sr.status, sr.issue_description, sr.created_at, m.name as machine_name, 
                       COALESCE(u.first_name, 'Scanning...') as other_party, u.id as other_party_id
                FROM service_requests sr
                JOIN machines m ON sr.machine_id = m.id
                LEFT JOIN users u ON sr.producer_id = u.id
                WHERE sr.consumer_id = $1 AND sr.is_demo = $2
                ORDER BY sr.created_at DESC
             `;
        } else {
            query = `
                SELECT sr.id, sr.status, sr.issue_description, sr.created_at, m.name as machine_name, 
                       u.first_name as other_party, u.id as other_party_id
                FROM service_requests sr
                JOIN machines m ON sr.machine_id = m.id
                JOIN users u ON sr.consumer_id = u.id
                WHERE sr.producer_id = $1 AND sr.is_demo = $2
                ORDER BY sr.created_at DESC
             `;
        }

        const result = await db.query(query, [userId, isDemo]);
        res.json(result.rows);
    } catch (err) {
        console.error('[Jobs] My list retrieval failure:', err);
        res.status(500).json({ message: 'History retrieval failure' });
    }
};

// @desc    Expert sends an invoice/quote to the consumer
// @route   POST /api/jobs/:id/invoice
export const createInvoice = async (req, res) => {
    const jobId = req.params.id;
    const { amount } = req.body;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    try {
        let job;
        if (uuidRegex.test(jobId)) {
            const result = await db.query(
                'UPDATE service_requests SET quoted_cost = $1, status = $2 WHERE id = $3 RETURNING *',
                [amount, 'payment_pending', jobId]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'Service request not found' });
            }
            job = result.rows[0];
        } else {
            // Mock Invoice Logic
            console.log('[Jobs] Creating mock invoice for ID:', jobId);
            job = { id: jobId, consumer_id: 'consumer-1', status: 'payment_pending', quoted_cost: amount };
        }

        // 2. Notify Consumer via Socket
        const io = req.app.get('socketio') || global.io;
        if (io) {
            console.log(`[Socket] Sending targeted invoice notification to user_${job.consumer_id}`);

            // Send targeted event for the payment modal to pop up
            io.to(`user_${job.consumer_id}`).emit('invoice_received', {
                requestId: jobId,
                amount: amount,
                message: `Expert has sent an invoice for ₹${amount}`
            });

            // Also emit a general notification for the list
            io.to(`user_${job.consumer_id}`).emit('notification', {
                id: Date.now(),
                type: 'payment',
                msg: `Expert has sent an invoice for ₹${amount}`,
                time: 'Just now',
                read: false,
                requestId: jobId
            });

            // Broadcast status update for the specific job channel
            io.emit(`status_update_${jobId}`, {
                status: 'payment_pending',
                amount: amount,
                message: `Expert has sent an invoice for ₹${amount}`
            });
            io.to(`user_${job.consumer_id}`).emit('invoice_sent', {
                requestId: jobId,
                amount,
                status: 'payment_pending'
            });
            io.to(`user_${job.consumer_id}`).emit('request_status_updated', {
                requestId: jobId,
                status: 'payment_pending',
                amount
            });
        }

        // 3. Create persistent notification if real user
        if (uuidRegex.test(job.consumer_id)) {
            await notificationController.createNotification(
                job.consumer_id,
                'Invoice Received',
                `Expert has sent an invoice for ₹${amount}.`,
                'payment',
                `/workspace/${jobId}`
            );
        }

        // 4. Insert admin notification and emit invoice_created event
        await db.query(
            'INSERT INTO notifications (type, message) VALUES ($1, $2)',
            ['invoice_created', 'New invoice created']
        );
        if (io) {
            io.emit('admin_notification', {
                type: 'invoice_created',
                message: 'New invoice created'
            });
        }

        res.json({ id: jobId, quoted_cost: amount, status: 'payment_pending' });
    } catch (err) {
        console.error('[Jobs] Invoice creation failure:', err);
        res.status(500).json({ message: 'Failed to create invoice' });
    }
};

// @desc    Expert joins the waitlist for an already-accepted job
// @route   POST /api/jobs/:id/waitlist
export const joinWaitlist = async (req, res) => {
    const jobId = req.params.id;
    const expertId = req.user.id;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(jobId) || !uuidRegex.test(expertId)) {
        return res.json({ message: 'Added to waitlist (demo)' });
    }
    try {
        const posResult = await db.query(
            'SELECT COALESCE(MAX(position), 0) + 1 AS next_pos FROM job_waitlist WHERE job_id = $1',
            [jobId]
        );
        const nextPos = posResult.rows[0].next_pos;
        await db.query(
            `INSERT INTO job_waitlist (job_id, expert_id, position)
             VALUES ($1, $2, $3)
             ON CONFLICT (job_id, expert_id) DO NOTHING`,
            [jobId, expertId, nextPos]
        );
        res.json({ message: 'Joined waitlist', position: nextPos });
    } catch (err) {
        console.error('[Waitlist] Join failed:', err);
        res.status(500).json({ message: 'Failed to join waitlist' });
    }
};

// @desc    Get service history/logs for producer
// @route   GET /api/jobs/service-history
export const getServiceHistory = async (req, res) => {
    try {
        const producerId = req.user.id;
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

        if (!uuidRegex.test(producerId)) {
            // Return mock service history for demo accounts
            return res.json([
                {
                    id: 'demo-1',
                    date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
                    machine: 'Hydraulic Press #08',
                    service: 'Seal Replacement',
                    expert: 'Demo Expert',
                    status: 'Completed',
                    cost: '₹2500'
                }
            ]);
        }

        const isDemo = !!req.user.is_demo;
        const result = await db.query(
            `SELECT 
                sr.id, sr.created_at, sr.status, sr.quoted_cost, sr.issue_description,
                m.name as machine_name,
                u.first_name as consumer_name
             FROM service_requests sr
             JOIN machines m ON sr.machine_id = m.id
             JOIN users u ON sr.consumer_id = u.id
             WHERE sr.producer_id = $1 AND sr.status IN ('accepted', 'in_progress', 'completed', 'started')
             AND sr.is_demo = $2
             ORDER BY sr.created_at DESC`,
            [producerId, isDemo]
        );

        const formatted = result.rows.map(row => ({
            id: row.id,
            created_at: row.created_at,
            date: new Date(row.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
            machine: row.machine_name,
            service: row.issue_description || 'Service Request',
            expert: row.consumer_name,
            status: row.status.charAt(0).toUpperCase() + row.status.slice(1),
            cost: row.quoted_cost ? `₹${row.quoted_cost}` : 'Pending'
        }));

        res.json(formatted);
    } catch (err) {
        console.error('[Jobs] Service history retrieval failure:', err);
        res.status(500).json({ message: 'History retrieval failure' });
    }
};

// ═══════════════════════════════════════════════════════════════
// QUOTE-FIRST WORKFLOW CONTROLLERS
// ═══════════════════════════════════════════════════════════════

// @desc    Expert submits a quote for a broadcast job
// @route   POST /api/jobs/:id/quote
export const submitQuote = async (req, res) => {
    const { id: requestId } = req.params;
    const { amount, estimatedHours, note } = req.body;
    const expertId = req.user.id;
    const io = req.app.get('socketio') || global.io;

    try {
        const jobRes = await db.query(
            `SELECT * FROM service_requests WHERE id = $1 AND status IN ('broadcast', 'quote_submitted')`,
            [requestId]
        );
        if (jobRes.rows.length === 0) {
            return res.status(400).json({ message: 'Job is no longer available for quotes' });
        }

        const quoteRes = await db.query(
            `INSERT INTO job_quotes (request_id, expert_id, amount, estimated_hours, note, status)
             VALUES ($1, $2, $3, $4, $5, 'pending')
             ON CONFLICT (request_id, expert_id) DO UPDATE
             SET amount = $3, estimated_hours = $4, note = $5, status = 'pending'
             RETURNING *`,
            [requestId, expertId, amount, estimatedHours || null, note || null]
        );

        // Advance status to quote_submitted if still on broadcast
        await db.query(
            `UPDATE service_requests SET status = 'quote_submitted' WHERE id = $1 AND status = 'broadcast'`,
            [requestId]
        );

        const job = jobRes.rows[0];
        const expertRes = await db.query('SELECT first_name FROM users WHERE id = $1', [expertId]);
        const expertName = expertRes.rows[0]?.first_name || 'An expert';

        if (io) {
            io.to(`user_${job.consumer_id}`).emit('quote_received', {
                requestId,
                quoteId: quoteRes.rows[0].id,
                expertId,
                expertName,
                amount,
                note
            });
            io.to(`user_${job.consumer_id}`).emit('request_status_updated', {
                requestId,
                status: 'quote_submitted'
            });
        }

        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (uuidRegex.test(job.consumer_id)) {
            await notificationController.createNotification(
                job.consumer_id,
                'Quote Received',
                `${expertName} sent a quote of ₹${amount} for your service request.`,
                'quote',
                null
            );
        }

        res.json(quoteRes.rows[0]);
    } catch (err) {
        console.error('[Jobs] submitQuote failed:', err);
        res.status(500).json({ message: 'Failed to submit quote' });
    }
};

// @desc    Consumer fetches all pending quotes for their job
// @route   GET /api/jobs/:id/quotes
export const getQuotes = async (req, res) => {
    const { id: requestId } = req.params;
    try {
        const result = await db.query(
            `SELECT q.*, u.first_name, u.photo_url, pp.rating, pp.level, pp.points, pp.jobs_completed
             FROM job_quotes q
             JOIN users u ON q.expert_id = u.id
             LEFT JOIN producer_profiles pp ON pp.user_id = q.expert_id
             WHERE q.request_id = $1 AND q.status = 'pending'
             ORDER BY pp.rating DESC NULLS LAST, q.amount ASC`,
            [requestId]
        );
        res.json(result.rows);
    } catch (err) {
        console.error('[Jobs] getQuotes failed:', err);
        res.status(500).json({ message: 'Failed to fetch quotes' });
    }
};

// @desc    Consumer approves a specific expert's quote
// @route   POST /api/jobs/:id/quotes/:quoteId/approve
export const approveQuote = async (req, res) => {
    const { id: requestId, quoteId } = req.params;
    const io = req.app.get('socketio') || global.io;

    try {
        const quoteRes = await db.query(
            `SELECT * FROM job_quotes WHERE id = $1 AND request_id = $2 AND status = 'pending'`,
            [quoteId, requestId]
        );
        if (quoteRes.rows.length === 0) {
            return res.status(404).json({ message: 'Quote not found or already processed' });
        }
        const quote = quoteRes.rows[0];

        await db.query(`UPDATE job_quotes SET status = 'approved' WHERE id = $1`, [quoteId]);
        await db.query(
            `UPDATE job_quotes SET status = 'rejected' WHERE request_id = $1 AND id != $2`,
            [requestId, quoteId]
        );
        await db.query(
            `UPDATE service_requests
             SET status = 'quote_approved', producer_id = $1, quoted_cost = $2, accepted_at = NOW()
             WHERE id = $3`,
            [quote.expert_id, quote.amount, requestId]
        );

        if (io) {
            io.to(`user_${quote.expert_id}`).emit('quote_approved', {
                requestId,
                amount: quote.amount,
                message: 'Your quote was approved! Consumer will now pay into escrow.'
            });
            io.to(`user_${quote.expert_id}`).emit('request_status_updated', {
                requestId,
                status: 'quote_approved'
            });
        }

        const rejectedRes = await db.query(
            `SELECT expert_id FROM job_quotes WHERE request_id = $1 AND status = 'rejected'`,
            [requestId]
        );
        for (const row of rejectedRes.rows) {
            if (io) io.to(`user_${row.expert_id}`).emit('quote_rejected', { requestId });
        }

        res.json({ success: true, expertId: quote.expert_id, amount: quote.amount });
    } catch (err) {
        console.error('[Jobs] approveQuote failed:', err);
        res.status(500).json({ message: 'Failed to approve quote' });
    }
};

// @desc    Consumer raises a follow-up within 7-day post-completion window
// @route   POST /api/jobs/:id/follow-up
export const raiseFollowUp = async (req, res) => {
    const { id: requestId } = req.params;
    const { description } = req.body;
    try {
        const jobRes = await db.query(
            `SELECT * FROM service_requests WHERE id = $1 AND consumer_id = $2 AND status = 'completed'`,
            [requestId, req.user.id]
        );
        if (jobRes.rows.length === 0) {
            return res.status(404).json({ message: 'Completed job not found' });
        }
        const job = jobRes.rows[0];

        const daysSince = (Date.now() - new Date(job.completed_at).getTime()) / (1000 * 60 * 60 * 24);
        if (daysSince > 7) {
            return res.status(400).json({ message: '7-day follow-up window has expired' });
        }

        await db.query(
            `UPDATE service_requests SET status = 'in_progress', follow_up_raised = TRUE, issue_description = $1 WHERE id = $2`,
            [description, requestId]
        );

        const io = req.app.get('socketio') || global.io;
        if (io && job.producer_id) {
            io.to(`user_${job.producer_id}`).emit('follow_up_raised', {
                requestId,
                description,
                message: 'Consumer raised a follow-up issue on a completed job'
            });
        }

        res.json({ success: true });
    } catch (err) {
        console.error('[Jobs] raiseFollowUp failed:', err);
        res.status(500).json({ message: 'Failed to raise follow-up' });
    }
};
