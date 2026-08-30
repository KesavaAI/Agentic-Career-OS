import React, { useState } from 'react';
import { Bot, Sparkles, ShieldCheck, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { api } from '../../lib/api';

export const CareerAgentView: React.FC = () => {
  const [jdInput, setJdInput] = useState(`Role: GenAI Platform Engineer\nCompany: Microsoft India\nRequirements: Python, LangGraph, RAG, Azure OpenAI, Vector Databases, FastAPI.\nSalary: 24-36 LPA.\nExperience: 1-4 years.`);
  const [agentState, setAgentState] = useState<any | null>(null);
  const [running, setRunning] = useState(false);
  const [approvalMsg, setApprovalMsg] = useState<string | null>(null);

  const handleRunPipeline = async () => {
    try {
      setRunning(true);
      setApprovalMsg(null);
      const res = await api.runCareerAgent({ raw_jd_text: jdInput });
      setAgentState(res);
    } catch (err) {
      console.error('Agent run failed:', err);
    } finally {
      setRunning(false);
    }
  };

  const handleApproval = async (approve: boolean) => {
    if (!agentState) return;
    try {
      const res = await api.approveCareerAgent({
        state: agentState,
        approve,
        action: 'APPLY'
      });
      setApprovalMsg(res.message);
      setAgentState(null);
    } catch (err) {
      console.error('Approval failed:', err);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h2 className="text-xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2">
          <Bot className="w-5 h-5 text-emerald-400" />
          <span>Modular AI Career Agent (LangGraph Workflow)</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Autonomous multi-stage pipeline with mandatory Human-In-The-Loop approval checkpoints before creating side-effects.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Console */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="font-extrabold text-xs text-slate-200 uppercase tracking-wider">Feed Job Description into Agent Pipeline</h3>
          <textarea
            value={jdInput}
            onChange={(e) => setJdInput(e.target.value)}
            rows={8}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
          ></textarea>

          <button
            onClick={handleRunPipeline}
            disabled={running}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>{running ? 'Agent Executing Multi-Stage Graph...' : 'Execute Career Agent Pipeline'}</span>
          </button>
        </div>

        {/* State Graph Output */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="font-extrabold text-xs text-slate-200 uppercase tracking-wider">Agent State & Approval Checkpoint</h3>

          {approvalMsg && (
            <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/40 text-emerald-400 text-xs font-bold">
              ✓ {approvalMsg}
            </div>
          )}

          {agentState ? (
            <div className="space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="flex justify-between font-bold text-slate-200">
                  <span>Target Role Identified:</span>
                  <span className="text-emerald-400">{agentState.extracted_job?.role}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Classified Tier:</span>
                  <span className="font-bold text-slate-200">Tier {agentState.tier} ({agentState.match_result?.overall_score}% Match)</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-[11px] text-slate-200 leading-relaxed">
                {agentState.status_message}
              </div>

              {/* Human In The Loop Buttons */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  onClick={() => handleApproval(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg"
                >
                  Discard
                </button>
                <button
                  onClick={() => handleApproval(true)}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg shadow-md"
                >
                  Approve & Ingest to Pipeline
                </button>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500 text-center py-12">Execute the pipeline on the left to see LangGraph execution nodes.</p>
          )}
        </div>
      </div>
    </div>
  );
};
