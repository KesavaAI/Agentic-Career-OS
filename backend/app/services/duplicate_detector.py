import re
from typing import Dict, Any, List

class DuplicateDetector:
    @staticmethod
    def check_duplicate(new_job: Dict[str, Any], existing_jobs: List[Dict[str, Any]]) -> Dict[str, Any]:
        new_url = (new_job.get("job_url") or "").strip().lower()
        new_comp = (new_job.get("company_name") or "").strip().lower()
        new_role = (new_job.get("role") or "").strip().lower()
        
        for job in existing_jobs:
            exist_url = (job.get("job_url") or "").strip().lower()
            exist_comp = (job.get("company_name") or "").strip().lower()
            exist_role = (job.get("role") or "").strip().lower()
            
            if new_url and exist_url and new_url == exist_url:
                return {"is_duplicate": True, "duplicate_id": job.get("id"), "reason": "Identical Job URL"}
            
            if new_comp and exist_comp and new_comp == exist_comp:
                if new_role and exist_role and (new_role in exist_role or exist_role in new_role):
                    return {"is_duplicate": True, "duplicate_id": job.get("id"), "reason": f"Same company ({exist_comp}) and matching role ({exist_role})"}
                    
        return {"is_duplicate": False, "duplicate_id": None, "reason": None}

duplicate_detector = DuplicateDetector()
