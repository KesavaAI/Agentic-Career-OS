import React, { useState } from 'react';
import { X, Sparkles, Plus, Globe, FileText, CheckCircle2 } from 'lucide-react';
import { api } from '../../lib/api';

interface IngestJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJobIngested: () => void;
}

export const IngestJobModal: React.FC<IngestJobModalProps> = ({ isOpen, onClose, onJobIngested }) => {
  const [tab, setTab] = useState<'paste' | 'url' | 'manual'>('paste');
  const [rawText, setRawText] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [manualData, setManualData] = useState({
    company_name: '',
    role: 'GenAI / Agentic AI Engineer',
    min_salary: 18.0,
    max_salary: 28.0,
    location: 'Bengaluru',
    work_mode: 'Hybrid',
    required_skills: 'Python, LangGraph, RAG, Azure OpenAI, FastAPI',
    description: ''
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleIngest = async () => {
    try {
      setLoading(true);
      if (tab === 'paste' || tab === 'url') {
        await api.ingestJob({
          raw_text: rawText || (tab === 'url' ? `Job Posting from ${urlInput}` : ''),
          url: urlInput || undefined,
          source: tab === 'url' ? 'URL Ingest' : 'Pasted JD'
        });
      } else {
        await api.createJob(manualData);
      }
      onJobIngested();
      onClose();
    } catch (err) {
      console.error('Ingest failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl space-y-4">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <h3 className="font-extrabold text-sm text-slate-100">Ingest Job Opportunity</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="px-6 flex items-center gap-2 text-xs">
          {[
            { id: 'paste', label: 'Paste Job Description', icon: FileText },
            { id: 'url', label: 'Paste Job URL', icon: Globe },
            { id: 'manual', label: 'Manual Entry', icon: Plus }
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as any)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                tab === t.id ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <t.icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        {/* Form Body */}
        <div className="px-6 space-y-3 text-xs">
          {tab === 'paste' && (
            <div className="space-y-1.5">
              <label className="text-slate-300 font-bold">Paste Raw Job Description</label>
              <textarea
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                rows={8}
                placeholder="Paste complete JD text here (Role, Company, Requirements, Tech Stack)..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
              ></textarea>
            </div>
          )}

          {tab === 'url' && (
            <div className="space-y-1.5">
              <label className="text-slate-300 font-bold">Job / Career Posting URL</label>
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://careers.microsoft.com/job/..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              />
              <textarea
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                rows={4}
                placeholder="Optional: Paste description snippet..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 font-mono mt-2"
              ></textarea>
            </div>
          )}

          {tab === 'manual' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">Company</label>
                <input
                  type="text"
                  value={manualData.company_name}
                  onChange={(e) => setManualData({ ...manualData, company_name: e.target.value })}
                  placeholder="e.g. Swiggy"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Role Title</label>
                <input
                  type="text"
                  value={manualData.role}
                  onChange={(e) => setManualData({ ...manualData, role: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Max Salary (LPA)</label>
                <input
                  type="number"
                  value={manualData.max_salary}
                  onChange={(e) => setManualData({ ...manualData, max_salary: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Location</label>
                <input
                  type="text"
                  value={manualData.location}
                  onChange={(e) => setManualData({ ...manualData, location: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-lg">
            Cancel
          </button>
          <button
            onClick={handleIngest}
            disabled={loading}
            className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-lg shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
          >
            {loading ? 'Analyzing & Ingesting...' : 'Ingest & Match Opportunity'}
          </button>
        </div>
      </div>
    </div>
  );
};
