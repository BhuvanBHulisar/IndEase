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

// @route   GET api/finance/stats
// @desc    Get dashboard financial stats
router.get('/stats', auth, financeController.getStats);

// @route   GET api/finance/history
// @desc    Get recent transactions
router.get('/history', auth, financeController.getHistory);

// @route   GET api/finance/chart-data
// @desc    Get data for charts
router.get('/chart-data', auth, financeController.getChartData);

module.exports = router;
