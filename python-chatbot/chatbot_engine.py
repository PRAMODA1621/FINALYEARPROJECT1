# chatbot_engine.py
import json
import re
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
import asyncio
from enum import Enum

class ConversationState(Enum):
    GREETING = "greeting"
    CATEGORY_SELECTION = "category_selection"
    PRICE_FILTERING = "price_filtering"
    PRODUCT_BROWSING = "product_browsing"
    PRODUCT_DETAILS = "product_details"
    RECOMMENDATIONS = "recommendations"
    CART_CONFIRMATION = "cart_confirmation"
    CHECKOUT = "checkout"
    HELP = "help"
    CORPORATE_GIFTS = "corporate_gifts"
    CUSTOM_ORDER = "custom_order"

class ConversationMemory:
    def __init__(self, session_id: str):
        self.session_id = session_id
        self.state = ConversationState.GREETING
        self.history = []
        self.context = {
            "preferred_category": None,
            "price_range": {"min": None, "max": None},
            "viewed_products": [],
            "interested_products": [],
            "last_query": None,
            "last_recommendations": [],
            "user_intent": None,
            "questions_asked": 0,
            "interaction_count": 0,
            "preferences": {
                "budget_sensitive": None,
                "category_preference": None,
                "quality_preference": None  # "premium", "budget", "mid-range"
            }
        }
        self.created_at = datetime.now()
        self.last_activity = datetime.now()
    
    def update(self, user_message: str, bot_response: str, intent: Dict):
        self.history.append({
            "user": user_message,
            "bot": bot_response,
            "intent": intent,
            "timestamp": datetime.now().isoformat()
        })
        self.last_activity = datetime.now()
        self.context["interaction_count"] += 1
        self.context["last_query"] = user_message
        
        # Update preferences based on intent
        if intent.get("category"):
            self.context["preferred_category"] = intent["category"]
        if intent.get("price_range"):
            self.context["price_range"] = intent["price_range"]
        if intent.get("intent"):
            self.context["user_intent"] = intent["intent"]
    
    def should_ask_question(self) -> bool:
        """Determine if we should ask a follow-up question"""
        return (self.context["questions_asked"] < 3 and 
                self.context["interaction_count"] % 2 == 0)

