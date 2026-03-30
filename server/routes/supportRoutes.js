import express from 'express';
import * as supportController from '../controllers/supportController.js';
import { protect as auth } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/tickets', auth, supportController.createTicket);
router.get('/tickets', auth, supportController.getMyTickets);

export default router;
