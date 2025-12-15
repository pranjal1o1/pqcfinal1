"""
Script to populate all backend files with code
Run this from the backend directory: python create_files.py
"""

import os
from pathlib import Path

# Ensure we're in the right directory
base_dir = Path(__file__).parent

# Create app/__init__.py
(base_dir / "app" / "__init__.py").write_text("# Backend application package\n")

# Create app/main.py
main_py = '''"""
FastAPI Application - Quantum-Resistant Cryptographic Transition Analyzer
Entry point for the backend API
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import logging

from app.api import scan, risk, report
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
    
    yield
    
    # Shutdown
    logger.info("Shutting down application")

# Create FastAPI app
app = FastAPI(
    title="Quantum-Resistant Crypto Analyzer API",
    description="Backend API for analyzing cryptographic vulnerabilities and PQC migration",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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

@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "Quantum-Resistant Cryptographic Transition Analyzer API",
        "version": "1.0.0",
        "status": "active",
        "endpoints": {
            "scan": "/scan/*",
            "risk": "/risk/*",
            "report": "/report/*",
            "docs": "/docs",
            "assets": "/assets/*"
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    global ai_service
    return {
        "status": "healthy",
        "ai_results_loaded": ai_service is not None and len(ai_service.risk_data) > 0,
        "database": "connected"
    }

def get_ai_service() -> AIResultsService:
    """Dependency to get AI service instance"""
    global ai_service
    if ai_service is None:
        raise HTTPException(status_code=503, detail="AI results service not initialized")
    return ai_service
'''

(base_dir / "app" / "main.py").write_text(main_py)

print("✓ Created app/main.py")

# Create app/database.py
database_py = '''"""
Database configuration and session management
"""
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# Database URL - defaults to SQLite for local dev
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./crypto_analyzer.db")

# Handle PostgreSQL URL format
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# Create engine
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {},
    pool_pre_ping=True
)

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models
Base = declarative_base()

def get_db():
    """Dependency for getting database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
'''

(base_dir / "app" / "database.py").write_text(database_py)
print("✓ Created app/database.py")

# Create app/schemas.py (simplified version)
schemas_py = '''"""
Pydantic schemas for request/response validation
"""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from datetime import datetime
from enum import Enum

class AlgorithmType(str, Enum):
    RSA = "RSA"
    ECC = "ECC"
    DH = "DH"
    AES = "AES"
    SHA1 = "SHA1"
    UNKNOWN = "UNKNOWN"

class RiskLevel(str, Enum):
    CRITICAL = "Critical"
    HIGH = "High"
    MEDIUM = "Medium"
    LOW = "Low"

class CryptoFinding(BaseModel):
    file_path: str
    line_number: int
    algorithm: AlgorithmType
    key_size: Optional[int] = None
    code_snippet: str
    module_name: Optional[str] = None

class ScanResult(BaseModel):
    scan_id: str
    timestamp: datetime
    source_type: str
    source_path: str
    total_files_scanned: int
    findings: List[CryptoFinding]
    summary: Dict[str, int]
'''

(base_dir / "app" / "schemas.py").write_text(schemas_py)
print("✓ Created app/schemas.py")

# Create api/__init__.py
(base_dir / "app" / "api" / "__init__.py").write_text("# API endpoints package\n")

# Create minimal API files
scan_api = '''"""API endpoints for scanning"""
from fastapi import APIRouter
router = APIRouter()

@router.get("/test")
async def test():
    return {"message": "Scan API working"}
'''

risk_api = '''"""API endpoints for risk analysis"""
from fastapi import APIRouter
router = APIRouter()

@router.get("/test")
async def test():
    return {"message": "Risk API working"}
'''

report_api = '''"""API endpoints for reports"""
from fastapi import APIRouter
router = APIRouter()

@router.get("/test")
async def test():
    return {"message": "Report API working"}
'''

(base_dir / "app" / "api" / "scan.py").write_text(scan_api)
(base_dir / "app" / "api" / "risk.py").write_text(risk_api)
(base_dir / "app" / "api" / "report.py").write_text(report_api)

print("✓ Created API files")

# Create models
(base_dir / "app" / "models" / "__init__.py").write_text("# Database models\n")

models_py = '''"""Database models"""
from sqlalchemy import Column, String, Integer, DateTime
from datetime import datetime
from app.database import Base

class Scan(Base):
    __tablename__ = "scans"
    id = Column(String, primary_key=True)
    source_type = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)
'''

(base_dir / "app" / "models" / "scan.py").write_text(models_py)
print("✓ Created models")

# Create services
(base_dir / "app" / "services" / "__init__.py").write_text("# Services package\n")

ai_service = '''"""AI Results Service"""
import json
from pathlib import Path
import logging

logger = logging.getLogger(__name__)

class AIResultsService:
    def __init__(self):
        self.risk_data = []
        
    async def load_ai_results(self):
        """Load AI results from JSON"""
        try:
            ai_file = Path("ai_outputs/risk_output.json")
            if ai_file.exists():
                with open(ai_file) as f:
                    data = json.load(f)
                    self.risk_data = data.get("vulnerabilities", [])
                    logger.info(f"Loaded {len(self.risk_data)} AI records")
            else:
                logger.warning("AI output file not found")
        except Exception as e:
            logger.error(f"Error loading AI results: {e}")
            raise
'''

(base_dir / "app" / "services" / "ai_results_service.py").write_text(ai_service)
print("✓ Created services")

# Create utils
(base_dir / "app" / "utils" / "__init__.py").write_text("# Utilities package\n")

print("\n✅ All files created successfully!")
print("\nNow run: uvicorn app.main:app --reload")