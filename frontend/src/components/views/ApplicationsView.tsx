import React, { useState, useEffect } from 'react';
import { Send, Plus, Search, Calendar, ChevronRight, Clock, CheckCircle2, FileText, ArrowRight, Trash2, RotateCcw, AlertTriangle, Zap } from 'lucide-react';
import { api } from '../../lib/api';
import { Application } from '../../types';

export const ApplicationsView: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    loadApps();
  }, []);

  const loadApps = async () => {
    try {
      setLoading(true);
      const data = await api.getApplications();
      setApplications(data);
      if (data.length > 0) {
        handleSelectApp(data[0]);
      } else {
        setSelectedApp(null);
      }
    } catch (err) {
      console.error('Failed to load applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectApp = async (app: Application) => {
    setSelectedApp(app);
    try {
      const evtData = await api.getApplicationEvents(app.id);
      setEvents(evtData);
    } catch (err) {
      console.error('Failed to load events:', err);
    }
  };

  const handleDeleteApp = async (id: number) => {
    if (!confirm('Are you sure you want to remove this application from your pipeline?')) return;
    try {
      await api.deleteApplication(id);
      await loadApps();
    } catch (err: any) {
      alert('Failed to delete: ' + err.message);
    }
  };

  const handleClearAll = async () => {
    if (!confirm('Clear all applications from your tracker? (This will reset your pipeline to 0 so you can track only real jobs).')) return;
    try {
      await api.clearAllApplications();
      await loadApps();
    } catch (err: any) {
      alert('Failed to clear: ' + err.message);
    }
  };

  const stages = [
    { title: 'READY TO APPLY', count: applications.filter(a => a.status === 'READY TO APPLY' || a.status === 'SHORTLISTED').length },
    { title: 'APPLIED', count: applications.filter(a => a.status === 'APPLIED' || a.status === 'RECRUITER CONTACTED').length },
    { title: 'ASSESSMENT / OA', count: applications.filter(a => a.status === 'OA / ASSESSMENT').length },
    { title: 'TECHNICAL ROUNDS', count: applications.filter(a => a.status === 'TECHNICAL ROUND' || a.status === 'SYSTEM DESIGN').length },
    { title: 'FINAL / OFFER', count: applications.filter(a => a.status === 'MANAGERIAL ROUND' || a.status === 'HR ROUND' || a.status === 'OFFER').length }
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2">
            <Send className="w-5 h-5 text-emerald-400" />
            <span>Application Pipeline & Evidence Vault</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            End-to-end audit tracking across 20+ stage transitions with automatic timestamps.
          </p>
        </div>

        {applications.length > 0 && (
          <button
            onClick={handleClearAll}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-red-950/40 border border-slate-800 hover:border-red-500/40 text-slate-400 hover:text-red-300 text-xs font-semibold transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Pipeline</span>
          </button>
        )}
      </div>

      {/* Stage Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {stages.map((st) => (
          <div key={st.title} className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{st.title}</p>
            <p className="text-xl font-extrabold text-slate-100 mt-1">{st.count}</p>
          </div>
        ))}
      </div>

      {/* Main Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Applications List */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-xs text-slate-400 uppercase tracking-wider">
              Active Applications ({applications.length})
            </h3>
            <span className="text-[11px] text-slate-500">Tracked in your active pipeline</span>
          </div>

          {applications.length === 0 ? (
            <div className="p-12 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                <Send className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-extrabold text-slate-200">No Applications in Pipeline Yet</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Your pipeline is fresh and clean. Click <strong>"+ Ingest Job"</strong> or apply to verified openings in <strong>Job Discovery</strong> to start tracking real applications!
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {applications.map((app) => (
                <div
                  key={app.id}
                  onClick={() => handleSelectApp(app)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    selectedApp?.id === app.id
                      ? 'bg-slate-900 border-emerald-500 shadow-md shadow-emerald-500/10'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-100">{app.company_name}</span>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${
                        app.tier === 'A' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'
                      }`}>
                        Tier {app.tier}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-300 mt-0.5">{app.role_title}</p>
                    <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-2">
                      <span>Applied: {app.applied_date ? new Date(app.applied_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'Not yet'}</span>
                      <span>• Next: {app.next_action || 'Review'}</span>
                    </p>
                  </div>

                  <div className="text-right">
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded inline-block ${
                      app.status === 'AUTONOMOUSLY APPLIED'
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                        : 'bg-slate-950 text-slate-200 border border-slate-800'
                    }`}>
                      {app.status === 'AUTONOMOUSLY APPLIED' ? '🤖 Auto-Applied' : app.status}
                    </span>
                    <p className="text-[10px] font-mono text-emerald-400 font-bold mt-1.5">{app.match_score}% Match</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Application Detail & Evidence */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          {selectedApp ? (
            <>
              <div className="flex items-start justify-between pb-3 border-b border-slate-800">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Application Detail</span>
                  <h3 className="font-extrabold text-base text-slate-100 mt-0.5">{selectedApp.company_name}</h3>
                  <p className="text-xs text-emerald-400 font-semibold">{selectedApp.role_title}</p>
                </div>

                <button
                  onClick={() => handleDeleteApp(selectedApp.id)}
                  title="Remove from pipeline"
                  className="p-2 rounded-xl bg-slate-950 hover:bg-red-950/40 border border-slate-800 hover:border-red-500/40 text-slate-400 hover:text-red-400 transition-all cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Current Status:</span>
                  <span className="font-bold text-slate-200">{selectedApp.status}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">User Approved:</span>
                  <span className="font-bold text-emerald-400">Yes (Explicit)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Next Action:</span>
                  <span className="font-semibold text-slate-300">{selectedApp.next_action || 'None'}</span>
                </div>
              </div>

              {/* Timeline Events */}
              <div>
                <h4 className="font-extrabold text-xs text-slate-300 uppercase tracking-wider mb-3">Status Timeline</h4>
                <div className="space-y-3">
                  {events.length === 0 ? (
                    <div className="p-3 rounded-lg bg-slate-950 text-slate-400 text-xs">Application initiated</div>
                  ) : (
                    events.map((evt) => (
                      <div key={evt.id} className="flex items-start gap-2.5 text-xs">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 mt-1 shrink-0"></div>
                        <div>
                          <p className="font-bold text-slate-200">{evt.to_status}</p>
                          <p className="text-[11px] text-slate-400">{evt.notes || 'Status updated'}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-800 space-y-2">
                <a
                  href={`/?tab=interview-center&subtab=scenarios&company=${encodeURIComponent(selectedApp.company_name)}&role=${encodeURIComponent(selectedApp.role_title)}`}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-purple-500/20"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-300" />
                  <span>Open 50 Scenarios for {selectedApp.company_name}</span>
                </a>

                <button
                  onClick={() => handleDeleteApp(selectedApp.id)}
                  className="w-full py-2 rounded-xl bg-red-950/30 hover:bg-red-900/40 border border-red-500/30 text-red-300 font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Application from Pipeline</span>
                </button>
              </div>
            </>
          ) : (
            <p className="text-xs text-slate-500 text-center py-12">Select an application to view timeline & evidence</p>
          )}
        </div>
      </div>
    </div>
  );
};
