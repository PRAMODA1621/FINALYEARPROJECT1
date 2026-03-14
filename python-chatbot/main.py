# main.py
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
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
    allow_origins=["*"],
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

# ------------------- RESPONSE GENERATORS -------------------
def get_welcome_response() -> Dict:
    """Generate welcome message"""
    return {
        "message": """👋 Welcome to Venus Enterprises! I'm your AI shopping assistant.

I can help you find the perfect awards, gifts, and corporate merchandise from our collection.

🔍 **Try asking:**
• "Show me wooden awards"
• "Gifts under ₹1000"
• "Corporate gifts"
• "Metal trophies"
• "Browse all products"

How can I assist you today?""",
        "options": get_display_options(),
        "type": "welcome",
        "products": []
    }

def get_help_response() -> Dict:
    """Generate help message"""
    return {
        "message": """❓ **How can I help you?**

I can assist with:
• 🪵 **Wooden Items** - Awards, plaques, name plates
• ✨ **Acrylic Items** - Modern awards, signs, trophies
• ⚙️ **Metal Items** - Pens, keychains, desk accessories
• 💎 **Crystal Items** - Premium crystal awards
• 🎁 **Gifts** - Corporate gifts, mementos
• 🏢 **Corporate Gifts** - Bulk orders, customized
• 🏆 **Awards** - Trophies, medals, plaques
• 🗿 **Marble** - Premium marble awards
• 💰 **Price Range** - Find products in your budget
• 🚚 **Delivery Info** - Shipping and delivery

Just click any option above or type what you're looking for!""",
        "options": get_display_options(),
        "type": "help",
        "products": []
    }

def get_price_selection_response() -> Dict:
    """Generate price selection options"""
    return {
        "message": "💰 **What's your budget?**\n\nSelect a price range to see products:",
        "options": [
            "Under ₹500",
            "₹500 - ₹1000",
            "₹1000 - ₹2500",
            "₹2500 - ₹5000",
            "Above ₹5000"
        ],
        "type": "price_selection",
        "products": []
    }

def get_delivery_response() -> Dict:
    """Generate delivery information response"""
    return {
        "message": """🚚 **Delivery Information**

We offer reliable shipping across India:

**Delivery Timeline:**
• Metro Cities: 3-5 business days
• Other Cities: 5-7 business days
• Remote Areas: 7-10 business days

**Shipping Charges:**
• Free shipping on orders above ₹5000
• Below ₹5000: ₹100 flat rate

**Tracking:**
• Tracking ID sent via email/SMS
• Real-time tracking on our website

**Bulk Orders:**
• Special rates for corporate orders
• Contact us for quotes

Need more specific information? Let me know!""",
        "options": [
            "Track Order",
            "Shipping Policy",
            "Bulk Order Query",
            "← Back to Products"
        ],
        "type": "info",
        "products": []
    }

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

