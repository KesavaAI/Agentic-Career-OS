from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.profile import Profile
from app.models.project import Project

class ResumeDefenseEngine:
    """
    Dynamically analyzes any candidate's profile, role, experience level,
    and portfolio projects to generate deep cross-examination questions
    and bulletproof Google STAR defense answers.
    """

    @staticmethod
    def generate_defense_for_user(db: Session, user_id: Optional[int] = None) -> Dict[str, Any]:
        profile = db.query(Profile).filter(Profile.user_id == user_id).first() if user_id else db.query(Profile).first()
        projects = db.query(Project).filter(Project.user_id == user_id).all() if user_id else db.query(Project).all()

        candidate_name = profile.full_name if profile else "Candidate"
        target_role = profile.target_role if profile else "Full Stack / Software Engineer"
        exp_years = profile.experience_years if profile else 1.0
        candidate_pool = profile.candidate_pool if profile else "EXPERIENCED"

        role_lower = target_role.lower()

        # Build dynamic questions list
        questions = []
        q_id = 1

        # -------------------------------------------------------------
        # MODULE 1: PROJECT-SPECIFIC ARCHITECTURE & SCALE DEFENSE
        # -------------------------------------------------------------
        if projects and len(projects) > 0:
            for p in projects[:4]:
                p_title = p.title or "Core Platform Project"
                p_tech = p.technologies or "Python, React, PostgreSQL"
                p_desc = p.description or "Distributed software platform"

                if any(k in p_tech.lower() for k in ["redis", "websocket", "chat", "realtime", "live"]):
                    questions.append({
                        "id": q_id,
                        "category": "Project Architecture Defense",
                        "project_name": p_title,
                        "tech_context": p_tech,
                        "question": f"In your '{p_title}', how did you handle WebSocket state synchronization and avoid message drops when client network connections drop and reconnect?",
                        "scenario": f"High connection churn and transient mobile disconnects during peak traffic in {p_title}.",
                        "star_situation": f"While scaling {p_title}, clients in unstable network environments were dropping WebSocket connections and losing real-time state deltas.",
                        "star_action": f"I decoupled connection state using Redis PubSub with persistent Redis Sorted Sets (`ZADD room:msg timestamp payload`). On reconnect, the client passes its `last_read_timestamp`, allowing the backend to stream missed message batches via `ZRANGEBYSCORE` without flooding the primary database.",
                        "star_result": "Eliminated 100% of missed state updates, reduced reconnect handshake latency to < 120ms, and scaled to 10,000+ concurrent active sockets.",
                        "metric_defense": "Defend Redis in-memory lookup O(log N + M) vs querying disk-bound relational tables."
                    })
                    q_id += 1

                elif any(k in p_tech.lower() for k in ["order", "cart", "commerce", "payment", "lock", "checkout"]):
                    questions.append({
                        "id": q_id,
                        "category": "Project Architecture Defense",
                        "project_name": p_title,
                        "tech_context": p_tech,
                        "question": f"In your '{p_title}', how did you prevent race conditions and double-spending when multiple users attempt concurrent transactions on the same resource?",
                        "scenario": "High concurrency checkout traffic causing simultaneous inventory decrement attempts.",
                        "star_situation": f"In {p_title}, concurrent write requests were causing intermittent overselling during peak traffic windows.",
                        "star_action": "I implemented a 2-stage reservation system: First, an Atomic Redis Lua script (`EVAL`) validates and reserves the stock token in sub-1ms. Second, an asynchronous worker executes a PostgreSQL transaction with `SELECT ... FOR UPDATE` row-level locking to commit the order state deterministically.",
                        "star_result": "Zero inventory discrepancies across 50,000+ simulated checkout runs, maintaining P99 transaction response time under 15ms.",
                        "metric_defense": "Explain row-level locking vs table locking and optimistic vs pessimistic concurrency."
                    })
                    q_id += 1

                elif any(k in p_tech.lower() for k in ["ai", "llm", "langgraph", "agent", "vector", "rag"]):
                    questions.append({
                        "id": q_id,
                        "category": "Project Architecture Defense",
                        "project_name": p_title,
                        "tech_context": p_tech,
                        "question": f"In your '{p_title}', how do you manage LLM token limits and prevent infinite loops in multi-agent cyclic graphs?",
                        "scenario": "Autonomous subagents entering cyclic evaluation loops, consuming token budgets and blocking worker threads.",
                        "star_situation": f"In {p_title}, complex prompt refinement tasks occasionally triggered recursive feedback loops between generator and validator agents.",
                        "star_action": "I engineered a LangGraph StateGraph with strict `recursion_limit=15`, dynamic state serialization in SQLite/PostgreSQL, and a cost governor tracking cumulative tokens. If score improvement is < 5% over 2 steps, it gracefully falls back to deterministic rule synthesis.",
                        "star_result": "Guaranteed 100% deterministic termination within 10 seconds and reduced average LLM token cost by 45%.",
                        "metric_defense": "Defend state serialization and checkpointing in state machines."
                    })
                    q_id += 1
                else:
                    questions.append({
                        "id": q_id,
                        "category": "Project Architecture Defense",
                        "project_name": p_title,
                        "tech_context": p_tech,
                        "question": f"In your '{p_title}', what is the single biggest bottleneck in your architecture if traffic increases 10x tomorrow, and how will you resolve it?",
                        "scenario": "Sudden 10x traffic spike on the core application API.",
                        "star_situation": f"Profiling {p_title} under simulated load revealed database connection saturation and CPU spikes on unindexed complex queries.",
                        "star_action": f"I identified that the primary database was handling both read discovery and transactional writes. I implemented PgBouncer connection pooling in transaction mode, split read traffic to 2 read replicas using composite B-Tree indexes, and added a Redis caching layer with a 10-minute TTL for hot discovery queries.",
                        "star_result": "Scaled throughput from 250 RPS to 3,500 RPS while reducing primary DB CPU load from 92% to 22%.",
                        "metric_defense": "Explain read/write splitting and database connection pool sizing formula: `((core_count * 2) + effective_spindle_count)`."
                    })
                    q_id += 1

        # If no projects in database, add standard role-based project questions
        if len(questions) == 0:
            questions.append({
                "id": 1,
                "category": "Project Architecture Defense",
                "project_name": "Full-Stack Distributed Platform",
                "tech_context": "React, FastAPI, PostgreSQL, Redis, Docker",
                "question": "Walk me through the end-to-end architecture of your primary full-stack project. Where does data flow, and how do you handle state consistency?",
                "scenario": "Interviewer asks you to whiteboard your primary project from client UI to database disk.",
                "star_situation": "Building a high-throughput platform requiring real-time updates and strict relational data integrity.",
                "star_action": "I structured the system with Next.js/React on the frontend utilizing optimistic UI mutations, communicating via type-safe REST/WebSocket APIs with a FastAPI asynchronous backend. PostgreSQL handles relational data with foreign key constraints, while Redis serves as a read-through cache and pubsub message bus.",
                "star_result": "Delivered sub-100ms P95 API response times and zero data inconsistencies.",
                "metric_defense": "Detail separation of concerns between presentation, business logic, and persistence layers."
            })
            q_id += 1

        # -------------------------------------------------------------
        # MODULE 2: METRIC & CLAIM VERIFICATION (Resume Cross-Examination)
        # -------------------------------------------------------------
        if "frontend" in role_lower or "react" in role_lower or "ui" in role_lower:
            questions.append({
                "id": q_id,
                "category": "Metric & Claim Verification",
                "project_name": "Frontend Performance",
                "tech_context": "Next.js, React, TypeScript, Core Web Vitals",
                "question": "You claim on your resume that you optimized frontend load time and Core Web Vitals. What exact metrics did you track and how did you improve them?",
                "scenario": "Interviewer tests if you know the exact Core Web Vitals thresholds and profiling tools.",
                "star_situation": "Our client application had a slow Largest Contentful Paint (LCP) of 3.6s and layout shifts causing poor user experience.",
                "star_action": "I profiled the application using Chrome DevTools Performance tab and Lighthouse. I migrated static UI sections to Next.js Server Components, dynamically imported heavy modals with `next/dynamic`, optimized images to WebP with explicit aspect ratios (eliminating CLS), and implemented `@tanstack/react-query` to eliminate duplicate fetch waterfalls.",
                "star_result": "Reduced LCP from 3.6s to 1.1s, reduced JS bundle size by 54%, and improved Lighthouse Performance score from 58 to 97.",
                "metric_defense": "Know exact thresholds: LCP < 2.5s, INP < 200ms, CLS < 0.1."
            })
            q_id += 1
        else:
            questions.append({
                "id": q_id,
                "category": "Metric & Claim Verification",
                "project_name": "Backend & DB Performance",
                "tech_context": "PostgreSQL, SQL Indexing, Redis, Caching",
                "question": "You claim on your resume that you optimized API latency by 40%+. Walk me through your exact profiling steps and the database query plan before and after.",
                "scenario": "Interviewer wants concrete evidence that you didn't just invent performance numbers on your resume.",
                "star_situation": "Our core search endpoint was taking 450ms P95 latency during peak traffic due to sequential table scans.",
                "star_action": "I enabled PostgreSQL `pg_stat_statements` and ran `EXPLAIN (ANALYZE, BUFFERS)` on the slowest queries. I found sequential scans on unindexed foreign keys and missing composite indexes. I created composite B-Tree indexes matching our query WHERE and ORDER BY clauses, and added Redis caching with Write-Through invalidation for stable records.",
                "star_result": "Reduced database query execution time from 280ms to 3.8ms, bringing total endpoint P95 latency from 450ms down to 55ms (87% latency reduction).",
                "metric_defense": "Explain index scan vs sequential scan, and why leading columns in composite indexes matter."
            })
            q_id += 1

        # -------------------------------------------------------------
        # MODULE 3: TECHNOLOGY TRADE-OFF TRAPS ("Why Not X?")
        # -------------------------------------------------------------
        questions.append({
            "id": q_id,
            "category": "Tech Stack Justification",
            "project_name": "Architecture Decisions",
            "tech_context": "Relational vs NoSQL",
            "question": "Why did you choose PostgreSQL over MongoDB/NoSQL for your project data, and in what scenario would PostgreSQL be the wrong choice?",
            "scenario": "Interviewer tests if you blindly follow trends or understand data modeling trade-offs.",
            "star_situation": "We evaluated whether to store our user, application, and workflow state in a document store (MongoDB) or relational database (PostgreSQL).",
            "star_action": "I selected PostgreSQL because our domain model is inherently relational with foreign key constraints, requires strict ACID transaction isolation across multi-table updates (e.g. creating applications and audit logs atomically), and PostgreSQL supports rich JSONB indexing for semi-structured data. I would choose MongoDB if write volume exceeded 100K unjoined document inserts/sec with polymorphic schemas that require no relational joins.",
            "star_result": "Maintained 100% data integrity with zero orphaned records across 100,000+ relational transactions.",
            "metric_defense": "Explain ACID properties vs BASE eventual consistency."
        })
        q_id += 1

        questions.append({
            "id": q_id,
            "category": "Tech Stack Justification",
            "project_name": "API & Protocol Design",
            "tech_context": "REST vs GraphQL vs gRPC",
            "question": "Why did you build REST APIs instead of GraphQL or gRPC in your application?",
            "scenario": "Interviewer asks for protocol selection justification.",
            "star_situation": "Designing the communication layer between client interfaces and backend microservices.",
            "star_action": "I selected REST with OpenAPI specifications for client-facing endpoints because it offers native HTTP-level caching at CDN edges, low client-side overhead, and predictable server query execution plans without the risk of recursive N+1 query attacks common in complex GraphQL setups. For internal microservice communication requiring ultra-low latency, gRPC with Protocol Buffers is our preferred protocol.",
            "star_result": "Achieved 82% edge cache hit ratio on public listing endpoints, offloading significant CPU work from application servers.",
            "metric_defense": "Explain HTTP/2 multiplexing and GraphQL DataLoader batching."
        })
        q_id += 1

        # -------------------------------------------------------------
        # MODULE 4: PRODUCTION WAR STORIES & FAILURE RECOVERY
        # -------------------------------------------------------------
        questions.append({
            "id": q_id,
            "category": "Production War Stories",
            "project_name": "Production Incident Triage",
            "tech_context": "Database Connection Pool & Outage Recovery",
            "question": "Tell me about the most difficult production bug or outage you personally debugged. How did you identify the root cause under pressure?",
            "scenario": "Interviewer assesses troubleshooting methodology, composure under pressure, and post-mortem mindset.",
            "star_situation": "During a high-traffic release, our application started returning 500 Internal Server Errors with 'Too many database connections' error logs.",
            "star_action": "I opened a direct connection to the database server and ran `SELECT count(*), state, query FROM pg_stat_activity GROUP BY state, query;`. I discovered that an asynchronous worker loop was opening database sessions without closing them in error paths, leaking 100 connections in 5 minutes. I immediately terminated idle connections using `pg_terminate_backend()`, added context managers (`try...finally db.close()`) in the codebase, and deployed PgBouncer connection pooling to enforce a strict upper limit.",
            "star_result": "Restored full service availability in 8 minutes and deployed a Prometheus alert for DB connection pool saturation > 80%.",
            "metric_defense": "Demonstrates root-cause analysis, containment, and preventive architectural guardrails."
        })
        q_id += 1

        return {
            "candidate_name": candidate_name,
            "target_role": target_role,
            "experience_years": exp_years,
            "candidate_pool": candidate_pool,
            "total_questions": len(questions),
            "projects_analyzed": [p.title for p in projects] if projects else ["Core Full Stack Platform"],
            "questions": questions
        }

resume_defense_engine = ResumeDefenseEngine()
