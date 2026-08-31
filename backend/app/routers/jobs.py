from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import math

from app.database import get_db
from app.models.job import Job
from app.models.job_match import JobMatch
from app.models.profile import Profile
from app.models.application import Application
from app.schemas.job import JobOut, JobCreate, JobUpdate, BulkJobAction, JobIngestRequest, PaginatedJobsOut
from app.schemas.job_match import JobMatchOut
from app.services.jd_extractor import jd_extractor
from app.services.matcher import job_matcher
from app.services.duplicate_detector import duplicate_detector
from app.services.audit_service import audit_service
from app.services.security_middleware import is_safe_url
from app.services.role_intelligence_engine import role_intelligence_engine

router = APIRouter(prefix="/jobs", tags=["Jobs"])

@router.get("", response_model=List[JobOut])
def list_jobs(
    tier: Optional[str] = None,
    status: Optional[str] = None,
    location: Optional[str] = None,
    work_mode: Optional[str] = None,
    search: Optional[str] = None,
    min_salary: Optional[float] = None,
    experience: Optional[float] = None,
    source: Optional[str] = None,
    sort_by: Optional[str] = "priority", # priority, match, date, salary
    skip: int = 0,
    limit: int = 100,
    is_active_only: bool = True,
    db: Session = Depends(get_db)
):
    query = db.query(Job).filter(Job.is_archived == False)
    if is_active_only:
        query = query.filter(Job.is_active == True)
    if tier and tier != "ALL":
        query = query.filter(Job.tier == tier.upper())
    if status and status != "ALL":
        query = query.filter(Job.status == status)
    if location and location != "ALL":
        query = query.filter(Job.location.ilike(f"%{location}%"))
    if work_mode and work_mode != "ALL":
        query = query.filter(Job.work_mode.ilike(f"%{work_mode}%"))
    if min_salary and min_salary > 0:
        query = query.filter(Job.max_salary >= min_salary)
    if experience:
        query = query.filter(Job.experience_min <= experience, Job.experience_max >= experience)
    if source and source != "ALL":
        query = query.filter(Job.source.ilike(f"%{source}%"))
    if search:
        s = f"%{search.strip()}%"
        query = query.filter((Job.role.ilike(s)) | (Job.company_name.ilike(s)) | (Job.description.ilike(s)) | (Job.required_skills.ilike(s)))
    
    if sort_by == "match":
        query = query.order_by(Job.match_score.desc(), Job.created_at.desc())
    elif sort_by == "date" or sort_by == "recent":
        query = query.order_by(Job.posted_date.desc(), Job.created_at.desc())
    elif sort_by == "salary":
        query = query.order_by(Job.max_salary.desc(), Job.match_score.desc())
    else:
        query = query.order_by(Job.priority_score.desc(), Job.match_score.desc(), Job.created_at.desc())

    return query.offset(skip).limit(limit).all()

@router.get("/paginated", response_model=PaginatedJobsOut)
def list_jobs_paginated(
    page: int = 1,
    page_size: int = 20,
    tier: Optional[str] = None,
    status: Optional[str] = None,
    location: Optional[str] = None,
    work_mode: Optional[str] = None,
    search: Optional[str] = None,
    min_salary: Optional[float] = None,
    source: Optional[str] = None,
    sort_by: Optional[str] = "priority",
    db: Session = Depends(get_db)
):
    query = db.query(Job).filter(Job.is_archived == False, Job.is_active == True)
    if tier and tier != "ALL":
        query = query.filter(Job.tier == tier.upper())
    if status and status != "ALL":
        query = query.filter(Job.status == status)
    if location and location != "ALL":
        query = query.filter(Job.location.ilike(f"%{location}%"))
    if work_mode and work_mode != "ALL":
        query = query.filter(Job.work_mode.ilike(f"%{work_mode}%"))
    if min_salary and min_salary > 0:
        query = query.filter(Job.max_salary >= min_salary)
    if source and source != "ALL":
        query = query.filter(Job.source.ilike(f"%{source}%"))
    if search:
        s = f"%{search.strip()}%"
        query = query.filter((Job.role.ilike(s)) | (Job.company_name.ilike(s)) | (Job.description.ilike(s)))

    total = query.count()
    total_pages = max(1, math.ceil(total / page_size))
    skip = (page - 1) * page_size

    if sort_by == "match":
        query = query.order_by(Job.match_score.desc(), Job.created_at.desc())
    elif sort_by == "recent" or sort_by == "date":
        query = query.order_by(Job.posted_date.desc(), Job.created_at.desc())
    elif sort_by == "salary":
        query = query.order_by(Job.max_salary.desc())
    else:
        query = query.order_by(Job.priority_score.desc(), Job.created_at.desc())

    jobs = query.offset(skip).limit(page_size).all()
    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
        "jobs": jobs
    }

