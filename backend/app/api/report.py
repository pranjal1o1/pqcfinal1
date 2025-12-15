"""
API endpoints for report generation and export
"""
from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse, FileResponse
from sqlalchemy.orm import Session
from pathlib import Path
import json
import logging

from app.database import get_db

from app.schemas import ReportRequest, ReportMetadata, EnrichedFinding, ReportFormat
from app.models.scan import Scan, Finding, Report
from app.services.report_service import ReportService
from app.services.ai_results_service import AIResultsService


# Add this function inside report.py
def get_ai_service():
    """Get AI service instance"""
    from app.main import ai_service
    from fastapi import HTTPException
    if ai_service is None:
        raise HTTPException(status_code=503, detail="AI results service not initialized")
    return ai_service

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/generate", response_model=ReportMetadata)
async def generate_report(
    request: ReportRequest,
    db: Session = Depends(get_db),
    ai_service: AIResultsService = Depends(get_ai_service)
):
    """
    Generate a compliance report for a scan
    """
    # Verify scan exists
    scan = db.query(Scan).filter(Scan.id == request.scan_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    
    # Get findings
    findings = db.query(Finding).filter(Finding.scan_id == request.scan_id).all()
    
    # Convert to enriched findings
    enriched_findings = []
    for f in findings:
        ai_match = None
        if f.ai_matched and f.ai_risk_id:
            # Find AI match
            for risk in ai_service.risk_data:
                if risk.id == f.ai_risk_id:
                    ai_match = risk
                    break
        
        enriched_findings.append(EnrichedFinding(
            file_path=f.file_path,
            line_number=f.line_number,
            algorithm=f.algorithm,
            key_size=f.key_size,
            code_snippet=f.code_snippet,
            module_name=f.module_name,
            ai_match=ai_match,
            risk_score=f.risk_score,
            priority=f.priority_rank,
            recommended_pqc=f.recommended_pqc
        ))
    
    # Generate report
    report_service = ReportService(ai_service)
    
    try:
        if request.format == ReportFormat.PDF:
            content = report_service.generate_pdf_report(
                scan_id=request.scan_id,
                findings=enriched_findings,
                include_ai_analysis=request.include_ai_analysis,
                include_shap_plots=request.include_shap_plots,
                include_dashboard=request.include_dashboard
            )
            content_bytes = content.getvalue()
            file_size = len(content_bytes)
            
        elif request.format == ReportFormat.CSV:
            content = report_service.generate_csv_report(enriched_findings)
            content_bytes = content.getvalue().encode('utf-8')
            file_size = len(content_bytes)
            
        elif request.format == ReportFormat.JSON:
            report_data = report_service.generate_json_report(
                request.scan_id,
                enriched_findings
            )
            content_bytes = json.dumps(report_data, indent=2).encode('utf-8')
            file_size = len(content_bytes)
        
        # Save report metadata
        report = Report(
            scan_id=request.scan_id,
            format=request.format.value,
            file_size=file_size,
            report_metadata={  # Changed from 'metadata' to 'report_metadata'
                "include_ai_analysis": request.include_ai_analysis,
                "include_shap_plots": request.include_shap_plots,
                "include_dashboard": request.include_dashboard
            }
        )
        db.add(report)
        db.commit()
        
        return ReportMetadata(
            report_id=report.id,
            generated_at=report.generated_at,
            scan_id=request.scan_id,
            format=request.format,
            file_size=file_size
        )
    
    except Exception as e:
        logger.error(f"Report generation failed: {e}")
        raise HTTPException(status_code=500, detail=f"Report generation failed: {str(e)}")

@router.get("/export/{scan_id}/{format}")
async def export_report(
    scan_id: str,
    format: ReportFormat,
    db: Session = Depends(get_db),
    ai_service: AIResultsService = Depends(get_ai_service)
):
    """
    Export and download a report
    """
    # Verify scan exists
    scan = db.query(Scan).filter(Scan.id == scan_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    
    # Get findings
    findings = db.query(Finding).filter(Finding.scan_id == scan_id).all()
    
    # Convert to enriched findings
    enriched_findings = []
    for f in findings:
        ai_match = None
        if f.ai_matched and f.ai_risk_id:
            for risk in ai_service.risk_data:
                if risk.id == f.ai_risk_id:
                    ai_match = risk
                    break
        
        enriched_findings.append(EnrichedFinding(
            file_path=f.file_path,
            line_number=f.line_number,
            algorithm=f.algorithm,
            key_size=f.key_size,
            code_snippet=f.code_snippet,
            module_name=f.module_name,
            ai_match=ai_match,
            risk_score=f.risk_score,
            priority=f.priority_rank,
            recommended_pqc=f.recommended_pqc
        ))
    
    # Generate report
    report_service = ReportService(ai_service)
    
    try:
        if format == ReportFormat.PDF:
            content = report_service.generate_pdf_report(
                scan_id=scan_id,
                findings=enriched_findings,
                include_ai_analysis=True,
                include_shap_plots=True,
                include_dashboard=True
            )
            
            return StreamingResponse(
                content,
                media_type="application/pdf",
                headers={
                    "Content-Disposition": f"attachment; filename=crypto_report_{scan_id}.pdf"
                }
            )
        
        elif format == ReportFormat.CSV:
            content = report_service.generate_csv_report(enriched_findings)
            
            return StreamingResponse(
                iter([content.getvalue()]),
                media_type="text/csv",
                headers={
                    "Content-Disposition": f"attachment; filename=crypto_report_{scan_id}.csv"
                }
            )
        
        elif format == ReportFormat.JSON:
            report_data = report_service.generate_json_report(scan_id, enriched_findings)
            
            return StreamingResponse(
                iter([json.dumps(report_data, indent=2)]),
                media_type="application/json",
                headers={
                    "Content-Disposition": f"attachment; filename=crypto_report_{scan_id}.json"
                }
            )
    
    except Exception as e:
        logger.error(f"Export failed: {e}")
        raise HTTPException(status_code=500, detail=f"Export failed: {str(e)}")

@router.get("/assets/{filename}")
async def get_asset(filename: str):
    """
    Serve AI output visualization assets (PNG files)
    """
    asset_path = Path("ai_outputs") / filename
    
    if not asset_path.exists():
        raise HTTPException(status_code=404, detail="Asset not found")
    
    if not asset_path.suffix.lower() in ['.png', '.jpg', '.jpeg']:
        raise HTTPException(status_code=400, detail="Invalid asset type")
    
    return FileResponse(asset_path)

@router.get("/list/{scan_id}")
async def list_reports(
    scan_id: str,
    db: Session = Depends(get_db)
):
    """
    List all reports generated for a scan
    """
    reports = db.query(Report).filter(Report.scan_id == scan_id).all()
    
    return {
        "scan_id": scan_id,
        "reports": [
            {
                "report_id": r.id,
                "generated_at": r.generated_at,
                "format": r.format,
                "file_size": r.file_size
            }
            for r in reports
        ]
    }