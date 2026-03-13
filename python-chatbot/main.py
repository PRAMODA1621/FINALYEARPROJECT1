from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import os

app = FastAPI(title="Venus Enterprises AI Service")

# -------------------
# CORS
# -------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------
# Models
# -------------------

class ChatRequest(BaseModel):
    message: str


# -------------------
# Mock products
# -------------------

products_by_category = {
    "Wooden": [
        {"name": "Wooden Photo Frame Plaque", "price": 599, "image_url": "/images/placeholder.jpg"},
        {"name": "Wooden Business Card Holder", "price": 499, "image_url": "/images/placeholder.jpg"},
        {"name": "Wooden Pen Stand", "price": 449, "image_url": "/images/placeholder.jpg"}
    ],
    "Acrylic": [
        {"name": "Acrylic Trophy Award", "price": 799, "image_url": "/images/placeholder.jpg"},
        {"name": "Acrylic Desk Sign", "price": 599, "image_url": "/images/placeholder.jpg"}
    ]
}

# -------------------
# Root
# -------------------

@app.get("/")
async def root():
    return {"status": "AI service running"}

# -------------------
# Chat Endpoint
# -------------------

@app.post("/api/chat")
async def chat(request: ChatRequest):

    msg = request.message.lower().strip()

    # Start message
    if msg == "" or msg == "start":
        return {
            "message": "Hello! Welcome to Venus Enterprises. How can I help you today?",
            "options": ["Browse Products", "Pricing", "Delivery"],
            "products": []
        }

    # Browse products
    if "browse" in msg or "products" in msg:
        return {
            "message": "Which category would you like to explore?",
            "options": ["Wooden", "Acrylic"],
            "products": []
        }

    # Wooden products
    if "wooden" in msg:
        return {
            "message": "Here are some Wooden products:",
            "options": [],
            "products": products_by_category["Wooden"]
        }

    # Acrylic products
    if "acrylic" in msg:
        return {
            "message": "Here are some Acrylic products:",
            "options": [],
            "products": products_by_category["Acrylic"]
        }

    # Pricing
    if "price" in msg or "pricing" in msg:
        return {
            "message": "Our products range from ₹349 to ₹3999 depending on customization.",
            "options": ["Browse Products"],
            "products": []
        }

    # Delivery
    if "delivery" in msg:
        return {
            "message": "Delivery usually takes 3–5 business days.",
            "options": ["Browse Products"],
            "products": []
        }

    return {
        "message": "I'm here to help. Choose an option below.",
        "options": ["Browse Products", "Pricing", "Delivery"],
        "products": []
    }


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port)