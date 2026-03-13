from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import os
import aiohttp
import asyncio
import json
import re
from typing import List, Optional, Dict, Any
from datetime import datetime

app = FastAPI(title="Venus Enterprises AI Chatbot")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------- CONFIGURATION -------------------
NODE_BACKEND_URL = os.environ.get("NODE_BACKEND_URL", "https://finalyearproject1-pvex.onrender.com")
HUGGINGFACE_TOKEN = os.environ.get("HUGGINGFACE_TOKEN", "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")

print(f"🚀 Node Backend URL: {NODE_BACKEND_URL}")
print(f"🤖 HuggingFace Token: {'✅ Set' if HUGGINGFACE_TOKEN else '❌ Not Set'}")

# ------------------- MODELS -------------------
class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None

class ChatResponse(BaseModel):
    message: str
    options: List[str] = []
    products: List[Dict[str, Any]] = []
    type: str = "response"

# ------------------- LLM INTEGRATION -------------------
class HuggingFaceLLM:
    def __init__(self):
        self.api_token = HUGGINGFACE_TOKEN
        # Using Mistral-7B-Instruct (free, powerful)
        self.model = "mistralai/Mistral-7B-Instruct-v0.1"
        self.api_url = f"https://api-inference.huggingface.co/models/{self.model}"
        self.headers = {"Authorization": f"Bearer {self.api_token}"} if self.api_token else {}
        
    async def query(self, prompt: str, max_length: int = 200) -> str:
        """Send query to HuggingFace API"""
        if not self.api_token:
            print("⚠️ No HuggingFace token")
            return None
            
        try:
            async with aiohttp.ClientSession() as session:
                payload = {
                    "inputs": prompt,
                    "parameters": {
                        "max_new_tokens": max_length,
                        "temperature": 0.7,
                        "top_p": 0.95,
                        "do_sample": True,
                        "return_full_text": False
                    }
                }
                
                async with session.post(self.api_url, headers=self.headers, json=payload, timeout=30) as response:
                    if response.status == 200:
                        result = await response.json()
                        if isinstance(result, list) and len(result) > 0:
                            return result[0].get('generated_text', '').strip()
                    elif response.status == 503:
                        # Model loading
                        return "LOADING"
                    else:
                        print(f"API Error: {response.status}")
                        return None
        except Exception as e:
            print(f"LLM Error: {e}")
            return None
    
    async def understand_intent(self, message: str) -> Dict[str, Any]:
        """Use LLM to understand user intent"""
        
        prompt = f"""<s>[INST] You are an AI assistant for Venus Enterprises e-commerce store. 
Analyze this customer message and return ONLY a JSON object with:
- intent: one of [browse, price_check, corporate_gifts, custom_order, help, greeting]
- category: product category if mentioned (wooden, acrylic, metal, crystal, corporate_gifts, awards)
- price_range: object with min and max if mentioned (extract numbers)
- keywords: list of important keywords (max 3)
- is_price_mentioned: true/false
- is_category_mentioned: true/false

Customer message: "{message}"

Return ONLY valid JSON, no other text: [/INST]"""

        llm_response = await self.query(prompt, max_length=150)
        
        # Try to parse LLM response
        if llm_response and llm_response != "LOADING":
            try:
                # Extract JSON from response
                json_match = re.search(r'\{.*\}', llm_response, re.DOTALL)
                if json_match:
                    intent_data = json.loads(json_match.group())
                    print(f"🧠 LLM Intent: {intent_data}")
                    return intent_data
            except:
                print(f"Failed to parse LLM response: {llm_response}")
        
        # Fallback to rule-based parsing
        return self.rule_based_intent(message)
    
    def rule_based_intent(self, message: str) -> Dict[str, Any]:
        """Fallback intent parsing"""
        msg = message.lower()
        
        # Determine intent
        intent = "browse"
        if any(word in msg for word in ["hi", "hello", "hey"]):
            intent = "greeting"
        elif any(word in msg for word in ["price", "cost", "₹", "rs", "rupee"]):
            intent = "price_check"
        elif any(word in msg for word in ["corporate", "company", "business", "office"]):
            intent = "corporate_gifts"
        elif any(word in msg for word in ["custom", "personalized", "engrave"]):
            intent = "custom_order"
        elif any(word in msg for word in ["help", "support", "contact"]):
            intent = "help"
        
        # Extract category
        categories = {
            "wooden": "Wooden", "wood": "Wooden",
            "acrylic": "Acrylic",
            "metal": "Metal",
            "crystal": "Crystal",
            "corporate": "Corporate Gifts", "gift": "Corporate Gifts",
            "award": "Awards", "trophy": "Awards"
        }
        
        category = None
        for key, value in categories.items():
            if key in msg:
                category = value
                break
        
        # Extract price range
        price_range = {}
        
        # Under X
        under_match = re.search(r'under\s*(\d+)|below\s*(\d+)|less than\s*(\d+)|<(\d+)', msg)
        if under_match:
            price = next((int(x) for x in under_match.groups() if x), None)
            if price:
                price_range["max"] = price
        
        # Above X
        above_match = re.search(r'above\s*(\d+)|over\s*(\d+)|more than\s*(\d+)|>(\d+)', msg)
        if above_match:
            price = next((int(x) for x in above_match.groups() if x), None)
            if price:
                price_range["min"] = price
        
        # Between X and Y
        between_match = re.search(r'between\s*(\d+)\s*(?:and|to|-)\s*(\d+)', msg)
        if between_match:
            price_range["min"] = int(between_match.group(1))
            price_range["max"] = int(between_match.group(2))
        
        return {
            "intent": intent,
            "category": category,
            "price_range": price_range,
            "keywords": [w for w in msg.split() if len(w) > 3][:3],
            "is_price_mentioned": bool(price_range),
            "is_category_mentioned": category is not None
        }
    
    async def generate_reply(self, intent: Dict, products: List, user_message: str) -> str:
        """Generate natural reply using LLM"""
        
        # Format products info
        products_info = ""
        if products:
            products_info = "Available products:\n"
            for p in products[:3]:
                products_info += f"- {p.get('name')}: ₹{p.get('price')} ({p.get('category')})\n"
        
        prompt = f"""<s>[INST] You are a helpful shopping assistant for Venus Enterprises. 
Generate a friendly, natural response based on:

User: "{user_message}"
Intent: {intent.get('intent')}
Category: {intent.get('category')}
Price Range: {intent.get('price_range')}
{products_info}

Guidelines:
- Be concise and friendly
- If products found, mention them excitedly
- If no products, suggest alternatives
- Ask one follow-up question
- Use emojis occasionally

Response: [/INST]"""

        llm_response = await self.query(prompt, max_length=100)
        
        if llm_response and llm_response != "LOADING":
            return llm_response
        
        # Fallback responses
        if products:
            return f"🎯 I found {len(products)} products that match your request! Take a look below."
        else:
            return "😕 I couldn't find exact matches. Would you like to try different keywords or browse our categories?"

