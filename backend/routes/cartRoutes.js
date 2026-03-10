const express = require('express');
const router = express.Router();
const { 
  getCart, 
  addToCart, 
  updateCartItem, 
  removeFromCart,
  clearCart 
} = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');

console.log('✅ Cart routes loaded'); // Add this to verify

// ALL cart routes require authentication
router.use(protect);

// GET /api/cart - Get user cart
router.get('/', (req, res, next) => {
  console.log('📦 GET /api/cart called');
  next();
}, getCart);

// DELETE /api/cart - Clear entire cart
router.delete('/', clearCart);

// POST /api/cart/add - Add item to cart (frontend uses this)
router.post('/add', (req, res, next) => {
  console.log('➕ POST /api/cart/add called');
  next();
}, addToCart);

// POST /api/cart/items - Add item to cart (backward compatibility)
router.post('/items', addToCart);

// PUT /api/cart/items/:itemId - Update cart item quantity
router.put('/items/:itemId', updateCartItem);

// DELETE /api/cart/items/:itemId - Remove item from cart
router.delete('/items/:itemId', removeFromCart);

module.exports = router;