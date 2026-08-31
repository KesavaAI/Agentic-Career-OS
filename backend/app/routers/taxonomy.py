from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

from app.database import get_db, SessionLocal
from app.models.user import User
from app.models.profile import Profile
from app.dependencies import get_current_user
from app.services.career_taxonomy import career_taxonomy
from app.services.job_discovery_engine import JobDiscoveryEngine

router = APIRouter(prefix="/taxonomy", tags=["Career Taxonomy & Multi-Role Intelligence"])
career_intel_router = APIRouter(prefix="/career-intel", tags=["Career Intelligence & Role Ecosystem"])

class CareerSwitchRequest(BaseModel):
    target_role: str = Field(..., description="Target role to switch into, e.g. 'Data Scientist' or 'AI Engineer'")
    domain_id: Optional[str] = None
    target_min_ctc_lpa: Optional[float] = 20.0
    candidate_pool: Optional[str] = "EXPERIENCED"
    experience_level: Optional[str] = "Experienced (1-3 yrs)"
    remote_preference: Optional[str] = "Hybrid"
    selected_specializations: Optional[List[str]] = None

@router.get("/domains")
@career_intel_router.get("/domains")
def list_career_domains():
    return career_taxonomy.get_all_domains()

@router.get("/streams")
@career_intel_router.get("/streams")
def list_career_streams(domain_id: Optional[str] = Query(None, description="Optional domain ID filter")):
    return career_taxonomy.get_all_streams(domain_id=domain_id)

@router.get("/role/{role_name}")
@career_intel_router.get("/role/{role_name}")
def get_role_intelligence(role_name: str):
    return career_taxonomy.get_role_intelligence(role_name)

@router.get("/role/{role_name}/related")
@career_intel_router.get("/role/{role_name}/related")
def get_related_roles(role_name: str):
    return {
        "role": role_name,
        "related_roles": career_taxonomy.get_related_roles(role_name)
    }

@router.get("/role/{role_name}/specializations")
@career_intel_router.get("/role/{role_name}/specializations")
def get_role_specializations(role_name: str):
    return {
        "role": role_name,
        "specializations": career_taxonomy.get_specializations(role_name)
    }

@router.get("/role/{role_name}/adjacent")
@career_intel_router.get("/role/{role_name}/adjacent")
def get_adjacent_roles(role_name: str):
    return {
        "role": role_name,
        "adjacent_roles": career_taxonomy.get_adjacent_roles(role_name)
    }

@router.get("/role/{role_name}/skills")
@career_intel_router.get("/role/{role_name}/skills")
def get_role_skills(role_name: str):
    intel = career_taxonomy.get_role_intelligence(role_name)
    return {
        "role": role_name,
        "required_skills": intel.get("required_skills", []),
        "preferred_skills": intel.get("preferred_skills", []),
        "all_skills": intel.get("all_skills", [])
    }

@router.get("/search")
@career_intel_router.get("/search")
def search_taxonomy_roles(q: str = Query(..., min_length=1, description="Search query string")):
    return career_taxonomy.search_roles(q)

def _background_career_sync(target_role: str, min_ctc: float, candidate_pool: str, exp_years: float, user_id: Optional[int]):
    bg_db = SessionLocal()
    try:
        if user_id:
            from app.services.skill_gap_engine import skill_gap_engine
            skill_gap_engine.sync_user_learning_topics(
                bg_db,
                user_id,
                target_role,
                candidate_pool,
                exp_years
            )
        engine = JobDiscoveryEngine()
        engine.discover_live_jobs(
            bg_db,
            user=None,
            target_role=target_role,
            target_ctc=min_ctc,
            max_jobs=6
        )
    except Exception as e:
        print(f"Background career sync notice: {e}")
    finally:
        bg_db.close()

@router.post("/switch-career")
@career_intel_router.post("/switch-career")
def switch_career_target(
    req: CareerSwitchRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    target_role = req.target_role.strip()
    min_ctc = req.target_min_ctc_lpa or 20.0
    
    # 1. Fetch complete role ecosystem from taxonomy engine
    intel = career_taxonomy.get_role_intelligence(target_role)

    # 2. Update User entity if authenticated
    if current_user:
        current_user.target_role = target_role
        current_user.target_min_ctc_lpa = str(min_ctc)
        current_user.candidate_pool = req.candidate_pool or "EXPERIENCED"

    # 3. Update or find Profile
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first() if current_user else db.query(Profile).first()
    if profile:
        profile.primary_career = target_role
        profile.target_role = target_role
        profile.career_stream = intel["career_stream"]
        profile.role_family = intel["role_family"]
        profile.target_roles = intel["primary_roles"] + intel["related_roles"]
        profile.specializations = req.selected_specializations or intel["specializations"]
        profile.experience_level = req.experience_level or profile.experience_level or "Experienced (1-3 yrs)"
        profile.remote_preference = req.remote_preference or profile.remote_preference or "Hybrid"
        profile.target_min_ctc_lpa = min_ctc
        profile.candidate_pool = req.candidate_pool or "EXPERIENCED"
        
        # Merge new required skills into profile skills
        existing_skills = profile.skills if isinstance(profile.skills, dict) else {}
        existing_frameworks = existing_skills.get("frameworks", [])
        for sk in intel["required_skills"]:
            if sk not in existing_frameworks:
                existing_frameworks.append(sk)
        existing_skills["frameworks"] = existing_frameworks
        profile.skills = existing_skills

    db.commit()
    if profile:
        db.refresh(profile)

    # 4. Dispatch non-blocking background task for flashcards and live crawler
    usr = current_user or db.query(User).first()
    usr_id = usr.id if usr else None
    exp_yrs = profile.experience_years if profile and profile.experience_years else 2.0
    
    background_tasks.add_task(
        _background_career_sync,
        target_role=target_role,
        min_ctc=min_ctc,
        candidate_pool=req.candidate_pool or "EXPERIENCED",
        exp_years=exp_yrs,
        user_id=usr_id
    )

    return {
        "success": True,
        "message": f"✓ Career context successfully updated to {target_role} ({intel['domain_name']} -> {intel['career_stream']})!",
        "career_context": {
            "primary_career": target_role,
            "domain_name": intel["domain_name"],
            "career_stream": intel["career_stream"],
            "role_family": intel["role_family"],
            "primary_role": intel["primary_role"],
            "related_roles": intel["related_roles"],
            "specializations": profile.specializations if profile else intel["specializations"],
            "required_skills": intel["required_skills"],
            "preferred_skills": intel["preferred_skills"],
            "adjacent_roles": intel["adjacent_roles"]
        },
        "target_role": target_role,
        "target_min_ctc_lpa": min_ctc
    }
