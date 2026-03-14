import React, { useState, useRef, useEffect } from 'react';
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
  FaArrowRight
} from 'react-icons/fa';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import chatbotApi from '../../api/chatbotApi';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [connectionError, setConnectionError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  
  // Hooks
  const { addToCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // Initialize chatbot
  useEffect(() => {
    const newSessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    setSessionId(newSessionId);
    
    // Welcome message after a short delay
    const timer = setTimeout(() => {
      sendWelcomeMessage();
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Retry connection if failed
  useEffect(() => {
    if (connectionError && retryCount < 3) {
      const timer = setTimeout(() => {
        console.log(`Retrying connection... Attempt ${retryCount + 1}`);
        setConnectionError(false);
        sendWelcomeMessage();
        setRetryCount(prev => prev + 1);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [connectionError, retryCount]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendWelcomeMessage = async () => {
    setIsTyping(true);
    try {
      const response = await chatbotApi.sendMessage('', sessionId);
      const botMessage = {
        id: Date.now(),
        text: response.message || "✨ **Welcome to Venus Enterprises!** ✨\n\nI'm your AI shopping assistant. How can I help you today?",
        sender: 'bot',
        timestamp: new Date(),
        options: response.options || [
          "🛍️ **Shop by Category**",
          "💰 **Price Explorer**",
          "🎯 **Gift Finder**",
          "🏢 **Corporate Solutions**",
          "✨ **Custom Orders**",
          "❓ **Help & Support**"
        ],
        products: response.products || [],
        type: response.type || 'welcome'
      };
      setMessages([botMessage]);
      setConnectionError(false);
      setRetryCount(0);
    } catch (error) {
      console.error('Welcome message error:', error);
      setConnectionError(true);
      setMessages([{
        id: Date.now(),
        text: "🔴 **Connection Issue**\n\nI'm having trouble connecting to the server. Please try again or contact support.",
        sender: 'bot',
        timestamp: new Date(),
        options: ['🔄 Retry', '📞 Contact Support'],
        products: [],
        type: 'error'
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const sendMessageToBot = async (message) => {
    if (!message.trim()) return;
    
    setIsTyping(true);
    setConnectionError(false);
    
    try {
      console.log('📤 Sending to bot:', message);
      const response = await chatbotApi.sendMessage(message, sessionId);
      console.log('📥 Bot response:', response);
      
      const botMessage = {
        id: Date.now(),
        text: response.message || "Here's what I found:",
        sender: 'bot',
        timestamp: new Date(),
        options: response.options || [],
        products: response.products || [],
        type: response.type || 'response',
        action: response.action,
        redirect: response.redirect,
        category: response.category
      };
      
      setMessages(prev => [...prev, botMessage]);
      
      // Handle special actions
      if (response.action === 'redirect' && response.redirect) {
        setTimeout(() => {
          navigate(response.redirect);
          toast.success('Redirecting...');
        }, 1500);
      }
      
    } catch (error) {
      console.error('❌ Chatbot error:', error);
      
      let errorText = "⚠️ **Cannot connect to chatbot service.**";
      let errorOptions = ['🔄 Try Again', '📞 Contact Support'];
      
      if (error.response?.status === 429) {
        errorText = "⏳ **Too many requests.** Please wait a moment and try again.";
      } else if (error.code === 'ECONNABORTED') {
        errorText = "⏳ **Request timeout.** The server might be waking up. Please try again.";
      } else if (!navigator.onLine) {
        errorText = "📡 **You appear to be offline.** Please check your internet connection.";
        errorOptions = ['🔄 Retry', '❌ Close'];
      }
      
      const errorMessage = {
        id: Date.now(),
        text: errorText,
        sender: 'bot',
        timestamp: new Date(),
        options: errorOptions,
        products: [],
        type: 'error',
        isError: true
      };
      
      setMessages(prev => [...prev, errorMessage]);
      setConnectionError(true);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSendMessage = () => {
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
  };

  const handleOptionClick = (option) => {
    console.log('Option clicked:', option);
    
    // Handle special options
    if (option === '🔄 Retry' || option === 'Retry' || option === '🔄 Try Again') {
      sendMessageToBot(messages[messages.length - 2]?.text || '');
      return;
    }
    
    if (option === '📞 Contact Support' || option === 'Contact Support' || option === '📞 Contact Page') {
      window.open('https://venus-frontend-guqs.onrender.com/contact', '_blank');
      return;
    }

    if (option === '📱 WhatsApp Chat') {
      window.open('https://wa.me/919876543210', '_blank');
      return;
    }

    if (option === '📧 Email Support') {
      window.location.href = 'mailto:support@venusenterprises.com';
      return;
    }

    if (option === '📍 Visit Office') {
      window.open('https://maps.google.com/?q=Peenya+Industrial+Area+Bengaluru', '_blank');
      return;
    }

    if (option === '📞 Talk to Specialist' || option === '📞 Talk to Designer') {
      window.open('https://venus-frontend-guqs.onrender.com/contact', '_blank');
      return;
    }
    
    if (option === '❌ Close' || option === 'Close') {
      setIsOpen(false);
      return;
    }
    
    if (option === '🛒 View Cart' || option === 'View Cart') {
      navigate('/cart');
      return;
    }
    
    if (option === '🛍️ Continue Shopping' || option === 'Continue Shopping') {
      navigate('/products');
      return;
    }

    if (option === '🔙 Main Menu' || option === 'Main Menu') {
      const userMessage = {
        id: Date.now(),
        text: '🔙 Main Menu',
        sender: 'user',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, userMessage]);
      sendMessageToBot('Main Menu');
      return;
    }
    
    const userMessage = {
      id: Date.now(),
      text: option,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    sendMessageToBot(option);
  };

  const handleAddToCart = async (product) => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      
      const loginMessage = {
        id: Date.now(),
        text: "🔐 **Login Required**\n\nPlease login to add items to your cart. Would you like to login now?",
        sender: 'bot',
        timestamp: new Date(),
        options: ['🔑 Login', '🛍️ Continue Browsing'],
        type: 'auth_required'
      };
      setMessages(prev => [...prev, loginMessage]);
      
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
      
      const confirmationMessage = {
        id: Date.now(),
        text: `✅ **${product.name}** has been added to your cart!`,
        sender: 'bot',
        timestamp: new Date(),
        options: ['🛒 View Cart', '🛍️ Continue Shopping', '💳 Checkout'],
        products: [],
        type: 'cart_confirmation'
      };
      setMessages(prev => [...prev, confirmationMessage]);
      
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add to cart. Please try again.', { id: 'addToCart' });
      
      const errorMessage = {
        id: Date.now(),
        text: "❌ **Sorry, I couldn't add the item to your cart.** Please try again.",
        sender: 'bot',
        timestamp: new Date(),
        options: ['🔄 Try Again', '🛍️ Browse More'],
        type: 'error'
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleViewProduct = (product) => {
    const productName = encodeURIComponent(product.name);
    const productUrl = `/product/${productName}`;
    navigate(productUrl);
  };

  const handleProductAction = (product, action) => {
    if (action === 'view') {
      handleViewProduct(product);
    } else if (action === 'cart') {
      handleAddToCart(product);
    }
  };

  const handleQuickAction = (action) => {
    const actionMessages = {
      'shop': '🛍️ Shop by Category',
      'price': '💰 Price Explorer',
      'gift': '🎯 Gift Finder',
      'corporate': '🏢 Corporate Solutions',
      'custom': '✨ Custom Orders',
      'help': '❓ Help & Support',
      'sort_low': '📈 Price: Low to High',
      'sort_high': '📉 Price: High to Low'
    };
    
    const userMessage = {
      id: Date.now(),
      text: actionMessages[action],
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    sendMessageToBot(actionMessages[action]);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatPrice = (price) => {
    return `₹${parseFloat(price).toLocaleString('en-IN')}`;
  };

  const renderMessageText = (text) => {
    // Convert markdown-style links to actual links
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts = text.split(linkRegex);
    
    if (parts.length > 1) {
      return parts.map((part, index) => {
        if (index % 3 === 1) {
          const url = parts[index + 1];
          return (
            <a 
              key={index} 
              href={url} 
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline hover:text-blue-800 font-medium"
              onClick={(e) => e.stopPropagation()}
            >
              {part} <FaArrowRight className="inline ml-1 text-xs" />
            </a>
          );
        } else if (index % 3 === 2) {
          return null;
        }
        return <span key={index}>{part}</span>;
      });
    }
    
    // Format bold text
    const boldRegex = /\*\*(.*?)\*\*/g;
    const boldParts = text.split(boldRegex);
    
    if (boldParts.length > 1) {
      return boldParts.map((part, index) => {
        if (index % 2 === 1) {
          return <strong key={index} className="font-bold">{part}</strong>;
        }
        return <span key={index}>{part}</span>;
      });
    }
    
    return text;
  };

  const renderCreativeOptions = (options) => {
    if (!options || options.length === 0) return null;
    
    return (
      <div className="flex flex-wrap gap-2 mt-3">
        {options.map((option, index) => {
          let buttonClass = "px-4 py-2 rounded-full text-xs font-medium transition-all hover:scale-105 shadow-sm ";
          
          if (option.includes('🛍️') || option.includes('💰') || option.includes('🎯')) {
            buttonClass += "bg-gradient-to-r from-[#8B5A2B] to-[#9CAF88] text-white hover:from-[#9CAF88] hover:to-[#8B5A2B]";
          } else if (option.includes('🔙')) {
            buttonClass += "bg-gray-200 text-gray-700 hover:bg-gray-300";
          } else if (option.includes('📞') || option.includes('📱') || option.includes('📧')) {
            buttonClass += "bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-300";
          } else if (option.includes('🏢') || option.includes('📊')) {
            buttonClass += "bg-purple-100 text-purple-700 hover:bg-purple-200 border border-purple-300";
          } else if (option.includes('✨') || option.includes('🎨')) {
            buttonClass += "bg-pink-100 text-pink-700 hover:bg-pink-200 border border-pink-300";
          } else if (option.includes('📈') || option.includes('📉')) {
            buttonClass += "bg-green-100 text-green-700 hover:bg-green-200 border border-green-300";
          } else {
            buttonClass += "bg-white border border-[#9CAF88] text-[#8B5A2B] hover:bg-[#9CAF88] hover:text-white";
          }
          
          return (
            <motion.button
              key={index}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleOptionClick(option)}
              className={buttonClass}
            >
              {option}
            </motion.button>
          );
        })}
      </div>
    );
  };

  const getCategoryIcon = (category) => {
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
  };

  return (
    <>
      {/* Chat Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-[#8B5A2B] to-[#9CAF88] text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-50 group"
        aria-label="Open chat"
      >
        {isOpen ? (
          <FaTimes size={24} />
        ) : (
          <div className="relative">
            <FaComments size={24} />
            {connectionError && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></span>
            )}
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
          </div>
        )}
        {!isOpen && (
          <span className="absolute right-16 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white text-xs py-2 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg">
            Chat with us 💬
          </span>
        )}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 w-80 sm:w-96 h-[600px] bg-white rounded-2xl shadow-2xl border border-[#E8E0D5] flex flex-col z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#8B5A2B] to-[#9CAF88] text-white p-4 flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <FaRobot size={20} />
                </div>
                {!connectionError && (
                  <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></span>
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">Venus AI Assistant</h3>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center">
                    <FaStar className="text-yellow-300 text-xs" />
                    <FaStar className="text-yellow-300 text-xs" />
                    <FaStar className="text-yellow-300 text-xs" />
                    <FaStar className="text-yellow-300 text-xs" />
                    <FaStar className="text-yellow-300 text-xs" />
                  </div>
                  <span className="text-xs opacity-90">4.9 (500+ chats)</span>
                </div>
              </div>
              {connectionError && (
                <span className="bg-red-500 text-xs px-2 py-1 rounded-full animate-pulse">
                  Offline
                </span>
              )}
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(false)}
                className="hover:bg-white/20 p-2 rounded-full transition-colors"
              >
                <FaTimes size={16} />
              </motion.button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-[#F5F0E8] to-white">
              {messages.map((message, index) => (
                <motion.div
                  key={message.id || index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="space-y-2"
                >
                  {/* Message Bubble */}
                  <div className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[85%] rounded-2xl p-3 ${
                        message.sender === 'user'
                          ? 'bg-gradient-to-r from-[#9CAF88] to-[#8B5A2B] text-white rounded-br-none'
                          : message.isError
                          ? 'bg-red-50 text-red-800 border border-red-200 rounded-bl-none'
                          : 'bg-white text-[#8B5A2B] shadow-md rounded-bl-none border border-[#E8E0D5]'
                      }`}
                    >
                      <div className="text-sm whitespace-pre-line leading-relaxed">
                        {renderMessageText(message.text)}
                      </div>
                      <p className="text-xs mt-2 opacity-75 flex justify-end">
                        {formatTime(message.timestamp)}
                      </p>
                    </div>
                  </div>
                  
                  {/* Products Display */}
                  {message.products && message.products.length > 0 && (
                    <div className="mt-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-xs text-[#8B5A2B] font-semibold">
                          <FaBoxOpen />
                          <span>Products ({message.products.length})</span>
                        </div>
                        {message.category && (
                          <div className="flex items-center space-x-1 text-xs bg-[#F5F0E8] px-2 py-1 rounded-full">
                            {getCategoryIcon(message.category)}
                            <span>{message.category}</span>
                          </div>
                        )}
                      </div>
                      
                      {message.products.map((product, idx) => (
                        <motion.div
                          key={product.id || idx}
                          whileHover={{ scale: 1.02 }}
                          className="bg-white rounded-xl p-3 border border-[#E8E0D5] shadow-sm hover:shadow-md transition-all cursor-pointer"
                          onClick={() => handleViewProduct(product)}
                        >
                          <div className="flex items-start space-x-3">
                            {/* Product Image */}
                            <div className="w-16 h-16 bg-gradient-to-br from-[#F5F0E8] to-white rounded-lg overflow-hidden flex-shrink-0 border border-[#E8E0D5]">
                              <img 
                                src={product.image_url || '/images/placeholder.jpg'} 
                                alt={product.name}
                                className="w-full h-full object-cover"
                                onError={(e) => { 
                                  e.target.src = '/images/placeholder.jpg';
                                  e.target.onerror = null;
                                }}
                              />
                            </div>
                            
                            {/* Product Details */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h4 className="text-sm font-semibold text-[#8B5A2B] line-clamp-1">
                                    {product.name}
                                  </h4>
                                  <div className="flex items-center space-x-1 mt-0.5">
                                    {getCategoryIcon(product.category)}
                                    <p className="text-xs text-gray-500">
                                      {product.category || 'Category'}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-bold text-[#8B5A2B]">
                                    {formatPrice(product.price)}
                                  </p>
                                  {product.discount_percent > 0 && (
                                    <p className="text-xs text-green-600">{product.discount_percent}% off</p>
                                  )}
                                </div>
                              </div>
                              
                              {product.description && (
                                <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                  {product.description}
                                </p>
                              )}
                              
                              {/* Stock Status */}
                              <p className={`text-xs mt-1 ${
                                product.in_stock ? 'text-green-600' : 'text-red-500'
                              }`}>
                                {product.stock_status}
                              </p>
                              
                              {/* Action Buttons */}
                              <div className="flex space-x-2 mt-2">
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleProductAction(product, 'view');
                                  }}
                                  className="flex-1 bg-[#9CAF88] text-white text-xs py-1.5 px-2 rounded-lg flex items-center justify-center space-x-1 hover:bg-[#8B5A2B] transition-colors"
                                >
                                  <FaEye size={12} />
                                  <span>View</span>
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleProductAction(product, 'cart');
                                  }}
                                  className="flex-1 bg-[#8B5A2B] text-white text-xs py-1.5 px-2 rounded-lg flex items-center justify-center space-x-1 hover:bg-[#9CAF88] transition-colors"
                                >
                                  <FaShoppingCart size={12} />
                                  <span>Add to Cart</span>
                                </motion.button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                      
                      {/* Quick filters */}
                      {message.products.length > 3 && (
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center space-x-2">
                            <FaFilter className="text-[#9CAF88] text-xs" />
                            <span className="text-xs text-gray-500">Sort:</span>
                          </div>
                          <div className="flex space-x-2">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              onClick={() => handleQuickAction('sort_low')}
                              className="text-xs bg-white px-3 py-1.5 rounded-full border border-[#E8E0D5] hover:bg-[#9CAF88] hover:text-white transition-colors flex items-center space-x-1"
                            >
                              <span>📈</span>
                              <span>Low to High</span>
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              onClick={() => handleQuickAction('sort_high')}
                              className="text-xs bg-white px-3 py-1.5 rounded-full border border-[#E8E0D5] hover:bg-[#9CAF88] hover:text-white transition-colors flex items-center space-x-1"
                            >
                              <span>📉</span>
                              <span>High to Low</span>
                            </motion.button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Options Buttons */}
                  {message.options && message.options.length > 0 && !message.products?.length && (
                    renderCreativeOptions(message.options)
                  )}
                </motion.div>
              ))}
              
              {/* Typing Indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-white rounded-2xl p-4 shadow-md rounded-bl-none border border-[#E8E0D5]">
                    <div className="flex space-x-2">
                      <motion.div
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                        className="w-2 h-2 bg-[#9CAF88] rounded-full"
                      />
                      <motion.div
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                        className="w-2 h-2 bg-[#9CAF88] rounded-full"
                      />
                      <motion.div
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                        className="w-2 h-2 bg-[#9CAF88] rounded-full"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-[#E8E0D5] p-4 bg-white">
              <div className="flex space-x-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={connectionError ? "Service offline..." : "Ask me anything..."}
                  disabled={connectionError || isTyping}
                  className="flex-1 px-4 py-3 border border-[#D4C9BC] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B5A2B] text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isTyping || connectionError}
                  className="bg-gradient-to-r from-[#8B5A2B] to-[#9CAF88] text-white p-3 rounded-xl hover:from-[#9CAF88] hover:to-[#8B5A2B] transition-colors disabled:opacity-50 disabled:cursor-not-allowed relative group shadow-md"
                  title="Send message"
                >
                  <FaPaperPlane size={18} />
                </motion.button>
              </div>
              
              {/* Status Bar */}
              <div className="mt-3 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  {!connectionError && !isAuthenticated && (
                    <div className="flex items-center space-x-1 text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                      <FaExclamationCircle />
                      <span>Login to add items</span>
                    </div>
                  )}
                  {!connectionError && isAuthenticated && (
                    <div className="flex items-center space-x-1 text-green-600 bg-green-50 px-2 py-1 rounded-full">
                      <FaCheckCircle />
                      <span>{user?.name?.split(' ')[0] || 'User'}</span>
                    </div>
                  )}
                  {connectionError && (
                    <div className="flex items-center space-x-1 text-red-600 bg-red-50 px-2 py-1 rounded-full">
                      <FaExclamationCircle />
                      <span>Offline</span>
                    </div>
                  )}
                </div>
                
                {/* Business Hours */}
                <div className="flex items-center space-x-1 text-gray-500">
                  <FaClock className="text-xs" />
                  <span className="text-[10px]">24/7 Support</span>
                </div>
              </div>

              {/* Enhanced Quick Action Chips */}
              {!connectionError && messages.length > 0 && !isTyping && (
                <div className="flex flex-wrap gap-1.5 mt-3 pt-2 border-t border-gray-100">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleQuickAction('shop')}
                    className="text-xs bg-gradient-to-r from-[#8B5A2B] to-[#9CAF88] text-white px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1"
                  >
                    <span>🛍️</span> Shop
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleQuickAction('price')}
                    className="text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded-full border border-green-300 flex items-center gap-1"
                  >
                    <span>💰</span> Price
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleQuickAction('gift')}
                    className="text-xs bg-pink-100 text-pink-700 px-3 py-1.5 rounded-full border border-pink-300 flex items-center gap-1"
                  >
                    <span>🎯</span> Gift Finder
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleQuickAction('corporate')}
                    className="text-xs bg-purple-100 text-purple-700 px-3 py-1.5 rounded-full border border-purple-300 flex items-center gap-1"
                  >
                    <span>🏢</span> Corporate
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleQuickAction('custom')}
                    className="text-xs bg-yellow-100 text-yellow-700 px-3 py-1.5 rounded-full border border-yellow-300 flex items-center gap-1"
                  >
                    <span>✨</span> Custom
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleQuickAction('help')}
                    className="text-xs bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full border border-blue-300 flex items-center gap-1"
                  >
                    <span>❓</span> Help
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleQuickAction('sort_low')}
                    className="text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full border border-gray-300 flex items-center gap-1"
                  >
                    <span>📈</span> Low to High
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleQuickAction('sort_high')}
                    className="text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full border border-gray-300 flex items-center gap-1"
                  >
                    <span>📉</span> High to Low
                  </motion.button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// Add animation styles
const style = document.createElement('style');
style.textContent = `
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .animate-slideUp {
    animation: slideUp 0.3s ease-out;
  }
  
  .line-clamp-1 {
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  /* Custom scrollbar */
  .overflow-y-auto::-webkit-scrollbar {
    width: 6px;
  }
  
  .overflow-y-auto::-webkit-scrollbar-track {
    background: #F5F0E8;
  }
  
  .overflow-y-auto::-webkit-scrollbar-thumb {
    background: #9CAF88;
    border-radius: 3px;
  }
  
  .overflow-y-auto::-webkit-scrollbar-thumb:hover {
    background: #8B5A2B;
  }
`;
document.head.appendChild(style);

export default ChatbotWidget;