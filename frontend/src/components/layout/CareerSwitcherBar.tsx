import React, { useState } from 'react';
import { Compass, Sparkles, Check, ChevronDown, ArrowRight, Layers, Briefcase, Zap } from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

interface CareerSwitcherBarProps {
  onCareerSwitched?: () => void;
}

export const CareerSwitcherBar: React.FC<CareerSwitcherBarProps> = ({ onCareerSwitched }) => {
  const { user, refreshProfile } = useAuth();
  const [switching, setSwitching] = useState(false);
  const [activeFeedback, setActiveFeedback] = useState<string | null>(null);

  const CAREER_PRESETS = [
    { label: "Full Stack Developer", domain: "SOFTWARE_ENGINEERING", role: "Senior Full Stack Engineer", ctc: 24.0, icon: "💻" },
    { label: "AI / GenAI Engineer", domain: "AI_MACHINE_LEARNING", role: "Generative AI / LLM Engineer", ctc: 28.0, icon: "🤖" },
    { label: "Data Scientist", domain: "DATA_ANALYTICS", role: "Senior Data Scientist", ctc: 22.0, icon: "📊" },
    { label: "Data Engineer", domain: "DATA_ENGINEERING", role: "Staff Data Platform Engineer", ctc: 26.0, icon: "⚡" },
    { label: "DevOps & SRE", domain: "CLOUD_DEVOPS", role: "DevOps & Infrastructure Architect", ctc: 25.0, icon: "☁️" },
    { label: "Cybersecurity Lead", domain: "CYBERSECURITY", role: "Application Security & SOC Lead", ctc: 24.0, icon: "🛡️" }
  ];

  const handleSwitch = async (preset: typeof CAREER_PRESETS[0]) => {
    try {
      setSwitching(true);
      setActiveFeedback(null);
      const res = await api.switchCareerTarget({
        domain_id: preset.domain,
        target_role: preset.role,
        target_min_ctc_lpa: preset.ctc
      });
      setActiveFeedback(res.message || `Switched to ${preset.label}`);
      await refreshProfile();
      if (onCareerSwitched) onCareerSwitched();
      setTimeout(() => setActiveFeedback(null), 4000);
    } catch (err: any) {
      alert('Career switch failed: ' + err.message);
    } finally {
      setSwitching(false);
    }
  };

  return (
    <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-2.5 text-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-cyan-400" />
          <span className="font-extrabold text-slate-200 text-xs tracking-wide uppercase">
            Multi-Career Target Switcher (Active Feed Context)
          </span>
        </div>
        <span className="text-[11px] font-mono text-slate-400">
          Current Target: <strong className="text-emerald-400">{user?.target_role || 'Full Stack Engineer'}</strong> (₹{user?.target_min_ctc_lpa || '24'}L+ LPA)
        </span>
      </div>

      {/* Preset Buttons */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        {CAREER_PRESETS.map((p) => {
          const isCurrent = user?.target_role?.toLowerCase().includes(p.label.toLowerCase()) ||
                            user?.target_role?.toLowerCase().includes(p.role.toLowerCase());

          return (
            <button
              key={p.domain}
              disabled={switching}
              onClick={() => handleSwitch(p)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer text-xs ${
                isCurrent
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <span>{p.icon}</span>
              <span>{p.label}</span>
              {isCurrent && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            </button>
          );
        })}
      </div>

      {activeFeedback && (
        <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-bold animate-in fade-in">
          {activeFeedback}
        </div>
      )}
    </div>
  );
};
