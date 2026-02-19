const express = require('express');
const router = express.Router();
const financeController = require('../controllers/financeController');
const auth = require('../middleware/auth');

/**
 * FINANCIAL & CLEARANCE ROUTES
 */

// @route   POST api/finance/pay-order
// @desc    Initiate payment for a service request
router.post('/pay-order', auth, financeController.createOrder);

// @route   POST api/finance/verify
// @desc    Secure verification of transaction signature
router.post('/verify', auth, financeController.verifyPayment);

module.exports = router;
