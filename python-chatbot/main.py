# main.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import os
import re
import logging
from typing import List, Optional, Dict, Any
from datetime import datetime
from dotenv import load_dotenv

# Import our modules
from category_mapper import extract_category, get_display_options, get_category_icon
from fetch_products import (
    fetch_products_by_category,
    fetch_all_products,
    fetch_products_by_price
)

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize FastAPI
app = FastAPI(
    title="Venus Enterprises AI Shopping Assistant",
    description="AI-powered chatbot for Venus Enterprises e-commerce",
    version="2.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------- CONFIGURATION -------------------
NODE_BACKEND_URL = os.getenv("NODE_BACKEND_URL", "https://finalyearproject1-pvex.onrender.com")
HUGGINGFACE_TOKEN = os.getenv("HUGGINGFACE_TOKEN", "")
PORT = int(os.getenv("PORT", 8000))

logger.info(f"🚀 Node Backend URL: {NODE_BACKEND_URL}")
logger.info(f"🤖 HuggingFace Token: {'✅ Set' if HUGGINGFACE_TOKEN else '❌ Not Set'}")

# ------------------- MODELS -------------------
class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None

class ChatResponse(BaseModel):
    message: str
    options: List[str] = []
    products: List[Dict[str, Any]] = []
    type: str = "response"
    category: Optional[str] = None

# ------------------- HELPER FUNCTIONS -------------------
def extract_price_from_message(message: str) -> Optional[Dict[str, float]]:
    """Extract price range from message"""
    message_lower = message.lower()
    
    # Pattern: under ₹500, below 500, less than 500
    under_match = re.search(r'under\s*₹?(\d+)|below\s*₹?(\d+)|less than\s*₹?(\d+)', message_lower)
    if under_match:
        price = next((int(x) for x in under_match.groups() if x), None)
        if price:
            return {"max": float(price)}
    
    # Pattern: above ₹500, over 500, more than 500
    above_match = re.search(r'above\s*₹?(\d+)|over\s*₹?(\d+)|more than\s*₹?(\d+)', message_lower)
    if above_match:
        price = next((int(x) for x in above_match.groups() if x), None)
        if price:
            return {"min": float(price)}
    
    # Pattern: between 500 and 1000, 500-1000
    range_match = re.search(r'between\s*₹?(\d+)\s*(?:and|to|-)\s*₹?(\d+)|(\d+)\s*-\s*(\d+)', message_lower)
    if range_match:
        groups = range_match.groups()
        prices = [int(g) for g in groups if g]
        if len(prices) >= 2:
            return {"min": float(prices[0]), "max": float(prices[1])}
    
    return None

# ------------------- RESPONSE GENERATORS -------------------
def get_welcome_response() -> ChatResponse:
    """Generate welcome message"""
    return ChatResponse(
        message="""👋 Welcome to Venus Enterprises! I'm your AI shopping assistant.

I can help you find the perfect awards, gifts, and corporate merchandise from our collection.

🔍 **Try asking:**
• "Show me wooden awards"
• "Gifts under ₹1000"
• "Corporate gifts"
• "Metal trophies"
• "Browse all products"

How can I assist you today?""",
        options=get_display_options(),
        type="welcome"
    )

def get_help_response() -> ChatResponse:
    """Generate help message"""
    return ChatResponse(
        message="""❓ **How can I help you?**

I can assist with:
• 🪵 **Wooden Items** - Awards, plaques, name plates
• ✨ **Acrylic Items** - Modern awards, signs, trophies
• ⚙️ **Metal Items** - Pens, keychains, desk accessories
• 💎 **Gifts** - Corporate gifts, mementos
• 🏢 **Corporate Gifts** - Bulk orders, customized
• 🏆 **Awards** - Trophies, medals, plaques
• 🗿 **Marble** - Premium marble awards
• 💰 **Price Range** - Find products in your budget

Just click any option above or type what you're looking for!""",
        options=get_display_options(),
        type="help"
    )

def get_price_selection_response() -> ChatResponse:
    """Generate price selection options"""
    return ChatResponse(
        message="💰 **What's your budget?**\n\nSelect a price range to see products:",
        options=[
            "Under ₹500",
            "₹500 - ₹1000",
            "₹1000 - ₹2500",
            "₹2500 - ₹5000",
            "Above ₹5000"
        ],
        type="price_selection"
    )

# ------------------- MAIN CHAT ENDPOINT -------------------
@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Main chat endpoint"""
    try:
        logger.info(f"📨 Message: '{request.message}'")
        
        # Handle empty message (welcome)
        if not request.message or request.message.strip() == "":
            return get_welcome_response()
        
        # Extract category from message
        category = extract_category(request.message)
        logger.info(f"📊 Extracted category: {category}")
        
        # Handle help intent
        if category == "help":
            return get_help_response()
        
        # Handle price selection
        if category == "price" or "under" in request.message.lower() or "₹" in request.message:
            # Check if it's a price range selection
            if request.message in ["Under ₹500", "₹500 - ₹1000", "₹1000 - ₹2500", "₹2500 - ₹5000", "Above ₹5000"]:
                # Parse the selected range
                if "Under" in request.message:
                    max_price = 500
                    products = await fetch_products_by_price(NODE_BACKEND_URL, max_price=max_price, limit=8)
                    return ChatResponse(
                        message=f"💰 **Products under ₹{max_price}:**",
                        products=products,
                        options=get_display_options()[:6],
                        type="products"
                    )
                elif "₹500 - ₹1000" in request.message:
                    products = await fetch_products_by_price(NODE_BACKEND_URL, min_price=500, max_price=1000, limit=8)
                    return ChatResponse(
                        message="💰 **Products between ₹500 - ₹1000:**",
                        products=products,
                        options=get_display_options()[:6],
                        type="products"
                    )
                elif "₹1000 - ₹2500" in request.message:
                    products = await fetch_products_by_price(NODE_BACKEND_URL, min_price=1000, max_price=2500, limit=8)
                    return ChatResponse(
                        message="💰 **Products between ₹1000 - ₹2500:**",
                        products=products,
                        options=get_display_options()[:6],
                        type="products"
                    )
                elif "₹2500 - ₹5000" in request.message:
                    products = await fetch_products_by_price(NODE_BACKEND_URL, min_price=2500, max_price=5000, limit=8)
                    return ChatResponse(
                        message="💰 **Products between ₹2500 - ₹5000:**",
                        products=products,
                        options=get_display_options()[:6],
                        type="products"
                    )
                elif "Above ₹5000" in request.message:
                    products = await fetch_products_by_price(NODE_BACKEND_URL, min_price=5000, limit=8)
                    return ChatResponse(
                        message="💰 **Premium products above ₹5000:**",
                        products=products,
                        options=get_display_options()[:6],
                        type="products"
                    )
            else:
                # Try to extract price from natural language
                price_range = extract_price_from_message(request.message)
                if price_range:
                    products = await fetch_products_by_price(
                        NODE_BACKEND_URL,
                        min_price=price_range.get("min"),
                        max_price=price_range.get("max"),
                        limit=8
                    )
                    if products:
                        range_text = ""
                        if price_range.get("min") and price_range.get("max"):
                            range_text = f"between ₹{price_range['min']} - ₹{price_range['max']}"
                        elif price_range.get("max"):
                            range_text = f"under ₹{price_range['max']}"
                        elif price_range.get("min"):
                            range_text = f"above ₹{price_range['min']}"
                        
                        return ChatResponse(
                            message=f"💰 **Products {range_text}:**",
                            products=products,
                            options=get_display_options()[:6],
                            type="products"
                        )
            
            # If no price-specific products found, show price selection
            return get_price_selection_response()
        
        # Handle category browsing
        if category and category not in ["all", "price", "help"]:
            # Fetch products for this category
            products = await fetch_products_by_category(NODE_BACKEND_URL, category, limit=8)
            
            if products:
                icon = get_category_icon(category)
                return ChatResponse(
                    message=f"{icon} **{category} Products:**\nHere's what we have in this category:",
                    products=products,
                    options=get_display_options()[:6],
                    type="products",
                    category=category
                )
            else:
                # If no products in category, show all products
                all_products = await fetch_all_products(NODE_BACKEND_URL, limit=8)
                return ChatResponse(
                    message=f"😕 No {category} products found. Here are all our products:",
                    products=all_products,
                    options=get_display_options()[:6],
                    type="products"
                )
        
        # Handle "Browse All" or "all" category
        if category == "all" or "all" in request.message.lower() or "browse" in request.message.lower():
            products = await fetch_all_products(NODE_BACKEND_URL, limit=10)
            return ChatResponse(
                message="📦 **All Products:**\nHere's our complete collection:",
                products=products,
                options=get_display_options()[:6],
                type="products"
            )
        
        # Default: Search or show all products
        products = await fetch_all_products(NODE_BACKEND_URL, limit=8)
        return ChatResponse(
            message="🌟 **Popular Products:**\nHere are some items you might like:",
            products=products,
            options=get_display_options()[:6],
            type="products"
        )
        
    except Exception as e:
        logger.error(f"❌ Error processing message: {str(e)}", exc_info=True)
        
        # Return graceful error response
        return ChatResponse(
            message="😕 I'm having trouble processing your request. Please try again or browse our products directly.",
            options=["Try Again", "Browse All", "Help"],
            type="error"
        )

# ------------------- DEBUG & HEALTH ENDPOINTS -------------------
@app.get("/")
async def root():
    """Root endpoint with API info"""
    return {
        "name": "Venus Enterprises AI Shopping Assistant",
        "version": "2.0.0",
        "status": "running",
        "endpoints": {
            "chat": "/api/chat",
            "health": "/health",
            "debug": "/api/debug/connection"
        },
        "node_backend": NODE_BACKEND_URL,
        "llm_status": "enabled" if HUGGINGFACE_TOKEN else "disabled"
    }

@app.get("/health")
async def health():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "node_backend": NODE_BACKEND_URL
    }

@app.get("/api/debug/connection")
async def debug_connection():
    """Debug endpoint to test Node backend connection"""
    import aiohttp
    
    results = {}
    
    async with aiohttp.ClientSession() as session:
        # Test different endpoints
        endpoints = [
            "/products",
            "/api/products",
            "/api/v1/products",
            "/products/all",
            "/"
        ]
        
        for endpoint in endpoints:
            url = f"{NODE_BACKEND_URL}{endpoint}"
            try:
                async with session.get(url, timeout=5) as response:
                    content_type = response.headers.get('content-type', '')
                    try:
                        if 'application/json' in content_type:
                            data = await response.json()
                            data_preview = str(data)[:200]
                        else:
                            data_preview = "Non-JSON response"
                    except:
                        data_preview = "Could not parse response"
                    
                    results[endpoint] = {
                        "url": url,
                        "status": response.status,
                        "content_type": content_type,
                        "success": response.status == 200,
                        "data_preview": data_preview
                    }
            except Exception as e:
                results[endpoint] = {
                    "url": url,
                    "error": str(e),
                    "success": False
                }
    
    return {
        "node_backend": NODE_BACKEND_URL,
        "tests": results,
        "database_categories": ["Wooden", "Acrylic", "Metal", "Gifts", "Mementos", "Marble"],
        "recommendation": "Check which endpoint returns 200 with JSON data"
    }

# ------------------- STARTUP/SHUTDOWN -------------------
@app.on_event("startup")
async def startup_event():
    """Run on application startup"""
    logger.info("🚀 Starting Venus AI Shopping Assistant...")
    logger.info(f"📡 Node Backend: {NODE_BACKEND_URL}")
    logger.info(f"🤖 LLM Status: {'✅ Enabled' if HUGGINGFACE_TOKEN else '❌ Disabled'}")

@app.on_event("shutdown")
async def shutdown_event():
    """Run on application shutdown"""
    from fetch_products import _product_fetcher
    if _product_fetcher:
        await _product_fetcher.close()
    logger.info("👋 Shutting down...")

# ------------------- MAIN -------------------
if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=PORT,
        reload=False,
        log_level="info"
    )