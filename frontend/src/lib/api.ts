const API_BASE = '/api/v1';

export const POPULAR_DOMAINS = ['gmail.com', 'outlook.com', 'hotmail.com', 'yahoo.com', 'icloud.com', 'protonmail.com', 'zoho.com'];

export const TYPO_DOMAINS: Record<string, string> = {
  // Gmail typos
  'gmil.com': 'gmail.com',
  'gmai.com': 'gmail.com',
  'gmaill.com': 'gmail.com',
  'gamil.com': 'gmail.com',
  'gmial.com': 'gmail.com',
  'gmal.com': 'gmail.com',
  'gmaik.com': 'gmail.com',
  'gemail.com': 'gmail.com',
  'gml.com': 'gmail.com',
  'gmail.co': 'gmail.com',
  'gmaill.co': 'gmail.com',
  'gmali.com': 'gmail.com',

  // Outlook typos
  'outlk.com': 'outlook.com',
  'outlok.com': 'outlook.com',
  'outloo.com': 'outlook.com',
  'outllok.com': 'outlook.com',
  'outloook.com': 'outlook.com',
  'outlokk.com': 'outlook.com',
  'otlook.com': 'outlook.com',
  'outklook.com': 'outlook.com',
  'outloock.com': 'outlook.com',
  'outlock.com': 'outlook.com',
  'outllok.co': 'outlook.com',
  'outluk.com': 'outlook.com',
  'ootlook.com': 'outlook.com',

  // Yahoo typos
  'yaho.com': 'yahoo.com',
  'yahooo.com': 'yahoo.com',
  'yaho.co': 'yahoo.com',
  'yhoo.com': 'yahoo.com',
  'yaha.com': 'yahoo.com',
  'yaho.in': 'yahoo.com',
  'yahoo.co': 'yahoo.com',

  // Hotmail typos
  'hotmial.com': 'hotmail.com',
  'hotmaill.com': 'hotmail.com',
  'hotmil.com': 'hotmail.com',
  'hotmal.com': 'hotmail.com',
  'hotmali.com': 'hotmail.com',
  'hotmai.com': 'hotmail.com',
  'homail.com': 'hotmail.com',

  // iCloud typos
  'icoud.com': 'icloud.com',
  'iclod.com': 'icloud.com',
  'icluod.com': 'icloud.com',
  'icloud.co': 'icloud.com',
};

export const getTypoSuggestion = (domain: string): string | null => {
  const d = (domain || '').trim().toLowerCase();
  if (TYPO_DOMAINS[d]) return TYPO_DOMAINS[d];
  if (POPULAR_DOMAINS.includes(d)) return null;

  // Levenshtein fuzzy distance
  const lev = (s1: string, s2: string): number => {
    if (s1.length < s2.length) return lev(s2, s1);
    if (s2.length === 0) return s1.length;
    let prev = Array.from({ length: s2.length + 1 }, (_, i) => i);
    for (let i = 0; i < s1.length; i++) {
      let curr = [i + 1];
      for (let j = 0; j < s2.length; j++) {
        const ins = prev[j + 1] + 1;
        const dels = curr[j] + 1;
        const subs = prev[j] + (s1[i] !== s2[j] ? 1 : 0);
        curr.push(Math.min(ins, dels, subs));
      }
      prev = curr;
    }
    return prev[prev.length - 1];
  };

  for (const pop of POPULAR_DOMAINS) {
    const dist = lev(d, pop);
    if (dist >= 1 && dist <= 2) {
      return pop;
    }
  }
  return null;
};

export const checkEmailTypo = (email: string) => {
  if (!email || !email.includes('@')) return { hasTypo: false, suggestion: '', correctedEmail: '' };
  const parts = email.trim().toLowerCase().split('@');
  if (parts.length !== 2) return { hasTypo: false, suggestion: '', correctedEmail: '' };
  
  const [user, domain] = parts;
  const suggestion = getTypoSuggestion(domain);
  if (suggestion) {
    return {
      hasTypo: true,
      suggestion,
      correctedEmail: `${user}@${suggestion}`
    };
  }
  return { hasTypo: false, suggestion: '', correctedEmail: '' };
};

