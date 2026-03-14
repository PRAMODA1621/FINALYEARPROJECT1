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
    version="3.0.0"
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

# Session storage (simple dict for demo)
sessions = {}

# ------------------- CREATIVE RESPONSE GENERATORS -------------------

def get_welcome_response() -> Dict:
    """Generate welcome message with creative options"""
    return {
        "message": """✨ **Welcome to Venus Enterprises!** ✨

🌟 **Your Premier Destination for Premium Corporate Gifts & Awards** 🌟

━━━━━━━━━━━━━━━━━━━━━━━
💫 **I'm your AI shopping assistant, here to help you find the perfect products!**

🎯 **Try these popular searches:**
• 🏆 "Show me awards under ₹2000"
• 🎁 "Corporate gifts for Diwali"
• 💼 "Executive desk accessories"
• 🖼️ "Customized name plates"
• 💝 "Retirement gift ideas"

━━━━━━━━━━━━━━━━━━━━━━━
👇 **Select an option below to get started!** 👇""",
        "options": [
            "🛍️ **Shop by Category**",
            "💰 **Price Explorer**",
            "🎯 **Gift Finder**",
            "🏢 **Corporate Solutions**",
            "✨ **Custom Orders**",
            "❓ **Help & Support**"
        ],
        "type": "welcome",
        "products": []
    }

def get_category_menu_response() -> Dict:
    """Generate category menu response"""
    return {
        "message": """📦 **Browse Our Premium Collections**

━━━━━━━━━━━━━━━━━━━━━━━
✨ **Handcrafted with Excellence** ✨

🪵 **Wooden Collection**
   • Awards & Trophies
   • Name Plates & Signs
   • Desk Accessories

━━━━━━━━━━━━━━━━━━━━━━━
✨ **Acrylic Collection**
   • Modern Awards
   • LED Name Plates
   • Corporate Signage

━━━━━━━━━━━━━━━━━━━━━━━
⚙️ **Metal Collection**
   • Executive Pens
   • Business Card Holders
   • Keychains & Gifts

━━━━━━━━━━━━━━━━━━━━━━━
💎 **Crystal Collection**
   • Premium Awards
   • Trophies
   • Mementos

━━━━━━━━━━━━━━━━━━━━━━━
🎁 **Gift Collection**
   • Corporate Gifts
   • Festival Specials
   • Custom Hamper

━━━━━━━━━━━━━━━━━━━━━━━
👇 **Select a category to explore!** 👇""",
        "options": [
            "🪵 Wooden Items",
            "✨ Acrylic Items",
            "⚙️ Metal Items",
            "💎 Crystal Items",
            "🎁 Gifts",
            "🏢 Corporate Gifts",
            "🏆 Awards",
            "🗿 Marble",
            "💰 Price Range",
            "🔙 Main Menu"
        ],
        "type": "category_menu",
        "products": []
    }

def get_price_explorer_response() -> Dict:
    """Generate price explorer response"""
    return {
        "message": """💰 **Price Explorer**

━━━━━━━━━━━━━━━━━━━━━━━
💵 **Find Products in Your Budget** 💵

🪙 **Budget Friendly** (Under ₹500)
   • Perfect for small tokens
   • Bulk order specials

━━━━━━━━━━━━━━━━━━━━━━━
💸 **Value Picks** (₹500 - ₹1000)
   • Great quality at great price
   • Most popular range

━━━━━━━━━━━━━━━━━━━━━━━
💎 **Premium Selection** (₹1000 - ₹2500)
   • Executive gifts
   • Custom awards

━━━━━━━━━━━━━━━━━━━━━━━
👑 **Luxury Collection** (₹2500 - ₹5000)
   • Crystal awards
   • Premium gift sets

━━━━━━━━━━━━━━━━━━━━━━━
💫 **Elite Range** (Above ₹5000)
   • Masterpiece pieces
   • Lifetime awards

━━━━━━━━━━━━━━━━━━━━━━━
👇 **Select your budget range!** 👇""",
        "options": [
            "🪙 Under ₹500",
            "💸 ₹500 - ₹1000",
            "💎 ₹1000 - ₹2500",
            "👑 ₹2500 - ₹5000",
            "💫 Above ₹5000",
            "🔙 Main Menu"
        ],
        "type": "price_explorer",
        "products": []
    }

