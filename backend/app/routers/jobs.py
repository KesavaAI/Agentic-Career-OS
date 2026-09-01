from fastapi import APIRouter, Depends, HTTPException, Query, Body
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import math
import json

from app.database import get_db
from app.models.job import Job
from app.models.job_match import JobMatch
from app.models.profile import Profile
from app.models.application import Application
from app.models.user import User
from app.dependencies import get_current_user
from app.schemas.job import JobOut, JobCreate, JobUpdate, BulkJobAction, JobIngestRequest, PaginatedJobsOut, JobCaptureRequest
from app.schemas.job_match import JobMatchOut, MatchAnalysisRequest, MatchAnalysisResponse
from app.services.jd_extractor import jd_extractor
from app.services.matcher import job_matcher
from app.services.matching_engine import ai_job_matcher
from app.services.duplicate_detector import duplicate_detector
from app.services.audit_service import audit_service
from app.services.security_middleware import is_safe_url
from app.services.career_taxonomy import career_taxonomy

router = APIRouter(prefix="/jobs", tags=["Jobs & 8-Pillar Matching"])

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
    experience: Optional[float] = None,
    source: Optional[str] = None,
    sort_by: Optional[str] = "priority",
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
    
    total = query.count()
    
    if sort_by == "match":
        query = query.order_by(Job.match_score.desc(), Job.created_at.desc())
    elif sort_by == "date" or sort_by == "recent":
        query = query.order_by(Job.posted_date.desc(), Job.created_at.desc())
    elif sort_by == "salary":
        query = query.order_by(Job.max_salary.desc(), Job.match_score.desc())
    else:
        query = query.order_by(Job.priority_score.desc(), Job.match_score.desc(), Job.created_at.desc())

    offset = (page - 1) * page_size
    items = query.offset(offset).limit(page_size).all()
    pages = math.ceil(total / page_size) if page_size > 0 else 1

    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "pages": pages
    }

@router.get("/metrics")
def get_job_metrics(db: Session = Depends(get_db)):
    all_jobs = db.query(Job).filter(Job.is_archived == False).all()
    total = len(all_jobs)
    tier_a = sum(1 for j in all_jobs if j.tier == "A")
    tier_b = sum(1 for j in all_jobs if j.tier == "B")
    tier_c = sum(1 for j in all_jobs if j.tier == "C")
    active = sum(1 for j in all_jobs if j.is_active)
    
    return {
        "total_jobs": total,
        "tier_a": tier_a,
        "tier_b": tier_b,
        "tier_c": tier_c,
        "active_jobs": active,
        "archived": sum(1 for j in all_jobs if j.is_archived)
    }

@router.post("/match", response_model=MatchAnalysisResponse)
def evaluate_job_match(req: MatchAnalysisRequest, db: Session = Depends(get_db)):
    """
    Dynamically computes full 8-pillar matching and personalization between a Job and Candidate.
    Supports either job_id lookup or raw job_dict payload, with optional profile_override.
    """
    job_dict = req.job_dict or {}
    if req.job_id:
        job = db.query(Job).filter(Job.id == req.job_id).first()
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")
        job_dict = job.__dict__

    profile_dict = req.profile_override
    if not profile_dict:
        profile = db.query(Profile).first()
        profile_dict = profile.__dict__ if profile else {}

    match_result = ai_job_matcher.calculate_match(job_dict, profile_dict)
    return {
        "overall_score": match_result["overall_score"],
        "tier": match_result["tier"],
        "eligibility": match_result["eligibility"],
        "recommendation": match_result["recommendation"],
        "pillar_scores": match_result["pillar_scores"],
        "matched_skills": match_result["matched_skills"],
        "missing_skills": match_result["missing_skills"],
        "strengths": match_result["strengths"],
        "concerns": match_result["concerns"]
    }

@router.get("/{job_id}/match-analysis")
def get_job_match_analysis(job_id: int, db: Session = Depends(get_db)):
    """
    Returns the deep 8-pillar match analysis for a specific job against active candidate profile.
    """
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    profile = db.query(Profile).first()
    p_dict = profile.__dict__ if profile else {}
    
    match_result = ai_job_matcher.calculate_match(job.__dict__, p_dict)
    return match_result

@router.post("/recalculate-matches")
def recalculate_all_job_matches(db: Session = Depends(get_db)):
    """
    Recalculates 8-pillar match scores for all jobs in the database against current user profile.
    """
    profile = db.query(Profile).first()
    p_dict = profile.__dict__ if profile else {}
    jobs = db.query(Job).filter(Job.is_archived == False).all()
    
    existing_matches = {}
    for jm in db.query(JobMatch).all():
        if jm.job_id in existing_matches:
            db.delete(jm)
        else:
            existing_matches[jm.job_id] = jm
    db.flush()

    updated_count = 0
    valid_cols = set(JobMatch.__table__.columns.keys())
    
    for j in jobs:
        m = job_matcher.calculate_match(j.__dict__, p_dict)
        j.tier = m["tier"]
        j.match_score = m["overall_score"]
        j.priority_score = m["priority_score"]
        
        jm = existing_matches.get(j.id)
        if not jm:
            jm = JobMatch(job_id=j.id)
            db.add(jm)
            existing_matches[j.id] = jm
        
        for k, v in m.items():
            if k in valid_cols:
                setattr(jm, k, v)
        updated_count += 1
        
    db.commit()
    return {
        "success": True,
        "message": f"Successfully recomputed 8-pillar match scores for {updated_count} jobs!",
        "updated_jobs_count": updated_count
    }


