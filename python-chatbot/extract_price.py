# extract_price.py
import re

def extract_price_info(message: str) -> dict:
    """Extract detailed price information from message"""
    msg = message.lower()
    price_info = {"min": None, "max": None, "segment": None}
    
    # Price segments mapping
    segments = {
        "budget": {"keywords": ["budget", "cheap", "affordable", "low cost", "sasta", "kum"], "min": 0, "max": 500},
        "economy": {"keywords": ["economy", "medium", "moderate"], "min": 500, "max": 1000},
        "standard": {"keywords": ["standard", "regular", "normal"], "min": 1000, "max": 2500},
        "premium": {"keywords": ["premium", "high quality", "best", "accha", "top"], "min": 2500, "max": 5000},
        "luxury": {"keywords": ["luxury", "expensive", "elite", "mahanga"], "min": 5000, "max": 100000}
    }
    
    # Check for segment keywords
    for segment, data in segments.items():
        if any(kw in msg for kw in data["keywords"]):
            price_info["segment"] = segment
            if price_info["min"] is None:
                price_info["min"] = data["min"]
            if price_info["max"] is None:
                price_info["max"] = data["max"]
            break
    
    # Extract exact numbers
    numbers = re.findall(r'(\d+(?:,\d+)?)', msg)
    numbers = [int(n.replace(',', '')) for n in numbers]
    
    if numbers:
        # Check for range patterns
        range_patterns = [
            r'(\d+)\s*(?:to|-)\s*(\d+)',
            r'between\s*(\d+)\s*(?:and|to)\s*(\d+)',
            r'from\s*(\d+)\s*(?:to|-)\s*(\d+)'
        ]
        
        for pattern in range_patterns:
            match = re.search(pattern, msg)
            if match:
                price_info["min"] = int(match.group(1))
                price_info["max"] = int(match.group(2))
                return price_info
        
        # Check for "under X", "below X"
        under_patterns = [r'under\s*(\d+)', r'below\s*(\d+)', r'less than\s*(\d+)', r'<(\d+)']
        for pattern in under_patterns:
            match = re.search(pattern, msg)
            if match:
                price_info["max"] = int(match.group(1))
                price_info["min"] = 0
                return price_info
        
        # Check for "above X", "over X"
        above_patterns = [r'above\s*(\d+)', r'over\s*(\d+)', r'more than\s*(\d+)', r'>(\d+)']
        for pattern in above_patterns:
            match = re.search(pattern, msg)
            if match:
                price_info["min"] = int(match.group(1))
                return price_info
        
        # Single number - treat as max if other indicators present
        if len(numbers) == 1:
            if any(word in msg for word in ["under", "below", "less", "within", "max"]):
                price_info["max"] = numbers[0]
                price_info["min"] = 0
            elif any(word in msg for word in ["above", "over", "more", "min"]):
                price_info["min"] = numbers[0]
            else:
                # Assume they want items around this price
                price_info["min"] = numbers[0] * 0.7
                price_info["max"] = numbers[0] * 1.3
    
    return price_info