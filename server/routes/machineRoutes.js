import express from 'express';
export const router = express.Router();
import * as machineController from '../controllers/machineController.js';
import { protect as auth } from '../middleware/auth.middleware.js';

/**
 * MACHINE REGISTRY ROUTES
 * All routes are protected by the auth middleware to ensure industrial security.
 */

// @route   GET api/machines
router.get('/', auth, machineController.getMachines);

// @route   POST api/machines
router.post('/', auth, machineController.addMachine);

// @route   PUT api/machines/:id
router.put('/:id', auth, machineController.updateMachine);

// @route   DELETE api/machines/:id
router.delete('/:id', auth, machineController.deleteMachine);

export default router;
