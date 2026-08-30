import React, { useState, useEffect } from 'react';
import { Building2, ExternalLink, MapPin, DollarSign, Search } from 'lucide-react';
import { api } from '../../lib/api';
import { Company } from '../../types';

export const CompaniesView: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      const data = await api.getCompanies();
      setCompanies(data);
    } catch (err) {
      console.error('Failed to load companies:', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = companies.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.industry.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-400" />
            <span>Company Intelligence Center</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Profiles, salary brackets, and response rate metrics for top Indian GenAI employers.
          </p>
        </div>

        <div className="relative w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search companies..."
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((comp) => (
          <div key={comp.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${
                  comp.tier === 'A' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-300'
                }`}>
                  Tier {comp.tier} Target
                </span>
                <span className="text-[10px] text-slate-400 font-semibold">{comp.response_rate}% Response Rate</span>
              </div>

              <h3 className="font-extrabold text-sm text-slate-100 tracking-tight">{comp.name}</h3>
              <p className="text-xs text-slate-400">{comp.industry}</p>

              <div className="my-3 space-y-1 text-xs">
                <div className="flex items-center gap-1 text-slate-300">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="font-bold text-emerald-400">{comp.salary_range_lpa}</span>
                </div>
                <div className="flex items-center gap-1 text-slate-400">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  <span>{comp.locations}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              {comp.career_url ? (
                <a
                  href={comp.career_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                >
                  <span>Career Portal</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              ) : (
                <span></span>
              )}
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && !loading && (
        <div className="p-12 text-center rounded-2xl bg-slate-900/50 border border-slate-800 space-y-3">
          <Building2 className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="font-bold text-sm text-slate-300">No Matching Companies Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search query or reset the filter to explore all verified Tier-A hiring partners.
          </p>
          {search && (
            <button
              onClick={() => setSearch('')}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 cursor-pointer"
            >
              Clear Search
            </button>
          )}
        </div>
      )}
    </div>
  );
};
