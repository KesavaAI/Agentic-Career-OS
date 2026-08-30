from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import JSONResponse, Response
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import (
    Job, Application, Company, Recruiter, Interview,
    Resume, Project, LearningTopic, FollowUp, Offer, AuditLog
)
import json
import pandas as pd
import io

router = APIRouter(prefix="/backup-export", tags=["Backup & Export"])

@router.get("/export-json")
def export_all_data(db: Session = Depends(get_db)):
    data = {
        "jobs": [j.__dict__ for j in db.query(Job).all()],
        "applications": [a.__dict__ for a in db.query(Application).all()],
        "companies": [c.__dict__ for c in db.query(Company).all()],
        "recruiters": [r.__dict__ for r in db.query(Recruiter).all()],
        "interviews": [i.__dict__ for i in db.query(Interview).all()],
        "resumes": [res.__dict__ for res in db.query(Resume).all()],
        "projects": [p.__dict__ for p in db.query(Project).all()],
        "learning_topics": [l.__dict__ for l in db.query(LearningTopic).all()],
        "follow_ups": [f.__dict__ for f in db.query(FollowUp).all()],
        "offers": [o.__dict__ for o in db.query(Offer).all()]
    }
    
    # Clean non-serializable objects
    cleaned = {}
    for table_name, records in data.items():
        cleaned[table_name] = []
        for rec in records:
            clean_rec = {}
            for k, v in rec.items():
                if k.startswith("_"):
                    continue
                if hasattr(v, "isoformat"):
                    clean_rec[k] = v.isoformat()
                else:
                    clean_rec[k] = v
            cleaned[table_name].append(clean_rec)

    return JSONResponse(
        content=cleaned,
        headers={"Content-Disposition": "attachment; filename=kesava_career_backup.json"}
    )

@router.get("/export-jobs-csv")
def export_jobs_csv(db: Session = Depends(get_db)):
    jobs = db.query(Job).all()
    rows = []
    for j in jobs:
        rows.append({
            "ID": j.id,
            "Tier": j.tier,
            "Priority": j.priority_score,
            "Company": j.company_name,
            "Role": j.role,
            "Location": j.location,
            "Work Mode": j.work_mode,
            "Salary Min": j.min_salary,
            "Salary Max": j.max_salary,
            "Status": j.status,
            "Match Score": j.match_score,
            "Job URL": j.job_url,
            "Source": j.source,
            "Freshness": j.freshness_badge
        })
    df = pd.DataFrame(rows)
    csv_str = df.to_csv(index=False)
    return Response(
        content=csv_str,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=kesava_career_jobs.csv"}
    )
