import React, { useState, useEffect } from 'react';
import { FaComments, FaTimes, FaPaperPlane, FaRobot, FaUser } from 'react-icons/fa';
import axios from 'axios';

const WorkingChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      text: "Hello! I'm your Venus assistant. I can help you find the perfect corporate gift. What type of gift are you looking for? (Wooden, Acrylic, Metal, Gifts, Mementos, Marble)", 
      sender: 'bot' 
    }
  ]);
  const [input, setInput] = useState('');
  const [products, setProducts] = useState([]);
  const [step, setStep] = useState('greeting'); // greeting, category, price, showing

  const API_URL = import.meta.env.VITE_API_URL || '/api';

  // Fetch products based on category and price
  const fetchProducts = async (category, minPrice = 0, maxPrice = 99999) => {
    try {
      const response = await axios.get(`${API_URL}/products`, {
        params: { category, minPrice, maxPrice }
      });
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  };

  const getBotResponse = async (userInput) => {
    const input = userInput.toLowerCase().trim();
    
    // Step 1: Greeting -> Ask for category
    if (step === 'greeting') {
      setStep('category');
      return {
        text: "Great! Please select a category:\n\n• Wooden\n• Acrylic\n• Metal\n• Gifts\n• Mementos\n• Marble",
        options: ["Wooden", "Acrylic", "Metal", "Gifts", "Mementos", "Marble"]
      };
    }
    
    // Step 2: Category selected -> Ask for price range
    else if (step === 'category') {
      const categories = ["wooden", "acrylic", "metal", "gifts", "mementos", "marble"];
      const selectedCategory = categories.find(cat => input.includes(cat));
      
      if (selectedCategory) {
        setStep('price');
        return {
          text: `You selected ${selectedCategory}. What's your budget range?\n\n• Under ₹1000\n• ₹1000 - ₹2000\n• ₹2000 - ₹3000\n• Above ₹3000`,
          options: ["Under ₹1000", "₹1000 - ₹2000", "₹2000 - ₹3000", "Above ₹3000"],
          category: selectedCategory
        };
      } else {
        return {
          text: "Please select a valid category from the options above.",
          options: ["Wooden", "Acrylic", "Metal", "Gifts", "Mementos", "Marble"]
        };
      }
    }
    
    // Step 3: Price selected -> Show products
    else if (step === 'price') {
      let minPrice = 0, maxPrice = 99999;
      
      if (input.includes('under 1000') || input.includes('under ₹1000')) {
        minPrice = 0; maxPrice = 1000;
      } else if (input.includes('1000') && input.includes('2000')) {
        minPrice = 1000; maxPrice = 2000;
      } else if (input.includes('2000') && input.includes('3000')) {
        minPrice = 2000; maxPrice = 3000;
      } else if (input.includes('above 3000') || input.includes('above ₹3000')) {
        minPrice = 3000; maxPrice = 99999;
      } else {
        return {
          text: "Please select a valid price range.",
          options: ["Under ₹1000", "₹1000 - ₹2000", "₹2000 - ₹3000", "Above ₹3000"]
        };
      }
      
      // Get the previously selected category from the last message
      const lastBotMessage = messages.filter(m => m.sender === 'bot').pop();
      const category = lastBotMessage?.category || 'Wooden';
      
      const fetchedProducts = await fetchProducts(category, minPrice, maxPrice);
      setProducts(fetchedProducts);
      
      if (fetchedProducts.length === 0) {
        setStep('category');
        return {
          text: `Sorry, no products found in ${category} within that price range. Would you like to try a different category?`,
          options: ["Wooden", "Acrylic", "Metal", "Gifts", "Mementos", "Marble"]
        };
      }
      
      setStep('showing');
      const productList = fetchedProducts.map((p, i) => 
        `${i+1}. ${p.name} - ₹${p.price}`
      ).join('\n');
      
      return {
        text: `I found these products:\n\n${productList}\n\nReply with the number to see details, or ask about another category.`,
        products: fetchedProducts
      };
    }
    
    // Step 4: Showing products -> Handle product selection
    else if (step === 'showing') {
      // Check if input is a number (product selection)
      const productIndex = parseInt(input) - 1;
      if (!isNaN(productIndex) && productIndex >= 0 && productIndex < products.length) {
        const product = products[productIndex];
        return {
          text: `**${product.name}**\nPrice: ₹${product.price}\nCategory: ${product.category}\nStock: ${product.stock} available\n\nWould you like to:\n• View details\n• Add to cart\n• Browse other products`,
          options: ["View Details", "Add to Cart", "Browse Other"],
          selectedProduct: product
        };
      }
      
      // Handle other queries
      if (input.includes('price') || input.includes('cost')) {
        return {
          text: "Our products range from ₹299 to ₹3999. You can browse by category or tell me your budget.",
          options: ["Wooden", "Acrylic", "Metal", "Gifts", "Mementos", "Marble"]
        };
      } else if (input.includes('wooden')) {
        setStep('category');
        return {
          text: "You selected Wooden products. What's your budget?",
          options: ["Under ₹1000", "₹1000 - ₹2000", "₹2000 - ₹3000", "Above ₹3000"],
          category: "Wooden"
        };
      } else if (input.includes('acrylic')) {
        setStep('category');
        return {
          text: "You selected Acrylic products. What's your budget?",
          options: ["Under ₹1000", "₹1000 - ₹2000", "₹2000 - ₹3000", "Above ₹3000"],
          category: "Acrylic"
        };
      } else if (input.includes('metal')) {
        setStep('category');
        return {
          text: "You selected Metal products. What's your budget?",
          options: ["Under ₹1000", "₹1000 - ₹2000", "₹2000 - ₹3000", "Above ₹3000"],
          category: "Metal"
        };
      } else if (input.includes('gift')) {
        setStep('category');
        return {
          text: "You selected Gifts. What's your budget?",
          options: ["Under ₹1000", "₹1000 - ₹2000", "₹2000 - ₹3000", "Above ₹3000"],
          category: "Gifts"
        };
      } else if (input.includes('shipping')) {
        return {
          text: "Free shipping on orders above ₹5000. Standard delivery takes 3-5 business days."
        };
      } else if (input.includes('return')) {
        return {
          text: "30-day return policy for unused items. Customized items cannot be returned unless defective."
        };
      } else if (input.includes('custom')) {
        return {
          text: "Visit our Custom Order page to create personalized gifts with engraving and logo upload!"
        };
      } else if (input.includes('contact')) {
        return {
          text: "Email: support@venusenterprises.com\nPhone: +91 98765 43210"
        };
      } else if (input.includes('thank')) {
        setStep('greeting');
        return {
          text: "You're welcome! Is there anything else I can help you with?"
        };
      }
      
      return {
        text: "I can help you find products by category or price. What would you like to know?",
        options: ["Wooden", "Acrylic", "Metal", "Gifts", "Mementos", "Marble", "Price Range", "Shipping"]
      };
    }
    
    // Default response
    return {
      text: "I can help you with product information, pricing, shipping, returns, and custom orders. What would you like to know?",
      options: ["Wooden", "Acrylic", "Metal", "Gifts", "Mementos", "Marble", "Price Range", "Shipping"]
    };
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    // Add user message
    const userMessage = {
      id: Date.now(),
      text: input,
      sender: 'user'
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    // Get bot response
    const response = await getBotResponse(input);
    
    // Add bot message
    const botMessage = {
      id: Date.now() + 1,
      text: response.text,
      sender: 'bot',
      options: response.options,
      products: response.products,
      selectedProduct: response.selectedProduct
    };
    setMessages(prev => [...prev, botMessage]);
  };

  const handleOptionClick = (option) => {
    setInput(option);
    handleSend();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          backgroundColor: '#8B5A2B',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          fontSize: '24px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {isOpen ? <FaTimes /> : <FaComments />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '90px',
            right: '20px',
            width: '380px',
            height: '550px',
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 5px 25px rgba(0,0,0,0.15)',
            border: '1px solid #E8E0D5',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          {/* Header */}
          <div
            style={{
              backgroundColor: '#8B5A2B',
              color: 'white',
              padding: '15px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            <FaRobot size={20} />
            <span style={{ fontWeight: 'bold' }}>Venus Sales Assistant</span>
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              padding: '15px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}
          >
            {messages.map((msg) => (
              <div key={msg.id}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                    marginBottom: '5px'
                  }}
                >
                  <div
                    style={{
                      maxWidth: '80%',
                      padding: '10px 12px',
                      borderRadius: msg.sender === 'user' ? '15px 15px 0 15px' : '15px 15px 15px 0',
                      backgroundColor: msg.sender === 'user' ? '#9CAF88' : '#F5F0E8',
                      color: msg.sender === 'user' ? 'white' : '#8B5A2B',
                      fontSize: '14px',
                      lineHeight: '1.4',
                      whiteSpace: 'pre-line'
                    }}
                  >
                    {msg.text}
                  </div>
                </div>
                
                {/* Options as buttons */}
                {msg.options && msg.options.length > 0 && (
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '8px',
                      marginTop: '5px',
                      marginLeft: msg.sender === 'user' ? 'auto' : '0'
                    }}
                  >
                    {msg.options.map((option, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleOptionClick(option)}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#F5F0E8',
                          border: '1px solid #D4C9BC',
                          borderRadius: '16px',
                          fontSize: '12px',
                          color: '#8B5A2B',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = '#9CAF88';
                          e.target.style.color = 'white';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = '#F5F0E8';
                          e.target.style.color = '#8B5A2B';
                        }}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Input */}
          <div
            style={{
              padding: '15px',
              borderTop: '1px solid #E8E0D5',
              display: 'flex',
              gap: '10px'
            }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              style={{
                flex: 1,
                padding: '10px',
                border: '1px solid #D4C9BC',
                borderRadius: '20px',
                outline: 'none',
                fontSize: '14px'
              }}
            />
            <button
              onClick={handleSend}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: '#8B5A2B',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <FaPaperPlane size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default WorkingChatbot;