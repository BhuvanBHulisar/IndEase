import db from '../config/db.js';

// @desc    Get all machines for current consumer
// @route   GET /api/machines
export const getMachines = async (req, res) => {
    // [DEMO BYPASS]
    if (req.user.id === 'demo-123') {
        return res.json([
            { id: 101, name: 'Hydraulic Press X-200', oem: 'Titan Hydraulics', machine_type: 'Hydraulic Press', model_year: 1992, condition_score: 88, created_at: new Date() },
            { id: 102, name: 'CNC Miller 5-Axis', oem: 'Precision Corp', machine_type: 'CNC Concentric', model_year: 2015, condition_score: 95, created_at: new Date() }
        ]);
    }

    try {
        const result = await db.query(
            'SELECT * FROM machines WHERE owner_id = $1 ORDER BY created_at DESC',
            [req.user.id]
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
    // Correctly extracting fields matching frontend state
    const { name, oem, model_year, machine_type } = req.body;
    let ownerId = req.user.id;

    // [DEMO BYPASS]
    // If using the fake demo user, we cannot insert into DB because foreign key "owner_id" won't match any real user.
    // So for demo, we will just return a mocked response as if it succeeded.
    if (ownerId === 'demo-123') {
        return res.status(201).json({
            id: 'mock-machine-' + Date.now(),
            owner_id: 'demo-123',
            name,
            oem,
            model_year,
            machine_type,
            condition_score: 100,
            created_at: new Date()
        });
    }

    try {
        const result = await db.query(
            'INSERT INTO machines (owner_id, name, oem, model_year, machine_type) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [ownerId, name, oem, model_year, machine_type]
        );
        res.status(201).json(result.rows[0]);
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

        res.json({ message: 'Machine successfully decommissioned from fleet' });
    } catch (err) {
        console.error('[Machines] Deletion error:', err);
        res.status(500).json({ message: 'Machine decommissioning failure' });
    }
};