# Initialize LLM
llm = HuggingFaceLLM()

# ------------------- NODE BACKEND CALLS -------------------
async def fetch_from_node(endpoint: str, params: Dict = None) -> Dict:
    """Generic function to call Node backend"""
    try:
        async with aiohttp.ClientSession() as session:
            url = f"{NODE_BACKEND_URL}{endpoint}"
            if params:
                query = "&".join([f"{k}={v}" for k, v in params.items() if v])
                if query:
                    url += f"?{query}"
            
            print(f"📡 Calling Node: {url}")
            
            async with session.get(url, timeout=10) as response:
                if response.status == 200:
                    return await response.json()
                else:
                    print(f"❌ Node error: {response.status}")
                    return {}
    except Exception as e:
        print(f"❌ Node connection error: {e}")
        return {}

async def search_products(filters: Dict = None) -> List[Dict]:
    """Search products using Node backend"""
    params = {}
    
    if filters:
        if filters.get('category'):
            params['category'] = filters['category']
        if filters.get('price_range'):
            if 'min' in filters['price_range']:
                params['minPrice'] = filters['price_range']['min']
            if 'max' in filters['price_range']:
                params['maxPrice'] = filters['price_range']['max']
        if filters.get('search'):
            params['search'] = filters['search']
    
    # Try to get filtered products
    result = await fetch_from_node('/api/products', params)
    
    # Extract products from response
    if isinstance(result, dict):
        products = result.get('products', [])
    elif isinstance(result, list):
        products = result
    else:
        products = []
    
    # If no products with filters, get all products
    if not products and filters:
        print("No products with filters, fetching all...")
        all_result = await fetch_from_node('/api/products')
        if isinstance(all_result, dict):
            products = all_result.get('products', [])
        elif isinstance(all_result, list):
            products = all_result
    
    return products[:8]  # Limit to 8 products

