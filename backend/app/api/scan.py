"""
API endpoints for code scanning operations
"""
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, BackgroundTasks
from sqlalchemy.orm import Session
from pathlib import Path
import shutil
import tempfile
import zipfile
from datetime import datetime
import uuid
import logging

from app.database import get_db

from app.schemas import ScanResult, CryptoFinding, EnrichedFinding
from app.models.scan import Scan, Finding
from app.services.scanner_service import CryptoScanner
from app.services.correlation_service import CorrelationService
from app.services.ai_results_service import AIResultsService
from app.utils.github import clone_repository

# Add this function inside scan.py
def get_ai_service():
    """Get AI service instance"""
    from app.main import ai_service
    from fastapi import HTTPException
    if ai_service is None:
        raise HTTPException(status_code=503, detail="AI results service not initialized")
    return ai_service

logger = logging.getLogger(__name__)
router = APIRouter()

# File size limit: 100MB
MAX_FILE_SIZE = 100 * 1024 * 1024

@router.post("/upload", response_model=ScanResult)
async def upload_and_scan(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    ai_service: AIResultsService = Depends(get_ai_service)
):
    """
    Upload source code (ZIP file) and scan for crypto usage
    """
    # Validate file
    if not file.filename.endswith('.zip'):
        raise HTTPException(status_code=400, detail="Only ZIP files are supported")
    
    # Create temp directory
    temp_dir = Path(tempfile.mkdtemp())
    scan_id = str(uuid.uuid4())
    
    try:
        # Save uploaded file
        zip_path = temp_dir / file.filename
        with open(zip_path, 'wb') as f:
            content = await file.read()
            if len(content) > MAX_FILE_SIZE:
                raise HTTPException(status_code=400, detail="File too large (max 100MB)")
            f.write(content)
        
        # Extract ZIP
        extract_dir = temp_dir / "extracted"
        extract_dir.mkdir()
        
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(extract_dir)
        
        # Scan for crypto
        scanner = CryptoScanner()
        findings, files_scanned = scanner.scan_directory(extract_dir)
        
        # Correlate with AI data
        correlation_service = CorrelationService(ai_service)
        enriched_findings = correlation_service.enrich_findings(findings)
        
        # Save to database
        scan = Scan(
            id=scan_id,
            source_type="upload",
            source_path=file.filename,
            timestamp=datetime.utcnow(),
            total_files_scanned=files_scanned
        )
        db.add(scan)
        
        for finding in enriched_findings:
            db_finding = Finding(
                scan_id=scan_id,
                file_path=finding.file_path,
                line_number=finding.line_number,
                algorithm=finding.algorithm.value,
                key_size=finding.key_size,
                code_snippet=finding.code_snippet,
                module_name=finding.module_name,
                ai_matched=finding.ai_match is not None,
                ai_risk_id=finding.ai_match.id if finding.ai_match else None,
                risk_score=finding.risk_score,
                priority_rank=finding.priority,
                ml_risk_label=finding.ai_match.risk_assessment.ml_risk_label.value if finding.ai_match else None,
                recommended_pqc=finding.recommended_pqc,
                migration_timeline=finding.ai_match.migration.timeline if finding.ai_match else None
            )
            db.add(db_finding)
        
        db.commit()
        
        # Generate summary
        summary = scanner.get_summary(findings)
        
        return ScanResult(
            scan_id=scan_id,
            timestamp=scan.timestamp,
            source_type="upload",
            source_path=file.filename,
            total_files_scanned=files_scanned,
            findings=[CryptoFinding(**f.dict()) for f in findings[:100]],  # Limit response size
            summary=summary
        )
    
    except Exception as e:
        logger.error(f"Scan failed: {e}")
        raise HTTPException(status_code=500, detail=f"Scan failed: {str(e)}")
    
    finally:
        # Cleanup
        shutil.rmtree(temp_dir, ignore_errors=True)

