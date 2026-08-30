from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import Optional, Dict, Any, List

from app.database import get_db
from app.services.email_service import email_service
from app.models.setting import SystemSetting

router = APIRouter(prefix="/email", tags=["Live Email & Gmail Sync"])

class EmailCredentialsRequest(BaseModel):
    email: Optional[str] = None
    app_password: Optional[str] = None

class SendOutreachRequest(BaseModel):
    to_email: str
    subject: str
    body: str
    sender_email: Optional[str] = None
    app_password: Optional[str] = None

@router.post("/test-connection")
def test_email_connection(req: EmailCredentialsRequest, db: Session = Depends(get_db)):
    pwd = req.app_password
    if not pwd:
        # Check settings table
        stored_pw = db.query(SystemSetting).filter(SystemSetting.key == "GMAIL_APP_PASSWORD").first()
        if stored_pw and stored_pw.value:
            pwd = stored_pw.value

    result = email_service.test_connection(req.email, pwd)
    return result

@router.post("/sync")
def sync_gmail_inbox(req: Optional[EmailCredentialsRequest] = None, db: Session = Depends(get_db)):
    email_addr = req.email if req else None
    pwd = req.app_password if req else None

    if not pwd:
        stored_pw = db.query(SystemSetting).filter(SystemSetting.key == "GMAIL_APP_PASSWORD").first()
        if stored_pw and stored_pw.value:
            pwd = stored_pw.value

    result = email_service.sync_inbox(db, email_addr, pwd)
    return result

@router.post("/send-outreach")
def send_recruiter_outreach(req: SendOutreachRequest, db: Session = Depends(get_db)):
    pwd = req.app_password
    if not pwd:
        stored_pw = db.query(SystemSetting).filter(SystemSetting.key == "GMAIL_APP_PASSWORD").first()
        if stored_pw and stored_pw.value:
            pwd = stored_pw.value

    result = email_service.send_outreach_email(
        to_email=req.to_email,
        subject=req.subject,
        body=req.body,
        db=db,
        user_email=req.sender_email,
        app_password=pwd
    )
    return result

@router.get("/status")
def get_email_status(db: Session = Depends(get_db)):
    stored_pw = db.query(SystemSetting).filter(SystemSetting.key == "GMAIL_APP_PASSWORD").first()
    has_pwd = bool(stored_pw and stored_pw.value)
    
    return {
        "configured_email": "kesavac913@gmail.com",
        "has_app_password": has_pwd,
        "imap_server": "imap.gmail.com:993 (SSL)",
        "smtp_server": "smtp.gmail.com:465 (SSL)",
        "auto_sync_supported": True
    }
