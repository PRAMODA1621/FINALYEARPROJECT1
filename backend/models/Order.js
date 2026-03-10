const db = require('../config/database');

const Order = {
  create: async (orderData) => {
    const { order_number, user_id, total_amount, subtotal, tax_amount, shipping_amount, discount_amount, payment_method, shipping_address, phone, email, notes } = orderData;
    
    const [result] = await db.query(
      `INSERT INTO orders (order_number, user_id, total_amount, subtotal, tax_amount, shipping_amount, discount_amount, payment_method, shipping_address, phone, email, notes) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [order_number, user_id, total_amount, subtotal, tax_amount || 0, shipping_amount || 0, discount_amount || 0, payment_method, shipping_address, phone, email, notes]
    );
    return result.insertId;
  },

  findByUser: async (userId) => {
    const [orders] = await db.query('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC', [userId]);
    return orders;
  },

  findById: async (id) => {
    const [orders] = await db.query('SELECT * FROM orders WHERE id = ?', [id]);
    return orders[0];
  },

  findByOrderNumber: async (orderNumber) => {
    const [orders] = await db.query('SELECT * FROM orders WHERE order_number = ?', [orderNumber]);
    return orders[0];
  },

  updateStatus: async (id, status) => {
    await db.query('UPDATE orders SET order_status = ? WHERE id = ?', [status, id]);
  },

  updatePaymentStatus: async (id, status) => {
    await db.query('UPDATE orders SET payment_status = ? WHERE id = ?', [status, id]);
  },

  getAll: async (limit = 50, offset = 0) => {
    const [orders] = await db.query('SELECT * FROM orders ORDER BY created_at DESC LIMIT ? OFFSET ?', [limit, offset]);
    return orders;
  },

  getCount: async () => {
    const [result] = await db.query('SELECT COUNT(*) as count FROM orders');
    return result[0].count;
  },

  getTotalRevenue: async () => {
    const [result] = await db.query('SELECT SUM(total_amount) as total FROM orders WHERE payment_status = "completed"');
    return result[0].total || 0;
  }
};

module.exports = Order;