from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class ProjectBase(BaseModel):
    title: str
    category: str = "PRODUCTION" # PRODUCTION, PERSONAL, ACADEMIC, HIRING_ASSIGNMENT
    role: Optional[str] = "Lead GenAI / Agentic AI Engineer"
    description: str
    business_problem: Optional[str] = None
    architecture: Optional[str] = None
    components: Optional[str] = None
    technologies: str
    responsibilities: Optional[str] = None
    challenges: Optional[str] = None
    solutions: Optional[str] = None
    impact: Optional[str] = None
    security: Optional[str] = None
    evaluation: Optional[str] = None
    scalability: Optional[str] = None
    reliability: Optional[str] = None
    interview_explanation: Optional[str] = None
    architecture_diagram: Optional[str] = None
    github_url: Optional[str] = None
    demo_url: Optional[str] = None
    documentation_url: Optional[str] = None
    is_featured: Optional[bool] = False
    is_demo: Optional[bool] = False

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None
    role: Optional[str] = None
    description: Optional[str] = None
    business_problem: Optional[str] = None
    architecture: Optional[str] = None
    components: Optional[str] = None
    technologies: Optional[str] = None
    responsibilities: Optional[str] = None
    challenges: Optional[str] = None
    solutions: Optional[str] = None
    impact: Optional[str] = None
    security: Optional[str] = None
    evaluation: Optional[str] = None
    scalability: Optional[str] = None
    reliability: Optional[str] = None
    interview_explanation: Optional[str] = None
    architecture_diagram: Optional[str] = None
    github_url: Optional[str] = None
    demo_url: Optional[str] = None
    documentation_url: Optional[str] = None
    is_featured: Optional[bool] = None

class ProjectOut(ProjectBase):
    id: int
    user_id: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    class Config:
        from_attributes = True
