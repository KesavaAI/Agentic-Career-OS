from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Dict, Any, Optional
from app.database import get_db
from app.models.setting import SystemSetting
from app.services.seed_service import seed_service

router = APIRouter(prefix="/settings", tags=["Settings"])

class SettingUpdateRequest(BaseModel):
    openai_api_key: Optional[str] = None
    openai_model: Optional[str] = None
    azure_openai_api_key: Optional[str] = None
    azure_openai_endpoint: Optional[str] = None
    target_ctc_lpa: Optional[float] = 18.0

@router.get("")
def get_settings(db: Session = Depends(get_db)):
    return {
        "PROJECT_NAME": "Kesava Career Command Center",
        "TARGET_CTC": "₹18+ LPA",
        "EXPERIENCE": "~1.6 years (TCS Production GenAI Experience)",
        "PRIMARY_ROLES": "GenAI Engineer, Agentic AI Engineer, AI Engineer",
        "DATABASE_ENGINE": "PostgreSQL / SQLite Production Compatible",
        "AI_STATUS": "Live multi-provider with intelligent fallback"
    }

@router.post("/seed-data")
def trigger_seed_data(db: Session = Depends(get_db)):
    seed_service.seed_data(db)
    return {"message": "Demo data populated successfully with 20 companies, 50 jobs, 15 applications, 5 interviews, 10 learning topics, and full TCS Agentic project profile."}

@router.post("/clear-demo-data")
def trigger_clear_demo_data(db: Session = Depends(get_db)):
    seed_service.clear_demo_data(db)
    return {"message": "Demo data cleared successfully."}