def get_gift_finder_response() -> Dict:
    """Generate gift finder response"""
    return {
        "message": """🎯 **Gift Finder Assistant**

━━━━━━━━━━━━━━━━━━━━━━━
🎁 **Find the Perfect Gift for Any Occasion** 🎁

🏆 **Corporate Excellence**
   • Employee recognition
   • Service awards
   • Milestone celebrations

━━━━━━━━━━━━━━━━━━━━━━━
💼 **Executive Gifts**
   • Client appreciation
   • Business partners
   • VIP tokens

━━━━━━━━━━━━━━━━━━━━━━━
🎉 **Festival Specials**
   • Diwali corporate gifts
   • New Year hampers
   • Seasonal offers

━━━━━━━━━━━━━━━━━━━━━━━
🎓 **Retirement & Farewell**
   • Memory plaques
   • Retirement awards
   • Gratitude mementos

━━━━━━━━━━━━━━━━━━━━━━━
🏅 **Achievement Awards**
   • Employee of the month
   • Sales excellence
   • Innovation awards

━━━━━━━━━━━━━━━━━━━━━━━
👇 **Tell me what you're looking for!** 👇""",
        "options": [
            "🏆 Corporate Awards",
            "💼 Executive Gifts",
            "🎉 Festival Specials",
            "🎓 Retirement Gifts",
            "🏅 Achievement Awards",
            "🎁 Custom Request",
            "🔙 Main Menu"
        ],
        "type": "gift_finder",
        "products": []
    }

def get_corporate_solutions_response() -> Dict:
    """Generate corporate solutions response"""
    return {
        "message": """🏢 **Corporate Solutions**

━━━━━━━━━━━━━━━━━━━━━━━
💼 **Your Partner in Corporate Gifting** 💼

📊 **Bulk Orders**
   • 50+ pieces special pricing
   • Dedicated account manager
   • Priority production

━━━━━━━━━━━━━━━━━━━━━━━
🎨 **Custom Branding**
   • Logo engraving
   • Custom packaging
   • Brand colors

━━━━━━━━━━━━━━━━━━━━━━━
📦 **Corporate Gifting Programs**
   • Employee recognition
   • Client appreciation
   • Festival gifting
   • Welcome kits

━━━━━━━━━━━━━━━━━━━━━━━
✅ **Benefits**
   • GST invoices
   • Pan-India delivery
   • Quality guarantee
   • Design consultation

━━━━━━━━━━━━━━━━━━━━━━━
📞 **Get a Quote Today!**
Contact our corporate team for personalized solutions.

👇 **Choose an option:** 👇""",
        "options": [
            "📊 Bulk Order Quote",
            "🎨 Custom Branding",
            "📦 View Catalog",
            "📞 Talk to Specialist",
            "🔙 Main Menu"
        ],
        "type": "corporate",
        "products": []
    }

def get_custom_orders_response() -> Dict:
    """Generate custom orders response"""
    return {
        "message": """✨ **Custom Orders**

━━━━━━━━━━━━━━━━━━━━━━━
🎨 **Make It uniquely Yours** 🎨

🖋️ **Engraving Services**
   • Laser engraving
   • Metal etching
   • Glass etching

━━━━━━━━━━━━━━━━━━━━━━━
🖼️ **Logo Printing**
   • Full color printing
   • UV printing
   • Screen printing

━━━━━━━━━━━━━━━━━━━━━━━
🎨 **Custom Designs**
   • Unique shapes
   • Special colors
   • Combined materials

━━━━━━━━━━━━━━━━━━━━━━━
📦 **Custom Packaging**
   • Branded boxes
   • Velvet pouches
   • Ribbon wrapping

━━━━━━━━━━━━━━━━━━━━━━━
⏱️ **Process**
1. Share your idea
2. Get design proof
3. Approve sample
4. Bulk production

━━━━━━━━━━━━━━━━━━━━━━━
👇 **Start your custom order!** 👇""",
        "options": [
            "🖋️ Request Engraving",
            "🖼️ Upload Logo",
            "🎨 Design Consultation",
            "📦 Packaging Options",
            "📞 Talk to Designer",
            "🔙 Main Menu"
        ],
        "type": "custom",
        "products": []
    }

