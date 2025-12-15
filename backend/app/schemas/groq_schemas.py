"""
Pydantic schemas for Groq API endpoints
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class ExecutiveSummaryRequest(BaseModel):
    """Request for generating executive summary"""
    scan_id: str = Field(..., description="Scan ID to generate summary for")
    company_context: Optional[str] = Field(
        "Technology Company",
        description="Company industry context (e.g., Financial Services, Healthcare, Technology)"
    )
    target_audience: Optional[str] = Field(
        "Executive Leadership",
        description="Target audience for the summary"
    )


class ExecutiveSummaryResponse(BaseModel):
    """Response with generated executive summary"""
    scan_id: str
    generated_at: datetime
    company_context: str
    summary: str
    key_risks: List[str]
    recommendations: List[str]
    estimated_cost: Optional[str] = None
    timeline_summary: Optional[str] = None


class QuestionRequest(BaseModel):
    """Request for Q&A about scan results"""
    scan_id: str = Field(..., description="Scan ID to ask about")
    question: str = Field(..., description="Question about the scan results")
    include_technical_details: bool = Field(
        False,
        description="Include technical details in answer"
    )


class QuestionResponse(BaseModel):
    """Response to user question"""
    scan_id: str
    question: str
    answer: str
    confidence: Optional[str] = None
    related_findings: Optional[List[str]] = None


class FindingExplanationRequest(BaseModel):
    """Request to explain a specific finding"""
    finding_id: int = Field(..., description="Finding ID from scan results")
    explanation_level: str = Field(
        "executive",
        description="Level of explanation: 'executive', 'technical', or 'developer'"
    )


class FindingExplanationResponse(BaseModel):
    """Response with finding explanation"""
    finding_id: int
    file_path: str
    algorithm: str
    explanation: str
    business_impact: str
    action_items: List[str]
    migration_guide: Optional[str] = None