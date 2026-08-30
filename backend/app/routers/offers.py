from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.offer import Offer
from app.schemas.offer import OfferOut, OfferCreate, OfferUpdate

router = APIRouter(prefix="/offers", tags=["Offers"])

@router.get("", response_model=List[OfferOut])
def list_offers(db: Session = Depends(get_db)):
    return db.query(Offer).order_by(Offer.total_ctc_lpa.desc()).all()

@router.post("", response_model=OfferOut)
def create_offer(req: OfferCreate, db: Session = Depends(get_db)):
    off = Offer(**req.dict())
    db.add(off)
    db.commit()
    db.refresh(off)
    return off

@router.put("/{offer_id}", response_model=OfferOut)
def update_offer(offer_id: int, req: OfferUpdate, db: Session = Depends(get_db)):
    off = db.query(Offer).filter(Offer.id == offer_id).first()
    if not off:
        raise HTTPException(status_code=404, detail="Offer not found")
    for key, val in req.dict(exclude_unset=True).items():
        setattr(off, key, val)
    db.commit()
    db.refresh(off)
    return off

from pydantic import BaseModel
from typing import Optional, Dict, Any

class NegotiateReq(BaseModel):
    company_name: str
    offered_ctc_lpa: float
    target_ctc_lpa: float
    role: str = "Software Engineer"
    competing_offer_notes: Optional[str] = None

@router.post("/generate-negotiation-script")
def generate_negotiation_script(req: NegotiateReq):
    diff = round(req.target_ctc_lpa - req.offered_ctc_lpa, 1)
    
    verbal_script = f"""Recruiter: "We are pleased to offer you ₹{req.offered_ctc_lpa} LPA for the {req.role} position at {req.company_name}."

Candidate: "Thank you so much for the offer! I am genuinely thrilled about the team's vision and the technical roadmap at {req.company_name}. 
Based on the high-impact architectural deliverables we discussed, as well as the current market benchmarks for {req.role} roles in this domain, I was targeting ₹{req.target_ctc_lpa} LPA.
If we can bridge this gap to ₹{req.target_ctc_lpa} LPA (either via base salary adjustment or a performance-linked joining incentive), I would be delighted to sign and commit immediately! Is there flexibility to make that happen?"
"""

    email_template = f"""Subject: Counter-Offer Discussion — {req.role} Offer | [Candidate Name]

Dear {req.company_name} Talent Acquisition Team,

Thank you so much for extending the offer to join {req.company_name} as a {req.role}. I am very excited about the opportunity to contribute directly to the team's engineering milestones.

After carefully reviewing the offer package of ₹{req.offered_ctc_lpa} LPA, I would like to discuss the compensation structure. Given my hands-on technical background, immediate deployment readiness, and prevailing market standards for this position, I was aiming for a total compensation of ₹{req.target_ctc_lpa} LPA.

I am eager to finalize this and step into the role. If {req.company_name} can meet this target of ₹{req.target_ctc_lpa} LPA (or structure the remaining ₹{diff} LPA as a signing bonus/milestone incentive), I am prepared to accept right away.

Thank you for your consideration, and I look forward to your thoughts!

Warm regards,
[Candidate Name]
"""

    return {
        "verbal_script": verbal_script,
        "email_template": email_template,
        "negotiation_delta_lpa": diff,
        "recommendation": f"Ask for ₹{req.target_ctc_lpa} LPA with focus on your immediate project readiness and system architecture value."
    }