def get_simplified_help_response() -> Dict:
    """Generate simplified help response that redirects to contact"""
    return {
        "message": """❓ **Need Assistance?**

━━━━━━━━━━━━━━━━━━━━━━━
💬 **We're Here to Help!** 💬

📞 **Quick Support Options:**

━━━━━━━━━━━━━━━━━━━━━━━
📧 **Email Support**
   • support@venusenterprises.com
   • Response within 4 hours

━━━━━━━━━━━━━━━━━━━━━━━
📱 **WhatsApp**
   • +91 98765 43210
   • Instant replies during business hours

━━━━━━━━━━━━━━━━━━━━━━━
📞 **Phone Support**
   • +91 98765 43210
   • Mon-Fri: 9AM-6PM
   • Sat: 10AM-2PM

━━━━━━━━━━━━━━━━━━━━━━━
📍 **Visit Us**
   • No. 42, Industrial Layout
   • Peenya Industrial Area
   • Bengaluru - 560058

━━━━━━━━━━━━━━━━━━━━━━━
💫 **For fastest response, click below to visit our Contact Page!** 💫""",
        "options": [
            "📞 Contact Page",
            "📱 WhatsApp Chat",
            "📧 Email Support",
            "📍 Visit Office",
            "🔙 Main Menu"
        ],
        "type": "help",
        "products": []
    }

def get_contact_page_response() -> Dict:
    """Generate contact page redirect response"""
    return {
        "message": """📞 **Contact Us**

━━━━━━━━━━━━━━━━━━━━━━━
✨ **We'd Love to Hear From You!** ✨

Click the link below to visit our **Contact Page**:

🔗 **[Go to Contact Page](https://venus-frontend-guqs.onrender.com/contact)**

━━━━━━━━━━━━━━━━━━━━━━━
**Quick Contact Info:**

📧 **Email:** support@venusenterprises.com
📱 **WhatsApp:** +91 98765 43210
📞 **Phone:** +91 98765 43210
🕒 **Hours:** Mon-Sat, 9AM-6PM

━━━━━━━━━━━━━━━━━━━━━━━
👇 **Need something else?** 👇""",
        "options": [
            "📞 Contact Page",
            "📱 WhatsApp",
            "💬 Chat Now",
            "🔙 Main Menu"
        ],
        "type": "contact_redirect",
        "products": []
    }

