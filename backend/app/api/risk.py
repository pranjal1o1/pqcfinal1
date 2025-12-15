"""
API endpoints for risk analysis and AI results
"""
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import Optional, List

from app.database import get_db
from app.schemas import DashboardData, AIRiskRecord, SHAPData
from app.models.scan import Scan, Finding
from app.services.ai_results_service import AIResultsService

# Add this function inside risk.py
def get_ai_service():
    """Get AI service instance"""
    from app.main import ai_service
    from fastapi import HTTPException
    if ai_service is None:
        raise HTTPException(status_code=503, detail="AI results service not initialized")
    return ai_service

router = APIRouter()

@router.get("/analysis/{scan_id}")
async def get_risk_analysis(
    scan_id: str,
    db: Session = Depends(get_db),
    ai_service: AIResultsService = Depends(get_ai_service)
):
    """
    Get comprehensive risk analysis for a specific scan
    """
    # Verify scan exists
    scan = db.query(Scan).filter(Scan.id == scan_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    
    # Get findings
    findings = db.query(Finding).filter(Finding.scan_id == scan_id).all()
    
    if not findings:
        return {
            "scan_id": scan_id,
            "message": "No findings for this scan",
            "total_findings": 0
        }
    
    # Aggregate risk data
    total_findings = len(findings)
    critical_count = sum(1 for f in findings if f.ml_risk_label == "Critical")
    high_count = sum(1 for f in findings if f.ml_risk_label == "High")
    medium_count = sum(1 for f in findings if f.ml_risk_label == "Medium")
    low_count = sum(1 for f in findings if f.ml_risk_label == "Low")
    
    # Algorithm distribution
    algorithm_dist = {}
    for f in findings:
        algorithm_dist[f.algorithm] = algorithm_dist.get(f.algorithm, 0) + 1
    
    # PQC recommendations
    pqc_recommendations = {}
    for f in findings:
        if f.recommended_pqc:
            pqc_recommendations[f.recommended_pqc] = pqc_recommendations.get(f.recommended_pqc, 0) + 1
    
    # Migration timelines
    migration_timelines = {}
    for f in findings:
        if f.migration_timeline:
            migration_timelines[f.migration_timeline] = migration_timelines.get(f.migration_timeline, 0) + 1
    
    # Get priority findings (top 10)
    priority_findings = sorted(
        [f for f in findings if f.priority_rank is not None],
        key=lambda x: x.priority_rank
    )[:10]
    
    priority_list = []
    for f in priority_findings:
        priority_list.append({
            "file_path": f.file_path,
            "line_number": f.line_number,
            "algorithm": f.algorithm,
            "key_size": f.key_size,
            "risk_score": f.risk_score,
            "priority": f.priority_rank,
            "ml_risk_label": f.ml_risk_label,
            "recommended_pqc": f.recommended_pqc,
            "migration_timeline": f.migration_timeline
        })
    
    # Generate recommendations
    recommendations = []
    if critical_count > 0:
        recommendations.append({
            "severity": "Critical",
            "message": f"Found {critical_count} critical vulnerabilities requiring immediate attention (0-3 months)",
            "action": "Prioritize migration to post-quantum cryptography"
        })
    if high_count > 0:
        recommendations.append({
            "severity": "High",
            "message": f"Found {high_count} high-risk vulnerabilities",
            "action": "Plan migration within 3-6 months"
        })
    
    # Calculate average risk score
    risk_scores = [f.risk_score for f in findings if f.risk_score is not None]
    avg_risk_score = sum(risk_scores) / len(risk_scores) if risk_scores else 0
    
    return {
        "scan_id": scan_id,
        "scan_timestamp": scan.timestamp,
        "total_findings": total_findings,
        "risk_distribution": {
            "Critical": critical_count,
            "High": high_count,
            "Medium": medium_count,
            "Low": low_count,
            "Unmatched": total_findings - (critical_count + high_count + medium_count + low_count)
        },
        "average_risk_score": round(avg_risk_score, 2),
        "algorithm_distribution": algorithm_dist,
        "pqc_recommendations": pqc_recommendations,
        "migration_timelines": migration_timelines,
        "priority_findings": priority_list,
        "recommendations": recommendations,
        "summary": {
            "requires_immediate_action": critical_count > 0,
            "total_vulnerabilities": critical_count + high_count,
            "quantum_vulnerable_algorithms": list(algorithm_dist.keys())
        }
    }

@router.get("/ai-results", response_model=dict)
async def get_ai_results(
    limit: Optional[int] = 50,
    ai_service: AIResultsService = Depends(get_ai_service)
):
    """
    Get loaded AI risk analysis results from Kaggle
    """
    return {
        "metadata": ai_service.metadata,
        "total_records": len(ai_service.risk_data),
        "statistics": ai_service.get_statistics(),
        "vulnerabilities": [r.dict() for r in ai_service.risk_data[:limit]]
    }

@router.get("/top-priorities", response_model=List[AIRiskRecord])
async def get_top_priorities(
    limit: int = 10,
    ai_service: AIResultsService = Depends(get_ai_service)
):
    """
    Get top priority vulnerabilities from AI analysis
    """
    return ai_service.get_top_priorities(limit=limit)

@router.get("/by-risk-level/{level}")
async def get_by_risk_level(
    level: str,
    ai_service: AIResultsService = Depends(get_ai_service)
):
    """
    Get vulnerabilities by risk level (Critical, High, Medium, Low)
    """
    valid_levels = ["Critical", "High", "Medium", "Low"]
    if level not in valid_levels:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid risk level. Must be one of: {valid_levels}"
        )
    
    results = ai_service.get_by_risk_level(level)
    
    return {
        "risk_level": level,
        "count": len(results),
        "vulnerabilities": [r.dict() for r in results]
    }

