from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes import router
from .ollama_client import OllamaClient
import logging
import os

# Configure logging
logging.basicConfig(
    level=getattr(logging, os.getenv("LOG_LEVEL", "INFO")),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    filename=os.getenv("LOG_FILE", "chatbot.log")
)
logger = logging.getLogger(__name__)

def create_app():
    """Create and configure FastAPI application"""
    app = FastAPI(
        title="Venus Enterprises Chatbot Service",
        description="AI-powered chatbot using Ollama LLM",
        version="1.0.0"
    )

    # Configure CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # In production, restrict this
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Initialize Ollama client
    ollama_client = OllamaClient()
    app.state.ollama_client = ollama_client

    # Include routes
    app.include_router(router, prefix="/api")

    # Startup event
    @app.on_event("startup")
    async def startup_event():
        logger.info("Starting chatbot service...")
        # Test Ollama connection
        if await ollama_client.test_connection():
            logger.info("Ollama connection successful")
        else:
            logger.warning("Ollama connection failed - chatbot will use fallback responses")

    # Shutdown event
    @app.on_event("shutdown")
    async def shutdown_event():
        logger.info("Shutting down chatbot service...")
        await ollama_client.close()

    @app.get("/")
    async def root():
        return {
            "service": "Venus Enterprises Chatbot",
            "status": "running",
            "version": "1.0.0"
        }

    @app.get("/health")
    async def health():
        ollama_status = await app.state.ollama_client.test_connection()
        return {
            "status": "healthy",
            "ollama_connected": ollama_status,
            "timestamp": __import__("datetime").datetime.now().isoformat()
        }

    return app