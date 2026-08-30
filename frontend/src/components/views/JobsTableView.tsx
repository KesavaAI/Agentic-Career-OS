import React, { useState, useEffect, useMemo } from 'react';
import {
  Table as TableIcon, Download, Trash2, Plus, RefreshCw,
  Search, ExternalLink, Sparkles, Filter, ChevronDown, CheckSquare, Square
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

  const toggleSelectRow = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Top Toolbar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2">
            <TableIcon className="w-5 h-5 text-emerald-400" />
            <span>Interactive Spreadsheet Job Tracker</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Full inline editing, status updates, bulk actions, and CSV export. Changes persist automatically.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {selectedIds.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-1 px-3 py-1.5 bg-red-600/20 text-red-400 border border-red-500/30 hover:bg-red-600/30 font-bold text-xs rounded-lg transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete ({selectedIds.length})</span>
            </button>
          )}

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={onOpenIngest}
            className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Job</span>
          </button>
        </div>
      </div>

      {/* Filter Row */}
      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search table..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">All Tiers</option>
            <option value="A">Tier A (High Fit / ₹18L+)</option>
            <option value="B">Tier B (Good Fit)</option>
            <option value="C">Tier C (Backup)</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="NOT REVIEWED">NOT REVIEWED</option>
            <option value="SHORTLISTED">SHORTLISTED</option>
            <option value="READY TO APPLY">READY TO APPLY</option>
            <option value="APPLIED">APPLIED</option>
            <option value="TECHNICAL ROUND">TECHNICAL ROUND</option>
            <option value="OFFER">OFFER</option>
          </select>
        </div>

        <div className="text-xs text-slate-400">
          Showing <strong className="text-slate-200">{filteredJobs.length}</strong> of {jobs.length} jobs
        </div>
      </div>

      {/* Spreadsheet Table Container */}
      <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden shadow-lg">
        <div className="overflow-x-auto max-h-[680px]">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-950/90 sticky top-0 z-20 border-b border-slate-800 backdrop-blur-sm">
              <tr>
                <th className="p-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={selectedIds.length > 0 && selectedIds.length === filteredJobs.length}
                    onChange={toggleSelectAll}
                    className="rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-emerald-500"
                  />
                </th>
                <th className="p-3 font-extrabold text-slate-400 uppercase tracking-wider">Tier</th>
                <th className="p-3 font-extrabold text-slate-400 uppercase tracking-wider">Role & Company</th>
                <th className="p-3 font-extrabold text-slate-400 uppercase tracking-wider">Location & Mode</th>
                <th className="p-3 font-extrabold text-slate-400 uppercase tracking-wider">Salary Range</th>
                <th className="p-3 font-extrabold text-slate-400 uppercase tracking-wider">Match Score</th>
                <th className="p-3 font-extrabold text-slate-400 uppercase tracking-wider">Status (Inline Edit)</th>
                <th className="p-3 font-extrabold text-slate-400 uppercase tracking-wider">Freshness</th>
                <th className="p-3 font-extrabold text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filteredJobs.map((job) => {
                const isSelected = selectedIds.includes(job.id);
                return (
                  <tr
                    key={job.id}
                    className={`hover:bg-slate-800/40 transition-colors ${
                      isSelected ? 'bg-emerald-950/20' : ''
                    }`}
                  >
                    <td className="p-3 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectRow(job.id)}
                        className="rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-emerald-500"
                      />
                    </td>

                    {/* Tier Dropdown */}
                    <td className="p-3">
                      <select
                        value={job.tier}
                        onChange={(e) => handleInlineTierChange(job.id, e.target.value as 'A' | 'B' | 'C')}
                        className={`text-[11px] font-extrabold px-2 py-1 rounded bg-slate-950 border focus:outline-none cursor-pointer ${
                          job.tier === 'A' ? 'text-emerald-400 border-emerald-500/40' : (job.tier === 'B' ? 'text-blue-400 border-blue-500/40' : 'text-slate-400 border-slate-700')
                        }`}
                      >
                        <option value="A">Tier A</option>
                        <option value="B">Tier B</option>
                        <option value="C">Tier C</option>
                      </select>
                    </td>

                    {/* Role & Company */}
                    <td className="p-3">
                      <p className="font-bold text-slate-100">{job.role}</p>
                      <p className="text-[11px] text-slate-400">{job.company_name}</p>
                    </td>

                    {/* Location */}
                    <td className="p-3 text-slate-300">
                      <p>{job.location}</p>
                      <p className="text-[10px] text-slate-500">{job.work_mode}</p>
                    </td>

                    {/* Salary */}
                    <td className="p-3 font-mono font-bold text-emerald-400">
                      ₹{job.min_salary ?? 7.0}L - ₹{job.max_salary ?? 12.0}L
                    </td>

                    {/* Match Score */}
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-12 bg-slate-950 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full ${job.match_score >= 85 ? 'bg-emerald-500' : 'bg-blue-500'}`}
                            style={{ width: `${job.match_score}%` }}
                          ></div>
                        </div>
                        <span className="font-mono font-bold text-slate-200 text-[11px]">{job.match_score}%</span>
                      </div>
                    </td>

                    {/* Status Inline Dropdown */}
                    <td className="p-3">
                      <select
                        value={job.status}
                        onChange={(e) => handleInlineStatusChange(job.id, e.target.value)}
                        className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-[11px] font-semibold text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
                      >
                        <option value="NOT REVIEWED">NOT REVIEWED</option>
                        <option value="SHORTLISTED">SHORTLISTED</option>
                        <option value="READY TO APPLY">READY TO APPLY</option>
                        <option value="APPLIED">APPLIED</option>
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
                    <td className="p-3 text-[11px] text-slate-300">
                      {job.freshness_badge}
                    </td>

                    {/* Actions */}
                    <td className="p-3 text-right">
                      <button
                        onClick={() => onOpenPrepare(job.id)}
                        className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[11px] rounded transition-colors"
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
