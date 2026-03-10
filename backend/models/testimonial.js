const db = require('../config/database');

const Testimonial = {
  findAll: async (limit = 10) => {
    const [testimonials] = await db.query('SELECT * FROM testimonials WHERE is_active = true ORDER BY created_at DESC LIMIT ?', [limit]);
    return testimonials;
  },

  findById: async (id) => {
    const [testimonials] = await db.query('SELECT * FROM testimonials WHERE id = ?', [id]);
    return testimonials[0];
  }
};

module.exports = Testimonial;
