from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class RecruiterBase(BaseModel):
    company_name: str
    name: str
    role: Optional[str] = "Talent Acquisition / Tech Recruiter"
    email: Optional[str] = None
    linkedin: Optional[str] = None
    contact_date: Optional[datetime] = None
    response: Optional[str] = None
    follow_up_date: Optional[datetime] = None
    status: Optional[str] = "NOT CONTACTED"
    notes: Optional[str] = None
    is_demo: Optional[bool] = False

class RecruiterCreate(RecruiterBase):
    company_id: Optional[int] = None

class RecruiterUpdate(BaseModel):
    company_name: Optional[str] = None
    name: Optional[str] = None
    role: Optional[str] = None
    email: Optional[str] = None
    linkedin: Optional[str] = None
    contact_date: Optional[datetime] = None
    response: Optional[str] = None
    follow_up_date: Optional[datetime] = None
    status: Optional[str] = None
    notes: Optional[str] = None

class RecruiterOut(RecruiterBase):
    id: int
    company_id: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    class Config:
        from_attributes = True

class OutreachTemplateRequest(BaseModel):
    recruiter_name: str
    company_name: str
    role_title: str
    template_type: str # outreach, followup, thank_you, availability
