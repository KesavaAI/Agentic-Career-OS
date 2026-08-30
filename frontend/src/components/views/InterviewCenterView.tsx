import React, { useState, useEffect, useMemo } from 'react';
import {
  Mic, Calendar, Clock, Sparkles, CheckCircle2, AlertTriangle, ArrowRight,
  BookOpen, Search, Copy, Check, Filter, Layers, Zap, Shield, FileText, Download,
  Plus, Building, Briefcase, ExternalLink, RefreshCw
} from 'lucide-react';
import { api } from '../../lib/api';
import { Interview, Application } from '../../types';

interface InterviewCenterViewProps {
  onNavigateTab: (tab: string) => void;
}

export const InterviewCenterView: React.FC<InterviewCenterViewProps> = ({ onNavigateTab }) => {
  const [activeSubTab, setActiveSubTab] = useState<'scenarios' | 'resume_defense' | 'pipeline'>('scenarios');
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedPack, setSelectedPack] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Active Company Selection
  const [selectedCompany, setSelectedCompany] = useState<string>('Zepto');
  const [selectedRole, setSelectedRole] = useState<string>('Full Stack Engineer');

  // Top 50 Company Scenarios State
  const [scenarioQuestions, setScenarioQuestions] = useState<any[]>([]);
  const [loadingScenarios, setLoadingScenarios] = useState(false);
  const [scenarioSearch, setScenarioSearch] = useState('');
  const [scenarioCategory, setScenarioCategory] = useState('ALL');
  const [copiedId, setCopiedId] = useState<number | string | null>(null);

  // Resume & Project Defense State
  const [resumeDefenseData, setResumeDefenseData] = useState<any | null>(null);
  const [loadingDefense, setLoadingDefense] = useState(false);
  const [defenseCategory, setDefenseCategory] = useState('ALL');

  // Custom Company Modal State
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [customCompanyName, setCustomCompanyName] = useState('');
  const [customRoleName, setCustomRoleName] = useState('');

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [intData, appData] = await Promise.all([
        api.getInterviews().catch(() => []),
        api.getApplications().catch(() => [])
      ]);
      setInterviews(intData || []);
      setApplications(appData || []);

      // Check URL query parameters
      const params = new URLSearchParams(window.location.search);
      const subtabParam = params.get('subtab');
      const compParam = params.get('company');
      const roleParam = params.get('role');

      if (subtabParam === 'resume_defense') {
        setActiveSubTab('resume_defense');
      } else if (subtabParam === 'pipeline') {
        setActiveSubTab('pipeline');
      } else {
        setActiveSubTab('scenarios');
      }

      let initialCompany = compParam;
      let initialRole = roleParam;

      if (!initialCompany) {
        // Pick first shortlisted or active application if available
        const shortlistedApp = appData?.find((a: any) => a.status?.includes('SHORTLISTED') || a.status?.includes('INTERVIEW'));
        const autoAppliedApp = appData?.find((a: any) => a.status === 'AUTONOMOUSLY APPLIED');
        const firstApp = shortlistedApp || autoAppliedApp || appData?.[0];

        if (firstApp) {
          initialCompany = firstApp.company_name;
          initialRole = firstApp.role_title;
        } else {
          initialCompany = 'Zepto';
          initialRole = 'Full Stack Engineer';
        }
      }

      setSelectedCompany(initialCompany);
      setSelectedRole(initialRole || 'Full Stack Engineer');

      loadScenarioPack(initialCompany, initialRole || 'Full Stack Engineer');
      loadResumeDefense();
      if (intData && intData.length > 0) {
        loadInterviewPack(1);
      }
    } catch (err) {
      console.error('Failed to load initial data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadScenarioPack = async (comp: string, role: string) => {
    try {
      setLoadingScenarios(true);
      const res = await api.getScenarioPack(undefined, comp, role);
      setScenarioQuestions(res.questions || []);
    } catch (err) {
      console.error('Failed to load scenario questions:', err);
    } finally {
      setLoadingScenarios(false);
    }
  };

  const loadResumeDefense = async () => {
    try {
      setLoadingDefense(true);
      const res = await api.getResumeDefense();
      setResumeDefenseData(res);
    } catch (err) {
      console.error('Failed to load resume defense data:', err);
    } finally {
      setLoadingDefense(false);
    }
  };

  const loadInterviewPack = async (jobId: number) => {
    try {
      const pack = await api.getInterviewPack(jobId);
      setSelectedPack(pack);
    } catch (err) {
      console.error('Failed to load pack:', err);
    }
  };

  const handleSelectApplication = (app: Application) => {
    setSelectedCompany(app.company_name);
    setSelectedRole(app.role_title);
    loadScenarioPack(app.company_name, app.role_title);
  };

  const handleCreateCustomDossier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customCompanyName.trim()) return;
    const targetComp = customCompanyName.trim();
    const targetR = customRoleName.trim() || 'Software Engineer';
    setSelectedCompany(targetComp);
    setSelectedRole(targetR);
    loadScenarioPack(targetComp, targetR);
    setIsCustomModalOpen(false);
    setCustomCompanyName('');
    setCustomRoleName('');
  };

  const handleCopyText = (id: number | string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handlePrintDossier = () => {
    window.print();
  };

  // Filtered Questions
  const filteredScenarios = useMemo(() => {
    return scenarioQuestions.filter(q => {
      const matchCat = scenarioCategory === 'ALL' || q.category.toLowerCase().includes(scenarioCategory.toLowerCase());
      const matchSearch = scenarioSearch === '' ||
        q.question.toLowerCase().includes(scenarioSearch.toLowerCase()) ||
        q.solution.toLowerCase().includes(scenarioSearch.toLowerCase()) ||
        q.scenario.toLowerCase().includes(scenarioSearch.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [scenarioQuestions, scenarioCategory, scenarioSearch]);

  const filteredDefenseQuestions = useMemo(() => {
    if (!resumeDefenseData?.questions) return [];
    return resumeDefenseData.questions.filter((q: any) => {
      const matchCat = defenseCategory === 'ALL' || q.category.toLowerCase().includes(defenseCategory.toLowerCase());
      const matchSearch = scenarioSearch === '' ||
        q.question.toLowerCase().includes(scenarioSearch.toLowerCase()) ||
        q.star_action.toLowerCase().includes(scenarioSearch.toLowerCase()) ||
        (q.project_name && q.project_name.toLowerCase().includes(scenarioSearch.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [resumeDefenseData, defenseCategory, scenarioSearch]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2">
            <Mic className="w-5 h-5 text-purple-400" />
            <span>Interview Intelligence Center</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Application-linked production scenarios, personalized resume cross-examination, and dynamic interview defense.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Sub-Tab Navigation */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-1 flex items-center gap-1">
            <button
              onClick={() => setActiveSubTab('scenarios')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeSubTab === 'scenarios'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span>Company 50 Scenarios</span>
            </button>

            <button
              onClick={() => setActiveSubTab('resume_defense')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeSubTab === 'resume_defense'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-emerald-300" />
              <span>Resume & Project Defense</span>
            </button>

            <button
              onClick={() => setActiveSubTab('pipeline')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeSubTab === 'pipeline'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Scheduled Pipeline
            </button>
          </div>

          {/* Download PDF Dossier Button */}
          <button
            onClick={handlePrintDossier}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 hover:border-purple-500/50 font-bold text-xs rounded-xl transition-all cursor-pointer shadow-sm"
            title="Download complete printable interview dossier (PDF)"
          >
            <Download className="w-3.5 h-3.5 text-purple-400" />
            <span>Export PDF</span>
          </button>

          <button
            onClick={() => onNavigateTab('mock-interview')}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Launch Mock Lab</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SUB-TAB 1: COMPANY 50 SCENARIOS */}
      {/* ========================================================================= */}
      {activeSubTab === 'scenarios' && (
        <div className="space-y-4">
          {/* Dynamic Application-Linked Selector (No hardcoded dropdown) */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-extrabold text-slate-200 uppercase tracking-wider">
                  Target Pipeline Dossier
                </span>
                <span className="text-[11px] text-slate-500">
                  (Linked to your active applications & shortlists)
                </span>
              </div>

              <button
                onClick={() => setIsCustomModalOpen(true)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-xs font-bold transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Prep Any Company / JD</span>
              </button>
            </div>

            {/* Application Chips Carousel */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {applications.map((app) => {
                const isSelected = selectedCompany.toLowerCase() === app.company_name.toLowerCase();
                const isShortlisted = app.status?.includes('SHORTLISTED') || app.status?.includes('INTERVIEW');
                const isAutoApplied = app.status === 'AUTONOMOUSLY APPLIED';

                return (
                  <button
                    key={app.id}
                    onClick={() => handleSelectApplication(app)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-left shrink-0 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-purple-950/60 border-purple-500 text-white shadow-md shadow-purple-500/10'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-100">{app.company_name}</span>
                        {isShortlisted && (
                          <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/40">
                            🔥 Shortlisted
                          </span>
                        )}
                        {isAutoApplied && (
                          <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40">
                            🤖 Auto-Applied
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 truncate max-w-[140px] mt-0.5">{app.role_title}</p>
                    </div>
                  </button>
                );
              })}

              {/* Fallback default chip if pipeline is empty */}
              {applications.length === 0 && (
                <div className="px-3 py-2 rounded-xl border border-purple-500/50 bg-purple-950/40 text-purple-200 text-xs font-bold">
                  ⚡ {selectedCompany} — {selectedRole}
                </div>
              )}
            </div>
          </div>

          {/* Controls Bar: Category Pills & Search */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
              {[
                { id: 'ALL', label: 'All 50' },
                { id: 'System Design', label: 'System Design & Concurrency' },
                { id: 'Database', label: 'Backend & DB' },
                { id: 'Frontend', label: 'Frontend / SSR' },
                { id: 'Incident', label: 'Incidents & SLA' },
                { id: 'Leadership', label: 'Leadership Defense' }
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setScenarioCategory(cat.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                    scenarioCategory === cat.id
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
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
                placeholder="Search 50 scenarios..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Scenarios Content */}
          {loadingScenarios ? (
            <div className="p-16 text-center space-y-3">
              <div className="w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs text-slate-400 font-semibold">Generating 50 real-world production scenarios for {selectedCompany}...</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-xs text-slate-400 flex items-center justify-between">
                <span>Showing <strong className="text-slate-200">{filteredScenarios.length}</strong> of {scenarioQuestions.length} production scenarios for <strong>{selectedCompany}</strong> ({selectedRole})</span>
                <span className="text-[10px] text-purple-400 font-bold bg-purple-950/40 border border-purple-800/40 px-2 py-0.5 rounded">⚡ 100% Real-World Implemented Answers</span>
              </div>

              {filteredScenarios.map((q) => (
                <div
                  key={q.id}
                  className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all space-y-3 shadow-sm"
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
                      onClick={() => handleCopyText(q.id, `QUESTION: ${q.question}

SCENARIO: ${q.scenario}

PRODUCTION SOLUTION: ${q.solution}

QUANTIFIED METRICS: ${q.metrics}

ARCHITECTURAL TRADE-OFFS: ${q.trade_offs}`)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold border border-slate-800 transition-colors cursor-pointer"
                    >
                      {copiedId === q.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-slate-400" />
                          <span>Copy Answer</span>
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

                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed space-y-2">
                    <div>
                      <strong className="text-emerald-400">Production Implemented Solution:</strong> {q.solution}
                    </div>
                    {q.trade_offs && (
                      <div className="text-[11px] text-slate-400 pt-1.5 border-t border-slate-800/80">
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
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 2: RESUME & PROJECT DEFENSE */}
      {/* ========================================================================= */}
      {activeSubTab === 'resume_defense' && (
        <div className="space-y-4">
          {/* Candidate Profile Hero Banner */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-emerald-950/30 to-slate-900 border border-emerald-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-extrabold text-emerald-300 uppercase tracking-wider">
                  Personalized Resume Interrogation & Project Defense
                </span>
              </div>
              <h3 className="text-base font-extrabold text-slate-100">
                {resumeDefenseData?.candidate_name || 'Candidate'} — {resumeDefenseData?.target_role || 'Full Stack Engineer'}
              </h3>
              <p className="text-xs text-slate-400">
                Synthesized from your active portfolio projects: <strong className="text-slate-200">{resumeDefenseData?.projects_analyzed?.join(', ')}</strong>
              </p>
            </div>

            <button
              onClick={loadResumeDefense}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
              <span>Re-Analyze Resume</span>
            </button>
          </div>

          {/* Defense Category Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {[
              { id: 'ALL', label: 'All Defense Questions' },
              { id: 'Project Architecture', label: 'Project Architecture & Scale' },
              { id: 'Metric', label: 'Metric Claims Verification' },
              { id: 'Tech Stack', label: 'Tech Justification ("Why Not X?")' },
              { id: 'Production War', label: 'Outages & War Stories' }
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setDefenseCategory(cat.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                  defenseCategory === cat.id
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Defense Cards List */}
          {loadingDefense ? (
            <div className="p-16 text-center space-y-3">
              <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs text-slate-400 font-semibold">Analyzing your projects and synthesizing cross-examination questions...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredDefenseQuestions.map((q: any) => (
                <div
                  key={q.id}
                  className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 transition-all space-y-3 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-md bg-emerald-500/20 text-emerald-400 text-xs font-extrabold flex items-center justify-center shrink-0 border border-emerald-500/30">
                        {q.id}
                      </span>
                      <span className="text-[10px] font-extrabold text-emerald-300 uppercase tracking-wider">
                        {q.category}
                      </span>
                      {q.project_name && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                          {q.project_name}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => handleCopyText(`def-${q.id}`, `QUESTION: ${q.question}

SITUATION: ${q.star_situation}

ACTION: ${q.star_action}

RESULT: ${q.star_result}

METRIC DEFENSE: ${q.metric_defense}`)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold border border-slate-800 transition-colors cursor-pointer"
                    >
                      {copiedId === `def-${q.id}` ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-slate-400" />
                          <span>Copy STAR Answer</span>
                        </>
                      )}
                    </button>
                  </div>

                  <h4 className="font-extrabold text-sm text-slate-100 leading-snug">
                    {q.question}
                  </h4>

                  {q.scenario && (
                    <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/90 leading-relaxed">
                      <strong className="text-amber-400">Interviewer Cross-Examination Trap:</strong> {q.scenario}
                    </div>
                  )}

                  {/* Google STAR Answer Box */}
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-2.5">
                    <div>
                      <span className="font-bold text-indigo-400 uppercase tracking-wider text-[10px] block">Situation / Context:</span>
                      <p className="mt-0.5 text-slate-300">{q.star_situation}</p>
                    </div>

                    <div>
                      <span className="font-bold text-emerald-400 uppercase tracking-wider text-[10px] block">Engineering Action (How you solved it):</span>
                      <p className="mt-0.5 text-slate-200 leading-relaxed">{q.star_action}</p>
                    </div>

                    <div>
                      <span className="font-bold text-purple-400 uppercase tracking-wider text-[10px] block">Quantified Result:</span>
                      <p className="mt-0.5 text-slate-300">{q.star_result}</p>
                    </div>
                  </div>

                  {q.metric_defense && (
                    <div className="flex items-center gap-1.5 text-[11px] text-emerald-300 font-mono bg-emerald-950/30 border border-emerald-900/40 px-2.5 py-1 rounded-md">
                      <Sparkles className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span><strong>Key Metric Anchor:</strong> {q.metric_defense}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 3: SCHEDULED PIPELINE */}
      {/* ========================================================================= */}
      {activeSubTab === 'pipeline' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-3">
            <h3 className="font-extrabold text-xs text-slate-400 uppercase tracking-wider">
              Upcoming Technical Rounds ({interviews.length})
            </h3>

            {interviews.length === 0 ? (
              <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-2">
                <Calendar className="w-8 h-8 text-slate-500 mx-auto" />
                <p className="text-xs text-slate-400 font-semibold">No interviews scheduled yet.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {interviews.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-purple-500 transition-all cursor-pointer space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-100">{item.company_name}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        {item.stage || item.interview_type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 font-semibold">{item.role_title}</p>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                      <Clock className="w-3 h-3" />
                      <span>{item.scheduled_at ? new Date(item.scheduled_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : item.time_str || 'Scheduled'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="font-extrabold text-xs text-slate-400 uppercase tracking-wider">
              Stage-by-Stage Preparation Blueprint
            </h3>
            {selectedPack ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <h4 className="font-bold text-sm text-slate-100 mb-2">{selectedPack.company} — {selectedPack.role}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{selectedPack.pack?.overview || 'Review core technical concepts and past project architecture.'}</p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">Select an interview to view stage preparation pack.</p>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CUSTOM COMPANY / JD MODAL */}
      {/* ========================================================================= */}
      {isCustomModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-purple-400" />
                <h3 className="font-bold text-sm text-slate-100">Prep for Any Company / Role</h3>
              </div>
              <button
                onClick={() => setIsCustomModalOpen(false)}
                className="text-slate-500 hover:text-slate-300 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCustomDossier} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Company Name</label>
                <input
                  type="text"
                  required
                  value={customCompanyName}
                  onChange={(e) => setCustomCompanyName(e.target.value)}
                  placeholder="e.g. TCS, Google, Infosys, Razorpay, Seed Startup"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Target Role</label>
                <input
                  type="text"
                  value={customRoleName}
                  onChange={(e) => setCustomRoleName(e.target.value)}
                  placeholder="e.g. Full Stack Engineer, Backend Lead, Java Developer"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCustomModalOpen(false)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-lg shadow-md shadow-purple-500/20 cursor-pointer"
                >
                  Generate 50 Scenarios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
