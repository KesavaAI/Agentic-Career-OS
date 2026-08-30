from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey
from sqlalchemy.sql import func
from app.database import Base

class Resume(Base):
    __tablename__ = "resumes"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    name = Column(String(255), nullable=False)
    version = Column(String(50), default="v1.0")
    target_role = Column(String(255), default="GenAI / Agentic AI Engineer")
    file_path = Column(String(500), nullable=True)
    content_markdown = Column(Text, nullable=False)
    ats_score = Column(Integer, default=88)
    notes = Column(Text, nullable=True)
    is_default = Column(Boolean, default=False)
    is_demo = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())

class ResumeVersion(Base):
    __tablename__ = "resume_versions"
    
    id = Column(Integer, primary_key=True, index=True)
    resume_id = Column(Integer, ForeignKey("resumes.id", ondelete="CASCADE"), nullable=False)
    job_id = Column(Integer, ForeignKey("jobs.id", ondelete="SET NULL"), nullable=True)
    target_company = Column(String(255), nullable=True)
    version_tag = Column(String(100), nullable=False)
    diff_summary = Column(Text, nullable=True)
    content_markdown = Column(Text, nullable=False)
    ats_score = Column(Integer, default=92)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