# ------------------- MAIN CHAT ENDPOINT -------------------
@app.post("/api/chat")
async def chat(request: Request):
    """Main chat endpoint"""
    try:
        # Parse request manually
        body = await request.json()
        message = body.get("message", "")
        session_id = body.get("session_id")
        
        logger.info(f"📨 Message: '{message}'")
        
        # Handle back to products
        if message == "← Back to Products" or message == "Back to Products":
            products = await fetch_all_products(NODE_BACKEND_URL, limit=8)
            return {
                "message": "🌟 **Popular Products:**\nHere are some items you might like:",
                "products": products,
                "options": get_display_options()[:6],
                "type": "products"
            }
        
        # Handle empty message (welcome)
        if not message or message.strip() == "":
            return get_welcome_response()
        
        # Extract category from message
        category = extract_category(message)
        logger.info(f"📊 Extracted category: {category}")
        
        # Handle delivery intent
        if category == "delivery":
            return get_delivery_response()
        
        # Handle help intent
        if category == "help":
            return get_help_response()
        
        # Handle price selection
        if category == "price" or "under" in message.lower() or "₹" in message:
            # Check if it's a price range selection
            if message in ["Under ₹500", "₹500 - ₹1000", "₹1000 - ₹2500", "₹2500 - ₹5000", "Above ₹5000"]:
                # Parse the selected range
                if "Under" in message:
                    max_price = 500
                    products = await fetch_products_by_price(NODE_BACKEND_URL, max_price=max_price, limit=8)
                    return {
                        "message": f"💰 **Products under ₹{max_price}:**",
                        "products": products,
                        "options": get_display_options()[:6],
                        "type": "products"
                    }
                elif "₹500 - ₹1000" in message:
                    products = await fetch_products_by_price(NODE_BACKEND_URL, min_price=500, max_price=1000, limit=8)
                    return {
                        "message": "💰 **Products between ₹500 - ₹1000:**",
                        "products": products,
                        "options": get_display_options()[:6],
                        "type": "products"
                    }
                elif "₹1000 - ₹2500" in message:
                    products = await fetch_products_by_price(NODE_BACKEND_URL, min_price=1000, max_price=2500, limit=8)
                    return {
                        "message": "💰 **Products between ₹1000 - ₹2500:**",
                        "products": products,
                        "options": get_display_options()[:6],
                        "type": "products"
                    }
                elif "₹2500 - ₹5000" in message:
                    products = await fetch_products_by_price(NODE_BACKEND_URL, min_price=2500, max_price=5000, limit=8)
                    return {
                        "message": "💰 **Products between ₹2500 - ₹5000:**",
                        "products": products,
                        "options": get_display_options()[:6],
                        "type": "products"
                    }
                elif "Above ₹5000" in message:
                    products = await fetch_products_by_price(NODE_BACKEND_URL, min_price=5000, limit=8)
                    return {
                        "message": "💰 **Premium products above ₹5000:**",
                        "products": products,
                        "options": get_display_options()[:6],
                        "type": "products"
                    }
            else:
                # Try to extract price from natural language
                price_range = extract_price_from_message(message)
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
                        
                        return {
                            "message": f"💰 **Products {range_text}:**",
                            "products": products,
                            "options": get_display_options()[:6],
                            "type": "products"
                        }
            
            # If no price-specific products found, show price selection
            return get_price_selection_response()
        
        # Handle category browsing
        if category and category not in ["all", "price", "help", "delivery"]:
            # Fetch products for this category
            products = await fetch_products_by_category(NODE_BACKEND_URL, category, limit=8)
            
            if products:
                icon = get_category_icon(category)
                return {
                    "message": f"{icon} **{category} Products:**\nHere's what we have in this category:",
                    "products": products,
                    "options": get_display_options()[:6],
                    "type": "products",
                    "category": category
                }
            else:
                # If no products in category, show all products
                all_products = await fetch_all_products(NODE_BACKEND_URL, limit=8)
                return {
                    "message": f"😕 No {category} products found. Here are all our products:",
                    "products": all_products,
                    "options": get_display_options()[:6],
                    "type": "products"
                }
        
        # Handle "Browse All" or "all" category
        if category == "all" or "all" in message.lower() or "browse" in message.lower():
            products = await fetch_all_products(NODE_BACKEND_URL, limit=10)
            return {
                "message": "📦 **All Products:**\nHere's our complete collection:",
                "products": products,
                "options": get_display_options()[:6],
                "type": "products"
            }
        
        # Default: Search or show all products
        products = await fetch_all_products(NODE_BACKEND_URL, limit=8)
        return {
            "message": "🌟 **Popular Products:**\nHere are some items you might like:",
            "products": products,
            "options": get_display_options()[:6],
            "type": "products"
        }
        
    except Exception as e:
        logger.error(f"❌ Error processing message: {str(e)}", exc_info=True)
        
        # Return graceful error response
        return {
            "message": "😕 I'm having trouble processing your request. Please try again or browse our products directly.",
            "options": ["Try Again", "Browse All", "Help"],
            "products": [],
            "type": "error"
        }

# ------------------- HEALTH CHECK -------------------
@app.get("/health")
async def health():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "node_backend": NODE_BACKEND_URL
    }

@app.get("/")
async def root():
    """Root endpoint with API info"""
    return {
        "name": "Venus Enterprises AI Shopping Assistant",
        "version": "2.0.0",
        "status": "running",
        "endpoints": {
            "chat": "/api/chat",
            "health": "/health"
        },
        "node_backend": NODE_BACKEND_URL,
        "llm_status": "enabled" if HUGGINGFACE_TOKEN else "disabled"
    }

# ------------------- STARTUP/SHUTDOWN -------------------
@app.on_event("startup")
async def startup_event():
    """Run on application startup"""
    logger.info("🚀 Starting Venus AI Shopping Assistant...")
    logger.info(f"📡 Node Backend: {NODE_BACKEND_URL}")

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