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
        const result = await db.query(`
      SELECT jr.*, m.name as machine_name, m.oem, m.machine_type, u.first_name as client_name
      FROM service_requests jr
      JOIN machines m ON jr.machine_id = m.id
      JOIN users u ON jr.consumer_id = u.id
      WHERE jr.status = 'broadcast'
      ORDER BY jr.created_at DESC
    `);
        res.json(result.rows);
    } catch (err) {
        console.error('[Jobs] Radar retrieval failure:', err);
        res.status(500).json({ message: 'Radar sensor failure' });
    }
};

// @desc    Accept a job assignment (Expert)
// @route   PATCH /api/jobs/:id/accept
exports.acceptJob = async (req, res) => {
    const jobId = req.params.id;

    try {
        // 1. Atomically check if job is still available and update status
        // Using a transaction would be better, but a simple UPDATE with WHERE status='broadcast' is atomic
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
    // MOCK MODE: Always succeed and emit invoice event
    const jobId = req.params.id;
    const { amount } = req.body;
    // Simulate a consumer id for notification
    const consumerId = 'mock-consumer';
    // 3. Notify Consumer via Socket
    const io = req.app.get('socketio');
    if (io) {
        io.emit(`status_update_${jobId}`, {
            status: 'payment_pending',
            amount: amount,
            message: `Expert has sent an invoice for ₹${amount}`
        });
    }
    // 4. Create persistent notification for Consumer
    await notificationController.createNotification(
        consumerId,
        'Invoice Received',
        `Expert has sent an invoice for ₹${amount} for your service request.`,
        'payment',
        `/workspace/${jobId}`
    );
    // Respond with mock job object
    res.json({ id: jobId, quoted_cost: amount, status: 'payment_pending' });
};
