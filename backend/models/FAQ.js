const db = require('../config/database');

const FAQ = {
  findAll: async () => {
    const [faqs] = await db.query('SELECT * FROM faqs WHERE is_active = true ORDER BY display_order ASC, category ASC');
    return faqs;
  },

  findById: async (id) => {
    const [faqs] = await db.query('SELECT * FROM faqs WHERE id = ?', [id]);
    return faqs[0];
  },

  findByCategory: async (category) => {
    const [faqs] = await db.query('SELECT * FROM faqs WHERE category = ? AND is_active = true ORDER BY display_order ASC', [category]);
    return faqs;
  },

  create: async (faqData) => {
    const { question, answer, category, display_order } = faqData;
    const [result] = await db.query(
      'INSERT INTO faqs (question, answer, category, display_order) VALUES (?, ?, ?, ?)',
      [question, answer, category, display_order || 0]
    );
    return result.insertId;
  },

  update: async (id, faqData) => {
    const { question, answer, category, display_order, is_active } = faqData;
    await db.query(
      'UPDATE faqs SET question = ?, answer = ?, category = ?, display_order = ?, is_active = ? WHERE id = ?',
      [question, answer, category, display_order, is_active, id]
    );
  },

  delete: async (id) => {
    await db.query('DELETE FROM faqs WHERE id = ?', [id]);
  }
};

module.exports = FAQ;