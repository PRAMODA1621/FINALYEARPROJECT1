// src/api/chatbotApi.js

const CHATBOT_URL = import.meta.env.VITE_CHATBOT_URL || "https://finalyearproject1-1.onrender.com";

// URL mappings for redirects
const REDIRECTS = {
  'custom': 'https://venus-frontend-guqs.onrender.com/custom-order',
  'custom order': 'https://venus-frontend-guqs.onrender.com/custom-order',
  'custom orders': 'https://venus-frontend-guqs.onrender.com/custom-order',
  '✨ custom': 'https://venus-frontend-guqs.onrender.com/custom-order',
  'login': 'https://venus-frontend-guqs.onrender.com/login',
  'register': 'https://venus-frontend-guqs.onrender.com/register',
  'help': 'https://venus-frontend-guqs.onrender.com/helpdesk',
  'helpdesk': 'https://venus-frontend-guqs.onrender.com/helpdesk',
  'track': 'https://venus-frontend-guqs.onrender.com/track-order',
  'track order': 'https://venus-frontend-guqs.onrender.com/track-order',
  'contact': 'https://venus-frontend-guqs.onrender.com/contact',
  'cart': 'https://venus-frontend-guqs.onrender.com/cart',
  'wishlist': 'https://venus-frontend-guqs.onrender.com/wishlist',
  'profile': 'https://venus-frontend-guqs.onrender.com/profile',
  'faq': 'https://venus-frontend-guqs.onrender.com/faq',
  'returns': 'https://venus-frontend-guqs.onrender.com/returns-policy',
  'shipping': 'https://venus-frontend-guqs.onrender.com/shipping-info'
};

const chatbotApi = {
  /**
   * Send message to chatbot
   */
  sendMessage: async (message, sessionId = null) => {
    const messageLower = message?.toLowerCase().trim() || '';
    
    // Check for redirects FIRST (instant, no API call)
    for (const [key, url] of Object.entries(REDIRECTS)) {
      if (messageLower.includes(key) || message === key) {
        return {
          message: `✨ Redirecting to ${key}...`,
          redirect: url,
          type: 'redirect'
        };
      }
    }
    
    // If no redirect, make API call
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(`${CHATBOT_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message, 
          session_id: sessionId || `session_${Date.now()}` 
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
      
    } catch (error) {
      console.error('Chatbot API error:', error);
      
      // Return appropriate fallback
      if (error.name === 'AbortError') {
        return {
          message: "⏳ **The chatbot is waking up...**\n\nPlease try again in a moment.",
          options: [
            { id: 'retry', label: '🔄 Try Again', action: message },
            { id: 'custom', label: '✨ Custom Order', action: 'custom' },
            { id: 'help', label: '❓ Help', action: 'help' }
          ],
          type: 'warming'
        };
      }
      
      return {
        message: "⚠️ **Connection Issue**\n\nPlease try again or use the options below.",
        options: [
          { id: 'retry', label: '🔄 Try Again', action: message },
          { id: 'custom', label: '✨ Custom Order', action: 'custom' },
          { id: 'contact', label: '📞 Contact', action: 'contact' }
        ],
        type: 'error'
      };
    }
  },
  
  /**
   * Pre-warm the chatbot
   */
  preWarm: async () => {
    try {
      // Simple fetch to wake up the service
      await fetch(`${CHATBOT_URL}/health`, { mode: 'no-cors' });
      return true;
    } catch (error) {
      return false;
    }
  }
};

export default chatbotApi;