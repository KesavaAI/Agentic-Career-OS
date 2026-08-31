from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from datetime import datetime

from app.database import get_db
from app.models.profile import Profile
from app.models.resume import Resume
from app.models.user import User
from app.models.job import Job
from app.models.application import Application
from app.models.autopilot import AutopilotSetting, AutopilotLog
from app.dependencies import get_current_user
from app.agent.workflow import career_workflow
from app.agent.state import CareerAgentState
from app.routers.jobs import create_job
from app.schemas.job import JobCreate
from app.services.career_heartbeat_daemon import career_heartbeat_daemon

router = APIRouter(prefix="/career-agent", tags=["Career Agent"])

class AgentRunRequest(BaseModel):
    raw_jd_text: str
    job_url: Optional[str] = None
    source: Optional[str] = "Manual Ingest"

class AgentApprovalRequest(BaseModel):
    state: Dict[str, Any]
    approve: bool
    action: str = "APPLY" # APPLY, SHORTLIST, DISCARD

class AutopilotToggleRequest(BaseModel):
    is_active: Optional[bool] = None
    mode: Optional[str] = None # FULL_AUTONOMOUS, COPILOT, PAUSED

class AutopilotSettingsRequest(BaseModel):
    min_match_threshold: Optional[int] = 88
    daily_max_applications: Optional[int] = 10
    min_salary_lpa: Optional[float] = 18.0
    auto_followup_enabled: Optional[bool] = True
    auto_inbox_sync_enabled: Optional[bool] = True
    cycle_interval_minutes: Optional[int] = 30

# =========================================================================
# ⚡ AUTONOMOUS AUTO-PILOT CONTROL ROOM ENDPOINTS
# =========================================================================

