from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from app.database import get_db
from app.models.user import User
from app.models.profile import Profile
from app.models.job import Job
from app.models.application import Application
from app.models.interview import Interview
from app.models.followup import FollowUp
from app.models.learning import LearningTopic
from app.models.offer import Offer
from app.models.resume import Resume
from app.dependencies import get_current_user
from app.services.readiness_score import readiness_engine
from typing import Dict, Any, List

router = APIRouter(prefix="/analytics", tags=["Analytics & Readiness"])

@router.get("/today-priorities")
def get_today_priorities(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # 1. Apply Today: Tier A / high match jobs ready to apply or active
    tier_a_jobs = db.query(Job).filter(
        Job.status.in_(["READY TO APPLY", "SHORTLISTED", "DISCOVERED", "ACTIVE", "AUTONOMOUSLY APPLIED"])
    ).order_by(Job.match_score.desc()).limit(6).all()
    
    # 2. Follow-ups: Uncompleted follow ups or active applied applications waiting > 3 days
    followups = db.query(FollowUp).filter(FollowUp.is_completed == False).order_by(FollowUp.follow_up_date.asc()).limit(6).all()
    followup_list = []
    if followups and len(followups) > 0:
        for f in followups:
            followup_list.append({
                "id": f.id,
                "company": f.company_name,
                "role": f.role_title,
                "due": f.follow_up_date.strftime("%d %b") if f.follow_up_date else "Today",
                "action": f.action_notes or "Follow-up outreach"
            })
    else:
        # Fallback to applications waiting for response
        waiting_apps = db.query(Application).filter(
            Application.status.in_(["APPLIED", "AUTONOMOUSLY APPLIED", "RECRUITER CONTACTED"])
        ).order_by(Application.created_at.desc()).limit(6).all()
        for a in waiting_apps:
            followup_list.append({
                "id": a.id,
                "company": a.company_name,
                "role": a.role_title,
                "due": "Action Needed",
                "action": f"Status: {a.status} (1-Click Outreach)"
            })
    
    # 3. Interviews: Upcoming scheduled rounds
    interviews = db.query(Interview).order_by(Interview.scheduled_at.asc()).limit(5).all()
    interview_list = []
    if interviews and len(interviews) > 0:
        for i in interviews:
            interview_list.append({
                "id": i.id,
                "company": i.company_name,
                "role": i.role_title,
                "stage": i.stage or i.interview_type or "Technical Round",
                "time": f"{i.scheduled_at.strftime('%d %b') if i.scheduled_at else 'Upcoming'} - {i.time_str or '11:00 AM'}"
            })
    else:
        # Check applications in interview / shortlisted stage
        shortlisted_apps = db.query(Application).filter(
            Application.status.ilike("%INTERVIEW%") | Application.status.ilike("%SHORTLISTED%") | Application.status.ilike("%ROUND%")
        ).limit(4).all()
        for a in shortlisted_apps:
            interview_list.append({
                "id": a.id,
                "company": a.company_name,
                "role": a.role_title,
                "stage": a.status,
                "time": "In Preparation"
            })
    
    # 4. Dynamic Prepare topics based on candidate role & pool
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first() if current_user else db.query(Profile).first()
    pool = profile.candidate_pool if profile else "EXPERIENCED"
    target_role = profile.target_role if profile else "Full Stack / Software Engineer"
    
    prepare_topics = [
        {"topic": f"High-Throughput Architecture & Concurrency for {target_role}", "priority": "High", "context": "System Design Round"},
        {"topic": "PostgreSQL Query Optimization, PgBouncer & Indexing", "priority": "High", "context": "Backend Deep Dive"},
        {"topic": "Next.js SSR, ISR & Core Web Vitals (LCP/INP) Tuning", "priority": "Medium", "context": "Full Stack Architecture"}
    ]
    
    # 5. Learn topics: Spaced repetition topics from DB
    learn_topics = db.query(LearningTopic).order_by(LearningTopic.priority.desc()).limit(5).all()
    if not learn_topics or len(learn_topics) == 0:
        learn_topics_list = [
            {"id": 1, "skill": "LangGraph StateGraph & Multi-Agent Loops", "priority": "High", "status": "YELLOW", "stage": "RECALL"},
            {"id": 2, "skill": "Redis Lua Scripts & Distributed Locks", "priority": "High", "status": "YELLOW", "stage": "LEARN"},
            {"id": 3, "skill": "Database Connection Pool Saturation Triage", "priority": "Medium", "status": "GREEN", "stage": "APPLY"}
        ]
    else:
        learn_topics_list = [{"id": l.id, "skill": l.skill, "priority": l.priority, "status": l.status, "stage": l.stage} for l in learn_topics]
    
    # 6. Resume tailoring needed
    resume_tailor_jobs = db.query(Job).filter(Job.tier.in_(["A", "B"])).order_by(Job.id.desc()).limit(4).all()
    
    # 7. New opportunities: Recently ingested jobs
    new_jobs = db.query(Job).order_by(Job.id.desc()).limit(6).all()

    return {
        "apply_today": [{"id": j.id, "company": j.company_name, "role": j.role, "salary": f"₹{j.min_salary}L - ₹{j.max_salary}L LPA", "match": j.match_score} for j in tier_a_jobs],
        "follow_ups": followup_list,
        "interviews": interview_list,
        "prepare_topics": prepare_topics,
        "learn_topics": learn_topics_list,
        "resume_tailor": [{"id": j.id, "company": j.company_name, "role": j.role} for j in resume_tailor_jobs],
        "new_opportunities": [{"id": j.id, "company": j.company_name, "role": j.role, "location": j.location, "freshness": j.freshness_badge or "🔥 Active"} for j in new_jobs],
        "summary_count": {
            "apply_today": len(tier_a_jobs),
            "follow_ups": len(followup_list),
            "interviews": len(interview_list),
            "learn_topics": len(learn_topics_list),
            "resume_tailor": len(resume_tailor_jobs),
            "new_opportunities": len(new_jobs)
        }
    }

@router.get("/readiness")
def get_readiness_score(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    learning_greens = db.query(LearningTopic).filter(LearningTopic.status == "GREEN").count()
    total_learning = max(db.query(LearningTopic).count(), 1)
    tech_skill_avg = min(82 + (learning_greens / total_learning) * 16, 98)
    
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first() if current_user else db.query(Profile).first()
    project_depth = 92.0 if (profile and (profile.experiences or profile.internships)) else 85.0
    mock_interview_avg = 88.0
    ats_resume_strength = 94.0
    
    apps_count = db.query(Application).count()
    funnel_momentum = min(70.0 + (apps_count * 2.5), 98.0)
    
    return readiness_engine.calculate(
        tech_skill_avg=tech_skill_avg,
        tcs_project_depth=project_depth,
        mock_interview_avg=mock_interview_avg,
        ats_resume_strength=ats_resume_strength,
        funnel_momentum=funnel_momentum
    )

@router.get("/funnel")
def get_funnel_analytics(db: Session = Depends(get_db)):
    total_jobs = db.query(Job).count()
    tier_ab_jobs = db.query(Job).filter(Job.tier.in_(["A", "B"])).count()
    apps = db.query(Application).all()
    total_apps = len(apps)
    
    # Genuine recruiter responses: candidate got contact, assessment, shortlist or interview
    responses = sum(1 for a in apps if a.status in [
        "RECRUITER CONTACTED", "SHORTLISTED", "OA / ASSESSMENT", "TECHNICAL ROUND",
        "INTERVIEW SCHEDULED", "SYSTEM DESIGN", "MANAGERIAL ROUND", "HR ROUND", "OFFER", "OFFER ACCEPTED"
    ])
    
    # Genuine interview rounds: actual interview stage in app or interview record
    interview_app_count = sum(1 for a in apps if any(k in a.status.upper() for k in [
        "TECHNICAL ROUND", "INTERVIEW", "SYSTEM DESIGN", "MANAGERIAL ROUND", "HR ROUND", "OA / ASSESSMENT"
    ]))
    interviews_attended = max(interview_app_count, db.query(Interview).count())
    
    # Genuine final rounds & offers
    finals = sum(1 for a in apps if a.status in ["MANAGERIAL ROUND", "HR ROUND", "OFFER", "OFFER ACCEPTED"])
    offers = db.query(Offer).count()
    
    resp_rate = round((responses / total_apps) * 100, 1) if total_apps > 0 else 0.0
    int_rate = round((interviews_attended / total_apps) * 100, 1) if total_apps > 0 else 0.0
    off_rate = round((offers / total_apps) * 100, 1) if total_apps > 0 else 0.0
    apps_per_offer = round(total_apps / offers, 1) if offers > 0 else 0.0

    return {
        "jobs_found": total_jobs,
        "relevant_jobs": total_jobs,
        "tier_a_b_jobs": tier_ab_jobs,
        "applications_submitted": total_apps,
        "recruiter_responses": responses,
        "interviews_attended": interviews_attended,
        "final_rounds": finals,
        "offers_received": offers,
        "response_rate_pct": resp_rate,
        "interview_rate_pct": int_rate,
        "offer_rate_pct": off_rate,
        "applications_per_offer_estimate": apps_per_offer
    }

@router.get("")
@router.get("/dashboard")
def get_analytics_dashboard(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    funnel = get_funnel_analytics(db)
    readiness = get_readiness_score(db, current_user)
    return {
        "funnel": funnel,
        "readiness": readiness,
        "status": "ONLINE"
    }
