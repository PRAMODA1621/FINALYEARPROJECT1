# category_mapper.py

import re

# Master category mapping with all possible variations
CATEGORY_MAPPING = {
    # Wooden variations
    "wooden": "Wooden",
    "wood": "Wooden", 
    "🪵": "Wooden",
    "wooden items": "Wooden",
    "wood items": "Wooden",
    "wooden awards": "Wooden",
    "wooden gifts": "Wooden",
    "wood products": "Wooden",
    
    # Acrylic variations
    "acrylic": "Acrylic",
    "✨": "Acrylic",
    "acrylic items": "Acrylic",
    "acrylic awards": "Acrylic",
    "acrylic gifts": "Acrylic",
    "acrylic products": "Acrylic",
    
    # Metal variations
    "metal": "Metal",
    "⚙️": "Metal",
    "metal awards": "Metal",
    "metal trophies": "Metal",
    "metal gifts": "Metal",
    "metallic": "Metal",
    
    # Crystal variations
    "crystal": "Crystal",
    "💎": "Crystal",
    "crystal awards": "Crystal",
    "crystal trophies": "Crystal",
    "glass": "Crystal",
    "glass awards": "Crystal",
    
    # Corporate gifts variations
    "corporate": "Corporate Gifts",
    "🏢": "Corporate Gifts",
    "corporate gifts": "Corporate Gifts",
    "business gifts": "Corporate Gifts",
    "office gifts": "Corporate Gifts",
    "company gifts": "Corporate Gifts",
    "promotional": "Corporate Gifts",
    "promotional gifts": "Corporate Gifts",
    
    # Awards variations
    "award": "Awards",
    "awards": "Awards",
    "🏆": "Awards",
    "trophy": "Awards",
    "trophies": "Awards",
    "medal": "Awards",
    "medals": "Awards",
    "memento": "Awards",
    "mementos": "Awards",
    "plaques": "Awards",
    "plaque": "Awards",
    
    # Price related
    "price": "price_filter",
    "💰": "price_filter",
    "under": "price_filter",
    "budget": "price_filter",
    
    # Help
    "help": "help",
    "❓": "help",
    
    # Browse all
    "browse all": "all",
    "all products": "all",
    "show all": "all",
}

# Display categories with their exact match strings
DISPLAY_CATEGORIES = [
    {"display": "🪵 Wooden Items", "category": "Wooden", "icon": "🪵"},
    {"display": "✨ Acrylic Items", "category": "Acrylic", "icon": "✨"},
    {"display": "⚙️ Metal Items", "category": "Metal", "icon": "⚙️"},
    {"display": "💎 Crystal Items", "category": "Crystal", "icon": "💎"},
    {"display": "🏢 Corporate Gifts", "category": "Corporate Gifts", "icon": "🏢"},
    {"display": "🏆 Awards", "category": "Awards", "icon": "🏆"},
    {"display": "💰 Price Range", "category": "price_filter", "icon": "💰"},
    {"display": "❓ Help", "category": "help", "icon": "❓"},
    {"display": "📦 Browse All", "category": "all", "icon": "📦"},
]

def clean_message(message):
    """Remove emojis and clean the message"""
    # Remove common emojis
    emoji_pattern = re.compile("["
        u"\U0001F600-\U0001F64F"  # emoticons
        u"\U0001F300-\U0001F5FF"  # symbols & pictographs
        u"\U0001F680-\U0001F6FF"  # transport & map symbols
        u"\U0001F1E0-\U0001F1FF"  # flags (iOS)
        u"\U00002702-\U000027B0"
        u"\U000024C2-\U0001F251"
        "]+", flags=re.UNICODE)
    
    cleaned = emoji_pattern.sub(r'', message)
    return cleaned.strip().lower()

def extract_category(message):
    """Extract category from any message format"""
    if not message:
        return None
    
    # First try direct display match
    for display_cat in DISPLAY_CATEGORIES:
        if message == display_cat["display"] or message.startswith(display_cat["icon"]):
            return display_cat["category"]
    
    # Clean message (remove emojis)
    cleaned = clean_message(message)
    
    # Check exact matches in mapping
    if cleaned in CATEGORY_MAPPING:
        return CATEGORY_MAPPING[cleaned]
    
    # Check partial matches
    for key, category in CATEGORY_MAPPING.items():
        if key in cleaned or cleaned in key:
            return category
    
    return None

def get_display_options():
    """Get formatted display options for the frontend"""
    return [cat["display"] for cat in DISPLAY_CATEGORIES]

def get_category_from_display(display_text):
    """Extract actual category from display text"""
    for cat in DISPLAY_CATEGORIES:
        if display_text == cat["display"]:
            return cat["category"]
        # Also check if it starts with the icon
        if cat["icon"] in display_text:
            return cat["category"]
    return None