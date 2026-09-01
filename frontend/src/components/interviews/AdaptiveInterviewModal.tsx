import React, { useState, useEffect } from 'react';
import {
  X, Mic, Send, Sparkles, CheckCircle2, AlertTriangle, ShieldCheck, Trophy,
  Bot, User, ArrowRight, RefreshCw, BarChart2, Zap, Layers, Award, FileText
} from 'lucide-react';
import { api } from '../../lib/api';

interface AdaptiveInterviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetJobId?: number;
  targetJobRole?: string;
  targetCompany?: string;
}

export const AdaptiveInterviewModal: React.FC<AdaptiveInterviewModalProps> = ({
  isOpen,
  onClose,
  targetJobId,
  targetJobRole = "Target Role",
  targetCompany = "Target Company"
}) => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(targetJobId || null);
  
  const [stage, setStage] = useState<'setup' | 'interview' | 'report'>('setup');
  const [loadingPlan, setLoadingPlan] = useState<boolean>(false);
  const [plan, setPlan] = useState<any | null>(null);
  
  const [messages, setMessages] = useState<Array<{ role: 'interviewer' | 'user'; content: string }>>([]);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [submittingTurn, setSubmittingTurn] = useState<boolean>(false);
  
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState<number>(0);
  const [isFollowUp, setIsFollowUp] = useState<boolean>(false);
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [latestTurnEval, setLatestTurnEval] = useState<any | null>(null);
  const [finalReport, setFinalReport] = useState<any | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadJobs();
    }
  }, [isOpen, targetJobId]);

  const loadJobs = async () => {
    try {
      const data = await api.getJobs();
      setJobs(data || []);
      if (targetJobId) {
        setSelectedJobId(targetJobId);
      } else if (data && data.length > 0) {
        setSelectedJobId(data[0].id);
      }
    } catch (err) {
      console.error('Failed to load jobs for screening interview:', err);
    }
  };

  const handleStartSession = async () => {
    if (!selectedJobId) {
      alert('Please select a target job opening.');
      return;
    }

    try {
      setLoadingPlan(true);
      const planRes = await api.generateScreeningPlan({ job_id: selectedJobId });
      setPlan(planRes);
      
      const initialQuestion = planRes.plan_questions[0].question;
      const initialCategory = planRes.plan_questions[0].category;
      
      setMessages([
        {
          role: 'interviewer',
          content: `Welcome to your AI Candidate Technical Screening for **${planRes.role_title}** at **${planRes.company_name}**!

I am your AI Interviewer. We will cover 5 key categories today, beginning with **${initialCategory}**.

${initialQuestion}`
        }
      ]);
      
      setStage('interview');
      setCurrentQuestionIdx(0);
      setEvaluations([]);
      setFinalReport(null);
    } catch (err: any) {
      alert('Failed to generate interview plan: ' + err.message);
    } finally {
      setLoadingPlan(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!userAnswer.trim() || submittingTurn || !selectedJobId || !plan) return;

    const newMessages = [...messages, { role: 'user' as const, content: userAnswer.trim() }];
    setMessages(newMessages);
    setUserAnswer('');
    setSubmittingTurn(true);

    try {
      const turnRes = await api.processScreeningTurn({
        job_id: selectedJobId,
        messages: newMessages,
        current_question_idx: currentQuestionIdx,
        plan: plan,
        evaluations: evaluations
      });

      setCurrentQuestionIdx(turnRes.current_question_idx);
      setIsFollowUp(turnRes.is_follow_up);
      setLatestTurnEval(turnRes.turn_eval);
      
      const newEvals = [...evaluations, turnRes.turn_eval];
      setEvaluations(newEvals);

      if (turnRes.is_finished) {
        setMessages([...newMessages, { role: 'interviewer', content: turnRes.next_interviewer_text }]);
        setFinalReport(turnRes.final_report);
        setStage('report');
      } else {
        setMessages([...newMessages, { role: 'interviewer', content: turnRes.next_interviewer_text }]);
      }
    } catch (err: any) {
      alert('Failed to process interview turn: ' + err.message);
    } finally {
      setSubmittingTurn(false);
    }
  };

  if (!isOpen) return null;

  const currentPlanQuestion = plan?.plan_questions[currentQuestionIdx];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-slate-900 border border-slate-700/60 rounded-2xl shadow-2xl shadow-indigo-950/50 text-slate-100 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-600/20 border border-indigo-500/30 text-indigo-400">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-wide">AI Candidate Screening & Adaptive Interview</h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-950/80 text-indigo-300 border border-indigo-800/40 font-semibold">
                  Prompt 8 Resume Defense Engine
                </span>
              </div>
              <p className="text-xs text-slate-400">Adaptive technical screening personalized to job requirements & candidate resume</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stage 1: Setup */}
        {stage === 'setup' && (
          <div className="p-8 space-y-6">
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>Configure Adaptive Screening Session</span>
              </h3>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1.5">Select Target Job Opening:</label>
                <select
                  value={selectedJobId || ''}
                  onChange={(e) => setSelectedJobId(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  {jobs.map(j => (
                    <option key={j.id} value={j.id}>{j.role} at {j.company_name}</option>
                  ))}
                </select>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs text-slate-300 space-y-2">
                <span className="font-bold text-indigo-300">What will be covered in this screening?</span>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-slate-400 pt-1">
                  <li className="flex items-center gap-1.5">✓ <strong>Resume Defense:</strong> Architecture & project deep-dives</li>
                  <li className="flex items-center gap-1.5">✓ <strong>Technical Knowledge:</strong> Framework & stack trade-offs</li>
                  <li className="flex items-center gap-1.5">✓ <strong>System Design:</strong> Scalability & 10x traffic spikes</li>
                  <li className="flex items-center gap-1.5">✓ <strong>Adaptive Follow-ups:</strong> Questions adapt based on your answers</li>
                </ul>
              </div>

              <button
                onClick={handleStartSession}
                disabled={loadingPlan}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                {loadingPlan ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Extracting Resume Claims & Generating Interview Plan...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>🚀 Launch AI Technical Screening Session</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Stage 2: Live Interview */}
        {stage === 'interview' && plan && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Progress & Category Banner */}
            <div className="px-6 py-3 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-indigo-400">Category {currentQuestionIdx + 1} of {plan.total_questions}:</span>
                <span className="text-slate-200 font-semibold">{currentPlanQuestion?.category || 'Technical Assessment'}</span>
                {isFollowUp && (
                  <span className="px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800/40 text-[10px] font-bold">
                    ⚡ Adaptive Follow-Up Probe
                  </span>
                )}
              </div>

              {latestTurnEval && (
                <div className="flex items-center gap-2 font-mono text-[11px]">
                  <span className="text-emerald-400">Tech: {latestTurnEval.technical_score}%</span>
                  <span className="text-cyan-400">Comm: {latestTurnEval.communication_score}%</span>
                </div>
              )}
            </div>

            {/* Chat Transcript Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex gap-3 text-xs leading-relaxed ${
                    m.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {m.role === 'interviewer' && (
                    <div className="p-2 rounded-xl bg-indigo-950 border border-indigo-800/40 text-indigo-400 self-start shrink-0">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[82%] p-4 rounded-2xl whitespace-pre-wrap ${
                      m.role === 'user'
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-tr-none'
                        : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none'
                    }`}
                  >
                    {m.content}
                  </div>

                  {m.role === 'user' && (
                    <div className="p-2 rounded-xl bg-purple-950 border border-purple-800/40 text-purple-400 self-start shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Input Box */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/90 flex gap-2">
              <textarea
                rows={2}
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Type your technical answer here (include architectural trade-offs, metrics, or SLAs)..."
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 resize-none font-mono"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmitAnswer();
                  }
                }}
              />
              <button
                onClick={handleSubmitAnswer}
                disabled={submittingTurn || !userAnswer.trim()}
                className="px-5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs rounded-xl shadow-lg transition disabled:opacity-50 flex items-center justify-center cursor-pointer"
              >
                {submittingTurn ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}

        {/* Stage 3: Final Report Dossier */}
        {stage === 'report' && finalReport && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
            {/* Overall Performance Badge */}
            <div className="p-6 rounded-2xl bg-slate-950 border border-indigo-500/40 flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">FINAL AI CANDIDATE SCREENING REPORT</span>
                <h3 className="text-xl font-extrabold text-white mt-1">{finalReport.role_title} at {finalReport.company_name}</h3>
                <p className="text-xs text-emerald-400 font-bold mt-1">{finalReport.role_readiness}</p>
              </div>

              <div className="flex items-center gap-4 text-center">
                <div className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-2xl font-extrabold text-indigo-400">{finalReport.technical_score}%</span>
                  <span className="block text-[10px] text-slate-400 font-semibold">Technical</span>
                </div>
                <div className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-2xl font-extrabold text-cyan-400">{finalReport.communication_score}%</span>
                  <span className="block text-[10px] text-slate-400 font-semibold">Communication</span>
                </div>
                <div className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-2xl font-extrabold text-purple-400">{finalReport.problem_solving_score}%</span>
                  <span className="block text-[10px] text-slate-400 font-semibold">Problem Solving</span>
                </div>
              </div>
            </div>

            {/* Strengths & Weaknesses Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-xl bg-slate-950 border border-emerald-500/30 space-y-2">
                <h4 className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Demonstrated Strengths</span>
                </h4>
                <ul className="space-y-1.5 text-slate-300">
                  {finalReport.strengths.map((s: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-5 rounded-xl bg-slate-950 border border-amber-500/30 space-y-2">
                <h4 className="font-bold text-amber-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Identified Technical Gaps</span>
                </h4>
                <ul className="space-y-1.5 text-slate-300">
                  {finalReport.weaknesses.map((w: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-amber-400 font-bold">•</span>
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Recommended Action Plan */}
            <div className="p-5 rounded-xl bg-slate-950 border border-indigo-500/30 space-y-2">
              <h4 className="font-bold text-indigo-300 flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-indigo-400" />
                <span>Recommended Technical Improvements</span>
              </h4>
              <ul className="space-y-1.5 text-slate-300">
                {finalReport.recommended_improvements.map((imp: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <ArrowRight className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                    <span>{imp}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Simulation Disclaimer Notice */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-500 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>{finalReport.disclaimer}</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
