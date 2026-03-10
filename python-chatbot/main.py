from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
import uvicorn
import logging
from sales_bot import SalesBot, BotState

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Venus Enterprises FSM Sales Chatbot")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Store bot instances per session
bots = {}

class ChatRequest(BaseModel):
    message: Optional[str] = None
    session_id: Optional[str] = None

class ChatResponse(BaseModel):
    message: str
    options: List[str] = []
    products: List[Dict] = []
    product: Optional[Dict] = None
    action: Optional[str] = None
    redirect: Optional[str] = None
    state: int
    type: str
    session_id: str

@app.get("/")
async def root():
    return {"message": "Venus Enterprises FSM Sales Chatbot", "status": "running"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    logger.info(f"Received message: {request.message} for session {request.session_id}")
    
    # Get or create bot for this session
    session_id = request.session_id or "default"
    if session_id not in bots:
        bots[session_id] = SalesBot()
        bots[session_id].session_id = session_id
    
    bot = bots[session_id]
    
    # Process message through FSM bot
    response = bot.get_response(request.message)
    
    return ChatResponse(
        message=response.get("message", ""),
        options=response.get("options", []),
        products=response.get("products", []),
        product=response.get("product"),
        action=response.get("action"),
        redirect=response.get("redirect"),
        state=response.get("state", 0),
        type=response.get("type", "message"),
        session_id=session_id
    )

@app.post("/api/chat/reset")
async def reset_chat(session_id: str = "default"):
    """Reset bot for a session"""
    if session_id in bots:
        bots[session_id].reset()
        return {"success": True, "message": "Chat reset"}
    return {"success": False, "message": "Session not found"}

@app.get("/api/chat/state/{session_id}")
async def get_state(session_id: str = "default"):
    """Get current bot state"""
    if session_id in bots:
        return bots[session_id].get_state()
    return {"state": 0, "state_name": "LANGUAGE_SELECT"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)