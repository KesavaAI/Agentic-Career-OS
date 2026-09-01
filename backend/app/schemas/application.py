from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class ApplicationBase(BaseModel):
    job_id: Optional[int] = None
    resume_id: Optional[int] = None
    company_name: str
    role_title: str
    tier: Optional[str] = "A"
    match_score: Optional[int] = 85
    status: Optional[str] = "READY TO APPLY"
    applied_date: Optional[datetime] = None
    deadline: Optional[datetime] = None
    next_action: Optional[str] = "Submit application via career portal"
    follow_up_date: Optional[datetime] = None
    is_user_approved: Optional[bool] = False
    application_reference_id: Optional[str] = None
    source: Optional[str] = "Direct ATS"
    cover_letter_text: Optional[str] = None
    cover_letter_version: Optional[str] = None
    recruiter_name: Optional[str] = None
    recruiter_email: Optional[str] = None
    recruiter_notes: Optional[str] = None
    notes: Optional[str] = None
    is_demo: Optional[bool] = False

class ApplicationCreate(ApplicationBase):
    pass

class ApplicationUpdate(BaseModel):
    resume_id: Optional[int] = None
    status: Optional[str] = None
    applied_date: Optional[datetime] = None
    deadline: Optional[datetime] = None
    next_action: Optional[str] = None
    follow_up_date: Optional[datetime] = None
    is_user_approved: Optional[bool] = None
    application_reference_id: Optional[str] = None
    source: Optional[str] = None
    cover_letter_text: Optional[str] = None
    cover_letter_version: Optional[str] = None
    recruiter_name: Optional[str] = None
    recruiter_email: Optional[str] = None
    recruiter_notes: Optional[str] = None
    notes: Optional[str] = None

class ApplicationOut(ApplicationBase):
    id: int
    user_id: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    class Config:
        from_attributes = True

class ApplicationEventOut(BaseModel):
    id: int
    application_id: int
    from_status: Optional[str] = None
    to_status: str
    notes: Optional[str] = None
    created_at: Optional[datetime] = None
    class Config:
        from_attributes = True

class ApplicationEvidenceCreate(BaseModel):
    application_id: int
    title: str
    evidence_type: str = "DOCUMENT"
    content: Optional[str] = None
    file_url: Optional[str] = None

class ApplicationEvidenceOut(BaseModel):
    id: int
    application_id: int
    title: str
    evidence_type: str
    content: Optional[str] = None
    file_url: Optional[str] = None
    created_at: Optional[datetime] = None
    class Config:
        from_attributes = True
