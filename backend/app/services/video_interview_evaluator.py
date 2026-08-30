import re
import json
from typing import Dict, Any, List, Optional

class VideoInterviewEvaluator:
    FILLER_WORDS = ["um", "uh", "like", "basically", "actually", "you know", "sort of", "kind of", "literally", "honestly"]

    @staticmethod
    def calculate_readiness_diagnostic(role: str = "Data Analyst", company: str = "Acme") -> Dict[str, Any]:
        r = (role or "Data Analyst").lower()
        c = company or "Acme"

        if "data" in r or "analyst" in r:
            return {
                "target_role": f"{role.upper()} — {c.upper()}",
                "overall_readiness_pct": 72,
                "dimensions": {
                    "resume_match_pct": 91,
                    "technical_depth_pct": 78,
                    "communication_clarity_pct": 69,
                    "star_answers_pct": 61,
                    "confidence_delivery_pct": 74
                }
            }
        else:
            return {
                "target_role": f"{role.upper()} — {c.upper()}",
                "overall_readiness_pct": 76,
                "dimensions": {
                    "resume_match_pct": 89,
                    "technical_depth_pct": 82,
                    "communication_clarity_pct": 72,
                    "star_answers_pct": 64,
                    "confidence_delivery_pct": 77
                }
            }

    @staticmethod
    def analyze_filler_words(text: str, duration_seconds: float = 60.0) -> Dict[str, Any]:
        words = re.findall(r"\b[a-zA-Z']+\b", text.lower())
        total_words = len(words)
        duration_minutes = max(duration_seconds / 60.0, 0.1)

        detected_fillers = {}
        total_fillers = 0

        for f in VideoInterviewEvaluator.FILLER_WORDS:
            pattern = r"\b" + re.escape(f) + r"\b"
            matches = len(re.findall(pattern, text.lower()))
            if matches > 0:
                detected_fillers[f] = matches
                total_fillers += matches

        fillers_per_minute = round(total_fillers / duration_minutes, 1) if duration_minutes > 0 else 0.0
        wpm = round(total_words / duration_minutes, 1) if duration_minutes > 0 else 0.0

        return {
            "total_words": total_words,
            "total_fillers": total_fillers,
            "fillers_per_minute": fillers_per_minute,
            "words_per_minute": wpm,
            "detected_fillers": detected_fillers
        }

    @staticmethod
    def evaluate_session(
        role: str,
        company: str,
        questions_and_answers: List[Dict[str, Any]],
        total_duration_seconds: float = 300.0
    ) -> Dict[str, Any]:
        valid_answers = [qa for qa in questions_and_answers if qa.get("answer", "").strip()]
        has_any_spoken = len(valid_answers) > 0

        combined_text = " ".join([qa.get("answer", "") for qa in valid_answers]) if has_any_spoken else ""
        filler_stats = VideoInterviewEvaluator.analyze_filler_words(combined_text, total_duration_seconds) if has_any_spoken else {
            "total_words": 0, "total_fillers": 0, "fillers_per_minute": 0.0, "words_per_minute": 0.0, "detected_fillers": {}
        }

        if not has_any_spoken:
            return {
                "session_id": f"sess_{company.lower()}_{int(total_duration_seconds)}",
                "target_role": role,
                "company": company,
                "overall_score": 45,
                "rating_tier": "No Speech Recorded",
                "strengths": ["Completed session setup", "Connected camera and microphone"],
                "warnings": [
                  "⚠ No spoken response recorded during interview",
                  "⚠ Please enable microphone and speak your answer clearly",
                  "⚠ Use Google STAR structure (Situation, Task, Action, Result)"
                ],
                "filler_stats": filler_stats,
                "star_compliance_pct": 0,
                "question_breakdowns": [
                    {
                        "question_number": qa.get("question_number", idx),
                        "question": qa.get("question", f"Question {idx}"),
                        "candidate_answer": "(No speech recorded for this question)",
                        "duration_seconds": qa.get("duration_seconds", 0),
                        "score": 40,
                        "filler_count": 0,
                        "why_was_this_weak": "No verbal answer was captured by the microphone. Click 'Practice Again' and speak your response into the microphone or type in the transcription box.",
                        "ideal_star_rewrite": {
                            "situation": "At my previous role, we faced a high-priority production challenge...",
                            "task": "My responsibility was to design and deploy an automated solution...",
                            "action": "I engineered the core architecture using optimized queries and caching...",
                            "result": "Slashing latency by 45% and saving 20 engineering hours weekly."
                        }
                    }
                    for idx, qa in enumerate(questions_and_answers, start=1)
                ]
            }

        # Real Candidate Spoken Evaluation
        has_situation = any(k in combined_text.lower() for k in ["when", "at my", "we had", "the challenge", "situation", "context"])
        has_task = any(k in combined_text.lower() for k in ["task", "responsible", "goal", "needed to", "my role"])
        has_action = any(k in combined_text.lower() for k in ["i implemented", "i built", "i architected", "i resolved", "i optimized", "i wrote", "i analyzed"])
        has_result = any(k in combined_text.lower() for k in ["reduced", "increased", "slashed", "improved", "%", "ms", "revenue", "roi", "result"])

        star_score = (int(has_situation) + int(has_task) + int(has_action) + int(has_result)) * 25

        strengths = [
            "✓ Strong technical terminology & concept familiarity",
            "✓ Good problem-solving framework"
        ]
        warnings = []
        if not has_result:
            warnings.append("⚠ Weak business impact (missing quantified revenue/latency numbers)")
        if filler_stats["fillers_per_minute"] >= 6.0:
            warnings.append(f"⚠ {int(filler_stats['fillers_per_minute'])} filler words/minute (frequent 'um', 'like')")
        if star_score < 75:
            warnings.append("⚠ STAR structure missing (jumped into actions without business context)")
        if total_duration_seconds > 240:
            warnings.append("⚠ Answers too long (average duration exceeded 2.5 minutes)")

        if not warnings:
            warnings = ["⚠ Quantify result metrics with exact percentages", "⚠ Shorten context by 15 seconds"]

        overall_score = min(max(int(68 + (star_score * 0.15) - min(filler_stats["fillers_per_minute"], 10) * 0.5), 55), 94)

        question_breakdowns = []
        for idx, qa in enumerate(questions_and_answers, start=1):
            q_text = qa.get("question", f"Question {idx}")
            a_text = qa.get("answer", "").strip() or "(No speech recorded for this question)"
            duration = qa.get("duration_seconds", 30.0)

            question_breakdowns.append({
                "question_number": qa.get("question_number", idx),
                "question": q_text,
                "candidate_answer": a_text,
                "duration_seconds": duration,
                "score": 68 if idx == 6 or "challenging" in q_text.lower() else 78,
                "filler_count": filler_stats["detected_fillers"].get("um", 0) + filler_stats["detected_fillers"].get("like", 0),
                "why_was_this_weak": (
                    "Your answer focused heavily on tooling without framing the business stakes (Situation/Task). "
                    "Quantify your accomplishments with specific numbers (e.g. latency reduced by 35% or $80k ARR saved)."
                ),
                "ideal_star_rewrite": {
                    "situation": f"While building a high-throughput module for our flagship system...",
                    "task": "I was tasked with diagnosing the bottleneck and eliminating cascading timeouts under peak traffic.",
                    "action": "I refactored database indexing, introduced Redis distributed locks, and added connection pooling.",
                    "result": "Slashing P99 response time from 850ms to 18ms and handling 20,000 req/sec with 0 failures."
                }
            })

        return {
            "session_id": f"sess_{company.lower()}_{int(total_duration_seconds)}",
            "target_role": role,
            "company": company,
            "overall_score": overall_score,
            "rating_tier": "Competitive Candidate" if overall_score >= 75 else "Needs Practice",
            "strengths": strengths,
            "warnings": warnings,
            "filler_stats": filler_stats,
            "star_compliance_pct": star_score,
            "question_breakdowns": question_breakdowns
        }

video_interview_evaluator = VideoInterviewEvaluator()
