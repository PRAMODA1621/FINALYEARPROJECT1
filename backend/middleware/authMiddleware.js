const jwt = require('jsonwebtoken');
const db = require('../config/database');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const [users] = await db.query(
        'SELECT id, email, first_name, last_name, role, is_active FROM users WHERE id = ?',
        [decoded.id]
      );

      if (users.length === 0) {
        return res.status(401).json({ success: false, message: 'User not found' });
      }

      req.user = users[0];

      if (!req.user.is_active) {
        return res.status(401).json({ success: false, message: 'Account deactivated' });
      }

      next();
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Please login first' });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Admin access required' });
  }
};

module.exports = { protect, admin };