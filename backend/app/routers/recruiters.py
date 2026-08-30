from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.recruiter import Recruiter
from app.schemas.recruiter import RecruiterOut, RecruiterCreate, RecruiterUpdate, OutreachTemplateRequest

router = APIRouter(prefix="/recruiters", tags=["Recruiters"])

@router.get("", response_model=List[RecruiterOut])
def list_recruiters(db: Session = Depends(get_db)):
    return db.query(Recruiter).order_by(Recruiter.created_at.desc()).all()

@router.post("", response_model=RecruiterOut)
def create_recruiter(req: RecruiterCreate, db: Session = Depends(get_db)):
    rec = Recruiter(**req.dict())
    db.add(rec)
    db.commit()
    db.refresh(rec)
    return rec

@router.put("/{rec_id}", response_model=RecruiterOut)
def update_recruiter(rec_id: int, req: RecruiterUpdate, db: Session = Depends(get_db)):
    rec = db.query(Recruiter).filter(Recruiter.id == rec_id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Recruiter not found")
    for key, val in req.dict(exclude_unset=True).items():
        setattr(rec, key, val)
    db.commit()
    db.refresh(rec)
    return rec

@router.post("/template")
def get_outreach_template(req: OutreachTemplateRequest):
    r_name = req.recruiter_name or "Hiring Team"
    comp = req.company_name or "Company"
    role = req.role_title or "GenAI / Agentic AI Engineer"
    
    if req.template_type == "outreach":
        subject = f"GenAI / Agentic AI Engineer - Application for {role} at {comp}"
        body = f"""Hi {r_name},

I hope this message finds you well.

I recently noticed the {role} opportunity at {comp} and wanted to reach out directly. Over the past ~1.6 years at Tata Consultancy Services (TCS), I specialized in production GenAI and Agentic AI systems—specifically architecting our enterprise Agentic Data Intelligence platform with LangGraph, RAG pipelines, Azure OpenAI, and FastAPI.

My hands-on experience in building deterministic stateful agents and optimizing vector search latency aligns strongly with {comp}'s mission. I would love the chance to connect briefly regarding this role.

Best regards,
Kesava
[LinkedIn](https://linkedin.com/in/kesava-ai) | [GitHub](https://github.com/kesava-ai)
"""
    elif req.template_type == "followup":
        subject = f"Following up on {role} Application - Kesava"
        body = f"""Hi {r_name},

I hope you're having a great week.

I wanted to follow up on my recent application for the {role} position at {comp}. I remain very enthusiastic about the opportunity to bring my LangGraph and Azure OpenAI engineering background to your team.

Please let me know if you need any additional portfolio artifacts or details from my end.

Warm regards,
Kesava
"""
    elif req.template_type == "thank_you":
        subject = f"Thank you for the conversation today - {comp} {role}"
        body = f"""Hi {r_name},

Thank you for taking the time to speak with me today regarding the {role} role at {comp}. I really enjoyed learning more about the engineering challenges and roadmap.

Our discussion reinforced my enthusiasm for joining the team and applying my background in multi-agent orchestration and low-latency RAG architectures.

Looking forward to the next steps!

Best regards,
Kesava
"""
    else:
        subject = f"Availability for Interview - {role} at {comp}"
        body = f"""Hi {r_name},

Thank you for reaching out! I am very excited to proceed to the next round for the {role} position.

Here is my availability for the upcoming week (IST):
- Monday / Tuesday: 10:00 AM - 01:00 PM, 04:00 PM - 07:00 PM
- Wednesday / Thursday: 11:00 AM - 02:00 PM, 05:00 PM - 08:00 PM

Looking forward to speaking with the team.

Best regards,
Kesava
"""
    return {"subject": subject, "body": body}
