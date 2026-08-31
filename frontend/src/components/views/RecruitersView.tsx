import React, { useState, useEffect } from 'react';
import { Users2, Mail, MessageSquare, Copy, Check, Sparkles, Send, Briefcase, Zap, ShieldCheck, CheckCircle } from 'lucide-react';
import { api } from '../../lib/api';
import { Recruiter } from '../../types';

export const RecruitersView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'headhunter' | 'crm'>('headhunter');
  const [recruiters, setRecruiters] = useState<Recruiter[]>([]);
  const [verifiedTargets, setVerifiedTargets] = useState<any[]>([]);
  const [selectedTarget, setSelectedTarget] = useState<any | null>(null);
  const [pitchData, setPitchData] = useState<any | null>(null);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [dispatchSuccess, setDispatchSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [crmData, targets] = await Promise.all([
        api.getRecruiters().catch(() => []),
        api.getVerifiedRecruiters().catch(() => [])
      ]);
      setRecruiters(crmData || []);
      setVerifiedTargets(targets || []);
      if (targets && targets.length > 0) {
        setSelectedTarget(targets[0]);
        generatePitch(targets[0]);
      }
    } catch (err) {
      console.error('Failed to load recruiter data:', err);
    }
  };

  const generatePitch = async (target: any) => {
    try {
      setGenerating(true);
      setDispatchSuccess(null);
      const res = await api.generateRecruiterPitch({
        recruiter_name: target.name,
        company_name: target.company,
        recruiter_role: target.role,
        candidate_skills: target.tech_focus
      });
      setPitchData(res);
    } catch (err) {
      console.error('Failed to generate pitch:', err);
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = () => {
    if (pitchData) {
      navigator.clipboard.writeText(`${pitchData.subject}\n\n${pitchData.body}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDispatchDirect = async () => {
    if (!selectedTarget?.email || !pitchData) return;
    try {
      const res = await api.sendOutreachEmail({
        to_email: selectedTarget.email,
        subject: pitchData.subject,
        body: pitchData.body
      });
      setDispatchSuccess(`✓ Pitch successfully dispatched to ${selectedTarget.email}!`);
      setTimeout(() => setDispatchSuccess(null), 4000);
    } catch (err: any) {
      alert('Failed to dispatch email: ' + err.message);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-cyan-950/30 to-slate-900 border border-cyan-500/20 shadow-xl">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Zap className="w-5 h-5 text-cyan-400" />
            <span>Autonomous Recruiter Headhunter & Outreach Agent</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Identifies verified engineering hiring managers at target companies and synthesizes high-conversion 3-sentence cold pitches.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('headhunter')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'headhunter' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            🎯 Tier-1 Hiring Managers
          </button>
          <button
            onClick={() => setActiveTab('crm')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'crm' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            📋 Recruiter CRM ({recruiters.length})
          </button>
        </div>
      </div>

      {activeTab === 'headhunter' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Target List */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Verified Engineering Targets ({verifiedTargets.length})
            </h3>
            {verifiedTargets.map((target) => (
              <div
                key={target.id}
                onClick={() => {
                  setSelectedTarget(target);
                  generatePitch(target);
                }}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedTarget?.id === target.id
                    ? 'bg-slate-900 border-cyan-500 shadow-lg shadow-cyan-500/10'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between font-bold text-xs text-slate-100">
                  <span>{target.name}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 font-mono font-bold">
                    {target.company}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 font-medium mt-1">{target.role}</p>
                <p className="text-[10px] text-slate-500 mt-1 truncate">Focus: {target.tech_focus}</p>
              </div>
            ))}
          </div>

          {/* Pitch Generator Console */}
          <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-bold text-cyan-400 uppercase">Target Recruiter Hook</span>
                <h3 className="font-extrabold text-sm text-slate-100">
                  {selectedTarget?.name} — {selectedTarget?.company} ({selectedTarget?.role})
                </h3>
              </div>

              {pitchData && (
                <span className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono font-bold">
                  ⚡ ~{pitchData.estimated_read_time_seconds}s Read Time
                </span>
              )}
            </div>

            {dispatchSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-bold animate-pulse">
                {dispatchSuccess}
              </div>
            )}

            {generating ? (
              <div className="text-center py-16 text-slate-400 space-y-2">
                <Sparkles className="w-6 h-6 mx-auto animate-spin text-cyan-400" />
                <p className="text-xs font-mono">Synthesizing 3-sentence high-conversion technical pitch...</p>
              </div>
            ) : pitchData ? (
              <div className="space-y-4 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Subject Line</span>
                  <p className="font-semibold text-slate-200">{pitchData.subject}</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {pitchData.body}
                </div>

                <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/30 flex items-center justify-between text-[11px] text-slate-300">
                  <span>Optimal Dispatch Window: <strong className="text-cyan-400">{pitchData.optimal_dispatch_time}</strong></span>
                  <span>Framework: <strong className="text-white">3-Sentence High-Impact Hook</strong></span>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    onClick={handleDispatchDirect}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl transition-all cursor-pointer shadow-lg shadow-cyan-600/20"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Dispatch Direct Email</span>
                  </button>

                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied!' : 'Copy Script'}</span>
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : (
        /* CRM Tab */
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-300 space-y-4">
          <h3 className="font-bold text-slate-200">Recruiter Contacts CRM</h3>
          {recruiters.length === 0 ? (
            <p className="text-slate-500">No recruiters saved in local CRM. Auto-Pilot syncs recruiters automatically.</p>
          ) : (
            recruiters.map((r) => (
              <div key={r.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between">
                <div>
                  <p className="font-bold text-white">{r.name}</p>
                  <p className="text-slate-400">{r.company_name} • {r.role}</p>
                </div>
                <span className="font-mono text-emerald-400">{r.status}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
