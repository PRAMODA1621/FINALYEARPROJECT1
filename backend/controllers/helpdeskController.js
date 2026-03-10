const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

// @desc    Create support ticket
// @route   POST /api/helpdesk/tickets
// @access  Private
const createTicket = async (req, res) => {
  try {
    const { subject, message, category, priority = 'medium' } = req.body;

    if (!subject || !message) {
      return res.status(400).json({ success: false, message: 'Subject and message are required' });
    }

    const ticketNumber = `TKT-${Date.now()}-${uuidv4().slice(0, 4)}`;

    const [result] = await db.query(
      `INSERT INTO helpdesk_tickets (ticket_number, user_id, subject, message, category, priority, status)
       VALUES (?, ?, ?, ?, ?, ?, 'open')`,
      [ticketNumber, req.user.id, subject, message, category, priority]
    );

    const [ticket] = await db.query('SELECT * FROM helpdesk_tickets WHERE id = ?', [result.insertId]);

    res.status(201).json({ success: true, data: ticket[0] });
  } catch (error) {
    console.error('Create ticket error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get user tickets
// @route   GET /api/helpdesk/tickets
// @access  Private
const getUserTickets = async (req, res) => {
  try {
    const [tickets] = await db.query(
      'SELECT * FROM helpdesk_tickets WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json({ success: true, data: tickets });
  } catch (error) {
    console.error('Get tickets error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get single ticket by ID
// @route   GET /api/helpdesk/tickets/:id
// @access  Private
const getTicketById = async (req, res) => {
  try {
    const [tickets] = await db.query(
      'SELECT * FROM helpdesk_tickets WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (tickets.length === 0) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    res.json({ success: true, data: tickets[0] });
  } catch (error) {
    console.error('Get ticket by id error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get all tickets (Admin only)
// @route   GET /api/admin/helpdesk/tickets
// @access  Private/Admin
const getAllTickets = async (req, res) => {
  try {
    const [tickets] = await db.query(
      `SELECT t.*, u.first_name, u.last_name, u.email 
       FROM helpdesk_tickets t
       JOIN users u ON t.user_id = u.id
       ORDER BY t.created_at DESC`
    );
    res.json({ success: true, data: tickets });
  } catch (error) {
    console.error('Get all tickets error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Reply to ticket (Admin only)
// @route   POST /api/admin/helpdesk/tickets/:id/reply
// @access  Private/Admin
const replyToTicket = async (req, res) => {
  try {
    const { message } = req.body;
    const ticketId = req.params.id;

    if (!message) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    // Check if ticket exists
    const [tickets] = await db.query('SELECT * FROM helpdesk_tickets WHERE id = ?', [ticketId]);
    if (tickets.length === 0) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    // Add response
    await db.query(
      'INSERT INTO ticket_responses (ticket_id, user_id, message, is_staff_response) VALUES (?, ?, ?, 1)',
      [ticketId, req.user.id, message]
    );

    // Update ticket status to in_progress
    await db.query(
      'UPDATE helpdesk_tickets SET status = "in_progress" WHERE id = ?',
      [ticketId]
    );

    res.json({ success: true, message: 'Reply sent' });
  } catch (error) {
    console.error('Reply to ticket error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update ticket status (Admin only)
// @route   PUT /api/admin/helpdesk/tickets/:id/status
// @access  Private/Admin
const updateTicketStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const ticketId = req.params.id;

    const validStatuses = ['open', 'in_progress', 'resolved', 'closed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const [tickets] = await db.query('SELECT * FROM helpdesk_tickets WHERE id = ?', [ticketId]);
    if (tickets.length === 0) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    await db.query(
      'UPDATE helpdesk_tickets SET status = ? WHERE id = ?',
      [status, ticketId]
    );

    res.json({ success: true, message: 'Ticket status updated' });
  } catch (error) {
    console.error('Update ticket status error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get ticket responses
// @route   GET /api/helpdesk/tickets/:id/responses
// @access  Private
const getTicketResponses = async (req, res) => {
  try {
    const ticketId = req.params.id;

    // Check if ticket belongs to user or user is admin
    const [tickets] = await db.query(
      'SELECT * FROM helpdesk_tickets WHERE id = ? AND (user_id = ? OR ? IN (SELECT id FROM users WHERE role = "admin"))',
      [ticketId, req.user.id, req.user.id]
    );

    if (tickets.length === 0) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    const [responses] = await db.query(
      `SELECT r.*, u.first_name, u.last_name, u.role 
       FROM ticket_responses r
       JOIN users u ON r.user_id = u.id
       WHERE r.ticket_id = ?
       ORDER BY r.created_at ASC`,
      [ticketId]
    );

    res.json({ success: true, data: responses });
  } catch (error) {
    console.error('Get ticket responses error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  createTicket,
  getUserTickets,
  getTicketById,
  getAllTickets,
  replyToTicket,
  updateTicketStatus,
  getTicketResponses
};