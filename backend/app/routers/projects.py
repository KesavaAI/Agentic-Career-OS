from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.project import Project
from app.schemas.project import ProjectOut, ProjectCreate, ProjectUpdate

router = APIRouter(prefix="/projects", tags=["Projects"])

@router.get("", response_model=List[ProjectOut])
def list_projects(category: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Project)
    if category:
        query = query.filter(Project.category == category.upper())
    return query.order_by(Project.is_featured.desc(), Project.created_at.desc()).all()

@router.get("/tcs-agentic-intelligence", response_model=ProjectOut)
def get_tcs_project(db: Session = Depends(get_db)):
    p = db.query(Project).filter(Project.title.ilike("%TCS Agentic Data Intelligence%")).first()
    if not p:
        raise HTTPException(status_code=404, detail="TCS Agentic project profile not found")
    return p

@router.get("/{proj_id}", response_model=ProjectOut)
def get_project(proj_id: int, db: Session = Depends(get_db)):
    p = db.query(Project).filter(Project.id == proj_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Project not found")
    return p

@router.post("", response_model=ProjectOut)
def create_project(req: ProjectCreate, db: Session = Depends(get_db)):
    p = Project(**req.dict())
    db.add(p)
    db.commit()
    db.refresh(p)
    return p

@router.put("/{proj_id}", response_model=ProjectOut)
def update_project(proj_id: int, req: ProjectUpdate, db: Session = Depends(get_db)):
    p = db.query(Project).filter(Project.id == proj_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Project not found")
    for key, val in req.dict(exclude_unset=True).items():
        setattr(p, key, val)
    db.commit()
    db.refresh(p)
    return p
