# fetch_products.py
import aiohttp
import asyncio
from typing import List, Dict, Optional
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def fetch_products_with_filters(
    node_backend_url: str,
    category: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    search: Optional[str] = None,
    limit: int = 10,
    sort_by: str = "featured",
    retry_count: int = 2
) -> List[Dict]:
    """Fetch products with robust error handling and fallbacks"""
    
    from category_mapper import map_to_category
    
    # Map category if provided
    mapped_category = map_to_category(category) if category else None
    
    # Try different strategies to get products
    strategies = []
    
    # Strategy 1: Try with mapped category and filters
    strategies.append({
        "name": "filtered",
        "params": {
            "category": mapped_category,
            "minPrice": min_price,
            "maxPrice": max_price,
            "search": search,
            "limit": limit,
            "sort": sort_by
        }
    })
    
    # Strategy 2: Try with original category
    if category and category != mapped_category:
        strategies.append({
            "name": "original_category",
            "params": {
                "category": category,
                "minPrice": min_price,
                "maxPrice": max_price,
                "limit": limit,
                "sort": sort_by
            }
        })
    
    # Strategy 3: Try with search only
    if search:
        strategies.append({
            "name": "search_only",
            "params": {
                "search": search,
                "limit": limit,
                "sort": sort_by
            }
        })
    
    # Strategy 4: Try category only
    if mapped_category:
        strategies.append({
            "name": "category_only",
            "params": {
                "category": mapped_category,
                "limit": limit,
                "sort": sort_by
            }
        })
    
    # Strategy 5: Get popular products as fallback
    strategies.append({
        "name": "popular",
        "params": {
            "limit": limit,
            "sort": "popular"
        }
    })
    
    # Try each strategy until we get products
    for strategy in strategies:
        try:
            products = await _fetch_with_params(node_backend_url, strategy["params"])
            if products:
                logger.info(f"✅ Strategy '{strategy['name']}' found {len(products)} products")
                
                # Enhance products with metadata
                products = await enhance_products(products)
                
                return products
            else:
                logger.info(f"⚠️ Strategy '{strategy['name']}' found 0 products")
        except Exception as e:
            logger.error(f"❌ Strategy '{strategy['name']}' failed: {e}")
            continue
    
    # Ultimate fallback: return empty list
    logger.warning("⚠️ All strategies failed, returning empty list")
    return []

async def _fetch_with_params(node_backend_url: str, params: Dict) -> List[Dict]:
    """Internal function to fetch with specific params"""
    
    # Clean params (remove None values)
    clean_params = {k: v for k, v in params.items() if v is not None}
    
    if not clean_params:
        return []
    
    try:
        async with aiohttp.ClientSession() as session:
            # Build URL
            query = "&".join([f"{k}={v}" for k, v in clean_params.items()])
            url = f"{node_backend_url}/api/products"
            if query:
                url += f"?{query}"
            
            logger.info(f"📡 Fetching: {url}")
            
            async with session.get(url, timeout=10) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Handle different response formats
                    if isinstance(data, dict):
                        products = data.get('products', []) or data.get('data', [])
                    elif isinstance(data, list):
                        products = data
                    else:
                        products = []
                    
                    return products
                else:
                    logger.error(f"❌ HTTP {response.status} from {url}")
                    return []
    except asyncio.TimeoutError:
        logger.error("❌ Timeout error")
        return []
    except Exception as e:
        logger.error(f"❌ Fetch error: {e}")
        return []

async def enhance_products(products: List[Dict]) -> List[Dict]:
    """Add computed fields to products"""
    enhanced = []
    
    for p in products:
        # Ensure required fields exist
        if not p.get('id'):
            p['id'] = f"temp_{hash(p.get('name', ''))}"
        
        # Add image URL fallback
        if not p.get('image_url'):
            # Generate placeholder based on category
            category = p.get('category', 'product').lower()
            p['image_url'] = f"https://via.placeholder.com/300x300/9CAF88/8B5A2B?text={category}"
        
        # Add discount info
        if p.get('original_price') and p.get('price'):
            original = float(p['original_price'])
            current = float(p['price'])
            if original > current:
                p['discount_percent'] = round(((original - current) / original) * 100)
                p['discount_amount'] = original - current
        else:
            p['original_price'] = p.get('price')
            p['discount_percent'] = 0
        
        # Add stock status
        p['in_stock'] = p.get('stock', 10) > 0
        p['stock_status'] = "In Stock" if p['in_stock'] else "Out of Stock"
        
        # Add price segment
        price = float(p.get('price', 0))
        if price < 500:
            p['price_segment'] = 'budget'
            p['price_tag'] = '💰 Budget Friendly'
        elif price < 1000:
            p['price_segment'] = 'economy'
            p['price_tag'] = '💵 Great Value'
        elif price < 2500:
            p['price_segment'] = 'standard'
            p['price_tag'] = '✨ Standard'
        elif price < 5000:
            p['price_segment'] = 'premium'
            p['price_tag'] = '🌟 Premium'
        else:
            p['price_segment'] = 'luxury'
            p['price_tag'] = '👑 Luxury'
        
        enhanced.append(p)
    
    return enhanced

async def verify_category_has_products(node_backend_url: str, category: str) -> bool:
    """Verify if a category actually has products"""
    products = await fetch_products_with_filters(
        node_backend_url,
        category=category,
        limit=1
    )
    return len(products) > 0

async def get_popular_categories(node_backend_url: str) -> List[str]:
    """Get categories that actually have products"""
    from category_mapper import DISPLAY_CATEGORIES
    
    popular = []
    for cat in DISPLAY_CATEGORIES:
        if await verify_category_has_products(node_backend_url, cat['name']):
            popular.append(cat['name'])
    
    return popular
async def get_product_recommendations(
    node_backend_url: str,
    product_id: Optional[str] = None,
    category: Optional[str] = None,
    price: Optional[float] = None,
    limit: int = 4
) -> List[Dict]:
    """Get intelligent product recommendations"""
    
    try:
        if product_id:
            # Try to get similar products based on current product
            url = f"{node_backend_url}/api/products/{product_id}/similar"
            async with aiohttp.ClientSession() as session:
                async with session.get(f"{url}?limit={limit}", timeout=10) as response:
                    if response.status == 200:
                        data = await response.json()
                        if isinstance(data, dict):
                            return data.get('products', []) or data.get('data', [])
                        elif isinstance(data, list):
                            return data
        
        # Fallback: get products in same category or price range
        filters = {}
        if category:
            filters['category'] = category
        if price:
            # Get products within 30% of price
            filters['minPrice'] = price * 0.7
            filters['maxPrice'] = price * 1.3
        
        return await fetch_products_with_filters(node_backend_url, **filters, limit=limit)
    
    except Exception as e:
        print(f"❌ Recommendations error: {e}")
        return []