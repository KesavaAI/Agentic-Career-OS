from sqlalchemy import Column, Integer, String, Float, Text, DateTime, Boolean
from sqlalchemy.sql import func
from app.database import Base

class Company(Base):
    __tablename__ = "companies"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), unique=True, index=True, nullable=False)
    industry = Column(String(255), default="Technology / AI")
    website = Column(String(255), nullable=True)
    career_url = Column(String(500), nullable=True)
    linkedin_url = Column(String(500), nullable=True)
    locations = Column(String(255), default="Bengaluru, Hyderabad, Remote")
    salary_range_lpa = Column(String(100), default="₹18L - ₹32L")
    tier = Column(String(10), default="A") # A, B, C
    response_rate = Column(Float, default=0.0)
    notes = Column(Text, nullable=True)
    is_demo = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())
