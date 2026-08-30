from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class CompanyBase(BaseModel):
    name: str
    industry: Optional[str] = "Technology / AI"
    website: Optional[str] = None
    career_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    locations: Optional[str] = "Bengaluru, Hyderabad, Remote"
    salary_range_lpa: Optional[str] = "₹18L - ₹32L"
    tier: Optional[str] = "A"
    response_rate: Optional[float] = 0.0
    notes: Optional[str] = None
    is_demo: Optional[bool] = False

class CompanyCreate(CompanyBase):
    pass

class CompanyUpdate(BaseModel):
    name: Optional[str] = None
    industry: Optional[str] = None
    website: Optional[str] = None
    career_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    locations: Optional[str] = None
    salary_range_lpa: Optional[str] = None
    tier: Optional[str] = None
    response_rate: Optional[float] = None
    notes: Optional[str] = None

class CompanyOut(CompanyBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    class Config:
        from_attributes = True
