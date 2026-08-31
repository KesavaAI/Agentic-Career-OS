import json
from typing import Dict, Any, List
from app.services.matching_engine import ai_job_matcher

class JobMatcher:
    @staticmethod
    def calculate_match(job_dict: Dict[str, Any], profile_dict: Dict[str, Any]) -> Dict[str, Any]:
        res = ai_job_matcher.calculate_match(job_dict, profile_dict)
        return {
            "overall_score": res["overall_score"],
            "priority_score": res["priority_score"],
            "tier": res["tier"],
            "eligibility": res["eligibility"],
            "recommendation": res["recommendation"],
            "recommendation_rationale": res["recommendation_rationale"],
            "role_alignment_score": res["role_alignment_score"],
            "required_skills_score": res["required_skills_score"],
            "preferred_skills_score": res["preferred_skills_score"],
            "experience_fit_score": res["experience_fit_score"],
            "projects_relevance_score": res["projects_relevance_score"],
            "education_fit_score": res["education_fit_score"],
            "salary_fit_score": res["salary_fit_score"],
            "location_fit_score": res["location_fit_score"],
            "pillar_scores": res["pillar_scores"],
            "matched_skills": res["matched_skills"],
            "missing_skills": res["missing_skills"],
            "strengths": res["strengths"],
            "concerns": res["concerns"],
            # Legacy compatibility fields
            "skills_match": res["required_skills_score"],
            "experience_match": res["experience_fit_score"],
            "genai_match": res["role_alignment_score"],
            "agentic_ai_match": res["role_alignment_score"],
            "python_match": res["required_skills_score"],
            "cloud_match": res["required_skills_score"],
            "backend_match": res["role_alignment_score"],
            "azure_match": res["required_skills_score"],
            "system_design_match": res["projects_relevance_score"],
            "location_match": res["location_fit_score"],
            "salary_potential": res["salary_fit_score"],
            "breakdown": json.dumps(res.get("breakdown", {})),
            "interview_risks": json.dumps(res["concerns"]),
            "resume_changes": json.dumps([f"Emphasize experience with {s}" for s in res["missing_skills"][:2]])
        }

job_matcher = JobMatcher()
