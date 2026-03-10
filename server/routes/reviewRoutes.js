import express from 'express';
import * as reviewController from '../controllers/reviewController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// @route   POST api/reviews
// @desc    Submit a review for an expert
router.post('/', auth, reviewController.createReview);

// @route   GET api/reviews/:producerId
// @desc    Get all reviews for a producer
router.get('/:producerId', auth, reviewController.getProducerReviews);

export default router;
