import db from '../config/db.js';

// @desc    Get all notifications for current user
// @route   GET /api/notifications
export const getNotifications = async (req, res) => {
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
export const markAsRead = async (req, res) => {
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
export const clearAll = async (req, res) => {
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
export const createNotification = async (userId, title, message, type, link) => {
    try {
        // [FIX] Skip DB for mock user IDs
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(userId)) {
            console.log('[Notifications] Skipping DB for mock UserID:', userId);
            if (global.io) {
                global.io.to(`user_${userId}`).emit('notification', {
                    id: Date.now(),
                    type: type || 'system',
                    msg: message || title,
                    time: 'Just now',
                    read: false,
                    link: link || null
                });
            }
            return { id: Date.now() };
        }

        const result = await db.query(
            'INSERT INTO notifications (user_id, title, message, type, link) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [userId, title, message, type || 'system', link || null]
        );

        const newNotif = result.rows[0];

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
