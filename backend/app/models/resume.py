from typing import Optional
from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func
from app.database import Base

class Resume(Base):
    __tablename__ = "resumes"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    version: Mapped[str] = mapped_column(String(50), default="v1.0")
    target_role: Mapped[str] = mapped_column(String(255), default="GenAI / Agentic AI Engineer")
    file_path: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    content_markdown: Mapped[str] = mapped_column(Text, nullable=False)
    ats_score: Mapped[int] = mapped_column(Integer, default=88)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    is_default: Mapped[bool] = mapped_column(Boolean, default=False)
    is_demo: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())

class ResumeVersion(Base):
    __tablename__ = "resume_versions"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    resume_id: Mapped[int] = mapped_column(Integer, ForeignKey("resumes.id", ondelete="CASCADE"), nullable=False)
    job_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("jobs.id", ondelete="SET NULL"), nullable=True)
    target_company: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    version_tag: Mapped[str] = mapped_column(String(100), nullable=False)
    diff_summary: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    content_markdown: Mapped[str] = mapped_column(Text, nullable=False)
    ats_score: Mapped[int] = mapped_column(Integer, default=92)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
