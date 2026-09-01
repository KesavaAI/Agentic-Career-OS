from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.resume import Resume, ResumeVersion
from app.models.job import Job
from app.models.profile import Profile
from app.models.user import User
from app.schemas.resume import (
    ResumeOut, ResumeCreate, ResumeUpdate, ResumeVersionOut,
    ATSAnalysisRequest, ATSAnalysisResponse, ResumeTailorRequest, ResumeTailorResponse
)
from app.services.ats_simulator import ats_simulator
from app.services.resume_tailor import resume_tailor
from app.services.audit_service import audit_service

router = APIRouter(prefix="/resumes", tags=["Resumes"])

@router.get("", response_model=List[ResumeOut])
def list_resumes(db: Session = Depends(get_db)):
    return db.query(Resume).order_by(Resume.is_default.desc(), Resume.created_at.desc()).all()

@router.get("/{resume_id}", response_model=ResumeOut)
def get_resume(resume_id: int, db: Session = Depends(get_db)):
    res = db.query(Resume).filter(Resume.id == resume_id).first()
    if not res:
        raise HTTPException(status_code=404, detail="Resume not found")
    return res

@router.post("", response_model=ResumeOut)
def create_resume(req: ResumeCreate, db: Session = Depends(get_db)):
    res = Resume(**req.dict())
    db.add(res)
    db.commit()
    db.refresh(res)
    audit_service.log(db, "kesava@career.local", "CREATE", "Resume", res.id, None, f"Added resume: {res.name}")
    return res

@router.put("/{resume_id}", response_model=ResumeOut)
def update_resume(resume_id: int, req: ResumeUpdate, db: Session = Depends(get_db)):
    res = db.query(Resume).filter(Resume.id == resume_id).first()
    if not res:
        raise HTTPException(status_code=404, detail="Resume not found")
    for key, val in req.dict(exclude_unset=True).items():
        setattr(res, key, val)
    db.commit()
    db.refresh(res)
    return res

@router.post("/ats-simulate", response_model=ATSAnalysisResponse)
def simulate_ats(req: ATSAnalysisRequest, db: Session = Depends(get_db)):
    resume_text = req.resume_text or ""
    if req.resume_id:
        res = db.query(Resume).filter(Resume.id == req.resume_id).first()
        if res:
            resume_text = res.content_markdown
            
    analysis = ats_simulator.analyze_resume(resume_text, req.job_description)
    return analysis

@router.post("/tailor", response_model=ResumeTailorResponse)
def tailor_resume(req: ResumeTailorRequest, db: Session = Depends(get_db)):
    res = db.query(Resume).filter(Resume.id == req.resume_id).first()
    if not res:
        raise HTTPException(status_code=404, detail="Resume not found")
    job = db.query(Job).filter(Job.id == req.job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
        
    profile = db.query(Profile).first()
    user_prof = profile.__dict__ if profile else {}
    tailored = resume_tailor.tailor_resume(res.content_markdown, job.__dict__, user_prof)
    
    # Save a version record in PostgreSQL
    v_tag = f"Tailored for {job.company_name} - {job.role}"
    rv = ResumeVersion(
        resume_id=res.id,
        job_id=job.id,
        target_company=job.company_name,
        version_tag=v_tag,
        diff_summary=", ".join(tailored["changes_summary"]),
        content_markdown=tailored["tailored_markdown"],
        ats_score=tailored.get("ats_score", 94)
    )
    db.add(rv)
    db.commit()
    db.refresh(rv)

    tailored["version_id"] = rv.id
    tailored["version_tag"] = rv.version_tag
    
    audit_service.log(db, "kesava@career.local", "RESUME_TAILOR", "Resume", res.id, None, f"Tailored for {job.company_name}")
    return tailored

from pydantic import BaseModel

class EnhanceBulletReq(BaseModel):
    bullet: str

@router.post("/enhance-bullet")
def enhance_bullet(req: EnhanceBulletReq):
    text = (req.bullet or "").strip()
    if not text:
        raise HTTPException(status_code=400, detail="Bullet text cannot be empty")
    return resume_tailor.enhance_single_bullet(text)
