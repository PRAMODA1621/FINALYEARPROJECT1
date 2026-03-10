const db = require('../config/database');

const ProductImage = {
  findByProduct: async (productId) => {
    const [images] = await db.query('SELECT image_url, is_primary FROM product_images WHERE product_id = ? ORDER BY display_order', [productId]);
    return images;
  },

  create: async (imageData) => {
    const { product_id, image_url, is_primary, display_order } = imageData;
    const [result] = await db.query(
      'INSERT INTO product_images (product_id, image_url, is_primary, display_order) VALUES (?, ?, ?, ?)',
      [product_id, image_url, is_primary || false, display_order || 0]
    );
    return result.insertId;
  },

  setPrimary: async (id) => {
    await db.query('UPDATE product_images SET is_primary = true WHERE id = ?', [id]);
  },

  delete: async (id) => {
    await db.query('DELETE FROM product_images WHERE id = ?', [id]);
  },

  deleteByProduct: async (productId) => {
    await db.query('DELETE FROM product_images WHERE product_id = ?', [productId]);
  }
};

module.exports = ProductImage;