import express from 'express';
const router = express.Router();
import * as notificationController from '../controllers/notificationController.js';
import { protect as auth } from '../middleware/auth.middleware.js';

// @route   GET api/notifications
// @desc    Get user notifications
router.get('/', auth, notificationController.getNotifications);

// @route   PATCH api/notifications/:id/read
// @desc    Mark specific notification as read
router.patch('/:id/read', auth, notificationController.markAsRead);

// @route   DELETE api/notifications
// @desc    Clear all notifications
router.delete('/', auth, notificationController.clearAll);

export default router;
