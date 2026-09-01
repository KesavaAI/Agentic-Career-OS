from typing import Optional, Any
from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Text, Boolean, JSON, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func
from app.database import Base

class Profile(Base):
    __tablename__ = "profiles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("users.id"), unique=True, nullable=True, index=True)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False)
    phone: Mapped[str] = mapped_column(String(50), default="")
    location: Mapped[str] = mapped_column(String(100), default="")
    
    primary_career: Mapped[str] = mapped_column(String(255), default="Software Engineer", index=True)
    career_stream: Mapped[str] = mapped_column(String(255), default="Full Stack Engineering")
    role_family: Mapped[str] = mapped_column(String(255), default="Software Engineering")
    target_role: Mapped[str] = mapped_column(String(255), default="Software Engineer")
    target_roles: Mapped[Any] = mapped_column(JSON, default=list)
    specializations: Mapped[Any] = mapped_column(JSON, default=list)
    experience_level: Mapped[str] = mapped_column(String(50), default="Experienced (1-3 yrs)")
    remote_preference: Mapped[str] = mapped_column(String(50), default="Hybrid")
    salary_preference: Mapped[Any] = mapped_column(JSON, default=dict)

    target_min_ctc_lpa: Mapped[float] = mapped_column(Float, default=15.0)
    current_ctc_lpa: Mapped[float] = mapped_column(Float, default=0.0)
    experience_years: Mapped[float] = mapped_column(Float, default=0.0)
    notice_period_days: Mapped[int] = mapped_column(Integer, default=30)
    candidate_pool: Mapped[str] = mapped_column(String(100), default="SERVICE_SWITCHER")
    bio: Mapped[str] = mapped_column(Text, default="")
    
    experiences: Mapped[Any] = mapped_column(JSON, default=list)
    internships: Mapped[Any] = mapped_column(JSON, default=list)
    education: Mapped[Any] = mapped_column(JSON, default=list)
    skills: Mapped[Any] = mapped_column(JSON, default=dict)
    certifications: Mapped[Any] = mapped_column(JSON, default=list)
    social_links: Mapped[Any] = mapped_column(JSON, default=dict)
    preferences: Mapped[Any] = mapped_column(JSON, default=dict)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())
