const express = require('express');
const router = express.Router();
const {
  getProductReviews,
  addReview,
  updateReview,
  deleteReview,
  markHelpful
} = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.get('/product/:productId', getProductReviews);

// Protected routes
router.post('/product/:productId', protect, addReview);
router.put('/:reviewId', protect, updateReview);
router.delete('/:reviewId', protect, deleteReview);
router.post('/:reviewId/helpful', protect, markHelpful);

module.exports = router;