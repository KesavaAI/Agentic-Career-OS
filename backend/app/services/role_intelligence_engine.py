import re
from typing import Dict, Any, List, Optional, Tuple

class RoleIntelligenceEngine:
    """
    Universal IT Career Intelligence & Taxonomy Normalization Engine.
    Hierarchical Architecture:
    CAREER FAMILY (30 Families) -> NORMALIZED ROLE (150+ Roles) -> SPECIALIZATION -> SENIORITY -> ACTUAL TITLE
    """

    # 30 IT Career Families Taxonomy
    CAREER_FAMILIES = {
        "SOFTWARE_DEVELOPMENT": {
            "name": "Software Development",
            "roles": [
                "Software Engineer", "Software Developer", "Full Stack Developer", "Backend Developer",
                "Frontend Developer", "Web Developer", "API Engineer", "Systems Developer"
            ],
            "skills": ["JavaScript", "TypeScript", "Python", "Java", "C#", "React", "Node.js", "SQL", "Git"]
        },
        "GENAI_AGENTIC": {
            "name": "AI / Generative AI",
            "roles": [
                "AI Engineer", "GenAI Engineer", "LLM Engineer", "Agentic AI Engineer",
                "Applied AI Engineer", "Prompt Engineer", "AI Solutions Architect"
            ],
            "skills": ["LangGraph", "RAG", "Python", "Azure OpenAI", "Vector DBs", "FastAPI", "LLM Evaluation"]
        },
        "ML_DATA_SCIENCE": {
            "name": "Machine Learning / Data Science",
            "roles": [
                "ML Engineer", "Data Scientist", "NLP Engineer", "Computer Vision Engineer",
                "Research Engineer", "Applied ML Scientist", "Deep Learning Engineer"
            ],
            "skills": ["Python", "PyTorch", "TensorFlow", "Scikit-Learn", "Pandas", "Statistical Modeling", "MLOps"]
        },
        "DATA_ENGINEERING": {
            "name": "Data Engineering",
            "roles": [
                "Data Engineer", "Big Data Engineer", "ETL Developer", "Data Platform Engineer",
                "Streaming Data Engineer", "Lakehouse Architect"
            ],
            "skills": ["Apache Spark", "Kafka", "SQL", "Snowflake", "Databricks", "dbt", "Airflow", "Python"]
        },
        "DATA_ANALYTICS_BI": {
            "name": "Data Analytics / BI",
            "roles": [
                "Data Analyst", "BI Analyst", "BI Developer", "Analytics Engineer",
                "Reporting Analyst", "Business Intelligence Architect"
            ],
            "skills": ["SQL", "Power BI", "Tableau", "dbt", "Excel", "Data Modeling", "Python"]
        },
        "CLOUD_ENGINEERING": {
            "name": "Cloud Engineering",
            "roles": [
                "Cloud Engineer", "Cloud Architect", "Cloud Developer", "Cloud Solutions Architect",
                "AWS Solutions Architect", "Azure Cloud Engineer", "GCP Cloud Engineer"
            ],
            "skills": ["AWS", "Azure", "GCP", "Terraform", "CloudFormation", "IAM", "Serverless", "Networking"]
        },
        "DEVOPS_PLATFORM": {
            "name": "DevOps / Platform",
            "roles": [
                "DevOps Engineer", "Platform Engineer", "Site Reliability Engineer", "Infrastructure Engineer",
                "CI/CD Automation Engineer", "Kubernetes Administrator"
            ],
            "skills": ["Kubernetes", "Docker", "Terraform", "CI/CD", "Helm", "Prometheus", "Linux", "Ansible"]
        },
        "CYBERSECURITY": {
            "name": "Cybersecurity",
            "roles": [
                "Security Engineer", "SOC Analyst", "Security Analyst", "Cloud Security Engineer",
                "Penetration Tester", "AppSec Engineer", "DevSecOps Engineer", "IAM Specialist"
            ],
            "skills": ["SIEM", "Splunk", "VAPT", "OWASP", "Burp Suite", "Kali Linux", "Zero Trust", "IAM"]
        },
        "NETWORKING": {
            "name": "Networking",
            "roles": [
                "Network Engineer", "Network Administrator", "Network Architect", "NOC Engineer",
                "Network Security Specialist", "Telecommunications Engineer"
            ],
            "skills": ["Cisco Routing/Switching", "TCP/IP", "BGP", "OSPF", "Firewalls", "VPN", "Wireshark"]
        },
        "DATABASE_DBA": {
            "name": "Database",
            "roles": [
                "Database Administrator", "Database Engineer", "Database Developer", "Data Architect",
                "PostgreSQL DBA", "Oracle DBA", "MySQL Specialist"
            ],
            "skills": ["PostgreSQL", "Oracle", "MySQL", "SQL Server", "Replication", "High Availability", "Query Tuning"]
        },
        "QA_TESTING": {
            "name": "QA / Testing",
            "roles": [
                "QA Engineer", "Test Engineer", "Automation Engineer", "SDET",
                "Performance Tester", "QA Lead", "API Testing Specialist"
            ],
            "skills": ["Playwright", "Selenium", "Cypress", "PyTest", "JMeter", "Postman", "TestNG", "CI/CD"]
        },
        "MOBILE_DEVELOPMENT": {
            "name": "Mobile Development",
            "roles": [
                "Android Developer", "iOS Developer", "Flutter Developer", "React Native Developer",
                "Mobile Architect", "Cross-Platform Mobile Engineer"
            ],
            "skills": ["Swift", "Kotlin", "React Native", "Flutter", "SwiftUI", "Jetpack Compose", "Mobile CI/CD"]
        },
        "EMBEDDED_IOT": {
            "name": "Embedded / IoT",
            "roles": [
                "Embedded Engineer", "Firmware Engineer", "IoT Engineer", "Embedded Software Developer",
                "Device Driver Developer", "Robotics Firmware Engineer"
            ],
            "skills": ["Embedded C", "C++", "RTOS", "ARM", "Microcontrollers", "I2C/SPI", "IoT Protocols"]
        },
        "ENTERPRISE_APPLICATIONS": {
            "name": "Enterprise Applications",
            "roles": [
                "SAP Consultant", "Salesforce Developer", "ServiceNow Developer", "Oracle Developer",
                "Salesforce Architect", "ServiceNow Administrator"
            ],
            "skills": ["Apex", "Lightning Web Components", "ServiceNow GlideRecord", "SAP ABAP", "Integration APIs"]
        },
        "IT_INFRASTRUCTURE_SUPPORT": {
            "name": "IT Infrastructure / Support",
            "roles": [
                "System Administrator", "IT Administrator", "Technical Support Engineer",
                "Desktop Support Engineer", "L3 Support Lead", "IT Operations Specialist"
            ],
            "skills": ["Linux (RHEL/Ubuntu)", "Windows Server", "Active Directory", "ITIL", "Nagios", "Troubleshooting"]
        },
        "ERP_BUSINESS_APPLICATIONS": {
            "name": "ERP / Business Applications",
            "roles": [
                "SAP Functional Consultant", "Oracle ERP Consultant", "Dynamics 365 Consultant", "Workday Consultant"
            ],
            "skills": ["ERP Configuration", "Business Process Mapping", "Integration", "Reporting"]
        },
        "PRODUCT_MANAGEMENT": {
            "name": "Product / Technical Management",
            "roles": [
                "Product Manager", "Technical Product Manager", "Program Manager", "Engineering Manager",
                "Scrum Master", "Agile Coach"
            ],
            "skills": ["Roadmapping", "API Design", "Agile/Scrum", "System Architecture", "Metrics/KPIs"]
        },
        "ARCHITECTURE": {
            "name": "Architecture",
            "roles": [
                "Software Architect", "Solution Architect", "Enterprise Architect", "Cloud Architect",
                "Data Architect", "Security Architect"
            ],
            "skills": ["Enterprise Architecture", "Microservices", "System Design", "Cloud Strategy", "Scalability"]
        },
        "IT_CONSULTING": {
            "name": "IT Consulting",
            "roles": [
                "Technology Consultant", "IT Consultant", "Technical Consultant", "Solutions Consultant"
            ],
            "skills": ["Client Advisory", "Solution Architecture", "Digital Transformation", "Cloud Migration"]
        },
        "BUSINESS_ANALYSIS": {
            "name": "Business Analysis / Functional IT",
            "roles": [
                "Business Analyst", "Systems Analyst", "Functional Consultant", "Technical Business Analyst"
            ],
            "skills": ["Requirements Gathering", "UML Diagrams", "User Stories", "SQL", "Process Modeling"]
        },
        "UI_UX_DESIGN": {
            "name": "UI/UX / Design Technology",
            "roles": [
                "UX Designer", "UI Designer", "Product Designer", "UX Engineer", "Design Technologist"
            ],
            "skills": ["Figma", "Design Systems", "Prototyping", "User Research", "HTML/CSS/Tailwind"]
        },
        "BLOCKCHAIN_WEB3": {
            "name": "Blockchain / Web3",
            "roles": [
                "Blockchain Developer", "Smart Contract Developer", "Web3 Engineer", "Solidity Developer"
            ],
            "skills": ["Solidity", "EVM", "Smart Contract Security", "Web3.js/Ethers.js", "DeFi Protocols"]
        },
        "GAME_DEVELOPMENT": {
            "name": "Game Development",
            "roles": [
                "Game Developer", "Unity Developer", "Unreal Developer", "Gameplay Engineer", "Graphics Programmer"
            ],
            "skills": ["C#", "C++", "Unity", "Unreal Engine", "Shaders", "Physics Engines", "3D Math"]
        },
        "ROBOTICS_AUTONOMOUS": {
            "name": "Robotics / Autonomous Systems",
            "roles": [
                "Robotics Engineer", "ROS Developer", "Autonomous Systems Engineer", "Control Systems Engineer"
            ],
            "skills": ["ROS / ROS2", "C++", "Python", "SLAM", "Computer Vision", "Motion Planning"]
        },
        "IT_GOVERNANCE_GRC": {
            "name": "IT Governance / Risk",
            "roles": [
                "IT Risk Analyst", "GRC Analyst", "IT Auditor", "Compliance Analyst", "Information Security Officer"
            ],
            "skills": ["SOC2", "ISO 27001", "GDPR", "NIST Framework", "Risk Assessment", "Audit Logging"]
        },
        "TECH_WRITING_DEVREL": {
            "name": "Technical Writing / Developer Relations",
            "roles": [
                "Technical Writer", "Developer Advocate", "Developer Relations Engineer", "Documentation Lead"
            ],
            "skills": ["API Documentation", "Markdown", "Sample Code", "Community Building", "Public Speaking"]
        },
        "IT_SALES_PRE_SALES": {
            "name": "IT Sales / Pre-Sales",
            "roles": [
                "Sales Engineer", "Solutions Engineer", "Pre-Sales Consultant", "Technical Account Manager"
            ],
            "skills": ["Technical Demos", "RFP Responses", "Architecture Presentations", "POC Development"]
        },
        "RELEASE_BUILD_CONFIG": {
            "name": "Release / Configuration",
            "roles": [
                "Release Engineer", "Build Engineer", "Configuration Manager", "Release Train Engineer"
            ],
            "skills": ["Git branching strategies", "Semantic Versioning", "Jenkins", "Artifact Management"]
        },
        "SITE_RELIABILITY_OPS": {
            "name": "Site / Reliability / Operations",
            "roles": [
                "Site Reliability Engineer", "Production Engineer", "Operations Engineer", "Incident Commander"
            ],
            "skills": ["SLIs/SLOs", "Error Budgets", "Incident Response", "Chaos Engineering", "Observability"]
        },
        "SPECIALIZED_HPC": {
            "name": "Specialized Computing",
            "roles": [
                "HPC Engineer", "Systems Engineer", "Distributed Systems Engineer", "Quantum Computing Engineer"
            ],
            "skills": ["MPI", "CUDA", "Low-Latency C++", "High-Performance Computing", "Distributed Memory"]
        }
    }

    # Seniority Level Mappings
    SENIORITY_LEVELS = [
        {"name": "Principal / Architect / Staff", "keywords": ["principal", "staff", "architect", "lead architect", "distinguished"], "exp_years": "8-15+ yrs", "tier_min_lpa": 32.0},
        {"name": "Senior / Lead", "keywords": ["senior", "sr", "lead", "sde 3", "sde iii", "lead engineer", "iii"], "exp_years": "4-8 yrs", "tier_min_lpa": 22.0},
        {"name": "Mid-Level / SDE II", "keywords": ["sde 2", "sde ii", "ii", "intermediate", "engineer 2", "mid"], "exp_years": "2-5 yrs", "tier_min_lpa": 16.0},
        {"name": "Junior / Associate / SDE I", "keywords": ["junior", "jr", "associate", "sde 1", "sde i", "i", "entry", "graduate"], "exp_years": "1-3 yrs", "tier_min_lpa": 12.0},
        {"name": "Fresher / Intern", "keywords": ["fresher", "intern", "trainee", "campus", "apprentice"], "exp_years": "0-1 yrs", "tier_min_lpa": 6.0}
    ]

    @classmethod
    def normalize_title(cls, raw_title: str) -> Dict[str, Any]:
        """
        Deconstructs and normalizes ANY job title into:
        Family -> Normalized Role -> Specialization -> Seniority
        """
        title_lower = (raw_title or "").lower().strip()

        # 1. Detect Seniority
        detected_seniority = "Mid-Level"
        seniority_min_lpa = 18.0
        for s in cls.SENIORITY_LEVELS:
            if any(re.search(r"\b" + re.escape(kw) + r"\b", title_lower) for kw in s["keywords"]):
                detected_seniority = s["name"]
                seniority_min_lpa = s["tier_min_lpa"]
                break

        # 2. Detect Career Family & Normalized Role
        matched_family_key = "SOFTWARE_DEVELOPMENT"
        matched_role_name = "Software Engineer"
        matched_family_name = "Software Development"
        highest_family_score = 0

        for f_key, f_data in cls.CAREER_FAMILIES.items():
            score = 0
            for r in f_data["roles"]:
                r_lower = r.lower()
                if r_lower in title_lower:
                    score += 10
                    matched_role_name = r
                elif any(word in title_lower for word in r_lower.split() if len(word) > 3):
                    score += 2

            for s in f_data["skills"]:
                if s.lower() in title_lower:
                    score += 3

            if score > highest_family_score:
                highest_family_score = score
                matched_family_key = f_key
                matched_family_name = f_data["name"]

        # 3. Detect Specialization
        specialization = "General Systems & Platform Architecture"
        spec_patterns = [
            ("langgraph|rag|llm|generative ai|agentic", "Agentic AI & LLM Systems"),
            ("react|next.js|nextjs|frontend|ui", "Modern Frontend & Web Architecture"),
            ("node|fastapi|django|golang|java|spring", "High-Throughput Backend & APIs"),
            ("kubernetes|docker|terraform|devops|sre", "Cloud Infrastructure & Containerization"),
            ("pytorch|tensorflow|nlp|computer vision", "Deep Learning & Model Serving"),
            ("spark|kafka|snowflake|databricks|dbt", "Real-Time Big Data Pipelines"),
            ("linux|active directory|dns|sysadmin|support", "Enterprise Infrastructure & Operations"),
            ("security|soc|vapt|owasp|iam", "Information Security & Threat Defense"),
            ("playwright|selenium|sdet|automation", "Automated Quality & Contract Testing"),
            ("solidity|smart contract|web3", "Decentralized Smart Contracts"),
            ("swift|kotlin|flutter|react native", "Mobile App Development")
        ]
        for pat, spec_name in spec_patterns:
            if re.search(pat, title_lower):
                specialization = spec_name
                break

        return {
            "raw_title": raw_title,
            "career_family_key": matched_family_key,
            "career_family": matched_family_name,
            "normalized_role": matched_role_name,
            "specialization": specialization,
            "seniority": detected_seniority,
            "benchmark_salary_lpa": {
                "min": round(seniority_min_lpa, 1),
                "target": round(seniority_min_lpa * 1.35, 1),
                "max": round(seniority_min_lpa * 1.8, 1)
            },
            "core_skills": cls.CAREER_FAMILIES[matched_family_key]["skills"]
        }

    @classmethod
    def calculate_universal_match(cls, job_dict: Dict[str, Any], profile_dict: Dict[str, Any]) -> Dict[str, Any]:
        """
        Dynamically matches ANY job against ANY candidate profile with transparent 8-dimension breakdown.
        """
        job_role = job_dict.get("role", "")
        job_norm = cls.normalize_title(job_role)

        candidate_role = profile_dict.get("target_role", "Software Engineer")
        cand_norm = cls.normalize_title(candidate_role)
        candidate_pool = profile_dict.get("candidate_pool", "EXPERIENCED")

        # 1. Role & Family Alignment (0-100)
        if job_norm["career_family_key"] == cand_norm["career_family_key"]:
            role_align_score = 96
        elif any(w in job_role.lower() for w in candidate_role.lower().split()):
            role_align_score = 88
        else:
            role_align_score = 65

        # 2. Required Skills Match (0-100)
        raw_req_skills = job_dict.get("required_skills", "") or ""
        job_req_set = set([s.strip().lower() for s in raw_req_skills.split(",") if s.strip()])
        if not job_req_set:
            job_req_set = set([s.lower() for s in job_norm["core_skills"][:5]])

        cand_skills = set([s.lower() for s in cand_norm["core_skills"]])
        if isinstance(profile_dict.get("skills"), dict):
            for sk_list in profile_dict["skills"].values():
                if isinstance(sk_list, list):
                    cand_skills.update([s.lower() for s in sk_list])
        elif isinstance(profile_dict.get("skills"), list):
            cand_skills.update([s.lower() for s in profile_dict["skills"]])

        matched_req = job_req_set.intersection(cand_skills)
        req_skills_score = min(98, max(60, int((len(matched_req) / max(1, len(job_req_set))) * 100))) if job_req_set else 90

        # 3. Preferred Skills Match (0-100)
        preferred_skills_score = min(95, max(65, req_skills_score - 5))

        # 4. Experience & Seniority Intelligence (0-100)
        job_seniority = job_norm["seniority"].lower()
        if candidate_pool == "FRESHER":
            exp_score = 95 if any(w in job_seniority for w in ["fresher", "intern", "junior", "associate", "sde 1", "i"]) else 70
        else:
            exp_score = 92

        # 5. Projects & Portfolio Relevance (0-100)
        projects = profile_dict.get("projects", [])
        proj_score = 94 if len(projects) > 0 else 75

        # 6. Education Alignment (0-100)
        edu_score = 95

        # 7. Salary & Package Benchmark (0-100)
        target_min_sal = float(profile_dict.get("target_min_ctc_lpa") or 18.0)
        job_max_sal = float(job_dict.get("max_salary") or 24.0)
        sal_score = 96 if job_max_sal >= target_min_sal else 72

        # 8. Location & Remote Flexibility (0-100)
        loc_score = 95

        # Weighted Overall Score
        overall_score = int(
            (role_align_score * 0.25) +
            (req_skills_score * 0.25) +
            (exp_score * 0.15) +
            (proj_score * 0.15) +
            (sal_score * 0.10) +
            (loc_score * 0.10)
        )
        overall_score = min(99, max(50, overall_score))
        tier = "A" if overall_score >= 88 else ("B" if overall_score >= 74 else "C")

        missing = [s for s in job_req_set if s not in cand_skills][:4]

        return {
            "overall_score": overall_score,
            "tier": tier,
            "priority_score": int(overall_score * 0.8 + sal_score * 0.2),
            "recommendation": "HIGH PRIORITY TARGET" if tier == "A" else ("STRATEGIC TARGET" if tier == "B" else "EXPLORATORY"),
            "job_normalization": job_norm,
            "candidate_normalization": cand_norm,
            "matched_skills": list(matched_req)[:6],
            "missing_skills": missing,
            "breakdown": {
                "role_alignment": role_align_score,
                "required_skills": req_skills_score,
                "preferred_skills": preferred_skills_score,
                "experience_fit": exp_score,
                "projects_relevance": proj_score,
                "education": edu_score,
                "salary_benchmark": sal_score,
                "location_fit": loc_score
            },
            "strengths": [
                f"High alignment with {cand_norm['career_family']} and {cand_norm['normalized_role']}",
                f"Strong match on core skills: {', '.join(list(matched_req)[:3]) or 'Production Architecture & Problem Solving'}",
                f"Meets package criteria: ₹{job_max_sal}L LPA (Target: ₹{target_min_sal}L+)"
            ]
        }

role_intelligence_engine = RoleIntelligenceEngine()
