from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.interview import Interview
from app.models.user import User
from app.dependencies import get_current_user
from app.schemas.interview import InterviewCreate, InterviewUpdate, InterviewOut
from app.services.interview_pack_gen import interview_pack_gen
from app.services.resume_defense_engine import resume_defense_engine
from app.services.company_dossier_agent import company_dossier_agent

router = APIRouter(prefix="/interviews", tags=["Interviews"])

@router.get("", response_model=List[InterviewOut])
def list_interviews(db: Session = Depends(get_db)):
    return db.query(Interview).all()

@router.get("/dossier/{company_name}")
def get_executive_company_dossier(
    company_name: str,
    role: Optional[str] = "Senior / Staff Software Engineer",
    current_user: Optional[User] = Depends(get_current_user)
):
    """Returns 1-page executive technical intelligence dossier for any company."""
    user_role = role or (current_user.target_role if current_user else "Senior / Staff Software Engineer")
    return company_dossier_agent.generate_dossier(company_name, user_role)

@router.get("/resume-defense")
def get_resume_defense(db: Session = Depends(get_db)):
    return resume_defense_engine.generate_defense_matrix(db)

@router.get("/scenario-pack")
def get_scenario_pack_generic():
    return interview_pack_gen.generate_scenario_pack("Google", "Staff Software Engineer")

@router.get("/job/{job_id}/pack")
def get_interview_pack_for_job(job_id: int, db: Session = Depends(get_db)):
    from app.models.job import Job
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return interview_pack_gen.generate_prep_pack(job.company_name, job.role)

@router.get("/job/{job_id}/scenario-pack")
def get_scenario_pack_for_job(job_id: int, db: Session = Depends(get_db)):
    from app.models.job import Job
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return interview_pack_gen.generate_scenario_pack(job.company_name, job.role)

@router.post("", response_model=InterviewOut)
def create_interview(interview_in: InterviewCreate, db: Session = Depends(get_db)):
    db_interview = Interview(**interview_in.dict())
    db.add(db_interview)
    db.commit()
    db.refresh(db_interview)
    return db_interview
