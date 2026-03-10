from fastapi import APIRouter, HTTPException, Request, Depends
from typing import Optional
from pydantic import BaseModel, Field
from .models import ChatRequest, ChatResponse, ProductQuery
from .ollama_client import OllamaClient
import logging
import httpx
import os
import json
from datetime import datetime

router = APIRouter()
logger = logging.getLogger(__name__)

# Backend API client
backend_api = httpx.AsyncClient(
    base_url=os.getenv("BACKEND_API_URL", "http://localhost:5000/api"),
    timeout=float(os.getenv("BACKEND_API_TIMEOUT", 10))
)

def get_ollama_client(request: Request):
    return request.app.state.ollama_client

@router.post("/chat", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    ollama_client: OllamaClient = Depends(get_ollama_client)
):
    """
    Process chat message and return response
    """
    try:
        logger.info(f"Processing chat request: {request.message[:50]}...")
        
        # Try to get response from Ollama
        if ollama_client.is_connected:
            response = await ollama_client.generate_response(
                message=request.message,
                context=request.context,
                user_id=request.user_id
            )
        else:
            # Fallback to rule-based responses
            response = await generate_fallback_response(request.message)
        
        return ChatResponse(
            message=response,
            timestamp=datetime.now().isoformat(),
            session_id=request.session_id
        )
    
    except Exception as e:
        logger.error(f"Error processing chat: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/query/products")
async def query_products(query: ProductQuery):
    """
    Handle product-related queries
    """
    try:
        # Fetch product information from backend
        async with backend_api as client:
            if query.product_id:
                response = await client.get(f"/products/{query.product_id}")
            else:
                response = await client.get("/products", params={
                    "search": query.search_term,
                    "category": query.category,
                    "limit": 5
                })
            
            if response.status_code == 200:
                data = response.json()
                return {
                    "success": True,
                    "data": data.get("data", data)
                }
            else:
                return {
                    "success": False,
                    "message": "Could not fetch product information"
                }
    
    except Exception as e:
        logger.error(f"Error querying products: {str(e)}")
        return {
            "success": False,
            "message": "Error fetching product data"
        }

@router.get("/context/{session_id}")
async def get_session_context(session_id: str):
    """
    Get conversation context for a session
    """
    # In production, store this in Redis
    # For now, return empty context
    return {
        "session_id": session_id,
        "history": [],
        "preferences": {}
    }

@router.delete("/context/{session_id}")
async def clear_session_context(session_id: str):
    """
    Clear conversation context for a session
    """
    return {
        "success": True,
        "message": f"Context cleared for session {session_id}"
    }

async def generate_fallback_response(message: str) -> str:
    """
    Generate fallback responses when Ollama is not available
    """
    message_lower = message.lower()
    
    # Simple rule-based responses
    if "hello" in message_lower or "hi" in message_lower:
        return "Hello! How can I help you with your shopping today?"
    
    elif "product" in message_lower or "buy" in message_lower:
        return "We have a wide range of products including electronics, clothing, home goods, and more. You can browse our catalog or let me know what you're looking for specifically."
    
    elif "price" in message_lower:
        return "Product prices vary. You can check individual product pages for current pricing and any ongoing discounts."
    
    elif "shipping" in message_lower:
        return "We offer standard shipping (3-5 business days) and express shipping (1-2 business days). Shipping costs are calculated at checkout based on your location."
    
    elif "return" in message_lower:
        return "We have a 30-day return policy for unused items in original packaging. Visit our Returns section for detailed instructions."
    
    elif "order" in message_lower:
        return "You can track your order in the 'My Orders' section of your dashboard. If you need help with a specific order, please provide your order number."
    
    elif "payment" in message_lower:
        return "We accept UPI payments and Cash on Delivery. All payments are secure and encrypted."
    
    elif "account" in message_lower:
        return "You can create an account or log in using the Login button. With an account, you can track orders, save wishlist items, and more."
    
    elif "help" in message_lower or "support" in message_lower:
        return "I'm here to help! You can ask me about products, orders, returns, or any other questions. For complex issues, you can also create a support ticket from the Helpdesk page."
    
    elif "thank" in message_lower:
        return "You're welcome! Is there anything else I can help you with?"
    
    else:
        return "I'm not sure I understand. Could you please rephrase your question? You can ask me about products, orders, shipping, returns, or any other aspect of your shopping experience."

# Cleanup on shutdown
@router.on_event("shutdown")
async def shutdown():
    await backend_api.aclose()