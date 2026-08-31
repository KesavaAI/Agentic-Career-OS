import React from 'react';
import { Flame, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface PriorityBarProps {
  onNavigateTab: (tab: string) => void;
  applyCount?: number;
  followupCount?: number;
  interviewCount?: number;
}

export const PriorityBar: React.FC<PriorityBarProps> = ({
  onNavigateTab,
  applyCount = 4,
  followupCount = 3,
  interviewCount = 1
}) => {
  const { user } = useAuth();
  const roleName = user?.target_role?.split('/')[0]?.trim() || 'Tech';

  return (
    <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border-b border-emerald-500/20 px-6 py-2.5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500 text-slate-950 font-extrabold text-[11px] uppercase tracking-wider shadow-sm">
          <Flame className="w-3.5 h-3.5 fill-slate-950" />
          TODAY'S MISSION
        </span>
        <p className="text-xs font-medium text-slate-200">
          Apply to <strong className="text-emerald-400 font-bold">{applyCount} Tier-A {roleName} roles</strong> • Follow up with <strong className="text-teal-400 font-bold">{followupCount} companies</strong> • Prep for <strong className="text-amber-400 font-bold">{interviewCount} upcoming {interviewCount === 1 ? 'interview' : 'interviews'}</strong>
        </p>
      </div>

      <button
        onClick={() => onNavigateTab('discovery')}
        className="flex items-center gap-1 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
      >
        <span>Execute Daily Action Plan</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
