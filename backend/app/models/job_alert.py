from sqlalchemy import Column, Integer, String, Float, Text, DateTime, Boolean, ForeignKey, Index, JSON
from sqlalchemy.sql import func
from app.database import Base

class JobAlert(Base):
    __tablename__ = "job_alerts"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    title = Column(String(255), nullable=False) # e.g. "AI Engineer (0-2 yrs) - Remote/India"
    career = Column(String(255), nullable=False) # e.g. "AI Engineer"
    experience_min = Column(Float, default=0.0)
    experience_max = Column(Float, default=2.0)
    location = Column(String(255), default="India")
    is_remote = Column(Boolean, default=True)
    min_salary = Column(Float, default=10.0) # LPA
    keywords = Column(JSON, default=list) # e.g. ["RAG", "LLM", "LangChain"]
    min_match_score = Column(Integer, default=70) # Minimum 8-pillar match score threshold
    is_active = Column(Boolean, default=True)
    notify_in_app = Column(Boolean, default=True)
    notify_email = Column(Boolean, default=False)
    last_scanned_at = Column(DateTime(timezone=True), nullable=True)
    last_result_count = Column(Integer, default=0)
    total_notifications_sent = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())

class JobAlertNotification(Base):
    __tablename__ = "job_alert_notifications"
    
    id = Column(Integer, primary_key=True, index=True)
    alert_id = Column(Integer, ForeignKey("job_alerts.id", ondelete="CASCADE"), nullable=False, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False, index=True)
    match_score = Column(Integer, default=80)
    composite_rank = Column(Float, default=85.0)
    notification_channel = Column(String(50), default="IN_APP") # IN_APP, EMAIL, MOBILE
    status = Column(String(50), default="DELIVERED") # DELIVERED, READ
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        Index("ix_alert_job_unique", "alert_id", "job_id", unique=True),
    )
