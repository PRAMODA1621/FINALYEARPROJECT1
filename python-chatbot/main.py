from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import os
import aiohttp
import asyncio
from typing import Optional, List, Dict, Any
from datetime import datetime

# Import new modules
from chatbot_engine import ShoppingAssistant, enhanced_intent_understanding, ConversationMemory
from fetch_products import fetch_products_with_filters, get_product_recommendations

app = FastAPI(title="Venus Enterprises AI Chatbot - Enhanced")

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
HUGGINGFACE_TOKEN = os.environ.get("HUGGINGFACE_TOKEN", "")

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
    follow_up: Optional[str] = None
    suggested_actions: List[Dict] = []
    state: Optional[str] = None

# ------------------- LLM INTEGRATION -------------------
class HuggingFaceLLM:
    def __init__(self):
        self.api_token = HUGGINGFACE_TOKEN
        self.model = "mistralai/Mistral-7B-Instruct-v0.1"
        self.api_url = f"https://api-inference.huggingface.co/models/{self.model}"
        self.headers = {"Authorization": f"Bearer {self.api_token}"} if self.api_token else {}
        
    async def query(self, prompt: str, max_length: int = 200) -> str:
        if not self.api_token:
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
                        return "LOADING"
                    else:
                        print(f"API Error: {response.status}")
                        return None
        except Exception as e:
            print(f"LLM Error: {e}")
            return None
    
    async def generate_natural_response(self, prompt: str) -> str:
        """Generate natural language response"""
        response = await self.query(prompt, max_length=150)
        if response and response != "LOADING":
            return response
        return None

# Initialize components
llm = HuggingFaceLLM()
assistant = ShoppingAssistant(llm, NODE_BACKEND_URL)

# ------------------- MAIN CHAT LOGIC -------------------
async def process_message(message: str, session_id: str = None) -> ChatResponse:
    """Enhanced message processing"""
    
    # Get or create session
    session = assistant.get_or_create_session(session_id or "default")
    
    # Empty message (welcome)
    if not message or message.strip() == "":
        welcome_msg = """👋 Welcome to Venus Enterprises! I'm your AI shopping assistant.

I can help you:
• Find perfect awards and gifts
• Compare products by price
• Suggest items for any budget
• Guide you through categories
• Recommend corporate gifts
• Help with custom orders

How can I assist you today?"""
        
        return ChatResponse(
            message=welcome_msg,
            options=[
                "🪵 Browse Wooden",
                "✨ Browse Acrylic",
                "🏢 Corporate Gifts",
                "💰 Filter by Price",
                "🎯 Get Recommendations",
                "❓ Help"
            ],
            type="welcome",
            state=session.state.value
        )
    
    # Enhanced intent understanding
    intent = await enhanced_intent_understanding(llm, message, session)
    print(f"🧠 Enhanced Intent: {intent}")
    
    # Process through shopping assistant
    result = await assistant.process_shopping_intent(message, session, intent)
    
    # Update session with interaction
    session.update(message, result.get("message", ""), intent)
    
    # Build response
    response = ChatResponse(
        message=result.get("message", "I'll help you find what you're looking for."),
        products=result.get("products", []),
        options=result.get("options", []),
        type=result.get("type", "response"),
        follow_up=result.get("follow_up"),
        suggested_actions=result.get("suggested_actions", []),
        state=session.state.value
    )
    
    # Add cart summary if user is browsing products
    if session.context.get("interested_products"):
        response.message += f"\n\nYou've shown interest in {len(session.context['interested_products'])} products. Would you like to review them?"
    
    return response

# ------------------- API ENDPOINTS -------------------
@app.get("/")
async def root():
    return {
        "name": "Venus Enterprises AI Shopping Assistant",
        "version": "5.0",
        "status": "running",
        "features": [
            "Multi-turn conversations",
            "Price range suggestions",
            "Category navigation",
            "Smart recommendations",
            "Context awareness",
            "Follow-up questions",
            "Budget-based filtering",
            "Corporate gift specialist"
        ],
        "node_backend": NODE_BACKEND_URL,
        "llm_status": "enabled" if HUGGINGFACE_TOKEN else "disabled"
    }

# In your main.py, update the chat endpoint

