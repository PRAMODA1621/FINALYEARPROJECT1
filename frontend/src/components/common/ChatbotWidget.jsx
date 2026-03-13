import React, { useState, useRef, useEffect } from 'react';
import { FaComments, FaTimes, FaPaperPlane, FaRobot } from 'react-icons/fa';
import axios from 'axios';
import toast from 'react-hot-toast';

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

const CHATBOT_API = "https://finalyearproject1-1.onrender.com/api/chat";

  useEffect(() => {
    // Add welcome message
    setMessages([
      {
        id: 1,
        text: "Hello! I'm your Venus assistant. How can I help you with corporate gifts today?",
        sender: 'bot',
        timestamp: new Date()
      }
    ]);
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

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      // Check if chatbot service is running
      let response;
      try {
        response = await axios.post(`${CHATBOT_URL}/chat`, {
          message: inputMessage,
          session_id: localStorage.getItem('chatSessionId')
        }, { timeout: 60000 });
      } catch (connectionError) {
        console.log('Chatbot service not available, using fallback responses');
        // Fallback responses when Python service is not running
        const fallbackResponses = [
          "I'd be happy to help with that! For specific product information, please visit our products page.",
          "Our corporate gifts include wooden name plates, acrylic awards, metal trophies, and gift sets.",
          "You can customize products with engraving, fonts, colors, and logos.",
          "For immediate assistance, please email support@venusenterprises.com",
          "I'm currently in offline mode, but I can still help with basic questions!"
        ];
        
        const botMessage = {
          id: Date.now() + 1,
          text: fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)],
          sender: 'bot',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMessage]);
        setIsTyping(false);
        return;
      }
      
      if (response && response.data) {
        const botMessage = {
          id: Date.now() + 1,
          text: response.data.message || "Thanks for your message! Our team will get back to you soon.",
          sender: 'bot',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMessage]);
      }
    } catch (error) {
      console.error('Chatbot error:', error);
      
      // Fallback response
      const errorMessage = {
        id: Date.now() + 1,
        text: "I'm here to help! You can ask me about products, pricing, or custom orders. What would you like to know?",
        sender: 'bot',
        timestamp: new Date(),
        isError: false
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
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
        <div className="fixed bottom-24 right-6 w-80 sm:w-96 h-[500px] bg-white rounded-lg shadow-xl border border-[#E8E0D5] flex flex-col z-50 overflow-hidden">
          {/* Header */}
          <div className="bg-[#8B5A2B] text-white p-4 flex items-center space-x-2">
            <FaRobot size={20} />
            <h3 className="font-medium">Venus Assistant</h3>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.sender === 'user'
                      ? 'bg-[#9CAF88] text-white'
                      : message.isError
                      ? 'bg-red-100 text-red-800'
                      : 'bg-[#F5F0E8] text-[#8B5A2B]'
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  <p className="text-xs mt-1 opacity-75">
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-[#F5F0E8] rounded-lg p-3">
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

          {/* Input */}
          <div className="border-t border-[#E8E0D5] p-4">
            <div className="flex space-x-2">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 px-3 py-2 border border-[#D4C9BC] rounded-md focus:outline-none focus:ring-1 focus:ring-[#8B5A2B] text-sm"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isTyping}
                className="bg-[#8B5A2B] text-white p-2 rounded-md hover:bg-[#9CAF88] transition-colors disabled:opacity-50"
              >
                <FaPaperPlane size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatbotWidget;