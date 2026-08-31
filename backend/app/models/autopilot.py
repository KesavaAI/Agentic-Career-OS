from sqlalchemy import Column, Integer, String, Float, Boolean, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.database import Base

class AutopilotSetting(Base):
    __tablename__ = "autopilot_settings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True, unique=True)
    is_active = Column(Boolean, default=False)
    mode = Column(String(50), default="FULL_AUTONOMOUS") # FULL_AUTONOMOUS, COPILOT, PAUSED
    min_match_threshold = Column(Integer, default=88)
    daily_max_applications = Column(Integer, default=10)
    min_salary_lpa = Column(Float, default=18.0)
    auto_followup_enabled = Column(Boolean, default=True)
    auto_inbox_sync_enabled = Column(Boolean, default=True)
    cycle_interval_minutes = Column(Integer, default=30)
    last_run_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class AutopilotLog(Base):
    __tablename__ = "autopilot_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    event_type = Column(String(50), nullable=False) # SCAN, MATCH, AUTO_APPLY, INBOX_SYNC, FOLLOW_UP, ERROR
    company_name = Column(String(255), nullable=True)
    role_title = Column(String(255), nullable=True)
    match_score = Column(Integer, nullable=True)
    message = Column(Text, nullable=False)
    status = Column(String(50), default="SUCCESS") # SUCCESS, WARNING, SKIPPED, FAILED
    created_at = Column(DateTime(timezone=True), server_default=func.now())
