from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class FollowUpBase(BaseModel):
    company_name: str
    role_title: str
    applied_date: Optional[datetime] = None
    follow_up_date: datetime
    last_contact: Optional[datetime] = None
    response_status: Optional[str] = "No Response"
    action_notes: Optional[str] = "Send polite follow-up email on application status"
    is_completed: Optional[bool] = False
    is_demo: Optional[bool] = False

class FollowUpCreate(FollowUpBase):
    application_id: Optional[int] = None
    recruiter_id: Optional[int] = None

class FollowUpUpdate(BaseModel):
    company_name: Optional[str] = None
    role_title: Optional[str] = None
    applied_date: Optional[datetime] = None
    follow_up_date: Optional[datetime] = None
    last_contact: Optional[datetime] = None
    response_status: Optional[str] = None
    action_notes: Optional[str] = None
    is_completed: Optional[bool] = None

class FollowUpOut(FollowUpBase):
    id: int
    application_id: Optional[int] = None
    recruiter_id: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    class Config:
        from_attributes = True
