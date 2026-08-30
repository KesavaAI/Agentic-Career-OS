import re
import json
from typing import Dict, Any
from app.services.ai_service import ai_service

class JDExtractor:
    @staticmethod
    def extract_from_text(raw_text: str) -> Dict[str, Any]:
        skills_pool = [
            "Python", "LLMs", "Generative AI", "RAG", "Agentic AI", "LangGraph", "LangChain",
            "FastAPI", "Azure", "Azure OpenAI", "Azure AI Search", "Vector databases", "Graph databases",
            "Prompt engineering", "LLM evaluation", "AI system design", "SQL", "Git", "Docker",
            "TensorFlow", "PyTorch", "Kubernetes", "ChromaDB", "Pinecone", "Qdrant", "Redis", "Celery"
        ]
        
        found_skills = []
        for skill in skills_pool:
            pattern = rf"\b{re.escape(skill)}\b"
            if re.search(pattern, raw_text, re.IGNORECASE):
                found_skills.append(skill)
        
        salary_match = re.search(r"(\d+(?:\.\d+)?)\s*(?:-|to)\s*(\d+(?:\.\d+)?)\s*(?:lpa|lakhs|lac|l)", raw_text, re.IGNORECASE)
        min_salary = 18.0
        max_salary = 28.0
        if salary_match:
            try:
                min_salary = float(salary_match.group(1))
                max_salary = float(salary_match.group(2))
            except:
                pass
        
        exp_match = re.search(r"(\d+(?:\.\d+)?)\s*(?:-|to|\+)?\s*(\d+)?\s*(?:years|yrs|year|yr)", raw_text, re.IGNORECASE)
        exp_min = 1.0
        exp_max = 4.0
        if exp_match:
            try:
                exp_min = float(exp_match.group(1))
                exp_max = float(exp_match.group(2)) if exp_match.group(2) else exp_min + 3.0
            except:
                pass
        
        locations = ["Bengaluru", "Hyderabad", "Chennai", "Pune", "Mumbai", "Gurugram", "Noida", "Remote"]
        detected_loc = "Bengaluru"
        for loc in locations:
            if re.search(rf"\b{loc}\b", raw_text, re.IGNORECASE):
                detected_loc = loc
                break
                
        work_mode = "Hybrid"
        if re.search(r"\bremote\b", raw_text, re.IGNORECASE):
            work_mode = "Remote"
        elif re.search(r"\bonsite\b|\bon-site\b|\boffice\b", raw_text, re.IGNORECASE):
            work_mode = "Onsite"

        role = "GenAI / Agentic AI Engineer"
        for r in ["Agentic AI Engineer", "GenAI Engineer", "LLM Engineer", "RAG Engineer", "AI Backend Engineer", "AI Engineer", "Applied AI Engineer"]:
            if re.search(rf"\b{re.escape(r)}\b", raw_text, re.IGNORECASE):
                role = r
                break
                
        company = "TechCorp"
        comp_match = re.search(r"(?:company|organization|client|employer)\s*:\s*([^\n\r]+)", raw_text, re.IGNORECASE)
        if comp_match:
            company = comp_match.group(1).strip()
        else:
            lines = [line.strip() for line in raw_text.split("\n") if line.strip()]
            if lines:
                first_line = lines[0]
                if len(first_line) < 40 and not any(k in first_line.lower() for k in ["hiring", "looking", "job", "description"]):
                    company = first_line

        return {
            "company_name": company,
            "role": role,
            "min_salary": min_salary,
            "max_salary": max_salary,
            "experience_min": exp_min,
            "experience_max": exp_max,
            "work_mode": work_mode,
            "location": detected_loc,
            "required_skills": ", ".join(found_skills[:7]) if found_skills else "Python, LangGraph, RAG, Azure OpenAI, FastAPI",
            "preferred_skills": ", ".join(found_skills[7:]) if len(found_skills) > 7 else "Docker, Kubernetes, LLM Evaluation, SQL",
            "responsibilities": "Design, implement, and deploy production agentic workflows and retrieval-augmented systems.",
            "description": raw_text[:2000]
        }

jd_extractor = JDExtractor()
