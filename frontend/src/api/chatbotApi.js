// src/api/chatbotApi.js

const CHATBOT_URL = import.meta.env.VITE_CHATBOT_URL || "https://finalyearproject1-1.onrender.com";

// Response cache for instant replies
const responseCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

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
  'orders': 'https://venus-frontend-guqs.onrender.com/orders',
  'faq': 'https://venus-frontend-guqs.onrender.com/faq',
  'returns': 'https://venus-frontend-guqs.onrender.com/returns-policy',
  'shipping': 'https://venus-frontend-guqs.onrender.com/shipping-info'
};

// Instant responses (no API call needed)
const instantResponses = {
  'welcome': {
    message: "✨ **Welcome to Venus Enterprises!** ✨\n\nI'm your AI shopping assistant. How can I help you today?",
    options: [
      { id: 'shop', label: '🛍️ Shop', action: 'shop' },
      { id: 'custom', label: '✨ Custom Order', action: 'custom' },
      { id: 'price', label: '💰 Price', action: 'price' },
      { id: 'help', label: '❓ Help', action: 'help' }
    ],
    type: 'welcome'
  },
  
  'custom': {
    message: "✨ **Create Your Custom Gift** ✨\n\nYou'll be redirected to our custom design studio where you can:\n• Upload your logo\n• Choose engraving style\n• Select materials\n• Preview your design",
    redirect: 'https://venus-frontend-guqs.onrender.com/custom-order',
    type: 'redirect'
  },
  
  'help': {
    message: "❓ **How Can I Help You?**\n\n• **Custom Orders**: [Create Custom Gift](/custom-order)\n• **Track Order**: [Track Your Order](/track-order)\n• **Contact Us**: [Help Desk](/helpdesk)\n• **FAQs**: [Frequently Asked Questions](/faq)",
    options: [
      { id: 'custom', label: '✨ Custom Order', action: 'custom' },
      { id: 'track', label: '📦 Track Order', action: 'track' },
      { id: 'contact', label: '📞 Contact', action: 'contact' },
      { id: 'shop', label: '🛍️ Shop', action: 'shop' }
    ],
    type: 'help'
  },
  
  'price': {
    message: "💰 **Price Explorer**\n\nWhat's your budget?",
    options: [
      { id: 'under500', label: 'Under ₹500', action: 'under500' },
      { id: '500to1000', label: '₹500 - ₹1000', action: '500to1000' },
      { id: '1000to2500', label: '₹1000 - ₹2500', action: '1000to2500' },
      { id: '2500to5000', label: '₹2500 - ₹5000', action: '2500to5000' },
      { id: 'above5000', label: 'Above ₹5000', action: 'above5000' }
    ],
    type: 'price'
  },
  
  'track': {
    message: "📦 **Track Your Order**\n\nEnter your order number or visit our tracking page:",
    options: [
      { id: 'track', label: '🔍 Track Now', action: 'track' },
      { id: 'help', label: '❓ Need Help?', action: 'help' },
      { id: 'shop', label: '🛍️ Continue Shopping', action: 'shop' }
    ],
    type: 'track'
  },
  
  'contact': {
    message: "📞 **Contact Us**\n\n• **Email**: support@venusenterprises.com\n• **Phone**: +91 98765 43210\n• **WhatsApp**: wa.me/919876543210\n• **Address**: Peenya Industrial Area, Bengaluru",
    options: [
      { id: 'email', label: '📧 Email', action: 'email' },
      { id: 'whatsapp', label: '📱 WhatsApp', action: 'whatsapp' },
      { id: 'call', label: '📞 Call', action: 'call' },
      { id: 'map', label: '📍 Map', action: 'map' }
    ],
    type: 'contact'
  }
};

const chatbotApi = {
  /**
   * Send message to chatbot
   */
  sendMessage: async (message, sessionId = null) => {
    const messageLower = message?.toLowerCase().trim() || '';
    const cacheKey = `${sessionId}-${message}`;
    
    // Check cache first
    const cached = responseCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }
    
    // Check for redirects
    for (const [key, url] of Object.entries(REDIRECTS)) {
      if (messageLower.includes(key)) {
        const response = {
          message: `✨ Redirecting you to ${key}...`,
          redirect: url,
          type: 'redirect'
        };
        // Cache the response
        responseCache.set(cacheKey, { data: response, timestamp: Date.now() });
        return response;
      }
    }
    
    // Check for instant responses
    for (const [key, response] of Object.entries(instantResponses)) {
      if (messageLower.includes(key) || message === key) {
        responseCache.set(cacheKey, { data: response, timestamp: Date.now() });
        return response;
      }
    }
    
    // If no instant response, make API call
    try {
      // Abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
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
      
      // Cache the response
      responseCache.set(cacheKey, { data, timestamp: Date.now() });
      
      return data;
      
    } catch (error) {
      console.error('Chatbot API error:', error);
      
      // Return appropriate fallback
      if (error.name === 'AbortError') {
        return {
          message: "⏳ **The chatbot is waking up...**\n\nThis takes just a few seconds. Please try again.",
          options: [
            { id: 'retry', label: '🔄 Try Again', action: message },
            { id: 'custom', label: '✨ Custom Order', action: 'custom' },
            { id: 'help', label: '❓ Help', action: 'help' }
          ],
          type: 'warming'
        };
      }
      
      return {
        message: "⚠️ **Connection Issue**\n\nPlease try again or use the options below:",
        options: [
          { id: 'retry', label: '🔄 Retry', action: message },
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
      await Promise.all([
        fetch(`${CHATBOT_URL}/health`, { mode: 'no-cors' }),
        fetch(CHATBOT_URL, { mode: 'no-cors' })
      ]);
      sessionStorage.setItem('chatbot-warmed', 'true');
      return true;
    } catch (error) {
      return false;
    }
  },
  
  /**
   * Clear cache
   */
  clearCache: () => {
    responseCache.clear();
  }
};

export default chatbotApi;