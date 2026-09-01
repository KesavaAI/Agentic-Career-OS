"""
JOB ALERTS & CONTINUOUS JOB MONITORING SERVICE
Executes saved search preference evaluation:
CRAWL/POLL PERMITTED SOURCES (WITH FAILURE ISOLATION) -> DETECT NEW MATCHING JOBS -> 8-PILLAR MATCH & RANK -> DEDUPLICATE NOTIFICATIONS -> DISPATCH IN-APP NOTIFICATIONS
"""

from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional, Set
from sqlalchemy.orm import Session

from app.models.job import Job
from app.models.profile import Profile
from app.models.notification import Notification
from app.models.job_alert import JobAlert, JobAlertNotification
from app.services.matching_engine import ai_job_matcher
from app.services.career_taxonomy import career_taxonomy
from app.services.job_discovery_engine import job_discovery_engine
from app.services.email_service import email_service

class JobAlertMonitorService:
    """
    Continuous Job Alert Monitoring Engine with resilient failure isolation.
    """

    @classmethod
    def scan_alert(
        cls,
        alert: JobAlert,
        db: Session,
        profile_override: Optional[Dict[str, Any]] = None,
        force_crawl: bool = False
    ) -> Dict[str, Any]:
        """
        Evaluates a single JobAlert against live opportunities.
        """
        # Step 1: Optional Live ATS Crawl with Failure Isolation
        if force_crawl:
            try:
                # Discovers live jobs for the alert's career
                job_discovery_engine.discover_live_jobs(
                    db=db,
                    target_role=alert.career,
                    target_ctc=alert.min_salary or 15.0,
                    max_jobs=10
                )
            except Exception as e:
                print(f"[JobAlertMonitor] Live crawl non-fatal warning for alert #{alert.id}: {e}")

        # Step 2: Fetch Active Candidate Profile
        profile = db.query(Profile).first()
        profile_dict = profile_override or (profile.__dict__ if profile else {})
        
        # Override profile career & preferences with Alert's specific criteria
        eval_profile = dict(profile_dict)
        eval_profile["primary_career"] = alert.career
        eval_profile["target_role"] = alert.career
        if alert.min_salary:
            eval_profile["target_min_ctc_lpa"] = alert.min_salary

        # Merge alert keywords into evaluation skills to reflect saved search competencies
        if alert.keywords and isinstance(alert.keywords, list):
            existing_skills = eval_profile.get("skills", {})
            if isinstance(existing_skills, dict):
                merged_skills = dict(existing_skills)
                merged_skills["alert_keywords"] = list(alert.keywords)
                eval_profile["skills"] = merged_skills
            elif isinstance(existing_skills, str):
                eval_profile["skills"] = existing_skills + ", " + ", ".join(alert.keywords)

        # Step 3: Query Candidate Jobs from DB
        query = db.query(Job).filter(Job.is_archived == False)

        # Min Salary Filter
        if alert.min_salary and alert.min_salary > 0:
            query = query.filter(Job.max_salary >= alert.min_salary)

        candidate_jobs = query.all()

        # Step 4: Existing Sent Notifications (Ensures 0 duplicate notifications)
        already_notified_job_ids: Set[int] = {
            n.job_id for n in db.query(JobAlertNotification).filter_by(alert_id=alert.id).all()
        }

        # Step 5: Evaluate each job
        matched_jobs = []
        new_notifications = []
        keywords = [k.strip().lower() for k in (alert.keywords or []) if isinstance(k, str) and k.strip()]

        india_hubs = {"india", "bengaluru", "bangalore", "hyderabad", "mumbai", "delhi", "pune", "chennai", "noida", "gurgaon", "remote"}

        for job in candidate_jobs:
            j_dict = job.__dict__
            j_loc_l = (job.location or "").lower()
            j_wm_l = (job.work_mode or "").lower()
            
            # Location & Remote Filter
            if alert.location and alert.location != "ALL":
                loc_req_l = alert.location.strip().lower()
                if loc_req_l in ["india", "in"]:
                    if not any(hub in j_loc_l or hub in j_wm_l for hub in india_hubs):
                        continue
                else:
                    if loc_req_l not in j_loc_l and "remote" not in j_loc_l:
                        continue

            if alert.is_remote:
                if "remote" not in j_wm_l and "hybrid" not in j_wm_l and "remote" not in j_loc_l:
                    continue

            # Keywords Match Filter
            if keywords:
                text_blob = f"{job.role} {job.company_name} {job.description or ''} {job.required_skills or ''}".lower()
                if not any(kw in text_blob for kw in keywords):
                    continue

            # Experience Range Filter
            if alert.experience_min is not None and job.experience_max is not None:
                if job.experience_max < alert.experience_min:
                    continue
            if alert.experience_max is not None and job.experience_min is not None:
                if job.experience_min > alert.experience_max + 1.5:
                    continue

            # Run 8-Pillar AI Matching
            match_res = ai_job_matcher.calculate_match(j_dict, eval_profile)
            overall_score = match_res["overall_score"]

            # Match Score Threshold
            if overall_score < (alert.min_match_score or 70):
                continue

            # Compute Rank Score
            comp_rank = round(
                (overall_score * 0.50) +
                (match_res["required_skills_score"] * 0.25) +
                (match_res["salary_fit_score"] * 0.25),
                2
            )

            matched_jobs.append({
                "job": job,
                "match_res": match_res,
                "composite_rank": comp_rank
            })

            # Check if this job has already been notified to this alert
            if job.id not in already_notified_job_ids:
                # Create In-App Notification
                top_str = match_res["strengths"][0] if match_res.get("strengths") else "Meets technical requirements"
                matched_sk = ", ".join(match_res["matched_skills"][:3]) if match_res.get("matched_skills") else "Core skills"

                notif = Notification(
                    user_id=alert.user_id,
                    type="JOB_ALERT",
                    title=f"🎯 New {alert.career} Match: {job.role} at {job.company_name} ({overall_score}% Match)",
                    message=f"Matched your alert '{alert.title}'. Package: ₹{job.min_salary or 10}L - ₹{job.max_salary or 20}L LPA • {job.work_mode}. Skills: {matched_sk}. {top_str}.",
                    link=f"/discovery?jobId={job.id}",
                    urgency="High",
                    is_read=False
                )
                db.add(notif)

                # Record Notification Log to guarantee no duplicate notifications
                alert_notif = JobAlertNotification(
                    alert_id=alert.id,
                    job_id=job.id,
                    match_score=overall_score,
                    composite_rank=comp_rank,
                    notification_channel="IN_APP",
                    status="DELIVERED"
                )
                db.add(alert_notif)

                # Optional Email Notification (Isolated from failure)
                if alert.notify_email:
                    try:
                        email_body = f"Hello!\\n\\nA new job matching your alert '{alert.title}' has been discovered:\\n\\nRole: {job.role}\\nCompany: {job.company_name}\\nLocation: {job.location} ({job.work_mode})\\nMatch Score: {overall_score}%\\n\\nView details inside Agentic Career OS."
                        email_service.send_email(
                            subject=f"🎯 New Job Alert: {job.role} at {job.company_name}",
                            body=email_body
                        )
                    except Exception as email_err:
                        print(f"[JobAlertMonitor] Non-fatal email dispatch error: {email_err}")

                new_notifications.append({
                    "job_id": job.id,
                    "role": job.role,
                    "company_name": job.company_name,
                    "match_score": overall_score,
                    "composite_rank": comp_rank
                })
                already_notified_job_ids.add(job.id)

        # Step 6: Update Alert Statistics
        alert.last_scanned_at = datetime.utcnow()
        alert.last_result_count = len(matched_jobs)
        alert.total_notifications_sent += len(new_notifications)
        db.commit()

        return {
            "alert_id": alert.id,
            "title": alert.title,
            "career": alert.career,
            "total_matched_jobs": len(matched_jobs),
            "new_notifications_sent": len(new_notifications),
            "new_jobs": new_notifications,
            "last_scanned_at": alert.last_scanned_at.isoformat()
        }

    @classmethod
    def monitor_all_active_alerts(cls, db: Session, force_crawl: bool = False) -> Dict[str, Any]:
        """
        Runs continuous monitoring across all active JobAlert records.
        """
        active_alerts = db.query(JobAlert).filter(JobAlert.is_active == True).all()
        results = []
        total_new_notifs = 0

        for alert in active_alerts:
            try:
                res = cls.scan_alert(alert=alert, db=db, force_crawl=force_crawl)
                results.append(res)
                total_new_notifs += res["new_notifications_sent"]
            except Exception as ex:
                print(f"[JobAlertMonitor] Error monitoring alert #{alert.id} ({alert.title}): {ex}")
                results.append({
                    "alert_id": alert.id,
                    "title": alert.title,
                    "error": str(ex),
                    "status": "FAILED_PARTIALLY"
                })

        return {
            "success": True,
            "monitored_alerts_count": len(active_alerts),
            "total_new_notifications_sent": total_new_notifs,
            "details": results
        }

job_alert_monitor = JobAlertMonitorService()
