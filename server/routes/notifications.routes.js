import express from 'express';
import { getNotifications } from '../controllers/notifications.controller.js';

const router = express.Router();

router.get('/', getNotifications);

export default router;
