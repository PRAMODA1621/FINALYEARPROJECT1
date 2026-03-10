from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes import router
from .recommender import RecommenderEngine
import logging
import os

# Configure logging
logging.basicConfig(
    level=getattr(logging, os.getenv("LOG_LEVEL", "INFO")),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    filename=os.getenv("LOG_FILE", "recommendation.log")
)
logger = logging.getLogger(__name__)

def create_app():
    """Create and configure FastAPI application"""
    app = FastAPI(
        title="Venus Enterprises Recommendation Engine",
        description="AI-powered product recommendation service",
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

    # Initialize recommendation engine
    recommender = RecommenderEngine()
    app.state.recommender = recommender

    # Include routes
    app.include_router(router, prefix="/api")

    # Startup event
    @app.on_event("startup")
    async def startup_event():
        logger.info("Starting recommendation service...")
        # Initialize the recommender
        await recommender.initialize()

    # Shutdown event
    @app.on_event("shutdown")
    async def shutdown_event():
        logger.info("Shutting down recommendation service...")
        await recommender.close()

    @app.get("/")
    async def root():
        return {
            "service": "Venus Enterprises Recommendation Engine",
            "status": "running",
            "version": "1.0.0"
        }

    @app.get("/health")
    async def health():
        return {
            "status": "healthy",
            "model_loaded": app.state.recommender.is_ready,
            "timestamp": __import__("datetime").datetime.now().isoformat()
        }

    return app