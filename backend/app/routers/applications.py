from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
from app.database import get_db
from app.models.application import Application, ApplicationEvent, ApplicationEvidence
from app.models.job import Job
from app.models.interview import Interview
from app.models.offer import Offer
from app.models.followup import FollowUp
from app.schemas.application import (
    ApplicationOut, ApplicationCreate, ApplicationUpdate,
    ApplicationEventOut, ApplicationEvidenceCreate, ApplicationEvidenceOut
)
from app.services.audit_service import audit_service

router = APIRouter(prefix="/applications", tags=["Applications"])

@router.get("", response_model=List[ApplicationOut])
def list_applications(status: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Application)
    if status:
        query = query.filter(Application.status == status)
    return query.order_by(Application.created_at.desc()).all()

@router.get("/{app_id}", response_model=ApplicationOut)
def get_application(app_id: int, db: Session = Depends(get_db)):
    app = db.query(Application).filter(Application.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    return app

@router.post("", response_model=ApplicationOut)
def create_application(req: ApplicationCreate, db: Session = Depends(get_db)):
    app = Application(**req.dict())
    if app.status == "APPLIED" and not app.applied_date:
        app.applied_date = datetime.utcnow()
        app.follow_up_date = datetime.utcnow() + timedelta(days=7)
        
    db.add(app)
    db.commit()
    db.refresh(app)
    
    # Record initial event
    evt = ApplicationEvent(application_id=app.id, from_status=None, to_status=app.status, notes="Application created")
    db.add(evt)
    
    # Sync job status
    job = db.query(Job).filter(Job.id == app.job_id).first()
    if job:
        job.status = app.status
        job.applied_date = app.applied_date
        
    # Create auto follow-up if applied
    if app.status == "APPLIED":
        fu = FollowUp(
            application_id=app.id,
            company_name=app.company_name,
            role_title=app.role_title,
            applied_date=app.applied_date,
            follow_up_date=datetime.utcnow() + timedelta(days=7),
            action_notes="Follow up with hiring team"
        )
        db.add(fu)
        
    db.commit()
    audit_service.log(db, "kesava@career.local", "CREATE", "Application", app.id, None, f"Applied to {app.company_name}")
    return app

@router.put("/{app_id}", response_model=ApplicationOut)
def update_application(app_id: int, req: ApplicationUpdate, db: Session = Depends(get_db)):
    app = db.query(Application).filter(Application.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    
    prev_status = app.status
    for key, val in req.dict(exclude_unset=True).items():
        setattr(app, key, val)
        
    if req.status and req.status != prev_status:
        # Status change triggers
        evt = ApplicationEvent(application_id=app.id, from_status=prev_status, to_status=req.status, notes=req.notes)
        db.add(evt)
        
        # If changed to APPLIED, set timestamp and follow up
        if req.status == "APPLIED" and not app.applied_date:
            app.applied_date = datetime.utcnow()
            app.follow_up_date = datetime.utcnow() + timedelta(days=7)
            
        # If changed to INTERVIEW stage, create interview record if not existing
        if "INTERVIEW" in req.status or "ROUND" in req.status or req.status in ["OA / ASSESSMENT", "TECHNICAL ROUND", "SYSTEM DESIGN", "MANAGERIAL ROUND", "HR ROUND"]:
            existing_int = db.query(Interview).filter(Interview.application_id == app.id, Interview.stage == req.status).first()
            if not existing_int:
                new_int = Interview(
                    application_id=app.id,
                    job_id=app.job_id,
                    company_name=app.company_name,
                    role_title=app.role_title,
                    stage=req.status,
                    scheduled_at=datetime.utcnow() + timedelta(days=2),
                    time_str="11:00 AM IST",
                    status="SCHEDULED"
                )
                db.add(new_int)
                
        # If changed to OFFER, create offer record
        if req.status in ["OFFER", "OFFER ACCEPTED"]:
            existing_offer = db.query(Offer).filter(Offer.application_id == app.id).first()
            if not existing_offer:
                new_offer = Offer(
                    application_id=app.id,
                    company_name=app.company_name,
                    role=app.role_title,
                    total_ctc_lpa=24.0,
                    fixed_lpa=20.0,
                    variable_lpa=4.0,
                    status="RECEIVED"
                )
                db.add(new_offer)
                
        # Sync Job
        job = db.query(Job).filter(Job.id == app.job_id).first()
        if job:
            job.status = req.status
            if app.applied_date:
                job.applied_date = app.applied_date

    db.commit()
    db.refresh(app)
    audit_service.log(db, "kesava@career.local", "STATUS_CHANGE", "Application", app.id, prev_status, app.status)
    return app

@router.get("/{app_id}/events", response_model=List[ApplicationEventOut])
def get_application_events(app_id: int, db: Session = Depends(get_db)):
    return db.query(ApplicationEvent).filter(ApplicationEvent.application_id == app_id).order_by(ApplicationEvent.created_at.desc()).all()

@router.get("/{app_id}/evidence", response_model=List[ApplicationEvidenceOut])
def get_application_evidence(app_id: int, db: Session = Depends(get_db)):
    return db.query(ApplicationEvidence).filter(ApplicationEvidence.application_id == app_id).all()

@router.post("/{app_id}/evidence", response_model=ApplicationEvidenceOut)
def add_application_evidence(app_id: int, req: ApplicationEvidenceCreate, db: Session = Depends(get_db)):
    ev = ApplicationEvidence(**req.dict())
    db.add(ev)
    db.commit()
    db.refresh(ev)
    return ev

@router.delete("/{app_id}")
def delete_application(app_id: int, db: Session = Depends(get_db)):
    app = db.query(Application).filter(Application.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    
    # Clean related followups & events
    db.query(FollowUp).filter(FollowUp.application_id == app_id).delete()
    db.query(ApplicationEvent).filter(ApplicationEvent.application_id == app_id).delete()
    db.query(ApplicationEvidence).filter(ApplicationEvidence.application_id == app_id).delete()
    db.delete(app)
    db.commit()
    return {"success": True, "message": f"Application #{app_id} deleted successfully"}

@router.post("/clear-all")
def clear_all_applications(db: Session = Depends(get_db)):
    db.query(ApplicationEvidence).delete()
    db.query(ApplicationEvent).delete()
    db.query(FollowUp).delete()
    count = db.query(Application).delete()
    db.commit()
    return {"success": True, "message": f"Cleared {count} applications from pipeline"}
