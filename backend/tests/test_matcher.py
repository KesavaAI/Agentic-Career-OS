from app.services.matcher import job_matcher
from app.services.ats_simulator import ats_simulator
from app.services.readiness_score import readiness_engine
from app.services.duplicate_detector import duplicate_detector

def test_matcher_tier_a():
    job = {
        "role": "GenAI / Agentic AI Engineer",
        "company_name": "Microsoft",
        "required_skills": "Python, LangGraph, RAG, Azure OpenAI, FastAPI",
        "preferred_skills": "Docker, Kubernetes, SQL",
        "description": "Build production multi-agent workflows using LangGraph and Azure OpenAI.",
        "location": "Bengaluru",
        "max_salary": 28.0,
        "experience_min": 1.0,
        "experience_max": 4.0
    }
    profile = {
        "primary_skills": "Python, LangGraph, LangChain, RAG, Agentic AI, Azure OpenAI, FastAPI",
        "experience_years": 1.6
    }
    match = job_matcher.calculate_match(job, profile)
    assert match["overall_score"] >= 80
    assert match["tier"] == "A"
    assert match["recommendation"] == "APPLY"
    assert match["genai_match"] >= 90
    assert match["agentic_ai_match"] >= 90

def test_ats_simulator_scoring():
    resume = """# Kesava - GenAI / Agentic AI Engineer
    Experience at TCS building TCS Agentic Data Intelligence in Python using LangGraph, RAG, Azure OpenAI, and FastAPI.
    - Reduced query synthesis latency by 35% with 94.2% accuracy.
    """
    jd = """Looking for GenAI Engineer skilled in Python, LangGraph, RAG, and Azure OpenAI."""
    ats_res = ats_simulator.analyze_resume(resume, jd)
    assert ats_res["current_score"] >= 65
    assert ats_res["potential_score"] >= ats_res["current_score"]
    assert "Python" in ats_res["found_keywords"]
    assert "LangGraph" in ats_res["found_keywords"]
    assert len(ats_res["recommended_changes"]) > 0

def test_readiness_score():
    score = readiness_engine.calculate(
        tech_skill_avg=90,
        tcs_project_depth=95,
        mock_interview_avg=85,
        ats_resume_strength=90,
        funnel_momentum=80
    )
    assert score["overall_score"] >= 85
    assert "Technical Skills (GenAI/RAG/Python)" in score["category_scores"]
    assert len(score["top_strengths"]) > 0

def test_duplicate_detector():
    new_job = {"job_url": "https://careers.google.com/job/123", "company_name": "Google", "role": "AI Engineer"}
    existing = [{"id": 1, "job_url": "https://careers.google.com/job/123", "company_name": "Google", "role": "AI Engineer"}]
    dup = duplicate_detector.check_duplicate(new_job, existing)
    assert dup["is_duplicate"] is True
    assert dup["duplicate_id"] == 1