@router.post("/repo", response_model=ScanResult)
async def scan_repository(
    repo_url: str,
    branch: str = "main",
    db: Session = Depends(get_db),
    ai_service: AIResultsService = Depends(get_ai_service)
):
    """
    Clone and scan a GitHub repository
    """
    temp_dir = Path(tempfile.mkdtemp())
    scan_id = str(uuid.uuid4())
    
    try:
        # Clone repository
        logger.info(f"Cloning repository: {repo_url}")
        repo_dir = clone_repository(repo_url, temp_dir, branch)
        
        # Scan for crypto
        scanner = CryptoScanner()
        findings, files_scanned = scanner.scan_directory(repo_dir)
        
        # Correlate with AI data
        correlation_service = CorrelationService(ai_service)
        enriched_findings = correlation_service.enrich_findings(findings)
        
        # Save to database
        scan = Scan(
            id=scan_id,
            source_type="repo",
            source_path=repo_url,
            timestamp=datetime.utcnow(),
            total_files_scanned=files_scanned
        )
        db.add(scan)
        
        for finding in enriched_findings:
            db_finding = Finding(
                scan_id=scan_id,
                file_path=finding.file_path,
                line_number=finding.line_number,
                algorithm=finding.algorithm.value,
                key_size=finding.key_size,
                code_snippet=finding.code_snippet,
                module_name=finding.module_name,
                ai_matched=finding.ai_match is not None,
                ai_risk_id=finding.ai_match.id if finding.ai_match else None,
                risk_score=finding.risk_score,
                priority_rank=finding.priority,
                ml_risk_label=finding.ai_match.risk_assessment.ml_risk_label.value if finding.ai_match else None,
                recommended_pqc=finding.recommended_pqc,
                migration_timeline=finding.ai_match.migration.timeline if finding.ai_match else None
            )
            db.add(db_finding)
        
        db.commit()
        
        # Generate summary
        summary = scanner.get_summary(findings)
        
        return ScanResult(
            scan_id=scan_id,
            timestamp=scan.timestamp,
            source_type="repo",
            source_path=repo_url,
            total_files_scanned=files_scanned,
            findings=[CryptoFinding(**f.dict()) for f in findings[:100]],
            summary=summary
        )
    
    except Exception as e:
        logger.error(f"Repository scan failed: {e}")
        raise HTTPException(status_code=500, detail=f"Repository scan failed: {str(e)}")
    
    finally:
        # Cleanup
        shutil.rmtree(temp_dir, ignore_errors=True)

@router.get("/results/{scan_id}")
async def get_scan_results(
    scan_id: str,
    db: Session = Depends(get_db)
):
    """
    Retrieve scan results by ID
    """
    scan = db.query(Scan).filter(Scan.id == scan_id).first()
    
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    
    findings = db.query(Finding).filter(Finding.scan_id == scan_id).all()
    
    # Convert to schema
    finding_schemas = []
    for f in findings:
        finding_schemas.append({
            "file_path": f.file_path,
            "line_number": f.line_number,
            "algorithm": f.algorithm,
            "key_size": f.key_size,
            "code_snippet": f.code_snippet,
            "module_name": f.module_name,
            "risk_score": f.risk_score,
            "priority": f.priority_rank,
            "ml_risk_label": f.ml_risk_label,
            "recommended_pqc": f.recommended_pqc,
            "migration_timeline": f.migration_timeline
        })
    
    return {
        "scan_id": scan.id,
        "timestamp": scan.timestamp,
        "source_type": scan.source_type,
        "source_path": scan.source_path,
        "total_files_scanned": scan.total_files_scanned,
        "total_findings": len(findings),
        "findings": finding_schemas
    }

@router.get("/list")
async def list_scans(
    limit: int = 10,
    db: Session = Depends(get_db)
):
    """
    List recent scans
    """
    scans = db.query(Scan).order_by(Scan.timestamp.desc()).limit(limit).all()
    
    return {
        "scans": [
            {
                "scan_id": s.id,
                "timestamp": s.timestamp,
                "source_type": s.source_type,
                "source_path": s.source_path,
                "total_files_scanned": s.total_files_scanned,
                "status": s.status
            }
            for s in scans
        ]
    }