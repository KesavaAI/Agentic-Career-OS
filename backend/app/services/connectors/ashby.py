import json
import urllib.request
from typing import List, Dict, Any
from concurrent.futures import ThreadPoolExecutor, as_completed
from .base import BaseJobConnector
from app.services.salary_engine import salary_engine

class AshbyConnector(BaseJobConnector):
    name = "Ashby ATS"
    source_type = "ATS_API"

    POPULAR_BOARDS = ["perplexity", "cursor", "ramp", "retool", "together-ai"]

    def fetch_jobs(self, target_role: str, min_target_ctc: float = 7.0) -> List[Dict[str, Any]]:
        results = []
        target_lower = target_role.lower()

        def fetch_single_board(board: str):
            board_results = []
            try:
                url = f"https://api.ashbyhq.com/posting-api/job-board/{board}"
                req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
                with urllib.request.urlopen(req, timeout=1.5) as response:
                    if response.status == 200:
                        data = json.loads(response.read().decode("utf-8"))
                        company_display = board.replace("-", " ").title()
                        for item in data.get("jobs", [])[:8]:
                            title = item.get("title", "")
                            if not self.is_valid_tech_role(title):
                                continue
                            location = item.get("location", "Remote / Hybrid")
                            job_url = item.get("jobUrl", f"https://jobs.ashbyhq.com/{board}")
                            min_s, max_s, sal_str = salary_engine.calculate_realistic_lpa(company_display, title, min_target_ctc)
                            board_results.append({
                                "company_name": company_display,
                                "role": title,
                                "location": location,
                                "work_mode": "Remote" if item.get("isRemote") else "Hybrid",
                                "min_salary": min_s,
                                "max_salary": max_s,
                                "salary_display": sal_str,
                                "job_url": job_url,
                                "source": f"Ashby ATS ({company_display})",
                                "description": f"Build next-generation capabilities as a {title} at {company_display}.",
                                "required_skills": "Python, TypeScript, LLMs, Vector Databases, Fast APIs, React",
                                "preferred_skills": "LangGraph, PyTorch, Kubernetes, Microservices",
                                "match_score": 95,
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
