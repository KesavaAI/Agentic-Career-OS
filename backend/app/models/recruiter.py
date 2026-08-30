from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey
from sqlalchemy.sql import func
from app.database import Base

class Recruiter(Base):
    __tablename__ = "recruiters"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="SET NULL"), nullable=True)
    company_name = Column(String(255), nullable=False)
    name = Column(String(255), nullable=False)
    role = Column(String(255), default="Talent Acquisition / Tech Recruiter")
    email = Column(String(255), nullable=True)
    linkedin = Column(String(500), nullable=True)
    contact_date = Column(DateTime(timezone=True), nullable=True)
    response = Column(Text, nullable=True)
    follow_up_date = Column(DateTime(timezone=True), nullable=True)
    status = Column(String(50), default="NOT CONTACTED") # NOT CONTACTED, CONTACTED, RESPONDED, INTERESTED, INTERVIEW, NO RESPONSE, CLOSED
    notes = Column(Text, nullable=True)
    is_demo = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())
