const db = require('../config/database');
const bcrypt = require('bcryptjs');

// @desc    Get dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
  try {
    // Get user count
    const [[userCount]] = await db.query('SELECT COUNT(*) as count FROM users WHERE role = "user"');
    
    // Get product count
    const [[productCount]] = await db.query('SELECT COUNT(*) as count FROM products WHERE is_active = 1');
    
    // Get order count - FIXED: Count ALL orders
    const [[orderCount]] = await db.query('SELECT COUNT(*) as count FROM orders');
    
    // FIXED: Calculate total revenue from ALL completed orders
    const [[revenue]] = await db.query(
      `SELECT COALESCE(SUM(total_amount), 0) as total 
       FROM orders 
       WHERE order_status IN ('delivered', 'completed', 'shipped') 
          OR payment_status = 'completed'`
    );

    // Get recent orders with user details
    const [recentOrders] = await db.query(
      `SELECT o.*, 
              u.first_name, 
              u.last_name, 
              u.email 
       FROM orders o
       LEFT JOIN users u ON o.user_id = u.id
       ORDER BY o.created_at DESC
       LIMIT 5`
    );

    // Get order statistics by status
    const [orderStats] = await db.query(
      `SELECT 
          order_status,
          COUNT(*) as count,
          COALESCE(SUM(total_amount), 0) as total
       FROM orders 
       GROUP BY order_status`
    );

    // Get monthly revenue for the last 6 months
    const [monthlyRevenue] = await db.query(
      `SELECT 
          DATE_FORMAT(created_at, '%Y-%m') as month,
          COUNT(*) as order_count,
          COALESCE(SUM(total_amount), 0) as revenue
       FROM orders 
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
          AND (order_status IN ('delivered', 'completed', 'shipped') 
               OR payment_status = 'completed')
       GROUP BY DATE_FORMAT(created_at, '%Y-%m')
       ORDER BY month DESC`
    );

    res.json({
      success: true,
      data: {
        totalUsers: userCount.count || 0,
        totalProducts: productCount.count || 0,
        totalOrders: orderCount.count || 0,
        totalRevenue: revenue.total || 0,
        recentOrders: recentOrders || [],
        orderStats: orderStats || [],
        monthlyRevenue: monthlyRevenue || []
      }
    });
  } catch (error) {
    console.error('❌ Dashboard stats error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message 
    });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = async (req, res) => {
  try {
    const [users] = await db.query(
      `SELECT id, 
              email, 
              first_name, 
              last_name, 
              phone, 
              role, 
              is_active, 
              created_at,
              last_login 
       FROM users 
       ORDER BY created_at DESC`
    );
    res.json({ success: true, data: users });
  } catch (error) {
    console.error('❌ Get users error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
const updateUser = async (req, res) => {
  try {
    const { first_name, last_name, phone, role, is_active } = req.body;
    
    await db.query(
      `UPDATE users 
       SET first_name = ?, 
           last_name = ?, 
           phone = ?, 
           role = ?, 
           is_active = ? 
       WHERE id = ?`,
      [first_name, last_name, phone, role, is_active, req.params.id]
    );

    const [users] = await db.query(
      `SELECT id, 
              email, 
              first_name, 
              last_name, 
              phone, 
              role, 
              is_active 
       FROM users 
       WHERE id = ?`,
      [req.params.id]
    );

    res.json({ success: true, data: users[0] });
  } catch (error) {
    console.error('❌ Update user error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    // First delete user's orders, cart, wishlist etc due to foreign key constraints
    await db.query('DELETE FROM orders WHERE user_id = ?', [req.params.id]);
    await db.query('DELETE FROM cart WHERE user_id = ?', [req.params.id]);
    await db.query('DELETE FROM wishlist WHERE user_id = ?', [req.params.id]);
    
    // Then delete the user
    await db.query('DELETE FROM users WHERE id = ?', [req.params.id]);
    
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('❌ Delete user error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get all orders
// @route   GET /api/admin/orders
// @access  Private/Admin
const getOrders = async (req, res) => {
  try {
    const [orders] = await db.query(
      `SELECT o.*, 
              u.email, 
              u.first_name, 
              u.last_name 
       FROM orders o
       LEFT JOIN users u ON o.user_id = u.id
       ORDER BY o.created_at DESC`
    );
    res.json({ success: true, data: orders });
  } catch (error) {
    console.error('❌ Get orders error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update order status
// @route   PUT /api/admin/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required' });
    }

    await db.query(
      'UPDATE orders SET order_status = ? WHERE id = ?', 
      [status, req.params.id]
    );
    
    res.json({ success: true, message: 'Order status updated successfully' });
  } catch (error) {
    console.error('❌ Update order error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get all products (admin)
// @route   GET /api/admin/products
// @access  Private/Admin
const getProducts = async (req, res) => {
  try {
    const [products] = await db.query(
      `SELECT * FROM products 
       WHERE (is_custom IS NULL OR is_custom = 0)
       ORDER BY created_at DESC`
    );
    res.json({ success: true, data: products });
  } catch (error) {
    console.error('❌ Get products error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Create product (admin)
// @route   POST /api/admin/products
// @access  Private/Admin
const createProduct = async (req, res) => {
  try {
    const { name, description, category, price, stock, image_url, is_featured } = req.body;

    if (!name || !category || !price) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields (name, category, price)' 
      });
    }

    const [result] = await db.query(
      `INSERT INTO products 
       (name, description, category, price, stock, image_url, is_featured, is_active) 
       VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
      [name, description || '', category, price, stock || 0, image_url || '', is_featured ? 1 : 0]
    );

    const [newProduct] = await db.query('SELECT * FROM products WHERE id = ?', [result.insertId]);

    res.status(201).json({ success: true, data: newProduct[0] });
  } catch (error) {
    console.error('❌ Create product error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update product (admin)
// @route   PUT /api/admin/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
  try {
    const { name, description, category, price, stock, image_url, is_featured, is_active } = req.body;

    await db.query(
      `UPDATE products 
       SET name = ?, 
           description = ?, 
           category = ?, 
           price = ?, 
           stock = ?, 
           image_url = ?, 
           is_featured = ?, 
           is_active = ?
       WHERE id = ?`,
      [name, description, category, price, stock, image_url, is_featured ? 1 : 0, is_active ? 1 : 0, req.params.id]
    );

    const [updatedProduct] = await db.query('SELECT * FROM products WHERE id = ?', [req.params.id]);

    res.json({ success: true, data: updatedProduct[0] });
  } catch (error) {
    console.error('❌ Update product error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Delete product (admin)
// @route   DELETE /api/admin/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
  try {
    // Soft delete - set is_active to 0
    await db.query('UPDATE products SET is_active = 0 WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    console.error('❌ Delete product error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { 
  getDashboardStats, 
  getUsers, 
  updateUser, 
  deleteUser, 
  getOrders, 
  updateOrderStatus,
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct
};