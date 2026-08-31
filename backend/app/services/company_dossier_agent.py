import os
from typing import Dict, Any, List, Optional

class CompanyDossierAgent:
    """
    Autonomous Executive Company Dossier Agent.
    Synthesizes 1-page intelligence dossiers:
    - Architecture & Engineering Tech Stack
    - P99 Latency Traps & Scale Failure Modes
    - Top 10 Company-Specific Behavioral & System Design Questions
    - High-Leverage Questions to ask the Interviewer
    """

    COMPANY_KNOWLEDGE = {
        "stripe": {
            "stack": "Ruby on Rails, Go, Java, Envoy, Kafka, Presto, Kubernetes, AWS/GCP",
            "scale_metrics": "500M+ API requests/day, 99.999% uptime, zero idempotency token collisions",
            "architecture_traps": [
                "Two-Phase Commit vs Saga Pattern: How do you guarantee zero duplicate charges when payment gateway network times out?",
                "Eventual Consistency vs Read-Your-Own-Writes in ledger accounting across global regions.",
                "P99 Latency under retry storm: Rate limiting with Token Bucket + Redis Redis-Cell."
            ],
            "top_questions": [
                "Design Stripe Billing: How do you schedule and process millions of subscription invoices at midnight without clock skew?",
                "Explain how you would achieve idempotent API requests when the client disconnects halfway through a charge.",
                "Tell me about a time you had to make an architectural trade-off between strict consistency and P99 latency."
            ],
            "questions_to_ask": [
                "How does your team handle schema migrations on multi-terabyte ledger tables with zero write locking?",
                "What is the largest operational challenge your infrastructure team faced during Black Friday / Cyber Monday peaks?"
            ]
        },
        "rippling": {
            "stack": "Python, Django, React, TypeScript, MongoDB, PostgreSQL, Redis, Celery, AWS",
            "scale_metrics": "50,000+ organizations, Unified Employee Graph database with sub-second permission evaluation",
            "architecture_traps": [
                "Deep Object-Level Permission Evaluation: Evaluating 100+ ACL rules per entity without causing N+1 database queries.",
                "Multi-Tenant Isolation: Preventing cross-tenant data leakage while sharing database connection pools.",
                "Long-Running Async Workflows: Managing distributed task execution for global payroll disbursements."
            ],
            "top_questions": [
                "Design an Access Control System (RBAC/ABAC) that resolves employee permissions across complex organizational hierarchies in <10ms.",
                "How would you migrate a high-volume Django microservice from a synchronous monolithic ORM to an async event-driven architecture?",
                "Walk me through your debugging methodology when a Celery worker pool deadlocks under heavy I/O load."
            ],
            "questions_to_ask": [
                "How do you benchmark and isolate performance regressions across different multi-tenant database shards?",
                "What is the team's philosophy regarding synchronous RPCs vs asynchronous event streams for payroll calculations?"
            ]
        },
        "databricks": {
            "stack": "Scala, Java, Python, C++, Spark, Delta Lake, Kubernetes, Vector DB, AWS/Azure/GCP",
            "scale_metrics": "Exabytes of analytical data processed daily, Multi-cloud serverless compute nodes",
            "architecture_traps": [
                "Distributed Shuffle Bottlenecks: Network I/O saturation during petabyte-scale join operations.",
                "Cold-Start Latency on Serverless Containers: Pre-warming compute instances while maintaining cost efficiency.",
                "ACID Transactions on Object Storage: Handling optimistic concurrency control conflicts on Delta Lake."
            ],
            "top_questions": [
                "Design a distributed log storage engine that provides snapshot isolation and time travel querying.",
                "How do you handle straggler nodes in a distributed computation cluster?",
                "Explain the internal mechanics of a Vector Index (HNSW vs IVF) when scaling to 1 billion embeddings."
            ],
            "questions_to_ask": [
                "How do you balance write throughput with transactional consistency in multi-cloud serverless clusters?",
                "What are the biggest scalability hurdles your team is encountering with generative AI model serving?"
            ]
        }
    }

    def generate_dossier(self, company_name: str, role_title: Optional[str] = None) -> Dict[str, Any]:
        comp_key = company_name.lower().strip()
        knowledge = self.COMPANY_KNOWLEDGE.get(comp_key)

        if not knowledge:
            # Dynamic Fallback Generator for any company
            knowledge = {
                "stack": f"Modern Cloud-Native Stack: FastAPI/Go, React/TypeScript, PostgreSQL, Redis, Kafka, Kubernetes, Docker, AWS",
                "scale_metrics": f"High-concurrency production workloads for {company_name}, P99 SLA < 50ms, Multi-region deployment",
                "architecture_traps": [
                    f"Microservice Cascading Failures: Circuit breakers and exponential backoff during downstream {company_name} outage.",
                    "Distributed Caching Invalidation: Cache-aside vs Write-through consistency under heavy write concurrency.",
                    "Database Connection Exhaustion: Connection pooling with PgBouncer and asynchronous query batching."
                ],
                "top_questions": [
                    f"Walk me through how you would architect a resilient, highly available core microservice for {company_name}.",
                    "Describe a critical production outage you resolved under pressure: Root cause, mitigation, and post-mortem.",
                    "How do you evaluate whether to introduce an event broker (Kafka) vs synchronous REST/gRPC endpoints?"
                ],
                "questions_to_ask": [
                    f"What is the biggest technical debt or scaling bottleneck currently facing your team at {company_name}?",
                    "How does the engineering culture approach code reviews, technical design RFCs, and deployment velocity?"
                ]
            }

        role = role_title or "Senior / Staff Software Engineer"

        return {
            "success": True,
            "company_name": company_name.capitalize(),
            "target_role": role,
            "executive_summary": f"Comprehensive 1-Page Technical Intelligence Dossier prepared for {role} interview at {company_name.capitalize()}.",
            "engineering_stack": knowledge["stack"],
            "tech_stack": knowledge["stack"].split(", "),
            "scale_metrics": knowledge["scale_metrics"],
            "architecture_traps": knowledge["architecture_traps"],
            "top_interview_questions": knowledge["top_questions"],
            "questions_to_ask_interviewer": knowledge["questions_to_ask"],
            "recommended_focus": "Lead with exact metric numbers ($ ARR impact, % latency reduction, RPS scale), isolate individual code contributions, and defend trade-offs."
        }

company_dossier_agent = CompanyDossierAgent()
