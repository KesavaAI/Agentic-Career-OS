import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

# 1. Pipeline: Ingest Job -> Extract -> Match -> Create
def test_pipeline_job_ingest():
    raw_jd = """
    Company: NeuralPulse AI
    Role: Senior GenAI Engineer
    Location: Bengaluru (Hybrid)
    Salary: ₹22L - ₹32L LPA
    Requirements:
    - 2+ years in Python, FastAPI, LangGraph, Azure OpenAI, RAG architectures
    - Experience building multi-agent workflows and vector databases (Qdrant, ChromaDB)
    """
    res = client.post("/api/v1/jobs/ingest", json={
        "raw_text": raw_jd,
        "url": "https://neuralpulse.ai/careers/genai-lead",
        "source": "E2E Test Suite"
    })
    assert res.status_code == 200
    job = res.json()
    assert job["company_name"] == "NeuralPulse AI"
    assert "GenAI" in job["role"]
    assert job["tier"] in ["A", "B", "C"]
    assert job["match_score"] > 50

# 2. Pipeline: Resume Tailoring (Recruiter + ATS Formats)
def test_pipeline_resume_tailoring():
    res_list = client.get("/api/v1/resumes").json()
    jobs_list = client.get("/api/v1/jobs").json()
    assert len(res_list) > 0
    assert len(jobs_list) > 0

    res_id = res_list[0]["id"]
    job_id = jobs_list[0]["id"]

    tailor_res = client.post("/api/v1/resumes/tailor", json={
        "resume_id": res_id,
        "job_id": job_id
    })
    assert tailor_res.status_code == 200
    data = tailor_res.json()
    assert "tailored_markdown" in data
    assert "structured_resume" in data
    assert "changes_summary" in data
    assert len(data["changes_summary"]) > 0
    assert "CHENNA KESAVA REDDY" in data["tailored_markdown"]
    assert "Tata Consultancy Services (TCS)" in data["tailored_markdown"]

# 3. Pipeline: ATS Simulator Audit
def test_pipeline_ats_simulator():
    res_list = client.get("/api/v1/resumes").json()
    assert len(res_list) > 0
    
    audit_res = client.post("/api/v1/resumes/ats-simulate", json={
        "resume_id": res_list[0]["id"],
        "job_description": "Seeking GenAI Engineer skilled in Python, LangGraph, RAG, Azure OpenAI, FastAPI, SQL, Docker."
    })
    assert audit_res.status_code == 200
    ats = audit_res.json()
    assert ats["current_score"] >= 70
    assert ats["potential_score"] >= ats["current_score"]
    assert len(ats["found_keywords"]) > 0
    assert "LangGraph" in ats["found_keywords"] or "Python" in ats["found_keywords"]

# 4. Pipeline: Interview Pack Generation
def test_pipeline_interview_pack():
    jobs = client.get("/api/v1/jobs").json()
    assert len(jobs) > 0
    job_id = jobs[0]["id"]

    pack_res = client.get(f"/api/v1/interviews/job/{job_id}/pack")
    assert pack_res.status_code == 200
    data = pack_res.json()
    assert "pack" in data
    pack = data["pack"]
    assert len(pack) > 0
    assert "question" in pack[0]
    assert "kesava_answer" in pack[0]
    assert "ideal_answer" in pack[0]

# 5. Pipeline: AI Mock Interview (Standard & Pressure Mode)
def test_pipeline_mock_interview():
    # Normal Turn
    normal_turn = client.post("/api/v1/mock-interview/turn", json={
        "mode": "GenAI",
        "is_pressure_mode": False,
        "messages": [{"role": "user", "content": "I built the TCS Agentic Data Intelligence system using LangGraph and AST validation."}],
        "target_role": "GenAI Engineer"
    })
    assert normal_turn.status_code == 200
    assert len(normal_turn.json()["interviewer_reply"]) > 0

    # Pressure Mode Turn
    pressure_turn = client.post("/api/v1/mock-interview/turn", json={
        "mode": "System Design",
        "is_pressure_mode": True,
        "messages": [{"role": "user", "content": "How do you handle rate limits and 100 concurrent agent executions?"}],
        "target_role": "Lead AI Engineer"
    })
    assert pressure_turn.status_code == 200
    assert len(pressure_turn.json()["interviewer_reply"]) > 0

# 6. Pipeline: Learning Topics & Spaced Repetition
def test_pipeline_learning_review():
    topics = client.get("/api/v1/learning").json()
    assert len(topics) > 0
    t_id = topics[0]["id"]

    checkin_res = client.post("/api/v1/learning/recall-checkin", json={
        "topic_id": t_id,
        "result_state": "GREEN"
    })
    assert checkin_res.status_code == 200
    updated = checkin_res.json()
    assert updated["status"] == "GREEN"
    assert updated["recall_schedule_day"] >= 0

# 7. Pipeline: Recruiter Outreach CRM
def test_pipeline_recruiter_outreach():
    recruiters = client.get("/api/v1/recruiters").json()
    assert len(recruiters) > 0
    rec = recruiters[0]

    msg_res = client.post("/api/v1/recruiters/template", json={
        "recruiter_name": rec["name"],
        "company_name": rec["company_name"],
        "role_title": "GenAI Engineer",
        "template_type": "outreach"
    })
    assert msg_res.status_code == 200
    outreach = msg_res.json()
    assert "subject" in outreach
    assert "body" in outreach
    assert "TCS" in outreach["body"] or "GenAI" in outreach["body"]

# 8. Pipeline: Offers & Target Compensation Tracking
def test_pipeline_offers():
    offers = client.get("/api/v1/offers").json()
    assert len(offers) > 0
    offer = offers[0]
    assert offer["total_ctc_lpa"] >= 18.0
    assert offer["fixed_lpa"] > 0

# 9. Pipeline: Autonomous Career Agent Execution
def test_pipeline_career_agent():
    agent_res = client.post("/api/v1/career-agent/run", json={
        "raw_jd_text": "Hiring a GenAI Platform Engineer with LangGraph, RAG, and Azure OpenAI expertise.",
        "job_url": "https://example.com/careers/genai",
        "source": "E2E Test"
    })
    assert agent_res.status_code == 200
    workflow = agent_res.json()
    assert "step" in workflow
    assert workflow["step"] == "READY_FOR_APPROVAL"
    assert workflow["human_approval_required"] is True
    assert "match_result" in workflow
    assert workflow["match_result"]["overall_score"] > 50

# 10. Pipeline: Backup & Export
def test_pipeline_backup_export():
    json_res = client.get("/api/v1/backup-export/export-json")
    assert json_res.status_code == 200
    assert "jobs" in json_res.json()
    assert "applications" in json_res.json()

    csv_res = client.get("/api/v1/backup-export/export-jobs-csv")
    assert csv_res.status_code == 200
    assert "Company" in csv_res.text
    assert "Role" in csv_res.text

# 11. Pipeline: Bulk Job Actions
def test_pipeline_bulk_job_actions():
    jobs = client.get("/api/v1/jobs?limit=3").json()
    job_ids = [j["id"] for j in jobs]
    
    bulk_res = client.post("/api/v1/jobs/bulk", json={
        "job_ids": job_ids,
        "action": "set_status",
        "value": "REVIEWED"
    })
    assert bulk_res.status_code == 200
