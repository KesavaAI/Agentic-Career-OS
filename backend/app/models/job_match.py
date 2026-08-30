from sqlalchemy import Column, Integer, Float, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.database import Base

class JobMatch(Base):
    __tablename__ = "job_matches"
    
    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id", ondelete="CASCADE"), unique=True, nullable=False)
    overall_score = Column(Integer, default=80)
    skills_match = Column(Integer, default=80)
    experience_match = Column(Integer, default=85)
    genai_match = Column(Integer, default=90)
    agentic_ai_match = Column(Integer, default=95)
    rag_match = Column(Integer, default=90)
    python_match = Column(Integer, default=95)
    cloud_match = Column(Integer, default=80)
    backend_match = Column(Integer, default=85)
    azure_match = Column(Integer, default=90)
    system_design_match = Column(Integer, default=80)
    location_match = Column(Integer, default=100)
    salary_potential = Column(Integer, default=90)
    strengths = Column(Text, nullable=True) # JSON array string
    missing_skills = Column(Text, nullable=True) # JSON array string
    interview_risks = Column(Text, nullable=True) # JSON array string
    resume_changes = Column(Text, nullable=True) # JSON array string
    recommendation = Column(Text, default="APPLY") # APPLY, CONSIDER, LOW PRIORITY, DO NOT PRIORITIZE
    recommendation_rationale = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())
