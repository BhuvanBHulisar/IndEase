import express from 'express';
import { protect as auth } from '../middleware/auth.middleware.js';
import { getProviderStats, getProviderPerformance } from '../controllers/providerController.js';

const router = express.Router();

router.get('/:id/stats', auth, getProviderStats);
router.get('/:id/performance', auth, getProviderPerformance);

export default router;
