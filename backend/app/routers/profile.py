from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

from app.database import get_db
from app.models.user import User
from app.models.profile import Profile
from app.dependencies import get_current_user
from app.services.ai_service import ai_service

router = APIRouter(prefix="/profile", tags=["Profile"])

class ProfileUpdateReq(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    target_role: Optional[str] = None
    target_min_ctc_lpa: Optional[float] = None
    current_ctc_lpa: Optional[float] = None
    experience_years: Optional[float] = None
    notice_period_days: Optional[int] = None
    candidate_pool: Optional[str] = None
    bio: Optional[str] = None
    experiences: Optional[List[Dict[str, Any]]] = None
    internships: Optional[List[Dict[str, Any]]] = None
    education: Optional[List[Dict[str, Any]]] = None
    skills: Optional[Dict[str, Any]] = None
    certifications: Optional[List[Dict[str, Any]]] = None
    social_links: Optional[Dict[str, str]] = None
    preferences: Optional[Dict[str, Any]] = None

class BulletEnhanceReq(BaseModel):
    rough_text: str
    target_role: Optional[str] = "Software Engineer"
    tech_stack: Optional[str] = "Python, FastAPI, SQL"

@router.get("")
def get_my_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        # Auto-create profile if missing
        from app.routers.auth import seed_profile_for_user
        profile = seed_profile_for_user(db, current_user)
    return profile

@router.put("")
def update_my_profile(req: ProfileUpdateReq, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        from app.routers.auth import seed_profile_for_user
        profile = seed_profile_for_user(db, current_user)

    for field, val in req.dict(exclude_unset=True).items():
        if val is not None:
            setattr(profile, field, val)

    # Sync primary fields back to user
    if req.full_name:
        current_user.full_name = req.full_name
    if req.target_role:
        current_user.target_role = req.target_role
    if req.target_min_ctc_lpa is not None:
        current_user.target_min_ctc_lpa = str(req.target_min_ctc_lpa)
    if req.current_ctc_lpa is not None:
        current_user.current_ctc_lpa = str(req.current_ctc_lpa)
    if req.experience_years is not None:
        current_user.experience_years = str(req.experience_years)
    if req.candidate_pool:
        current_user.candidate_pool = req.candidate_pool

    db.commit()

    # Auto-synchronize role-calibrated technical revision flashcards for any role or experience level
    try:
        from app.services.skill_gap_engine import skill_gap_engine
        skill_gap_engine.sync_user_learning_topics(
            db, 
            current_user.id, 
            profile.target_role or "Full Stack", 
            profile.candidate_pool or "EXPERIENCED",
            profile.experience_years or 2.0
        )
    except Exception as e:
        print(f"Error syncing learning topics for user {current_user.id}: {e}")

    db.refresh(profile)
    return profile

@router.post("/enhance-bullet")
def enhance_bullet_point(req: BulletEnhanceReq):
    sys_prompt = f"""
You are a Principal Technical Recruiter and Career Coach.
Transform the candidate's rough bullet point into 2 high-impact, professional resume bullet points using the Google X-Y-Z and STAR method (Accomplished [X], as measured by [Y], by doing [Z]).
Target Role: {req.target_role}
Tech Stack: {req.tech_stack}
Rules:
- Include action verbs (Architected, Engineered, Optimized, Implemented).
- Add realistic quantifiable metrics (latency %, cost %, throughput, scale).
- Keep each bullet to 1-2 concise lines.
Return ONLY valid JSON: {{"enhanced_bullets": ["bullet 1", "bullet 2"]}}
"""
    user_prompt = f"Rough text: \"{req.rough_text}\""
    
    try:
        res = ai_service.generate_completion(sys_prompt, user_prompt, temperature=0.3)
        import json
        clean = res.strip().replace("```json", "").replace("```", "").strip()
        data = json.loads(clean)
        return data
    except Exception:
        # Dynamic heuristic fallback
        cleaned = req.rough_text.strip().capitalize()
        return {
            "enhanced_bullets": [
                f"Architected and deployed {cleaned} utilizing {req.tech_stack}, improving operational efficiency and reducing query latency by 35%.",
                f"Engineered production-ready {cleaned} with automated error-handling and unit testing, slashing deployment turnaround time from 3 days to under 15 minutes."
            ]
        }
