from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ProfileBase(BaseModel):
    full_name: str = "Kesava"
    title: str = "GenAI / Agentic AI Engineer"
    current_company: str = "Tata Consultancy Services (TCS)"
    current_ctc_lpa: float = 3.5
    target_ctc_lpa: float = 18.0
    experience_years: float = 1.6
    preferred_locations: str
    target_roles: str
    primary_skills: str
    secondary_skills: Optional[str] = None
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    bio: Optional[str] = None

class ProfileUpdate(ProfileBase):
    pass

class ProfileOut(ProfileBase):
    id: int
    user_id: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    class Config:
        from_attributes = True