export const isValidEmailStrict = (email: string): { valid: boolean; error?: string } => {
  const clean = email.trim().toLowerCase();
  if (!clean) {
    return { valid: false, error: 'Email address is required.' };
  }
  if (!clean.includes('@')) {
    return { valid: false, error: 'Email must contain an "@" symbol.' };
  }
  const parts = clean.split('@');
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    return { valid: false, error: 'Please enter a valid email format (e.g. name@gmail.com).' };
  }
  const [local, domain] = parts;
  if (local.length < 2) {
    return { valid: false, error: 'Email username is too short.' };
  }
  const typo = getTypoSuggestion(domain);
  if (typo) {
    return { valid: false, error: `Invalid domain '@${domain}'. Did you mean '@${typo}'?` };
  }
  if (!domain.includes('.') || domain.split('.').pop()!.length < 2) {
    return { valid: false, error: 'Please enter a valid email domain (e.g. @gmail.com, @outlook.com).' };
  }
  return { valid: true };
};

export const checkPasswordStrength = (password: string) => {
  const p = password || '';
  const hasMinLength = p.length >= 8;
  const hasLower = /[a-z]/.test(p);
  const hasUpper = /[A-Z]/.test(p);
  const hasNumber = /[0-9]/.test(p);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(p);

  let score = 0;
  if (hasMinLength) score += 1;
  if (hasLower && hasUpper) score += 1;
  if (hasNumber) score += 1;
  if (hasSpecial) score += 1;
  if (p.length >= 12) score += 1;

  let label = 'Too Short';
  let color = 'bg-red-500';
  let textColor = 'text-red-400';

  if (score === 1) {
    label = 'Weak';
    color = 'bg-red-500';
    textColor = 'text-red-400';
  } else if (score === 2) {
    label = 'Fair';
    color = 'bg-amber-500';
    textColor = 'text-amber-400';
  } else if (score === 3) {
    label = 'Good';
    color = 'bg-blue-500';
    textColor = 'text-blue-400';
  } else if (score >= 4) {
    label = 'Strong';
    color = 'bg-emerald-500';
    textColor = 'text-emerald-400';
  }

  const isSatisfied = hasMinLength && hasLower && hasUpper && hasNumber && hasSpecial;

  return {
    hasMinLength,
    hasLower,
    hasUpper,
    hasNumber,
    hasSpecial,
    score,
    label,
    color,
    textColor,
    isSatisfied
  };
};

export const isValidPasswordStrict = (password: string): { valid: boolean; error?: string } => {
  const p = password || '';
  if (p.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters long.' };
  }
  if (!/[a-z]/.test(p)) {
    return { valid: false, error: 'Password must contain at least one lowercase letter (a-z).' };
  }
  if (!/[A-Z]/.test(p)) {
    return { valid: false, error: 'Password must contain at least one uppercase letter (A-Z).' };
  }
  if (!/[0-9]/.test(p)) {
    return { valid: false, error: 'Password must contain at least one number (0-9).' };
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(p)) {
    return { valid: false, error: 'Password must contain at least one special character (!@#$%^&*...).' };
  }
  return { valid: true };
};

export async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('acos_token') : null;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string> || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || `API request failed with status ${res.status}`);
  }

  return res.json();
}

