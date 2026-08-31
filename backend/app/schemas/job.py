from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import datetime

class JobBase(BaseModel):
    company_name: str
    role: str
    tier: Optional[str] = "A"
    priority_score: Optional[int] = 85
    match_score: Optional[int] = 85
    min_salary: Optional[float] = None
    max_salary: Optional[float] = None
    experience_min: Optional[float] = 1.0
    experience_max: Optional[float] = 4.0
    work_mode: Optional[str] = "Remote / Hybrid"
    location: Optional[str] = "Bengaluru"
    employment_type: Optional[str] = "Full-time"
    description: str
    responsibilities: Optional[str] = None
    required_skills: Optional[str] = None
    preferred_skills: Optional[str] = None
    education: Optional[str] = "B.Tech / B.E / M.Tech"
    job_url: Optional[str] = None
    career_url: Optional[str] = None
    canonical_url: Optional[str] = None
    source: Optional[str] = "Direct / LinkedIn"
    source_job_id: Optional[str] = None
    description_hash: Optional[str] = None
    posted_date: Optional[datetime] = None
    first_seen_at: Optional[datetime] = None
    last_seen_at: Optional[datetime] = None
    last_verified_at: Optional[datetime] = None
    expired_at: Optional[datetime] = None
    deadline: Optional[datetime] = None
    status: Optional[str] = "NOT REVIEWED"
    interview_stage: Optional[str] = None
    next_action: Optional[str] = "Review JD & Tailor Resume"
    follow_up_date: Optional[datetime] = None
    recruiter_name: Optional[str] = None
    recruiter_email: Optional[str] = None
    resume_version_used: Optional[str] = "GenAI_Agentic_v1"
    notes: Optional[str] = None
    freshness_badge: Optional[str] = "🔥 Posted today"
    is_urgent: Optional[bool] = False
    is_easy_apply: Optional[bool] = False
    is_active: Optional[bool] = True
    is_demo: Optional[bool] = False
    is_archived: Optional[bool] = False

class JobCreate(JobBase):
    company_id: Optional[int] = None

class JobUpdate(BaseModel):
    company_name: Optional[str] = None
    role: Optional[str] = None
    tier: Optional[str] = None
    priority_score: Optional[int] = None
    match_score: Optional[int] = None
    min_salary: Optional[float] = None
    max_salary: Optional[float] = None
    experience_min: Optional[float] = None
    experience_max: Optional[float] = None
    work_mode: Optional[str] = None
    location: Optional[str] = None
    employment_type: Optional[str] = None
    description: Optional[str] = None
    responsibilities: Optional[str] = None
    required_skills: Optional[str] = None
    preferred_skills: Optional[str] = None
    education: Optional[str] = None
    job_url: Optional[str] = None
    career_url: Optional[str] = None
    canonical_url: Optional[str] = None
    source: Optional[str] = None
    source_job_id: Optional[str] = None
    description_hash: Optional[str] = None
    posted_date: Optional[datetime] = None
    deadline: Optional[datetime] = None
    status: Optional[str] = None
    interview_stage: Optional[str] = None
    next_action: Optional[str] = None
    follow_up_date: Optional[datetime] = None
    recruiter_name: Optional[str] = None
    recruiter_email: Optional[str] = None
    resume_version_used: Optional[str] = None
    notes: Optional[str] = None
    freshness_badge: Optional[str] = None
    is_urgent: Optional[bool] = None
    is_easy_apply: Optional[bool] = None
    is_active: Optional[bool] = None
    is_archived: Optional[bool] = None

class JobOut(JobBase):
    id: int
    company_id: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    class Config:
        from_attributes = True

class PaginatedJobsOut(BaseModel):
    total: int
    page: int
    page_size: int
    total_pages: int
    jobs: List[JobOut]

class BulkJobAction(BaseModel):
    job_ids: List[int]
    action: str # delete, archive, set_status, set_tier
    value: Optional[str] = None

class JobIngestRequest(BaseModel):
    url: Optional[str] = None
    raw_text: Optional[str] = None
    source: Optional[str] = "Manual Paste"