class ShoppingAssistant:
    def __init__(self, llm, node_backend_url: str):
        self.llm = llm
        self.node_backend_url = node_backend_url
        self.sessions: Dict[str, ConversationMemory] = {}
        self.category_hierarchy = {
            "Wooden": ["Wooden Awards", "Wooden Trophies", "Wooden Plaques", "Wooden Gifts"],
            "Acrylic": ["Acrylic Awards", "Acrylic Trophies", "Acrylic Signage"],
            "Metal": ["Metal Awards", "Metal Trophies", "Metal Plaques"],
            "Crystal": ["Crystal Awards", "Crystal Trophies", "Crystal Paperweights"],
            "Corporate Gifts": ["Executive Gifts", "Promotional Items", "Branded Merchandise"],
            "Awards": ["Trophies", "Medals", "Plaques", "Mementos"]
        }
        
        self.price_segments = {
            "budget": {"min": 0, "max": 500},
            "economy": {"min": 500, "max": 1000},
            "standard": {"min": 1000, "max": 2500},
            "premium": {"min": 2500, "max": 5000},
            "luxury": {"min": 5000, "max": 100000}
        }
    
    def get_or_create_session(self, session_id: str) -> ConversationMemory:
        if session_id not in self.sessions:
            self.sessions[session_id] = ConversationMemory(session_id)
        
        # Clean up old sessions (older than 1 hour)
        current_time = datetime.now()
        self.sessions = {
            sid: mem for sid, mem in self.sessions.items()
            if current_time - mem.last_activity < timedelta(hours=1)
        }
        
        return self.sessions[session_id]
    
    async def extract_price_preference(self, message: str) -> Dict:
        """Extract price preferences from message"""
        msg = message.lower()
        price_info = {"min": None, "max": None, "segment": None}
        
        # Handle "under X", "below X", "less than X"
        under_patterns = [
            r'under\s*₹?(\d+)',
            r'below\s*₹?(\d+)',
            r'less than\s*₹?(\d+)',
            r'within\s*₹?(\d+)',
            r'budget of\s*₹?(\d+)',
            r'<₹?(\d+)',
            r'₹?(\d+)\s*ke?\s*andar'
        ]
        
        for pattern in under_patterns:
            match = re.search(pattern, msg)
            if match:
                price_info["max"] = int(match.group(1))
                price_info["min"] = 0
                break
        
        # Handle "above X", "over X", "more than X"
        above_patterns = [
            r'above\s*₹?(\d+)',
            r'over\s*₹?(\d+)',
            r'more than\s*₹?(\d+)',
            r'>₹?(\d+)'
        ]
        
        for pattern in above_patterns:
            match = re.search(pattern, msg)
            if match:
                price_info["min"] = int(match.group(1))
                break
        
        # Handle "between X and Y"
        between_patterns = [
            r'between\s*₹?(\d+)\s*(?:and|to|-)\s*₹?(\d+)',
            r'from\s*₹?(\d+)\s*(?:to|-)\s*₹?(\d+)',
            r'₹?(\d+)\s*(?:-|to)\s*₹?(\d+)'
        ]
        
        for pattern in between_patterns:
            match = re.search(pattern, msg)
            if match:
                price_info["min"] = int(match.group(1))
                price_info["max"] = int(match.group(2))
                break
        
        # Handle budget segments
        budget_keywords = {
            "budget": ["budget", "cheap", "affordable", "economy", "low cost", "sasta"],
            "premium": ["premium", "luxury", "high-end", "expensive", "best", "top quality", "mahanga"],
            "mid-range": ["mid range", "moderate", "reasonable", "medium"]
        }
        
        for segment, keywords in budget_keywords.items():
            if any(kw in msg for kw in keywords):
                price_info["segment"] = segment
                if segment in self.price_segments:
                    if price_info["min"] is None:
                        price_info["min"] = self.price_segments[segment]["min"]
                    if price_info["max"] is None:
                        price_info["max"] = self.price_segments[segment]["max"]
                break
        
        return price_info
    
    async def generate_follow_up_question(self, session: ConversationMemory, intent: Dict) -> str:
        """Generate contextual follow-up questions"""
        
        if not session.should_ask_question():
            return None
        
        questions = []
        
        # Based on conversation state
        if session.state == ConversationState.PRODUCT_BROWSING:
            if not session.context["preferred_category"]:
                questions = [
                    "What type of products are you interested in? We have wooden, acrylic, metal, and crystal items.",
                    "Are you looking for awards, corporate gifts, or personal mementos?",
                    "Which category would you like to explore first?"
                ]
            elif not session.context["price_range"]["min"] and not session.context["price_range"]["max"]:
                questions = [
                    "What's your budget range for this?",
                    "Do you have a specific price point in mind?",
                    "Are you looking for something budget-friendly or premium?"
                ]
            else:
                questions = [
                    "Would you like to see similar products in different price ranges?",
                    "Are you interested in customization options?",
                    "Do you need these for a corporate event or personal use?"
                ]
        
        elif session.state == ConversationState.CORPORATE_GIFTS:
            questions = [
                "How many pieces do you need for your corporate order?",
                "Do you need branding or logo customization?",
                "What's your timeline for delivery?"
            ]
        
        elif session.state == ConversationState.PRICE_FILTERING:
            questions = [
                f"Would you like to see products under ₹500, or in the ₹500-1000 range?",
                "Are you looking for the best value or premium quality?",
                "Should I show you items that offer the best discounts?"
            ]
        
        # Return random question from appropriate list
        import random
        return random.choice(questions) if questions else None
    
    async def process_shopping_intent(self, 
                                     message: str, 
                                     session: ConversationMemory,
                                     intent: Dict) -> Dict:
        """Main processing logic for shopping intents"""
        
        # Extract price preference
        price_pref = await self.extract_price_preference(message)
        if price_pref["min"] is not None or price_pref["max"] is not None:
            intent["price_range"] = price_pref
            session.context["price_range"] = price_pref
        
        # Determine state based on intent
        if intent.get("intent") == "corporate_gifts":
            session.state = ConversationState.CORPORATE_GIFTS
        elif intent.get("intent") == "custom_order":
            session.state = ConversationState.CUSTOM_ORDER
        elif intent.get("price_range") and not intent.get("category"):
            session.state = ConversationState.PRICE_FILTERING
        elif intent.get("category") and not intent.get("price_range"):
            session.state = ConversationState.CATEGORY_SELECTION
        else:
            session.state = ConversationState.PRODUCT_BROWSING
        
        # Generate response based on state
        response = await self.generate_state_response(message, session, intent)
        
        # Add follow-up question if appropriate
        follow_up = await self.generate_follow_up_question(session, intent)
        if follow_up:
            response["follow_up"] = follow_up
            session.context["questions_asked"] += 1
        
        return response
    
    async def generate_state_response(self, 
                                     message: str, 
                                     session: ConversationMemory,
                                     intent: Dict) -> Dict:
        """Generate response based on current conversation state"""
        
        from fetch_products import fetch_products_with_filters
        
        response = {
            "message": "",
            "products": [],
            "options": [],
            "type": "response",
            "suggested_actions": []
        }
        
        # Handle different states
        if session.state == ConversationState.CATEGORY_SELECTION:
            category = intent.get("category")
            if category:
                products = await fetch_products_with_filters(
                    self.node_backend_url,
                    category=category,
                    limit=6
                )
                
                if products:
                    response["message"] = f"🎯 Great choice! Here are some popular {category} items:"
                    response["products"] = products
                    response["options"] = [
                        f"More {category}",
                        "Filter by price",
                        "See all categories",
                        "Corporate gifts"
                    ]
                    response["suggested_actions"] = [
                        {"type": "filter", "value": "price"},
                        {"type": "category", "value": category}
                    ]
                else:
                    response["message"] = f"😕 I couldn't find any {category} items. Would you like to try another category?"
                    response["options"] = ["Wooden", "Acrylic", "Metal", "Corporate Gifts"]
            
            else:
                # Ask for category
                response["message"] = "📦 Which category would you like to explore?"
                response["options"] = ["Wooden Items", "Acrylic Items", "Metal Awards", "Corporate Gifts", "Crystal Items"]
                response["type"] = "category_selection"
        
        elif session.state == ConversationState.PRICE_FILTERING:
            price_range = intent.get("price_range", {})
            min_price = price_range.get("min")
            max_price = price_range.get("max")
            
            if max_price and max_price <= 500:
                response["message"] = f"💎 I found some great options under ₹{max_price}:"
                products = await fetch_products_with_filters(
                    self.node_backend_url,
                    max_price=max_price,
                    limit=6
                )
                
                if products:
                    response["products"] = products
                    response["options"] = [
                        "Show premium items",
                        f"Under ₹{int(max_price/2)}",
                        "Show all",
                        "Corporate gifts"
                    ]
                else:
                    response["message"] = f"😕 No products found under ₹{max_price}. Would you like to try a higher budget?"
                    response["options"] = ["Under ₹1000", "Under ₹2000", "All products"]
            
            elif min_price and min_price >= 2500:
                response["message"] = f"✨ Here are our premium products above ₹{min_price}:"
                products = await fetch_products_with_filters(
                    self.node_backend_url,
                    min_price=min_price,
                    limit=6
                )
                
                if products:
                    response["products"] = products
                    response["options"] = [
                        "Show budget items",
                        f"Above ₹{min_price * 2}",
                        "View all premium"
                    ]
                else:
                    response["message"] = f"😕 No products found above ₹{min_price}. Would you like to see our premium collection?"
                    response["options"] = ["Premium under ₹5000", "Best sellers", "All products"]
            
            else:
                # Suggest price ranges
                response["message"] = "💰 What's your budget? I can help you find the perfect items."
                response["options"] = [
                    "Under ₹500 (Budget)",
                    "₹500 - ₹1000 (Economy)",
                    "₹1000 - ₹2500 (Standard)",
                    "₹2500 - ₹5000 (Premium)",
                    "Above ₹5000 (Luxury)"
                ]
                response["type"] = "price_selection"
        
        elif session.state == ConversationState.CORPORATE_GIFTS:
            response["message"] = "🏢 For corporate gifts, I can help you with:"
            response["options"] = [
                "Bulk orders",
                "Custom branding",
                "Price per piece",
                "View collection"
            ]
            response["type"] = "corporate"
            
            # Show some corporate gift options
            products = await fetch_products_with_filters(
                self.node_backend_url,
                category="Corporate Gifts",
                limit=4
            )
            if products:
                response["products"] = products
                response["message"] = "🏢 Here are some popular corporate gift options:"
        
        elif session.state == ConversationState.PRODUCT_BROWSING:
            # Build filters from context
            filters = {}
            if session.context["preferred_category"]:
                filters["category"] = session.context["preferred_category"]
            if session.context["price_range"]["min"]:
                filters["min_price"] = session.context["price_range"]["min"]
            if session.context["price_range"]["max"]:
                filters["max_price"] = session.context["price_range"]["max"]
            
            products = await fetch_products_with_filters(
                self.node_backend_url,
                **filters,
                limit=8
            )
            
            if products:
                # Generate dynamic message
                if filters.get("category") and filters.get("max_price"):
                    response["message"] = f"🎯 Here are {filters['category']} items under ₹{filters['max_price']}:"
                elif filters.get("category"):
                    response["message"] = f"✨ Check out these {filters['category']} products:"
                elif filters.get("max_price"):
                    response["message"] = f"💎 Great options under ₹{filters['max_price']}:"
                else:
                    response["message"] = "🌟 Here are some products you might like:"
                
                response["products"] = products
                
                # Generate smart options
                response["options"] = ["Filter by price", "Change category", "Corporate gifts", "View cart"]
                response["suggested_actions"] = [
                    {"type": "filter", "label": "Sort by price"},
                    {"type": "category", "label": "Browse categories"}
                ]
                
                # Store in context
                session.context["last_recommendations"] = [p["id"] for p in products if "id" in p]
            else:
                response["message"] = "😕 I couldn't find products matching your criteria. Would you like to broaden your search?"
                response["options"] = ["All products", "Popular items", "Corporate gifts", "Help me choose"]
        
        return response

