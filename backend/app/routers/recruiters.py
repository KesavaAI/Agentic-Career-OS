from fastapi import APIRouter, Depends, HTTPException, Query, Body
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel

from app.database import get_db
from app.models.recruiter import Recruiter
from app.models.user import User
from app.dependencies import get_current_user
from app.schemas.recruiter import RecruiterCreate, RecruiterUpdate, RecruiterOut
from app.services.recruiter_headhunter_agent import recruiter_headhunter_agent

router = APIRouter(prefix="/recruiters", tags=["Recruiters"])

class HeadhunterPitchRequest(BaseModel):
    recruiter_name: str
    company_name: str
    recruiter_role: Optional[str] = "Hiring Manager"
    candidate_skills: Optional[str] = None
    candidate_projects: Optional[str] = None

@router.get("", response_model=List[RecruiterOut])
def list_recruiters(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    return db.query(Recruiter).offset(skip).limit(limit).all()

@router.get("/headhunter/verified-targets")
def get_verified_hiring_managers():
    """Returns curated tier-1 engineering hiring managers and technical recruiters."""
    return recruiter_headhunter_agent.DEFAULT_RECRUITERS

@router.post("/headhunter/generate-pitch")
def generate_recruiter_pitch(
    req: HeadhunterPitchRequest,
    current_user: Optional[User] = Depends(get_current_user)
):
    """Synthesizes high-conversion 3-sentence cold outreach email for target hiring manager."""
    cand_name = current_user.full_name if current_user else "Candidate"
    cand_role = (current_user.target_role if current_user else None) or "Full Stack / Distributed Systems Engineer"

    result = recruiter_headhunter_agent.generate_personalized_pitch(
        recruiter_name=req.recruiter_name,
        company_name=req.company_name,
        recruiter_role=req.recruiter_role or "Hiring Manager",
        candidate_name=cand_name,
        candidate_role=cand_role,
        candidate_skills=req.candidate_skills,
        candidate_projects=req.candidate_projects
    )
    return result

@router.post("", response_model=RecruiterOut)
def create_recruiter(recruiter_in: RecruiterCreate, db: Session = Depends(get_db)):
    db_recruiter = Recruiter(**recruiter_in.dict())
    db.add(db_recruiter)
    db.commit()
    db.refresh(db_recruiter)
    return db_recruiter
