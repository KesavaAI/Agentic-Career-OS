from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey
from sqlalchemy.sql import func
from app.database import Base

class InterviewQuestion(Base):
    __tablename__ = "interview_questions"
    
    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id", ondelete="SET NULL"), nullable=True)
    interview_id = Column(Integer, ForeignKey("interviews.id", ondelete="SET NULL"), nullable=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="SET NULL"), nullable=True)
    question = Column(Text, nullable=False)
    category = Column(String(100), default="GenAI / Agentic AI") # GenAI, Agentic AI, RAG, Python, SQL, Azure, FastAPI, System Design, Project, HR
    expected_concepts = Column(Text, nullable=True)
    kesava_answer = Column(Text, nullable=True)
    ideal_answer = Column(Text, nullable=True)
    confidence = Column(String(20), default="Medium") # Low, Medium, High, Mastered
    status = Column(String(50), default="LEARNING") # NOT LEARNED, LEARNING, RECALLED, PRACTICED, MASTERED
    times_asked = Column(Integer, default=1)
    correct_rate = Column(Integer, default=80) # 0 - 100%
    last_practiced_at = Column(DateTime(timezone=True), nullable=True)
    is_demo = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())
