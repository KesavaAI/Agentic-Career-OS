import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Play, Video, Mic, Award, CheckCircle2, 
  AlertTriangle, Clock, Volume2, ArrowRight, ShieldAlert,
  Flame, BarChart3, RotateCcw, Target, HelpCircle, FileText,
  Headphones, MessageSquare, UserCheck, FileCheck, Briefcase, RefreshCw 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { VideoInterviewArena } from './VideoInterviewArena';
import { PostInterviewDiagnosticView } from './PostInterviewDiagnosticView';

export const MockInterviewView: React.FC = () => {
  const { user } = useAuth();
  const [viewState, setViewState] = useState<'readiness' | 'video_arena' | 'diagnostic'>('readiness');
  const [targetCompany, setTargetCompany] = useState('Acme');
  const [targetRole, setTargetRole] = useState(user?.target_role || 'Full Stack / Web Development');
  const [selectedMode, setSelectedMode] = useState<'video' | 'voice'>('video');

  // Dual Resume & JD Context States
  const [resumeText, setResumeText] = useState('');
  const [jdText, setJdText] = useState(`Role: Senior Full Stack Engineer
Key Responsibilities:
- Design and scale distributed microservices with FastAPI and Node.js.
- Implement high-throughput caching and database query optimization with Redis and PostgreSQL.
- Architect resilient event-driven pipelines with Kafka and automated circuit breakers.`);

  const [readinessData, setReadinessData] = useState<any>(null);
  const [evaluationReport, setEvaluationReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Auto-populate resume from user profile on load
  useEffect(() => {
    if (user) {
      const u = user as any;
      const skillsStr = Array.isArray(u.skills) ? u.skills.join(', ') : (u.skills || 'React, Node.js, Python, PostgreSQL, Docker, Redis');
      const expStr = Array.isArray(u.experiences) && u.experiences.length > 0 
        ? u.experiences.map((e: any) => `Project: ${e.title || e.role || 'Production Web App'} - ${e.description || 'Built high-scale web APIs'}`).join('\n')
        : 'Project: Real-Time SaaS Platform with Redis & PostgreSQL\nProject: Distributed Analytics Pipeline with Kafka';

      setResumeText(`Target Role: ${u.target_role || 'Full Stack Engineer'}\nSkills: ${skillsStr}\n${expStr}`);
    }
  }, [user]);

  useEffect(() => {
    loadReadiness();
  }, [targetRole, targetCompany]);

  const loadReadiness = async () => {
    try {
      setLoading(true);
      const data = await api.getVideoReadiness(targetRole, targetCompany);
      setReadinessData(data);
    } catch (err) {
      console.error('Failed to load video readiness diagnostic:', err);
      setReadinessData({
        target_role: `${(targetRole || 'FULL STACK').toUpperCase()} — ${targetCompany.toUpperCase()}`,
        overall_readiness_pct: 76,
        dimensions: {
          resume_match_pct: 91,
          technical_depth_pct: 82,
          communication_clarity_pct: 72,
          star_answers_pct: 64,
          confidence_delivery_pct: 78
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFinishVideoSession = async (sessionData: any) => {
    setEvaluationReport(sessionData);
    setViewState('diagnostic');
  };

  // 1. Executive Panel Video Arena View
  if (viewState === 'video_arena') {
    return (
      <VideoInterviewArena
        role={targetRole}
        company={targetCompany}
        resumeText={resumeText}
        jdText={jdText}
        initialMode={selectedMode}
        onFinishSession={handleFinishVideoSession}
        onCancel={() => setViewState('readiness')}
      />
    );
  }

  // 2. Post-Session Diagnostic Report View
  if (viewState === 'diagnostic') {
    return (
      <PostInterviewDiagnosticView
        report={evaluationReport}
        onPracticeAgain={() => setViewState('video_arena')}
        onDone={() => setViewState('readiness')}
      />
    );
  }

  // 3. Pre-Interview Readiness View (Default)
  const dims = readinessData?.dimensions || {
    resume_match_pct: 91,
    technical_depth_pct: 82,
    communication_clarity_pct: 72,
    star_answers_pct: 64,
    confidence_delivery_pct: 78
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      {/* Target Setup Controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
        <div className="flex items-center gap-3">
          <span className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400">
            <Video className="w-5 h-5" />
          </span>
          <div>
            <h3 className="font-extrabold text-sm text-slate-100">Super-Mercor Executive AI Panel Simulator</h3>
            <p className="text-xs text-slate-400">Sarah Jenkins (VP Talent) & David Vance (Staff Architect)</p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <input
            type="text"
            value={targetRole}
            onChange={e => setTargetRole(e.target.value)}
            placeholder="Target Role"
            className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          />
          <input
            type="text"
            value={targetCompany}
            onChange={e => setTargetCompany(e.target.value)}
            placeholder="Target Company"
            className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 🎯 PRE-INTERVIEW READINESS & DUAL RESUME/JD CONTEXT */}
      {/* ========================================================================= */}
      <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6 text-center">
        <div className="space-y-1">
          <div className="flex items-center justify-center gap-2">
            <span className="text-[10px] font-black px-2.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase">
              Tag-Team Executive Boardroom
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-100 uppercase tracking-wide">
            {targetRole.toUpperCase()} — {targetCompany.toUpperCase()}
          </h2>
          <div className="h-0.5 w-32 bg-indigo-500 mx-auto rounded-full mt-2" />
        </div>

        {/* 2 Panelists Preview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg mx-auto text-left">
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-indigo-500/30 flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-indigo-950 border border-indigo-400 flex items-center justify-center text-2xl select-none">
              👩‍💼
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-100">Sarah Jenkins</h4>
              <p className="text-[11px] text-indigo-300">VP Talent & Product</p>
              <p className="text-[10px] text-slate-400">Ownership, Business ROI & STAR</p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950 border border-blue-500/30 flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-blue-950 border border-blue-400 flex items-center justify-center text-2xl select-none">
              👨‍💼
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-100">David Vance</h4>
              <p className="text-[11px] text-blue-300">Staff Principal Architect</p>
              <p className="text-[10px] text-slate-400">Concurrency, Scale & Failure RCA</p>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 📄 DUAL CONTEXT INPUTS: RESUME + TARGET JOB DESCRIPTION (JD) */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto text-left">
          {/* Field 1: Candidate Resume / Projects */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-extrabold text-indigo-300 uppercase flex items-center gap-1.5">
                <FileCheck className="w-3.5 h-3.5" />
                <span>Your Resume & Projects:</span>
              </label>
              <span className="text-[10px] text-slate-500 font-mono">Parsed by AI</span>
            </div>
            <textarea
              value={resumeText}
              onChange={e => setResumeText(e.target.value)}
              placeholder="Paste your resume bullet points or project details..."
              rows={4}
              className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 resize-none font-sans"
            />
          </div>

          {/* Field 2: Target Job Description (JD) */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-extrabold text-blue-300 uppercase flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5" />
                <span>Target Job Description (JD):</span>
              </label>
              <span className="text-[10px] text-slate-500 font-mono">Target Requirements</span>
            </div>
            <textarea
              value={jdText}
              onChange={e => setJdText(e.target.value)}
              placeholder="Paste the job description or core requirements..."
              rows={4}
              className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500 resize-none font-sans"
            />
          </div>
        </div>

        {/* Overall Readiness Gauge */}
        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 max-w-sm mx-auto flex items-center justify-between">
          <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Interview Readiness:</span>
          <span className="text-3xl font-black text-emerald-400">{readinessData?.overall_readiness_pct || 76}%</span>
        </div>

        {/* Format Selector */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 max-w-md mx-auto space-y-2 text-left">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Select Practice Format:
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setSelectedMode('video')}
              className={`p-3 rounded-xl border flex items-center justify-center gap-2 transition-all cursor-pointer ${
                selectedMode === 'video' 
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300' 
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Video className="w-4 h-4" />
              <span className="text-xs font-bold">🎥 Video Mode</span>
            </button>

            <button
              onClick={() => setSelectedMode('voice')}
              className={`p-3 rounded-xl border flex items-center justify-center gap-2 transition-all cursor-pointer ${
                selectedMode === 'voice' 
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300' 
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Headphones className="w-4 h-4" />
              <span className="text-xs font-bold">🎙️ Voice-Only Mode</span>
            </button>
          </div>
        </div>

        {/* PRIMARY ACTION BUTTON */}
        <div className="pt-2">
          <button
            onClick={() => setViewState('video_arena')}
            className="px-10 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm tracking-wide uppercase shadow-2xl shadow-indigo-600/30 flex items-center gap-3 mx-auto transition-transform hover:scale-105 cursor-pointer"
          >
            <Video className="w-5 h-5 fill-white" />
            <span>[ ENTER EXECUTIVE PANEL BOARDROOM ]</span>
          </button>
          <p className="text-[11px] text-slate-500 mt-2">
            Grounded in your resume & target JD • Turn off camera anytime • Stop at any turn
          </p>
        </div>
      </div>
    </div>
  );
};
