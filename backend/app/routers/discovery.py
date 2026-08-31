from fastapi import APIRouter, Depends, HTTPException, Body, Query
from sqlalchemy.orm import Session
from typing import Optional, List, Dict, Any

from app.database import get_db
from app.services.job_discovery_engine import job_discovery_engine
from app.services.role_intelligence_engine import role_intelligence_engine
from app.services.career_taxonomy import career_taxonomy
from app.services.personalized_feed import personalized_feed_engine
from app.models.user import User
from app.dependencies import get_current_user

router = APIRouter(prefix="/discovery", tags=["Autonomous Job Discovery & Personalized Feed"])

@router.get("/feed")
def get_personalized_opportunity_feed(
    career: Optional[str] = Query(None, description="Active target career override"),
    related_roles: Optional[str] = Query(None, description="Comma-separated related roles"),
    min_salary: Optional[float] = Query(None, description="Minimum salary threshold LPA"),
    experience_level: Optional[str] = Query(None, description="Seniority / Experience bracket"),
    location: Optional[str] = Query(None, description="Location / city filter"),
    work_mode: Optional[str] = Query(None, description="Remote / Hybrid / Onsite / ALL"),
    skills: Optional[str] = Query(None, description="Comma-separated skill filter"),
    employment_type: Optional[str] = Query(None, description="Full-time, Contract, etc."),
    posted_date: Optional[str] = Query("ALL", description="Freshness: 24h, 7d, 30d, ALL"),
    match_tier: Optional[str] = Query("ALL", description="Tier filter: A, B, C, ALL"),
    search: Optional[str] = Query(None, description="Search query string"),
    sort_by: Optional[str] = Query("composite_rank", description="Sort criteria: composite_rank, match_score, recent, salary"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: Optional[User] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Prompt 4: Universal Personalized Opportunity Feed Endpoint.
    Executes:
    USER PROFILE -> ACTIVE CAREER -> RELATED ROLES -> LIVE JOBS -> ELIGIBILITY FILTER -> 8-PILLAR MATCH -> RANKING -> DEDUPLICATION -> PERSONALIZED FEED
    """
    rel_roles_list = [r.strip() for r in related_roles.split(",") if r.strip()] if isinstance(related_roles, str) and related_roles else None
    skills_list = [s.strip() for s in skills.split(",") if s.strip()] if isinstance(skills, str) and skills else None
    posted_date_val = posted_date if isinstance(posted_date, str) else "ALL"
    match_tier_val = match_tier if isinstance(match_tier, str) else "ALL"
    sort_by_val = sort_by if isinstance(sort_by, str) else "composite_rank"
    career_val = career if isinstance(career, str) else None
    min_sal_val = min_salary if isinstance(min_salary, (int, float)) else None
    exp_val = experience_level if isinstance(experience_level, str) else None
    loc_val = location if isinstance(location, str) else None
    wm_val = work_mode if isinstance(work_mode, str) else None
    search_val = search if isinstance(search, str) else None
    page_val = page if isinstance(page, int) else 1
    page_sz_val = page_size if isinstance(page_size, int) else 20

    feed = personalized_feed_engine.get_personalized_feed(
        db=db,
        user=current_user,
        career=career_val,
        related_roles=rel_roles_list,
        min_salary=min_sal_val,
        experience_level=exp_val,
        location=loc_val,
        work_mode=wm_val,
        skills=skills_list,
        employment_type=employment_type if isinstance(employment_type, str) else None,
        posted_date_filter=posted_date_val,
        match_tier=match_tier_val,
        search=search_val,
        sort_by=sort_by_val,
        page=page_val,
        page_size=page_sz_val
    )
    return feed

@router.post("/run-auto-scan")
def run_autonomous_job_scan(
    max_jobs: int = Body(10, embed=True),
    target_role: Optional[str] = Body(None, embed=True),
    target_ctc: Optional[float] = Body(None, embed=True),
    page: int = Body(1, embed=True),
    filter_domain: Optional[str] = Body(None, embed=True),
    current_user: Optional[User] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Universal Live Job Discovery Endpoint.
    Crawls Greenhouse, Lever, Ashby, and Himalayas ATS feeds concurrently,
    expands queries across the 22+ Domain Career Taxonomy, and returns clean normalized jobs.
    """
    result = job_discovery_engine.discover_live_jobs(
        db=db,
        user=current_user,
        target_role=target_role,
        target_ctc=target_ctc,
        page=page,
        max_jobs=max_jobs,
        filter_domain=filter_domain
    )
    return result

@router.get("/status")
def get_discovery_status(current_user: Optional[User] = Depends(get_current_user)):
    return {
        "status": "ONLINE",
        "connectors": [
            {"name": "Greenhouse ATS", "type": "ATS_API", "status": "ACTIVE", "scope": "Zepto, Swiggy, Stripe, Airbnb, Figma, Uber, Coinbase, GitLab, Brex, Discord, Pinterest"},
            {"name": "Lever ATS", "type": "ATS_API", "status": "ACTIVE", "scope": "Razorpay, Postman, Atlassian, Plaid, Spotify, Netflix, Palantir, Cloudflare, Datadog"},
            {"name": "Ashby ATS", "type": "ATS_API", "status": "ACTIVE", "scope": "Perplexity, Cursor, Ramp, Retool, Together-AI, Linear, Scale AI, Vercel, Supabase, Modal"},
            {"name": "Himalayas Public API", "type": "PUBLIC_API", "status": "ACTIVE", "scope": "Global Remote Tech Openings (Paginated)"}
        ],
        "active": True,
        "supported_domains_count": len(career_taxonomy.get_all_domains())
    }

@router.get("/taxonomy")
def get_it_career_taxonomy():
    """
    Returns the complete universal multi-domain career taxonomy.
    """
    domains = career_taxonomy.get_all_domains()
    return {
        "success": True,
        "total_domains": len(domains),
        "domains": domains
    }

@router.post("/normalize-title")
def normalize_job_title(
    title: str = Body(..., embed=True)
):
    """
    Normalizes any raw job title into Career Family, Canonical Role, Specialization, and Seniority.
    """
    normalized = role_intelligence_engine.normalize_title(title)
    return {
        "success": True,
        "normalized": normalized
    }
