from typing import Dict, Any, List

class ReadinessScoreEngine:
    @staticmethod
    def calculate(
        tech_skill_avg: float,
        project_depth: float,
        mock_interview_avg: float,
        ats_resume_strength: float,
        funnel_momentum: float,
        target_role: str = "Full Stack / Web Development",
        candidate_name: str = "Alexander",
        target_min_ctc_lpa: float = 24.0
    ) -> Dict[str, Any]:
        overall = int(
            (tech_skill_avg * 0.30) +
            (project_depth * 0.25) +
            (mock_interview_avg * 0.20) +
            (ats_resume_strength * 0.15) +
            (funnel_momentum * 0.10)
        )
        overall = min(max(overall, 50), 98)

        clean_role = target_role.split('/')[0].strip() if target_role else "Software Engineer"

        strengths = [
            f"Strong modern {clean_role} full-stack core, async concurrency, and API integration architecture",
            f"ATS resume compatibility ({int(ats_resume_strength)}%) optimized for Tier-A engineering positions",
            f"Active multi-application pipeline momentum ({int(funnel_momentum)}%) with automated follow-ups"
        ]

        critical_gaps = [
            f"Solidify P99 latency trade-offs and database connection pooling for Senior {clean_role} rounds",
            "Maintain consistent 15-minute daily verbal defense practice to maximize final offer conversion"
        ]

        summary = (
            f"Current Readiness: {overall}/100 (Target Benchmark: 85+/100). "
            f"You possess verified production-grade {clean_role} architecture skills. "
            f"Targeting ₹{target_min_ctc_lpa}L+ LPA dream packages across top tech firms."
        )

        return {
            "overall_score": overall,
            "target_threshold": 85,
            "category_scores": {
                f"Core Engineering ({clean_role})": int(tech_skill_avg),
                "Production Project Architecture": int(project_depth),
                "Verbal Defense & Technical Rounds": int(mock_interview_avg),
                "ATS Resume & STAR Defense Strength": int(ats_resume_strength),
                "Live Pipeline Funnel Momentum": int(funnel_momentum)
            },
            "top_strengths": strengths,
            "critical_gaps": critical_gaps,
            "readiness_summary": summary
        }

readiness_engine = ReadinessScoreEngine()
