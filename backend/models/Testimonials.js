const db = require('../config/database');

const Testimonial = {
  // Get all active testimonials
  findAll: async (limit = 10) => {
    const [testimonials] = await db.query(
      'SELECT * FROM testimonials WHERE is_active = true ORDER BY created_at DESC LIMIT ?',
      [limit]
    );
    return testimonials;
  },

  // Find by ID
  findById: async (id) => {
    const [testimonials] = await db.query(
      'SELECT * FROM testimonials WHERE id = ?',
      [id]
    );
    return testimonials[0];
  },

  // Create testimonial (admin)
  create: async (data) => {
    const { customer_name, customer_location, content, rating, image_url } = data;
    const [result] = await db.query(
      `INSERT INTO testimonials (customer_name, customer_location, content, rating, image_url) 
       VALUES (?, ?, ?, ?, ?)`,
      [customer_name, customer_location, content, rating, image_url]
    );
    return result.insertId;
  },

  // Update testimonial (admin)
  update: async (id, data) => {
    const { customer_name, customer_location, content, rating, image_url, is_active } = data;
    await db.query(
      `UPDATE testimonials 
       SET customer_name = ?, customer_location = ?, content = ?, rating = ?, image_url = ?, is_active = ?
       WHERE id = ?`,
      [customer_name, customer_location, content, rating, image_url, is_active, id]
    );
  },

  // Delete testimonial (admin)
  delete: async (id) => {
    await db.query('DELETE FROM testimonials WHERE id = ?', [id]);
  }
};

module.exports = Testimonial;