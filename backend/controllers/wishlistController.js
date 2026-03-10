const db = require('../config/database');

// @desc    Get wishlist
// @route   GET /api/wishlist
// @access  Private
const getWishlist = async (req, res) => {
  try {
    console.log('📋 Fetching wishlist for user:', req.user.id);
    
    const [items] = await db.query(
      `SELECT w.*, p.id as product_id, p.name, p.price, p.image_url, p.category, p.description, p.stock 
       FROM wishlist w
       JOIN products p ON w.product_id = p.id
       WHERE w.user_id = ? AND (p.is_active = 1 OR p.is_active IS NULL)
       ORDER BY w.created_at DESC`,
      [req.user.id]
    );

    console.log(`✅ Found ${items.length} wishlist items`);
    
    const formattedItems = items.map(item => ({
      id: item.id,
      product_id: item.product_id,
      product: {
        id: item.product_id,
        name: item.name,
        price: parseFloat(item.price),
        image_url: item.image_url,
        category: item.category,
        description: item.description,
        stock: item.stock
      },
      created_at: item.created_at
    }));

    res.json({ success: true, data: formattedItems });
  } catch (error) {
    console.error('❌ Get wishlist error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Add to wishlist
// @route   POST /api/wishlist
// @access  Private
const addToWishlist = async (req, res) => {
  try {
    const { productName } = req.body;
    console.log('➕ Adding to wishlist:', { productName, userId: req.user.id });

    if (!productName) {
      return res.status(400).json({ success: false, message: 'Product name is required' });
    }

    const [products] = await db.query('SELECT * FROM products WHERE name = ? AND (is_active = 1 OR is_active IS NULL)', [productName]);
    if (products.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    const product = products[0];

    const [existing] = await db.query(
      'SELECT * FROM wishlist WHERE user_id = ? AND product_id = ?',
      [req.user.id, product.id]
    );

    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Already in wishlist' });
    }

    const [result] = await db.query(
      'INSERT INTO wishlist (user_id, product_id) VALUES (?, ?)',
      [req.user.id, product.id]
    );

    const [newItem] = await db.query(
      `SELECT w.*, p.id as product_id, p.name, p.price, p.image_url, p.category, p.description 
       FROM wishlist w
       JOIN products p ON w.product_id = p.id
       WHERE w.id = ?`,
      [result.insertId]
    );

    const formattedItem = {
      id: newItem[0].id,
      product_id: newItem[0].product_id,
      product: {
        id: newItem[0].product_id,
        name: newItem[0].name,
        price: parseFloat(newItem[0].price),
        image_url: newItem[0].image_url,
        category: newItem[0].category,
        description: newItem[0].description
      },
      created_at: newItem[0].created_at
    };

    res.json({ success: true, message: 'Added to wishlist', data: formattedItem });
  } catch (error) {
    console.error('❌ Add to wishlist error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Remove from wishlist
// @route   DELETE /api/wishlist/:id
// @access  Private
const removeFromWishlist = async (req, res) => {
  try {
    const wishlistId = req.params.id;
    console.log('🗑️ Removing from wishlist:', { wishlistId, userId: req.user.id });

    const [items] = await db.query(
      'SELECT * FROM wishlist WHERE id = ? AND user_id = ?',
      [wishlistId, req.user.id]
    );

    if (items.length === 0) {
      return res.status(404).json({ success: false, message: 'Wishlist item not found' });
    }

    await db.query('DELETE FROM wishlist WHERE id = ?', [wishlistId]);
    
    res.json({ success: true, message: 'Removed from wishlist' });
  } catch (error) {
    console.error('❌ Remove from wishlist error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getWishlist, addToWishlist, removeFromWishlist };