import express from 'express';
import { getNotifications } from '../controllers/notifications.controller.js';
import { adminOnly } from '../middleware/adminAuth.js';

const router = express.Router();

router.get('/', adminOnly, getNotifications);

export default router;
