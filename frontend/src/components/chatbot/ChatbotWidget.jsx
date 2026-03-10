import React, { useState, useRef, useEffect } from 'react';
import { FaComments, FaTimes, FaPaperPlane, FaRobot, FaSmile, FaShoppingCart, FaEye } from 'react-icons/fa';
import { useCart } from '../../contexts/Cartcontext';
import { useAuth } from '../../contexts/AuthContext';
import chatbotApi from '../../api/chatbotApi';
import toast from 'react-hot-toast';

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [connectionError, setConnectionError] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  
  // Get cart and auth functions
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    // Generate session ID
    const newSessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    setSessionId(newSessionId);
    
    // Start chat with empty message to get language selection
    setTimeout(() => {
      sendMessageToBot('');
    }, 500);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessageToBot = async (message) => {
    setIsTyping(true);
    
    try {
      console.log('📤 Sending to bot:', message);
      const response = await chatbotApi.sendMessage(message, sessionId);
      console.log('📥 Bot response:', response);
      console.log('📦 Products in response:', response.products);
      
      // Create bot message with all data
      const botMessage = {
        id: Date.now(),
        text: response.message,
        sender: 'bot',
        timestamp: new Date(),
        options: response.options || [],
        products: response.products || [],
        type: response.type,
        action: response.action,
        redirect: response.redirect,
        product: response.product
      };
      
      setMessages(prev => [...prev, botMessage]);
      
      // Handle special actions
      if (response.action === 'view_product' && response.redirect) {
        setTimeout(() => {
          window.location.href = response.redirect;
        }, 1500);
      }
      
    } catch (error) {
      console.error('Chatbot error:', error);
      setConnectionError(true);
      
      const errorMessage = {
        id: Date.now(),
        text: "⚠️ Cannot connect to chatbot service. Please make sure the Python server is running on port 8000.",
        sender: 'bot',
        timestamp: new Date(),
        options: [],
        products: [],
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

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
    
    const userMessage = {
      id: Date.now(),
      text: option,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    sendMessageToBot(option);
  };

  // FIXED: Actually add to cart function
  const handleAddToCart = async (product) => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      return;
    }

    try {
      // Add to cart using the context
      await addToCart({
        productName: product.name,
        quantity: 1
      });
      
      // Show success message
      toast.success(`${product.name} added to cart!`);
      
      // Add confirmation message to chat
      const confirmationMessage = {
        id: Date.now(),
        text: `✅ Added ${product.name} to your cart!`,
        sender: 'bot',
        timestamp: new Date(),
        options: []
      };
      setMessages(prev => [...prev, confirmationMessage]);
      
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add to cart');
    }
  };

  const handleViewProduct = (product) => {
    window.location.href = `/product/${encodeURIComponent(product.name)}`;
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

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 bg-[#8B5A2B] text-white p-4 rounded-full shadow-lg hover:bg-[#9CAF88] transition-all duration-300 z-50"
        aria-label="Open chat"
      >
        {isOpen ? <FaTimes size={24} /> : <FaComments size={24} />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 sm:w-96 h-[600px] bg-white rounded-lg shadow-xl border border-[#E8E0D5] flex flex-col z-50 overflow-hidden">
          {/* Header */}
          <div className="bg-[#8B5A2B] text-white p-4 flex items-center space-x-2">
            <FaRobot size={20} />
            <h3 className="font-medium">Venus Assistant</h3>
            {connectionError && (
              <span className="ml-auto text-xs bg-red-500 px-2 py-1 rounded">Offline</span>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F5F0E8]">
            {messages.map((message) => (
              <div key={message.id} className="space-y-2">
                {/* Message Bubble */}
                <div className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.sender === 'user'
                        ? 'bg-[#9CAF88] text-white'
                        : message.isError
                        ? 'bg-red-100 text-red-800 border border-red-300'
                        : 'bg-white text-[#8B5A2B] shadow-sm'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-line">{message.text}</p>
                    <p className="text-xs mt-1 opacity-75">
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                </div>
                
                {/* PRODUCTS DISPLAY - This will show when products exist */}
                {message.products && message.products.length > 0 && (
                  <div className="mt-2 space-y-3">
                    <p className="text-xs font-semibold text-[#8B5A2B] px-1">
                      Select a product:
                    </p>
                    {message.products.map((product, index) => (
                      <div 
                        key={product.id || index}
                        className="bg-white rounded-lg p-3 border border-[#E8E0D5] shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start space-x-3">
                          {/* Product Image */}
                          <div className="w-16 h-16 bg-[#F5F0E8] rounded overflow-hidden flex-shrink-0">
                            <img 
                              src={product.image_url || '/images/placeholder.jpg'} 
                              alt={product.name}
                              className="w-full h-full object-cover"
                              onError={(e) => { e.target.src = '/images/placeholder.jpg'; }}
                            />
                          </div>
                          
                          {/* Product Details */}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-[#8B5A2B] truncate">
                              {product.name}
                            </h4>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {product.category || 'Category'}
                            </p>
                            <p className="text-sm font-bold text-[#8B5A2B] mt-1">
                              {formatPrice(product.price)}
                            </p>
                            
                            {/* Action Buttons */}
                            <div className="flex space-x-2 mt-2">
                              <button
                                onClick={() => handleProductAction(product, 'view')}
                                className="flex-1 bg-[#9CAF88] text-white text-xs py-1.5 px-2 rounded flex items-center justify-center space-x-1 hover:bg-[#8B5A2B] transition-colors"
                              >
                                <FaEye size={12} />
                                <span>View</span>
                              </button>
                              <button
                                onClick={() => handleProductAction(product, 'cart')}
                                className="flex-1 bg-[#8B5A2B] text-white text-xs py-1.5 px-2 rounded flex items-center justify-center space-x-1 hover:bg-[#9CAF88] transition-colors"
                              >
                                <FaShoppingCart size={12} />
                                <span>Add to Cart</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Helper text */}
                    <p className="text-xs text-gray-500 italic mt-1 px-1">
                      Click View to see details or Add to Cart to purchase
                    </p>
                  </div>
                )}
                
                {/* Options Buttons - Show when options exist AND no products (to avoid duplication) */}
                {message.options && message.options.length > 0 && !message.products?.length && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {message.options.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => handleOptionClick(option)}
                        className="bg-white border border-[#9CAF88] text-[#8B5A2B] px-3 py-1.5 rounded-full text-xs hover:bg-[#9CAF88] hover:text-white transition-colors shadow-sm"
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
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <div className="flex space-x-1">
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
                placeholder="Type your message..."
                disabled={connectionError}
                className="flex-1 px-3 py-2 border border-[#D4C9BC] rounded-md focus:outline-none focus:ring-1 focus:ring-[#8B5A2B] text-sm disabled:bg-gray-100"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isTyping || connectionError}
                className="bg-[#8B5A2B] text-white p-2 rounded-md hover:bg-[#9CAF88] transition-colors disabled:opacity-50"
              >
                <FaPaperPlane size={16} />
              </button>
            </div>
            {!connectionError && !isAuthenticated && (
              <div className="mt-2 text-xs text-amber-600 flex items-center">
                ⚠️ Please login to add items to cart
              </div>
            )}
            {!connectionError && isAuthenticated && (
              <div className="mt-2 text-xs text-gray-500 flex items-center">
                <FaSmile className="mr-1" /> Ask about products, pricing, or customization
              </div>
            )}
            {connectionError && (
              <div className="mt-2 text-xs text-red-600">
                ⚠️ Chatbot server not running. Start with: cd python-chatbot && python app.py
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ChatbotWidget;