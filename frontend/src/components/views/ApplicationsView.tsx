import { AgentFleetHUD } from '../agent/AgentFleetHUD';
import React, { useState, useEffect, useMemo } from 'react';
import {
  Send, Plus, Search, Calendar, ChevronRight, Clock, CheckCircle2, FileText, ArrowRight, Trash2,
  RotateCcw, AlertTriangle, Zap, LayoutGrid, ListFilter, SlidersHorizontal, User, Mail,
  ExternalLink, Sparkles, Building2, MapPin, DollarSign, Award, ShieldCheck, CheckSquare,
  FileCheck, History, PlusCircle, ArrowUpRight, Check, X, Filter, BarChart3, TrendingUp
} from 'lucide-react';
import { api } from '../../lib/api';
import { Application } from '../../types';

// Prompt 6 Standard Application Lifecycle Stages
const STAGES = [
  { id: 'SAVED', title: 'Saved / Wishlist', color: 'border-slate-700 bg-slate-900/80 text-slate-300' },
  { id: 'PREPARING', title: 'Preparing', color: 'border-cyan-500/40 bg-cyan-950/20 text-cyan-300' },
  { id: 'APPLIED', title: 'Applied', color: 'border-blue-500/40 bg-blue-950/20 text-blue-300' },
  { id: 'ASSESSMENT', title: 'Assessment / OA', color: 'border-purple-500/40 bg-purple-950/20 text-purple-300' },
  { id: 'RECRUITER_SCREEN', title: 'Recruiter Screen', color: 'border-amber-500/40 bg-amber-950/20 text-amber-300' },
  { id: 'INTERVIEW', title: 'Tech Interview', color: 'border-indigo-500/40 bg-indigo-950/20 text-indigo-300' },
  { id: 'FINAL_ROUND', title: 'Final Round', color: 'border-pink-500/40 bg-pink-950/20 text-pink-300' },
  { id: 'OFFER', title: 'Offer Received', color: 'border-emerald-500/50 bg-emerald-950/30 text-emerald-300' },
  { id: 'REJECTED', title: 'Rejected', color: 'border-rose-900/50 bg-rose-950/20 text-rose-400' },
  { id: 'WITHDRAWN', title: 'Withdrawn', color: 'border-slate-800 bg-slate-950 text-slate-500' }
];

