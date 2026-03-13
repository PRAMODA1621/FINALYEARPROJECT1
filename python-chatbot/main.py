from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import os
import requests
import re
from typing import List, Optional, Dict, Any
import aiohttp
import asyncio

app = FastAPI(title="Venus Enterprises AI Chatbot Service")

# -------------------
# CORS
# -------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------
# Configuration
# -------------------
NODE_BACKEND_URL = os.environ.get("NODE_BACKEND_URL", "https://finalyearproject1-pvex.onrender.com")
HUGGINGFACE_TOKEN = os.environ.get("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", "")

# -------------------
# Models
# -------------------
class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None

class ChatResponse(BaseModel):
    message: str
    options: List[str] = []
    products: List[Dict[str, Any]] = []
    action: Optional[str] = None
    redirect: Optional[str] = None
    type: str = "menu"

# -------------------
# Helper: Fetch Products from Node Backend
# -------------------
async def fetch_products_from_node(params: Dict = None) -> List[Dict]:
    """Fetch products from your Node.js backend API"""
    try:
        async with aiohttp.ClientSession() as session:
            url = f"{NODE_BACKEND_URL}/api/products"
            if params:
                # Add query parameters for filtering
                query_params = []
                if params.get('category'):
                    query_params.append(f"category={params['category']}")
                if params.get('min_price'):
                    query_params.append(f"minPrice={params['min_price']}")
                if params.get('max_price'):
                    query_params.append(f"maxPrice={params['max_price']}")
                if params.get('search'):
                    query_params.append(f"search={params['search']}")
                
                if query_params:
                    url += "?" + "&".join(query_params)
            
            async with session.get(url) as response:
                if response.status == 200:
                    data = await response.json()
                    return data.get('products', []) if isinstance(data, dict) else data
                return []
    except Exception as e:
        print(f"Error fetching products from Node: {e}")
        return []

# -------------------
# LLM Integration
# -------------------
class ChatbotLLM:
    def __init__(self):
        self.api_token = HUGGINGFACE_TOKEN
        self.model = "microsoft/DialoGPT-medium"  # Good for conversation
        self.api_url = f"https://api-inference.huggingface.co/models/{self.model}"
        self.headers = {"Authorization": f"Bearer {self.api_token}"} if self.api_token else {}
    
    async def generate_response(self, user_message: str, context: str = "") -> str:
        """Generate AI response using HuggingFace"""
        if not self.api_token:
            return self.rule_based_response(user_message)
        
        try:
            prompt = f"""You are a helpful shopping assistant for Venus Enterprises, an e-commerce store.
Previous conversation: {context}
User: {user_message}
Assistant: Let me help you with that."""

            async with aiohttp.ClientSession() as session:
                payload = {
                    "inputs": prompt,
                    "parameters": {
                        "max_length": 100,
                        "temperature": 0.7,
                        "top_p": 0.9
                    }
                }
                
                async with session.post(self.api_url, headers=self.headers, json=payload) as response:
                    if response.status == 200:
                        result = await response.json()
                        if isinstance(result, list) and len(result) > 0:
                            return result[0].get('generated_text', '').split('Assistant:')[-1].strip()
                    return self.rule_based_response(user_message)
        except:
            return self.rule_based_response(user_message)
    
    def rule_based_response(self, message: str) -> str:
        """Simple rule-based fallback"""
        message_lower = message.lower()
        
        if "hello" in message_lower or "hi" in message_lower:
            return "Hello! How can I help you shop today?"
        elif "price" in message_lower:
            return "I can help you find products in your budget. What price range are you looking for?"
        elif "thank" in message_lower:
            return "You're welcome! Is there anything else I can help you with?"
        else:
            return "I understand you're looking for something. Could you tell me more about what you need?"

# -------------------
# Intent Parser
# -------------------
def parse_intent(message: str) -> Dict[str, Any]:
    """Parse user intent from message"""
    message_lower = message.lower()
    
    # Extract price range
    price_range = {}
    
    # Pattern: under/less than 500
    under_match = re.search(r'(?:under|less than|below|within)\s*(?:rs\.?|₹)?\s*(\d+)', message_lower)
    if under_match:
        price_range['max'] = float(under_match.group(1))
    
    # Pattern: above/over 500
    above_match = re.search(r'(?:above|over|more than)\s*(?:rs\.?|₹)?\s*(\d+)', message_lower)
    if above_match:
        price_range['min'] = float(above_match.group(1))
    
    # Pattern: between 500 and 1000
    between_match = re.search(r'(?:between)\s*(?:rs\.?|₹)?\s*(\d+)\s*(?:and|to|-)\s*(?:rs\.?|₹)?\s*(\d+)', message_lower)
    if between_match:
        price_range['min'] = float(between_match.group(1))
        price_range['max'] = float(between_match.group(2))
    
    # Extract category
    categories = {
        'wooden': 'Wooden',
        'wood': 'Wooden',
        'acrylic': 'Acrylic',
        'metal': 'Metal',
        'crystal': 'Crystal',
        'corporate': 'Corporate Gifts',
        'gift': 'Corporate Gifts',
        'trophy': 'Awards',
        'award': 'Awards'
    }
    
    category = None
    for key, value in categories.items():
        if key in message_lower:
            category = value
            break
    
    # Determine intent type
    intent = 'browse'
    if any(word in message_lower for word in ['price', 'cost', '₹', 'rs']):
        intent = 'price_check'
    elif any(word in message_lower for word in ['add', 'cart', 'buy']):
        intent = 'add_to_cart'
    elif any(word in message_lower for word in ['corporate', 'company', 'business']):
        intent = 'corporate'
    
    return {
        'intent': intent,
        'category': category,
        'price_range': price_range,
        'search_text': message
    }

