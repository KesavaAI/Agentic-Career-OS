import React, { useState } from 'react';
import { 
  Award, AlertTriangle, CheckCircle2, Play, FileText, 
  HelpCircle, RotateCcw, ChevronDown, ChevronUp, Sparkles, 
  ArrowRight, X, Volume2, Video, StopCircle 
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
  const [activeTabQ, setActiveTabQ] = useState(1);
  const [showWeakModal, setShowWeakModal] = useState(false);
  const [showTranscriptModal, setShowTranscriptModal] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const questionsList = report?.question_breakdowns || [];
  const activeQuestion = questionsList.find((q: any) => q.question_number === activeTabQ) || 
    questionsList[0] || {
      question_number: 1,
      question: "Tell me about yourself and walk me through your technical background.",
      candidate_answer: "(No spoken answer recorded)",
      score: 45,
      why_was_this_weak: "No verbal response was detected by the microphone. Click 'Practice Again' and speak your response into the microphone or type in the transcription box.",
      ideal_star_rewrite: {
        situation: "At my previous company, quarterly subscriber churn unexpectedly increased by 18%, risking $450k in annual recurring revenue.",
        task: "I was tasked with identifying the leading indicators of user drop-off across 500,000 active customer records within 2 weeks.",
        action: "I engineered automated SQL cohort analysis queries with window functions, isolated the churn trigger to a mobile checkout latency bottleneck, and built an automated churn-risk alert pipeline.",
        result: "Product leadership deployed targeted checkout optimizations, decreasing drop-offs by 24% and recovering $180k in ARR in Q3."
      }
    };

  const hasNoSpeech = report?.rating_tier === "No Speech Recorded" || report?.overall_score <= 50;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-extrabold px-2.5 py-1 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-wider">
            Post-Session Forensic Diagnostic
          </span>
          <h2 className="text-2xl font-black text-slate-100 mt-2">
            {report?.company?.toUpperCase() || 'ACME'} — {report?.target_role?.toUpperCase() || 'DATA ANALYST'}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Full AI behavioral, technical depth, and STAR structural audit.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
          <div className="text-center">
            <p className="text-[10px] font-bold text-slate-500 uppercase">Overall Score</p>
            <p className={`text-3xl font-black mt-0.5 ${hasNoSpeech ? 'text-amber-400' : 'text-emerald-400'}`}>
              {report?.overall_score || 76}/100
            </p>
          </div>
          <div className="h-10 w-px bg-slate-800" />
          <div className="text-left text-xs">
            <p className="font-bold text-slate-200">{report?.rating_tier || 'Competitive Candidate'}</p>
            <p className="text-[11px] text-slate-400">{hasNoSpeech ? 'Practice with Mic Active' : 'Top 15% Candidate Pool'}</p>
          </div>
        </div>
      </div>

      {/* Strengths & Critical Warnings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Strengths */}
        <div className="p-5 rounded-xl bg-slate-900 border border-emerald-500/30 shadow-md space-y-3">
          <div className="flex items-center gap-2 text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            <h3 className="text-xs font-extrabold uppercase tracking-wider">Key Strengths Identified</h3>
          </div>
          <ul className="space-y-2 text-xs text-slate-200 font-medium">
            {(report?.strengths || [
              "✓ Strong SQL explanation",
              "✓ Good project knowledge"
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
            <h3 className="text-xs font-extrabold uppercase tracking-wider">Critical Areas to Fix (Warnings)</h3>
          </div>
          <ul className="space-y-2 text-xs text-slate-200 font-medium">
            {(report?.warnings || [
              "⚠ Answers too long",
              "⚠ Weak business impact",
              "⚠ 14 filler words/minute",
              "⚠ STAR structure missing"
            ]).map((w: string, i: number) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-amber-300 font-bold">{w}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Question Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {questionsList.map((q: any, i: number) => {
          const qNum = q.question_number || (i + 1);
          const isActive = activeTabQ === qNum;
          return (
            <button
              key={qNum}
              onClick={() => setActiveTabQ(qNum)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Question {qNum} {qNum === 6 ? '⚠️ Focus' : ''}
            </button>
          );
        })}
      </div>

      {/* Question Diagnostic Card */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
              Question {activeQuestion.question_number}
            </span>
            <span className="text-xs font-bold text-amber-400">
              Score: {activeQuestion.score || 68}/100
            </span>
          </div>
          <h3 className="text-lg font-bold text-slate-100">
            "{activeQuestion.question}"
          </h3>
        </div>

        {/* Candidate Recorded Transcript Box */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-1">
          <p className="font-bold text-slate-400 uppercase text-[10px]">Your Answer:</p>
          <p className="italic">
            {activeQuestion.candidate_answer || "(No speech recorded for this question)"}
          </p>
        </div>

        {/* 4 Interactive Action Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
          {/* 1. Watch / Listen Answer */}
          <button
            onClick={() => setIsPlayingAudio(!isPlayingAudio)}
            className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer ${
              isPlayingAudio 
                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                : 'bg-slate-950 hover:bg-slate-800 border-slate-800 text-slate-200'
            }`}
          >
            <Play className={`w-4 h-4 ${isPlayingAudio ? 'fill-emerald-400 text-emerald-400' : ''}`} />
            <span>{isPlayingAudio ? 'Playing Answer...' : '▶ WATCH YOUR ANSWER'}</span>
          </button>

          {/* 2. View Transcript */}
          <button
            onClick={() => setShowTranscriptModal(true)}
            className="p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer"
          >
            <FileText className="w-4 h-4 text-blue-400" />
            <span>View Transcript</span>
          </button>

          {/* 3. Why was this weak? */}
          <button
            onClick={() => setShowWeakModal(true)}
            className="p-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 flex items-center justify-center gap-2 text-xs font-extrabold transition-all cursor-pointer shadow-lg shadow-amber-500/10"
          >
            <HelpCircle className="w-4 h-4" />
            <span>Why was this weak?</span>
          </button>

          {/* 4. Practice Again */}
          <button
            onClick={() => onPracticeAgain(activeQuestion.question_number)}
            className="p-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center justify-center gap-2 text-xs font-black transition-all cursor-pointer shadow-lg shadow-emerald-500/20"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Practice Again</span>
          </button>
        </div>

        {/* Inline Audio Player Preview */}
        {isPlayingAudio && (
          <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/30 flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <Volume2 className="w-5 h-5 text-emerald-400 animate-pulse" />
              <div>
                <p className="font-bold text-slate-200">Replaying Candidate Answer ({activeQuestion.duration_seconds || 30}s)</p>
                <p className="text-[11px] text-slate-400">"{activeQuestion.candidate_answer}"</p>
              </div>
            </div>
            <button 
              onClick={() => setIsPlayingAudio(false)} 
              className="text-[11px] text-slate-400 hover:text-slate-200 underline"
            >
              Stop
            </button>
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

      {/* ========================================================================= */}
      {/* ⚠️ MODAL: 'WHY WAS THIS WEAK?' & STAR REWRITE */}
      {/* ========================================================================= */}
      {showWeakModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setShowWeakModal(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-amber-400">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="text-base font-extrabold">Forensic Diagnostic: Why was this answer weak?</h3>
            </div>

            {/* Critique Breakdown */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 leading-relaxed">
              <p className="font-bold text-amber-300 mb-1">AI Evaluator Critique:</p>
              {activeQuestion.why_was_this_weak}
            </div>

            {/* Ideal Google STAR Rewrite */}
            <div className="space-y-2">
              <h4 className="text-xs font-extrabold uppercase text-emerald-400 tracking-wider">
                Ideal Google STAR Rewrite (Grounded in Your Project):
              </h4>
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="font-bold text-indigo-400">Situation: </span>
                  <span className="text-slate-300">{activeQuestion.ideal_star_rewrite?.situation}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="font-bold text-blue-400">Task: </span>
                  <span className="text-slate-300">{activeQuestion.ideal_star_rewrite?.task}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="font-bold text-amber-400">Action: </span>
                  <span className="text-slate-300">{activeQuestion.ideal_star_rewrite?.action}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-emerald-500/40">
                  <span className="font-bold text-emerald-400">Result: </span>
                  <span className="text-slate-200 font-semibold">{activeQuestion.ideal_star_rewrite?.result}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setShowWeakModal(false);
                  onPracticeAgain(activeQuestion.question_number);
                }}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Practice Question {activeQuestion.question_number} Again</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 📄 MODAL: FULL WORD-BY-WORD TRANSCRIPT */}
      {/* ========================================================================= */}
      {showTranscriptModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setShowTranscriptModal(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-blue-400">
              <FileText className="w-5 h-5" />
              <h3 className="text-base font-extrabold">Word-by-Word Answer Transcript</h3>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 leading-relaxed font-sans max-h-60 overflow-y-auto">
              "{activeQuestion.candidate_answer}"
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
              <span>Duration: {activeQuestion.duration_seconds || 30}s</span>
              <span className="text-amber-400 font-bold">{activeQuestion.filler_count || 0} filler words detected</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
