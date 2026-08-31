from typing import Dict, Any, List, Optional

class CareerTaxonomyEngine:
    DOMAINS = {
        "SOFTWARE_ENGINEERING": {
            "name": "Software Engineering",
            "icon": "💻",
            "streams": [
                {
                    "name": "Full Stack Engineering",
                    "primary_roles": ["Full Stack Developer", "Senior Full Stack Engineer", "Staff Full Stack Architect"],
                    "related_roles": ["Frontend Developer", "Backend Developer", "Web Architect", "API Engineer"],
                    "adjacent_roles": ["DevOps Engineer", "Platform Engineer", "Mobile Engineer"],
                    "required_skills": ["React", "TypeScript", "Node.js", "FastAPI", "PostgreSQL", "REST APIs", "Git"],
                    "preferred_skills": ["Next.js", "Redis", "Docker", "GraphQL", "PgBouncer", "Kafka", "CI/CD"],
                    "matching_weights": {"tech_skills": 0.35, "projects": 0.25, "experience": 0.20, "education": 0.10, "ats": 0.10}
                },
                {
                    "name": "Backend Systems Engineering",
                    "primary_roles": ["Backend Developer", "Senior Backend Engineer", "Distributed Systems Engineer"],
                    "related_roles": ["API Engineer", "Systems Developer", "Database Engineer", "Cloud Backend Lead"],
                    "adjacent_roles": ["Data Engineer", "DevOps Engineer", "Site Reliability Engineer"],
                    "required_skills": ["Python", "Go", "Java", "PostgreSQL", "Redis", "Microservices", "Docker"],
                    "preferred_skills": ["gRPC", "Kafka", "Kubernetes", "AWS", "High Concurrency", "System Design"],
                    "matching_weights": {"tech_skills": 0.40, "projects": 0.25, "experience": 0.20, "education": 0.05, "ats": 0.10}
                },
                {
                    "name": "Frontend & Web Architecture",
                    "primary_roles": ["Frontend Developer", "Staff Frontend Architect", "UI Engineer"],
                    "related_roles": ["Web Developer", "Design Technologist", "JavaScript Specialist"],
                    "adjacent_roles": ["Product Designer", "Full Stack Developer", "Mobile Developer"],
                    "required_skills": ["JavaScript", "TypeScript", "React 19", "HTML5/CSS3", "Tailwind CSS", "Zustand"],
                    "preferred_skills": ["Next.js (RSC)", "WebSockets", "Lighthouse Perf", "SSR Streaming", "Jest/Vitest"],
                    "matching_weights": {"tech_skills": 0.35, "projects": 0.30, "experience": 0.15, "education": 0.10, "ats": 0.10}
                }
            ]
        },
        "AI_MACHINE_LEARNING": {
            "name": "AI & Machine Learning",
            "icon": "🤖",
            "streams": [
                {
                    "name": "Generative & Agentic AI Engineering",
                    "primary_roles": ["AI Engineer", "GenAI Engineer", "Agentic AI Architect", "LLM Engineer"],
                    "related_roles": ["Applied AI Scientist", "Prompt Engineer", "AI Solutions Architect"],
                    "adjacent_roles": ["ML Engineer", "Data Scientist", "Backend Developer"],
                    "required_skills": ["Python", "LangGraph", "RAG", "Vector DBs", "Azure OpenAI", "FastAPI", "Prompt Engineering"],
                    "preferred_skills": ["Ragas Evaluation", "Fine-Tuning", "Multi-Agent Swarms", "Hugging Face", "Async I/O"],
                    "matching_weights": {"tech_skills": 0.35, "projects": 0.30, "experience": 0.15, "education": 0.10, "ats": 0.10}
                },
                {
                    "name": "Machine Learning & Deep Learning",
                    "primary_roles": ["ML Engineer", "Deep Learning Engineer", "Computer Vision Specialist"],
                    "related_roles": ["NLP Engineer", "Research Scientist", "Applied ML Engineer"],
                    "adjacent_roles": ["Data Scientist", "Data Engineer", "AI Engineer"],
                    "required_skills": ["Python", "PyTorch", "TensorFlow", "Scikit-Learn", "NumPy/Pandas", "Math/Linear Algebra"],
                    "preferred_skills": ["MLOps", "MLflow", "CUDA", "Model Quantization", "Docker", "AWS SageMaker"],
                    "matching_weights": {"tech_skills": 0.35, "projects": 0.25, "experience": 0.20, "education": 0.10, "ats": 0.10}
                }
            ]
        },
        "DATA_ANALYTICS": {
            "name": "Data & Analytics",
            "icon": "📊",
            "streams": [
                {
                    "name": "Data Science & Advanced Analytics",
                    "primary_roles": ["Data Scientist", "Senior Data Scientist", "Applied Statistician"],
                    "related_roles": ["Decision Scientist", "Predictive Modeler", "Product Data Scientist"],
                    "adjacent_roles": ["Data Analyst", "ML Engineer", "Business Intelligence Lead"],
                    "required_skills": ["Python", "SQL", "Statistics", "Pandas", "Scikit-Learn", "A/B Testing", "Data Visualization"],
                    "preferred_skills": ["Machine Learning", "Tableau", "Time Series Forecasting", "Snowflake", "R"],
                    "matching_weights": {"tech_skills": 0.30, "projects": 0.30, "experience": 0.20, "education": 0.10, "ats": 0.10}
                },
                {
                    "name": "Business Intelligence & Analytics",
                    "primary_roles": ["Data Analyst", "BI Analyst", "BI Developer", "Reporting Specialist"],
                    "related_roles": ["Product Analyst", "Operations Analyst", "Financial Data Analyst"],
                    "adjacent_roles": ["Analytics Engineer", "Data Scientist", "Business Analyst"],
                    "required_skills": ["SQL", "Power BI", "Tableau", "Excel (Advanced)", "Data Modeling", "Dashboarding"],
                    "preferred_skills": ["Python", "dbt", "Snowflake", "ETL Pipelines", "Statistical Analysis"],
                    "matching_weights": {"tech_skills": 0.35, "projects": 0.25, "experience": 0.20, "education": 0.10, "ats": 0.10}
                }
            ]
        },
        "DATA_ENGINEERING": {
            "name": "Data Engineering",
            "icon": "⚡",
            "streams": [
                {
                    "name": "Big Data & Lakehouse Engineering",
                    "primary_roles": ["Data Engineer", "Senior Big Data Engineer", "Lakehouse Platform Architect"],
                    "related_roles": ["ETL Developer", "Data Platform Engineer", "Streaming Pipeline Engineer"],
                    "adjacent_roles": ["Backend Developer", "Cloud Engineer", "Database Administrator"],
                    "required_skills": ["Python", "SQL", "Apache Spark", "Kafka", "Airflow", "Snowflake", "Databricks"],
                    "preferred_skills": ["dbt", "Delta Lake", "AWS (EMR, S3, Glue)", "Scala", "Data Governance"],
                    "matching_weights": {"tech_skills": 0.40, "projects": 0.25, "experience": 0.20, "education": 0.05, "ats": 0.10}
                }
            ]
        },
        "CLOUD_DEVOPS": {
            "name": "Cloud & DevOps",
            "icon": "☁️",
            "streams": [
                {
                    "name": "DevOps & SRE Engineering",
                    "primary_roles": ["DevOps Engineer", "Site Reliability Engineer", "Platform Infrastructure Lead"],
                    "related_roles": ["Cloud Engineer", "Build/Release Engineer", "Kubernetes Specialist"],
                    "adjacent_roles": ["Backend Developer", "Security Engineer", "System Administrator"],
                    "required_skills": ["Linux", "Docker", "Kubernetes", "AWS / Azure", "Terraform", "CI/CD (GitHub Actions)", "Bash"],
                    "preferred_skills": ["Prometheus/Grafana", "Helm", "Ansible", "Service Mesh (Istio)", "Chaos Engineering"],
                    "matching_weights": {"tech_skills": 0.40, "projects": 0.25, "experience": 0.20, "education": 0.05, "ats": 0.10}
                }
            ]
        },
        "CYBERSECURITY": {
            "name": "Cybersecurity",
            "icon": "🛡️",
            "streams": [
                {
                    "name": "Security Operations & AppSec",
                    "primary_roles": ["Security Analyst", "SOC Analyst", "Application Security Engineer", "Penetration Tester"],
                    "related_roles": ["Cloud Security Specialist", "Threat Hunter", "Incident Responder"],
                    "adjacent_roles": ["DevSecOps Engineer", "Network Engineer", "Systems Administrator"],
                    "required_skills": ["Networking (TCP/IP, Firewalls)", "Linux", "SIEM (Splunk, Sentinel)", "Vulnerability Scanning", "OWASP Top 10"],
                    "preferred_skills": ["Burp Suite", "Kali Linux", "Incident Response", "CISSP/CEH Prep", "Zero Trust"],
                    "matching_weights": {"tech_skills": 0.35, "projects": 0.25, "experience": 0.20, "education": 0.10, "ats": 0.10}
                }
            ]
        },
        "QA_TESTING": {
            "name": "QA & SDET",
            "icon": "🧪",
            "streams": [
                {
                    "name": "Test Automation & SDET",
                    "primary_roles": ["SDET", "QA Automation Engineer", "Performance Test Engineer"],
                    "related_roles": ["Test Architect", "Manual QA Specialist", "API Test Engineer"],
                    "adjacent_roles": ["Backend Developer", "DevOps Engineer"],
                    "required_skills": ["Selenium", "Playwright", "Cypress", "Python / Java / JS", "PyTest / TestNG", "Postman", "CI/CD"],
                    "preferred_skills": ["JMeter", "Load Testing", "BDD (Cucumber)", "Appium Mobile Testing", "Docker"],
                    "matching_weights": {"tech_skills": 0.35, "projects": 0.25, "experience": 0.20, "education": 0.10, "ats": 0.10}
                }
            ]
        },
        "UI_UX_DESIGN": {
            "name": "UI/UX & Product Design",
            "icon": "🎨",
            "streams": [
                {
                    "name": "Product & Interaction Design",
                    "primary_roles": ["Product Designer", "UI/UX Designer", "Design Technologist"],
                    "related_roles": ["User Researcher", "Interaction Designer", "Visual Designer"],
                    "adjacent_roles": ["Frontend Developer", "Product Manager"],
                    "required_skills": ["Figma", "Design Systems", "Wireframing", "Prototyping", "User Research", "Usability Testing"],
                    "preferred_skills": ["HTML/CSS/Tailwind", "Micro-Interactions", "Accessibility (WCAG)", "Design Tokens"],
                    "matching_weights": {"tech_skills": 0.30, "projects": 0.40, "experience": 0.15, "education": 0.05, "ats": 0.10}
                }
            ]
        },
        "EMBEDDED_IOT": {
            "name": "Embedded Systems & IoT",
            "icon": "🔌",
            "streams": [
                {
                    "name": "Firmware & Embedded Software",
                    "primary_roles": ["Embedded Software Engineer", "Firmware Developer", "IoT Systems Lead"],
                    "related_roles": ["Device Driver Developer", "Robotics Firmware Engineer", "RTOS Specialist"],
                    "adjacent_roles": ["Hardware Engineer", "Backend Developer"],
                    "required_skills": ["Embedded C", "C++", "RTOS (FreeRTOS)", "Microcontrollers (ARM, STM32, ESP32)", "I2C/SPI/UART"],
                    "preferred_skills": ["Linux Kernel", "Bluetooth Low Energy (BLE)", "MQTT", "Hardware Debugging (Oscilloscope)"],
                    "matching_weights": {"tech_skills": 0.40, "projects": 0.25, "experience": 0.20, "education": 0.10, "ats": 0.05}
                }
            ]
        }
    }

    @classmethod
    def get_all_domains(cls) -> List[Dict[str, Any]]:
        return [
            {
                "id": k,
                "name": v["name"],
                "icon": v["icon"],
                "stream_count": len(v["streams"]),
                "sample_roles": [r for s in v["streams"] for r in s["primary_roles"]][:4]
            }
            for k, v in cls.DOMAINS.items()
        ]

    @classmethod
    def get_role_intelligence(cls, role_name: str) -> Dict[str, Any]:
        role_clean = role_name.strip().lower()
        
        for dom_id, dom_data in cls.DOMAINS.items():
            for stream in dom_data["streams"]:
                all_roles = stream["primary_roles"] + stream["related_roles"] + stream["adjacent_roles"]
                if any(role_clean in r.lower() or r.lower() in role_clean for r in all_roles):
                    return {
                        "domain_id": dom_id,
                        "domain_name": dom_data["name"],
                        "stream_name": stream["name"],
                        "matched_role": role_name,
                        "primary_roles": stream["primary_roles"],
                        "related_roles": stream["related_roles"],
                        "adjacent_roles": stream["adjacent_roles"],
                        "required_skills": stream["required_skills"],
                        "preferred_skills": stream["preferred_skills"],
                        "matching_weights": stream["matching_weights"]
                    }
                    
        fallback = cls.DOMAINS["SOFTWARE_ENGINEERING"]["streams"][0]
        return {
            "domain_id": "SOFTWARE_ENGINEERING",
            "domain_name": "Software Engineering",
            "stream_name": fallback["name"],
            "matched_role": role_name,
            "primary_roles": fallback["primary_roles"],
            "related_roles": fallback["related_roles"],
            "adjacent_roles": fallback["adjacent_roles"],
            "required_skills": fallback["required_skills"],
            "preferred_skills": fallback["preferred_skills"],
            "matching_weights": fallback["matching_weights"]
        }

career_taxonomy = CareerTaxonomyEngine()
