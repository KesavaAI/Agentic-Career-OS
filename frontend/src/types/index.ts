export interface Job {
  id: number;
  company_id?: number;
  company_name: string;
  role: string;
  tier: 'A' | 'B' | 'C';
  priority_score: number;
  match_score: number;
  min_salary?: number;
  max_salary?: number;
  experience_min: number;
  experience_max: number;
  work_mode: string;
  location: string;
  description: string;
  responsibilities?: string;
  required_skills?: string;
  preferred_skills?: string;
  education?: string;
  job_url?: string;
  career_url?: string;
  source?: string;
  posted_date?: string;
  deadline?: string;
  status: string;
  interview_stage?: string;
  next_action?: string;
  follow_up_date?: string;
  applied_date?: string;
  recruiter_name?: string;
  recruiter_email?: string;
  resume_version_used?: string;
  notes?: string;
  freshness_badge: string;
  is_urgent: boolean;
  is_easy_apply: boolean;
  is_demo: boolean;
  created_at: string;
  updated_at: string;
}

export interface Application {
  id: number;
  job_id: number;
  resume_id?: number;
  company_name: string;
  role_title: string;
  tier: string;
  match_score: number;
  status: string;
  applied_date?: string;
  deadline?: string;
  next_action?: string;
  follow_up_date?: string;
  is_user_approved: boolean;
  notes?: string;
  is_demo: boolean;
  created_at: string;
}

export interface Company {
  id: number;
  name: string;
  industry: string;
  website?: string;
  career_url?: string;
  linkedin_url?: string;
  locations: string;
  salary_range_lpa: string;
  tier: string;
  response_rate: number;
  notes?: string;
  is_demo: boolean;
}

export interface Recruiter {
  id: number;
  company_name: string;
  name: string;
  role: string;
  email?: string;
  linkedin?: string;
  contact_date?: string;
  response?: string;
  follow_up_date?: string;
  status: string;
  notes?: string;
}

export interface Resume {
  id: number;
  name: string;
  version: string;
  target_role: string;
  ats_score: number;
  content_markdown: string;
  notes?: string;
  is_default: boolean;
  created_at: string;
}

export interface Project {
  id: number;
  title: string;
  category: 'PRODUCTION' | 'PERSONAL' | 'ACADEMIC' | 'HIRING_ASSIGNMENT';
  role: string;
  description: string;
  business_problem?: string;
  architecture?: string;
  components?: string;
  technologies: string;
  responsibilities?: string;
  challenges?: string;
  solutions?: string;
  impact?: string;
  security?: string;
  evaluation?: string;
  scalability?: string;
  reliability?: string;
  interview_explanation?: string;
  architecture_diagram?: string;
  github_url?: string;
  demo_url?: string;
  metrics?: string;
  learnings?: string;
  is_featured: boolean;
}

export interface Interview {
  id: number;
  application_id?: number;
  job_id?: number;
  company_name: string;
  role_title: string;
  stage: string;
  scheduled_at?: string;
  time_str: string;
  interviewer?: string;
  interview_type: string;
  status: string;
  difficulty: string;
  topics?: string;
  preparation_required?: string;
  feedback?: string;
  result: string;
}

export interface LearningTopic {
  id: number;
  skill: string;
  category: string;
  market_demand: string;
  market_demand_pct: number;
  my_level: string;
  gap_level: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  stage: 'LEARN' | 'RECALL' | 'APPLY' | 'EXPLAIN';
  status: 'GREEN' | 'YELLOW' | 'RED';
  recall_schedule_day: number;
  next_recall_date?: string;
  notes?: string;
}

export interface FollowUp {
  id: number;
  application_id?: number;
  company_name: string;
  role_title: string;
  applied_date?: string;
  follow_up_date: string;
  response_status?: string;
  action_notes: string;
  is_completed: boolean;
}

export interface Offer {
  id: number;
  company_name: string;
  role: string;
  total_ctc_lpa: number;
  fixed_lpa: number;
  variable_lpa: number;
  bonus_lpa: number;
  esop_lpa: number;
  location: string;
  notice_period_days: number;
  status: string;
  notes?: string;
}

export interface TodayPriorities {
  apply_today: Array<{ id: number; company: string; role: string; salary: string; match: number }>;
  follow_ups: Array<{ id: number; company: string; role: string; due: string; action: string }>;
  interviews: Array<{ id: number; company: string; role: string; stage: string; time: string }>;
  prepare_topics: Array<{ topic: string; priority: string; context: string }>;
  learn_topics: Array<{ id: number; skill: string; priority: string; status: string; stage: string }>;
  resume_tailor: Array<{ id: number; company: string; role: string }>;
  new_opportunities: Array<{ id: number; company: string; role: string; location: string; freshness: string }>;
  summary_count: {
    apply_today: number;
    follow_ups: number;
    interviews: number;
    learn_topics: number;
    new_opportunities: number;
  };
}

export interface ReadinessScore {
  overall_score: number;
  target_threshold: number;
  category_scores: Record<string, number>;
  top_strengths: string[];
  critical_gaps: string[];
  readiness_summary: string;
}

export interface FunnelAnalytics {
  jobs_found: number;
  relevant_jobs: number;
  tier_a_b_jobs: number;
  applications_submitted: number;
  recruiter_responses: number;
  interviews_attended: number;
  final_rounds: number;
  offers_received: number;
  response_rate_pct: number;
  interview_rate_pct: number;
  offer_rate_pct: number;
  applications_per_offer_estimate: number;
}
