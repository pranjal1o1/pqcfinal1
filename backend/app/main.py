"""
FastAPI Application - Quantum-Resistant Cryptographic Transition Analyzer
Entry point for the backend API
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import logging
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from app.api import scan, risk, report, groq
from app.database import engine, Base
from app.services.ai_results_service import AIResultsService

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Global AI results service instance
ai_service = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events"""
    global ai_service
    
    # Startup: Load AI results
    logger.info("Loading AI results from Kaggle outputs...")
    ai_service = AIResultsService()
    try:
        await ai_service.load_ai_results()
        logger.info(f"Successfully loaded {len(ai_service.risk_data)} AI risk records")
    except Exception as e:
        logger.error(f"Failed to load AI results: {e}")
        raise
    
    # Create database tables
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables created")
    
    # Check Groq API availability
    groq_key = os.getenv("GROQ_API_KEY")
    if groq_key:
        logger.info("✓ Groq API key found - AI-powered features enabled")
    else:
        logger.warning("⚠ Groq API key not found - AI-powered features disabled")
    
    yield
    
    # Shutdown
    logger.info("Shutting down application")

# Create FastAPI app
app = FastAPI(
    title="Quantum-Resistant Crypto Analyzer API",
    description="Backend API for analyzing cryptographic vulnerabilities and PQC migration with AI-powered insights",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for AI output assets
try:
    app.mount("/assets", StaticFiles(directory="ai_outputs"), name="assets")
except Exception as e:
    logger.warning(f"Could not mount assets directory: {e}")

# Include routers
app.include_router(scan.router, prefix="/scan", tags=["Scanning"])
app.include_router(risk.router, prefix="/risk", tags=["Risk Analysis"])
app.include_router(report.router, prefix="/report", tags=["Reports"])
app.include_router(groq.router, prefix="/groq", tags=["AI-Powered Analysis"])

@app.get("/")
async def root():
    """Root endpoint with API information"""
    groq_status = "enabled" if os.getenv("GROQ_API_KEY") else "disabled"
    
    return {
        "message": "Quantum-Resistant Cryptographic Transition Analyzer API",
        "version": "1.0.0",
        "status": "active",
        "features": {
            "ml_analysis": "enabled",
            "ai_insights": groq_status,
            "report_generation": "enabled"
        },
        "endpoints": {
            "scan": "/scan/*",
            "risk": "/risk/*",
            "report": "/report/*",
            "groq": "/groq/*",
            "docs": "/docs",
            "assets": "/assets/*"
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    global ai_service
    groq_available = os.getenv("GROQ_API_KEY") is not None
    
    return {
        "status": "healthy",
        "ai_results_loaded": ai_service is not None and len(ai_service.risk_data) > 0,
        "database": "connected",
        "groq_service": "available" if groq_available else "unavailable"
    }

def get_ai_service() -> AIResultsService:
    """Dependency to get AI service instance"""
    global ai_service
    if ai_service is None:
        raise HTTPException(status_code=503, detail="AI results service not initialized")
    return ai_service