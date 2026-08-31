import React, { useState, useEffect, useMemo } from 'react';
import {
  Table as TableIcon, Download, Trash2, Plus, RefreshCw,
  Search, ExternalLink, Sparkles, Filter, ChevronDown, CheckSquare, Square,
  Zap, CheckCircle2, ShieldAlert, ArrowUpRight, Target, Cpu, Send, Mail, FileText,
  Building2, Activity, Compass, Flame
} from 'lucide-react';
import { api } from '../../lib/api';
import { Job } from '../../types';
import { AgentFleetHUD } from '../agent/AgentFleetHUD';

interface JobsTableViewProps {
  onOpenPrepare: (jobId: number) => void;
  onOpenIngest: () => void;
}

export const JobsTableView: React.FC<JobsTableViewProps> = ({ onOpenPrepare, onOpenIngest }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // AI Automation Action States
  const [autoCleaning, setAutoCleaning] = useState(false);
  const [batchApplying, setBatchApplying] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const data = await api.getJobs();
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
      console.error('Failed to load jobs table:', err);
    } finally {
      setLoading(false);
    }
  };

  // 🤖 AI Automation 1: Auto-Classify Tech vs Non-Tech
  const handleAutoClassifyAndClean = async () => {
    try {
      setAutoCleaning(true);
      setActionSuccessMsg(null);
      const res = await api.autoClassifyAndCleanJobs();
      setActionSuccessMsg(res.message || '✓ AI Automation complete!');
      await loadJobs();
      setTimeout(() => setActionSuccessMsg(null), 5000);
    } catch (err: any) {
      alert('AI Classification failed: ' + err.message);
    } finally {
      setAutoCleaning(false);
    }
  };

  // ⚡ AI Automation 2: 1-Click Batch Auto-Apply
  const handleBatchAutoApply = async () => {
    const targetIds = selectedIds.length > 0
      ? selectedIds
      : filteredJobs.filter(j => j.tier === 'A' || (j.match_score && j.match_score >= 90)).map(j => j.id);

    if (targetIds.length === 0) {
      alert('No Tier-A matching jobs found to auto-apply.');
      return;
    }

    try {
      setBatchApplying(true);
      setActionSuccessMsg(null);
      const res = await api.batchAutoApplyJobs(targetIds);
      setActionSuccessMsg(res.message || `✓ Auto-Applied to ${targetIds.length} jobs!`);
      setSelectedIds([]);
      await loadJobs();
      setTimeout(() => setActionSuccessMsg(null), 5000);
    } catch (err: any) {
      alert('Batch auto-apply failed: ' + err.message);
    } finally {
      setBatchApplying(false);
    }
  };

  const handleInlineStatusChange = async (jobId: number, newStatus: string) => {
    try {
      await api.updateJob(jobId, { status: newStatus });
      setJobs(jobs.map(j => j.id === jobId ? { ...j, status: newStatus } : j));
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleInlineTierChange = async (jobId: number, newTier: 'A' | 'B' | 'C') => {
    try {
      await api.updateJob(jobId, { tier: newTier });
      setJobs(jobs.map(j => j.id === jobId ? { ...j, tier: newTier } : j));
    } catch (err) {
      console.error('Failed to update tier:', err);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (confirm(`Are you sure you want to delete ${selectedIds.length} target records?`)) {
      try {
        for (const id of selectedIds) {
          await api.deleteJob(id);
        }
        setJobs(jobs.filter(j => !selectedIds.includes(j.id)));
        setSelectedIds([]);
      } catch (err) {
        console.error('Bulk delete failed:', err);
      }
    }
  };

  const handleExportCSV = () => {
    window.open('/api/v1/backup-export/export-jobs-csv', '_blank');
  };

  const filteredJobs = useMemo(() => {
    return jobs.filter(j => {
      const matchSearch = search === '' ||
        j.role.toLowerCase().includes(search.toLowerCase()) ||
        j.company_name.toLowerCase().includes(search.toLowerCase()) ||
        j.location.toLowerCase().includes(search.toLowerCase());
      const matchTier = tierFilter === 'ALL' || j.tier === tierFilter;
      const matchStatus = statusFilter === 'ALL' || j.status === statusFilter;
      return matchSearch && matchTier && matchStatus;
    });
  }, [jobs, search, tierFilter, statusFilter]);

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredJobs.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredJobs.map(j => j.id));
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const getInfiltrationVector = (company: string, score: number) => {
    if (score >= 95) return { vector: "Direct VP Eng Cold Pitch", color: "text-purple-400 bg-purple-950/80 border-purple-500/30" };
    if (score >= 90) return { vector: "ATS API Infiltration", color: "text-cyan-400 bg-cyan-950/80 border-cyan-500/30" };
    return { vector: "Employee Referral Route", color: "text-emerald-400 bg-emerald-950/80 border-emerald-500/30" };
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 🛸 1. UNIVERSAL AGENT FLEET HUD */}
      <AgentFleetHUD onDirectiveApplied={loadJobs} />

      {/* Header & Main Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase bg-cyan-950/80 px-2.5 py-0.5 rounded border border-cyan-500/30">
              MISSION TARGETS MATRIX
            </span>
            <span className="text-xs text-slate-400 font-mono">Live Swarm Infiltration Grid</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-100 tracking-tight mt-0.5">
            Tactical Target Operations & Infiltration Pipeline
          </h2>
          <p className="text-xs text-slate-400">
            Autonomous multi-vector dispatch: AST-hardened STAR resumes, VP of Eng cold pitches & direct ATS API routing.
          </p>
        </div>

        {/* Tactical Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            disabled={autoCleaning}
            onClick={handleAutoClassifyAndClean}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-500/40 text-purple-200 text-xs font-bold transition-all shadow-lg cursor-pointer"
            title="Classify tech jobs as Tier-A and purge irrelevant sales/content roles"
          >
            <Sparkles className={`w-3.5 h-3.5 text-purple-400 ${autoCleaning ? 'animate-spin' : ''}`} />
            <span>{autoCleaning ? 'Classifying...' : '🤖 AI Auto-Classify'}</span>
          </button>

          <button
            disabled={batchApplying}
            onClick={handleBatchAutoApply}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-extrabold transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
            title="Autonomously apply to all selected or Tier-A jobs with AI-tailored STAR resumes"
          >
            <Zap className={`w-3.5 h-3.5 fill-slate-950 ${batchApplying ? 'animate-bounce' : ''}`} />
            <span>{batchApplying ? 'Infiltrating...' : selectedIds.length > 0 ? `⚡ Swarm Infiltrate Selected (${selectedIds.length})` : '⚡ Swarm Infiltrate All Tier-A'}</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={onOpenIngest}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-colors cursor-pointer shadow-lg shadow-cyan-600/20"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Target</span>
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {actionSuccessMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-medium flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionSuccessMsg}</span>
          </div>
          <button onClick={() => setActionSuccessMsg(null)} className="text-emerald-400 hover:text-white text-xs font-bold">✕</button>
        </div>
      )}

      {/* Quick Tactical Filter Bar */}
      <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 w-full md:w-80 relative">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search targets by role, company, location..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-slate-200 focus:border-cyan-500 focus:outline-none text-xs font-mono"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-slate-300 text-xs focus:outline-none font-mono"
          >
            <option value="ALL">All Priority Tiers (A, B, C)</option>
            <option value="A">Tier A (High Target Fit)</option>
            <option value="B">Tier B</option>
            <option value="C">Tier C</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-slate-300 text-xs focus:outline-none font-mono"
          >
            <option value="ALL">All Mission Statuses</option>
            <option value="READY TO APPLY">READY TO INFILTRATE</option>
            <option value="AUTONOMOUSLY APPLIED">AUTONOMOUSLY APPLIED</option>
            <option value="SHORTLISTED">SHORTLISTED</option>
            <option value="TECHNICAL ROUND">TECHNICAL ROUND</option>
            <option value="INTERVIEW SCHEDULED">INTERVIEW SCHEDULED</option>
            <option value="OFFER">OFFER SECURED</option>
          </select>

          {selectedIds.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-1 px-3 py-1.5 bg-rose-950/80 hover:bg-rose-900 border border-rose-500/40 text-rose-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span>Delete ({selectedIds.length})</span>
            </button>
          )}

          <span className="text-slate-400 font-mono text-[11px] pl-2 whitespace-nowrap">
            Showing <strong className="text-cyan-400">{filteredJobs.length}</strong> of {jobs.length} Targets
          </span>
        </div>
      </div>

      {/* Tactical Matrix Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto max-h-[620px] scrollbar-thin">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/90 text-slate-400 font-bold border-b border-slate-800 uppercase tracking-wider text-[10px] sticky top-0 z-10 backdrop-blur-md">
              <tr>
                <th className="p-3.5 w-10 text-center">
                  <button onClick={toggleSelectAll} className="cursor-pointer text-slate-400 hover:text-white">
                    {selectedIds.length > 0 && selectedIds.length === filteredJobs.length ? (
                      <CheckSquare className="w-4 h-4 text-cyan-400" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="p-3.5">Tier</th>
                <th className="p-3.5">Target Company & Role</th>
                <th className="p-3.5">Infiltration Strategy</th>
                <th className="p-3.5">Compensation Band</th>
                <th className="p-3.5">AST Match</th>
                <th className="p-3.5">Pipeline Status</th>
                <th className="p-3.5 text-right">Autonomous Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filteredJobs.map((j) => {
                const isSelected = selectedIds.includes(j.id);
                const isAutonomouslyApplied = j.status === 'AUTONOMOUSLY APPLIED';
                const vector = getInfiltrationVector(j.company_name, j.match_score || 92);

                return (
                  <tr key={j.id} className={`hover:bg-slate-800/40 transition-colors ${isSelected ? 'bg-cyan-950/20' : ''}`}>
                    <td className="p-3.5 text-center">
                      <button onClick={() => toggleSelect(j.id)} className="cursor-pointer text-slate-400 hover:text-white">
                        {isSelected ? <CheckSquare className="w-4 h-4 text-cyan-400" /> : <Square className="w-4 h-4" />}
                      </button>
                    </td>

                    {/* Tier Selector */}
                    <td className="p-3.5">
                      <select
                        value={j.tier || 'A'}
                        onChange={(e) => handleInlineTierChange(j.id, e.target.value as any)}
                        className={`text-[10px] px-2.5 py-1 rounded font-extrabold uppercase border focus:outline-none font-mono ${
                          j.tier === 'A'
                            ? 'bg-emerald-950 text-emerald-400 border-emerald-500/40'
                            : j.tier === 'B'
                            ? 'bg-cyan-950 text-cyan-400 border-cyan-500/40'
                            : 'bg-slate-950 text-slate-400 border-slate-800'
                        }`}
                      >
                        <option value="A">Tier A</option>
                        <option value="B">Tier B</option>
                        <option value="C">Tier C</option>
                      </select>
                    </td>

                    {/* Role & Company */}
                    <td className="p-3.5">
                      <div className="space-y-0.5">
                        <span className="font-extrabold text-slate-100 text-sm block">{j.role}</span>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                          <span className="text-cyan-400 font-bold">{j.company_name}</span>
                          <span>• {j.location || 'Bengaluru'}</span>
                        </div>
                      </div>
                    </td>

                    {/* Infiltration Vector */}
                    <td className="p-3.5">
                      <span className={`text-[10px] font-mono px-2.5 py-1 rounded-lg border font-bold ${vector.color}`}>
                        {vector.vector}
                      </span>
                    </td>

                    {/* Salary Range */}
                    <td className="p-3.5 font-mono text-emerald-400 text-xs font-bold">
                      {j.min_salary && j.max_salary ? `₹${j.min_salary}L - ₹${j.max_salary}L LPA` : '₹20L - ₹35L LPA'}
                    </td>

                    {/* Match Score */}
                    <td className="p-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-14 bg-slate-950 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${j.match_score || 93}%` }} />
                        </div>
                        <span className="font-mono text-emerald-400 text-xs font-bold">{j.match_score || 93}%</span>
                      </div>
                    </td>

                    {/* Inline Status Select */}
                    <td className="p-3.5">
                      <select
                        value={j.status}
                        onChange={(e) => handleInlineStatusChange(j.id, e.target.value)}
                        className={`text-xs px-2.5 py-1 rounded-xl font-bold border focus:outline-none font-mono ${
                          isAutonomouslyApplied
                            ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/40'
                            : j.status === 'READY TO APPLY'
                            ? 'bg-cyan-950/80 text-cyan-400 border-cyan-500/40'
                            : j.status === 'INTERVIEW SCHEDULED' || j.status === 'TECHNICAL ROUND'
                            ? 'bg-purple-950/80 text-purple-400 border-purple-500/40'
                            : 'bg-slate-950 text-slate-300 border-slate-800'
                        }`}
                      >
                        <option value="READY TO APPLY">READY TO INFILTRATE</option>
                        <option value="AUTONOMOUSLY APPLIED">AUTONOMOUSLY APPLIED</option>
                        <option value="SHORTLISTED">SHORTLISTED</option>
                        <option value="TECHNICAL ROUND">TECHNICAL ROUND</option>
                        <option value="SYSTEM DESIGN">SYSTEM DESIGN</option>
                        <option value="MANAGERIAL ROUND">MANAGERIAL ROUND</option>
                        <option value="OFFER">OFFER SECURED</option>
                        <option value="REJECTED">REJECTED</option>
                      </select>
                    </td>

                    {/* Action Buttons */}
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => onOpenPrepare(j.id)}
                        className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
                      >
                        Prepare Dispatch
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
