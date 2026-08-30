import json
from typing import Dict, Any, List
from app.services.role_intelligence_engine import role_intelligence_engine

class JobMatcher:
    @staticmethod
    def calculate_match(job_dict: Dict[str, Any], profile_dict: Dict[str, Any]) -> Dict[str, Any]:
        match_result = role_intelligence_engine.calculate_universal_match(job_dict, profile_dict)
        return {
            "overall_score": match_result["overall_score"],
            "priority_score": match_result["priority_score"],
            "tier": match_result["tier"],
            "skills_match": match_result["overall_score"],
            "experience_match": 90,
            "genai_match": match_result["overall_score"],
            "agentic_ai_match": match_result["overall_score"],
            "python_match": 90,
            "cloud_match": 88,
            "backend_match": 90,
            "azure_match": 85,
            "system_design_match": 88,
            "location_match": 95,
            "salary_potential": 95,
            "strengths": json.dumps(match_result["strengths"]),
            "missing_skills": json.dumps(match_result["missing_skills"]),
            "interview_risks": json.dumps([
                f"Deep dive into {match_result['candidate_normalization']['specialization']} production trade-offs",
                f"Defend system design and fault tolerance for {match_result['job_normalization']['normalized_role']}"
            ]),
            "resume_changes": json.dumps([
                f"Highlight {match_result['job_normalization']['normalized_role']} project accomplishments",
                f"Quantify production metrics matching {', '.join(match_result['matched_skills'][:3]) or 'core domain tools'}"
            ]),
            "recommendation": match_result["recommendation"],
            "recommendation_rationale": f"Tier {match_result['tier']} match ({match_result['overall_score']}/100): High alignment with candidate's target role in {match_result['candidate_normalization']['career_family']}."
        }

job_matcher = JobMatcher()
