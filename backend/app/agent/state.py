from typing import Dict, Any, List, Optional
from pydantic import BaseModel

class CareerAgentState(BaseModel):
    step: str = "START"
    job_raw_text: Optional[str] = None
    job_url: Optional[str] = None
    extracted_job: Optional[Dict[str, Any]] = None
    match_result: Optional[Dict[str, Any]] = None
    tier: Optional[str] = None
    priority_score: Optional[int] = None
    tailored_resume_preview: Optional[str] = None
    interview_pack_preview: Optional[List[Dict[str, Any]]] = None
    human_approval_required: bool = False
    human_approved: bool = False
    status_message: str = "Workflow initialized."
