import React from 'react';
import {
  LayoutDashboard, User, Compass, Table, Send, Building2, Users2,
  FileText, Briefcase, Mic, Sparkles, GraduationCap, LineChart,
  Bot, BarChart3, BellRing, Trophy, Settings, History, RefreshCw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { BrandLogo } from '../common/BrandLogo';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  counts?: Record<string, number>;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, setCurrentTab, counts }) => {
  const { user, openAuthModal } = useAuth();

  const navGroups = [
    {
      title: 'COMMAND CENTER',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'profile', label: 'Candidate Profile', icon: User, badge: 'Hub' },
        { id: 'discovery', label: 'Job Discovery', icon: Compass, badge: 'New' },
        { id: 'jobs', label: 'Job Tracker', icon: Table, count: counts?.jobs },
        { id: 'applications', label: 'Applications', icon: Send, count: counts?.applications },
        { id: 'follow-ups', label: 'Follow-ups', icon: BellRing, count: counts?.followups },
      ]
    },
    {
      title: 'INTELLIGENCE & AI',
      items: [
        { id: 'career-agent', label: 'Career Agent', icon: Bot, badge: 'AI' },
        { id: 'resumes', label: 'Resume Center & ATS', icon: FileText },
        { id: 'projects', label: 'Projects & Portfolio', icon: Briefcase },
        { id: 'interview-center', label: 'Interview Center', icon: Mic, count: counts?.interviews },
        { id: 'mock-interview', label: 'AI Mock & Pressure', icon: Sparkles, badge: 'Live' },
        { id: 'learning', label: 'Skill Gap & Recall', icon: GraduationCap, count: counts?.learning },
      ]
    },
    {
      title: 'NETWORK & MARKET',
      items: [
        { id: 'companies', label: 'Companies', icon: Building2 },
        { id: 'recruiters', label: 'Recruiter CRM', icon: Users2 },
        { id: 'market', label: 'Market Intelligence', icon: LineChart },
        { id: 'offers', label: 'Offers & CTC', icon: Trophy, count: counts?.offers },
        { id: 'analytics', label: 'Career Analytics', icon: BarChart3 },
      ]
    },
    {
      title: 'SYSTEM',
      items: [
        { id: 'settings', label: 'Settings & Backup', icon: Settings },
        { id: 'audit-logs', label: 'Audit Trail', icon: History },
      ]
    }
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen shrink-0 sticky top-0">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800">
        <BrandLogo
          size="md"
          subtitle={user?.candidate_pool === 'FRESHER' ? 'Campus to Corporate' : user?.candidate_pool === 'EXPERIENCED' ? 'Senior Tech Autopilot' : 'Career Autopilot'}
        />
      </div>

      {/* Target Pill */}
      <div className="mx-3 mt-3 p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between">
        <div className="text-[11px]">
          <span className="text-slate-400">Current: </span>
          <span className="font-semibold text-slate-200">₹{user?.current_ctc_lpa || '3.5'} LPA</span>
        </div>
        <div className="text-[11px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/30">
          🎯 Dream: ₹{user?.target_min_ctc_lpa || '18'}+ LPA
        </div>
      </div>

      {/* Nav list */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-4 text-xs font-medium">
        {navGroups.map((grp) => (
          <div key={grp.title}>
            <p className="px-2 mb-1.5 text-[10px] font-bold uppercase text-slate-500 tracking-wider">
              {grp.title}
            </p>
            <div className="space-y-0.5">
              {grp.items.map((item) => {
                const Icon = item.icon;
                const active = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentTab(item.id)}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left transition-all ${
                      active
                        ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                        : 'text-slate-300 hover:bg-slate-800/70 hover:text-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-slate-950' : 'text-slate-400'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
                        active ? 'bg-slate-950 text-emerald-400' : 'bg-emerald-500/20 text-emerald-300'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                    {typeof item.count === 'number' && item.count > 0 && !item.badge && (
                      <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold ${
                        active ? 'bg-slate-950/30 text-slate-950' : 'bg-slate-800 text-slate-300'
                      }`}>
                        {item.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer Profile */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/50 flex items-center justify-between">
        <div
          onClick={() => setCurrentTab('profile')}
          className="flex items-center gap-2 truncate cursor-pointer group"
        >
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center font-bold text-[11px] text-slate-950 shadow">
            {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="truncate">
            <p className="text-xs font-semibold text-slate-200 group-hover:text-emerald-400 transition-colors truncate">
              {user?.full_name?.split(' ')[0] || 'Candidate'}
            </p>
            <p className="text-[10px] text-slate-400 truncate">
              {user?.target_role || 'Software Engineer'}
            </p>
          </div>
        </div>

        <button
          onClick={openAuthModal}
          title="Switch User / Account"
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
};
