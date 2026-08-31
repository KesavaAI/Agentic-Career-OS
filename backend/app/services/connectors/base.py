import hashlib
import time
from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from datetime import datetime

class BaseJobConnector(ABC):
    """
    Abstract Base Class for zero-cost ATS & Public Job Connectors.
    All connectors return standardized NormalizedJob dictionaries with full lifecycle metadata.
    """
    name: str = "BaseConnector"
    source_type: str = "PUBLIC_API"  # ATS_API, PUBLIC_API, AGGREGATOR

    @abstractmethod
    def fetch_jobs(
        self,
        target_role: str,
        min_target_ctc: float = 18.0,
        page: int = 1,
        limit: int = 20,
        related_keywords: Optional[List[str]] = None
    ) -> List[Dict[str, Any]]:
        pass

    @staticmethod
    def generate_job_hash(company_name: str, role: str, location: str = "", source_id: str = "") -> str:
        raw = f"{company_name.strip().lower()}:::{role.strip().lower()}:::{location.strip().lower()}:::{source_id.strip()}"
        return hashlib.sha256(raw.encode("utf-8")).hexdigest()

    @staticmethod
    def is_valid_tech_role(title: str, target_keywords: Optional[List[str]] = None) -> bool:
        t = title.lower()
        NON_TECH_BLACKLIST = [
            "copywriter", "writer", "sales", "assistant", "reviewer", "collection", 
            "graphic designer", "support jedi", "sales jedi", "sales rep", "bdr", "sdr",
            "office assistant", "content reviewer", "inside sales", "telemarketer", 
            "recruiter", "talent acquisition", "accountant", "legal counsel", "paralegal", 
            "business development", "marketing specialist", "seo specialist", "cook", "driver"
        ]
        if any(bad in t for bad in NON_TECH_BLACKLIST):
            return False

        VALID_TECH_KEYWORDS = [
            "developer", "engineer", "architect", "lead", "programmer", "full stack", 
            "fullstack", "frontend", "backend", "devops", "sre", "data", "ai", "ml", 
            "qa", "sdet", "cloud", "software", "infrastructure", "platform", "systems",
            "security", "analyst", "designer", "product", "cyber", "database", "embedded",
            "firmware", "mobile", "ios", "android", "machine learning", "deep learning"
        ]
        
        if target_keywords:
            for kw in target_keywords:
                if kw.lower() in t:
                    return True

        return any(tech in t for tech in VALID_TECH_KEYWORDS)
