const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// @route   POST api/auth/signup
// @desc    Register a new industrial node (Consumer) or Expert (Producer)
router.post('/signup', authController.signup);

// @route   POST api/auth/login
// @desc    Authenticate user & get industrial access token (JWT)
router.post('/login', authController.login);

// @route   GET api/auth/me
// @desc    Get current session status
router.get('/me', authController.getMe);

module.exports = router;
