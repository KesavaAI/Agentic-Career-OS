from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class OfferBase(BaseModel):
    company_name: str
    role: str
    total_ctc_lpa: float = 22.0
    fixed_lpa: float = 18.0
    variable_lpa: float = 4.0
    bonus_lpa: float = 1.5
    esop_lpa: float = 2.0
    location: Optional[str] = "Bengaluru (Hybrid)"
    joining_date: Optional[datetime] = None
    notice_period_days: Optional[int] = 60
    offer_date: Optional[datetime] = None
    status: Optional[str] = "RECEIVED"
    notes: Optional[str] = None
    is_demo: Optional[bool] = False

class OfferCreate(OfferBase):
    application_id: Optional[int] = None

class OfferUpdate(BaseModel):
    company_name: Optional[str] = None
    role: Optional[str] = None
    total_ctc_lpa: Optional[float] = None
    fixed_lpa: Optional[float] = None
    variable_lpa: Optional[float] = None
    bonus_lpa: Optional[float] = None
    esop_lpa: Optional[float] = None
    location: Optional[str] = None
    joining_date: Optional[datetime] = None
    notice_period_days: Optional[int] = None
    offer_date: Optional[datetime] = None
    status: Optional[str] = None
    notes: Optional[str] = None

class OfferOut(OfferBase):
    id: int
    application_id: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    class Config:
        from_attributes = True
