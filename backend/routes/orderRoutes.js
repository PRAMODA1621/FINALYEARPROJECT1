const express = require('express');
const router = express.Router();
const { 
  createOrder, 
  getUserOrders, 
  getOrderById 
} = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

// All order routes require authentication
router.use(protect);

router.post('/', createOrder);
router.get('/', getUserOrders);
router.get('/:id', getOrderById);

module.exports = router;