import json
import urllib.request
from typing import List, Dict, Any
from concurrent.futures import ThreadPoolExecutor, as_completed
from .base import BaseJobConnector
from app.services.salary_engine import salary_engine

class LeverConnector(BaseJobConnector):
    name = "Lever ATS"
    source_type = "ATS_API"

    POPULAR_BOARDS = ["razorpay", "postman", "atlassian", "plaid", "spotify"]

    def fetch_jobs(self, target_role: str, min_target_ctc: float = 7.0) -> List[Dict[str, Any]]:
        results = []
        target_lower = target_role.lower()

        def fetch_single_board(board: str):
            board_results = []
            try:
                url = f"https://api.lever.co/v0/postings/{board}?mode=json"
                req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
                with urllib.request.urlopen(req, timeout=1.5) as response:
                    if response.status == 200:
                        data = json.loads(response.read().decode("utf-8"))
                        company_display = board.capitalize()
                        for item in data[:8]:
                            title = item.get("text", "")
                            if not self.is_valid_tech_role(title):
                                continue
                            cats = item.get("categories", {})
                            location = cats.get("location", "Bengaluru / Remote")
                            job_url = item.get("hostedUrl", f"https://jobs.lever.co/{board}")
                            min_s, max_s, sal_str = salary_engine.calculate_realistic_lpa(company_display, title, min_target_ctc)
                            board_results.append({
                                "company_name": company_display,
                                "role": title,
                                "location": location,
                                "work_mode": cats.get("workplaceType", "Hybrid"),
                                "min_salary": min_s,
                                "max_salary": max_s,
                                "salary_display": sal_str,
                                "job_url": job_url,
                                "source": f"Lever ATS ({company_display})",
                                "description": item.get("descriptionPlain", f"Architect enterprise solutions as a {title} at {company_display}."),
                                "required_skills": "Python, TypeScript, REST APIs, PostgreSQL, Distributed Systems",
                                "preferred_skills": "Redis, Kafka, AWS, Docker",
                                "match_score": 93,
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
