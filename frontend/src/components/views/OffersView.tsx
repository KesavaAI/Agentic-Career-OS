import React, { useState, useEffect } from 'react';
import { Trophy, DollarSign, Award, CheckCircle2, ChevronRight, Sparkles, MessageSquare, Mail, Copy, Check, Zap, TrendingUp, ShieldAlert } from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { Offer } from '../../types';

export const OffersView: React.FC = () => {
  const { user } = useAuth();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  // Negotiation State
  const [compName, setCompName] = useState('Stripe');
  const [roleTitle, setRoleTitle] = useState('Senior / Staff Software Engineer');
  const [baseCtc, setBaseCtc] = useState('28.0');
  const [joiningBonus, setJoiningBonus] = useState('4.0');
  const [esopsVal, setEsopsVal] = useState('8.0');
  const [competingOffers, setCompetingOffers] = useState('2');
  const [competingHighest, setCompetingHighest] = useState('38.0');

  const [playbookData, setPlaybookData] = useState<any | null>(null);
  const [generating, setGenerating] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  useEffect(() => {
    loadOffers();
    handleGeneratePlaybook();
  }, [user]);

  const loadOffers = async () => {
    try {
      setLoading(true);
      const data = await api.getOffers();
      setOffers(data || []);
    } catch (err) {
      console.error('Failed to load offers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePlaybook = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      setGenerating(true);
      const res = await api.generateCounterOfferPlaybook({
        company_name: compName,
        role_title: roleTitle,
        offered_base_lpa: parseFloat(baseCtc) || 28.0,
        offered_joining_bonus_lpa: parseFloat(joiningBonus) || 0.0,
        offered_esops_lpa: parseFloat(esopsVal) || 0.0,
        competing_offers_count: parseInt(competingOffers) || 1,
        competing_highest_ctc_lpa: parseFloat(competingHighest) || 38.0
      });
      setPlaybookData(res);
    } catch (err) {
      console.error('Playbook generation failed:', err);
    } finally {
      setGenerating(false);
    }
  };

  const copyEmail = () => {
    if (playbookData?.email_template) {
      navigator.clipboard.writeText(playbookData.email_template);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-emerald-950/30 to-slate-900 border border-emerald-500/20 shadow-xl">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Trophy className="w-5 h-5 text-emerald-400" />
            <span>Autonomous Multi-Offer & Counter-Offer Negotiator</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Ingests offer letters, benchmarks against market 90th percentile, and synthesizes 3-tier counter-offer strategies with 15-35% CTC upside.
          </p>
        </div>

        <div className="text-right">
          <p className="text-[10px] font-bold text-slate-400 uppercase">Target Compensation Goal</p>
          <p className="text-2xl font-extrabold text-emerald-400 font-mono">₹{user?.target_min_ctc_lpa || '25'}.0+ LPA</p>
        </div>
      </div>

      {/* Main Negotiation Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Offer Inputs */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <h3 className="font-extrabold text-xs text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span>Offer Parameters</span>
          </h3>

          <form onSubmit={handleGeneratePlaybook} className="space-y-3 text-xs">
            <div>
              <label className="text-slate-400 font-semibold block mb-1">Company Name</label>
              <input
                type="text"
                value={compName}
                onChange={(e) => setCompName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 font-bold focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-slate-400 font-semibold block mb-1">Role Title</label>
              <input
                type="text"
                value={roleTitle}
                onChange={(e) => setRoleTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 font-bold focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-slate-400 font-semibold block mb-1">Offered Base (LPA)</label>
                <input
                  type="number"
                  step="0.5"
                  value={baseCtc}
                  onChange={(e) => setBaseCtc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-emerald-400 font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">Joining Bonus (LPA)</label>
                <input
                  type="number"
                  step="0.5"
                  value={joiningBonus}
                  onChange={(e) => setJoiningBonus(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 font-mono font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-slate-400 font-semibold block mb-1">ESOPs Grant (LPA)</label>
                <input
                  type="number"
                  step="0.5"
                  value={esopsVal}
                  onChange={(e) => setEsopsVal(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">Competing Highest</label>
                <input
                  type="number"
                  step="0.5"
                  value={competingHighest}
                  onChange={(e) => setCompetingHighest(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-purple-400 font-mono font-bold"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={generating}
              className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-extrabold rounded-xl shadow-lg shadow-emerald-500/20 transition-all cursor-pointer mt-2"
            >
              {generating ? 'Synthesizing Playbook...' : '⚡ Generate 3-Tier Counter-Offer'}
            </button>
          </form>
        </div>

        {/* Right 2 Cols: 3-Tier Negotiation Playbook */}
        <div className="lg:col-span-2 space-y-4">
          {playbookData?.strategies && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {playbookData.strategies.map((tier: any, idx: number) => (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border space-y-2 shadow-md ${
                    idx === 1
                      ? 'bg-slate-900 border-emerald-500/50 shadow-emerald-500/10'
                      : 'bg-slate-900/80 border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs text-white">{tier.tier_name}</span>
                    <span className="text-[10px] font-bold text-emerald-400">{tier.confidence_rate} Confidence</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Target Total CTC</span>
                    <p className="text-xl font-extrabold text-white font-mono">₹{tier.target_total_ctc_lpa} LPA</p>
                    <span className="text-[10px] text-emerald-400 font-bold">+₹{tier.upside_lpa}L Upside</span>
                  </div>

                  <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/80 leading-snug">
                    <p>Base: <strong className="text-slate-200">₹{tier.target_base_lpa}L</strong></p>
                    <p>Joining: <strong className="text-slate-200">₹{tier.target_joining_bonus_lpa}L</strong></p>
                    <p className="mt-1 text-[10px] text-slate-500">{tier.rationale}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Email Script Card */}
          {playbookData?.email_template && (
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-emerald-400" />
                  <h3 className="font-extrabold text-xs text-slate-200 uppercase tracking-wider">
                    High-Leverage Counter-Offer Email Script
                  </h3>
                </div>

                <button
                  onClick={copyEmail}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg transition-all cursor-pointer"
                >
                  {copiedEmail ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedEmail ? 'Copied Script!' : 'Copy Email Script'}</span>
                </button>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300 whitespace-pre-wrap leading-relaxed">
                {playbookData.email_template}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
