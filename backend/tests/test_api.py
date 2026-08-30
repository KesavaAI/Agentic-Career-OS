import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_get_jobs():
    response = client.get("/api/v1/jobs")
    assert response.status_code == 200
    jobs = response.json()
    assert len(jobs) > 0
    assert "role" in jobs[0]
    assert "tier" in jobs[0]

def test_get_today_priorities():
    response = client.get("/api/v1/analytics/today-priorities")
    assert response.status_code == 200
    data = response.json()
    assert "apply_today" in data
    assert "follow_ups" in data
    assert "interviews" in data
    assert "learn_topics" in data

def test_get_readiness():
    response = client.get("/api/v1/analytics/readiness")
    assert response.status_code == 200
    data = response.json()
    assert data["overall_score"] >= 50
    assert "category_scores" in data

def test_get_market_intel():
    response = client.get("/api/v1/market")
    assert response.status_code == 200
    data = response.json()
    assert data["sample_size"] > 0
    assert len(data["skills_demand"]) > 0

def test_tcs_project_profile():
    response = client.get("/api/v1/projects/tcs-agentic-intelligence")
    assert response.status_code == 200
    proj = response.json()
    assert "TCS Agentic Data Intelligence" in proj["title"]
    assert "LangGraph" in proj["technologies"]
    assert proj["category"] == "PRODUCTION"

def test_mock_interview_turn():
    req = {
        "mode": "GenAI",
        "is_pressure_mode": True,
        "messages": [{"role": "user", "content": "I built a multi-agent data intelligence platform at TCS using LangGraph."}],
        "target_role": "GenAI Engineer"
    }
    response = client.post("/api/v1/mock-interview/turn", json=req)
    assert response.status_code == 200
    data = response.json()
    assert "interviewer_reply" in data
    assert len(data["interviewer_reply"]) > 0
