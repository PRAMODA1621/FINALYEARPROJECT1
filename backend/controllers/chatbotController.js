const axios = require('axios');

const CHATBOT_API = "https://finalyearproject1-1.onrender.com/api/chat";

// @desc    Send message to chatbot
// @route   POST /api/chatbot/message
// @access  Public
const sendMessage = async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    
    console.log('🤖 Sending message to chatbot:', message);
    
    const response = await axios.post(`${CHATBOT_URL}/chat`, {
      message,
      session_id: sessionId
    });
    
    res.json({
      success: true,
      data: response.data
    });
  } catch (error) {
    console.error('❌ Chatbot error:', error.message);
    
    // Fallback response if Python service is down
    res.json({
      success: true,
      data: {
        message: "I'm here to help! Please select a category: Wooden, Acrylic, Metal, Gifts, Mementos, or Marble.",
        options: ["Wooden", "Acrylic", "Metal", "Gifts", "Mementos", "Marble"],
        state: 2,
        type: "category_selection"
      }
    });
  }
};

// @desc    Reset chat session
// @route   POST /api/chatbot/reset
// @access  Public
const resetChat = async (req, res) => {
  try {
    const { sessionId } = req.body;
    
    await axios.post(`${CHATBOT_URL}/chat/reset?session_id=${sessionId || 'default'}`);
    
    res.json({
      success: true,
      message: 'Chat reset successfully'
    });
  } catch (error) {
    console.error('❌ Reset chat error:', error);
    res.status(500).json({ success: false, message: 'Failed to reset chat' });
  }
};

module.exports = { sendMessage, resetChat };