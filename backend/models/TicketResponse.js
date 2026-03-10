const db = require('../config/database');

const TicketResponse = {
  create: async (responseData) => {
    const { ticket_id, user_id, message, is_staff_response } = responseData;
    const [result] = await db.query(
      'INSERT INTO ticket_responses (ticket_id, user_id, message, is_staff_response) VALUES (?, ?, ?, ?)',
      [ticket_id, user_id, message, is_staff_response || false]
    );
    return result.insertId;
  },

  findByTicket: async (ticketId) => {
    const [responses] = await db.query(
      `SELECT tr.*, u.first_name, u.last_name, u.email, u.role 
       FROM ticket_responses tr 
       JOIN users u ON tr.user_id = u.id 
       WHERE tr.ticket_id = ? 
       ORDER BY tr.created_at ASC`,
      [ticketId]
    );
    return responses;
  }
};

module.exports = TicketResponse;