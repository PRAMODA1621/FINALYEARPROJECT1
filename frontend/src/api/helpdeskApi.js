import axiosInstance from './axiosConfig';

const helpdeskApi = {
  // Get FAQs
  getFAQs: async () => {
    const response = await axiosInstance.get('/helpdesk/faqs');
    return response.data;
  },

  // Create support ticket
  createTicket: async (ticketData) => {
    const response = await axiosInstance.post('/helpdesk/tickets', ticketData);
    return response.data;
  },

  // Get user tickets
  getUserTickets: async () => {
    const response = await axiosInstance.get('/helpdesk/tickets');
    return response.data;
  },

  // Get single ticket
  getTicketById: async (id) => {
    const response = await axiosInstance.get(`/helpdesk/tickets/${id}`);
    return response.data;
  },

  // Add response to ticket
  addResponse: async (ticketId, message) => {
    const response = await axiosInstance.post(`/helpdesk/tickets/${ticketId}/responses`, { message });
    return response.data;
  },

  // Close ticket
  closeTicket: async (ticketId) => {
    const response = await axiosInstance.put(`/helpdesk/tickets/${ticketId}/close`);
    return response.data;
  }
};

export default helpdeskApi;