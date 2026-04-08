import express from 'express';
import { getDemoUser, resetDemoData } from '../services/demoService.js';
import { generateAccessToken } from '../utils/token.util.js';

const router = express.Router();

// POST /api/demo/login  — returns a real JWT for the demo account
router.post('/login', async (req, res) => {
    try {
        const { role = 'consumer' } = req.body;
        const user = await getDemoUser(role);
        if (!user) {
            return res.status(503).json({ error: 'Demo accounts not ready. Try again in a moment.' });
        }
        const token = generateAccessToken(user);
        res.json({
            token,
            user: {
                id:         user.id,
                email:      user.email,
                first_name: user.first_name,
                last_name:  user.last_name,
                role:       user.role,
                is_demo:    true,
            }
        });
    } catch (err) {
        console.error('[Demo] Login failed:', err);
        res.status(500).json({ error: 'Demo login failed' });
    }
});

// POST /api/demo/reset  — wipe and re-seed demo data
router.post('/reset', async (req, res) => {
    try {
        const result = await resetDemoData();
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: 'Reset failed' });
    }
});

export default router;
