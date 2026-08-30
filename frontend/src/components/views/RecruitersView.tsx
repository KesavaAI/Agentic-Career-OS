import React, { useState, useEffect } from 'react';
import { Users2, Mail, MessageSquare, Copy, Check, Sparkles } from 'lucide-react';
import { api } from '../../lib/api';
import { Recruiter } from '../../types';

export const RecruitersView: React.FC = () => {
  const [recruiters, setRecruiters] = useState<Recruiter[]>([]);
  const [selectedRecruiter, setSelectedRecruiter] = useState<Recruiter | null>(null);
  const [templateType, setTemplateType] = useState('outreach');
  const [templateOutput, setTemplateOutput] = useState<{ subject: string; body: string } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadRecruiters();
  }, []);

  const loadRecruiters = async () => {
    try {
      const data = await api.getRecruiters();
      setRecruiters(data);
      if (data.length > 0) {
        setSelectedRecruiter(data[0]);
        generateTemplate(data[0], 'outreach');
      }
    } catch (err) {
      console.error('Failed to load recruiters:', err);
    }
  };

  const generateTemplate = async (rec: Recruiter, type: string) => {
    try {
      const res = await api.getOutreachTemplate({
        recruiter_name: rec.name,
        company_name: rec.company_name,
        role_title: 'GenAI / Agentic AI Engineer',
        template_type: type
      });
      setTemplateOutput(res);
    } catch (err) {
      console.error('Template gen failed:', err);
    }
  };

  const handleCopy = () => {
    if (templateOutput) {
      navigator.clipboard.writeText(`${templateOutput.subject}\n\n${templateOutput.body}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h2 className="text-xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2">
          <Users2 className="w-5 h-5 text-emerald-400" />
          <span>Recruiter CRM & Personalized Outreach</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Generate highly tailored outreach, follow-ups, and thank-you messages highlighting TCS Agentic experience.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recruiter List */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Recruiter Contacts ({recruiters.length})
          </h3>
          {recruiters.length === 0 ? (
            <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 text-center space-y-2">
              <Users2 className="w-6 h-6 text-slate-500 mx-auto" />
              <p className="text-xs font-bold text-slate-300">No Recruiters Added Yet</p>
              <p className="text-[11px] text-slate-500">
                Sync your Gmail or add contacts to generate personalized outreach.
              </p>
            </div>
          ) : (
            recruiters.map((rec) => (
              <div
                key={rec.id}
                onClick={() => {
                  setSelectedRecruiter(rec);
                  generateTemplate(rec, templateType);
                }}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  selectedRecruiter?.id === rec.id
                    ? 'bg-slate-900 border-emerald-500 shadow-md'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between font-bold text-xs text-slate-100">
                  <span>{rec.name}</span>
                  <span className="text-[10px] font-mono text-emerald-400">{rec.status}</span>
                </div>
                <p className="text-[11px] text-slate-400">{rec.company_name} • {rec.role}</p>
              </div>
            ))
          )}
        </div>

        {/* Outreach Generator Console */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Generating For</span>
              <p className="font-extrabold text-sm text-slate-100">
                {selectedRecruiter?.name} ({selectedRecruiter?.company_name})
              </p>
            </div>

            {/* Template Selector Tabs */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
              {[
                { id: 'outreach', label: 'Outreach' },
                { id: 'followup', label: 'Follow-up' },
                { id: 'thank_you', label: 'Thank-You' },
                { id: 'availability', label: 'Availability' }
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setTemplateType(t.id);
                    if (selectedRecruiter) generateTemplate(selectedRecruiter, t.id);
                  }}
                  className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                    templateType === t.id ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {templateOutput && (
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Subject Line</span>
                <p className="font-semibold text-slate-200">{templateOutput.subject}</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300 whitespace-pre-wrap leading-relaxed">
                {templateOutput.body}
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={async () => {
                    if (!selectedRecruiter?.email) {
                      alert('Recruiter email address not available.');
                      return;
                    }
                    if (!confirm(`Send this email to ${selectedRecruiter.email} from kesavac913@gmail.com?`)) return;

                    try {
                      const res = await api.sendOutreachEmail({
                        to_email: selectedRecruiter.email,
                        subject: templateOutput.subject,
                        body: templateOutput.body
                      });
                      alert(res.message || (res.sent ? 'Email Sent Successfully!' : 'Failed to send email. Check Settings.'));
                    } catch (e: any) {
                      alert('Failed to send email: ' + e.message);
                    }
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg transition-colors cursor-pointer"
                  title="Send directly using kesavac913@gmail.com"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Send Direct Email</span>
                </button>

                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied to Clipboard!' : 'Copy Template'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
