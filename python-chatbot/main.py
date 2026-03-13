from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import os
import mysql.connector
import requests
import json
from typing import List, Optional, Dict, Any
from datetime import datetime
import re

app = FastAPI(title="Venus Enterprises AI Service")

# -------------------
# CORS
# -------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------
# Database Connection
# -------------------
def get_db_connection():
    return mysql.connector.connect(
        host=os.environ.get("DB_HOST", "localhost"),
        user=os.environ.get("DB_USER", "root"),
        password=os.environ.get("DB_PASSWORD", ""),
        database=os.environ.get("DB_NAME", "venus_enterprises"),
        port=os.environ.get("DB_PORT", 3306)
    )

# -------------------
# Models
# -------------------
class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None

class Product(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    price: float
    category: str
    image_url: Optional[str] = None
    stock: int

class ChatResponse(BaseModel):
    message: str
    options: List[str] = []
    products: List[Dict[str, Any]] = []
    action: Optional[str] = None
    redirect: Optional[str] = None
    type: str = "menu"

# -------------------
# HuggingFace LLM Integration (Free)
# -------------------
class HuggingFaceLLM:
    def __init__(self):
        self.api_token = os.environ.get("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", "")
        self.model = "mistralai/Mistral-7B-Instruct-v0.1"  # Free model
        
    def analyze_query(self, query: str) -> Dict[str, Any]:
        """Use LLM to understand user intent and extract filters"""
        try:
            # If no token, use rule-based fallback
            if not self.api_token:
                return self._rule_based_analysis(query)
            
            # Prepare prompt for intent analysis
            prompt = f"""Analyze this e-commerce query and return JSON with:
            - intent: browse|search|price_check|add_to_cart|general
            - category: product category if mentioned
            - price_range: {{"min": min_price, "max": max_price}} if mentioned
            - keywords: list of important keywords
            - product_name: specific product if mentioned
            
            Query: "{query}"
            
            Return only valid JSON:"""
            
            headers = {"Authorization": f"Bearer {self.api_token}"}
            response = requests.post(
                f"https://api-inference.huggingface.co/models/{self.model}",
                headers=headers,
                json={"inputs": prompt, "parameters": {"max_length": 200}}
            )
            
            if response.status_code == 200:
                result = response.json()
                # Parse LLM response (simplified - you'd need better parsing)
                return self._parse_llm_response(result, query)
            else:
                return self._rule_based_analysis(query)
                
        except Exception as e:
            print(f"LLM Error: {e}")
            return self._rule_based_analysis(query)
    
    def _rule_based_analysis(self, query: str) -> Dict[str, Any]:
        """Fallback rule-based intent analysis"""
        query = query.lower()
        
        # Extract price range
        price_range = self._extract_price_range(query)
        
        # Detect intent
        intent = "general"
        if any(word in query for word in ["browse", "show", "display", "list", "products"]):
            intent = "browse"
        elif any(word in query for word in ["price", "cost", "₹", "rs", "rupee"]):
            intent = "price_check"
        elif any(word in query for word in ["add", "cart", "buy", "purchase"]):
            intent = "add_to_cart"
        elif any(word in query for word in ["search", "find", "looking for"]):
            intent = "search"
        
        # Extract category
        categories = ["wooden", "acrylic", "metal", "crystal", "corporate", "gift"]
        category = next((cat for cat in categories if cat in query), None)
        
        return {
            "intent": intent,
            "category": category,
            "price_range": price_range,
            "keywords": [word for word in query.split() if len(word) > 3],
            "product_name": None
        }
    
    def _extract_price_range(self, query: str) -> Dict[str, Optional[float]]:
        """Extract price range from query like 'under 500', 'between 1000 and 2000'"""
        price_range = {"min": None, "max": None}
        
        # Pattern: under/less than ₹500
        under_match = re.search(r'(?:under|less than|below)\s*(?:rs\.?|₹)?\s*(\d+)', query, re.IGNORECASE)
        if under_match:
            price_range["max"] = float(under_match.group(1))
        
        # Pattern: above/over ₹500
        above_match = re.search(r'(?:above|over|more than)\s*(?:rs\.?|₹)?\s*(\d+)', query, re.IGNORECASE)
        if above_match:
            price_range["min"] = float(above_match.group(1))
        
        # Pattern: between ₹500 and ₹1000
        between_match = re.search(r'(?:between)\s*(?:rs\.?|₹)?\s*(\d+)\s*(?:and|to)\s*(?:rs\.?|₹)?\s*(\d+)', query, re.IGNORECASE)
        if between_match:
            price_range["min"] = float(between_match.group(1))
            price_range["max"] = float(between_match.group(2))
        
        # Pattern: ₹500 (exact price)
        exact_match = re.search(r'(?:rs\.?|₹)\s*(\d+)', query)
        if exact_match and not (under_match or above_match or between_match):
            price_range["min"] = float(exact_match.group(1)) * 0.9  # +/- 10% range
            price_range["max"] = float(exact_match.group(1)) * 1.1
        
        return price_range

llm = HuggingFaceLLM()

# -------------------
# Database Functions
# -------------------
def search_products(filters: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Search products in MySQL database"""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    query = "SELECT * FROM products WHERE 1=1"
    params = []
    
    # Apply category filter
    if filters.get("category"):
        query += " AND LOWER(category) LIKE %s"
        params.append(f"%{filters['category'].lower()}%")
    
    # Apply price range filter
    if filters.get("price_range"):
        price_range = filters["price_range"]
        if price_range.get("min"):
            query += " AND price >= %s"
            params.append(price_range["min"])
        if price_range.get("max"):
            query += " AND price <= %s"
            params.append(price_range["max"])
    
    # Apply keyword search
    if filters.get("keywords"):
        keyword_conditions = []
        for keyword in filters["keywords"][:3]:  # Limit to 3 keywords
            keyword_conditions.append("(LOWER(name) LIKE %s OR LOWER(description) LIKE %s)")
            params.extend([f"%{keyword}%", f"%{keyword}%"])
        if keyword_conditions:
            query += " AND (" + " OR ".join(keyword_conditions) + ")"
    
    # Limit results
    query += " LIMIT 10"
    
    cursor.execute(query, params)
    products = cursor.fetchall()
    cursor.close()
    conn.close()
    
    return products

def get_product_by_id(product_id: int) -> Dict[str, Any]:
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM products WHERE id = %s", (product_id,))
    product = cursor.fetchone()
    cursor.close()
    conn.close()
    return product

# -------------------
# Chat Response Generation
# -------------------
def generate_chat_response(query: str, session_id: str = None) -> ChatResponse:
    """Generate intelligent response based on query"""
    
    # Analyze query with LLM
    analysis = llm.analyze_query(query)
    intent = analysis["intent"]
    
    # Handle empty query (start chat)
    if not query:
        return ChatResponse(
            message="👋 Hello! Welcome to Venus Enterprises. I'm your AI shopping assistant. How can I help you today?",
            options=["Browse Products", "Price Range", "Corporate Gifts", "Custom Orders"],
            type="menu"
        )
    
    # Search for products based on analysis
    products = search_products(analysis)
    
    # Generate response based on intent and results
    if products:
        product_list = [
            {
                "id": p["id"],
                "name": p["name"],
                "price": float(p["price"]),
                "category": p["category"],
                "image_url": p["image_url"] or "/images/placeholder.jpg",
                "description": p.get("description", "")
            }
            for p in products
        ]
        
        if len(products) == 1:
            return ChatResponse(
                message=f"✨ I found this {products[0]['category']} product that matches your request:",
                products=product_list,
                type="single_product"
            )
        else:
            return ChatResponse(
                message=f"🎯 I found {len(products)} products matching your criteria:",
                products=product_list,
                options=["Filter by Price", "View All", "New Search"],
                type="product_list"
            )
    else:
        # No products found - suggest alternatives
        return ChatResponse(
            message="😕 I couldn't find exact matches. Would you like to try different keywords or browse our categories?",
            options=["Browse All Products", "Wooden Items", "Acrylic Items", "Corporate Gifts"],
            type="no_results"
        )

# -------------------
# API Endpoints
# -------------------
@app.get("/")
async def root():
    return {"status": "Venus AI Service Running", "version": "2.0"}

@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        response = generate_chat_response(request.message, request.session_id)
        return response
    except Exception as e:
        print(f"Error in chat endpoint: {e}")
        return ChatResponse(
            message="I'm having trouble processing your request. Please try again.",
            options=["Browse Products", "Contact Support"],
            type="error"
        )

@app.get("/api/products/{product_id}")
async def get_product(product_id: int):
    product = get_product_by_id(product_id)
    if not product:
        raise HTTPException(status_code=404, message="Product not found")
    return product

# -------------------
# Health Check
# -------------------
@app.get("/health")
async def health_check():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT 1")
        cursor.close()
        conn.close()
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "database": "disconnected", "error": str(e)}

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port)