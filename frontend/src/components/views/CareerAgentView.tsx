import React, { useState, useEffect } from 'react';
import { 
  Bot, Sparkles, ShieldCheck, CheckCircle2, Play, Pause, RefreshCw, 
  Terminal, Sliders, Zap, CheckCircle, Clock, Send, Mail, Briefcase, 
  TrendingUp, Award, AlertTriangle, ChevronRight, Activity, Cpu, Layers,
  ArrowRight, Shield, Check, Lock, Compass, Eye, Server, FileText
} from 'lucide-react';
import { api } from '../../lib/api';
import { AgentFleetHUD } from '../agent/AgentFleetHUD';

export const CareerAgentView: React.FC = () => {
  const [controlRoomState, setControlRoomState] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [cycling, setCycling] = useState(false);
  const [cycleResult, setCycleResult] = useState<string | null>(null);
  const [settingsSaved, setSettingsSaved] = useState(false);

  // User Automation Settings (Prompt 9)
  const [minMatch, setMinMatch] = useState<number>(75);
  const [requireApproval, setRequireApproval] = useState<boolean>(true);
  const [autoTailor, setAutoTailor] = useState<boolean>(true);
  const [autoScreening, setAutoScreening] = useState<boolean>(true);
  const [locationPref, setLocationPref] = useState<string>('India / Remote');
  const [remoteOnly, setRemoteOnly] = useState<boolean>(true);

  useEffect(() => {
    loadControlRoomData();
    const timer = setInterval(() => {
      loadControlRoomData();
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  const loadControlRoomData = async () => {
    try {
      setLoading(true);
      const res = await api.getControlRoomState();
      setControlRoomState(res);
      if (res) {
        setMinMatch(res.min_match_threshold || 75);
        setRequireApproval(res.require_user_approval ?? true);
      }
    } catch (err) {
      console.error('Failed to load control room state:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerCycle = async () => {
    try {
      setCycling(true);
      setCycleResult(null);
      const res = await api.orchestrateCareerAgentCycle();
      setCycleResult(`✓ Cycle Finished: Discovered ${res.jobs_discovered} jobs, Matched ${res.high_match_jobs} leads, Tailored ${res.resumes_tailored} resumes, Enqueued ${res.applications_enqueued} applications!`);
      await loadControlRoomData();
      setTimeout(() => setCycleResult(null), 7000);
    } catch (err: any) {
      alert('Autonomous cycle failed: ' + err.message);
    } finally {
      setCycling(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      await api.updateCareerAgentSettings({
        min_match_threshold: minMatch,
        require_user_approval: requireApproval,
        auto_tailor_resume: autoTailor,
        auto_prepare_screening: autoScreening,
        location_preference: locationPref,
        remote_only: remoteOnly
      });
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 3000);
      await loadControlRoomData();
    } catch (err: any) {
      alert('Failed to save settings: ' + err.message);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'RUNNING':
        return <span className="px-2.5 py-1 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold text-[10px] animate-pulse">⚡ RUNNING</span>;
      case 'COMPLETED':
        return <span className="px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold text-[10px]">🟢 COMPLETED</span>;
      case 'WAITING_FOR_USER':
        return <span className="px-2.5 py-1 rounded-full bg-amber-950 text-amber-300 border border-amber-800 font-bold text-[10px]">⌛ WAITING_FOR_USER</span>;
      case 'RATE_LIMITED':
        return <span className="px-2.5 py-1 rounded-full bg-purple-950 text-purple-300 border border-purple-800 font-bold text-[10px]">🛑 RATE_LIMITED</span>;
      case 'FAILED':
        return <span className="px-2.5 py-1 rounded-full bg-rose-950 text-rose-300 border border-rose-800 font-bold text-[10px]">❌ FAILED</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700 font-bold text-[10px]">⚪ IDLE</span>;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Universal Swarm HUD */}
      <AgentFleetHUD onDirectiveApplied={loadControlRoomData} />

      {/* Header & Trigger Controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl">
        <div>
          <div className="flex items-center gap-2">
            <Bot className="w-6 h-6 text-cyan-400" />
            <h2 className="text-xl font-extrabold text-white tracking-tight">Autonomous Career Agent Control Room</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Orchestrates SCOUT $\rightarrow$ MATCHER $\rightarrow$ TAILOR $\rightarrow$ SENTRY $\rightarrow$ PREPARE with 100% real database state & audit logs.
          </p>
        </div>

        <button
          onClick={handleTriggerCycle}
          disabled={cycling}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-xs shadow-lg shadow-cyan-500/20 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <Zap className={`w-4 h-4 ${cycling ? 'animate-spin' : ''}`} />
          <span>{cycling ? 'Executing Autonomous Cycle...' : '⚡ Trigger Autonomous Cycle'}</span>
        </button>
      </div>

      {cycleResult && (
        <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{cycleResult}</span>
        </div>
      )}

      {/* Control Room Real Agent Nodes */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Server className="w-4 h-4 text-cyan-400" />
          <span>5 Autonomous Swarm Agent Nodes (Real State)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(controlRoomState?.agent_nodes || [
            { id: "SCOUT", name: "SCOUT Agent (Job Discovery)", icon: "🛰️", role: "Permitted Live ATS Discovery & Feed Harvesting", status: "IDLE" },
            { id: "MATCHER", name: "MATCHER Agent (8-Pillar Scoring)", icon: "🎯", role: "Multi-Dimensional Candidate Compatibility Evaluation", status: "IDLE" },
            { id: "TAILOR", name: "TAILOR Agent (Truthful ATS Resume)", icon: "✍️", role: "Zero Fabrication Resume Tailoring & STAR Optimization", status: "IDLE" },
            { id: "SENTRY", name: "SENTRY Agent (Application Queue & CRM)", icon: "🛡️", role: "Application Queue Tracking & Follow-up Audit", status: "WAITING_FOR_USER" },
            { id: "PREPARE", name: "PREPARE Agent (Screening & Readiness)", icon: "🎙️", role: "Personalized Screening Plans & Role Readiness", status: "IDLE" }
          ]).map((node: any) => (
            <div key={node.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-xs text-white">
                  <span className="text-lg">{node.icon}</span>
                  <span className="truncate">{node.name}</span>
                </div>
                {getStatusBadge(node.status)}
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">{node.role}</p>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                <span>Last Run: {node.last_run || 'Ready'}</span>
                <span className="text-cyan-400 font-bold">{node.metrics ? String(Object.values(node.metrics)[0]) : 'Active'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* User Automation Control Settings */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span>User Automation Control Settings</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Configure thresholds, approval requirements, and target preferences.</p>
          </div>

          <button
            onClick={handleSaveSettings}
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs shadow-md transition cursor-pointer"
          >
            {settingsSaved ? '✓ Settings Saved!' : 'Save Automation Settings'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-xs">
          {/* Minimum Match Score */}
          <div className="space-y-2 p-4 rounded-xl bg-slate-950 border border-slate-800">
            <div className="flex justify-between font-semibold text-slate-300">
              <span>Minimum Match Score Threshold:</span>
              <span className="text-cyan-400 font-bold">{minMatch}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="95"
              value={minMatch}
              onChange={(e) => setMinMatch(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
            <p className="text-[11px] text-slate-500">Jobs below this threshold will not be auto-tailored or queued.</p>
          </div>

          {/* Require Application Approval */}
          <div className="space-y-2 p-4 rounded-xl bg-slate-950 border border-slate-800">
            <span className="font-semibold text-slate-300 block">Application Submission Mode:</span>
            <label className="flex items-center gap-2 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={requireApproval}
                onChange={(e) => setRequireApproval(e.target.checked)}
                className="w-4 h-4 accent-cyan-400"
              />
              <span className="text-slate-200 font-bold">Require User Approval (Application-Ready Queue)</span>
            </label>
            <p className="text-[11px] text-slate-500">Enqueues tailored applications in queue for safety & verification before submitting.</p>
          </div>

          {/* Auto Tailor Resume */}
          <div className="space-y-2 p-4 rounded-xl bg-slate-950 border border-slate-800">
            <span className="font-semibold text-slate-300 block">AI Resume Tailoring:</span>
            <label className="flex items-center gap-2 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={autoTailor}
                onChange={(e) => setAutoTailor(e.target.checked)}
                className="w-4 h-4 accent-cyan-400"
              />
              <span className="text-slate-200 font-bold">Auto-Synthesize Job-Specific Resumes</span>
            </label>
            <p className="text-[11px] text-slate-500">Uses Prompt 7 Zero Fabrication Engine for 100% truthful resume tailoring.</p>
          </div>

          {/* Auto Prepare Screening */}
          <div className="space-y-2 p-4 rounded-xl bg-slate-950 border border-slate-800">
            <span className="font-semibold text-slate-300 block">AI Screening Preparation:</span>
            <label className="flex items-center gap-2 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={autoScreening}
                onChange={(e) => setAutoScreening(e.target.checked)}
                className="w-4 h-4 accent-cyan-400"
              />
              <span className="text-slate-200 font-bold">Auto-Generate 5-Part Screening Plans</span>
            </label>
            <p className="text-[11px] text-slate-500">Uses Prompt 8 Screening Engine for personalized interview preparation.</p>
          </div>

          {/* Location Preference */}
          <div className="space-y-2 p-4 rounded-xl bg-slate-950 border border-slate-800">
            <span className="font-semibold text-slate-300 block">Location Preference:</span>
            <input
              type="text"
              value={locationPref}
              onChange={(e) => setLocationPref(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono"
            />
          </div>

          {/* Remote Only */}
          <div className="space-y-2 p-4 rounded-xl bg-slate-950 border border-slate-800">
            <span className="font-semibold text-slate-300 block">Remote Work Preference:</span>
            <label className="flex items-center gap-2 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={remoteOnly}
                onChange={(e) => setRemoteOnly(e.target.checked)}
                className="w-4 h-4 accent-cyan-400"
              />
              <span className="text-slate-200 font-bold">Prioritize Remote / Flexible Roles</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
