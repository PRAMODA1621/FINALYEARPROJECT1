import axios from 'axios';

const API_URL = "/api";
const authApi = {
  // Register new user
  register: async (userData) => {
    try {
      console.log('📡 Register API call:', userData.email);
      const response = await axios.post(`${API_URL}/auth/register`, {
        email: userData.email,
        password: userData.password,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone || ''
      });
      
      console.log('📦 Register API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Register API error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Login user
  login: async (credentials) => {
    try {
      console.log('📡 Login API call:', credentials.email);
      const response = await axios.post(`${API_URL}/auth/login`, {
        email: credentials.email,
        password: credentials.password
      });
      
      console.log('📦 Login API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Login API error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get current user
  getCurrentUser: async (token) => {
    try {
      const response = await axios.get(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('❌ Get current user error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Logout (client-side only)
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

export default authApi;