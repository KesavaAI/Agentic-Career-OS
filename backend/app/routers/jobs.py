from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
from app.database import get_db
from app.models.job import Job
from app.models.job_match import JobMatch
from app.models.profile import Profile
from app.models.application import Application
from app.schemas.job import JobOut, JobCreate, JobUpdate, BulkJobAction, JobIngestRequest
from app.schemas.job_match import JobMatchOut
from app.services.jd_extractor import jd_extractor
from app.services.matcher import job_matcher
from app.services.duplicate_detector import duplicate_detector
from app.services.audit_service import audit_service
from app.services.security_middleware import is_safe_url

router = APIRouter(prefix="/jobs", tags=["Jobs"])

@router.get("", response_model=List[JobOut])
def list_jobs(
    tier: Optional[str] = None,
    status: Optional[str] = None,
    location: Optional[str] = None,
    search: Optional[str] = None,
    min_salary: Optional[float] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    query = db.query(Job).filter(Job.is_archived == False)
    if tier:
        query = query.filter(Job.tier == tier.upper())
    if status:
        query = query.filter(Job.status == status)
    if location:
        query = query.filter(Job.location.ilike(f"%{location}%"))
    if min_salary:
        query = query.filter(Job.max_salary >= min_salary)
    if search:
        s = f"%{search}%"
        query = query.filter((Job.role.ilike(s)) | (Job.company_name.ilike(s)) | (Job.description.ilike(s)))
    
    query = query.order_by(Job.priority_score.desc(), Job.created_at.desc())
    return query.offset(skip).limit(limit).all()

@router.get("/{job_id}", response_model=JobOut)
def get_job(job_id: int, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job

@router.post("", response_model=JobOut)
def create_job(req: JobCreate, db: Session = Depends(get_db)):
    # Duplicate check
    existing_jobs = [j.__dict__ for j in db.query(Job).all()]
    dup_res = duplicate_detector.check_duplicate(req.dict(), existing_jobs)
    
    job = Job(**req.dict())
    db.add(job)
    db.commit()
    db.refresh(job)
    
    # Auto analyze match
    profile = db.query(Profile).first()
    p_dict = profile.__dict__ if profile else {}
    match_data = job_matcher.calculate_match(job.__dict__, p_dict)
    
    job.tier = match_data["tier"]
    job.priority_score = match_data["priority_score"]
    job.match_score = match_data["overall_score"]
    
    # Save JobMatch record
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

    # Automatically sync with candidate application funnel
    if req.status and req.status != prev_status:
        existing_app = db.query(Application).filter(Application.job_id == job.id).first()
        if existing_app:
            existing_app.status = req.status
            if "APPLIED" in req.status.upper() and not existing_app.applied_date:
                existing_app.applied_date = datetime.utcnow()
                existing_app.follow_up_date = datetime.utcnow() + timedelta(days=5)
            db.commit()
        elif "APPLIED" in req.status.upper() or req.status in ["INTERVIEW 1", "TECHNICAL ROUND", "HR ROUND", "OFFER"]:
            new_app = Application(
                job_id=job.id,
                company_name=job.company_name,
                role_title=job.role,
                tier=job.tier or "A",
                match_score=job.match_score or 90,
                status=req.status,
                applied_date=datetime.utcnow(),
                next_action="Monitor inbox for recruiter screening and follow-ups",
                follow_up_date=datetime.utcnow() + timedelta(days=5),
                is_user_approved=True
            )
            db.add(new_app)
            db.commit()

    audit_service.log(db, "system@career.local", "UPDATE", "Job", job.id, f"Status: {prev_status}", f"Status: {job.status}")
    return job

@router.delete("/{job_id}")
def delete_job(job_id: int, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    db.delete(job)
    db.commit()
    audit_service.log(db, "system@career.local", "DELETE", "Job", job_id, None, "Deleted job")
    return {"message": "Job deleted successfully"}

@router.post("/bulk")
def bulk_job_action(req: BulkJobAction, db: Session = Depends(get_db)):
    jobs = db.query(Job).filter(Job.id.in_(req.job_ids)).all()
    if req.action == "delete":
        for j in jobs:
            db.delete(j)
    elif req.action == "archive":
        for j in jobs:
            j.is_archived = True
    elif req.action == "set_status" and req.value:
        for j in jobs:
            j.status = req.value
    elif req.action == "set_tier" and req.value:
        for j in jobs:
            j.tier = req.value
    db.commit()
    return {"message": f"Bulk action '{req.action}' applied to {len(jobs)} jobs"}

@router.post("/ingest", response_model=JobOut)
def ingest_job(req: JobIngestRequest, db: Session = Depends(get_db)):
    if req.url and not is_safe_url(req.url):
        raise HTTPException(status_code=400, detail="Invalid or unsafe Job URL. Only public HTTP/HTTPS URLs are allowed.")
    
    extracted = jd_extractor.extract_from_text(req.raw_text or "")
    if req.url:
        extracted["job_url"] = req.url
    extracted["source"] = req.source or "Direct Ingestion"
    
    job_create = JobCreate(**extracted)
    return create_job(job_create, db)

@router.post("/{job_id}/analyze", response_model=JobMatchOut)
def analyze_job(job_id: int, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    profile = db.query(Profile).first()
    p_dict = profile.__dict__ if profile else {}
    match_data = job_matcher.calculate_match(job.__dict__, p_dict)
    
    job.tier = match_data["tier"]
    job.priority_score = match_data["priority_score"]
    job.match_score = match_data["overall_score"]
    
    jm = db.query(JobMatch).filter(JobMatch.job_id == job.id).first()
    if not jm:
        jm = JobMatch(job_id=job.id)
        db.add(jm)
        
    for k, v in match_data.items():
        if k in JobMatch.__table__.columns.keys():
            setattr(jm, k, v)
            
    db.commit()
    db.refresh(jm)
    return jm
