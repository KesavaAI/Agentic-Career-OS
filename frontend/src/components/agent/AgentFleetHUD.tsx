import React, { useState, useEffect } from 'react';
import {
  Zap, Bot, Sparkles, Send, Shield, Activity, Terminal, ArrowRight,
  CheckCircle2, RefreshCw, Layers, Cpu, Compass, Lock
} from 'lucide-react';
import { api } from '../../lib/api';

interface AgentFleetHUDProps {
  onDirectiveApplied?: () => void;
  onNavigateTab?: (tab: string) => void;
}

export const AgentFleetHUD: React.FC<AgentFleetHUDProps> = ({ onDirectiveApplied, onNavigateTab }) => {
  const [swarmState, setSwarmState] = useState<any | null>(null);
  const [directiveInput, setDirectiveInput] = useState('');
  const [executingDirective, setExecutingDirective] = useState(false);
  const [directiveResponse, setDirectiveResponse] = useState<any | null>(null);
  const [pulsingSwarm, setPulsingSwarm] = useState(false);
  const [pulseSuccess, setPulseSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadSwarmDAG();
  }, []);

  const loadSwarmDAG = async () => {
    try {
      const [dagRes, controlRes] = await Promise.all([
        api.getSwarmDagState().catch(() => null),
        api.getControlRoomState().catch(() => null)
      ]);
      setSwarmState(controlRes || dagRes);
    } catch (err) {
      console.error('Failed to load swarm state:', err);
    }
  };

  const handleDirectiveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!directiveInput.trim()) return;

    try {
      setExecutingDirective(true);
      setDirectiveResponse(null);
      const res = await api.submitAgentDirective(directiveInput);
      setDirectiveResponse(res);
      setDirectiveInput('');
      await loadSwarmDAG();
      if (onDirectiveApplied) onDirectiveApplied();
    } catch (err: any) {
      alert('Directive submission failed: ' + err.message);
    } finally {
      setExecutingDirective(false);
    }
  };

  const handleQuickDirective = (text: string) => {
    setDirectiveInput(text);
  };

  const handleExecuteSwarmSweep = async () => {
    try {
      setPulsingSwarm(true);
      setPulseSuccess(null);
      const res = await api.orchestrateCareerAgentCycle();
      setPulseSuccess(`✓ Cycle Completed: Discovered ${res.jobs_discovered} jobs, Matched ${res.high_match_jobs} leads, Tailored ${res.resumes_tailored} resumes!`);
      await loadSwarmDAG();
      if (onDirectiveApplied) onDirectiveApplied();
      setTimeout(() => setPulseSuccess(null), 6000);
    } catch (err: any) {
      alert('Swarm execution failed: ' + err.message);
    } finally {
      setPulsingSwarm(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* 🛸 1. TOP AGENT FLEET STATUS BAR */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-cyan-950/40 border border-cyan-500/30 shadow-2xl space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shrink-0">
              <Cpu className="w-5 h-5 text-cyan-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold text-white tracking-wide">AUTONOMOUS AGENT FLEET (5 ACTIVE AGENTS)</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                  🟢 SWARM OPERATIONAL
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Operating 24/7 on your behalf: Scout Infiltration, STAR Synthesis, Headhunting, P99 Dossiers & Sentry Negotiation.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 self-end lg:self-center">
            <button
              disabled={pulsingSwarm}
              onClick={handleExecuteSwarmSweep}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
            >
              <Zap className={`w-3.5 h-3.5 fill-slate-950 ${pulsingSwarm ? 'animate-bounce' : ''}`} />
              <span>{pulsingSwarm ? 'Executing Swarm Sweep...' : (pulseSuccess || '⚡ Trigger Full Swarm Sweep')}</span>
            </button>

            {onNavigateTab && (
              <button
                onClick={() => onNavigateTab('career-agent')}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700 transition-colors"
                title="Open Telemetry Terminal"
              >
                Telemetry Logs →
              </button>
            )}
          </div>
        </div>

        {/* 5 Swarm Agent Micro-Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 text-xs font-medium">
          {swarmState?.nodes?.map((agent: any) => (
            <div
              key={agent.id}
              className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 hover:border-cyan-500/40 transition-all space-y-1 relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <span className="text-base">{agent.icon}</span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 font-bold">
                  {agent.status}
                </span>
              </div>
              <h4 className="font-extrabold text-[11px] text-slate-100 truncate">{agent.name}</h4>
              <div className="text-[10px] font-mono text-cyan-400 truncate">
                {Object.entries(agent.metrics || {}).map(([k, v]) => `${k.replace('_', ' ')}: ${v}`).join(' • ')}
              </div>
            </div>
          )) || (
            <>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px]">🛰️ Scout: 104 Feeds</div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px]">✍️ Tailor: 95.4% Match</div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px]">🎯 Headhunter: 6 VPs</div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px]">🏢 Dossier: 12 Briefs</div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px]">🛡️ Sentry: IMAP Active</div>
            </>
          )}
        </div>
      </div>

      {/* 🧠 2. NATURAL LANGUAGE EXECUTIVE DIRECTIVE TERMINAL */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-purple-500/30 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-extrabold text-white uppercase tracking-wider">
              Executive Commander Directive Bar
            </span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">
            Directly reconfigures Scout filters, STAR tailoring constraints & VP cold outreach tone
          </span>
        </div>

        <form onSubmit={handleDirectiveSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={directiveInput}
              onChange={(e) => setDirectiveInput(e.target.value)}
              placeholder="e.g. Focus exclusively on Series B-D startups paying ₹28L+ with React/Node/Go, bypass portals & target VP of Eng directly..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:border-purple-500 focus:outline-none font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={executingDirective || !directiveInput.trim()}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-purple-600/20 transition-all cursor-pointer shrink-0"
          >
            <Sparkles className={`w-3.5 h-3.5 ${executingDirective ? 'animate-spin' : ''}`} />
            <span>{executingDirective ? 'Calibrating Swarm...' : 'Issue Directive'}</span>
          </button>
        </form>

        {/* Quick Directive Chips */}
        <div className="flex flex-wrap items-center gap-1.5 text-[11px] pt-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase mr-1">Quick Directives:</span>
          {[
            "🎯 Prioritize Series B-D Tier-1 Startups (₹28L - ₹45L)",
            "🌐 100% Remote High-Scale Concurrency Roles",
            "🚀 Direct Infiltration via VP of Engineering Cold Pitches",
            "⚡ Focus on Next.js 15, FastAPI & High-Throughput Web"
          ].map((chip, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleQuickDirective(chip)}
              className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer text-[10px] font-mono"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Live Calibration Response Banner */}
        {directiveResponse && (
          <div className="p-3.5 rounded-xl bg-purple-950/60 border border-purple-500/40 text-xs text-purple-200 space-y-1.5 animate-in fade-in">
            <div className="flex items-center justify-between font-bold text-purple-300">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Swarm Calibrated to Directive: "{directiveResponse.directive}"</span>
              </span>
              <span className="text-[10px] font-mono text-purple-400">{directiveResponse.calibrated_at}</span>
            </div>
            <ul className="space-y-1 text-[11px] pl-5 list-disc text-purple-200">
              {directiveResponse.actions_executed.map((act: string, i: number) => (
                <li key={i}>{act}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
