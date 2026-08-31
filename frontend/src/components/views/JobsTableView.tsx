import React, { useState, useEffect, useMemo } from 'react';
import {
  Table as TableIcon, Download, Trash2, Plus, RefreshCw,
  Search, ExternalLink, Sparkles, Filter, ChevronDown, CheckSquare, Square,
  Zap, CheckCircle2, ShieldAlert, ArrowUpRight
} from 'lucide-react';
import { api } from '../../lib/api';
import { Job } from '../../types';

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
    if (confirm(`Are you sure you want to delete ${selectedIds.length} jobs?`)) {
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

  return (
    <div className="space-y-5 pb-12">
      {/* Header & Main Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2">
            <TableIcon className="w-5 h-5 text-cyan-400" />
            <span>Interactive Spreadsheet Job Tracker</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Full inline editing, autonomous classification, bulk AI dispatch, and CSV export. Changes persist automatically.
          </p>
        </div>

        {/* AI Action Buttons */}
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
            <span>{batchApplying ? 'Auto-Applying...' : selectedIds.length > 0 ? `⚡ Auto-Apply Selected (${selectedIds.length})` : '⚡ Auto-Apply All Tier-A'}</span>
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
            <span>Add Job</span>
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

      {/* Quick Filter Bar */}
      <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 w-full md:w-80 relative">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search table by role, company, location..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-slate-200 focus:border-cyan-500 focus:outline-none text-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-slate-300 text-xs focus:outline-none"
          >
            <option value="ALL">All Tiers (A, B, C)</option>
            <option value="A">Tier A (High Match)</option>
            <option value="B">Tier B</option>
            <option value="C">Tier C</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-slate-300 text-xs focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="READY TO APPLY">READY TO APPLY</option>
            <option value="AUTONOMOUSLY APPLIED">AUTONOMOUSLY APPLIED</option>
            <option value="APPLIED">APPLIED</option>
            <option value="NOT REVIEWED">NOT REVIEWED</option>
            <option value="SHORTLISTED">SHORTLISTED</option>
            <option value="INTERVIEW SCHEDULED">INTERVIEW SCHEDULED</option>
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
            Showing <strong className="text-white">{filteredJobs.length}</strong> of {jobs.length} jobs
          </span>
        </div>
      </div>

      {/* Spreadsheet Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto max-h-[620px] scrollbar-thin">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/90 text-slate-400 font-bold border-b border-slate-800 uppercase tracking-wider text-[10px] sticky top-0 z-10 backdrop-blur-md">
              <tr>
                <th className="p-3 w-10 text-center">
                  <button onClick={toggleSelectAll} className="cursor-pointer text-slate-400 hover:text-white">
                    {selectedIds.length > 0 && selectedIds.length === filteredJobs.length ? (
                      <CheckSquare className="w-4 h-4 text-cyan-400" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="p-3">Tier</th>
                <th className="p-3">Role & Company</th>
                <th className="p-3">Location & Mode</th>
                <th className="p-3">Salary Range</th>
                <th className="p-3">Match Score</th>
                <th className="p-3">Status (Inline Edit)</th>
                <th className="p-3">Freshness</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filteredJobs.map((j) => {
                const isSelected = selectedIds.includes(j.id);
                const isAutonomouslyApplied = j.status === 'AUTONOMOUSLY APPLIED';
                return (
                  <tr key={j.id} className={`hover:bg-slate-800/40 transition-colors ${isSelected ? 'bg-cyan-950/20' : ''}`}>
                    <td className="p-3 text-center">
                      <button onClick={() => toggleSelect(j.id)} className="cursor-pointer text-slate-400 hover:text-white">
                        {isSelected ? <CheckSquare className="w-4 h-4 text-cyan-400" /> : <Square className="w-4 h-4" />}
                      </button>
                    </td>

                    {/* Tier Selector */}
                    <td className="p-3">
                      <select
                        value={j.tier || 'A'}
                        onChange={(e) => handleInlineTierChange(j.id, e.target.value as any)}
                        className={`text-[10px] px-2 py-0.5 rounded font-extrabold uppercase border focus:outline-none ${
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
                    <td className="p-3">
                      <div className="space-y-0.5">
                        <span className="font-bold text-slate-100 block">{j.role}</span>
                        <span className="text-[11px] text-slate-400">{j.company_name}</span>
                      </div>
                    </td>

                    {/* Location */}
                    <td className="p-3 text-slate-300">
                      <div>{j.location || 'Bengaluru'}</div>
                      <span className="text-[10px] text-slate-500">Hybrid / Remote</span>
                    </td>

                    {/* Salary Range */}
                    <td className="p-3 font-mono text-emerald-400 text-xs">
                      {j.min_salary && j.max_salary ? `₹${j.min_salary}L - ₹${j.max_salary}L` : '₹18L - ₹32L'}
                    </td>

                    {/* Match Score */}
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-12 bg-slate-950 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${j.match_score || 92}%` }} />
                        </div>
                        <span className="font-mono text-slate-200 text-[11px] font-bold">{j.match_score || 92}%</span>
                      </div>
                    </td>

                    {/* Inline Status Select */}
                    <td className="p-3">
                      <select
                        value={j.status}
                        onChange={(e) => handleInlineStatusChange(j.id, e.target.value)}
                        className={`text-xs px-2.5 py-1 rounded-xl font-bold border focus:outline-none ${
                          isAutonomouslyApplied
                            ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/40'
                            : j.status === 'READY TO APPLY'
                            ? 'bg-cyan-950/80 text-cyan-400 border-cyan-500/40'
                            : j.status === 'INTERVIEW SCHEDULED'
                            ? 'bg-purple-950/80 text-purple-400 border-purple-500/40'
                            : 'bg-slate-950 text-slate-300 border-slate-800'
                        }`}
                      >
                        <option value="READY TO APPLY">READY TO APPLY</option>
                        <option value="AUTONOMOUSLY APPLIED">AUTONOMOUSLY APPLIED</option>
                        <option value="APPLIED">APPLIED</option>
                        <option value="NOT REVIEWED">NOT REVIEWED</option>
                        <option value="SHORTLISTED">SHORTLISTED</option>
                        <option value="OA / ASSESSMENT">OA / ASSESSMENT</option>
                        <option value="TECHNICAL ROUND">TECHNICAL ROUND</option>
                        <option value="SYSTEM DESIGN">SYSTEM DESIGN</option>
                        <option value="MANAGERIAL ROUND">MANAGERIAL ROUND</option>
                        <option value="HR ROUND">HR ROUND</option>
                        <option value="OFFER">OFFER</option>
                        <option value="REJECTED">REJECTED</option>
                      </select>
                    </td>

                    {/* Freshness */}
                    <td className="p-3">
                      <span className="text-[10px] text-amber-400 font-semibold flex items-center gap-1">
                        🔥 Just Posted (ATS)
                      </span>
                    </td>

                    {/* Action Buttons */}
                    <td className="p-3 text-right">
                      <button
                        onClick={() => onOpenPrepare(j.id)}
                        className="px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-[11px] rounded-lg transition-colors cursor-pointer"
                      >
                        Prepare
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
