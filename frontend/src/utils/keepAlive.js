// src/utils/keepAlive.js
const CHATBOT_URL = import.meta.env.VITE_CHATBOT_URL || "https://finalyearproject1-1.onrender.com";

const keepAlive = {
  interval: null,
  
  start: () => {
    if (keepAlive.interval) return;
    
    console.log('🌐 Starting keep-alive...');
    keepAlive.ping();
    keepAlive.interval = setInterval(keepAlive.ping, 13 * 60 * 1000);
  },
  
  ping: async () => {
    try {
      await fetch(`${CHATBOT_URL}/health`, { 
        method: 'GET', 
        mode: 'no-cors' 
      });
    } catch (error) {
      // Silent fail
    }
  },
  
  stop: () => {
    if (keepAlive.interval) {
      clearInterval(keepAlive.interval);
      keepAlive.interval = null;
    }
  }
};

export default keepAlive;