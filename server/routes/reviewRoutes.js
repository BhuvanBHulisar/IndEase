const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const auth = require('../middleware/auth');

// @route   POST api/reviews
// @desc    Submit a review for an expert
router.post('/', auth, reviewController.createReview);

// @route   GET api/reviews/:producerId
// @desc    Get all reviews for a producer
router.get('/:producerId', auth, reviewController.getProducerReviews);

module.exports = router;
