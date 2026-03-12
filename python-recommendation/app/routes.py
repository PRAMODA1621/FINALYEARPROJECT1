from fastapi import APIRouter, HTTPException, Request, Depends, Query
from typing import List, Optional
from pydantic import BaseModel, Field
from .models import (
    ProductRecommendationRequest,
    PersonalizedRecommendationRequest,
    RecommendationResponse
)
from .recommender import RecommenderEngine
import logging
import httpx
import os
from datetime import datetime

router = APIRouter()
logger = logging.getLogger(__name__)

# Backend API client
backend_api = httpx.AsyncClient(
    base_url=os.getenv("BACKEND_API_URL", "/api"),
    timeout=float(os.getenv("BACKEND_API_TIMEOUT", 10))
)

def get_recommender(request: Request):
    return request.app.state.recommender

@router.post("/recommend", response_model=RecommendationResponse)
async def get_recommendations(
    request: ProductRecommendationRequest,
    recommender: RecommenderEngine = Depends(get_recommender)
):
    """
    Get product recommendations based on a product
    """
    try:
        logger.info(f"Getting recommendations for product {request.product_id}")
        
        if not recommender.is_ready:
            # Fallback to simple recommendations
            recommendations = await get_fallback_recommendations(request)
        else:
            recommendations = await recommender.get_similar_products(
                product_id=request.product_id,
                limit=request.limit,
                category=request.category
            )
        
        return RecommendationResponse(
            product_id=request.product_id,
            recommendations=recommendations,
            count=len(recommendations),
            method="ml" if recommender.is_ready else "fallback",
            timestamp=datetime.now().isoformat()
        )
    
    except Exception as e:
        logger.error(f"Error getting recommendations: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/personalized", response_model=RecommendationResponse)
async def get_personalized_recommendations(
    request: PersonalizedRecommendationRequest,
    recommender: RecommenderEngine = Depends(get_recommender)
):
    """
    Get personalized recommendations for a user
    """
    try:
        logger.info(f"Getting personalized recommendations for user {request.user_id}")
        
        if not recommender.is_ready:
            # Fallback to popular products
            recommendations = await get_popular_products(request.limit)
        else:
            recommendations = await recommender.get_personalized_recommendations(
                user_id=request.user_id,
                product_ids=request.product_ids,
                limit=request.limit
            )
        
        return RecommendationResponse(
            user_id=request.user_id,
            recommendations=recommendations,
            count=len(recommendations),
            method="ml" if recommender.is_ready else "fallback",
            timestamp=datetime.now().isoformat()
        )
    
    except Exception as e:
        logger.error(f"Error getting personalized recommendations: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/trending")
async def get_trending_products(
    limit: int = Query(10, ge=1, le=50),
    category: Optional[str] = None
):
    """
    Get trending products
    """
    try:
        # In production, this would use real analytics data
        # For now, return random popular products
        async with backend_api as client:
            params = {"limit": limit}
            if category:
                params["category"] = category
            
            response = await client.get("/products/featured", params=params)
            
            if response.status_code == 200:
                data = response.json()
                products = data.get("data", [])
                
                recommendations = [
                    {
                        "product_id": p["id"],
                        "score": 1.0 - (i * 0.1),  # Decreasing score
                        "reason": "Trending now"
                    }
                    for i, p in enumerate(products)
                ]
                
                return {
                    "success": True,
                    "recommendations": recommendations,
                    "count": len(recommendations)
                }
    
    except Exception as e:
        logger.error(f"Error getting trending products: {str(e)}")
    
    return {
        "success": False,
        "recommendations": [],
        "count": 0
    }

async def get_fallback_recommendations(request: ProductRecommendationRequest) -> List[dict]:
    """Fallback: Get products from same category"""
    try:
        async with backend_api as client:
            response = await client.get("/products", params={
                "category": request.category,
                "limit": request.limit
            })
            
            if response.status_code == 200:
                data = response.json()
                products = data.get("data", [])
                
                return [
                    {
                        "product_id": p["id"],
                        "score": 0.5,
                        "reason": "Similar category"
                    }
                    for p in products
                    if p["id"] != request.product_id
                ]
    
    except Exception as e:
        logger.error(f"Fallback recommendation error: {str(e)}")
    
    return []

async def get_popular_products(limit: int) -> List[dict]:
    """Get popular products"""
    try:
        async with backend_api as client:
            response = await client.get("/products/featured", params={"limit": limit})
            
            if response.status_code == 200:
                data = response.json()
                products = data.get("data", [])
                
                return [
                    {
                        "product_id": p["id"],
                        "score": 1.0,
                        "reason": "Popular choice"
                    }
                    for p in products
                ]
    
    except Exception as e:
        logger.error(f"Error getting popular products: {str(e)}")
    
    return []

# Cleanup on shutdown
@router.on_event("shutdown")
async def shutdown():
    await backend_api.aclose()