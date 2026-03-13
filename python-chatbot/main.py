from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
import logging
import os

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Venus Enterprises AI Service")

# ----------------------------
# CORS
# ----------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------------------
# Models
# ----------------------------

class ChatRequest(BaseModel):
    message: str


class RecommendationRequest(BaseModel):
    product_name: str
    category: Optional[str] = None
    limit: int = 4


# ----------------------------
# Mock Product Data
# ----------------------------

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
}

# ----------------------------
# Root
# ----------------------------

@app.get("/")
async def root():
    return {"status": "AI service running"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

# ----------------------------
# CHATBOT ENDPOINT
# ----------------------------

@app.post("/api/chat")
async def chat(request: ChatRequest):

    msg = request.message.lower()

    if "hello" in msg or "hi" in msg:
        return {"reply": "Hello! Welcome to Venus Enterprises. How can I help you?"}

    if "products" in msg:
        return {"reply": "We offer Wooden, Acrylic, Metal, Crystal and Corporate gifts."}

    if "price" in msg:
        return {"reply": "Our products range from ₹349 to ₹3999 depending on customization."}

    if "delivery" in msg:
        return {"reply": "Delivery usually takes 3-5 business days."}

    return {"reply": "I'm here to help! Ask me about our products, pricing, or delivery."}


# ----------------------------
# RECOMMENDATION ENDPOINT
# ----------------------------

@app.post("/api/recommend")
async def recommend(request: RecommendationRequest):

    logger.info(f"Recommendation request: {request.product_name}")

    recommendations = []

    if request.category in products_by_category:

        for p in products_by_category[request.category]:

            if p["product_name"] != request.product_name:
                recommendations.append(p)

    return {
        "recommendations": recommendations[:request.limit],
        "method": "content_based"
    }


# ----------------------------
# SERVER START
# ----------------------------

if __name__ == "__main__":

    port = int(os.environ.get("PORT", 8000))

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port
    )