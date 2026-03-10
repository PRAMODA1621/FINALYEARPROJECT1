const axios = require('axios');
const { Product } = require('../models');
const logger = require('../utils/logger');

// @desc    Get product recommendations
// @route   GET /api/recommendations/product/:productId
// @access  Public
const getProductRecommendations = async (req, res) => {
  try {
    const { productId } = req.params;
    const { limit = 5 } = req.query;

    // Get current product
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: 'Product not found' 
      });
    }

    // Call Python recommendation service
    try {
      const response = await axios.post(
        `${process.env.RECOMMENDATION_SERVICE_URL}/recommend`,
        {
          product_id: parseInt(productId),
          category: product.category,
          name: product.name,
          description: product.description,
          limit: parseInt(limit)
        },
        { timeout: 3000 }
      );

      if (response.data && response.data.recommendations) {
        const recommendedIds = response.data.recommendations.map(r => r.product_id);
        
        // Fetch full product details from database
        const recommendedProducts = await Product.findAll({
          where: {
            id: recommendedIds,
            is_active: true
          }
        });

        // Sort by recommendation order
        const sortedProducts = recommendedIds
          .map(id => recommendedProducts.find(p => p.id === id))
          .filter(p => p);

        return res.json({
          success: true,
          data: sortedProducts,
          method: 'ml'
        });
      }
    } catch (pythonError) {
      logger.error('Python recommendation service error:', pythonError.message);
      // Fallback to category-based recommendations
    }

    // Fallback: Get products from same category
    const fallbackProducts = await Product.findAll({
      where: {
        category: product.category,
        is_active: true,
        id: { [Op.ne]: productId }
      },
      limit: parseInt(limit),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: fallbackProducts,
      method: 'fallback'
    });
  } catch (error) {
    logger.error('Get product recommendations error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Get personalized recommendations for user
// @route   GET /api/recommendations/personalized
// @access  Private
const getPersonalizedRecommendations = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    // Get user's order history and wishlist
    const orders = await Order.findAll({
      where: { user_id: req.user.id },
      include: [OrderItem],
      limit: 20
    });

    const wishlist = await Wishlist.findAll({
      where: { user_id: req.user.id }
    });

    // Extract product IDs from user history
    const userProductIds = new Set();
    
    orders.forEach(order => {
      order.OrderItems.forEach(item => {
        userProductIds.add(item.product_id);
      });
    });
    
    wishlist.forEach(item => {
      userProductIds.add(item.product_id);
    });

    if (userProductIds.size === 0) {
      // No history, return featured products
      const featured = await Product.findAll({
        where: { is_featured: true, is_active: true },
        limit: parseInt(limit)
      });
      return res.json({
        success: true,
        data: featured,
        method: 'featured'
      });
    }

    // Call Python recommendation service for personalized recommendations
    try {
      const response = await axios.post(
        `${process.env.RECOMMENDATION_SERVICE_URL}/personalized`,
        {
          user_id: req.user.id,
          product_ids: Array.from(userProductIds),
          limit: parseInt(limit)
        },
        { timeout: 3000 }
      );

      if (response.data && response.data.recommendations) {
        const recommendedIds = response.data.recommendations.map(r => r.product_id);
        
        const recommendedProducts = await Product.findAll({
          where: {
            id: recommendedIds,
            is_active: true
          }
        });

        const sortedProducts = recommendedIds
          .map(id => recommendedProducts.find(p => p.id === id))
          .filter(p => p);

        return res.json({
          success: true,
          data: sortedProducts,
          method: 'ml'
        });
      }
    } catch (pythonError) {
      logger.error('Python personalized recommendation error:', pythonError.message);
    }

    // Fallback: Get products from categories user has shown interest in
    const userCategories = await Product.findAll({
      where: { id: Array.from(userProductIds) },
      attributes: ['category']
    });

    const categories = [...new Set(userCategories.map(p => p.category))];

    const fallbackProducts = await Product.findAll({
      where: {
        category: categories,
        is_active: true,
        id: { [Op.notIn]: Array.from(userProductIds) }
      },
      limit: parseInt(limit),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: fallbackProducts,
      method: 'fallback'
    });
  } catch (error) {
    logger.error('Get personalized recommendations error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

module.exports = {
  getProductRecommendations,
  getPersonalizedRecommendations
};