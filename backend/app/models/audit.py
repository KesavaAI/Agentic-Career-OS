from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.database import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    user_email = Column(String(255), nullable=False)
    action = Column(String(100), nullable=False) # CREATE, UPDATE, DELETE, STATUS_CHANGE, AI_RECOMMENDATION, RESUME_TAILOR
    object_type = Column(String(100), nullable=False) # Job, Application, Interview, Resume, Offer, etc.
    object_id = Column(Integer, nullable=True)
    previous_value = Column(Text, nullable=True)
    new_value = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
