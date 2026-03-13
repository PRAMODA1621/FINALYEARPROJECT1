import axios from "axios";

const CHATBOT_URL =
  import.meta.env.VITE_CHATBOT_URL ||
  "https://finalyearproject1-1.onrender.com";

const chatbotApi = {
  sendMessage: async (message) => {
    const response = await axios.post(`${CHATBOT_URL}/api/chat`, {
      message
    });

    return response.data;
  }
};

export default chatbotApi;