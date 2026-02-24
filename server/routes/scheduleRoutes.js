const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/scheduleController');
const auth = require('../middleware/auth');

/**
 * OPERATIONS SCHEDULE ROUTES
 */

// @route   GET api/schedule
// @desc    Get expert schedule
router.get('/', auth, scheduleController.getSchedule);

// @route   POST api/schedule
// @desc    Add/Update schedule slot
router.post('/', auth, scheduleController.updateSchedule);

// @route   DELETE api/schedule/:id
// @desc    Delete schedule slot
router.delete('/:id', auth, scheduleController.deleteSlot);

// @route   GET api/schedule/optimize
// @desc    Get AI-proposed slots
router.get('/optimize', auth, scheduleController.optimizeSchedule);

module.exports = router;
