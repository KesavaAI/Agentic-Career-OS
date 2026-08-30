from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class LearningTopicBase(BaseModel):
    skill: str
    category: Optional[str] = "GenAI / Agentic AI"
    market_demand: Optional[str] = "Very High"
    market_demand_pct: Optional[int] = 85
    my_level: Optional[str] = "Medium"
    gap_level: Optional[str] = "Medium"
    priority: Optional[str] = "High" # Critical, High, Medium, Low
    stage: Optional[str] = "LEARN" # LEARN, RECALL, APPLY, EXPLAIN
    status: Optional[str] = "YELLOW" # GREEN, YELLOW, RED
    recall_schedule_day: Optional[int] = 0
    next_recall_date: Optional[datetime] = None
    notes: Optional[str] = None
    is_demo: Optional[bool] = False

class LearningTopicCreate(LearningTopicBase):
    pass

class LearningTopicUpdate(BaseModel):
    skill: Optional[str] = None
    category: Optional[str] = None
    market_demand: Optional[str] = None
    market_demand_pct: Optional[int] = None
    my_level: Optional[str] = None
    gap_level: Optional[str] = None
    priority: Optional[str] = None
    stage: Optional[str] = None
    status: Optional[str] = None
    recall_schedule_day: Optional[int] = None
    next_recall_date: Optional[datetime] = None
    notes: Optional[str] = None

class LearningTopicOut(LearningTopicBase):
    id: int
    user_id: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    class Config:
        from_attributes = True

class RecallCheckinRequest(BaseModel):
    topic_id: int
    result_state: str # GREEN, YELLOW, RED
    notes: Optional[str] = None

class WeeklyLearningPlanOut(BaseModel):
    week_label: str
    focus_topics: List[LearningTopicOut]
    recall_due_today: List[LearningTopicOut]
