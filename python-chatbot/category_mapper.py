# category_mapper.py
import re
from typing import Optional, Dict, List

# Map chatbot display categories to your database categories
DATABASE_CATEGORIES = {
    "Wooden": "Wooden",
    "Acrylic": "Acrylic",
    "Metal": "Metal",
    "Gifts": "Gifts",
    "Corporate Gifts": "Corporate Gifts",
    "Awards": "Awards",
    "Marble": "Marble",
    "Crystal": "Crystal",
}

# Display options with icons (what users see)
DISPLAY_CATEGORIES = [
    {"display": "🪵 Wooden Items", "category": "Wooden", "icon": "🪵", "db_category": "Wooden"},
    {"display": "✨ Acrylic Items", "category": "Acrylic", "icon": "✨", "db_category": "Acrylic"},
    {"display": "⚙️ Metal Items", "category": "Metal", "icon": "⚙️", "db_category": "Metal"},
    {"display": "💎 Crystal Items", "category": "Crystal", "icon": "💎", "db_category": "Crystal"},
    {"display": "🎁 Gifts", "category": "Gifts", "icon": "🎁", "db_category": "Gifts"},
    {"display": "🏢 Corporate Gifts", "category": "Corporate Gifts", "icon": "🏢", "db_category": "Corporate Gifts"},
    {"display": "🏆 Awards", "category": "Awards", "icon": "🏆", "db_category": "Awards"},
    {"display": "🗿 Marble", "category": "Marble", "icon": "🗿", "db_category": "Marble"},
    {"display": "💰 Price Range", "category": "price", "icon": "💰", "db_category": None},
    {"display": "🚚 Delivery Info", "category": "delivery", "icon": "🚚", "db_category": None},
    {"display": "❓ Help", "category": "help", "icon": "❓", "db_category": None},
    {"display": "📦 Browse All", "category": "all", "icon": "📦", "db_category": None},
]

# Emoji to category mapping
EMOJI_MAP = {
    "🪵": "Wooden",
    "✨": "Acrylic",
    "⚙️": "Metal",
    "💎": "Crystal",
    "🎁": "Gifts",
    "🏢": "Corporate Gifts",
    "🏆": "Awards",
    "🗿": "Marble",
    "💰": "price",
    "🚚": "delivery",
    "❓": "help",
    "📦": "all",
}

def extract_category(message: str) -> Optional[str]:
    """
    Extract category from user message
    Handles both emoji and text inputs
    """
    if not message:
        return None
    
    message = message.strip()
    message_lower = message.lower()
    
    # Check for exact display match first
    for display_cat in DISPLAY_CATEGORIES:
        if message == display_cat["display"] or message.startswith(display_cat["icon"]):
            return display_cat["category"]
    
    # Check emoji mapping
    for emoji, category in EMOJI_MAP.items():
        if emoji in message:
            return category
    
    # Check for delivery-related words
    if any(word in message_lower for word in ["delivery", "shipping", "ship", "deliver", "courier", "🚚"]):
        return "delivery"
    
    # Check for price-related words
    if any(word in message_lower for word in ["price", "cost", "budget", "under", "₹", "rs", "rupee"]):
        return "price"
    
    # Check for help
    if any(word in message_lower for word in ["help", "support", "guide", "how", "what"]):
        return "help"
    
    # Check for all products
    if any(word in message_lower for word in ["all", "everything", "browse", "show all", "products"]):
        return "all"
    
    # Check category names
    if "wooden" in message_lower or "wood" in message_lower:
        return "Wooden"
    if "acrylic" in message_lower:
        return "Acrylic"
    if "metal" in message_lower:
        return "Metal"
    if "crystal" in message_lower:
        return "Crystal"
    if "gift" in message_lower:
        return "Gifts"
    if "corporate" in message_lower:
        return "Corporate Gifts"
    if "award" in message_lower or "trophy" in message_lower:
        return "Awards"
    if "marble" in message_lower:
        return "Marble"
    
    return None

def get_db_category(category: str) -> Optional[str]:
    """Convert display category to database category"""
    return DATABASE_CATEGORIES.get(category, category)

def get_display_options() -> List[str]:
    """Get all display options for the frontend"""
    return [cat["display"] for cat in DISPLAY_CATEGORIES]

def get_category_icon(category: str) -> str:
    """Get icon for a category"""
    for cat in DISPLAY_CATEGORIES:
        if cat["category"] == category:
            return cat["icon"]
    return "📦"