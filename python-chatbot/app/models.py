from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class ChatRequest(BaseModel):
    """Chat request model"""
    message: str = Field(..., description="User message")
    session_id: Optional[str] = Field(None, description="Session identifier")
    user_id: Optional[int] = Field(None, description="User ID if authenticated")
    context: Optional[Dict[str, Any]] = Field(default={}, description="Additional context")

class ChatResponse(BaseModel):
    """Chat response model"""
    message: str = Field(..., description="Bot response")
    timestamp: str = Field(..., description="Response timestamp")
    session_id: Optional[str] = Field(None, description="Session identifier")
    suggestions: Optional[List[str]] = Field(default=[], description="Suggested questions")
    actions: Optional[List[Dict[str, Any]]] = Field(default=[], description="Action buttons")

class ProductQuery(BaseModel):
    """Product query model"""
    product_id: Optional[int] = Field(None, description="Product ID")
    search_term: Optional[str] = Field(None, description="Search term")
    category: Optional[str] = Field(None, description="Product category")
    limit: int = Field(5, description="Number of results")

class OrderQuery(BaseModel):
    """Order query model"""
    order_number: Optional[str] = Field(None, description="Order number")
    user_id: int = Field(..., description="User ID")

class FAQItem(BaseModel):
    """FAQ item model"""
    question: str
    answer: str
    category: Optional[str] = None

class IntentResponse(BaseModel):
    """Intent classification response"""
    intent: str
    confidence: float
    entities: Dict[str, Any]
    response: str