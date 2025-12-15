"""Fix Backend - Populate all empty files with code"""
from pathlib import Path

def write_file(filepath, content):
    Path(filepath).write_text(content, encoding='utf-8')
    print(f"✓ Written {filepath} ({len(content)} bytes)")

# =============================================================================
# DATABASE.PY
# =============================================================================
database_content = """\"\"\"Database configuration and session management\"\"\"
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./crypto_analyzer.db")

if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {},
    pool_pre_ping=True
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
"""

write_file("app/database.py", database_content)

# =============================================================================
# SCHEMAS.PY
# =============================================================================
schemas_content = """\"\"\"Pydantic schemas for request/response validation\"\"\"
from pydantic import BaseModel
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

class DashboardData(BaseModel):
    total_vulnerabilities: int
    critical_count: int
    high_count: int
    medium_count: int
    low_count: int
    algorithm_distribution: Dict[str, int]
    top_priorities: List
    migration_timeline_summary: Dict[str, int]
    pqc_recommendations: Dict[str, int]
"""

write_file("app/schemas.py", schemas_content)

# =============================================================================
# AI_RESULTS_SERVICE.PY
# =============================================================================
ai_service_content = """\"\"\"Service for loading and managing Kaggle AI output files\"\"\"
import json
from pathlib import Path
from typing import Dict, List
import logging

logger = logging.getLogger(__name__)

class AIResultsService:
    def __init__(self, ai_outputs_dir: str = "ai_outputs"):
        self.ai_outputs_dir = Path(ai_outputs_dir)
        self.risk_data = []
        self.metadata = {}
        
    async def load_ai_results(self):
        try:
            risk_file = self.ai_outputs_dir / "risk_output.json"
            if not risk_file.exists():
                logger.warning(f"AI risk output not found: {risk_file}")
                return
            
            with open(risk_file, 'r') as f:
                data = json.load(f)
            
            self.metadata = data.get("metadata", {})
            self.risk_data = data.get("vulnerabilities", [])
            logger.info(f"Loaded {len(self.risk_data)} AI risk records")
            
        except Exception as e:
            logger.error(f"Error loading AI results: {e}")
            raise
    
    def get_statistics(self) -> Dict:
        total = len(self.risk_data)
        risk_counts = {"Critical": 0, "High": 0, "Medium": 0, "Low": 0}
        algorithm_counts = {}
        pqc_recommendations = {}
        timeline_counts = {}
        
        for record in self.risk_data:
            level = record.get("risk_assessment", {}).get("ml_risk_label", "Unknown")
            risk_counts[level] = risk_counts.get(level, 0) + 1
            
            algo = record.get("current_config", {}).get("algorithm", "Unknown")
            algorithm_counts[algo] = algorithm_counts.get(algo, 0) + 1
            
            pqc = record.get("recommendation", {}).get("recommended_pqc", "Unknown")
            pqc_recommendations[pqc] = pqc_recommendations.get(pqc, 0) + 1
            
            timeline = record.get("migration", {}).get("timeline", "Unknown")
            timeline_counts[timeline] = timeline_counts.get(timeline, 0) + 1
        
        return {
            "total_vulnerabilities": total,
            "risk_distribution": risk_counts,
            "algorithm_distribution": algorithm_counts,
            "pqc_recommendations": pqc_recommendations,
            "migration_timelines": timeline_counts,
            "model_accuracy": self.metadata.get("model_accuracy", 0.0)
        }
"""

write_file("app/services/ai_results_service.py", ai_service_content)

# =============================================================================
# MODELS/SCAN.PY
# =============================================================================
models_content = """\"\"\"SQLAlchemy models for database tables\"\"\"
from sqlalchemy import Column, Integer, String, Float, DateTime, Text
from datetime import datetime
import uuid
from app.database import Base

class Scan(Base):
    __tablename__ = "scans"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    source_type = Column(String, nullable=False)
    source_path = Column(String, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    total_files_scanned = Column(Integer, default=0)
    status = Column(String, default="completed")

class Finding(Base):
    __tablename__ = "findings"
    id = Column(Integer, primary_key=True, index=True)
    scan_id = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    line_number = Column(Integer, nullable=False)
    algorithm = Column(String, nullable=False)
    key_size = Column(Integer, nullable=True)
    code_snippet = Column(Text, nullable=False)
    risk_score = Column(Float, nullable=True)
"""

write_file("app/models/scan.py", models_content)

# =============================================================================
# API FILES
# =============================================================================
scan_api = """\"\"\"API endpoints for code scanning operations\"\"\"
from fastapi import APIRouter
router = APIRouter()

@router.get("/test")
async def test_scan():
    return {"message": "Scan API working"}
"""

risk_api = """\"\"\"API endpoints for risk analysis\"\"\"
from fastapi import APIRouter, Depends
from app.main import get_ai_service
from app.services.ai_results_service import AIResultsService
from app.schemas import DashboardData

router = APIRouter()

@router.get("/test")
async def test_risk():
    return {"message": "Risk API working"}

@router.get("/statistics")
async def get_statistics(ai_service: AIResultsService = Depends(get_ai_service)):
    try:
        return ai_service.get_statistics()
    except Exception as e:
        return {"error": str(e)}

@router.get("/dashboard", response_model=DashboardData)
async def get_dashboard(ai_service: AIResultsService = Depends(get_ai_service)):
    try:
        stats = ai_service.get_statistics()
        return DashboardData(
            total_vulnerabilities=stats.get("total_vulnerabilities", 0),
            critical_count=stats.get("risk_distribution", {}).get("Critical", 0),
            high_count=stats.get("risk_distribution", {}).get("High", 0),
            medium_count=stats.get("risk_distribution", {}).get("Medium", 0),
            low_count=stats.get("risk_distribution", {}).get("Low", 0),
            algorithm_distribution=stats.get("algorithm_distribution", {}),
            top_priorities=[],
            migration_timeline_summary=stats.get("migration_timelines", {}),
            pqc_recommendations=stats.get("pqc_recommendations", {})
        )
    except Exception as e:
        raise
"""

report_api = """\"\"\"API endpoints for report generation\"\"\"
from fastapi import APIRouter
router = APIRouter()

@router.get("/test")
async def test_report():
    return {"message": "Report API working"}
"""

write_file("app/api/scan.py", scan_api)
write_file("app/api/risk.py", risk_api)
write_file("app/api/report.py", report_api)

print("\n" + "="*60)
print("✅ ALL FILES POPULATED SUCCESSFULLY!")
print("="*60)
print("\nNow run: uvicorn app.main:app --reload")