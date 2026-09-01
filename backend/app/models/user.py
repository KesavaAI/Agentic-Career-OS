from typing import Optional
from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func
from app.database import Base

class User(Base):
    __tablename__ = "users"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), default="Chenna Kesava Reddy")
    phone: Mapped[Optional[str]] = mapped_column(String(50), nullable=True, default="+91 9876543210")
    target_role: Mapped[str] = mapped_column(String(255), default="GenAI / Agentic AI Engineer")
    target_min_ctc_lpa: Mapped[str] = mapped_column(String(50), default="18.0")
    current_ctc_lpa: Mapped[str] = mapped_column(String(50), default="3.5")
    experience_years: Mapped[str] = mapped_column(String(50), default="1.6")
    candidate_pool: Mapped[str] = mapped_column(String(100), default="SERVICE_SWITCHER")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    verification_code: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    is_superuser: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())
