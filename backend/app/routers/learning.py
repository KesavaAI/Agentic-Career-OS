from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
from app.database import get_db
from app.models.learning import LearningTopic, LearningRecallLog
from app.schemas.learning import (
    LearningTopicOut, LearningTopicCreate, LearningTopicUpdate,
    RecallCheckinRequest, WeeklyLearningPlanOut
)

router = APIRouter(prefix="/learning", tags=["Learning & Skill Gap"])

@router.get("", response_model=List[LearningTopicOut])
def list_topics(priority: Optional[str] = None, status: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(LearningTopic)
    if priority:
        query = query.filter(LearningTopic.priority == priority)
    if status:
        query = query.filter(LearningTopic.status == status)
    return query.order_by(LearningTopic.priority.desc(), LearningTopic.created_at.desc()).all()

@router.post("", response_model=LearningTopicOut)
def create_topic(req: LearningTopicCreate, db: Session = Depends(get_db)):
    t = LearningTopic(**req.dict())
    t.next_recall_date = datetime.utcnow() + timedelta(days=t.recall_schedule_day or 0)
    db.add(t)
    db.commit()
    db.refresh(t)
    return t

@router.put("/{topic_id}", response_model=LearningTopicOut)
def update_topic(topic_id: int, req: LearningTopicUpdate, db: Session = Depends(get_db)):
    t = db.query(LearningTopic).filter(LearningTopic.id == topic_id).first()
    if not t:
        raise HTTPException(status_code=404, detail="Topic not found")
    for key, val in req.dict(exclude_unset=True).items():
        setattr(t, key, val)
    db.commit()
    db.refresh(t)
    return t

@router.post("/recall-checkin", response_model=LearningTopicOut)
def recall_checkin(req: RecallCheckinRequest, db: Session = Depends(get_db)):
    t = db.query(LearningTopic).filter(LearningTopic.id == req.topic_id).first()
    if not t:
        raise HTTPException(status_code=404, detail="Topic not found")
    
    # Spaced repetition schedule steps: 0 -> 1 -> 3 -> 7 -> 14 -> 30
    schedule_steps = [0, 1, 3, 7, 14, 30]
    current_day = t.recall_schedule_day or 0
    next_idx = 0
    if current_day in schedule_steps:
        curr_idx = schedule_steps.index(current_day)
        next_idx = min(curr_idx + 1, len(schedule_steps) - 1)
        
    next_days = schedule_steps[next_idx] if req.result_state == "GREEN" else (1 if req.result_state == "YELLOW" else 0)
    
    t.status = req.result_state
    t.recall_schedule_day = next_days
    t.next_recall_date = datetime.utcnow() + timedelta(days=next_days)
    
    # Log recall
    log = LearningRecallLog(topic_id=t.id, day_stage=current_day, status_result=req.result_state, notes=req.notes)
    db.add(log)
    db.commit()
    db.refresh(t)
    return t
