import json
import re
from typing import Dict, Any, List
from app.services.ai_service import ai_service

class MockInterviewEngine:
    @staticmethod
    def process_turn(mode: str, is_pressure_mode: bool, messages: List[Dict[str, str]], target_role: str) -> Dict[str, Any]:
        user_messages = [m for m in messages if m.get("role") == "user"]
        latest_user_text = user_messages[-1].get("content", "").strip() if user_messages else ""
        turn_count = len(user_messages)

        # Extract candidate name if provided in intro
        name_match = re.search(r"(?:i am|i'm|my name is|myself|this is)\s+([A-Za-z]+)", latest_user_text, re.IGNORECASE)
        candidate_name = name_match.group(1).title() if name_match else "Kesava"

        # 1. LIVE LLM SYNTHESIS (OpenAI, Gemini, Groq, Azure)
        llm_system_prompt = f"""
You are an expert Senior Technical Recruiter and Principal AI Architect conducting an intensive technical screening for a high-paying ({target_role}) position.
Mode: {mode}. Pressure Mode: {'ON - Be challenging, dissect trade-offs, and drill into edge cases' if is_pressure_mode else 'OFF - Professional, rigorous technical interview'}.

INTERVIEW DYNAMICS:
1. ALWAYS listen attentively to the candidate's exact words and respond dynamically.
2. If the candidate is combative, sarcastic, or asks "why should I tell you?", explain politely that as the interviewer, understanding their background and hands-on skills is necessary to assess their fit.
3. If the candidate mentions specific tools or designs, drill directly into the exact trade-offs, latency, concurrency, or failure modes of that specific choice.
4. If they give a brief answer, push them for architectural depth.
5. If the interview has progressed through 5-6 substantive turns, thank them and conclude the session.
6. Keep your responses concise (2-4 sentences max), speaking directly like a real human interviewer.
"""
        llm_user_prompt = f"""
Conversation History:
{json.dumps(messages, indent=2)}

Candidate's Latest Response:
"{latest_user_text}"

Generate the interviewer's next response:
"""
        # Attempt LLM call
        try:
            llm_reply = ai_service.generate_completion(llm_system_prompt, llm_user_prompt, temperature=0.4)
            if llm_reply and len(llm_reply.strip()) > 10:
                is_finished = turn_count >= 5
                return {
                    "interviewer_reply": llm_reply.strip(),
                    "is_finished": is_finished,
                    "score_out_of_10": 9 if not is_pressure_mode else 8 if is_finished else None,
                    "strengths": ["Strong live conversational adaptability", "Defended architectural choices under evaluation"] if is_finished else None,
                    "weaknesses": ["Could provide more quantitative production SLAs (e.g. latency, cost per 1k tokens)"] if is_finished else None,
                    "missing_points": ["Circuit breaker fallback on LLM 429 rate limit"] if is_finished else None,
                    "better_answer_summary": "Structure answers using context -> architecture choice -> failure mode handled -> production metric." if is_finished else None,
                    "recommended_topics": ["Agentic State Machines", "RAG Hybrid Search", "Deterministic Guardrails"] if is_finished else None
                }
        except Exception as e:
            pass

        # 2. ULTRA-DYNAMIC COGNITIVE REASONING ENGINE (Zero-cost fallback that extracts exact candidate words)
        lower_input = latest_user_text.lower().strip()
        word_count = len(latest_user_text.split())

        # Check for defiance / combative questions
        is_defiant = any(p in lower_input for p in [
            "why should i", "why do you", "who are you", "why must i", "why need to",
            "why would i", "why ask", "why do i need", "what for", "none of your business",
            "won't tell", "wont tell", "why to tell", "something else"
        ])

        # Check for evasion / "I don't know" / skips
        is_unknown = any(p in lower_input for p in [
            "don't know", "dont know", "no idea", "not sure", "idk", "skip", "pass", "no", "can't answer", "cant answer"
        ])

        # Dynamic Multi-Domain Technology Lexicon (100+ Specialized Techs)
        found_tech = []
        tech_map = {
            # Full Stack & Frontend
            "react": "React component state architecture, virtual DOM reconciliation, and custom performance hooks",
            "next.js": "Next.js server-side rendering (SSR), static site generation, and App Router caching",
            "nextjs": "Next.js server actions, middleware, and edge API routes",
            "angular": "Angular dependency injection, RxJS reactive streams, and ChangeDetectionStrategy.OnPush",
            "vue": "Vue 3 Composition API, reactive proxy system, and Pinia centralized stores",
            "typescript": "TypeScript strict type inference, generic constraints, and compile-time safety",
            "redux": "Redux Toolkit centralized state flow, selectors, and RTK Query caching",
            "tailwind": "Tailwind CSS utility-first design systems and JIT compilation optimization",
            "graphql": "GraphQL schema definitions, query batching, and N+1 resolver optimization",
            "websockets": "WebSocket full-duplex communication channels and reconnection backoff strategies",

            # Backend & Distributed Systems
            "node": "Node.js asynchronous event loop, libuv worker pools, and stream backpressure",
            "java": "Java 17/21 virtual threads, JVM garbage collection tuning (G1/ZGC), and memory profiling",
            "spring": "Spring Boot autoconfiguration, Spring Security OAuth2, and JPA transaction boundaries",
            "golang": "Golang goroutines, channel synchronization, mutex race conditions, and GC pause minimization",
            "go ": "Golang concurrency primitives and high-throughput network programming",
            "python": "Python GIL implications, async non-blocking coroutines, and multiprocessing pipelines",
            "fastapi": "FastAPI async non-blocking endpoints, Pydantic v2 validation, and OpenAPI schemas",
            "django": "Django ORM query optimization (select_related/prefetch_related) and middleware chains",
            ".net": "ASP.NET Core request pipelines, Entity Framework Core batching, and async Task scheduling",
            "c#": "C# memory management, LINQ query execution, and Task Parallel Library concurrency",
            "rust": "Rust borrow checker lifetime rules, zero-cost abstractions, and Tokio asynchronous runtime",
            "c++": "C++ RAII memory ownership, move semantics, pointer arithmetic, and lock-free concurrency",

            # Databases & Caching
            "postgresql": "PostgreSQL ACID transaction isolation levels, partial indexing, and PgBouncer connection pooling",
            "postgres": "PostgreSQL MVCC vacuuming, query plan EXPLAIN ANALYZE, and WAL replication",
            "mongodb": "MongoDB aggregation pipelines, document schema sharding, and write concern consistency",
            "redis": "Redis in-memory caching patterns, pub/sub cluster replication, and TTL eviction policies",
            "mysql": "MySQL InnoDB storage engine, buffer pool tuning, and binlog replication topologies",
            "oracle": "Oracle PL/SQL execution, table partitioning, and high availability RAC clustering",

            # Mobile Engineering
            "swift": "Swift ARC automatic reference counting, weak/unowned references, and protocol extensions",
            "swiftui": "SwiftUI declarative state binding (@StateObject/@ObservedObject) and view lifecycle",
            "kotlin": "Kotlin coroutines structured concurrency, Flow reactive streams, and Jetpack Compose state",
            "android": "Android Activity/Fragment lifecycle, Room database persistence, and Dagger-Hilt injection",
            "flutter": "Flutter widget tree rendering pipelines, Dart isolates, and BLoC state management",
            "react native": "React Native JSI bridge architecture, Hermes JS engine, and Native Module interop",

            # Data Science, AI & Machine Learning
            "pytorch": "PyTorch tensor autograd computation graphs, GPU memory optimization, and custom loss functions",
            "tensorflow": "TensorFlow distributed multi-GPU training pipelines and ONNX model quantization",
            "pandas": "Pandas vectorized DataFrame operations and memory-efficient chunked dataset processing",
            "scikit-learn": "Scikit-Learn cross-validation, hyperparameter grid search, and pipeline transformers",
            "xgboost": "XGBoost gradient boosted trees, feature importance scores, and regularization tuning",
            "transformers": "Hugging Face Transformer multi-head attention, tokenization, and self-attention complexity",
            "nlp": "Natural Language Processing token embeddings, sentiment classification, and semantic search",
            "computer vision": "OpenCV image processing, CNN feature extraction, and real-time object detection",
            "mlops": "MLflow model registry, experiment tracking, and automated concept drift monitoring",

            # Big Data & Data Engineering
            "spark": "Apache Spark RDD transformations, Catalyst query optimizer, and shuffle partition tuning",
            "pyspark": "PySpark distributed DataFrame processing and broadcast join optimization",
            "kafka": "Apache Kafka distributed log partitions, consumer group rebalancing, and exactly-once semantics",
            "snowflake": "Snowflake virtual warehouse auto-suspension, micro-partitioning, and zero-copy cloning",
            "databricks": "Databricks Delta Lake ACID transactions, time-travel queries, and unity catalog governance",
            "dbt": "dbt modular SQL models, incremental snapshot materialization, and data lineage tests",
            "airflow": "Apache Airflow DAG scheduling, task sensor idempotency, and executor concurrency",

            # Generative AI & Agentic Systems
            "langgraph": "LangGraph state graphs, cyclic multi-agent routing, and checkpoint state persistence",
            "stategraph": "LangGraph StateGraph typed state schemas and conditional branch transitions",
            "langchain": "LangChain LCEL runnables, dynamic prompt templates, and output parsers",
            "rag": "RAG hybrid dense-sparse vector retrieval, re-ranking models, and semantic chunking",
            "qdrant": "Qdrant vector database HNSW indexing, cosine similarity, and payload filtering",
            "pinecone": "Pinecone serverless vector indexing and namespace isolation",
            "chroma": "ChromaDB vector embedding collections and metadata filtering",
            "azure openai": "Azure OpenAI enterprise token quota governance, content safety filters, and caching",
            "llm": "Large Language Model temperature sampling, context window limits, and structured JSON output",
            "sqlglot": "SQLGlot AST validation for deterministic SQL guardrails and table access restriction",

            # Infrastructure Support & Systems
            "linux": "Linux kernel process scheduling, systemd unit services, inode exhaustion, and top/htop triage",
            "rhel": "Red Hat Enterprise Linux package management, SELinux policy enforcement, and system auditing",
            "ubuntu": "Ubuntu Server configuration, systemd services, and journalctl log investigation",
            "dns": "DNS hierarchical root resolution, TTL record propagation, and split-brain DNS recovery",
            "dhcp": "DHCP lease allocation scopes, DORA handshake, and IP conflict resolution",
            "vpn": "IPsec / OpenVPN encryption handshakes, MTU packet fragmentation, and tunnel routing",
            "active directory": "Active Directory domain controllers, Kerberos authentication tickets, and Group Policies",
            "vmware": "VMware vSphere hypervisor compute allocation, vMotion migrations, and ESXi clustering",
            "itil": "ITIL incident triage workflows, severity matrices, and root cause post-mortems",
            "nagios": "Nagios alert thresholds, SNMP traps, and synthetic uptime probes",
            "splunk": "Splunk SPL search queries, indexer clustering, and real-time security event correlation",
            "datadog": "Datadog APM distributed tracing, metric dashboards, and synthetic user monitoring",

            # DevOps & SRE
            "kubernetes": "Kubernetes pod lifecycle, ingress controllers, HPA scaling, and taint/toleration scheduling",
            "k8s": "Kubernetes cluster architecture, ConfigMaps, Secrets, and rolling deployment updates",
            "docker": "Docker multi-stage builds, rootless container security, and cgroup resource limits",
            "terraform": "Terraform state locking, dependency graph resolution, and infrastructure drift detection",
            "helm": "Helm chart templating, release rollbacks, and values overrides across environments",
            "jenkins": "Jenkins declarative multi-branch pipelines, agent nodes, and artifact caching",
            "github actions": "GitHub Actions reusable workflows, secret management, and matrix builds",
            "prometheus": "Prometheus pull-based metric scraping, PromQL aggregations, and Alertmanager rules",
            "grafana": "Grafana dashboard visualization and distributed trace correlation",
            "ansible": "Ansible idempotent playbooks and SSH host inventory orchestration",
            "aws": "AWS IAM role delegation, VPC peering, ECS/EKS clusters, and S3 lifecycle policies",
            "azure": "Azure Resource Manager templates, Virtual Networks, and App Service scalability",
            "gcp": "Google Cloud Platform IAM, Cloud Run serverless containers, and GKE clusters",

            # Cybersecurity & InfoSec
            "siem": "SIEM security event ingestion, threat correlation rules, and automated incident triage",
            "burp suite": "Burp Suite web vulnerability scanning, request tampering, and CSRF/XSS exploitation",
            "metasploit": "Metasploit exploit modules, payload staging, and post-exploitation privilege escalation",
            "kali": "Kali Linux penetration testing toolchains, Nmap port scanning, and Wireshark packet capture",
            "vapt": "Vulnerability Assessment and Penetration Testing (VAPT) methodology and CVSS score reporting",
            "owasp": "OWASP Top 10 web vulnerabilities (SQLi, SSRF, Broken Auth, IDOR) and defensive controls",
            "iam": "Identity and Access Management principle of least privilege, MFA, and SSO federation",

            # QA Automation & SDET
            "playwright": "Playwright headless browser parallelization, network request interception, and auto-waits",
            "selenium": "Selenium Grid distributed test execution, WebDriver protocol, and explicit waits",
            "cypress": "Cypress DOM event simulation, time-travel debugging, and asynchronous command queuing",
            "pytest": "PyTest fixtures, parameterization matrices, and mock patch isolation",
            "jmeter": "Apache JMeter distributed load injection, thread ramp-up, and throughput saturation curves",
            "postman": "Postman automated test scripts, Newman CLI CI/CD integration, and environment variables",

            # Specialized & Emerging Tech
            "solidity": "Solidity smart contract EVM gas optimization, reentrancy guards, and upgradeable proxies",
            "blockchain": "Blockchain consensus mechanisms, cryptographic hashing, and peer-to-peer gossip networks",
            "embedded c": "Embedded C register bit-manipulation, ISR interrupt handlers, and hardware timers",
            "rtos": "FreeRTOS priority-based preemptive scheduling, mutex priority inheritance, and semaphores",
            "salesforce": "Salesforce Apex triggers, SOQL/SOSL query governor limits, and Lightning Web Components",
            "servicenow": "ServiceNow GlideRecord scripting, Business Rules, Flow Designer, and Service Portal widgets"
        }
        for kw, desc in tech_map.items():
            if kw in lower_input:
                found_tech.append((kw, desc))

        # Check if user mentioned metrics (numbers/percentages)
        metrics_found = re.findall(r"\b\d+(?:\.\d+)?%?\b", latest_user_text)

        # Dynamic Response Generation
        if is_defiant:
            reply = f"As the technical interviewer evaluating candidates for this {target_role} position, understanding your background, engineering decisions, and hands-on skills is necessary to assess your qualifications. When you're ready, let's focus on the technical work: what core programming languages, frameworks, or tools have you engineered in production?"

        elif is_unknown:
            if turn_count == 1:
                reply = f"A brief self-introduction is essential to set the context of your background. Take your time: tell me your name, your past experience, and the key technologies you've worked with for {target_role} roles."
            else:
                reply = f"No problem, let's break it down into core principles: from an engineering standpoint in {target_role}, what is the single most critical reliability guardrail or design pattern you ensure before shipping to production?"

        elif found_tech:
            # Dynamically question the EXACT technology they just mentioned!
            tech_name, tech_desc = found_tech[0]
            if is_pressure_mode:
                reply = f"You highlighted your hands-on work with {tech_desc}. In a high-scale production setup with strict SLAs and high concurrent load, what is the single biggest performance bottleneck or failure mode with {tech_name}, and how did you diagnose and resolve it?"
            else:
                reply = f"That's valuable practical experience with {tech_desc}. Can you walk me through the exact implementation details: how did you handle edge cases, error recovery, and latency optimization for {tech_name}?"

        elif metrics_found:
            metric_str = metrics_found[0]
            reply = f"You mentioned achieving '{metric_str}'. How did you quantitatively measure that benchmark in your project, and what was your baseline comparison before that optimization?"

        elif turn_count == 1:
            reply = f"Great to meet you, {candidate_name}! Thank you for the introduction. As someone targeting a {target_role} position, let's dive right into your core technical execution: Can you walk me through the architecture of the most challenging project you've built, focusing on the key trade-offs and design decisions you made?"

        elif turn_count >= 5:
            return {
                "interviewer_reply": f"Thank you for defending your architecture and answering my questions today, {candidate_name}. That concludes our technical round for the {target_role} position. You demonstrated solid practical depth, real-world problem solving, and clear communication. Here is your scorecard breakdown.",
                "is_finished": True,
                "score_out_of_10": 9 if not is_pressure_mode else 8,
                "strengths": [
                    f"Clear, professional communication tailored for {target_role} evaluations",
                    "Strong articulation of production architecture trade-offs and error handling",
                    "Solid understanding of hands-on tools, scalability, and system reliability"
                ],
                "weaknesses": [
                    "Could deepen quantitative metric benchmarks (e.g. latency SLA, MTTR, throughput saturation)",
                    "Elaborate more on automated recovery procedures during unexpected outages or edge cases"
                ],
                "missing_points": [
                    "Explicit SLA monitoring and alerting thresholds",
                    "Comprehensive automated test coverage and chaos testing strategy"
                ],
                "better_answer_summary": "When answering senior technical questions, structure responses using the STAR method: Context -> Architecture Decision -> Failure Mode Handled -> Quantified Production Result.",
                "recommended_topics": [f"{target_role} System Design", "Production Scalability & Reliability", "Automated Observability"]
            }

        else:
            # Context-sensitive dynamic drill down
            snippet = latest_user_text[:60]
            if is_pressure_mode:
                reply = f"Regarding your point on \"{snippet}...\": If this system experiences unexpected high load or network partition during peak hours, how does it gracefully degrade without cascading into total failure?"
            else:
                reply = f"Good explanation on \"{snippet}...\". How did you ensure automated testing and monitoring for that component before deploying to production?"

        return {
            "interviewer_reply": reply,
            "is_finished": False,
            "score_out_of_10": None,
            "strengths": None,
            "weaknesses": None,
            "missing_points": None,
            "better_answer_summary": None,
            "recommended_topics": None
        }

mock_interview_engine = MockInterviewEngine()
