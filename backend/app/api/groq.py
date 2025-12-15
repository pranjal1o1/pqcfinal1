"""
API endpoints for Groq-powered AI analysis
"""
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from datetime import datetime
import logging

from app.database import get_db
from app.schemas.groq_schemas import (
    ExecutiveSummaryRequest,
    ExecutiveSummaryResponse,
    QuestionRequest,
    QuestionResponse,
    FindingExplanationRequest,
    FindingExplanationResponse
)
from app.models.scan import Scan, Finding
from app.services.groq_service import groq_service

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/executive-summary", response_model=ExecutiveSummaryResponse)
async def generate_executive_summary(
    request: ExecutiveSummaryRequest,
    db: Session = Depends(get_db)
):
    """
    Generate an executive summary for a scan using Groq AI
    
    This endpoint creates a non-technical, business-focused summary
    tailored to the specified company context and audience.
    """
    # Verify scan exists
    scan = db.query(Scan).filter(Scan.id == request.scan_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    
    # Get findings
    findings = db.query(Finding).filter(Finding.scan_id == request.scan_id).all()
    
    if not findings:
        raise HTTPException(
            status_code=400,
            detail="No findings available for this scan"
        )
    
    # Convert findings to dict
    findings_data = []
    for f in findings:
        findings_data.append({
            "algorithm": f.algorithm,
            "key_size": f.key_size,
            "risk_score": f.risk_score,
            "ml_risk_label": f.ml_risk_label,
            "recommended_pqc": f.recommended_pqc,
            "migration_timeline": f.migration_timeline
        })
    
    # Prepare scan metadata
    scan_metadata = {
        "timestamp": scan.timestamp,
        "total_files": scan.total_files_scanned,
        "source_type": scan.source_type
    }
    
    try:
        # Generate summary using Groq
        summary_data = await groq_service.generate_executive_summary(
            findings=findings_data,
            scan_metadata=scan_metadata,
            company_context=request.company_context
        )
        
        return ExecutiveSummaryResponse(
            scan_id=request.scan_id,
            generated_at=datetime.utcnow(),
            company_context=request.company_context,
            summary=summary_data["summary"],
            key_risks=summary_data["key_risks"],
            recommendations=summary_data["recommendations"],
            estimated_cost=summary_data.get("estimated_cost"),
            timeline_summary=summary_data.get("timeline_summary")
        )
        
    except Exception as e:
        logger.error(f"Failed to generate executive summary: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate executive summary: {str(e)}"
        )


@router.post("/ask", response_model=QuestionResponse)
async def ask_question(
    request: QuestionRequest,
    db: Session = Depends(get_db)
):
    """
    Ask questions about scan results using Groq AI
    
    Interactive Q&A to help users understand their vulnerability scan results.
    Examples:
    - "What's the biggest risk in my codebase?"
    - "How long will migration take?"
    - "What should I prioritize first?"
    """
    # Verify scan exists
    scan = db.query(Scan).filter(Scan.id == request.scan_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    
    # Get findings
    findings = db.query(Finding).filter(Finding.scan_id == request.scan_id).all()
    
    # Build context
    critical_count = sum(1 for f in findings if f.ml_risk_label == "Critical")
    high_count = sum(1 for f in findings if f.ml_risk_label == "High")
    
    algorithms = {}
    for f in findings:
        algorithms[f.algorithm] = algorithms.get(f.algorithm, 0) + 1
    
    scan_context = {
        "total_findings": len(findings),
        "critical_count": critical_count,
        "high_count": high_count,
        "algorithms": algorithms,
        "scan_timestamp": scan.timestamp.isoformat()
    }
    
    try:
        # Get answer from Groq
        answer_data = await groq_service.answer_question(
            question=request.question,
            scan_context=scan_context,
            include_technical=request.include_technical_details
        )
        
        # Find related findings (top 3 critical)
        related = []
        for f in sorted(findings, key=lambda x: x.risk_score or 0, reverse=True)[:3]:
            if f.risk_score:
                related.append(f"{f.algorithm} at line {f.line_number} (Risk: {f.risk_score:.1f})")
        
        return QuestionResponse(
            scan_id=request.scan_id,
            question=request.question,
            answer=answer_data["answer"],
            confidence=answer_data.get("confidence"),
            related_findings=related if related else None
        )
        
    except Exception as e:
        logger.error(f"Failed to answer question: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to answer question: {str(e)}"
        )


@router.get("/explain/{scan_id}/{finding_index}", response_model=FindingExplanationResponse)
async def explain_finding(
    scan_id: str,
    finding_index: int,
    explanation_level: str = "executive",
    db: Session = Depends(get_db)
):
    """
    Get detailed explanation of a specific finding using Groq AI
    
    Args:
        scan_id: The scan ID
        finding_index: Index of the finding (0-based)
        explanation_level: 'executive', 'technical', or 'developer'
    """
    # Verify scan exists
    scan = db.query(Scan).filter(Scan.id == scan_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    
    # Get findings
    findings = db.query(Finding).filter(Finding.scan_id == scan_id).all()
    
    if finding_index < 0 or finding_index >= len(findings):
        raise HTTPException(
            status_code=404,
            detail=f"Finding index {finding_index} not found. Valid range: 0-{len(findings)-1}"
        )
    
    finding = findings[finding_index]
    
    # Prepare finding data
    finding_data = {
        "algorithm": finding.algorithm,
        "key_size": finding.key_size,
        "risk_score": finding.risk_score,
        "file_path": finding.file_path,
        "line_number": finding.line_number,
        "code_snippet": finding.code_snippet,
        "ml_risk_label": finding.ml_risk_label,
        "recommended_pqc": finding.recommended_pqc,
        "migration_timeline": finding.migration_timeline
    }
    
    try:
        # Get explanation from Groq
        explanation_data = await groq_service.explain_finding(
            finding=finding_data,
            explanation_level=explanation_level
        )
        
        return FindingExplanationResponse(
            finding_id=finding_index,
            file_path=finding.file_path,
            algorithm=finding.algorithm,
            explanation=explanation_data["explanation"],
            business_impact=explanation_data["business_impact"],
            action_items=explanation_data["action_items"],
            migration_guide=explanation_data.get("migration_guide")
        )
        
    except Exception as e:
        logger.error(f"Failed to explain finding: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to explain finding: {str(e)}"
        )


@router.get("/status")
async def get_groq_status():
    """
    Check if Groq service is available
    """
    return {
        "groq_available": groq_service.is_available(),
        "status": "ready" if groq_service.is_available() else "unavailable",
        "message": "Groq AI service is operational" if groq_service.is_available() 
                   else "GROQ_API_KEY not configured"
    }