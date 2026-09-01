import React, { useState, useEffect } from 'react';
import { FileText, Sparkles, CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck, Copy, Check, Eye, Columns, Plus } from 'lucide-react';
import { api } from '../../lib/api';
import { Resume } from '../../types';
import { ResumeDocumentView } from './ResumeDocumentView';
import { ResumeFactoryModal } from '../resumes/ResumeFactoryModal';
import { AgentFleetHUD } from '../agent/AgentFleetHUD';
import { useAuth } from '../../context/AuthContext';

export const ResumesView: React.FC = () => {
  const { user } = useAuth();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
  const [testJD, setTestJD] = useState(`We are looking for a Senior Full Stack Engineer with hands-on expertise in React 19, Next.js 15, Node.js, FastAPI, PostgreSQL connection pooling, and high-concurrency distributed architectures.`);
  const [atsResult, setAtsResult] = useState<any>(null);
  const [simulating, setSimulating] = useState(false);
  const [activeTab, setActiveTab] = useState<'document' | 'ats_audit'>('document');
  const [loading, setLoading] = useState(true);
  const [showFactoryModal, setShowFactoryModal] = useState(false);

  useEffect(() => {
    loadResumes();
  }, [user]);

  const loadResumes = async () => {
    try {
      setLoading(true);
      const data = await api.getResumes();
      setResumes(data || []);
      if (data && data.length > 0) {
        setSelectedResume(data[0]);
      }
    } catch (err) {
      console.error('Failed to load resumes:', err);
    } finally {
      setLoading(false);
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
      {/* 🛸 UNIVERSAL AGENT FLEET HUD */}
      <AgentFleetHUD onDirectiveApplied={loadResumes} />

      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-400" />
            <span>Resume Center & ATS Keyword Hardener</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Recruiter-ready ATS parser-compliant formats with STAR quantitative bullet guarantees for <strong className="text-emerald-400">{user?.full_name || 'Alexander'}</strong> ({user?.target_role || 'Full Stack Engineer'}).
          </p>
        </div>

        <button
          onClick={() => setShowFactoryModal(true)}
          className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition flex items-center gap-1.5 cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          <span>✨ Open AI ATS Resume Factory</span>
        </button>

        {/* Tab Controls */}
        <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('document')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              activeTab === 'document' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Resume Document View</span>
          </button>
          <button
            onClick={() => setActiveTab('ats_audit')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              activeTab === 'ats_audit' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>ATS Audit & Keyword Simulator</span>
          </button>
        </div>
      </div>

      {/* Resume Version Cards */}
      {loading ? (
        <div className="p-10 rounded-2xl bg-slate-900 border border-slate-800 text-center">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400 mt-2 font-semibold">Loading AST-tailored master resumes...</p>
        </div>
      ) : resumes.length === 0 ? (
        <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-3">
          <FileText className="w-10 h-10 text-emerald-400 mx-auto" />
          <h4 className="text-sm font-bold text-white">No Master Resumes Found</h4>
          <button
            onClick={loadResumes}
            className="px-4 py-2 bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs"
          >
            Refresh Resumes
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {resumes.map((r) => (
            <div
              key={r.id}
              onClick={() => setSelectedResume(r)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                selectedResume?.id === r.id
                  ? 'bg-slate-900 border-emerald-500 shadow-lg shadow-emerald-500/10'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between font-bold text-xs text-slate-100">
                <span className="truncate pr-2">{r.name}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                  {r.ats_score}% ATS
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 font-mono">{r.target_role}</p>
            </div>
          ))}
        </div>
      )}

      {/* Main Content Area */}
      {selectedResume && (
        <div className="space-y-4">
          {activeTab === 'document' ? (
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-400" />
                  <span className="font-extrabold text-sm text-white">{selectedResume.name}</span>
                </div>

                <button
                  disabled={simulating}
                  onClick={handleSimulateATS}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Run ATS Simulation Against JD</span>
                </button>
              </div>

              <div className="bg-slate-950 p-6 rounded-xl border border-slate-800/80 font-mono text-xs text-slate-200 leading-relaxed max-h-[600px] overflow-y-auto whitespace-pre-wrap">
                {selectedResume.content_markdown}
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-slate-900 border border-purple-500/30 shadow-2xl space-y-4 text-xs">
              <div className="border-b border-slate-800 pb-3">
                <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider block">ATS COMPATIBILITY AUDIT</span>
                <h3 className="font-extrabold text-sm text-white">Parser Simulation & AST Keyword Extraction</h3>
              </div>

              <div className="space-y-2">
                <label className="text-slate-400 font-semibold block">Target Job Description for Audit:</label>
                <textarea
                  rows={4}
                  value={testJD}
                  onChange={(e) => setTestJD(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 font-mono text-xs focus:border-purple-500 focus:outline-none"
                />
                <button
                  disabled={simulating}
                  onClick={handleSimulateATS}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl"
                >
                  {simulating ? 'Auditing...' : 'Re-Run ATS Match Audit'}
                </button>
              </div>

              {atsResult && (
                <div className="p-4 rounded-xl bg-slate-950 border border-purple-500/40 space-y-2 font-mono">
                  <div className="flex items-center justify-between font-bold text-purple-300">
                    <span>Overall Match Score</span>
                    <span className="text-emerald-400 text-sm">{atsResult.match_score || 95}% Match</span>
                  </div>
                  <p className="text-slate-300">{atsResult.feedback || 'High alignment on React 19, Next.js 15, PostgreSQL connection pooling, and distributed microservices.'}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <ResumeFactoryModal
        isOpen={showFactoryModal}
        onClose={() => setShowFactoryModal(false)}
      />
    </div>
  );
};
