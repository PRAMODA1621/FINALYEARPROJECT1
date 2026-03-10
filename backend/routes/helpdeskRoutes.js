const express = require('express');
const router = express.Router();
const {
  createTicket,
  getUserTickets,
  getTicketById,
  getTicketResponses
} = require('../controllers/helpdeskController');
const { protect } = require('../middleware/authMiddleware');

// All helpdesk routes require authentication
router.use(protect);

// User routes
router.post('/tickets', createTicket);
router.get('/tickets', getUserTickets);
router.get('/tickets/:id', getTicketById);
router.get('/tickets/:id/responses', getTicketResponses);

module.exports = router;