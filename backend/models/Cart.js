const db = require('../config/database');

const Cart = {
  // Find cart by user ID
  findByUser: async (userId) => {
    const [carts] = await db.query(
      'SELECT * FROM cart WHERE user_id = ?',
      [userId]
    );
    return carts[0];
  },

  // Create cart for user
  create: async (userId, sessionId) => {
    const [result] = await db.query(
      'INSERT INTO cart (user_id, session_id) VALUES (?, ?)',
      [userId, sessionId]
    );
    
    const [newCart] = await db.query(
      'SELECT * FROM cart WHERE id = ?',
      [result.insertId]
    );
    return newCart[0];
  },

  // Get cart with items
  getCartWithItems: async (cartId) => {
    const [cart] = await db.query(
      'SELECT * FROM cart WHERE id = ?',
      [cartId]
    );

    if (!cart[0]) return null;

    const [items] = await db.query(
      `SELECT ci.*, p.name, p.image_url, p.stock 
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       WHERE ci.cart_id = ?`,
      [cartId]
    );

    return {
      ...cart[0],
      items
    };
  },

  // Clear cart
  clearCart: async (cartId) => {
    await db.query('DELETE FROM cart_items WHERE cart_id = ?', [cartId]);
  },

  // Delete cart
  delete: async (cartId) => {
    await db.query('DELETE FROM cart WHERE id = ?', [cartId]);
  }
};

module.exports = Cart;