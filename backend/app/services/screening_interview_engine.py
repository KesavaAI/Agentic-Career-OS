import json
import re
from typing import Dict, Any, List, Optional
from app.services.ai_service import ai_service

class ScreeningInterviewEngine:
    """
    AI CANDIDATE SCREENING & ADAPTIVE INTERVIEW ENGINE — PROMPT 8
    Flow: TARGET JOB + CANDIDATE PROFILE + RESUME -> INTERVIEW PLAN -> QUESTION -> ANSWER -> EVALUATION -> ADAPTIVE FOLLOW-UP -> FINAL EVALUATION REPORT
    Grounded strictly in the candidate's actual resume (Resume Defense).
    """

    @classmethod
    def generate_interview_plan(
        cls,
        job_dict: Dict[str, Any],
        profile_dict: Dict[str, Any],
        resume_markdown: Optional[str] = None
    ) -> Dict[str, Any]:
        company = job_dict.get("company_name", "Target Company")
        role = job_dict.get("role", "Software / AI Engineer")
        req_skills = job_dict.get("required_skills") or job_dict.get("description") or "Python, FastAPI, RAG, LLMs, System Design, Microservices"

        cand_name = profile_dict.get("full_name") or "Candidate"
        resume_text = resume_markdown or ""

        # Extract resume claims for Resume Defense (e.g. RAG, Microservices, Kafka, Redis, AWS)
        resume_claims = []
        if re.search(r"\brag\b", resume_text, re.I) or re.search(r"retrieval", resume_text, re.I):
            resume_claims.append({
                "topic": "RAG Architecture & Retrieval Strategy",
                "question": f"In your resume, you highlighted building production RAG pipelines. For the {role} position at {company}, can you detail your exact retrieval strategy, embedding model choice, chunking policy, and how you handled retrieval failure modes or hallucinations?"
            })
        if re.search(r"\bmicroservices\b", resume_text, re.I) or re.search(r"distributed", resume_text, re.I):
            resume_claims.append({
                "topic": "Distributed Microservices & Concurrency",
                "question": f"Your resume mentions engineering scalable distributed microservices. How did you handle inter-service communication, distributed transaction consistency, and circuit breaking under high concurrent traffic?"
            })
        if re.search(r"\bfastapi\b", resume_text, re.I) or re.search(r"async", resume_text, re.I):
            resume_claims.append({
                "topic": "FastAPI & Asynchronous I/O",
                "question": f"You listed FastAPI and async Python in your profile. How do you prevent event loop blocking when executing CPU-heavy workloads alongside high-throughput I/O requests?"
            })

        if not resume_claims:
            resume_claims.append({
                "topic": "Flagship Production System Architecture",
                "question": f"Looking at your experience for this {role} role at {company}, walk me through the most complex production system you've architected. What were the key design decisions, bottlenecks, and quantitative metrics achieved?"
            })

        plan_questions = [
            {
                "category": "Resume Defense & Project Deep-Dive",
                "topic": resume_claims[0]["topic"],
                "question": resume_claims[0]["question"],
                "key_rubrics": ["Architecture clarity", "Retrieval/design choices", "Failure mode awareness"]
            },
            {
                "category": "Technical Knowledge & Framework Depth",
                "topic": f"Core Tech Stack: {req_skills[:50]}",
                "question": f"For this role at {company}, we rely heavily on {req_skills[:60]}. How do you evaluate trade-offs when choosing between streaming asynchronous architectures versus synchronous request-response patterns for this stack?",
                "key_rubrics": ["Trade-off analysis", "Latency vs throughput", "Stack proficiency"]
            },
            {
                "category": "System Design & Production Scalability",
                "topic": "Distributed System Scaling & Resilience",
                "question": f"Suppose your production system for {role} experiences a sudden 10x traffic spike with 429 rate limits from downstream providers. Walk me through your architectural strategy to maintain system availability and data consistency.",
                "key_rubrics": ["Rate limit handling", "Caching/queuing strategy", "Graceful degradation"]
            },
            {
                "category": "Problem Solving & Algorithmic Approach",
                "topic": "Data Structures & State Management",
                "question": "How do you approach managing complex state mutation and concurrent locking in a high-concurrency production application without introducing deadlocks or race conditions?",
                "key_rubrics": ["Concurrency locks", "Race condition prevention", "Algorithmic efficiency"]
            },
            {
                "category": "Behavioral & Role Readiness",
                "topic": "Engineering Leadership & Technical Trade-offs",
                "question": f"Tell me about a time when you had to make a tough technical compromise to meet a tight production deadline for a {role} project. What was the compromise, how did you mitigate technical debt, and what was the outcome?",
                "key_rubrics": ["Technical debt management", "PR & team communication", "Pragmatic decision making"]
            }
        ]

        return {
            "company_name": company,
            "role_title": role,
            "total_questions": len(plan_questions),
            "plan_questions": plan_questions
        }

    @classmethod
    def evaluate_turn_and_adapt(
        cls,
        messages: List[Dict[str, str]],
        current_question_idx: int,
        plan: Dict[str, Any],
        job_dict: Dict[str, Any],
        profile_dict: Dict[str, Any]
    ) -> Dict[str, Any]:
        user_messages = [m for m in messages if m.get("role") == "user"]
        latest_answer = user_messages[-1].get("content", "").strip() if user_messages else ""
        turn_count = len(user_messages)

        plan_questions = plan.get("plan_questions", [])
        total_questions = len(plan_questions)

        # Evaluate candidate's latest answer dynamically
        lower_ans = latest_answer.lower()
        word_count = len(latest_answer.split())

        # Evaluate Turn Scores
        tech_score = 85
        comm_score = 90
        ps_score = 88
        turn_strengths = []
        turn_gaps = []

        if word_count < 15:
            tech_score -= 20
            comm_score -= 15
            turn_gaps.append("Answer was very brief; lacked architectural depth and design rationale.")
        else:
            turn_strengths.append("Provided detailed technical context and design explanation.")

        if any(kw in lower_ans for kw in ["tradeoff", "latency", "throughput", "cache", "fallback", "metric", "rag", "vector", "async"]):
            tech_score += 8
            ps_score += 7
            turn_strengths.append("Demonstrated strong trade-off and production SLA awareness.")
        else:
            turn_gaps.append("Could specify explicit production metrics (e.g. latency ms, RPS, memory footprint).")

        tech_score = min(max(tech_score, 45), 98)
        comm_score = min(max(comm_score, 50), 98)
        ps_score = min(max(ps_score, 50), 98)

        # Adaptive Questioning Logic
        is_finished = turn_count >= total_questions
        next_question_idx = current_question_idx
        next_question_text = ""
        is_follow_up = False

        if not is_finished:
            if word_count < 25 or "Could specify" in str(turn_gaps):
                is_follow_up = True
                curr_topic = plan_questions[min(current_question_idx, total_questions - 1)].get("topic", "System Architecture")
                next_question_text = f"Following up on your answer regarding {curr_topic}: What specific failure modes or edge cases did you encounter, and how did you measure success (e.g., latency, error rate, or throughput)?"
            else:
                next_question_idx = min(current_question_idx + 1, total_questions - 1)
                next_question_obj = plan_questions[next_question_idx]
                next_question_text = f"Thank you. Next, let's move to **{next_question_obj['category']}** ({next_question_obj['topic']}):\n\n{next_question_obj['question']}"
        else:
            next_question_text = "Thank you for completing all technical screening sections! I am now compiling your comprehensive AI Candidate Evaluation Report."

        return {
            "turn_index": turn_count,
            "current_question_idx": next_question_idx,
            "is_follow_up": is_follow_up,
            "next_interviewer_text": next_question_text,
            "is_finished": is_finished,
            "turn_eval": {
                "technical_score": tech_score,
                "communication_score": comm_score,
                "problem_solving_score": ps_score,
                "strengths": turn_strengths,
                "gaps": turn_gaps
            }
        }

    @classmethod
    def generate_final_report(
        cls,
        messages: List[Dict[str, str]],
        evaluations: List[Dict[str, Any]],
        plan: Dict[str, Any],
        job_dict: Dict[str, Any],
        profile_dict: Dict[str, Any]
    ) -> Dict[str, Any]:
        company = job_dict.get("company_name", "Target Company")
        role = job_dict.get("role", "Software / AI Engineer")

        if evaluations:
            avg_tech = int(sum(e.get("technical_score", 85) for e in evaluations) / len(evaluations))
            avg_comm = int(sum(e.get("communication_score", 88) for e in evaluations) / len(evaluations))
            avg_ps = int(sum(e.get("problem_solving_score", 82) for e in evaluations) / len(evaluations))
        else:
            avg_tech, avg_comm, avg_ps = 88, 90, 85

        overall_score = int((avg_tech * 0.40) + (avg_comm * 0.30) + (avg_ps * 0.30))

        if overall_score >= 88:
            readiness = f"High Alignment — L5 Senior {role} Ready"
        elif overall_score >= 75:
            readiness = f"Solid Alignment — L4 Mid-Level {role} Ready"
        else:
            readiness = f"Developing — Target Role Alignment Needs Practice"

        strengths = [
            f"Strong technical articulation across {role} domain concepts",
            "Defended resume architectural decisions with clear design rationale",
            "Good conversational adaptability and trade-off awareness"
        ]

        weaknesses = [
            "Could quantify performance impact with concrete SLAs (e.g. latency ms, RPS, memory footprint)",
            "Deepen edge-case failure mode handling under extreme rate limits"
        ]

        improvements = [
            f"Practice articulating STAR-style metrics (Context -> Action -> Production Metric) for {role} interviews",
            "Review circuit breaker and fallback patterns for external third-party API dependencies",
            "Conduct mock system design walkthroughs focusing on asynchronous event queues"
        ]

        return {
            "company_name": company,
            "role_title": role,
            "overall_score": overall_score,
            "technical_score": avg_tech,
            "communication_score": avg_comm,
            "problem_solving_score": avg_ps,
            "role_readiness": readiness,
            "strengths": strengths,
            "weaknesses": weaknesses,
            "recommended_improvements": improvements,
            "disclaimer": "This evaluation is an AI candidate screening simulation designed to prepare you for actual technical interviews. It is not an official employer hiring decision."
        }

screening_interview_engine = ScreeningInterviewEngine()
