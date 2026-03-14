import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { 
  FaComments, 
  FaTimes, 
  FaPaperPlane, 
  FaRobot, 
  FaShoppingCart, 
  FaEye,
  FaFilter,
  FaCheckCircle,
  FaExclamationCircle,
  FaTag,
  FaBoxOpen,
  FaGift,
  FaStar,
  FaCrown,
  FaMedal,
  FaGem,
  FaTree,
  FaSolarPanel,
  FaWind,
  FaAward,
  FaWhatsapp,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaClock,
  FaArrowRight,
  FaUser,
  FaSignInAlt,
  FaUserPlus,
  FaHeadset,
  FaQuestionCircle,
  FaTruck,
  FaUndo,
  FaShieldAlt,
  FaCreditCard,
  FaPalette,
  FaBuilding,
  FaCalendarAlt
} from 'react-icons/fa';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import chatbotApi from '../../api/chatbotApi';
import keepAlive from '../../utils/keepAlive';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [connectionError, setConnectionError] = useState(false);
  const [isWarming, setIsWarming] = useState(false);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const messageContainerRef = useRef(null);
  
  const { addToCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // Initialize session
  useEffect(() => {
    setSessionId('session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9));
  }, []);

  // Start keep-alive service
  useEffect(() => {
    keepAlive.start();
    return () => keepAlive.stop();
  }, []);

  // Welcome message
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!messages.length) {
        setMessages([{
          id: Date.now(),
          text: "✨ **Welcome to Venus Enterprises!** ✨\n\nI'm your AI shopping assistant. How can I help you today?",
          sender: 'bot',
          timestamp: new Date(),
          options: [
            { id: 'shop', label: '🛍️ Shop', action: 'shop' },
            { id: 'custom', label: '✨ Custom Order', action: 'custom' },
            { id: 'price', label: '💰 Price', action: 'price' },
            { id: 'gift', label: '🎯 Gift Finder', action: 'gift' },
            { id: 'corporate', label: '🏢 Corporate', action: 'corporate' },
            { id: 'help', label: '❓ Help', action: 'help' },
            { id: 'track', label: '📦 Track', action: 'track' },
            { id: 'login', label: '🔑 Login', action: 'login' }
          ],
          type: 'welcome'
        }]);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 100);
    }
  }, [isOpen]);

  // Format helpers
  const formatPrice = useCallback((price) => {
    return `₹${parseFloat(price).toLocaleString('en-IN')}`;
  }, []);

  const formatTime = useCallback((date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, []);

  // Handle redirects
  const handleRedirect = useCallback((url) => {
    window.location.href = url;
  }, []);

  // Handle option clicks - UPDATED with custom order redirect
  const handleOptionClick = useCallback((option) => {
    const optionText = option.label || option;
    const optionAction = option.action || option;
    const optionId = option.id || option;
    
    console.log('Option clicked:', { optionText, optionAction, optionId });
    
    // Add user message to chat
    const userMessage = {
      id: Date.now(),
      text: optionText,
      sender: 'user',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);

    // SPECIAL HANDLING FOR CUSTOM ORDER - Direct redirect
    if (optionAction === 'custom' || 
        optionAction === 'custom-order' || 
        optionId === 'custom' ||
        optionText === '✨ Custom Order' ||
        optionText === '✨ Custom' ||
        optionText.toLowerCase().includes('custom')) {
      
      console.log('🔴 Redirecting to custom order page...');
      
      // Show a quick message
      const redirectMessage = {
        id: Date.now() + 1,
        text: "✨ **Taking you to our custom order page...**",
        sender: 'bot',
        timestamp: new Date(),
        type: 'redirect'
      };
      setMessages(prev => [...prev, redirectMessage]);
      
      // Redirect to custom order page
      setTimeout(() => {
        window.location.href = 'https://venus-frontend-guqs.onrender.com/custom-order';
      }, 800);
      return;
    }
    
    // LOGIN redirect
    if (optionAction === 'login' || 
        optionAction === '🔑 Login' || 
        optionText === '🔑 Login' ||
        optionText.toLowerCase().includes('login')) {
      window.location.href = 'https://venus-frontend-guqs.onrender.com/login';
      return;
    }
    
    // REGISTER redirect
    if (optionAction === 'register' || 
        optionAction === '📝 Register' || 
        optionText === '📝 Register' ||
        optionText.toLowerCase().includes('register')) {
      window.location.href = 'https://venus-frontend-guqs.onrender.com/register';
      return;
    }
    
    // HELP DESK redirect
    if (optionAction === 'help' || 
        optionAction === '❓ Help' || 
        optionText === '❓ Help' ||
        optionAction === 'helpdesk' ||
        optionText.toLowerCase().includes('help')) {
      window.location.href = 'https://venus-frontend-guqs.onrender.com/helpdesk';
      return;
    }
    
    // TRACK ORDER redirect
    if (optionAction === 'track' || 
        optionAction === '📦 Track' || 
        optionText === '📦 Track' ||
        optionAction === 'track-order' ||
        optionText.toLowerCase().includes('track')) {
      window.location.href = 'https://venus-frontend-guqs.onrender.com/track-order';
      return;
    }
    
    // CONTACT redirect
    if (optionAction === 'contact' || 
        optionAction === '📞 Contact' || 
        optionText === '📞 Contact' ||
        optionText.toLowerCase().includes('contact')) {
      window.location.href = 'https://venus-frontend-guqs.onrender.com/contact';
      return;
    }
    
    // CART redirect
    if (optionAction === 'cart' || 
        optionAction === '🛒 Cart' || 
        optionText === '🛒 Cart' ||
        optionText.toLowerCase().includes('cart')) {
      window.location.href = 'https://venus-frontend-guqs.onrender.com/cart';
      return;
    }
    
    // PROFILE redirect
    if (optionAction === 'profile' || 
        optionAction === '👤 Profile' || 
        optionText === '👤 Profile' ||
        optionText.toLowerCase().includes('profile')) {
      window.location.href = 'https://venus-frontend-guqs.onrender.com/profile';
      return;
    }
    
    // WISHLIST redirect
    if (optionAction === 'wishlist' || 
        optionAction === '❤️ Wishlist' || 
        optionText === '❤️ Wishlist' ||
        optionText.toLowerCase().includes('wishlist')) {
      window.location.href = 'https://venus-frontend-guqs.onrender.com/wishlist';
      return;
    }
    
    // SHOP / PRODUCTS redirect
    if (optionAction === 'shop' || 
        optionAction === '🛍️ Shop' || 
        optionText === '🛍️ Shop' ||
        optionText.toLowerCase().includes('shop') ||
        optionText.toLowerCase().includes('browse')) {
      window.location.href = 'https://venus-frontend-guqs.onrender.com/products';
      return;
    }
    
    // PRICE - handle through bot
    if (optionAction === 'price' || 
        optionAction === '💰 Price' || 
        optionText === '💰 Price' ||
        optionText.toLowerCase().includes('price')) {
      sendMessageToBot('💰 Price Explorer');
      return;
    }
    
    // GIFT FINDER - handle through bot
    if (optionAction === 'gift' || 
        optionAction === '🎯 Gift Finder' || 
        optionText === '🎯 Gift Finder' ||
        optionText.toLowerCase().includes('gift')) {
      sendMessageToBot('🎯 Gift Finder');
      return;
    }
    
    // CORPORATE - handle through bot
    if (optionAction === 'corporate' || 
        optionAction === '🏢 Corporate' || 
        optionText === '🏢 Corporate' ||
        optionText.toLowerCase().includes('corporate')) {
      sendMessageToBot('🏢 Corporate Solutions');
      return;
    }
    
    // For all other options, send to bot
    sendMessageToBot(optionText);
    
  }, [sendMessageToBot]);

  // Send message to bot
  const sendMessageToBot = useCallback(async (message) => {
    if (!message?.trim()) return;
    
    setIsTyping(true);
    setIsWarming(true);
    
    try {
      // Ping service before sending (wake up if needed)
      await keepAlive.quickPing();
      
      const response = await chatbotApi.sendMessage(message, sessionId);
      
      // Handle redirect responses from API
      if (response.redirect) {
        // Show redirect message
        const redirectMessage = {
          id: Date.now(),
          text: response.message || "✨ Redirecting you...",
          sender: 'bot',
          timestamp: new Date(),
          type: 'redirect'
        };
        setMessages(prev => [...prev, redirectMessage]);
        
        // Redirect after delay
        setTimeout(() => {
          window.location.href = response.redirect;
        }, 800);
        return;
      }
      
      const botMessage = {
        id: Date.now(),
        text: response.message || "Here's what I found:",
        sender: 'bot',
        timestamp: new Date(),
        options: response.options || [],
        products: response.products || [],
        type: response.type || 'response'
      };
      
      setMessages(prev => [...prev, botMessage]);
      setConnectionError(false);
      setIsWarming(false);
      
    } catch (error) {
      console.error('Chatbot error:', error);
      
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: "⚠️ **Connection Issue**\n\nPlease try again or use the options below.",
        sender: 'bot',
        timestamp: new Date(),
        options: [
          { id: 'retry', label: '🔄 Try Again', action: message },
          { id: 'custom', label: '✨ Custom Order', action: 'custom' },
          { id: 'help', label: '❓ Help', action: 'help' }
        ],
        type: 'error',
        isError: true
      }]);
      
      setConnectionError(true);
      setIsWarming(false);
    } finally {
      setIsTyping(false);
    }
  }, [sessionId]);

  // Handle send message
  const handleSendMessage = useCallback(() => {
    if (!inputMessage.trim() || isTyping) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    
    // Check if message contains "custom" - redirect directly
    if (inputMessage.toLowerCase().includes('custom')) {
      const redirectMessage = {
        id: Date.now() + 1,
        text: "✨ **Taking you to our custom order page...**",
        sender: 'bot',
        timestamp: new Date(),
        type: 'redirect'
      };
      setMessages(prev => [...prev, redirectMessage]);
      
      setTimeout(() => {
        window.location.href = 'https://venus-frontend-guqs.onrender.com/custom-order';
      }, 800);
      setInputMessage('');
      return;
    }
    
    sendMessageToBot(inputMessage);
    setInputMessage('');
  }, [inputMessage, isTyping, sendMessageToBot]);

  // Handle key press
  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  // Handle add to cart
  const handleAddToCart = useCallback(async (product) => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: "🔐 **Login Required**\n\nPlease login to add items to your cart.",
        sender: 'bot',
        timestamp: new Date(),
        options: [
          { id: 'login', label: '🔑 Login', action: 'login' },
          { id: 'register', label: '📝 Register', action: 'register' },
          { id: 'continue', label: '🛍️ Continue Browsing', action: 'continue' }
        ],
        type: 'auth_required'
      }]);
      
      sessionStorage.setItem('pendingCartItem', JSON.stringify(product));
      return;
    }

    try {
      toast.loading('Adding to cart...', { id: 'addToCart' });
      
      await addToCart({
        productId: product.id,
        productName: product.name,
        price: product.price,
        quantity: 1,
        image: product.image_url
      });
      
      toast.success(`${product.name} added to cart!`, { id: 'addToCart' });
      
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: `✅ **${product.name}** added to cart!`,
        sender: 'bot',
        timestamp: new Date(),
        options: [
          { id: 'cart', label: '🛒 View Cart', action: 'cart' },
          { id: 'checkout', label: '💳 Checkout', action: 'checkout' },
          { id: 'continue', label: '🛍️ Continue', action: 'continue' }
        ],
        type: 'cart_confirmation'
      }]);
      
    } catch (error) {
      console.error('Cart error:', error);
      toast.error('Failed to add to cart', { id: 'addToCart' });
    }
  }, [isAuthenticated, addToCart]);

  // Handle view product
  const handleViewProduct = useCallback((product) => {
    const productName = encodeURIComponent(product.name);
    window.location.href = `https://venus-frontend-guqs.onrender.com/product/${productName}`;
  }, []);

  // Get category icon
  const getCategoryIcon = useCallback((category) => {
    const icons = {
      'Wooden': <FaTree className="text-amber-600" />,
      'Acrylic': <FaSolarPanel className="text-blue-400" />,
      'Metal': <FaWind className="text-gray-500" />,
      'Crystal': <FaGem className="text-purple-500" />,
      'Gifts': <FaGift className="text-pink-500" />,
      'Corporate Gifts': <FaCrown className="text-yellow-500" />,
      'Awards': <FaAward className="text-orange-500" />,
      'Marble': <FaGem className="text-stone-500" />
    };
    return icons[category] || <FaTag className="text-[#9CAF88]" />;
  }, []);

  // Render message text
  const renderMessageText = useCallback((text) => {
    if (!text) return null;
    
    // Split by bold markers
    const parts = text.split(/(\*\*.*?\*\*)/g);
    
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>;
      }
      return <span key={i}>{part}</span>;
    });
  }, []);

  // Quick actions - UPDATED with custom action
  const quickActions = useMemo(() => [
    { id: 'shop', label: '🛍️ Shop', icon: <FaGift />, action: 'shop' },
    { id: 'custom', label: '✨ Custom', icon: <FaPalette />, action: 'custom' },
    { id: 'price', label: '💰 Price', icon: <FaTag />, action: 'price' },
    { id: 'gift', label: '🎯 Gift', icon: <FaGift />, action: 'gift' },
    { id: 'corporate', label: '🏢 Corporate', icon: <FaBuilding />, action: 'corporate' },
    { id: 'track', label: '📦 Track', icon: <FaTruck />, action: 'track' },
    { id: 'help', label: '❓ Help', icon: <FaHeadset />, action: 'help' },
    { id: 'login', label: '🔑 Login', icon: <FaSignInAlt />, action: 'login' }
  ], []);

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) keepAlive.quickPing();
        }}
        onMouseEnter={() => keepAlive.quickPing()}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-[#8B5A2B] to-[#9CAF88] text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-50 group"
        aria-label="Toggle chat"
      >
        {isOpen ? <FaTimes size={24} /> : <FaComments size={24} />}
        {!isOpen && (
          <span className="absolute right-16 top-1/2 -translate-y-1/2 bg-gray-800 text-white text-xs py-2 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Chat with us
          </span>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 sm:w-96 h-[600px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col z-50 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#8B5A2B] to-[#9CAF88] text-white p-4">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <FaRobot size={20} />
                </div>
                <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Venus AI Assistant</h3>
                <p className="text-xs opacity-90">
                  {isWarming ? 'Waking up...' : 'Online • Ready to help'}
                </p>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="hover:bg-white/20 p-2 rounded-full transition-colors"
              >
                <FaTimes size={16} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div 
            ref={messageContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50"
            style={{ scrollBehavior: 'smooth' }}
          >
            {messages.map((msg) => (
              <div key={msg.id} className="space-y-2">
                {/* Message Bubble */}
                <div className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl p-3 ${
                      msg.sender === 'user'
                        ? 'bg-[#9CAF88] text-white rounded-br-none'
                        : msg.isError
                        ? 'bg-red-50 text-red-800 border border-red-200 rounded-bl-none'
                        : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-none'
                    }`}
                  >
                    <div className="text-sm whitespace-pre-line leading-relaxed">
                      {renderMessageText(msg.text)}
                    </div>
                    <p className="text-xs mt-1 opacity-70 text-right">
                      {formatTime(msg.timestamp)}
                    </p>
                  </div>
                </div>

                {/* Products */}
                {msg.products?.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {msg.products.map((product) => (
                      <div
                        key={product.id}
                        onClick={() => handleViewProduct(product)}
                        className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                      >
                        <div className="flex gap-3">
                          <img
                            src={product.image_url || '/images/placeholder.jpg'}
                            alt={product.name}
                            className="w-16 h-16 object-cover rounded-lg bg-gray-100"
                            loading="lazy"
                            onError={(e) => {
                              e.target.src = '/images/placeholder.jpg';
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <h4 className="text-sm font-medium text-gray-900 line-clamp-1">
                                {product.name}
                              </h4>
                              <span className="text-sm font-bold text-[#8B5A2B] ml-2">
                                {formatPrice(product.price)}
                              </span>
                            </div>
                            <div className="flex items-center mt-1">
                              {getCategoryIcon(product.category)}
                              <span className="text-xs text-gray-500 ml-1">
                                {product.category}
                              </span>
                            </div>
                            <div className="flex gap-2 mt-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewProduct(product);
                                }}
                                className="flex-1 bg-[#9CAF88] text-white text-xs py-1.5 rounded-lg hover:bg-[#8B5A2B] transition-colors"
                              >
                                <FaEye className="inline mr-1" size={10} />
                                View
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAddToCart(product);
                                }}
                                className="flex-1 bg-[#8B5A2B] text-white text-xs py-1.5 rounded-lg hover:bg-[#9CAF88] transition-colors"
                              >
                                <FaShoppingCart className="inline mr-1" size={10} />
                                Add
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Filter options */}
                    {msg.products.length > 3 && (
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center space-x-2">
                          <FaFilter className="text-[#9CAF88] text-xs" />
                          <span className="text-xs text-gray-500">Sort:</span>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleOptionClick('Price: Low to High')}
                            className="text-xs bg-white px-3 py-1.5 rounded-full border border-[#E8E0D5] hover:bg-[#9CAF88] hover:text-white transition-colors"
                          >
                            📈 Low to High
                          </button>
                          <button
                            onClick={() => handleOptionClick('Price: High to Low')}
                            className="text-xs bg-white px-3 py-1.5 rounded-full border border-[#E8E0D5] hover:bg-[#9CAF88] hover:text-white transition-colors"
                          >
                            📉 High to Low
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Options Buttons - UPDATED to handle custom properly */}
                {msg.options?.length > 0 && !msg.products?.length && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {msg.options.map((opt) => {
                      // Ensure opt is in the correct format
                      const optionObj = typeof opt === 'string' 
                        ? { id: opt, label: opt, action: opt.toLowerCase().replace(/\s+/g, '-') }
                        : opt;
                      
                      // Special handling for custom option
                      if (optionObj.label?.includes('Custom') || 
                          optionObj.action === 'custom' ||
                          optionObj.label === '✨ Custom Order' ||
                          optionObj.label === '✨ Custom') {
                        optionObj.action = 'custom';
                      }
                      
                      return (
                        <button
                          key={optionObj.id || optionObj.label}
                          onClick={() => handleOptionClick(optionObj)}
                          className="px-4 py-2 bg-white border border-[#9CAF88] text-[#8B5A2B] rounded-full text-xs hover:bg-[#9CAF88] hover:text-white transition-colors shadow-sm"
                        >
                          {optionObj.label || optionObj}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-[#9CAF88] rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                    <div className="w-2 h-2 bg-[#9CAF88] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-[#9CAF88] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 p-4 bg-white">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                disabled={connectionError || isTyping}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B5A2B] text-sm disabled:bg-gray-100"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isTyping || connectionError}
                className="bg-[#8B5A2B] text-white p-2 rounded-lg hover:bg-[#9CAF88] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaPaperPlane size={18} />
              </button>
            </div>

            {/* Quick Actions - Now includes Custom */}
            <div className="flex flex-wrap gap-1.5 mt-3">
              {quickActions.map((action) => (
                <button
                  key={action.id}
                  onClick={() => handleOptionClick(action)}
                  className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-xs hover:bg-[#9CAF88] hover:text-white transition-colors flex items-center gap-1"
                >
                  {action.icon}
                  <span>{action.label}</span>
                </button>
              ))}
            </div>

            {/* User Status */}
            <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-2">
                {isAuthenticated ? (
                  <span className="flex items-center gap-1 text-green-600">
                    <FaCheckCircle size={12} />
                    {user?.name?.split(' ')[0] || 'User'}
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-amber-600">
                    <FaExclamationCircle size={12} />
                    Not logged in
                  </span>
                )}
              </div>
              <span className="flex items-center gap-1">
                <FaClock size={12} />
                24/7 Support
              </span>
            </div>
            
            {/* Custom Order Quick Link */}
            <div className="mt-2 text-center">
              <button
                onClick={() => handleOptionClick({ id: 'custom', label: '✨ Custom Order', action: 'custom' })}
                className="text-xs text-[#8B5A2B] hover:text-[#9CAF88] transition-colors underline"
              >
                Need something unique? Create custom order →
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatbotWidget;