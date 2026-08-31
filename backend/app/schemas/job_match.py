from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class PillarDetail(BaseModel):
    score: int
    weight: float
    contribution: float
    explanation: str
    matched: Optional[List[str]] = None
    missing: Optional[List[str]] = None

class JobMatchOut(BaseModel):
    id: int
    job_id: int
    overall_score: int
    role_alignment_score: int
    required_skills_score: int
    preferred_skills_score: int
    experience_fit_score: int
    projects_relevance_score: int
    education_fit_score: int
    salary_fit_score: int
    location_fit_score: int
    
    pillar_scores: Optional[Dict[str, Any]] = None
    matched_skills: Optional[List[str]] = None
    missing_skills: Optional[List[str]] = None
    strengths: Optional[List[str]] = None
    concerns: Optional[List[str]] = None
    eligibility: Optional[str] = None
    recommendation: str
    recommendation_rationale: Optional[str] = None
    
    created_at: Optional[datetime] = None
    class Config:
        from_attributes = True

class MatchAnalysisRequest(BaseModel):
    job_dict: Optional[Dict[str, Any]] = None
    job_id: Optional[int] = None
    profile_override: Optional[Dict[str, Any]] = None

class MatchAnalysisResponse(BaseModel):
    overall_score: int
    tier: str
    eligibility: str
    recommendation: str
    pillar_scores: Dict[str, Any]
    matched_skills: List[str]
    missing_skills: List[str]
    strengths: List[str]
    concerns: List[str]
