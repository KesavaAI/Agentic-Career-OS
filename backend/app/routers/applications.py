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

@router.get("/analytics/summary")
def get_application_analytics_summary(db: Session = Depends(get_db)):
    apps = db.query(Application).all()
    total_apps = len(apps)

    if total_apps == 0:
        return {
            "total_applications": 0,
            "active_applications": 0,
            "applied_count": 0,
            "response_rate": 0.0,
            "interview_rate": 0.0,
            "offer_rate": 0.0,
            "rejection_rate": 0.0,
            "stage_counts": {
                "SAVED": 0, "PREPARING": 0, "APPLIED": 0, "ASSESSMENT": 0,
                "RECRUITER_SCREEN": 0, "INTERVIEW": 0, "FINAL_ROUND": 0,
                "OFFER": 0, "REJECTED": 0, "WITHDRAWN": 0
            },
            "conversion_rates": {
                "applied_to_response": 0.0,
                "response_to_interview": 0.0,
                "interview_to_offer": 0.0
            }
        }

    status_map = {
        "SAVED": 0, "PREPARING": 0, "APPLIED": 0, "ASSESSMENT": 0,
        "RECRUITER_SCREEN": 0, "INTERVIEW": 0, "FINAL_ROUND": 0,
        "OFFER": 0, "REJECTED": 0, "WITHDRAWN": 0
    }

    applied_count = 0
    responded_count = 0
    interview_count = 0
    offer_count = 0
    rejection_count = 0
    active_count = 0

    for a in apps:
        st_upper = (a.status or "").upper()
        if "SAVE" in st_upper or "READY" in st_upper or "SHORTLIST" in st_upper:
            status_map["SAVED"] += 1
        elif "PREPAR" in st_upper:
            status_map["PREPARING"] += 1
        elif "APPLIED" in st_upper or "SUBMIT" in st_upper or "CONFIRM" in st_upper:
            status_map["APPLIED"] += 1
            applied_count += 1
        elif "ASSESS" in st_upper or "OA" in st_upper:
            status_map["ASSESSMENT"] += 1
            applied_count += 1
            responded_count += 1
        elif "RECRUITER" in st_upper or "SCREEN" in st_upper:
            status_map["RECRUITER_SCREEN"] += 1
            applied_count += 1
            responded_count += 1
            interview_count += 1
        elif "INTERVIEW" in st_upper or "TECH" in st_upper or "DESIGN" in st_upper:
            status_map["INTERVIEW"] += 1
            applied_count += 1
            responded_count += 1
            interview_count += 1
        elif "FINAL" in st_upper or "MANAGERIAL" in st_upper or "HR" in st_upper:
            status_map["FINAL_ROUND"] += 1
            applied_count += 1
            responded_count += 1
            interview_count += 1
        elif "OFFER" in st_upper:
            status_map["OFFER"] += 1
            applied_count += 1
            responded_count += 1
            interview_count += 1
            offer_count += 1
        elif "REJECT" in st_upper:
            status_map["REJECTED"] += 1
            rejection_count += 1
        elif "WITHDRAW" in st_upper:
            status_map["WITHDRAWN"] += 1
        else:
            status_map["SAVED"] += 1

        if st_upper not in ["REJECTED", "WITHDRAWN"]:
            active_count += 1

    denom = max(applied_count, 1) if applied_count > 0 else max(total_apps, 1)
    response_rate = round((responded_count / denom) * 100, 1)
    interview_rate = round((interview_count / denom) * 100, 1)
    offer_rate = round((offer_count / denom) * 100, 1)
    rejection_rate = round((rejection_count / max(total_apps, 1)) * 100, 1)

    return {
        "total_applications": total_apps,
        "active_applications": active_count,
        "applied_count": applied_count,
        "response_rate": response_rate,
        "interview_rate": interview_rate,
        "offer_rate": offer_rate,
        "rejection_rate": rejection_rate,
        "stage_counts": status_map,
        "conversion_rates": {
            "applied_to_response": response_rate,
            "response_to_interview": round((interview_count / max(responded_count, 1)) * 100, 1) if responded_count else 0.0,
            "interview_to_offer": round((offer_count / max(interview_count, 1)) * 100, 1) if interview_count else 0.0
        }
    }
