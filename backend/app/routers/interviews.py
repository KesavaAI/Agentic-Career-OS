from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.database import get_db
from app.models.interview import Interview
from app.models.job import Job
from app.models.profile import Profile
from app.models.project import Project
from app.models.learning import LearningTopic
from app.schemas.interview import InterviewOut, InterviewCreate, InterviewUpdate
from app.services.interview_pack_gen import interview_pack_gen
from app.services.audit_service import audit_service
from app.services.interview_intelligence_engine import interview_intelligence_engine
from app.services.resume_defense_engine import resume_defense_engine

router = APIRouter(prefix="/interviews", tags=["Interviews"])

@router.get("", response_model=List[InterviewOut])
def list_interviews(db: Session = Depends(get_db)):
    return db.query(Interview).order_by(Interview.scheduled_at.asc()).all()

# STATIC / SPECIFIC ROUTES MUST COME BEFORE /{int_id} IN FASTAPI
@router.get("/scenario-pack")
def get_scenario_pack_generic(company: Optional[str] = "Zepto", role: Optional[str] = "Full Stack Engineer"):
    target_company = company or "Zepto"
    target_role = role or "Full Stack Engineer"
    questions = interview_intelligence_engine.generate_top_50_scenario_questions(target_company, target_role)
    return {
        "company": target_company,
        "role": target_role,
        "total_questions": len(questions),
        "questions": questions
    }

@router.get("/resume-defense")
def get_resume_defense(db: Session = Depends(get_db)):
    """
    Synthesizes project cross-examination questions and bulletproof STAR answers
    dynamically tailored to the logged-in candidate's actual projects and resume.
    """
    return resume_defense_engine.generate_defense_for_user(db)

@router.get("/job/{job_id}/pack")
def get_interview_pack_for_job(job_id: int, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    profile = db.query(Profile).first()
    p_dict = profile.__dict__ if profile else {}
    pack = interview_pack_gen.generate_pack(job.__dict__, p_dict)
    return {"job_id": job.id, "company": job.company_name, "role": job.role, "pack": pack}

@router.get("/job/{job_id}/scenario-pack")
def get_scenario_pack_for_job(job_id: int, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    questions = interview_intelligence_engine.generate_top_50_scenario_questions(job.company_name, job.role)
    return {
        "job_id": job.id,
        "company": job.company_name,
        "role": job.role,
        "total_questions": len(questions),
        "questions": questions
    }

@router.get("/{int_id}", response_model=InterviewOut)
def get_interview(int_id: int, db: Session = Depends(get_db)):
    int_obj = db.query(Interview).filter(Interview.id == int_id).first()
    if not int_obj:
        raise HTTPException(status_code=404, detail="Interview not found")
    return int_obj

@router.post("", response_model=InterviewOut)
def create_interview(req: InterviewCreate, db: Session = Depends(get_db)):
    int_obj = Interview(**req.dict())
    db.add(int_obj)
    db.commit()
    db.refresh(int_obj)
    audit_service.log(db, "system@career.local", "CREATE", "Interview", int_obj.id, None, f"Scheduled interview with {int_obj.company_name}")
    return int_obj

@router.put("/{int_id}", response_model=InterviewOut)
def update_interview(int_id: int, req: InterviewUpdate, db: Session = Depends(get_db)):
    int_obj = db.query(Interview).filter(Interview.id == int_id).first()
    if not int_obj:
        raise HTTPException(status_code=404, detail="Interview not found")
    
    for key, val in req.dict(exclude_unset=True).items():
        setattr(int_obj, key, val)
        
    # Failure retro trigger
    if req.result == "REJECTED" and req.failure_reason_category:
        topic = db.query(LearningTopic).filter(LearningTopic.skill.ilike(f"%{req.failure_reason_category}%")).first()
        if not topic:
            topic = LearningTopic(
                skill=f"Improve {req.failure_reason_category}",
                category=req.failure_reason_category,
                market_demand="High",
                my_level="Medium",
                gap_level="Medium gap",
                priority="Critical",
                stage="LEARN",
                status="YELLOW",
                notes=f"Identified weakness from {int_obj.company_name} interview: {int_obj.feedback or 'Review core concepts'}"
            )
            db.add(topic)
            
    db.commit()
    db.refresh(int_obj)
    return int_obj
