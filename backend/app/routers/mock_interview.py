from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from pydantic import BaseModel

from app.database import get_db
from app.models.interview import InterviewSession
from app.models.user import User
from app.dependencies import get_current_user
from app.schemas.interview import MockInterviewTurnRequest, MockInterviewTurnResponse, InterviewSessionOut
from app.services.mock_interview_engine import mock_interview_engine
from app.services.video_interview_evaluator import video_interview_evaluator
from app.services.mercor_conversational_engine import mercor_conversational_engine
import json

router = APIRouter(prefix="/mock-interview", tags=["Mock Interview"])

class VideoSessionEvaluationRequest(BaseModel):
    role: Optional[str] = "Data Analyst"
    company: Optional[str] = "Acme"
    questions_and_answers: List[Dict[str, Any]]
    total_duration_seconds: Optional[float] = 300.0

class MercorStartRequest(BaseModel):
    role: Optional[str] = "Full Stack Engineer"
    company: Optional[str] = "Acme"

class MercorTurnRequest(BaseModel):
    role: Optional[str] = "Full Stack Engineer"
    company: Optional[str] = "Acme"
    history: List[Dict[str, Any]] = []
    latest_answer: str
    turn_number: int = 2

class MercorEvaluateRequest(BaseModel):
    role: Optional[str] = "Full Stack Engineer"
    company: Optional[str] = "Acme"
    turns: List[Dict[str, Any]]
    total_duration_seconds: Optional[float] = 300.0

# =========================================================================
# 🔬 MERCOR-STYLE AUTONOMOUS AI INTERVIEW ENDPOINTS
# =========================================================================

@router.post("/mercor-start")
def mercor_start_session(
    req: MercorStartRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Initializes a dynamic Mercor-style interview with resume-grounded opening question.
    """
    user_profile = {
        "target_role": current_user.target_role if current_user else req.role,
        "skills": ["Python", "FastAPI", "React", "SQL", "PostgreSQL", "Docker", "Redis"],
        "projects": [{"title": "Enterprise Microservice Hub"}, {"title": "Real-Time Telemetry Pipeline"}]
    }

    initial = mercor_conversational_engine.generate_initial_question(
        role=req.role or "Full Stack Engineer",
        company=req.company or "Acme",
        profile=user_profile
    )
    return initial

@router.post("/mercor-turn")
def mercor_process_turn(
    req: MercorTurnRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Processes candidate spoken answer, detects 'I' vs 'We', evaluates depth level,
    and dynamically generates a 3-layer deep contextual follow-up.
    """
    next_turn = mercor_conversational_engine.generate_next_turn(
        target_role=req.role or "Full Stack Engineer",
        target_company=req.company or "Acme",
        history=req.history,
        latest_answer=req.latest_answer,
        turn_number=req.turn_number
    )
    return next_turn

@router.post("/mercor-evaluate")
def mercor_evaluate_session(
    req: MercorEvaluateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Final evaluation based on the 4 Mercor Pillars:
    Ownership (I vs We), Technical Depth (3 Layers), Compression (<90s), Quantified Metrics.
    """
    evaluation = mercor_conversational_engine.evaluate_mercor_session(
        role=req.role or "Full Stack Engineer",
        company=req.company or "Acme",
        turns=req.turns,
        total_duration_seconds=req.total_duration_seconds or 300.0
    )

    try:
        session_rec = InterviewSession(
            user_id=current_user.id if current_user else None,
            mode="mercor_adaptive",
            is_pressure_mode=True,
            score_out_of_10=round(evaluation["overall_score"] / 10.0, 1),
            strengths=json.dumps(evaluation["strengths"]),
            weaknesses=json.dumps(evaluation["warnings"]),
            missing_points=json.dumps(evaluation["mercor_pillars"]),
            recommended_topics=json.dumps(["Individual Ownership (I vs We)", "High Scale Concurrency"]),
            transcript_json=json.dumps(req.turns)
        )
        db.add(session_rec)
        db.commit()
    except Exception as e:
        print(f"Error persisting session: {e}")

    return evaluation

# =========================================================================
# 🎥 CLASSIC VIDEO INTERVIEW ENDPOINTS
# =========================================================================

@router.get("/readiness-diagnostic")
def get_readiness_diagnostic(
    role: Optional[str] = Query("Data Analyst"),
    company: Optional[str] = Query("Acme"),
    current_user: User = Depends(get_current_user)
):
    user_role = role or (current_user.target_role if current_user else "Data Analyst")
    return video_interview_evaluator.calculate_readiness_diagnostic(
        role=user_role,
        company=company or "Acme"
    )

@router.post("/evaluate-video-session")
def evaluate_video_session(
    req: VideoSessionEvaluationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    evaluation = video_interview_evaluator.evaluate_session(
        role=req.role or (current_user.target_role if current_user else "Data Analyst"),
        company=req.company or "Acme",
        questions_and_answers=req.questions_and_answers,
        total_duration_seconds=req.total_duration_seconds or 300.0
    )

    try:
        session_rec = InterviewSession(
            user_id=current_user.id if current_user else None,
            mode="video",
            is_pressure_mode=False,
            score_out_of_10=round(evaluation["overall_score"] / 10.0, 1),
            strengths=json.dumps(evaluation["strengths"]),
            weaknesses=json.dumps(evaluation["warnings"]),
            missing_points=json.dumps([]),
            recommended_topics=json.dumps(evaluation.get("filler_stats", {})),
            transcript_json=json.dumps(req.questions_and_answers)
        )
        db.add(session_rec)
        db.commit()
    except Exception as e:
        print(f"Error persisting video session: {e}")

    return evaluation

@router.post("/turn", response_model=MockInterviewTurnResponse)
def mock_interview_turn(req: MockInterviewTurnRequest, db: Session = Depends(get_db)):
    result = mock_interview_engine.process_turn(
        mode=req.mode,
        is_pressure_mode=req.is_pressure_mode,
        messages=req.messages,
        target_role=req.target_role or "Data Analyst"
    )
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