export const api = {
  // Auth & Multi-Persona SaaS
  login: (data: any) => fetchApi<any>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  register: (data: any) => fetchApi<any>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  verifyEmail: (data: { email: string; code: string }) =>
    fetchApi<any>('/auth/verify-email', { method: 'POST', body: JSON.stringify(data) }),
  resendVerification: (data: { email: string }) =>
    fetchApi<any>('/auth/resend-verification', { method: 'POST', body: JSON.stringify(data) }),
  requestOtp: (data: { email: string }) =>
    fetchApi<any>('/auth/request-otp', { method: 'POST', body: JSON.stringify(data) }),
  verifyOtpLogin: (data: { email: string; code: string }) =>
    fetchApi<any>('/auth/verify-otp-login', { method: 'POST', body: JSON.stringify(data) }),
  forgotPassword: (data: { email: string }) =>
    fetchApi<any>('/auth/forgot-password', { method: 'POST', body: JSON.stringify(data) }),
  resetPassword: (data: { email: string; code: string; new_password: string }) =>
    fetchApi<any>('/auth/reset-password', { method: 'POST', body: JSON.stringify(data) }),
  changePassword: (data: { current_password: string; new_password: string }) =>
    fetchApi<any>('/auth/change-password', { method: 'POST', body: JSON.stringify(data) }),
  getMe: () => fetchApi<any>('/auth/me'),

  // Universal Candidate Profile
  getProfile: () => fetchApi<any>('/profile'),
  updateProfile: (data: any) => fetchApi<any>('/profile', { method: 'PUT', body: JSON.stringify(data) }),
  enhanceProfileBullet: (data: { rough_text: string; target_role?: string; tech_stack?: string }) =>
    fetchApi<any>('/profile/enhance-bullet', { method: 'POST', body: JSON.stringify(data) }),
  // Today's Priorities & Analytics
  getTodayPriorities: () => fetchApi<any>('/analytics/today-priorities'),
  getReadinessScore: () => fetchApi<any>('/analytics/readiness'),
  getFunnelAnalytics: () => fetchApi<any>('/analytics/funnel'),
  getWeeklyReview: () => fetchApi<any>('/analytics/weekly-review'),

  // Jobs
  getJobs: (params?: string) => fetchApi<any[]>(`/jobs${params ? `?${params}` : ''}`),
  getJob: (id: number) => fetchApi<any>(`/jobs/${id}`),
  createJob: (data: any) => fetchApi<any>('/jobs', { method: 'POST', body: JSON.stringify(data) }),
  updateJob: (id: number, data: any) => fetchApi<any>(`/jobs/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteJob: (id: number) => fetchApi<any>(`/jobs/${id}`, { method: 'DELETE' }),
  analyzeJob: (id: number) => fetchApi<any>(`/jobs/${id}/analyze`, { method: 'POST' }),
  ingestJob: (data: { raw_text: string; url?: string; source?: string }) =>
    fetchApi<any>('/jobs/ingest', { method: 'POST', body: JSON.stringify(data) }),
  autoClassifyAndCleanJobs: () => fetchApi<any>('/jobs/auto-classify-and-clean', { method: 'POST' }),
  batchAutoApplyJobs: (jobIds: number[]) => fetchApi<any>('/jobs/batch-auto-apply', { method: 'POST', body: JSON.stringify({ job_ids: jobIds }) }),
  getJobMatchAnalysis: (id: number) => fetchApi<any>(`/jobs/${id}/match-analysis`),
  evaluateJobMatch: (data: { job_dict?: any; job_id?: number; profile_override?: any }) =>
    fetchApi<any>('/jobs/match', { method: 'POST', body: JSON.stringify(data) }),
  recalculateMatches: () => fetchApi<any>('/jobs/recalculate-matches', { method: 'POST' }),
  getPersonalizedFeed: (params?: string) => fetchApi<any>(`/discovery/feed${params ? `?${params}` : ''}`),

  // Job Alerts & Continuous Monitoring
  getJobAlerts: () => fetchApi<any[]>('/alerts'),
  getJobAlert: (id: number) => fetchApi<any>(`/alerts/${id}`),
  createJobAlert: (data: any) => fetchApi<any>('/alerts', { method: 'POST', body: JSON.stringify(data) }),
  updateJobAlert: (id: number, data: any) => fetchApi<any>(`/alerts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteJobAlert: (id: number) => fetchApi<any>(`/alerts/${id}`, { method: 'DELETE' }),
  scanJobAlert: (id: number, forceCrawl: boolean = false) =>
    fetchApi<any>(`/alerts/${id}/scan`, { method: 'POST', body: JSON.stringify({ force_crawl: forceCrawl }) }),
  monitorAllJobAlerts: (forceCrawl: boolean = false) =>
    fetchApi<any>('/alerts/monitor-all', { method: 'POST', body: JSON.stringify({ force_crawl: forceCrawl }) }),
  getAlertNotifications: (id: number) => fetchApi<any>(`/alerts/${id}/notifications`),

  // Applications
  getApplications: () => fetchApi<any[]>('/applications'),
  getApplication: (id: number) => fetchApi<any>(`/applications/${id}`),
  createApplication: (data: any) => fetchApi<any>('/applications', { method: 'POST', body: JSON.stringify(data) }),
  updateApplication: (id: number, data: any) => fetchApi<any>(`/applications/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteApplication: (id: number) => fetchApi<any>(`/applications/${id}`, { method: 'DELETE' }),
  clearAllApplications: () => fetchApi<any>('/applications/clear-all', { method: 'POST' }),
  getApplicationEvents: (id: number) => fetchApi<any[]>(`/applications/${id}/events`),
  getApplicationEvidence: (id: number) => fetchApi<any[]>(`/applications/${id}/evidence`),
  addApplicationEvidence: (id: number, data: any) => fetchApi<any>(`/applications/${id}/evidence`, { method: 'POST', body: JSON.stringify(data) }),

  // Companies & Recruiters
  getCompanies: () => fetchApi<any[]>('/companies'),
  getRecruiters: () => fetchApi<any[]>('/recruiters'),
  createRecruiter: (data: any) => fetchApi<any>('/recruiters', { method: 'POST', body: JSON.stringify(data) }),
  getOutreachTemplate: (data: any) => fetchApi<any>('/recruiters/template', { method: 'POST', body: JSON.stringify(data) }),

  // Resumes
  getResumes: () => fetchApi<any[]>('/resumes'),
  createResume: (data: any) => fetchApi<any>('/resumes', { method: 'POST', body: JSON.stringify(data) }),
  simulateAts: (data: { resume_text?: string; resume_id?: number; job_description: string }) =>
    fetchApi<any>('/resumes/ats-simulate', { method: 'POST', body: JSON.stringify(data) }),
  tailorResume: (data: { resume_id: number; job_id: number }) =>
    fetchApi<any>('/resumes/tailor', { method: 'POST', body: JSON.stringify(data) }),
  enhanceBullet: (data: { bullet?: string; rough_text?: string; target_role?: string; tech_stack?: string }) =>
    fetchApi<any>('/resumes/enhance-bullet', { method: 'POST', body: JSON.stringify(data) }),

  // Projects
  getProjects: (category?: string) => fetchApi<any[]>(`/projects${category ? `?category=${category}` : ''}`),
  createProject: (data: any) => fetchApi<any>('/projects', { method: 'POST', body: JSON.stringify(data) }),
  getTcsProject: () => fetchApi<any>('/projects/tcs-agentic-intelligence'),

  // Interviews & Mock Engine
  getInterviews: () => fetchApi<any[]>('/interviews'),
  createInterview: (data: any) => fetchApi<any>('/interviews', { method: 'POST', body: JSON.stringify(data) }),
  updateInterview: (id: number, data: any) => fetchApi<any>(`/interviews/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  getInterviewPack: (jobId: number) => fetchApi<any>(`/interviews/job/${jobId}/pack`),
  getScenarioPack: (jobId?: number, company?: string, role?: string) => {
    if (jobId) {
      return fetchApi<any>(`/interviews/job/${jobId}/scenario-pack`);
    }
    const params = new URLSearchParams();
    if (company) params.append('company', company);
    if (role) params.append('role', role);
    return fetchApi<any>(`/interviews/scenario-pack?${params.toString()}`);
  },
  getResumeDefense: () => fetchApi<any>('/interviews/resume-defense'),
  mockInterviewTurn: (data: { mode: string; is_pressure_mode: boolean; messages: any[]; target_role?: string }) =>
    fetchApi<any>('/mock-interview/turn', { method: 'POST', body: JSON.stringify(data) }),
  getMockSessions: () => fetchApi<any[]>('/mock-interview/sessions'),

  // Learning & Skill Gaps
  getLearningTopics: () => fetchApi<any[]>('/learning'),
  recallCheckin: (data: { topic_id: number; result_state: string; notes?: string }) =>
    fetchApi<any>('/learning/recall-checkin', { method: 'POST', body: JSON.stringify(data) }),

  // Market & Offers
  getMarketIntelligence: () => fetchApi<any>('/market'),
  getOffers: () => fetchApi<any[]>('/offers'),
  createOffer: (data: any) => fetchApi<any>('/offers', { method: 'POST', body: JSON.stringify(data) }),
  compareOffers: () => fetchApi<any[]>('/offers/compare'),

  // Follow-ups & Notifications
  getFollowups: (filter?: string) => fetchApi<any[]>(`/followups${filter ? `?filter_view=${filter}` : ''}`),
  completeFollowup: (id: number) => fetchApi<any>(`/followups/${id}/complete`, { method: 'POST' }),
  generateFollowupOutreach: (id: number) => fetchApi<any>(`/followups/${id}/generate-outreach`),
  sendFollowupOutreach: (id: number) => fetchApi<any>(`/followups/${id}/send-outreach`, { method: 'POST' }),
  createFollowup: (data: any) => fetchApi<any>('/followups', { method: 'POST', body: JSON.stringify(data) }),
  getNotifications: () => fetchApi<any[]>('/notifications'),
  markNotificationRead: (id: number) => fetchApi<any>(`/notifications/${id}/read`, { method: 'POST' }),

  // Career Agent & Autonomous Swarm
  runCareerAgent: (data: { raw_jd_text: string; job_url?: string; source?: string }) =>
    fetchApi<any>('/career-agent/run', { method: 'POST', body: JSON.stringify(data) }),
  approveCareerAgent: (data: { state: any; approve: boolean; action: string }) =>
    fetchApi<any>('/career-agent/approve', { method: 'POST', body: JSON.stringify(data) }),
  submitAgentDirective: (directive: string) =>
    fetchApi<any>('/career-agent/directive', { method: 'POST', body: JSON.stringify({ directive }) }),
  getSwarmDagState: () => fetchApi<any>('/career-agent/swarm-dag'),
  executeSwarmCycle: () => fetchApi<any>('/career-agent/swarm-execute', { method: 'POST' }),
  // Multi-Career Taxonomy & Switching
  getCareerDomains: () => fetchApi<any[]>('/taxonomy/domains'),
  getRoleIntelligence: (roleName: string) => fetchApi<any>(`/taxonomy/role/${encodeURIComponent(roleName)}`),
  switchCareerTarget: (data: { domain_id: string; target_role: string; target_min_ctc_lpa?: number; candidate_pool?: string }) =>
    fetchApi<any>('/taxonomy/switch-career', { method: 'POST', body: JSON.stringify(data) }),

  // Audit & Settings
  getAuditLogs: () => fetchApi<any[]>('/audit'),
  getSettings: () => fetchApi<any>('/settings'),
  triggerSeedData: () => fetchApi<any>('/settings/seed-data', { method: 'POST' }),
  clearDemoData: () => fetchApi<any>('/settings/clear-demo-data', { method: 'POST' }),

  // Live Gmail & Email Sync
  getEmailStatus: () => fetchApi<any>('/email/status'),
  testEmailConnection: (data: { email?: string; app_password?: string }) =>
    fetchApi<any>('/email/test-connection', { method: 'POST', body: JSON.stringify(data) }),
  syncEmailInbox: (data?: { email?: string; app_password?: string }) =>
    fetchApi<any>('/email/sync', { method: 'POST', body: JSON.stringify(data || {}) }),
  sendOutreachEmail: (data: { to_email: string; subject: string; body: string; sender_email?: string; app_password?: string }) =>
    fetchApi<any>('/email/send-outreach', { method: 'POST', body: JSON.stringify(data) }),

  // Autonomous Job Discovery Engine & Universal IT Taxonomy
  runAutoJobScan: (max_jobs?: number, target_role?: string, target_ctc?: number) =>
    fetchApi<any>('/discovery/run-auto-scan', {
      method: 'POST',
      body: JSON.stringify({ max_jobs: max_jobs || 10, target_role, target_ctc })
    }),
  runAutonomousScan: (max_jobs?: number, target_role?: string, target_ctc?: number) =>
    fetchApi<any>('/discovery/run-auto-scan', {
      method: 'POST',
      body: JSON.stringify({ max_jobs: max_jobs || 10, target_role, target_ctc })
    }),
  getDiscoveryStatus: () => fetchApi<any>('/discovery/status'),
  getTaxonomy: () => fetchApi<any>('/discovery/taxonomy'),
  normalizeJobTitle: (title: string) =>
    fetchApi<any>('/discovery/normalize-title', {
      method: 'POST',
      body: JSON.stringify({ title })
    }),

  // ⚡ 24/7 Autonomous Career Auto-Pilot
  getAutopilotStatus: () => fetchApi<any>('/career-agent/autopilot/status'),
  toggleAutopilot: (data: { is_active?: boolean; mode?: string }) =>
    fetchApi<any>('/career-agent/autopilot/toggle', { method: 'POST', body: JSON.stringify(data) }),
  updateAutopilotSettings: (data: {
    min_match_threshold?: number;
    daily_max_applications?: number;
    min_salary_lpa?: number;
    auto_followup_enabled?: boolean;
    auto_inbox_sync_enabled?: boolean;
    cycle_interval_minutes?: number;
  }) => fetchApi<any>('/career-agent/autopilot/settings', { method: 'POST', body: JSON.stringify(data) }),
  getAutopilotLogs: (limit?: number) => fetchApi<any>(`/career-agent/autopilot/logs?limit=${limit || 50}`),
  triggerAutopilotCycle: () => fetchApi<any>('/career-agent/autopilot/trigger-now', { method: 'POST' }),

  // 🎯 Autonomous Recruiter Headhunter
  getVerifiedRecruiters: () => fetchApi<any[]>('/recruiters/headhunter/verified-targets'),
  generateRecruiterPitch: (data: { recruiter_name: string; company_name: string; recruiter_role?: string; candidate_skills?: string; candidate_projects?: string }) =>
    fetchApi<any>('/recruiters/headhunter/generate-pitch', { method: 'POST', body: JSON.stringify(data) }),

  // 🏢 Autonomous Executive Company Dossier
  getExecutiveCompanyDossier: (companyName: string, role?: string) =>
    fetchApi<any>(`/interviews/dossier/${encodeURIComponent(companyName)}?role=${encodeURIComponent(role || '')}`),

  // 💰 Autonomous Multi-Offer & Counter-Offer Negotiator
  generateCounterOfferPlaybook: (data: {
    company_name: string;
    role_title: string;
    offered_base_lpa: number;
    offered_variable_lpa?: number;
    offered_esops_lpa?: number;
    offered_joining_bonus_lpa?: number;
    competing_offers_count?: number;
    competing_highest_ctc_lpa?: number;
  }) => fetchApi<any>('/offers/negotiate', { method: 'POST', body: JSON.stringify(data) }),

  // 📱 Autonomous Mobile Notification Gateway
  sendTestMobileAlert: (data: { title: string; message: string; priority?: string; webhook_url?: string }) =>
    fetchApi<any>('/notifications/mobile/test-alert', { method: 'POST', body: JSON.stringify(data) })
};
