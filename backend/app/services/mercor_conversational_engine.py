import re
import json
from typing import Dict, Any, List, Optional

class MercorConversationalEngine:
    """
    Next-Gen Super-Mercor Autonomous AI Conversational Engine.
    Engineered for Agentic Career OS with:
    1. Multi-Interviewer Tag-Team Panel:
       - Sarah Jenkins (VP Talent & Product): Probes behavioral ownership, business ROI, and communication.
       - David Vance (Staff Principal Architect): Probes system design, concurrency, database locks, and P99 latency.
    2. Real-Time Technical Fact-Checking & Math/Physics Radar.
    3. Dual-Modal Evaluation (Spoken Voice + Live Whiteboard/Code Canvas).
    4. Closed-Loop Career Flywheel Auto-Remediation.
    """

    @staticmethod
    def generate_initial_question(role: str = "Full Stack Engineer", company: str = "Acme", profile: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        r = (role or "Full Stack").lower()
        projects = profile.get("projects", []) if profile else []

        if projects and len(projects) > 0:
            top_proj = projects[0].get("title", "your flagship project")
            question = f"Welcome! On your profile, I noticed '{top_proj}'. To start us off, walk me through the high-level architecture, the business problem it solved, and your specific individual role."
        elif "data" in r or "analyst" in r:
            question = f"Welcome to the session! Walk me through the most critical data pipeline or analytical architecture you designed. What was the business context, and what core technical decisions did you own?"
        elif "backend" in r or "full stack" in r or "software" in r:
            question = f"Welcome! Tell me about the most complex backend or full-stack application you built end-to-end. Walk me through the architecture and the most difficult design trade-off you had to navigate."
        elif "ml" in r or "ai" in r:
            question = f"Welcome! Walk me through an end-to-end ML or generative AI system you shipped to production. How did you structure the pipeline and handle latency, data drift, and evaluation metrics?"
        else:
            question = f"Welcome! Tell me about a flagship technical project you owned end-to-end. What was the goal, and what was your specific individual contribution?"

        return {
            "turn_number": 1,
            "interviewer": "sarah",
            "interviewer_name": "Sarah Jenkins",
            "interviewer_title": "VP of Talent & Product",
            "phase": "Project Overview & Business Stakes",
            "depth_level": "Layer 1: Problem Space & Architecture",
            "question": question,
            "focus_area": "System Architecture & Individual Ownership",
            "requires_whiteboard": False
        }

    @staticmethod
    def analyze_mercor_telemetry(answer_text: str, whiteboard_code: str = "") -> Dict[str, Any]:
        text = answer_text.strip()
        words = re.findall(r"\b[a-zA-Z0-9.%$'-]+\b", text)
        word_count = len(words)
        text_lower = text.lower()

        if word_count == 0 and not whiteboard_code.strip():
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

        if layer3_hits >= 1 or layer2_hits >= 4 or (whiteboard_code and len(whiteboard_code) > 60):
            depth_level = 3
            depth_label = "Layer 3: Production Scale & Concurrency"
        elif layer2_hits >= 2 or (whiteboard_code and len(whiteboard_code) > 20):
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
        if word_count < 25 and not whiteboard_code:
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
        whiteboard_code: str,
        turn_number: int
    ) -> Dict[str, Any]:
        telemetry = MercorConversationalEngine.analyze_mercor_telemetry(latest_answer, whiteboard_code)
        ans_lower = latest_answer.lower()

        if not latest_answer.strip() and not whiteboard_code.strip():
            return {
                "turn_number": turn_number,
                "interviewer": "sarah",
                "interviewer_name": "Sarah Jenkins",
                "interviewer_title": "VP of Talent & Product",
                "phase": "Audio Verification",
                "depth_level": "Layer 1",
                "question": "I didn't catch your response. Could you speak directly into the microphone or sketch your solution in the whiteboard area?",
                "telemetry": telemetry,
                "requires_whiteboard": False,
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
            requires_wb = False

        # Case 2: Ownership Probe (Sarah)
        elif telemetry["ownership_score"] < 50:
            interviewer = "sarah"
            name = "Sarah Jenkins"
            title = "VP of Talent & Product"
            next_q = "You mentioned 'we' built this system. I want to isolate your individual ownership. What exact modules or endpoints did you personally design and write the code for?"
            phase = "Individual Ownership Probe"
            depth = "Layer 2: Individual Contribution"
            requires_wb = False

        # Case 3: Technical Deep Dive & Whiteboard Challenge (David)
        elif turn_number == 2 or any(k in ans_lower for k in ["redis", "cache", "postgres", "sql", "database", "api", "fastapi"]):
            interviewer = "david"
            name = "David Vance"
            title = "Staff Principal Architect"
            if "redis" in ans_lower or "cache" in ans_lower:
                next_q = "David here. When you introduced caching, how did you handle cache invalidation and cache stampedes? Can you sketch or write your lock/invalidation logic in the whiteboard editor?"
            else:
                next_q = "David here. Walk me through your database indexing and query optimization strategy. If traffic increases 10x, how do you prevent connection pool starvation?"
            phase = "Technical Architecture Deep Dive"
            depth = "Layer 2: Trade-Offs & Concurrency"
            requires_wb = True

        # Case 4: Concurrency & 10x Production Stress Test (David)
        elif turn_number == 3:
            interviewer = "david"
            name = "David Vance"
            title = "Staff Principal Architect"
            next_q = f"Let's put this under pressure. Suppose {target_company}'s traffic surges by 10x during a flash sale. Where does this system bottleneck first, and how do your circuit breakers and retry buffers prevent cascading failure?"
            phase = "10x Production Stress Test"
            depth = "Layer 3: Concurrency & Resilience"
            requires_wb = True

        # Case 5: Quantified Business ROI & Cross-Functional Impact (Sarah)
        elif turn_number == 4 or telemetry["quantified_metrics_count"] == 0:
            interviewer = "sarah"
            name = "Sarah Jenkins"
            title = "VP of Talent & Product"
            next_q = "Sarah jumping back in. What was the measurable business ROI of this implementation? For example, how much did latency decrease, or how many engineering hours and infrastructure dollars were saved?"
            phase = "Business ROI & Quantified Metrics"
            depth = "Layer 2: Business Impact"
            requires_wb = False

        # Case 6: Production Outage & Post-Mortem RCA (David)
        elif turn_number == 5:
            interviewer = "david"
            name = "David Vance"
            title = "Staff Principal Architect"
            next_q = "Tell me about a high-severity production bug or outage that slipped through testing in this project. How did you isolate the root cause and harden the pipeline against regressions?"
            phase = "Production RCA & Troubleshooting"
            depth = "Layer 3: Resilience & Hardening"
            requires_wb = False

        # Case 7: Behavioral Conflict & Leadership (Sarah)
        else:
            interviewer = "sarah"
            name = "Sarah Jenkins"
            title = "VP of Talent & Product"
            next_q = "Describe a situation where an engineering lead or product manager strongly disagreed with your technical proposal. How did you defend your proposal with data and reach consensus?"
            phase = "Technical Leadership & Conflict"
            depth = "Behavioral & Decision Defense"
            requires_wb = False

        return {
            "turn_number": turn_number,
            "interviewer": interviewer,
            "interviewer_name": name,
            "interviewer_title": title,
            "phase": phase,
            "depth_level": depth,
            "question": next_q,
            "telemetry": telemetry,
            "requires_whiteboard": requires_wb,
            "coach_note": f"Panel Telemetry: {name} asking • {telemetry['ownership_label']} • {telemetry['depth_label']}"
        }

    @staticmethod
    def evaluate_mercor_session(
        role: str,
        company: str,
        turns: List[Dict[str, Any]],
        total_duration_seconds: float = 300.0
    ) -> Dict[str, Any]:
        valid_turns = [t for t in turns if t.get("answer", "").strip() or t.get("whiteboard_code", "").strip()]
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
        all_code = " ".join([t.get("whiteboard_code", "") for t in valid_turns])
        telemetry = MercorConversationalEngine.analyze_mercor_telemetry(all_text, all_code)

        # 1. Ownership Score
        ownership = min(max(telemetry["ownership_score"], 45), 96)

        # 2. Depth Score
        depth_score = 90 if telemetry["depth_level"] == 3 else (78 if telemetry["depth_level"] == 2 else 64)

        # 3. Compression Score
        avg_words_per_turn = telemetry["word_count"] / max(len(valid_turns), 1)
        compression_score = 90 if 40 <= avg_words_per_turn <= 140 else 72

        # 4. Quantified Impact
        impact_score = min(max(60 + (telemetry["quantified_metrics_count"] * 14), 50), 96)

        # Panel Split Scores
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
        if all_code.strip():
            strengths.append("✓ Effectively utilized dual-modal whiteboard for architectural schema defense")
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
                    "whiteboard_code": t.get("whiteboard_code", ""),
                    "telemetry": MercorConversationalEngine.analyze_mercor_telemetry(t.get("answer", ""), t.get("whiteboard_code", ""))
                }
                for idx, t in enumerate(valid_turns, start=1)
            ]
        }

mercor_conversational_engine = MercorConversationalEngine()
