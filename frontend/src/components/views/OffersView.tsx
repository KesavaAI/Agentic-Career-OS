import React, { useState, useEffect } from 'react';
import { Trophy, DollarSign, Award, CheckCircle2, ChevronRight, Sparkles, MessageSquare, Mail, Copy, Check } from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { Offer } from '../../types';

export const OffersView: React.FC = () => {
  const { user } = useAuth();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  // Negotiation Copilot state
  const [negotiateCompany, setNegotiateCompany] = useState('Swiggy / TechCorp');
  const [offeredCtc, setOfferedCtc] = useState('14.0');
  const [targetCtc, setTargetCtc] = useState(user?.target_min_ctc_lpa ? String(user.target_min_ctc_lpa) : '18.0');
  const [negotiationResult, setNegotiationResult] = useState<any | null>(null);
  const [generating, setGenerating] = useState(false);
  const [copiedVerbal, setCopiedVerbal] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  useEffect(() => {
    loadOffers();
  }, [user]);

  const loadOffers = async () => {
    try {
      setLoading(true);
      const data = await api.getOffers();
      setOffers(data);
    } catch (err) {
      console.error('Failed to load offers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateNegotiation = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    try {
      const res = await fetch('/api/v1/offers/generate-negotiation-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_name: negotiateCompany,
          offered_ctc_lpa: parseFloat(offeredCtc) || 14.0,
          target_ctc_lpa: parseFloat(targetCtc) || 18.0,
          role: user?.target_role || 'Software Engineer'
        })
      });
      const data = await res.json();
      setNegotiationResult(data);
    } catch (err: any) {
      alert('Failed to generate script: ' + err.message);
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = (text: string, isEmail: boolean) => {
    navigator.clipboard.writeText(text);
    if (isEmail) {
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    } else {
      setCopiedVerbal(true);
      setTimeout(() => setCopiedVerbal(false), 2000);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h2 className="text-xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2">
          <Trophy className="w-5 h-5 text-emerald-400" />
          <span>Offer Center & Compensation Negotiation Copilot</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Side-by-side compensation benchmarking, monthly in-hand take-home breakdowns, and AI-powered counter-offer generators.
        </p>
      </div>

      {/* Target vs Received Hero */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 border border-emerald-500/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div>
          <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase">
            COMPENSATION GOAL ENGINE
          </span>
          <h3 className="text-xl font-extrabold text-slate-100 mt-1">
            Current CTC: ₹{user?.current_ctc_lpa || '3.5'} LPA ➔ Dream Package: ₹{user?.target_min_ctc_lpa || '18'}+ LPA ({user?.target_role || 'Tech Role'})
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Targeting a <strong>{Math.round(((parseFloat(user?.target_min_ctc_lpa as any || '18') - parseFloat(user?.current_ctc_lpa as any || '3.5')) / Math.max(parseFloat(user?.current_ctc_lpa as any || '3.5'), 1)) * 100)}% CTC leap</strong> to achieve your dream package.
          </p>
        </div>

        <div className="text-right">
          <p className="text-[10px] font-bold text-slate-400 uppercase">Dream Package Goal</p>
          <p className="text-2xl font-extrabold text-emerald-400 font-mono">₹{user?.target_min_ctc_lpa || '18'}.0+ LPA</p>
        </div>
      </div>

      {/* 🚀 AI COUNTER-OFFER & NEGOTIATION COPILOT */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-purple-500/30 shadow-xl space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
          <div className="p-2 rounded-xl bg-purple-600/20 text-purple-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-100">AI Counter-Offer & Salary Negotiation Generator</h3>
            <p className="text-xs text-slate-400">Received an initial offer? Generate polite, data-backed verbal scripts and counter-offer emails to push for higher CTC.</p>
          </div>
        </div>

        <form onSubmit={handleGenerateNegotiation} className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block text-slate-400 mb-1 font-semibold">Offering Company</label>
            <input
              type="text"
              value={negotiateCompany}
              onChange={e => setNegotiateCompany(e.target.value)}
              placeholder="e.g. Swiggy, Observe.ai"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-semibold">Offered CTC (₹ LPA)</label>
            <input
              type="number"
              step="0.5"
              value={offeredCtc}
              onChange={e => setOfferedCtc(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-semibold">Target Goal (₹ LPA)</label>
            <input
              type="number"
              step="0.5"
              value={targetCtc}
              onChange={e => setTargetCtc(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-bold text-emerald-400"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={generating}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-purple-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {generating ? 'Synthesizing Scripts...' : '⚡ Generate Negotiation Scripts'}
            </button>
          </div>
        </form>

        {negotiationResult && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-800 text-xs">
            {/* Verbal Call Script */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-purple-400 flex items-center gap-1.5 uppercase text-[10px]">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Verbal Recruiter Call Script</span>
                </span>
                <button
                  onClick={() => copyToClipboard(negotiationResult.verbal_script, false)}
                  className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-white px-2 py-0.5 rounded bg-slate-800"
                >
                  {copiedVerbal ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedVerbal ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
              <pre className="text-[11px] font-sans text-slate-300 whitespace-pre-wrap bg-slate-900/80 p-3 rounded-lg border border-slate-800 leading-relaxed max-h-60 overflow-y-auto">
                {negotiationResult.verbal_script}
              </pre>
            </div>

            {/* Email Counter-Offer Template */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-400 flex items-center gap-1.5 uppercase text-[10px]">
                  <Mail className="w-3.5 h-3.5" />
                  <span>Email Counter-Offer Letter</span>
                </span>
                <button
                  onClick={() => copyToClipboard(negotiationResult.email_template, true)}
                  className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-white px-2 py-0.5 rounded bg-slate-800"
                >
                  {copiedEmail ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedEmail ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
              <pre className="text-[11px] font-sans text-slate-300 whitespace-pre-wrap bg-slate-900/80 p-3 rounded-lg border border-slate-800 leading-relaxed max-h-60 overflow-y-auto">
                {negotiationResult.email_template}
              </pre>
            </div>
          </div>
        )}
      </div>

      {/* Offers Cards */}
      {offers.length === 0 ? (
        <div className="p-10 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto">
            <DollarSign className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-extrabold text-slate-200">No Offers Received Yet</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Keep crushing your interview rounds! Once an offer is extended, log it here to analyze fixed vs variable splits and generate AI counter-offer scripts.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {offers.map((o) => {
            const monthlyGross = Math.round((o.fixed_lpa * 100000) / 12);
            return (
              <div key={o.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-lg">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div>
                    <h4 className="font-extrabold text-base text-slate-100">{o.company_name}</h4>
                    <p className="text-xs text-slate-400">{o.role} • {o.location}</p>
                  </div>
                  <span className="text-xl font-extrabold text-emerald-400 font-mono">
                    ₹{o.total_ctc_lpa}L CTC
                  </span>
                </div>

                {/* Breakdown Grid */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Fixed Base</span>
                    <p className="text-sm font-extrabold text-slate-200 mt-0.5">₹{o.fixed_lpa} LPA</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Variable / Performance</span>
                    <p className="text-sm font-extrabold text-slate-200 mt-0.5">₹{o.variable_lpa} LPA</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Joining / Bonus</span>
                    <p className="text-sm font-extrabold text-slate-200 mt-0.5">₹{o.bonus_lpa} LPA</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">ESOPs / Stocks</span>
                    <p className="text-sm font-extrabold text-slate-200 mt-0.5">₹{o.esop_lpa} LPA</p>
                  </div>
                </div>

                {/* Monthly Gross Take-Home Estimate */}
                <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex justify-between items-center text-xs">
                  <span className="text-slate-300 font-semibold">Monthly Fixed Gross Estimate:</span>
                  <span className="font-extrabold text-emerald-400 text-sm font-mono">₹{monthlyGross.toLocaleString('en-IN')}/mo</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
