import express from 'express';
import { googleAuthReact } from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/google', googleAuthReact);

export default router;
