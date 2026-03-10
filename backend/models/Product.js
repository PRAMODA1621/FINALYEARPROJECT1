const db = require('../config/database');

const Product = {
  // Find all products with pagination
  findAll: async (options = {}) => {
    let query = 'SELECT * FROM products WHERE is_active = true';
    const params = [];

    if (options.category) {
      query += ' AND category = ?';
      params.push(options.category);
    }

    if (options.minPrice) {
      query += ' AND price >= ?';
      params.push(options.minPrice);
    }

    if (options.maxPrice) {
      query += ' AND price <= ?';
      params.push(options.maxPrice);
    }

    if (options.search) {
      query += ' AND (name LIKE ? OR description LIKE ?)';
      const searchTerm = `%${options.search}%`;
      params.push(searchTerm, searchTerm);
    }

    query += ` ORDER BY ${options.sort || 'created_at'} ${options.order || 'DESC'}`;

    if (options.limit) {
      query += ' LIMIT ?';
      params.push(options.limit);
    }

    if (options.offset) {
      query += ' OFFSET ?';
      params.push(options.offset);
    }

    const [products] = await db.query(query, params);
    return products;
  },

  // Find product by ID
  findById: async (id) => {
    const [products] = await db.query(
      'SELECT * FROM products WHERE id = ? AND is_active = true',
      [id]
    );
    return products[0];
  },

  // Get featured products
  findFeatured: async (limit = 8) => {
    const [products] = await db.query(
      'SELECT * FROM products WHERE is_featured = true AND is_active = true ORDER BY created_at DESC LIMIT ?',
      [limit]
    );
    return products;
  },

  // Get top selling products
  findTopSelling: async (limit = 8) => {
    const [products] = await db.query(
      'SELECT * FROM products WHERE is_active = true ORDER BY stock DESC LIMIT ?',
      [limit]
    );
    return products;
  },

  // Get distinct categories
  getCategories: async () => {
    const [categories] = await db.query(
      'SELECT DISTINCT category FROM products WHERE is_active = true ORDER BY category'
    );
    return categories.map(c => c.category);
  },

  // Create product (admin)
  create: async (productData) => {
    const { name, description, category, price, stock, image_url, is_featured } = productData;
    const [result] = await db.query(
      `INSERT INTO products (name, description, category, price, stock, image_url, is_featured) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, description, category, price, stock, image_url, is_featured || false]
    );
    return result.insertId;
  },

  // Update product (admin)
  update: async (id, productData) => {
    const { name, description, category, price, stock, image_url, is_featured, is_active } = productData;
    await db.query(
      `UPDATE products 
       SET name = ?, description = ?, category = ?, price = ?, stock = ?, image_url = ?, is_featured = ?, is_active = ?
       WHERE id = ?`,
      [name, description, category, price, stock, image_url, is_featured, is_active, id]
    );
  },

  // Soft delete product (admin)
  delete: async (id) => {
    await db.query(
      'UPDATE products SET is_active = false WHERE id = ?',
      [id]
    );
  }
};

module.exports = Product;