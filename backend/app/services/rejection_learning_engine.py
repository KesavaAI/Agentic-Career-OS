import json
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session

class RejectionLearningEngine:
    """
    Rejection-to-Intelligence Loop.
    Converts candidate rejections into data assets:
    Detects root causes (Skill Gap, Experience, Architectural Depth),
    and automatically seeds targeted 30-day spaced repetition learning topics.
    """

    @staticmethod
    def process_rejection(
        db: Session,
        user_id: int,
        company_name: str,
        role_title: str,
        rejection_reason: Optional[str] = None
    ) -> Dict[str, Any]:
        from app.models.learning import LearningTopic
        
        reason = (rejection_reason or "").lower()
        role = (role_title or "").lower()

        # Classify root cause
        if any(k in reason for k in ["kafka", "queue", "event", "messaging"]):
            skill_name = "Kafka Exactly-Once Semantics (EOS) & Consumer Partitioning"
            category = "Event-Driven Architecture"
        elif any(k in reason for k in ["system design", "scale", "concurrency", "distributed"]):
            skill_name = "High-Throughput Distributed Rate Limiting & Mutex Locks"
            category = "System Design & Concurrency"
        elif any(k in reason for k in ["database", "sql", "query", "indexing"]):
            skill_name = "PostgreSQL B-Tree Indexing & Connection Pool Saturation"
            category = "Database Performance"
        else:
            skill_name = f"{role_title} Production Scale & Metric Defense"
            category = "Core Architecture Gaps"

        # Check if topic already exists
        existing = db.query(LearningTopic).filter(
            LearningTopic.user_id == user_id,
            LearningTopic.skill == skill_name
        ).first()

        if not existing:
            notes = {
                "source": f"Rejection learning loop from {company_name} ({role_title})",
                "mental_models": [
                    f"Master core failure modes identified during {company_name} screening.",
                    "Articulate trade-offs using quantified production metrics.",
                    "Practice 60-second STAR response format."
                ],
                "interviewer_trap": f"Interviewers at companies like {company_name} test deep failure isolation under high load.",
                "code_anchor": "// Automated remediation topic seeded from interview outcome",
                "metric_defense": "Demonstrate P99 latency & zero-drop consistency."
            }

            topic = LearningTopic(
                user_id=user_id,
                skill=skill_name,
                category=category,
                market_demand="High Priority",
                market_demand_pct=94,
                my_level="Intermediate",
                gap_level="Advanced Production",
                priority="Critical",
                stage="LEARN",
                status="YELLOW",
                recall_schedule_day=1,
                notes=json.dumps(notes),
                is_demo=False
            )
            db.add(topic)
            db.commit()

        return {
            "status": "PROCESSED",
            "company": company_name,
            "role": role_title,
            "classified_gap": skill_name,
            "category": category,
            "action_taken": "Seeded 30-day Spaced Repetition Revision Topic in Dashboard"
        }

rejection_learning_engine = RejectionLearningEngine()
