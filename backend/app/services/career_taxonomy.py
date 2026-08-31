"""
CAREER ROLE INTELLIGENCE ENGINE & TAXONOMY
Comprehensive Multi-Career Role Ecosystem covering 22+ Technology Domains:
Domain -> Career Stream -> Role Family -> Primary Role -> Related Roles -> Specializations -> Skills -> Adjacent Roles
"""

from typing import Dict, Any, List, Optional

class CareerTaxonomyEngine:
    DOMAINS: Dict[str, Dict[str, Any]] = {
        "AI_MACHINE_LEARNING": {
            "name": "AI & Machine Learning",
            "icon": "🤖",
            "description": "Artificial Intelligence, Deep Learning, Foundation Models, and Agentic Systems",
            "streams": [
                {
                    "name": "Generative & Agentic AI Engineering",
                    "role_family": "Generative AI & Agent Systems",
                    "primary_roles": ["AI Engineer", "GenAI Engineer", "Agentic AI Architect", "LLM Engineer"],
                    "related_roles": [
                        "ML Engineer",
                        "Applied AI Scientist",
                        "Prompt Engineer",
                        "AI Solutions Architect",
                        "AI Software Engineer",
                        "Machine Learning Engineer"
                    ],
                    "specializations": [
                        "RAG",
                        "LLM",
                        "Agents",
                        "Computer Vision",
                        "NLP",
                        "MLOps",
                        "Generative AI",
                        "Vector Search",
                        "Fine-Tuning",
                        "Multi-Agent Swarms"
                    ],
                    "required_skills": ["Python", "LangGraph", "RAG", "Vector DBs", "Azure OpenAI", "FastAPI", "Prompt Engineering"],
                    "preferred_skills": ["Ragas Evaluation", "Fine-Tuning", "Multi-Agent Swarms", "Hugging Face", "Async I/O"],
                    "adjacent_roles": ["ML Engineer", "Data Scientist", "Backend Developer", "Data Engineer"],
                    "matching_weights": {"tech_skills": 0.35, "projects": 0.30, "experience": 0.15, "education": 0.10, "ats": 0.10}
                },
                {
                    "name": "Machine Learning & Deep Learning",
                    "role_family": "Core Machine Learning",
                    "primary_roles": ["ML Engineer", "Deep Learning Engineer", "Computer Vision Specialist"],
                    "related_roles": [
                        "NLP Engineer",
                        "Research Scientist",
                        "Applied ML Engineer",
                        "AI Research Engineer",
                        "Neural Network Architect"
                    ],
                    "specializations": [
                        "Computer Vision",
                        "NLP",
                        "MLOps",
                        "Model Quantization",
                        "Deep Reinforcement Learning",
                        "Edge AI",
                        "CUDA Optimization"
                    ],
                    "required_skills": ["Python", "PyTorch", "TensorFlow", "Scikit-Learn", "NumPy/Pandas", "Math/Linear Algebra"],
                    "preferred_skills": ["MLOps", "MLflow", "CUDA", "Model Quantization", "Docker", "AWS SageMaker"],
                    "adjacent_roles": ["Data Scientist", "Data Engineer", "AI Engineer", "Algorithm Engineer"],
                    "matching_weights": {"tech_skills": 0.35, "projects": 0.25, "experience": 0.20, "education": 0.10, "ats": 0.10}
                }
            ]
        },
        "DATA_ANALYTICS": {
            "name": "Data & Analytics",
            "icon": "📊",
            "description": "Statistical Modeling, Advanced Analytics, Business Intelligence, and Predictive Insights",
            "streams": [
                {
                    "name": "Data Science & Advanced Analytics",
                    "role_family": "Data Science & Predictive Modeling",
                    "primary_roles": ["Data Scientist", "Senior Data Scientist", "Applied Statistician"],
                    "related_roles": [
                        "Decision Scientist",
                        "Predictive Modeler",
                        "Product Data Scientist",
                        "Quantitative Analyst",
                        "Statistical Modeler"
                    ],
                    "specializations": [
                        "Statistical Inference",
                        "A/B Testing & Experimentation",
                        "Predictive Modeling",
                        "Time Series Forecasting",
                        "Customer Lifetime Value (LTV)",
                        "Causal Inference"
                    ],
                    "required_skills": ["Python", "SQL", "Statistics", "Pandas", "Scikit-Learn", "A/B Testing", "Data Visualization"],
                    "preferred_skills": ["Machine Learning", "Tableau", "Time Series Forecasting", "Snowflake", "R"],
                    "adjacent_roles": ["Data Analyst", "ML Engineer", "Business Intelligence Lead", "Data Engineer"],
                    "matching_weights": {"tech_skills": 0.30, "projects": 0.30, "experience": 0.20, "education": 0.10, "ats": 0.10}
                },
                {
                    "name": "Business Intelligence & Analytics",
                    "role_family": "Business Intelligence",
                    "primary_roles": ["Data Analyst", "BI Analyst", "BI Developer", "Reporting Specialist"],
                    "related_roles": [
                        "Product Analyst",
                        "Operations Analyst",
                        "Financial Data Analyst",
                        "Analytics Engineer",
                        "Insights Manager"
                    ],
                    "specializations": [
                        "Dashboarding & Data Storytelling",
                        "Product Metrics & Funnels",
                        "Financial & Revenue Modeling",
                        "ETL / ELT Semantic Modeling",
                        "Executive KPI Dashboards"
                    ],
                    "required_skills": ["SQL", "Power BI", "Tableau", "Excel (Advanced)", "Data Modeling", "Dashboarding"],
                    "preferred_skills": ["Python", "dbt", "Snowflake", "ETL Pipelines", "Statistical Analysis"],
                    "adjacent_roles": ["Analytics Engineer", "Data Scientist", "Business Analyst", "Product Manager"],
                    "matching_weights": {"tech_skills": 0.35, "projects": 0.25, "experience": 0.20, "education": 0.10, "ats": 0.10}
                }
            ]
        },
        "DATA_ENGINEERING": {
            "name": "Data Engineering",
            "icon": "⚡",
            "description": "Big Data Infrastructure, Distributed Streaming, Data Lakehouses, and Pipelines",
            "streams": [
                {
                    "name": "Big Data & Lakehouse Engineering",
                    "role_family": "Data Infrastructure",
                    "primary_roles": ["Data Engineer", "Senior Big Data Engineer", "Lakehouse Platform Architect"],
                    "related_roles": [
                        "ETL Developer",
                        "Data Platform Engineer",
                        "Streaming Pipeline Engineer",
                        "Analytics Engineer",
                        "Database Infrastructure Engineer"
                    ],
                    "specializations": [
                        "Streaming Pipelines (Kafka/Flink)",
                        "Lakehouse Architecture (Delta Lake/Iceberg)",
                        "Cloud Data Warehousing (Snowflake/BigQuery)",
                        "Data Workflow Orchestration (Airflow/Prefect)",
                        "Data Governance & Lineage"
                    ],
                    "required_skills": ["Python", "SQL", "Apache Spark", "Kafka", "Airflow", "Snowflake", "Databricks"],
                    "preferred_skills": ["dbt", "Delta Lake", "AWS (EMR, S3, Glue)", "Scala", "Data Governance"],
                    "adjacent_roles": ["Backend Developer", "Cloud Engineer", "Database Administrator", "MLOps Engineer"],
                    "matching_weights": {"tech_skills": 0.40, "projects": 0.25, "experience": 0.20, "education": 0.05, "ats": 0.10}
                }
            ]
        },
        "SOFTWARE_ENGINEERING": {
            "name": "Software Engineering",
            "icon": "💻",
            "description": "Full Stack Web, Distributed Backend Systems, Frontend Architecture, and Mobile Apps",
            "streams": [
                {
                    "name": "Backend Systems Engineering",
                    "role_family": "Backend & Distributed Systems",
                    "primary_roles": ["Backend Developer", "Senior Backend Engineer", "Distributed Systems Engineer"],
                    "related_roles": [
                        "API Engineer",
                        "Systems Developer",
                        "Database Engineer",
                        "Cloud Backend Lead",
                        "Microservices Architect",
                        "Core Platform Developer"
                    ],
                    "specializations": [
                        "Distributed Systems",
                        "Microservices & Event-Driven Architecture",
                        "High Concurrency & Low Latency",
                        "Database Performance & Sharding",
                        "gRPC & Messaging Queues",
                        "API Gateway & Auth Protocols"
                    ],
                    "required_skills": ["Python", "Go", "Java", "PostgreSQL", "Redis", "Microservices", "Docker"],
                    "preferred_skills": ["gRPC", "Kafka", "Kubernetes", "AWS", "High Concurrency", "System Design"],
                    "adjacent_roles": ["Data Engineer", "DevOps Engineer", "Site Reliability Engineer", "Full Stack Developer"],
                    "matching_weights": {"tech_skills": 0.40, "projects": 0.25, "experience": 0.20, "education": 0.05, "ats": 0.10}
                },
                {
                    "name": "Full Stack Engineering",
                    "role_family": "Full Stack Web",
                    "primary_roles": ["Full Stack Developer", "Senior Full Stack Engineer", "Staff Full Stack Architect"],
                    "related_roles": [
                        "Web Architect",
                        "Full Stack TypeScript Developer",
                        "Frontend Developer",
                        "Backend Developer",
                        "Application Engineer"
                    ],
                    "specializations": [
                        "End-to-End TypeScript Architecture",
                        "Next.js App Router & SSR",
                        "REST & GraphQL API Design",
                        "State Management & Offline Sync",
                        "Serverless & Edge Computing"
                    ],
                    "required_skills": ["React", "TypeScript", "Node.js", "FastAPI", "PostgreSQL", "REST APIs", "Git"],
                    "preferred_skills": ["Next.js", "Redis", "Docker", "GraphQL", "PgBouncer", "Kafka", "CI/CD"],
                    "adjacent_roles": ["DevOps Engineer", "Platform Engineer", "Mobile Engineer", "UI Engineer"],
                    "matching_weights": {"tech_skills": 0.35, "projects": 0.25, "experience": 0.20, "education": 0.10, "ats": 0.10}
                },
                {
                    "name": "Frontend & Web Architecture",
                    "role_family": "Frontend & Web Apps",
                    "primary_roles": ["Frontend Developer", "Staff Frontend Architect", "UI Engineer"],
                    "related_roles": [
                        "Web Developer",
                        "Design Technologist",
                        "JavaScript Specialist",
                        "React Engineer",
                        "CSS / Motion Specialist"
                    ],
                    "specializations": [
                        "React 19 & Server Components (RSC)",
                        "Web Performance & Core Web Vitals",
                        "Design Systems & Reusable UI Kits",
                        "Accessibility (a11y / WCAG 2.1)",
                        "Micro-Frontends & Module Federation"
                    ],
                    "required_skills": ["JavaScript", "TypeScript", "React 19", "HTML5/CSS3", "Tailwind CSS", "Zustand"],
                    "preferred_skills": ["Next.js (RSC)", "WebSockets", "Lighthouse Perf", "SSR Streaming", "Jest/Vitest"],
                    "adjacent_roles": ["Product Designer", "Full Stack Developer", "Mobile Developer"],
                    "matching_weights": {"tech_skills": 0.35, "projects": 0.30, "experience": 0.15, "education": 0.10, "ats": 0.10}
                },
                {
                    "name": "Mobile Application Engineering",
                    "role_family": "Mobile Development",
                    "primary_roles": ["Mobile Developer", "iOS Developer", "Android Developer", "React Native Engineer"],
                    "related_roles": [
                        "Flutter Developer",
                        "Mobile Solutions Architect",
                        "Native iOS Engineer",
                        "Native Android Engineer"
                    ],
                    "specializations": [
                        "Cross-Platform Architecture (React Native/Flutter)",
                        "Native iOS (Swift / SwiftUI)",
                        "Native Android (Kotlin / Jetpack Compose)",
                        "Mobile Performance & Battery Optimization",
                        "Offline Storage & Real-Time Sync"
                    ],
                    "required_skills": ["React Native", "Flutter", "Swift", "Kotlin", "TypeScript", "Mobile SDKs", "REST APIs"],
                    "preferred_skills": ["GraphQL", "Fastlane", "App Store Optimization", "CI/CD for Mobile", "Firebase"],
                    "adjacent_roles": ["Frontend Developer", "Full Stack Developer"],
                    "matching_weights": {"tech_skills": 0.35, "projects": 0.30, "experience": 0.15, "education": 0.10, "ats": 0.10}
                }
            ]
        },
        "CLOUD_DEVOPS": {
            "name": "Cloud & DevOps",
            "icon": "☁️",
            "description": "Cloud Infrastructure, Kubernetes, Infrastructure as Code, SRE, and CI/CD",
            "streams": [
                {
                    "name": "DevOps & SRE Engineering",
                    "role_family": "Cloud Infrastructure & Reliability",
                    "primary_roles": ["DevOps Engineer", "Site Reliability Engineer", "Platform Infrastructure Lead"],
                    "related_roles": [
                        "Cloud Engineer",
                        "Build/Release Engineer",
                        "Kubernetes Specialist",
                        "Infrastructure Automation Engineer",
                        "Systems Reliability Specialist"
                    ],
                    "specializations": [
                        "Kubernetes & Container Orchestration",
                        "Infrastructure as Code (Terraform/OpenTofu)",
                        "CI/CD Pipeline Automation (GitHub Actions/GitLab)",
                        "Observability, SLOs & Alerting (Prometheus/Grafana)",
                        "GitOps & Multi-Cluster Deployment (ArgoCD)"
                    ],
                    "required_skills": ["Linux", "Docker", "Kubernetes", "AWS / Azure", "Terraform", "CI/CD (GitHub Actions)", "Bash"],
                    "preferred_skills": ["Prometheus/Grafana", "Helm", "Ansible", "Service Mesh (Istio)", "Chaos Engineering"],
                    "adjacent_roles": ["Backend Developer", "Security Engineer", "System Administrator", "Cloud Architect"],
                    "matching_weights": {"tech_skills": 0.40, "projects": 0.25, "experience": 0.20, "education": 0.05, "ats": 0.10}
                },
                {
                    "name": "Cloud Architecture & Solutions",
                    "role_family": "Enterprise Cloud Architecture",
                    "primary_roles": ["Cloud Architect", "Solutions Architect", "Enterprise Cloud Engineer"],
                    "related_roles": [
                        "AWS Solutions Architect",
                        "Azure Cloud Architect",
                        "GCP Architect",
                        "Cloud Transformation Lead"
                    ],
                    "specializations": [
                        "Multi-Cloud & Hybrid Cloud Design",
                        "Cloud Migration & FinOps Cost Optimization",
                        "High Availability & Disaster Recovery (DR)",
                        "Zero-Trust Cloud Networking",
                        "Serverless Architecture Design"
                    ],
                    "required_skills": ["AWS", "Azure", "GCP", "Cloud Security", "Enterprise Architecture", "Networking (VPC/BGP)"],
                    "preferred_skills": ["Terraform", "Cost Optimization", "Identity Management (IAM)", "Compliance (SOC2/HIPAA)"],
                    "adjacent_roles": ["DevOps Engineer", "Principal Backend Architect", "Security Architect"],
                    "matching_weights": {"tech_skills": 0.40, "projects": 0.30, "experience": 0.20, "education": 0.05, "ats": 0.05}
                }
            ]
        },
        "CYBERSECURITY": {
            "name": "Cybersecurity & InfoSec",
            "icon": "🛡️",
            "description": "Application Security, Threat Hunting, SOC, Penetration Testing, and DevSecOps",
            "streams": [
                {
                    "name": "Security Operations & AppSec",
                    "role_family": "Information Security",
                    "primary_roles": ["Cybersecurity Engineer", "Security Analyst", "SOC Analyst", "Application Security Engineer", "Penetration Tester"],
                    "related_roles": [
                        "Cloud Security Specialist",
                        "Threat Hunter",
                        "Incident Responder",
                        "Information Security Manager",
                        "Vulnerability Assessment Lead"
                    ],
                    "specializations": [
                        "Application Security & OWASP Top 10",
                        "Cloud Security Posture & IAM Hardening",
                        "SIEM & Threat Hunting (Splunk/Sentinel)",
                        "Penetration Testing & Red Teaming",
                        "DevSecOps & Automated Code Scanning (SAST/DAST)"
                    ],
                    "required_skills": ["Networking (TCP/IP, Firewalls)", "Linux", "SIEM (Splunk, Sentinel)", "Vulnerability Scanning", "OWASP Top 10"],
                    "preferred_skills": ["Burp Suite", "Kali Linux", "Incident Response", "CISSP/CEH Prep", "Zero Trust"],
                    "adjacent_roles": ["DevSecOps Engineer", "Network Engineer", "Systems Administrator", "Cloud Architect"],
                    "matching_weights": {"tech_skills": 0.35, "projects": 0.25, "experience": 0.20, "education": 0.10, "ats": 0.10}
                }
            ]
        },
        "QA_TESTING": {
            "name": "Software Quality & SDET",
            "icon": "🧪",
            "description": "Automated Testing, SDET Architecture, Performance Testing, and Continuous Verification",
            "streams": [
                {
                    "name": "Test Automation & SDET",
                    "role_family": "Quality Engineering",
                    "primary_roles": ["QA Engineer", "SDET", "QA Automation Engineer", "Performance Test Engineer"],
                    "related_roles": [
                        "Test Architect",
                        "Manual QA Specialist",
                        "API Test Engineer",
                        "Quality Assurance Lead",
                        "Automation Framework Developer"
                    ],
                    "specializations": [
                        "E2E Web Automation (Playwright / Cypress / Selenium)",
                        "API Automation & Contract Testing (Postman / REST Assured)",
                        "Performance & Load Testing (k6 / JMeter / Locust)",
                        "Mobile Automation (Appium)",
                        "CI/CD Test Pipeline Integration"
                    ],
                    "required_skills": ["Selenium", "Playwright", "Cypress", "Python / Java / JS", "PyTest / TestNG", "Postman", "CI/CD"],
                    "preferred_skills": ["JMeter", "Load Testing", "BDD (Cucumber)", "Appium Mobile Testing", "Docker"],
                    "adjacent_roles": ["Backend Developer", "DevOps Engineer", "Full Stack Developer"],
                    "matching_weights": {"tech_skills": 0.35, "projects": 0.25, "experience": 0.20, "education": 0.10, "ats": 0.10}
                }
            ]
        },
        "UI_UX_DESIGN": {
            "name": "Product & Design",
            "icon": "🎨",
            "description": "Product Design, Interaction Design, User Experience Research, and Design Systems",
            "streams": [
                {
                    "name": "Product & Interaction Design",
                    "role_family": "Product Design",
                    "primary_roles": ["Product Designer", "UI/UX Designer", "Design Technologist"],
                    "related_roles": [
                        "User Researcher",
                        "Interaction Designer",
                        "Visual Designer",
                        "Design Systems Lead",
                        "UX Strategist"
                    ],
                    "specializations": [
                        "Design Systems & Reusable Components",
                        "User Research & Usability Testing",
                        "High-Fidelity Interactive Prototyping",
                        "Design Tokens & Developer Handoff",
                        "Accessibility (WCAG 2.1 AA/AAA)"
                    ],
                    "required_skills": ["Figma", "Design Systems", "Wireframing", "Prototyping", "User Research", "Usability Testing"],
                    "preferred_skills": ["HTML/CSS/Tailwind", "Micro-Interactions", "Accessibility (WCAG)", "Design Tokens"],
                    "adjacent_roles": ["Frontend Developer", "Product Manager", "Design Technologist"],
                    "matching_weights": {"tech_skills": 0.30, "projects": 0.40, "experience": 0.15, "education": 0.05, "ats": 0.10}
                },
                {
                    "name": "Technical Product Management",
                    "role_family": "Product Management",
                    "primary_roles": ["Technical Product Manager", "Product Manager", "AI Product Manager"],
                    "related_roles": [
                        "Product Owner",
                        "Growth Product Manager",
                        "Platform Product Lead",
                        "Associate Product Manager"
                    ],
                    "specializations": [
                        "Product Roadmap & Feature Prioritization",
                        "Data-Driven Product Analytics & Funnels",
                        "AI/ML Product Lifecycle & Experimentation",
                        "Technical PRD & User Story Architecture",
                        "Stakeholder Alignment & Agile Sprints"
                    ],
                    "required_skills": ["Product Strategy", "User Stories", "Roadmapping", "SQL / Analytics", "Agile / Scrum", "Wireframing"],
                    "preferred_skills": ["A/B Testing", "Jira", "Mixpanel", "API Architecture", "Customer Discovery"],
                    "adjacent_roles": ["Product Designer", "Engineering Manager", "Business Analyst"],
                    "matching_weights": {"tech_skills": 0.25, "projects": 0.35, "experience": 0.25, "education": 0.05, "ats": 0.10}
                }
            ]
        },
        "EMBEDDED_IOT": {
            "name": "Embedded Systems & IoT",
            "icon": "🔌",
            "description": "Firmware Development, Embedded C/C++, Microcontrollers, and Robotics",
            "streams": [
                {
                    "name": "Firmware & Embedded Software",
                    "role_family": "Embedded Systems",
                    "primary_roles": ["Embedded Software Engineer", "Firmware Developer", "IoT Systems Lead"],
                    "related_roles": [
                        "Device Driver Developer",
                        "Robotics Firmware Engineer",
                        "RTOS Specialist",
                        "Hardware-Software Integration Engineer"
                    ],
                    "specializations": [
                        "RTOS & Real-Time Kernel Scheduling",
                        "Low-Level Device Drivers (I2C/SPI/UART)",
                        "IoT Protocols (MQTT/BLE/CoAP)",
                        "Microcontroller Architecture (ARM Cortex/ESP32)",
                        "Firmware OTA Updates & Security"
                    ],
                    "required_skills": ["Embedded C", "C++", "RTOS (FreeRTOS)", "Microcontrollers (ARM, STM32, ESP32)", "I2C/SPI/UART"],
                    "preferred_skills": ["Linux Kernel", "Bluetooth Low Energy (BLE)", "MQTT", "Hardware Debugging (Oscilloscope)"],
                    "adjacent_roles": ["Hardware Engineer", "Backend Developer", "Systems Engineer"],
                    "matching_weights": {"tech_skills": 0.40, "projects": 0.25, "experience": 0.20, "education": 0.10, "ats": 0.05}
                }
            ]
        }
    }

    @classmethod
    def get_all_domains(cls) -> List[Dict[str, Any]]:
        """Returns all career domains with stream counts and sample roles."""
        result = []
        for k, v in cls.DOMAINS.items():
            sample_roles = []
            for s in v["streams"]:
                sample_roles.extend(s["primary_roles"])
            result.append({
                "id": k,
                "name": v["name"],
                "icon": v["icon"],
                "description": v.get("description", ""),
                "stream_count": len(v["streams"]),
                "sample_roles": sample_roles[:4]
            })
        return result

    @classmethod
    def get_all_streams(cls, domain_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """Returns all career streams, optionally filtered by domain."""
        streams = []
        for dom_key, dom_data in cls.DOMAINS.items():
            if domain_id and dom_key != domain_id:
                continue
            for s in dom_data["streams"]:
                streams.append({
                    "domain_id": dom_key,
                    "domain_name": dom_data["name"],
                    "domain_icon": dom_data["icon"],
                    "stream_name": s["name"],
                    "role_family": s.get("role_family", s["name"]),
                    "primary_roles": s["primary_roles"],
                    "related_roles": s["related_roles"],
                    "specializations": s.get("specializations", []),
                    "required_skills": s["required_skills"],
                    "preferred_skills": s["preferred_skills"],
                    "adjacent_roles": s["adjacent_roles"]
                })
        return streams

    @classmethod
    def get_role_intelligence(cls, role_name: str) -> Dict[str, Any]:
        """
        Understands the complete career role ecosystem for any target role.
        Implements 3-pass priority matching: primary_roles -> related_roles -> adjacent_roles.
        """
        role_clean = role_name.strip().lower()
        
        # Pass 1: Match on primary_roles
        for dom_id, dom_data in cls.DOMAINS.items():
            for stream in dom_data["streams"]:
                if any(role_clean == r.lower() or role_clean in r.lower() or r.lower() in role_clean for r in stream["primary_roles"]):
                    return cls._build_role_ecosystem(dom_id, dom_data, stream, role_name)

        # Pass 2: Match on related_roles
        for dom_id, dom_data in cls.DOMAINS.items():
            for stream in dom_data["streams"]:
                if any(role_clean in r.lower() or r.lower() in role_clean for r in stream["related_roles"]):
                    return cls._build_role_ecosystem(dom_id, dom_data, stream, role_name)

        # Pass 3: Match on adjacent_roles
        for dom_id, dom_data in cls.DOMAINS.items():
            for stream in dom_data["streams"]:
                if any(role_clean in r.lower() or r.lower() in role_clean for r in stream["adjacent_roles"]):
                    return cls._build_role_ecosystem(dom_id, dom_data, stream, role_name)

        # Fallback to Software Engineering Full Stack
        fallback_dom = cls.DOMAINS["SOFTWARE_ENGINEERING"]
        fallback_stream = fallback_dom["streams"][0]
        return cls._build_role_ecosystem("SOFTWARE_ENGINEERING", fallback_dom, fallback_stream, role_name)

    @classmethod
    def _build_role_ecosystem(cls, dom_id: str, dom_data: Dict[str, Any], stream: Dict[str, Any], role_name: str) -> Dict[str, Any]:
        # Determine primary role
        primary = stream["primary_roles"][0] if stream["primary_roles"] else role_name
        for pr in stream["primary_roles"]:
            if role_name.lower() in pr.lower() or pr.lower() in role_name.lower():
                primary = pr
                break

        return {
            "domain_id": dom_id,
            "domain_name": dom_data["name"],
            "domain_icon": dom_data.get("icon", "💼"),
            "domain_description": dom_data.get("description", ""),
            "career_stream": stream["name"],
            "stream_name": stream["name"],
            "role_family": stream.get("role_family", stream["name"]),
            "matched_role": role_name,
            "primary_role": primary,
            "primary_roles": stream["primary_roles"],
            "related_roles": stream["related_roles"],
            "specializations": stream.get("specializations", []),
            "required_skills": stream["required_skills"],
            "preferred_skills": stream["preferred_skills"],
            "all_skills": stream["required_skills"] + stream["preferred_skills"],
            "adjacent_roles": stream["adjacent_roles"],
            "matching_weights": stream["matching_weights"]
        }

    @classmethod
    def get_related_roles(cls, role_name: str) -> List[str]:
        """Returns the list of related roles for a given career."""
        intel = cls.get_role_intelligence(role_name)
        return intel.get("related_roles", [])

    @classmethod
    def get_specializations(cls, role_name: str) -> List[str]:
        """Returns the list of domain specializations for a given career."""
        intel = cls.get_role_intelligence(role_name)
        return intel.get("specializations", [])

    @classmethod
    def get_adjacent_roles(cls, role_name: str) -> List[str]:
        """Returns adjacent career roles for career pivoting."""
        intel = cls.get_role_intelligence(role_name)
        return intel.get("adjacent_roles", [])

    @classmethod
    def search_roles(cls, query: str) -> List[Dict[str, Any]]:
        """Search across all roles in the taxonomy."""
        q = query.strip().lower()
        if not q:
            return []
        
        matches = []
        for dom_id, dom_data in cls.DOMAINS.items():
            for stream in dom_data["streams"]:
                all_roles = stream["primary_roles"] + stream["related_roles"] + stream["adjacent_roles"]
                for r in all_roles:
                    if q in r.lower():
                        matches.append({
                            "role": r,
                            "role_type": "Primary" if r in stream["primary_roles"] else ("Related" if r in stream["related_roles"] else "Adjacent"),
                            "domain_name": dom_data["name"],
                            "stream_name": stream["name"],
                            "specializations": stream.get("specializations", [])[:4]
                        })
        # Deduplicate by role name
        seen = set()
        unique = []
        for m in matches:
            if m["role"] not in seen:
                seen.add(m["role"])
                unique.append(m)
        return unique

career_taxonomy = CareerTaxonomyEngine()
