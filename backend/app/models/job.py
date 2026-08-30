from sqlalchemy import Column, Integer, String, Float, Text, DateTime, Boolean, ForeignKey
from sqlalchemy.sql import func
from app.database import Base

class Job(Base):
    __tablename__ = "jobs"
    
    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="SET NULL"), nullable=True)
    company_name = Column(String(255), nullable=False)
    role = Column(String(255), nullable=False)
    tier = Column(String(10), default="A") # A, B, C
    priority_score = Column(Integer, default=85) # 0 - 100
    match_score = Column(Integer, default=85) # 0 - 100
    min_salary = Column(Float, nullable=True) # LPA
    max_salary = Column(Float, nullable=True) # LPA
    experience_min = Column(Float, default=1.0)
    experience_max = Column(Float, default=4.0)
    work_mode = Column(String(50), default="Remote / Hybrid") # Remote, Hybrid, Onsite
    location = Column(String(255), default="Bengaluru")
    description = Column(Text, nullable=False)
    responsibilities = Column(Text, nullable=True)
    required_skills = Column(Text, nullable=True) # JSON or comma string
    preferred_skills = Column(Text, nullable=True)
    education = Column(String(255), default="B.Tech / B.E / M.Tech / Equivalent")
    job_url = Column(String(500), nullable=True)
    career_url = Column(String(500), nullable=True)
    source = Column(String(100), default="Direct / LinkedIn")
    posted_date = Column(DateTime(timezone=True), nullable=True)
    deadline = Column(DateTime(timezone=True), nullable=True)
    status = Column(String(50), default="NOT REVIEWED") # NOT REVIEWED, SHORTLISTED, READY TO APPLY, APPLIED, INTERVIEW, OFFER, etc.
    interview_stage = Column(String(50), nullable=True)
    next_action = Column(String(255), default="Review JD & Tailor Resume")
    follow_up_date = Column(DateTime(timezone=True), nullable=True)
    recruiter_name = Column(String(255), nullable=True)
    recruiter_email = Column(String(255), nullable=True)
    resume_version_used = Column(String(100), default="GenAI_Agentic_v1")
    notes = Column(Text, nullable=True)
    freshness_badge = Column(String(50), default="🔥 Posted today") # 🔥 Posted today, 🟢 1-3 days, 🟡 4-7 days, 🟠 8-14 days, 🔴 15+ days
    is_urgent = Column(Boolean, default=False)
    is_easy_apply = Column(Boolean, default=False)
    is_demo = Column(Boolean, default=False)
    is_archived = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())
