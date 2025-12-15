"""
SQLAlchemy models for database tables
"""
from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Boolean, JSON, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from app.database import Base

class Scan(Base):
    __tablename__ = "scans"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    source_type = Column(String, nullable=False)  # upload, repo
    source_path = Column(String, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    total_files_scanned = Column(Integer, default=0)
    status = Column(String, default="completed")
    
    # Relationships
    findings = relationship("Finding", back_populates="scan", cascade="all, delete-orphan")
    reports = relationship("Report", back_populates="scan", cascade="all, delete-orphan")

class Finding(Base):
    __tablename__ = "findings"
    
    id = Column(Integer, primary_key=True, index=True)
    scan_id = Column(String, ForeignKey("scans.id"), nullable=False)
    file_path = Column(String, nullable=False)
    line_number = Column(Integer, nullable=False)
    algorithm = Column(String, nullable=False)
    key_size = Column(Integer, nullable=True)
    code_snippet = Column(Text, nullable=False)
    module_name = Column(String, nullable=True)
    
    # AI correlation fields
    ai_matched = Column(Boolean, default=False)
    ai_risk_id = Column(String, nullable=True)
    risk_score = Column(Float, nullable=True)
    priority_rank = Column(Integer, nullable=True)
    ml_risk_label = Column(String, nullable=True)
    recommended_pqc = Column(String, nullable=True)
    migration_timeline = Column(String, nullable=True)
    
    # Relationships
    scan = relationship("Scan", back_populates="findings")

class AIRisk(Base):
    __tablename__ = "ai_risks"
    
    id = Column(String, primary_key=True)
    priority_rank = Column(Integer, nullable=False, index=True)
    priority_score = Column(Float, nullable=False)
    algorithm = Column(String, nullable=False)
    key_size = Column(Integer, nullable=False)
    system_type = Column(String, nullable=False)
    risk_score = Column(Float, nullable=False)
    ml_risk_label = Column(String, nullable=False)
    ml_confidence = Column(Float, nullable=False)
    quantum_vulnerable = Column(Boolean, default=True)
    recommended_pqc = Column(String, nullable=False)
    estimated_effort_days = Column(Integer, nullable=False)
    migration_complexity = Column(String, nullable=False)
    migration_timeline = Column(String, nullable=False)
    
    # JSON fields for complex data
    explainability = Column(JSON, nullable=True)
    
class Report(Base):
    __tablename__ = "reports"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    scan_id = Column(String, ForeignKey("scans.id"), nullable=False)
    generated_at = Column(DateTime, default=datetime.utcnow)
    format = Column(String, nullable=False)  # pdf, csv, json
    file_path = Column(String, nullable=True)
    file_size = Column(Integer, nullable=True)
    report_metadata = Column(JSON, nullable=True)  # Changed from 'metadata' to 'report_metadata'
    
    # Relationships
    scan = relationship("Scan", back_populates="reports")