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
  FaLock,
  FaSignInAlt,
  FaUserPlus,
  FaHeadset,
  FaQuestionCircle,
  FaInfoCircle,
  FaTruck,
  FaUndo,
  FaShieldAlt,
  FaCreditCard,
  FaPalette,
  FaUsers,
  FaBuilding,
  FaCalendarAlt
} from 'react-icons/fa';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import chatbotApi from '../../api/chatbotApi';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [connectionError, setConnectionError] = useState(false);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const messageContainerRef = useRef(null);
  
  const { addToCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // Initialize session once
  useEffect(() => {
    setSessionId('session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9));
  }, []);

  // Welcome message on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!messages.length) {
        setMessages([{
          id: Date.now(),
          text: "✨ **Welcome to Venus Enterprises!** ✨\n\nI'm your AI shopping assistant. How can I help you today?",
          sender: 'bot',
          timestamp: new Date(),
          options: [
            { id: 'shop', label: '🛍️ Shop', action: 'category' },
            { id: 'price', label: '💰 Price', action: 'price' },
            { id: 'gift', label: '🎯 Gift Finder', action: 'gift' },
            { id: 'corporate', label: '🏢 Corporate', action: 'corporate' },
            { id: 'custom', label: '✨ Custom', action: 'custom' },
            { id: 'help', label: '❓ Help', action: 'help' },
            { id: 'login', label: '🔑 Login', action: 'login' },
            { id: 'track', label: '📦 Track Order', action: 'track' }
          ],
          type: 'welcome'
        }]);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Scroll to bottom - optimized with requestAnimationFrame
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

  // Memoized price formatter
  const formatPrice = useCallback((price) => {
    return `₹${parseFloat(price).toLocaleString('en-IN')}`;
  }, []);

  // Memoized time formatter
  const formatTime = useCallback((date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, []);

  // Handle navigation/redirects
  const handleRedirect = useCallback((url, target = '_self') => {
    if (target === '_blank') {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      navigate(url);
    }
  }, [navigate]);

  // Handle option clicks
  const handleOptionClick = useCallback((option) => {
    const userMessage = {
      id: Date.now(),
      text: option.label || option,
      sender: 'user',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);

    // Handle special actions
    switch (option.action || option) {
      case 'login':
      case '🔑 Login':
        handleRedirect('/login');
        break;
      
      case 'register':
      case '📝 Register':
        handleRedirect('/register');
        break;
      
      case 'help':
      case '❓ Help':
      case 'helpdesk':
        handleRedirect('/helpdesk');
        break;
      
      case 'track':
      case '📦 Track Order':
        handleRedirect('/track-order');
        break;
      
      case 'contact':
      case '📞 Contact':
        handleRedirect('/contact');
        break;
      
      case 'cart':
      case '🛒 Cart':
        handleRedirect('/cart');
        break;
      
      case 'wishlist':
      case '❤️ Wishlist':
        handleRedirect('/wishlist');
        break;
      
      case 'profile':
      case '👤 Profile':
        handleRedirect('/profile');
        break;
      
      case 'orders':
      case '📋 Orders':
        handleRedirect('/orders');
        break;
      
      case 'whatsapp':
        handleRedirect('https://wa.me/919876543210', '_blank');
        break;
      
      case 'email':
        window.location.href = 'mailto:support@venusenterprises.com';
        break;
      
      case 'phone':
        window.location.href = 'tel:+919876543210';
        break;
      
      case 'map':
        handleRedirect('https://maps.google.com/?q=Peenya+Industrial+Area+Bengaluru', '_blank');
        break;
      
      case 'faq':
        handleRedirect('/faq');
        break;
      
      case 'returns':
        handleRedirect('/returns-policy');
        break;
      
      case 'shipping':
        handleRedirect('/shipping-info');
        break;
      
      case 'privacy':
        handleRedirect('/privacy-policy');
        break;
      
      case 'terms':
        handleRedirect('/terms-conditions');
        break;
      
      default:
        // Send to bot for processing
        sendMessageToBot(option.label || option);
    }
  }, [handleRedirect]);

  // Send message to bot - optimized
  const sendMessageToBot = useCallback(async (message) => {
    if (!message?.trim()) return;
    
    setIsTyping(true);
    
    try {
      const response = await chatbotApi.sendMessage(message, sessionId);
      
      const botMessage = {
        id: Date.now(),
        text: response.message || "Here's what I found:",
        sender: 'bot',
        timestamp: new Date(),
        options: response.options?.map(opt => typeof opt === 'string' ? { label: opt, action: opt } : opt) || [],
        products: response.products || [],
        type: response.type || 'response'
      };
      
      setMessages(prev => [...prev, botMessage]);
      setConnectionError(false);
      
    } catch (error) {
      console.error('Chatbot error:', error);
      
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: "⚠️ **Connection Issue**\n\nPlease try again or contact support.",
        sender: 'bot',
        timestamp: new Date(),
        options: [
          { id: 'retry', label: '🔄 Retry', action: message },
          { id: 'help', label: '❓ Help', action: 'help' },
          { id: 'contact', label: '📞 Contact', action: 'contact' }
        ],
        type: 'error',
        isError: true
      }]);
      
      setConnectionError(true);
    } finally {
      setIsTyping(false);
    }
  }, [sessionId]);

  const handleSendMessage = useCallback(() => {
    if (!inputMessage.trim() || isTyping) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    sendMessageToBot(inputMessage);
    setInputMessage('');
  }, [inputMessage, isTyping, sendMessageToBot]);

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

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

  const handleViewProduct = useCallback((product) => {
    const productName = encodeURIComponent(product.name);
    handleRedirect(`/product/${productName}`);
  }, [handleRedirect]);

  // Memoized category icon getter
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

  // Render message text with formatting
  const renderMessageText = useCallback((text) => {
    if (!text) return null;
    
    // Bold text
    const parts = text.split(/(\*\*.*?\*\*)/g);
    
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>;
      }
      return <span key={i}>{part}</span>;
    });
  }, []);

  // Quick action buttons configuration
  const quickActions = useMemo(() => [
    { id: 'shop', label: '🛍️ Shop', icon: <FaGift />, action: 'category' },
    { id: 'price', label: '💰 Price', icon: <FaTag />, action: 'price' },
    { id: 'gift', label: '🎯 Gift', icon: <FaGift />, action: 'gift' },
    { id: 'corporate', label: '🏢 Corporate', icon: <FaBuilding />, action: 'corporate' },
    { id: 'custom', label: '✨ Custom', icon: <FaPalette />, action: 'custom' },
    { id: 'track', label: '📦 Track', icon: <FaTruck />, action: 'track' },
    { id: 'help', label: '❓ Help', icon: <FaHeadset />, action: 'help' },
    { id: 'login', label: '🔑 Login', icon: <FaSignInAlt />, action: 'login' }
  ], []);

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
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
                <p className="text-xs opacity-90">Online • Ready to help</p>
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
                  </div>
                )}

                {/* Options */}
                {msg.options?.length > 0 && !msg.products?.length && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {msg.options.map((opt) => (
                      <button
                        key={opt.id || opt.label}
                        onClick={() => handleOptionClick(opt)}
                        className="px-4 py-2 bg-white border border-[#9CAF88] text-[#8B5A2B] rounded-full text-xs hover:bg-[#9CAF88] hover:text-white transition-colors shadow-sm"
                      >
                        {opt.label || opt}
                      </button>
                    ))}
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

            {/* Quick Actions */}
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
          </div>
        </div>
      )}
    </>
  );
};

export default ChatbotWidget;