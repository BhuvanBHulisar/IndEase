import express from 'express';
import * as paymentController from '../controllers/paymentController.js';
import auth from '../middleware/auth.js';
const router = express.Router();

// Expert: Withdraw wallet balance
router.post('/withdraw', auth, paymentController.expertWithdraw);

export default router;
