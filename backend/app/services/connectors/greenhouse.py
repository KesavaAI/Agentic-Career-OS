import json
import urllib.request
from typing import List, Dict, Any
from concurrent.futures import ThreadPoolExecutor, as_completed
from .base import BaseJobConnector
from app.services.salary_engine import salary_engine

class GreenhouseConnector(BaseJobConnector):
    name = "Greenhouse ATS"
    source_type = "ATS_API"

    POPULAR_BOARDS = ["zepto", "swiggy", "stripe", "airbnb", "figma", "uber", "coinbase"]

    def fetch_jobs(self, target_role: str, min_target_ctc: float = 7.0) -> List[Dict[str, Any]]:
        results = []
        target_lower = target_role.lower()

        def fetch_single_board(board: str):
            board_results = []
            try:
                url = f"https://boards-api.greenhouse.io/v1/boards/{board}/jobs?content=true"
                req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
                with urllib.request.urlopen(req, timeout=1.5) as response:
                    if response.status == 200:
                        data = json.loads(response.read().decode("utf-8"))
                        company_display = board.capitalize()
                        for item in data.get("jobs", [])[:8]:
                            title = item.get("title", "")
                            if not self.is_valid_tech_role(title):
                                continue
                            if any(k in title.lower() for k in target_lower.split() if len(k) > 2) or any(tech in title.lower() for tech in ["engineer", "developer", "full stack", "backend", "ai", "mobile"]):
                                location = item.get("location", {}).get("name", "Bengaluru / Remote")
                                job_url = item.get("absolute_url", f"https://boards.greenhouse.io/{board}")
                                min_s, max_s, sal_str = salary_engine.calculate_realistic_lpa(company_display, title, min_target_ctc)
                                board_results.append({
                                    "company_name": company_display,
                                    "role": title,
                                    "location": location,
                                    "work_mode": "Remote" if "remote" in location.lower() else "Hybrid",
                                    "min_salary": min_s,
                                    "max_salary": max_s,
                                    "salary_display": sal_str,
                                    "job_url": job_url,
                                    "source": f"Greenhouse ATS ({company_display})",
                                    "description": f"Lead technical initiatives as a {title} at {company_display}.",
                                    "required_skills": "Python, React, TypeScript, System Design, SQL, Cloud",
                                    "preferred_skills": "Docker, Kubernetes, Microservices, CI/CD",
                                    "match_score": 94,
                                    "job_hash": self.generate_job_hash(company_display, title, location)
                                })
            except Exception:
                pass
            return board_results

        with ThreadPoolExecutor(max_workers=len(self.POPULAR_BOARDS)) as ex:
            futures = [ex.submit(fetch_single_board, b) for b in self.POPULAR_BOARDS]
            for f in as_completed(futures):
                results.extend(f.result())

        return results
