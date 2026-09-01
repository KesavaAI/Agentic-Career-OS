from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.interview import InterviewSession
from app.models.job import Job
from app.models.profile import Profile
from app.models.resume import Resume
from app.schemas.interview import (
    MockInterviewTurnRequest, MockInterviewTurnResponse, InterviewSessionOut,
    ScreeningPlanRequest, ScreeningPlanResponse, ScreeningTurnRequest, ScreeningTurnResponse
)
from app.services.mock_interview_engine import mock_interview_engine
from app.services.screening_interview_engine import screening_interview_engine
from app.services.audit_service import audit_service
import json

router = APIRouter(prefix="/mock-interview", tags=["Mock Interview"])

@router.post("/plan", response_model=ScreeningPlanResponse)
def generate_screening_plan(req: ScreeningPlanRequest, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == req.job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    profile = db.query(Profile).first()
    prof_dict = profile.__dict__ if profile else {}

    resume_text = ""
    if req.resume_id:
        res = db.query(Resume).filter(Resume.id == req.resume_id).first()
        if res:
            resume_text = res.content_markdown
    else:
        res = db.query(Resume).filter(Resume.is_default == True).first() or db.query(Resume).first()
        if res:
            resume_text = res.content_markdown

    plan = screening_interview_engine.generate_interview_plan(job.__dict__, prof_dict, resume_text)
    return plan

@router.post("/screening-turn", response_model=ScreeningTurnResponse)
def process_screening_turn(req: ScreeningTurnRequest, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == req.job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    profile = db.query(Profile).first()
    prof_dict = profile.__dict__ if profile else {}

    turn_res = screening_interview_engine.evaluate_turn_and_adapt(
        messages=req.messages,
        current_question_idx=req.current_question_idx,
        plan=req.plan,
        job_dict=job.__dict__,
        profile_dict=prof_dict
    )

    all_evals = (req.evaluations or []) + [turn_res["turn_eval"]]
    final_report = None
    session_id = None

    if turn_res["is_finished"]:
        final_report = screening_interview_engine.generate_final_report(
            messages=req.messages,
            evaluations=all_evals,
            plan=req.plan,
            job_dict=job.__dict__,
            profile_dict=prof_dict
        )

        session_rec = InterviewSession(
            job_id=job.id,
            company_name=job.company_name,
            role_title=job.role,
            mode="Adaptive Candidate Screening",
            is_pressure_mode=False,
            score_out_of_10=int(final_report["overall_score"] / 10),
            technical_score=final_report["technical_score"],
            communication_score=final_report["communication_score"],
            problem_solving_score=final_report["problem_solving_score"],
            role_readiness=final_report["role_readiness"],
            strengths=json.dumps(final_report["strengths"]),
            weaknesses=json.dumps(final_report["weaknesses"]),
            recommended_topics=json.dumps(final_report["recommended_improvements"]),
            plan_json=json.dumps(req.plan),
            report_json=json.dumps(final_report),
            transcript_json=json.dumps(req.messages)
        )
        db.add(session_rec)
        db.commit()
        db.refresh(session_rec)
        session_id = session_rec.id
        audit_service.log(db, "kesava@career.local", "SCREENING_INTERVIEW", "InterviewSession", session_rec.id, None, f"Completed screening for {job.role} at {job.company_name}")

    return {
        "turn_index": turn_res["turn_index"],
        "current_question_idx": turn_res["current_question_idx"],
        "is_follow_up": turn_res["is_follow_up"],
        "next_interviewer_text": turn_res["next_interviewer_text"],
        "is_finished": turn_res["is_finished"],
        "turn_eval": turn_res["turn_eval"],
        "final_report": final_report,
        "session_id": session_id
    }

@router.post("/turn", response_model=MockInterviewTurnResponse)
def mock_interview_turn(req: MockInterviewTurnRequest, db: Session = Depends(get_db)):
    result = mock_interview_engine.process_turn(
        mode=req.mode,
        is_pressure_mode=req.is_pressure_mode,
        messages=req.messages,
        target_role=req.target_role or "GenAI / Agentic AI Engineer"
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
