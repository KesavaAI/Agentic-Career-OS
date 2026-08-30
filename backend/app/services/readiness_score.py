from typing import Dict, Any

class ReadinessScoreEngine:
    @staticmethod
    def calculate(
        tech_skill_avg: float,
        tcs_project_depth: float,
        mock_interview_avg: float,
        ats_resume_strength: float,
        funnel_momentum: float
    ) -> Dict[str, Any]:
        overall = int(
            (tech_skill_avg * 0.30) +
            (tcs_project_depth * 0.25) +
            (mock_interview_avg * 0.20) +
            (ats_resume_strength * 0.15) +
            (funnel_momentum * 0.10)
        )
        overall = min(max(overall, 50), 98)

        strengths = [
            "Exceptional LangGraph & Agentic AI production implementation depth at TCS",
            "High ATS resume compatibility (88%+) for Tier-A GenAI Engineer roles",
            "Strong core Python async and FastAPI backend foundations"
        ]

        critical_gaps = [
            "Deepen LLM evaluation metrics (Ragas faithfulness/relevance) for senior rounds",
            "Practice live pressure-mode system design for 10k+ concurrent agent sessions"
        ]

        summary = (
            f"Current Readiness: {overall}/100 (Target: 85+/100). "
            f"You possess strong production-grade Agentic AI skills from TCS. "
            f"Closing evaluation & high-scale system design gaps will maximize ₹18+ LPA conversion."
        )

        return {
            "overall_score": overall,
            "target_threshold": 85,
            "category_scores": {
                "Technical Skills (GenAI/RAG/Python)": int(tech_skill_avg),
                "TCS Project Defense Depth": int(tcs_project_depth),
                "Mock Interview Performance": int(mock_interview_avg),
                "ATS Resume Strength": int(ats_resume_strength),
                "Application Funnel Momentum": int(funnel_momentum)
            },
            "top_strengths": strengths,
            "critical_gaps": critical_gaps,
            "readiness_summary": summary
        }

readiness_engine = ReadinessScoreEngine()
