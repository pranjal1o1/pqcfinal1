"""
Groq API Service for LLM-powered analysis
"""
import os
from typing import Optional, List, Dict, Any
import logging
from groq import Groq
import re

logger = logging.getLogger(__name__)


class GroqService:
    """Service for interacting with Groq API"""
    
    MODELS = {
        "large": "llama-3.3-70b-versatile",
        "medium": "llama-3.1-8b-instant",
        "fast": "llama-3.1-8b-instant",
    }
    
    def __init__(self):
        """Initialize Groq client"""
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            logger.warning("GROQ_API_KEY not found")
            self.client = None
        else:
            self.client = Groq(api_key=api_key)
            logger.info("Groq client initialized successfully")
    
    def is_available(self) -> bool:
        """Check if Groq service is available"""
        return self.client is not None
    
    async def generate_executive_summary(
        self,
        findings: List[Dict[str, Any]],
        scan_metadata: Dict[str, Any],
        company_context: str = "Technology Company"
    ) -> Dict[str, Any]:
        """Generate executive summary using Groq"""
        if not self.is_available():
            raise Exception("Groq service not available. Check GROQ_API_KEY.")
        
        critical_count = sum(1 for f in findings if f.get("ml_risk_label") == "Critical")
        high_count = sum(1 for f in findings if f.get("ml_risk_label") == "High")
        total_findings = len(findings)
        
        algorithms = {}
        for f in findings:
            alg = f.get("algorithm", "Unknown")
            algorithms[alg] = algorithms.get(alg, 0) + 1
        
        prompt = f"""Generate an executive summary for a cryptographic vulnerability scan.

CONTEXT:
- Industry: {company_context}
- Total Vulnerabilities: {total_findings}
- Critical: {critical_count}
- High: {high_count}
- Algorithms: {', '.join([f"{k}({v})" for k, v in algorithms.items()])}

Respond in this format:

## SUMMARY
[2-3 paragraphs explaining threat, findings, and impact]

## KEY_RISKS
- [Risk 1]
- [Risk 2]
- [Risk 3]

## RECOMMENDATIONS
- [Recommendation 1]
- [Recommendation 2]
- [Recommendation 3]

## TIMELINE
[Suggested timeline]

## COST
[Cost estimate]"""

        try:
            chat_completion = self.client.chat.completions.create(
                messages=[
                    {"role": "system", "content": "You are a cybersecurity advisor."},
                    {"role": "user", "content": prompt}
                ],
                model=self.MODELS["large"],
                temperature=0.5,
                max_tokens=2048
            )
            
            response_text = chat_completion.choices[0].message.content
            logger.info(f"Executive summary generated: {len(response_text)} chars")
            return self._parse_executive_summary(response_text)
            
        except Exception as e:
            logger.error(f"Groq API error: {e}")
            raise Exception(f"Failed to generate executive summary: {str(e)}")
    
    async def answer_question(
        self,
        question: str,
        scan_context: Dict[str, Any],
        include_technical: bool = False
    ) -> Dict[str, str]:
        """Answer user questions about scan results"""
        if not self.is_available():
            raise Exception("Groq service not available.")
        
        total_findings = scan_context.get("total_findings", 0)
        critical_count = scan_context.get("critical_count", 0)
        algorithms = scan_context.get("algorithms", {})
        
        technical_note = "Include technical details." if include_technical else "Use simple language."
        
        prompt = f"""Answer this question about a vulnerability scan.

Scan Context:
- Total Findings: {total_findings}
- Critical: {critical_count}
- Algorithms: {', '.join([f"{k}({v})" for k, v in algorithms.items()])}

Question: {question}

Instructions: {technical_note} Be specific and actionable.

Answer:"""

        try:
            chat_completion = self.client.chat.completions.create(
                messages=[
                    {"role": "system", "content": "You are a helpful cybersecurity assistant."},
                    {"role": "user", "content": prompt}
                ],
                model=self.MODELS["fast"],
                temperature=0.5,
                max_tokens=800
            )
            
            answer = chat_completion.choices[0].message.content.strip()
            logger.info(f"Question answered: {len(answer)} chars")
            
            return {
                "answer": answer,
                "confidence": "high" if critical_count > 0 else "medium"
            }
            
        except Exception as e:
            logger.error(f"Groq API error: {e}")
            raise Exception(f"Failed to answer question: {str(e)}")
    
    async def explain_finding(
        self,
        finding: Dict[str, Any],
        explanation_level: str = "executive"
    ) -> Dict[str, Any]:
        """Explain a specific finding in detail"""
        if not self.is_available():
            raise Exception("Groq service not available.")
        
        algorithm = finding.get("algorithm", "Unknown")
        key_size = finding.get("key_size", "N/A")
        risk_score = finding.get("risk_score", "N/A")
        code = finding.get("code_snippet", "No code")
        pqc = finding.get("recommended_pqc", "Not specified")
        file_path = finding.get("file_path", "Unknown")
        
        level_map = {
            "executive": "Use simple business language. Focus on risk and impact.",
            "technical": "Include technical details but keep it accessible.",
            "developer": "Provide detailed technical explanation with code examples."
        }
        
        instruction = level_map.get(explanation_level, level_map["executive"])
        
        prompt = f"""Explain this cryptographic vulnerability ({explanation_level} level):

FINDING:
- Algorithm: {algorithm}
- Key Size: {key_size} bits
- Risk Score: {risk_score}/100
- File: {file_path}
- Code: {code}
- Recommended Fix: {pqc}

Instructions: {instruction}

Respond in this exact format:

## EXPLANATION
[Explain what this vulnerability is and why it matters]

## BUSINESS_IMPACT
[Describe business consequences if not fixed]

## ACTION_ITEMS
- [Specific action 1]
- [Specific action 2]
- [Specific action 3]
- [Specific action 4]
- [Specific action 5]

## MIGRATION_GUIDE
[Brief guidance on migrating to {pqc}]"""

        try:
            logger.info(f"Explaining finding: {algorithm} at {explanation_level} level")
            
            chat_completion = self.client.chat.completions.create(
                messages=[
                    {"role": "system", "content": "You are a cybersecurity expert explaining vulnerabilities."},
                    {"role": "user", "content": prompt}
                ],
                model=self.MODELS["large"],
                temperature=0.5,
                max_tokens=1500
            )
            
            response = chat_completion.choices[0].message.content
            logger.info(f"Explanation generated: {len(response)} chars")
            
            parsed = self._parse_finding_explanation(response)
            
            logger.info(f"Parsed - explanation: {len(parsed['explanation'])} chars, "
                       f"impact: {len(parsed['business_impact'])} chars, "
                       f"actions: {len(parsed['action_items'])} items")
            
            return parsed
            
        except Exception as e:
            logger.error(f"Groq API error: {e}")
            raise Exception(f"Failed to explain finding: {str(e)}")
    
    def _parse_executive_summary(self, response: str) -> Dict[str, Any]:
        """Parse executive summary from Groq response"""
        result = {
            "summary": "",
            "key_risks": [],
            "recommendations": [],
            "timeline_summary": "",
            "estimated_cost": ""
        }
        
        # Extract summary section
        summary_pattern = r'#{0,3}\s*SUMMARY[:\s]+(.*?)(?=#{0,3}\s*KEY|$)'
        summary_match = re.search(summary_pattern, response, re.DOTALL | re.IGNORECASE)
        if summary_match:
            result["summary"] = summary_match.group(1).strip()
        
        # Extract key risks
        risks_pattern = r'#{0,3}\s*KEY[_\s]RISKS[:\s]+(.*?)(?=#{0,3}\s*RECOMMENDATIONS|$)'
        risks_match = re.search(risks_pattern, response, re.DOTALL | re.IGNORECASE)
        if risks_match:
            risks_text = risks_match.group(1)
            result["key_risks"] = [
                line.strip('- •*').strip() 
                for line in risks_text.split('\n') 
                if line.strip() and line.strip()[0] in '-•*'
            ]
        
        # Extract recommendations
        rec_pattern = r'#{0,3}\s*RECOMMENDATIONS[:\s]+(.*?)(?=#{0,3}\s*TIMELINE|$)'
        rec_match = re.search(rec_pattern, response, re.DOTALL | re.IGNORECASE)
        if rec_match:
            rec_text = rec_match.group(1)
            result["recommendations"] = [
                line.strip('- •*').strip() 
                for line in rec_text.split('\n') 
                if line.strip() and line.strip()[0] in '-•*'
            ]
        
        # Extract timeline
        timeline_pattern = r'#{0,3}\s*TIMELINE[:\s]+(.*?)(?=#{0,3}\s*COST|$)'
        timeline_match = re.search(timeline_pattern, response, re.DOTALL | re.IGNORECASE)
        if timeline_match:
            result["timeline_summary"] = timeline_match.group(1).strip()
        
        # Extract cost
        cost_pattern = r'#{0,3}\s*COST[:\s]+(.*?)$'
        cost_match = re.search(cost_pattern, response, re.DOTALL | re.IGNORECASE)
        if cost_match:
            result["estimated_cost"] = cost_match.group(1).strip()
        
        return result
    
    def _parse_finding_explanation(self, response: str) -> Dict[str, Any]:
        """Parse finding explanation from Groq response"""
        result = {
            "explanation": "",
            "business_impact": "",
            "action_items": [],
            "migration_guide": ""
        }
        
        # Extract explanation
        exp_pattern = r'#{0,3}\s*EXPLANATION[:\s]+(.*?)(?=#{0,3}\s*BUSINESS|$)'
        exp_match = re.search(exp_pattern, response, re.DOTALL | re.IGNORECASE)
        if exp_match:
            result["explanation"] = exp_match.group(1).strip()
        
        # Extract business impact
        impact_pattern = r'#{0,3}\s*BUSINESS[_\s]IMPACT[:\s]+(.*?)(?=#{0,3}\s*ACTION|$)'
        impact_match = re.search(impact_pattern, response, re.DOTALL | re.IGNORECASE)
        if impact_match:
            result["business_impact"] = impact_match.group(1).strip()
        
        # Extract action items
        actions_pattern = r'#{0,3}\s*ACTION[_\s]ITEMS[:\s]+(.*?)(?=#{0,3}\s*MIGRATION|$)'
        actions_match = re.search(actions_pattern, response, re.DOTALL | re.IGNORECASE)
        if actions_match:
            actions_text = actions_match.group(1)
            result["action_items"] = [
                line.strip('- •*0123456789. ').strip() 
                for line in actions_text.split('\n') 
                if line.strip() and line.strip()[0] in '-•*'
            ]
        
        # Extract migration guide
        guide_pattern = r'#{0,3}\s*MIGRATION[_\s]GUIDE[:\s]+(.*?)$'
        guide_match = re.search(guide_pattern, response, re.DOTALL | re.IGNORECASE)
        if guide_match:
            result["migration_guide"] = guide_match.group(1).strip()
        
        return result


# Global instance - MUST be at the end of file
groq_service = GroqService()