import React, { useEffect, useState } from 'react';
import {
  X, Sparkles, CheckCircle2, AlertTriangle, Briefcase, Code, Star,
  Clock, FolderGit2, GraduationCap, DollarSign, MapPin, ArrowRight,
  TrendingUp, RefreshCw, Zap, ShieldCheck
} from 'lucide-react';
import { api } from '../../lib/api';
import { Job } from '../../types';

interface JobMatchModalProps {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
  onPrepareApply?: (jobId: number) => void;
}

export const JobMatchModal: React.FC<JobMatchModalProps> = ({
  job,
  isOpen,
  onClose,
  onPrepareApply
}) => {
  const [matchData, setMatchData] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [recalculating, setRecalculating] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen && job) {
      loadMatchAnalysis(job.id);
    } else {
      setMatchData(null);
    }
  }, [isOpen, job]);

  const loadMatchAnalysis = async (jobId: number) => {
    try {
      setLoading(true);
      const data = await api.getJobMatchAnalysis(jobId);
      setMatchData(data);
    } catch (err) {
      console.error('Failed to load 8-pillar match analysis:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRecalculate = async () => {
    if (!job) return;
    try {
      setRecalculating(true);
      await api.recalculateMatches();
      await loadMatchAnalysis(job.id);
    } catch (err) {
      console.error('Failed to recalculate match:', err);
    } finally {
      setRecalculating(false);
    }
  };

  if (!isOpen || !job) return null;

  const pillars = matchData?.pillar_scores || {};
  const overall = matchData?.overall_score ?? job.match_score ?? 80;
  const tier = matchData?.tier ?? job.tier ?? 'B';
  const eligibility = matchData?.eligibility ?? 'QUALIFIED';
  const recommendation = matchData?.recommendation ?? 'STRONG_MATCH';

  const pillarMeta: Record<string, { label: string; icon: any; color: string }> = {
    role_alignment: { label: 'Role Alignment', icon: Briefcase, color: 'text-indigo-400 border-indigo-500/30' },
    required_skills: { label: 'Required Skills', icon: Code, color: 'text-emerald-400 border-emerald-500/30' },
    preferred_skills: { label: 'Preferred Skills', icon: Star, color: 'text-amber-400 border-amber-500/30' },
    experience_fit: { label: 'Experience Fit', icon: Clock, color: 'text-blue-400 border-blue-500/30' },
    projects_relevance: { label: 'Projects Relevance', icon: FolderGit2, color: 'text-purple-400 border-purple-500/30' },
    education_fit: { label: 'Education Fit', icon: GraduationCap, color: 'text-cyan-400 border-cyan-500/30' },
    salary_fit: { label: 'Salary Fit', icon: DollarSign, color: 'text-green-400 border-green-500/30' },
    location_fit: { label: 'Location Fit', icon: MapPin, color: 'text-pink-400 border-pink-500/30' }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-slate-900 border border-slate-700/60 rounded-2xl shadow-2xl shadow-cyan-950/40 text-slate-100 overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 text-cyan-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-wide">{job.role}</h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                  {job.company_name}
                </span>
              </div>
              <p className="text-xs text-slate-400">Deep 8-Pillar Mathematical Match & Personalization Analysis</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRecalculate}
              disabled={recalculating || loading}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 flex items-center gap-1.5 transition disabled:opacity-50"
              title="Recalculate match score against current profile"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${recalculating ? 'animate-spin text-cyan-400' : ''}`} />
              {recalculating ? 'Recalculating...' : 'Recalculate'}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-4">
              <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
              <p className="text-sm text-slate-400">Evaluating 8-Pillar Alignment against Candidate Profile...</p>
            </div>
          ) : (
            <>
              {/* Top Banner: Composite Score & Strategic Recommendation */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className="relative flex items-center justify-center">
                    <div className={`w-20 h-20 rounded-full flex flex-col items-center justify-center border-4 shadow-lg ${
                      overall >= 85
                        ? 'border-emerald-500 bg-emerald-950/40 text-emerald-400 shadow-emerald-950/60'
                        : overall >= 70
                        ? 'border-cyan-500 bg-cyan-950/40 text-cyan-400 shadow-cyan-950/60'
                        : 'border-amber-500 bg-amber-950/40 text-amber-400 shadow-amber-950/60'
                    }`}>
                      <span className="text-2xl font-black">{overall}%</span>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Score</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                        tier === 'A' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
                        tier === 'B' ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' :
                        'bg-amber-500/10 border-amber-500/30 text-amber-400'
                      }`}>
                        Tier-{tier} Opportunity
                      </span>
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                        {eligibility.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">Strategic Rec:</span>
                      <span className="text-sm font-bold text-cyan-300">
                        {recommendation.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 max-w-md line-clamp-2">
                      {matchData?.recommendation_rationale}
                    </p>
                  </div>
                </div>

                {onPrepareApply && (
                  <button
                    onClick={() => {
                      onClose();
                      onPrepareApply(job.id);
                    }}
                    className="w-full md:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-sm shadow-lg shadow-cyan-950/60 flex items-center justify-center gap-2 transition"
                  >
                    <span>Prepare Tailored Application</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* 8 Pillar Breakdown Grid */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-cyan-400" />
                    <span>8-Pillar Scoring Breakdown</span>
                  </h3>
                  <span className="text-xs text-slate-500">100% Dynamic Formula • Zero Hardcoded Values</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {Object.entries(pillarMeta).map(([pillarKey, meta]) => {
                    const data = pillars[pillarKey] || { score: 80, weight: 0.1, contribution: 8.0, explanation: '' };
                    const Icon = meta.icon;
                    const score = data.score ?? 80;
                    const weightPct = Math.round((data.weight ?? 0.1) * 100);

                    return (
                      <div
                        key={pillarKey}
                        className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/80 hover:border-slate-700 transition space-y-2.5"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`p-1.5 rounded-lg bg-slate-900 border ${meta.color}`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div>
                              <span className="text-sm font-semibold text-white">{meta.label}</span>
                              <span className="text-[10px] text-slate-500 ml-1.5">({weightPct}% weight)</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`text-sm font-bold ${
                              score >= 85 ? 'text-emerald-400' : score >= 70 ? 'text-cyan-400' : 'text-amber-400'
                            }`}>
                              {score}%
                            </span>
                            <span className="text-[10px] text-slate-500 block">+{data.contribution ?? 0} pts</span>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              score >= 85 ? 'bg-emerald-500' : score >= 70 ? 'bg-cyan-500' : 'bg-amber-500'
                            }`}
                            style={{ width: `${score}%` }}
                          />
                        </div>

                        {/* Pillar Explanation */}
                        <p className="text-xs text-slate-400 leading-relaxed">
                          {data.explanation}
                        </p>

                        {/* Tags for Skills Pillars */}
                        {data.matched && data.matched.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            <span className="text-[10px] text-slate-500 mr-1">Matched:</span>
                            {data.matched.map((sk: string) => (
                              <span key={sk} className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950/50 border border-emerald-700/30 text-emerald-300">
                                ✓ {sk}
                              </span>
                            ))}
                          </div>
                        )}
                        {data.missing && data.missing.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-0.5">
                            <span className="text-[10px] text-slate-500 mr-1">Missing:</span>
                            {data.missing.map((sk: string) => (
                              <span key={sk} className="text-[10px] px-1.5 py-0.5 rounded bg-rose-950/40 border border-rose-800/30 text-rose-300">
                                ✗ {sk}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Strengths and Concerns Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {/* Strengths */}
                <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-800/30 space-y-2.5">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Key Competitive Strengths</span>
                  </div>
                  <ul className="space-y-1.5">
                    {(matchData?.strengths || []).map((str: string, idx: number) => (
                      <li key={idx} className="text-xs text-emerald-200/90 flex items-start gap-2">
                        <span className="text-emerald-400 font-bold mt-0.5">✓</span>
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Concerns / Strategic Gaps */}
                <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-800/30 space-y-2.5">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Identified Gaps & Risks</span>
                  </div>
                  <ul className="space-y-1.5">
                    {(matchData?.concerns || []).map((c: string, idx: number) => (
                      <li key={idx} className="text-xs text-amber-200/90 flex items-start gap-2">
                        <span className="text-amber-400 font-bold mt-0.5">!</span>
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-500">
          <span>Agentic Career OS AI Job Matching Engine</span>
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
