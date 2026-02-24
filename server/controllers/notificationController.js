const db = require('../db');

// @desc    Get all notifications for current user
// @route   GET /api/notifications
exports.getNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await db.query(
            'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50',
            [userId]
        );
        res.json(result.rows);
    } catch (err) {
        console.error('[Notifications] Fetch failure:', err);
        res.status(500).json({ message: 'Could not retrieve notifications' });
    }
};

// @desc    Mark a notification as read
// @route   PATCH /api/notifications/:id/read
exports.markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        await db.query(
            'UPDATE notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2',
            [id, userId]
        );

        res.json({ message: 'Notification marked as read' });
    } catch (err) {
        console.error('[Notifications] Update failure:', err);
        res.status(500).json({ message: 'Could not update notification' });
    }
};

// @desc    Clear all notifications for current user
// @route   DELETE /api/notifications
exports.clearAll = async (req, res) => {
    try {
        const userId = req.user.id;
        await db.query('DELETE FROM notifications WHERE user_id = $1', [userId]);
        res.json({ message: 'All notifications cleared' });
    } catch (err) {
        console.error('[Notifications] Deletion failure:', err);
        res.status(500).json({ message: 'Could not clear notifications' });
    }
};

/**
 * UTILITY: createNotification
 * Internal function to be used by other controllers to trigger alerts.
 */
exports.createNotification = async (userId, title, message, type, link) => {
    try {
        const result = await db.query(
            'INSERT INTO notifications (user_id, title, message, type, link) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [userId, title, message, type || 'system', link || null]
        );

        const newNotif = result.rows[0];

        // [NEW] Real-time Emit via Socket.io
        // We need the app instance to get 'socketio'. 
        // Note: This relies on app being accessible. A safer way is to pass io if possible, 
        // but for utility usage in controllers, we can try to get it from a global or passed ref.
        // For now, we'll try to reach it if the controller has access to a request, 
        // but since this is an internal utility, we might need a workaround.

        // Better: Export a setter for io in this module that index.js calls.
        if (global.io) {
            global.io.to(`user_${userId}`).emit('notification', {
                id: newNotif.id,
                type: newNotif.type,
                msg: newNotif.message || newNotif.title,
                time: 'Just now',
                read: false,
                link: newNotif.link
            });
        }

        return newNotif;
    } catch (err) {
        console.error('[Notifications] Utility creation failure:', err);
        return null;
    }
};
