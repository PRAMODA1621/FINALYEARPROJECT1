from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
import os
import uvicorn

app = FastAPI(title="Venus Enterprises AI Chatbot")

# -----------------------------
# CORS
# -----------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------
# Models
# -----------------------------

class ChatRequest(BaseModel):
    message: str


# -----------------------------
# Mock Products (UI requires this)
# -----------------------------

products_by_category = {
    "wooden": [
        {"name": "Wooden Photo Frame Plaque", "price": 599, "image_url": "/images/placeholder.jpg"},
        {"name": "Wooden Business Card Holder", "price": 499, "image_url": "/images/placeholder.jpg"},
        {"name": "Wooden Pen Stand", "price": 449, "image_url": "/images/placeholder.jpg"},
    ],
    "acrylic": [
        {"name": "Acrylic Trophy Award", "price": 799, "image_url": "/images/placeholder.jpg"},
        {"name": "Acrylic Desk Sign", "price": 599, "image_url": "/images/placeholder.jpg"},
    ]
}

# -----------------------------
# Ollama Config
# -----------------------------

OLLAMA_URL = os.environ.get("OLLAMA_URL", "http://localhost:11434/api/generate")
OLLAMA_MODEL = os.environ.get("OLLAMA_MODEL", "llama3")


def ask_ollama(user_message):

    prompt = f"""
You are a helpful assistant for an ecommerce store called Venus Enterprises.

User message: {user_message}

Decide the user's intent.

Possible intents:
1 browse_products
2 pricing
3 delivery
4 category_wooden
5 category_acrylic
6 general_question

Return ONLY one intent word.
"""

    response = requests.post(
        OLLAMA_URL,
        json={
            "model": OLLAMA_MODEL,
            "prompt": prompt,
            "stream": False
        },
        timeout=30
    )

    result = response.json()["response"].strip().lower()

    return result


# -----------------------------
# Chat Endpoint
# -----------------------------

@app.post("/api/chat")
async def chat(request: ChatRequest):

    msg = request.message.strip()

    # Chat start
    if msg == "":
        return {
            "message": "Hello! Welcome to Venus Enterprises. How can I help you today?",
            "options": ["Browse Products", "Pricing", "Delivery"],
            "products": []
        }

    intent = ask_ollama(msg)

    # -----------------------------
    # Browse products
    # -----------------------------

    if "browse" in intent:
        return {
            "message": "Which category would you like to explore?",
            "options": ["Wooden", "Acrylic"],
            "products": []
        }

    # -----------------------------
    # Wooden products
    # -----------------------------

    if "wooden" in intent:
        return {
            "message": "Here are some Wooden products:",
            "options": [],
            "products": products_by_category["wooden"]
        }

    # -----------------------------
    # Acrylic products
    # -----------------------------

    if "acrylic" in intent:
        return {
            "message": "Here are some Acrylic products:",
            "options": [],
            "products": products_by_category["acrylic"]
        }

    # -----------------------------
    # Pricing
    # -----------------------------

    if "pricing" in intent:
        return {
            "message": "Our products range from ₹349 to ₹3999 depending on customization.",
            "options": ["Browse Products"],
            "products": []
        }

    # -----------------------------
    # Delivery
    # -----------------------------

    if "delivery" in intent:
        return {
            "message": "Delivery usually takes 3-5 business days.",
            "options": ["Browse Products"],
            "products": []
        }

    # -----------------------------
    # Fallback (LLM answer)
    # -----------------------------

    response = requests.post(
        OLLAMA_URL,
        json={
            "model": OLLAMA_MODEL,
            "prompt": msg,
            "stream": False
        }
    )

    ai_text = response.json()["response"]

    return {
        "message": ai_text,
        "options": ["Browse Products"],
        "products": []
    }


# -----------------------------
# Root
# -----------------------------

@app.get("/")
def root():
    return {"status": "AI chatbot running"}


# -----------------------------
# Run
# -----------------------------

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port)