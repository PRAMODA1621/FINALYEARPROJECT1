from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
import logging
import os

# ---------------------------------------------------
# Logging
# ---------------------------------------------------

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ---------------------------------------------------
# FastAPI App
# ---------------------------------------------------

app = FastAPI(title="Venus Enterprises Recommendation Engine")


# ---------------------------------------------------
# CORS Configuration
# ---------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "https://finalyearproject1-pvex.onrender.com",
        "https://venus-frontend-guqs.onrender.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------
# Request / Response Models
# ---------------------------------------------------

class RecommendationRequest(BaseModel):
    product_name: str
    category: Optional[str] = None
    limit: int = 4


class RecommendationResponse(BaseModel):
    recommendations: List[dict]
    method: str


# ---------------------------------------------------
# Product Data (Mock Database)
# ---------------------------------------------------

products_by_category = {
    "Wooden": [
        {"product_name": "Wooden Photo Frame Plaque", "score": 0.95},
        {"product_name": "Wooden Business Card Holder", "score": 0.92},
        {"product_name": "Wooden Pen Stand", "score": 0.88},
        {"product_name": "Wooden Award Plaque", "score": 0.85},
    ],
    "Acrylic": [
        {"product_name": "Acrylic Trophy Award", "score": 0.94},
        {"product_name": "Acrylic Paper Weight", "score": 0.91},
        {"product_name": "Acrylic Plaque", "score": 0.89},
        {"product_name": "Acrylic Desk Sign", "score": 0.87},
    ],
    "Metal": [
        {"product_name": "Metal Keychain", "score": 0.93},
        {"product_name": "Corporate Desk Clock", "score": 0.90},
        {"product_name": "Metal Business Card Case", "score": 0.88},
        {"product_name": "Metal Letter Opener", "score": 0.86},
    ],
    "Gifts": [
        {"product_name": "Customized Coffee Mug", "score": 0.92},
        {"product_name": "Corporate Leather Folder", "score": 0.89},
        {"product_name": "Executive Gift Set", "score": 0.87},
        {"product_name": "Leather Mouse Pad", "score": 0.84},
    ],
    "Mementos": [
        {"product_name": "Memento of Gratitude", "score": 0.91},
        {"product_name": "Memento of Service", "score": 0.88},
    ],
    "Marble": [
        {"product_name": "Marble Paperweight", "score": 0.90},
        {"product_name": "Marble Plaque", "score": 0.87},
    ]
}


# ---------------------------------------------------
# Cross-Category Recommendations
# ---------------------------------------------------

cross_category = {
    "Wooden": [
        "Acrylic LED Name Plate",
        "Metal Engraved Pen",
        "Corporate Gift Combo"
    ],
    "Acrylic": [
        "Wooden Name Plate",
        "Metal Keychain",
        "Leather Diary"
    ],
    "Metal": [
        "Wooden Photo Frame",
        "Acrylic Trophy",
        "Corporate Gift Set"
    ],
    "Gifts": [
        "Engraved Pen",
        "Leather Diary",
        "Custom Mug"
    ]
}


# ---------------------------------------------------
# Health Endpoints
# ---------------------------------------------------

@app.get("/")
async def root():
    return {
        "message": "Venus Enterprises Recommendation API",
        "status": "running"
    }


@app.get("/health")
async def health():
    return {"status": "healthy"}


# ---------------------------------------------------
# Recommendation Endpoint
# ---------------------------------------------------

@app.post("/api/recommend", response_model=RecommendationResponse)
async def recommend(request: RecommendationRequest):

    logger.info(f"Recommendation request: {request.product_name}")

    recommendations = []

    # -------------------------
    # Category Recommendations
    # -------------------------

    if request.category and request.category in products_by_category:

        category_recs = products_by_category[request.category]

        filtered = [
            r for r in category_recs
            if r["product_name"] != request.product_name
        ]

        recommendations = filtered[:request.limit]

    # -------------------------
    # Cross Category Suggestions
    # -------------------------

    if (
        len(recommendations) < request.limit
        and request.category in cross_category
    ):

        cross_recs = cross_category[request.category]

        for rec in cross_recs:

            if len(recommendations) >= request.limit:
                break

            if not any(r["product_name"] == rec for r in recommendations):
                recommendations.append({
                    "product_name": rec,
                    "score": 0.75
                })

    # -------------------------
    # Popular Fallback Products
    # -------------------------

    popular_products = [
        {"product_name": "Engraved Wooden Name Plate", "score": 0.98},
        {"product_name": "Metal Engraved Pen", "score": 0.97},
        {"product_name": "Corporate Gift Combo", "score": 0.96},
        {"product_name": "Crystal Corporate Award", "score": 0.95},
    ]

    while len(recommendations) < request.limit:

        for pop in popular_products:

            if len(recommendations) >= request.limit:
                break

            if not any(
                r["product_name"] == pop["product_name"]
                for r in recommendations
            ):
                recommendations.append(pop)

    return RecommendationResponse(
        recommendations=recommendations[:request.limit],
        method="collaborative_filtering"
    )


# ---------------------------------------------------
# Server Start
# ---------------------------------------------------

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=False
    )