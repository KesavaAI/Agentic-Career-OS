import React, { useEffect, useState } from 'react';
import {
  X, Bell, Plus, RefreshCw, CheckCircle2, AlertTriangle, Trash2,
  Clock, MapPin, DollarSign, Sparkles, Filter, ShieldCheck, ExternalLink,
  ChevronRight, Play, Eye, Sliders, Mail, Smartphone, Zap
} from 'lucide-react';
import { api } from '../../lib/api';

interface JobAlertsModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCareer?: string;
}

export const JobAlertsModal: React.FC<JobAlertsModalProps> = ({
  isOpen,
  onClose,
  defaultCareer = "AI Engineer"
}) => {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [scanningId, setScanningId] = useState<number | null>(null);
  const [scanningAll, setScanningAll] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Form State for New / Edit Alert
  const [showForm, setShowForm] = useState<boolean>(false);
  const [editingAlertId, setEditingAlertId] = useState<number | null>(null);
  const [title, setTitle] = useState<string>('');
  const [career, setCareer] = useState<string>(defaultCareer);
  const [expMin, setExpMin] = useState<number>(0);
  const [expMax, setExpMax] = useState<number>(2);
  const [location, setLocation] = useState<string>('India');
  const [isRemote, setIsRemote] = useState<boolean>(true);
  const [minSalary, setMinSalary] = useState<number>(10);
  const [keywords, setKeywords] = useState<string>('RAG, LLM, LangChain');
  const [minMatchScore, setMinMatchScore] = useState<number>(75);
  const [notifyInApp, setNotifyInApp] = useState<boolean>(true);
  const [notifyEmail, setNotifyEmail] = useState<boolean>(false);

  // Notification History State
  const [viewingNotifsAlert, setViewingNotifsAlert] = useState<any | null>(null);
  const [alertNotifs, setAlertNotifs] = useState<any[]>([]);
  const [loadingNotifs, setLoadingNotifs] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      loadAlerts();
    }
  }, [isOpen]);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const data = await api.getJobAlerts();
      setAlerts(data || []);
    } catch (err) {
      console.error('Failed to load job alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateForm = () => {
    setEditingAlertId(null);
    setTitle(`${defaultCareer} (0-2 yrs) - Remote/India`);
    setCareer(defaultCareer);
    setExpMin(0);
    setExpMax(2);
    setLocation('India');
    setIsRemote(true);
    setMinSalary(10);
    setKeywords('RAG, LLM, LangChain');
    setMinMatchScore(75);
    setNotifyInApp(true);
    setNotifyEmail(false);
    setShowForm(true);
    setViewingNotifsAlert(null);
  };

  const handleSaveAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    const kwList = keywords.split(',').map(k => k.trim()).filter(Boolean);

    const payload = {
      title,
      career,
      experience_min: Number(expMin),
      experience_max: Number(expMax),
      location,
      is_remote: isRemote,
      min_salary: Number(minSalary),
      keywords: kwList,
      min_match_score: Number(minMatchScore),
      notify_in_app: notifyInApp,
      notify_email: notifyEmail,
      is_active: true
    };

    try {
      if (editingAlertId) {
        await api.updateJobAlert(editingAlertId, payload);
        setToastMsg(`✓ Updated alert: ${title}`);
      } else {
        await api.createJobAlert(payload);
        setToastMsg(`✓ Created continuous monitor for: ${title}`);
      }
      setShowForm(false);
      await loadAlerts();
      setTimeout(() => setToastMsg(null), 4000);
    } catch (err: any) {
      alert('Failed to save job alert: ' + err.message);
    }
  };

  const handleDeleteAlert = async (id: number) => {
    if (!confirm('Are you sure you want to delete this job alert?')) return;
    try {
      await api.deleteJobAlert(id);
      setAlerts(alerts.filter(a => a.id !== id));
      if (viewingNotifsAlert?.id === id) setViewingNotifsAlert(null);
    } catch (err: any) {
      alert('Failed to delete alert: ' + err.message);
    }
  };

  const handleTriggerScan = async (alertObj: any) => {
    try {
      setScanningId(alertObj.id);
      const res = await api.scanJobAlert(alertObj.id, true);
      setToastMsg(`⚡ Scan Complete: ${res.message || 'Found new opportunities!'}`);
      await loadAlerts();
      setTimeout(() => setToastMsg(null), 5000);
    } catch (err: any) {
      console.error('Scan failed:', err);
    } finally {
      setScanningId(null);
    }
  };

  const handleMonitorAll = async () => {
    try {
      setScanningAll(true);
      const res = await api.monitorAllJobAlerts(true);
      setToastMsg(`⚡ Continuous scan complete across ${res.monitored_alerts_count} active alert preferences!`);
      await loadAlerts();
      setTimeout(() => setToastMsg(null), 5000);
    } catch (err: any) {
      console.error('Monitor all failed:', err);
    } finally {
      setScanningAll(false);
    }
  };

  const handleViewNotifications = async (alertObj: any) => {
    setViewingNotifsAlert(alertObj);
    setShowForm(false);
    try {
      setLoadingNotifs(true);
      const res = await api.getAlertNotifications(alertObj.id);
      setAlertNotifs(res.notifications || []);
    } catch (err) {
      console.error('Failed to load alert notifications:', err);
    } finally {
      setLoadingNotifs(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-slate-900 border border-slate-700/60 rounded-2xl shadow-2xl shadow-cyan-950/40 text-slate-100 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 text-cyan-400">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-wide">Continuous Job Alerts & Sentry Monitoring</h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-800/40 font-semibold">
                  Prompt 5 Engine
                </span>
              </div>
              <p className="text-xs text-slate-400">Save custom search preferences • Periodically polls ATS feeds • 0 duplicate notifications</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleMonitorAll}
              disabled={scanningAll || loading || alerts.length === 0}
              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold transition disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shadow-md shadow-purple-950/50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${scanningAll ? 'animate-spin' : ''}`} />
              <span>{scanningAll ? 'Scanning All...' : '⚡ Scan All Alerts'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* In-Modal Toast Banner */}
        {toastMsg && (
          <div className="px-6 py-2.5 bg-emerald-950/90 border-b border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center justify-between animate-in fade-in">
            <span>{toastMsg}</span>
            <button onClick={() => setToastMsg(null)} className="text-emerald-400 hover:text-white">✕</button>
          </div>
        )}

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Controls Bar */}
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span>Saved Search Preferences ({alerts.length})</span>
            </h3>

            {!showForm && (
              <button
                onClick={handleOpenCreateForm}
                className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-md shadow-emerald-500/20 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Create New Job Alert</span>
              </button>
            )}
          </div>

          {/* Form: Create or Edit Alert */}
          {showForm && (
            <form onSubmit={handleSaveAlert} className="p-5 rounded-2xl bg-slate-950/80 border border-cyan-500/30 space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h4 className="text-sm font-bold text-cyan-300 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>{editingAlertId ? 'Edit Job Alert Preference' : 'New Continuous Job Alert'}</span>
                </h4>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Alert Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. AI Engineer (0-2 yrs) - Remote/India"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Target Career Track</label>
                  <input
                    type="text"
                    required
                    value={career}
                    onChange={(e) => setCareer(e.target.value)}
                    placeholder="e.g. AI Engineer, Data Scientist, Backend Developer"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Experience Range (Years)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      max={20}
                      step={0.5}
                      value={expMin}
                      onChange={(e) => setExpMin(Number(e.target.value))}
                      className="w-1/2 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                      placeholder="Min (0)"
                    />
                    <span className="text-slate-500">to</span>
                    <input
                      type="number"
                      min={0}
                      max={20}
                      step={0.5}
                      value={expMax}
                      onChange={(e) => setExpMax(Number(e.target.value))}
                      className="w-1/2 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                      placeholder="Max (2)"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Min Package Floor (₹ LPA)</label>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={minSalary}
                    onChange={(e) => setMinSalary(Number(e.target.value))}
                    placeholder="e.g. 10.0"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Target Location & Work Mode</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. India, Bengaluru"
                      className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                    />
                    <label className="flex items-center gap-1.5 text-slate-300 font-semibold cursor-pointer bg-slate-900 px-3 py-2 rounded-lg border border-slate-800">
                      <input
                        type="checkbox"
                        checked={isRemote}
                        onChange={(e) => setIsRemote(e.target.checked)}
                        className="rounded text-cyan-500"
                      />
                      <span>Remote</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Key Keywords / Tech Stack</label>
                  <input
                    type="text"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    placeholder="e.g. RAG, LLM, LangChain, Vector DB"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Notification Channels */}
              <div className="flex items-center gap-6 pt-2 border-t border-slate-800/80 text-xs">
                <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifyInApp}
                    onChange={(e) => setNotifyInApp(e.target.checked)}
                    className="rounded text-cyan-500"
                  />
                  <span>In-App Sentry Notifications (Real-time)</span>
                </label>

                <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifyEmail}
                    onChange={(e) => setNotifyEmail(e.target.checked)}
                    className="rounded text-cyan-500"
                  />
                  <span>Email Digest Alert</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-950/60 transition"
                >
                  Save & Activate Alert
                </button>
              </div>
            </form>
          )}

          {/* List of Saved Job Alerts */}
          {loading ? (
            <div className="py-16 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
              <p className="text-xs text-slate-400">Loading continuous monitoring alerts...</p>
            </div>
          ) : alerts.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto">
                <Bell className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-white">No active job alerts configured</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Save your ideal career preferences to automatically scan Greenhouse, Lever, Ashby, and Himalayas ATS feeds.
              </p>
              <button
                onClick={handleOpenCreateForm}
                className="mt-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition"
              >
                + Create First Saved Search Alert
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.map((al) => {
                const isScanning = scanningId === al.id;
                const kwList = Array.isArray(al.keywords) ? al.keywords : [];

                return (
                  <div
                    key={al.id}
                    className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition space-y-3"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white tracking-tight">{al.title}</h4>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            al.is_active
                              ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/30'
                              : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}>
                            {al.is_active ? 'ACTIVE MONITOR' : 'PAUSED'}
                          </span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-800/40">
                            {al.career}
                          </span>
                        </div>

                        {/* Criteria details */}
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                          <span className="flex items-center gap-1 text-slate-300">
                            <Clock className="w-3.5 h-3.5 text-cyan-400" />
                            <span>{al.experience_min}–{al.experience_max} yrs exp</span>
                          </span>
                          <span className="flex items-center gap-1 text-slate-300">
                            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                            <span>₹{al.min_salary}+ LPA</span>
                          </span>
                          <span className="flex items-center gap-1 text-slate-300">
                            <MapPin className="w-3.5 h-3.5 text-pink-400" />
                            <span>{al.location || 'India'} {al.is_remote ? '(Remote)' : ''}</span>
                          </span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleTriggerScan(al)}
                          disabled={isScanning}
                          className="px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 font-semibold text-xs border border-cyan-500/30 flex items-center gap-1.5 transition disabled:opacity-50 cursor-pointer"
                          title="Run immediate monitoring scan"
                        >
                          <Play className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
                          <span>{isScanning ? 'Scanning...' : 'Scan Now'}</span>
                        </button>

                        <button
                          onClick={() => handleViewNotifications(al)}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs border border-slate-700 flex items-center gap-1.5 transition cursor-pointer"
                          title="View notification history"
                        >
                          <Eye className="w-3.5 h-3.5 text-purple-400" />
                          <span>History ({al.total_notifications_sent || 0})</span>
                        </button>

                        <button
                          onClick={() => handleDeleteAlert(al.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition"
                          title="Delete Alert"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Keywords pills & stats */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-[11px]">
                      <div className="flex flex-wrap items-center gap-1">
                        <span className="text-slate-500 mr-1">Keywords:</span>
                        {kwList.map((kw: string) => (
                          <span key={kw} className="px-1.5 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">
                            {kw}
                          </span>
                        ))}
                      </div>

                      <div className="text-slate-400 flex items-center gap-3">
                        <span>Last Scan: {al.last_scanned_at ? new Date(al.last_scanned_at).toLocaleTimeString() : 'Never'}</span>
                        <span>Matched: <strong className="text-cyan-400">{al.last_result_count || 0} jobs</strong></span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Notification History Dossier */}
          {viewingNotifsAlert && (
            <div className="p-5 rounded-2xl bg-slate-950 border border-purple-500/30 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-purple-400" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wide">
                    Notification History for '{viewingNotifsAlert.title}'
                  </h4>
                </div>
                <button
                  onClick={() => setViewingNotifsAlert(null)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  ✕ Close History
                </button>
              </div>

              {loadingNotifs ? (
                <div className="py-8 text-center text-xs text-slate-400">Loading delivered alert notifications...</div>
              ) : alertNotifs.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-500">
                  No notifications recorded yet. Click 'Scan Now' to detect new matching jobs!
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {alertNotifs.map((n) => (
                    <div key={n.notification_id} className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-white">{n.role}</span>
                        <span className="text-slate-400 ml-2">at {n.company_name}</span>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {n.location} • ₹{n.min_salary}L - ₹{n.max_salary}L • Sent {new Date(n.sent_at).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-extrabold text-emerald-400">{n.match_score}% Match</span>
                        <span className="text-[10px] text-slate-500 block uppercase">{n.channel}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-500">
          <span>Continuous Job Sentry • Failure Isolated Connectors</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
