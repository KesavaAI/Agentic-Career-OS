from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class TodayPrioritiesOut(BaseModel):
    apply_today: List[Dict[str, Any]]
    follow_ups: List[Dict[str, Any]]
    interviews: List[Dict[str, Any]]
    prepare_topics: List[Dict[str, Any]]
    learn_topics: List[Dict[str, Any]]
    resume_tailor: List[Dict[str, Any]]
    new_opportunities: List[Dict[str, Any]]
    summary_count: Dict[str, int]

class ReadinessScoreOut(BaseModel):
    overall_score: int # 0-100
    target_threshold: int # e.g. 85
    category_scores: Dict[str, int]
    top_strengths: List[str]
    critical_gaps: List[str]
    readiness_summary: str

class FunnelAnalyticsOut(BaseModel):
    jobs_found: int
    relevant_jobs: int
    tier_a_b_jobs: int
    applications_submitted: int
    recruiter_responses: int
    interviews_attended: int
    final_rounds: int
    offers_received: int
    response_rate_pct: float
    interview_rate_pct: float
    offer_rate_pct: float
    applications_per_offer_estimate: float

class WeeklyReviewOut(BaseModel):
    week_label: str
    applications_count: int
    tier_a_applications_count: int
    responses_count: int
    interviews_count: int
    offers_count: int
    top_weakness: str
    top_market_skill: str
    learning_completed_count: int
    avg_mock_score: float
    next_week_priorities: List[str]
