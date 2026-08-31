from sqlalchemy import Column, Integer, Float, Text, String, JSON, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.database import Base

class JobMatch(Base):
    __tablename__ = "job_matches"
    
    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id", ondelete="CASCADE"), unique=True, nullable=False)
    
    # 8-Pillar Scoring Architecture
    overall_score = Column(Integer, default=80)
    role_alignment_score = Column(Integer, default=80)
    required_skills_score = Column(Integer, default=80)
    preferred_skills_score = Column(Integer, default=80)
    experience_fit_score = Column(Integer, default=80)
    projects_relevance_score = Column(Integer, default=80)
    education_fit_score = Column(Integer, default=80)
    salary_fit_score = Column(Integer, default=80)
    location_fit_score = Column(Integer, default=80)
    
    # Pillar Breakdown & Deep Explanations (JSON)
    pillar_scores = Column(JSON, default=dict) # {role_alignment: {score, weight, contribution, explanation}, ...}
    matched_skills = Column(JSON, default=list) # ["Python", "RAG", "FastAPI"]
    missing_skills = Column(JSON, default=list) # ["LangGraph", "Docker"]
    strengths = Column(JSON, default=list) # ["Direct title alignment", "Salary exceeds expectation"]
    concerns = Column(JSON, default=list) # ["Missing 1 required tool", "Experience slightly below senior bracket"]
    
    eligibility = Column(String(50), default="QUALIFIED") # HIGHLY_QUALIFIED, QUALIFIED, PARTIAL_FIT, UNDER_QUALIFIED
    recommendation = Column(String(50), default="APPLY_NOW") # APPLY_NOW, STRONG_MATCH, UPSKILL_FIRST, REACH_ROLE, NOT_RECOMMENDED
    recommendation_rationale = Column(Text, nullable=True)
    
    # Legacy fields maintained for backward compatibility
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
    interview_risks = Column(Text, nullable=True)
    resume_changes = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())
