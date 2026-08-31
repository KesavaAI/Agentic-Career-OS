import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Play, Video, Mic, Award, CheckCircle2, 
  AlertTriangle, Clock, Volume2, ArrowRight, ShieldAlert,
  Flame, BarChart3, RotateCcw, Target, HelpCircle, FileText,
  Headphones, MessageSquare, UserCheck, Terminal, ShieldCheck 
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
  const [selectedMode, setSelectedMode] = useState<'video' | 'voice' | 'text'>('video');

  const [readinessData, setReadinessData] = useState<any>(null);
  const [evaluationReport, setEvaluationReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);

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
            <p className="text-xs text-slate-400">Tag-team evaluation by Sarah Jenkins (VP Talent) & David Vance (Staff Architect)</p>
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
      {/* 🎯 PRE-INTERVIEW READINESS & PANEL BRIEFING */}
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
              <p className="text-[10px] text-slate-400">Concurrency, Scale & Whiteboard</p>
            </div>
          </div>
        </div>

        {/* Overall Readiness Gauge */}
        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 max-w-sm mx-auto flex items-center justify-between">
          <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Interview Readiness:</span>
          <span className="text-3xl font-black text-emerald-400">{readinessData?.overall_readiness_pct || 76}%</span>
        </div>

        {/* 5-Dimensional Metrics Breakdown */}
        <div className="space-y-3 max-w-md mx-auto text-left text-xs font-semibold pt-1">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Resume & Project Match</span>
              <span className="font-mono font-bold text-emerald-400">{dims.resume_match_pct}%</span>
            </div>
            <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${dims.resume_match_pct}%` }} />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Technical Depth (Scale & Locks)</span>
              <span className="font-mono font-bold text-blue-400">{dims.technical_depth_pct}%</span>
            </div>
            <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: `${dims.technical_depth_pct}%` }} />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Communication Compression (&lt;90s)</span>
              <span className="font-mono font-bold text-indigo-400">{dims.communication_clarity_pct}%</span>
            </div>
            <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${dims.communication_clarity_pct}%` }} />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-slate-300">STAR Structure & Ownership</span>
              <span className="font-mono font-bold text-amber-400">{dims.star_answers_pct}%</span>
            </div>
            <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div className="h-full bg-amber-500 rounded-full" style={{ width: `${dims.star_answers_pct}%` }} />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Confidence & Delivery</span>
              <span className="font-mono font-bold text-purple-400">{dims.confidence_delivery_pct}%</span>
            </div>
            <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div className="h-full bg-purple-500 rounded-full" style={{ width: `${dims.confidence_delivery_pct}%` }} />
            </div>
          </div>
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
              <span className="text-xs font-bold">🎥 Video + Whiteboard</span>
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
            Sarah & David speak aloud • Real-time Physics Radar & Whiteboard • Stop at any time
          </p>
        </div>
      </div>
    </div>
  );
};
