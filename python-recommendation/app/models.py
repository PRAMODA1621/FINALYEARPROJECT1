from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class ProductRecommendationRequest(BaseModel):
    """Request for product-based recommendations"""
    product_id: int = Field(..., description="Source product ID")
    category: Optional[str] = Field(None, description="Product category")
    name: Optional[str] = Field(None, description="Product name")
    description: Optional[str] = Field(None, description="Product description")
    limit: int = Field(5, ge=1, le=20, description="Number of recommendations")

class PersonalizedRecommendationRequest(BaseModel):
    """Request for personalized recommendations"""
    user_id: int = Field(..., description="User ID")
    product_ids: List[int] = Field(default=[], description="User's product interaction history")
    limit: int = Field(10, ge=1, le=30, description="Number of recommendations")

class RecommendationItem(BaseModel):
    """Single recommendation item"""
    product_id: int = Field(..., description="Recommended product ID")
    score: float = Field(..., ge=0, le=1, description="Recommendation score")
    reason: Optional[str] = Field(None, description="Reason for recommendation")

class RecommendationResponse(BaseModel):
    """Recommendation response model"""
    product_id: Optional[int] = Field(None, description="Source product ID")
    user_id: Optional[int] = Field(None, description="User ID")
    recommendations: List[RecommendationItem] = Field(default=[], description="Recommended products")
    count: int = Field(0, description="Number of recommendations")
    method: str = Field("ml", description="Recommendation method used")
    timestamp: str = Field(..., description="Response timestamp")

class ProductFeatures(BaseModel):
    """Product features for similarity calculation"""
    id: int
    name: str
    category: str
    description: str
    price: float
    features: Optional[Dict[str, Any]] = None

class UserProfile(BaseModel):
    """User profile for personalization"""
    user_id: int
    viewed_products: List[int] = []
    purchased_products: List[int] = []
    wishlist_products: List[int] = []
    category_preferences: Dict[str, float] = {}