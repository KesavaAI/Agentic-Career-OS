from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, Dict, Any
from app.database import get_db
from app.models.profile import Profile
from app.models.resume import Resume
from app.agent.workflow import career_workflow
from app.agent.state import CareerAgentState
from app.routers.jobs import create_job
from app.schemas.job import JobCreate

router = APIRouter(prefix="/career-agent", tags=["Career Agent"])

class AgentRunRequest(BaseModel):
    raw_jd_text: str
    job_url: Optional[str] = None
    source: Optional[str] = "Manual Ingest"

class AgentApprovalRequest(BaseModel):
    state: Dict[str, Any]
    approve: bool
    action: str = "APPLY" # APPLY, SHORTLIST, DISCARD

@router.post("/run", response_model=CareerAgentState)
def run_career_agent_pipeline(req: AgentRunRequest, db: Session = Depends(get_db)):
    profile = db.query(Profile).first()
    p_dict = profile.__dict__ if profile else {}
    resume = db.query(Resume).first()
    res_md = resume.content_markdown if resume else "Kesava - GenAI Engineer"
    
    state = career_workflow.run_job_pipeline(req.raw_jd_text, p_dict, res_md)
    return state

@router.post("/approve")
def submit_agent_approval(req: AgentApprovalRequest, db: Session = Depends(get_db)):
    if not req.approve:
        return {"status": "discarded", "message": "Job discarded by user."}
    
    extracted = req.state.get("extracted_job") or {}
    job_create = JobCreate(
        company_name=extracted.get("company_name", "Target Tech"),
        role=extracted.get("role", "GenAI / Agentic AI Engineer"),
        tier=req.state.get("tier", "A"),
        priority_score=req.state.get("priority_score", 85),
        match_score=req.state.get("match_result", {}).get("overall_score", 85),
        min_salary=extracted.get("min_salary", 18.0),
        max_salary=extracted.get("max_salary", 28.0),
        location=extracted.get("location", "Bengaluru"),
        work_mode=extracted.get("work_mode", "Hybrid"),
        description=extracted.get("description", "Job description"),
        required_skills=extracted.get("required_skills", "Python, LangGraph, RAG"),
        preferred_skills=extracted.get("preferred_skills", "Docker, SQL"),
        status="READY TO APPLY" if req.action == "APPLY" else "SHORTLISTED"
    )
    created = create_job(job_create, db)
    return {"status": "approved", "job_id": created.id, "message": f"Successfully created job {created.role} at {created.company_name}"}
