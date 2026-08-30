from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.job import Job
from typing import Dict, Any, List
import re

router = APIRouter(prefix="/market", tags=["Market Intelligence"])

@router.get("")
def get_market_intelligence(db: Session = Depends(get_db)):
    jobs = db.query(Job).all()
    total_jobs = len(jobs)
    
    if total_jobs == 0:
        return {
            "sample_size": 0,
            "skills_demand": [],
            "salary_distribution": [],
            "top_roles": [],
            "top_locations": []
        }
        
    # Aggregate actual skills from collected jobs
    skills_map = {
        "Python": 0, "LangGraph": 0, "LangChain": 0, "RAG": 0, "Agentic AI": 0,
        "Azure OpenAI": 0, "Azure AI Search": 0, "FastAPI": 0, "Vector Databases": 0,
        "Docker": 0, "Kubernetes": 0, "LLM Evaluation": 0, "SQL": 0, "System Design": 0
    }
    
    role_counts = {}
    loc_counts = {}
    sal_brackets = {"₹15L-₹20L": 0, "₹20L-₹25L": 0, "₹25L-₹30L": 0, "₹30L+": 0}
    
    for j in jobs:
        desc = f"{j.role} {j.required_skills or ''} {j.preferred_skills or ''} {j.description}".lower()
        for skill in skills_map.keys():
            if skill.lower() in desc:
                skills_map[skill] += 1
                
        # Role
        role_counts[j.role] = role_counts.get(j.role, 0) + 1
        
        # Location
        loc = "Bengaluru"
        if "remote" in j.location.lower():
            loc = "Remote India"
        elif "hyderabad" in j.location.lower():
            loc = "Hyderabad"
        elif "pune" in j.location.lower():
            loc = "Pune"
        elif "mumbai" in j.location.lower():
            loc = "Mumbai"
        loc_counts[loc] = loc_counts.get(loc, 0) + 1
        
        # Salary
        max_s = j.max_salary or 22.0
        if max_s >= 30.0:
            sal_brackets["₹30L+"] += 1
        elif max_s >= 25.0:
            sal_brackets["₹25L-₹30L"] += 1
        elif max_s >= 20.0:
            sal_brackets["₹20L-₹25L"] += 1
        else:
            sal_brackets["₹15L-₹20L"] += 1

    skills_demand = [
        {"skill": skill, "count": count, "percentage": round((count / total_jobs) * 100, 1)}
        for skill, count in sorted(skills_map.items(), key=lambda x: x[1], reverse=True)
    ]

    return {
        "sample_size": total_jobs,
        "sample_size_label": f"Based on {total_jobs} collected GenAI / Agentic AI jobs",
        "skills_demand": skills_demand,
        "salary_distribution": [{"bracket": k, "count": v} for k, v in sal_brackets.items()],
        "top_roles": [{"role": k, "count": v} for k, v in sorted(role_counts.items(), key=lambda x: x[1], reverse=True)[:6]],
        "top_locations": [{"location": k, "count": v} for k, v in sorted(loc_counts.items(), key=lambda x: x[1], reverse=True)]
    }
