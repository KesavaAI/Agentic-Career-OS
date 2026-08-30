import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Target, Award, CheckCircle2, ChevronRight, ArrowUpRight } from 'lucide-react';
import { api } from '../../lib/api';
import { ReadinessScore, FunnelAnalytics } from '../../types';

export const AnalyticsView: React.FC = () => {
  const [readiness, setReadiness] = useState<ReadinessScore | null>(null);
  const [funnel, setFunnel] = useState<FunnelAnalytics | null>(null);
  const [weeklyReview, setWeeklyReview] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const [rData, fData, wData] = await Promise.all([
        api.getReadinessScore(),
        api.getFunnelAnalytics(),
        api.getWeeklyReview()
      ]);
      setReadiness(rData);
      setFunnel(fData);
      setWeeklyReview(wData);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h2 className="text-xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-emerald-400" />
          <span>Career Analytics, Funnel Health & Readiness Score</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Comprehensive data-backed analysis of your dream package transition progress.
        </p>
      </div>

      {/* DREAM PACKAGE READINESS SCORE BREAKDOWN */}
      {readiness && (
        <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/30 border border-emerald-500/30 space-y-4 shadow-xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">CAREER READINESS ALGORITHM</span>
              <h3 className="text-lg font-extrabold text-slate-100 mt-0.5">
                Dream Package Readiness Score: <span className="text-emerald-400 font-mono">{readiness.overall_score}/100</span>
              </h3>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-slate-300 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
                Target Benchmark: 85+/100
              </span>
            </div>
          </div>

          {/* 5 Category Weight Bars */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {Object.entries(readiness.category_scores).map(([category, score]) => (
              <div key={category} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="flex justify-between font-bold text-slate-200">
                  <span>{category}</span>
                  <span className="font-mono text-emerald-400">{score}%</span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${score}%` }}></div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 text-slate-300 text-xs leading-relaxed border border-slate-800">
            <strong className="text-emerald-400">Readiness Summary:</strong> {readiness.readiness_summary}
          </div>
        </div>
      )}

      {/* WEEKLY REVIEW */}
      {weeklyReview && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="font-extrabold text-sm text-slate-100 uppercase tracking-wider">{weeklyReview.week_label} Report</h3>
            <span className="text-xs font-bold text-emerald-400">Generated from Live Records</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <p className="text-[10px] font-bold text-slate-500 uppercase">Applications</p>
              <p className="text-lg font-extrabold text-slate-100 mt-1">{weeklyReview.applications_count}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <p className="text-[10px] font-bold text-slate-500 uppercase">Tier-A Apps</p>
              <p className="text-lg font-extrabold text-emerald-400 mt-1">{weeklyReview.tier_a_applications_count}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <p className="text-[10px] font-bold text-slate-500 uppercase">Responses</p>
              <p className="text-lg font-extrabold text-blue-400 mt-1">{weeklyReview.responses_count}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <p className="text-[10px] font-bold text-slate-500 uppercase">Interviews</p>
              <p className="text-lg font-extrabold text-purple-400 mt-1">{weeklyReview.interviews_count}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <p className="text-[10px] font-bold text-slate-500 uppercase">Offers</p>
              <p className="text-lg font-extrabold text-emerald-400 mt-1">{weeklyReview.offers_count}</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2">
            <span className="font-bold text-slate-200 uppercase text-[10px]">Next Week's Strategic Priorities</span>
            <ul className="list-disc list-inside text-slate-300 space-y-1 text-[11px]">
              {weeklyReview.next_week_priorities.map((item: string, i: number) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
