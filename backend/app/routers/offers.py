from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel

from app.database import get_db
from app.models.offer import Offer
from app.models.user import User
from app.dependencies import get_current_user
from app.schemas.offer import OfferCreate, OfferUpdate, OfferOut
from app.services.offer_negotiator_agent import offer_negotiator_agent

router = APIRouter(prefix="/offers", tags=["Offers"])

class NegotiationPlaybookRequest(BaseModel):
    company_name: str
    role_title: str
    offered_base_lpa: float
    offered_variable_lpa: Optional[float] = 0.0
    offered_esops_lpa: Optional[float] = 0.0
    offered_joining_bonus_lpa: Optional[float] = 0.0
    competing_offers_count: Optional[int] = 1
    competing_highest_ctc_lpa: Optional[float] = None

@router.get("", response_model=List[OfferOut])
def list_offers(db: Session = Depends(get_db)):
    return db.query(Offer).all()

@router.post("/negotiate")
def generate_counter_offer_playbook(
    req: NegotiationPlaybookRequest,
    current_user: Optional[User] = Depends(get_current_user)
):
    """Synthesizes 3-Tier Counter-Offer Negotiation Playbook (Conservative, Balanced, Aggressive)."""
    cand_name = current_user.full_name if current_user else "Candidate"
    result = offer_negotiator_agent.generate_negotiation_playbook(
        company_name=req.company_name,
        role_title=req.role_title,
        offered_base_lpa=req.offered_base_lpa,
        offered_variable_lpa=req.offered_variable_lpa or 0.0,
        offered_esops_lpa=req.offered_esops_lpa or 0.0,
        offered_joining_bonus_lpa=req.offered_joining_bonus_lpa or 0.0,
        competing_offers_count=req.competing_offers_count or 1,
        competing_highest_ctc_lpa=req.competing_highest_ctc_lpa,
        candidate_name=cand_name
    )
    return result

@router.post("", response_model=OfferOut)
def create_offer(offer_in: OfferCreate, db: Session = Depends(get_db)):
    db_offer = Offer(**offer_in.dict())
    db.add(db_offer)
    db.commit()
    db.refresh(db_offer)
    return db_offer
