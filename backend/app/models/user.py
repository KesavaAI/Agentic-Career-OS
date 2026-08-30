from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func
from app.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), default="Chenna Kesava Reddy")
    phone = Column(String(50), nullable=True, default="+91 9876543210")
    target_role = Column(String(255), default="GenAI / Agentic AI Engineer")
    target_min_ctc_lpa = Column(String(50), default="18.0")
    current_ctc_lpa = Column(String(50), default="3.5")
    experience_years = Column(String(50), default="1.6")
    candidate_pool = Column(String(100), default="SERVICE_SWITCHER")
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    verification_code = Column(String(50), nullable=True)
    is_superuser = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())
