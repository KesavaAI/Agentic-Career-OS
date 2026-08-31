import React, { useState, useEffect } from 'react';
import { 
  Bot, Sparkles, ShieldCheck, CheckCircle2, Play, Pause, RefreshCw, 
  Terminal, Sliders, Zap, CheckCircle, Clock, Send, Mail, Briefcase, 
  TrendingUp, Award, AlertTriangle, ChevronRight, Activity
} from 'lucide-react';
import { api } from '../../lib/api';

export const CareerAgentView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'autopilot' | 'copilot'>('autopilot');
  const [autopilotData, setAutopilotData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [cycling, setCycling] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Safety Guardrails state
  const [minMatch, setMinMatch] = useState(88);
  const [dailyCap, setDailyCap] = useState(10);
  const [minCtc, setMinCtc] = useState(18);
  const [autoFollowup, setAutoFollowup] = useState(true);
  const [autoInbox, setAutoInbox] = useState(true);
  const [intervalMins, setIntervalMins] = useState(30);

  // Manual Ingest state (Copilot tab)
  const [jdInput, setJdInput] = useState(`Role: GenAI Platform Engineer\nCompany: Microsoft India\nRequirements: Python, LangGraph, RAG, Azure OpenAI, Vector Databases, FastAPI.\nSalary: 24-36 LPA.\nExperience: 1-4 years.`);
  const [agentState, setAgentState] = useState<any | null>(null);
  const [copilotRunning, setCopilotRunning] = useState(false);
  const [approvalMsg, setApprovalMsg] = useState<string | null>(null);

  const loadAutopilotStatus = async () => {
    try {
      setLoading(true);
      const res = await api.getAutopilotStatus();
      if (res && res.success) {
        setAutopilotData(res);
        setMinMatch(res.min_match_threshold || 88);
        setDailyCap(res.daily_max_applications || 10);
        setMinCtc(res.min_salary_lpa || 18);
        setAutoFollowup(res.auto_followup_enabled ?? true);
        setAutoInbox(res.auto_inbox_sync_enabled ?? true);
        setIntervalMins(res.cycle_interval_minutes || 30);
      }
    } catch (err) {
      console.error('Failed to load autopilot status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAutopilotStatus();
    // Poll logs every 15s when tab is active
    const pollTimer = setInterval(() => {
      loadAutopilotStatus();
    }, 15000);
    return () => clearInterval(pollTimer);
  }, []);

  const handleToggleMode = async (mode: 'FULL_AUTONOMOUS' | 'COPILOT' | 'PAUSED') => {
    try {
      const isActive = mode !== 'PAUSED';
      const res = await api.toggleAutopilot({ is_active: isActive, mode });
      if (res.success) {
        loadAutopilotStatus();
      }
    } catch (err) {
      console.error('Failed to toggle autopilot:', err);
    }
  };

  const handleSaveSettings = async () => {
    try {
      const res = await api.updateAutopilotSettings({
        min_match_threshold: minMatch,
        daily_max_applications: dailyCap,
        min_salary_lpa: minCtc,
        auto_followup_enabled: autoFollowup,
        auto_inbox_sync_enabled: autoInbox,
        cycle_interval_minutes: intervalMins
      });
      if (res.success) {
        setSettingsSaved(true);
        setTimeout(() => setSettingsSaved(false), 3000);
        loadAutopilotStatus();
      }
    } catch (err) {
      console.error('Failed to update settings:', err);
    }
  };

  const handleForceTriggerNow = async () => {
    try {
      setCycling(true);
      const res = await api.triggerAutopilotCycle();
      loadAutopilotStatus();
    } catch (err) {
      console.error('Cycle trigger failed:', err);
    } finally {
      setCycling(false);
    }
  };

  // Copilot Manual Ingest
  const handleRunCopilot = async () => {
    try {
      setCopilotRunning(true);
      setApprovalMsg(null);
      const res = await api.runCareerAgent({ raw_jd_text: jdInput });
      setAgentState(res);
    } catch (err) {
      console.error('Copilot run failed:', err);
    } finally {
      setCopilotRunning(false);
    }
  };

  const handleApproval = async (approve: boolean) => {
    if (!agentState) return;
    try {
      const res = await api.approveCareerAgent({
        state: agentState,
        approve,
        action: 'APPLY'
      });
      setApprovalMsg(res.message);
      setAgentState(null);
      loadAutopilotStatus();
    } catch (err) {
      console.error('Approval failed:', err);
    }
  };

  const isFullAuto = autopilotData?.is_active && autopilotData?.mode === 'FULL_AUTONOMOUS';
  const isCopilot = autopilotData?.is_active && autopilotData?.mode === 'COPILOT';
  const isPaused = !autopilotData?.is_active || autopilotData?.mode === 'PAUSED';

  return (
    <div className="space-y-6 pb-16">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-purple-950/40 to-slate-900 border border-purple-500/20 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="space-y-1 z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <Bot className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                <span>Autonomous AI Auto-Pilot Command Center</span>
                <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                  isFullAuto ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                  isCopilot ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                  'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                }`}>
                  {isFullAuto ? '● Full Autonomous (Zero-Touch)' : isCopilot ? '● Copilot Mode' : '○ Standby / Paused'}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                24/7 background AI daemon that autonomously scans live ATS feeds, matches, tailors resumes, applies, tracks inbound interviews, and dispatches follow-ups.
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 z-10">
          <button
            onClick={handleForceTriggerNow}
            disabled={cycling}
            className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${cycling ? 'animate-spin' : ''}`} />
            <span>{cycling ? 'Running 360° Cycle...' : 'Force Cycle Now'}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('autopilot')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'autopilot'
              ? 'bg-purple-600/20 text-purple-300 border border-purple-500/40 shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Zap className="w-4 h-4 text-purple-400" />
          <span>24/7 Autonomous Radar & Auto-Apply</span>
        </button>
        <button
          onClick={() => setActiveTab('copilot')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'copilot'
              ? 'bg-purple-600/20 text-purple-300 border border-purple-500/40 shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Bot className="w-4 h-4 text-emerald-400" />
          <span>Manual JD Inspector (Copilot)</span>
        </button>
      </div>

      {activeTab === 'autopilot' ? (
        <div className="space-y-6">
          {/* Autonomous Metrics Counters */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-md space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-blue-400" />
                <span>Jobs Discovered</span>
              </span>
              <p className="text-xl font-extrabold text-white">{autopilotData?.stats?.total_jobs_scanned || 0}</p>
              <span className="text-[10px] text-blue-400 font-semibold">Across Greenhouse, Ashby, Lever</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/90 border border-emerald-500/20 shadow-md space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5 text-emerald-400" />
                <span>Auto-Applied</span>
              </span>
              <p className="text-xl font-extrabold text-emerald-400">{autopilotData?.stats?.auto_applied_count || 0}</p>
              <span className="text-[10px] text-emerald-500/80 font-semibold">≥ {minMatch}% ATS Qualified</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/90 border border-purple-500/20 shadow-md space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-purple-400" />
                <span>Interviews Secured</span>
              </span>
              <p className="text-xl font-extrabold text-purple-400">{autopilotData?.stats?.interviews_secured || 0}</p>
              <span className="text-[10px] text-purple-400/80 font-semibold">Inbound invites detected</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-md space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-amber-400" />
                <span>Inbox Radar</span>
              </span>
              <p className="text-xl font-extrabold text-amber-400">24/7 Active</p>
              <span className="text-[10px] text-amber-400/80 font-semibold">IMAP Gmail Sentry</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-md space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-teal-400" />
                <span>Conversion Rate</span>
              </span>
              <p className="text-xl font-extrabold text-teal-400">{autopilotData?.stats?.conversion_rate || 0}%</p>
              <span className="text-[10px] text-teal-400/80 font-semibold">Applications to Interview</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Live Telemetry Terminal */}
            <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-950 border border-slate-800 shadow-xl flex flex-col space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <h3 className="font-extrabold text-xs text-slate-200 uppercase tracking-wider">
                    Live Agent Telemetry Stream
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  <span className="text-[11px] text-emerald-400 font-mono font-bold">DAEMON_ONLINE</span>
                </div>
              </div>

              {/* Terminal Screen */}
              <div className="bg-slate-900/80 border border-slate-800/60 rounded-xl p-4 font-mono text-[11px] text-slate-300 space-y-2.5 h-[340px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700">
                {autopilotData?.recent_logs && autopilotData.recent_logs.length > 0 ? (
                  autopilotData.recent_logs.map((log: any, idx: number) => {
                    const isApply = log.event_type === 'AUTO_APPLY';
                    const isInbox = log.event_type === 'INBOX_SYNC';
                    const isFollow = log.event_type === 'FOLLOW_UP';
                    const isMatch = log.event_type === 'MATCH';

                    return (
                      <div key={idx} className="flex items-start gap-2.5 leading-relaxed">
                        <span className="text-slate-500 shrink-0 font-bold">[{log.created_at || 'NOW'}]</span>
                        <span className={`px-1.5 py-0.2 text-[9px] font-extrabold rounded ${
                          isApply ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                          isInbox ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                          isFollow ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40' :
                          isMatch ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' :
                          'bg-slate-800 text-slate-400'
                        }`}>
                          {log.event_type}
                        </span>
                        <span className={`${isApply ? 'text-emerald-300 font-semibold' : 'text-slate-300'}`}>
                          {log.message}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-slate-500 text-center py-20">
                    <Activity className="w-6 h-6 mx-auto mb-2 opacity-40 animate-spin" />
                    <p>Agent daemon initialized. Listening for real-time ATS events...</p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span>Next Scheduled Radar Pulse: <strong className="text-slate-200">In ~{intervalMins} mins</strong></span>
                <span>Background Worker: <strong className="text-emerald-400">Daemon Active (PID Thread)</strong></span>
              </div>
            </div>

            {/* Right Col: Autonomous Controls & Safety Guardrails */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-extrabold text-xs text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-purple-400" />
                  <span>Mode & Safety Guardrails</span>
                </h3>
                {settingsSaved && (
                  <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1 animate-pulse">
                    <CheckCircle className="w-3 h-3" /> Saved
                  </span>
                )}
              </div>

              {/* Master Mode Switch */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Master Operation Mode</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleToggleMode('FULL_AUTONOMOUS')}
                    className={`p-2.5 rounded-xl text-[10px] font-extrabold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      isFullAuto
                        ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Auto-Pilot</span>
                  </button>

                  <button
                    onClick={() => handleToggleMode('COPILOT')}
                    className={`p-2.5 rounded-xl text-[10px] font-extrabold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      isCopilot
                        ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    <Bot className="w-3.5 h-3.5" />
                    <span>Copilot</span>
                  </button>

                  <button
                    onClick={() => handleToggleMode('PAUSED')}
                    className={`p-2.5 rounded-xl text-[10px] font-extrabold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      isPaused
                        ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20'
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    <Pause className="w-3.5 h-3.5" />
                    <span>Pause</span>
                  </button>
                </div>
              </div>

              {/* Sliders */}
              <div className="space-y-3.5 pt-2 border-t border-slate-800 text-xs">
                <div>
                  <div className="flex justify-between font-bold text-slate-300 mb-1">
                    <span>Min ATS Match Threshold</span>
                    <span className="text-purple-400">{minMatch}%</span>
                  </div>
                  <input
                    type="range"
                    min={70}
                    max={95}
                    value={minMatch}
                    onChange={(e) => setMinMatch(Number(e.target.value))}
                    className="w-full accent-purple-500 cursor-pointer"
                  />
                  <p className="text-[10px] text-slate-500 mt-0.5">Only auto-apply to roles meeting this ATS threshold.</p>
                </div>

                <div>
                  <div className="flex justify-between font-bold text-slate-300 mb-1">
                    <span>Daily Max Applications Cap</span>
                    <span className="text-purple-400">{dailyCap} / day</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={30}
                    value={dailyCap}
                    onChange={(e) => setDailyCap(Number(e.target.value))}
                    className="w-full accent-purple-500 cursor-pointer"
                  />
                  <p className="text-[10px] text-slate-500 mt-0.5">Protects your reputation with measured, high-quality submissions.</p>
                </div>

                <div>
                  <div className="flex justify-between font-bold text-slate-300 mb-1">
                    <span>Minimum CTC Floor</span>
                    <span className="text-purple-400">₹{minCtc} LPA</span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={50}
                    value={minCtc}
                    onChange={(e) => setMinCtc(Number(e.target.value))}
                    className="w-full accent-purple-500 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] font-bold text-slate-300">5-Day Auto Follow-Up Nudges</span>
                  <input
                    type="checkbox"
                    checked={autoFollowup}
                    onChange={(e) => setAutoFollowup(e.target.checked)}
                    className="w-4 h-4 accent-purple-500 rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-300">Inbound Gmail IMAP Sync</span>
                  <input
                    type="checkbox"
                    checked={autoInbox}
                    onChange={(e) => setAutoInbox(e.target.checked)}
                    className="w-4 h-4 accent-purple-500 rounded cursor-pointer"
                  />
                </div>
              </div>

              <button
                onClick={handleSaveSettings}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Save Safety Guardrails
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Copilot Tab */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="font-extrabold text-xs text-slate-200 uppercase tracking-wider">Feed Job Description into Agent Pipeline</h3>
            <textarea
              value={jdInput}
              onChange={(e) => setJdInput(e.target.value)}
              rows={8}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
            ></textarea>

            <button
              onClick={handleRunCopilot}
              disabled={copilotRunning}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>{copilotRunning ? 'Agent Executing Multi-Stage Graph...' : 'Execute Career Agent Pipeline'}</span>
            </button>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="font-extrabold text-xs text-slate-200 uppercase tracking-wider">Agent State & Approval Checkpoint</h3>

            {approvalMsg && (
              <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/40 text-emerald-400 text-xs font-bold">
                ✓ {approvalMsg}
              </div>
            )}

            {agentState ? (
              <div className="space-y-4 text-xs">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="flex justify-between font-bold text-slate-200">
                    <span>Target Role Identified:</span>
                    <span className="text-emerald-400">{agentState.extracted_job?.role}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Classified Tier:</span>
                    <span className="font-bold text-slate-200">Tier {agentState.tier} ({agentState.match_result?.overall_score}% Match)</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-[11px] text-slate-200 leading-relaxed">
                  {agentState.status_message}
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-end gap-3">
                  <button
                    onClick={() => handleApproval(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg"
                  >
                    Discard
                  </button>
                  <button
                    onClick={() => handleApproval(true)}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg shadow-md"
                  >
                    Approve & Ingest to Pipeline
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 text-center py-12">Execute the pipeline on the left to see LangGraph execution nodes.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