def get_main_menu_response() -> Dict:
    """Return to main menu"""
    return get_welcome_response()

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
        session_id = body.get("session_id", "default")
        
        logger.info(f"📨 Message: '{message}'")
        
        # Initialize session if not exists
        if session_id not in sessions:
            sessions[session_id] = {"context": {}}
        
        session = sessions[session_id]
        
        # Handle empty message (welcome)
        if not message or message.strip() == "":
            return get_welcome_response()
        
        # Handle Main Menu / Back to Main Menu
        if message in ["🔙 Main Menu", "Main Menu", "menu", "home"]:
            return get_welcome_response()
        
        # Handle Main Menu options
        if message == "🛍️ **Shop by Category**" or message == "🛍️ Shop by Category":
            return get_category_menu_response()
        
        if message == "💰 **Price Explorer**" or message == "💰 Price Explorer":
            return get_price_explorer_response()
        
        if message == "🎯 **Gift Finder**" or message == "🎯 Gift Finder":
            return get_gift_finder_response()
        
        if message == "🏢 **Corporate Solutions**" or message == "🏢 Corporate Solutions":
            return get_corporate_solutions_response()
        
        if message == "✨ **Custom Orders**" or message == "✨ Custom Orders":
            return get_custom_orders_response()
        
        if message == "❓ **Help & Support**" or message == "❓ Help & Support" or message == "❓ Help":
            return get_simplified_help_response()
        
        # Handle Help sub-options
        if message == "📞 Contact Page":
            return get_contact_page_response()
        
        if message == "📱 WhatsApp Chat":
            return {
                "message": """📱 **WhatsApp Chat**

Click the link below to chat with us on WhatsApp:

🔗 **[Chat on WhatsApp](https://wa.me/919876543210)**

Our team typically responds within minutes during business hours!

━━━━━━━━━━━━━━━━━━━━━━━
📞 **Business Hours:**
• Mon-Fri: 9AM - 6PM
• Sat: 10AM - 2PM
• Sun: Closed

👇 **Need something else?** 👇""",
                "options": [
                    "📞 Contact Page",
                    "📧 Email Support",
                    "🔙 Main Menu"
                ],
                "type": "whatsapp",
                "products": []
            }
        
        if message == "📧 Email Support":
            return {
                "message": """📧 **Email Support**

Send us an email at:

📩 **support@venusenterprises.com**

We respond within 4 hours during business days.

━━━━━━━━━━━━━━━━━━━━━━━
💡 **Pro Tip:** Include your order number for faster assistance!

━━━━━━━━━━━━━━━━━━━━━━━
📞 **Prefer to call?** +91 98765 43210

👇 **Choose an option:** 👇""",
                "options": [
                    "📞 Contact Page",
                    "📱 WhatsApp",
                    "🔙 Main Menu"
                ],
                "type": "email",
                "products": []
            }
        
        if message == "📍 Visit Office":
            return {
                "message": """📍 **Visit Our Office**

**Venus Enterprises**
No. 42, Industrial Layout
Peenya Industrial Area
Bengaluru, Karnataka 560058

━━━━━━━━━━━━━━━━━━━━━━━
🗺️ **[View on Google Maps](https://maps.google.com/?q=Peenya+Industrial+Area+Bengaluru)**

━━━━━━━━━━━━━━━━━━━━━━━
🕒 **Office Hours:**
• Monday - Friday: 9:00 AM - 6:00 PM
• Saturday: 10:00 AM - 2:00 PM
• Sunday: Closed

━━━━━━━━━━━━━━━━━━━━━━━
📞 **Call before visiting:** +91 98765 43210

👇 **Need directions?** 👇""",
                "options": [
                    "📞 Contact Page",
                    "📱 WhatsApp",
                    "🔙 Main Menu"
                ],
                "type": "location",
                "products": []
            }
        
        if message == "💬 Chat Now":
            return {
                "message": """💬 **Live Chat**

Our live chat is available on our website!

🔗 **[Start Live Chat](https://venus-frontend-guqs.onrender.com/contact)**

━━━━━━━━━━━━━━━━━━━━━━━
⏱️ **Average wait time: < 2 minutes**

👇 **Other options:** 👇""",
                "options": [
                    "📞 Contact Page",
                    "📱 WhatsApp",
                    "📧 Email",
                    "🔙 Main Menu"
                ],
                "type": "livechat",
                "products": []
            }
        
        # Handle category selection from category menu
        if message in ["🪵 Wooden Items", "✨ Acrylic Items", "⚙️ Metal Items", "💎 Crystal Items", 
                      "🎁 Gifts", "🏢 Corporate Gifts", "🏆 Awards", "🗿 Marble"]:
            category_map = {
                "🪵 Wooden Items": "Wooden",
                "✨ Acrylic Items": "Acrylic",
                "⚙️ Metal Items": "Metal",
                "💎 Crystal Items": "Crystal",
                "🎁 Gifts": "Gifts",
                "🏢 Corporate Gifts": "Corporate Gifts",
                "🏆 Awards": "Awards",
                "🗿 Marble": "Marble"
            }
            category = category_map[message]
            session["context"]["current_category"] = category
            
            # Fetch products for this category
            products = await fetch_products_by_category(NODE_BACKEND_URL, category, limit=8)
            
            icon = get_category_icon(category)
            return {
                "message": f"""{icon} **{category} Collection**

━━━━━━━━━━━━━━━━━━━━━━━
✨ **Handpicked {category} Products** ✨

Here are our top picks for you:

━━━━━━━━━━━━━━━━━━━━━━━
💡 **Tip:** You can sort by price or filter by budget!""",
                "products": products,
                "options": [
                    "💰 Filter by Price",
                    "📈 Price: Low to High",
                    "📉 Price: High to Low",
                    "🎯 Gift Finder",
                    "🔙 Main Menu"
                ],
                "type": "products",
                "category": category
            }
        
        # Handle price range selection
        if message in ["🪙 Under ₹500", "💸 ₹500 - ₹1000", "💎 ₹1000 - ₹2500", 
                      "👑 ₹2500 - ₹5000", "💫 Above ₹5000"]:
            
            price_map = {
                "🪙 Under ₹500": {"max": 500},
                "💸 ₹500 - ₹1000": {"min": 500, "max": 1000},
                "💎 ₹1000 - ₹2500": {"min": 1000, "max": 2500},
                "👑 ₹2500 - ₹5000": {"min": 2500, "max": 5000},
                "💫 Above ₹5000": {"min": 5000}
            }
            
            price_range = price_map[message]
            
            # Check if we're in a category context
            current_category = session["context"].get("current_category")
            
            if current_category:
                products = await fetch_products_by_price(
                    NODE_BACKEND_URL, 
                    min_price=price_range.get("min"),
                    max_price=price_range.get("max"),
                    limit=8
                )
                # Filter by category manually if needed
                products = [p for p in products if p.get('category', '').lower() == current_category.lower()]
            else:
                products = await fetch_products_by_price(
                    NODE_BACKEND_URL,
                    min_price=price_range.get("min"),
                    max_price=price_range.get("max"),
                    limit=8
                )
            
            range_text = message
            return {
                "message": f"""💰 **{range_text}**

━━━━━━━━━━━━━━━━━━━━━━━
✨ **Products in your budget** ✨

Found {len(products)} items matching your criteria:

━━━━━━━━━━━━━━━━━━━━━━━
💡 **Tip:** Click on any product to view details!""",
                "products": products,
                "options": [
                    "📈 Price: Low to High",
                    "📉 Price: High to Low",
                    "🎯 Gift Finder",
                    "🔙 Main Menu"
                ],
                "type": "products"
            }
        
        # Handle price sorting
        if message in ["📈 Price: Low to High", "📉 Price: High to Low"]:
            sort_by = "price_low" if "Low" in message else "price_high"
            current_category = session["context"].get("current_category")
            
            if current_category:
                products = await fetch_products_by_category(
                    NODE_BACKEND_URL, 
                    current_category, 
                    limit=8, 
                    sort_by=sort_by
                )
            else:
                products = await fetch_all_products(NODE_BACKEND_URL, limit=8, sort_by=sort_by)
            
            return {
                "message": f"""📊 **Sorted by {'Lowest' if sort_by=='price_low' else 'Highest'} Price**

━━━━━━━━━━━━━━━━━━━━━━━
✨ Here are your results:""",
                "products": products,
                "options": [
                    "💰 Filter by Price",
                    "🎯 Gift Finder",
                    "🔙 Main Menu"
                ],
                "type": "products_sorted"
            }
        
        # Handle Filter by Price
        if message == "💰 Filter by Price":
            return get_price_explorer_response()
        
        # Handle Gift Finder options
        if message in ["🏆 Corporate Awards", "💼 Executive Gifts", "🎉 Festival Specials", 
                      "🎓 Retirement Gifts", "🏅 Achievement Awards", "🎁 Custom Request"]:
            
            # Map to appropriate category or search
            gift_map = {
                "🏆 Corporate Awards": "Awards",
                "💼 Executive Gifts": "Gifts",
                "🎉 Festival Specials": "Gifts",
                "🎓 Retirement Gifts": "Awards",
                "🏅 Achievement Awards": "Awards",
                "🎁 Custom Request": "custom"
            }
            
            category = gift_map[message]
            
            if category == "custom":
                return get_custom_orders_response()
            
            products = await fetch_products_by_category(NODE_BACKEND_URL, category, limit=8)
            
            return {
                "message": f"""🎁 **{message}**

━━━━━━━━━━━━━━━━━━━━━━━
✨ Here are some perfect options:""",
                "products": products,
                "options": [
                    "💰 Filter by Price",
                    "📈 Price: Low to High",
                    "📉 Price: High to Low",
                    "🔙 Main Menu"
                ],
                "type": "products"
            }
        
        # Handle Corporate Solutions options
        if message == "📊 Bulk Order Quote":
            return {
                "message": """📊 **Bulk Order Quote**

━━━━━━━━━━━━━━━━━━━━━━━
💼 **Get a Custom Quote for Bulk Orders**

Please visit our contact page and mention:
• Product name/type
• Quantity needed
• Customization requirements
• Delivery timeline

🔗 **[Request Quote](https://venus-frontend-guqs.onrender.com/contact)**

━━━━━━━━━━━━━━━━━━━━━━━
📞 **Or call our corporate team:** +91 98765 43211

👇 **Need something else?** 👇""",
                "options": [
                    "🎨 Custom Branding",
                    "📦 View Catalog",
                    "📞 Talk to Specialist",
                    "🔙 Main Menu"
                ],
                "type": "bulk_quote",
                "products": []
            }
        
        if message == "🎨 Custom Branding":
            return {
                "message": """🎨 **Custom Branding Services**

━━━━━━━━━━━━━━━━━━━━━━━
✨ **Make Your Brand Shine** ✨

**Available Options:**
• 🖋️ Laser Engraving
• 🖼️ Logo Printing
• 🎨 Custom Colors
• 📦 Branded Packaging

**Minimum Order:** 50 pieces
**Setup Time:** 3-5 days
**Production:** 7-10 days

━━━━━━━━━━━━━━━━━━━━━━━
🔗 **[Start Branding Request](https://venus-frontend-guqs.onrender.com/contact)**

👇 **Choose an option:** 👇""",
                "options": [
                    "📊 Bulk Order Quote",
                    "📦 View Catalog",
                    "📞 Talk to Specialist",
                    "🔙 Main Menu"
                ],
                "type": "branding",
                "products": []
            }
        
        if message == "📦 View Catalog":
            return get_category_menu_response()
        
        if message == "📞 Talk to Specialist":
            return get_contact_page_response()
        
        # Handle Custom Orders options
        if message == "🖋️ Request Engraving":
            return {
                "message": """🖋️ **Engraving Request**

━━━━━━━━━━━━━━━━━━━━━━━
✨ **Personalize Your Product** ✨

**Engraving Options:**
• Text (names, messages)
• Logos
• Dates
• Special symbols

━━━━━━━━━━━━━━━━━━━━━━━
🔗 **[Submit Engraving Request](https://venus-frontend-guqs.onrender.com/contact)**

Please provide:
1. Product selection
2. Text to engrave
3. Font preference
4. Any special instructions

━━━━━━━━━━━━━━━━━━━━━━━
👇 **Other options:** 👇""",
                "options": [
                    "🖼️ Upload Logo",
                    "🎨 Design Consultation",
                    "📦 Packaging Options",
                    "🔙 Main Menu"
                ],
                "type": "engraving",
                "products": []
            }
        
        if message == "🖼️ Upload Logo":
            return {
                "message": """🖼️ **Logo Upload**

━━━━━━━━━━━━━━━━━━━━━━━
✨ **Add Your Brand Logo** ✨

**Accepted Formats:**
• AI, EPS, SVG (vector)
• PNG, JPG (min 300 DPI)
• PDF

━━━━━━━━━━━━━━━━━━━━━━━
🔗 **[Upload Logo](https://venus-frontend-guqs.onrender.com/contact)**

**Note:** For best results, provide vector files.

━━━━━━━━━━━━━━━━━━━━━━━
👇 **Need help?** 👇""",
                "options": [
                    "🖋️ Request Engraving",
                    "🎨 Design Consultation",
                    "📞 Talk to Designer",
                    "🔙 Main Menu"
                ],
                "type": "logo_upload",
                "products": []
            }
        
        if message == "🎨 Design Consultation":
            return {
                "message": """🎨 **Design Consultation**

━━━━━━━━━━━━━━━━━━━━━━━
✨ **Bring Your Ideas to Life** ✨

Our designers can help with:
• Custom product design
• Material selection
• Color schemes
• Packaging design

━━━━━━━━━━━━━━━━━━━━━━━
🔗 **[Schedule Consultation](https://venus-frontend-guqs.onrender.com/contact)**

**Consultation:** Free for orders above ₹10,000

━━━━━━━━━━━━━━━━━━━━━━━
👇 **Choose an option:** 👇""",
                "options": [
                    "🖋️ Request Engraving",
                    "🖼️ Upload Logo",
                    "📞 Talk to Designer",
                    "🔙 Main Menu"
                ],
                "type": "consultation",
                "products": []
            }
        
        if message == "📦 Packaging Options":
            return {
                "message": """📦 **Packaging Options**

━━━━━━━━━━━━━━━━━━━━━━━
✨ **Premium Packaging Solutions** ✨

**Available Options:**
• 🎁 Branded Gift Boxes
• 🎀 Velvet Pouches
• 📦 Custom Corrugated Boxes
• 🫧 Bubble Wrap Protection
• 📄 Tissue Paper with Logo

━━━━━━━━━━━━━━━━━━━━━━━
**Minimum Order:** 100 pieces for custom packaging

━━━━━━━━━━━━━━━━━━━━━━━
🔗 **[Request Packaging Quote](https://venus-frontend-guqs.onrender.com/contact)**

👇 **Other options:** 👇""",
                "options": [
                    "🎨 Design Consultation",
                    "📊 Bulk Order Quote",
                    "🔙 Main Menu"
                ],
                "type": "packaging",
                "products": []
            }
        
        if message == "📞 Talk to Designer":
            return get_contact_page_response()
        
        # Extract category from message for general queries
        category = extract_category(message)
        
        # Handle category browsing for direct text queries
        if category and category not in ["price", "help", "delivery", "all"]:
            products = await fetch_products_by_category(NODE_BACKEND_URL, category, limit=8)
            if products:
                icon = get_category_icon(category)
                return {
                    "message": f"""{icon} **{category} Products**

━━━━━━━━━━━━━━━━━━━━━━━
✨ Here's what we found:""",
                    "products": products,
                    "options": [
                        "💰 Filter by Price",
                        "📈 Price: Low to High",
                        "📉 Price: High to Low",
                        "🎯 Gift Finder",
                        "🔙 Main Menu"
                    ],
                    "type": "products"
                }
        
        # Handle price queries
        if "under" in message.lower() or "below" in message.lower() or "less than" in message.lower():
            price_range = extract_price_from_message(message)
            if price_range and price_range.get("max"):
                products = await fetch_products_by_price(NODE_BACKEND_URL, max_price=price_range["max"], limit=8)
                return {
                    "message": f"""💰 **Products under ₹{price_range['max']}**

━━━━━━━━━━━━━━━━━━━━━━━
✨ Great budget-friendly options:""",
                    "products": products,
                    "options": [
                        f"Under ₹{price_range['max']//2}",
                        f"Under ₹{price_range['max']*2}",
                        "📈 Price: Low to High",
                        "🔙 Main Menu"
                    ],
                    "type": "products"
                }
        
        # Default: show all products
        products = await fetch_all_products(NODE_BACKEND_URL, limit=8)
        return {
            "message": """🌟 **Popular Products**

━━━━━━━━━━━━━━━━━━━━━━━
✨ Here are our bestsellers and trending items:""",
            "products": products,
            "options": [
                "🛍️ Shop by Category",
                "💰 Price Explorer",
                "🎯 Gift Finder",
                "🏢 Corporate Solutions"
            ],
            "type": "products"
        }
        
    except Exception as e:
        logger.error(f"❌ Error processing message: {str(e)}", exc_info=True)
        
        # Return graceful error response
        return {
            "message": """😕 **Oops! Something went wrong.**

━━━━━━━━━━━━━━━━━━━━━━━
Don't worry, we're here to help!

🔗 **[Contact Support](https://venus-frontend-guqs.onrender.com/contact)**

Or try one of these options:""",
            "options": [
                "🛍️ Shop by Category",
                "💰 Price Explorer",
                "📞 Contact Page",
                "🔄 Try Again"
            ],
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
        "node_backend": NODE_BACKEND_URL,
        "active_sessions": len(sessions)
    }

@app.get("/")
async def root():
    """Root endpoint with API info"""
    return {
        "name": "Venus Enterprises AI Shopping Assistant",
        "version": "3.0.0",
        "status": "running",
        "features": [
            "✨ Creative shopping assistant",
            "🛍️ Category browsing",
            "💰 Price explorer",
            "🎯 Gift finder",
            "🏢 Corporate solutions",
            "✨ Custom orders",
            "📞 Help & support"
        ],
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
    logger.info("🚀 Starting Venus AI Shopping Assistant v3.0...")
    logger.info(f"📡 Node Backend: {NODE_BACKEND_URL}")
    logger.info("✨ Enhanced creative features loaded")

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