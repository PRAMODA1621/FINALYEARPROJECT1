import httpx
import json
import logging
import os
from typing import Optional, Dict, Any, List
from datetime import datetime

logger = logging.getLogger(__name__)

class OllamaClient:
    """Client for interacting with Ollama LLM"""
    
    def __init__(self):
        self.base_url = os.getenv("OLLAMA_HOST", "http://localhost:11434")
        self.model = os.getenv("OLLAMA_MODEL", "llama2")
        self.timeout = float(os.getenv("OLLAMA_TIMEOUT", 30))
        self.client = httpx.AsyncClient(
            base_url=self.base_url,
            timeout=self.timeout,
            follow_redirects=True
        )
        self.is_connected = False
        self.system_prompt = self._load_system_prompt()
        
    async def test_connection(self) -> bool:
        """Test connection to Ollama"""
        try:
            response = await self.client.get("/api/tags")
            self.is_connected = response.status_code == 200
            
            if self.is_connected:
                models = response.json().get("models", [])
                logger.info(f"Connected to Ollama. Available models: {[m['name'] for m in models]}")
            else:
                logger.warning("Could not connect to Ollama")
            
            return self.is_connected
        except Exception as e:
            logger.error(f"Ollama connection test failed: {str(e)}")
            self.is_connected = False
            return False
    
    async def generate_response(
        self,
        message: str,
        context: Optional[Dict] = None,
        user_id: Optional[int] = None
    ) -> str:
        """Generate response using Ollama"""
        if not self.is_connected:
            return "I'm currently in offline mode. How can I assist you?"
        
        try:
            # Prepare prompt with context
            prompt = self._build_prompt(message, context, user_id)
            
            # Call Ollama API
            response = await self.client.post(
                "/api/generate",
                json={
                    "model": self.model,
                    "prompt": prompt,
                    "stream": False,
                    "options": {
                        "temperature": 0.7,
                        "top_p": 0.9,
                        "max_tokens": 500
                    }
                }
            )
            
            if response.status_code == 200:
                result = response.json()
                return result.get("response", "I'm not sure how to respond to that.")
            else:
                logger.error(f"Ollama API error: {response.status_code}")
                return self._get_fallback_response(message)
                
        except Exception as e:
            logger.error(f"Error generating Ollama response: {str(e)}")
            return self._get_fallback_response(message)
    
    def _build_prompt(self, message: str, context: Optional[Dict], user_id: Optional[int]) -> str:
        """Build prompt with system context and conversation history"""
        prompt_parts = [self.system_prompt]
        
        # Add user context if available
        if user_id:
            prompt_parts.append(f"\nUser ID: {user_id} (logged in)")
        else:
            prompt_parts.append("\nUser: guest")
        
        # Add conversation context
        if context and context.get("history"):
            history = context.get("history", [])[-5:]  # Last 5 messages
            if history:
                prompt_parts.append("\nRecent conversation:")
                for msg in history:
                    role = "User" if msg.get("role") == "user" else "Assistant"
                    prompt_parts.append(f"{role}: {msg.get('content', '')}")
        
        # Add current message
        prompt_parts.append(f"\nUser: {message}")
        prompt_parts.append("\nAssistant:")
        
        return "\n".join(prompt_parts)
    
    def _load_system_prompt(self) -> str:
        """Load system prompt for the chatbot"""
        return """You are a helpful customer service assistant for Venus Enterprises, an e-commerce platform. 
Your role is to assist customers with:
- Product inquiries and recommendations
- Order status and tracking
- Shipping and delivery information
- Returns and refunds
- Account management
- General questions about the platform

Guidelines:
- Be friendly, professional, and helpful
- Keep responses concise and focused
- If you don't know something, say so and offer to connect with human support
- Never ask for sensitive information like passwords or credit card details
- Encourage users to create an account for better experience
- For specific order issues, ask for order number
- For technical issues, suggest creating a support ticket

Current date and time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
"""
    
    def _get_fallback_response(self, message: str) -> str:
        """Get fallback response when API fails"""
        message_lower = message.lower()
        
        responses = {
            "hello": "Hello! How can I help you today?",
            "hi": "Hi there! What can I do for you?",
            "product": "We have a great selection of products. What are you interested in?",
            "order": "For order-related questions, please log in and visit your dashboard.",
            "shipping": "Shipping typically takes 3-5 business days. Need more specific information?",
            "return": "Our return policy allows returns within 30 days. Would you like to know more?",
            "price": "Prices vary by product. You can check specific product pages for details.",
            "help": "I'm here to help! What do you need assistance with?",
            "thank": "You're welcome! Is there anything else I can help with?"
        }
        
        for key, response in responses.items():
            if key in message_lower:
                return response
        
        return "I'm not sure I understand. Could you please rephrase your question? You can ask me about products, orders, shipping, or returns."
    
    async def close(self):
        """Close the HTTP client"""
        await self.client.aclose()