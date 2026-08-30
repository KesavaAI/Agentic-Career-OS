from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from typing import Optional, List, Dict, Any

from app.database import get_db
from app.services.job_discovery_engine import job_discovery_engine

from app.models.user import User
from app.dependencies import get_current_user

router = APIRouter(prefix="/discovery", tags=["Autonomous Job Discovery Agent"])

@router.post("/run-auto-scan")
def run_autonomous_job_scan(
    max_jobs: int = Body(10, embed=True),
    target_role: Optional[str] = Body(None, embed=True),
    target_ctc: Optional[float] = Body(None, embed=True),
    current_user: Optional[User] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Triggers the autonomous multi-tenant job discovery agent to discover and synthesize
    live openings matching the user's specific target role (Full Stack, Data Science, Infra, DevOps, etc.).
    """
    result = job_discovery_engine.discover_live_jobs(
        db=db,
        user=current_user,
        target_role=target_role,
        target_ctc=target_ctc,
        max_jobs=max_jobs
    )
    return result

from app.services.role_intelligence_engine import role_intelligence_engine

@router.get("/taxonomy")
def get_it_career_taxonomy():
    """
    Returns the complete 30-family IT career taxonomy with normalized roles and core skill sets.
    """
    return {
        "success": True,
        "total_families": len(role_intelligence_engine.CAREER_FAMILIES),
        "families": role_intelligence_engine.CAREER_FAMILIES,
        "seniority_levels": role_intelligence_engine.SENIORITY_LEVELS
    }

@router.post("/normalize-title")
def normalize_job_title(
    title: str = Body(..., embed=True)
):
    """
    Normalizes any raw job title into Career Family, Normalized Role, Specialization, and Seniority.
    """
    normalized = role_intelligence_engine.normalize_title(title)
    return {
        "success": True,
        "normalized": normalized
    }

