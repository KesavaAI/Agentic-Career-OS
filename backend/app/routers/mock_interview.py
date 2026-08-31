from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from pydantic import BaseModel

from app.database import get_db
from app.models.interview import InterviewSession
from app.models.learning import LearningTopic
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
    role: Optional[str] = "Full Stack / Web Development"
    company: Optional[str] = "Acme"
    resume_text: Optional[str] = ""
    jd_text: Optional[str] = ""

class MercorTurnRequest(BaseModel):
    role: Optional[str] = "Full Stack / Web Development"
    company: Optional[str] = "Acme"
    history: List[Dict[str, Any]] = []
    latest_answer: str
    resume_text: Optional[str] = ""
    jd_text: Optional[str] = ""
    turn_number: int = 2

class MercorEvaluateRequest(BaseModel):
    role: Optional[str] = "Full Stack / Web Development"
    company: Optional[str] = "Acme"
    turns: List[Dict[str, Any]]
    total_duration_seconds: Optional[float] = 300.0

# =========================================================================
# 🔬 RESUME & JD GROUNDED AI PANEL ENDPOINTS
# =========================================================================

@router.post("/mercor-start")
def mercor_start_session(
    req: MercorStartRequest,
    current_user: User = Depends(get_current_user)
):
    resume_content = req.resume_text or ""
    if not resume_content and current_user:
        user_experiences = current_user.experiences if hasattr(current_user, "experiences") and current_user.experiences else []
        exp_lines = []
        if isinstance(user_experiences, list):
            for e in user_experiences:
                if isinstance(e, dict):
                    exp_lines.append(f"Project: {e.get('title', e.get('role', ''))} - {e.get('description', '')}")
        
        user_skills = current_user.skills if hasattr(current_user, "skills") and current_user.skills else []
        skills_str = ", ".join(user_skills) if isinstance(user_skills, list) else str(user_skills)
        joined_exp = "\n".join(exp_lines)
        resume_content = f"Role: {current_user.target_role or req.role}\nSkills: {skills_str}\n{joined_exp}"

    initial = mercor_conversational_engine.generate_initial_question(
        role=req.role or (current_user.target_role if current_user else "Full Stack / Web Development"),
        company=req.company or "Acme",
        resume_text=resume_content,
        jd_text=req.jd_text or ""
    )
    return initial

@router.post("/mercor-turn")
def mercor_process_turn(
    req: MercorTurnRequest,
    current_user: User = Depends(get_current_user)
):
    next_turn = mercor_conversational_engine.generate_next_turn(
        target_role=req.role or "Full Stack / Web Development",
        target_company=req.company or "Acme",
        history=req.history,
        latest_answer=req.latest_answer,
        resume_text=req.resume_text or "",
        jd_text=req.jd_text or "",
        turn_number=req.turn_number
    )
    return next_turn

@router.post("/mercor-evaluate")
def mercor_evaluate_session(
    req: MercorEvaluateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    evaluation = mercor_conversational_engine.evaluate_mercor_session(
        role=req.role or "Full Stack / Web Development",
        company=req.company or "Acme",
        turns=req.turns,
        total_duration_seconds=req.total_duration_seconds or 300.0
    )

    try:
        session_rec = InterviewSession(
            user_id=current_user.id if current_user else None,
            mode="panel_tag_team",
            is_pressure_mode=True,
            score_out_of_10=round(evaluation["overall_score"] / 10.0, 1),
            strengths=json.dumps(evaluation["strengths"]),
            weaknesses=json.dumps(evaluation["warnings"]),
            missing_points=json.dumps(evaluation.get("panel_scores", {})),
            recommended_topics=json.dumps(evaluation.get("mercor_pillars", {})),
            transcript_json=json.dumps(req.turns)
        )
        db.add(session_rec)
        db.commit()
    except Exception as e:
        print(f"Error persisting session: {e}")

    try:
        if current_user and evaluation.get("flywheel_remediation"):
            remedy = evaluation["flywheel_remediation"]
            topic_name = remedy.get("recommended_topic", "Technical Architecture Defense")
            existing = db.query(LearningTopic).filter(
                LearningTopic.user_id == current_user.id,
                LearningTopic.skill == topic_name
            ).first()

            if not existing:
                notes = {
                    "source": f"Autonomous Interview Panel ({req.company})",
                    "mental_models": [
                        f"Master trade-offs identified by Staff Architect David Vance during {req.company} session.",
                        "Structure 60-second answers with exact % latency and $ ARR numbers.",
                        "Isolate individual code ownership vs shared team responsibilities."
                    ],
                    "interviewer_trap": "Panelists trap you by probing mathematical physics (e.g. RTT latency across regions).",
                    "code_anchor": "// Production implementation pattern verified in mock interview",
                    "metric_defense": "Quantified P99 latency reduction & zero timeout drops."
                }
                new_topic = LearningTopic(
                    user_id=current_user.id,
                    skill=topic_name,
                    category=remedy.get("category", "Architecture Gaps"),
                    market_demand="High Priority",
                    market_demand_pct=95,
                    my_level="Intermediate",
                    gap_level="Advanced Production",
                    priority="Critical",
                    stage="LEARN",
                    status="YELLOW",
                    recall_schedule_day=1,
                    notes=json.dumps(notes),
                    is_demo=False
                )
                db.add(new_topic)
                db.commit()
    except Exception as e:
        print(f"Error auto-seeding flywheel learning topic: {e}")

    return evaluation

# =========================================================================
# 🎥 CLASSIC VIDEO & TEXT INTERVIEW ENDPOINTS
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
