from typing import Optional
from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Text, DateTime, Boolean, ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func
from app.database import Base

class Job(Base):
    __tablename__ = "jobs"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    company_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("companies.id", ondelete="SET NULL"), nullable=True)
    company_name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    role: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    tier: Mapped[str] = mapped_column(String(10), default="A")
    priority_score: Mapped[int] = mapped_column(Integer, default=85)
    match_score: Mapped[int] = mapped_column(Integer, default=85)
    min_salary: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    max_salary: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    experience_min: Mapped[float] = mapped_column(Float, default=1.0)
    experience_max: Mapped[float] = mapped_column(Float, default=4.0)
    work_mode: Mapped[str] = mapped_column(String(50), default="Remote / Hybrid")
    location: Mapped[str] = mapped_column(String(255), default="Bengaluru", index=True)
    employment_type: Mapped[str] = mapped_column(String(50), default="Full-time")
    description: Mapped[str] = mapped_column(Text, nullable=False)
    responsibilities: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    required_skills: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    preferred_skills: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    education: Mapped[str] = mapped_column(String(255), default="B.Tech / B.E / M.Tech / Equivalent")
    job_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    career_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    canonical_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    source: Mapped[str] = mapped_column(String(100), default="Direct / LinkedIn", index=True)
    source_job_id: Mapped[Optional[str]] = mapped_column(String(255), index=True, nullable=True)
    description_hash: Mapped[Optional[str]] = mapped_column(String(64), index=True, nullable=True)
    posted_date: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True, index=True)
    first_seen_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    last_seen_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    last_verified_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    expired_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    deadline: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="NOT REVIEWED")
    interview_stage: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    next_action: Mapped[str] = mapped_column(String(255), default="Review JD & Tailor Resume")
    follow_up_date: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    recruiter_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    recruiter_email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    resume_version_used: Mapped[str] = mapped_column(String(100), default="GenAI_Agentic_v1")
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    freshness_badge: Mapped[str] = mapped_column(String(50), default="🔥 Posted today")
    is_urgent: Mapped[bool] = mapped_column(Boolean, default=False)
    is_easy_apply: Mapped[bool] = mapped_column(Boolean, default=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, index=True)
    is_demo: Mapped[bool] = mapped_column(Boolean, default=False)
    is_archived: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())

    __table_args__ = (
        Index("ix_jobs_source_job_id", "source", "source_job_id"),
        Index("ix_jobs_company_role", "company_name", "role"),
    )
