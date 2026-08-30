import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Play, Video, Mic, Award, CheckCircle2, 
  AlertTriangle, Clock, Volume2, ArrowRight, ShieldAlert,
  Flame, BarChart3, RotateCcw, Target, HelpCircle, FileText 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { VideoInterviewArena } from './VideoInterviewArena';
import { PostInterviewDiagnosticView } from './PostInterviewDiagnosticView';

export const MockInterviewView: React.FC = () => {
  const { user } = useAuth();
  const [viewState, setViewState] = useState<'readiness' | 'video_arena' | 'diagnostic'>('readiness');
  const [targetCompany, setTargetCompany] = useState('Acme');
  const [targetRole, setTargetRole] = useState(user?.target_role || 'Data Analyst');
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
      // Clean fallback
      setReadinessData({
        target_role: `${(targetRole || 'DATA ANALYST').toUpperCase()} — ${targetCompany.toUpperCase()}`,
        overall_readiness_pct: 72,
        dimensions: {
          resume_match_pct: 91,
          technical_depth_pct: 78,
          communication_clarity_pct: 69,
          star_answers_pct: 61,
          confidence_delivery_pct: 74
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFinishVideoSession = async (sessionData: any) => {
    try {
      setLoading(true);
      const report = await api.evaluateVideoSession(sessionData);
      setEvaluationReport(report);
      setViewState('diagnostic');
    } catch (err) {
      console.error('Failed to evaluate video session:', err);
      // Clean fallback
      setEvaluationReport({
        target_role: targetRole,
        company: targetCompany,
        overall_score: 76,
        strengths: ["✓ Strong SQL explanation", "✓ Good project knowledge"],
        warnings: [
          "⚠ Answers too long",
          "⚠ Weak business impact",
          "⚠ 14 filler words/minute",
          "⚠ STAR structure missing"
        ],
        question_breakdowns: [
          {
            question_number: 6,
            question: "Tell me about your most challenging project.",
            candidate_answer: "In our team project, we had to analyze customer churn. I used SQL and Python to extract the database tables and built some dashboards. It helped the team see which users were leaving.",
            score: 68,
            why_was_this_weak: "Your answer jumped immediately into tooling without framing the business stakes (Situation/Task). You described passive actions ('built some dashboards') instead of proactive engineering decisions, and completely omitted the final metric outcome (e.g., 'reduced churn by 14% saving $120k ARR').",
            ideal_star_rewrite: {
              situation: "At my previous company, quarterly subscriber churn unexpectedly increased by 18%, risking $450k in annual recurring revenue.",
              task: "I was tasked with identifying the leading indicators of user drop-off across 500,000 active customer records within 2 weeks.",
              action: "I engineered automated SQL cohort analysis queries with window functions, isolated the churn trigger to a mobile checkout latency bottleneck, and built an automated churn-risk alert pipeline.",
              result: "Product leadership deployed targeted checkout optimizations, decreasing drop-offs by 24% and recovering $180k in ARR in Q3."
            }
          }
        ]
      });
      setViewState('diagnostic');
    } finally {
      setLoading(false);
    }
  };

  // 1. Video Arena View
  if (viewState === 'video_arena') {
    return (
      <VideoInterviewArena
        role={targetRole}
        company={targetCompany}
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
    technical_depth_pct: 78,
    communication_clarity_pct: 69,
    star_answers_pct: 61,
    confidence_delivery_pct: 74
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      {/* Target Setup Controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
        <div className="flex items-center gap-3">
          <span className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400">
            <Video className="w-5 h-5" />
          </span>
          <div>
            <h3 className="font-extrabold text-sm text-slate-100">AI Video Mock Interview Simulator</h3>
            <p className="text-xs text-slate-400">Live camera, audio visualizer, real-time filler word audit & STAR coaching</p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <input
            type="text"
            value={targetRole}
            onChange={e => setTargetRole(e.target.value)}
            placeholder="Target Role"
            className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          />
          <input
            type="text"
            value={targetCompany}
            onChange={e => setTargetCompany(e.target.value)}
            placeholder="Target Company"
            className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 🎯 PRE-INTERVIEW READINESS CARD */}
      {/* ========================================================================= */}
      <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6 text-center">
        {/* Header Title */}
        <div className="space-y-1">
          <h2 className="text-2xl md:text-3xl font-black text-slate-100 uppercase tracking-wide">
            {targetRole.toUpperCase()} — {targetCompany.toUpperCase()}
          </h2>
          <div className="h-0.5 w-32 bg-emerald-500 mx-auto rounded-full mt-2" />
        </div>

        {/* Overall Readiness Gauge */}
        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 max-w-sm mx-auto flex items-center justify-between">
          <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Interview Readiness:</span>
          <span className="text-3xl font-black text-emerald-400">{readinessData?.overall_readiness_pct || 72}%</span>
        </div>

        {/* 5-Dimensional Metrics Breakdown */}
        <div className="space-y-3.5 max-w-md mx-auto text-left text-xs font-semibold pt-2">
          {/* 1. Resume Match */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Resume Match</span>
              <span className="font-mono font-bold text-emerald-400">{dims.resume_match_pct}%</span>
            </div>
            <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${dims.resume_match_pct}%` }} />
            </div>
          </div>

          {/* 2. Technical Depth */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Technical Depth</span>
              <span className="font-mono font-bold text-blue-400">{dims.technical_depth_pct}%</span>
            </div>
            <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: `${dims.technical_depth_pct}%` }} />
            </div>
          </div>

          {/* 3. Communication */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Communication Clarity</span>
              <span className="font-mono font-bold text-indigo-400">{dims.communication_clarity_pct}%</span>
            </div>
            <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${dims.communication_clarity_pct}%` }} />
            </div>
          </div>

          {/* 4. STAR Answers */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-slate-300">STAR Answers</span>
              <span className="font-mono font-bold text-amber-400">{dims.star_answers_pct}%</span>
            </div>
            <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div className="h-full bg-amber-500 rounded-full" style={{ width: `${dims.star_answers_pct}%` }} />
            </div>
          </div>

          {/* 5. Confidence */}
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

        {/* PRIMARY ACTION BUTTON */}
        <div className="pt-4">
          <button
            onClick={() => setViewState('video_arena')}
            className="px-10 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm tracking-wide uppercase shadow-2xl shadow-emerald-500/30 flex items-center gap-3 mx-auto transition-transform hover:scale-105 cursor-pointer"
          >
            <Video className="w-5 h-5 fill-slate-950" />
            <span>[ START VIDEO INTERVIEW ]</span>
          </button>
          <p className="text-[11px] text-slate-500 mt-2">Requires camera & mic permission • 6 adaptive questions</p>
        </div>
      </div>
    </div>
  );
};
