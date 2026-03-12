import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import MinMaxScaler
from typing import List, Dict, Any, Optional
import logging
import httpx
import os
import json
from datetime import datetime, timedelta
import asyncio

logger = logging.getLogger(__name__)

class RecommenderEngine:
    """Product recommendation engine using ML"""
    
    def __init__(self):
        self.is_ready = False
        self.products_df = None
        self.similarity_matrix = None
        self.tfidf_vectorizer = None
        self.feature_matrix = None
        self.backend_api = httpx.AsyncClient(
            base_url=os.getenv("BACKEND_API_URL", "/api"),
            timeout=float(os.getenv("BACKEND_API_TIMEOUT", 10))
        )
        self.similarity_threshold = float(os.getenv("SIMILARITY_THRESHOLD", 0.3))
        self.max_recommendations = int(os.getenv("MAX_RECOMMENDATIONS", 10))
        
        # Try to use Redis for caching (optional)
        self.use_redis = os.getenv("USE_REDIS", "False").lower() == "true"
        if self.use_redis:
            import redis
            self.redis_client = redis.Redis(
                host=os.getenv("REDIS_HOST", "localhost"),
                port=int(os.getenv("REDIS_PORT", 6379)),
                db=int(os.getenv("REDIS_DB", 0)),
                password=os.getenv("REDIS_PASSWORD", None),
                decode_responses=True
            )
        else:
            self.redis_client = None
            self.cache = {}
    
    async def initialize(self):
        """Initialize the recommender by loading product data"""
        try:
            logger.info("Initializing recommendation engine...")
            
            # Fetch all products from backend
            products = await self.fetch_all_products()
            
            if products:
                self.products_df = pd.DataFrame(products)
                await self.build_similarity_matrix()
                self.is_ready = True
                logger.info(f"Recommendation engine initialized with {len(products)} products")
            else:
                logger.warning("No products loaded - using fallback mode")
        
        except Exception as e:
            logger.error(f"Error initializing recommender: {str(e)}")
    
    async def fetch_all_products(self) -> List[Dict]:
        """Fetch all products from backend API"""
        try:
            all_products = []
            page = 1
            limit = 100
            
            while True:
                response = await self.backend_api.get(
                    "/products",
                    params={"page": page, "limit": limit, "is_active": True}
                )
                
                if response.status_code == 200:
                    data = response.json()
                    products = data.get("data", [])
                    
                    if not products:
                        break
                    
                    all_products.extend(products)
                    
                    # Check if we've fetched all pages
                    pagination = data.get("pagination", {})
                    if page >= pagination.get("pages", 1):
                        break
                    
                    page += 1
                else:
                    logger.error(f"Failed to fetch products: {response.status_code}")
                    break
            
            return all_products
        
        except Exception as e:
            logger.error(f"Error fetching products: {str(e)}")
            return []
    
    async def build_similarity_matrix(self):
        """Build product similarity matrix based on features"""
        if self.products_df is None or len(self.products_df) == 0:
            return
        
        try:
            # Prepare text features for TF-IDF
            text_features = []
            
            for _, product in self.products_df.iterrows():
                # Combine relevant text fields
                features = f"{product.get('name', '')} {product.get('description', '')} {product.get('category', '')}"
                
                # Add any additional features
                if product.get('features'):
                    features += f" {json.dumps(product['features'])}"
                
                text_features.append(features.lower())
            
            # Create TF-IDF vectors
            self.tfidf_vectorizer = TfidfVectorizer(
                max_features=500,
                stop_words='english',
                ngram_range=(1, 2)
            )
            
            text_vectors = self.tfidf_vectorizer.fit_transform(text_features)
            
            # Add numerical features (price, etc.)
            numerical_features = []
            for _, product in self.products_df.iterrows():
                price = float(product.get('price', 0))
                # Normalize price
                numerical_features.append([price / 1000])  # Simple normalization
            
            numerical_vectors = np.array(numerical_features)
            
            # Combine features
            from scipy.sparse import hstack
            self.feature_matrix = hstack([text_vectors, numerical_vectors])
            
            # Compute similarity matrix
            self.similarity_matrix = cosine_similarity(self.feature_matrix)
            
            logger.info(f"Built similarity matrix of shape {self.similarity_matrix.shape}")
        
        except Exception as e:
            logger.error(f"Error building similarity matrix: {str(e)}")
            raise
    
    async def get_similar_products(
        self,
        product_id: int,
        limit: int = 5,
        category: Optional[str] = None
    ) -> List[Dict]:
        """Get similar products based on content similarity"""
        
        # Check cache first
        cache_key = f"similar:{product_id}:{limit}"
        cached = await self.get_cached(cache_key)
        if cached:
            return cached
        
        if not self.is_ready or self.similarity_matrix is None:
            return await self.get_fallback_similar(product_id, category, limit)
        
        try:
            # Find product index
            product_indices = self.products_df.index[
                self.products_df['id'] == product_id
            ].tolist()
            
            if not product_indices:
                return await self.get_fallback_similar(product_id, category, limit)
            
            idx = product_indices[0]
            
            # Get similarity scores
            sim_scores = list(enumerate(self.similarity_matrix[idx]))
            
            # Sort by similarity
            sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
            
            # Get top similar products (excluding itself)
            sim_scores = sim_scores[1:limit+1]
            
            # Filter by threshold
            sim_scores = [(i, score) for i, score in sim_scores 
                         if score >= self.similarity_threshold]
            
            # Prepare recommendations
            recommendations = []
            for i, score in sim_scores:
                product = self.products_df.iloc[i].to_dict()
                recommendations.append({
                    "product_id": product['id'],
                    "score": float(score),
                    "reason": self.get_similarity_reason(score)
                })
            
            # Cache the result
            await self.cache_result(cache_key, recommendations)
            
            return recommendations
        
        except Exception as e:
            logger.error(f"Error getting similar products: {str(e)}")
            return await self.get_fallback_similar(product_id, category, limit)
    
    async def get_personalized_recommendations(
        self,
        user_id: int,
        product_ids: List[int],
        limit: int = 10
    ) -> List[Dict]:
        """Get personalized recommendations based on user history"""
        
        cache_key = f"personalized:{user_id}:{limit}"
        cached = await self.get_cached(cache_key)
        if cached:
            return cached
        
        if not self.is_ready or not product_ids:
            return await self.get_popular_products(limit)
        
        try:
            # Get indices of user's products
            user_indices = []
            for pid in product_ids:
                indices = self.products_df.index[
                    self.products_df['id'] == pid
                ].tolist()
                user_indices.extend(indices)
            
            if not user_indices:
                return await self.get_popular_products(limit)
            
            # Calculate average user preference vector
            user_vector = np.mean([self.feature_matrix[i].toarray().flatten() 
                                  for i in user_indices], axis=0)
            
            # Calculate similarity with all products
            all_scores = []
            for i in range(len(self.products_df)):
                if i not in user_indices:  # Exclude already interacted products
                    product_vector = self.feature_matrix[i].toarray().flatten()
                    similarity = cosine_similarity(
                        user_vector.reshape(1, -1),
                        product_vector.reshape(1, -1)
                    )[0][0]
                    all_scores.append((i, similarity))
            
            # Sort by similarity
            all_scores = sorted(all_scores, key=lambda x: x[1], reverse=True)
            
            # Get top recommendations
            recommendations = []
            for i, score in all_scores[:limit]:
                if score >= self.similarity_threshold:
                    product = self.products_df.iloc[i].to_dict()
                    recommendations.append({
                        "product_id": product['id'],
                        "score": float(score),
                        "reason": "Based on your interests"
                    })
            
            # Cache the result
            await self.cache_result(cache_key, recommendations)
            
            return recommendations
        
        except Exception as e:
            logger.error(f"Error getting personalized recommendations: {str(e)}")
            return await self.get_popular_products(limit)
    
    def get_similarity_reason(self, score: float) -> str:
        """Generate reason for recommendation based on similarity score"""
        if score >= 0.8:
            return "Highly similar to products you viewed"
        elif score >= 0.6:
            return "Similar to your interests"
        elif score >= 0.4:
            return "Related to products you might like"
        else:
            return "You might also like"
    
    async def get_fallback_similar(
        self,
        product_id: int,
        category: Optional[str],
        limit: int
    ) -> List[Dict]:
        """Fallback: Get products from same category"""
        try:
            response = await self.backend_api.get(
                "/products",
                params={"category": category, "limit": limit}
            )
            
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
                    if p["id"] != product_id
                ]
        
        except Exception as e:
            logger.error(f"Fallback similar error: {str(e)}")
        
        return []
    
    async def get_popular_products(self, limit: int) -> List[Dict]:
        """Get popular products as fallback"""
        try:
            response = await self.backend_api.get(
                "/products/featured",
                params={"limit": limit}
            )
            
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
            logger.error(f"Popular products error: {str(e)}")
        
        return []
    
    async def get_cached(self, key: str) -> Optional[List[Dict]]:
        """Get cached recommendations"""
        try:
            if self.use_redis and self.redis_client:
                data = self.redis_client.get(key)
                if data:
                    return json.loads(data)
            else:
                if key in self.cache:
                    data, timestamp = self.cache[key]
                    if datetime.now() - timestamp < timedelta(seconds=3600):
                        return data
        except Exception as e:
            logger.error(f"Cache read error: {str(e)}")
        
        return None
    
    async def cache_result(self, key: str, data: List[Dict]):
        """Cache recommendations"""
        try:
            if self.use_redis and self.redis_client:
                self.redis_client.setex(
                    key,
                    int(os.getenv("CACHE_TTL", 3600)),
                    json.dumps(data)
                )
            else:
                self.cache[key] = (data, datetime.now())
        except Exception as e:
            logger.error(f"Cache write error: {str(e)}")
    
    async def close(self):
        """Close HTTP client"""
        await self.backend_api.aclose()