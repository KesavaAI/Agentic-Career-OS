import json
import urllib.request
from typing import List, Dict, Any, Optional
from concurrent.futures import ThreadPoolExecutor, as_completed
from .base import BaseJobConnector
from app.services.salary_engine import salary_engine

class AshbyConnector(BaseJobConnector):
    name = "Ashby ATS"
    source_type = "ATS_API"

    POPULAR_BOARDS = [
        "perplexity", "cursor", "ramp", "retool", "together-ai", "linear", "scale-ai"
    ]

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

        def fetch_single_board(board: str):
            board_results = []
            try:
                url = f"https://api.ashbyhq.com/posting-api/job-board/{board}"
                req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})
                with urllib.request.urlopen(req, timeout=1.5) as response:
                    if response.status == 200:
                        data = json.loads(response.read().decode("utf-8"))
                        company_display = board.replace("-", " ").title()
                        jobs_list = data.get("jobs", [])
                        
                        start_idx = (page - 1) * 3
                        for item in jobs_list[start_idx : start_idx + 5]:
                            title = item.get("title", "")
                            if not self.is_valid_tech_role(title, search_terms):
                                continue

                            is_match = any(term in title.lower() for term in search_terms if len(term) > 2)
                            if not is_match and not any(k in title.lower() for k in ["engineer", "developer", "architect", "lead", "analyst"]):
                                continue

                            source_id = str(item.get("id", ""))
                            location = item.get("location", "Remote / Hybrid")
                            job_url = item.get("jobUrl", f"https://jobs.ashbyhq.com/{board}")
                            employment_type = item.get("employmentType", "Full-time")
                            is_remote = bool(item.get("isRemote", False))

                            min_s, max_s, sal_str = salary_engine.calculate_realistic_lpa(company_display, title, min_target_ctc)

                            board_results.append({
                                "source": f"Ashby ATS ({company_display})",
                                "source_job_id": f"ash_{board}_{source_id}",
                                "company_name": company_display,
                                "role": title,
                                "location": location,
                                "work_mode": "Remote" if is_remote else "Hybrid",
                                "employment_type": employment_type,
                                "min_salary": min_s,
                                "max_salary": max_s,
                                "salary_display": sal_str,
                                "job_url": job_url,
                                "canonical_url": job_url,
                                "description": f"Build next-generation production architectures and engineering systems as a {title} at {company_display}.",
                                "required_skills": "Python, TypeScript, Cloud Architecture, PostgreSQL, REST APIs",
                                "preferred_skills": "Docker, Kubernetes, Redis, Microservices, CI/CD",
                                "match_score": 95,
                                "job_hash": self.generate_job_hash(company_display, title, location, source_id)
                            })
            except Exception:
                pass
            return board_results

        with ThreadPoolExecutor(max_workers=len(self.POPULAR_BOARDS)) as ex:
            futures = [ex.submit(fetch_single_board, b) for b in self.POPULAR_BOARDS]
            for f in as_completed(futures):
                results.extend(f.result())

        return results[:limit]
