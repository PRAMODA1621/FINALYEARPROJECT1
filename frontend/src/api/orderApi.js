import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const orderApi = {
  // Create new order
  createOrder: async (orderData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/orders`, orderData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Create order error:', error);
      throw error;
    }
  },

  // Get user orders
  getUserOrders: async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Get orders error:', error);
      return { success: false, data: [] };
    }
  },

  // Get single order
  getOrderById: async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Get order error:', error);
      throw error;
    }
  }
};

export default orderApi;