"""
Pydantic schemas for request/response validation
"""
from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

# Enums
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

class ReportFormat(str, Enum):
    PDF = "pdf"
    CSV = "csv"
    JSON = "json"

# Scan Schemas
class ScanCreate(BaseModel):
    source_type: str = Field(..., description="upload or repo")
    source_path: Optional[str] = None
    repo_url: Optional[str] = None
    branch: str = "main"

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

# AI Risk Schemas
class RiskAssessment(BaseModel):
    risk_score: float
    ml_risk_label: RiskLevel
    ml_confidence: float
    quantum_vulnerable: bool

class Recommendation(BaseModel):
    recommended_pqc: str
    estimated_effort_days: int
    migration_complexity: str

class Migration(BaseModel):
    timeline: str

class Explainability(BaseModel):
    top_risk_factors: List[str]
    recommendation_rationale: str

class CurrentConfig(BaseModel):
    algorithm: str
    key_size: int
    system_type: str

class AIRiskRecord(BaseModel):
    id: str
    priority_rank: int
    priority_score: float
    current_config: CurrentConfig
    risk_assessment: RiskAssessment
    recommendation: Recommendation
    migration: Migration
    explainability: Explainability

class EnrichedFinding(CryptoFinding):
    ai_match: Optional[AIRiskRecord] = None
    risk_score: Optional[float] = None
    priority: Optional[int] = None
    recommended_pqc: Optional[str] = None

# Dashboard Schema
class DashboardData(BaseModel):
    total_vulnerabilities: int
    critical_count: int
    high_count: int
    medium_count: int
    low_count: int
    algorithm_distribution: Dict[str, int]
    top_priorities: List[AIRiskRecord]
    migration_timeline_summary: Dict[str, int]
    pqc_recommendations: Dict[str, int]

# Report Schemas
class ReportRequest(BaseModel):
    scan_id: str
    include_ai_analysis: bool = True
    include_shap_plots: bool = True
    include_dashboard: bool = True
    format: ReportFormat = ReportFormat.PDF

class ReportMetadata(BaseModel):
    report_id: str
    generated_at: datetime
    scan_id: str
    format: ReportFormat
    file_size: Optional[int] = None

# Feature Importance Schema
class FeatureImportance(BaseModel):
    feature: str
    mean_abs_shap: float

class SHAPData(BaseModel):
    features: List[FeatureImportance]
    available_plots: List[str]


# Import Groq schemas
from app.schemas.groq_schemas import (
    ExecutiveSummaryRequest,
    ExecutiveSummaryResponse,
    QuestionRequest,
    QuestionResponse,
    FindingExplanationRequest,
    FindingExplanationResponse
)