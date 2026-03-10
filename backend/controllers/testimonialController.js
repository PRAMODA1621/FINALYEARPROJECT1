const db = require('../config/database');
const logger = require('../utils/logger');

// @desc    Get all testimonials
// @route   GET /api/testimonials
// @access  Public
const getTestimonials = async (req, res) => {
  try {
    // Check if testimonials table exists
    const [tables] = await db.query("SHOW TABLES LIKE 'testimonials'");
    
    if (tables.length === 0) {
      // Return empty array if table doesn't exist
      return res.json({
        success: true,
        data: []
      });
    }

    const [testimonials] = await db.query(
      'SELECT * FROM testimonials WHERE is_active = true ORDER BY created_at DESC LIMIT 10'
    );

    res.json({
      success: true,
      data: testimonials
    });
  } catch (error) {
    logger.error('Get testimonials error:', error);
    // Return empty array on error to prevent frontend crash
    res.json({
      success: true,
      data: []
    });
  }
};

module.exports = {
  getTestimonials
};