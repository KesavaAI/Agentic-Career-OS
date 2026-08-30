from sqlalchemy import Column, Integer, String, Float, Text, DateTime, Boolean, ForeignKey
from sqlalchemy.sql import func
from app.database import Base

class Offer(Base):
    __tablename__ = "offers"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    application_id = Column(Integer, ForeignKey("applications.id", ondelete="SET NULL"), nullable=True)
    company_name = Column(String(255), nullable=False)
    role = Column(String(255), nullable=False)
    total_ctc_lpa = Column(Float, default=22.0)
    fixed_lpa = Column(Float, default=18.0)
    variable_lpa = Column(Float, default=4.0)
    bonus_lpa = Column(Float, default=1.5)
    esop_lpa = Column(Float, default=2.0)
    location = Column(String(255), default="Bengaluru (Hybrid)")
    joining_date = Column(DateTime(timezone=True), nullable=True)
    notice_period_days = Column(Integer, default=60)
    offer_date = Column(DateTime(timezone=True), nullable=True)
    status = Column(String(50), default="RECEIVED") # RECEIVED, NEGOTIATING, ACCEPTED, DECLINED, EXPIRED
    notes = Column(Text, nullable=True)
    is_demo = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())
