import axios from "axios";

const API_BASE =
  import.meta.env.VITE_API_URL ||
  "https://finalyearproject1-pvex.onrender.com/api";

const chatbotApi = {

  // Send message
  sendMessage: async (message, sessionId = "default") => {
    const response = await axios.post(`${API_BASE}/chatbot/message`, {
      message,
      sessionId
    });

    return response.data.data;   // important
  },

  // Reset chat
  resetChat: async (sessionId = "default") => {
    const response = await axios.post(`${API_BASE}/chatbot/reset`, {
      sessionId
    });

    return response.data;
  }

};

export default chatbotApi;