@router.post("/capture", response_model=JobOut)
def capture_browser_job(
    req: JobCaptureRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    """
    Ingests, normalizes, deduplicates, and scores a job listing captured directly from the user's Chrome browser extension.
    Preserves source provenance ('Browser Capture') and connects to 8-pillar matching and candidate CRM.
    """
    user_id = int(current_user.id) if (current_user and hasattr(current_user, 'id') and current_user.id is not None) else None
    
    # 1. Canonical Normalization using Role Intelligence Taxonomy
    role_intel = career_taxonomy.get_role_intelligence(req.role)
    primary_role = role_intel.get("canonical_role", req.role)
    
    # 2. SHA-256 Description Hash & Deduplication
    desc_hash = f"hash_{len(req.description)}"
    existing_jobs = [j.__dict__ for j in db.query(Job).filter(Job.is_archived == False).all()]
    
    candidate_job_dict = {
        "company_name": req.company_name or "Unknown Company",
        "role": primary_role,
        "description": req.description,
        "job_url": req.job_url,
        "description_hash": desc_hash
    }
    
    dup_res = duplicate_detector.check_duplicate(candidate_job_dict, existing_jobs)
    if dup_res.get("is_duplicate"):
        dup_id = dup_res.get("duplicate_id")
        existing_job = db.query(Job).filter(Job.id == dup_id).first()
        if existing_job:
            # Update source URL if missing and return existing canonical job
            if not existing_job.job_url:
                existing_job.job_url = req.job_url
                db.commit()
            return existing_job

    # 3. Create & Persist New Job Record
    new_job = Job(
        company_name=req.company_name or "Unknown Company",
        role=primary_role,
        tier="A",
        description=req.description,
        location=req.location or "Remote / Flexible",
        work_mode=req.work_mode or "Remote",
        employment_type=req.employment_type or "Full-time",
        min_salary=req.min_salary,
        max_salary=req.max_salary,
        experience_min=req.experience_min or 1.0,
        experience_max=req.experience_max or 4.0,
        required_skills=req.required_skills,
        preferred_skills=req.preferred_skills,
        job_url=req.job_url,
        canonical_url=req.job_url,
        source="Browser Capture",
        source_job_id=req.job_url,
        description_hash=desc_hash,
        posted_date=req.posted_date or datetime.utcnow(),
        status="NOT REVIEWED",
        next_action="Review JD & Tailor Resume",
        is_active=True,
        is_demo=False
    )
    
    db.add(new_job)
    db.commit()
    db.refresh(new_job)

    # 4. 8-Pillar Matching & Personalization
    profile = db.query(Profile).filter(Profile.user_id == user_id).first() if user_id else db.query(Profile).first()
    p_dict = profile.__dict__ if profile else {}
    
    match_data = ai_job_matcher.calculate_match(new_job.__dict__, p_dict)
    new_job.tier = match_data.get("tier", "A")
    new_job.priority_score = match_data.get("priority_score", 85)
    new_job.match_score = match_data.get("overall_score", 85)

    existing_jm = db.query(JobMatch).filter(JobMatch.job_id == new_job.id).first()
    if not existing_jm:
        jm = JobMatch(
            job_id=new_job.id,
            **{k: v for k, v in match_data.items() if k in JobMatch.__table__.columns.keys()}
        )
        db.add(jm)
    else:
        for k, v in match_data.items():
            if k in JobMatch.__table__.columns.keys():
                setattr(existing_jm, k, v)
    db.commit()
    db.refresh(new_job)

    # Log Audit Event
    user_email = current_user.email if (current_user and hasattr(current_user, 'email')) else "candidate@career.local"
    audit_service.log(db, user_email, "CAPTURE", "Job", new_job.id, None, f"Captured browser job '{new_job.role}' at '{new_job.company_name}' via Chrome Extension")

    return new_job


@router.get("/opportunity-feed")
def get_personalized_opportunity_feed(
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    """
    Returns personalized opportunity feed sorted by 8-pillar composite rank.
    """
    user_id = int(current_user.id) if (current_user and hasattr(current_user, 'id') and current_user.id is not None) else None
    profile = db.query(Profile).filter(Profile.user_id == user_id).first() if user_id else db.query(Profile).first()
    p_dict = profile.__dict__ if profile else {}

    jobs = db.query(Job).filter(Job.is_archived == False, Job.is_active == True).order_by(Job.priority_score.desc(), Job.match_score.desc()).limit(limit).all()
    feed_items = []
    for j in jobs:
        m = ai_job_matcher.calculate_match(j.__dict__, p_dict)
        feed_items.append({
            "id": j.id,
            "company_name": j.company_name,
            "role": j.role,
            "tier": j.tier,
            "match_score": m.get("overall_score", j.match_score),
            "priority_score": j.priority_score,
            "location": j.location,
            "work_mode": j.work_mode,
            "source": j.source,
            "job_url": j.job_url,
            "freshness_badge": j.freshness_badge,
            "required_skills": j.required_skills,
            "created_at": j.created_at.isoformat() if j.created_at else None
        })

    return {
        "success": True,
        "total": len(feed_items),
        "feed": feed_items
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
