import express from 'express';
import { protect as auth } from '../middleware/auth.middleware.js';
import { getProviderStats, getProviderPerformance } from '../controllers/providerController.js';

import db from '../config/db.js';

const router = express.Router();

router.get('/experts', auth, async (req, res) => {
    try {
        const result = await db.query(`
            SELECT u.id, 
                   CONCAT(u.first_name, ' ', u.last_name) as name,
                   u.first_name, u.last_name,
                   pp.specialization, pp.avg_rating as rating,
                   u.status
            FROM users u
            JOIN producer_profiles pp ON pp.user_id = u.id  
            WHERE u.role = 'producer' AND u.status = 'active'
        `);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching experts:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/:id/stats', auth, getProviderStats);
router.get('/:id/performance', auth, getProviderPerformance);

export default router;