# ------------------- MAIN CHAT LOGIC -------------------
async def process_message(message: str, session_id: str = None) -> ChatResponse:
    """Process user message and return response"""
    
    # Empty message (welcome)
    if not message or message.strip() == "":
        return ChatResponse(
            message="👋 Welcome to Venus Enterprises! I'm your AI shopping assistant. How can I help you today?",
            options=[
                "🪵 Wooden Items",
                "✨ Acrylic Items", 
                "🏢 Corporate Gifts",
                "💰 Price Range",
                "🏆 Awards",
                "❓ Help"
            ],
            type="welcome"
        )
    
    # Use LLM to understand intent
    intent = await llm.understand_intent(message)
    print(f"📊 Intent: {intent}")
    
    # Handle different intents
    if intent.get('intent') == 'greeting':
        return ChatResponse(
            message="👋 Hello! I'm here to help you find the perfect products. What are you looking for today?",
            options=["Browse Products", "Corporate Gifts", "Price Range"],
            type="greeting"
        )
    
    if intent.get('intent') == 'help':
        return ChatResponse(
            message="❓ I can help you with:\n• Finding products by category\n• Checking prices\n• Corporate gift recommendations\n• Custom orders\n\nWhat would you like to know?",
            options=["Browse Products", "Corporate Gifts", "Custom Orders", "Contact"],
            type="help"
        )
    
    if intent.get('intent') == 'corporate_gifts':
        # Get corporate gifts
        products = await search_products({"category": "Corporate Gifts"})
        
        if products:
            reply = await llm.generate_reply(intent, products, message)
            return ChatResponse(
                message=reply,
                products=products,
                options=["Bulk Order", "Custom Branding", "Price Range", "View All"],
                type="products"
            )
    
    if intent.get('intent') == 'custom_order':
        return ChatResponse(
            message="✨ We offer customization on most products!\n\n• Laser engraving\n• Logo printing\n• Personalized messages\n• Custom colors\n\nWould you like to discuss your requirements?",
            options=["Request Quote", "Browse Customizable", "Contact Sales"],
            type="custom"
        )
    
    # Search for products based on intent
    search_filters = {
        "category": intent.get('category'),
        "price_range": intent.get('price_range'),
        "search": " ".join(intent.get('keywords', [])) if intent.get('keywords') else None
    }
    
    products = await search_products(search_filters)
    
    # Generate response
    if products:
        reply = await llm.generate_reply(intent, products, message)
        
        # Generate smart options
        options = []
        if intent.get('category'):
            options.append(f"More {intent['category']}")
        if intent.get('price_range'):
            options.append("Different Price")
        options.extend(["Browse All", "Corporate Gifts"])
        
        return ChatResponse(
            message=reply,
            products=products,
            options=options[:4],
            type="products"
        )
    else:
        # No products found - show popular items
        popular = await search_products()
        
        return ChatResponse(
            message="😕 I couldn't find exact matches. Here are some popular items you might like:",
            products=popular[:4],
            options=["Browse All", "Wooden", "Acrylic", "Corporate"],
            type="suggestions"
        )

# ------------------- API ENDPOINTS -------------------
@app.get("/")
async def root():
    return {
        "name": "Venus Enterprises AI Chatbot",
        "version": "4.0",
        "status": "running",
        "node_backend": NODE_BACKEND_URL,
        "llm_status": "enabled" if HUGGINGFACE_TOKEN else "disabled",
        "features": [
            "Real LLM understanding",
            "Natural language queries",
            "Price filtering",
            "Category detection",
            "Smart recommendations"
        ]
    }

@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        print(f"\n📨 [{datetime.now().strftime('%H:%M:%S')}] User: {request.message}")
        
        response = await process_message(request.message, request.session_id)
        
        print(f"📤 Response: {response.message[:50]}... ({len(response.products)} products)")
        return response
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        
        return ChatResponse(
            message="I'm having trouble processing your request. Please try again in a moment.",
            options=["Try Again", "Browse Products"],
            type="error"
        )

@app.get("/health")
async def health():
    # Test Node backend connection
    node_status = "disconnected"
    try:
        result = await fetch_from_node('/health')
        if result:
            node_status = "connected"
    except:
        pass
    
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "node_backend": {
            "url": NODE_BACKEND_URL,
            "status": node_status
        },
        "llm": {
            "status": "enabled" if HUGGINGFACE_TOKEN else "disabled",
            "model": llm.model if HUGGINGFACE_TOKEN else None
        }
    }

@app.get("/test-node")
async def test_node():
    """Test endpoint to verify Node backend connection"""
    try:
        # Try to fetch products
        products = await search_products()
        return {
            "success": True,
            "message": f"Successfully connected to Node backend",
            "products_count": len(products),
            "sample": products[:2] if products else []
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    print(f"\n🚀 Starting Venus AI Chatbot...")
    print(f"📡 Node Backend: {NODE_BACKEND_URL}")
    print(f"🤖 LLM: {'Enabled' if HUGGINGFACE_TOKEN else 'Disabled'}")
    print(f"🌐 Port: {port}\n")
    uvicorn.run(app, host="0.0.0.0", port=port)