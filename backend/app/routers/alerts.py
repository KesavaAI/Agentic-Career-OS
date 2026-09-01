from fastapi import APIRouter, Depends, HTTPException, Body, Query
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any

from app.database import get_db
from app.models.job_alert import JobAlert, JobAlertNotification
from app.models.job import Job
from app.models.user import User
from app.dependencies import get_current_user
from app.schemas.job_alert import JobAlertCreate, JobAlertUpdate, JobAlertOut
from app.services.job_alert_monitor import job_alert_monitor

router = APIRouter(prefix="/alerts", tags=["Job Alerts & Continuous Monitoring"])

@router.get("", response_model=List[JobAlertOut])
def list_job_alerts(
    current_user: Optional[User] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns list of all saved search job alerts.
    """
    alerts = db.query(JobAlert).order_by(JobAlert.created_at.desc()).all()
    return alerts

@router.post("", response_model=JobAlertOut)
def create_job_alert(
    alert_in: JobAlertCreate,
    current_user: Optional[User] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Creates a new continuous job search monitoring alert.
    """
    user_id = current_user.id if current_user else None
    alert = JobAlert(
        user_id=user_id,
        title=alert_in.title,
        career=alert_in.career,
        experience_min=alert_in.experience_min,
        experience_max=alert_in.experience_max,
        location=alert_in.location,
        is_remote=alert_in.is_remote,
        min_salary=alert_in.min_salary,
        keywords=alert_in.keywords or [],
        min_match_score=alert_in.min_match_score or 70,
        is_active=alert_in.is_active if alert_in.is_active is not None else True,
        notify_in_app=alert_in.notify_in_app if alert_in.notify_in_app is not None else True,
        notify_email=alert_in.notify_email if alert_in.notify_email is not None else False
    )
    db.add(alert)
    db.commit()
    db.refresh(alert)

    # Trigger immediate baseline scan for this alert
    job_alert_monitor.scan_alert(alert, db=db, force_crawl=False)
    db.refresh(alert)
    return alert

@router.get("/{alert_id}", response_model=JobAlertOut)
def get_job_alert(alert_id: int, db: Session = Depends(get_db)):
    alert = db.query(JobAlert).filter(JobAlert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Job Alert not found")
    return alert

@router.put("/{alert_id}", response_model=JobAlertOut)
def update_job_alert(
    alert_id: int,
    update_data: JobAlertUpdate,
    db: Session = Depends(get_db)
):
    alert = db.query(JobAlert).filter(JobAlert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Job Alert not found")

    for field, val in update_data.dict(exclude_unset=True).items():
        setattr(alert, field, val)

    db.commit()
    db.refresh(alert)
    return alert

@router.delete("/{alert_id}")
def delete_job_alert(alert_id: int, db: Session = Depends(get_db)):
    alert = db.query(JobAlert).filter(JobAlert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Job Alert not found")

    db.delete(alert)
    db.commit()
    return {"success": True, "message": f"Job Alert #{alert_id} deleted successfully"}

@router.post("/{alert_id}/scan")
def trigger_alert_scan(
    alert_id: int,
    force_crawl: bool = Body(False, embed=True),
    db: Session = Depends(get_db)
):
    """
    Triggers an instant continuous monitoring scan for a specific JobAlert.
    """
    alert = db.query(JobAlert).filter(JobAlert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Job Alert not found")

    res = job_alert_monitor.scan_alert(alert, db=db, force_crawl=force_crawl)
    return {
        "success": True,
        "message": f"Scanned alert '{alert.title}': Found {res['total_matched_jobs']} matching opportunities ({res['new_notifications_sent']} new notifications dispatched).",
        "result": res
    }

@router.post("/monitor-all")
def trigger_all_alerts_monitoring(
    force_crawl: bool = Body(False, embed=True),
    db: Session = Depends(get_db)
):
    """
    Runs continuous background monitoring across all active saved search alerts.
    """
    res = job_alert_monitor.monitor_all_active_alerts(db=db, force_crawl=force_crawl)
    return res

@router.get("/{alert_id}/notifications")
def get_alert_notification_history(alert_id: int, db: Session = Depends(get_db)):
    """
    Returns list of all job notifications sent for this saved alert.
    """
    notifs = (
        db.query(JobAlertNotification, Job)
        .join(Job, JobAlertNotification.job_id == Job.id)
        .filter(JobAlertNotification.alert_id == alert_id)
        .order_by(JobAlertNotification.created_at.desc())
        .all()
    )
    history = []
    for an, j in notifs:
        history.append({
            "notification_id": an.id,
            "job_id": j.id,
            "role": j.role,
            "company_name": j.company_name,
            "location": j.location,
            "min_salary": j.min_salary,
            "max_salary": j.max_salary,
            "match_score": an.match_score,
            "channel": an.notification_channel,
            "status": an.status,
            "sent_at": an.created_at.isoformat() if an.created_at else None
        })
    return {"alert_id": alert_id, "total_notifications": len(history), "notifications": history}
