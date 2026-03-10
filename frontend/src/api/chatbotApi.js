import axios from 'axios';

const CHATBOT_URL = import.meta.env.VITE_CHATBOT_URL || 'http://localhost:8000/api';

const chatbotApi = {
  // Send message to chatbot
  sendMessage: async (message, sessionId = null) => {
    const response = await axios.post(`${CHATBOT_URL}/chat`, {
      message,
      session_id: sessionId
    });
    return response.data;
  },

  // Reset chat session
  resetChat: async (sessionId) => {
    const response = await axios.post(`${CHATBOT_URL}/chat/reset?session_id=${sessionId || 'default'}`);
    return response.data;
  },

  // Get session state
  getSessionState: async (sessionId) => {
    const response = await axios.get(`${CHATBOT_URL}/chat/state/${sessionId || 'default'}`);
    return response.data;
  }
};

export default chatbotApi;