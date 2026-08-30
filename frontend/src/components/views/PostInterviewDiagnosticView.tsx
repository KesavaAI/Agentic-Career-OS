import React, { useState } from 'react';
import { 
  Award, AlertTriangle, CheckCircle2, Play, FileText, 
  HelpCircle, RotateCcw, ChevronDown, ChevronUp, Sparkles, 
  ArrowRight, X, Volume2, Video, StopCircle, User, Zap, Clock, Target 
} from 'lucide-react';

interface PostInterviewDiagnosticViewProps {
  report: any;
  onPracticeAgain: (questionNumber?: number) => void;
  onDone: () => void;
}

export const PostInterviewDiagnosticView: React.FC<PostInterviewDiagnosticViewProps> = ({
  report,
  onPracticeAgain,
  onDone
}) => {
  const [activeTabTurn, setActiveTabTurn] = useState(1);
  const [showWeakModal, setShowWeakModal] = useState(false);
  const [showTranscriptModal, setShowTranscriptModal] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const pillars = report?.mercor_pillars || {
    ownership_score: 82,
    technical_depth_score: 80,
    compression_score: 85,
    quantified_impact_score: 75
  };

  const turnsList = report?.turn_breakdowns || report?.question_breakdowns || [];
  const activeTurn = turnsList.find((t: any) => (t.turn_number || t.question_number) === activeTabTurn) || 
    turnsList[0] || {
      turn_number: 1,
      question: "Tell me about a challenging technical project you owned end-to-end. Walk me through the architecture and the hardest technical decision you made.",
      candidate_answer: "(No spoken answer recorded)",
      telemetry: {
        ownership_score: 80,
        depth_label: "Layer 2: Technical Trade-Offs",
        compression_rating: "Optimal (<90s)",
        quantified_metrics_count: 1
      },
      why_was_this_weak: "Your answer focused heavily on high-level tooling. To rank in the top 5% of Mercor candidates, articulate the specific trade-offs (e.g. why Redis over Memcached) and quantify your impact with latency numbers.",
      ideal_star_rewrite: {
        situation: "At my previous company, our real-time notification service faced cascading bottlenecks during traffic spikes.",
        task: "I was tasked with redesigning the ingestion pipeline to support 50,000 concurrent websocket connections.",
        action: "I implemented a Redis pub/sub cluster with connection pooling and automated backpressure buffers.",
        result: "Reduced P99 latency from 450ms to 12ms and eliminated 100% of connection timeout drops."
      }
    };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-purple-950/40 to-slate-900 border border-purple-500/30 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-black px-2.5 py-1 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase tracking-wider">
            Mercor AI Autonomous Interview Scorecard
          </span>
          <h2 className="text-2xl font-black text-slate-100 mt-2">
            {report?.company?.toUpperCase() || 'ACME'} — {report?.target_role?.toUpperCase() || 'FULL STACK ENGINEER'}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            4-Pillar Evaluation: Ownership, Technical Depth, Compression & Quantified Impact
          </p>
        </div>

        <div className="flex items-center gap-4 bg-slate-950/70 p-4 rounded-xl border border-slate-800">
          <div className="text-center">
            <p className="text-[10px] font-bold text-slate-500 uppercase">Mercor Score</p>
            <p className="text-3xl font-black text-emerald-400 mt-0.5">
              {report?.overall_score || 78}/100
            </p>
          </div>
          <div className="h-10 w-px bg-slate-800" />
          <div className="text-left text-xs">
            <p className="font-bold text-slate-200">{report?.rating_tier || 'Top 10% Mercor Pool'}</p>
            <p className="text-[11px] text-emerald-400">High-Probability Placement</p>
          </div>
        </div>
      </div>

      {/* 🔬 MERCOR 4-PILLAR RUBRIC CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {/* 1. Ownership */}
        <div className="p-4 rounded-xl bg-slate-900 border border-indigo-500/30 shadow-md space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase">1. Individual Ownership</span>
            <User className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-black text-indigo-300">{pillars.ownership_score}%</p>
          <p className="text-[11px] text-slate-400">'I' vs 'We' Pronoun Density</p>
        </div>

        {/* 2. Technical Depth */}
        <div className="p-4 rounded-xl bg-slate-900 border border-amber-500/30 shadow-md space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase">2. Technical Depth</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-amber-300">{pillars.technical_depth_score}%</p>
          <p className="text-[11px] text-slate-400">3-Layers Deep (Scale/Trade-offs)</p>
        </div>

        {/* 3. Compression */}
        <div className="p-4 rounded-xl bg-slate-900 border border-emerald-500/30 shadow-md space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase">3. Compression</span>
            <Clock className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-emerald-300">{pillars.compression_score}%</p>
          <p className="text-[11px] text-slate-400">Fluff-Free (&lt;90s Answers)</p>
        </div>

        {/* 4. Quantified Impact */}
        <div className="p-4 rounded-xl bg-slate-900 border border-purple-500/30 shadow-md space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase">4. Quantified Impact</span>
            <Target className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-black text-purple-300">{pillars.quantified_impact_score}%</p>
          <p className="text-[11px] text-slate-400">Before & After Metrics (%, ms, $)</p>
        </div>
      </div>

      {/* Strengths & Critical Warnings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Strengths */}
        <div className="p-5 rounded-xl bg-slate-900 border border-emerald-500/30 shadow-md space-y-3">
          <div className="flex items-center gap-2 text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            <h3 className="text-xs font-extrabold uppercase tracking-wider">Identified Mercor Strengths</h3>
          </div>
          <ul className="space-y-2 text-xs text-slate-200 font-medium">
            {(report?.strengths || [
              "✓ Exceptional individual ownership ('I' phrasing vs 'We')",
              "✓ Strong Layer-3 Production Depth (concurrency & trade-offs)"
            ]).map((s: string, i: number) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">{s}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Critical Warnings */}
        <div className="p-5 rounded-xl bg-slate-900 border border-amber-500/30 shadow-md space-y-3">
          <div className="flex items-center gap-2 text-amber-400">
            <AlertTriangle className="w-4 h-4" />
            <h3 className="text-xs font-extrabold uppercase tracking-wider">Mercor Areas to Optimize</h3>
          </div>
          <ul className="space-y-2 text-xs text-slate-200 font-medium">
            {(report?.warnings || [
              "⚠ Quantify metrics more aggressively with before-and-after numbers",
              "⚠ Address distributed failure modes in 10x traffic spikes"
            ]).map((w: string, i: number) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-amber-300 font-bold">{w}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Turn Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {turnsList.map((t: any, i: number) => {
          const tNum = t.turn_number || t.question_number || (i + 1);
          const isActive = activeTabTurn === tNum;
          return (
            <button
              key={tNum}
              onClick={() => setActiveTabTurn(tNum)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Adaptive Turn {tNum}
            </button>
          );
        })}
      </div>

      {/* Turn Inspector Card */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase">
              Adaptive Turn {activeTurn.turn_number || activeTurn.question_number || 1} • {activeTurn.phase || 'Technical Cross-Examination'}
            </span>
          </div>
          <h3 className="text-lg font-bold text-slate-100">
            "{activeTurn.question}"
          </h3>
        </div>

        {/* Candidate Recorded Transcript Box */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-1">
          <p className="font-bold text-slate-400 uppercase text-[10px]">Your Spoken Response:</p>
          <p className="italic">
            {activeTurn.candidate_answer || "(No speech recorded for this turn)"}
          </p>
        </div>

        {/* 4 Action Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
          <button
            onClick={() => setIsPlayingAudio(!isPlayingAudio)}
            className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer ${
              isPlayingAudio 
                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                : 'bg-slate-950 hover:bg-slate-800 border-slate-800 text-slate-200'
            }`}
          >
            <Play className={`w-4 h-4 ${isPlayingAudio ? 'fill-emerald-400 text-emerald-400' : ''}`} />
            <span>{isPlayingAudio ? 'Playing Audio...' : '▶ WATCH / LISTEN'}</span>
          </button>

          <button
            onClick={() => setShowTranscriptModal(true)}
            className="p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer"
          >
            <FileText className="w-4 h-4 text-blue-400" />
            <span>View Transcript</span>
          </button>

          <button
            onClick={() => setShowWeakModal(true)}
            className="p-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 flex items-center justify-center gap-2 text-xs font-extrabold transition-all cursor-pointer shadow-lg shadow-amber-500/10"
          >
            <HelpCircle className="w-4 h-4" />
            <span>Why was this weak?</span>
          </button>

          <button
            onClick={() => onPracticeAgain(activeTurn.turn_number || 1)}
            className="p-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center gap-2 text-xs font-black transition-all cursor-pointer shadow-lg shadow-purple-600/20"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Practice Turn Again</span>
          </button>
        </div>

        {isPlayingAudio && (
          <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/30 flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <Volume2 className="w-5 h-5 text-emerald-400 animate-pulse" />
              <div>
                <p className="font-bold text-slate-200">Replaying Turn ({activeTurn.duration_seconds || 30}s)</p>
                <p className="text-[11px] text-slate-400">"{activeTurn.candidate_answer}"</p>
              </div>
            </div>
            <button onClick={() => setIsPlayingAudio(false)} className="text-[11px] text-slate-400 hover:text-slate-200 underline">Stop</button>
          </div>
        )}
      </div>

      {/* Done & Return */}
      <div className="flex items-center justify-end gap-3 pt-4">
        <button
          onClick={onDone}
          className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold border border-slate-800 cursor-pointer"
        >
          Return to Dashboard
        </button>
      </div>

      {/* MODAL: WHY WAS THIS WEAK */}
      {showWeakModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl relative">
            <button onClick={() => setShowWeakModal(false)} className="absolute top-4 right-4 text-slate-500 hover:text-slate-200">
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-amber-400">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="text-base font-extrabold">Mercor Forensic Critique</h3>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 leading-relaxed">
              <p className="font-bold text-amber-300 mb-1">Mercor Evaluator Analysis:</p>
              {activeTurn.why_was_this_weak || "Ensure you articulate specific trade-offs and quantify before-and-after results."}
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-extrabold uppercase text-emerald-400 tracking-wider">
                Ideal Top-1% Mercor Candidate Response:
              </h4>
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="font-bold text-indigo-400">Situation: </span>
                  <span className="text-slate-300">{activeTurn.ideal_star_rewrite?.situation}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="font-bold text-blue-400">Task: </span>
                  <span className="text-slate-300">{activeTurn.ideal_star_rewrite?.task}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="font-bold text-amber-400">Action: </span>
                  <span className="text-slate-300">{activeTurn.ideal_star_rewrite?.action}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-emerald-500/40">
                  <span className="font-bold text-emerald-400">Result: </span>
                  <span className="text-slate-200 font-semibold">{activeTurn.ideal_star_rewrite?.result}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setShowWeakModal(false);
                  onPracticeAgain(activeTurn.turn_number || 1);
                }}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs flex items-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Practice Turn {activeTurn.turn_number || 1} Again</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: TRANSCRIPT */}
      {showTranscriptModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl relative">
            <button onClick={() => setShowTranscriptModal(false)} className="absolute top-4 right-4 text-slate-500 hover:text-slate-200">
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-blue-400">
              <FileText className="w-5 h-5" />
              <h3 className="text-base font-extrabold">Turn Word-by-Word Transcript</h3>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 leading-relaxed font-sans max-h-60 overflow-y-auto">
              "{activeTurn.candidate_answer}"
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
