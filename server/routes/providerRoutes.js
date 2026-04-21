import express from 'express';
import { protect as auth } from '../middleware/auth.middleware.js';
import { getProviderStats, getProviderPerformance } from '../controllers/providerController.js';

import db from '../config/db.js';

const router = express.Router();

router.get('/experts', auth, async (req, res) => {
    try {
        // First get the requesting user's location to prioritize local experts
        const userQuery = await db.query('SELECT city, state, location FROM users WHERE id = $1', [req.user.id]);
        const reqUser = userQuery.rows[0] || {};
        const reqCity = (reqUser.city || reqUser.location || '').toLowerCase().trim();
        
        const result = await db.query(`
            SELECT u.id, 
                   CONCAT(u.first_name, ' ', u.last_name) as name,
                   u.first_name, u.last_name,
                   pp.skills, pp.rating,
                   pp.status,
                   u.city, u.state, u.location
            FROM users u
            JOIN producer_profiles pp ON pp.user_id = u.id  
            WHERE u.role = 'producer' AND pp.status IN ('available', 'approved')
        `);
        
        let experts = result.rows.map(exp => {
            const expCity = (exp.city || exp.location || '').toLowerCase().trim();
            let isLocal = false;
            if (reqCity && expCity && (expCity.includes(reqCity) || reqCity.includes(expCity))) {
                isLocal = true;
            }
            
            // Format specialization correctly for the frontend
            let specialization = 'General Service';
            if (exp.skills && Array.isArray(exp.skills) && exp.skills.length > 0) {
                specialization = exp.skills[0];
            } else if (typeof exp.skills === 'string') {
                specialization = exp.skills.split(',')[0];
            }

            return {
                ...exp,
                specialization,
                isLocal
            };
        });

        // Sort: Local experts first, then by rating (desc)
        experts.sort((a, b) => {
            if (a.isLocal && !b.isLocal) return -1;
            if (!a.isLocal && b.isLocal) return 1;
            return (b.rating || 0) - (a.rating || 0);
        });

        res.json(experts);
    } catch (err) {
        console.error('Error fetching experts:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/:id/stats', auth, getProviderStats);
router.get('/:id/performance', auth, getProviderPerformance);

export default router;
