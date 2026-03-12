"""
FSM Sales Chatbot for Venus Enterprises
Updated with Language Selection System (English & Kannada)
"""

import json
import requests
from enum import Enum

class BotState(Enum):
    LANGUAGE_SELECT = 0  # NEW: Language selection first
    GREETING = 1
    CATEGORY_SELECT = 2
    PRICE_SELECT = 3
    SHOW_PRODUCTS = 4
    PRODUCT_ACTION = 5

class SalesBot:
    def __init__(self):
        self.state = BotState.LANGUAGE_SELECT  # Start with language selection
        self.selected_category = None
        self.selected_price_range = None
        self.current_products = []
        self.selected_product = None
        self.session_id = None
        self.language = 'en'  # Default language
        
        # Price range mappings
        self.price_ranges = {
            "Below ₹1000": (0, 1000),
            "₹1000 – ₹2000": (1000, 2000),
            "₹2000 – ₹3000": (2000, 3000),
            "Above ₹3000": (3000, 999999)
        }
        
        # Category options
        self.categories = ["Wooden", "Acrylic", "Metal", "Gifts", "Mementos", "Marble"]
        
        # Backend API URL
        self.api_url = "/api"
        
        # Language options
        self.languages = ["English", "ಕನ್ನಡ (Kannada)"]
        
        # Translation dictionaries
        self.translations = {
            'en': {
                'welcome': "Welcome to Venus Enterprises. Please choose your language:",
                'greeting': "Welcome to Venus Enterprises.\nPlease choose a category:",
                'category_prompt': "Please choose a category:",
                'price_prompt': "What price range are you looking for?",
                'product_found': "I found {count} products matching your criteria:",
                'no_products': "Sorry, no products found in {category} within {price_range}. Would you like to try a different price range?",
                'select_product': "Please select a product by number (1, 2, 3...) or type 'back' to start over.",
                'you_selected': "You selected: {name}",
                'view_product': "View Product",
                'add_to_cart': "Add to Cart",
                'back_to_products': "Back to Products",
                'back': "back",
                'start_over': "start over",
                'restart': "restart",
                'invalid_category': "Please select a valid category from the options.",
                'invalid_price': "Please select a valid price range.",
                'viewing': "Viewing {name}",
                'added_to_cart': "Added {name} to cart!",
                'here_are_products': "Here are the products again:",
                'please_select_option': "Please select an option:",
                'great_you_selected': "Great! You selected {category}.",
                'language_selected': "You selected {language}. How can I help you today?"
            },
            'kn': {
                'welcome': "ವೀನಸ್ ಎಂಟರ್ಪ್ರೈಸಸ್‌ಗೆ ಸ್ವಾಗತ. ದಯವಿಟ್ಟು ನಿಮ್ಮ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ:",
                'greeting': "ವೀನಸ್ ಎಂಟರ್ಪ್ರೈಸಸ್‌ಗೆ ಸ್ವಾಗತ.\nದಯವಿಟ್ಟು ಒಂದು ವರ್ಗವನ್ನು ಆಯ್ಕೆ ಮಾಡಿ:",
                'category_prompt': "ದಯವಿಟ್ಟು ಒಂದು ವರ್ಗವನ್ನು ಆಯ್ಕೆ ಮಾಡಿ:",
                'price_prompt': "ನೀವು ಯಾವ ಬೆಲೆ ಶ್ರೇಣಿಯನ್ನು ಹುಡುಕುತ್ತಿದ್ದೀರಿ?",
                'product_found': "ನಿಮ್ಮ ಮಾನದಂಡಗಳಿಗೆ ಹೊಂದಿಕೆಯಾಗುವ {count} ಉತ್ಪನ್ನಗಳು ಕಂಡುಬಂದಿವೆ:",
                'no_products': "ಕ್ಷಮಿಸಿ, {category} ನಲ್ಲಿ {price_range} ಒಳಗೆ ಯಾವುದೇ ಉತ್ಪನ್ನಗಳು ಕಂಡುಬಂದಿಲ್ಲ. ನೀವು ಬೇರೆ ಬೆಲೆ ಶ್ರೇಣಿಯನ್ನು ಪ್ರಯತ್ನಿಸಲು ಬಯಸುವಿರಾ?",
                'select_product': "ದಯವಿಟ್ಟು ಸಂಖ್ಯೆಯ ಮೂಲಕ ಉತ್ಪನ್ನವನ್ನು ಆಯ್ಕೆಮಾಡಿ (1, 2, 3...) ಅಥವಾ ಮತ್ತೆ ಪ್ರಾರಂಭಿಸಲು 'back' ಎಂದು ಟೈಪ್ ಮಾಡಿ.",
                'you_selected': "ನೀವು ಆಯ್ಕೆ ಮಾಡಿದ್ದು: {name}",
                'view_product': "ಉತ್ಪನ್ನ ವೀಕ್ಷಿಸಿ",
                'add_to_cart': "ಕಾರ್ಟ್‌ಗೆ ಸೇರಿಸಿ",
                'back_to_products': "ಉತ್ಪನ್ನಗಳಿಗೆ ಹಿಂತಿರುಗಿ",
                'back': "ಹಿಂತಿರುಗಿ",
                'start_over': "ಮತ್ತೆ ಪ್ರಾರಂಭಿಸಿ",
                'restart': "ಪುನರಾರಂಭಿಸಿ",
                'invalid_category': "ದಯವಿಟ್ಟು ಆಯ್ಕೆಗಳಿಂದ ಮಾನ್ಯ ವರ್ಗವನ್ನು ಆಯ್ಕೆಮಾಡಿ.",
                'invalid_price': "ದಯವಿಟ್ಟು ಮಾನ್ಯ ಬೆಲೆ ಶ್ರೇಣಿಯನ್ನು ಆಯ್ಕೆಮಾಡಿ.",
                'viewing': "{name} ವೀಕ್ಷಿಸಲಾಗುತ್ತಿದೆ",
                'added_to_cart': "{name} ಕಾರ್ಟ್‌ಗೆ ಸೇರಿಸಲಾಗಿದೆ!",
                'here_are_products': "ಉತ್ಪನ್ನಗಳು ಮತ್ತೆ ಇಲ್ಲಿವೆ:",
                'please_select_option': "ದಯವಿಟ್ಟು ಆಯ್ಕೆಯನ್ನು ಆರಿಸಿ:",
                'great_you_selected': "ಅದ್ಭುತ! ನೀವು {category} ಆಯ್ಕೆ ಮಾಡಿದ್ದೀರಿ.",
                'language_selected': "ನೀವು {language} ಆಯ್ಕೆ ಮಾಡಿದ್ದೀರಿ. ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?"
            }
        }
    
    def _t(self, key, **kwargs):
        """Get translated text"""
        text = self.translations[self.language].get(key, self.translations['en'].get(key, key))
        if kwargs:
            return text.format(**kwargs)
        return text
    
    def get_response(self, user_input=None):
        """Process user input and return bot response based on current state"""
        
        if self.state == BotState.LANGUAGE_SELECT:
            return self._handle_language_select(user_input)
        
        elif self.state == BotState.GREETING:
            return self._handle_greeting()
        
        elif self.state == BotState.CATEGORY_SELECT:
            return self._handle_category_select(user_input)
        
        elif self.state == BotState.PRICE_SELECT:
            return self._handle_price_select(user_input)
        
        elif self.state == BotState.SHOW_PRODUCTS:
            return self._handle_show_products(user_input)
        
        elif self.state == BotState.PRODUCT_ACTION:
            return self._handle_product_action(user_input)
        
        return {
            "message": self._t('invalid_category'),
            "options": [],
            "state": self.state.value
        }
    
    def _handle_language_select(self, language=None):
        """State 0: Language selection"""
        if not language:
            # First time asking for language
            return {
                "message": self._t('welcome'),
                "options": self.languages,
                "state": self.state.value,
                "type": "language_selection"
            }
        
        # Process language selection
        if language not in self.languages:
            return {
                "message": self._t('invalid_category'),
                "options": self.languages,
                "state": self.state.value,
                "type": "language_selection"
            }
        
        # Set language
        if language == "English":
            self.language = 'en'
        elif language == "ಕನ್ನಡ (Kannada)":
            self.language = 'kn'
        
        # Move to greeting
        self.state = BotState.GREETING
        return self._handle_greeting()
    
    def _handle_greeting(self):
        """State 1: Greeting and category selection"""
        self.state = BotState.CATEGORY_SELECT
        
        return {
            "message": self._t('greeting'),
            "options": self.categories,
            "state": self.state.value,
            "type": "category_selection"
        }
    
    def _handle_category_select(self, category):
        """State 2: Category selected, ask for price range"""
        if category not in self.categories:
            return {
                "message": self._t('invalid_category'),
                "options": self.categories,
                "state": self.state.value,
                "type": "category_selection"
            }
        
        self.selected_category = category
        self.state = BotState.PRICE_SELECT
        
        return {
            "message": self._t('great_you_selected', category=category) + "\n" + self._t('price_prompt'),
            "options": list(self.price_ranges.keys()),
            "state": self.state.value,
            "type": "price_selection"
        }
    
    def _handle_price_select(self, price_range):
        """State 3: Price range selected, fetch products"""
        if price_range not in self.price_ranges:
            return {
                "message": self._t('invalid_price'),
                "options": list(self.price_ranges.keys()),
                "state": self.state.value,
                "type": "price_selection"
            }
        
        self.selected_price_range = price_range
        min_price, max_price = self.price_ranges[price_range]
        
        # Fetch products from backend
        products = self._fetch_products(self.selected_category, min_price, max_price)
        self.current_products = products
        
        self.state = BotState.SHOW_PRODUCTS
        
        if not products:
            return {
                "message": self._t('no_products', category=self.selected_category, price_range=price_range),
                "options": list(self.price_ranges.keys()),
                "state": BotState.PRICE_SELECT.value,
                "type": "price_selection"
            }
        
        return {
            "message": self._t('product_found', count=len(products)),
            "products": products,
            "state": self.state.value,
            "type": "product_list"
        }
    
    def _handle_show_products(self, user_input):
        """State 4: Showing products, handle product selection"""
        # Check if input is a number (product index)
        try:
            product_index = int(user_input) - 1
            if 0 <= product_index < len(self.current_products):
                self.selected_product = self.current_products[product_index]
                self.state = BotState.PRODUCT_ACTION
                
                return {
                    "message": self._t('you_selected', name=self.selected_product['name']),
                    "product": self.selected_product,
                    "options": [self._t('view_product'), self._t('add_to_cart'), self._t('back_to_products')],
                    "state": self.state.value,
                    "type": "product_action"
                }
        except ValueError:
            pass
        
        # Handle special commands
        if user_input and user_input.lower() in [self._t('back').lower(), self._t('start_over').lower(), self._t('restart').lower()]:
            self.reset()
            return self._handle_greeting()
        
        # Show products with numbers
        product_list = []
        for i, product in enumerate(self.current_products, 1):
            product_list.append(f"{i}. {product['name']} - ₹{product['price']}")
        
        return {
            "message": self._t('select_product'),
            "products": self.current_products,
            "product_list": product_list,
            "state": self.state.value,
            "type": "product_list"
        }
    
    def _handle_product_action(self, user_input):
        """State 5: Product action selected"""
        if user_input == self._t('view_product'):
            return {
                "message": self._t('viewing', name=self.selected_product['name']),
                "action": "view_product",
                "product": self.selected_product,
                "redirect": f"/product/{self.selected_product['name']}",
                "state": self.state.value,
                "type": "redirect"
            }
        
        elif user_input == self._t('add_to_cart'):
            return {
                "message": self._t('added_to_cart', name=self.selected_product['name']),
                "action": "add_to_cart",
                "product": self.selected_product,
                "state": self.state.value,
                "type": "cart_action"
            }
        
        elif user_input == self._t('back_to_products'):
            self.state = BotState.SHOW_PRODUCTS
            return {
                "message": self._t('here_are_products'),
                "products": self.current_products,
                "state": self.state.value,
                "type": "product_list"
            }
        
        return {
            "message": self._t('please_select_option'),
            "options": [self._t('view_product'), self._t('add_to_cart'), self._t('back_to_products')],
            "state": self.state.value,
            "type": "product_action"
        }
    
    def _fetch_products(self, category, min_price, max_price):
        """Fetch products from backend API"""
        try:
            import requests
            url = f"{self.api_url}/products"
            params = {
                "category": category,
                "minPrice": min_price,
                "maxPrice": max_price
            }
            response = requests.get(url, params=params, timeout=5)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and data.get("data"):
                    return data["data"]
            return []
        except Exception as e:
            print(f"Error fetching products: {e}")
            # Return sample data for testing if backend is not available
            return self._get_sample_products(category, min_price, max_price)
    
    def _get_sample_products(self, category, min_price, max_price):
        """Return sample products for testing when backend is unavailable"""
        sample_products = {
            "Wooden": [
                {"id": 1, "name": "Engraved Wooden Name Plate", "price": 1299, "category": "Wooden", "image_url": "/images/wooden/wooden-name-plate.jpg"},
                {"id": 2, "name": "Wooden Photo Frame Plaque", "price": 1499, "category": "Wooden", "image_url": "/images/wooden/photo-frame.jpg"},
                {"id": 3, "name": "Wooden Business Card Holder", "price": 899, "category": "Wooden", "image_url": "/images/wooden/card-holder.jpg"},
                {"id": 4, "name": "Wooden Pen Stand", "price": 699, "category": "Wooden", "image_url": "/images/wooden/pen-stand.jpg"},
            ],
            "Acrylic": [
                {"id": 5, "name": "Acrylic LED Name Plate", "price": 1899, "category": "Acrylic", "image_url": "/images/acrylic/led-nameplate.jpg"},
                {"id": 6, "name": "Acrylic Trophy Award", "price": 1799, "category": "Acrylic", "image_url": "/images/acrylic/trophy.jpg"},
                {"id": 7, "name": "Acrylic Paper Weight", "price": 599, "category": "Acrylic", "image_url": "/images/acrylic/paper-weight.jpg"},
            ],
            "Metal": [
                {"id": 8, "name": "Metal Engraved Pen", "price": 799, "category": "Metal", "image_url": "/images/metal/engraved-pen.jpg"},
                {"id": 9, "name": "Metal Keychain", "price": 399, "category": "Metal", "image_url": "/images/metal/keychain.jpg"},
                {"id": 10, "name": "Corporate Desk Clock", "price": 1899, "category": "Metal", "image_url": "/images/metal/desk-clock.jpg"},
            ],
            "Gifts": [
                {"id": 11, "name": "Corporate Gift Combo", "price": 2999, "category": "Gifts", "image_url": "/images/gifts/gift-combo.jpg"},
                {"id": 12, "name": "Customized Coffee Mug", "price": 349, "category": "Gifts", "image_url": "/images/gifts/coffee-mug.jpg"},
            ],
            "Mementos": [
                {"id": 13, "name": "Memento of Gratitude", "price": 1499, "category": "Mementos", "image_url": "/images/mementos/gratitude.jpg"},
                {"id": 14, "name": "Memento of Service", "price": 1899, "category": "Mementos", "image_url": "/images/mementos/service.jpg"},
            ],
            "Marble": [
                {"id": 15, "name": "Marble Paperweight", "price": 1299, "category": "Marble", "image_url": "/images/marble/paperweight.jpg"},
                {"id": 16, "name": "Marble Plaque", "price": 3299, "category": "Marble", "image_url": "/images/marble/plaque.jpg"},
            ]
        }
        
        products = sample_products.get(category, [])
        return [p for p in products if min_price <= p["price"] <= max_price]
    
    def reset(self):
        """Reset bot to initial state"""
        self.state = BotState.LANGUAGE_SELECT  # Reset to language selection
        self.selected_category = None
        self.selected_price_range = None
        self.current_products = []
        self.selected_product = None
        # Don't reset language - keep user's choice
    
    def get_state(self):
        """Get current bot state"""
        return {
            "state": self.state.value,
            "state_name": self.state.name,
            "selected_category": self.selected_category,
            "selected_price_range": self.selected_price_range,
            "has_products": len(self.current_products) > 0,
            "language": self.language
        }