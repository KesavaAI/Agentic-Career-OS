from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from app.database import get_db
from app.models.user import User
from app.models.profile import Profile
from app.models.job import Job
from app.dependencies import get_current_user
from app.services.career_taxonomy import career_taxonomy
from app.services.job_discovery_engine import JobDiscoveryEngine

router = APIRouter(prefix="/taxonomy", tags=["Career Taxonomy & Multi-Role Intelligence"])

class CareerSwitchRequest(BaseModel):
    domain_id: str
    target_role: str
    target_min_ctc_lpa: Optional[float] = 20.0
    candidate_pool: Optional[str] = "EXPERIENCED"

@router.get("/domains")
def list_career_domains():
    return career_taxonomy.get_all_domains()

@router.get("/role/{role_name}")
def get_role_intelligence(role_name: str):
    return career_taxonomy.get_role_intelligence(role_name)

@router.post("/switch-career")
def switch_career_target(
    req: CareerSwitchRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    target_role = req.target_role.strip()
    min_ctc = req.target_min_ctc_lpa or 20.0

    if current_user:
        current_user.target_role = target_role
        current_user.target_min_ctc_lpa = str(min_ctc)
        current_user.candidate_pool = req.candidate_pool or "EXPERIENCED"

    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first() if current_user else db.query(Profile).first()
    if profile:
        profile.target_role = target_role
        profile.target_min_ctc_lpa = min_ctc
        profile.candidate_pool = req.candidate_pool or "EXPERIENCED"

    db.commit()

    intel = career_taxonomy.get_role_intelligence(target_role)

    engine = JobDiscoveryEngine()
    discovery_res = engine.discover_live_jobs(db, user=current_user, target_role=target_role, target_ctc=min_ctc, max_jobs=12)

    return {
        "success": True,
        "message": f"✓ Career path dynamically switched to {target_role} ({intel['domain_name']})!",
        "role_intelligence": intel,
        "discovered_jobs_count": discovery_res.get("new_jobs_added", 0),
        "target_role": target_role,
        "target_min_ctc_lpa": min_ctc
    }
