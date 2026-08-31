from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.config import settings
from app.database import engine, Base, SessionLocal
from app.models import *
from app.services.seed_service import seed_service
from app.services.security_middleware import SecurityHeadersMiddleware
from app.routers import (
    taxonomy,
    auth, profile, jobs, applications, companies, recruiters,
    resumes, projects, interviews, mock_interview, learning,
    market, analytics, followups, offers, notifications,
    career_agent, backup_export, audit, settings as settings_router,
    email_sync, discovery
)

# Create all database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Autonomous Agentic Career Operating System - AI-Powered Job Discovery, Synthesis & Application Platform"
)

# Security Middleware (Headers & Anti-Clickjacking)
app.add_middleware(SecurityHeadersMiddleware)

# Hardened CORS Configuration
allowed_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8000",
    "http://127.0.0.1:8000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition"]
)

# Mount Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(profile.router, prefix=settings.API_V1_STR)
app.include_router(jobs.router, prefix=settings.API_V1_STR)
app.include_router(applications.router, prefix=settings.API_V1_STR)
app.include_router(companies.router, prefix=settings.API_V1_STR)
app.include_router(recruiters.router, prefix=settings.API_V1_STR)
app.include_router(resumes.router, prefix=settings.API_V1_STR)
app.include_router(projects.router, prefix=settings.API_V1_STR)
app.include_router(interviews.router, prefix=settings.API_V1_STR)
app.include_router(mock_interview.router, prefix=settings.API_V1_STR)
app.include_router(learning.router, prefix=settings.API_V1_STR)
app.include_router(market.router, prefix=settings.API_V1_STR)
app.include_router(analytics.router, prefix=settings.API_V1_STR)
app.include_router(followups.router, prefix=settings.API_V1_STR)
app.include_router(offers.router, prefix=settings.API_V1_STR)
app.include_router(notifications.router, prefix=settings.API_V1_STR)
app.include_router(career_agent.router, prefix=settings.API_V1_STR)
app.include_router(backup_export.router, prefix=settings.API_V1_STR)
app.include_router(audit.router, prefix=settings.API_V1_STR)
app.include_router(settings_router.router, prefix=settings.API_V1_STR)
app.include_router(email_sync.router, prefix=settings.API_V1_STR)
app.include_router(discovery.router, prefix=settings.API_V1_STR)
app.include_router(taxonomy.router, prefix=settings.API_V1_STR)
app.include_router(taxonomy.career_intel_router, prefix=settings.API_V1_STR)

@app.on_event("startup")
def on_startup():
    from app.services.career_heartbeat_daemon import career_heartbeat_daemon
    career_heartbeat_daemon.start_background_scheduler()

@app.get("/")
def root():
    return {
        "message": "Welcome to Agentic Career OS API",
        "status": "operational",
        "docs": "/docs",
        "version": settings.VERSION
    }

@app.get("/health")
def health():
    return {"status": "healthy"}