@router.get("/status")
@router.get("/autopilot/status")
def get_autopilot_status(
    current_user: Optional[User] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_id = current_user.id if current_user else None
    setting = career_heartbeat_daemon.get_or_create_settings(db, user_id)

    # Compute aggregate autonomous metrics
    total_scanned = db.query(Job).count()
    auto_applied = db.query(Application).filter(Application.status == "AUTONOMOUSLY APPLIED").count()
    total_apps = db.query(Application).count()
    interviews_secured = db.query(Application).filter(
        Application.status.in_(["INTERVIEW SCHEDULED", "INTERVIEW COMPLETED", "OFFER"])
    ).count()

    recent_logs = db.query(AutopilotLog).order_by(AutopilotLog.created_at.desc()).limit(20).all()
    logs_data = [
        {
            "id": l.id,
            "event_type": l.event_type,
            "company_name": l.company_name,
            "role_title": l.role_title,
            "match_score": l.match_score,
            "message": l.message,
            "status": l.status,
            "created_at": l.created_at.strftime("%H:%M:%S") if l.created_at else ""
        }
        for l in recent_logs
    ]

    return {
        "success": True,
        "is_active": setting.is_active,
        "mode": setting.mode,
        "min_match_threshold": setting.min_match_threshold,
        "daily_max_applications": setting.daily_max_applications,
        "min_salary_lpa": setting.min_salary_lpa,
        "auto_followup_enabled": setting.auto_followup_enabled,
        "auto_inbox_sync_enabled": setting.auto_inbox_sync_enabled,
        "cycle_interval_minutes": setting.cycle_interval_minutes,
        "last_run_at": setting.last_run_at.isoformat() if setting.last_run_at else None,
        "stats": {
            "total_jobs_scanned": total_scanned,
            "auto_applied_count": auto_applied,
            "total_applications": total_apps,
            "interviews_secured": interviews_secured,
            "conversion_rate": round((interviews_secured / max(1, total_apps)) * 100, 1)
        },
        "recent_logs": logs_data
    }

@router.post("/autopilot/toggle")
def toggle_autopilot(
    req: AutopilotToggleRequest,
    current_user: Optional[User] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_id = current_user.id if current_user else None
    setting = career_heartbeat_daemon.get_or_create_settings(db, user_id)

    if req.is_active is not None:
        setting.is_active = req.is_active
    if req.mode:
        setting.mode = req.mode

    db.commit()
    db.refresh(setting)

    status_str = "ACTIVE" if setting.is_active else "PAUSED"
    career_heartbeat_daemon.log_event(
        db, "SCAN",
        f"Auto-Pilot state switched to: {status_str} (Mode: {setting.mode})",
        user_id
    )

    return {
        "success": True,
        "is_active": setting.is_active,
        "mode": setting.mode,
        "message": f"Autopilot is now {status_str} ({setting.mode})"
    }

@router.post("/autopilot/settings")
def update_autopilot_settings(
    req: AutopilotSettingsRequest,
    current_user: Optional[User] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_id = current_user.id if current_user else None
    setting = career_heartbeat_daemon.get_or_create_settings(db, user_id)

    if req.min_match_threshold is not None:
        setting.min_match_threshold = req.min_match_threshold
    if req.daily_max_applications is not None:
        setting.daily_max_applications = req.daily_max_applications
    if req.min_salary_lpa is not None:
        setting.min_salary_lpa = req.min_salary_lpa
    if req.auto_followup_enabled is not None:
        setting.auto_followup_enabled = req.auto_followup_enabled
    if req.auto_inbox_sync_enabled is not None:
        setting.auto_inbox_sync_enabled = req.auto_inbox_sync_enabled
    if req.cycle_interval_minutes is not None:
        setting.cycle_interval_minutes = req.cycle_interval_minutes

    db.commit()
    return {
        "success": True,
        "message": "Autopilot safety guardrails & preferences updated."
    }

@router.get("/autopilot/logs")
def get_autopilot_logs(
    limit: int = 50,
    db: Session = Depends(get_db)
):
    logs = db.query(AutopilotLog).order_by(AutopilotLog.created_at.desc()).limit(limit).all()
    return [
        {
            "id": l.id,
            "event_type": l.event_type,
            "company_name": l.company_name,
            "role_title": l.role_title,
            "match_score": l.match_score,
            "message": l.message,
            "status": l.status,
            "created_at": l.created_at.strftime("%H:%M:%S") if l.created_at else ""
        }
        for l in logs
    ]

@router.post("/autopilot/trigger-now")
def trigger_autopilot_cycle_now(
    current_user: Optional[User] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Manually forces an immediate 360-degree autonomous execution cycle.
    """
    result = career_heartbeat_daemon.run_full_autonomous_cycle(
        db=db,
        user=current_user,
        force=True
    )
    return result

# =========================================================================
# 🤖 CLASSIC COPILOT WORKFLOW PIPELINE
# =========================================================================

@router.post("/run", response_model=CareerAgentState)
def run_career_agent_pipeline(req: AgentRunRequest, db: Session = Depends(get_db)):
    profile = db.query(Profile).first()
    p_dict = profile.__dict__ if profile else {}
    resume = db.query(Resume).first()
    res_md = resume.content_markdown if resume else "Kesava - GenAI Engineer"
    
    state = career_workflow.run_job_pipeline(req.raw_jd_text, p_dict, res_md)
    return state

@router.post("/approve")
def submit_agent_approval(req: AgentApprovalRequest, db: Session = Depends(get_db)):
    if not req.approve:
        return {"status": "discarded", "message": "Job discarded by user."}
    
    extracted = req.state.get("extracted_job") or {}
    job_create = JobCreate(
        company_name=extracted.get("company_name", "Target Tech"),
        role=extracted.get("role", "GenAI / Agentic AI Engineer"),
        tier=req.state.get("tier", "A"),
        priority_score=req.state.get("priority_score", 85),
        match_score=req.state.get("match_result", {}).get("overall_score", 85),
        min_salary=extracted.get("min_salary", 18.0),
        max_salary=extracted.get("max_salary", 28.0),
        location=extracted.get("location", "Bengaluru"),
        work_mode=extracted.get("work_mode", "Hybrid"),
        description=extracted.get("description", "Job description"),
        required_skills=extracted.get("required_skills", "Python, LangGraph, RAG"),
        preferred_skills=extracted.get("preferred_skills", "Docker, SQL"),
        status="READY TO APPLY" if req.action == "APPLY" else "SHORTLISTED"
    )
    created = create_job(job_create, db)
    return {"status": "approved", "job_id": created.id, "message": f"Successfully created job {created.role} at {created.company_name}"}

class DirectiveRequest(BaseModel):
    directive: str

@router.post("/directive")
def submit_agent_directive(
    req: DirectiveRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    """Submits a natural language executive directive to the multi-agent swarm."""
    from app.services.agent_swarm_orchestrator import agent_swarm_orchestrator
    user_id = current_user.id if current_user else None
    return agent_swarm_orchestrator.process_natural_language_directive(req.directive, db, user_id)

@router.get("/swarm-dag")
def get_swarm_dag_state(db: Session = Depends(get_db)):
    """Returns the live DAG execution and node state for all 5 swarm agents."""
    from app.services.agent_swarm_orchestrator import agent_swarm_orchestrator
    return agent_swarm_orchestrator.get_swarm_dag_state(db)

@router.post("/swarm-execute")
def execute_swarm_cycle(db: Session = Depends(get_db)):
    """Triggers an immediate parallel multi-agent swarm sweep."""
    from app.services.agent_swarm_orchestrator import agent_swarm_orchestrator
    return agent_swarm_orchestrator.execute_full_swarm_cycle(db)
