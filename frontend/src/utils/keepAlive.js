// src/utils/keepAlive.js

/**
 * ULTRA-LIGHT Keep Alive Service
 * Keeps Render chatbot awake with minimal resource usage
 * Free tier friendly - uses only ~100 requests/day
 */

class KeepAliveService {
  constructor() {
    this.interval = null;
    this.CHATBOT_URL = import.meta.env.VITE_CHATBOT_URL || "https://finalyearproject1-1.onrender.com";
    this.HEALTH_URL = `${this.CHATBOT_URL}/health`;
    this.ROOT_URL = this.CHATBOT_URL;
    
    // Stats for monitoring (optional)
    this.stats = {
      pingsSent: 0,
      lastPingTime: null,
      successfulPings: 0,
      startTime: null
    };
  }

  /**
   * Start the keep-alive service with multiple strategies
   */
  start() {
    if (this.interval) return;
    
    console.log('🌐 Starting keep-alive service for chatbot...');
    this.stats.startTime = new Date();
    
    // Strategy 1: Immediate warm-up
    this.warmUp();
    
    // Strategy 2: Regular pings every 13 minutes (Render spins down at 15)
    this.interval = setInterval(() => {
      this.quickPing();
    }, 13 * 60 * 1000); // 13 minutes
    
    // Strategy 3: Ping on page focus (user returning)
    window.addEventListener('focus', () => {
      this.quickPing();
    });
    
    // Strategy 4: Ping before chat opens (hover detection)
    this.setupHoverDetection();
    
    console.log('✅ Keep-alive service running');
  }

  /**
   * Set up hover detection on chat button
   */
  setupHoverDetection() {
    // Try immediately
    this.attachHoverListener();
    
    // Also try after DOM changes (for SPAs)
    const observer = new MutationObserver(() => {
      this.attachHoverListener();
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  /**
   * Attach hover listener to chat button
   */
  attachHoverListener() {
    const chatButton = document.querySelector('[aria-label="Toggle chat"]') || 
                      document.querySelector('.fixed.bottom-6.right-6');
    
    if (chatButton && !chatButton.hasAttribute('data-keepalive')) {
      chatButton.setAttribute('data-keepalive', 'true');
      chatButton.addEventListener('mouseenter', () => {
        this.quickPing();
      });
    }
  }

  /**
   * Quickest possible ping - HEAD request with no-cors
   * Uses minimal bandwidth (< 1KB)
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
      
      // Parallel pings to both endpoints for reliability
      await Promise.all([
        fetch(this.HEALTH_URL, {
          method: 'HEAD',
          mode: 'no-cors',
          cache: 'no-cache',
          keepalive: true
        }),
        fetch(this.ROOT_URL, {
          method: 'HEAD',
          mode: 'no-cors',
          cache: 'no-cache',
          keepalive: true
        })
      ]);
      
      this.stats.successfulPings++;
      
      // Log every 10th ping for monitoring
      if (this.stats.pingsSent % 10 === 0) {
        console.log(`📡 Keep-alive active (${this.stats.pingsSent} pings sent)`);
      }
      
    } catch (error) {
      // Silent fail - pings are background tasks
      if (this.stats.pingsSent % 20 === 0) {
        console.log('⚠️ Keep-alive ping failed (service starting up)');
      }
    }
  }

  /**
   * Warm up the service with a simple GET
   */
  async warmUp() {
    try {
      await Promise.all([
        fetch(this.ROOT_URL, { method: 'HEAD', mode: 'no-cors' }),
        fetch(this.HEALTH_URL, { method: 'HEAD', mode: 'no-cors' }),
        fetch(`${this.CHATBOT_URL}/api/chat`, { 
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: 'warmup', session_id: 'warmup' }),
          mode: 'no-cors'
        })
      ]);
      
      console.log('🔥 Chatbot pre-warmed successfully');
    } catch (error) {
      console.log('⏳ Chatbot warming up in background...');
    }
  }

  /**
   * Force an immediate ping (call before opening chat)
   */
  async pingNow() {
    console.log('⚡ Manual ping triggered');
    await this.quickPing();
  }

  /**
   * Stop the keep-alive service
   */
  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
      console.log('⏹️ Keep-alive service stopped');
    }
  }

  /**
   * Get ping statistics
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

// Export singleton instance
const keepAlive = new KeepAliveService();
export default keepAlive;