import db from '../config/db.js';
import * as notificationController from './notificationController.js';

// @desc    Broadcast a new machine issue (Consumer)
// @route   POST /api/jobs/broadcast
export const broadcastJob = async (req, res) => {
    const { machineId, issueDescription, priority, videoUrl } = req.body;
    const io = req.app.get('socketio') || global.io;
    try {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

        // 1. Verify machine ownership
        if (uuidRegex.test(machineId) && uuidRegex.test(req.user.id)) {
            const machine = await db.query('SELECT * FROM machines WHERE id = $1 AND owner_id = $2', [machineId, req.user.id]);
            if (machine.rows.length === 0) {
                return res.status(404).json({ message: 'Machine node not found or access denied' });
            }

            // 2. Insert into service requests ledger
            const result = await db.query(
                'INSERT INTO service_requests (machine_id, consumer_id, issue_description, priority, video_url, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
                [machineId, req.user.id, issueDescription, priority || 'normal', videoUrl, 'broadcast']
            );

            const newJob = result.rows[0];
            if (io) {
                io.to('radar_room').emit('new_signal', {
                    ...newJob,
                    machine_name: machine.rows[0].name
                });
                // 3. Insert admin notification and emit event
                await db.query(
                    'INSERT INTO notifications (type, message) VALUES ($1, $2)',
                    ['new_job', 'New service request created']
                );
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
    try {
        const result = await db.query(`
            SELECT jr.*, m.name as machine_name, m.oem, m.machine_type, u.first_name as client_name
            FROM service_requests jr
            JOIN machines m ON jr.machine_id = m.id
            JOIN users u ON jr.consumer_id = u.id
            WHERE jr.status = 'broadcast'
            AND jr.id NOT IN (
                SELECT request_id FROM declined_jobs WHERE user_id = $1
            )
            ORDER BY jr.created_at DESC
        `, [req.user.id]);

        res.json(result.rows);
    } catch (err) {
        console.warn('[Jobs] Radar selective scanning fallback');
        try {
            const result = await db.query(`
                SELECT jr.*, m.name as machine_name, m.oem, m.machine_type, u.first_name as client_name
                FROM service_requests jr
                JOIN machines m ON jr.machine_id = m.id
                JOIN users u ON jr.consumer_id = u.id
                WHERE jr.status = 'broadcast'
                ORDER BY jr.created_at DESC
            `);
            res.json(result.rows);
        } catch (innerErr) {
            res.json([]); // Return empty list for radar failures
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
                'UPDATE service_requests SET producer_id = $1, status = $2 WHERE id = $3 AND status = $4 RETURNING *',
                [req.user.id, 'accepted', jobId, 'broadcast']
            );

            if (result.rows.length === 0) {
                return res.status(400).json({ message: 'Job no longer available' });
            }

            const acceptedJob = result.rows[0];
            if (io) {
                io.emit(`status_update_${acceptedJob.id}`, { status: 'accepted', producer_id: req.user.id });
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
            res.json({ id: jobId, status: 'accepted', producer_id: req.user.id });
        }
    } catch (err) {
        console.error('[Jobs] Acceptance failure:', err);
        res.status(500).json({ message: 'Internal failure' });
    }
};

// @desc    Decline / skip a job (Expert)
// @route   PATCH /api/jobs/:id/decline
export const declineJob = async (req, res) => {
    const jobId = req.params.id;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    try {
        if (uuidRegex.test(jobId) && uuidRegex.test(req.user.id)) {
            await db.query(
                'INSERT INTO declined_jobs (user_id, request_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
                [req.user.id, jobId]
            );
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

        let query;
        if (req.user.role === 'consumer') {
            query = `
                SELECT sr.id, sr.status, sr.issue_description, sr.created_at, m.name as machine_name, 
                       COALESCE(u.first_name, 'Scanning...') as other_party, u.id as other_party_id
                FROM service_requests sr
                JOIN machines m ON sr.machine_id = m.id
                LEFT JOIN users u ON sr.producer_id = u.id
                WHERE sr.consumer_id = $1
                ORDER BY sr.created_at DESC
             `;
        } else {
            query = `
                SELECT sr.id, sr.status, sr.issue_description, sr.created_at, m.name as machine_name, 
                       u.first_name as other_party, u.id as other_party_id
                FROM service_requests sr
                JOIN machines m ON sr.machine_id = m.id
                JOIN users u ON sr.consumer_id = u.id
                WHERE sr.producer_id = $1
                ORDER BY sr.created_at DESC
             `;
        }

        const result = await db.query(query, [userId]);
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

        // 3. Insert admin notification and emit event
        await db.query(
            'INSERT INTO notifications (type, message) VALUES ($1, $2)',
            ['new_job', 'New service request created']
        );
        if (io) {
            io.emit('admin_notification', {
                type: 'new_job',
                message: 'New service request created'
            });
        }

        res.json({ id: jobId, quoted_cost: amount, status: 'payment_pending' });
    } catch (err) {
        console.error('[Jobs] Invoice creation failure:', err);
        res.status(500).json({ message: 'Failed to create invoice' });
    }
};
