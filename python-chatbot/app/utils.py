import re
import json
from typing import List, Dict, Any, Optional
import logging

logger = logging.getLogger(__name__)

def extract_entities(text: str) -> Dict[str, Any]:
    """Extract entities from user message"""
    entities = {
        "product_names": [],
        "prices": [],
        "quantities": [],
        "order_numbers": [],
        "categories": []
    }
    
    # Extract product names (simple pattern - improve with NLP in production)
    product_patterns = [
        r"(?:the |a |an )?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)"
    ]
    
    for pattern in product_patterns:
        matches = re.findall(pattern, text)
        entities["product_names"].extend(matches)
    
    # Extract prices
    price_pattern = r'\$\d+(?:\.\d{2})?'
    entities["prices"] = re.findall(price_pattern, text)
    
    # Extract quantities
    quantity_pattern = r'\b(\d+)\s+(?:piece|item|unit|qty)\b'
    entities["quantities"] = re.findall(quantity_pattern, text, re.IGNORECASE)
    
    # Extract order numbers
    order_pattern = r'ORD-\d+-\w+'
    entities["order_numbers"] = re.findall(order_pattern, text)
    
    # Extract categories
    categories = ["electronics", "clothing", "books", "home", "sports", "outdoor"]
    for category in categories:
        if category in text.lower():
            entities["categories"].append(category)
    
    return entities

def format_product_response(products: List[Dict]) -> str:
    """Format product information for response"""
    if not products:
        return "I couldn't find any products matching your criteria."
    
    if len(products) == 1:
        p = products[0]
        return f"**{p.get('name')}**\nPrice: ${p.get('price', 0):.2f}\n{p.get('description', '')[:200]}..."
    
    response = "Here are some products you might like:\n\n"
    for i, p in enumerate(products[:5], 1):
        response += f"{i}. **{p.get('name')}** - ${p.get('price', 0):.2f}\n"
    
    return response

def format_order_response(order: Dict) -> str:
    """Format order information for response"""
    if not order:
        return "I couldn't find that order. Please check the order number and try again."
    
    status_emoji = {
        "pending": "⏳",
        "processing": "⚙️",
        "shipped": "📦",
        "delivered": "✅",
        "cancelled": "❌"
    }
    
    emoji = status_emoji.get(order.get("order_status", ""), "📋")
    
    response = f"{emoji} **Order #{order.get('order_number')}**\n"
    response += f"Status: {order.get('order_status', 'Unknown').title()}\n"
    response += f"Total: ${float(order.get('total_amount', 0)):.2f}\n"
    
    if order.get("order_status") == "shipped" and order.get("tracking_number"):
        response += f"Tracking: {order.get('tracking_number')}\n"
    
    return response

def detect_intent(message: str) -> str:
    """Detect user intent from message"""
    message_lower = message.lower()
    
    intents = {
        "greeting": ["hello", "hi", "hey", "good morning", "good afternoon", "good evening"],
        "product_search": ["looking for", "find", "search", "show me", "got any", "have any"],
        "product_info": ["tell me about", "what is", "details", "specs", "features"],
        "price_inquiry": ["price", "cost", "how much", "pricing", "cheap", "expensive"],
        "order_status": ["where is my order", "order status", "track order", "delivery status"],
        "return_policy": ["return", "refund", "exchange", "money back"],
        "shipping_info": ["shipping", "delivery", "ship", "deliver"],
        "payment": ["pay", "payment", "upi", "cod", "cash on delivery"],
        "account": ["account", "login", "sign in", "register", "profile"],
        "help": ["help", "support", "assist", "problem", "issue"],
        "farewell": ["bye", "goodbye", "thanks", "thank you", "see you"]
    }
    
    for intent, keywords in intents.items():
        for keyword in keywords:
            if keyword in message_lower:
                return intent
    
    return "unknown"

def sanitize_message(message: str) -> str:
    """Sanitize user message"""
    # Remove any potentially harmful content
    message = re.sub(r'<[^>]+>', '', message)  # Remove HTML tags
    message = re.sub(r'[^\w\s\.,!?-]', '', message)  # Keep only safe characters
    return message.strip()

def generate_suggestions(intent: str) -> List[str]:
    """Generate suggested questions based on intent"""
    suggestions_map = {
        "greeting": [
            "What products do you have?",
            "How can I track my order?",
            "What's your return policy?"
        ],
        "product_search": [
            "Show me electronics",
            "What's in the clothing section?",
            "Any discounts available?"
        ],
        "product_info": [
            "Tell me more about this product",
            "What are the specifications?",
            "Is it in stock?"
        ],
        "price_inquiry": [
            "Any ongoing sales?",
            "Do you price match?",
            "Any discounts for bulk orders?"
        ],
        "order_status": [
            "Track my recent order",
            "When will my order arrive?",
            "Can I change my shipping address?"
        ],
        "return_policy": [
            "How do I return an item?",
            "How long are returns valid?",
            "Do I need the original packaging?"
        ],
        "shipping_info": [
            "How much is shipping?",
            "Do you ship internationally?",
            "Express shipping options"
        ],
        "payment": [
            "What payment methods do you accept?",
            "Is UPI payment available?",
            "How does Cash on Delivery work?"
        ],
        "account": [
            "Create new account",
            "Reset password",
            "Update profile"
        ],
        "help": [
            "Contact customer support",
            "Create support ticket",
            "FAQs"
        ]
    }
    
    return suggestions_map.get(intent, [
        "Browse products",
        "Check order status",
        "View return policy",
        "Contact support"
    ])