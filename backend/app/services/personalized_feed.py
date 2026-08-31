"""
PERSONALIZED OPPORTUNITY FEED ENGINE
Executes the full pipeline:
USER PROFILE -> ACTIVE CAREER -> RELATED ROLES -> LIVE JOBS -> ELIGIBILITY FILTER -> 8-PILLAR MATCH -> RANKING -> DEDUPLICATION -> PERSONALIZED FEED
"""

import math
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional, Set
from sqlalchemy.orm import Session

from app.models.job import Job
from app.models.job_match import JobMatch
from app.models.profile import Profile
from app.models.user import User
from app.services.career_taxonomy import career_taxonomy
from app.services.matching_engine import ai_job_matcher

class PersonalizedFeedEngine:
    """
    High-Performance Personalized Opportunity Feed Engine.
    Filters, computes 8-pillar scores, ranks, and deduplicates opportunities.
    """

    @classmethod
    def get_personalized_feed(
        cls,
        db: Session,
        user: Optional[User] = None,
        profile_override: Optional[Dict[str, Any]] = None,
        career: Optional[str] = None,
        related_roles: Optional[List[str]] = None,
        min_salary: Optional[float] = None,
        experience_level: Optional[str] = None,
        location: Optional[str] = None,
        work_mode: Optional[str] = None,
        skills: Optional[List[str]] = None,
        employment_type: Optional[str] = None,
        posted_date_filter: Optional[str] = "ALL", # "24h", "7d", "30d", "ALL"
        match_tier: Optional[str] = "ALL", # "A", "B", "C", "ALL"
        search: Optional[str] = None,
        sort_by: Optional[str] = "composite_rank", # "composite_rank", "match_score", "recent", "salary"
        page: int = 1,
        page_size: int = 20
    ) -> Dict[str, Any]:
        """
        Executes end-to-end personalized opportunity feed ranking.
        """
        # Step 1: Extract User Profile & Active Career
        profile = db.query(Profile).first()
        profile_dict = profile_override or (profile.__dict__ if profile else {})
        
        active_career = career or profile_dict.get("primary_career", profile_dict.get("target_role", "AI Engineer"))
        target_role = profile_dict.get("target_role", active_career)
        
        # Step 2: Role Intelligence Ecosystem
        intel = career_taxonomy.get_role_intelligence(active_career)
        all_related_roles = intel.get("primary_roles", []) + intel.get("related_roles", [])
        
        # Step 3: Query Live Jobs (excluding archived)
        query = db.query(Job).filter(Job.is_archived == False)
        
        # Base database-level filters
        if min_salary and min_salary > 0:
            query = query.filter(Job.max_salary >= min_salary)
        
        if location and location != "ALL":
            query = query.filter(Job.location.ilike(f"%{location}%"))
            
        if work_mode and work_mode != "ALL":
            query = query.filter(Job.work_mode.ilike(f"%{work_mode}%"))

        if posted_date_filter and posted_date_filter != "ALL":
            now = datetime.utcnow()
            if posted_date_filter == "24h":
                cutoff = now - timedelta(hours=24)
            elif posted_date_filter == "7d":
                cutoff = now - timedelta(days=7)
            elif posted_date_filter == "30d":
                cutoff = now - timedelta(days=30)
            else:
                cutoff = None
            if cutoff:
                query = query.filter(Job.created_at >= cutoff)

        if employment_type and employment_type != "ALL":
            query = query.filter(Job.job_type.ilike(f"%{employment_type}%"))

        all_candidate_jobs = query.all()

        # Step 4: 8-Pillar Scoring, Eligibility Filtering & Evaluation
        evaluated_jobs = []
        now = datetime.utcnow()

        for job in all_candidate_jobs:
            j_dict = job.__dict__
            
            # Text search filter
            if search:
                s_lower = search.strip().lower()
                text_blob = f"{job.role} {job.company_name} {job.description or ''} {job.required_skills or ''}".lower()
                if s_lower not in text_blob:
                    continue

            # Related roles filter if specifically requested
            if related_roles and len(related_roles) > 0 and "ALL" not in related_roles:
                job_title_l = job.role.lower()
                if not any(r.lower() in job_title_l for r in related_roles):
                    continue

            # Skills filter if specified
            if skills and len(skills) > 0:
                job_skills_blob = (job.required_skills or "").lower()
                if not any(sk.lower().strip() in job_skills_blob for sk in skills if sk.strip()):
                    continue

            # Calculate 8-Pillar Dynamic Match
            match_res = ai_job_matcher.calculate_match(j_dict, profile_dict)
            
            # Match Tier filter
            if match_tier and match_tier != "ALL" and match_res["tier"] != match_tier.upper():
                continue

            # Experience Level filter
            if experience_level and experience_level != "ALL":
                exp_score = match_res["experience_fit_score"]
                if "senior" in experience_level.lower() and exp_score < 70:
                    continue
                elif "junior" in experience_level.lower() and exp_score < 70:
                    continue

            # Compute Freshness Decay (100 = today, decay by 5 pts per day down to 40)
            posted_dt = job.posted_date or job.created_at or now
            days_old = max(0, (now - posted_dt.replace(tzinfo=None)).days) if isinstance(posted_dt, datetime) else 0
            freshness_score = max(40, 100 - (days_old * 5))

            # Composite Ranking Score:
            # Match Score (50%) + Freshness (20%) + Skills Fit (15%) + Salary Fit (15%)
            comp_rank = round(
                (match_res["overall_score"] * 0.50) +
                (freshness_score * 0.20) +
                (match_res["required_skills_score"] * 0.15) +
                (match_res["salary_fit_score"] * 0.15),
                2
            )

            evaluated_jobs.append({
                "job": job,
                "match_res": match_res,
                "composite_rank": comp_rank,
                "freshness_score": freshness_score,
                "days_old": days_old
            })

        # Step 5: Deduplication (Keep highest-scoring job per company + normalized role)
        dedup_map: Dict[str, Any] = {}
        for entry in evaluated_jobs:
            job = entry["job"]
            key = f"{job.company_name.strip().lower()}:::{job.role.strip().lower()}"
            if key not in dedup_map or entry["composite_rank"] > dedup_map[key]["composite_rank"]:
                dedup_map[key] = entry

        deduped_entries = list(dedup_map.values())

        # Step 6: Sorting & Ranking
        if sort_by == "match_score":
            deduped_entries.sort(key=lambda x: (x["match_res"]["overall_score"], x["composite_rank"]), reverse=True)
        elif sort_by == "recent":
            deduped_entries.sort(key=lambda x: (x["job"].posted_date or x["job"].created_at or datetime.min), reverse=True)
        elif sort_by == "salary":
            deduped_entries.sort(key=lambda x: (x["job"].max_salary or 0.0, x["match_res"]["overall_score"]), reverse=True)
        else:
            # Default: composite_rank
            deduped_entries.sort(key=lambda x: x["composite_rank"], reverse=True)

        # Step 7: Pagination
        total_count = len(deduped_entries)
        total_pages = math.ceil(total_count / page_size) if page_size > 0 else 1
        offset = (page - 1) * page_size
        paged_entries = deduped_entries[offset:offset + page_size]

        # Step 8: Build Final UI Opportunity Cards
        items = []
        for entry in paged_entries:
            j = entry["job"]
            m = entry["match_res"]
            
            top_strength = m["strengths"][0] if m.get("strengths") else f"Aligned with target {active_career} benchmarks"

            items.append({
                "id": j.id,
                "role": j.role,
                "company_name": j.company_name,
                "location": j.location or "Remote",
                "work_mode": j.work_mode or "Hybrid",
                "min_salary": j.min_salary,
                "max_salary": j.max_salary,
                "experience_min": j.experience_min,
                "experience_max": j.experience_max,
                "source": j.source,
                "employment_type": getattr(j, "employment_type", "Full-time"),
                "apply_url": getattr(j, "job_url", None) or getattr(j, "canonical_url", None),
                "posted_date": j.posted_date.isoformat() if j.posted_date else None,
                "freshness_badge": j.freshness_badge or ("Today" if entry["days_old"] == 0 else f"{entry['days_old']}d ago"),
                "status": j.status,
                
                # 8-Pillar Scoring & Intelligence
                "match_score": m["overall_score"],
                "priority_score": m["priority_score"],
                "composite_rank": entry["composite_rank"],
                "tier": m["tier"],
                "eligibility": m["eligibility"],
                "recommendation": m["recommendation"],
                "recommendation_rationale": m["recommendation_rationale"],
                "top_strength": top_strength,
                "matched_skills": m["matched_skills"][:6],
                "missing_skills": m["missing_skills"][:4],
                "pillar_scores": m["pillar_scores"],
                "breakdown": m["breakdown"]
            })

        empty_guidance = None
        if total_count == 0:
            empty_guidance = {
                "title": f"No active opportunities found for {active_career}",
                "message": f"Try lowering your minimum salary threshold (currently ₹{min_salary or 18}L), switching location/work mode, or trigger an autonomous live market crawl across Greenhouse, Lever, Ashby, and Himalayas.",
                "suggested_roles": all_related_roles[:5],
                "suggested_action": "CRAWL_LIVE_JOBS"
            }

        return {
            "success": True,
            "active_career_context": {
                "primary_career": active_career,
                "domain_name": intel["domain_name"],
                "career_stream": intel["career_stream"],
                "role_family": intel["role_family"],
                "related_roles": all_related_roles,
                "specializations": intel["specializations"],
                "required_skills": intel["required_skills"]
            },
            "items": items,
            "total_count": total_count,
            "page": page,
            "page_size": page_size,
            "total_pages": total_pages,
            "empty_guidance": empty_guidance
        }

personalized_feed_engine = PersonalizedFeedEngine()
