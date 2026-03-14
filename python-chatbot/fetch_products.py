# fetch_products.py
import aiohttp
import asyncio
import logging
from typing import List, Dict, Optional, Any
from urllib.parse import urljoin

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ProductFetcher:
    def __init__(self, base_url: str):
        self.base_url = base_url.rstrip('/')
        self.session = None
        self.timeout = aiohttp.ClientTimeout(total=10)
    
    async def get_session(self):
        """Get or create aiohttp session"""
        if self.session is None or self.session.closed:
            self.session = aiohttp.ClientSession(timeout=self.timeout)
        return self.session
    
    async def close(self):
        """Close session"""
        if self.session and not self.session.closed:
            await self.session.close()
    
    async def _make_request(self, endpoint: str, params: Optional[Dict] = None) -> Optional[Dict]:
        """Make HTTP request with multiple endpoint attempts"""
        
        # List of possible API paths to try
        api_paths = [
            endpoint,
            f"/api{endpoint}",
            f"/api/v1{endpoint}",
            f"/v1{endpoint}",
            endpoint.replace('/api/', '/')
        ]
        
        session = await self.get_session()
        
        for path in api_paths:
            try:
                url = urljoin(self.base_url, path.lstrip('/'))
                logger.info(f"📡 Trying: {url}")
                
                async with session.get(url, params=params) as response:
                    if response.status == 200:
                        content_type = response.headers.get('content-type', '')
                        
                        if 'application/json' in content_type:
                            data = await response.json()
                            logger.info(f"✅ Success with {path}")
                            return data
                        else:
                            logger.warning(f"⚠️ {path} returned non-JSON: {content_type}")
                    else:
                        logger.warning(f"⚠️ {path} returned {response.status}")
            except asyncio.TimeoutError:
                logger.warning(f"⏱️ Timeout for {path}")
            except Exception as e:
                logger.warning(f"⚠️ Error for {path}: {str(e)[:50]}")
        
        logger.error("❌ All API endpoints failed")
        return None
    
    def _extract_products(self, data: Any) -> List[Dict]:
        """Extract products from various API response formats"""
        if not data:
            return []
        
        # Handle different response structures
        if isinstance(data, list):
            return data
        
        if isinstance(data, dict):
            # Common response formats
            if 'products' in data:
                return data['products']
            if 'data' in data:
                return data['data']
            if 'items' in data:
                return data['items']
            if 'results' in data:
                return data['results']
            
            # If it's a single product object with id
            if 'id' in data and 'name' in data:
                return [data]
        
        return []
    
    def _enhance_products(self, products: List[Dict]) -> List[Dict]:
        """Add computed fields to products"""
        enhanced = []
        
        for product in products:
            # Ensure required fields
            if not product.get('id'):
                product['id'] = hash(product.get('name', '')) % 10000
            
            # Add full image URL if needed
            if product.get('image_url') and not product['image_url'].startswith('http'):
                product['image_url'] = urljoin(self.base_url, product['image_url'])
            
            # Add fallback image
            if not product.get('image_url'):
                category = product.get('category', 'product').lower()
                product['image_url'] = f"https://via.placeholder.com/300x300/9CAF88/8B5A2B?text={category}"
            
            # Ensure price is float
            if product.get('price'):
                product['price'] = float(product['price'])
            
            # Add stock status
            stock = product.get('stock', 0)
            product['in_stock'] = stock > 0
            product['stock_status'] = "In Stock" if stock > 10 else "Limited Stock" if stock > 0 else "Out of Stock"
            
            enhanced.append(product)
        
        return enhanced
    
    async def get_products_by_category(self, category: str, limit: int = 10) -> List[Dict]:
        """Get products by category"""
        from category_mapper import get_db_category
        
        db_category = get_db_category(category)
        if not db_category:
            logger.warning(f"⚠️ No database mapping for category: {category}")
            return []
        
        params = {
            'category': db_category,
            'limit': limit,
            'active': 'true'
        }
        
        data = await self._make_request('/products', params)
        products = self._extract_products(data)
        
        # Filter by category if API doesn't support it
        if products and not params.get('category'):
            products = [p for p in products if p.get('category', '').lower() == db_category.lower()]
        
        return self._enhance_products(products[:limit])
    
    async def get_all_products(self, limit: int = 20) -> List[Dict]:
        """Get all products"""
        params = {
            'limit': limit,
            'active': 'true'
        }
        
        data = await self._make_request('/products', params)
        products = self._extract_products(data)
        return self._enhance_products(products[:limit])
    
    async def get_products_by_price(self, min_price: Optional[float] = None, max_price: Optional[float] = None, limit: int = 10) -> List[Dict]:
        """Get products filtered by price"""
        params = {
            'limit': limit,
            'active': 'true'
        }
        if min_price:
            params['minPrice'] = min_price
        if max_price:
            params['maxPrice'] = max_price
        
        data = await self._make_request('/products', params)
        products = self._extract_products(data)
        
        # Manual price filtering if API doesn't support it
        if products and (min_price or max_price):
            filtered = []
            for p in products:
                price = float(p.get('price', 0))
                if min_price and price < min_price:
                    continue
                if max_price and price > max_price:
                    continue
                filtered.append(p)
            products = filtered
        
        return self._enhance_products(products[:limit])
    
    async def search_products(self, query: str, limit: int = 10) -> List[Dict]:
        """Search products by name/description"""
        params = {
            'search': query,
            'limit': limit
        }
        
        data = await self._make_request('/products/search', params)
        products = self._extract_products(data)
        return self._enhance_products(products[:limit])

# Global instance
_product_fetcher = None

async def get_product_fetcher(base_url: str) -> ProductFetcher:
    """Get or create ProductFetcher instance"""
    global _product_fetcher
    if _product_fetcher is None:
        _product_fetcher = ProductFetcher(base_url)
    return _product_fetcher

async def fetch_products_by_category(base_url: str, category: str, limit: int = 10) -> List[Dict]:
    """Convenience function to fetch products by category"""
    fetcher = await get_product_fetcher(base_url)
    return await fetcher.get_products_by_category(category, limit)

async def fetch_all_products(base_url: str, limit: int = 20) -> List[Dict]:
    """Convenience function to fetch all products"""
    fetcher = await get_product_fetcher(base_url)
    return await fetcher.get_all_products(limit)

async def fetch_products_by_price(base_url: str, min_price: float = None, max_price: float = None, limit: int = 10) -> List[Dict]:
    """Convenience function to fetch products by price"""
    fetcher = await get_product_fetcher(base_url)
    return await fetcher.get_products_by_price(min_price, max_price, limit)