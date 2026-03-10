const db = require('../config/database');

const CartItem = {
  findById: async (id) => {
    const [items] = await db.query('SELECT * FROM cart_items WHERE id = ?', [id]);
    return items[0];
  },

  findByCartAndProduct: async (cartId, productId) => {
    const [items] = await db.query('SELECT * FROM cart_items WHERE cart_id = ? AND product_id = ?', [cartId, productId]);
    return items[0];
  },

  getCartItems: async (cartId) => {
    const [items] = await db.query(
      `SELECT ci.*, p.name, p.price, p.image_url FROM cart_items ci JOIN products p ON ci.product_id = p.id WHERE ci.cart_id = ?`,
      [cartId]
    );
    return items;
  },

  create: async (data) => {
    const { cart_id, product_id, quantity, unit_price, customization_data } = data;
    const [result] = await db.query(
      'INSERT INTO cart_items (cart_id, product_id, quantity, unit_price, customization_data) VALUES (?, ?, ?, ?, ?)',
      [cart_id, product_id, quantity, unit_price, customization_data || null]
    );
    return result.insertId;
  },

  update: async (id, data) => {
    const { quantity, customization_data } = data;
    await db.query('UPDATE cart_items SET quantity = ?, customization_data = ? WHERE id = ?', 
      [quantity, customization_data || null, id]);
  },

  delete: async (id) => {
    await db.query('DELETE FROM cart_items WHERE id = ?', [id]);
  },

  deleteByCart: async (cartId) => {
    await db.query('DELETE FROM cart_items WHERE cart_id = ?', [cartId]);
  }
};

module.exports = CartItem;