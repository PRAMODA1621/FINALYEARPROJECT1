# fetch_products.py
import aiohttp
import asyncio
from typing import List, Dict, Optional

async def fetch_products_with_filters(
    node_backend_url: str,
    category: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    search: Optional[str] = None,
    limit: int = 10,
    sort_by: str = "featured"
) -> List[Dict]:
    """Fetch products with advanced filtering"""
    
    try:
        async with aiohttp.ClientSession() as session:
            # Build params
            params = {}
            if category:
                params['category'] = category
            if min_price:
                params['minPrice'] = min_price
            if max_price:
                params['maxPrice'] = max_price
            if search:
                params['search'] = search
            params['limit'] = limit
            params['sort'] = sort_by
            
            # Build URL
            query = "&".join([f"{k}={v}" for k, v in params.items() if v])
            url = f"{node_backend_url}/api/products"
            if query:
                url += f"?{query}"
            
            print(f"📡 Fetching products: {url}")
            
            async with session.get(url, timeout=10) as response:
                if response.status == 200:
                    data = await response.json()
                    if isinstance(data, dict):
                        products = data.get('products', [])
                    elif isinstance(data, list):
                        products = data
                    else:
                        products = []
                    
                    # Enhance products with computed fields
                    for p in products:
                        # Add discount info if available
                        if p.get('original_price') and p.get('price'):
                            p['discount_percent'] = round(
                                ((p['original_price'] - p['price']) / p['original_price']) * 100
                            )
                        
                        # Add in_stock flag
                        p['in_stock'] = p.get('stock', 0) > 0
                        
                        # Add price segment
                        price = p.get('price', 0)
                        if price < 500:
                            p['price_segment'] = 'budget'
                        elif price < 1000:
                            p['price_segment'] = 'economy'
                        elif price < 2500:
                            p['price_segment'] = 'standard'
                        elif price < 5000:
                            p['price_segment'] = 'premium'
                        else:
                            p['price_segment'] = 'luxury'
                    
                    return products
                else:
                    print(f"❌ Error fetching products: {response.status}")
                    return []
    except Exception as e:
        print(f"❌ Fetch products error: {e}")
        return []

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
            # Get similar products based on current product
            url = f"{node_backend_url}/api/products/{product_id}/similar"
            async with aiohttp.ClientSession() as session:
                async with session.get(f"{url}?limit={limit}") as response:
                    if response.status == 200:
                        data = await response.json()
                        return data.get('products', [])
        
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