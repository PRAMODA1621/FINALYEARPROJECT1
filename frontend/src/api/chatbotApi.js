import axios from "axios";

const CHATBOT_URL = import.meta.env.VITE_CHATBOT_URL;

const chatbotApi = {

  sendMessage: async (message) => {

    const response = await axios.post(`${CHATBOT_URL}/api/chat`, {
      message
    });

    return response.data;

  }

};

export default chatbotApi;