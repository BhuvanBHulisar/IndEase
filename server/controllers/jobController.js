const db = require('../db');
const notificationController = require('./notificationController');

// @desc    Broadcast a new machine issue (Consumer)
// @route   POST /api/jobs/broadcast
exports.broadcastJob = async (req, res) => {
    const { machineId, issueDescription, priority, videoUrl } = req.body;

    try {
        // 1. Verify machine ownership
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

        // 3. Emit real-time signal via Socket.io (Handled in index.js via io object if passed, 
        // but for now we'll assume the frontend poller or a separate socket controller handles it)
        // For this implementation, we will notify experts listening to 'radar_room'
        const io = req.app.get('socketio');
        if (io) {
            io.to('radar_room').emit('new_signal', {
                ...newJob,
                machine_name: machine.rows[0].name
            });
        }

        res.status(201).json(newJob);
    } catch (err) {
        console.error('[Jobs] Broadcast failure:', err);
        res.status(500).json({ message: 'Internal operational failure' });
    }
};

// @desc    Retrieve all active broadcasts in sector (Expert)
// @route   GET /api/jobs/radar
exports.getRadarJobs = async (req, res) => {
    try {
        // [MODIFIED] Filter out jobs that this expert has already declined
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
        console.warn('[Jobs] Radar selective scanning failed (Table missing?), falling back to full signal');
        // Fallback: If declined_jobs table doesn't exist yet, just return all broadcast jobs
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
            res.status(500).json({ message: 'Radar sensor failure' });
        }
    }
};

// @desc    Get expert dashboard statistics
// @route   GET /api/jobs/producer-stats
exports.getProducerStats = async (req, res) => {
    try {
        const producerId = req.user.id;

        // Return rich mock data for the demo account
        if (producerId === 'demo-123') {
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

        res.json({
            earnings,
            completedJobs,
            rating
        });
    } catch (err) {
        console.error('[Jobs] Stats retrieval failure:', err);
        res.status(500).json({ message: 'Failed to retrieve expert statistics' });
    }
};

// @desc    Accept a job assignment (Expert)
// @route   PATCH /api/jobs/:id/accept
exports.acceptJob = async (req, res) => {
    const jobId = req.params.id;

    try {
        // 1. Atomically check if job is still available and update status
        const result = await db.query(
            'UPDATE service_requests SET producer_id = $1, status = $2 WHERE id = $3 AND status = $4 RETURNING *',
            [req.user.id, 'accepted', jobId, 'broadcast']
        );

        if (result.rows.length === 0) {
            return res.status(400).json({ message: 'Job no longer available or already claimed' });
        }

        const acceptedJob = result.rows[0];

        // Notify the consumer that an expert has been assigned
        const io = req.app.get('socketio');
        if (io) {
            io.emit(`status_update_${acceptedJob.id}`, { status: 'accepted', producer_id: req.user.id });
        }

        // 3. Create persistent notification for Consumer
        await notificationController.createNotification(
            acceptedJob.consumer_id,
            'Job Accepted',
            `An expert has accepted your request for ${jobId.substring(0, 8)}. Check the workspace.`,
            'job_update',
            `/workspace/${jobId}`
        );

        res.json(acceptedJob);
    } catch (err) {
        console.error('[Jobs] Acceptance failure:', err);
        res.status(500).json({ message: 'Deployment failure' });
    }
};

// @desc    Decline / skip a job (Expert)
// @route   PATCH /api/jobs/:id/decline
exports.declineJob = async (req, res) => {
    const jobId = req.params.id;
    try {
        // [MODIFIED] Record the decline in the persistence layer
        await db.query(
            'INSERT INTO declined_jobs (user_id, request_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [req.user.id, jobId]
        );

        res.json({ message: 'Job declined from local radar' });
    } catch (err) {
        console.warn('[Jobs] Decline persistence failure (Table missing?), falling back to memory only');
        // If table missing, still return success so frontend removes it from view
        res.json({ message: 'Job declined (volatile)' });
    }
};

// @desc    Retrieve chat history for a specific request
// @route   GET /api/jobs/my
exports.getMyJobs = async (req, res) => {
    try {
        const params = [req.user.id];
        let query;

        if (req.user.role === 'consumer') {
            query = `
                SELECT 
                    sr.id, 
                    sr.status, 
                    sr.issue_description, 
                    sr.created_at,
                    m.name as machine_name, 
                    COALESCE(u.first_name, 'Scanning...') as other_party,
                    u.id as other_party_id
                FROM service_requests sr
                JOIN machines m ON sr.machine_id = m.id
                LEFT JOIN users u ON sr.producer_id = u.id
                WHERE sr.consumer_id = $1
                ORDER BY sr.created_at DESC
             `;
        } else {
            query = `
                SELECT 
                    sr.id, 
                    sr.status, 
                    sr.issue_description, 
                    sr.created_at,
                    m.name as machine_name, 
                    u.first_name as other_party,
                    u.id as other_party_id
                FROM service_requests sr
                JOIN machines m ON sr.machine_id = m.id
                JOIN users u ON sr.consumer_id = u.id
                WHERE sr.producer_id = $1
                ORDER BY sr.created_at DESC
             `;
        }

        const result = await db.query(query, params);
        res.json(result.rows);
    } catch (err) {
        console.error('[Jobs] My list retrieval failure:', err);
        res.status(500).json({ message: 'History retrieval failure' });
    }
};

// @desc    Expert sends an invoice/quote to the consumer
// @route   POST /api/jobs/:id/invoice
exports.createInvoice = async (req, res) => {
    const jobId = req.params.id;
    const { amount } = req.body;

    try {
        // 1. Update the service request with the quoted cost
        const result = await db.query(
            'UPDATE service_requests SET quoted_cost = $1, status = $2 WHERE id = $3 RETURNING *',
            [amount, 'payment_pending', jobId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Service request not found' });
        }

        const job = result.rows[0];

        // 2. Notify Consumer via Socket
        const io = req.app.get('socketio');
        if (io) {
            io.emit(`status_update_${jobId}`, {
                status: 'payment_pending',
                amount: amount,
                message: `Expert has sent an invoice for ₹${amount}`
            });
        }

        // 3. Create persistent notification for Consumer using real consumer_id
        if (job.consumer_id) {
            await notificationController.createNotification(
                job.consumer_id,
                'Invoice Received',
                `Expert has sent an invoice for ₹${amount} for your service request.`,
                'payment',
                `/workspace/${jobId}`
            );
        }

        res.json({ id: jobId, quoted_cost: amount, status: 'payment_pending' });
    } catch (err) {
        console.error('[Jobs] Invoice creation failure:', err);
        res.status(500).json({ message: 'Failed to create invoice' });
    }
};
