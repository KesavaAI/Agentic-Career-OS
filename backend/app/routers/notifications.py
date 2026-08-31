from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel

from app.database import get_db
from app.models.notification import Notification
from app.schemas.notification import NotificationOut
from app.services.mobile_gateway import mobile_notification_gateway

router = APIRouter(prefix="/notifications", tags=["Notifications"])

class MobileAlertRequest(BaseModel):
    title: str
    message: str
    priority: Optional[str] = "HIGH"
    webhook_url: Optional[str] = None

@router.get("", response_model=List[NotificationOut])
def list_notifications(db: Session = Depends(get_db)):
    return db.query(Notification).order_by(Notification.created_at.desc()).limit(30).all()

@router.post("/mobile/test-alert")
def send_test_mobile_alert(req: MobileAlertRequest):
    """Sends a test push alert to Telegram Bot or WhatsApp Webhook."""
    return mobile_notification_gateway.send_mobile_alert(
        title=req.title,
        message=req.message,
        priority=req.priority or "HIGH",
        webhook_url=req.webhook_url
    )

@router.put("/{notif_id}/read", response_model=NotificationOut)
def mark_notification_as_read(notif_id: int, db: Session = Depends(get_db)):
    notif = db.query(Notification).filter(Notification.id == notif_id).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    notif.is_read = True
    db.commit()
    db.refresh(notif)
    return notif
