import express from 'express';
import * as chatController from '../controllers/chatController.js';
import { protect as auth } from '../middleware/auth.middleware.js';

const router = express.Router();

/**
 * SECURE COMMUNICATION ROUTES
 */

// @route   GET api/chat/:requestId
// @desc    Retrieve historical signals for a specific service request
router.get('/:requestId', auth, chatController.getChatHistory);

export default router;
