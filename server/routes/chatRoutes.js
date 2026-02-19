const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const auth = require('../middleware/auth');

/**
 * SECURE COMMUNICATION ROUTES
 */

// @route   GET api/chat/:requestId
// @desc    Retrieve historical signals for a specific service request
router.get('/:requestId', auth, chatController.getChatHistory);

module.exports = router;
