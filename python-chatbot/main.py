# Add this to your main.py or update the process_message function

async def process_message(message: str, session_id: str = None) -> ChatResponse:
    """Enhanced message processing with better category handling"""
    
    from category_mapper import map_to_category, get_display_categories, extract_category_from_display
    from fetch_products import fetch_products_with_filters, verify_category_has_products
    
    # Get or create session
    session = assistant.get_or_create_session(session_id or "default")
    
    # Empty message (welcome)
    if not message or message.strip() == "":
        # Get actual categories that have products
        available_categories = await get_popular_categories(NODE_BACKEND_URL)
        
        # Create display options
        display_options = []
        for cat in available_categories[:5]:  # Limit to 5
            # Add icon based on category
            if "wood" in cat.lower():
                display_options.append(f"🪵 {cat}")
            elif "acrylic" in cat.lower():
                display_options.append(f"✨ {cat}")
            elif "metal" in cat.lower():
                display_options.append(f"⚙️ {cat}")
            elif "crystal" in cat.lower():
                display_options.append(f"💎 {cat}")
            elif "corporate" in cat.lower():
                display_options.append(f"🏢 {cat}")
            elif "award" in cat.lower():
                display_options.append(f"🏆 {cat}")
            else:
                display_options.append(f"📦 {cat}")
        
        welcome_msg = """👋 Welcome to Venus Enterprises! I'm your AI shopping assistant.

I can help you find the perfect products. Try asking:
• "Show me wooden awards"
• "Gifts under ₹500"
• "Corporate gifts"
• "Premium acrylic items"

What would you like to explore?"""
        
        return ChatResponse(
            message=welcome_msg,
            options=display_options + ["💰 Filter by Price", "🎯 Get Recommendations"],
            type="welcome",
            state=session.state.value
        )
    
    # Check if message is an option click (contains icon)
    if any(icon in message for icon in ["🪵", "✨", "⚙️", "💎", "🏢", "🏆", "📦"]):
        # Extract actual category from display option
        category = extract_category_from_display(message)
        if category:
            # Verify category has products
            has_products = await verify_category_has_products(NODE_BACKEND_URL, category)
            
            if has_products:
                # Fetch products for this category
                products = await fetch_products_with_filters(
                    NODE_BACKEND_URL,
                    category=category,
                    limit=6
                )
                
                if products:
                    return ChatResponse(
                        message=f"🎯 Here are some popular {category} items:",
                        products=products,
                        options=[
                            f"🪵 Wooden",
                            f"✨ Acrylic",
                            f"⚙️ Metal",
                            f"💎 Crystal",
                            "💰 Filter by Price",
                            "🏢 Corporate Gifts"
                        ],
                        type="products",
                        state="browsing"
                    )
                else:
                    return ChatResponse(
                        message=f"😕 I couldn't find any {category} items right now. Would you like to try another category?",
                        options=get_display_categories() + ["Browse All"],
                        type="category_selection"
                    )
    
    # Handle price-based queries
    if "under ₹" in message or "under" in message and "₹" in message:
        # Extract price
        import re
        price_match = re.search(r'under\s*₹?(\d+)', message.lower())
        if price_match:
            max_price = int(price_match.group(1))
            
            # Fetch products under this price
            products = await fetch_products_with_filters(
                NODE_BACKEND_URL,
                max_price=max_price,
                limit=8
            )
            
            if products:
                return ChatResponse(
                    message=f"💰 Great! Here are products under ₹{max_price}:",
                    products=products,
                    options=[
                        f"Under ₹{max_price//2}",
                        f"Under ₹{max_price*2}",
                        "Show premium",
                        "Browse categories"
                    ],
                    type="products"
                )
            else:
                return ChatResponse(
                    message=f"😕 I couldn't find products under ₹{max_price}. Would you like to try a higher budget?",
                    options=[
                        f"Under ₹{max_price*2}",
                        f"Under ₹5000",
                        "Browse all",
                        "Corporate gifts"
                    ],
                    type="price_suggestion"
                )
    
    # Rest of your existing intent processing...
    # (Keep the enhanced intent understanding from previous response)
    
    # If all else fails, show popular products
    popular_products = await fetch_products_with_filters(
        NODE_BACKEND_URL,
        limit=6,
        sort_by="popular"
    )
    
    return ChatResponse(
        message="🌟 Here are some popular products you might like:",
        products=popular_products,
        options=get_display_categories() + ["Filter by Price"],
        type="suggestions"
    )