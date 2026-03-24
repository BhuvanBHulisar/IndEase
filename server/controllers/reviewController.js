import db from '../config/db.js';
import { updateExpertPoints } from '../services/expertPerformanceService.js';

// @desc    Submit a review for a completed job
// @route   POST /api/reviews
export const createReview = async (req, res) => {
    const { requestId, rating, comment } = req.body;
    const consumerId = req.user.id; // From auth middleware

    if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    try {
        // 1. Verify job eligibility (completed job or paid / invoice stage after payment)
        const jobResult = await db.query(
            `SELECT * FROM service_requests WHERE id = $1 AND consumer_id = $2
             AND status IN ('completed', 'payment_pending')`,
            [requestId, consumerId]
        );

        if (jobResult.rows.length === 0) {
            return res.status(400).json({ message: 'Job not eligible for review (must be completed and owned by you)' });
        }

        const job = jobResult.rows[0];
        const producerId = job.producer_id;

        // 2. Check if review already exists
        const existingReview = await db.query('SELECT * FROM reviews WHERE request_id = $1', [requestId]);
        if (existingReview.rows.length > 0) {
            return res.status(400).json({ message: 'Review already submitted for this job' });
        }

        // 3. Insert Review
        const newReview = await db.query(
            'INSERT INTO reviews (request_id, consumer_id, producer_id, rating, comment) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [requestId, consumerId, producerId, rating, comment]
        );

        // 4. Recalculate Producer Rating
        const ratingResult = await db.query(
            'SELECT AVG(rating) as avg_rating FROM reviews WHERE producer_id = $1',
            [producerId]
        );

        const newAverage = parseFloat(ratingResult.rows[0].avg_rating).toFixed(1);

        await db.query(
            'UPDATE producer_profiles SET rating = $1 WHERE user_id = $2',
            [newAverage, producerId]
        );

        if (producerId) {
            let pointChange = 0;
            if (rating === 5) pointChange = 15;
            else if (rating === 4) pointChange = 10;
            else if (rating === 3) pointChange = -5;
            else pointChange = -15;

            await updateExpertPoints(producerId, pointChange, `Consumer rating received: ${rating} stars`);
        }

        res.status(201).json({ review: newReview.rows[0], newProducerRating: newAverage });

    } catch (err) {
        console.error('[Reviews] Submission failure:', err);
        res.status(500).json({ message: 'Review submission failed' });
    }
};

// @desc    Get reviews for a producer
// @route   GET /api/reviews/:producerId
export const getProducerReviews = async (req, res) => {
    const { producerId } = req.params;

    try {
        const result = await db.query(`
            SELECT r.*, u.first_name as consumer_name 
            FROM reviews r
            JOIN users u ON r.consumer_id = u.id
            WHERE r.producer_id = $1
            ORDER BY r.created_at DESC
        `, [producerId]);

        res.json(result.rows);
    } catch (err) {
        console.error('[Reviews] Retrieval failure:', err);
        res.status(500).json({ message: 'Could not fetch reviews' });
    }
};