# Enhanced intent understanding
async def enhanced_intent_understanding(llm, message: str, session: ConversationMemory = None) -> Dict:
    """Enhanced intent understanding with context"""
    
    # Build context-aware prompt
    context_info = ""
    if session:
        context_info = f"""
Previous context:
- Current state: {session.state.value}
- Preferred category: {session.context['preferred_category']}
- Price range: {session.context['price_range']}
- Interaction count: {session.context['interaction_count']}
"""
    
    prompt = f"""<s>[INST] You are an advanced AI shopping assistant for Venus Enterprises (premium awards and corporate gifts).
Analyze this customer message and return a detailed JSON.

{context_info}

Customer message: "{message}"

Analyze for:
1. PRIMARY INTENT (most important):
   - browse: looking to see products
   - price_check: asking about prices
   - corporate_gifts: business/bulk orders
   - custom_order: personalization needed
   - category_explore: wants to see specific category
   - recommendation: wants suggestions
   - gift_advice: needs gift suggestions
   - compare: wants to compare products
   - help: needs assistance
   - cart: wants to buy/add to cart

2. SECONDARY INTENT (if any):
   - filter: wants to filter results
   - details: wants product details
   - availability: checking stock
   - delivery: asking about shipping

3. CATEGORY (specific product type):
   - wooden, acrylic, metal, crystal, awards, trophies, plaques, mementos, corporate_gifts

4. PRICE PREFERENCE:
   - Extract min and max values
   - Identify budget segment (budget/economy/standard/premium/luxury)
   - Note if they want "cheap", "affordable", "premium", etc.

5. QUANTITY (for bulk orders)
6. URGENCY (immediate/planned/gift)
7. OCCASION (corporate/award/personal/gift)

Return ONLY valid JSON with structure:
{{
    "primary_intent": "",
    "secondary_intent": null,
    "category": null,
    "price_range": {{"min": null, "max": null, "segment": null}},
    "quantity": null,
    "urgency": null,
    "occasion": null,
    "keywords": [],
    "needs_clarification": false,
    "clarification_questions": []
}}

Be precise and extract all possible information. [/INST]"""

    llm_response = await llm.query(prompt, max_length=250)
    
    # Parse and enhance with rule-based extraction
    try:
        if llm_response and llm_response != "LOADING":
            json_match = re.search(r'\{.*\}', llm_response, re.DOTALL)
            if json_match:
                intent_data = json.loads(json_match.group())
                
                # Enhance with rule-based price extraction
                if not intent_data.get("price_range", {}).get("min") and not intent_data.get("price_range", {}).get("max"):
                    # Try rule-based price extraction
                    from extract_price import extract_price_info
                    price_info = extract_price_info(message)
                    if price_info:
                        intent_data["price_range"] = price_info
                
                return intent_data
    except:
        pass
    
    # Fallback to basic intent
    return basic_intent_fallback(message)

