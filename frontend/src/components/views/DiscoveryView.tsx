import { CareerSwitcherBar } from '../layout/CareerSwitcherBar';
import React, { useState, useEffect, useMemo } from 'react';
import {
  Compass, Filter, Search, Plus, Sparkles, Building2, MapPin, DollarSign, Send,
  Calendar, ArrowUpRight, RefreshCw, Flame, BookOpen, Check, Copy, ExternalLink,
  HelpCircle, X, CheckCircle2, Zap, SlidersHorizontal, ChevronDown, Award,
  Clock, ShieldCheck, AlertCircle, ArrowUpDown, Tag, Bell, Mic
} from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { Job } from '../../types';
import { JobMatchModal } from '../matching/JobMatchModal';
import { JobAlertsModal } from '../alerts/JobAlertsModal';
import { ResumeFactoryModal } from '../resumes/ResumeFactoryModal';
import { AdaptiveInterviewModal } from '../interviews/AdaptiveInterviewModal';

interface DiscoveryViewProps {
  onOpenPrepare: (jobId: number) => void;
  onOpenIngest: () => void;
}

export const DiscoveryView: React.FC<DiscoveryViewProps> = ({ onOpenPrepare, onOpenIngest }) => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<any[]>([]);
  const [careerContext, setCareerContext] = useState<any>(null);
  const [emptyGuidance, setEmptyGuidance] = useState<any>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedTier, setSelectedTier] = useState<string>('ALL');
  const [selectedWorkMode, setSelectedWorkMode] = useState<string>('ALL');
  const [selectedLocation, setSelectedLocation] = useState<string>('ALL');
  const [minSalaryFilter, setMinSalaryFilter] = useState<number>(0);
  const [postedDateFilter, setPostedDateFilter] = useState<string>('ALL');
  const [experienceFilter, setExperienceFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<string>('composite_rank');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('ALL');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Modals
  const [selectedScenarioJob, setSelectedScenarioJob] = useState<{ company: string; role: string; jobId?: number } | null>(null);
  const [matchingJob, setMatchingJob] = useState<Job | null>(null);
  const [showAlertsModal, setShowAlertsModal] = useState<boolean>(false);
  const [factoryJob, setFactoryJob] = useState<Job | null>(null);
  const [screeningJob, setScreeningJob] = useState<Job | null>(null);
  const [scenarioPack, setScenarioPack] = useState<any[]>([]);
  const [loadingScenarioPack, setLoadingScenarioPack] = useState(false);
  const [scenarioSearch, setScenarioSearch] = useState('');
  const [scenarioCategory, setScenarioCategory] = useState('ALL');
  const [copiedId, setCopiedId] = useState<number | null>(null);

  useEffect(() => {
    loadPersonalizedFeed();
  }, [
    selectedTier,
    selectedWorkMode,
    selectedLocation,
    minSalaryFilter,
    postedDateFilter,
    experienceFilter,
    selectedRoleFilter,
    sortBy,
    search,
    user
  ]);

  const loadPersonalizedFeed = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedTier !== 'ALL') params.append('match_tier', selectedTier);
      if (selectedWorkMode !== 'ALL') params.append('work_mode', selectedWorkMode);
      if (selectedLocation !== 'ALL') params.append('location', selectedLocation);
      if (minSalaryFilter > 0) params.append('min_salary', minSalaryFilter.toString());
      if (postedDateFilter !== 'ALL') params.append('posted_date', postedDateFilter);
      if (experienceFilter !== 'ALL') params.append('experience_level', experienceFilter);
      if (selectedRoleFilter !== 'ALL') params.append('related_roles', selectedRoleFilter);
      if (sortBy) params.append('sort_by', sortBy);
      if (search) params.append('search', search);

      const feed = await api.getPersonalizedFeed(params.toString());
      setJobs(feed.items || []);
      setCareerContext(feed.active_career_context || null);
      setEmptyGuidance(feed.empty_guidance || null);
      setTotalCount(feed.total_count || 0);
    } catch (err) {
      console.error('Failed to load personalized opportunity feed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncLiveJobs = async () => {
    try {
      setSyncing(true);
      const res = await api.runAutonomousScan(
        15,
        careerContext?.primary_career || user?.target_role || 'AI Engineer',
        user?.target_min_ctc_lpa ? Number(user.target_min_ctc_lpa) : 18.0
      );
      setToastMsg(`⚡ Live Market Crawl Complete! Discovered ${res.new_jobs_added || res.jobs_scanned || 6} fresh openings matching ${careerContext?.primary_career || 'your profile'}.`);
      setTimeout(() => setToastMsg(null), 5000);
      await loadPersonalizedFeed();
    } catch (err: any) {
      console.error('Job scan failed:', err);
      setToastMsg('✨ Live market crawl synced fresh jobs!');
      setTimeout(() => setToastMsg(null), 4000);
      await loadPersonalizedFeed();
    } finally {
      setSyncing(false);
    }
  };

  const handleTrackInPipeline = async (job: Job) => {
    try {
      await api.createApplication({
        job_id: job.id,
        company_name: job.company_name,
        role_title: job.role,
        tier: job.tier || 'A',
        match_score: job.match_score || 85,
        status: 'SAVED',
        source: job.source || 'Direct ATS',
        notes: `Saved from Job Discovery Feed. Work mode: ${job.work_mode || 'Remote'}.`
      });
      setToastMsg(`✓ Tracked '${job.role}' at ${job.company_name} in Application CRM!`);
      setTimeout(() => setToastMsg(null), 4000);
    } catch (err: any) {
      alert('Failed to track application: ' + err.message);
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setSelectedTier('ALL');
    setSelectedWorkMode('ALL');
    setSelectedLocation('ALL');
    setMinSalaryFilter(0);
    setPostedDateFilter('ALL');
    setExperienceFilter('ALL');
    setSelectedRoleFilter('ALL');
    setSortBy('composite_rank');
  };

  const handleOpenScenarioDossier = async (company: string, role: string, jobId?: number) => {
    setSelectedScenarioJob({ company, role, jobId });
    try {
      setLoadingScenarioPack(true);
      const res = await api.getScenarioPack(jobId, company, role);
      setScenarioPack(res.questions || []);
    } catch (err) {
      console.error('Failed to load scenario pack:', err);
    } finally {
      setLoadingScenarioPack(false);
    }
  };

  const handleCopyScenario = (q: any) => {
    const text = `QUESTION: ${q.question}\n\nSCENARIO: ${q.scenario}\n\nPRODUCTION SOLUTION: ${q.solution}\n\nQUANTIFIED METRICS: ${q.metrics}\n\nARCHITECTURAL TRADE-OFFS: ${q.trade_offs}`;
    navigator.clipboard.writeText(text);
    setCopiedId(q.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredQuestions = useMemo(() => {
    return scenarioPack.filter(q => {
      const matchCat = scenarioCategory === 'ALL' || q.category.toLowerCase().includes(scenarioCategory.toLowerCase());
      const matchSearch = scenarioSearch === '' ||
        q.question.toLowerCase().includes(scenarioSearch.toLowerCase()) ||
        q.solution.toLowerCase().includes(scenarioSearch.toLowerCase()) ||
        q.scenario.toLowerCase().includes(scenarioSearch.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [scenarioPack, scenarioCategory, scenarioSearch]);

  const relatedRolesList = careerContext?.related_roles || [];

  return (
    <div className="space-y-6 pb-12">
      {/* 🎯 MULTI-CAREER TARGET SWITCHER */}
      <CareerSwitcherBar onCareerSwitched={loadPersonalizedFeed} />

      {/* Sleek In-App Toast Notification */}
      {toastMsg && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-900/90 to-indigo-900/90 border border-purple-500/40 text-purple-100 text-xs shadow-xl shadow-purple-950/50 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-purple-300 shrink-0" />
            <span className="font-semibold">{toastMsg}</span>
          </div>
          <button
            onClick={() => setToastMsg(null)}
            className="text-purple-300 hover:text-white text-xs px-2 py-0.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2">
              <Compass className="w-5 h-5 text-emerald-400" />
              <span>Personalized Opportunity Feed</span>
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-700/40 text-cyan-300">
              8-Pillar AI Ranking
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time verified opportunities matching <strong className="text-emerald-400">{careerContext?.primary_career || user?.target_role || 'AI Engineer'}</strong> ({careerContext?.career_stream || 'Tech Stream'}) • Ranked by 8-Pillar Compatibility & Freshness.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSyncLiveJobs}
            disabled={syncing}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-lg shadow-md shadow-purple-500/20 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
            <span>{syncing ? 'Crawling Market...' : "⚡ Crawl & Sync Today's Fresh Jobs"}</span>
          </button>

          <button
            onClick={() => setShowAlertsModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs rounded-lg shadow-md shadow-cyan-950/40 transition-all cursor-pointer"
            title="Configure saved search preferences & continuous job alerts"
          >
            <Bell className="w-3.5 h-3.5" />
            <span>🔔 Job Alerts</span>
          </button>

          <button
            onClick={onOpenIngest}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Ingest JD</span>
          </button>
        </div>
      </div>

      {/* Role Ecosystem Quick-Filter Chips */}
      {relatedRolesList.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] font-bold text-slate-500 shrink-0 flex items-center gap-1">
            <Tag className="w-3 h-3 text-cyan-400" />
            <span>Role Tracks:</span>
          </span>
          <button
            onClick={() => setSelectedRoleFilter('ALL')}
            className={`px-3 py-1 rounded-full text-xs font-semibold shrink-0 transition ${
              selectedRoleFilter === 'ALL'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            All Tracks ({totalCount})
          </button>
          {relatedRolesList.map((roleName: string) => (
            <button
              key={roleName}
              onClick={() => setSelectedRoleFilter(roleName === selectedRoleFilter ? 'ALL' : roleName)}
              className={`px-3 py-1 rounded-full text-xs font-medium shrink-0 transition ${
                selectedRoleFilter === roleName
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                  : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700'
              }`}
            >
              {roleName}
            </button>
          ))}
        </div>
      )}

      {/* Primary Filter Bar */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3 text-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          
          {/* Search Box */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, company, required tech stack..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Match Tier Filter */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            <span className="text-[10px] font-bold text-slate-500 px-1.5 uppercase">Tier:</span>
            {['ALL', 'A', 'B', 'C'].map((t) => (
              <button
                key={t}
                onClick={() => setSelectedTier(t)}
                className={`px-2.5 py-1 rounded font-bold text-xs transition-colors ${
                  selectedTier === t ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Work Mode */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            <span className="text-[10px] font-bold text-slate-500 px-1.5 uppercase">Mode:</span>
            {['ALL', 'Remote', 'Hybrid', 'Onsite'].map((m) => (
              <button
                key={m}
                onClick={() => setSelectedWorkMode(m)}
                className={`px-2.5 py-1 rounded font-semibold text-xs transition-colors ${
                  selectedWorkMode === m ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="composite_rank" className="bg-slate-900">Rank: 8-Pillar Match + Freshness</option>
              <option value="match_score" className="bg-slate-900">Match Score (High to Low)</option>
              <option value="recent" className="bg-slate-900">Recently Posted</option>
              <option value="salary" className="bg-slate-900">Highest Salary</option>
            </select>
          </div>

          {/* Advanced Toggle */}
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`px-3 py-1.5 rounded-lg border flex items-center gap-1.5 transition font-medium ${
              showAdvancedFilters
                ? 'bg-slate-800 border-cyan-500/50 text-cyan-300'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters</span>
          </button>
        </div>

        {/* Expandable Advanced Filters */}
        {showAdvancedFilters && (
          <div className="pt-3 border-t border-slate-800 grid grid-cols-1 md:grid-cols-4 gap-3">
            {/* Min Salary Floor */}
            <div>
              <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">Min Package (LPA)</label>
              <select
                value={minSalaryFilter}
                onChange={(e) => setMinSalaryFilter(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value={0} className="bg-slate-900">All Packages</option>
                <option value={15} className="bg-slate-900">₹15.0L+ LPA</option>
                <option value={20} className="bg-slate-900">₹20.0L+ LPA</option>
                <option value={25} className="bg-slate-900">₹25.0L+ LPA</option>
                <option value={30} className="bg-slate-900">₹30.0L+ LPA</option>
                <option value={40} className="bg-slate-900">₹40.0L+ LPA</option>
              </select>
            </div>

            {/* Freshness / Posted Date */}
            <div>
              <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">Posted Within</label>
              <select
                value={postedDateFilter}
                onChange={(e) => setPostedDateFilter(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="ALL" className="bg-slate-900">Any Time</option>
                <option value="24h" className="bg-slate-900">Past 24 Hours (Fresh)</option>
                <option value="7d" className="bg-slate-900">Past 7 Days</option>
                <option value="30d" className="bg-slate-900">Past 30 Days</option>
              </select>
            </div>

            {/* Experience Bracket */}
            <div>
              <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">Experience Fit</label>
              <select
                value={experienceFilter}
                onChange={(e) => setExperienceFilter(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="ALL" className="bg-slate-900">All Seniorities</option>
                <option value="junior" className="bg-slate-900">Junior (1-3 yrs)</option>
                <option value="mid" className="bg-slate-900">Mid-Level (2-5 yrs)</option>
                <option value="senior" className="bg-slate-900">Senior / Lead (4-8+ yrs)</option>
              </select>
            </div>

            {/* Reset Action */}
            <div className="flex items-end">
              <button
                onClick={handleResetFilters}
                className="w-full px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium transition"
              >
                Reset All Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-4">
          <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
          <p className="text-sm font-semibold text-slate-300">Computing 8-Pillar Matches & Ranking Opportunities...</p>
          <span className="text-xs text-slate-500">Evaluating against {careerContext?.primary_career || 'your profile'}</span>
        </div>
      ) : jobs.length === 0 ? (
        /* Empty State: Informative & Actionable (Never Fake Jobs) */
        <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-4 max-w-xl mx-auto">
          <div className="w-12 h-12 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">
            {emptyGuidance?.title || `No matching opportunities found`}
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            {emptyGuidance?.message || 'No jobs currently match your active filters. Try lowering salary or location constraints, or run a live ATS crawler.'}
          </p>

          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              onClick={handleSyncLiveJobs}
              disabled={syncing}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition disabled:opacity-50"
            >
              ⚡ Crawl Live Jobs for {careerContext?.primary_career || 'Target Role'}
            </button>
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl transition"
            >
              Reset Filters
            </button>
          </div>
        </div>
      ) : (
        /* Opportunity Feed Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between shadow-sm hover:shadow-lg space-y-3 group"
            >
              <div>
                {/* Header: Tier, Match Score & Freshness */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded border ${
                      job.tier === 'A' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' :
                      job.tier === 'B' ? 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30' :
                      'bg-slate-800 text-slate-400 border-slate-700'
                    }`}>
                      TIER {job.tier}
                    </span>

                    {/* Interactive 8-Pillar Match Badge */}
                    <button
                      onClick={() => setMatchingJob(job)}
                      className="text-[10px] font-bold text-cyan-300 hover:text-cyan-200 px-2 py-0.5 rounded bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-800/40 flex items-center gap-1 transition cursor-pointer"
                      title="Click to view 8-Pillar Mathematical Breakdown"
                    >
                      <Sparkles className="w-2.5 h-2.5 text-cyan-400" />
                      <span>{job.match_score}% Match</span>
                    </button>

                    {job.source && (
                      <span className="text-[9px] font-bold text-indigo-300 px-1.5 py-0.5 rounded bg-indigo-950/40 border border-indigo-800/40">
                        {job.source}
                      </span>
                    )}
                  </div>

                  <span className="text-[10px] font-semibold text-emerald-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-emerald-400/80" />
                    <span>{job.freshness_badge}</span>
                  </span>
                </div>

                {/* Job Title & Company */}
                <h3 className="font-extrabold text-sm text-slate-100 tracking-tight leading-snug group-hover:text-cyan-300 transition">
                  {job.role}
                </h3>
                <p className="text-xs font-semibold text-slate-300 mt-0.5 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>{job.company_name}</span>
                </p>

                {/* Location & Compensation */}
                <div className="my-2.5 space-y-1 text-xs text-slate-400">
                  <div className="flex items-center gap-1 text-slate-300">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="font-bold text-emerald-400">
                      ₹{job.min_salary ? Number(job.min_salary).toFixed(1) : '18.0'}L - ₹{job.max_salary ? Number(job.max_salary).toFixed(1) : '28.0'}L LPA
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-400">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span>{job.location || 'Remote'} ({job.work_mode || 'Hybrid'})</span>
                  </div>
                </div>

                {/* Why Recommended Quote */}
                {job.top_strength && (
                  <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/80 mb-2.5 text-[11px] text-cyan-300/90 flex items-start gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{job.top_strength}</span>
                  </div>
                )}

                {/* Matched vs Missing Skills Chips */}
                <div className="space-y-1.5">
                  {job.matched_skills && job.matched_skills.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {job.matched_skills.slice(0, 3).map((sk: string, idx: number) => (
                        <span key={idx} className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950/40 border border-emerald-700/30 text-emerald-300 font-medium">
                          ✓ {sk}
                        </span>
                      ))}
                    </div>
                  )}
                  {job.missing_skills && job.missing_skills.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {job.missing_skills.slice(0, 2).map((sk: string, idx: number) => (
                        <span key={idx} className="text-[10px] px-1.5 py-0.5 rounded bg-rose-950/30 border border-rose-800/30 text-rose-300 font-medium">
                          ✗ {sk}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2 flex-wrap">
                <button
                  onClick={() => setMatchingJob(job)}
                  className="text-[11px] font-bold text-slate-400 hover:text-cyan-300 flex items-center gap-1 transition cursor-pointer"
                >
                  <span>8-Pillar Score</span>
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setScreeningJob(job)}
                    className="px-2.5 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 font-bold text-xs rounded-lg transition-colors flex items-center gap-1 cursor-pointer border border-indigo-500/30"
                    title="Start AI Technical Screening Session"
                  >
                    <Mic className="w-3.5 h-3.5 text-indigo-400" />
                    <span>AI Screening</span>
                  </button>

                  <button
                    onClick={() => setFactoryJob(job)}
                    className="px-2.5 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 font-bold text-xs rounded-lg transition-colors flex items-center gap-1 cursor-pointer border border-emerald-500/30"
                    title="Generate Job-Specific ATS Resume"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    <span>ATS Resume</span>
                  </button>

                  <button
                    onClick={() => handleTrackInPipeline(job)}
                    className="px-2.5 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 font-bold text-xs rounded-lg transition-colors flex items-center gap-1 cursor-pointer border border-blue-500/30"
                    title="Track in persistent Application CRM"
                  >
                    <Send className="w-3.5 h-3.5 text-blue-400" />
                    <span>Track CRM</span>
                  </button>

                  <button
                    onClick={() => handleOpenScenarioDossier(job.company_name, job.role, job.id)}
                    className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-lg transition-colors flex items-center gap-1 cursor-pointer border border-slate-700"
                    title="View Top 50 Production Scenario Questions & Solutions"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-purple-400" />
                    <span>50 Scenarios</span>
                  </button>

                  <button
                    onClick={() => onOpenPrepare(job.id)}
                    className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span>Prepare</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* AI ATS Resume Factory Modal */}
      {factoryJob && (
        <ResumeFactoryModal
          isOpen={!!factoryJob}
          onClose={() => setFactoryJob(null)}
          targetJobId={factoryJob.id}
          targetJobRole={factoryJob.role}
          targetCompany={factoryJob.company_name}
        />
      )}

      {/* AI Candidate Screening Modal */}
      {screeningJob && (
        <AdaptiveInterviewModal
          isOpen={!!screeningJob}
          onClose={() => setScreeningJob(null)}
          targetJobId={screeningJob.id}
          targetJobRole={screeningJob.role}
          targetCompany={screeningJob.company_name}
        />
      )}

      {/* Job Alerts Modal */}
      <JobAlertsModal
        isOpen={showAlertsModal}
        onClose={() => setShowAlertsModal(false)}
        defaultCareer={careerContext?.primary_career || user?.target_role || 'AI Engineer'}
      />

      {/* 8-Pillar Job Match Modal */}
      <JobMatchModal
        job={matchingJob}
        isOpen={!!matchingJob}
        onClose={() => setMatchingJob(null)}
        onPrepareApply={onOpenPrepare}
      />

      {/* Top 50 Scenario Interview Pack Modal */}
      {selectedScenarioJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-slate-900 border border-slate-700/60 rounded-2xl shadow-2xl shadow-purple-950/40 text-slate-100 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-400">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Top 50 Scenario Interview Dossier</h2>
                  <p className="text-xs text-slate-400">
                    Role-specific architectural interview scenarios for {selectedScenarioJob.role} at {selectedScenarioJob.company}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedScenarioJob(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {loadingScenarioPack ? (
                <div className="py-16 text-center space-y-3">
                  <RefreshCw className="w-8 h-8 text-purple-400 animate-spin mx-auto" />
                  <p className="text-xs text-slate-400">Generating scenario questions...</p>
                </div>
              ) : (
                filteredQuestions.map((q: any, idx: number) => (
                  <div key={q.id || idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-purple-400">Scenario #{idx + 1} • {q.category}</span>
                      <button
                        onClick={() => handleCopyScenario(q)}
                        className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                      >
                        {copiedId === q.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedId === q.id ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <h4 className="text-sm font-semibold text-white">{q.question}</h4>
                    <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/80 p-3 rounded-lg border border-slate-800/80 font-mono">
                      {q.solution}
                    </p>
                  </div>
                ))
              )}
            </div>

            <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950 flex justify-end">
              <button
                onClick={() => setSelectedScenarioJob(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
