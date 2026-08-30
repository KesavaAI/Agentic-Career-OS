from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class JobMatchOut(BaseModel):
    id: int
    job_id: int
    overall_score: int
    skills_match: int
    experience_match: int
    genai_match: int
    agentic_ai_match: int
    rag_match: int
    python_match: int
    cloud_match: int
    backend_match: int
    azure_match: int
    system_design_match: int
    location_match: int
    salary_potential: int
    strengths: Optional[str] = None
    missing_skills: Optional[str] = None
    interview_risks: Optional[str] = None
    resume_changes: Optional[str] = None
    recommendation: str
    recommendation_rationale: Optional[str] = None
    created_at: Optional[datetime] = None
    class Config:
        from_attributes = True
