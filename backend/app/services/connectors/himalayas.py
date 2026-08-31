import json
import urllib.request
import urllib.parse
from typing import List, Dict, Any, Optional
from datetime import datetime
from .base import BaseJobConnector
from app.services.salary_engine import salary_engine

class HimalayasConnector(BaseJobConnector):
    name = "Himalayas / Remote API"
    source_type = "PUBLIC_API"

    def fetch_jobs(
        self,
        target_role: str,
        min_target_ctc: float = 18.0,
        page: int = 1,
        limit: int = 20,
        related_keywords: Optional[List[str]] = None
    ) -> List[Dict[str, Any]]:
        results = []
        target_lower = target_role.lower()
        search_terms = target_lower.split() + ([k.lower() for k in related_keywords] if related_keywords else [])

        # 1. Query Jobicy Remote Feed
        try:
            url = f"https://jobicy.com/api/v2/remote-jobs?count={limit * 2}"
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})
            with urllib.request.urlopen(req, timeout=2.0) as response:
                if response.status == 200:
                    data = json.loads(response.read().decode("utf-8"))
                    for item in data.get("jobs", []):
                        title = item.get("jobTitle", "")
                        if not self.is_valid_tech_role(title, search_terms):
                            continue

                        company = item.get("companyName", "Remote Innovator")
                        location = item.get("jobGeo", "Global Remote")
                        source_id = str(item.get("id") or "")
                        job_url = item.get("url") or f"https://jobicy.com/jobs/{source_id}"
                        min_s, max_s, sal_str = salary_engine.calculate_realistic_lpa(company, title, min_target_ctc)

                        results.append({
                            "source": "Remote Public API (Jobicy)",
                            "source_job_id": f"rem_jobicy_{source_id}",
                            "company_name": company,
                            "role": title,
                            "location": location,
                            "work_mode": "Remote",
                            "employment_type": item.get("jobType", ["Full-Time"])[0] if isinstance(item.get("jobType"), list) else "Full-time",
                            "min_salary": min_s,
                            "max_salary": max_s,
                            "salary_display": sal_str,
                            "job_url": job_url,
                            "canonical_url": job_url,
                            "description": item.get("jobExcerpt", f"Remote engineering opportunity as {title} at {company}."),
                            "required_skills": ", ".join(item.get("jobSkills", ["Python", "TypeScript", "SQL", "Cloud"])),
                            "preferred_skills": "Docker, Kubernetes, Redis, Microservices",
                            "match_score": 92,
                            "job_hash": self.generate_job_hash(company, title, location, source_id)
                        })
                        if len(results) >= limit:
                            break
        except Exception:
            pass

        # 2. Fallback to RemoteOK if needed
        if len(results) < limit:
            try:
                url = "https://remoteok.com/api"
                req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})
                with urllib.request.urlopen(req, timeout=2.0) as response:
                    if response.status == 200:
                        data = json.loads(response.read().decode("utf-8"))
                        for item in data[1:limit + 5]:
                            if not isinstance(item, dict):
                                continue
                            title = item.get("position", "")
                            if not self.is_valid_tech_role(title, search_terms):
                                continue

                            company = item.get("company", "Remote Tech")
                            location = item.get("location") or "Global Remote"
                            source_id = str(item.get("id") or "")
                            job_url = item.get("url") or f"https://remoteok.com/l/{source_id}"
                            min_s, max_s, sal_str = salary_engine.calculate_realistic_lpa(company, title, min_target_ctc)

                            results.append({
                                "source": "Remote Public API (RemoteOK)",
                                "source_job_id": f"rem_ok_{source_id}",
                                "company_name": company,
                                "role": title,
                                "location": location,
                                "work_mode": "Remote",
                                "employment_type": "Full-time",
                                "min_salary": min_s,
                                "max_salary": max_s,
                                "salary_display": sal_str,
                                "job_url": job_url,
                                "canonical_url": job_url,
                                "description": item.get("description", f"Remote position for {title} at {company}."),
                                "required_skills": ", ".join(item.get("tags", ["Python", "JavaScript", "Cloud"])[:5]),
                                "preferred_skills": "Docker, Kubernetes, Redis",
                                "match_score": 91,
                                "job_hash": self.generate_job_hash(company, title, location, source_id)
                            })
                            if len(results) >= limit:
                                break
            except Exception:
                pass

        return results[:limit]
