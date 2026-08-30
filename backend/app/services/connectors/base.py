import hashlib
from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from datetime import datetime

class BaseJobConnector(ABC):
    """
    Abstract Base Class for zero-cost ATS & Public Job Connectors.
    All connectors return standardized NormalizedJob dictionaries.
    """
    name: str = "BaseConnector"
    source_type: str = "PUBLIC_API"  # ATS_API, PUBLIC_API, AGGREGATOR

    @abstractmethod
    def fetch_jobs(self, target_role: str, min_target_ctc: float = 18.0) -> List[Dict[str, Any]]:
        pass

    @staticmethod
    def generate_job_hash(company_name: str, role: str, location: str = "") -> str:
        raw = f"{company_name.strip().lower()}:::{role.strip().lower()}:::{location.strip().lower()}"
        return hashlib.sha256(raw.encode("utf-8")).hexdigest()

    @staticmethod
    def is_valid_tech_role(title: str) -> bool:
        t = title.lower()
        NON_TECH_BLACKLIST = [
            "copywriter", "writer", "sales", "assistant", "reviewer", "collection", 
            "graphic designer", "designer", "support jedi", "sales jedi", 
            "office assistant", "content reviewer", "inside sales", "telemarketer", 
            "recruiter", "accountant", "legal", "business development", "marketing"
        ]
        VALID_TECH_KEYWORDS = [
            "developer", "engineer", "architect", "lead", "programmer", "full stack", 
            "fullstack", "frontend", "backend", "devops", "sre", "data", "ai", "ml", 
            "qa", "sdet", "cloud", "software", "infrastructure", "platform", "systems"
        ]
        if any(bad in t for bad in NON_TECH_BLACKLIST):
            return False
        return any(tech in t for tech in VALID_TECH_KEYWORDS)
