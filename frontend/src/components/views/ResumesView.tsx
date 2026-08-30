import React, { useState, useEffect } from 'react';
import { FileText, Sparkles, CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck, Copy, Check, Eye, Columns } from 'lucide-react';
import { api } from '../../lib/api';
import { Resume } from '../../types';
import { ResumeDocumentView } from './ResumeDocumentView';

import { useAuth } from '../../context/AuthContext';

export const ResumesView: React.FC = () => {
  const { user } = useAuth();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
  const [testJD, setTestJD] = useState(`We are looking for a ${user?.target_role || 'Software Engineer'} with hands-on expertise in backend systems, databases, APIs, and modern cloud deployment.`);
  const [atsResult, setAtsResult] = useState<any>(null);
  const [simulating, setSimulating] = useState(false);
  const [activeTab, setActiveTab] = useState<'document' | 'ats_audit'>('document');

  useEffect(() => {
    loadResumes();
  }, [user]);

  const loadResumes = async () => {
    try {
      const data = await api.getResumes();
      setResumes(data);
      if (data.length > 0) {
        setSelectedResume(data[0]);
      }
    } catch (err) {
      console.error('Failed to load resumes:', err);
    }
  };

  const handleSimulateATS = async () => {
    if (!selectedResume) return;
    try {
      setSimulating(true);
      const res = await api.simulateAts({
        resume_id: selectedResume.id,
        resume_text: selectedResume.content_markdown,
        job_description: testJD
      });
      setAtsResult(res);
      setActiveTab('ats_audit');
    } catch (err) {
      console.error('ATS simulation failed:', err);
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-400" />
            <span>Resume Center & ATS Simulator</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Recruiter-ready ATS parser-compliant formats for <strong className="text-emerald-400">{user?.full_name || 'Candidate'}</strong> ({user?.target_role || 'Tech Role'}).
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('document')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-md font-bold transition-all cursor-pointer ${
              activeTab === 'document' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Resume Document View</span>
          </button>
          <button
            onClick={() => setActiveTab('ats_audit')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-md font-bold transition-all cursor-pointer ${
              activeTab === 'ats_audit' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>ATS Audit & Keyword Simulator</span>
          </button>
        </div>
      </div>

      {/* Resume Version Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {resumes.map((r) => (
          <div
            key={r.id}
            onClick={() => setSelectedResume(r)}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              selectedResume?.id === r.id
                ? 'bg-slate-900 border-emerald-500 shadow-md shadow-emerald-500/10'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between font-bold text-xs text-slate-100">
              <span>{r.name}</span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/30">
                ATS: {r.ats_score}%
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">{r.target_role} • {r.version}</p>
          </div>
        ))}
      </div>

      {/* ACTIVE TAB 1: FULL DOCUMENT VIEWER (RECRUITER & ATS LAYOUT) */}
      {activeTab === 'document' && selectedResume && (
        <ResumeDocumentView
          markdown={selectedResume.content_markdown}
          targetCompany="Tier-A GenAI Target"
          targetRole={selectedResume.target_role || 'GenAI / Agentic AI Engineer'}
          atsScore={selectedResume.ats_score || 92}
        />
      )}

      {/* ACTIVE TAB 2: ATS SIMULATOR INTERACTIVE AUDIT */}
      {activeTab === 'ats_audit' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Job Description Input */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-xs text-slate-200 uppercase tracking-wider">Paste Job Description for ATS Simulation</h3>
              <button
                onClick={handleSimulateATS}
                disabled={simulating}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-lg transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{simulating ? 'Analyzing...' : 'Run ATS Audit'}</span>
              </button>
            </div>
            <textarea
              value={testJD}
              onChange={(e) => setTestJD(e.target.value)}
              rows={8}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
              placeholder="Paste target JD here..."
            ></textarea>
            <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/20 text-[11px] text-slate-300 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>Strict Anti-Hallucination Guardrail: Simulator emphasizes your genuine ~1.6y TCS Agentic production experience and will never invent technologies or claims.</span>
            </div>
          </div>

          {/* Right: ATS Score Breakdown */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="font-extrabold text-xs text-slate-200 uppercase tracking-wider">ATS Score & Keyword Breakdown</h3>

            {atsResult ? (
              <div className="space-y-4 text-xs">
                {/* Radial Scores */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Current Match Score</p>
                    <p className="text-2xl font-extrabold text-slate-100 mt-1">{atsResult.current_score}/100</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-emerald-500/40 text-center bg-emerald-950/10">
                    <p className="text-[10px] font-bold text-emerald-400 uppercase">Potential Score (Tailored)</p>
                    <p className="text-2xl font-extrabold text-emerald-400 mt-1">{atsResult.potential_score}/100</p>
                  </div>
                </div>

                {/* Keywords Found vs Missing */}
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">Matched Keywords</span>
                  <div className="flex flex-wrap gap-1">
                    {atsResult.found_keywords.map((kw: string, i: number) => (
                      <span key={i} className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        ✓ {kw}
                      </span>
                    ))}
                  </div>
                </div>

                {atsResult.missing_keywords.length > 0 && (
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">Missing Keywords</span>
                    <div className="flex flex-wrap gap-1">
                      {atsResult.missing_keywords.map((kw: string, i: number) => (
                        <span key={i} className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          ⚠ {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">Actionable Changes</span>
                  <ul className="space-y-1 text-[11px] text-slate-300 list-disc list-inside">
                    {atsResult.recommended_changes.map((rec: string, i: number) => (
                      <li key={i}>{rec}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-52 text-slate-500 text-center">
                <Sparkles className="w-8 h-8 text-slate-600 mb-2" />
                <p className="text-xs">Click "Run ATS Audit" to evaluate resume against the job description.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
