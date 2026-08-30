from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class NotificationOut(BaseModel):
    id: int
    type: str
    title: str
    message: str
    link: Optional[str] = None
    urgency: str
    is_read: bool
    created_at: Optional[datetime] = None
    class Config:
        from_attributes = True
