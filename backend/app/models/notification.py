from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey
from sqlalchemy.sql import func
from app.database import Base

class Notification(Base):
    __tablename__ = "notifications"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    type = Column(String(50), default="FOLLOW_UP") # FOLLOW_UP, INTERVIEW, DEADLINE, HIGH_PRIORITY_JOB, NEW_TIER_A, RESUME_TAILOR, LEARNING_RECALL
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    link = Column(String(500), nullable=True)
    urgency = Column(String(20), default="Medium") # Low, Medium, High, Urgent
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
