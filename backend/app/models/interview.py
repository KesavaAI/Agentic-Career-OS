from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey
from sqlalchemy.sql import func
from app.database import Base

class Interview(Base):
    __tablename__ = "interviews"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    application_id = Column(Integer, ForeignKey("applications.id", ondelete="CASCADE"), nullable=True)
    job_id = Column(Integer, ForeignKey("jobs.id", ondelete="SET NULL"), nullable=True)
    company_name = Column(String(255), nullable=False)
    role_title = Column(String(255), nullable=False)
    stage = Column(String(50), default="Technical 1") # Assessment, Technical 1, Technical 2, System Design, Managerial, HR, Final
    scheduled_at = Column(DateTime(timezone=True), nullable=True)
    time_str = Column(String(50), default="11:00 AM IST")
    interviewer = Column(String(255), nullable=True)
    interview_type = Column(String(50), default="Video / Teams / GMeet")
    status = Column(String(50), default="SCHEDULED") # SCHEDULED, COMPLETED, CANCELLED, PASSED, FAILED
    difficulty = Column(String(20), default="Medium") # Easy, Medium, Hard, Extreme
    topics = Column(Text, nullable=True)
    questions = Column(Text, nullable=True) # JSON questions string
    answers = Column(Text, nullable=True)
    feedback = Column(Text, nullable=True)
    next_round = Column(String(100), nullable=True)
    preparation_required = Column(Text, nullable=True)
    result = Column(String(50), default="PENDING") # PENDING, PASSED, REJECTED, OFFER
    failure_reason_category = Column(String(100), nullable=True)
    is_demo = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())

class InterviewSession(Base):
    __tablename__ = "interview_sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    interview_id = Column(Integer, ForeignKey("interviews.id", ondelete="SET NULL"), nullable=True)
    job_id = Column(Integer, ForeignKey("jobs.id", ondelete="SET NULL"), nullable=True)
    company_name = Column(String(255), nullable=True)
    role_title = Column(String(255), nullable=True)
    mode = Column(String(50), default="GenAI") # GenAI, Agentic AI, RAG, Python, System Design, Azure, FastAPI, Project, HR, Mixed
    is_pressure_mode = Column(Boolean, default=False)
    score_out_of_10 = Column(Integer, default=8)
    technical_score = Column(Integer, default=85)
    communication_score = Column(Integer, default=88)
    problem_solving_score = Column(Integer, default=82)
    role_readiness = Column(String(100), default="High Alignment - L5 Senior Ready")
    strengths = Column(Text, nullable=True)
    weaknesses = Column(Text, nullable=True)
    missing_points = Column(Text, nullable=True)
    recommended_topics = Column(Text, nullable=True)
    plan_json = Column(Text, nullable=True)
    report_json = Column(Text, nullable=True)
    transcript_json = Column(Text, nullable=False) # JSON array of conversation turns
    created_at = Column(DateTime(timezone=True), server_default=func.now())
