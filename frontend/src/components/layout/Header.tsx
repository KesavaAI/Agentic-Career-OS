import React, { useState, useEffect } from 'react';
import { Bell, Plus, Search, Sparkles, CheckCircle2, ChevronRight, X, Github, Linkedin, ExternalLink, Clock } from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  onQuickIngest: () => void;
  notifications?: any[];
  onOpenNotifications: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onNavigateTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onQuickIngest,
  notifications = [],
  onOpenNotifications,
  searchQuery,
  setSearchQuery,
  onNavigateTab
}) => {
  const { profile } = useAuth();
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Search Bar */}
      <div className="flex items-center gap-3 w-80 relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Global Search (Jobs, Companies, Skills)..."
          className="w-full bg-slate-950/80 border border-slate-800 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
        />
      </div>

      {/* Center Live Status & Dynamic Links */}
      <div className="hidden md:flex items-center gap-2.5 text-xs font-semibold">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[11px] text-slate-400 font-medium">
            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
          <span className="text-slate-600">•</span>
          <span className="text-[11px] text-emerald-400 font-bold">Daily Job Feed Live</span>
        </div>

        {profile?.social_links?.github && (
          <a
            href={profile.social_links.github}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:text-emerald-400 transition-colors text-[11px]"
          >
            <Github className="w-3.5 h-3.5 text-emerald-400" />
            <span>GitHub</span>
          </a>
        )}
        {profile?.social_links?.linkedin && (
          <a
            href={profile.social_links.linkedin}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:text-blue-400 transition-colors text-[11px]"
          >
            <Linkedin className="w-3.5 h-3.5 text-blue-400" />
            <span>LinkedIn</span>
          </a>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Quick Ingest Button */}
        <button
          onClick={onQuickIngest}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg font-bold text-xs shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Ingest Job</span>
        </button>

        {/* Sync Gmail Button */}
        <button
          onClick={async () => {
            try {
              const res = await api.syncEmailInbox({ email: profile?.email || '' });
              alert(res.message || (res.synced ? 'Gmail Inbox Synced!' : 'Please configure App Password in Settings.'));
            } catch (e: any) {
              alert('Sync failed: ' + e.message);
            }
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/30 text-cyan-300 rounded-lg text-xs font-semibold transition-all cursor-pointer"
          title="Scan your inbox for recruiter responses and interview invites"
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Sync Inbox</span>
        </button>

        {/* AI Agent Quick Run */}
        <button
          onClick={() => onNavigateTab('career-agent')}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition-all cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>AI Workflow</span>
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center justify-center text-slate-300 relative transition-all cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifMenu && (
            <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 p-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-bold text-slate-200">Alerts & Notifications</span>
                <button onClick={() => setShowNotifMenu(false)} className="text-slate-400 hover:text-slate-200">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="mt-2 space-y-2 max-h-64 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-xs text-slate-500 py-3 text-center">No new notifications</p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        if (n.link) {
                          const tab = n.link.replace('/', '');
                          if (tab) onNavigateTab(tab);
                        }
                        setShowNotifMenu(false);
                      }}
                      className="p-2 rounded-lg bg-slate-950/60 hover:bg-slate-800 border border-slate-800/80 cursor-pointer transition-colors text-xs"
                    >
                      <div className="flex items-center justify-between font-semibold text-slate-200">
                        <span>{n.title}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
                          n.urgency === 'Urgent' ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'
                        }`}>
                          {n.urgency}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Account / Persona Switcher */}
        <UserHeaderProfile onNavigateTab={onNavigateTab} />
      </div>
    </header>
  );
};

const UserHeaderProfile: React.FC<{ onNavigateTab: (tab: string) => void }> = ({ onNavigateTab }) => {
  const { user, openAuthModal, refreshUser, refreshProfile, logout, setSession } = useAuth();
  const [openDropdown, setOpenDropdown] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyCode, setVerifyCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verifyStatus, setVerifyStatus] = useState<string | null>(null);
  const [verifySuccessMsg, setVerifySuccessMsg] = useState<string | null>(null);
  const [timer, setTimer] = useState(120);

  useEffect(() => {
    let interval: any = null;
    if (showVerifyModal && timer > 0) {
      interval = setInterval(() => setTimer(prev => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [showVerifyModal, timer]);

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleOpenVerifyModal = () => {
    setVerifyCode('');
    setVerifyStatus(null);
    setVerifySuccessMsg(null);
    setTimer(120);
    setShowVerifyModal(true);
  };

  const initial = user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U';

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyCode || verifyCode.length < 6) {
      setVerifyStatus('Please enter the complete 6-digit OTP code.');
      return;
    }
    setVerifying(true);
    setVerifyStatus(null);
    try {
      const res = await api.verifyEmail({ email: user?.email || '', code: verifyCode.trim() });
      if (res.access_token && res.user) {
        setSession(res.access_token, res.user);
      }
      setVerifySuccessMsg(res.message || '✅ Email verified successfully! Workspace fully activated.');
      await refreshUser();
      await refreshProfile();
      setTimeout(() => {
        setShowVerifyModal(false);
      }, 1000);
    } catch (err: any) {
      setVerifyStatus(err.message || 'Invalid verification code');
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    setVerifyStatus(null);
    setVerifySuccessMsg(null);
    try {
      const res = await api.resendVerification({ email: user?.email || '' });
      setVerifySuccessMsg(res.message || '✨ A fresh 6-digit OTP has been sent to your email.');
      setTimer(120);
    } catch (err: any) {
      setVerifyStatus(err.message || 'Failed to resend OTP.');
    }
  };

  return (
    <div className="flex items-center gap-2">
      {user && user.is_verified === false && (
        <button
          onClick={handleOpenVerifyModal}
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-[11px] font-bold transition-all cursor-pointer animate-pulse"
        >
          <span>⚠️ Verify Email</span>
        </button>
      )}

      <div className="relative">
        <button
          onClick={() => setOpenDropdown(!openDropdown)}
          className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 transition-all cursor-pointer group"
        >
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 font-black text-xs flex items-center justify-center shadow">
            {initial}
          </div>
          <div className="text-left hidden sm:block">
            <div className="text-[11px] font-bold text-slate-200 group-hover:text-emerald-400 transition-colors leading-none">
              {user?.full_name?.split(' ')[0] || 'Candidate'}
            </div>
            <div className="text-[9px] text-emerald-400 font-semibold font-mono leading-none mt-0.5">
              Dream: ₹{user?.target_min_ctc_lpa || '18'}+ LPA
            </div>
          </div>
        </button>

        {openDropdown && (
          <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 p-3.5 space-y-3">
            <div className="pb-2.5 border-b border-slate-800">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-xs text-slate-100">{user?.full_name || 'Candidate'}</h4>
                {user?.is_verified ? (
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-bold">Verified</span>
                ) : (
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold">Unverified</span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">{user?.email || 'email@example.com'}</p>
              <div className="mt-1.5 flex items-center gap-1.5">
                <span className="text-[10px] px-2 py-0.2 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold">
                  {user?.target_role || 'Tech Role'}
                </span>
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <button
                onClick={() => {
                  onNavigateTab('profile');
                  setOpenDropdown(false);
                }}
                className="w-full text-left px-3 py-2 rounded-xl bg-slate-950/70 hover:bg-slate-800 text-slate-200 font-semibold flex items-center justify-between cursor-pointer"
              >
                <span>👤 Edit Candidate Profile</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => {
                  openAuthModal();
                  setOpenDropdown(false);
                }}
                className="w-full text-left px-3 py-2 rounded-xl bg-purple-950/40 hover:bg-purple-900/50 border border-purple-500/30 text-purple-300 font-semibold flex items-center justify-between cursor-pointer"
              >
                <span>⚡ Switch User / Sign In</span>
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              </button>

              <button
                onClick={() => {
                  logout();
                  setOpenDropdown(false);
                }}
                className="w-full text-left px-3 py-2 rounded-xl bg-red-950/30 hover:bg-red-900/40 border border-red-500/30 text-red-300 font-semibold flex items-center justify-between cursor-pointer"
              >
                <span>🚪 Sign Out</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* VERIFY EMAIL MODAL */}
      {showVerifyModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl relative text-left">
            <button
              onClick={() => setShowVerifyModal(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white"
            >
              ✕
            </button>

            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase mb-2">
                <Sparkles className="w-3 h-3" />
                <span>Account Activation</span>
              </div>
              <h3 className="text-lg font-extrabold text-slate-100">Verify Your Email</h3>
              <p className="text-xs text-slate-400 mt-1">
                Enter the 6-digit security code dispatched to <strong className="text-slate-200">{user?.email}</strong>.
              </p>

              {/* ⏱️ 2-MINUTE OTP COUNTDOWN TIMER */}
              <div className="flex items-center justify-between px-3 py-2 mt-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
                <span className="text-slate-400 flex items-center gap-1.5 text-[11px] font-medium">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  Code expires in:
                </span>
                <span className={`font-mono font-bold text-xs px-2.5 py-0.5 rounded-lg border ${
                  timer > 30 
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                    : timer > 0 
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 animate-pulse' 
                      : 'bg-red-500/10 border-red-500/30 text-red-400'
                }`}>
                  {formatTimer(timer)}
                </span>
              </div>
            </div>

            <form onSubmit={handleVerifySubmit} className="space-y-3">
              <input
                type="text"
                required
                maxLength={6}
                value={verifyCode}
                onChange={e => setVerifyCode(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                className="w-full text-center tracking-widest font-mono text-2xl py-3 bg-slate-950 border border-slate-800 rounded-2xl text-emerald-400 font-bold focus:outline-none focus:border-emerald-500"
              />

              {verifySuccessMsg && (
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
                  {verifySuccessMsg}
                </div>
              )}

              {verifyStatus && (
                <p className="text-xs text-red-400 font-medium">{verifyStatus}</p>
              )}

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  disabled={verifying || verifyCode.length < 6}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 disabled:opacity-50 cursor-pointer"
                >
                  {verifying ? 'Verifying...' : 'Confirm & Activate'}
                </button>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={verifying || timer > 0}
                  className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Resend Code
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
