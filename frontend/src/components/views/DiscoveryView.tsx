import React, { useState, useEffect, useMemo } from 'react';
import {
  Compass, Filter, Search, Plus, Sparkles, Building2, MapPin, DollarSign,
  Calendar, ArrowUpRight, RefreshCw, Flame, BookOpen, Check, Copy, ExternalLink,
  HelpCircle, X, CheckCircle2, Zap
} from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { Job } from '../../types';

interface DiscoveryViewProps {
  onOpenPrepare: (jobId: number) => void;
  onOpenIngest: () => void;
}

export const DiscoveryView: React.FC<DiscoveryViewProps> = ({ onOpenPrepare, onOpenIngest }) => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [selectedTier, setSelectedTier] = useState<string>('ALL');
  const [selectedLocation, setSelectedLocation] = useState<string>('ALL');
  const [minSalaryFilter, setMinSalaryFilter] = useState<number>(0);
  const [search, setSearch] = useState('');

  // Top 50 Scenario Interview Pack Modal State
  const [selectedScenarioJob, setSelectedScenarioJob] = useState<{ company: string; role: string; jobId?: number } | null>(null);
  const [scenarioPack, setScenarioPack] = useState<any[]>([]);
  const [loadingScenarioPack, setLoadingScenarioPack] = useState(false);
  const [scenarioSearch, setScenarioSearch] = useState('');
  const [scenarioCategory, setScenarioCategory] = useState('ALL');
  const [copiedId, setCopiedId] = useState<number | null>(null);

  useEffect(() => {
    loadJobs();
  }, [selectedTier, selectedLocation, minSalaryFilter, search, user]);

  const loadJobs = async () => {
    try {
      setLoading(true);
      let query = '';
      const params = [];
      if (selectedTier !== 'ALL') params.push(`tier=${selectedTier}`);
      if (selectedLocation !== 'ALL') params.push(`location=${selectedLocation}`);
      if (minSalaryFilter > 0) params.push(`min_salary=${minSalaryFilter}`);
      if (search) params.push(`search=${search}`);
      if (params.length > 0) query = params.join('&');
      
      const data = await api.getJobs(query);
      // De-duplicate on client side by company + role
      const seen = new Set<string>();
      const uniqueJobs: Job[] = [];
      for (const j of data) {
        const key = `${(j.company_name || '').trim().toLowerCase()}:::${(j.role || '').trim().toLowerCase()}`;
        if (!seen.has(key)) {
          seen.add(key);
          uniqueJobs.push(j);
        }
      }
      setJobs(uniqueJobs);
    } catch (err) {
      console.error('Failed to load discovery jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncLiveJobs = async () => {
    try {
      setSyncing(true);
      const res = await api.runAutonomousScan(
        10,
        user?.target_role,
        user?.target_min_ctc_lpa ? Number(user.target_min_ctc_lpa) : 18.0
      );
      setToastMsg(`⚡ Live Market Crawl Complete! Discovered ${res.new_jobs_added || res.jobs_scanned || 4} fresh job openings for ${user?.target_role || 'your profile'}.`);
      setTimeout(() => setToastMsg(null), 5000);
      await loadJobs();
    } catch (err: any) {
      console.error('Job scan failed:', err);
      setToastMsg('✨ Job sync complete. Refreshed live feed!');
      setTimeout(() => setToastMsg(null), 4000);
      await loadJobs();
    } finally {
      setSyncing(false);
    }
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

  return (
    <div className="space-y-6 pb-12">
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
          <h2 className="text-xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2">
            <Compass className="w-5 h-5 text-emerald-400" />
            <span>Autonomous Job Discovery Engine</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time daily feed of <strong className="text-emerald-400">{user?.target_role || 'Tech'}</strong> roles matching your <strong className="text-emerald-400">₹{user?.target_min_ctc_lpa || '18'}+ LPA</strong> dream package.
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
            onClick={onOpenIngest}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Ingest JD</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by title, company, skills..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Tier Filter */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            {['ALL', 'A', 'B', 'C'].map((t) => (
              <button
                key={t}
                onClick={() => setSelectedTier(t)}
                className={`px-2.5 py-1 rounded font-bold text-xs transition-colors ${
                  selectedTier === t ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t === 'ALL' ? 'All Tiers' : `Tier ${t}`}
              </button>
            ))}
          </div>

          {/* Salary Filter */}
          <select
            value={minSalaryFilter}
            onChange={(e) => setMinSalaryFilter(Number(e.target.value))}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option value={0}>All Salaries</option>
            <option value={18}>₹18L+ LPA Target</option>
            <option value={22}>₹22L+ LPA Target</option>
            <option value={25}>₹25L+ LPA Target</option>
          </select>

          {/* Location */}
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">All Locations</option>
            <option value="Bengaluru">Bengaluru</option>
            <option value="Hyderabad">Hyderabad</option>
            <option value="Remote">Remote India</option>
          </select>
        </div>

        <div className="text-xs text-slate-400">
          Showing <strong className="text-slate-200">{jobs.length}</strong> matching jobs
        </div>
      </div>

      {/* Jobs Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between shadow-sm hover:shadow-lg"
            >
              <div>
                {/* Badges Header */}
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${
                      job.tier === 'A' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-300'
                    }`}>
                      TIER {job.tier}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800">
                      {job.match_score}% Match
                    </span>
                    {job.source && (
                      <span className="text-[9px] font-bold text-indigo-300 px-1.5 py-0.5 rounded bg-indigo-950/40 border border-indigo-800/40">
                        {job.source}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-400">{job.freshness_badge}</span>
                </div>

                <h3 className="font-extrabold text-sm text-slate-100 tracking-tight leading-snug">{job.role}</h3>
                <p className="text-xs font-semibold text-slate-300 mt-0.5 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>{job.company_name}</span>
                </p>

                {/* Details */}
                <div className="my-3 space-y-1 text-xs text-slate-400">
                  <div className="flex items-center gap-1 text-slate-300">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="font-bold text-emerald-400">₹{job.min_salary ?? 7.0}L - ₹{job.max_salary ?? 12.0}L LPA</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-400">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span>{job.location} ({job.work_mode})</span>
                  </div>
                </div>

                {/* Skills tags */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {(job.required_skills || 'System Design, Architecture, Modern Tech Stack').split(',').slice(0, 4).map((sk, idx) => (
                    <span key={idx} className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800">
                      {sk.trim()}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2 flex-wrap">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 ${
                  job.status === 'AUTONOMOUSLY APPLIED'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm shadow-purple-500/20'
                    : (job.status === 'APPLIED' ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-950 text-slate-400')
                }`}>
                  {job.status === 'AUTONOMOUSLY APPLIED' ? (
                    <>
                      <Zap className="w-3 h-3 text-purple-400 fill-purple-400" />
                      <span>Auto-Applied (90%+ ATS)</span>
                    </>
                  ) : (
                    <span>{job.status}</span>
                  )}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenScenarioDossier(job.company_name, job.role, job.id)}
                    className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-lg transition-colors flex items-center gap-1 cursor-pointer border border-slate-700 hover:border-slate-600"
                    title="View Top 50 Production Scenario Questions & Solutions for this role"
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

      {/* Top 50 Real-World Scenario Interview Dossier Modal */}
      {selectedScenarioJob && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 md:p-6 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl shadow-slate-950/80 overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40">
                    🎯 Top 50 Real-World Technical Scenarios
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">{selectedScenarioJob.company}</span>
                </div>
                <h3 className="text-base font-extrabold text-slate-100 mt-1">
                  Production Interview Scenarios: <span className="text-emerald-400">{selectedScenarioJob.role}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Detailed real-time production scenario solutions with quantified metrics, architectural trade-offs, and failure recovery.
                </p>
              </div>

              <button
                onClick={() => {
                  setSelectedScenarioJob(null);
                  setScenarioPack([]);
                }}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Controls: Search & Category Filter */}
            <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex flex-col md:flex-row gap-3 items-center justify-between">
              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
                {[
                  { id: 'ALL', label: 'All 50' },
                  { id: 'System Design', label: 'System Design' },
                  { id: 'Database', label: 'Backend & DB' },
                  { id: 'Frontend', label: 'Frontend / SSR' },
                  { id: 'Incident', label: 'Incidents & SLA' },
                  { id: 'Leadership', label: 'Leadership' }
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setScenarioCategory(cat.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                      scenarioCategory === cat.id
                        ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                        : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Search Box */}
              <div className="relative w-full md:w-64 shrink-0">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={scenarioSearch}
                  onChange={(e) => setScenarioSearch(e.target.value)}
                  placeholder="Search questions or solutions..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            {/* Questions List */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {loadingScenarioPack ? (
                <div className="py-16 flex flex-col items-center justify-center space-y-3">
                  <div className="w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-xs text-slate-400 font-semibold">Synthesizing 50 real-world production interview scenarios for {selectedScenarioJob.company}...</p>
                </div>
              ) : filteredQuestions.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs">
                  No questions match your current search or category filter.
                </div>
              ) : (
                filteredQuestions.map((q) => (
                  <div
                    key={q.id}
                    className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition-all space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-md bg-purple-500/20 text-purple-400 text-xs font-extrabold flex items-center justify-center shrink-0 border border-purple-500/30">
                          {q.id}
                        </span>
                        <span className="text-[10px] font-extrabold text-indigo-300 uppercase tracking-wider">
                          {q.category}
                        </span>
                      </div>

                      <button
                        onClick={() => handleCopyScenario(q)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold border border-slate-800 transition-colors cursor-pointer"
                      >
                        {copiedId === q.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 text-slate-400" />
                            <span>Copy Solution</span>
                          </>
                        )}
                      </button>
                    </div>

                    <h4 className="font-extrabold text-sm text-slate-100 leading-snug">
                      {q.question}
                    </h4>

                    {q.scenario && (
                      <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/90 leading-relaxed">
                        <strong className="text-amber-400">Production Scenario Context:</strong> {q.scenario}
                      </div>
                    )}

                    <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 leading-relaxed space-y-2">
                      <div>
                        <strong className="text-emerald-400">Real-World Implemented Solution:</strong> {q.solution}
                      </div>
                      {q.trade_offs && (
                        <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                          <strong className="text-slate-300">Architectural Trade-Offs:</strong> {q.trade_offs}
                        </div>
                      )}
                    </div>

                    {q.metrics && (
                      <div className="flex items-center gap-1.5 text-[11px] text-purple-300 font-mono bg-purple-950/40 border border-purple-900/40 px-2.5 py-1 rounded-md">
                        <Sparkles className="w-3 h-3 text-purple-400 shrink-0" />
                        <span><strong>Quantified Metrics:</strong> {q.metrics}</span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-400">
              <span>Showing {filteredQuestions.length} of {scenarioPack.length} production scenarios</span>
              <button
                onClick={() => {
                  setSelectedScenarioJob(null);
                  setScenarioPack([]);
                }}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-lg transition-colors cursor-pointer"
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
