from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.notification import Notification
from app.schemas.notification import NotificationOut

router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.get("", response_model=List[NotificationOut])
def list_notifications(db: Session = Depends(get_db)):
    notifs = db.query(Notification).order_by(Notification.created_at.desc()).all()
    if not notifs:
        # Default sample notifications
        notifs = [
            Notification(type="TIER_A", title="New Tier-A Job Discovered", message="Microsoft India R&D posted 'GenAI Platform Engineer' (₹24L-₹36L)", urgency="High", link="/jobs"),
            Notification(type="FOLLOW_UP", title="Follow-up Due Today", message="Follow up with Swiggy recruiter regarding Technical Round 1 schedule", urgency="Urgent", link="/follow-ups"),
            Notification(type="LEARN", title="Spaced Repetition Recall Due", message="Review 'LLM Evaluation Metrics (Ragas)' Day-3 check-in", urgency="Medium", link="/learning")
        ]
        for n in notifs:
            db.add(n)
        db.commit()
    return notifs

@router.post("/{notif_id}/read")
def mark_read(notif_id: int, db: Session = Depends(get_db)):
    n = db.query(Notification).filter(Notification.id == notif_id).first()
    if n:
        n.is_read = True
        db.commit()
    return {"status": "ok"}
