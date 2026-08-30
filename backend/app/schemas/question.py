from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class QuestionBase(BaseModel):
    question: str
    category: Optional[str] = "GenAI / Agentic AI"
    expected_concepts: Optional[str] = None
    kesava_answer: Optional[str] = None
    ideal_answer: Optional[str] = None
    confidence: Optional[str] = "Medium" # Low, Medium, High, Mastered
    status: Optional[str] = "LEARNING" # NOT LEARNED, LEARNING, RECALLED, PRACTICED, MASTERED
    times_asked: Optional[int] = 1
    correct_rate: Optional[int] = 80
    last_practiced_at: Optional[datetime] = None
    is_demo: Optional[bool] = False

class QuestionCreate(QuestionBase):
    job_id: Optional[int] = None
    interview_id: Optional[int] = None
    project_id: Optional[int] = None

class QuestionUpdate(BaseModel):
    question: Optional[str] = None
    category: Optional[str] = None
    expected_concepts: Optional[str] = None
    kesava_answer: Optional[str] = None
    ideal_answer: Optional[str] = None
    confidence: Optional[str] = None
    status: Optional[str] = None
    times_asked: Optional[int] = None
    correct_rate: Optional[int] = None
    last_practiced_at: Optional[datetime] = None

class QuestionOut(QuestionBase):
    id: int
    job_id: Optional[int] = None
    interview_id: Optional[int] = None
    project_id: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    class Config:
        from_attributes = True
