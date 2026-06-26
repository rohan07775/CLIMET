"""
app/main.py
──────────────────────────────────────────────────────────────────────────────
FastAPI Application Entrypoint. Initializes the application, configures CORS,
establishes DB connection lifecycle hooks, and mounts core routers.
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.database import init_db
from app.routers import auth, weather, predict, alerts, agri, chatbot, carbon

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Handles startup and shutdown events for the FastAPI application."""
    logger.info("Initializing database...")
    try:
        await init_db()
        logger.info("Database tables initialized successfully.")
    except Exception as e:
        logger.error(f"Error initializing database: {e}")
        
    yield
    
    logger.info("Shutting down application...")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Backend services for the AI-Powered Digital Twin of India's Climate.",
    lifespan=lifespan,
)

# Configure CORS for Next.js app integration
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://climet.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", tags=["System"])
async def health_check():
    """Returns application health status."""
    return {
        "status": "healthy",
        "app_name": settings.APP_NAME,
        "version": settings.APP_VERSION,
    }


# Mount API routers as requested by target API specifications
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(weather.router, prefix="/weather", tags=["Weather"])
app.include_router(predict.router, prefix="/predict", tags=["Predictions"])
app.include_router(alerts.router, prefix="/alerts", tags=["Alerts & Disasters"])
app.include_router(agri.router, prefix="/crop-analysis", tags=["Agriculture Analysis"])
app.include_router(chatbot.router, prefix="/chatbot", tags=["AI Chatbot"])
app.include_router(carbon.router, prefix="/carbon", tags=["Carbon Footprint"])


@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred. Please check logs."},
    )
