const db = require('../db');

// @desc    Retrieve chat history for a specific request
// @route   GET /api/chat/:requestId
exports.getChatHistory = async (req, res) => {
    const requestId = req.params.requestId;

    try {
        // 1. Check if user is part of this request (Consumer or assigned Producer)
        const request = await db.query(
            'SELECT consumer_id, producer_id FROM service_requests WHERE id = $1',
            [requestId]
        );

        if (request.rows.length === 0) {
            // [FIX] Return empty array instead of 404 to support "Mock Mode"
            // When DB is offline/mocked, request.rows is empty. 
            // Sending 200 [] tells frontend "nothing new", so it keeps its own mock state.
            return res.json([]);
        }

        const { consumer_id, producer_id } = request.rows[0];
        if (req.user.id !== consumer_id && req.user.id !== producer_id) {
            return res.status(403).json({ message: 'Access denied to this secure signal' });
        }

        // 2. Fetch messages
        const messages = await db.query(
            'SELECT cm.*, u.first_name, u.role FROM chat_messages cm JOIN users u ON cm.sender_id = u.id WHERE cm.request_id = $1 ORDER BY cm.created_at ASC',
            [requestId]
        );

        res.json(messages.rows);
    } catch (err) {
        console.error('[Chat] History retrieval failure:', err);
        if (err.code === '28P01') {
            return res.status(503).json({
                message: 'Database authentication failed. Update DB credentials in server/.env and restart backend.',
            });
        }
        res.status(500).json({ message: 'Internal operational failure' });
    }
};

// @desc    Store a message in the ledger (usually called from socket event)
exports.saveMessage = async (requestId, senderId, text) => {
    try {
        const result = await db.query(
            'INSERT INTO chat_messages (request_id, sender_id, message_text) VALUES ($1, $2, $3) RETURNING *',
            [requestId, senderId, text]
        );
        return result.rows[0];
    } catch (err) {
        console.error('[Chat] Message persistence failure:', err);
        return null;
    }
};
