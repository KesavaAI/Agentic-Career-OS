import json
import urllib.request
from typing import List, Dict, Any
from .base import BaseJobConnector
from app.services.salary_engine import salary_engine

class HimalayasConnector(BaseJobConnector):
    name = "Himalayas Public API"
    source_type = "PUBLIC_API"

    def fetch_jobs(self, target_role: str, min_target_ctc: float = 7.0) -> List[Dict[str, Any]]:
        results = []
        target_lower = target_role.lower()

        try:
            url = "https://himalayas.app/api/jobs?limit=15"
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req, timeout=1.5) as response:
                if response.status == 200:
                    data = json.loads(response.read().decode("utf-8"))
                    for item in data.get("jobs", []):
                        title = item.get("title", "")
                        if not self.is_valid_tech_role(title):
                            continue

                        company = item.get("companyName", "Tech Innovator")
                        location = item.get("location", "Global Remote")
                        job_url = item.get("applicationUrl") or item.get("url") or "https://himalayas.app"
                        min_s, max_s, sal_str = salary_engine.calculate_realistic_lpa(company, title, min_target_ctc)

                        results.append({
                            "company_name": company,
                            "role": title,
                            "location": location,
                            "work_mode": "Remote",
                            "min_salary": min_s,
                            "max_salary": max_s,
                            "salary_display": sal_str,
                            "job_url": job_url,
                            "source": "Himalayas Remote API",
                            "description": item.get("excerpt", f"Remote engineering opportunity as {title} at {company}."),
                            "required_skills": "Python, React, TypeScript, Cloud, Docker, APIs",
                            "preferred_skills": "PostgreSQL, CI/CD, Redis",
                            "match_score": 92,
                            "job_hash": self.generate_job_hash(company, title, location)
                        })
        except Exception:
            pass

        return results
