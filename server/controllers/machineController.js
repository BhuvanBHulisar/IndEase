import db from '../config/db.js';

// @desc    Get all machines for current consumer
// @route   GET /api/machines
export const getMachines = async (req, res) => {
    try {
        const isDemo = !!req.user.is_demo;
        const result = await db.query(
            'SELECT * FROM machines WHERE owner_id = $1 AND is_demo = $2 ORDER BY created_at DESC',
            [req.user.id, isDemo]
        );
        res.json(result.rows);
    } catch (err) {
        console.error('[Machines] Retrieval error:', err);
        res.status(500).json({ message: 'Failed to fetch machine fleet' });
    }
};

// @desc    Register a new machine node
// @route   POST /api/machines
export const addMachine = async (req, res) => {
    const { name, oem, model_year, machine_type } = req.body;
    const ownerId = req.user.id;
    const isDemo  = !!req.user.is_demo;
    try {
        const result = await db.query(
            'INSERT INTO machines (owner_id, name, oem, model_year, machine_type, is_demo) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [ownerId, name, oem, model_year, machine_type, isDemo]
        );
        const row = result.rows[0];
        if (global.io && ownerId) {
            global.io.to(`user_${ownerId}`).emit('machine_added', row);
        }
        res.status(201).json(row);
    } catch (err) {
        console.error('[Machines] Registration error:', err);
        res.status(500).json({ message: 'Machine registration failure' });
    }
};

// @desc    Update machine telemetry/status
// @route   PUT /api/machines/:id
export const updateMachine = async (req, res) => {
    const { name, conditionScore, lastService } = req.body;
    const machineId = req.params.id;

    try {
        // Check ownership first
        const machine = await db.query('SELECT * FROM machines WHERE id = $1 AND owner_id = $2', [machineId, req.user.id]);
        if (machine.rows.length === 0) {
            return res.status(404).json({ message: 'Machine node not found or access denied' });
        }

        const result = await db.query(
            'UPDATE machines SET name = COALESCE($1, name), condition_score = COALESCE($2, condition_score), last_service = COALESCE($3, last_service) WHERE id = $4 RETURNING *',
            [name, conditionScore, lastService, machineId]
        );

        res.json(result.rows[0]);
    } catch (err) {
        console.error('[Machines] Update error:', err);
        res.status(500).json({ message: 'Machine telemetry update failure' });
    }
};

// @desc    Remove machine from fleet
// @route   DELETE /api/machines/:id
export const deleteMachine = async (req, res) => {
    const machineId = req.params.id;

    try {
        const result = await db.query('DELETE FROM machines WHERE id = $1 AND owner_id = $2 RETURNING *', [machineId, req.user.id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Machine node not found or access denied' });
        }

        if (global.io && req.user.id) {
            global.io.to(`user_${req.user.id}`).emit('machine_deleted', { id: machineId });
        }

        res.json({ message: 'Machine successfully decommissioned from fleet' });
    } catch (err) {
        console.error('[Machines] Deletion error:', err);
        res.status(500).json({ message: 'Machine decommissioning failure' });
    }
};
