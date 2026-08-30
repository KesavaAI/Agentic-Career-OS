from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class InterviewBase(BaseModel):
    company_name: str
    role_title: str
    stage: Optional[str] = "Technical 1"
    scheduled_at: Optional[datetime] = None
    time_str: Optional[str] = "11:00 AM IST"
    interviewer: Optional[str] = None
    interview_type: Optional[str] = "Video / Teams / GMeet"
    status: Optional[str] = "SCHEDULED"
    difficulty: Optional[str] = "Medium"
    topics: Optional[str] = None
    questions: Optional[str] = None
    answers: Optional[str] = None
    feedback: Optional[str] = None
    next_round: Optional[str] = None
    preparation_required: Optional[str] = None
    result: Optional[str] = "PENDING"
    failure_reason_category: Optional[str] = None
    is_demo: Optional[bool] = False

class InterviewCreate(InterviewBase):
    application_id: Optional[int] = None
    job_id: Optional[int] = None

class InterviewUpdate(BaseModel):
    company_name: Optional[str] = None
    role_title: Optional[str] = None
    stage: Optional[str] = None
    scheduled_at: Optional[datetime] = None
    time_str: Optional[str] = None
    interviewer: Optional[str] = None
    interview_type: Optional[str] = None
    status: Optional[str] = None
    difficulty: Optional[str] = None
    topics: Optional[str] = None
    questions: Optional[str] = None
    answers: Optional[str] = None
    feedback: Optional[str] = None
    next_round: Optional[str] = None
    preparation_required: Optional[str] = None
    result: Optional[str] = None
    failure_reason_category: Optional[str] = None

class InterviewOut(InterviewBase):
    id: int
    application_id: Optional[int] = None
    job_id: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    class Config:
        from_attributes = True

class MockInterviewTurnRequest(BaseModel):
    mode: str = "GenAI" # GenAI, Agentic AI, RAG, Python, System Design, Azure, FastAPI, Project, HR, Mixed
    is_pressure_mode: bool = False
    messages: List[Dict[str, str]] # [{"role": "interviewer"|"user", "content": "..."}]
    target_role: Optional[str] = "GenAI / Agentic AI Engineer"

class MockInterviewTurnResponse(BaseModel):
    interviewer_reply: str
    is_finished: bool = False
    score_out_of_10: Optional[int] = None
    strengths: Optional[List[str]] = None
    weaknesses: Optional[List[str]] = None
    missing_points: Optional[List[str]] = None
    better_answer_summary: Optional[str] = None
    recommended_topics: Optional[List[str]] = None

class InterviewSessionOut(BaseModel):
    id: int
    mode: str
    is_pressure_mode: bool
    score_out_of_10: int
    strengths: Optional[str] = None
    weaknesses: Optional[str] = None
    missing_points: Optional[str] = None
    recommended_topics: Optional[str] = None
    transcript_json: str
    created_at: Optional[datetime] = None
    class Config:
        from_attributes = True
