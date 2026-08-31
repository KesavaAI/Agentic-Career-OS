from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

from app.database import get_db
from app.models.user import User
from app.models.profile import Profile
from app.dependencies import (
    hash_password, verify_password, create_access_token,
    get_current_user, get_required_user
)

router = APIRouter(prefix="/auth", tags=["Auth"])

POPULAR_DOMAINS = ["gmail.com", "outlook.com", "hotmail.com", "yahoo.com", "icloud.com", "protonmail.com", "zoho.com"]

TYPO_DOMAINS = {
    # Gmail typos
    "gmil.com": "gmail.com",
    "gmai.com": "gmail.com",
    "gmaill.com": "gmail.com",
    "gamil.com": "gmail.com",
    "gmial.com": "gmail.com",
    "gmal.com": "gmail.com",
    "gmaik.com": "gmail.com",
    "gemail.com": "gmail.com",
    "gml.com": "gmail.com",
    "gmail.co": "gmail.com",
    "gmaill.co": "gmail.com",
    "gmali.com": "gmail.com",
    
    # Outlook typos
    "outlk.com": "outlook.com",
    "outlok.com": "outlook.com",
    "outloo.com": "outlook.com",
    "outllok.com": "outlook.com",
    "outloook.com": "outlook.com",
    "outlokk.com": "outlook.com",
    "otlook.com": "outlook.com",
    "outklook.com": "outlook.com",
    "outloock.com": "outlook.com",
    "outlock.com": "outlook.com",
    "outllok.co": "outlook.com",
    "outluk.com": "outlook.com",
    "ootlook.com": "outlook.com",
    
    # Yahoo typos
    "yaho.com": "yahoo.com",
    "yahooo.com": "yahoo.com",
    "yaho.co": "yahoo.com",
    "yhoo.com": "yahoo.com",
    "yaha.com": "yahoo.com",
    "yaho.in": "yahoo.com",
    "yahoo.co": "yahoo.com",
    
    # Hotmail typos
    "hotmial.com": "hotmail.com",
    "hotmaill.com": "hotmail.com",
    "hotmil.com": "hotmail.com",
    "hotmal.com": "hotmail.com",
    "hotmali.com": "hotmail.com",
    "hotmai.com": "hotmail.com",
    "homail.com": "hotmail.com",
    
    # iCloud typos
    "icoud.com": "icloud.com",
    "iclod.com": "icloud.com",
    "icluod.com": "icloud.com",
    "icloud.co": "icloud.com",
}

def get_typo_suggestion(domain: str) -> Optional[str]:
    d = domain.lower().strip()
    if d in TYPO_DOMAINS:
        return TYPO_DOMAINS[d]
    if d in POPULAR_DOMAINS:
        return None
    
    # Levenshtein distance for fuzzy matching
    def lev(s1: str, s2: str) -> int:
        if len(s1) < len(s2):
            return lev(s2, s1)
        if len(s2) == 0:
            return len(s1)
        prev = list(range(len(s2) + 1))
        for i, c1 in enumerate(s1):
            curr = [i + 1]
            for j, c2 in enumerate(s2):
                ins = prev[j + 1] + 1
                dels = curr[j] + 1
                subs = prev[j] + (c1 != c2)
                curr.append(min(ins, dels, subs))
            prev = curr
        return prev[-1]
    
    for pop in POPULAR_DOMAINS:
        dist = lev(d, pop)
        if 1 <= dist <= 2:
            return pop
    return None

def validate_email_domain(email_str: str) -> str:
    email_clean = email_str.strip().lower()
    if "@" not in email_clean:
        raise HTTPException(status_code=400, detail="Please enter a valid email address.")
    
    parts = email_clean.split("@")
    if len(parts) != 2 or not parts[0] or not parts[1]:
        raise HTTPException(status_code=400, detail="Invalid email address format.")
    
    local_part, domain = parts[0], parts[1]
    
    if len(local_part) < 2:
        raise HTTPException(status_code=400, detail="Email username is too short.")
    
    typo_suggestion = get_typo_suggestion(domain)
    if typo_suggestion:
        raise HTTPException(status_code=400, detail=f"Invalid email domain '@{domain}'. Did you mean '@{typo_suggestion}'?")
    
    if "." not in domain or len(domain.split(".")[-1]) < 2:
        raise HTTPException(status_code=400, detail=f"Invalid domain '@{domain}'. Please use a valid email domain (e.g. @gmail.com, @outlook.com).")
    
    return email_clean

