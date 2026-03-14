// src/utils/keepAlive.js - ULTRA SIMPLE VERSION
// No complex logic, no circular dependencies

const CHATBOT_URL = import.meta.env.VITE_CHATBOT_URL || "https://finalyearproject1-1.onrender.com";

// Simple object with methods
const keepAlive = {
  start: () => {
    console.log('Keep-alive started');
    // Don't do anything complex - let the first user request wake it up
  },
  
  stop: () => {
    console.log('Keep-alive stopped');
  },
  
  ping: () => {
    // Optional: silent ping in background
    fetch(`${CHATBOT_URL}/health`, { mode: 'no-cors' }).catch(() => {});
  }
};

export default keepAlive;