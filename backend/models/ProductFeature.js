const db = require('../config/database');

const ProductFeature = {
  findByProduct: async (productId) => {
    const [features] = await db.query('SELECT feature FROM product_features WHERE product_id = ? ORDER BY display_order', [productId]);
    return features;
  },

  create: async (featureData) => {
    const { product_id, feature, display_order } = featureData;
    const [result] = await db.query(
      'INSERT INTO product_features (product_id, feature, display_order) VALUES (?, ?, ?)',
      [product_id, feature, display_order || 0]
    );
    return result.insertId;
  },

  update: async (id, featureData) => {
    const { feature, display_order } = featureData;
    await db.query('UPDATE product_features SET feature = ?, display_order = ? WHERE id = ?', [feature, display_order, id]);
  },

  delete: async (id) => {
    await db.query('DELETE FROM product_features WHERE id = ?', [id]);
  },

  deleteByProduct: async (productId) => {
    await db.query('DELETE FROM product_features WHERE product_id = ?', [productId]);
  }
};

module.exports = ProductFeature;