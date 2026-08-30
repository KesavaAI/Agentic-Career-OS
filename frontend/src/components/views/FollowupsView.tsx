import React, { useState, useEffect } from 'react';
import { BellRing, CheckCircle2, Calendar, Clock, AlertTriangle } from 'lucide-react';
import { api } from '../../lib/api';
import { FollowUp } from '../../types';

export const FollowupsView: React.FC = () => {
  const [followups, setFollowups] = useState<FollowUp[]>([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFollowups();
  }, [filter]);

  const loadFollowups = async () => {
    try {
      setLoading(true);
      const data = await api.getFollowups(filter === 'all' ? undefined : filter);
      setFollowups(data);
    } catch (err) {
      console.error('Failed to load follow-ups:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (id: number) => {
    try {
      await api.completeFollowup(id);
      setFollowups(followups.map(f => f.id === id ? { ...f, is_completed: true } : f));
    } catch (err) {
      console.error('Complete failed:', err);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2">
            <BellRing className="w-5 h-5 text-emerald-400" />
            <span>Follow-up Engine (Today / This Week / Overdue)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Maintain outreach momentum and never let an application drop cold.
          </p>
        </div>

        {/* View Tabs */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
          {[
            { id: 'all', label: 'All' },
            { id: 'today', label: 'Due Today' },
            { id: 'this_week', label: 'This Week' },
            { id: 'overdue', label: 'Overdue' }
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setFilter(t.id)}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
                filter === t.id ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Follow-up Cards */}
      <div className="space-y-3">
        {followups.length === 0 ? (
          <div className="p-10 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-extrabold text-slate-200">No Pending Follow-ups</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              You are all caught up! As you apply to jobs, the system will automatically schedule 7-day follow-up checkpoints here.
            </p>
          </div>
        ) : (
          followups.map((fu) => (
            <div
              key={fu.id}
              className={`p-4 rounded-xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-3 ${
                fu.is_completed
                  ? 'bg-slate-900/40 border-slate-800/60 opacity-60'
                  : 'bg-slate-900 border-slate-800 shadow-md'
              }`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-sm text-slate-100">{fu.company_name}</h3>
                  <span className="text-xs text-slate-400">• {fu.role_title}</span>
                </div>
                <p className="text-xs text-slate-300 mt-1 font-medium">{fu.action_notes}</p>
                <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-500 font-mono">
                  <span>Due: {new Date(fu.follow_up_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                  {fu.applied_date && <span>Applied: {new Date(fu.applied_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {fu.is_completed ? (
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Completed</span>
                  </span>
                ) : (
                  <button
                    onClick={() => handleComplete(fu.id)}
                    className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg transition-colors cursor-pointer"
                  >
                    Mark Completed
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
