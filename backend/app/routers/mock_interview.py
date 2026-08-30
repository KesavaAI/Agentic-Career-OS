from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.interview import InterviewSession
from app.schemas.interview import MockInterviewTurnRequest, MockInterviewTurnResponse, InterviewSessionOut
from app.services.mock_interview_engine import mock_interview_engine
import json

router = APIRouter(prefix="/mock-interview", tags=["Mock Interview"])

@router.post("/turn", response_model=MockInterviewTurnResponse)
def mock_interview_turn(req: MockInterviewTurnRequest, db: Session = Depends(get_db)):
    result = mock_interview_engine.process_turn(
        mode=req.mode,
        is_pressure_mode=req.is_pressure_mode,
        messages=req.messages,
        target_role=req.target_role or "GenAI / Agentic AI Engineer"
    )
    
    # If session concluded, persist session record
    if result["is_finished"]:
        session_rec = InterviewSession(
            mode=req.mode,
            is_pressure_mode=req.is_pressure_mode,
            score_out_of_10=result["score_out_of_10"],
            strengths=json.dumps(result["strengths"]),
            weaknesses=json.dumps(result["weaknesses"]),
            missing_points=json.dumps(result["missing_points"]),
            recommended_topics=json.dumps(result["recommended_topics"]),
            transcript_json=json.dumps(req.messages)
        )
        db.add(session_rec)
        db.commit()
        
    return result

@router.get("/sessions", response_model=List[InterviewSessionOut])
def list_mock_sessions(db: Session = Depends(get_db)):
    return db.query(InterviewSession).order_by(InterviewSession.created_at.desc()).all()