@router.get("/statistics")
async def get_statistics(
    ai_service: AIResultsService = Depends(get_ai_service)
):
    """
    Get comprehensive statistics from AI analysis
    """
    return ai_service.get_statistics()

@router.get("/dashboard", response_model=DashboardData)
async def get_dashboard_data(
    ai_service: AIResultsService = Depends(get_ai_service)
):
    """
    Get aggregated dashboard data for frontend
    """
    stats = ai_service.get_statistics()
    top_priorities = ai_service.get_top_priorities(limit=10)
    
    return DashboardData(
        total_vulnerabilities=stats["total_vulnerabilities"],
        critical_count=stats["risk_distribution"].get("Critical", 0),
        high_count=stats["risk_distribution"].get("High", 0),
        medium_count=stats["risk_distribution"].get("Medium", 0),
        low_count=stats["risk_distribution"].get("Low", 0),
        algorithm_distribution=stats["algorithm_distribution"],
        top_priorities=top_priorities,
        migration_timeline_summary=stats["migration_timelines"],
        pqc_recommendations=stats["pqc_recommendations"]
    )

@router.get("/shap", response_model=SHAPData)
async def get_shap_data(
    ai_service: AIResultsService = Depends(get_ai_service)
):
    """
    Get SHAP feature importance and explainability data
    """
    return ai_service.get_shap_data()

@router.get("/vulnerability/{vuln_id}")
async def get_vulnerability_details(
    vuln_id: str,
    ai_service: AIResultsService = Depends(get_ai_service)
):
    """
    Get detailed information about a specific vulnerability
    """
    for record in ai_service.risk_data:
        if record.id == vuln_id:
            return record.dict()
    
    raise HTTPException(status_code=404, detail="Vulnerability not found")

@router.get("/match/{algorithm}/{key_size}")
async def match_crypto_config(
    algorithm: str,
    key_size: int,
    ai_service: AIResultsService = Depends(get_ai_service)
):
    """
    Find AI risk assessment for specific crypto configuration
    """
    match = ai_service.match_finding(algorithm, key_size)
    
    if not match:
        return {
            "matched": False,
            "message": f"No AI risk data found for {algorithm}-{key_size}"
        }
    
    return {
        "matched": True,
        "risk_data": match.dict()
    }