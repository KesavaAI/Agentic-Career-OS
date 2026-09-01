from pydantic import BaseModel, Field
from typing import Optional, List, Any
from datetime import datetime

class JobAlertBase(BaseModel):
    title: str = Field(..., description="Alert title, e.g., 'AI Engineer (0-2 yrs) - Remote'")
    career: str = Field(..., description="Target Career, e.g. 'AI Engineer'")
    experience_min: Optional[float] = 0.0
    experience_max: Optional[float] = 2.0
    location: Optional[str] = "India"
    is_remote: Optional[bool] = True
    min_salary: Optional[float] = 10.0 # LPA
    keywords: Optional[List[str]] = Field(default_factory=list) # e.g. ["RAG", "LLM", "LangChain"]
    min_match_score: Optional[int] = 70
    is_active: Optional[bool] = True
    notify_in_app: Optional[bool] = True
    notify_email: Optional[bool] = False

class JobAlertCreate(JobAlertBase):
    pass

class JobAlertUpdate(BaseModel):
    title: Optional[str] = None
    career: Optional[str] = None
    experience_min: Optional[float] = None
    experience_max: Optional[float] = None
    location: Optional[str] = None
    is_remote: Optional[bool] = None
    min_salary: Optional[float] = None
    keywords: Optional[List[str]] = None
    min_match_score: Optional[int] = None
    is_active: Optional[bool] = None
    notify_in_app: Optional[bool] = None
    notify_email: Optional[bool] = None

class JobAlertOut(JobAlertBase):
    id: int
    user_id: Optional[int] = None
    last_scanned_at: Optional[datetime] = None
    last_result_count: Optional[int] = 0
    total_notifications_sent: Optional[int] = 0
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
