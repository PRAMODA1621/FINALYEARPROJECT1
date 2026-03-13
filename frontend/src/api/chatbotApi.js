import axios from "axios";

const CHATBOT_URL = import.meta.env.VITE_CHATBOT_URL || "https://finalyearproject1-1.onrender.com";

const chatbotApi = {
  sendMessage: async (message, sessionId = null) => {
    try {
      console.log('📤 Sending to chatbot:', { message, sessionId });
      
      const response = await axios.post(
        `${CHATBOT_URL}/api/chat`,
        { 
          message,
          session_id: sessionId 
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 15000, // 15 second timeout for Render cold start
        }
      );

      console.log('📥 Chatbot response:', response.data);
      return response.data;
      
    } catch (error) {
      console.error('❌ Chatbot API error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url
      });
      
      // Return a fallback response for better UX
      if (error.code === 'ECONNABORTED') {
        return {
          message: "⏳ The AI service is waking up. Please try again in a moment.",
          options: ["Try Again", "Browse Products"],
          products: [],
          type: "error"
        };
      }
      
      throw error;
    }
  }
};

export default chatbotApi;