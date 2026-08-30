import React, { useState, useEffect } from 'react';
import {
  X, CheckCircle2, FileText, ExternalLink, ShieldCheck, Sparkles,
  AlertTriangle, Copy, Check, Download, Eye, Columns, List
} from 'lucide-react';
import { api } from '../../lib/api';
import { Job, Resume } from '../../types';
import { ResumeDocumentView } from './ResumeDocumentView';

interface PrepareApplicationModalProps {
  jobId: number | null;
  onClose: () => void;
  onApplicationCreated: () => void;
}

export const PrepareApplicationModal: React.FC<PrepareApplicationModalProps> = ({
  jobId,
  onClose,
  onApplicationCreated
}) => {
  const [job, setJob] = useState<Job | null>(null);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<number | null>(null);
  const [tailorResult, setTailorResult] = useState<any>(null);
  const [tailorTab, setTailorTab] = useState<'document' | 'diff' | 'summary'>('document');
  const [checklist, setChecklist] = useState({
    resumeSelected: true,
    resumeTailored: false,
    jdReviewed: true,
    portfolioReady: true,
    githubReady: true,
    userApproved: false
  });
  const [loading, setLoading] = useState(true);
  const [tailoringLoading, setTailoringLoading] = useState(false);

  useEffect(() => {
    if (jobId) {
      loadData(jobId);
    }
  }, [jobId]);

  const loadData = async (id: number) => {
    try {
      setLoading(true);
      const [jobData, resumeList] = await Promise.all([
        api.getJob(id),
        api.getResumes()
      ]);
      setJob(jobData);
      setResumes(resumeList);
      if (resumeList.length > 0) {
        setSelectedResumeId(resumeList[0].id);
      }
    } catch (err) {
      console.error('Failed to load prepare data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRunTailoring = async () => {
    if (!jobId || !selectedResumeId) return;
    try {
      setTailoringLoading(true);
      const result = await api.tailorResume({ resume_id: selectedResumeId, job_id: jobId });
      setTailorResult(result);
      setChecklist(prev => ({ ...prev, resumeTailored: true }));
      setTailorTab('document');
    } catch (err) {
      console.error('Tailoring failed:', err);
    } finally {
      setTailoringLoading(false);
    }
  };

  const handleConfirmApplication = async () => {
    if (!job) return;
    try {
      await api.createApplication({
        job_id: job.id,
        resume_id: selectedResumeId,
        company_name: job.company_name,
        role_title: job.role,
        tier: job.tier,
        match_score: job.match_score,
        status: 'APPLIED',
        is_user_approved: true
      });
      onApplicationCreated();
      onClose();
    } catch (err) {
      console.error('Failed to record application:', err);
    }
  };

  if (!jobId || loading || !job) return null;

  const currentResume = resumes.find(r => r.id === selectedResumeId);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                APPLICATION ASSISTANT
              </span>
              <span className="text-xs text-slate-400 font-semibold">• Tier {job.tier} ({job.match_score}% Match)</span>
            </div>
            <h3 className="text-base font-extrabold text-slate-100 tracking-tight mt-1">
              Prepare Application for {job.role} at {job.company_name}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Match & Salary Summary Banner */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase">Target CTC Range</p>
              <p className="text-sm font-extrabold text-emerald-400 mt-0.5">₹{job.min_salary || 18}L - ₹{job.max_salary || 28}L LPA</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase">Required Key Tech</p>
              <p className="text-xs font-semibold text-slate-200 mt-0.5 truncate">{job.required_skills || 'Python, LangGraph, RAG, Azure'}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase">Location & Mode</p>
              <p className="text-xs font-semibold text-slate-200 mt-0.5">{job.location} ({job.work_mode})</p>
            </div>
          </div>

          {/* Section 1: Resume Selection & Tailoring */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-slate-200 text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                <span>1. Select Master Resume & Tailor with AI</span>
              </h4>
              <button
                onClick={handleRunTailoring}
                disabled={tailoringLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold rounded-lg transition-colors cursor-pointer shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{tailoringLoading ? 'Analyzing & Tailoring...' : 'Generate Tailored Diff'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {resumes.map((r) => (
                <div
                  key={r.id}
                  onClick={() => setSelectedResumeId(r.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedResumeId === r.id
                      ? 'bg-emerald-950/30 border-emerald-500/50'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold text-slate-200">
                    <span>{r.name}</span>
                    <span className="text-[10px] font-mono bg-slate-900 px-2 py-0.5 rounded text-emerald-400">
                      ATS: {r.ats_score}%
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">Role: {r.target_role} • {r.version}</p>
                </div>
              ))}
            </div>

            {/* TAILORED RESUME CONTAINER */}
            {tailorResult && (
              <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/30 space-y-3">
                {/* View Mode Tabs */}
                <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-lg border border-slate-800">
                    <button
                      onClick={() => setTailorTab('document')}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-bold transition-colors cursor-pointer ${
                        tailorTab === 'document' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Tailored Resume Document</span>
                    </button>

                    <button
                      onClick={() => setTailorTab('diff')}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-bold transition-colors cursor-pointer ${
                        tailorTab === 'diff' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Columns className="w-3.5 h-3.5" />
                      <span>Side-by-Side Diff</span>
                    </button>

                    <button
                      onClick={() => setTailorTab('summary')}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-bold transition-colors cursor-pointer ${
                        tailorTab === 'summary' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <List className="w-3.5 h-3.5" />
                      <span>Optimization Report</span>
                    </button>
                  </div>

                  <span className="text-[11px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    +{tailorResult.predicted_ats_boost}% ATS Boost
                  </span>
                </div>

                {/* Tab 1: Full Document Viewer */}
                {tailorTab === 'document' && (
                  <ResumeDocumentView
                    markdown={tailorResult.tailored_markdown}
                    structured={tailorResult.structured_resume}
                    targetCompany={job.company_name}
                    targetRole={job.role}
                    atsScore={Math.min((currentResume?.ats_score || 90) + tailorResult.predicted_ats_boost, 98)}
                  />
                )}

                {/* Tab 2: Side-by-Side Diff */}
                {tailorTab === 'diff' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-80 overflow-y-auto">
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                      <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Original Master Resume</span>
                        <span className="text-[10px] text-slate-400 font-mono">ATS: {currentResume?.ats_score}%</span>
                      </div>
                      <pre className="font-mono text-[10px] text-slate-400 whitespace-pre-wrap leading-relaxed">
                        {tailorResult.original_markdown || currentResume?.content_markdown}
                      </pre>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900 border border-emerald-500/40 space-y-1 bg-emerald-950/10">
                      <div className="flex items-center justify-between pb-1 border-b border-emerald-500/20">
                        <span className="text-[10px] font-bold text-emerald-400 uppercase">Tailored for {job.company_name}</span>
                        <span className="text-[10px] text-emerald-400 font-mono font-bold">
                          ATS: {Math.min((currentResume?.ats_score || 90) + tailorResult.predicted_ats_boost, 98)}%
                        </span>
                      </div>
                      <pre className="font-mono text-[10px] text-emerald-300 whitespace-pre-wrap leading-relaxed">
                        {tailorResult.tailored_markdown}
                      </pre>
                    </div>
                  </div>
                )}

                {/* Tab 3: Summary Report */}
                {tailorTab === 'summary' && (
                  <div className="space-y-2 text-xs p-2">
                    <span className="font-bold text-emerald-400 block mb-1">Tailoring Changes Applied:</span>
                    <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px]">
                      {tailorResult.changes_summary?.map((c: string, idx: number) => (
                        <li key={idx}>{c}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Section 2: Application Readiness Checklist */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-slate-200 text-sm">2. Pre-Application Checklist</h4>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <label className="flex items-center gap-2.5 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={checklist.resumeSelected}
                  onChange={(e) => setChecklist({ ...checklist, resumeSelected: e.target.checked })}
                  className="rounded bg-slate-900 border-slate-700 text-emerald-500"
                />
                <span>Target Resume Selected ({currentResume?.name})</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={checklist.jdReviewed}
                  onChange={(e) => setChecklist({ ...checklist, jdReviewed: e.target.checked })}
                  className="rounded bg-slate-900 border-slate-700 text-emerald-500"
                />
                <span>Reviewed JD requirements & confirmed TCS production experience alignment</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={checklist.portfolioReady}
                  onChange={(e) => setChecklist({ ...checklist, portfolioReady: e.target.checked })}
                  className="rounded bg-slate-900 border-slate-700 text-emerald-500"
                />
                <span>TCS Agentic Data Intelligence architecture points & GitHub verified</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={checklist.userApproved}
                  onChange={(e) => setChecklist({ ...checklist, userApproved: e.target.checked })}
                  className="rounded bg-slate-900 border-slate-700 text-emerald-500"
                />
                <span className="font-bold text-emerald-400">Explicit User Approval: I have verified the tailored resume and am ready to record application</span>
              </label>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          {job.job_url ? (
            <a
              href={job.job_url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-emerald-400 font-semibold"
            >
              <span>Open Career Application URL</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          ) : (
            <span className="text-xs text-slate-500">No external URL provided</span>
          )}

          <div className="flex items-center gap-3">
            <button onClick={onClose} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-lg">
              Cancel
            </button>
            <button
              onClick={handleConfirmApplication}
              disabled={!checklist.userApproved}
              className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-extrabold text-xs rounded-lg shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
            >
              Confirm & Record Application Date
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
