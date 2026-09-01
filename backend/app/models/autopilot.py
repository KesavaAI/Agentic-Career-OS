from typing import Optional
from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, Text, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func
from app.database import Base

class AutopilotSetting(Base):
    __tablename__ = "autopilot_settings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True, unique=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=False)
    mode: Mapped[str] = mapped_column(String(50), default="FULL_AUTONOMOUS") # FULL_AUTONOMOUS, COPILOT, PAUSED
    min_match_threshold: Mapped[int] = mapped_column(Integer, default=75)
    daily_max_applications: Mapped[int] = mapped_column(Integer, default=10)
    min_salary_lpa: Mapped[float] = mapped_column(Float, default=18.0)
    auto_followup_enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    auto_inbox_sync_enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    require_user_approval: Mapped[bool] = mapped_column(Boolean, default=True)
    auto_tailor_resume: Mapped[bool] = mapped_column(Boolean, default=True)
    auto_prepare_screening: Mapped[bool] = mapped_column(Boolean, default=True)
    target_careers_json: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    location_preference: Mapped[str] = mapped_column(String(255), default="India / Remote")
    remote_only: Mapped[bool] = mapped_column(Boolean, default=True)
    cycle_interval_minutes: Mapped[int] = mapped_column(Integer, default=30)
    last_run_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), onupdate=func.now())

class AutopilotLog(Base):
    __tablename__ = "autopilot_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    event_type: Mapped[str] = mapped_column(String(50), nullable=False) # SCAN, MATCH, AUTO_APPLY, INBOX_SYNC, FOLLOW_UP, ERROR
    company_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    role_title: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    match_score: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="SUCCESS") # SUCCESS, WARNING, SKIPPED, FAILED
    created_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), server_default=func.now())
