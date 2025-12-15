"""
Service for loading and managing Kaggle AI output files
"""
import json
import pandas as pd
from pathlib import Path
from typing import Dict, List, Optional
import logging

from app.schemas import AIRiskRecord, FeatureImportance, SHAPData

logger = logging.getLogger(__name__)

class AIResultsService:
    """Manages loading and access to pre-generated AI results"""
    
    def __init__(self, ai_outputs_dir: str = "ai_outputs"):
        self.ai_outputs_dir = Path(ai_outputs_dir)
        self.risk_data: List[AIRiskRecord] = []
        self.risk_lookup: Dict[str, AIRiskRecord] = {}
        self.shap_features: List[FeatureImportance] = []
        self.metadata: Dict = {}
        self.available_plots: List[str] = []
        
    async def load_ai_results(self):
        """Load all AI results from Kaggle outputs"""
        try:
            # Load risk_output.json
            self._load_risk_json()
            
            # Load SHAP feature importance
            self._load_shap_features()
            
            # Discover available plot files
            self._discover_plots()
            
            logger.info(f"AI results loaded successfully: {len(self.risk_data)} records")
            
        except Exception as e:
            logger.error(f"Error loading AI results: {e}")
            raise
    
    def _load_risk_json(self):
        """Load risk_output.json"""
        risk_file = self.ai_outputs_dir / "risk_output.json"
        
        if not risk_file.exists():
            raise FileNotFoundError(f"AI risk output not found: {risk_file}")
        
        with open(risk_file, 'r') as f:
            data = json.load(f)
        
        # Store metadata
        self.metadata = data.get("metadata", {})
        
        # Parse vulnerabilities
        for vuln in data.get("vulnerabilities", []):
            try:
                risk_record = AIRiskRecord(**vuln)
                self.risk_data.append(risk_record)
                
                # Create lookup key: algorithm-keysize
                lookup_key = f"{risk_record.current_config.algorithm}-{risk_record.current_config.key_size}"
                self.risk_lookup[lookup_key] = risk_record
                
            except Exception as e:
                logger.warning(f"Failed to parse vulnerability {vuln.get('id')}: {e}")
        
        logger.info(f"Loaded {len(self.risk_data)} AI risk records")
    
    def _load_shap_features(self):
        """Load SHAP feature importance"""
        shap_file = self.ai_outputs_dir / "shap_feature_importance.csv"
        
        if not shap_file.exists():
            logger.warning(f"SHAP features file not found: {shap_file}")
            return
        
        try:
            df = pd.read_csv(shap_file)
            self.shap_features = [
                FeatureImportance(
                    feature=row['feature'],
                    mean_abs_shap=float(row['mean_abs_shap'])
                )
                for _, row in df.iterrows()
            ]
            logger.info(f"Loaded {len(self.shap_features)} SHAP features")
        except Exception as e:
            logger.error(f"Error loading SHAP features: {e}")
    
    def _discover_plots(self):
        """Discover available plot files"""
        plot_extensions = ['.png', '.jpg', '.jpeg']
        
        for file in self.ai_outputs_dir.iterdir():
            if file.is_file() and file.suffix.lower() in plot_extensions:
                self.available_plots.append(file.name)
        
        logger.info(f"Found {len(self.available_plots)} plot files")
    
    def match_finding(self, algorithm: str, key_size: Optional[int]) -> Optional[AIRiskRecord]:
        """
        Match a scan finding with AI risk data
        
        Args:
            algorithm: Crypto algorithm (RSA, ECC, DH, etc.)
            key_size: Key size in bits
            
        Returns:
            Matched AIRiskRecord or None
        """
        if not key_size:
            return None
        
        lookup_key = f"{algorithm}-{key_size}"
        return self.risk_lookup.get(lookup_key)
    
    def get_top_priorities(self, limit: int = 10) -> List[AIRiskRecord]:
        """Get top priority vulnerabilities"""
        sorted_risks = sorted(self.risk_data, key=lambda x: x.priority_rank)
        return sorted_risks[:limit]
    
    def get_by_risk_level(self, level: str) -> List[AIRiskRecord]:
        """Get all vulnerabilities by risk level"""
        return [
            r for r in self.risk_data 
            if r.risk_assessment.ml_risk_label.value == level
        ]
    
    def get_statistics(self) -> Dict:
        """Get summary statistics"""
        total = len(self.risk_data)
        
        risk_counts = {
            "Critical": 0,
            "High": 0,
            "Medium": 0,
            "Low": 0
        }
        
        algorithm_counts = {}
        pqc_recommendations = {}
        timeline_counts = {}
        
        for record in self.risk_data:
            # Risk level counts
            level = record.risk_assessment.ml_risk_label.value
            risk_counts[level] = risk_counts.get(level, 0) + 1
            
            # Algorithm distribution
            algo = record.current_config.algorithm
            algorithm_counts[algo] = algorithm_counts.get(algo, 0) + 1
            
            # PQC recommendations
            pqc = record.recommendation.recommended_pqc
            pqc_recommendations[pqc] = pqc_recommendations.get(pqc, 0) + 1
            
            # Timeline distribution
            timeline = record.migration.timeline
            timeline_counts[timeline] = timeline_counts.get(timeline, 0) + 1
        
        return {
            "total_vulnerabilities": total,
            "risk_distribution": risk_counts,
            "algorithm_distribution": algorithm_counts,
            "pqc_recommendations": pqc_recommendations,
            "migration_timelines": timeline_counts,
            "model_accuracy": self.metadata.get("model_accuracy", 0.0)
        }
    
    def get_shap_data(self) -> SHAPData:
        """Get SHAP feature importance data"""
        return SHAPData(
            features=self.shap_features,
            available_plots=self.available_plots
        )