const db = require('../config/database');
const bcrypt = require('bcryptjs');

// @desc    Get profile
// @route   GET /api/users/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    const [users] = await db.query(
      'SELECT id, email, first_name, last_name, phone, address, city, state, zip_code, country, role, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    res.json({ success: true, data: users[0] });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, phone, address, city, state, zipCode, country } = req.body;
    
    await db.query(
      `UPDATE users 
       SET first_name = ?, last_name = ?, phone = ?, address = ?, city = ?, state = ?, zip_code = ?, country = ?
       WHERE id = ?`,
      [firstName, lastName, phone, address, city, state, zipCode, country, req.user.id]
    );

    const [users] = await db.query(
      'SELECT id, email, first_name, last_name, phone, address, city, state, zip_code, country, role FROM users WHERE id = ?',
      [req.user.id]
    );

    res.json({ success: true, data: users[0] });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Change password
// @route   PUT /api/users/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const [users] = await db.query('SELECT password FROM users WHERE id = ?', [req.user.id]);
    const user = users[0];

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, req.user.id]);
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getProfile, updateProfile, changePassword };