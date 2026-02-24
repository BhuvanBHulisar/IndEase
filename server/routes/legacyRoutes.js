const express = require('express');
const router = express.Router();
const legacyController = require('../controllers/legacyController');
const auth = require('../middleware/auth');

router.get('/search', auth, legacyController.searchLegacy);
router.post('/seed', auth, legacyController.seedLegacy); // Optional: helper

module.exports = router;
