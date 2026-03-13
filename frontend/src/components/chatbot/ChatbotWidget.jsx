import React, { useState, useRef, useEffect } from 'react';
import { 
  FaComments, 
  FaTimes, 
  FaPaperPlane, 
  FaRobot, 
  FaSmile, 
  FaShoppingCart, 
  FaEye,
  FaFilter,
  FaArrowLeft,
  FaCheckCircle,
  FaExclamationCircle,
  FaTag,
  FaBoxOpen,
  FaTruck,
  FaGift
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
      }, 5000); // Retry every 5 seconds
      
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
        text: response.message || "👋 Hello! Welcome to Venus Enterprises. How can I help you today?",
        sender: 'bot',
        timestamp: new Date(),
        options: response.options || ['Browse Products', 'Price Range', 'Corporate Gifts', 'Custom Orders'],
        products: response.products || [],
        type: response.type || 'welcome'
      };
      setMessages([botMessage]);
      setConnectionError(false);
      setRetryCount(0);
    } catch (error) {
      console.error('Welcome message error:', error);
      setConnectionError(true);
      // Add offline message
      setMessages([{
        id: Date.now(),
        text: "🔴 I'm having trouble connecting to the server. Please check your connection or try again later.",
        sender: 'bot',
        timestamp: new Date(),
        options: ['Retry', 'Contact Support'],
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
        redirect: response.redirect
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
      
      let errorText = "⚠️ Cannot connect to chatbot service.";
      let errorOptions = ['Try Again', 'Browse Products'];
      
      if (error.response?.status === 429) {
        errorText = "⏳ Too many requests. Please wait a moment and try again.";
      } else if (error.code === 'ECONNABORTED') {
        errorText = "⏳ Request timeout. The server might be waking up. Please try again.";
      } else if (!navigator.onLine) {
        errorText = "📡 You appear to be offline. Please check your internet connection.";
        errorOptions = ['Retry', 'Close'];
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
    if (option === 'Retry') {
      sendMessageToBot(messages[messages.length - 2]?.text || '');
      return;
    }
    
    if (option === 'Contact Support') {
      window.location.href = '/contact';
      return;
    }
    
    if (option === 'Close') {
      setIsOpen(false);
      return;
    }
    
    if (option === 'View Cart') {
      navigate('/cart');
      return;
    }
    
    if (option === 'Continue Shopping') {
      navigate('/products');
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
      
      // Add login suggestion to chat
      const loginMessage = {
        id: Date.now(),
        text: "🔐 Please login to add items to your cart. Would you like to login now?",
        sender: 'bot',
        timestamp: new Date(),
        options: ['Login', 'Continue Browsing'],
        type: 'auth_required'
      };
      setMessages(prev => [...prev, loginMessage]);
      
      // Store product for after login
      sessionStorage.setItem('pendingCartItem', JSON.stringify(product));
      return;
    }

    try {
      // Show loading toast
      toast.loading('Adding to cart...', { id: 'addToCart' });
      
      await addToCart({
        productId: product.id,
        productName: product.name,
        price: product.price,
        quantity: 1,
        image: product.image_url
      });
      
      // Success message
      toast.success(`${product.name} added to cart!`, { id: 'addToCart' });
      
      // Add confirmation to chat with quick actions
      const confirmationMessage = {
        id: Date.now(),
        text: `✅ **${product.name}** has been added to your cart!`,
        sender: 'bot',
        timestamp: new Date(),
        options: ['🛒 View Cart', '🛍️ Continue Shopping', 'Checkout'],
        products: [],
        type: 'cart_confirmation'
      };
      setMessages(prev => [...prev, confirmationMessage]);
      
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add to cart. Please try again.', { id: 'addToCart' });
      
      // Add error message to chat
      const errorMessage = {
        id: Date.now(),
        text: "❌ Sorry, I couldn't add the item to your cart. Please try again.",
        sender: 'bot',
        timestamp: new Date(),
        options: ['Try Again', 'Browse More'],
        type: 'error'
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleViewProduct = (product) => {
    if (product.id) {
      navigate(`/product/${product.id}`);
    } else {
      navigate(`/products?search=${encodeURIComponent(product.name)}`);
    }
  };

  const handleProductAction = (product, action) => {
    if (action === 'view') {
      handleViewProduct(product);
    } else if (action === 'cart') {
      handleAddToCart(product);
    }
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
          // This is the link text
          const url = parts[index + 1];
          return (
            <a 
              key={index} 
              href={url} 
              className="text-blue-600 underline hover:text-blue-800"
              onClick={(e) => {
                e.preventDefault();
                navigate(url);
              }}
            >
              {part}
            </a>
          );
        } else if (index % 3 === 2) {
          // Skip the URL part as we already used it
          return null;
        }
        return <span key={index}>{part}</span>;
      });
    }
    
    return text;
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 bg-[#8B5A2B] text-white p-4 rounded-full shadow-lg hover:bg-[#9CAF88] transition-all duration-300 z-50 group"
        aria-label="Open chat"
      >
        {isOpen ? (
          <FaTimes size={24} />
        ) : (
          <div className="relative">
            <FaComments size={24} />
            {connectionError && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
            )}
          </div>
        )}
        {!isOpen && (
          <span className="absolute right-16 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Chat with us
          </span>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 sm:w-96 h-[600px] bg-white rounded-lg shadow-xl border border-[#E8E0D5] flex flex-col z-50 overflow-hidden animate-slideUp">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#8B5A2B] to-[#9CAF88] text-white p-4 flex items-center space-x-2">
            <div className="relative">
              <FaRobot size={24} />
              {!connectionError && (
                <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-white"></span>
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">Venus AI Assistant</h3>
              <p className="text-xs opacity-90">
                {connectionError ? 'Offline' : 'Online • Usually replies instantly'}
              </p>
            </div>
            {connectionError && (
              <span className="bg-red-500 text-xs px-2 py-1 rounded-full animate-pulse">
                Offline
              </span>
            )}
            <button 
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/20 p-1 rounded transition-colors"
            >
              <FaTimes size={16} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F5F0E8]">
            {messages.map((message, index) => (
              <div key={message.id || index} className="space-y-2">
                {/* Message Bubble */}
                <div className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl p-3 ${
                      message.sender === 'user'
                        ? 'bg-[#9CAF88] text-white rounded-br-none'
                        : message.isError
                        ? 'bg-red-100 text-red-800 border border-red-300 rounded-bl-none'
                        : 'bg-white text-[#8B5A2B] shadow-sm rounded-bl-none'
                    }`}
                  >
                    <div className="text-sm whitespace-pre-line">
                      {renderMessageText(message.text)}
                    </div>
                    <p className="text-xs mt-1 opacity-75 flex justify-end">
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                </div>
                
                {/* Products Display */}
                {message.products && message.products.length > 0 && (
                  <div className="mt-3 space-y-3">
                    <div className="flex items-center space-x-2 text-xs text-[#8B5A2B] font-semibold">
                      <FaBoxOpen />
                      <span>Products ({message.products.length})</span>
                    </div>
                    
                    {message.products.map((product, idx) => (
                      <div 
                        key={product.id || idx}
                        className="bg-white rounded-lg p-3 border border-[#E8E0D5] shadow-sm hover:shadow-md transition-all hover:scale-[1.02] cursor-pointer"
                        onClick={() => handleViewProduct(product)}
                      >
                        <div className="flex items-start space-x-3">
                          {/* Product Image */}
                          <div className="w-16 h-16 bg-[#F5F0E8] rounded-lg overflow-hidden flex-shrink-0 border border-[#E8E0D5]">
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
                                <h4 className="text-sm font-medium text-[#8B5A2B] line-clamp-1">
                                  {product.name}
                                </h4>
                                <div className="flex items-center space-x-1 mt-0.5">
                                  <FaTag className="text-[#9CAF88] text-xs" />
                                  <p className="text-xs text-gray-500">
                                    {product.category || 'Category'}
                                  </p>
                                </div>
                              </div>
                              <p className="text-sm font-bold text-[#8B5A2B] bg-[#F5F0E8] px-2 py-0.5 rounded">
                                {formatPrice(product.price)}
                              </p>
                            </div>
                            
                            {product.description && (
                              <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                {product.description}
                              </p>
                            )}
                            
                            {/* Action Buttons */}
                            <div className="flex space-x-2 mt-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleProductAction(product, 'view');
                                }}
                                className="flex-1 bg-[#9CAF88] text-white text-xs py-1.5 px-2 rounded-lg flex items-center justify-center space-x-1 hover:bg-[#8B5A2B] transition-colors"
                              >
                                <FaEye size={12} />
                                <span>View</span>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleProductAction(product, 'cart');
                                }}
                                className="flex-1 bg-[#8B5A2B] text-white text-xs py-1.5 px-2 rounded-lg flex items-center justify-center space-x-1 hover:bg-[#9CAF88] transition-colors"
                              >
                                <FaShoppingCart size={12} />
                                <span>Add to Cart</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Quick filters */}
                    {message.products.length > 3 && (
                      <div className="flex items-center space-x-2 mt-2">
                        <FaFilter className="text-[#9CAF88] text-xs" />
                        <span className="text-xs text-gray-500">Filter:</span>
                        <button className="text-xs bg-white px-2 py-1 rounded border border-[#E8E0D5] hover:bg-[#9CAF88] hover:text-white transition-colors">
                          Price: Low to High
                        </button>
                        <button className="text-xs bg-white px-2 py-1 rounded border border-[#E8E0D5] hover:bg-[#9CAF88] hover:text-white transition-colors">
                          Popular
                        </button>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Options Buttons */}
                {message.options && message.options.length > 0 && !message.products?.length && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {message.options.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => handleOptionClick(option)}
                        className="bg-white border border-[#9CAF88] text-[#8B5A2B] px-4 py-2 rounded-full text-xs hover:bg-[#9CAF88] hover:text-white transition-all hover:scale-105 shadow-sm"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            
            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white rounded-2xl p-4 shadow-sm rounded-bl-none">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-[#9CAF88] rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-[#9CAF88] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-[#9CAF88] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
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
                placeholder={connectionError ? "Service offline..." : "Ask about products, prices, or gifts..."}
                disabled={connectionError || isTyping}
                className="flex-1 px-4 py-2 border border-[#D4C9BC] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B5A2B] text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isTyping || connectionError}
                className="bg-[#8B5A2B] text-white p-2 rounded-lg hover:bg-[#9CAF88] transition-colors disabled:opacity-50 disabled:cursor-not-allowed relative group"
                title="Send message"
              >
                <FaPaperPlane size={18} />
                {!connectionError && isTyping && (
                  <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Please wait...
                  </span>
                )}
              </button>
            </div>
            
            {/* Status Messages */}
            <div className="mt-3 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                {!connectionError && !isAuthenticated && (
                  <div className="flex items-center space-x-1 text-amber-600">
                    <FaExclamationCircle />
                    <span>Login to add items to cart</span>
                  </div>
                )}
                {!connectionError && isAuthenticated && (
                  <div className="flex items-center space-x-1 text-green-600">
                    <FaCheckCircle className="text-green-500" />
                    <span>Logged in as {user?.name?.split(' ')[0] || 'User'}</span>
                  </div>
                )}
                {connectionError && (
                  <div className="flex items-center space-x-1 text-red-600">
                    <FaExclamationCircle />
                    <span>Connection lost</span>
                  </div>
                )}
              </div>
              
              {/* Quick suggestions */}
              {!connectionError && !isTyping && messages.length > 1 && (
                <button 
                  onClick={() => handleOptionClick('Browse Products')}
                  className="text-[#8B5A2B] hover:text-[#9CAF88] transition-colors flex items-center space-x-1"
                >
                  <FaGift />
                  <span>Browse</span>
                </button>
              )}
            </div>

            {/* Quick action chips */}
            {!connectionError && messages.length > 0 && !isTyping && (
              <div className="flex flex-wrap gap-1 mt-2">
                <button
                  onClick={() => handleOptionClick('Price Range')}
                  className="text-xs bg-gray-100 px-2 py-1 rounded-full hover:bg-[#9CAF88] hover:text-white transition-colors"
                >
                  💰 Price
                </button>
                <button
                  onClick={() => handleOptionClick('Corporate Gifts')}
                  className="text-xs bg-gray-100 px-2 py-1 rounded-full hover:bg-[#9CAF88] hover:text-white transition-colors"
                >
                  🏢 Corporate
                </button>
                <button
                  onClick={() => handleOptionClick('Custom Orders')}
                  className="text-xs bg-gray-100 px-2 py-1 rounded-full hover:bg-[#9CAF88] hover:text-white transition-colors"
                >
                  ✨ Custom
                </button>
                <button
                  onClick={() => handleOptionClick('Delivery')}
                  className="text-xs bg-gray-100 px-2 py-1 rounded-full hover:bg-[#9CAF88] hover:text-white transition-colors"
                >
                  🚚 Delivery
                </button>
              </div>
            )}
          </div>
        </div>
      )}
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
`;
document.head.appendChild(style);

export default ChatbotWidget;