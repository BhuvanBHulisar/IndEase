import express from 'express';
const router = express.Router();
import * as scheduleController from '../controllers/scheduleController.js';
import { protect as auth } from '../middleware/auth.middleware.js';

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

export default router;