import re

def validate_password_complexity(password: str) -> None:
    if not password or len(password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters long.")
    if not re.search(r"[a-z]", password):
        raise HTTPException(status_code=400, detail="Password must contain at least one lowercase letter (a-z).")
    if not re.search(r"[A-Z]", password):
        raise HTTPException(status_code=400, detail="Password must contain at least one uppercase letter (A-Z).")
    if not re.search(r"[0-9]", password):
        raise HTTPException(status_code=400, detail="Password must contain at least one number (0-9).")
    if not re.search(r"[!@#$%^&*(),.?\":{}|<>\-_+=\[\]\\/]", password):
        raise HTTPException(status_code=400, detail="Password must contain at least one special character (!@#$%^&*...).")

class UserRegisterReq(BaseModel):
    email: str
    password: str
    full_name: str
    phone: Optional[str] = None
    target_role: Optional[str] = "Software Engineer"
    target_min_ctc_lpa: Optional[float] = 15.0
    current_ctc_lpa: Optional[float] = 3.5
    experience_years: Optional[float] = 1.0
    candidate_pool: Optional[str] = "SERVICE_SWITCHER" # FRESHER, SERVICE_SWITCHER, EXPERIENCED, DOMAIN_SWITCHER
    notice_period_days: Optional[int] = 30

class UserLoginReq(BaseModel):
    email: str
    password: str

class VerifyEmailReq(BaseModel):
    email: EmailStr
    code: str

class ResendVerifyReq(BaseModel):
    email: EmailStr

class ForgotPasswordReq(BaseModel):
    email: EmailStr

class ResetPasswordReq(BaseModel):
    email: EmailStr
    code: str
    new_password: str

class ChangePasswordReq(BaseModel):
    current_password: str
    new_password: str

@router.post("/register")
def register(req: UserRegisterReq, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    clean_email = validate_email_domain(req.email)
    validate_password_complexity(req.password)
    existing = db.query(User).filter(User.email == clean_email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email is already registered. Please sign in.")
    
    # Generate 6-digit verification code
    verification_code = f"{random.randint(100000, 999999)}"

    user = User(
        email=clean_email,
        hashed_password=hash_password(req.password),
        full_name=req.full_name,
        phone=req.phone or "+91 9876543210",
        target_role=req.target_role or "Software Engineer",
        target_min_ctc_lpa=str(req.target_min_ctc_lpa or 15.0),
        current_ctc_lpa=str(req.current_ctc_lpa or 3.5),
        experience_years=str(req.experience_years or 1.0),
        candidate_pool=req.candidate_pool or "SERVICE_SWITCHER",
        is_verified=False,
        verification_code=verification_code
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Initialize tailored starter profile
    profile = seed_profile_for_user(db, user)
    token = create_access_token({"sub": user.email})

    # Dispatch verification email concurrently via BackgroundTasks (Instant response time!)
    background_tasks.add_task(
        email_service.send_verification_email,
        to_email=user.email,
        user_name=user.full_name,
        verification_code=verification_code,
        target_role=user.target_role,
        target_ctc=user.target_min_ctc_lpa
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "email_sent": True,
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "target_role": user.target_role,
            "target_min_ctc_lpa": user.target_min_ctc_lpa,
            "current_ctc_lpa": user.current_ctc_lpa,
            "experience_years": user.experience_years,
            "candidate_pool": user.candidate_pool,
            "is_verified": user.is_verified
        }
    }
def seed_profile_for_user(db: Session, user: User):
    profile = db.query(Profile).filter(Profile.user_id == user.id).first()
    if not profile:
        profile = Profile(
            user_id=user.id,
            full_name=user.full_name,
            email=user.email,
            phone=user.phone or "",
            target_role=user.target_role,
            target_min_ctc_lpa=float(user.target_min_ctc_lpa or 15.0),
            current_ctc_lpa=float(user.current_ctc_lpa or 0.0),
            experience_years=float(user.experience_years or 0.0),
            candidate_pool=user.candidate_pool,
            experiences=[],
            internships=[],
            education=[],
            skills={
                "languages": [],
                "frameworks": [],
                "cloud_db": [],
                "aiml": [],
                "tools": []
            },
            certifications=[],
            social_links={
                "linkedin": "",
                "github": "",
                "portfolio": "",
                "leetcode": "",
                "other": ""
            }
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile

import random
from app.services.email_service import email_service

@router.post("/verify-email")
def verify_email(req: VerifyEmailReq, db: Session = Depends(get_db)):
    clean_email = validate_email_domain(req.email)
    user = db.query(User).filter(User.email == clean_email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User account not found.")
    
    if user.is_verified:
        token = create_access_token({"sub": user.email})
        return {
            "success": True,
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "email": user.email,
                "full_name": user.full_name,
                "target_role": user.target_role,
                "target_min_ctc_lpa": user.target_min_ctc_lpa,
                "current_ctc_lpa": user.current_ctc_lpa,
                "experience_years": user.experience_years,
                "candidate_pool": user.candidate_pool,
                "is_verified": user.is_verified
            },
            "message": "Account is already verified!"
        }

    if not user.verification_code or user.verification_code != req.code.strip():
        raise HTTPException(status_code=400, detail="Invalid 6-digit verification code. Please check your inbox.")

    user.is_verified = True
    user.verification_code = None
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": user.email})
    return {
        "success": True,
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "target_role": user.target_role,
            "target_min_ctc_lpa": user.target_min_ctc_lpa,
            "current_ctc_lpa": user.current_ctc_lpa,
            "experience_years": user.experience_years,
            "candidate_pool": user.candidate_pool,
            "is_verified": user.is_verified
        },
        "message": "Email verified successfully! Welcome to your Agentic Career OS."
    }

@router.post("/resend-verification")
def resend_verification(req: ResendVerifyReq, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    clean_email = validate_email_domain(req.email)
    user = db.query(User).filter(User.email == clean_email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User account not found.")
    
    verification_code = f"{random.randint(100000, 999999)}"
    user.verification_code = verification_code
    db.commit()

    background_tasks.add_task(
        email_service.send_verification_email,
        to_email=user.email,
        user_name=user.full_name,
        verification_code=verification_code,
        target_role=user.target_role,
        target_ctc=user.target_min_ctc_lpa
    )

    return {
        "success": True,
        "email_sent": True,
        "message": f"New verification code dispatched to {user.email}!"
    }

@router.post("/login")
def login(req: UserLoginReq, db: Session = Depends(get_db)):
    clean_email = validate_email_domain(req.email)
    user = db.query(User).filter(User.email == clean_email).first()
    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    token = create_access_token({"sub": user.email})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "target_role": user.target_role,
            "target_min_ctc_lpa": user.target_min_ctc_lpa,
            "current_ctc_lpa": user.current_ctc_lpa,
            "experience_years": user.experience_years,
            "candidate_pool": user.candidate_pool,
            "is_verified": user.is_verified
        }
    }

class RequestOtpReq(BaseModel):
    email: EmailStr

class VerifyOtpLoginReq(BaseModel):
    email: EmailStr
    code: str

@router.post("/request-otp")
def request_otp(req: RequestOtpReq, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    clean_email = validate_email_domain(req.email)
    user = db.query(User).filter(User.email == clean_email).first()
    if not user:
        raise HTTPException(status_code=404, detail="No account found with this email. Please create an account first.")
    
    code = f"{random.randint(100000, 999999)}"
    user.verification_code = code
    db.commit()

    background_tasks.add_task(
        email_service.send_verification_email,
        to_email=user.email,
        user_name=user.full_name,
        verification_code=code,
        target_role=user.target_role,
        target_ctc=user.target_min_ctc_lpa
    )

    return {
        "success": True,
        "email_sent": True,
        "message": f"6-Digit OTP sent to {user.email}!"
    }

@router.post("/verify-otp-login")
def verify_otp_login(req: VerifyOtpLoginReq, db: Session = Depends(get_db)):
    clean_email = validate_email_domain(req.email)
    user = db.query(User).filter(User.email == clean_email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Account not found.")
    
    if not user.verification_code or user.verification_code != req.code.strip():
        raise HTTPException(status_code=400, detail="Invalid OTP code. Please check and try again.")
    
    user.is_verified = True
    user.verification_code = None
    db.commit()

    token = create_access_token({"sub": user.email})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "target_role": user.target_role,
            "target_min_ctc_lpa": user.target_min_ctc_lpa,
            "current_ctc_lpa": user.current_ctc_lpa,
            "experience_years": user.experience_years,
            "candidate_pool": user.candidate_pool,
            "is_verified": user.is_verified
        }
    }

@router.get("/me")
def get_me(current_user: User = Depends(get_required_user), db: Session = Depends(get_db)):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        profile = seed_profile_for_user(db, current_user)
    return {
        "user": {
            "id": current_user.id,
            "email": current_user.email,
            "full_name": current_user.full_name,
            "target_role": current_user.target_role,
            "target_min_ctc_lpa": current_user.target_min_ctc_lpa,
            "current_ctc_lpa": current_user.current_ctc_lpa,
            "experience_years": current_user.experience_years,
            "candidate_pool": current_user.candidate_pool,
            "is_verified": current_user.is_verified
        },
        "profile": profile
    }

@router.post("/forgot-password")
def forgot_password(req: ForgotPasswordReq, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    clean_email = validate_email_domain(req.email)
    user = db.query(User).filter(User.email == clean_email).first()
    if not user:
        return {
            "success": True,
            "message": f"If an account exists for {clean_email}, a 6-digit password reset code has been sent."
        }
    
    reset_code = f"{random.randint(100000, 999999)}"
    user.verification_code = reset_code
    db.commit()

    background_tasks.add_task(
        email_service.send_password_reset_email,
        to_email=user.email,
        user_name=user.full_name,
        reset_code=reset_code
    )

    return {
        "success": True,
        "email_sent": True,
        "message": f"A 6-digit password reset code has been dispatched to {user.email}."
    }

@router.post("/reset-password")
def reset_password(req: ResetPasswordReq, db: Session = Depends(get_db)):
    clean_email = validate_email_domain(req.email)
    validate_password_complexity(req.new_password)
    user = db.query(User).filter(User.email == clean_email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User account not found.")

    if not user.verification_code or user.verification_code != req.code.strip():
        raise HTTPException(status_code=400, detail="Invalid or expired password reset code.")

    user.hashed_password = hash_password(req.new_password)
    user.verification_code = None
    user.is_verified = True
    db.commit()

    token = create_access_token({"sub": user.email})
    return {
        "success": True,
        "access_token": token,
        "token_type": "bearer",
        "message": "Password has been reset successfully! You are now logged in.",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "target_role": user.target_role,
            "target_min_ctc_lpa": user.target_min_ctc_lpa,
            "current_ctc_lpa": user.current_ctc_lpa,
            "experience_years": user.experience_years,
            "candidate_pool": user.candidate_pool,
            "is_verified": user.is_verified
        }
    }

@router.post("/change-password")
def change_password(req: ChangePasswordReq, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not verify_password(req.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect current password. Please try again.")

    validate_password_complexity(req.new_password)

    current_user.hashed_password = hash_password(req.new_password)
    db.commit()

    return {
        "success": True,
        "message": "Your password has been updated successfully!"
    }

