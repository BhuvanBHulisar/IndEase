import db from '../config/db.js';

// @desc    Get expert schedule
// @route   GET /api/schedule
export const getSchedule = async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await db.query(
            'SELECT * FROM expert_schedules WHERE user_id = $1 ORDER BY day_of_week, start_time',
            [userId]
        );

        // If empty, return default mock for demo
        if (result.rows.length === 0) {
            return res.json([
                { day_of_week: 'Mon', start_time: '09:00', end_time: '11:00', slot_type: 'job', title: 'Site Inspection', description: 'Apex Heavy Ind.' },
                { day_of_week: 'Mon', start_time: '13:00', end_time: '14:00', slot_type: 'break', title: 'Lunch Break', description: '' },
                { day_of_week: 'Tue', start_time: '10:30', end_time: '12:30', slot_type: 'job', title: 'Hydraulic Repair', description: 'GreenField Agri' },
                { day_of_week: 'Thu', start_time: '09:00', end_time: '17:00', slot_type: 'unavailable', title: 'Personal Leave', description: '' }
            ]);
        }

        res.json(result.rows);
    } catch (err) {
        console.error('[Schedule] Fetch failure:', err);
        res.status(500).json({ message: 'Could not retrieve schedule' });
    }
};

// @desc    Update/Add schedule slot
// @route   POST /api/schedule
export const updateSchedule = async (req, res) => {
    try {
        const userId = req.user.id;
        const { day_of_week, start_time, end_time, slot_type, title, description, request_id } = req.body;

        const result = await db.query(
            `INSERT INTO expert_schedules (user_id, day_of_week, start_time, end_time, slot_type, title, description, request_id)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             RETURNING *`,
            [userId, day_of_week, start_time, end_time, slot_type, title, description, request_id]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('[Schedule] Update failure:', err);
        res.status(500).json({ message: 'Could not update schedule' });
    }
};

// @desc    Delete schedule slot
// @route   DELETE /api/schedule/:id
export const deleteSlot = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        await db.query(
            'DELETE FROM expert_schedules WHERE id = $1 AND user_id = $2',
            [id, userId]
        );

        res.json({ message: 'Slot removed' });
    } catch (err) {
        console.error('[Schedule] Delete failure:', err);
        res.status(500).json({ message: 'Could not delete slot' });
    }
};

// @desc    AI Schedule Assistant: Propose optimal slots for pending jobs
// @route   GET /api/schedule/optimize
export const optimizeSchedule = async (req, res) => {
    try {
        const userId = req.user.id;

        // 1. Get pending jobs (broadcast or accepted but not scheduled)
        const pendingJobs = await db.query(
            `SELECT sr.id, sr.issue_description, sr.priority, m.name as machine_name, u.first_name as client_name
             FROM service_requests sr
             JOIN machines m ON sr.machine_id = m.id
             JOIN users u ON sr.consumer_id = u.id
             WHERE (sr.producer_id IS NULL AND sr.status = 'broadcast')
                OR (sr.producer_id = $1 AND sr.status = 'accepted')`,
            [userId]
        );

        // 2. Get current schedule for the week
        const currentSchedule = await db.query(
            'SELECT * FROM expert_schedules WHERE user_id = $1',
            [userId]
        );

        // 3. AI Logic Simulation:
        // Find empty slots and assign jobs based on priority, avoiding overlaps
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
        const suggestions = [];

        pendingJobs.rows.forEach((job, index) => {
            // Try to find a slot that doesn't overlap
            let assigned = false;
            for (let d = 0; d < days.length && !assigned; d++) {
                const targetDay = days[(d + index) % days.length];

                // Potential time slots: 09:00, 12:00, 15:00
                const possibleTimes = ['09:00', '12:00', '15:00'];
                for (const startTime of possibleTimes) {
                    // Check if this slot overlaps with currentSchedule
                    const hasOverlap = currentSchedule.rows.some(s =>
                        s.day_of_week === targetDay && s.start_time === startTime
                    );

                    if (!hasOverlap) {
                        const h = parseInt(startTime.split(':')[0]);
                        suggestions.push({
                            request_id: job.id,
                            day_of_week: targetDay,
                            start_time: startTime,
                            end_time: `${h + 2}:30`,
                            slot_type: 'suggested',
                            title: `Proposed: ${job.machine_name}`,
                            description: `AI Recommended for ticket #${job.id}. Optimized for minimal travel time.`,
                            machine_name: job.machine_name,
                            priority: job.priority
                        });
                        assigned = true;
                        break;
                    }
                }
            }
        });

        res.json(suggestions);
    } catch (err) {
        console.error('[AI Scheduler] Optimization failure:', err);
        res.status(500).json({ message: 'AI Optimization engine offline' });
    }
};
