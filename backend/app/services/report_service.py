"""
Service for generating compliance and analysis reports
"""
import json
import csv
from pathlib import Path
from datetime import datetime
from typing import List, Dict
from io import BytesIO, StringIO
import logging

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, Image
)
from reportlab.lib.enums import TA_CENTER, TA_LEFT

from app.schemas import EnrichedFinding, AIRiskRecord, ReportFormat
from app.services.ai_results_service import AIResultsService

logger = logging.getLogger(__name__)

class ReportService:
    """Generates compliance-ready reports in multiple formats"""
    
    def __init__(self, ai_service: AIResultsService):
        self.ai_service = ai_service
        self.ai_outputs_dir = Path("ai_outputs")
    
    def generate_pdf_report(
        self,
        scan_id: str,
        findings: List[EnrichedFinding],
        include_ai_analysis: bool = True,
        include_shap_plots: bool = True,
        include_dashboard: bool = True
    ) -> BytesIO:
        """Generate comprehensive PDF report"""
        
        buffer = BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=72,
            leftMargin=72,
            topMargin=72,
            bottomMargin=18,
        )
        
        # Container for report elements
        story = []
        styles = getSampleStyleSheet()
        
        # Custom styles
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#1a1a1a'),
            spaceAfter=30,
            alignment=TA_CENTER
        )
        
        heading_style = ParagraphStyle(
            'CustomHeading',
            parent=styles['Heading2'],
            fontSize=16,
            textColor=colors.HexColor('#2c3e50'),
            spaceAfter=12,
            spaceBefore=12
        )
        
        # Title Page
        story.append(Paragraph("Quantum-Resistant Cryptographic", title_style))
        story.append(Paragraph("Transition Analysis Report", title_style))
        story.append(Spacer(1, 0.3 * inch))
        
        # Report metadata
        metadata_data = [
            ["Report ID:", scan_id],
            ["Generated:", datetime.now().strftime("%Y-%m-%d %H:%M:%S")],
            ["Total Findings:", str(len(findings))],
            ["AI Matched:", str(sum(1 for f in findings if f.ai_match))],
        ]
        
        metadata_table = Table(metadata_data, colWidths=[2*inch, 4*inch])
        metadata_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ]))
        story.append(metadata_table)
        story.append(PageBreak())
        
        # Executive Summary
        story.append(Paragraph("Executive Summary", heading_style))
        stats = self.ai_service.get_statistics()
        
        summary_text = f"""
        This report presents a comprehensive analysis of cryptographic vulnerabilities 
        identified in the scanned codebase, correlated with AI-powered risk assessments.
        <br/><br/>
        <b>Key Findings:</b><br/>
        • Total Vulnerabilities Analyzed: {stats['total_vulnerabilities']}<br/>
        • Critical Risk Items: {stats['risk_distribution'].get('Critical', 0)}<br/>
        • High Risk Items: {stats['risk_distribution'].get('High', 0)}<br/>
        • Model Accuracy: {stats['model_accuracy']:.1%}<br/>
        <br/>
        <b>Immediate Action Required:</b><br/>
        {stats['risk_distribution'].get('Critical', 0)} critical vulnerabilities require 
        migration within 0-3 months to maintain quantum resistance.
        """
        story.append(Paragraph(summary_text, styles['Normal']))
        story.append(Spacer(1, 0.2 * inch))
        
        # Top Priority Vulnerabilities
        if include_ai_analysis:
            story.append(PageBreak())
            story.append(Paragraph("Top Priority Vulnerabilities", heading_style))
            
            top_priorities = self.ai_service.get_top_priorities(limit=10)
            priority_data = [["Rank", "ID", "Algorithm", "Risk", "Timeline", "PQC"]]
            
            for risk in top_priorities:
                priority_data.append([
                    str(risk.priority_rank),
                    risk.id,
                    f"{risk.current_config.algorithm}-{risk.current_config.key_size}",
                    risk.risk_assessment.ml_risk_label.value,
                    risk.migration.timeline[:15],
                    risk.recommendation.recommended_pqc
                ])
            
            priority_table = Table(priority_data, colWidths=[0.6*inch, 0.9*inch, 1.2*inch, 0.8*inch, 1.5*inch, 1.3*inch])
            priority_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 10),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                ('GRID', (0, 0), (-1, -1), 1, colors.black),
                ('FONTSIZE', (0, 1), (-1, -1), 8),
            ]))
            story.append(priority_table)
        
        # Scan Findings Detail
        story.append(PageBreak())
        story.append(Paragraph("Detailed Findings", heading_style))
        
        for i, finding in enumerate(findings[:50], 1):  # Limit to 50 for PDF
            finding_text = f"""
            <b>Finding #{i}</b><br/>
            File: {finding.file_path}<br/>
            Line: {finding.line_number}<br/>
            Algorithm: {finding.algorithm.value} ({finding.key_size} bits)<br/>
            """
            
            if finding.ai_match:
                finding_text += f"""
                Risk Score: {finding.risk_score:.1f}/100<br/>
                Priority: #{finding.priority}<br/>
                Recommended PQC: {finding.recommended_pqc}<br/>
                """
            
            story.append(Paragraph(finding_text, styles['Normal']))
            story.append(Spacer(1, 0.1 * inch))
        
        # AI Visualizations
        if include_dashboard:
            story.append(PageBreak())
            story.append(Paragraph("AI Analysis Dashboards", heading_style))
            
            # Add dashboard images
            for plot_name in ["pqc_dashboard.png", "pqc_risk_analysis_dashboard.png"]:
                plot_path = self.ai_outputs_dir / plot_name
                if plot_path.exists():
                    try:
                        img = Image(str(plot_path), width=6*inch, height=4*inch)
                        story.append(img)
                        story.append(Spacer(1, 0.2 * inch))
                    except Exception as e:
                        logger.warning(f"Could not add image {plot_name}: {e}")
        
        # SHAP Explainability
        if include_shap_plots:
            story.append(PageBreak())
            story.append(Paragraph("Model Explainability (SHAP)", heading_style))
            
            shap_plots = [
                "shap_feature_importance.png",
                "shap_summary_detailed.png",
                "shap_waterfall_explanation.png"
            ]
            
            for plot_name in shap_plots:
                plot_path = self.ai_outputs_dir / plot_name
                if plot_path.exists():
                    try:
                        story.append(Paragraph(plot_name.replace('.png', '').replace('_', ' ').title(), styles['Heading3']))
                        img = Image(str(plot_path), width=5.5*inch, height=3.5*inch)
                        story.append(img)
                        story.append(Spacer(1, 0.2 * inch))
                    except Exception as e:
                        logger.warning(f"Could not add SHAP plot {plot_name}: {e}")
        
        # Build PDF
        doc.build(story)
        buffer.seek(0)
        return buffer
    
    def generate_csv_report(self, findings: List[EnrichedFinding]) -> StringIO:
        """Generate CSV report of findings"""
        output = StringIO()
        writer = csv.writer(output)
        
        # Header
        writer.writerow([
            "File Path", "Line Number", "Algorithm", "Key Size",
            "Risk Score", "Priority", "ML Risk Label", 
            "Recommended PQC", "Migration Timeline", "Code Snippet"
        ])
        
        # Data rows
        for finding in findings:
            writer.writerow([
                finding.file_path,
                finding.line_number,
                finding.algorithm.value,
                finding.key_size or "N/A",
                f"{finding.risk_score:.2f}" if finding.risk_score else "N/A",
                finding.priority or "N/A",
                finding.ai_match.risk_assessment.ml_risk_label.value if finding.ai_match else "N/A",
                finding.recommended_pqc or "N/A",
                finding.ai_match.migration.timeline if finding.ai_match else "N/A",
                finding.code_snippet[:100]
            ])
        
        output.seek(0)
        return output
    
    def generate_json_report(
        self,
        scan_id: str,
        findings: List[EnrichedFinding]
    ) -> dict:
        """Generate JSON report"""
        return {
            "report_metadata": {
                "scan_id": scan_id,
                "generated_at": datetime.now().isoformat(),
                "total_findings": len(findings),
                "ai_matched": sum(1 for f in findings if f.ai_match)
            },
            "statistics": self.ai_service.get_statistics(),
            "findings": [
                {
                    "file_path": f.file_path,
                    "line_number": f.line_number,
                    "algorithm": f.algorithm.value,
                    "key_size": f.key_size,
                    "risk_score": f.risk_score,
                    "priority": f.priority,
                    "recommended_pqc": f.recommended_pqc,
                    "ai_match": f.ai_match.dict() if f.ai_match else None
                }
                for f in findings
            ],
            "top_priorities": [
                r.dict() for r in self.ai_service.get_top_priorities(limit=20)
            ]
        }