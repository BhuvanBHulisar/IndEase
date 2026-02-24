const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

/**
 * JOB & RADAR ROUTES
 */

// @route   POST api/jobs/broadcast
// @desc    Consumer broadcasts a machine fault
router.post('/broadcast', auth, roleCheck(['consumer']), jobController.broadcastJob);

// @route   GET api/jobs/radar
// @desc    Experts scan the radar for active signals
router.get('/radar', auth, roleCheck(['producer']), jobController.getRadarJobs);

// @route   PATCH api/jobs/:id/accept
// @desc    Expert accepts the assignment
router.patch('/:id/accept', auth, roleCheck(['producer']), jobController.acceptJob);

// @route   POST api/jobs/:id/invoice
// @desc    Expert sends an invoice/bill
router.post('/:id/invoice', auth, roleCheck(['producer']), jobController.createInvoice);

// @route   GET api/jobs/my
// @desc    Get my active jobs (Chat List)
router.get('/my', auth, jobController.getMyJobs);

module.exports = router;
