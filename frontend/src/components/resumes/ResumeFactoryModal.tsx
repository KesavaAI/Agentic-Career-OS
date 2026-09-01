import React, { useState, useEffect } from 'react';
import {
  X, FileText, Sparkles, CheckCircle2, AlertTriangle, ShieldCheck, Copy, Check,
  ArrowRight, Columns, RefreshCw, Download, FileCheck, Layers, ExternalLink, Zap
} from 'lucide-react';
import { api } from '../../lib/api';

interface ResumeFactoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetJobId?: number;
  targetJobRole?: string;
  targetCompany?: string;
}

export const ResumeFactoryModal: React.FC<ResumeFactoryModalProps> = ({
  isOpen,
  onClose,
  targetJobId,
  targetJobRole = "Target Role",
  targetCompany = "Target Company"
}) => {
  const [resumes, setResumes] = useState<any[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<number | null>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(targetJobId || null);
  
  const [loading, setLoading] = useState<boolean>(true);
  const [generating, setGenerating] = useState<boolean>(false);
  const [result, setResult] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'optimized' | 'original' | 'diff' | 'truth_audit'>('optimized');
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      loadInitialData();
    }
  }, [isOpen, targetJobId]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [resData, jobsData] = await Promise.all([
        api.getResumes(),
        api.getJobs()
      ]);
      setResumes(resData || []);
      setJobs(jobsData || []);

      if (resData && resData.length > 0) {
        setSelectedResumeId(resData[0].id);
      }
      if (targetJobId) {
        setSelectedJobId(targetJobId);
      } else if (jobsData && jobsData.length > 0) {
        setSelectedJobId(jobsData[0].id);
      }
    } catch (err) {
      console.error('Failed to load initial data for Resume Factory:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateTailoredResume = async () => {
    if (!selectedResumeId || !selectedJobId) {
      alert('Please select both a Master Resume and a Target Job.');
      return;
    }

    try {
      setGenerating(true);
      setResult(null);
      const res = await api.tailorResume({
        resume_id: selectedResumeId,
        job_id: selectedJobId
      });
      setResult(res);
      setActiveTab('optimized');
    } catch (err: any) {
      alert('Failed to generate tailored resume: ' + err.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleCopyMarkdown = () => {
    if (!result?.tailored_markdown) return;
    navigator.clipboard.writeText(result.tailored_markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl max-h-[92vh] flex flex-col bg-slate-900 border border-slate-700/60 rounded-2xl shadow-2xl shadow-cyan-950/50 text-slate-100 overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-600/20 border border-emerald-500/30 text-emerald-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-wide">AI ATS Resume Factory</h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800/40 font-semibold">
                  Prompt 7 Zero Fabrication Engine
                </span>
              </div>
              <p className="text-xs text-slate-400">Transform Master Profile into job-specific ATS optimized resume • 100% Truthful Guarantee</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input Configuration Bar */}
        <div className="px-6 py-3.5 bg-slate-950/40 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4 flex-1">
            <div>
              <label className="text-slate-500 block mb-1 font-semibold">Select Master Resume:</label>
              <select
                value={selectedResumeId || ''}
                onChange={(e) => setSelectedResumeId(Number(e.target.value))}
                className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                {resumes.map(r => (
                  <option key={r.id} value={r.id}>{r.name} ({r.ats_score}% ATS)</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-slate-500 block mb-1 font-semibold">Select Target Job Opening:</label>
              <select
                value={selectedJobId || ''}
                onChange={(e) => setSelectedJobId(Number(e.target.value))}
                className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500 max-w-xs truncate"
              >
                {jobs.map(j => (
                  <option key={j.id} value={j.id}>{j.role} at {j.company_name}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={handleGenerateTailoredResume}
            disabled={generating || loading}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
            <span>{generating ? 'Optimizing Resume...' : '⚡ Generate Job-Specific Resume'}</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {generating ? (
            <div className="py-20 text-center space-y-4">
              <RefreshCw className="w-10 h-10 text-emerald-400 animate-spin mx-auto" />
              <div>
                <h4 className="text-sm font-bold text-white">Extracting Requirements & Aligning STAR Experience Bullets...</h4>
                <p className="text-xs text-slate-400 mt-1">Executing ZERO fabrication audit against candidate's master profile...</p>
              </div>
            </div>
          ) : result ? (
            <div className="space-y-6">
              {/* ATS Score & Keyword Match Banner */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/40 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Simulated ATS Score</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-emerald-400">{result.ats_score}%</span>
                    <span className="text-xs text-emerald-300 font-semibold">+{result.predicted_ats_boost}% Boost</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1 md:col-span-3">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-slate-300">Target Role & Company Alignment:</span>
                    <span className="text-cyan-400 font-bold">{result.target_role} at {result.target_company}</span>
                  </div>
                  
                  {/* Matched Keywords Chips */}
                  <div className="flex flex-wrap items-center gap-1 text-[11px] pt-1">
                    <span className="text-slate-500 mr-1">Matched Keywords:</span>
                    {(result.matched_keywords || []).slice(0, 8).map((kw: string) => (
                      <span key={kw} className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/40 font-semibold">
                        ✓ {kw}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* View Tabs */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2 text-xs">
                  <button
                    onClick={() => setActiveTab('optimized')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition ${
                      activeTab === 'optimized' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Optimized Job-Specific Resume
                  </button>
                  <button
                    onClick={() => setActiveTab('diff')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition ${
                      activeTab === 'diff' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Optimization Diff & Summary
                  </button>
                  <button
                    onClick={() => setActiveTab('truth_audit')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition ${
                      activeTab === 'truth_audit' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Zero Fabrication Audit Checklist
                  </button>
                  <button
                    onClick={() => setActiveTab('original')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition ${
                      activeTab === 'original' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Original Master Resume
                  </button>
                </div>

                <button
                  onClick={handleCopyMarkdown}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy Markdown'}</span>
                </button>
              </div>

              {/* Tab Contents */}
              {activeTab === 'optimized' && (
                <div className="p-6 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-200 whitespace-pre-wrap leading-relaxed max-h-[500px] overflow-y-auto">
                  {result.tailored_markdown}
                </div>
              )}

              {activeTab === 'diff' && (
                <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4 text-xs">
                  <h4 className="font-bold text-cyan-300 uppercase tracking-wider">ATS Optimization Summary</h4>
                  <ul className="space-y-2">
                    {result.changes_summary.map((c: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2 text-slate-300">
                        <ArrowRight className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {activeTab === 'truth_audit' && (
                <div className="p-5 rounded-xl bg-slate-950 border border-emerald-500/30 space-y-4 text-xs">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    <h4 className="font-bold text-emerald-300 text-sm">Truthfulness & Authenticity Verification Audit</h4>
                  </div>

                  <div className="space-y-2">
                    {(result.truthfulness_checks || []).map((chk: string, idx: number) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-slate-900 border border-emerald-500/20 text-emerald-200 font-semibold flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{chk}</span>
                      </div>
                    ))}

                    {(result.truthfulness_warnings || []).map((warn: string, idx: number) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-slate-900 border border-amber-500/30 text-amber-300 font-semibold flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>{warn}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'original' && (
                <div className="p-6 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-400 whitespace-pre-wrap leading-relaxed max-h-[500px] overflow-y-auto">
                  {result.original_markdown}
                </div>
              )}
            </div>
          ) : (
            <div className="py-16 text-center space-y-3">
              <FileCheck className="w-12 h-12 text-emerald-400 mx-auto" />
              <h4 className="text-sm font-bold text-white">Ready to generate job-specific ATS resume</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Select your target job above and click <strong>"Generate Job-Specific Resume"</strong> to extract requirements and align STAR bullets with zero fabrication.
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-500">
          <span>Persisted Versioning Engine • ATS Simulator</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
