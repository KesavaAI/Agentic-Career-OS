import React, { useState, useEffect } from 'react';
import {
  TrendingUp, Users, FileText, Send, Flame, Sparkles, ChevronRight,
  AlertTriangle, CheckCircle2, Clock, ArrowUpRight, ArrowRight, Trophy, Briefcase,
  Mic, GraduationCap, RefreshCw, Mail, BellRing, Compass, BookOpen, Check, X,
  Shield, Code, Zap
} from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

interface DashboardViewProps {
  onNavigateTab: (tab: string) => void;
  onOpenPrepare: (jobId: number) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigateTab, onOpenPrepare }) => {
  const { user } = useAuth();
  const [priorities, setPriorities] = useState<any | null>(null);
  const [readiness, setReadiness] = useState<any | null>(null);
  const [funnel, setFunnel] = useState<any | null>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Interactive Flashcard Modal State
  const [activeFlashcard, setActiveFlashcard] = useState<any | null>(null);
  const [submittingRecall, setSubmittingRecall] = useState(false);
  const [recallSuccessMsg, setRecallSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [pData, rData, fData, aData] = await Promise.all([
        api.getTodayPriorities().catch(() => null),
        api.getReadinessScore().catch(() => null),
        api.getFunnelAnalytics().catch(() => null),
        api.getApplications().catch(() => [])
      ]);
      setPriorities(pData);
      setReadiness(rData);
      setFunnel(fData);
      setApplications(aData);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getDailyVerbalDefense = () => {
    const role = (user?.target_role || '').toLowerCase();
    const pool = (user?.candidate_pool || 'EXPERIENCED').toUpperCase();
    const exp = parseFloat(String(user?.experience_years || '2'));
    const isFresher = pool === 'FRESHER' || exp < 1.5 || role.includes('fresher') || role.includes('intern') || role.includes('campus') || role.includes('junior');

    // 1. Fresher / Campus Hires / Entry Level
    if (isFresher) {
      return {
        tag: 'DSA & CS Fundamentals (Campus Hire)',
        question: 'Explain the internal bucket mechanics of a HashMap in memory. How does it handle hash collisions, when does it convert linked buckets into balanced red-black trees, and how does load factor trigger rehashing?'
      };
    }
    // 2. Java / Spring Boot Backend
    if (role.includes('java') || role.includes('spring')) {
      return {
        tag: 'Java & Spring Boot Architecture',
        question: 'How do Java 21 Virtual Threads (Project Loom) prevent OS thread pool exhaustion under 50,000 req/sec, and what coding patterns cause virtual thread carrier pinning?'
      };
    }
    // 3. Generative AI / Agentic AI
    if (role.includes('genai') || role.includes('agent') || role.includes('llm') || role.includes('ai engineer') || role.includes('rag')) {
      return {
        tag: 'Agentic AI & Multi-Agent Architecture',
        question: 'How do you design cyclic multi-agent recovery loops with LangGraph StateGraphs, and how do you enforce deterministic recursion limits and AST SQL guardrails?'
      };
    }
    // 4. DevOps / SRE / Cloud
    if (role.includes('devops') || role.includes('sre') || role.includes('kubernetes') || role.includes('cloud') || role.includes('platform')) {
      return {
        tag: 'DevOps & Site Reliability (SRE)',
        question: 'How do you structure Kubernetes Pod Disruption Budgets (PDB) and preStop lifecycle hooks to eliminate dropped connections during automated rolling cluster upgrades?'
      };
    }
    // 5. Data Science / Machine Learning
    if (role.includes('data science') || role.includes('data scientist') || role.includes('machine learning') || role.includes('ml')) {
      return {
        tag: 'Data Science & Statistical ML',
        question: 'How do you detect feature and concept drift in production ML pipelines using Population Stability Index (PSI), and how do you automate model retraining?'
      };
    }
    // 6. QA / SDET / Automation
    if (role.includes('qa') || role.includes('sdet') || role.includes('test') || role.includes('automation')) {
      return {
        tag: 'QA Automation & Contract Testing',
        question: 'How do you architect resilient Playwright test suites using BrowserContext fixtures and accessibility locators to completely eliminate flaky UI tests in CI/CD?'
      };
    }
    // 7. Frontend / React
    if (role.includes('frontend') || role.includes('react') || role.includes('vue') || role.includes('angular') || role.includes('ui')) {
      return {
        tag: 'Frontend & Core Web Vitals',
        question: 'How do you optimize initial page load performance with Server Components and Streaming HTML, and how do you achieve an INP score under 50ms in high-traffic web apps?'
      };
    }
    // 8. Full Stack / Web Development
    if (role.includes('full stack') || role.includes('fullstack') || role.includes('web')) {
      return {
        tag: 'Full Stack & Web Architecture',
        question: 'How do you optimize initial page load performance with Next.js SSR, and how do you handle state synchronization across optimistic UI updates and backend WebSockets?'
      };
    }
    // 9. Universal Engineering Fallback
    return {
      tag: `${user?.target_role || 'System'} Architecture & Reliability`,
      question: `As a ${user?.target_role || 'Senior Engineer'}, walk me through how you design high-availability fault tolerance, automated error recovery, and performance metrics in your flagship project.`
    };
  };

  const dailyDefense = getDailyVerbalDefense();

  const ghostingApps = applications.filter(a => {
    const applied = new Date(a.applied_date || a.created_at || Date.now());
    const daysAgo = (Date.now() - applied.getTime()) / (1000 * 3600 * 24);
    return daysAgo >= 4 && (a.status === 'APPLIED' || a.status === 'RECRUITER CONTACTED');
  });

  const topGhost = ghostingApps.length > 0 ? ghostingApps[0] : (applications.length > 0 ? applications[0] : null);

  // Active top learning flashcard for daily standup
  const topFlashcard = priorities?.learn_topics?.[0] || {
    id: 1,
    skill: 'Next.js 15 SSR, Streaming & Hydration Performance',
    category: 'Full Stack Architecture',
    stage: 'RECALL',
    status: 'YELLOW'
  };

  const handleOpenFlashcardModal = (topic: any) => {
    // Parse notes if JSON string or provide comprehensive fallback
    let parsedNotes: any = null;
    try {
      if (topic.notes) parsedNotes = JSON.parse(topic.notes);
    } catch {}

    const fullCard = {
      ...topic,
      category: topic.category || 'Core Engineering Architecture',
      mental_models: parsedNotes?.mental_models || [
        `Understand the core execution pipeline and trade-offs of ${topic.skill}.`,
        'Identify where network, database, or CPU bottlenecks occur in high-scale production.',
        'Apply resilient failure recovery and circuit breakers.'
      ],
      interviewer_trap: parsedNotes?.interviewer_trap || 'Interviewers trap you by asking: What happens under sudden 10x traffic spikes? Explain how your caching/pooling prevents cascading failures.',
      code_anchor: parsedNotes?.code_anchor || '// Production verified implementation pattern',
      metric_defense: parsedNotes?.metric_defense || 'Reduced P99 latency by 75% and eliminated connection timeouts.'
    };

    setActiveFlashcard(fullCard);
    setRecallSuccessMsg(null);
  };

  const handleAdvanceRecall = async (resultState: 'GREEN' | 'YELLOW') => {
    if (!activeFlashcard) return;
    try {
      setSubmittingRecall(true);
      await api.recallCheckin({
        topic_id: activeFlashcard.id,
        result_state: resultState,
        notes: `Reviewed on ${new Date().toLocaleDateString('en-IN')}`
      });

      setRecallSuccessMsg(resultState === 'GREEN' ? '🎉 Mastered! Advanced to Next Spaced Recall Stage.' : 'Recorded review. Queued for 24h follow-up.');
      setTimeout(() => {
        setActiveFlashcard(null);
        setRecallSuccessMsg(null);
        loadDashboardData();
      }, 1200);
    } catch (err) {
      console.error('Failed to log recall:', err);
    } finally {
      setSubmittingRecall(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[450px]">
        <div className="space-y-3 text-center">
          <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-400 font-semibold">Loading live career intelligence & dynamic pipeline stats...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* 🟢 TOP BANNER: APPLICANT HERO & DREAM READINESS */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 shadow-xl flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="text-xs font-extrabold text-emerald-400 uppercase tracking-wider">
              {user?.full_name || 'Candidate'} • {user?.target_role || 'Full Stack Engineer'}
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-100 tracking-tight">
            Targeting Dream Package of <span className="text-emerald-400">₹{user?.target_min_ctc_lpa || '7.0'}+ LPA</span>
          </h2>
          <p className="text-xs text-slate-400">
            Autonomous discovery active across Ashby, Greenhouse, Lever & Himalayas. Live pipeline synchronized.
          </p>
        </div>

        {/* Readiness Gauge */}
        <div className="flex items-center gap-4 bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 shrink-0">
          <div className="relative flex items-center justify-center w-12 h-12">
            <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-800"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-emerald-500"
                strokeDasharray={`${readiness?.overall_score || 88}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute font-extrabold text-sm text-slate-100">{readiness?.overall_score || 88}%</span>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Dream Package Readiness</p>
            <p className="text-xs font-bold text-emerald-400">Target Threshold: 85%+</p>
            <button
              onClick={() => onNavigateTab('analytics')}
              className="text-[11px] text-slate-300 hover:text-white underline mt-0.5 flex items-center gap-0.5 cursor-pointer"
            >
              <span>View Breakdown</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* 🚀 8-PILLAR AUTOPILOT WORKFLOW RIBBON */}
      <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md">
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 text-xs scrollbar-thin">
          {[
            { label: 'Opportunity Engine', icon: '🎯', tab: 'discovery', color: 'text-cyan-400' },
            { label: 'Application Hub', icon: '📋', tab: 'applications', color: 'text-emerald-400' },
            { label: 'Interview Center', icon: '🎙️', tab: 'interview-center', color: 'text-purple-400' },
            { label: 'Resume Lab', icon: '📄', tab: 'resumes', color: 'text-teal-400' },
            { label: 'AI Mock Lab', icon: '⚡', tab: 'mock-interview', color: 'text-amber-400' },
            { label: 'Career Agent', icon: '🤖', tab: 'career-agent', color: 'text-indigo-400' },
            { label: 'Market Intel', icon: '📈', tab: 'market', color: 'text-blue-400' },
            { label: 'Career Analytics', icon: '📊', tab: 'analytics', color: 'text-rose-400' },
            { label: 'Offer Center', icon: '💼', tab: 'offers', color: 'text-yellow-400' },
          ].map((pillar, idx) => (
            <button
              key={idx}
              onClick={() => onNavigateTab(pillar.tab)}
              className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-slate-950/70 hover:bg-slate-800/80 border border-slate-800/80 hover:border-slate-700 transition-all cursor-pointer min-w-[105px] shrink-0 group"
            >
              <span className="text-base mb-1 group-hover:scale-110 transition-transform">{pillar.icon}</span>
              <span className={`text-[10px] font-bold ${pillar.color} uppercase text-center leading-tight tracking-tight`}>
                {pillar.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ☀️ 15-MINUTE DAILY AI CAREER STANDUP */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-950/40 via-slate-900 to-slate-900 border border-purple-500/30 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-100 flex items-center gap-2">
                <span>DAILY 15-MINUTE AI CAREER STANDUP</span>
                <span className="text-[10px] font-mono bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded border border-purple-500/30">
                  Priority Action Queue
                </span>
              </h3>
              <p className="text-xs text-slate-400">Complete these 3 high-ROI actions to maintain momentum toward your dream package offer.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          {/* Action 1: Mock Question of the Day */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between space-y-2.5">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-[10px] uppercase text-purple-400 flex items-center gap-1">
                  <Mic className="w-3 h-3" />
                  <span>5-Min Verbal Defense</span>
                </span>
                <span className="text-[10px] text-slate-500 font-mono">{dailyDefense.tag}</span>
              </div>
              <p className="font-semibold text-slate-200 mt-1.5 leading-snug line-clamp-3">
                "{dailyDefense.question}"
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('mock-interview')}
              className="w-full py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Practice Aloud</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Action 2: 60-Sec Technical Revision Flashcard */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between space-y-2.5">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-[10px] uppercase text-amber-400 flex items-center gap-1">
                  <GraduationCap className="w-3 h-3" />
                  <span>60-Sec Daily Revision</span>
                </span>
                <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">Due Today</span>
              </div>
              <p className="font-semibold text-slate-200 mt-1.5 leading-snug line-clamp-2">
                {topFlashcard.skill}
              </p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-900 text-slate-400 border border-slate-800">
                  Stage: {topFlashcard.stage}
                </span>
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  {topFlashcard.status}
                </span>
              </div>
            </div>
            <button
              onClick={() => handleOpenFlashcardModal(topFlashcard)}
              className="w-full py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Review Flashcard (60s)</span>
            </button>
          </div>

          {/* Action 3: Ghosting Radar & Outreach */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between space-y-2.5">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-[10px] uppercase text-blue-400 flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  <span>Ghosting Radar</span>
                </span>
                <span className="text-[10px] font-mono text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded">1-Click Outreach</span>
              </div>
              <p className="font-semibold text-slate-200 mt-1.5 leading-snug line-clamp-2">
                {topGhost
                  ? `${topGhost.company_name} — ${topGhost.role_title || topGhost.role || 'Engineering Role'} (${topGhost.status || 'Active'}) awaiting recruiter update.`
                  : 'All applications are on track. No ghosting detected across your pipeline.'}
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('follow-ups')}
              className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Manage Follow-Ups</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* TODAY'S PRIORITIES - THE CORE PHILOSOPHY */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
            <h3 className="text-base font-extrabold text-slate-100 tracking-tight">TODAY'S PRIORITIES (ACTION QUEUE)</h3>
          </div>
          <span className="text-xs text-slate-400 font-medium">Auto-updated based on market matches, deadlines & spaced repetition</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* 1. APPLY TODAY */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-md flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-orange-500/20 text-orange-400">
                    <Flame className="w-4 h-4" />
                  </span>
                  <h4 className="font-bold text-xs text-slate-200">🔥 APPLY TODAY</h4>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-orange-500/20 text-orange-300">
                  {priorities?.apply_today?.length ?? 0} Tier-A Ready
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mb-3">High-match jobs (₹{user?.target_min_ctc_lpa || '7.0'}+ LPA) ready for tailored application.</p>
              <div className="space-y-2">
                {priorities?.apply_today?.slice(0, 3).map((job: any) => (
                  <div key={job.id} className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 flex items-center justify-between">
                    <div className="truncate mr-2">
                      <p className="font-bold text-xs text-slate-200 truncate">{job.role}</p>
                      <p className="text-[11px] text-slate-400 truncate">{job.company} • <span className="text-emerald-400 font-semibold">{job.salary}</span></p>
                    </div>
                    <button
                      onClick={() => onOpenPrepare(job.id)}
                      className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[11px] rounded transition-colors shrink-0 cursor-pointer"
                    >
                      Prepare
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('discovery')}
              className="mt-3 text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 self-end cursor-pointer"
            >
              <span>View All Tier-A Jobs</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* 2. FOLLOW UP */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-md flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400">
                    <BellRing className="w-4 h-4" />
                  </span>
                  <h4 className="font-bold text-xs text-slate-200">📩 FOLLOW UP</h4>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">
                  {priorities?.follow_ups?.length ?? 0} Action Items
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mb-3">Applications waiting 4-7+ days without recruiter response.</p>
              <div className="space-y-2">
                {priorities?.follow_ups?.slice(0, 3).map((item: any) => (
                  <div key={item.id} className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 flex items-center justify-between">
                    <div className="truncate mr-2">
                      <p className="font-bold text-xs text-slate-200 truncate">{item.company}</p>
                      <p className="text-[11px] text-slate-400 truncate">{item.role} • <span className="text-amber-400">{item.action}</span></p>
                    </div>
                    <button
                      onClick={() => onNavigateTab('follow-ups')}
                      className="px-2 py-1 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-[11px] rounded transition-colors shrink-0 cursor-pointer"
                    >
                      Follow-up
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('follow-ups')}
              className="mt-3 text-[11px] font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 self-end cursor-pointer"
            >
              <span>Manage Follow-ups</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* 3. INTERVIEW PIPELINE */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-md flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400">
                    <Mic className="w-4 h-4" />
                  </span>
                  <h4 className="font-bold text-xs text-slate-200">🎙️ INTERVIEW PIPELINE</h4>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">
                  {priorities?.interviews?.length ?? 0} Scheduled
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mb-3">Upcoming technical rounds & required interview packs.</p>
              <div className="space-y-2">
                {priorities?.interviews && priorities.interviews.length > 0 ? (
                  priorities.interviews.slice(0, 3).map((item: any) => (
                    <div key={item.id} className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 flex items-center justify-between">
                      <div className="truncate mr-2">
                        <p className="font-bold text-xs text-slate-200 truncate">{item.company}</p>
                        <p className="text-[11px] text-purple-300 truncate">{item.role} • {item.stage}</p>
                      </div>
                      <button
                        onClick={() => onNavigateTab('interview-center')}
                        className="px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white font-bold text-[11px] rounded transition-colors shrink-0 cursor-pointer"
                      >
                        Prep
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center rounded-lg bg-slate-950/40 border border-slate-800/50">
                    <p className="text-[11px] text-slate-400">⚡ Top 50 Production Scenarios available for all active applications.</p>
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('interview-center')}
              className="mt-3 text-[11px] font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1 self-end cursor-pointer"
            >
              <span>Open Interview Center</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* 4. CRITICAL CONCEPT FLASHCARDS */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-md flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                    <GraduationCap className="w-4 h-4" />
                  </span>
                  <h4 className="font-bold text-xs text-slate-200">🎯 CONCEPT FLASHCARDS</h4>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                  {priorities?.learn_topics?.length ?? 0} Due
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mb-3">Role-tailored revision topics (Day 0, 1, 3, 7, 14, 30).</p>
              <div className="space-y-2">
                {priorities?.learn_topics?.slice(0, 3).map((item: any) => (
                  <div
                    key={item.id}
                    onClick={() => handleOpenFlashcardModal(item)}
                    className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 hover:border-amber-500/40 transition-all flex items-center justify-between cursor-pointer group"
                  >
                    <div className="truncate mr-2">
                      <p className="font-bold text-xs text-slate-200 truncate group-hover:text-amber-300 transition-colors">{item.skill}</p>
                      <p className="text-[11px] text-slate-400">Stage: <span className="font-semibold text-slate-300">{item.stage}</span></p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded shrink-0 ${
                      item.status === 'GREEN'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('learning')}
              className="mt-3 text-[11px] font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 self-end cursor-pointer"
            >
              <span>Review Learning Plan</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* 5. RESUME TAILORING */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-md flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-teal-500/20 text-teal-400">
                    <FileText className="w-4 h-4" />
                  </span>
                  <h4 className="font-bold text-xs text-slate-200">📄 RESUME TAILORING</h4>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-500/20 text-teal-300">
                  {priorities?.resume_tailor?.length ?? 0} Queued
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mb-3">Optimize keyword density & Google STAR bullets per JD.</p>
              <div className="space-y-2">
                {priorities?.resume_tailor?.slice(0, 3).map((item: any) => (
                  <div key={item.id} className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 flex items-center justify-between">
                    <div className="truncate mr-2">
                      <p className="font-bold text-xs text-slate-200 truncate">{item.role}</p>
                      <p className="text-[11px] text-slate-400 truncate">{item.company}</p>
                    </div>
                    <button
                      onClick={() => onOpenPrepare(item.id)}
                      className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-[11px] rounded transition-colors shrink-0 cursor-pointer"
                    >
                      Tailor
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('resumes')}
              className="mt-3 text-[11px] font-semibold text-teal-400 hover:text-teal-300 flex items-center gap-1 self-end cursor-pointer"
            >
              <span>Open Resume Center</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* 6. NEW OPPORTUNITIES */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-md flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                    <Compass className="w-4 h-4" />
                  </span>
                  <h4 className="font-bold text-xs text-slate-200">🌐 NEW TODAY</h4>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                  {priorities?.new_opportunities?.length ?? 0} Ingested
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mb-3">Fresh tech opportunities matching your target package.</p>
              <div className="space-y-2">
                {priorities?.new_opportunities?.slice(0, 3).map((job: any) => (
                  <div key={job.id} className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 flex items-center justify-between">
                    <div className="truncate mr-2">
                      <p className="font-bold text-xs text-slate-200 truncate">{job.role}</p>
                      <p className="text-[11px] text-slate-400 truncate">{job.company} • {job.location}</p>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-semibold shrink-0">
                      {job.freshness}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('discovery')}
              className="mt-3 text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 self-end cursor-pointer"
            >
              <span>Explore Discovery</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Funnel Metrics & Quick Stats */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
        <h3 className="text-sm font-extrabold text-slate-200 uppercase tracking-wider mb-4">Application Funnel Health (Live Database Stats)</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <p className="text-[10px] font-bold text-slate-500 uppercase">Jobs Found</p>
            <p className="text-xl font-extrabold text-slate-100 mt-1">{funnel?.jobs_found ?? 0}</p>
            <p className="text-[10px] text-emerald-400 mt-0.5">100% Relevant</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <p className="text-[10px] font-bold text-slate-500 uppercase">Tier A / B</p>
            <p className="text-xl font-extrabold text-emerald-400 mt-1">{funnel?.tier_a_b_jobs ?? 0}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">High Target Fit</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <p className="text-[10px] font-bold text-slate-500 uppercase">Applications</p>
            <p className="text-xl font-extrabold text-blue-400 mt-1">{funnel?.applications_submitted ?? 0}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">User Confirmed</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <p className="text-[10px] font-bold text-slate-500 uppercase">Responses</p>
            <p className="text-xl font-extrabold text-indigo-400 mt-1">{funnel?.recruiter_responses ?? 0}</p>
            <p className="text-[10px] text-emerald-400 mt-0.5">
              {(funnel?.recruiter_responses ?? 0) > 0 ? `${funnel?.response_rate_pct ?? 0}% Rate` : 'Awaiting Replies'}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <p className="text-[10px] font-bold text-slate-500 uppercase">Interviews</p>
            <p className="text-xl font-extrabold text-purple-400 mt-1">{funnel?.interviews_attended ?? 0}</p>
            <p className="text-[10px] text-purple-300 mt-0.5">
              {(funnel?.interviews_attended ?? 0) > 0 ? `${funnel?.interview_rate_pct ?? 0}% Rate` : 'In Preparation'}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <p className="text-[10px] font-bold text-slate-500 uppercase">Final Rounds</p>
            <p className="text-xl font-extrabold text-amber-400 mt-1">{funnel?.final_rounds ?? 0}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              {(funnel?.final_rounds ?? 0) > 0 ? 'Managerial / HR' : 'In Pipeline'}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <p className="text-[10px] font-bold text-slate-500 uppercase">Offers</p>
            <p className="text-xl font-extrabold text-emerald-400 mt-1">{funnel?.offers_received ?? 0}</p>
            <p className="text-[10px] text-emerald-400 mt-0.5 font-bold">
              {(funnel?.offers_received ?? 0) > 0 ? 'Active Offer' : 'Target: ₹7.0+ LPA'}
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ⚡ INTERACTIVE 60-SEC TECHNICAL FLASHCARD MODAL */}
      {/* ========================================================================= */}
      {activeFlashcard && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setActiveFlashcard(null)}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="space-y-1 pr-6">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
                  {activeFlashcard.category || 'Architecture Revision'}
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  Current Stage: <strong>{activeFlashcard.stage}</strong>
                </span>
              </div>
              <h3 className="text-base font-extrabold text-slate-100">
                {activeFlashcard.skill}
              </h3>
            </div>

            {/* Success Alert */}
            {recallSuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-bounce">
                <CheckCircle2 className="w-4 h-4" />
                <span>{recallSuccessMsg}</span>
              </div>
            )}

            {/* 3 Core Mental Models */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <h4 className="font-extrabold text-xs text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" />
                <span>3 Key Mental Models (What to recite)</span>
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {activeFlashcard.mental_models?.map((bullet: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-amber-400 font-bold">•</span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Interviewer Trap Warning */}
            {activeFlashcard.interviewer_trap && (
              <div className="p-3 rounded-xl bg-red-950/30 border border-red-500/30 text-xs text-red-200/90 leading-relaxed">
                <strong className="text-red-400">⚠️ Interviewer Trap:</strong> {activeFlashcard.interviewer_trap}
              </div>
            )}

            {/* Metric Proof Point */}
            {activeFlashcard.metric_defense && (
              <div className="p-2.5 rounded-lg bg-purple-950/30 border border-purple-800/40 text-[11px] text-purple-300 font-mono flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <span><strong>Metric Anchor:</strong> {activeFlashcard.metric_defense}</span>
              </div>
            )}

            {/* Actions */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => handleAdvanceRecall('YELLOW')}
                disabled={submittingRecall}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Needs Review (Day 1)
              </button>

              <button
                type="button"
                onClick={() => handleAdvanceRecall('GREEN')}
                disabled={submittingRecall}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>✅ Mark as Mastered (Advance Stage)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
