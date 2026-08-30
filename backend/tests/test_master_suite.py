import os
import sys
import json
import time
from dotenv import load_dotenv

load_dotenv(r"D:\Agentic Career OS\.env", override=True)
sys.path.insert(0, r"D:\Agentic Career OS\backend")

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

print("="*75)
print("  🚀 AGENTIC CAREER OS — MASTER API TEST SUITE (ALL 22 MODULES)")
print("="*75)

tests_passed = 0
tests_failed = 0
results = []

def run_test(module, method, endpoint, payload=None, expected_status=200):
    global tests_passed, tests_failed
    start = time.time()
    try:
        if method == "GET":
            res = client.get(endpoint)
        elif method == "POST":
            res = client.post(endpoint, json=payload or {})
        elif method == "PUT":
            res = client.put(endpoint, json=payload or {})
        elif method == "DELETE":
            res = client.delete(endpoint)
        
        elapsed = round((time.time() - start) * 1000, 1)
        
        if res.status_code == expected_status or (expected_status == 200 and res.status_code in [200, 201]):
            tests_passed += 1
            results.append((module, method, endpoint, res.status_code, f"{elapsed}ms", "PASSED"))
            print(f"  [PASS] {module:<22} | {method:<6} {endpoint:<38} | {res.status_code} ({elapsed}ms)")
            return res.json() if res.content else {}
        else:
            tests_failed += 1
            results.append((module, method, endpoint, res.status_code, f"{elapsed}ms", "FAILED"))
            print(f"  [FAIL] {module:<22} | {method:<6} {endpoint:<38} | Expected {expected_status}, Got {res.status_code}")
            return None
    except Exception as e:
        tests_failed += 1
        results.append((module, method, endpoint, "ERR", "0ms", f"ERR: {str(e)[:30]}"))
        print(f"  [ERR]  {module:<22} | {method:<6} {endpoint:<38} | Exception: {e}")
        return None

# 1. Health & Root
run_test("Health Check", "GET", "/health")
run_test("API Root", "GET", "/")

# 2. Auth
run_test("Auth System", "POST", "/api/v1/auth/register", {"email": "test_agent@kesava.ai", "password": "SecurePassword123!", "full_name": "Test Agent"}, expected_status=200)
login_res = run_test("Auth System", "POST", "/api/v1/auth/login", {"email": "test_agent@kesava.ai", "password": "SecurePassword123!"})

# 3. Profile
prof_res = run_test("Candidate Profile", "GET", "/api/v1/profile")
run_test("Candidate Profile", "PUT", "/api/v1/profile", {"title": "Lead GenAI & Agentic Systems Engineer"})

# 4. Jobs & Ingestion
jobs = run_test("Job Management", "GET", "/api/v1/jobs")
job_id = jobs[0]["id"] if jobs and len(jobs) > 0 else 1
run_test("Job Management", "GET", f"/api/v1/jobs/{job_id}")
run_test("Job Analysis", "POST", f"/api/v1/jobs/{job_id}/analyze")
run_test("Job Ingestion", "POST", "/api/v1/jobs/ingest", {
    "raw_text": "Company: NeuralPulse AI\nRole: Lead Agentic AI Engineer\nSalary: 28L-42L LPA\nSkills: Python, LangGraph, RAG, Azure OpenAI",
    "source": "API Test Runner"
})

# 5. Autonomous Discovery Agent
run_test("Auto Job Discovery", "GET", "/api/v1/discovery/status")
run_test("Auto Job Discovery", "POST", "/api/v1/discovery/run-auto-scan", {"max_jobs": 2})

# 6. Applications & Pipeline
apps = run_test("Applications CRM", "GET", "/api/v1/applications")
app_id = apps[0]["id"] if apps and len(apps) > 0 else 1
run_test("Applications CRM", "GET", f"/api/v1/applications/{app_id}")
run_test("Application Events", "GET", f"/api/v1/applications/{app_id}/events")
run_test("Application Evidence", "GET", f"/api/v1/applications/{app_id}/evidence")
run_test("Application Evidence", "POST", f"/api/v1/applications/{app_id}/evidence", {
    "title": "Offer Letter",
    "evidence_type": "OFFER_LETTER",
    "content": "CTC benchmark document for INR 22 LPA"
})

# 7. Companies
companies = run_test("Companies", "GET", "/api/v1/companies")
comp_id = companies[0]["id"] if companies and len(companies) > 0 else 1
run_test("Companies", "GET", f"/api/v1/companies/{comp_id}")

