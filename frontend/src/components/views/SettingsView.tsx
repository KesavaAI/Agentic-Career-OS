import React, { useState } from 'react';
import { Settings, Download, Trash2, Database, ShieldCheck, RefreshCw, Key, Check, Lock, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { api, checkPasswordStrength, isValidPasswordStrict } from '../../lib/api';

export const SettingsView: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('gpt-4o');
  const [saved, setSaved] = useState(false);
  const [seedMsg, setSeedMsg] = useState<string | null>(null);

  // Change Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmNewPass, setConfirmNewPass] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmNewPass, setShowConfirmNewPass] = useState(false);
  const [passLoading, setPassLoading] = useState(false);
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const passValidation = isValidPasswordStrict(newPass);
    if (!passValidation.valid) {
      setPassError(passValidation.error || 'New password does not meet complexity requirements.');
      return;
    }
    if (newPass !== confirmNewPass) {
      setPassError('New passwords do not match.');
      return;
    }
    setPassLoading(true);
    setPassError('');
    setPassSuccess('');
    try {
      const res = await api.changePassword({
        current_password: currentPassword,
        new_password: newPass
      });
      setPassSuccess(res.message || 'Password updated successfully!');
      setCurrentPassword('');
      setNewPass('');
      setConfirmNewPass('');
      setTimeout(() => setPassSuccess(''), 4000);
    } catch (err: any) {
      setPassError(err.message || 'Failed to update password. Check your current password.');
    } finally {
      setPassLoading(false);
    }
  };

  const handleSeed = async () => {
    try {
      const res = await api.triggerSeedData();
      setSeedMsg(res.message);
    } catch (err) {
      console.error('Seed failed:', err);
    }
  };

  const handleClear = async () => {
    if (confirm('Are you sure you want to clear all demo data?')) {
      try {
        const res = await api.clearDemoData();
        setSeedMsg(res.message);
      } catch (err) {
        console.error('Clear failed:', err);
      }
    }
  };

  const handleBackupExport = () => {
    window.open('/api/v1/backup-export/export-json', '_blank');
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h2 className="text-xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2">
          <Settings className="w-5 h-5 text-emerald-400" />
          <span>System Settings, Backup & Demo Data Management</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Configure API credentials, backup full career state, and manage demo datasets.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* AI & Model Settings */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <Key className="w-4 h-4 text-emerald-400" />
            <h3 className="font-extrabold text-sm text-slate-100">LLM Provider Configuration</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">OpenAI / Azure API Key</label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-proj-..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                Optional: Platform includes an intelligent deterministic fallback analyzer that works 100% offline.
              </p>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Model Selection</label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="gpt-4o">GPT-4o (High Reasoning)</option>
                <option value="gpt-4o-mini">GPT-4o-mini (Fast)</option>
                <option value="azure-gpt-4o">Azure OpenAI Service</option>
              </select>
            </div>

            <button
              onClick={() => {
                setSaved(true);
                setTimeout(() => setSaved(false), 2000);
              }}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg transition-colors cursor-pointer"
            >
              {saved ? 'Settings Saved ✓' : 'Save Configuration'}
            </button>
          </div>
        </div>

        {/* Security & Password Management */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <Lock className="w-4 h-4 text-emerald-400" />
            <h3 className="font-extrabold text-sm text-slate-100">Security & Password Management</h3>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-3 text-xs">
            {passError && (
              <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{passError}</span>
              </div>
            )}
            {passSuccess && (
              <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{passSuccess}</span>
              </div>
            )}

            <div>
              <label className="text-slate-400 block mb-1 font-semibold">Current Password</label>
              <div className="relative">
                <input
                  type={showCurrentPass ? 'text' : 'password'}
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-3 pr-10 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPass(!showCurrentPass)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200 cursor-pointer"
                  tabIndex={-1}
                >
                  {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1 font-semibold">New Password</label>
                <div className="relative">
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    required
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    placeholder="Min 8 characters"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-3 pr-10 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200 cursor-pointer"
                    tabIndex={-1}
                  >
                    {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showConfirmNewPass ? 'text' : 'password'}
                    required
                    value={confirmNewPass}
                    onChange={(e) => setConfirmNewPass(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-3 pr-10 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmNewPass(!showConfirmNewPass)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200 cursor-pointer"
                    tabIndex={-1}
                  >
                    {showConfirmNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* 🛡️ PASSWORD STRENGTH METER & CHECKLIST */}
            {newPass && (() => {
              const strength = checkPasswordStrength(newPass);
              return (
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 font-semibold">Security Strength:</span>
                    <span className={`font-bold font-mono ${strength.textColor}`}>{strength.label}</span>
                  </div>

                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${strength.color}`}
                      style={{ width: `${Math.min(100, (strength.score / 4) * 100)}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 pt-0.5 text-[10px]">
                    <div className={`flex items-center gap-1 ${strength.hasMinLength ? 'text-emerald-400 font-semibold' : 'text-slate-500'}`}>
                      <span>{strength.hasMinLength ? '✓' : '○'}</span>
                      <span>8+ characters</span>
                    </div>
                    <div className={`flex items-center gap-1 ${strength.hasLower && strength.hasUpper ? 'text-emerald-400 font-semibold' : 'text-slate-500'}`}>
                      <span>{strength.hasLower && strength.hasUpper ? '✓' : '○'}</span>
                      <span>Upper & Lowercase</span>
                    </div>
                    <div className={`flex items-center gap-1 ${strength.hasNumber ? 'text-emerald-400 font-semibold' : 'text-slate-500'}`}>
                      <span>{strength.hasNumber ? '✓' : '○'}</span>
                      <span>At least 1 number (0-9)</span>
                    </div>
                    <div className={`flex items-center gap-1 ${strength.hasSpecial ? 'text-emerald-400 font-semibold' : 'text-slate-500'}`}>
                      <span>{strength.hasSpecial ? '✓' : '○'}</span>
                      <span>Special symbol (!@#$)</span>
                    </div>
                  </div>
                </div>
              );
            })()}

            <button
              type="submit"
              disabled={passLoading}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-colors cursor-pointer disabled:opacity-50 mt-1"
            >
              {passLoading ? 'Updating Password...' : 'Update Password'}
            </button>
          </form>
        </div>

        {/* Backup & Demo Data */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <Database className="w-4 h-4 text-emerald-400" />
            <h3 className="font-extrabold text-sm text-slate-100">Backup & Career State</h3>
          </div>

          <div className="space-y-3 text-xs">
            <p className="text-slate-400 text-[11px]">
              Export full career data (Jobs, Applications, Resumes, Interview Packs, Offers, and Learning Schedules) as JSON for backup.
            </p>

            <button
              onClick={handleBackupExport}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold rounded-xl transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>EXPORT FULL CAREER BACKUP (JSON)</span>
            </button>

            <div className="pt-3 border-t border-slate-800 flex items-center gap-3">
              <button
                onClick={handleSeed}
                className="flex-1 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 font-bold rounded-lg transition-colors cursor-pointer"
              >
                Restore Demo Data
              </button>
              <button
                onClick={handleClear}
                className="flex-1 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 font-bold rounded-lg transition-colors cursor-pointer"
              >
                CLEAR DEMO DATA
              </button>
            </div>

            {seedMsg && (
              <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold">
                {seedMsg}
              </div>
            )}
          </div>
        </div>

        {/* Live Gmail & Inbox Sync */}
        <div className="md:col-span-2 p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-cyan-400" />
              <h3 className="font-extrabold text-sm text-slate-100">Live Gmail Integration & Recruiter Email Sync</h3>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              IMAP & SMTP SSL (imap.gmail.com:993)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-3">
              <div>
                <label className="text-slate-400 block mb-1">Your Gmail Address</label>
                <input
                  type="email"
                  defaultValue="kesavac913@gmail.com"
                  readOnly
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 font-mono opacity-80"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">
                  16-Character Google App Password
                  <span className="text-[10px] text-cyan-400 ml-2">
                    (Generate at <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noreferrer" className="underline">myaccount.google.com/apppasswords</a>)
                  </span>
                </label>
                <input
                  type="password"
                  id="gmailAppPassword"
                  placeholder="abcd efgh ijkl mnop"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Enables real-time inbox scanning to detect interview invites, assessments, confirmations, and send direct outreach.
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={async () => {
                    const input = document.getElementById('gmailAppPassword') as HTMLInputElement;
                    const pwd = input?.value || '';
                    try {
                      const res = await api.testEmailConnection({ email: 'kesavac913@gmail.com', app_password: pwd });
                      alert(res.message || (res.success ? 'Connection Successful!' : 'Connection Failed'));
                    } catch (e: any) {
                      alert('Test failed: ' + e.message);
                    }
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Test Connection
                </button>
                <button
                  onClick={async () => {
                    const input = document.getElementById('gmailAppPassword') as HTMLInputElement;
                    const pwd = input?.value || '';
                    try {
                      const res = await api.syncEmailInbox({ email: 'kesavac913@gmail.com', app_password: pwd });
                      alert(res.message || 'Inbox Synced Successfully!');
                    } catch (e: any) {
                      alert('Sync failed: ' + e.message);
                    }
                  }}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Sync Inbox Now</span>
                </button>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
              <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-300">How Live Email Sync Works</h4>
              <ul className="text-[11px] text-slate-400 space-y-1.5 list-disc pl-4">
                <li><strong className="text-slate-200">Interview Invites:</strong> Automatically detects Zoom/Meet/Teams invites and creates interview prep cards.</li>
                <li><strong className="text-slate-200">Assessment Links:</strong> Detects HackerRank/Codility links and marks your application as <span className="text-amber-400">OA / ASSESSMENT</span>.</li>
                <li><strong className="text-slate-200">Recruiter Responses:</strong> Detects replies from hiring managers and logs recruiter contact in CRM.</li>
                <li><strong className="text-slate-200">Offer Letters:</strong> Parses formal offers and unlocks compensation negotiation tools.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
