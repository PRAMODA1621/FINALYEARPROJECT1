const db = require('../config/database');

const OrderItem = {
  create: async (orderId, items) => {
    for (const item of items) {
      await db.query(
        'INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price, customization_data) VALUES (?, ?, ?, ?, ?, ?)',
        [orderId, item.product_id, item.product_name, item.quantity, item.unit_price, item.customization_data || null]
      );
    }
  },

  findByOrder: async (orderId) => {
    const [items] = await db.query('SELECT * FROM order_items WHERE order_id = ?', [orderId]);
    return items;
  }
};

module.exports = OrderItem;