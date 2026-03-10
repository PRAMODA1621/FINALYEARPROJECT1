const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

// Helper function to safely parse JSON
const safeJSONParse = (data) => {
  if (!data) return null;
  
  // If it's already an object, return it directly
  if (typeof data === 'object') {
    return data;
  }
  
  // If it's a string, try to parse it
  try {
    return JSON.parse(data);
  } catch (e) {
    console.log('❌ Invalid JSON string:', data.substring(0, 50));
    return null;
  }
};

// Helper function to get cart data
// Helper function to get cart data
// Helper function to get cart data
// Helper function to get cart data
const getCartData = async (cartId) => {
  try {
    const [items] = await db.query(
      `SELECT ci.*, 
              p.id as product_id, 
              p.name, 
              p.price, 
              p.image_url, 
              p.stock, 
              p.category, 
              p.description
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       WHERE ci.cart_id = ?`,
      [cartId]
    );

    const formattedItems = items.map(item => {
      // Check if this is the custom product (ID 36)
      const isCustomItem = item.product_id === 36;
      
      return {
        id: item.id,
        cart_id: item.cart_id,
        quantity: item.quantity,
        unit_price: parseFloat(item.unit_price || 0),
        customization_data: null,
        product: {
          id: item.product_id,
          name: isCustomItem ? 'Custom Gift' : item.name,
          price: parseFloat(item.price || 0),
          image_url: item.image_url || '/images/placeholder.jpg',
          stock: item.stock || 0,
          category: item.category || 'Custom',
          description: isCustomItem ? 'Personalized custom gift' : item.description
        }
      };
    });

    let subtotal = 0;
    formattedItems.forEach(item => {
      subtotal += item.quantity * item.unit_price;
    });

    return {
      id: cartId,
      items: formattedItems,
      subtotal,
      total: subtotal,
      itemCount: formattedItems.reduce((sum, item) => sum + item.quantity, 0)
    };
  } catch (error) {
    console.error('❌ Error in getCartData:', error);
    throw error;
  }
};
// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
const getCart = async (req, res) => {
  try {
    console.log('📦 Getting cart for user:', req.user.id);
    
    // Get or create cart
    let [carts] = await db.query('SELECT * FROM cart WHERE user_id = ?', [req.user.id]);
    let cart = carts[0];

    if (!cart) {
      console.log('Creating new cart for user:', req.user.id);
      const [result] = await db.query(
        'INSERT INTO cart (user_id, session_id) VALUES (?, ?)',
        [req.user.id, uuidv4()]
      );
      const [newCarts] = await db.query('SELECT * FROM cart WHERE id = ?', [result.insertId]);
      cart = newCarts[0];
    }

    const cartData = await getCartData(cart.id);
    res.json({ success: true, data: cartData });
  } catch (error) {
    console.error('❌ Get cart error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Add to cart
// @route   POST /api/cart/add
// @access  Private
// @desc    Add to cart
// @route   POST /api/cart/add
// @access  Private
// @desc    Add to cart
// @route   POST /api/cart/add
// @access  Private
// @desc    Add to cart
// @route   POST /api/cart/add
// @access  Private
const addToCart = async (req, res) => {
  try {
    const { productName, quantity = 1 } = req.body;

    console.log('🛒 Add to cart request:', { productName, quantity, userId: req.user.id });

    if (!productName) {
      return res.status(400).json({ success: false, message: 'Product name is required' });
    }

    if (quantity < 1) {
      return res.status(400).json({ success: false, message: 'Quantity must be at least 1' });
    }

    // Get or create cart
    let [carts] = await db.query('SELECT * FROM cart WHERE user_id = ?', [req.user.id]);
    let cart = carts[0];

    if (!cart) {
      console.log('Creating new cart for user:', req.user.id);
      const [result] = await db.query(
        'INSERT INTO cart (user_id, session_id) VALUES (?, ?)',
        [req.user.id, uuidv4()]
      );
      const [newCarts] = await db.query('SELECT * FROM cart WHERE id = ?', [result.insertId]);
      cart = newCarts[0];
    }

    let productId;
    let price;

    // Check if this is a custom product (starts with "Custom")
    if (productName.startsWith('Custom')) {
  productId = 36; // Your custom product ID
  price = 1999;
      console.log('🪵 Custom product added with ID:', productId);
    } else {
      // Try to find regular product in database
      const [products] = await db.query(
        'SELECT * FROM products WHERE name = ? AND (is_active = 1 OR is_active IS NULL)', 
        [productName]
      );
      
      if (products.length === 0) {
        console.log('❌ Product not found:', productName);
        return res.status(404).json({ success: false, message: 'Product not found' });
      }
      
      productId = products[0].id;
      price = products[0].price;
      console.log('✅ Regular product found with ID:', productId);
    }

    // Check if item already exists in cart
    const [existing] = await db.query(
      'SELECT * FROM cart_items WHERE cart_id = ? AND product_id = ?',
      [cart.id, productId]
    );

    if (existing.length > 0) {
      // Update quantity
      const newQuantity = existing[0].quantity + quantity;
      await db.query(
        'UPDATE cart_items SET quantity = ? WHERE id = ?',
        [newQuantity, existing[0].id]
      );
      console.log('✅ Updated existing cart item, new quantity:', newQuantity);
    } else {
      // Insert new item
      await db.query(
        'INSERT INTO cart_items (cart_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)',
        [cart.id, productId, quantity, price]
      );
      console.log('✅ Added new item to cart');
    }

    // Get updated cart
    const updatedCart = await getCartData(cart.id);
    
    res.json({
      success: true,
      message: 'Added to cart',
      data: updatedCart
    });
  } catch (error) {
    console.error('❌ Add to cart error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update cart item
// @route   PUT /api/cart/items/:itemId
// @access  Private
const updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const itemId = req.params.itemId;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ success: false, message: 'Invalid quantity' });
    }

    // Verify item belongs to user
    const [items] = await db.query(
      `SELECT ci.* FROM cart_items ci
       JOIN cart c ON ci.cart_id = c.id
       WHERE ci.id = ? AND c.user_id = ?`,
      [itemId, req.user.id]
    );

    if (items.length === 0) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    await db.query('UPDATE cart_items SET quantity = ? WHERE id = ?', [quantity, itemId]);
    console.log('✅ Cart item updated');

    const [carts] = await db.query('SELECT id FROM cart WHERE user_id = ?', [req.user.id]);
    const cartId = carts[0].id;
    const updatedCart = await getCartData(cartId);

    res.json({ success: true, message: 'Cart updated', data: updatedCart });
  } catch (error) {
    console.error('❌ Update cart error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Remove from cart
// @route   DELETE /api/cart/items/:itemId
// @access  Private
const removeFromCart = async (req, res) => {
  try {
    const itemId = req.params.itemId;

    const [items] = await db.query(
      `SELECT ci.id FROM cart_items ci
       JOIN cart c ON ci.cart_id = c.id
       WHERE ci.id = ? AND c.user_id = ?`,
      [itemId, req.user.id]
    );

    if (items.length === 0) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    await db.query('DELETE FROM cart_items WHERE id = ?', [itemId]);
    console.log('✅ Item removed from cart');

    const [carts] = await db.query('SELECT id FROM cart WHERE user_id = ?', [req.user.id]);
    
    if (carts.length === 0) {
      return res.json({
        success: true,
        message: 'Item removed',
        data: { items: [], subtotal: 0, total: 0, itemCount: 0 }
      });
    }

    const cartId = carts[0].id;
    const updatedCart = await getCartData(cartId);

    res.json({ success: true, message: 'Item removed', data: updatedCart });
  } catch (error) {
    console.error('❌ Remove from cart error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
const clearCart = async (req, res) => {
  try {
    const [carts] = await db.query('SELECT id FROM cart WHERE user_id = ?', [req.user.id]);
    
    if (carts.length > 0) {
      await db.query('DELETE FROM cart_items WHERE cart_id = ?', [carts[0].id]);
      console.log('✅ Cart cleared');
    }

    res.json({
      success: true,
      message: 'Cart cleared',
      data: { items: [], subtotal: 0, total: 0, itemCount: 0 }
    });
  } catch (error) {
    console.error('❌ Clear cart error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { 
  getCart, 
  addToCart, 
  updateCartItem, 
  removeFromCart, 
  clearCart 
};