from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey
from sqlalchemy.sql import func
from app.database import Base

class Project(Base):
    __tablename__ = "projects"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    title = Column(String(255), nullable=False)
    category = Column(String(50), default="PRODUCTION") # PRODUCTION, PERSONAL, ACADEMIC, HIRING_ASSIGNMENT
    role = Column(String(255), default="Lead GenAI / Agentic AI Engineer")
    description = Column(Text, nullable=False)
    business_problem = Column(Text, nullable=True)
    architecture = Column(Text, nullable=True)
    components = Column(Text, nullable=True)
    technologies = Column(String(500), nullable=False)
    responsibilities = Column(Text, nullable=True)
    challenges = Column(Text, nullable=True)
    solutions = Column(Text, nullable=True)
    impact = Column(Text, nullable=True)
    security = Column(Text, nullable=True)
    evaluation = Column(Text, nullable=True)
    scalability = Column(Text, nullable=True)
    reliability = Column(Text, nullable=True)
    interview_explanation = Column(Text, nullable=True)
    architecture_diagram = Column(Text, nullable=True) # Mermaid string
    github_url = Column(String(500), nullable=True)
    demo_url = Column(String(500), nullable=True)
    documentation_url = Column(String(500), nullable=True)
    is_featured = Column(Boolean, default=False)
    is_demo = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())
