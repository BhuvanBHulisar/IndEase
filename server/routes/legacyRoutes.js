import express from 'express';
import * as legacyController from '../controllers/legacyController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.get('/search', auth, legacyController.searchLegacy);
router.post('/seed', auth, legacyController.seedLegacy); // Optional: helper

export default router;
