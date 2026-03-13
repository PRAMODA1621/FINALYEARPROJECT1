const express = require('express');
const router = express.Router();
const { 
  getDashboardStats, 
  getUsers, 
  updateUser, 
  deleteUser, 
  getOrders, 
  updateOrderStatus,
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/adminController');
const {
  getAllTickets,
  replyToTicket,
  updateTicketStatus
} = require('../controllers/helpdeskController');
const { protect, admin } = require('../middleware/authMiddleware');
const { getAllTickets } = require('../controllers/helpdeskController');
// All admin routes require authentication and admin role
const { updateTicketStatus } = require('../controllers/helpdeskController');
router.use(protect, admin);

// Dashboard
router.get('/dashboard', getDashboardStats);

// User management
router.get('/users', getUsers);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// Order management
router.get('/orders', getOrders);
router.put('/orders/:id/status', updateOrderStatus);

// Product management
router.get('/products', getProducts);
router.post('/products', createProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);

// Helpdesk management (admin only)
router.get('/helpdesk/tickets', getAllTickets);
router.post('/helpdesk/tickets/:id/reply', replyToTicket);
router.put('/helpdesk/tickets/:id/status', updateTicketStatus);
router.get('/helpdesk/tickets', getAllTickets);
router.put('/helpdesk/tickets/:id/status', updateTicketStatus);
module.exports = router;