# -------------------
# Main Chat Logic
# -------------------
async def process_chat_message(message: str, session_id: str = None) -> ChatResponse:
    """Process chat message and return response"""
    
    # Empty message (welcome)
    if not message or message.strip() == "":
        return ChatResponse(
            message="👋 Welcome to Venus Enterprises! I'm your AI shopping assistant. How can I help you today?",
            options=["🛍️ Browse Products", "💰 Check Prices", "🏢 Corporate Gifts", "✨ Custom Orders"],
            type="welcome"
        )
    
    # Parse user intent
    intent_data = parse_intent(message)
    print(f"Intent: {intent_data}")
    
    # Prepare filters for product search
    filters = {}
    if intent_data['category']:
        filters['category'] = intent_data['category']
    if intent_data['price_range']:
        if 'min' in intent_data['price_range']:
            filters['min_price'] = intent_data['price_range']['min']
        if 'max' in intent_data['price_range']:
            filters['max_price'] = intent_data['price_range']['max']
    
    # Add search text for keyword search
    if intent_data['search_text'] and not intent_data['category']:
        filters['search'] = intent_data['search_text']
    
    # Fetch products from Node backend
    products = await fetch_products_from_node(filters)
    
    # Generate response based on products found
    if products:
        # Format products for frontend
        formatted_products = [
            {
                "id": p.get('id'),
                "name": p.get('productName') or p.get('name'),
                "price": float(p.get('price', 0)),
                "category": p.get('category', 'General'),
                "image_url": p.get('imageUrl') or p.get('image_url') or '/images/placeholder.jpg',
                "description": p.get('description', '')
            }
            for p in products[:6]  # Limit to 6 products
        ]
        
        # Create response message
        if len(products) == 1:
            message = f"🎯 I found this {products[0].get('category', 'product')} that matches:"
        else:
            message = f"✨ I found {len(products)} products matching your request:"
        
        # Generate follow-up options
        options = ["🔄 Different Price", "📦 More Products", "🏷️ Categories"]
        if intent_data['category']:
            options.insert(0, f"🔝 Top {intent_data['category']}")
        
        return ChatResponse(
            message=message,
            products=formatted_products,
            options=options,
            type="products"
        )
    else:
        # No products found - suggest popular items
        popular = await fetch_products_from_node({"limit": 4})
        popular_products = [
            {
                "id": p.get('id'),
                "name": p.get('productName') or p.get('name'),
                "price": float(p.get('price', 0)),
                "category": p.get('category', 'General'),
                "image_url": p.get('imageUrl') or p.get('image_url') or '/images/placeholder.jpg'
            }
            for p in popular[:4]
        ] if popular else []
        
        return ChatResponse(
            message="😕 I couldn't find exact matches. Here are some popular items you might like:",
            products=popular_products,
            options=["🪵 Wooden Items", "✨ Acrylic", "🏢 Corporate", "🔄 Try Again"],
            type="suggestions"
        )

# -------------------
# API Endpoints
# -------------------
@app.get("/")
async def root():
    return {
        "name": "Venus Enterprises AI Chatbot",
        "version": "1.0",
        "status": "running",
        "backend": "Connected to Node.js API",
        "llm": "enabled" if HUGGINGFACE_TOKEN else "disabled (using rule-based)"
    }

@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        print(f"📨 Message: {request.message}")
        response = await process_chat_message(request.message, request.session_id)
        print(f"📤 Response: {len(response.products)} products")
        return response
    except Exception as e:
        print(f"❌ Error: {e}")
        return ChatResponse(
            message="I'm having trouble right now. Please try again in a moment.",
            options=["🔄 Try Again", "🛍️ Browse Products"],
            type="error"
        )

@app.get("/health")
async def health():
    # Test connection to Node backend
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(f"{NODE_BACKEND_URL}/health", timeout=5) as response:
                node_status = "connected" if response.status == 200 else "error"
    except:
        node_status = "disconnected"
    
    return {
        "status": "healthy",
        "node_backend": node_status,
        "llm": "enabled" if HUGGINGFACE_TOKEN else "disabled"
    }

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port)