export const ApplicationsView: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [evidenceList, setEvidenceList] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Form State: Add Evidence
  const [showAddEvidence, setShowAddEvidence] = useState(false);
  const [evidenceTitle, setEvidenceTitle] = useState('');
  const [evidenceType, setEvidenceType] = useState('CONFIRMATION');
  const [evidenceContent, setEvidenceContent] = useState('');

  // Form State: Edit Notes & Recruiter
  const [editNotes, setEditNotes] = useState('');
  const [editNextAction, setEditNextAction] = useState('');
  const [recruiterName, setRecruiterName] = useState('');
  const [recruiterEmail, setRecruiterEmail] = useState('');
  const [savingDetails, setSavingDetails] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [appsData, analyticsData] = await Promise.all([
        api.getApplications(),
        api.getApplicationAnalyticsSummary().catch(() => null)
      ]);
      setApplications(appsData || []);
      setAnalytics(analyticsData);

      if (appsData && appsData.length > 0) {
        handleSelectApp(appsData[0]);
      } else {
        setSelectedApp(null);
      }
    } catch (err) {
      console.error('Failed to load application CRM data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectApp = async (app: Application) => {
    setSelectedApp(app);
    setEditNotes(app.notes || '');
    setEditNextAction(app.next_action || '');
    setRecruiterName((app as any).recruiter_name || '');
    setRecruiterEmail((app as any).recruiter_email || '');

    try {
      const [evtData, evData] = await Promise.all([
        api.getApplicationEvents(app.id).catch(() => []),
        api.getApplicationEvidence(app.id).catch(() => [])
      ]);
      setEvents(evtData);
      setEvidenceList(evData);
    } catch (err) {
      console.error('Failed to load application timeline/evidence:', err);
    }
  };

  const handleUpdateStatus = async (appId: number, newStatus: string) => {
    try {
      const updated = await api.updateApplication(appId, { status: newStatus });
      setApplications(applications.map(a => a.id === appId ? updated : a));
      if (selectedApp?.id === appId) {
        setSelectedApp(updated);
        const evtData = await api.getApplicationEvents(appId);
        setEvents(evtData);
      }
      // Refresh analytics
      const freshAnalytics = await api.getApplicationAnalyticsSummary().catch(() => null);
      if (freshAnalytics) setAnalytics(freshAnalytics);
    } catch (err: any) {
      alert('Failed to update status: ' + err.message);
    }
  };

  const handleSaveDetails = async () => {
    if (!selectedApp) return;
    try {
      setSavingDetails(true);
      const updated = await api.updateApplication(selectedApp.id, {
        notes: editNotes,
        next_action: editNextAction,
        recruiter_name: recruiterName,
        recruiter_email: recruiterEmail
      });
      setSelectedApp(updated);
      setApplications(applications.map(a => a.id === selectedApp.id ? updated : a));
    } catch (err: any) {
      alert('Failed to save application record: ' + err.message);
    } finally {
      setSavingDetails(false);
    }
  };

  const handleAddEvidence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp || !evidenceTitle) return;
    try {
      const newEv = await api.addApplicationEvidence(selectedApp.id, {
        application_id: selectedApp.id,
        title: evidenceTitle,
        evidence_type: evidenceType,
        content: evidenceContent
      });
      setEvidenceList([newEv, ...evidenceList]);
      setEvidenceTitle('');
      setEvidenceContent('');
      setShowAddEvidence(false);
    } catch (err: any) {
      alert('Failed to add evidence item: ' + err.message);
    }
  };

  const handleDeleteApp = async (id: number) => {
    if (!confirm('Are you sure you want to remove this application from your CRM?')) return;
    try {
      await api.deleteApplication(id);
      const remaining = applications.filter(a => a.id !== id);
      setApplications(remaining);
      if (selectedApp?.id === id) {
        setSelectedApp(remaining.length > 0 ? remaining[0] : null);
      }
      const freshAnalytics = await api.getApplicationAnalyticsSummary().catch(() => null);
      if (freshAnalytics) setAnalytics(freshAnalytics);
    } catch (err: any) {
      alert('Failed to delete: ' + err.message);
    }
  };

  const filteredApps = useMemo(() => {
    return applications.filter(a => {
      const matchesSearch = !searchQuery ||
        a.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.role_title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || a.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [applications, searchQuery, statusFilter]);

  const mapToStageId = (statusStr: string): string => {
    const s = (statusStr || '').toUpperCase();
    if (s.includes('SAVE') || s.includes('READY') || s.includes('SHORTLIST')) return 'SAVED';
    if (s.includes('PREPAR')) return 'PREPARING';
    if (s.includes('APPLIED') || s.includes('SUBMIT') || s.includes('CONFIRM')) return 'APPLIED';
    if (s.includes('ASSESS') || s.includes('OA')) return 'ASSESSMENT';
    if (s.includes('RECRUITER') || s.includes('SCREEN')) return 'RECRUITER_SCREEN';
    if (s.includes('INTERVIEW') || s.includes('TECH') || s.includes('DESIGN')) return 'INTERVIEW';
    if (s.includes('FINAL') || s.includes('MANAGERIAL') || s.includes('HR')) return 'FINAL_ROUND';
    if (s.includes('OFFER')) return 'OFFER';
    if (s.includes('REJECT')) return 'REJECTED';
    if (s.includes('WITHDRAW')) return 'WITHDRAWN';
    return 'SAVED';
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 🛸 UNIVERSAL AGENT FLEET HUD */}
      <AgentFleetHUD onDirectiveApplied={loadData} />

      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2">
              <Send className="w-5 h-5 text-emerald-400" />
              <span>Application Intelligence & Career CRM</span>
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800/40">
              Prompt 6 Persistent CRM
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Track real applications through the complete 10-stage lifecycle • Evidence Vault • Real conversion analytics.
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex items-center p-1 bg-slate-900 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                viewMode === 'kanban' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Kanban Board</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                viewMode === 'list' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span>List / Data Table</span>
            </button>
          </div>
        </div>
      </div>

      {/* REAL CRM ANALYTICS DASHBOARD (No Hardcoded Numbers) */}
      {analytics && (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 text-[10px] font-bold uppercase">
              <span>Total Tracked</span>
              <Building2 className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <p className="text-2xl font-extrabold text-white mt-1">{analytics.total_applications}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">{analytics.active_applications} Active</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 text-[10px] font-bold uppercase">
              <span>Applied</span>
              <Send className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <p className="text-2xl font-extrabold text-blue-300 mt-1">{analytics.applied_count}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Submitted via ATS</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 text-[10px] font-bold uppercase">
              <span>Response Rate</span>
              <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
            </div>
            <p className="text-2xl font-extrabold text-purple-300 mt-1">{analytics.response_rate}%</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Moved past Applied</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 text-[10px] font-bold uppercase">
              <span>Interview Rate</span>
              <User className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <p className="text-2xl font-extrabold text-indigo-300 mt-1">{analytics.interview_rate}%</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Reached Tech Round</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 text-[10px] font-bold uppercase">
              <span>Offer Rate</span>
              <Award className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <p className="text-2xl font-extrabold text-emerald-300 mt-1">{analytics.offer_rate}%</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Received Offer</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 text-[10px] font-bold uppercase">
              <span>Rejection Rate</span>
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            </div>
            <p className="text-2xl font-extrabold text-rose-400 mt-1">{analytics.rejection_rate}%</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Not Selected</p>
          </div>
        </div>
      )}

      {/* Main Content Layout */}
      {viewMode === 'kanban' ? (
        /* 📋 KANBAN BOARD VIEW */
        <div className="flex gap-4 overflow-x-auto pb-4 items-start min-h-[600px]">
          {STAGES.map((st) => {
            const stageApps = filteredApps.filter(a => mapToStageId(a.status) === st.id);

            return (
              <div
                key={st.id}
                className="w-72 shrink-0 flex flex-col rounded-2xl bg-slate-950/70 border border-slate-800/80 p-3 max-h-[75vh]"
              >
                {/* Stage Header */}
                <div className={`flex items-center justify-between px-3 py-2 rounded-xl border mb-3 ${st.color}`}>
                  <span className="text-xs font-bold tracking-tight">{st.title}</span>
                  <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-slate-950/80 text-white border border-slate-700">
                    {stageApps.length}
                  </span>
                </div>

                {/* Cards Container */}
                <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                  {stageApps.length === 0 ? (
                    <div className="py-8 text-center border border-dashed border-slate-800/60 rounded-xl text-slate-600 text-xs">
                      Empty stage
                    </div>
                  ) : (
                    stageApps.map((app) => (
                      <div
                        key={app.id}
                        onClick={() => handleSelectApp(app)}
                        className={`p-3.5 rounded-xl bg-slate-900 border transition-all cursor-pointer space-y-2 hover:border-slate-600 ${
                          selectedApp?.id === app.id ? 'border-emerald-500 shadow-md shadow-emerald-500/10' : 'border-slate-800'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="text-xs font-bold text-white tracking-tight">{app.company_name}</h4>
                            <p className="text-xs font-semibold text-cyan-300 mt-0.5">{app.role_title}</p>
                          </div>
                          <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-slate-950 text-emerald-400 border border-emerald-500/30">
                            {app.match_score || 80}%
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
                          <span>{app.source || 'Direct ATS'}</span>
                          <span>{app.applied_date ? new Date(app.applied_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'Saved'}</span>
                        </div>

                        {/* Stage Quick Move Dropdown */}
                        <div className="pt-1">
                          <select
                            value={mapToStageId(app.status)}
                            onChange={(e) => handleUpdateStatus(app.id, e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full text-[10px] bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-300 focus:outline-none focus:border-cyan-500 cursor-pointer font-medium"
                          >
                            {STAGES.map(s => (
                              <option key={s.id} value={s.id}>{s.title}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* 📊 LIST / TABLE DATA VIEW */
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-4 bg-slate-900 p-3 rounded-xl border border-slate-800">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by company, role title..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
              >
                <option value="ALL">All Stages</option>
                {STAGES.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
              </select>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Company & Role</th>
                  <th className="px-4 py-3">Stage</th>
                  <th className="px-4 py-3">Source</th>
                  <th className="px-4 py-3">Match Score</th>
                  <th className="px-4 py-3">Applied Date</th>
                  <th className="px-4 py-3">Next Action</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredApps.map((app) => (
                  <tr
                    key={app.id}
                    onClick={() => handleSelectApp(app)}
                    className={`hover:bg-slate-800/40 cursor-pointer transition ${
                      selectedApp?.id === app.id ? 'bg-slate-800/60' : ''
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div className="font-bold text-white">{app.company_name}</div>
                      <div className="text-[11px] text-cyan-400 font-semibold">{app.role_title}</div>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={mapToStageId(app.status)}
                        onChange={(e) => handleUpdateStatus(app.id, e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        className="text-[11px] font-bold bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200"
                      >
                        {STAGES.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-slate-400">{app.source || 'Direct ATS'}</td>
                    <td className="px-4 py-3 font-bold text-emerald-400">{app.match_score || 80}%</td>
                    <td className="px-4 py-3 text-slate-400">
                      {app.applied_date ? new Date(app.applied_date).toLocaleDateString() : 'Saved'}
                    </td>
                    <td className="px-4 py-3 text-slate-300 truncate max-w-xs">{app.next_action || 'None'}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteApp(app.id); }}
                        className="p-1 text-slate-500 hover:text-rose-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SELECTED APPLICATION CRM DOSSIER & EVIDENCE VAULT */}
      {selectedApp && (
        <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-6 animate-in fade-in">
          {/* Header Bar */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white tracking-tight">{selectedApp.company_name}</h3>
                <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/40">
                  {selectedApp.match_score || 85}% Match
                </span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-slate-900 text-cyan-300 border border-slate-800">
                  {selectedApp.status}
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-300 mt-1">{selectedApp.role_title}</p>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={`/?tab=interview-center&subtab=scenarios&company=${encodeURIComponent(selectedApp.company_name)}&role=${encodeURIComponent(selectedApp.role_title)}`}
                className="px-3.5 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 text-xs font-bold transition flex items-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5 text-amber-300" />
                <span>Open 50 Scenarios</span>
              </a>

              <button
                onClick={() => handleDeleteApp(selectedApp.id)}
                className="p-2 rounded-xl bg-slate-900 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-500/40 text-slate-400 hover:text-rose-300 transition cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* CRM Form Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Metadata & Notes */}
            <div className="space-y-4 text-xs">
              <h4 className="font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-cyan-400" />
                <span>Application Record Metadata</span>
              </h4>

              <div className="space-y-3 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-500 block mb-1">Source ATS</label>
                    <input
                      type="text"
                      readOnly
                      value={selectedApp.source || 'Direct ATS'}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-300"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 block mb-1">Applied Date</label>
                    <input
                      type="text"
                      readOnly
                      value={selectedApp.applied_date ? new Date(selectedApp.applied_date).toLocaleDateString() : 'Not set'}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-300"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-500 block mb-1">Next Action Directive</label>
                  <input
                    type="text"
                    value={editNextAction}
                    onChange={(e) => setEditNextAction(e.target.value)}
                    placeholder="e.g. Follow up with recruiter on LinkedIn"
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="text-slate-500 block mb-1">Recruiter Name & Email</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={recruiterName}
                      onChange={(e) => setRecruiterName(e.target.value)}
                      placeholder="Recruiter Name"
                      className="w-1/2 bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white"
                    />
                    <input
                      type="email"
                      value={recruiterEmail}
                      onChange={(e) => setRecruiterEmail(e.target.value)}
                      placeholder="recruiter@company.com"
                      className="w-1/2 bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-500 block mb-1">CRM Application Notes</label>
                  <textarea
                    rows={3}
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    placeholder="Add interview feedback, referral notes, salary discussion..."
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-white focus:outline-none focus:border-cyan-500 resize-none"
                  />
                </div>

                <button
                  onClick={handleSaveDetails}
                  disabled={savingDetails}
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition"
                >
                  {savingDetails ? 'Saving...' : 'Save Application Notes & Recruiter'}
                </button>
              </div>
            </div>

            {/* Right: Evidence Vault & Timeline */}
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Application Evidence Vault ({evidenceList.length})</span>
                </h4>
                <button
                  onClick={() => setShowAddEvidence(!showAddEvidence)}
                  className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 text-[11px] transition"
                >
                  + Add Real Evidence
                </button>
              </div>

              {/* Form: Add Evidence */}
              {showAddEvidence && (
                <form onSubmit={handleAddEvidence} className="p-3 rounded-xl bg-slate-900 border border-emerald-500/30 space-y-2">
                  <input
                    type="text"
                    required
                    placeholder="Evidence Title (e.g. Assessment Confirmation Email)"
                    value={evidenceTitle}
                    onChange={(e) => setEvidenceTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white"
                  />
                  <select
                    value={evidenceType}
                    onChange={(e) => setEvidenceType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white"
                  >
                    <option value="CONFIRMATION">Application Confirmation</option>
                    <option value="ASSESSMENT">OA / Assessment Details</option>
                    <option value="INTERVIEW_INVITATION">Interview Invitation</option>
                    <option value="RECRUITER_COMMUNICATION">Recruiter Email / Message</option>
                    <option value="OFFER_LETTER">Offer Letter</option>
                    <option value="NOTES">Notes / Reflection</option>
                  </select>
                  <textarea
                    rows={2}
                    placeholder="Evidence content or copy-pasted email snippet..."
                    value={evidenceContent}
                    onChange={(e) => setEvidenceContent(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white resize-none"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddEvidence(false)}
                      className="px-3 py-1 rounded bg-slate-800 text-slate-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1 rounded bg-emerald-500 text-slate-950 font-bold"
                    >
                      Attach Evidence
                    </button>
                  </div>
                </form>
              )}

              {/* Evidence Items List */}
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {evidenceList.length === 0 ? (
                  <p className="text-slate-600 text-center py-4">No evidence attached yet. Attach real emails or test invitations.</p>
                ) : (
                  evidenceList.map((ev) => (
                    <div key={ev.id} className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1">
                      <div className="flex items-center justify-between font-bold text-white">
                        <span>{ev.title}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-950 text-emerald-400 border border-slate-800 uppercase">
                          {ev.evidence_type}
                        </span>
                      </div>
                      {ev.content && <p className="text-[11px] text-slate-400 whitespace-pre-wrap">{ev.content}</p>}
                    </div>
                  ))
                )}
              </div>

              {/* Timeline Events Audit Log */}
              <div className="pt-2 border-t border-slate-800">
                <h4 className="font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <History className="w-4 h-4 text-purple-400" />
                  <span>Timeline Audit Events</span>
                </h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {events.map((evt) => (
                    <div key={evt.id} className="flex items-start gap-2 text-[11px]">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 mt-1 shrink-0"></div>
                      <div>
                        <span className="font-bold text-white">{evt.to_status}</span>
                        <span className="text-slate-500 ml-2">{evt.created_at ? new Date(evt.created_at).toLocaleString() : ''}</span>
                        {evt.notes && <p className="text-slate-400">{evt.notes}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
