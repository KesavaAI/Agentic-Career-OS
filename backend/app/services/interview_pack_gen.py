import json
from typing import List, Dict, Any, Optional
from app.services.role_intelligence_engine import role_intelligence_engine

class InterviewPackGenerator:
    """
    Universal Multi-Domain Interview Preparation Pack Generator.
    Dynamically synthesizes technical defense questions, expected architectural concepts,
    candidate talking points, and ideal answers across all 30 IT Career Families.
    """

    @staticmethod
    def generate_pack(job_dict: Dict[str, Any], profile_dict: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        company = job_dict.get("company_name", "Enterprise Tech")
        role = job_dict.get("role", "Software Engineer")
        
        # Use Universal Role Intelligence to normalize job title & domain
        norm = role_intelligence_engine.normalize_title(role)
        family_key = norm["career_family_key"]
        role_name = norm["normalized_role"]
        specialization = norm["specialization"]
        seniority = norm["seniority"]
        
        cand_name = (profile_dict.get("full_name") if profile_dict else None) or "Candidate"
        cand_role = (profile_dict.get("target_role") if profile_dict else None) or role_name

        # 1. FULL STACK & WEB DEVELOPMENT
        if family_key == "SOFTWARE_DEVELOPMENT" or "full stack" in role.lower() or "frontend" in role.lower() or "backend" in role.lower():
            return [
                {
                    "question": f"How do you architect state synchronization and optimize SSR caching in high-scale Next.js/React applications?",
                    "category": "Frontend & Web Architecture",
                    "expected_concepts": "Next.js App Router caching layers (Request Memoization, Data Cache, Full Route Cache), React Server Components (RSC), optimistic UI updates, hydration boundaries.",
                    "candidate_answer": "In production web applications, I leverage React Server Components to stream rendered markup, isolate client-side state in Zustand/Redux, and configure granular revalidation tags for Next.js data caches to achieve sub-second LCP.",
                    "ideal_answer": "1) Separate server-only data fetching into React Server Components to reduce client JS bundle size; 2) Configure ISR with Next.js tags (`revalidateTag`) for deterministic cache invalidation; 3) Use optimistic updates with rollback handlers for instant user feedback; 4) Monitor Core Web Vitals (INP, LCP, CLS) using automated synthetic telemetry.",
                    "confidence": "High",
                    "status": "MASTERED"
                },
                {
                    "question": "How do you mitigate the N+1 query problem and maintain database connection pool health under high concurrency?",
                    "category": "Backend Systems & Database",
                    "expected_concepts": "DataLoader query batching, ORM eager loading (select_related / prefetch_related), PgBouncer connection pooling, read replicas, slow query EXPLAIN ANALYZE.",
                    "candidate_answer": "I profile SQL execution plans using EXPLAIN ANALYZE, enforce DataLoader batching for GraphQL/REST endpoints to consolidate queries, and place PgBouncer in transaction mode in front of PostgreSQL.",
                    "ideal_answer": "1) In GraphQL or REST entity resolvers, implement DataLoader to batch and deduplicate database lookups into a single `WHERE id IN (...)` query; 2) Enforce composite indexing on high-cardinality foreign keys; 3) Deploy PgBouncer in transaction-pooling mode to prevent connection starvation during sudden traffic spikes; 4) Route read-heavy analytical queries to read replicas.",
                    "confidence": "High",
                    "status": "PRACTICED"
                },
                {
                    "question": "How do you structure microservices communication to ensure idempotency and prevent distributed transaction failures?",
                    "category": "Distributed Systems Design",
                    "expected_concepts": "Idempotency keys, Outbox pattern, Saga pattern (orchestration vs choreography), dead-letter queues (DLQ), distributed tracing.",
                    "candidate_answer": "I enforce unique idempotency keys on payment and mutation endpoints, use the Transactional Outbox pattern with Kafka/RabbitMQ to guarantee at-least-once message delivery, and handle cross-service rollbacks with Sagas.",
                    "ideal_answer": "Implement the Transactional Outbox pattern by atomically writing business events to an outbox table within the local database transaction. A change-data-capture (CDC) relay publishes messages to Kafka. Consumers store processed `Idempotency-Key` UUIDs in Redis with TTLs to discard duplicate retries, while cross-boundary transactions utilize compensating Saga workflows for clean rollbacks.",
                    "confidence": "High",
                    "status": "MASTERED"
                },
                {
                    "question": "How do you optimize the Node.js event loop and avoid thread pool starvation during CPU-intensive tasks?",
                    "category": "Runtime Performance",
                    "expected_concepts": "Libuv event loop phases, worker_threads, stream backpressure, cluster module, non-blocking I/O.",
                    "candidate_answer": "I ensure all I/O is non-blocking, offload heavy cryptographic or data manipulation tasks to worker threads, and handle large file transfers via piped streams with backpressure control.",
                    "ideal_answer": "Node.js runs single-threaded JavaScript on the Libuv event loop. Any CPU-bound work (e.g. image transformations, heavy JSON serialization) must be offloaded to Node.js `worker_threads` or dedicated microservices. I/O streams must respect `drain` events for backpressure, and multiple worker processes are spawned via Node.js Cluster or PM2 to utilize multi-core host compute.",
                    "confidence": "Medium",
                    "status": "RECALLED"
                },
                {
                    "question": f"Why are you interested in joining {company} as a {role_name}?",
                    "category": "Behavioral / Company Fit",
                    "expected_concepts": "Domain enthusiasm, proven engineering track record, passion for high-scale systems, collaborative culture alignment.",
                    "candidate_answer": f"I admire {company}'s engineering rigor and high-velocity product delivery. With my hands-on experience architecting full-stack web platforms and low-latency microservices, I am excited to contribute immediate technical leadership and scale core user experiences.",
                    "ideal_answer": f"Over my career as a {role_name}, I have specialized in building robust, performant web applications and scalable backend systems. {company}'s commitment to engineering excellence aligns perfectly with my background in full-stack architecture, distributed data systems, and modern developer workflows.",
                    "confidence": "High",
                    "status": "MASTERED"
                }
            ]

        # 2. AI / GENERATIVE AI & AGENTIC SYSTEMS
        elif family_key == "GENAI_AGENTIC" or "agent" in role.lower() or "llm" in role.lower() or "genai" in role.lower():
            return [
                {
                    "question": f"How do you architect stateful multi-agent orchestration using LangGraph with deterministic execution guardrails?",
                    "category": "Agentic AI & Architecture",
                    "expected_concepts": "LangGraph StateGraph, cyclic node execution, deterministic tool invocation, AST validation, error recovery, human-in-the-loop checkpoints.",
                    "candidate_answer": "I design LangGraph StateGraphs where incoming queries are parsed into intent, mapped to schema, validated through an AST layer, executed deterministically against databases, and evaluated for hallucination before returning results.",
                    "ideal_answer": "Architected a stateful multi-agent system using LangGraph with explicit StateTyped schemas. Incoming user intent is routed to specialized nodes (Schema Resolver, SQL/Code Planner, AST Validator, Execution Sandbox, and Synthesizer). We implemented cyclic feedback loops with retry limits to self-heal malformed queries while guaranteeing 100% deterministic execution via strict AST parsing.",
                    "confidence": "High",
                    "status": "MASTERED"
                },
                {
                    "question": "How do you prevent infinite loops and runaway tool calling in autonomous agents?",
                    "category": "Agentic AI System Design",
                    "expected_concepts": "Recursion limit, step counter, state checksums, structured tool call verification, timeout middleware, circuit breakers.",
                    "candidate_answer": "Set max_iterations on agent runners, track visited state hashes in state memory, enforce strict schema validation on tool outputs, and implement timeout middleware.",
                    "ideal_answer": "1) Configure hard recursion limits (e.g. max 10 steps); 2) Maintain a state history set of (tool_name, argument_hash) to detect cyclical duplicates; 3) Use schema constrained outputs (Pydantic / OpenAI Structured Outputs) to eliminate formatting retry loops; 4) Add circuit breaker policies when 3 consecutive tool failures occur.",
                    "confidence": "High",
                    "status": "PRACTICED"
                },
                {
                    "question": "How do you optimize retrieval in hybrid RAG using vector databases and dense-sparse fusion?",
                    "category": "RAG & Vector Search",
                    "expected_concepts": "Hybrid search (BM25 + Dense vector), Reciprocal Rank Fusion (RRF), semantic reranking, chunking strategy (parent-child / semantic chunking).",
                    "candidate_answer": "Combine BM25 keyword search with dense vector embeddings via OpenAI / Hugging Face models, scored with RRF and refined with a Cross-Encoder semantic reranker.",
                    "ideal_answer": "Implement Hybrid Retrieval combining BM25 keyword matching with dense vector cosine similarity using Reciprocal Rank Fusion (RRF). Apply semantic chunking with metadata filtering (e.g. document domain, recency) and pass top candidates to a Cross-Encoder reranker to extract top high-relevance chunks, reducing context window noise.",
                    "confidence": "High",
                    "status": "MASTERED"
                },
                {
                    "question": "Explain async concurrency in FastAPI and how you prevent event loop blocking when calling LLMs.",
                    "category": "Python & Backend Engineering",
                    "expected_concepts": "async/await, httpx.AsyncClient, asyncio.to_thread / run_in_executor for CPU-bound tasks, non-blocking I/O.",
                    "candidate_answer": "Use async def endpoints with httpx.AsyncClient or async OpenAI client so I/O waits release the event loop, and offload heavy parsing/CPU tasks to asyncio.to_thread.",
                    "ideal_answer": "FastAPI runs on Starlette/Uvicorn with a single asyncio event loop per worker. LLM API calls are I/O bound, so using asynchronous HTTP clients (AsyncOpenAI, httpx.AsyncClient) allows thousands of concurrent requests to yield execution while awaiting socket responses. Any synchronous CPU-bound operations are delegated to thread pools via asyncio.to_thread to avoid starving the event loop.",
                    "confidence": "Medium",
                    "status": "RECALLED"
                },
                {
                    "question": f"Why are you looking to contribute at {company} as an AI Engineer?",
                    "category": "Behavioral / HR",
                    "expected_concepts": "Passion for production AI, proven impact on enterprise agentic platforms, readiness for high-velocity engineering.",
                    "candidate_answer": f"I am passionate about building production-grade autonomous systems. I am excited by {company}'s focus on cutting-edge AI where my hands-on agentic architecture skills, Python mastery, and cloud expertise will immediately drive significant value.",
                    "ideal_answer": f"I specialized deeply in GenAI and multi-agent engineering, designing production-grade RAG and LangGraph systems. I am excited about {company}'s technical trajectory where my skills in agentic pipelines, vector search, and API performance will accelerate mission-critical AI initiatives.",
                    "confidence": "High",
                    "status": "MASTERED"
                }
            ]

        # 3. DEVOPS, SRE & CLOUD PLATFORM
        elif family_key in ["DEVOPS_PLATFORM", "CLOUD_ENGINEERING", "SITE_RELIABILITY_OPS"] or "devops" in role.lower() or "sre" in role.lower():
            return [
                {
                    "question": "How do you diagnose and remediate OOMKilled pods and CrashLoopBackOff states in Kubernetes production clusters?",
                    "category": "Container Orchestration & Kubernetes",
                    "expected_concepts": "cgroup memory limits vs requests, dmesg / kernel OOM killer logs, heap memory profiling, resource quotas, Horizontal Pod Autoscaling (HPA).",
                    "candidate_answer": "I inspect pod events via `kubectl describe pod`, review container exit codes (137 for OOM), analyze memory trends in Prometheus, and right-size memory limits while fixing application memory leaks.",
                    "ideal_answer": "1) Run `kubectl describe pod` to verify exit code 137 (SIGKILL by kernel OOM); 2) Inspect Prometheus Grafana memory saturation curves to determine whether it was a sudden spike or gradual memory leak; 3) Review Java/Node runtime heap dumps; 4) Adjust `resources.requests` and `resources.limits` with appropriate buffer margins; 5) Configure Horizontal Pod Autoscaler (HPA) using custom Prometheus metrics.",
                    "confidence": "High",
                    "status": "MASTERED"
                },
                {
                    "question": "How do you ensure zero-downtime deployments and manage state locking with Terraform in multi-engineer teams?",
                    "category": "Infrastructure as Code (IaC)",
                    "expected_concepts": "S3 remote backend with DynamoDB state locking, Terraform workspace isolation, drift detection in CI/CD, blue/green and canary deployments.",
                    "candidate_answer": "I store Terraform state in encrypted cloud storage with distributed DynamoDB locking, run automated `terraform plan` checks on pull requests, and enforce blue/green canary rollout strategies.",
                    "ideal_answer": "Configure an Amazon S3 remote state backend paired with DynamoDB state locking to prevent concurrent state corruption. Automate pipeline execution via GitHub Actions / Atlantis with strict plan approval gates. In Kubernetes, implement ArgoCD / Flagger for automated Canary analysis with automatic rollbacks triggered if HTTP 5xx error rates exceed 0.5% during traffic shifting.",
                    "confidence": "High",
                    "status": "MASTERED"
                },
                {
                    "question": "How do you define and enforce SLIs, SLOs, and Error Budgets for high-availability distributed systems?",
                    "category": "Site Reliability Engineering (SRE)",
                    "expected_concepts": "Service Level Indicators (availability & latency), 99.99% SLO calculation, Error budget burn rate alerts, chaos engineering.",
                    "candidate_answer": "I establish SLIs based on success rates and P99 latency percentiles, calculate 99.99% monthly error budgets, and set multi-window burn rate alerts in Prometheus Alertmanager.",
                    "ideal_answer": "Define user-centric SLIs: Availability (% of requests returning 2xx/3xx within 200ms) and Latency (P99 < 150ms). Set achievable SLOs (e.g. 99.95% over 30 rolling days). If error budget burn rates spike (e.g. consuming 14.4x budget in 1 hour), PagerDuty alerts fire immediately and feature freeze policies automatically take effect until reliability is restored.",
                    "confidence": "High",
                    "status": "PRACTICED"
                },
                {
                    "question": "How do you secure CI/CD pipelines and prevent credential leakage in automated build workflows?",
                    "category": "DevSecOps & Pipeline Security",
                    "expected_concepts": "OIDC token federation (no hardcoded credentials), secret scanning, container image vulnerability scanning (Trivy/Snyk), signed container images (Cosign).",
                    "candidate_answer": "I use OpenID Connect (OIDC) to assume short-lived IAM roles in CI/CD, run Trivy vulnerability scanners on container images, and sign build artifacts with Cosign.",
                    "ideal_answer": "Eliminate static long-lived cloud credentials by leveraging OpenID Connect (OIDC) federation between GitHub Actions and AWS/Azure. Implement automated pre-commit secret scanning (TruffleHog), scan Docker images for CVEs using Trivy in pipeline gates, enforce non-root container runtimes, and verify image integrity with Cosign signature validation.",
                    "confidence": "High",
                    "status": "MASTERED"
                },
                {
                    "question": f"Why are you looking to drive infrastructure excellence at {company}?",
                    "category": "Behavioral / Team Alignment",
                    "expected_concepts": "Reliability mindset, automation-first philosophy, blameless post-mortem culture, enthusiasm for {company}'s scale.",
                    "candidate_answer": f"I believe reliability and automated infrastructure are foundational to business agility. I am eager to bring my deep background in Kubernetes, Terraform, and observability to {company} to build bulletproof cloud platforms.",
                    "ideal_answer": f"Throughout my DevOps and SRE career, I have focused on eliminating toil, automating self-healing infrastructure, and fostering blameless post-mortem cultures. {company}'s scale presents exciting platform challenges where my automation-first mindset will drive 99.99% uptime and accelerated deployment velocity.",
                    "confidence": "High",
                    "status": "MASTERED"
                }
            ]

        # 4. INFRASTRUCTURE SUPPORT & IT OPERATIONS
        elif family_key == "IT_INFRASTRUCTURE_SUPPORT" or "support" in role.lower() or "sysadmin" in role.lower() or "infrastruct" in role.lower():
            return [
                {
                    "question": "How do you troubleshoot Linux server performance anomalies when load average is high but CPU utilization is low?",
                    "category": "Linux Systems Administration",
                    "expected_concepts": "Uninterruptible sleep (D state), disk I/O wait (wa in top), NFS / SAN mount latency, zombie processes, `iostat -xz 1`, `vmstat 1`.",
                    "candidate_answer": "I inspect `top` for high I/O wait percentage (%wa), examine process states with `ps aux` to locate processes stuck in D state waiting for disk/network I/O, and use `iostat` and `iotop` to pinpoint the offending storage bottleneck.",
                    "ideal_answer": "High Linux load average with low CPU indicates processes stuck in Uninterruptible Sleep (D state) waiting for I/O operations. 1) Run `vmstat 1` and `iostat -xz 1` to check disk saturation (%util) and service times; 2) Check for stalled NFS/SAN mounts or failing disks using `dmesg -T`; 3) Identify offending processes using `iotop -o` or `pidstat -d 1`; 4) Remediate the storage contention or restart the hung daemon cleanly.",
                    "confidence": "High",
                    "status": "MASTERED"
                },
                {
                    "question": "How do you diagnose and resolve split-brain DNS resolution failures and TTL caching issues in hybrid cloud networks?",
                    "category": "Networking & DNS Diagnostics",
                    "expected_concepts": "DNS hierarchy, authoritative vs recursive resolvers, BIND / Route 53 forwarding rules, split-view DNS, TTL propagation, `dig +trace`, packet captures with tcpdump.",
                    "candidate_answer": "I trace the DNS lookup path using `dig +trace`, verify local resolver cache vs authoritative DNS records, inspect Route 53 conditional forwarding rules across VPCs, and test UDP port 53 connectivity.",
                    "ideal_answer": "1) Execute `dig @resolver domain.com +trace +all` to pinpoint where the resolution breaks down; 2) Check if internal VPC resolvers are failing to forward non-authoritative queries to public forwarders; 3) Verify TTL record expiration on client resolvers using `nscd` / `systemd-resolved`; 4) Audit VPN/DirectConnect MTU sizes if large DNS response packets are being silently dropped by firewalls.",
                    "confidence": "High",
                    "status": "MASTERED"
                },
                {
                    "question": "How do you structure ITIL Major Incident Management (Sev-1) triage, root cause analysis, and post-mortems?",
                    "category": "IT Operations & ITIL Governance",
                    "expected_concepts": "Severity classification matrices, incident commander bridge, stakeholder communication SLAs, 5-Whys root cause analysis, blameless post-mortem documentation.",
                    "candidate_answer": "I establish an immediate bridge as Incident Commander, notify executive stakeholders within SLA windows, coordinate resolution streams, and run a blameless 5-Whys post-mortem with preventative action items.",
                    "ideal_answer": "1) Immediate triage: declare Sev-1, initiate war-room bridge, assign scribe and technical lead; 2) Enforce communication cadence (status updates every 15-30 min to business stakeholders); 3) Focus on service restoration before deep root cause investigation (e.g. rollback, failover); 4) Conduct a blameless post-mortem within 48 hours utilizing 5-Whys analysis to establish corrective Jira actions preventing recurrence.",
                    "confidence": "High",
                    "status": "MASTERED"
                },
                {
                    "question": "How do you diagnose VPN tunnel drops and IPsec MTU packet fragmentation across enterprise firewalls?",
                    "category": "Enterprise Network Troubleshooting",
                    "expected_concepts": "IPsec Phase 1/2 negotiation (IKE SA), Maximum Transmission Unit (MTU), Maximum Segment Size (MSS) clamping, ICMP Type 3 Code 4 (fragmentation needed).",
                    "candidate_answer": "I verify Phase 1 and Phase 2 security associations on the firewall, test connectivity with ping using the Don't Fragment flag (`ping -M do -s 1472`), and enable MSS clamping to resolve packet loss.",
                    "ideal_answer": "IPsec overhead adds headers that reduce available MTU. When packets exceed MTU and DF (Don't Fragment) bit is set, firewalls drop packets if ICMP Type 3 Code 4 is blocked. I run packet captures with `tcpdump`, test exact maximum packet size with `ping -f -l 1460`, and configure TCP MSS Clamping to 1360 on gateway interfaces to eliminate tunnel packet drops.",
                    "confidence": "Medium",
                    "status": "PRACTICED"
                },
                {
                    "question": f"Why are you excited to contribute as a Support / Systems Specialist at {company}?",
                    "category": "Behavioral & Service Delivery",
                    "expected_concepts": "Customer-first mindset, rapid diagnostic instincts, passion for high uptime, structured IT operations.",
                    "candidate_answer": f"I take pride in resolving complex infrastructure incidents and delivering 99.9% uptime. I look forward to bringing my deep troubleshooting methodology and ITIL operations background to support {company}'s enterprise scale.",
                    "ideal_answer": f"My engineering approach centers on rapid triage, proactive monitoring, and systematic post-incident hardening. I am eager to join {company} to ensure infrastructure resilience, streamline automated operations, and guarantee flawless SLA execution.",
                    "confidence": "High",
                    "status": "MASTERED"
                }
            ]

        # 5. DATA SCIENCE & MACHINE LEARNING
        elif family_key == "ML_DATA_SCIENCE" or "data scientist" in role.lower() or "machine learning" in role.lower():
            return [
                {
                    "question": "How do you detect and mitigate feature distribution shift and concept drift in production ML models?",
                    "category": "MLOps & Model Governance",
                    "expected_concepts": "Covariate shift vs concept drift, Kolmogorov-Smirnov (KS) tests, Population Stability Index (PSI), Evidently AI / MLflow monitoring, retraining triggers.",
                    "candidate_answer": "I compute baseline statistical distributions on training data and continuously monitor live inference features using KS tests and Population Stability Index (PSI). When PSI exceeds 0.2, automated retraining pipelines are triggered.",
                    "ideal_answer": "1) Track feature drift by comparing inference distribution batches against baseline training data using Population Stability Index (PSI) and Wasserstein Distance; 2) Monitor prediction drift and ground-truth concept drift; 3) Set automated alert thresholds in Evidently AI / Prometheus; 4) Trigger automated validation and shadow deployment in MLflow before promoting newly retrained models to production.",
                    "confidence": "High",
                    "status": "MASTERED"
                },
                {
                    "question": "How do you optimize PyTorch model training across multi-GPU setups and avoid GPU memory fragmentation?",
                    "category": "Deep Learning & PyTorch Optimization",
                    "expected_concepts": "DistributedDataParallel (DDP), mixed-precision training (torch.cuda.amp), gradient accumulation, gradient checkpointing, PyTorch profiler.",
                    "candidate_answer": "I use PyTorch DistributedDataParallel (DDP) rather than DataParallel, enable FP16 automatic mixed precision (`torch.cuda.amp`), and use gradient checkpointing to reduce peak VRAM consumption.",
                    "ideal_answer": "1) Utilize `torch.nn.parallel.DistributedDataParallel` to spawn independent processes per GPU and reduce GIL contention; 2) Enable Automatic Mixed Precision (AMP) with `GradScaler` to cut memory usage by 50% and accelerate tensor cores; 3) Apply gradient accumulation to simulate large batch sizes without OOM; 4) Use `torch.cuda.empty_cache()` and PyTorch memory snapshot profiler to diagnose tensor memory fragmentation.",
                    "confidence": "High",
                    "status": "MASTERED"
                },
                {
                    "question": "How do you handle class imbalance in high-stakes classification and avoid overfitting?",
                    "category": "Applied ML & Modeling",
                    "expected_concepts": "Focal Loss, SMOTE / under-sampling, stratified k-fold cross-validation, PR-AUC vs ROC-AUC, threshold optimization.",
                    "candidate_answer": "I evaluate models using Precision-Recall AUC (PR-AUC) rather than accuracy, implement Focal Loss to penalize hard misclassified examples, and tune decision thresholds based on business cost matrices.",
                    "ideal_answer": "In severe class imbalance (e.g. 1% positive class), standard Cross-Entropy loss causes the model to favor the majority. I implement Focal Loss with dynamic alpha-weighting, use Stratified K-Fold to maintain class proportions, evaluate using PR-AUC and F-beta scores, and perform cost-benefit threshold calibration to optimize the precision-recall trade-off.",
                    "confidence": "High",
                    "status": "MASTERED"
                },
                {
                    "question": "Explain Transformer self-attention complexity and techniques used to scale attention to long context windows.",
                    "category": "Transformer Architectures & NLP",
                    "expected_concepts": "O(N^2) quadratic attention complexity, FlashAttention (SRAM memory tiling), RoPE positional embeddings, sliding window attention.",
                    "candidate_answer": "Standard self-attention has quadratic O(N^2) time and memory complexity with respect to sequence length. FlashAttention optimizes this by computing attention in SRAM tiles to avoid high-bandwidth memory (HBM) bottlenecks.",
                    "ideal_answer": "Standard multi-head attention computes $QK^T$ which requires $O(N^2)$ memory storage for sequence length $N$. FlashAttention-2 reorganizes the computation using GPU SRAM tiling and online softmax scaling to avoid reading/writing the intermediate $N \\times N$ matrix to GPU HBM, achieving 2-4x speedups. For extreme lengths, techniques like Rotary Position Embeddings (RoPE) scaling and FlashAttention allow context windows of 128k+ tokens.",
                    "confidence": "Medium",
                    "status": "PRACTICED"
                },
                {
                    "question": f"Why are you excited to lead Data Science initiatives at {company}?",
                    "category": "Behavioral / Impact",
                    "expected_concepts": "Data-driven experimentation, translating ML metrics to business KPIs, cross-functional engineering collaboration.",
                    "candidate_answer": f"I focus on delivering ML models that create measurable business ROI. {company}'s rich data ecosystem provides the ideal environment to build high-impact predictive systems.",
                    "ideal_answer": f"Throughout my Data Science career, my focus has been bridging the gap between state-of-the-art mathematical models and real-world production value. I am excited to join {company} to formulate algorithms that optimize critical operational metrics and accelerate revenue growth.",
                    "confidence": "High",
                    "status": "MASTERED"
                }
            ]

        # 6. UNIVERSAL DYNAMIC FALLBACK (FOR ANY OF THE 30 CAREER FAMILIES)
        else:
            core_skills_str = ", ".join(norm["core_skills"][:4])
            return [
                {
                    "question": f"How do you architect end-to-end reliability and maintainability as a {role_name} utilizing {core_skills_str}?",
                    "category": f"{norm['career_family']} Architecture",
                    "expected_concepts": f"System modularity, error boundaries, production telemetry, performance benchmarking, industry best practices in {core_skills_str}.",
                    "candidate_answer": f"I design modular, testable architectures adhering to domain best practices in {core_skills_str}, ensuring high availability, defensive error handling, and end-to-end monitoring.",
                    "ideal_answer": f"1) Establish decoupled component architectures with explicit interfaces; 2) Enforce automated testing and continuous validation with {core_skills_str}; 3) Instrument deep observability and audit logging to proactively capture anomalies; 4) Document system trade-offs to ensure long-term engineering maintainability.",
                    "confidence": "High",
                    "status": "MASTERED"
                },
                {
                    "question": f"What is the single most critical performance bottleneck or failure mode in {specialization}, and how do you diagnose and resolve it?",
                    "category": "Root Cause Analysis & Resilience",
                    "expected_concepts": "Diagnostic telemetry, profiling tools, bottleneck mitigation, automated recovery guardrails.",
                    "candidate_answer": f"I isolate the bottleneck using deep profiling tools and metric dashboards, establish baseline benchmarks, and implement targeted architectural refactoring.",
                    "ideal_answer": f"I employ a systematic 4-step diagnostic protocol: 1) Measure latency and resource saturation under load; 2) Isolate the exact constraint (compute, I/O, network, or algorithmic complexity); 3) Apply targeted optimizations (caching, batching, asynchronous execution); 4) Re-verify performance against quantitative baseline metrics.",
                    "confidence": "High",
                    "status": "PRACTICED"
                },
                {
                    "question": f"How do you ensure data integrity, security compliance, and disaster recovery in {role_name} projects?",
                    "category": "Security & Governance",
                    "expected_concepts": "Principle of least privilege, data validation at ingress, backup and recovery SLAs, audit trail integrity.",
                    "candidate_answer": "I enforce least-privilege access control, validate all inputs against strict schemas, and test disaster recovery procedures against defined RTO and RPO targets.",
                    "ideal_answer": "Implement defense-in-depth security: encrypt data in transit and at rest, enforce strict role-based access control (RBAC), validate all inputs at domain boundaries, and maintain automated backup verification to guarantee zero data loss during failover scenarios.",
                    "confidence": "High",
                    "status": "MASTERED"
                },
                {
                    "question": f"How do you manage technical debt and balance high velocity with code quality in fast-moving engineering environments?",
                    "category": "Engineering Leadership & Best Practices",
                    "expected_concepts": "Refactoring cadences, automated CI/CD quality gates, architectural decision records (ADRs), developer documentation.",
                    "candidate_answer": "I allocate dedicated sprint capacity for technical debt remediation, enforce automated linting and test coverage in CI/CD, and document architectural decisions via ADRs.",
                    "ideal_answer": "Balance delivery speed by reserving 15-20% of engineering bandwidth for refactoring and debt reduction. Enforce automated PR quality gates (unit/integration test suites, static analysis), and document all major technical trade-offs using Architectural Decision Records (ADRs) to align cross-functional teams.",
                    "confidence": "Medium",
                    "status": "RECALLED"
                },
                {
                    "question": f"Why are you looking to join {company} as a {role_name}?",
                    "category": "Behavioral & Culture Alignment",
                    "expected_concepts": f"Career growth, passion for {specialization}, proven engineering impact, alignment with {company}'s mission.",
                    "candidate_answer": f"I have built deep expertise as a {role_name} and am excited to bring my technical background and problem-solving skills to accelerate {company}'s engineering objectives.",
                    "ideal_answer": f"Throughout my career as a {role_name}, I have focused on solving complex technical challenges in {specialization}. {company}'s engineering culture and high-impact products represent the perfect environment for me to contribute leadership, drive technical excellence, and scale core initiatives.",
                    "confidence": "High",
                    "status": "MASTERED"
                }
            ]

interview_pack_gen = InterviewPackGenerator()

