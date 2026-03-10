const db = require('../config/database');

const CustomizationOption = {
  findByProduct: async (productId) => {
    const [options] = await db.query('SELECT * FROM customization_options WHERE product_id = ?', [productId]);
    return options;
  },

  create: async (optionData) => {
    const { product_id, option_type, option_name, option_values, additional_price, is_required } = optionData;
    const [result] = await db.query(
      'INSERT INTO customization_options (product_id, option_type, option_name, option_values, additional_price, is_required) VALUES (?, ?, ?, ?, ?, ?)',
      [product_id, option_type, option_name, JSON.stringify(option_values), additional_price || 0, is_required || false]
    );
    return result.insertId;
  },

  update: async (id, optionData) => {
    const { option_type, option_name, option_values, additional_price, is_required } = optionData;
    await db.query(
      'UPDATE customization_options SET option_type = ?, option_name = ?, option_values = ?, additional_price = ?, is_required = ? WHERE id = ?',
      [option_type, option_name, JSON.stringify(option_values), additional_price, is_required, id]
    );
  },

  delete: async (id) => {
    await db.query('DELETE FROM customization_options WHERE id = ?', [id]);
  },

  deleteByProduct: async (productId) => {
    await db.query('DELETE FROM customization_options WHERE product_id = ?', [productId]);
  }
};

module.exports = CustomizationOption;