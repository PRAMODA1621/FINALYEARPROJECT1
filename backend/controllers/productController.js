const db = require('../config/database');

// @desc    Get all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const { category, minPrice, maxPrice, inStock, search, page = 1, limit = 12 } = req.query;
    
    // FIXED: Declare params array
    const params = [];
    
    let query = 'SELECT * FROM products WHERE is_active = 1 AND (is_custom IS NULL OR is_custom = 0)';
    
    // Category filter
    if (category && category !== '') {
      query += ' AND category = ?';
      params.push(category);
    }
    
    // Price range filter
    if (minPrice && !isNaN(minPrice) && maxPrice && !isNaN(maxPrice)) {
      query += ' AND price BETWEEN ? AND ?';
      params.push(parseFloat(minPrice), parseFloat(maxPrice));
    } else if (minPrice && !isNaN(minPrice)) {
      query += ' AND price >= ?';
      params.push(parseFloat(minPrice));
    } else if (maxPrice && !isNaN(maxPrice)) {
      query += ' AND price <= ?';
      params.push(parseFloat(maxPrice));
    }
    
    // Stock filter
    if (inStock === 'true') {
      query += ' AND stock > 0';
    }
    
    // Search filter
    if (search && search !== '') {
      query += ' AND (name LIKE ? OR description LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term);
    }
    
    // Get total count
    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total');
    const [countResult] = await db.query(countQuery, params);
    const total = countResult[0].total;

    // Pagination
    const offset = (page - 1) * limit;
    query += ` ORDER BY created_at DESC LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`;

    const [products] = await db.query(query, params);

    res.json({
      success: true,
      data: products,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('❌ Get products error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const [products] = await db.query(
      'SELECT * FROM products WHERE id = ? AND (is_active = 1 OR is_active IS NULL) AND (is_custom IS NULL OR is_custom = 0)',
      [req.params.id]
    );
    
    if (products.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, data: products[0] });
  } catch (error) {
    console.error('❌ Get product error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get single product by name
// @route   GET /api/products/name/:name
// @access  Public
const getProductByName = async (req, res) => {
  try {
    const [products] = await db.query(
      'SELECT * FROM products WHERE name = ? AND (is_active = 1 OR is_active IS NULL) AND (is_custom IS NULL OR is_custom = 0)',
      [req.params.name]
    );

    if (products.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, data: products[0] });
  } catch (error) {
    console.error('❌ Get product by name error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
const getFeaturedProducts = async (req, res) => {
  try {
    const [products] = await db.query(
      'SELECT * FROM products WHERE is_featured = 1 AND is_active = 1 AND (is_custom IS NULL OR is_custom = 0) ORDER BY created_at DESC LIMIT 8'
    );
    res.json({ success: true, data: products });
  } catch (error) {
    console.error('❌ Get featured error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get categories
// @route   GET /api/products/categories
// @access  Public
const getCategories = async (req, res) => {
  try {
    const [categories] = await db.query(
      'SELECT DISTINCT category FROM products WHERE (is_active = 1 OR is_active IS NULL) ORDER BY category'
    );
    res.json({ success: true, data: categories.map(c => c.category) });
  } catch (error) {
    console.error('❌ Get categories error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { 
  getProducts, 
  getProductById,
  getProductByName,
  getFeaturedProducts, 
  getCategories 
};