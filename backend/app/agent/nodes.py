from typing import Dict, Any
from app.services.jd_extractor import jd_extractor
from app.services.matcher import job_matcher
from app.services.resume_tailor import resume_tailor
from app.services.interview_pack_gen import interview_pack_gen

class AgentNodes:
    @staticmethod
    def ingest_and_extract(raw_text: str) -> Dict[str, Any]:
        return jd_extractor.extract_from_text(raw_text)

    @staticmethod
    def evaluate_and_tier(job_dict: Dict[str, Any], profile_dict: Dict[str, Any]) -> Dict[str, Any]:
        return job_matcher.calculate_match(job_dict, profile_dict)

    @staticmethod
    def prepare_tailored_artifacts(resume_md: str, job_dict: Dict[str, Any]) -> Dict[str, Any]:
        tailored = resume_tailor.tailor_resume(resume_md, job_dict)
        pack = interview_pack_gen.generate_pack(job_dict)
        return {
            "tailored_resume": tailored,
            "interview_pack": pack
        }
