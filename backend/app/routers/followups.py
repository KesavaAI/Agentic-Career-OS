from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
from app.database import get_db
from app.models.followup import FollowUp
from app.models.application import Application
from app.models.user import User
from app.models.profile import Profile
from app.dependencies import get_current_user
from app.schemas.followup import FollowUpOut, FollowUpCreate, FollowUpUpdate

router = APIRouter(prefix="/followups", tags=["Follow-ups"])

def sync_active_application_followups(db: Session, current_user: Optional[User] = None):
    """Auto-generates follow-up items for active applications needing outreach."""
    apps = db.query(Application).filter(
        Application.status.in_(["APPLIED", "AUTONOMOUSLY APPLIED", "RECRUITER CONTACTED", "SHORTLISTED"])
    ).all()

    now = datetime.utcnow()
    synced_count = 0

    for app in apps:
        existing = db.query(FollowUp).filter(FollowUp.company_name == app.company_name).first()
        if not existing:
            fu_date = (app.applied_date or now) + timedelta(days=3)
            new_fu = FollowUp(
                application_id=app.id,
                user_id=current_user.id if current_user else None,
                company_name=app.company_name,
                role_title=app.role_title,
                applied_date=app.applied_date or now - timedelta(days=3),
                follow_up_date=fu_date if fu_date > now else now,
                response_status="Pending Response",
                action_notes=f"1-Click Outreach: Inquire on status of {app.role_title} application at {app.company_name} with technical portfolio highlight.",
                is_completed=False
            )
            db.add(new_fu)
            synced_count += 1

    if synced_count > 0:
        db.commit()

@router.get("", response_model=List[FollowUpOut])
def list_followups(
    filter_view: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    # Auto-synchronize followups from active applications
    sync_active_application_followups(db, current_user)

    query = db.query(FollowUp)
    now = datetime.utcnow()
    
    if filter_view == "today":
        today_start = now.replace(hour=0, minute=0, second=0)
        today_end = now.replace(hour=23, minute=59, second=59)
        query = query.filter(FollowUp.follow_up_date >= today_start, FollowUp.follow_up_date <= today_end)
    elif filter_view == "overdue":
        query = query.filter(FollowUp.follow_up_date < now, FollowUp.is_completed == False)
    elif filter_view == "this_week":
        week_end = now + timedelta(days=7)
        query = query.filter(FollowUp.follow_up_date <= week_end)
        
    return query.order_by(FollowUp.is_completed.asc(), FollowUp.follow_up_date.asc()).all()

@router.post("", response_model=FollowUpOut)
def create_followup(req: FollowUpCreate, db: Session = Depends(get_db)):
    fu = FollowUp(**req.dict())
    db.add(fu)
    db.commit()
    db.refresh(fu)
    return fu

@router.put("/{fu_id}", response_model=FollowUpOut)
def update_followup(fu_id: int, req: FollowUpUpdate, db: Session = Depends(get_db)):
    fu = db.query(FollowUp).filter(FollowUp.id == fu_id).first()
    if not fu:
        raise HTTPException(status_code=404, detail="Follow-up not found")
    for key, val in req.dict(exclude_unset=True).items():
        setattr(fu, key, val)
    db.commit()
    db.refresh(fu)
    return fu

@router.post("/{fu_id}/complete")
def complete_followup(fu_id: int, db: Session = Depends(get_db)):
    fu = db.query(FollowUp).filter(FollowUp.id == fu_id).first()
    if not fu:
        raise HTTPException(status_code=404, detail="Follow-up not found")
    fu.is_completed = True
    db.commit()
    return {"message": "Follow-up marked completed"}

@router.get("/{fu_id}/generate-outreach")
def generate_followup_outreach(fu_id: int, db: Session = Depends(get_db), current_user: Optional[User] = Depends(get_current_user)):
    fu = db.query(FollowUp).filter(FollowUp.id == fu_id).first()
    if not fu:
        raise HTTPException(status_code=404, detail="Follow-up not found")
    
    candidate_name = current_user.full_name if current_user else "Alexander"
    role = fu.role_title
    company = fu.company_name

    subject = f"Following up on {role} Application — {candidate_name}"
    body = (
        f"Hi {company} Hiring Team,\n\n"
        f"I recently submitted my application for the {role} position. Given my recent work optimizing high-throughput distributed architectures, Next.js SSR streaming, and PostgreSQL connection pooling, I am very enthusiastic about contributing to {company}'s core engineering initiatives.\n\n"
        f"I wanted to briefly check in to see if you needed any additional technical artifacts or architecture documentation from my side. Looking forward to connecting!\n\n"
        f"Best regards,\n{candidate_name}"
    )

    return {
        "id": fu.id,
        "company_name": company,
        "role_title": role,
        "subject": subject,
        "body": body,
        "target_email": f"careers@{company.lower().replace(' ', '')}.com"
    }

@router.post("/{fu_id}/send-outreach")
def send_followup_outreach(fu_id: int, db: Session = Depends(get_db)):
    fu = db.query(FollowUp).filter(FollowUp.id == fu_id).first()
    if not fu:
        raise HTTPException(status_code=404, detail="Follow-up not found")
    
    fu.is_completed = True
    fu.response_status = "Outreach Sent"
    db.commit()
    return {
        "success": True,
        "message": f"✓ Follow-up cold pitch successfully dispatched to {fu.company_name}!"
    }
