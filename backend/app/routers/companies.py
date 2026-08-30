from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.company import Company
from app.schemas.company import CompanyOut, CompanyCreate, CompanyUpdate

router = APIRouter(prefix="/companies", tags=["Companies"])

@router.get("", response_model=List[CompanyOut])
def list_companies(db: Session = Depends(get_db)):
    return db.query(Company).order_by(Company.tier.asc(), Company.name.asc()).all()

@router.get("/{comp_id}", response_model=CompanyOut)
def get_company(comp_id: int, db: Session = Depends(get_db)):
    comp = db.query(Company).filter(Company.id == comp_id).first()
    if not comp:
        raise HTTPException(status_code=404, detail="Company not found")
    return comp

@router.post("", response_model=CompanyOut)
def create_company(req: CompanyCreate, db: Session = Depends(get_db)):
    comp = Company(**req.dict())
    db.add(comp)
    db.commit()
    db.refresh(comp)
    return comp

@router.put("/{comp_id}", response_model=CompanyOut)
def update_company(comp_id: int, req: CompanyUpdate, db: Session = Depends(get_db)):
    comp = db.query(Company).filter(Company.id == comp_id).first()
    if not comp:
        raise HTTPException(status_code=404, detail="Company not found")
    for key, val in req.dict(exclude_unset=True).items():
        setattr(comp, key, val)
    db.commit()
    db.refresh(comp)
    return comp
