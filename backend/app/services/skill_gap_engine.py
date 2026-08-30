import json
from typing import List, Dict, Any
from sqlalchemy.orm import Session

class UniversalSkillGapEngine:
    """
    Dynamically generates deep, production-grade 60-second technical revision flashcards
    and spaced repetition schedules for ANY role and ANY experience level:
    From CS Freshers / College Passed Outs to Senior / Staff / Principal Engineers.
    """

    @staticmethod
    def get_role_flashcards(target_role: str = "Full Stack", candidate_pool: str = "EXPERIENCED", experience_years: float = 2.0) -> List[Dict[str, Any]]:
        r = (target_role or "Full Stack").lower()
        p = (candidate_pool or "EXPERIENCED").upper()
        exp = float(experience_years or 0)
        is_fresher = p == "FRESHER" or exp < 1.5 or any(k in r for k in ["fresher", "intern", "campus", "entry", "graduate", "junior", "trainee"])

        # =========================================================================
        # 1. CS FRESHERS / COLLEGE PASSED OUTS / ENTRY LEVEL (0 - 1.5 YRS)
        # =========================================================================
        if is_fresher:
            return [
                {
                    "id": 1,
                    "skill": "HashMap Internal Mechanics: Hash Collisions, Treeification & Load Factor",
                    "category": "Core CS Fundamentals & DSA",
                    "priority": "Critical",
                    "stage": "RECALL",
                    "status": "YELLOW",
                    "market_demand": "100% of fresher & campus hiring rounds test HashMap internal memory layout.",
                    "mental_models": [
                        "Bucket Index calculation: index = (n - 1) & hash(key) uses bitwise AND with power-of-2 capacity.",
                        "Collision Resolution: Separate Chaining (LinkedList) -> converts to Red-Black Tree when bucket size > 8.",
                        "Resizing & Load Factor: When size > capacity * 0.75, internal array doubles and rehashes all elements."
                    ],
                    "interviewer_trap": "What happens when two keys return identical hash codes? They are placed in the same bucket. HashMap uses .equals() to find the exact key.",
                    "code_anchor": "int index = (capacity - 1) & hash(key.hashCode());",
                    "metric_defense": "Demonstrates O(1) average time complexity vs O(N) worst-case collision degradation."
                },
                {
                    "id": 2,
                    "skill": "SQL Indexing: Clustered vs Non-Clustered B-Trees & ACID Transactions",
                    "category": "Databases & Core CS",
                    "priority": "Critical",
                    "stage": "RECALL",
                    "status": "YELLOW",
                    "market_demand": "98% of fresher interviews test database transaction guarantees.",
                    "mental_models": [
                        "Clustered Index: Physically sorts table rows on disk (only 1 per table, typically Primary Key).",
                        "Non-Clustered Index: Separate B-Tree storing index key + pointer (RowID) to actual table row.",
                        "ACID: Atomicity (all-or-nothing), Consistency (rules), Isolation (concurrency), Durability (WAL logging)."
                    ],
                    "interviewer_trap": "Can a table have multiple Clustered Indexes? No! Data can only be physically sorted in one physical sequence on disk.",
                    "code_anchor": "BEGIN TRANSACTION; UPDATE accounts SET balance = balance - 500 WHERE id = 1; COMMIT;",
                    "metric_defense": "Guarantees zero dirty reads and prevents concurrent account balance overdrafts."
                },
                {
                    "id": 3,
                    "skill": "RESTful API Architecture: HTTP Methods, Status Codes & Statelessness",
                    "category": "Web Development Basics",
                    "priority": "High",
                    "stage": "LEARN",
                    "status": "YELLOW",
                    "market_demand": "95% of software engineer entry tests evaluate REST conventions.",
                    "mental_models": [
                        "Safe & Idempotent methods: GET (safe/idempotent), PUT (idempotent overwrite), DELETE (idempotent), POST (non-idempotent create).",
                        "Accurate Status Codes: 200 OK, 201 Created, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 500 Internal Error.",
                        "Statelessness: Each request must contain all authentication credentials (JWT/Bearer) without server session affinity."
                    ],
                    "interviewer_trap": "Difference between 401 vs 403? 401 = Not Authenticated (who are you?); 403 = Authenticated, but not Authorized to access this resource.",
                    "code_anchor": "app.post('/api/users', (req, res) => res.status(201).json({ id: 1, ...req.body }));",
                    "metric_defense": "Enables horizontal server scaling with zero server-side sticky session state."
                }
            ]

        # =========================================================================
        # 2. JAVA / SPRING BOOT BACKEND TRACK
        # =========================================================================
        if any(k in r for k in ["java", "spring", "enterprise backend", "j2ee"]):
            return [
                {
                    "id": 1,
                    "skill": "Spring Boot 3.x, Virtual Threads (Project Loom) & Concurrency",
                    "category": "Java / Spring Architecture",
                    "priority": "Critical",
                    "stage": "RECALL",
                    "status": "YELLOW",
                    "market_demand": "97% of enterprise Java platforms migrate to Virtual Threads to avoid OS thread exhaustion.",
                    "mental_models": [
                        "Virtual threads decouple Java thread count from carrier OS kernel threads (1 million virtual threads vs 2,000 OS threads).",
                        "Avoid pinning virtual threads: Replace synchronized blocks with ReentrantLock or modernize JDBC drivers.",
                        "Use Spring 6.x Virtual Thread Executor to achieve 50,000 requests/sec per node."
                    ],
                    "interviewer_trap": "What causes Virtual Thread Pinning? When code executes inside a synchronized block or native JNI call, blocking the underlying OS carrier thread.",
                    "code_anchor": "@Bean TomcatProtocolHandlerCustomizer<?> protocolHandlerVirtualThreadExecutorCustomizer() { return p -> p.setExecutor(Executors.newVirtualThreadPerTaskExecutor()); }",
                    "metric_defense": "Increased concurrent request throughput by 420% with zero OutOfMemoryError thread allocation failures."
                },
                {
                    "id": 2,
                    "skill": "Kafka Partitioning, Exactly-Once Semantics (EOS) & Consumer Lag",
                    "category": "Event-Driven Messaging",
                    "priority": "Critical",
                    "stage": "RECALL",
                    "status": "YELLOW",
                    "market_demand": "95% of distributed financial & retail backends require zero-message-loss pipelines.",
                    "mental_models": [
                        "Configure producer with acks=all, enable.idempotence=true, and max.in.flight.requests.per.connection<=5.",
                        "Use transactional messaging across Kafka -> DB: Spring @Transactional with ChainedKafkaTransactionManager.",
                        "Mitigate consumer lag by scaling partition count and separating slow downstream I/O into asynchronous worker pools."
                    ],
                    "interviewer_trap": "Does acks=all guarantee zero data loss? Only if min.insync.replicas >= 2 and replication.factor >= 3.",
                    "code_anchor": "producerProps.put(ProducerConfig.ENABLE_IDEMPOTENCE_CONFIG, 'true');",
                    "metric_defense": "Processed 120 million daily events with 0 duplicate billing events and <5ms consumer lag."
                }
            ]

        # =========================================================================
        # 3. GENERATIVE AI / AGENTIC AI / LLM TRACK
        # =========================================================================
        elif any(k in r for k in ["genai", "agent", "llm", "ai engineer", "prompt", "nlp", "rag"]):
            return [
                {
                    "id": 1,
                    "skill": "LangGraph StateGraph, Conditional Routing & Cyclic Recovery Loops",
                    "category": "Agentic AI Architecture",
                    "priority": "Critical",
                    "stage": "RECALL",
                    "status": "YELLOW",
                    "market_demand": "96% of enterprise GenAI roles demand cyclic multi-agent orchestration.",
                    "mental_models": [
                        "Model multi-agent workflows as state graphs where nodes mutate shared state TypedDict.",
                        "Use conditional edges to inspect output and route between execution, reflection, and human-in-the-loop validation.",
                        "Set recursion_limit=15 to strictly prevent infinite LLM execution cost loops."
                    ],
                    "interviewer_trap": "What happens if LLM output fails schema validation? The router sends it to a Reflection node that provides validation errors back for self-correction.",
                    "code_anchor": "workflow.add_conditional_edges('evaluator', should_retry, {'retry': 'generator', 'end': END})",
                    "metric_defense": "Achieved 99.4% task completion rate with 0 unhandled cyclic recursion cost overflows."
                },
                {
                    "id": 2,
                    "skill": "Hybrid Search (BM25 + Vector Embeddings) & Reciprocal Rank Fusion",
                    "category": "Advanced RAG Retrieval",
                    "priority": "Critical",
                    "stage": "RECALL",
                    "status": "YELLOW",
                    "market_demand": "94% of production RAG pipelines fail when relying solely on vector cosine similarity.",
                    "mental_models": [
                        "Combine sparse lexical search (BM25 for exact SKU codes/IDs) with dense semantic search (Vector cosine).",
                        "Merge ranked lists using Reciprocal Rank Fusion: RRF_score = 1 / (60 + rank_i).",
                        "Apply cross-encoder Re-Ranking (Cohere / BGE-Reranker) on top 20 chunks before feeding context to LLM."
                    ],
                    "interviewer_trap": "Why does pure vector search fail on technical manuals? Vectors miss exact alphanumeric IDs (e.g. Error code #40182). Hybrid BM25 catches them.",
                    "code_anchor": "rrf_score = sum(1.0 / (60 + rank) for rank in ranks)",
                    "metric_defense": "Increased retrieval context precision from 64% to 94.2% on Ragas evaluation benchmarks."
                }
            ]

        # =========================================================================
        # 4. DEVOPS / SRE / CLOUD / PLATFORM TRACK
        # =========================================================================
        elif any(k in r for k in ["devops", "sre", "reliability", "platform", "cloud", "infra", "kubernetes"]):
            return [
                {
                    "id": 1,
                    "skill": "Kubernetes Horizontal Pod Autoscaling (HPA), PDB & Zero-Downtime Rolling Updates",
                    "category": "Cloud & Container Orchestration",
                    "priority": "Critical",
                    "stage": "RECALL",
                    "status": "YELLOW",
                    "market_demand": "98% of cloud architectures rely on resilient Kubernetes orchestration.",
                    "mental_models": [
                        "Configure Pod Disruption Budgets (minAvailable: 1) to prevent cluster drains from killing single replica services.",
                        "Implement custom metrics HPA (e.g. SQS queue length / Prometheus request rate) rather than pure CPU/Memory.",
                        "Use preStop lifecycle hooks (sleep 10s) and readiness probes to drain in-flight traffic before SIGTERM kill."
                    ],
                    "interviewer_trap": "Why do pods drop connections during rolling updates? If a pod terminates immediately, ingress routers still send traffic for 2-5s while iptables sync. preStop hook solves this.",
                    "code_anchor": "lifecycle: { preStop: { exec: { command: ['/bin/sh', '-c', 'sleep 10'] } } }",
                    "metric_defense": "Maintained 99.995% SLA during daily automated rolling cluster upgrades."
                },
                {
                    "id": 2,
                    "skill": "Terraform State Locking with DynamoDB & CI Drift Detection",
                    "category": "Infrastructure as Code (IaC)",
                    "priority": "High",
                    "stage": "LEARN",
                    "status": "YELLOW",
                    "market_demand": "92% of enterprise cloud setups demand collaborative IaC governance.",
                    "mental_models": [
                        "Store state in remote S3 bucket with versioning and AES-256 server-side encryption.",
                        "Use DynamoDB LockID table to enforce mutex locking, preventing concurrent team terraform apply race conditions.",
                        "Schedule daily CI drift detection runs to alert when manual console changes bypass code."
                    ],
                    "interviewer_trap": "What happens if a Terraform process crashes while holding the lock? Run terraform force-unlock <lock-id> only after verifying no other CI pipeline is executing.",
                    "code_anchor": "backend 's3' { bucket = 'corp-tf-state'; dynamodb_table = 'terraform-locks'; }",
                    "metric_defense": "Eliminated 100% of infrastructure state corruption incidents across 40 engineers."
                }
            ]

        # =========================================================================
        # 5. DATA SCIENCE / MACHINE LEARNING TRACK
        # =========================================================================
        elif any(k in r for k in ["data science", "data scientist", "machine learning", "ml", "computer vision", "analytics"]):
            return [
                {
                    "id": 1,
                    "skill": "Feature Drift Detection (PSI / KS-Test) & Production Model Monitoring",
                    "category": "MLOps & Statistical Modeling",
                    "priority": "Critical",
                    "stage": "RECALL",
                    "status": "YELLOW",
                    "market_demand": "95% of ML production failures stem from unmonitored feature distribution drift.",
                    "mental_models": [
                        "Compute Population Stability Index (PSI): PSI < 0.1 = stable; PSI > 0.2 = significant drift requiring retraining.",
                        "Use Kolmogorov-Smirnov (KS-Test) on continuous numerical feature distributions against training baseline.",
                        "Implement automated retraining pipelines triggered via Airflow when drift thresholds breach."
                    ],
                    "interviewer_trap": "Data Drift vs Concept Drift? Data drift = input distributions P(X) change; Concept drift = relationship between features and target P(Y|X) changes.",
                    "code_anchor": "psi = np.sum((actual_pct - expected_pct) * np.log(actual_pct / expected_pct))",
                    "metric_defense": "Detected real-time credit scoring drift within 2 hours, preventing $2.4M in bad loan approvals."
                },
                {
                    "id": 2,
                    "skill": "L1 vs L2 Regularization, Multicollinearity & VIF Diagnostics",
                    "category": "Statistical Machine Learning",
                    "priority": "High",
                    "stage": "LEARN",
                    "status": "YELLOW",
                    "market_demand": "90% of technical interviews test mathematical intuition behind regularization.",
                    "mental_models": [
                        "L1 (Lasso) adds absolute penalty (|w|), driving non-essential feature weights to exact zero (feature selection).",
                        "L2 (Ridge) adds squared penalty (w^2), shrinking weights smoothly, handling correlated multicollinear features without zeroing.",
                        "Diagnose multicollinearity using Variance Inflation Factor (VIF > 5 indicates high multicollinearity)."
                    ],
                    "interviewer_trap": "When choose ElasticNet over pure Lasso? When features are highly correlated; Lasso arbitrarily picks one, ElasticNet groups them gracefully.",
                    "code_anchor": "loss = mse + l1_ratio * l1_penalty + (1 - l1_ratio) * l2_penalty",
                    "metric_defense": "Improved cross-validated AUC-ROC from 0.78 to 0.89 while reducing active features from 250 to 38."
                }
            ]

        # =========================================================================
        # 6. QA / SDET / AUTOMATION TRACK
        # =========================================================================
        elif any(k in r for k in ["qa", "sdet", "test", "automation", "quality"]):
            return [
                {
                    "id": 1,
                    "skill": "Resilient Playwright Automation Framework & Flaky Test Elimination",
                    "category": "Test Automation & SDET",
                    "priority": "Critical",
                    "stage": "RECALL",
                    "status": "YELLOW",
                    "market_demand": "96% of modern QA teams transition from Selenium to Playwright.",
                    "mental_models": [
                        "Use auto-waiting locators and web-first assertions (expect(locator).toBeVisible()) instead of hardcoded Thread.sleep().",
                        "Isolate test state using BrowserContext storageState fixtures, bypassing repetitive UI login workflows.",
                        "Run parallel workers with automatic video/trace recording on failure for instant root-cause triage."
                    ],
                    "interviewer_trap": "How do you eliminate flaky UI tests? Avoid XPath selectors that depend on DOM structure. Use accessibility locators (getByRole, getByTestId, getByLabel).",
                    "code_anchor": "await expect(page.getByRole('button', { name: 'Submit' })).toBeEnabled({ timeout: 5000 });",
                    "metric_defense": "Reduced end-to-end regression suite execution from 45 minutes to 4.5 minutes with 0% flaky false alarms."
                }
            ]

        # =========================================================================
        # 7. CYBERSECURITY / APPSEC TRACK
        # =========================================================================
        elif any(k in r for k in ["security", "cyber", "appsec", "infosec"]):
            return [
                {
                    "id": 1,
                    "skill": "OAuth 2.0 PKCE, OpenID Connect (OIDC) & JWT Token Revocation",
                    "category": "Application Security",
                    "priority": "Critical",
                    "stage": "RECALL",
                    "status": "YELLOW",
                    "market_demand": "98% of modern auth platforms require PKCE authorization code flows.",
                    "mental_models": [
                        "Use Authorization Code Flow with PKCE to prevent authorization code interception on SPAs and mobile apps.",
                        "Issue short-lived Access Tokens (15 mins) stored in memory / HttpOnly SameSite cookies.",
                        "Implement Redis Token Blacklist with TTL or Distributed Bloom Filter for immediate token revocation on logout."
                    ],
                    "interviewer_trap": "Why is storing JWTs in localStorage vulnerable? Any XSS vulnerability can access and exfiltrate localStorage tokens. HttpOnly cookies prevent script access.",
                    "code_anchor": "code_verifier = generate_random_bytes(32); code_challenge = base64_url_encode(sha256(code_verifier))",
                    "metric_defense": "Zero unauthorized token hijacking incidents across 5 million active user sessions."
                }
            ]

        # =========================================================================
        # 8. DEFAULT / FULL STACK & WEB ARCHITECTURE (Universal Default)
        # =========================================================================
        return [
            {
                "id": 1,
                "skill": "Next.js 15 SSR, Streaming & Hydration Performance",
                "category": "Full Stack Architecture",
                "priority": "Critical",
                "stage": "RECALL",
                "status": "YELLOW",
                "market_demand": "96% of modern web teams require SSR & Core Web Vitals optimization.",
                "mental_models": [
                    "Differentiate Server Components (zero client JS) vs Client Components ('use client' boundary).",
                    "Streaming with Suspense chunks HTML delivery so TTFB decreases from 800ms to <150ms.",
                    "Prevent hydration mismatches by ensuring identical server/client rendered DOM trees."
                ],
                "interviewer_trap": "Interactive UI with useState, useEffect, or browser event listeners must be Client Components.",
                "code_anchor": "export default async function Page() { return <Suspense fallback={<Skeleton />}><SlowDataFeed /></Suspense>; }",
                "metric_defense": "Reduced LCP from 3.8s to 1.1s and eliminated 400KB client bundle JS."
            },
            {
                "id": 2,
                "skill": "PostgreSQL EXPLAIN ANALYZE, B-Trees & PgBouncer Connection Pools",
                "category": "Database & Query Optimization",
                "priority": "Critical",
                "stage": "RECALL",
                "status": "YELLOW",
                "market_demand": "98% of backend systems bottleneck at database connection saturation.",
                "mental_models": [
                    "Run EXPLAIN (ANALYZE, BUFFERS) to verify if queries do Index Scan vs expensive Sequential Scan.",
                    "Create composite B-Tree indexes matching leftmost prefix rule (e.g. user_id, created_at).",
                    "Use PgBouncer transaction pooling to support 10,000 clients with only 100 actual Postgres connections."
                ],
                "interviewer_trap": "Excessive indexes slow down writes by 300%. Only index high-cardinality filter/join columns.",
                "code_anchor": "CREATE INDEX idx_orders_user_created ON orders (user_id, created_at DESC);",
                "metric_defense": "Reduced P99 query latency from 850ms to 12ms under 20,000 req/sec peak."
            },
            {
                "id": 3,
                "skill": "Redis Cache Invalidation & Distributed Locks (SETNX / Redlock)",
                "category": "Caching & Concurrency",
                "priority": "High",
                "stage": "LEARN",
                "status": "YELLOW",
                "market_demand": "92% of scalable architectures require distributed lock concurrency.",
                "mental_models": [
                    "Use Cache-Aside pattern: Read from Redis -> on miss read DB -> populate Redis with TTL.",
                    "Prevent Cache Stampede / Thundering Herd using probabilistic early expiration (XFetch) or distributed mutex.",
                    "Acquire locks with atomic SET resource_key token NX PX 10000; release only via Lua script verifying token."
                ],
                "interviewer_trap": "Do not use simple DEL key to release lock; verify token with Lua script to prevent deleting another process's lock.",
                "code_anchor": "if redis.call('get', KEYS[1]) == ARGV[1] then return redis.call('del', KEYS[1]) else return 0 end",
                "metric_defense": "Eliminated race-condition inventory overselling with zero lock starvation."
            }
        ]

    @staticmethod
    def sync_user_learning_topics(db: Session, user_id: int, target_role: str, candidate_pool: str = "EXPERIENCED", experience_years: float = 2.0):
        from app.models.learning import LearningTopic
        cards = UniversalSkillGapEngine.get_role_flashcards(target_role, candidate_pool, experience_years)
        
        # Clear existing topics for this user and re-seed with role-specific topics
        db.query(LearningTopic).filter(LearningTopic.user_id == user_id).delete()
        for idx, card in enumerate(cards, start=1):
            structured_notes = {
                "market_demand": card["market_demand"],
                "mental_models": card["mental_models"],
                "interviewer_trap": card["interviewer_trap"],
                "code_anchor": card["code_anchor"],
                "metric_defense": card["metric_defense"]
            }
            topic = LearningTopic(
                user_id=user_id,
                skill=card["skill"],
                category=card["category"],
                market_demand="High Priority",
                market_demand_pct=95 - (idx * 2),
                my_level="Intermediate",
                gap_level="Advanced Production",
                priority=card["priority"],
                stage=card["stage"],
                status=card["status"],
                recall_schedule_day=1 if card["stage"] == "LEARN" else (3 if card["stage"] == "RECALL" else 7),
                notes=json.dumps(structured_notes),
                is_demo=False
            )
            db.add(topic)
        db.commit()

skill_gap_engine = UniversalSkillGapEngine()
