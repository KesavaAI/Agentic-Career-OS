from sqlalchemy import Column, Integer, String, Float, Text, DateTime, Boolean, ForeignKey
from sqlalchemy.sql import func
from app.database import Base

class Application(Base):
    __tablename__ = "applications"
    
    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id", ondelete="SET NULL"), nullable=True)
    resume_id = Column(Integer, ForeignKey("resumes.id", ondelete="SET NULL"), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    company_name = Column(String(255), nullable=False)
    role_title = Column(String(255), nullable=False)
    tier = Column(String(10), default="A")
    match_score = Column(Integer, default=85)
    status = Column(String(50), default="READY TO APPLY") # NOT REVIEWED, SHORTLISTED, READY TO APPLY, APPLIED, APPLICATION CONFIRMED, RECRUITER CONTACTED, OA / ASSESSMENT, INTERVIEW 1, INTERVIEW 2, INTERVIEW 3, TECHNICAL ROUND, SYSTEM DESIGN, MANAGERIAL ROUND, HR ROUND, OFFER, OFFER ACCEPTED, ON HOLD, REJECTED, WITHDRAWN, NO RESPONSE, CLOSED
    applied_date = Column(DateTime(timezone=True), nullable=True)
    deadline = Column(DateTime(timezone=True), nullable=True)
    next_action = Column(String(255), default="Submit application via career portal")
    follow_up_date = Column(DateTime(timezone=True), nullable=True)
    is_user_approved = Column(Boolean, default=False)
    application_reference_id = Column(String(100), nullable=True)
    notes = Column(Text, nullable=True)
    is_demo = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())

class ApplicationEvent(Base):
    __tablename__ = "application_events"
    
    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("applications.id", ondelete="CASCADE"), nullable=False)
    from_status = Column(String(50), nullable=True)
    to_status = Column(String(50), nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class ApplicationEvidence(Base):
    __tablename__ = "application_evidence"
    
    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("applications.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    evidence_type = Column(String(50), default="DOCUMENT") # JD_SNAPSHOT, RESUME_USED, COVER_LETTER, CONFIRMATION, EMAIL, INTERVIEW_NOTE, OFFER_LETTER
    content = Column(Text, nullable=True)
    file_url = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
