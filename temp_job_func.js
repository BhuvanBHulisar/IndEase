
// @desc    Retrieve my active jobs (Consumer & Producer) - Serves as Chat List
// @route   GET /api/jobs/my
exports.getMyJobs = async (req, res) => {
    try {
        let query = '';
        const params = [req.user.id];

        if (req.user.role === 'consumer') {
            // For consumers: Get all my requests, join machine info, and expert details (if assigned)
            query = `
                SELECT 
                    sr.id, sr.status, sr.issue_description, sr.created_at,
                    m.name as machine_name, 
                    COALESCE(u.first_name, 'Waiting for Expert...') as other_party_name,
                    'expert' as other_party_role
                FROM service_requests sr
                JOIN machines m ON sr.machine_id = m.id
                LEFT JOIN users u ON sr.producer_id = u.id
                WHERE sr.consumer_id = $1
                ORDER BY sr.created_at DESC
             `;
        } else {
            // For producers: Get jobs assigned to me
            query = `
                SELECT 
                    sr.id, sr.status, sr.issue_description, sr.created_at,
                    m.name as machine_name, 
                    u.first_name as other_party_name,
                    'consumer' as other_party_role
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
