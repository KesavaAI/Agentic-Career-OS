from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
from app.database import get_db
from app.models.followup import FollowUp
from app.schemas.followup import FollowUpOut, FollowUpCreate, FollowUpUpdate

router = APIRouter(prefix="/followups", tags=["Follow-ups"])

@router.get("", response_model=List[FollowUpOut])
def list_followups(filter_view: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(FollowUp)
    now = datetime.utcnow()
    
    if filter_view == "today":
        today_start = now.replace(hour=0, minute=0, second=0)
        today_end = now.replace(hour=23, minute=59, second=59)
        query = query.filter(FollowUp.follow_up_date >= today_start, FollowUp.follow_up_date <= today_end)
    elif filter_view == "overdue":
        query = query.filter(FollowUp.follow_up_date < now, FollowUp.is_completed == False)
    elif filter_view == "this_week":
        week_end = now + timedelta(days=7)
        query = query.filter(FollowUp.follow_up_date <= week_end)
        
    return query.order_by(FollowUp.is_completed.asc(), FollowUp.follow_up_date.asc()).all()

@router.post("", response_model=FollowUpOut)
def create_followup(req: FollowUpCreate, db: Session = Depends(get_db)):
    fu = FollowUp(**req.dict())
    db.add(fu)
    db.commit()
    db.refresh(fu)
    return fu

@router.put("/{fu_id}", response_model=FollowUpOut)
def update_followup(fu_id: int, req: FollowUpUpdate, db: Session = Depends(get_db)):
    fu = db.query(FollowUp).filter(FollowUp.id == fu_id).first()
    if not fu:
        raise HTTPException(status_code=404, detail="Follow-up not found")
    for key, val in req.dict(exclude_unset=True).items():
        setattr(fu, key, val)
    db.commit()
    db.refresh(fu)
    return fu

@router.post("/{fu_id}/complete")
def complete_followup(fu_id: int, db: Session = Depends(get_db)):
    fu = db.query(FollowUp).filter(FollowUp.id == fu_id).first()
    if not fu:
        raise HTTPException(status_code=404, detail="Follow-up not found")
    fu.is_completed = True
    fu.completed_at = datetime.utcnow()
    db.commit()
    return {"message": "Follow-up marked completed"}