@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        print(f"\n📨 [{datetime.now().strftime('%H:%M:%S')}] Session: {request.session_id}")
        print(f"💬 Original message: '{request.message}'")
        
        # Import category mapper
        from category_mapper import extract_category, get_display_options
        
        # Extract actual intent from message
        category = extract_category(request.message)
        print(f"📊 Extracted category: {category}")
        
        # Handle empty message (welcome)
        if not request.message or request.message.strip() == "":
            welcome_msg = """👋 Welcome to Venus Enterprises! I'm your AI shopping assistant.

How can I help you today?"""
            
            return ChatResponse(
                message=welcome_msg,
                options=get_display_options(),
                type="welcome"
            )
        
        # Handle based on extracted category
        if category == "help":
            return ChatResponse(
                message="❓ I can help you with:\n• Finding products by category\n• Checking prices\n• Corporate gift recommendations\n• Custom orders\n\nWhat would you like to know?",
                options=get_display_options(),
                type="help"
            )
        
        elif category == "price_filter":
            return ChatResponse(
                message="💰 What's your budget? I'll find the best products for you.",
                options=[
                    "Under ₹500",
                    "₹500 - ₹1000", 
                    "₹1000 - ₹2500",
                    "₹2500 - ₹5000",
                    "Above ₹5000"
                ],
                type="price_selection"
            )
        
        elif category == "all":
            # Fetch all products
            products = await search_products({})
            if products:
                return ChatResponse(
                    message="📦 Here are all our products:",
                    products=products[:8],
                    options=["Filter by Price", "Browse Categories"],
                    type="products"
                )
        
        elif category in ["Wooden", "Acrylic", "Metal", "Crystal", "Corporate Gifts", "Awards"]:
            # Fetch products for this category
            print(f"🔍 Searching for category: {category}")
            products = await search_products({"category": category})
            
            if products and len(products) > 0:
                return ChatResponse(
                    message=f"🎯 Here are our {category} items:",
                    products=products[:8],
                    options=[
                        "🪵 Wooden",
                        "✨ Acrylic", 
                        "🏢 Corporate",
                        "💰 Price Range"
                    ],
                    type="products"
                )
            else:
                # If no products found, show popular items
                popular = await search_products({})
                return ChatResponse(
                    message=f"😕 I couldn't find any {category} items at the moment. Here are some popular products instead:",
                    products=popular[:6],
                    options=get_display_options(),
                    type="suggestions"
                )
        
        # Handle price-based queries
        if "under" in request.message.lower() and "₹" in request.message:
            import re
            price_match = re.search(r'under\s*₹?(\d+)', request.message.lower())
            if price_match:
                max_price = int(price_match.group(1))
                products = await search_products({"price_range": {"max": max_price}})
                
                if products:
                    return ChatResponse(
                        message=f"💰 Great! Here are products under ₹{max_price}:",
                        products=products[:8],
                        options=[
                            f"Under ₹{max_price//2}",
                            f"Under ₹{max_price*2}",
                            "Browse All"
                        ],
                        type="products"
                    )
        
        # Default: use LLM to understand intent
        intent = await llm.understand_intent(request.message)
        
        # Search for products
        search_filters = {
            "category": intent.get('category') or category,
            "price_range": intent.get('price_range'),
            "search": request.message
        }
        
        products = await search_products(search_filters)
        
        if products:
            return ChatResponse(
                message=f"🎯 I found {len(products)} products matching your request:",
                products=products[:8],
                options=get_display_options(),
                type="products"
            )
        else:
            # No products found - show popular items
            popular = await search_products({})
            return ChatResponse(
                message="😕 I couldn't find exact matches. Here are some popular items you might like:",
                products=popular[:6],
                options=get_display_options(),
                type="suggestions"
            )
            
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        
        # Even on error, show popular products
        try:
            popular = await search_products({})
            return ChatResponse(
                message="I'm having trouble with your specific request. Here are some popular products:",
                products=popular[:6] if popular else [],
                options=get_display_options(),
                type="suggestions"
            )
        except:
            return ChatResponse(
                message="I'm having trouble processing your request. Please try again.",
                options=["Try Again", "Browse Products"],
                type="error"
            )

@app.get("/api/session/{session_id}")
async def get_session_state(session_id: str):
    """Get current session state"""
    session = assistant.get_or_create_session(session_id)
    return {
        "session_id": session_id,
        "state": session.state.value,
        "context": session.context,
        "interaction_count": session.context["interaction_count"],
        "preferences": session.context["preferences"]
    }

@app.post("/api/session/{session_id}/clear")
async def clear_session(session_id: str):
    """Clear session memory"""
    if session_id in assistant.sessions:
        del assistant.sessions[session_id]
    return {"status": "cleared"}

@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "active_sessions": len(assistant.sessions),
        "node_backend": NODE_BACKEND_URL
    }

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    print(f"\n🚀 Starting Venus Enhanced AI Shopping Assistant...")
    print(f"📡 Node Backend: {NODE_BACKEND_URL}")
    print(f"🤖 LLM: {'Enabled' if HUGGINGFACE_TOKEN else 'Disabled'}")
    print(f"🌐 Port: {port}\n")
    uvicorn.run(app, host="0.0.0.0", port=port)