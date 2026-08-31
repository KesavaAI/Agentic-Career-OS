from sqlalchemy import Column, Integer, String, Float, Text, Boolean, JSON, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base

class Profile(Base):
    __tablename__ = "profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=True, index=True)
    full_name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False)
    phone = Column(String(50), default="")
    location = Column(String(100), default="")
    
    # Career Role Intelligence & Context
    primary_career = Column(String(255), default="Software Engineer", index=True)
    career_stream = Column(String(255), default="Full Stack Engineering")
    role_family = Column(String(255), default="Software Engineering")
    target_role = Column(String(255), default="Software Engineer")
    target_roles = Column(JSON, default=list) # List of target titles
    specializations = Column(JSON, default=list) # List of specializations (RAG, LLM, Agents, etc.)
    experience_level = Column(String(50), default="Experienced (1-3 yrs)")
    remote_preference = Column(String(50), default="Hybrid") # Remote, Hybrid, Onsite
    salary_preference = Column(JSON, default=dict) # {min_ctc_lpa, target_ctc_lpa}

    target_min_ctc_lpa = Column(Float, default=15.0)
    current_ctc_lpa = Column(Float, default=0.0)
    experience_years = Column(Float, default=0.0)
    notice_period_days = Column(Integer, default=30)
    candidate_pool = Column(String(100), default="SERVICE_SWITCHER") # FRESHER, SERVICE_SWITCHER, EXPERIENCED, DOMAIN_SWITCHER
    bio = Column(Text, default="")
    
    # Rich Candidate Sections (JSON structured lists)
    experiences = Column(JSON, default=list) # [{company, role, start_date, end_date, is_current, location, bullets, tech_stack}]
    internships = Column(JSON, default=list) # [{company, role, duration, deliverables, mentor_notes}]
    education = Column(JSON, default=list) # [{degree, institution, major, graduation_year, cgpa_percentage}]
    skills = Column(JSON, default=dict) # {languages: [], frameworks: [], cloud_db: [], aiml: [], tools: []}
    certifications = Column(JSON, default=list) # [{title, issuer, issue_date, credential_id, credential_url}]
    social_links = Column(JSON, default=dict) # {linkedin: "", github: "", portfolio: "", leetcode: ""}
    preferences = Column(JSON, default=dict) # {preferred_locations: ["Bangalore", "Hyderabad", "Remote"], work_modes: ["Hybrid", "Remote"]}

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())
