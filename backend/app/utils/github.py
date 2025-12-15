"""
Utilities for cloning and processing GitHub repositories
"""
import subprocess
from pathlib import Path
import logging

logger = logging.getLogger(__name__)

def clone_repository(repo_url: str, target_dir: Path, branch: str = "main") -> Path:
    """
    Clone a GitHub repository
    
    Args:
        repo_url: GitHub repository URL
        target_dir: Directory to clone into
        branch: Branch to clone (default: main)
        
    Returns:
        Path to cloned repository
    """
    repo_name = repo_url.rstrip('/').split('/')[-1].replace('.git', '')
    repo_path = target_dir / repo_name
    
    try:
        logger.info(f"Cloning {repo_url} (branch: {branch}) to {repo_path}")
        
        # Clone with depth 1 for faster cloning
        cmd = [
            'git', 'clone',
            '--depth', '1',
            '--branch', branch,
            repo_url,
            str(repo_path)
        ]
        
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=300  # 5 minute timeout
        )
        
        if result.returncode != 0:
            raise Exception(f"Git clone failed: {result.stderr}")
        
        logger.info(f"Successfully cloned repository to {repo_path}")
        return repo_path
    
    except subprocess.TimeoutExpired:
        raise Exception("Repository clone timed out after 5 minutes")
    except Exception as e:
        logger.error(f"Failed to clone repository: {e}")
        raise

def is_valid_github_url(url: str) -> bool:
    """Check if URL is a valid GitHub repository URL"""
    valid_patterns = [
        'github.com/',
        'https://github.com/',
        'git@github.com:'
    ]
    return any(pattern in url for pattern in valid_patterns)