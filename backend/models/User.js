const db = require('../config/database');

const User = {
  findByEmail: async (email) => {
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    return users[0];
  },

  findById: async (id) => {
    const [users] = await db.query(
      'SELECT id, email, first_name, last_name, phone, address, city, state, zip_code, country, role, is_active, created_at FROM users WHERE id = ?',
      [id]
    );
    return users[0];
  },

  create: async (userData) => {
    const { email, password, first_name, last_name, phone } = userData;
    const [result] = await db.query(
      'INSERT INTO users (email, password, first_name, last_name, phone, role) VALUES (?, ?, ?, ?, ?, "user")',
      [email, password, first_name, last_name, phone]
    );
    
    const [newUser] = await db.query(
      'SELECT id, email, first_name, last_name, phone, role, created_at FROM users WHERE id = ?',
      [result.insertId]
    );
    return newUser[0];
  },

  update: async (id, userData) => {
    const { first_name, last_name, phone, address, city, state, zip_code, country } = userData;
    await db.query(
      `UPDATE users SET first_name = ?, last_name = ?, phone = ?, address = ?, city = ?, state = ?, zip_code = ?, country = ? WHERE id = ?`,
      [first_name, last_name, phone, address, city, state, zip_code, country, id]
    );
    return User.findById(id);
  },

  updateLastLogin: async (id) => {
    await db.query('UPDATE users SET last_login = NOW() WHERE id = ?', [id]);
  },

  findOrCreateGoogleUser: async (profile) => {
    const [users] = await db.query('SELECT * FROM users WHERE google_id = ? OR email = ?', [profile.id, profile.emails[0].value]);

    if (users.length > 0) {
      const user = users[0];
      if (!user.google_id) {
        await db.query('UPDATE users SET google_id = ? WHERE id = ?', [profile.id, user.id]);
      }
      return user;
    }

    const [result] = await db.query(
      'INSERT INTO users (google_id, email, first_name, last_name, role) VALUES (?, ?, ?, ?, "user")',
      [profile.id, profile.emails[0].value, profile.name.givenName, profile.name.familyName || '']
    );

    const [newUser] = await db.query('SELECT id, email, first_name, last_name, role FROM users WHERE id = ?', [result.insertId]);
    return newUser[0];
  }
};

module.exports = User;