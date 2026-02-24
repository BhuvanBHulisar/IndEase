const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const auth = require('../middleware/auth');

// @route   GET api/notifications
// @desc    Get user notifications
router.get('/', auth, notificationController.getNotifications);

// @route   PATCH api/notifications/:id/read
// @desc    Mark specific notification as read
router.patch('/:id/read', auth, notificationController.markAsRead);

// @route   DELETE api/notifications
// @desc    Clear all notifications
router.delete('/', auth, notificationController.clearAll);

module.exports = router;
