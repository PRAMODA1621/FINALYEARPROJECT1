// src/utils/keepAlive.js

/**
 * Keep Alive Service - Uses only GET requests (no HEAD)
 * Prevents Render from spinning down the chatbot
 */
class KeepAliveService {
  constructor() {
    this.interval = null;
    this.CHATBOT_URL = import.meta.env.VITE_CHATBOT_URL || "https://finalyearproject1-1.onrender.com";
    this.HEALTH_URL = `${this.CHATBOT_URL}/health`;
    this.ROOT_URL = this.CHATBOT_URL;
    this.API_URL = `${this.CHATBOT_URL}/api/chat`;
    
    this.stats = {
      pingsSent: 0,
      lastPingTime: null,
      successfulPings: 0,
      startTime: null
    };
  }

  /**
   * Start the keep-alive service
   */
  start() {
    if (this.interval) return;
    
    console.log('🌐 Starting keep-alive service...');
    this.stats.startTime = new Date();
    
    // Immediate warm-up
    this.warmUp();
    
    // Ping every 13 minutes (Render spins down at 15)
    this.interval = setInterval(() => {
      this.quickPing();
    }, 13 * 60 * 1000);
    
    // Ping on page focus
    window.addEventListener('focus', () => {
      this.quickPing();
    });
    
    console.log('✅ Keep-alive service running');
  }

  /**
   * Quick ping using GET request (compatible with all backends)
   */
  async quickPing() {
    const now = Date.now();
    
    // Throttle: don't ping more than once every 2 minutes
    if (this.stats.lastPingTime && (now - this.stats.lastPingTime) < 120000) {
      return;
    }
    
    try {
      this.stats.pingsSent++;
      this.stats.lastPingTime = now;
      
      // Use GET requests with no-cors mode - this works with any backend
      await Promise.all([
        fetch(this.ROOT_URL, { 
          method: 'GET', 
          mode: 'no-cors',
          cache: 'no-cache'
        }),
        fetch(this.HEALTH_URL, { 
          method: 'GET', 
          mode: 'no-cors',
          cache: 'no-cache'
        })
      ]);
      
      this.stats.successfulPings++;
      
      if (this.stats.pingsSent % 10 === 0) {
        console.log(`📡 Keep-alive active (${this.stats.pingsSent} pings)`);
      }
      
    } catch (error) {
      // Silent fail - pings are background tasks
    }
  }

  /**
   * Warm up the service
   */
  async warmUp() {
    try {
      // Simple GET requests - always works
      await fetch(this.ROOT_URL, { method: 'GET', mode: 'no-cors' });
      await fetch(this.HEALTH_URL, { method: 'GET', mode: 'no-cors' });
      
      // Optional: Send a lightweight chat message to fully wake the service
      setTimeout(() => {
        fetch(this.API_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            message: 'warmup', 
            session_id: 'warmup_' + Date.now() 
          })
        }).catch(() => {});
      }, 1000);
      
      console.log('🔥 Chatbot pre-warmed');
    } catch (error) {
      // Ignore errors during warm-up
    }
  }

  /**
   * Force an immediate ping
   */
  async pingNow() {
    await this.quickPing();
  }

  /**
   * Stop the service
   */
  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
      console.log('⏹️ Keep-alive stopped');
    }
  }

  /**
   * Get stats
   */
  getStats() {
    const uptime = this.stats.startTime 
      ? Math.round((new Date() - this.stats.startTime) / 1000 / 60) 
      : 0;
      
    return {
      ...this.stats,
      uptimeMinutes: uptime,
      isRunning: !!this.interval
    };
  }
}

export default new KeepAliveService();