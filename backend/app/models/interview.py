from typing import Optional
from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func
from app.database import Base

class Interview(Base):
    __tablename__ = "interviews"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    application_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("applications.id", ondelete="CASCADE"), nullable=True)
    job_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("jobs.id", ondelete="SET NULL"), nullable=True)
    company_name: Mapped[str] = mapped_column(String(255), nullable=False)
    role_title: Mapped[str] = mapped_column(String(255), nullable=False)
    stage: Mapped[str] = mapped_column(String(50), default="Technical 1")
    scheduled_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    time_str: Mapped[str] = mapped_column(String(50), default="11:00 AM IST")
    interviewer: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    interview_type: Mapped[str] = mapped_column(String(50), default="Video / Teams / GMeet")
    status: Mapped[str] = mapped_column(String(50), default="SCHEDULED")
    difficulty: Mapped[str] = mapped_column(String(20), default="Medium")
    topics: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    questions: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    answers: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    feedback: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    next_round: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    preparation_required: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    result: Mapped[str] = mapped_column(String(50), default="PENDING")
    failure_reason_category: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    is_demo: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())

class InterviewSession(Base):
    __tablename__ = "interview_sessions"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    interview_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("interviews.id", ondelete="SET NULL"), nullable=True)
    job_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("jobs.id", ondelete="SET NULL"), nullable=True)
    company_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    role_title: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    mode: Mapped[str] = mapped_column(String(50), default="GenAI")
    is_pressure_mode: Mapped[bool] = mapped_column(Boolean, default=False)
    score_out_of_10: Mapped[int] = mapped_column(Integer, default=8)
    technical_score: Mapped[int] = mapped_column(Integer, default=85)
    communication_score: Mapped[int] = mapped_column(Integer, default=88)
    problem_solving_score: Mapped[int] = mapped_column(Integer, default=82)
    role_readiness: Mapped[str] = mapped_column(String(100), default="High Alignment - L5 Senior Ready")
    strengths: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    weaknesses: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    missing_points: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    recommended_topics: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    plan_json: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    report_json: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    transcript_json: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
