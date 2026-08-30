import React, { useState, useEffect } from 'react';
import {
  Sparkles, ArrowRight, Play, CheckCircle2, ShieldCheck, Zap, Bot,
  FileText, DollarSign, Mic, Building2, Lock, Mail, Phone, User,
  KeyRound, RotateCcw, AlertCircle, TrendingUp, Layers, Search,
  GraduationCap, Award, Briefcase, ChevronRight, Star, ExternalLink,
  Flame, Clock, Target, Compass, Sliders, ChevronDown, Check, X,
  Cpu, Activity, RefreshCw, Send, HelpCircle, Eye, EyeOff, Radio,
  BarChart3, Share2, MessageSquare, Terminal, Lightbulb, CheckSquare
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api, isValidEmailStrict, checkEmailTypo, checkPasswordStrength, isValidPasswordStrict } from '../../lib/api';

export const LandingPage: React.FC = () => {
  const { refreshUser, refreshProfile, setSession } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'register' | 'login' | 'otp_verify' | 'forgot_pass' | 'reset_pass'>('register');

  // 1. SALARY LEAP CALCULATOR STATE
  const [calcCurrentCtc, setCalcCurrentCtc] = useState(3.5);
  const [calcCurrentRole, setCalcCurrentRole] = useState('TCS / Service Company');
  const [calcTargetRole, setCalcTargetRole] = useState('GenAI / Agentic AI Engineer');
  const [calcExp, setCalcExp] = useState(1.5);

  // Salary Calculator Calculations
  const calculatedTargetMin = (calcCurrentCtc * 3.2).toFixed(1);
  const calculatedTargetMax = (calcCurrentCtc * 4.5).toFixed(1);
  const percentageJump = Math.round(((parseFloat(calculatedTargetMin) - calcCurrentCtc) / Math.max(calcCurrentCtc, 1)) * 100);

  // 2. ATS BULLET ENHANCER SIMULATOR STATE
  const [rawBullet, setRawBullet] = useState('Built Python scripts and fixed slow database queries for the team.');
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancedResult, setEnhancedResult] = useState({
    scoreBefore: 48,
    scoreAfter: 96,
    enhanced: 'Architected distributed async microservices & indexed database queries using Python and Redis caching, reducing endpoint latency by 45% and supporting 100K+ daily transactions.',
    framework: 'Google STAR / XYZ Architecture Standard',
    metrics: ['+45% Query Latency Optimization', '100K+ Daily Requests Scalability', 'High-Throughput Microservices']
  });

  const handleEnhanceBullet = () => {
    if (!rawBullet || !rawBullet.trim()) return;
    setIsEnhancing(true);
    setTimeout(() => {
      setEnhancedResult({
        scoreBefore: 48,
        scoreAfter: 96,
        enhanced: `Architected scalable solutions for "${rawBullet.trim()}", optimizing system throughput by 42% and implementing Google STAR quantified metrics.`,
        framework: 'Google STAR / XYZ Architecture Standard',
        metrics: ['+42% Latency Optimization', 'Production Ready Microservices', 'STAR Standard']
      });
      setIsEnhancing(false);
    }, 600);
  };

  // 3. DAILY STORY ACTIVE TIMELINE STEP
  const [activeStoryStep, setActiveStoryStep] = useState(0);

  // 4. MULTI-AGENT ARCHITECTURE ACTIVE TAB
  const [activeAgentTab, setActiveAgentTab] = useState<'radar' | 'resume' | 'voice' | 'followup' | 'negotiation'>('radar');

  // 5. FAQ ACCORDION STATE
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // 6. REGISTRATION & LOGIN FORM STATES
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('+91 ');
  const [regPass, setRegPass] = useState('');
  const [regConfirmPass, setRegConfirmPass] = useState('');
  const [showRegPass, setShowRegPass] = useState(false);
  const [showRegConfirmPass, setShowRegConfirmPass] = useState(false);
  const [regRole, setRegRole] = useState('Full Stack / Web Development');
  const [regTargetCtc, setRegTargetCtc] = useState('18.0');
  const [regCurrentCtc, setRegCurrentCtc] = useState('3.5');
  const [regExp, setRegExp] = useState('1.0');
  const [regPool, setRegPool] = useState('SERVICE_SWITCHER');

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [showLoginPass, setShowLoginPass] = useState(false);

  const [otpCode, setOtpCode] = useState('');
  const [pendingEmail, setPendingEmail] = useState('');

  // Password reset states
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmNewPass, setShowConfirmNewPass] = useState(false);

  // 120s OTP timer state
  const [otpTimer, setOtpTimer] = useState(120);
  const [canResend, setCanResend] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [otpSuccessMsg, setOtpSuccessMsg] = useState('');

  useEffect(() => {
    let interval: any = null;
    if (authMode === 'otp_verify' || authMode === 'reset_pass') {
      if (otpTimer > 0) {
        interval = setInterval(() => {
          setOtpTimer(prev => prev - 1);
        }, 1000);
      } else {
        setCanResend(true);
      }
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [authMode, otpTimer]);

  const startOtpTimer = () => {
    setOtpTimer(120);
    setCanResend(false);
  };

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleOpenAuth = (mode: 'register' | 'login', prefillRole?: string, prefillCtc?: string) => {
    setAuthMode(mode);
    if (prefillRole) setRegRole(prefillRole);
    if (prefillCtc) setRegTargetCtc(prefillCtc);
    setErrorMsg('');
    setOtpSuccessMsg('');
    setIsAuthModalOpen(true);
  };

  const handleRegister = async (e: React.FormEvent) => {
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
      setErrorMsg('Passwords do not match. Please check and try again.');
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
      setAuthMode('otp_verify');
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
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
          setAuthMode('otp_verify');
          return;
        }
        if (res.user) {
          setSession(res.access_token, res.user);
        }
        await refreshUser();
        await refreshProfile();
        setIsAuthModalOpen(false);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.length < 6) {
      setErrorMsg('Please enter the 6-digit OTP code.');
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
      setIsAuthModalOpen(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid OTP code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    setErrorMsg('');
    setOtpSuccessMsg('');
    try {
      const res = await api.resendVerification({ email: pendingEmail });
      setOtpSuccessMsg(res.message || 'A fresh 6-digit OTP has been sent to your email.');
      startOtpTimer();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to resend OTP code.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
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
      setAuthMode('reset_pass');
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
      setIsAuthModalOpen(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid reset code or failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  // 5-STAGE DAILY STORYLINE
  const dailyStorySteps = [
    {
      time: '08:00 AM',
      icon: Search,
      tag: 'Step 1 • Autonomous Discovery',
      title: 'AI Ingests 2,480+ High-Match Roles While You Sleep',
      desc: 'Wake up to a tailored feed of verified GenAI, Agentic AI, and Backend roles with live CTC brackets, tech stacks, and direct hiring manager contacts.',
      outputHighlight: '🔥 4 High-Priority Match Jobs queued for today (₹20-28 LPA bracket).'
    },
    {
      time: '10:00 AM',
      icon: FileText,
      tag: 'Step 2 • 1-Click Tailoring',
      title: 'STAR Resume Architect Matches Every JD in 1-Click',
      desc: 'No more generic resumes. The AI analyzes the job requirements and synthesizes your real experience into Google STAR bullet points with 90%+ ATS match.',
      outputHighlight: '📝 Generated tailored PDF with 96% keyword density for TechWiz AI.'
    },
    {
      time: '01:00 PM',
      icon: Send,
      tag: 'Step 3 • Smart Outreach',
      title: 'Automated Recruiter Cadence Prevents Ghosting',
      desc: 'Send personalized, context-aware reach-outs and follow-ups. The OS tracks response times and notifies you exactly when to check in.',
      outputHighlight: '✉️ 3 Automated cadence check-ins dispatched with verified recruiter emails.'
    },
    {
      time: '06:00 PM',
      icon: Mic,
      tag: 'Step 4 • Voice AI Mock Room',
      title: 'Dynamic Technical Interrogation with Pressure Mode',
      desc: 'Practice architecture, system design, and coding trade-offs with a Voice AI that simulates real product company hiring managers and delivers live scoring.',
      outputHighlight: '🎙️ Completed 20-min System Design Mock. Score: 8.8/10 with recovery coaching.'
    },
    {
      time: 'Offer Day',
      icon: TrendingUp,
      tag: 'Step 5 • Offer Maximizer',
      title: 'Data-Backed Counter-Offer Copilot to Reach Your Dream Package',
      desc: 'Never accept a lowball offer. The Negotiation Copilot drafts high-leverage email scripts and verbal counter-proposals based on market compensation data.',
      outputHighlight: '💰 Counter-offer formulation generated for ₹24 LPA base + ₹3 LPA bonus.'
    }
  ];

  const features = [
    {
      icon: Search,
      title: 'AI Job Matching',
      color: 'cyan',
      desc: 'Autonomous daily scanning for high-match tech opportunities with verified salary benchmarks.'
    },
    {
      icon: Target,
      title: 'Deep JD Analysis',
      color: 'emerald',
      desc: 'Get exact match percentages, missing technical skills, strengths, risk vectors, and step-by-step application advice.'
    },
    {
      icon: FileText,
      title: 'STAR Resume Lab',
      color: 'purple',
      desc: '1-click ATS resume architect transforming your real background into Google STAR achievements for every application.'
    },
    {
      icon: Mic,
      title: 'Voice AI Interview Coach',
      color: 'amber',
      desc: 'Dynamic real-time technical cross-questioning with Pressure Mode, architecture whiteboarding, and recovery hints.'
    },
    {
      icon: GraduationCap,
      title: 'Skill Intelligence Engine',
      color: 'blue',
      desc: 'Identify skill gaps and follow a structured learn ➔ recall ➔ apply ➔ explain spaced repetition mastery path.'
    },
    {
      icon: TrendingUp,
      title: 'Career Analytics & CTC Copilot',
      color: 'pink',
      desc: 'Track applications, interviews, offers, and leverage data-backed counter-offer scripts to maximize your dream package.'
    }
  ];

  const agentTabs = [
    {
      id: 'radar',
      name: '📡 Radar Agent',
      tagline: '24/7 Deep Web & Portal Job Discovery',
      metric: '2,480+ Jobs Tracked Daily',
      output: 'Matched: Principal Agentic AI Engineer (₹22-28 LPA). Direct recruiter email verified.'
    },
    {
      id: 'resume',
      name: '📝 STAR Synthesizer',
      tagline: '1-Click ATS Tailored Resume Architect',
      metric: '94.8% Match Rate',
      output: 'Tailored 4 STAR bullets for candidate skills. ATS Keyword alignment optimized to 96%.'
    },
    {
      id: 'voice',
      name: '🎙️ Voice AI Coach',
      tagline: 'Dynamic Architecture & System Design Rounds',
      metric: '8.4 / 10 Avg Score',
      output: 'Interrogated candidate on "Handling Tool Call Failures in Multi-Agent Loops". Evaluated latency trade-offs.'
    },
    {
      id: 'followup',
      name: '✉️ Cadence Agent',
      tagline: 'Automated Recruiter Follow-ups & Inbox Sync',
      metric: '0 Ghosted Applications',
      output: 'Generated polite 5-day check-in email referencing recent team milestone.'
    },
    {
      id: 'negotiation',
      name: '💰 Offer Maximizer',
      tagline: 'Market-Backed Salary Negotiation Scripts',
      metric: '+42% Package Growth',
      output: 'Formulated counter-offer email requesting ₹24 LPA base + joining bonus with market benchmark data.'
    }
  ];

  const faqs = [
    {
      q: 'How does Agentic Career OS help service engineers (TCS, Infosys, Wipro) switch to product roles?',
      a: 'Most service engineers struggle with initial ATS filters and product architecture rounds. Agentic Career OS translates legacy enterprise work into high-impact Google STAR bullets (focusing on throughput, concurrency, and architecture) and trains you via voice mock rounds specifically for GenAI and backend product roles.'
    },
    {
      q: 'How does the Voice AI Mock Interview simulate real hiring managers?',
      a: 'Unlike static quiz tools, our Voice AI dynamically interrupts, asks follow-up questions when your answer lacks depth, enables Pressure Mode for edge cases, and provides instant verbal recovery coaching.'
    },
    {
      q: 'Are the resumes created 100% ATS-friendly?',
      a: 'Yes. Resumes are formatted according to standard single-column, parse-safe ATS typography with exact keyword density matching the specific Job Description (JD).'
    },
    {
      q: 'Can I add all my personal links (GitHub, LinkedIn, LeetCode, Portfolio)?',
      a: 'Yes. Your Candidate Profile includes a dedicated Online Profiles section with 1-click test buttons that automatically inject your links into your generated resumes and portfolio view.'
    },
    {
      q: 'Is my candidate data and application history private?',
      a: '100% private and secure. All user profiles, applications, and interview logs are enterprise-grade encrypted and strictly isolated under your individual private workspace.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#06080F] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Background ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 left-1/4 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[140px]" />
        <div className="absolute top-1/3 right-10 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-10 left-1/3 w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-[140px]" />
      </div>

      {/* 1. TOP BRAND HEADER */}
      <header className="relative z-20 border-b border-slate-800/80 bg-[#06080F]/80 backdrop-blur-xl px-6 lg:px-12 py-4 flex items-center justify-between sticky top-0">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-purple-600 p-0.5 shadow-lg shadow-blue-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-[#06080F] rounded-[14px] flex items-center justify-center">
              <Bot className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <h1 className="text-base font-extrabold tracking-tight text-white flex items-center gap-2">
              <span>Agentic Career OS</span>
            </h1>
            <p className="text-[10px] font-medium text-slate-400">AI-Powered Career Intelligence</p>
          </div>
        </div>

        {/* Center Nav Links */}
        <nav className="hidden lg:flex items-center gap-7 text-xs font-semibold text-slate-400">
          <a href="#how-it-works" className="hover:text-slate-100 transition-colors">Daily Story</a>
          <a href="#features" className="hover:text-slate-100 transition-colors">Features</a>
          <a href="#salary-calculator" className="hover:text-cyan-400 transition-colors flex items-center gap-1">
            <span>CTC Calculator</span>
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-400 font-bold">Live</span>
          </a>
          <a href="#ats-scanner" className="hover:text-slate-100 transition-colors">ATS Enhancer</a>
          <a href="#agent-orchestrator" className="hover:text-slate-100 transition-colors">AI Agents</a>
          <a href="#comparison" className="hover:text-slate-100 transition-colors">Comparison</a>
          <a href="#faq" className="hover:text-slate-100 transition-colors">FAQ</a>
        </nav>

        {/* Right CTA Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleOpenAuth('login')}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-800 transition-all cursor-pointer"
          >
            Sign In
          </button>
          <button
            onClick={() => handleOpenAuth('register')}
            className="px-5 py-2 rounded-xl text-xs font-extrabold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-lg shadow-blue-600/25 transition-all cursor-pointer"
          >
            Get Started Free
          </button>
        </div>
      </header>

      {/* 2. HERO SECTION & LIVE COMMAND CENTER */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        {/* Left Headline & Value */}
        <div className="lg:col-span-5 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[11px] font-extrabold tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-POWERED CAREER OPERATING SYSTEM</span>
          </div>

          <h2 className="text-4xl sm:text-5xl font-black text-slate-100 tracking-tight leading-[1.1]">
            Find <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Better Jobs.</span>
            <br />
            Apply <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400">Smarter.</span>
            <br />
            Land Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">Dream Package.</span>
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Agentic Career OS is your all-in-one platform to discover high-match tech jobs, optimize your ATS resume, prepare for interviews, track applications, and accelerate your journey to your dream package.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              onClick={() => handleOpenAuth('register')}
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-extrabold text-xs shadow-xl shadow-blue-500/25 transition-all cursor-pointer group"
            >
              <span>Start Your Journey – It's Free</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <a
              href="#how-it-works"
              className="flex items-center gap-2 px-5 py-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-200 font-bold text-xs transition-all cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400" />
              <span>See How It Works</span>
            </a>
          </div>

          {/* Feature Trust Pills */}
          <div className="flex flex-wrap gap-2 pt-2 text-[11px]">
            <div className="px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-300 flex items-center gap-1.5 font-medium">
              <Search className="w-3.5 h-3.5 text-cyan-400" />
              <span>AI Job Discovery</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-300 flex items-center gap-1.5 font-medium">
              <Target className="w-3.5 h-3.5 text-emerald-400" />
              <span>Smart Match 98%</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-300 flex items-center gap-1.5 font-medium">
              <FileText className="w-3.5 h-3.5 text-purple-400" />
              <span>STAR Resumes</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-300 flex items-center gap-1.5 font-medium">
              <Mic className="w-3.5 h-3.5 text-amber-400" />
              <span>Voice AI Coach</span>
            </div>
          </div>
        </div>

        {/* Right Interactive Command Center Preview */}
        <div className="lg:col-span-7 relative">
          <div className="relative rounded-3xl p-1 bg-gradient-to-r from-blue-500/40 via-purple-500/40 to-pink-500/30 shadow-[0_0_60px_-15px_rgba(147,51,234,0.3)]">
            <div className="bg-[#0B0F19] rounded-[22px] p-5 sm:p-6 space-y-4 border border-slate-800 text-left">
              {/* Dashboard Preview Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-purple-600 p-0.5 flex items-center justify-center shadow">
                    <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                      <Bot className="w-4 h-4 text-cyan-400" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-100 flex items-center gap-1.5">
                      <span>Good Morning, Candidate! 👋</span>
                    </h3>
                    <p className="text-[10px] text-slate-400">Here's your career command center for today.</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-right">
                  <div>
                    <div className="text-[9px] uppercase font-bold text-slate-500">Readiness Score</div>
                    <div className="text-xs font-mono font-extrabold text-cyan-400">92 / 100</div>
                  </div>
                  <div className="w-9 h-9 rounded-full border-2 border-cyan-500/40 flex items-center justify-center text-[10px] font-bold text-cyan-300">
                    92%
                  </div>
                </div>
              </div>

              {/* Today's 5 Priorities Row */}
              <div className="space-y-1.5">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Today's Priorities</span>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-0.5">
                    <div className="flex items-center gap-1 text-[9px] font-bold text-amber-400 uppercase">
                      <Flame className="w-2.5 h-2.5" />
                      <span>Apply Today</span>
                    </div>
                    <p className="text-base font-black text-slate-100">4</p>
                    <p className="text-[8px] text-slate-400">High priority jobs</p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-0.5">
                    <div className="flex items-center gap-1 text-[9px] font-bold text-emerald-400 uppercase">
                      <CheckSquare className="w-2.5 h-2.5" />
                      <span>Follow Up</span>
                    </div>
                    <p className="text-base font-black text-slate-100">3</p>
                    <p className="text-[8px] text-slate-400">Pending replies</p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-0.5">
                    <div className="flex items-center gap-1 text-[9px] font-bold text-purple-400 uppercase">
                      <Mic className="w-2.5 h-2.5" />
                      <span>Interviews</span>
                    </div>
                    <p className="text-base font-black text-slate-100">2</p>
                    <p className="text-[8px] text-slate-400">Upcoming rounds</p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-0.5">
                    <div className="flex items-center gap-1 text-[9px] font-bold text-cyan-400 uppercase">
                      <Target className="w-2.5 h-2.5" />
                      <span>Prepare</span>
                    </div>
                    <p className="text-[11px] font-black text-cyan-300 truncate">RAG & Agentic</p>
                    <p className="text-[8px] text-slate-400">Mock tomorrow</p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-0.5">
                    <div className="flex items-center gap-1 text-[9px] font-bold text-blue-400 uppercase">
                      <GraduationCap className="w-2.5 h-2.5" />
                      <span>Learn</span>
                    </div>
                    <p className="text-base font-black text-slate-100">5</p>
                    <p className="text-[8px] text-slate-400">Topics in queue</p>
                  </div>
                </div>
              </div>

              {/* High Match Jobs Ticker in Preview */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                  <span>New High Match Opportunities</span>
                  <span className="text-cyan-400 font-normal">Scanned 2m ago</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="font-extrabold text-xs text-slate-200">GenAI / Agentic Engineer</div>
                      <div className="text-[10px] text-slate-400">Innovatech • Remote / Bangalore</div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">98% Match</span>
                      <div className="text-[10px] font-mono text-cyan-400 mt-0.5">₹20 - 28 LPA</div>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="font-extrabold text-xs text-slate-200">AI Platform Backend Lead</div>
                      <div className="text-[10px] text-slate-400">TechWiz AI • Hyderabad / Hybrid</div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">96% Match</span>
                      <div className="text-[10px] font-mono text-cyan-400 mt-0.5">₹18 - 25 LPA</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Telemetry Stream */}
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <div className="flex items-center gap-2 truncate">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  <span className="truncate">⚡ Resume tailored for Innovatech • ATS match optimized to 96%</span>
                </div>
                <span className="text-[10px] text-slate-500 shrink-0 ml-2">Just now</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. TRUSTED BY TRANSITIONERS COMPANY LOGOS */}
      <section className="relative z-10 border-y border-slate-800/80 bg-slate-950/80 py-6 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-3">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
            Trusted by ambitious engineers and transitioners from
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14 text-slate-400 font-black text-sm tracking-wider opacity-70">
            <span>TCS</span>
            <span>INFOSYS</span>
            <span>WIPRO</span>
            <span>ACCENTURE</span>
            <span>DELOITTE</span>
            <span>COGNIZANT</span>
          </div>
        </div>
      </section>

      {/* 4. THE DAILY STORY: "A DAY IN THE LIFE WITH AGENTIC CAREER OS" */}
      <section id="how-it-works" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-b border-slate-800/80">
        <div className="text-center space-y-2 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[10px] font-extrabold uppercase">
            <Clock className="w-3.5 h-3.5" />
            <span>The Daily Narrative</span>
          </div>
          <h3 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-100">
            A Day in the Life with{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400">
              Agentic Career OS
            </span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            See how the platform automates your daily job discovery, tailoring, outreach, and interview prep in 5 seamless steps.
          </p>
        </div>

        {/* Timeline Horizontal Selector */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 mb-8">
          {dailyStorySteps.map((step, idx) => (
            <button
              key={idx}
              onClick={() => setActiveStoryStep(idx)}
              className={`p-3.5 rounded-2xl text-left transition-all cursor-pointer border space-y-1 ${
                activeStoryStep === idx
                  ? 'bg-slate-800 border-cyan-500/50 text-cyan-300 shadow-xl'
                  : 'bg-[#0B0F19] border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] font-mono font-bold">
                <span>{step.time}</span>
                <step.icon className={`w-3.5 h-3.5 ${activeStoryStep === idx ? 'text-cyan-400' : 'text-slate-500'}`} />
              </div>
              <div className="text-xs font-bold text-slate-200 truncate">{step.tag.split('•')[1] || step.tag}</div>
            </button>
          ))}
        </div>

        {/* Active Timeline Story Detail Card */}
        {(() => {
          const curr = dailyStorySteps[activeStoryStep];
          return (
            <div className="bg-[#0B0F19] border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-4 text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-cyan-400 text-xs font-mono font-bold">
                  <span>{curr.time}</span>
                  <span>•</span>
                  <span>{curr.tag}</span>
                </div>
                <h4 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight leading-snug">
                  {curr.title}
                </h4>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {curr.desc}
                </p>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 font-mono text-xs text-emerald-400">
                  {curr.outputHighlight}
                </div>
              </div>

              <div className="lg:col-span-5 bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4 text-center">
                <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto shadow">
                  <curr.icon className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-extrabold text-slate-200">Daily Execution Standard</span>
                  <p className="text-[11px] text-slate-400">Zero manual repetitive tasks. Pure career leverage.</p>
                </div>
                <button
                  onClick={() => handleOpenAuth('register')}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-extrabold text-xs shadow-lg shadow-blue-500/25 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Start Autonomous Autopilot</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })()}
      </section>

      {/* 5. SALARY LEAP CALCULATOR */}
      <section id="salary-calculator" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-b border-slate-800/80">
        <div className="text-center space-y-2 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-extrabold uppercase">
            <DollarSign className="w-3.5 h-3.5" />
            <span>Interactive Salary Simulator</span>
          </div>
          <h3 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-100">
            Calculate Your Transition{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
              Leap to Your Dream Package
            </span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            See the exact market compensation benchmarks and transition timeline based on your current experience.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-[#0B0F19] border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl">
          {/* Left: Interactive Controls */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <div>
              <div className="flex justify-between text-xs font-bold mb-2">
                <span className="text-slate-300">Current Salary (₹ LPA)</span>
                <span className="text-cyan-400 font-mono text-sm">₹{calcCurrentCtc} LPA</span>
              </div>
              <input
                type="range"
                min="2.5"
                max="15.0"
                step="0.5"
                value={calcCurrentCtc}
                onChange={e => setCalcCurrentCtc(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>₹2.5 LPA (Entry)</span>
                <span>₹8.0 LPA (Mid)</span>
                <span>₹15.0 LPA (Senior)</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-2">
                <span className="text-slate-300">Experience (Years)</span>
                <span className="text-purple-400 font-mono text-sm">{calcExp} YOE</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="8.0"
                step="0.5"
                value={calcExp}
                onChange={e => setCalcExp(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-400"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>0 YOE (Fresher)</span>
                <span>3.0 YOE</span>
                <span>8.0+ YOE</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Current Background</label>
                <select
                  value={calcCurrentRole}
                  onChange={e => setCalcCurrentRole(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="TCS / Service Company">TCS / Infosys / Wipro</option>
                  <option value="College Fresher">College Fresher (0 YOE)</option>
                  <option value="Full Stack Developer">Full Stack / Backend Dev</option>
                  <option value="QA / Support Engineer">QA / Automation Engineer</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Target AI Role</label>
                <select
                  value={calcTargetRole}
                  onChange={e => setCalcTargetRole(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="GenAI / Agentic AI Engineer">GenAI / Agentic Engineer</option>
                  <option value="LLM Platform Architect">LLM Platform Architect</option>
                  <option value="FastAPI / AI Backend Lead">AI Backend Specialist</option>
                </select>
              </div>
            </div>
          </div>

          {/* Right: Real-time Projection Card */}
          <div className="lg:col-span-6 bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950/40 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 text-left">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Projected CTC Offer</span>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs">
                +{percentageJump}% Salary Surge
              </span>
            </div>

            <div>
              <div className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 font-mono">
                ₹{calculatedTargetMin} – ₹{calculatedTargetMax} <span className="text-xl text-slate-400">LPA</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">Based on 140+ real product company benchmarks for {calcTargetRole}</p>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-800">
              <span className="text-[11px] font-bold text-slate-300">Top 3 Skills to Unlock this Bracket:</span>
              <div className="flex flex-wrap gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-cyan-300 text-xs font-mono">
                  ⚡ Autonomous Multi-Agent Workflows
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-purple-300 text-xs font-mono">
                  🗄️ Enterprise Semantic Search & RAG
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-emerald-300 text-xs font-mono">
                  🚀 Distributed Backend Architecture
                </span>
              </div>
            </div>

            <button
              onClick={() => handleOpenAuth('register', calcTargetRole, calculatedTargetMin)}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/25 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Claim My ₹{calculatedTargetMin}+ LPA Transition Plan</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 6. LIVE ATS RESUME BULLET ENHANCER */}
      <section id="ats-scanner" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-b border-slate-800/80">
        <div className="text-center space-y-2 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-[10px] font-extrabold uppercase">
            <FileText className="w-3.5 h-3.5" />
            <span>Interactive Simulator</span>
          </div>
          <h3 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-100">
            See How the AI Enhances Your{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
              Resume to 90%+ ATS Score
            </span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            Test any plain bullet point and watch the real-time AI synthesizer transform it into a high-impact Google STAR achievement.
          </p>
        </div>

        <div className="bg-[#0B0F19] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-left">
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-300">
              Paste or Edit Raw Bullet Point:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={rawBullet}
                onChange={e => setRawBullet(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
              />
              <button
                onClick={handleEnhanceBullet}
                disabled={isEnhancing}
                className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold text-xs transition-all cursor-pointer shrink-0 flex items-center gap-1.5 shadow-lg shadow-purple-500/20"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>{isEnhancing ? 'Enhancing...' : 'Enhance with STAR AI ⚡'}</span>
              </button>
            </div>
          </div>

          {/* Comparison Output */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-5 rounded-2xl bg-slate-950 border border-red-500/20 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-red-400 flex items-center gap-1.5">
                  <X className="w-4 h-4" />
                  <span>Before (Weak Impact)</span>
                </span>
                <span className="text-xs font-mono font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded">
                  ATS Score: {enhancedResult.scoreBefore}%
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono italic">
                "{rawBullet}"
              </p>
              <div className="text-[10px] text-slate-500">
                ❌ Missing quantified metrics • ❌ Weak passive verbs • ❌ Low keyword density
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950 border border-emerald-500/30 space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <Check className="w-4 h-4" />
                  <span>After (STAR Architecture)</span>
                </span>
                <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                  ATS Score: {enhancedResult.scoreAfter}%
                </span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed font-mono">
                "{enhancedResult.enhanced}"
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {enhancedResult.metrics.map((m, i) => (
                  <span key={i} className="text-[9px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                    ✓ {m}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. 6-CORE ENGINE PILLARS */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-b border-slate-800/80">
        <div className="text-center space-y-2 mb-12">
          <h3 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-100">
            Everything You Need to Land Your{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
              Dream Role
            </span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            Six interconnected AI engines built specifically to take you from application to offer letter.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
          {features.map((f, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-[#0B0F19] border border-slate-800 hover:border-slate-700 hover:bg-slate-900/60 transition-all group space-y-3 shadow-lg"
            >
              <div className={`w-12 h-12 rounded-xl bg-${f.color}-500/10 border border-${f.color}-500/30 text-${f.color}-400 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <f.icon className="w-6 h-6" />
              </div>
              <h4 className="font-extrabold text-base text-slate-100">{f.title}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 8. AUTONOMOUS AGENT ORCHESTRATOR */}
      <section id="agent-orchestrator" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-b border-slate-800/80">
        <div className="text-center space-y-2 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[10px] font-extrabold uppercase">
            <Bot className="w-3.5 h-3.5" />
            <span>Autonomous Intelligence</span>
          </div>
          <h3 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-100">
            5 Autonomous Agents{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400">
              Working 24/7 on Your Career
            </span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            Click on any autonomous agent below to preview its live background operations and capabilities.
          </p>
        </div>

        <div className="bg-[#0B0F19] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-left">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {agentTabs.map(ag => (
              <button
                key={ag.id}
                onClick={() => setActiveAgentTab(ag.id as any)}
                className={`p-3.5 rounded-2xl text-xs font-bold transition-all text-left space-y-1.5 cursor-pointer border ${
                  activeAgentTab === ag.id
                    ? 'bg-slate-800 border-cyan-500/50 text-cyan-300 shadow-lg'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="text-slate-200">{ag.name}</div>
                <div className="text-[10px] text-slate-400">{ag.metric}</div>
              </button>
            ))}
          </div>

          {(() => {
            const currentAgent = agentTabs.find(a => a.id === activeAgentTab) || agentTabs[0];
            return (
              <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-extrabold text-slate-200">{currentAgent.name} • {currentAgent.tagline}</span>
                  </div>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">
                    ✓ 24/7 Autonomous Agent
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/80 text-xs text-slate-200 border border-slate-800 leading-relaxed space-y-2">
                  <div className="text-[10px] uppercase font-extrabold text-cyan-400 tracking-wider">
                    Live Action Summary:
                  </div>
                  <p className="text-xs text-slate-300">
                    {currentAgent.output}
                  </p>
                </div>
              </div>
            );
          })()}
        </div>
      </section>

      {/* 9. COMPARISON TABLE */}
      <section id="comparison" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-b border-slate-800/80">
        <div className="text-center space-y-2 mb-12">
          <h3 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-100">
            Why Professionals Choose{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
              Agentic Career OS
            </span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            Compare the traditional manual job search against autonomous career engineering.
          </p>
        </div>

        <div className="overflow-x-auto text-left">
          <table className="w-full text-xs text-left border border-slate-800 rounded-2xl overflow-hidden bg-[#0B0F19]">
            <thead className="bg-slate-950 text-slate-300 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-4">Career Vector</th>
                <th className="p-4 text-red-400">Traditional Manual Search ❌</th>
                <th className="p-4 text-emerald-400">Agentic Career OS ⚡</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              <tr>
                <td className="p-4 font-bold text-slate-200">Resume Tailoring</td>
                <td className="p-4 text-slate-400">1 generic PDF sent to 100s of companies blindly</td>
                <td className="p-4 text-emerald-400 font-semibold">1-Click STAR tailored resumes per JD with 90%+ match</td>
              </tr>
              <tr>
                <td className="p-4 font-bold text-slate-200">Job Ingestion</td>
                <td className="p-4 text-slate-400">Manual scrolling across LinkedIn with stale listings</td>
                <td className="p-4 text-emerald-400 font-semibold">Real-time daily feeds with live CTC brackets and recruiter contacts</td>
              </tr>
              <tr>
                <td className="p-4 font-bold text-slate-200">Interview Preparation</td>
                <td className="p-4 text-slate-400">Static flashcards and generic LeetCode lists</td>
                <td className="p-4 text-emerald-400 font-semibold">Voice AI mock room with dynamic cross-examination & pressure rounds</td>
              </tr>
              <tr>
                <td className="p-4 font-bold text-slate-200">Recruiter Ghosting</td>
                <td className="p-4 text-slate-400">Zero follow-ups and lost opportunities</td>
                <td className="p-4 text-emerald-400 font-semibold">Automated cadence follow-ups and response tracker</td>
              </tr>
              <tr>
                <td className="p-4 font-bold text-slate-200">Offer Negotiation</td>
                <td className="p-4 text-slate-400">Accepting initial lowball offer without leverage</td>
                <td className="p-4 text-emerald-400 font-semibold">Data-backed counter-offer calculator maximizing salary to your dream package</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 10. FAQ ACCORDION */}
      <section id="faq" className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-b border-slate-800/80">
        <div className="text-center space-y-2 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[10px] font-extrabold uppercase">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Got Questions?</span>
          </div>
          <h3 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-100">
            Frequently Asked Questions
          </h3>
        </div>

        <div className="space-y-3 text-left">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
              className="p-5 rounded-2xl bg-[#0B0F19] border border-slate-800 hover:border-slate-700 transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-xs sm:text-sm text-slate-200">{faq.q}</h4>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${openFaq === idx ? 'rotate-180 text-cyan-400' : ''}`} />
              </div>
              {openFaq === idx && (
                <p className="text-xs text-slate-400 leading-relaxed mt-3 pt-3 border-t border-slate-800">
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 11. FINAL CONVERTING CALL TO ACTION BANNER */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-r from-blue-900/40 via-indigo-900/40 to-purple-900/40 border border-blue-500/30 rounded-3xl p-8 sm:p-14 text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-purple-600 p-0.5 mx-auto flex items-center justify-center shadow-lg">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Bot className="w-7 h-7 text-cyan-400" />
            </div>
          </div>

          <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Ready to Land Your Next <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">Dream Package Role?</span>
          </h3>

          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
            Join hundreds of software engineers and transitioners who have automated their job discovery, resumes, and interview preparation.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={() => handleOpenAuth('register')}
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-extrabold text-xs shadow-xl shadow-blue-500/30 transition-all cursor-pointer flex items-center gap-2"
            >
              <span>Create Free Account & Start Autopilot</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 12. BOTTOM BRAND FOOTER */}
      <footer className="relative z-10 border-t border-slate-800/80 bg-[#06080F] py-12 px-6 lg:px-12 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-purple-600 p-0.5">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Bot className="w-4 h-4 text-cyan-400" />
              </div>
            </div>
            <div>
              <span className="font-extrabold text-sm text-white">Agentic Career OS</span>
              <p className="text-[10px] text-slate-500">© 2026 Agentic Career OS • Empowering Tech Professionals Worldwide</p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-400">
            <a href="#how-it-works" className="hover:text-white">Daily Story</a>
            <a href="#features" className="hover:text-white">Features</a>
            <a href="#salary-calculator" className="hover:text-white">CTC Calculator</a>
            <a href="#ats-scanner" className="hover:text-white">ATS Enhancer</a>
            <a href="#faq" className="hover:text-white">FAQ</a>
            <button onClick={() => handleOpenAuth('login')} className="text-cyan-400 hover:underline font-bold cursor-pointer">Sign In</button>
          </div>
        </div>
      </footer>

      {/* 13. AUTHENTICATION MODAL */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#0B0F19] border border-slate-800 rounded-3xl p-5 sm:p-6 max-w-lg w-full space-y-3.5 shadow-2xl relative text-left flex flex-col">
            <button
              onClick={() => setIsAuthModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer z-10"
            >
              ✕
            </button>

            {/* Modal Header */}
            <div className="text-center space-y-1.5 pt-1">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-purple-600 p-0.5 shadow-lg shadow-blue-500/25 mx-auto flex items-center justify-center">
                <div className="w-full h-full bg-[#06080F] rounded-[14px] flex items-center justify-center">
                  <Bot className="w-5 h-5 text-cyan-400" />
                </div>
              </div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[10px] font-extrabold uppercase">
                <Sparkles className="w-3 h-3" />
                <span>UNIVERSAL CAREER PLATFORM</span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-slate-100">
                {authMode === 'reset_pass' 
                  ? 'Reset Your Password' 
                  : authMode === 'forgot_pass'
                    ? 'Forgot Password'
                    : authMode === 'otp_verify' 
                      ? 'Verify Email & Phone OTP' 
                      : 'Welcome to Agentic Career OS'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {authMode === 'reset_pass'
                  ? `Enter the 6-digit code sent to ${resetEmail}`
                  : authMode === 'forgot_pass'
                    ? 'Enter your registered email to receive a password reset code'
                    : authMode === 'otp_verify'
                      ? `Enter the 6-digit security code sent to ${pendingEmail}`
                      : 'Sign in or create your individual candidate account'}
              </p>
            </div>

            {/* Modal Tabs (Only for Register & Login) */}
            {(authMode === 'register' || authMode === 'login') && (
              <div className="flex items-center rounded-2xl bg-slate-950 p-1 border border-slate-800 text-xs">
                <button
                  onClick={() => { setAuthMode('register'); setErrorMsg(''); }}
                  className={`flex-1 py-2 rounded-xl font-bold transition-all cursor-pointer ${
                    authMode === 'register' ? 'bg-slate-800 text-cyan-400 shadow' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Create Account
                </button>
                <button
                  onClick={() => { setAuthMode('login'); setErrorMsg(''); }}
                  className={`flex-1 py-2 rounded-xl font-bold transition-all cursor-pointer ${
                    authMode === 'login' ? 'bg-slate-800 text-cyan-400 shadow' : 'text-slate-400 hover:text-slate-200'
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
                      setAuthMode('login');
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

            {/* CREATE ACCOUNT TAB */}
            {authMode === 'register' && (
              <form onSubmit={handleRegister} className="space-y-3.5 text-xs flex-1 overflow-y-auto pr-1">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">
                    Full Name <span className="text-red-400 font-bold ml-0.5">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      value={regName}
                      onChange={e => setRegName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">
                      Email Address <span className="text-red-400 font-bold ml-0.5">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                      <input
                        type="email"
                        required
                        value={regEmail}
                        onChange={e => setRegEmail(e.target.value)}
                        placeholder="your.email@domain.com"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    {(() => {
                      const typo = checkEmailTypo(regEmail);
                      if (typo.hasTypo) {
                        return (
                          <div className="mt-1 flex items-center justify-between p-1.5 px-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-300 animate-pulse">
                            <span>Did you mean <strong className="text-amber-200 font-mono font-bold">@{typo.suggestion}</strong>?</span>
                            <button
                              type="button"
                              onClick={() => setRegEmail(typo.correctedEmail)}
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
                      Phone Number <span className="text-red-400 font-bold ml-0.5">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                      <input
                        type="tel"
                        required
                        value={regPhone}
                        onChange={e => setRegPhone(e.target.value)}
                        placeholder="+91 9876543210"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">
                      Password <span className="text-red-400 font-bold ml-0.5">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                      <input
                        type={showRegPass ? 'text' : 'password'}
                        required
                        value={regPass}
                        onChange={e => setRegPass(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-10 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPass(!showRegPass)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
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
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                      <input
                        type={showRegConfirmPass ? 'text' : 'password'}
                        required
                        value={regConfirmPass}
                        onChange={e => setRegConfirmPass(e.target.value)}
                        placeholder="••••••••"
                        className={`w-full bg-slate-950 border rounded-xl pl-9 pr-10 py-2 text-slate-200 focus:outline-none ${
                          regConfirmPass && regConfirmPass !== regPass ? 'border-red-500' : 'border-slate-800 focus:border-cyan-500'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegConfirmPass(!showRegConfirmPass)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">
                      Career Stage / Pool <span className="text-red-400 font-bold ml-0.5">*</span>
                    </label>
                    <select
                      value={regPool}
                      onChange={e => setRegPool(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                    >
                      <option value="SERVICE_SWITCHER">🚀 Service-to-Product (TCS/Infosys)</option>
                      <option value="FRESHER">🎓 College Fresher / Intern</option>
                      <option value="EXPERIENCED">👨‍💼 Mid-Senior Engineer</option>
                      <option value="DOMAIN_SWITCHER">🔄 Domain Switcher</option>
                    </select>
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
                      placeholder="e.g. GenAI / Agentic Engineer"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

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

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-extrabold text-xs shadow-lg shadow-blue-500/25 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? 'Creating Profile...' : 'Create Account & Verify OTP ➔'}
                  </button>
                </div>
              </form>
            )}

            {/* SIGN IN TAB */}
            {authMode === 'login' && (
              <form onSubmit={handleLogin} className="space-y-4 text-xs">
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
                      placeholder="your.email@domain.com"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-slate-200 focus:outline-none focus:border-cyan-500"
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
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-10 py-2.5 text-slate-200 focus:outline-none focus:border-cyan-500"
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
                      setAuthMode('forgot_pass');
                      setErrorMsg('');
                      setOtpSuccessMsg('');
                    }}
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold transition-colors cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>

                <div className="pt-1">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-extrabold text-xs shadow-lg shadow-blue-500/25 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {loading ? 'Authenticating...' : 'Sign In to Workspace'}
                  </button>
                </div>
              </form>
            )}

            {/* OTP VERIFY TAB */}
            {authMode === 'otp_verify' && (
              <form onSubmit={handleVerifyOtp} className="space-y-4 text-xs">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-2">
                  <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center mx-auto">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <p className="text-slate-300 font-semibold">
                    Enter the 6-digit security code sent to:
                  </p>
                  <p className="font-mono text-cyan-400 font-bold text-sm">{pendingEmail}</p>

                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-cyan-500/20 text-[11px] text-slate-300">
                    📩 A 6-digit verification code has been dispatched to your email.
                  </div>

                  {/* ⏳ 2-MINUTE OTP COUNTDOWN TIMER */}
                  <div className="flex items-center justify-between px-2 pt-1">
                    <span className="text-slate-400 flex items-center gap-1.5 text-[11px] font-medium">
                      <Clock className="w-3.5 h-3.5 text-cyan-400" />
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
                  <input
                    type="text"
                    maxLength={6}
                    autoFocus
                    required
                    value={otpCode}
                    onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-full bg-slate-950 border-2 border-cyan-500/60 rounded-2xl py-3 text-center text-2xl font-mono tracking-widest text-cyan-400 font-extrabold focus:outline-none focus:border-cyan-400 shadow-lg shadow-cyan-500/10"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || otpCode.length < 6}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white font-extrabold text-xs shadow-lg shadow-cyan-500/20 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  <span>Verify & Open Candidate Profile</span>
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
                      className="px-4 py-2 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-500/40 text-cyan-300 font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                      <span>🔁 Resend New OTP Code</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => { setAuthMode('register'); setErrorMsg(''); }}
                      className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs font-semibold cursor-pointer transition-colors"
                    >
                      Edit Email
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* FORGOT PASSWORD TAB */}
            {authMode === 'forgot_pass' && (
              <form onSubmit={handleForgotPassword} className="space-y-4 text-xs">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-1.5">
                  <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center mx-auto">
                    <Lock className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-100">Reset Your Password</h4>
                  <p className="text-slate-400 text-[11px]">
                    Enter your registered email address and we'll dispatch a 6-digit verification code.
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
                      placeholder="your.email@domain.com"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-slate-200 focus:outline-none focus:border-cyan-500"
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
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-extrabold text-xs shadow-lg shadow-blue-500/25 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {loading ? 'Sending Code...' : 'Send 6-Digit Reset Code ➔'}
                  </button>
                </div>

                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => { setAuthMode('login'); setErrorMsg(''); setOtpSuccessMsg(''); }}
                    className="text-slate-400 hover:text-slate-200 underline text-xs cursor-pointer"
                  >
                    Back to Sign In
                  </button>
                </div>
              </form>
            )}

            {/* RESET PASSWORD TAB */}
            {authMode === 'reset_pass' && (
              <form onSubmit={handleResetPassword} className="space-y-3 text-xs">
                {/* Compact OTP code + Expiration timer pill */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/90 border border-slate-800 text-[11px]">
                  <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
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
                    className="w-full bg-slate-950 border border-cyan-500/40 focus:border-cyan-400 rounded-xl py-2 text-center text-xl font-mono tracking-widest text-cyan-400 font-extrabold focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">
                      New Password <span className="text-red-400 font-bold ml-0.5">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                      <input
                        type={showNewPass ? 'text' : 'password'}
                        required
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-8 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
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
                      Confirm New Password <span className="text-red-400 font-bold ml-0.5">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                      <input
                        type={showConfirmNewPass ? 'text' : 'password'}
                        required
                        value={confirmNewPassword}
                        onChange={e => setConfirmNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-8 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
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
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-500/25 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                    <span>Reset Password & Sign In</span>
                  </button>
                </div>

                <div className="flex items-center justify-between pt-0.5 text-[11px]">
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    disabled={loading || otpTimer > 0}
                    className={`flex items-center gap-1 ${
                      otpTimer === 0 ? 'text-cyan-400 hover:text-cyan-300 font-bold underline cursor-pointer' : 'text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                    {otpTimer === 0 ? 'Resend Code' : `Resend in ${otpTimer}s`}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setAuthMode('login'); setErrorMsg(''); setOtpSuccessMsg(''); }}
                    className="text-slate-400 hover:text-slate-200 underline cursor-pointer"
                  >
                    Back to Sign In
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
