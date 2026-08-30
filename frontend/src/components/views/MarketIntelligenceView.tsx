import React, { useState, useEffect } from 'react';
import { LineChart, BarChart3, TrendingUp, DollarSign, MapPin, Cpu, Search, Sparkles, BookOpen, Layers, CheckCircle2 } from 'lucide-react';
import { api } from '../../lib/api';

export const MarketIntelligenceView: React.FC = () => {
  const [marketData, setMarketData] = useState<any | null>(null);
  const [taxonomyData, setTaxonomyData] = useState<any | null>(null);
  const [selectedFamilyKey, setSelectedFamilyKey] = useState<string>('SOFTWARE_DEVELOPMENT');
  const [testTitle, setTestTitle] = useState<string>('Software Engineer II - Intelligent Automation');
  const [normalizedResult, setNormalizedResult] = useState<any | null>(null);
  const [normalizing, setNormalizing] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMarket();
    loadTaxonomy();
  }, []);

  const loadMarket = async () => {
    try {
      setLoading(true);
      const data = await api.getMarketIntelligence();
      setMarketData(data);
    } catch (err) {
      console.error('Failed to load market data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadTaxonomy = async () => {
    try {
      const tax = await api.getTaxonomy();
      setTaxonomyData(tax);
      handleNormalize('Software Engineer II - Intelligent Automation');
    } catch (err) {
      console.error('Failed to load taxonomy:', err);
    }
  };

  const handleNormalize = async (titleToTest?: string) => {
    const title = titleToTest || testTitle;
    if (!title.trim()) return;
    try {
      setNormalizing(true);
      const res = await api.normalizeJobTitle(title);
      if (res && res.normalized) {
        setNormalizedResult(res.normalized);
      }
    } catch (err) {
      console.error('Normalization failed:', err);
    } finally {
      setNormalizing(false);
    }
  };

  const currentFamily = taxonomyData?.families?.[selectedFamilyKey];

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-slate-100 tracking-tight flex items-center gap-2.5">
          <LineChart className="w-6 h-6 text-emerald-400" />
          <span>Real-Time Market Intelligence & IT Role Taxonomy</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Universal Role Intelligence across 30 major IT career families, 150+ normalized roles, and real market telemetry.
        </p>
      </div>

      {/* AI Title Normalizer Tester */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950/40 border border-indigo-500/30 space-y-4 shadow-xl">
        <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-4 h-4" />
          <span>Universal IT Job Title Normalizer (AI-Powered)</span>
        </div>
        <p className="text-xs text-slate-300">
          Test how ANY arbitrary real-world job posting title gets deconstructed into Family, Normalized Role, Specialization, and Seniority:
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={testTitle}
            onChange={(e) => setTestTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleNormalize()}
            placeholder="e.g. Senior Backend Engineer – GenAI Platform, Associate Consultant – Cloud & Data"
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 font-medium"
          />
          <button
            onClick={() => handleNormalize()}
            disabled={normalizing}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
          >
            {normalizing ? 'Analyzing...' : 'Normalize Title'}
          </button>
        </div>

        {normalizedResult && (
          <div className="mt-4 p-4 rounded-xl bg-slate-950/80 border border-indigo-500/20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">🏛️ Career Family</span>
              <p className="font-extrabold text-indigo-300">{normalizedResult.career_family}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">🎯 Normalized Role</span>
              <p className="font-extrabold text-emerald-400">{normalizedResult.normalized_role}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">⚡ Specialization</span>
              <p className="font-bold text-slate-200">{normalizedResult.specialization}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">👑 Seniority & Benchmark</span>
              <p className="font-extrabold text-amber-400">
                {normalizedResult.seniority} (₹{normalizedResult.benchmark_salary_lpa?.min}L–₹{normalizedResult.benchmark_salary_lpa?.max}L)
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 30 IT Career Families Taxonomy Explorer */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-400" />
            <h3 className="font-extrabold text-sm text-slate-100 uppercase tracking-wider">
              30 IT Career Families Taxonomy ({taxonomyData?.total_families || 30} Total)
            </h3>
          </div>
          <span className="text-xs text-slate-400">Select any family to inspect normalized roles & skills</span>
        </div>

        {/* Family Selector Chips */}
        <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-1 pb-1">
          {taxonomyData?.families &&
            Object.entries(taxonomyData.families).map(([key, fam]: [string, any]) => (
              <button
                key={key}
                onClick={() => setSelectedFamilyKey(key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedFamilyKey === key
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'bg-slate-950 border border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                {fam.name}
              </button>
            ))}
        </div>

        {/* Active Family Details */}
        {currentFamily && (
          <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4 mt-3">
            <div className="flex justify-between items-center border-b border-slate-800/80 pb-3">
              <div>
                <h4 className="font-extrabold text-sm text-blue-400">{currentFamily.name}</h4>
                <p className="text-xs text-slate-400 mt-0.5">Normalized roles and critical technical competencies</p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 font-mono text-[11px] font-bold border border-blue-500/20">
                {currentFamily.roles?.length} Normalized Roles
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-2">
                <span className="font-bold text-slate-300 block text-[11px] uppercase tracking-wider">Normalized Role Standards:</span>
                <div className="space-y-1.5">
                  {currentFamily.roles?.map((roleName: string) => (
                    <div key={roleName} className="flex items-center gap-2 p-2 rounded-lg bg-slate-900/80 border border-slate-800/60 text-slate-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{roleName}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <span className="font-bold text-slate-300 block text-[11px] uppercase tracking-wider">Core In-Demand Skill Blueprint:</span>
                <div className="flex flex-wrap gap-2">
                  {currentFamily.skills?.map((skill: string) => (
                    <span key={skill} className="px-3 py-1.5 rounded-lg bg-slate-900 text-slate-200 font-mono text-[11px] font-bold border border-slate-800">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Real Ingested Database Jobs Demand & Distribution */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-md">
        <h3 className="font-extrabold text-xs text-slate-200 uppercase tracking-wider">Top In-Demand Skills (% of Ingested Openings)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {marketData?.skills_demand?.map((item: any) => (
            <div key={item.skill} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
              <div className="flex justify-between font-bold text-slate-200">
                <span>{item.skill}</span>
                <span className="font-mono text-emerald-400">{item.percentage}%</span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${item.percentage}%` }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Salary & Location Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <h3 className="font-extrabold text-xs text-slate-200 uppercase tracking-wider">Salary Distribution Brackets</h3>
          <div className="space-y-2 text-xs">
            {marketData?.salary_distribution?.map((sal: any) => (
              <div key={sal.bracket} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between">
                <span className="font-bold text-slate-200">{sal.bracket}</span>
                <span className="font-mono text-emerald-400 font-bold">{sal.count} Jobs</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <h3 className="font-extrabold text-xs text-slate-200 uppercase tracking-wider">Geographic Demand Hubs</h3>
          <div className="space-y-2 text-xs">
            {marketData?.top_locations?.map((loc: any) => (
              <div key={loc.location} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between">
                <span className="font-bold text-slate-200">{loc.location}</span>
                <span className="font-mono text-blue-400 font-bold">{loc.count} Roles</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
