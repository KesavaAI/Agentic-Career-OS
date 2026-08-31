from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from typing import Optional, List, Dict, Any

from app.database import get_db
from app.services.job_discovery_engine import job_discovery_engine
from app.services.role_intelligence_engine import role_intelligence_engine
from app.services.career_taxonomy import career_taxonomy
from app.models.user import User
from app.dependencies import get_current_user

router = APIRouter(prefix="/discovery", tags=["Autonomous Job Discovery Agent"])

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
