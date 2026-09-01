from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class ResumeBase(BaseModel):
    name: str
    version: Optional[str] = "v1.0"
    target_role: Optional[str] = "GenAI / Agentic AI Engineer"
    file_path: Optional[str] = None
    content_markdown: str
    ats_score: Optional[int] = 88
    notes: Optional[str] = None
    is_default: Optional[bool] = False
    is_demo: Optional[bool] = False

class ResumeCreate(ResumeBase):
    pass

class ResumeUpdate(BaseModel):
    name: Optional[str] = None
    version: Optional[str] = None
    target_role: Optional[str] = None
    content_markdown: Optional[str] = None
    ats_score: Optional[int] = None
    notes: Optional[str] = None
    is_default: Optional[bool] = None

class ResumeOut(ResumeBase):
    id: int
    user_id: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    class Config:
        from_attributes = True

class ResumeVersionOut(BaseModel):
    id: int
    resume_id: int
    job_id: Optional[int] = None
    target_company: Optional[str] = None
    version_tag: str
    diff_summary: Optional[str] = None
    content_markdown: str
    ats_score: int
    created_at: Optional[datetime] = None
    class Config:
        from_attributes = True

class ATSAnalysisRequest(BaseModel):
    resume_id: Optional[int] = None
    resume_text: Optional[str] = None
    job_description: str

class ATSAnalysisResponse(BaseModel):
    current_score: int
    potential_score: int
    keyword_match_score: int
    experience_match_score: int
    project_match_score: int
    readability_score: int
    bullet_quality_score: int
    found_keywords: List[str]
    missing_keywords: List[str]
    recommended_changes: List[str]
    warnings: List[str]

class ResumeTailorRequest(BaseModel):
    resume_id: int
    job_id: int

class ResumeTailorResponse(BaseModel):
    original_markdown: str
    tailored_markdown: str
    structured_resume: Optional[Dict[str, Any]] = None
    changes_summary: List[str]
    predicted_ats_boost: int
    ats_score: Optional[int] = 92
    matched_keywords: Optional[List[str]] = None
    missing_keywords: Optional[List[str]] = None
    truthfulness_warnings: Optional[List[str]] = None
    truthfulness_checks: Optional[List[str]] = None
    version_tag: Optional[str] = "v1.0"
    version_id: Optional[int] = None
    target_company: Optional[str] = "Target Company"
    target_role: Optional[str] = "Target Role"
