const db = require('../config/database');

const Wishlist = {
  findByUser: async (userId) => {
    const [items] = await db.query(
      `SELECT w.*, p.name, p.price, p.image_url, p.category FROM wishlist w 
       JOIN products p ON w.product_id = p.id 
       WHERE w.user_id = ? AND p.is_active = true 
       ORDER BY w.created_at DESC`,
      [userId]
    );
    return items;
  },

  add: async (userId, productId) => {
    const [result] = await db.query('INSERT INTO wishlist (user_id, product_id) VALUES (?, ?)', [userId, productId]);
    return result.insertId;
  },

  remove: async (id) => {
    await db.query('DELETE FROM wishlist WHERE id = ?', [id]);
  },

  clear: async (userId) => {
    await db.query('DELETE FROM wishlist WHERE user_id = ?', [userId]);
  },

  check: async (userId, productId) => {
    const [items] = await db.query('SELECT id FROM wishlist WHERE user_id = ? AND product_id = ?', [userId, productId]);
    return items[0];
  },

  getCount: async (userId) => {
    const [result] = await db.query('SELECT COUNT(*) as count FROM wishlist WHERE user_id = ?', [userId]);
    return result[0].count;
  }
};

module.exports = Wishlist;