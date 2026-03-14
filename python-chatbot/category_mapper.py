# category_mapper.py
import re
from typing import Optional, Dict, List

# Map chatbot display categories to your database categories
DATABASE_CATEGORIES = {
    "Wooden": "Wooden",
    "Acrylic": "Acrylic",
    "Metal": "Metal",
    "Gifts": "Gifts",
    "Mementos": "Mementos",
    "Marble": "Marble",
    "Corporate Gifts": "Gifts",  # Map corporate gifts to Gifts category
    "Awards": "Mementos",         # Map awards to Mementos category
    "Crystal": "Gifts",           # Map crystal to Gifts category
}

# Display options with icons (what users see)
DISPLAY_CATEGORIES = [
    {"display": "🪵 Wooden Items", "category": "Wooden", "icon": "🪵", "db_category": "Wooden"},
    {"display": "✨ Acrylic Items", "category": "Acrylic", "icon": "✨", "db_category": "Acrylic"},
    {"display": "⚙️ Metal Items", "category": "Metal", "icon": "⚙️", "db_category": "Metal"},
    {"display": "💎 Gifts", "category": "Gifts", "icon": "💎", "db_category": "Gifts"},
    {"display": "🏢 Corporate Gifts", "category": "Corporate Gifts", "icon": "🏢", "db_category": "Gifts"},
    {"display": "🏆 Awards", "category": "Awards", "icon": "🏆", "db_category": "Mementos"},
    {"display": "🗿 Marble", "category": "Marble", "icon": "🗿", "db_category": "Marble"},
    {"display": "💰 Price Range", "category": "price", "icon": "💰", "db_category": None},
    {"display": "❓ Help", "category": "help", "icon": "❓", "db_category": None},
    {"display": "📦 Browse All", "category": "all", "icon": "📦", "db_category": None},
]

# Emoji to category mapping
EMOJI_MAP = {
    "🪵": "Wooden",
    "✨": "Acrylic",
    "⚙️": "Metal",
    "💎": "Gifts",
    "🏢": "Corporate Gifts",
    "🏆": "Awards",
    "🗿": "Marble",
    "💰": "price",
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
    
    # Check for exact display match first
    for display_cat in DISPLAY_CATEGORIES:
        if message == display_cat["display"] or message.startswith(display_cat["icon"]):
            return display_cat["category"]
    
    # Check emoji mapping
    for emoji, category in EMOJI_MAP.items():
        if emoji in message:
            return category
    
    # Check text content
    message_lower = message.lower()
    
    # Direct category matches
    if any(word in message_lower for word in ["wooden", "wood"]):
        return "Wooden"
    if any(word in message_lower for word in ["acrylic"]):
        return "Acrylic"
    if any(word in message_lower for word in ["metal"]):
        return "Metal"
    if any(word in message_lower for word in ["gift", "gifts", "corporate"]):
        return "Corporate Gifts"
    if any(word in message_lower for word in ["award", "awards", "trophy", "trophies"]):
        return "Awards"
    if any(word in message_lower for word in ["marble"]):
        return "Marble"
    if any(word in message_lower for word in ["price", "cost", "budget", "under", "₹"]):
        return "price"
    if any(word in message_lower for word in ["help", "support", "guide"]):
        return "help"
    if any(word in message_lower for word in ["all", "everything", "browse", "show"]):
        return "all"
    
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