"""
Service for correlating scan findings with AI risk data
"""
from typing import List
import logging

from app.schemas import CryptoFinding, EnrichedFinding, AIRiskRecord
from app.services.ai_results_service import AIResultsService

logger = logging.getLogger(__name__)

class CorrelationService:
    """Correlates scan findings with AI-generated risk assessments"""
    
    def __init__(self, ai_service: AIResultsService):
        self.ai_service = ai_service
    
    def enrich_findings(self, findings: List[CryptoFinding]) -> List[EnrichedFinding]:
        """
        Enrich scan findings with AI risk data
        
        Args:
            findings: List of crypto findings from scanner
            
        Returns:
            List of enriched findings with AI correlation
        """
        enriched = []
        
        for finding in findings:
            # Match with AI data
            ai_match = self.ai_service.match_finding(
                algorithm=finding.algorithm.value,
                key_size=finding.key_size
            )
            
            # Create enriched finding
            enriched_finding = EnrichedFinding(
                **finding.dict(),
                ai_match=ai_match,
                risk_score=ai_match.risk_assessment.risk_score if ai_match else None,
                priority=ai_match.priority_rank if ai_match else None,
                recommended_pqc=ai_match.recommendation.recommended_pqc if ai_match else None
            )
            
            enriched.append(enriched_finding)
            
            if ai_match:
                logger.debug(
                    f"Matched {finding.algorithm.value}-{finding.key_size} "
                    f"with AI risk {ai_match.id} (priority: {ai_match.priority_rank})"
                )
        
        # Sort by priority (matched findings first, then by priority rank)
        enriched.sort(
            key=lambda x: (x.priority is None, x.priority if x.priority else 999999)
        )
        
        return enriched
    
    def get_correlation_stats(self, findings: List[EnrichedFinding]) -> dict:
        """Get statistics about AI correlation"""
        total = len(findings)
        matched = sum(1 for f in findings if f.ai_match is not None)
        
        critical = sum(
            1 for f in findings 
            if f.ai_match and f.ai_match.risk_assessment.ml_risk_label.value == "Critical"
        )
        
        high = sum(
            1 for f in findings 
            if f.ai_match and f.ai_match.risk_assessment.ml_risk_label.value == "High"
        )
        
        return {
            "total_findings": total,
            "ai_matched": matched,
            "match_rate": matched / total if total > 0 else 0,
            "critical_risks": critical,
            "high_risks": high,
            "unmatched": total - matched
        }