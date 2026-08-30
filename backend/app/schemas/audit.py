from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class AuditLogOut(BaseModel):
    id: int
    user_email: str
    action: str
    object_type: str
    object_id: Optional[int] = None
    previous_value: Optional[str] = None
    new_value: Optional[str] = None
    created_at: Optional[datetime] = None
    class Config:
        from_attributes = True
