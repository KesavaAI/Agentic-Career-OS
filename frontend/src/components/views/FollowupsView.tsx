import React, { useState, useEffect } from 'react';
import {
  BellRing, CheckCircle2, Calendar, Clock, AlertTriangle,
  Mail, Sparkles, Send, Plus, RefreshCw, X, Check, ArrowRight
} from 'lucide-react';
import { api } from '../../lib/api';
import { FollowUp } from '../../types';

export const FollowupsView: React.FC = () => {
  const [followups, setFollowups] = useState<FollowUp[]>([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  // Outreach Modal State
  const [activeOutreach, setActiveOutreach] = useState<any | null>(null);
  const [sendingOutreach, setSendingOutreach] = useState(false);
  const [outreachSuccess, setOutreachSuccess] = useState<string | null>(null);

  // New Follow-up Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newCompany, setNewCompany] = useState('');
  const [newRole, setNewRole] = useState('Senior Full Stack Engineer');
  const [newNotes, setNewNotes] = useState('Inquire on technical application status');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadFollowups();
  }, [filter]);

  const loadFollowups = async () => {
    try {
      setLoading(true);
      const data = await api.getFollowups(filter === 'all' ? undefined : filter);
      setFollowups(data || []);
    } catch (err) {
      console.error('Failed to load follow-ups:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (id: number) => {
    try {
      await api.completeFollowup(id);
      setFollowups(followups.map(f => f.id === id ? { ...f, is_completed: true, response_status: 'Completed' } : f));
    } catch (err) {
      console.error('Complete failed:', err);
    }
  };

  const handleOpenOutreach = async (fu: FollowUp) => {
    try {
      const res = await api.generateFollowupOutreach(fu.id);
      setActiveOutreach(res);
      setOutreachSuccess(null);
    } catch {
      // Fallback draft
      setActiveOutreach({
        id: fu.id,
        company_name: fu.company_name,
        role_title: fu.role_title,
        subject: `Following up on ${fu.role_title} Application — Alexander`,
        body: `Hi ${fu.company_name} Hiring Team,\n\nI recently submitted my application for the ${fu.role_title} position. Given my recent work optimizing high-throughput distributed architectures, Next.js SSR streaming, and PostgreSQL connection pooling, I am very enthusiastic about contributing to ${fu.company_name}'s core engineering initiatives.\n\nI wanted to briefly check in to see if you needed any additional technical artifacts or architecture documentation from my side. Looking forward to connecting!\n\nBest regards,\nAlexander`,
        target_email: `careers@${fu.company_name.toLowerCase().replace(/\s+/g, '')}.com`
      });
      setOutreachSuccess(null);
    }
  };

  const handleSendOutreach = async () => {
    if (!activeOutreach) return;
    try {
      setSendingOutreach(true);
      await api.sendFollowupOutreach(activeOutreach.id);
      setOutreachSuccess(`✓ High-conversion follow-up pitch sent to ${activeOutreach.company_name}!`);
      setFollowups(followups.map(f => f.id === activeOutreach.id ? { ...f, is_completed: true, response_status: 'Outreach Sent' } : f));
      setTimeout(() => {
        setActiveOutreach(null);
        setOutreachSuccess(null);
      }, 2000);
    } catch (err: any) {
      alert('Send failed: ' + err.message);
    } finally {
      setSendingOutreach(false);
    }
  };

  const handleCreateFollowup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompany.trim()) return;
    try {
      setCreating(true);
      const fuDate = new Date();
      fuDate.setDate(fuDate.getDate() + 3);
      await api.createFollowup({
        company_name: newCompany,
        role_title: newRole,
        applied_date: new Date().toISOString(),
        follow_up_date: fuDate.toISOString(),
        action_notes: newNotes,
        response_status: 'Pending Response'
      });
      setIsCreateModalOpen(false);
      setNewCompany('');
      loadFollowups();
    } catch (err: any) {
      alert('Create follow-up failed: ' + err.message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2">
            <BellRing className="w-5 h-5 text-emerald-400" />
            <span>Follow-up Engine (Today / This Week / Overdue)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Maintain outreach momentum and never let an active application drop cold.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Tabs */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
            {[
              { id: 'all', label: 'All Follow-ups' },
              { id: 'today', label: 'Due Today' },
              { id: 'this_week', label: 'This Week' },
              { id: 'overdue', label: 'Overdue' }
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setFilter(t.id)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                  filter === t.id ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-colors cursor-pointer shadow-lg shadow-cyan-600/20"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Follow-up</span>
          </button>
        </div>
      </div>

      {/* Follow-up Cards Grid */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-10 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-2">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-400 font-semibold">Synchronizing live application follow-ups...</p>
          </div>
        ) : followups.length === 0 ? (
          <div className="p-10 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-extrabold text-slate-200">No Pending Follow-ups for this view</h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              All applications are either up to date or marked completed. As you apply to jobs, the 24/7 Heartbeat daemon automatically schedules follow-up checkpoints.
            </p>
            <button
              onClick={loadFollowups}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition-colors cursor-pointer mt-2"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Follow-ups</span>
            </button>
          </div>
        ) : (
          followups.map((fu) => (
            <div
              key={fu.id}
              className={`p-5 rounded-2xl border transition-all ${
                fu.is_completed
                  ? 'bg-slate-900/40 border-slate-800/60 opacity-60'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700 shadow-xl'
              }`}
            >
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2.5">
                    <span className="text-base font-extrabold text-slate-100">{fu.company_name}</span>
                    <span className="text-xs font-semibold text-cyan-400 bg-cyan-950/60 px-2.5 py-0.5 rounded-md border border-cyan-500/30">
                      {fu.role_title}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                      fu.is_completed
                        ? 'bg-slate-800 text-slate-400'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {fu.response_status || 'Pending Response'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 font-medium">
                    {fu.action_notes || 'Send polite tailored follow-up to check on interview review status.'}
                  </p>

                  <div className="flex items-center gap-4 text-[11px] text-slate-500 font-mono pt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      Due Date: <strong className="text-slate-300">{new Date(fu.follow_up_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</strong>
                    </span>
                    {fu.applied_date && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        Applied: {new Date(fu.applied_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center">
                  {!fu.is_completed && (
                    <button
                      onClick={() => handleOpenOutreach(fu)}
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-cyan-600/20 transition-all cursor-pointer"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>1-Click Outreach Pitch</span>
                    </button>
                  )}

                  {fu.is_completed ? (
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-500/30">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Completed</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => handleComplete(fu.id)}
                      className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition-colors cursor-pointer"
                    >
                      Mark Completed
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ✉️ 1-CLICK FOLLOW-UP OUTREACH MODAL */}
      {activeOutreach && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl bg-slate-900 border border-cyan-500/30 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
                  <Mail className="w-4 h-4 text-cyan-400" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold text-cyan-400 uppercase tracking-wider block">
                    AI FOLLOW-UP OUTREACH DISPATCHER
                  </span>
                  <h3 className="font-extrabold text-sm text-white">{activeOutreach.company_name} • {activeOutreach.role_title}</h3>
                </div>
              </div>

              <button
                onClick={() => setActiveOutreach(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {outreachSuccess ? (
              <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>{outreachSuccess}</span>
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-500 uppercase text-[10px] font-bold block mb-1">To:</span>
                  <input
                    type="text"
                    value={activeOutreach.target_email}
                    onChange={(e) => setActiveOutreach({ ...activeOutreach, target_email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-slate-200 font-mono text-xs focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <span className="text-slate-500 uppercase text-[10px] font-bold block mb-1">Subject:</span>
                  <input
                    type="text"
                    value={activeOutreach.subject}
                    onChange={(e) => setActiveOutreach({ ...activeOutreach, subject: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-slate-200 font-semibold text-xs focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <span className="text-slate-500 uppercase text-[10px] font-bold block mb-1">Email Body (High-Conversion 3-Sentence Script):</span>
                  <textarea
                    rows={6}
                    value={activeOutreach.body}
                    onChange={(e) => setActiveOutreach({ ...activeOutreach, body: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 font-mono text-[11px] leading-relaxed focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-[10px] text-slate-500 font-mono">
                    Dispatches cold pitch and advances Kanban to Recruiter Contacted.
                  </span>

                  <button
                    disabled={sendingOutreach}
                    onClick={handleSendOutreach}
                    className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-50 text-slate-950 font-extrabold text-xs rounded-xl transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
                  >
                    <Send className={`w-3.5 h-3.5 ${sendingOutreach ? 'animate-bounce' : ''}`} />
                    <span>{sendingOutreach ? 'Dispatching...' : 'Dispatch Follow-up Pitch'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ➕ CREATE CUSTOM FOLLOW-UP MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-cyan-400" />
                <span>Schedule New Follow-up</span>
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateFollowup} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 font-semibold block mb-1">Company Name</label>
                <input
                  type="text"
                  required
                  value={newCompany}
                  onChange={(e) => setNewCompany(e.target.value)}
                  placeholder="e.g. Swiggy, Zepto, Razorpay"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">Role Title</label>
                <input
                  type="text"
                  required
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">Action Notes</label>
                <textarea
                  rows={3}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl text-xs"
                >
                  {creating ? 'Saving...' : 'Save Follow-up'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
