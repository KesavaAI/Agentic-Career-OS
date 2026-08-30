import React, { useState, useEffect } from 'react';
import {
  User, Lock, Mail, Sparkles, ArrowRight, CheckCircle2,
  AlertCircle, Briefcase, GraduationCap, Building2, Zap, Shield, KeyRound, RotateCcw, Phone, Eye, EyeOff, Clock, RefreshCw, Bot
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api, isValidEmailStrict, checkEmailTypo, checkPasswordStrength, isValidPasswordStrict } from '../../lib/api';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, refreshUser, refreshProfile, setSession } = useAuth();
  const [tab, setTab] = useState<'login' | 'register' | 'otp_verify' | 'forgot_pass' | 'reset_pass'>('register');

  // Form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');

  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('+91 ');
  const [regPass, setRegPass] = useState('');
  const [regConfirmPass, setRegConfirmPass] = useState('');
  const [showRegPass, setShowRegPass] = useState(false);
  const [showRegConfirmPass, setShowRegConfirmPass] = useState(false);
  const [showLoginPass, setShowLoginPass] = useState(false);
  const [regRole, setRegRole] = useState('GenAI / Agentic AI Engineer');
  const [regPool, setRegPool] = useState('SERVICE_SWITCHER');
  const [regTargetCtc, setRegTargetCtc] = useState('18.0');
  const [regCurrentCtc, setRegCurrentCtc] = useState('3.5');
  const [regExp, setRegExp] = useState('1.6');

  // OTP Verification state
  const [pendingEmail, setPendingEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSuccessMsg, setOtpSuccessMsg] = useState('');

  // 2-Minute (120s) OTP Countdown Timer State
  const [otpTimer, setOtpTimer] = useState(120);
  const [isTimerActive, setIsTimerActive] = useState(false);

  // Forgot & Reset Password States
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmNewPass, setShowConfirmNewPass] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Timer Tick Effect
  useEffect(() => {
    let interval: any = null;
    if (isTimerActive && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer(prev => prev - 1);
      }, 1000);
    } else if (otpTimer === 0) {
      setIsTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, otpTimer]);

  const startOtpTimer = () => {
    setOtpTimer(120);
    setIsTimerActive(true);
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (isAuthModalOpen) {
      setErrorMsg('');
      setOtpSuccessMsg('');
    }
  }, [isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailValidation = isValidEmailStrict(loginEmail);
    if (!emailValidation.valid) {
      setErrorMsg(emailValidation.error || 'Please enter a valid email address.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await api.login({ email: loginEmail.trim().toLowerCase(), password: loginPass });
      if (res.access_token) {
        if (res.user && res.user.is_verified === false) {
          localStorage.setItem('acos_token', res.access_token);
          setPendingEmail(loginEmail.trim().toLowerCase());
          startOtpTimer();
          setTab('otp_verify');
          return;
        }
        if (res.user) {
          setSession(res.access_token, res.user);
        }
        await refreshUser();
        await refreshProfile();
        closeAuthModal();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailValidation = isValidEmailStrict(regEmail);
    if (!emailValidation.valid) {
      setErrorMsg(emailValidation.error || 'Please enter a valid email address.');
      return;
    }
    const passValidation = isValidPasswordStrict(regPass);
    if (!passValidation.valid) {
      setErrorMsg(passValidation.error || 'Password does not meet complexity requirements.');
      return;
    }
    if (regPass !== regConfirmPass) {
      setErrorMsg('Passwords do not match. Please verify.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await api.register({
        email: regEmail.trim().toLowerCase(),
        password: regPass,
        full_name: regName,
        phone: regPhone,
        target_role: regRole,
        target_min_ctc_lpa: parseFloat(regTargetCtc) || 15.0,
        current_ctc_lpa: parseFloat(regCurrentCtc) || 0.0,
        experience_years: parseFloat(regExp) || 0.0,
        candidate_pool: regPool
      });

      if (res.access_token) {
        localStorage.setItem('acos_token', res.access_token);
      }
      setPendingEmail(regEmail.trim().toLowerCase());
      setOtpCode('');
      setErrorMsg('');
      setOtpSuccessMsg(`✨ 6-digit OTP code dispatched to ${regEmail.trim().toLowerCase()}`);
      startOtpTimer();
      setTab('otp_verify');
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.length < 6) {
      setErrorMsg('Please enter the complete 6-digit OTP code.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await api.verifyEmail({ email: pendingEmail, code: otpCode.trim() });
      setOtpSuccessMsg(res.message || 'Account verified successfully!');
      if (res.access_token && res.user) {
        setSession(res.access_token, res.user);
      }
      await refreshUser();
      await refreshProfile();
      closeAuthModal();
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid OTP code. Please check and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestOtpForLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailValidation = isValidEmailStrict(loginEmail);
    if (!emailValidation.valid) {
      setErrorMsg(emailValidation.error || 'Please enter a valid email address.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await api.requestOtp({ email: loginEmail.trim().toLowerCase() });
      setPendingEmail(loginEmail.trim().toLowerCase());
      startOtpTimer();
      setTab('otp_verify');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to request OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!pendingEmail) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await api.resendVerification({ email: pendingEmail });
      setOtpSuccessMsg('New 6-digit OTP dispatched to ' + pendingEmail);
      startOtpTimer();
      setTimeout(() => setOtpSuccessMsg(''), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const emailValidation = isValidEmailStrict(resetEmail);
    if (!emailValidation.valid) {
      setErrorMsg(emailValidation.error || 'Please enter a valid email address.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await api.forgotPassword({ email: resetEmail.trim().toLowerCase() });
      setOtpSuccessMsg(res.message || 'Password reset code sent to your email.');
      setPendingEmail(resetEmail.trim().toLowerCase());
      startOtpTimer();
      setTab('reset_pass');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to send password reset code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const passValidation = isValidPasswordStrict(newPassword);
    if (!passValidation.valid) {
      setErrorMsg(passValidation.error || 'New password does not meet complexity requirements.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setErrorMsg('New passwords do not match. Please verify.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await api.resetPassword({
        email: resetEmail.trim().toLowerCase(),
        code: resetCode.trim(),
        new_password: newPassword
      });
      if (res.access_token && res.user) {
        setSession(res.access_token, res.user);
      }
      closeAuthModal();
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid reset code or failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-xl w-full space-y-6 shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          ✕
        </button>

        {/* Header */}
        <div className="text-center space-y-1.5 pt-1">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-purple-600 p-0.5 shadow-lg shadow-blue-500/25 mx-auto flex items-center justify-center">
            <div className="w-full h-full bg-[#06080F] rounded-[14px] flex items-center justify-center">
              <Bot className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[10px] font-extrabold uppercase tracking-wider">
            <Sparkles className="w-3 h-3" />
            <span>Universal Career Platform</span>
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-100 tracking-tight">
            {tab === 'reset_pass'
              ? 'Reset Your Password'
              : tab === 'forgot_pass'
                ? 'Forgot Password'
                : tab === 'otp_verify'
                  ? 'Verify Your Email with OTP'
                  : 'Welcome to Agentic Career OS'}
          </h2>
          <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
            {tab === 'reset_pass'
              ? `Enter the 6-digit code sent to ${resetEmail}`
              : tab === 'forgot_pass'
                ? 'Enter your registered email to receive a password reset code'
                : tab === 'otp_verify'
                  ? `Enter the 6-digit security code sent to ${pendingEmail}`
                  : 'Sign in or create your individual candidate account to access your workspace.'}
          </p>
        </div>

        {/* Tab Switcher (Clean 2-Tab: Only for Register & Login) */}
        {(tab === 'register' || tab === 'login') && (
          <div className="flex items-center rounded-xl bg-slate-950 p-1 border border-slate-800 text-xs">
            <button
              onClick={() => { setTab('register'); setErrorMsg(''); }}
              className={`flex-1 py-2 rounded-lg font-bold transition-all cursor-pointer ${
                tab === 'register' ? 'bg-slate-800 text-emerald-400 shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Create Account
            </button>
            <button
              onClick={() => { setTab('login'); setErrorMsg(''); }}
              className={`flex-1 py-2 rounded-lg font-bold transition-all cursor-pointer ${
                tab === 'login' ? 'bg-slate-800 text-emerald-400 shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
          </div>
        )}

        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
            {errorMsg.toLowerCase().includes('already registered') && (
              <button
                type="button"
                onClick={() => {
                  setLoginEmail(regEmail);
                  setTab('login');
                  setErrorMsg('');
                }}
                className="px-2.5 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 font-bold text-[11px] underline cursor-pointer shrink-0"
              >
                Sign In Now ➔
              </button>
            )}
          </div>
        )}

        {otpSuccessMsg && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{otpSuccessMsg}</span>
          </div>
        )}

        {/* SIGN IN FORM */}
        {tab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">
                Email Address <span className="text-red-400 font-bold ml-0.5">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>
              {(() => {
                const typo = checkEmailTypo(loginEmail);
                if (typo.hasTypo) {
                  return (
                    <div className="mt-1 flex items-center justify-between p-1.5 px-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-300 animate-pulse">
                      <span>Did you mean <strong className="text-amber-200 font-mono font-bold">@{typo.suggestion}</strong>?</span>
                      <button
                        type="button"
                        onClick={() => setLoginEmail(typo.correctedEmail)}
                        className="px-2 py-0.5 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[10px] cursor-pointer"
                      >
                        Fix Email ➔
                      </button>
                    </div>
                  );
                }
                return null;
              })()}
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-semibold">
                Password <span className="text-red-400 font-bold ml-0.5">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type={showLoginPass ? 'text' : 'password'}
                  required
                  value={loginPass}
                  onChange={e => setLoginPass(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-10 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPass(!showLoginPass)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                  tabIndex={-1}
                  title={showLoginPass ? "Hide password" : "Show password"}
                >
                  {showLoginPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={() => {
                  setResetEmail(loginEmail);
                  setTab('forgot_pass');
                  setErrorMsg('');
                  setOtpSuccessMsg('');
                }}
                className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold transition-colors cursor-pointer"
              >
                Forgot password?
              </button>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Signing in...' : 'Sign In to Your Workspace'}
              </button>

              <button
                type="button"
                onClick={handleRequestOtpForLogin}
                disabled={loading || !loginEmail}
                className="px-4 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 font-bold text-xs transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                title="Send 6-digit OTP to sign in without password"
              >
                <KeyRound className="w-3.5 h-3.5 text-purple-400" />
                <span>OTP Sign In</span>
              </button>
            </div>
          </form>
        )}

        {/* CREATE ACCOUNT FORM */}
        {tab === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3 text-xs max-h-[60vh] overflow-y-auto pr-1">
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">
                  Full Name <span className="text-red-400 font-bold ml-0.5">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={e => setRegName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">
                  Email <span className="text-red-400 font-bold ml-0.5">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={e => setRegEmail(e.target.value)}
                  placeholder="email@domain.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                />
                {(() => {
                  const typo = checkEmailTypo(regEmail);
                  if (typo.hasTypo) {
                    return (
                      <div className="mt-1 flex items-center justify-between p-1.5 px-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-[10px] text-amber-300 animate-pulse">
                        <span>Did you mean <strong className="text-amber-200 font-mono font-bold">@{typo.suggestion}</strong>?</span>
                        <button
                          type="button"
                          onClick={() => setRegEmail(typo.correctedEmail)}
                          className="px-1.5 py-0.5 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[9px] cursor-pointer"
                        >
                          Fix ➔
                        </button>
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">
                  Phone Number <span className="text-red-400 font-bold ml-0.5">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={regPhone}
                  onChange={e => setRegPhone(e.target.value)}
                  placeholder="+91 9876543210"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">
                  Target Tech Role <span className="text-red-400 font-bold ml-0.5">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={regRole}
                  onChange={e => setRegRole(e.target.value)}
                  placeholder="e.g. GenAI Engineer"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">
                  Password <span className="text-red-400 font-bold ml-0.5">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showRegPass ? 'text' : 'password'}
                    required
                    value={regPass}
                    onChange={e => setRegPass(e.target.value)}
                    placeholder="Choose strong password"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-3 pr-9 py-2 text-slate-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPass(!showRegPass)}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                    tabIndex={-1}
                    title={showRegPass ? "Hide password" : "Show password"}
                  >
                    {showRegPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">
                  Confirm Password <span className="text-red-400 font-bold ml-0.5">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showRegConfirmPass ? 'text' : 'password'}
                    required
                    value={regConfirmPass}
                    onChange={e => setRegConfirmPass(e.target.value)}
                    placeholder="Re-enter password"
                    className={`w-full bg-slate-950 border rounded-xl pl-3 pr-9 py-2 text-slate-200 ${
                      regConfirmPass && regConfirmPass !== regPass ? 'border-red-500' : 'border-slate-800'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegConfirmPass(!showRegConfirmPass)}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                    tabIndex={-1}
                    title={showRegConfirmPass ? "Hide password" : "Show password"}
                  >
                    {showRegConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* 🛡️ PASSWORD STRENGTH METER & CHECKLIST */}
            {regPass && (() => {
              const strength = checkPasswordStrength(regPass);
              return (
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
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

                  <div className="grid grid-cols-2 gap-1 pt-0.5 text-[10px]">
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

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">
                  Exp (Yrs) <span className="text-red-400 font-bold ml-0.5">*</span>
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={regExp}
                  onChange={e => setRegExp(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-slate-200"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Current (LPA)</label>
                <input
                  type="number"
                  step="0.5"
                  value={regCurrentCtc}
                  onChange={e => setRegCurrentCtc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-slate-200"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">
                  Dream Package (₹ LPA) <span className="text-red-400 font-bold ml-0.5">*</span>
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={regTargetCtc}
                  onChange={e => setRegTargetCtc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-slate-200 font-bold text-emerald-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-500/20 transition-all cursor-pointer disabled:opacity-50 mt-3"
            >
              {loading ? 'Creating Account & Profile...' : 'Create Account & Verify OTP ➔'}
            </button>
          </form>
        )}

        {/* OTP VERIFICATION STEP */}
        {tab === 'otp_verify' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center mx-auto">
                <KeyRound className="w-5 h-5" />
              </div>
              <p className="text-slate-300 font-semibold">
                Please enter the 6-digit OTP code sent to:
              </p>
              <p className="font-mono text-emerald-400 font-bold text-sm">{pendingEmail}</p>

              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-emerald-500/20 text-[11px] text-slate-300">
                📩 A 6-digit verification code has been dispatched to your email.
              </div>

              {/* ⏳ 2-MINUTE OTP COUNTDOWN TIMER */}
              <div className="flex items-center justify-between px-2 pt-1">
                <span className="text-slate-400 flex items-center gap-1.5 text-[11px] font-medium">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  Code expires in:
                </span>
                <span className={`font-mono font-bold text-xs px-2.5 py-0.5 rounded-lg border ${
                  otpTimer > 30 
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                    : otpTimer > 0 
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 animate-pulse' 
                      : 'bg-red-500/10 border-red-500/30 text-red-400'
                }`}>
                  {formatTimer(otpTimer)}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1.5 font-semibold text-center uppercase tracking-wider text-[10px]">
                6-Digit Verification PIN
              </label>
              <input
                type="text"
                maxLength={6}
                autoFocus
                required
                value={otpCode}
                onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                className="w-full bg-slate-950 border-2 border-emerald-500/60 rounded-2xl py-3 text-center text-2xl font-mono tracking-widest text-emerald-400 font-extrabold focus:outline-none focus:border-emerald-400 shadow-lg shadow-emerald-500/10"
              />
            </div>

            <button
              type="submit"
              disabled={loading || otpCode.length < 6}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              <span>Verify & Activate Workspace</span>
            </button>

            {/* 🔁 PROMINENT RESEND OTP CONTROLS */}
            <div className="p-3 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-2 text-center text-xs">
              <p className="text-slate-400 text-[11px]">
                Didn't receive the email? Check your spam folder or generate a new code:
              </p>
              
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={loading}
                  className="px-4 py-2 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  <span>🔁 Resend New OTP Code</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTab('register')}
                  className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs font-semibold cursor-pointer transition-colors"
                >
                  Edit Details
                </button>
              </div>
            </div>
          </form>
        )}

        {/* FORGOT PASSWORD STEP */}
        {tab === 'forgot_pass' && (
          <form onSubmit={handleForgotPassword} className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-1.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
                <Lock className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-100">Reset Your Password</h4>
              <p className="text-slate-400 text-[11px]">
                Enter your registered email address and we'll dispatch a 6-digit security code.
              </p>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-semibold">
                Email Address <span className="text-red-400 font-bold ml-0.5">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={resetEmail}
                  onChange={e => setResetEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>
              {(() => {
                const typo = checkEmailTypo(resetEmail);
                if (typo.hasTypo) {
                  return (
                    <div className="mt-1 flex items-center justify-between p-1.5 px-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-300 animate-pulse">
                      <span>Did you mean <strong className="text-amber-200 font-mono font-bold">@{typo.suggestion}</strong>?</span>
                      <button
                        type="button"
                        onClick={() => setResetEmail(typo.correctedEmail)}
                        className="px-2 py-0.5 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[10px] cursor-pointer"
                      >
                        Fix Email ➔
                      </button>
                    </div>
                  );
                }
                return null;
              })()}
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Sending Code...' : 'Send 6-Digit Reset Code ➔'}
              </button>
            </div>

            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => { setTab('login'); setErrorMsg(''); setOtpSuccessMsg(''); }}
                className="text-slate-400 hover:text-slate-200 underline text-xs cursor-pointer"
              >
                Back to Sign In
              </button>
            </div>
          </form>
        )}

        {/* RESET PASSWORD STEP */}
        {tab === 'reset_pass' && (
          <form onSubmit={handleResetPassword} className="space-y-3 text-xs">
            {/* Compact Code & Timer pill */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/90 border border-slate-800 text-[11px]">
              <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                Code sent to <strong className="text-slate-200 truncate max-w-[160px]">{resetEmail}</strong>:
              </span>
              <span className={`font-mono font-bold text-xs px-2 py-0.5 rounded-lg border tabular-nums text-center w-[54px] ${
                otpTimer > 30 ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'
              }`}>
                {formatTimer(otpTimer)}
              </span>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-semibold">
                6-Digit Security Code <span className="text-red-400 font-bold ml-0.5">*</span>
              </label>
              <input
                type="text"
                maxLength={6}
                required
                autoFocus
                value={resetCode}
                onChange={e => setResetCode(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                className="w-full bg-slate-950 border border-emerald-500/40 focus:border-emerald-400 rounded-xl py-2 text-center text-xl font-mono tracking-widest text-emerald-400 font-extrabold focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">
                  New Password <span className="text-red-400 font-bold ml-0.5">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-3 pr-8 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-200 cursor-pointer"
                    tabIndex={-1}
                  >
                    {showNewPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">
                  Confirm Password <span className="text-red-400 font-bold ml-0.5">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmNewPass ? 'text' : 'password'}
                    required
                    value={confirmNewPassword}
                    onChange={e => setConfirmNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-3 pr-8 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmNewPass(!showConfirmNewPass)}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-200 cursor-pointer"
                    tabIndex={-1}
                  >
                    {showConfirmNewPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* 🛡️ COMPACT PASSWORD STRENGTH BAR */}
            {newPassword && (() => {
              const strength = checkPasswordStrength(newPassword);
              return (
                <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-slate-400">Password Strength:</span>
                    <span className={`font-bold font-mono ${strength.textColor}`}>{strength.label}</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${strength.color}`}
                      style={{ width: `${Math.min(100, (strength.score / 4) * 100)}%` }}
                    />
                  </div>
                </div>
              );
            })()}

            {/* PROMINENT SUBMIT BUTTON */}
            <div className="pt-1">
              <button
                type="submit"
                disabled={loading || resetCode.length < 6}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                <span>Reset Password & Sign In</span>
              </button>
            </div>

            <div className="flex items-center justify-between pt-0.5 text-[11px] text-slate-400">
              <button
                type="button"
                onClick={() => handleForgotPassword()}
                disabled={loading || otpTimer > 0}
                className={`flex items-center gap-1 font-semibold ${
                  otpTimer === 0 ? 'text-emerald-400 hover:text-emerald-300 underline cursor-pointer' : 'text-slate-500 cursor-not-allowed'
                }`}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                {otpTimer === 0 ? 'Resend Code' : `Resend in ${otpTimer}s`}
              </button>
              <button
                type="button"
                onClick={() => { setTab('login'); setErrorMsg(''); setOtpSuccessMsg(''); }}
                className="hover:text-slate-200 underline cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
