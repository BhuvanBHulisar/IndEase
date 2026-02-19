const express = require('express');
const router = express.Router();
const machineController = require('../controllers/machineController');
const auth = require('../middleware/auth');

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

module.exports = router;
