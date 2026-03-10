const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const HelpdeskTicket = {
  create: async (ticketData) => {
    const ticket_number = `TKT-${Date.now()}-${uuidv4().slice(0, 6)}`;
    const { user_id, subject, message, category, priority } = ticketData;
    
    const [result] = await db.query(
      'INSERT INTO helpdesk_tickets (ticket_number, user_id, subject, message, category, priority) VALUES (?, ?, ?, ?, ?, ?)',
      [ticket_number, user_id, subject, message, category, priority || 'medium']
    );
    return result.insertId;
  },

  findByUser: async (userId) => {
    const [tickets] = await db.query('SELECT * FROM helpdesk_tickets WHERE user_id = ? ORDER BY created_at DESC', [userId]);
    return tickets;
  },

  findById: async (id) => {
    const [tickets] = await db.query('SELECT * FROM helpdesk_tickets WHERE id = ?', [id]);
    return tickets[0];
  },

  findByTicketNumber: async (ticketNumber) => {
    const [tickets] = await db.query('SELECT * FROM helpdesk_tickets WHERE ticket_number = ?', [ticketNumber]);
    return tickets[0];
  },

  updateStatus: async (id, status) => {
    await db.query('UPDATE helpdesk_tickets SET status = ? WHERE id = ?', [status, id]);
  },

  updatePriority: async (id, priority) => {
    await db.query('UPDATE helpdesk_tickets SET priority = ? WHERE id = ?', [priority, id]);
  },

  assignTo: async (id, staffId) => {
    await db.query('UPDATE helpdesk_tickets SET assigned_to = ? WHERE id = ?', [staffId, id]);
  },

  getAll: async (filters = {}) => {
    let query = 'SELECT * FROM helpdesk_tickets';
    const params = [];

    if (filters.status) {
      query += ' WHERE status = ?';
      params.push(filters.status);
    }

    if (filters.priority) {
      if (params.length === 0) {
        query += ' WHERE priority = ?';
      } else {
        query += ' AND priority = ?';
      }
      params.push(filters.priority);
    }

    query += ' ORDER BY created_at DESC';

    if (filters.limit) {
      query += ' LIMIT ?';
      params.push(filters.limit);
    }

    const [tickets] = await db.query(query, params);
    return tickets;
  },

  getOpenCount: async () => {
    const [result] = await db.query('SELECT COUNT(*) as count FROM helpdesk_tickets WHERE status IN ("open", "in_progress")');
    return result[0].count;
  }
};

module.exports = HelpdeskTicket;