# 8. Recruiters & CRM
recruiters = run_test("Recruiters CRM", "GET", "/api/v1/recruiters")
run_test("Recruiter Outreach", "POST", "/api/v1/recruiters/template", {
    "recruiter_name": "Priya Sharma",
    "company_name": "Swiggy",
    "role_title": "Lead GenAI Engineer",
    "template_type": "outreach"
})

# 9. Resumes & ATS Simulator
resumes = run_test("Resume Center", "GET", "/api/v1/resumes")
res_id = resumes[0]["id"] if resumes and len(resumes) > 0 else 1
run_test("ATS Simulator", "POST", "/api/v1/resumes/ats-simulate", {
    "resume_id": res_id,
    "job_description": "Hiring GenAI Engineer skilled in Python, LangGraph, RAG, Azure OpenAI, FastAPI."
})
run_test("Resume Tailoring", "POST", "/api/v1/resumes/tailor", {
    "resume_id": res_id,
    "job_id": job_id
})

# 10. Projects & TCS Architecture
run_test("Projects Portfolio", "GET", "/api/v1/projects")
run_test("TCS Project Profile", "GET", "/api/v1/projects/tcs-agentic-intelligence")

# 11. Interviews & Prep Packs
run_test("Interviews Center", "GET", "/api/v1/interviews")
run_test("Interview Pack", "GET", f"/api/v1/interviews/job/{job_id}/pack")

# 12. Mock Interview & Pressure Mode
run_test("Mock Interview Turn", "POST", "/api/v1/mock-interview/turn", {
    "mode": "GenAI",
    "is_pressure_mode": False,
    "messages": [{"role": "user", "content": "I designed the TCS multi-agent LangGraph pipeline with AST validation."}],
    "target_role": "GenAI Engineer"
})
run_test("Pressure Mode Turn", "POST", "/api/v1/mock-interview/turn", {
    "mode": "System Design",
    "is_pressure_mode": True,
    "messages": [{"role": "user", "content": "How do you handle rate limits and 100 concurrent agent executions?"}],
    "target_role": "Lead AI Engineer"
})
run_test("Mock Sessions", "GET", "/api/v1/mock-interview/sessions")

# 13. Learning & Spaced Repetition (Day 0-30)
topics = run_test("Learning Topics", "GET", "/api/v1/learning")
if topics and len(topics) > 0:
    run_test("Spaced Recall Check", "POST", "/api/v1/learning/recall-checkin", {
        "topic_id": topics[0]["id"],
        "result_state": "GREEN"
    })

# 14. Market Intelligence
run_test("Market Intelligence", "GET", "/api/v1/market")

# 15. Analytics & Readiness
run_test("Daily Priorities", "GET", "/api/v1/analytics/today-priorities")
run_test("Readiness Score", "GET", "/api/v1/analytics/readiness")
run_test("Funnel Analytics", "GET", "/api/v1/analytics/funnel")
run_test("Weekly Review", "GET", "/api/v1/analytics/weekly-review")

# 16. Follow-ups
followups = run_test("Follow-ups", "GET", "/api/v1/followups")

# 17. Offers & CTC Benchmarks
run_test("Offers Hub", "GET", "/api/v1/offers")
run_test("Offers Compare", "GET", "/api/v1/offers/compare")

# 18. Notifications
run_test("Notification Center", "GET", "/api/v1/notifications")

# 19. Career Agent Workflow
run_test("Career Agent Pipeline", "POST", "/api/v1/career-agent/run", {
    "raw_jd_text": "Hiring a GenAI Platform Engineer with LangGraph, RAG, and Azure OpenAI expertise.",
    "source": "Master E2E Test"
})

# 20. Backup & Export
run_test("Full Backup Export", "GET", "/api/v1/backup-export/export-json")
run_test("Jobs CSV Export", "GET", "/api/v1/backup-export/export-jobs-csv")

# 21. Audit Logs
run_test("Audit Trail", "GET", "/api/v1/audit")

# 22. Live Gmail Integration
run_test("Email Sync Status", "GET", "/api/v1/email/status")
run_test("Email Connection Test", "POST", "/api/v1/email/test-connection", {
    "email": "kesavac913@gmail.com",
    "app_password": os.getenv("GMAIL_APP_PASSWORD")
})

print("="*75)
print(f"  🏁 MASTER API TEST COMPLETE: {tests_passed} PASSED | {tests_failed} FAILED")
print("="*75)
