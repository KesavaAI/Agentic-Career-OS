import re
import json
from typing import Dict, Any, List, Optional

class MercorConversationalEngine:
    """
    Super-Mercor Autonomous AI Conversational Engine.
    Deeply integrates both the Candidate's Resume AND the Target Job Description (JD):
    - Cross-examines candidate's real past projects against the JD's specific requirements.
    - Probes technical gaps, architecture trade-offs, and behavioral ownership.
    - Features Multi-Interviewer Tag-Team Panel (Sarah Jenkins & David Vance).
    """

    @staticmethod
    def extract_highlights(resume_text: str, jd_text: str = "") -> Dict[str, Any]:
        res_clean = (resume_text or "").strip()
        jd_clean = (jd_text or "").strip()

        known_techs = [
            "React", "Node.js", "Python", "FastAPI", "Django", "Flask", "PostgreSQL", "MongoDB",
            "MySQL", "Redis", "Kafka", "Docker", "Kubernetes", "AWS", "GCP", "Azure", "Next.js",
            "TypeScript", "JavaScript", "GraphQL", "Java", "Spring Boot", "Go", "Golang", "C++",
            "SQL", "Pandas", "PyTorch", "TensorFlow", "Spark", "Airflow", "Tailwind", "Elasticsearch"
        ]

        resume_techs = [tech for tech in known_techs if re.search(r"\b" + re.escape(tech) + r"\b", res_clean, re.IGNORECASE)]
        jd_techs = [tech for tech in known_techs if re.search(r"\b" + re.escape(tech) + r"\b", jd_clean, re.IGNORECASE)]

        # Extract project lines from resume
        project_candidates = []
        for line in res_clean.splitlines():
            line_str = line.strip()
            if any(k in line_str.lower() for k in ["project:", "project -", "built", "developed", "architected", "engineered", "system:", "app:"]):
                cleaned = re.sub(r"^(project:?|projects:?|\*|-|•)\s*", "", line_str, flags=re.IGNORECASE).strip()
                if 5 <= len(cleaned) <= 60:
                    project_candidates.append(cleaned)

        if not project_candidates and res_clean:
            first_line = res_clean.splitlines()[0][:50]
            if first_line:
                project_candidates = [first_line]

        return {
            "resume_projects": project_candidates[:3],
            "resume_technologies": resume_techs[:8] if resume_techs else ["React", "Python", "PostgreSQL"],
            "jd_technologies": jd_techs[:8] if jd_techs else (resume_techs[:4] if resume_techs else ["Distributed Systems", "SQL"]),
            "has_jd": len(jd_clean) > 20
        }

    @staticmethod
    def generate_initial_question(
        role: str = "Full Stack / Web Development",
        company: str = "Acme",
        resume_text: str = "",
        jd_text: str = ""
    ) -> Dict[str, Any]:
        highlights = MercorConversationalEngine.extract_highlights(resume_text, jd_text)
        projects = highlights["resume_projects"]
        res_techs = highlights["resume_technologies"]
        jd_techs = highlights["jd_technologies"]

        top_project = projects[0] if projects else "your most recent flagship application"
        target_skills = ", ".join(jd_techs[:3]) if jd_techs else "the core requirements of this role"
        user_skills = ", ".join(res_techs[:3]) if res_techs else "your technical stack"

        if highlights["has_jd"] and projects:
            question = (
                f"Welcome! In our job requirements for {company}, we place strong emphasis on {target_skills}. "
                f"On your resume, I noticed you built '{top_project}' with {user_skills}. "
                f"Walk me through how you architected this system and how the technical decisions you made directly map to the scale and challenges of our role."
            )
        elif projects:
            question = (
                f"Welcome! I reviewed your resume and noticed your project '{top_project}'. "
                f"Walk me through the high-level architecture, the core problem it solved, and the hardest technical decision you personally owned."
            )
        else:
            question = (
                f"Welcome! To kick off our session for the {role} position at {company}, "
                f"walk me through a flagship technical project from your background, the architecture you designed, and the measurable business impact you delivered."
            )

        return {
            "turn_number": 1,
            "interviewer": "sarah",
            "interviewer_name": "Sarah Jenkins",
            "interviewer_title": "VP of Talent & Product",
            "phase": "Resume & JD Alignment Overview",
            "depth_level": "Layer 1: Problem Space & Architecture",
            "question": question,
            "focus_area": "Resume Verification & JD Alignment"
        }

    @staticmethod
    def analyze_mercor_telemetry(answer_text: str) -> Dict[str, Any]:
        text = answer_text.strip()
        words = re.findall(r"\b[a-zA-Z0-9.%$'-]+\b", text)
        word_count = len(words)
        text_lower = text.lower()

        if word_count == 0:
            return {
                "word_count": 0,
                "ownership_score": 0,
                "ownership_label": "No Spoken Speech",
                "depth_level": 1,
                "depth_label": "Surface Level",
                "quantified_metrics_count": 0,
                "compression_rating": "No Speech",
                "physics_anomaly_detected": False,
                "anomaly_details": None
            }

        # 1. Ownership ("I" vs "We")
        i_count = len(re.findall(r"\b(i|my|myself|i've|i'm|i'd)\b", text_lower))
        we_count = len(re.findall(r"\b(we|our|us|team|we've|we're)\b", text_lower))
        total_pronouns = i_count + we_count
        ownership_pct = int((i_count / total_pronouns) * 100) if total_pronouns > 0 else 80
        ownership_label = "Strong Individual Ownership" if ownership_pct >= 65 else "Shared / Team Ownership (Probing Needed)"

        # 2. Technical Depth Indicators
        depth_indicators_layer2 = ["because", "trade-off", "instead of", "chose", "latency", "bottleneck", "postgres", "redis", "kafka", "docker", "caching", "indexing", "sharding", "async", "lock"]
        depth_indicators_layer3 = ["p99", "concurrency", "distributed lock", "circuit breaker", "deadlock", "failover", "backpressure", "partition", "idempotent", "acid", "eventual consistency", "mutex", "raft", "saga"]

        layer2_hits = sum(1 for k in depth_indicators_layer2 if k in text_lower)
        layer3_hits = sum(1 for k in depth_indicators_layer3 if k in text_lower)

        if layer3_hits >= 1 or layer2_hits >= 4:
            depth_level = 3
            depth_label = "Layer 3: Production Scale & Concurrency"
        elif layer2_hits >= 2:
            depth_level = 2
            depth_label = "Layer 2: Technical Trade-Offs"
        else:
            depth_level = 1
            depth_label = "Layer 1: High-Level Overview"

        # 3. Quantified Impact
        metrics_found = re.findall(r"(\d+[%]|\d+\s*(?:ms|sec|hours|users|req|qps|arr|k|m|gb|tb|lpa|\$))", text_lower)
        metric_count = len(metrics_found)

        # 4. Technical Fact-Checking / Math & Physics Radar
        physics_anomaly = False
        anomaly_details = None

        if "cross-region" in text_lower and any(m in text_lower for m in ["1ms", "2ms", "3ms", "4ms", "5ms"]):
            physics_anomaly = True
            anomaly_details = "Cross-region network round-trip time (RTT) physically cannot be <10-20ms due to speed-of-light optical fiber limits."
        elif "100%" in text_lower and "uptime" in text_lower and "single server" in text_lower:
            physics_anomaly = True
            anomaly_details = "100% uptime is architecturally impossible on a single node without failover clustering."

        # 5. Compression
        if word_count < 25:
            compression_rating = "Too Brief (Expand on details)"
        elif word_count <= 140:
            compression_rating = "Optimal (Compressed & Direct)"
        elif word_count <= 220:
            compression_rating = "Good (Slightly Wordy)"
        else:
            compression_rating = "Rambling (Over 200 words)"

        return {
            "word_count": word_count,
            "ownership_score": ownership_pct,
            "ownership_label": ownership_label,
            "depth_level": depth_level,
            "depth_label": depth_label,
            "quantified_metrics_count": metric_count,
            "detected_metrics": metrics_found[:3],
            "compression_rating": compression_rating,
            "physics_anomaly_detected": physics_anomaly,
            "anomaly_details": anomaly_details
        }

    @staticmethod
    def generate_next_turn(
        target_role: str,
        target_company: str,
        history: List[Dict[str, Any]],
        latest_answer: str,
        resume_text: str = "",
        jd_text: str = "",
        turn_number: int = 2
    ) -> Dict[str, Any]:
        telemetry = MercorConversationalEngine.analyze_mercor_telemetry(latest_answer)
        ans_lower = latest_answer.lower()
        highlights = MercorConversationalEngine.extract_highlights(resume_text, jd_text)
        jd_techs = highlights["jd_technologies"]

        if not latest_answer.strip():
            return {
                "turn_number": turn_number,
                "interviewer": "sarah",
                "interviewer_name": "Sarah Jenkins",
                "interviewer_title": "VP of Talent & Product",
                "phase": "Audio Verification",
                "depth_level": "Layer 1",
                "question": "I didn't catch your response. Could you speak directly into the microphone so we can continue?",
                "telemetry": telemetry,
                "coach_note": "Please speak your response clearly into the microphone."
            }

        # Case 1: Physics/Math Radar Triggered
        if telemetry["physics_anomaly_detected"]:
            interviewer = "david"
            name = "David Vance"
            title = "Staff Principal Architect"
            next_q = f"Let me jump in here. {telemetry['anomaly_details']} How did you measure that number, or were you reading from local read-replicas or an edge caching layer?"
            phase = "Architecture Physics & Validation"
            depth = "Layer 3: Metric Verification"

        # Case 2: Ownership Probe (Sarah)
        elif telemetry["ownership_score"] < 50:
            interviewer = "sarah"
            name = "Sarah Jenkins"
            title = "VP of Talent & Product"
            next_q = "You mentioned 'we' built this system. I want to isolate your individual ownership. What exact modules or endpoints did you personally design and write the code for?"
            phase = "Individual Ownership Probe"
            depth = "Layer 2: Individual Contribution"

        # Case 3: JD Requirements Cross-Examination (David)
        elif turn_number == 2:
            interviewer = "david"
            name = "David Vance"
            title = "Staff Principal Architect"
            if jd_techs and len(jd_techs) > 0:
                focus_skill = jd_techs[0]
                next_q = (
                    f"David here. In our job description, {focus_skill} is a core requirement for our infrastructure. "
                    f"In your previous work, how have you implemented {focus_skill}, and how did you handle failure recovery and latency optimization?"
                )
            elif any(k in ans_lower for k in ["redis", "cache", "postgres", "sql", "database", "api", "fastapi"]):
                next_q = "David here. When you introduced caching and database queries, how did you handle cache invalidation and prevent connection pool starvation under peak load?"
            else:
                next_q = "David here. Walk me through the request lifecycle of your service and how you isolate slow downstream dependencies."
            phase = "JD Technical Deep Dive"
            depth = "Layer 2: Trade-Offs & Concurrency"

        # Case 4: Concurrency & 10x Production Stress Test (David)
        elif turn_number == 3:
            interviewer = "david"
            name = "David Vance"
            title = "Staff Principal Architect"
            next_q = f"Let's put this under pressure. Suppose {target_company}'s traffic surges by 10x during a peak event. Where does this system bottleneck first, and how do your circuit breakers and retry buffers prevent cascading failure?"
            phase = "10x Production Stress Test"
            depth = "Layer 3: Concurrency & Resilience"

        # Case 5: Quantified Business ROI & Cross-Functional Impact (Sarah)
        elif turn_number == 4 or telemetry["quantified_metrics_count"] == 0:
            interviewer = "sarah"
            name = "Sarah Jenkins"
            title = "VP of Talent & Product"
            next_q = "Sarah jumping back in. What was the measurable business ROI of this implementation? For example, how much did latency decrease, or how many engineering hours and infrastructure dollars were saved?"
            phase = "Business ROI & Quantified Metrics"
            depth = "Layer 2: Business Impact"

        # Case 6: Production Outage & Post-Mortem RCA (David)
        elif turn_number == 5:
            interviewer = "david"
            name = "David Vance"
            title = "Staff Principal Architect"
            next_q = "Tell me about a high-severity production bug or outage that slipped through testing in this project. How did you isolate the root cause and harden the pipeline against regressions?"
            phase = "Production RCA & Troubleshooting"
            depth = "Layer 3: Resilience & Hardening"

        # Case 7: Behavioral Conflict & Leadership (Sarah)
        else:
            interviewer = "sarah"
            name = "Sarah Jenkins"
            title = "VP of Talent & Product"
            next_q = "Describe a situation where an engineering lead or product manager strongly disagreed with your technical proposal. How did you defend your proposal with data and reach consensus?"
            phase = "Technical Leadership & Conflict"
            depth = "Behavioral & Decision Defense"

        return {
            "turn_number": turn_number,
            "interviewer": interviewer,
            "interviewer_name": name,
            "interviewer_title": title,
            "phase": phase,
            "depth_level": depth,
            "question": next_q,
            "telemetry": telemetry,
            "coach_note": f"Panel Telemetry: {name} asking • {telemetry['ownership_label']} • {telemetry['depth_label']}"
        }

    @staticmethod
    def evaluate_mercor_session(
        role: str,
        company: str,
        turns: List[Dict[str, Any]],
        total_duration_seconds: float = 300.0
    ) -> Dict[str, Any]:
        valid_turns = [t for t in turns if t.get("answer", "").strip()]
        if not valid_turns:
            return {
                "overall_score": 45,
                "rating_tier": "No Spoken Answers Recorded",
                "mercor_pillars": {
                    "ownership_score": 30,
                    "technical_depth_score": 40,
                    "compression_score": 40,
                    "quantified_impact_score": 30
                },
                "panel_scores": {
                    "sarah_behavioral_score": 40,
                    "david_architecture_score": 45
                },
                "strengths": ["Completed panel setup"],
                "warnings": ["⚠ Microphone was silent during session", "⚠ Practice speaking your answers aloud"],
                "turn_breakdowns": [],
                "flywheel_remediation": {
                    "recommended_topic": "Verbal Technical Defense & Quantified STAR Structuring",
                    "category": "Core Interview Mastery"
                }
            }

        all_text = " ".join([t.get("answer", "") for t in valid_turns])
        telemetry = MercorConversationalEngine.analyze_mercor_telemetry(all_text)

        ownership = min(max(telemetry["ownership_score"], 45), 96)
        depth_score = 90 if telemetry["depth_level"] == 3 else (78 if telemetry["depth_level"] == 2 else 64)
        avg_words_per_turn = telemetry["word_count"] / max(len(valid_turns), 1)
        compression_score = 90 if 40 <= avg_words_per_turn <= 140 else 72
        impact_score = min(max(60 + (telemetry["quantified_metrics_count"] * 14), 50), 96)

        sarah_score = int((ownership * 0.50) + (compression_score * 0.30) + (impact_score * 0.20))
        david_score = int((depth_score * 0.60) + (impact_score * 0.25) + (ownership * 0.15))
        overall = int((sarah_score * 0.45) + (david_score * 0.55))

        strengths = []
        if ownership >= 70:
            strengths.append(f"✓ Exceptional Individual Ownership ({ownership}% 'I' phrasing vs 'We')")
        if depth_score >= 80:
            strengths.append("✓ Strong Layer-3 Production Depth (concurrency, distributed locks & trade-offs)")
        if impact_score >= 75:
            strengths.append("✓ Quantified measurable business outcomes (% latency reduction / $ ARR)")
        if not strengths:
            strengths = ["✓ Clear technical communication", "✓ Responded to panel follow-up challenges"]

        warnings = []
        if ownership < 60:
            warnings.append("⚠ High 'We' ratio: Emphasize individual technical contributions over team actions")
        if depth_score < 75:
            warnings.append("⚠ Stayed at high level: Explain trade-offs ('Why technology X over Y?')")
        if impact_score < 70:
            warnings.append("⚠ Missing quantified ROI: Provide exact latency %, QPS, or cost reduction numbers")
        if avg_words_per_turn > 180:
            warnings.append("⚠ Answers slightly verbose: Use compressed STAR framework under 90 seconds")

        weak_topic = "High-Concurrency Concurrency & Caching Invalidation" if depth_score < 80 else "Quantified Business ROI Communication"

        return {
            "session_id": f"panel_{company.lower()}_{int(total_duration_seconds)}",
            "target_role": role,
            "company": company,
            "overall_score": overall,
            "rating_tier": "Top 5% Executive Talent Pool" if overall >= 85 else ("Top 15% Competitive Candidate" if overall >= 74 else "Needs Practice"),
            "mercor_pillars": {
                "ownership_score": ownership,
                "technical_depth_score": depth_score,
                "compression_score": compression_score,
                "quantified_impact_score": impact_score
            },
            "panel_scores": {
                "sarah_behavioral_score": sarah_score,
                "david_architecture_score": david_score
            },
            "strengths": strengths,
            "warnings": warnings,
            "flywheel_remediation": {
                "recommended_topic": weak_topic,
                "category": "High Scale Architecture" if depth_score < 80 else "Executive Communication"
            },
            "turn_breakdowns": [
                {
                    "turn_number": idx,
                    "interviewer": t.get("interviewer", "sarah"),
                    "question": t.get("question", ""),
                    "candidate_answer": t.get("answer", ""),
                    "telemetry": MercorConversationalEngine.analyze_mercor_telemetry(t.get("answer", ""))
                }
                for idx, t in enumerate(valid_turns, start=1)
            ]
        }

mercor_conversational_engine = MercorConversationalEngine()
