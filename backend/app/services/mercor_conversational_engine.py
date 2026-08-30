import re
import json
from typing import Dict, Any, List, Optional

class MercorConversationalEngine:
    """
    Mercor-Style Autonomous AI Conversational Interview Engine.
    Features:
    1. Dynamic Follow-Up Generation (3 Layers Deep) based on candidate's real spoken words.
    2. Bullshit & Surface-Level Detection (Probes 'I' vs 'We', trade-offs, failure modes).
    3. 4-Pillar Mercor Rubric Scoring:
       - Individual Ownership (I vs We)
       - Technical Depth (3 Layers Deep)
       - Communication Compression (Fluff-free, <90s)
       - Quantified Business Impact (%, ms, $)
    """

    @staticmethod
    def generate_initial_question(role: str = "Full Stack Engineer", company: str = "Acme", profile: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Generates opening project question grounded in user's profile and target role.
        """
        r = (role or "Full Stack").lower()
        projects = profile.get("projects", []) if profile else []
        exp = profile.get("experiences", []) if profile else []

        if projects and len(projects) > 0:
            top_proj = projects[0].get("title", "your flagship project")
            question = f"On your profile, you highlighted '{top_proj}'. Walk me through the core architecture, the technical trade-offs you made, and your individual contribution."
        elif "data" in r or "analyst" in r:
            question = f"Walk me through the most complex data pipeline or analytics architecture you built. What was the business problem, and what specific technical stack did you choose?"
        elif "backend" in r or "full stack" in r or "software" in r:
            question = f"Tell me about the most technically challenging backend or full-stack system you designed. Walk me through the architecture and the hardest technical decision you owned end-to-end."
        elif "ml" in r or "ai" in r:
            question = f"Walk me through an end-to-end ML/AI system you deployed to production. How did you handle latency, data drift, and evaluation metrics?"
        else:
            question = f"Tell me about a challenging technical project you owned end-to-end. What went wrong, and what was your specific individual contribution?"

        return {
            "turn_number": 1,
            "phase": "Project Deep Dive",
            "depth_level": "Layer 1: Architecture Overview",
            "question": question,
            "focus_area": "System Architecture & Problem Context"
        }

    @staticmethod
    def analyze_mercor_telemetry(answer_text: str) -> Dict[str, Any]:
        """
        Calculates live Mercor rubric telemetry on the candidate's spoken response.
        """
        text = answer_text.strip()
        words = re.findall(r"\b[a-zA-Z0-9.%$'-]+\b", text)
        word_count = len(words)
        text_lower = text.lower()

        if word_count == 0:
            return {
                "word_count": 0,
                "ownership_score": 0,
                "ownership_label": "No Speech",
                "depth_level": 1,
                "depth_label": "Surface Level",
                "quantified_metrics_count": 0,
                "compression_rating": "No Speech"
            }

        # 1. Ownership ("I" vs "We")
        i_count = len(re.findall(r"\b(i|my|myself|i've|i'm|i'd)\b", text_lower))
        we_count = len(re.findall(r"\b(we|our|us|team|we've|we're)\b", text_lower))
        total_pronouns = i_count + we_count
        if total_pronouns > 0:
            ownership_pct = int((i_count / total_pronouns) * 100)
        else:
            ownership_pct = 75

        ownership_label = "Strong Individual Ownership" if ownership_pct >= 65 else "Shared / Team Ownership (Probing Needed)"

        # 2. Technical Depth Indicators
        depth_indicators_layer2 = ["because", "trade-off", "instead of", "chose", "latency", "bottleneck", "postgres", "redis", "kafka", "docker", "caching", "indexing", "cluster", "sharding", "async"]
        depth_indicators_layer3 = ["p99", "concurrency", "distributed lock", "circuit breaker", "deadlock", "failover", "backpressure", "partition", "idempotent", "acid", "eventual consistency"]

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
        metrics_found = re.findall(r"(\d+[%]|\d+\s*(?:ms|sec|hours|users|req|qps|arr|k|m|gb|tb|lpa))", text_lower)
        metric_count = len(metrics_found)

        # 4. Compression (Conciseness)
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
            "compression_rating": compression_rating
        }

    @staticmethod
    def generate_next_turn(
        target_role: str,
        target_company: str,
        history: List[Dict[str, Any]],
        latest_answer: str,
        turn_number: int
    ) -> Dict[str, Any]:
        """
        Dynamically generates the next Mercor adaptive question based on what the candidate just said.
        """
        telemetry = MercorConversationalEngine.analyze_mercor_telemetry(latest_answer)
        ans_lower = latest_answer.lower()
        
        # Turn progression logic
        if not latest_answer.strip():
            return {
                "turn_number": turn_number,
                "phase": "Repeat / Prompting",
                "depth_level": "Layer 1",
                "question": "I didn't catch that. Could you walk me through your technical approach and how you structured the solution?",
                "telemetry": telemetry,
                "coach_note": "Please speak your response clearly into the microphone."
            }

        # Case 1: Probing 'I' vs 'We' if candidate spoke mostly in 'We'
        if telemetry["ownership_score"] < 50:
            next_q = "You mentioned 'we' built this system. Can you isolate your specific individual code contributions? What exact modules or endpoints did you personally design and implement?"
            phase = "Individual Ownership Probe"
            depth = "Layer 2: Individual Accountability"

        # Case 2: Probing Database / Caching / Redis / SQL if mentioned
        elif any(k in ans_lower for k in ["redis", "cache", "caching", "postgres", "sql", "database", "mongodb", "query"]):
            if "redis" in ans_lower or "cache" in ans_lower:
                next_q = "You mentioned using caching. How did you handle cache invalidation and potential cache stampedes under sudden traffic spikes?"
            else:
                next_q = "How did you design your database indexing strategy for this workload, and how did you prevent slow query degradation as row count scaled?"
            phase = "Data & Caching Trade-Offs"
            depth = "Layer 2: Architectural Trade-Offs"

        # Case 3: Probing Concurrency / Scale / Distributed systems
        elif any(k in ans_lower for k in ["api", "service", "pipeline", "backend", "fastapi", "node", "server", "microservice"]):
            next_q = "If downstream services experience sudden latency spikes or complete outages, how does your system isolate the failure and prevent cascading crashes?"
            phase = "Resilience & Fault Tolerance"
            depth = "Layer 3: Production Failure Modes"

        # Case 4: Escalation to Stress Test / 10x Scale
        elif turn_number == 3 or turn_number == 4:
            next_q = f"Let's assume {target_company}'s traffic surges by 10x next week. Where is the first bottleneck in this architecture going to occur (CPU, DB connections, network I/O), and how would you refactor it?"
            phase = "10x Production Stress Test"
            depth = "Layer 3: High Scale Concurrency"

        # Case 5: Quantified Business Outcome Probe
        elif telemetry["quantified_metrics_count"] == 0:
            next_q = "What was the final measurable business impact of this project? For example, how much did latency decrease, or how many engineering hours/costs were saved?"
            phase = "Business ROI & Metrics"
            depth = "Layer 2: Impact Verification"

        # Case 6: Behavioral / Conflict Under Pressure
        elif turn_number >= 5:
            next_q = "Tell me about a situation during this project where a teammate or lead strongly disagreed with your architectural proposal. How did you defend your stance with data?"
            phase = "Technical Conflict & Leadership"
            depth = "Behavioral & Decision Defense"

        else:
            next_q = "Walk me through what broke when you first deployed this to staging or production. How did you diagnose and patch the root cause?"
            phase = "Debugging & Production RCA"
            depth = "Layer 2: Troubleshooting"

        return {
            "turn_number": turn_number,
            "phase": phase,
            "depth_level": depth,
            "question": next_q,
            "telemetry": telemetry,
            "coach_note": f"Mercor Telemetry: {telemetry['ownership_label']} • {telemetry['depth_label']} • {telemetry['compression_rating']}"
        }

    @staticmethod
    def evaluate_mercor_session(
        role: str,
        company: str,
        turns: List[Dict[str, Any]],
        total_duration_seconds: float = 300.0
    ) -> Dict[str, Any]:
        """
        Final Mercor 4-Pillar Scorecard.
        """
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
                "strengths": ["Completed platform onboarding"],
                "warnings": ["⚠ Microphone was silent during session", "⚠ Practice speaking your answers aloud"],
                "turn_breakdowns": []
            }

        all_text = " ".join([t.get("answer", "") for t in valid_turns])
        telemetry = MercorConversationalEngine.analyze_mercor_telemetry(all_text)

        # 1. Ownership Score (I vs We)
        ownership = min(max(telemetry["ownership_score"], 40), 96)

        # 2. Depth Score
        depth_score = 88 if telemetry["depth_level"] == 3 else (76 if telemetry["depth_level"] == 2 else 62)

        # 3. Compression Score
        avg_words_per_turn = telemetry["word_count"] / max(len(valid_turns), 1)
        compression_score = 90 if 40 <= avg_words_per_turn <= 140 else 70

        # 4. Quantified Impact
        impact_score = min(max(60 + (telemetry["quantified_metrics_count"] * 12), 50), 95)

        overall = int((ownership * 0.30) + (depth_score * 0.30) + (compression_score * 0.20) + (impact_score * 0.20))

        strengths = []
        if ownership >= 70:
            strengths.append(f"✓ Exceptional Individual Ownership ({ownership}% 'I' phrasing vs 'We')")
        if depth_score >= 80:
            strengths.append("✓ Strong Layer-3 Production Depth (addressed concurrency & failure modes)")
        if impact_score >= 75:
            strengths.append("✓ Effectively quantified before-and-after business metrics")
        if not strengths:
            strengths = ["✓ Clear technical communication", "✓ Addressed interviewer probing questions"]

        warnings = []
        if ownership < 60:
            warnings.append("⚠ High 'We' ratio: Emphasize your individual contributions instead of team work")
        if depth_score < 75:
            warnings.append("⚠ Stayed at surface level: Explain architectural trade-offs ('Why X over Y?')")
        if impact_score < 70:
            warnings.append("⚠ Missing quantified metrics: State exact % latency reductions or $ savings")
        if avg_words_per_turn > 180:
            warnings.append("⚠ Answers slightly verbose: Use compressed STAR framework under 90s")

        return {
            "session_id": f"mercor_{company.lower()}_{int(total_duration_seconds)}",
            "target_role": role,
            "company": company,
            "overall_score": overall,
            "rating_tier": "Top 10% Mercor Talent Pool" if overall >= 82 else ("Competitive Candidate" if overall >= 72 else "Needs Practice"),
            "mercor_pillars": {
                "ownership_score": ownership,
                "technical_depth_score": depth_score,
                "compression_score": compression_score,
                "quantified_impact_score": impact_score
            },
            "strengths": strengths,
            "warnings": warnings,
            "turn_breakdowns": [
                {
                    "turn_number": idx,
                    "question": t.get("question", ""),
                    "candidate_answer": t.get("answer", ""),
                    "telemetry": MercorConversationalEngine.analyze_mercor_telemetry(t.get("answer", ""))
                }
                for idx, t in enumerate(valid_turns, start=1)
            ]
        }

mercor_conversational_engine = MercorConversationalEngine()