@router.get("/{job_id}", response_model=JobOut)
def get_job(job_id: int, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job

@router.post("", response_model=JobOut)
def create_job(req: JobCreate, db: Session = Depends(get_db)):
    existing_jobs = [j.__dict__ for j in db.query(Job).all()]
    dup_res = duplicate_detector.check_duplicate(req.dict(), existing_jobs)
    
    job = Job(**req.dict())
    db.add(job)
    db.commit()
    db.refresh(job)
    
    profile = db.query(Profile).first()
    p_dict = profile.__dict__ if profile else {}
    match_data = job_matcher.calculate_match(job.__dict__, p_dict)
    
    job.tier = match_data["tier"]
    job.priority_score = match_data["priority_score"]
    job.match_score = match_data["overall_score"]
    
    jm = JobMatch(job_id=job.id, **{k: v for k, v in match_data.items() if k in JobMatch.__table__.columns.keys()})
    db.add(jm)
    db.commit()
    db.refresh(job)
    
    audit_service.log(db, "kesava@career.local", "CREATE", "Job", job.id, None, f"Created {job.role} at {job.company_name}")
    return job

@router.put("/{job_id}", response_model=JobOut)
def update_job(job_id: int, req: JobUpdate, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    prev_status = job.status
    for key, val in req.dict(exclude_unset=True).items():
        setattr(job, key, val)
        
    db.commit()
    db.refresh(job)

    if req.status and req.status != prev_status:
        existing_app = db.query(Application).filter(Application.job_id == job.id).first()
        if existing_app:
            existing_app.status = req.status
            db.commit()
            
    return job

@router.delete("/{job_id}")
def delete_job(job_id: int, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    db.delete(job)
    db.commit()
    audit_service.log(db, "kesava@career.local", "DELETE", "Job", job_id, None, f"Deleted job {job_id}")
    return {"message": "Job deleted successfully"}

@router.post("/batch-auto-apply")
def batch_auto_apply(req: Dict[str, List[int]], db: Session = Depends(get_db)):
    job_ids = req.get("job_ids", [])
    if not job_ids:
        raise HTTPException(status_code=400, detail="No job IDs provided")
        
    jobs = db.query(Job).filter(Job.id.in_(job_ids)).all()
    applied_count = 0
    
    for j in jobs:
        j.status = "AUTONOMOUSLY APPLIED"
        existing = db.query(Application).filter(Application.job_id == j.id).first()
        if not existing:
            app = Application(
                job_id=j.id,
                company_name=j.company_name,
                role_title=j.role,
                tier=j.tier,
                match_score=j.match_score or 90,
                status="AUTONOMOUSLY APPLIED",
                applied_date=datetime.utcnow(),
                next_action="Review Top 50 Scenario Interview Pack",
                is_user_approved=True
            )
            db.add(app)
        applied_count += 1
        
    db.commit()
    return {"success": True, "applied_count": applied_count, "message": f"Successfully auto-applied to {applied_count} Tier-A opportunities!"}

@router.post("/auto-classify-and-clean")
def auto_classify_and_clean_jobs(db: Session = Depends(get_db)):
    jobs = db.query(Job).all()
    cleaned = 0
    for j in jobs:
        norm = role_intelligence_engine.normalize_title(j.role)
        j.role = norm["canonical_role"]
        cleaned += 1
    db.commit()
    return {"success": True, "cleaned_count": cleaned, "message": f"Cleaned & normalized {cleaned} job titles via Career Taxonomy!"}
