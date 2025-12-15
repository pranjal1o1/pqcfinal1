"""
Service for scanning source code for cryptographic usage
"""
import re
from pathlib import Path
from typing import List, Dict, Tuple
import logging

from app.schemas import CryptoFinding, AlgorithmType

logger = logging.getLogger(__name__)

class CryptoScanner:
    """Scans source code for cryptographic algorithm usage"""
    
    # Crypto detection patterns
    PATTERNS = {
        "RSA": [
            r"RSA(?:_PKCS1)?",
            r"RSA-(\d+)",
            r"RSAPrivateKey",
            r"RSAPublicKey",
            r"rsa\.generate_private_key",
            r"Crypto\.PublicKey\.RSA"
        ],
        "ECC": [
            r"ECDSA",
            r"ECDH",
            r"secp\d+[rk]\d+",
            r"prime256v1",
            r"P-256",
            r"P-384",
            r"P-521",
            r"elliptic[\s\-]?curve",
            r"ec\.generate_private_key"
        ],
        "DH": [
            r"DiffieHellman",
            r"DHE?[\s\-]",
            r"dh\.generate_parameters",
            r"DHParameters"
        ],
        "AES": [
            r"AES(?:-(\d+))?",
            r"Advanced\s+Encryption\s+Standard",
            r"Crypto\.Cipher\.AES"
        ],
        "SHA1": [
            r"SHA-?1(?:\b|[^0-9])",
            r"sha1\(",
            r"hashlib\.sha1"
        ]
    }
    
    # Key size extraction patterns
    KEY_SIZE_PATTERNS = {
        "RSA": r"(?:RSA-?|key_size=|bits=)(\d{3,4})",
        "ECC": r"(?:secp|P-)(\d+)",
        "DH": r"(?:DH-?|key_size=)(\d{3,4})",
        "AES": r"AES-?(\d{3})"
    }
    
    # File extensions to scan
    SUPPORTED_EXTENSIONS = {
        '.py', '.java', '.js', '.ts', '.cpp', '.c', '.h', '.hpp',
        '.cs', '.go', '.rs', '.rb', '.php', '.swift', '.kt'
    }
    
    def __init__(self):
        self.compiled_patterns = self._compile_patterns()
    
    def _compile_patterns(self) -> Dict[str, List[re.Pattern]]:
        """Pre-compile regex patterns for performance"""
        compiled = {}
        for algo, patterns in self.PATTERNS.items():
            compiled[algo] = [re.compile(p, re.IGNORECASE) for p in patterns]
        return compiled
    
    def scan_directory(self, directory: Path) -> Tuple[List[CryptoFinding], int]:
        """
        Scan directory recursively for crypto usage
        
        Returns:
            Tuple of (findings, total_files_scanned)
        """
        findings = []
        files_scanned = 0
        
        try:
            for file_path in directory.rglob('*'):
                if file_path.is_file() and file_path.suffix in self.SUPPORTED_EXTENSIONS:
                    try:
                        file_findings = self.scan_file(file_path)
                        findings.extend(file_findings)
                        files_scanned += 1
                    except Exception as e:
                        logger.warning(f"Error scanning {file_path}: {e}")
        
        except Exception as e:
            logger.error(f"Error scanning directory {directory}: {e}")
            raise
        
        return findings, files_scanned
    
    def scan_file(self, file_path: Path) -> List[CryptoFinding]:
        """Scan single file for crypto usage"""
        findings = []
        
        try:
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                lines = f.readlines()
            
            for line_num, line in enumerate(lines, start=1):
                # Check each algorithm pattern
                for algo, patterns in self.compiled_patterns.items():
                    for pattern in patterns:
                        if pattern.search(line):
                            # Extract key size if possible
                            key_size = self._extract_key_size(algo, line)
                            
                            finding = CryptoFinding(
                                file_path=str(file_path),
                                line_number=line_num,
                                algorithm=AlgorithmType[algo],
                                key_size=key_size,
                                code_snippet=line.strip()[:200],  # Limit snippet length
                                module_name=self._extract_module(file_path)
                            )
                            findings.append(finding)
                            break  # Found one algo, move to next line
        
        except Exception as e:
            logger.error(f"Error reading file {file_path}: {e}")
        
        return findings
    
    def _extract_key_size(self, algorithm: str, line: str) -> int:
        """Extract key size from code line"""
        if algorithm not in self.KEY_SIZE_PATTERNS:
            return None
        
        pattern = re.compile(self.KEY_SIZE_PATTERNS[algorithm], re.IGNORECASE)
        match = pattern.search(line)
        
        if match:
            try:
                return int(match.group(1))
            except (ValueError, IndexError):
                pass
        
        # Default key sizes if not found
        defaults = {
            "RSA": 2048,
            "ECC": 256,
            "DH": 2048,
            "AES": 128
        }
        return defaults.get(algorithm)
    
    def _extract_module(self, file_path: Path) -> str:
        """Extract module/package name from file path"""
        parts = file_path.parts
        
        # Try to find common package indicators
        for i, part in enumerate(parts):
            if part in ['src', 'lib', 'pkg', 'app', 'modules']:
                if i + 1 < len(parts):
                    return parts[i + 1]
        
        # Fallback to parent directory
        return file_path.parent.name if file_path.parent else "unknown"
    
    def get_summary(self, findings: List[CryptoFinding]) -> Dict[str, int]:
        """Generate summary statistics from findings"""
        summary = {
            "total_findings": len(findings),
            "RSA": 0,
            "ECC": 0,
            "DH": 0,
            "AES": 0,
            "SHA1": 0,
            "UNKNOWN": 0
        }
        
        for finding in findings:
            algo = finding.algorithm.value
            summary[algo] = summary.get(algo, 0) + 1
        
        return summary