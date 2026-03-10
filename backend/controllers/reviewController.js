const db = require('../config/database');

// @desc    Get reviews for a product
// @route   GET /api/products/:productId/reviews
// @access  Public
const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    // Get reviews with user info
    const [reviews] = await db.query(
      `SELECT r.*, 
              u.first_name, u.last_name,
              (SELECT COUNT(*) FROM review_helpful WHERE review_id = r.id AND is_helpful = 1) as helpful_count,
              (SELECT COUNT(*) FROM review_helpful WHERE review_id = r.id AND is_helpful = 0) as not_helpful_count
       FROM product_reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.product_id = ? AND r.is_approved = 1
       ORDER BY r.created_at DESC
       LIMIT ? OFFSET ?`,
      [productId, parseInt(limit), offset]
    );

    // Get total count
    const [[{ total }]] = await db.query(
      'SELECT COUNT(*) as total FROM product_reviews WHERE product_id = ? AND is_approved = 1',
      [productId]
    );

    // Get rating summary
    const [[summary]] = await db.query(
      `SELECT 
        COUNT(*) as total_reviews,
        AVG(rating) as average_rating,
        SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as rating_5,
        SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as rating_4,
        SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as rating_3,
        SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as rating_2,
        SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as rating_1
       FROM product_reviews 
       WHERE product_id = ? AND is_approved = 1`,
      [productId]
    );

    res.json({
      success: true,
      data: {
        reviews,
        summary: {
          ...summary,
          average_rating: parseFloat(summary.average_rating || 0).toFixed(1)
        },
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('❌ Get reviews error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Add a review
// @route   POST /api/products/:productId/reviews
// @access  Private
const addReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const { rating, title, comment } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
    }

    if (!comment || comment.trim().length < 10) {
      return res.status(400).json({ success: false, message: 'Review must be at least 10 characters' });
    }

    // Check if user already reviewed this product
    const [existing] = await db.query(
      'SELECT id FROM product_reviews WHERE product_id = ? AND user_id = ?',
      [productId, userId]
    );

    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this product' });
    }

    // Check if user purchased this product (verified purchase)
    const [orders] = await db.query(
      `SELECT o.id FROM orders o
       JOIN order_items oi ON o.id = oi.order_id
       WHERE o.user_id = ? AND oi.product_id = ? AND o.order_status IN ('delivered', 'completed')`,
      [userId, productId]
    );
    
    const isVerifiedPurchase = orders.length > 0;

    // Insert review
    const [result] = await db.query(
      `INSERT INTO product_reviews (product_id, user_id, rating, title, comment, is_verified_purchase)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [productId, userId, rating, title || null, comment, isVerifiedPurchase]
    );

    // Get the inserted review with user info
    const [newReview] = await db.query(
      `SELECT r.*, u.first_name, u.last_name,
              0 as helpful_count, 0 as not_helpful_count
       FROM product_reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.id = ?`,
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Review added successfully',
      data: newReview[0]
    });
  } catch (error) {
    console.error('❌ Add review error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update a review
// @route   PUT /api/reviews/:reviewId
// @access  Private
const updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, title, comment } = req.body;
    const userId = req.user.id;

    // Check if review exists and belongs to user
    const [reviews] = await db.query(
      'SELECT * FROM product_reviews WHERE id = ? AND user_id = ?',
      [reviewId, userId]
    );

    if (reviews.length === 0) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    // Update review
    await db.query(
      `UPDATE product_reviews 
       SET rating = ?, title = ?, comment = ?, updated_at = NOW()
       WHERE id = ?`,
      [rating, title, comment, reviewId]
    );

    res.json({ success: true, message: 'Review updated successfully' });
  } catch (error) {
    console.error('❌ Update review error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:reviewId
// @access  Private
const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.id;

    // Check if user is admin or review owner
    const [reviews] = await db.query(
      'SELECT user_id FROM product_reviews WHERE id = ?',
      [reviewId]
    );

    if (reviews.length === 0) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    if (reviews[0].user_id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await db.query('DELETE FROM product_reviews WHERE id = ?', [reviewId]);

    res.json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    console.error('❌ Delete review error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Mark review as helpful/not helpful
// @route   POST /api/reviews/:reviewId/helpful
// @access  Private
const markHelpful = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { isHelpful } = req.body;
    const userId = req.user.id;

    // Check if review exists
    const [reviews] = await db.query('SELECT id FROM product_reviews WHERE id = ?', [reviewId]);
    if (reviews.length === 0) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    // Check if user already marked this review
    const [existing] = await db.query(
      'SELECT id FROM review_helpful WHERE review_id = ? AND user_id = ?',
      [reviewId, userId]
    );

    if (existing.length > 0) {
      // Update existing
      await db.query(
        'UPDATE review_helpful SET is_helpful = ? WHERE review_id = ? AND user_id = ?',
        [isHelpful, reviewId, userId]
      );
    } else {
      // Insert new
      await db.query(
        'INSERT INTO review_helpful (review_id, user_id, is_helpful) VALUES (?, ?, ?)',
        [reviewId, userId, isHelpful]
      );
    }

    // Get updated counts
    const [[counts]] = await db.query(
      `SELECT 
        COUNT(CASE WHEN is_helpful = 1 THEN 1 END) as helpful,
        COUNT(CASE WHEN is_helpful = 0 THEN 1 END) as not_helpful
       FROM review_helpful
       WHERE review_id = ?`,
      [reviewId]
    );

    res.json({
      success: true,
      message: 'Feedback recorded',
      data: counts
    });
  } catch (error) {
    console.error('❌ Mark helpful error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getProductReviews,
  addReview,
  updateReview,
  deleteReview,
  markHelpful
};