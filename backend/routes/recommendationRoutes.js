const express = require('express');
const router = express.Router();
const axios = require('axios');
const db = require('../config/database');

// @desc    Get product recommendations
// @route   GET /api/recommendations/:productName
// @access  Public
const getRecommendations = async (req, res) => {
  try {
    const { productName } = req.params;
    const limit = parseInt(req.query.limit) || 4;

    console.log('📡 Getting recommendations for:', productName);

    // Get current product details
    const [products] = await db.query('SELECT * FROM products WHERE name = ?', [productName]);
    if (products.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const product = products[0];

    // Call Python recommendation service
    try {
      const pythonServiceUrl = process.env.RECOMMENDATION_SERVICE_URL || 'http://localhost:8001/api';
      const response = await axios.post(`${pythonServiceUrl}/recommend`, {
        product_name: productName,
        category: product.category,
        limit: limit
      }, { timeout:  60000});

      if (response.data && response.data.recommendations) {
        const recommendedNames = response.data.recommendations.map(r => r.product_name);
        
        // Fetch full product details from database
        const placeholders = recommendedNames.map(() => '?').join(',');
        const [recommendedProducts] = await db.query(
          `SELECT * FROM products WHERE name IN (${placeholders}) AND is_active = 1`,
          recommendedNames
        );

        return res.json({
          success: true,
          data: recommendedProducts,
          method: 'ml'
        });
      }
    } catch (pythonError) {
      console.log('Python service unavailable, using fallback recommendations');
    }

    // Fallback: Get products from same category
    const [fallbackProducts] = await db.query(
      `SELECT * FROM products 
       WHERE category = ? AND name != ? AND is_active = 1 
       ORDER BY RAND() 
       LIMIT ?`,
      [product.category, productName, limit]
    );

    res.json({
      success: true,
      data: fallbackProducts,
      method: 'fallback'
    });

  } catch (error) {
    console.error('❌ Recommendation error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

router.get('/:productName', getRecommendations);

module.exports = router;