def basic_intent_fallback(message: str) -> Dict:
    """Basic intent parsing as fallback"""
    msg = message.lower()
    
    # Primary intent detection
    intent_map = {
        "browse": ["show", "see", "browse", "looking for", "want", "need", "get"],
        "price_check": ["price", "cost", "₹", "rs", "rupee", "how much", "rate"],
        "corporate_gifts": ["corporate", "company", "business", "office", "bulk", "wholesale"],
        "custom_order": ["custom", "personalized", "engrave", "logo", "branding"],
        "gift_advice": ["gift", "suggest", "recommend", "idea", "for someone"],
        "help": ["help", "support", "guide", "how to", "what is"]
    }
    
    primary_intent = "browse"
    for intent, keywords in intent_map.items():
        if any(kw in msg for kw in keywords):
            primary_intent = intent
            break
    
    # Category detection
    categories = {
        "wooden": ["wooden", "wood"],
        "acrylic": ["acrylic"],
        "metal": ["metal"],
        "crystal": ["crystal"],
        "awards": ["award", "trophy", "medal", "prize"],
        "corporate_gifts": ["corporate", "gift", "business"]
    }
    
    category = None
    for cat, keywords in categories.items():
        if any(kw in msg for kw in keywords):
            category = cat
            break
    
    return {
        "primary_intent": primary_intent,
        "secondary_intent": None,
        "category": category,
        "price_range": {},
        "quantity": None,
        "urgency": None,
        "occasion": None,
        "keywords": [w for w in msg.split() if len(w) > 3][:3],
        "needs_clarification": False,
        "clarification_questions": []
    }