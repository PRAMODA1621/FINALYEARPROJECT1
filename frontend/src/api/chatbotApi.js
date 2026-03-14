import axios from 'axios';

const CHATBOT_URL = import.meta.env.VITE_CHATBOT_URL || "https://finalyearproject1-1.onrender.com";

// Create axios instance with defaults
const apiClient = axios.create({
  baseURL: CHATBOT_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // You can add auth tokens here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.code === 'ECONNABORTED') {
      console.log('Request timeout');
    }
    return Promise.reject(error);
  }
);

const chatbotApi = {
  sendMessage: async (message, sessionId = null) => {
    try {
      const response = await apiClient.post('/api/chat', {
        message,
        session_id: sessionId
      });
      
      return response.data;
      
    } catch (error) {
      console.error('Chatbot API error:', error);
      
      // Return fallback response for better UX
      if (error.code === 'ECONNABORTED') {
        return {
          message: "⏳ The service is waking up. Please try again.",
          options: ["Try Again", "Browse Products", "Contact Support"],
          products: [],
          type: "error"
        };
      }
      
      throw error;
    }
  }
};

export default chatbotApi;