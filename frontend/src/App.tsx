import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { PriorityBar } from './components/layout/PriorityBar';
import { DashboardView } from './components/views/DashboardView';
import { ProfileView } from './components/views/ProfileView';
import { DiscoveryView } from './components/views/DiscoveryView';
import { JobsTableView } from './components/views/JobsTableView';
import { ApplicationsView } from './components/views/ApplicationsView';
import { CompaniesView } from './components/views/CompaniesView';
import { RecruitersView } from './components/views/RecruitersView';
import { ResumesView } from './components/views/ResumesView';
import { ProjectsView } from './components/views/ProjectsView';
import { InterviewCenterView } from './components/views/InterviewCenterView';
import { MockInterviewView } from './components/views/MockInterviewView';
import { LearningView } from './components/views/LearningView';
import { MarketIntelligenceView } from './components/views/MarketIntelligenceView';
import { CareerAgentView } from './components/views/CareerAgentView';
import { AnalyticsView } from './components/views/AnalyticsView';
import { FollowupsView } from './components/views/FollowupsView';
import { OffersView } from './components/views/OffersView';
import { SettingsView } from './components/views/SettingsView';
import { AuditLogsView } from './components/views/AuditLogsView';
import { PrepareApplicationModal } from './components/views/PrepareApplicationModal';
import { IngestJobModal } from './components/views/IngestJobModal';
import { AuthModal } from './components/auth/AuthModal';
import { LandingPage } from './components/landing/LandingPage';
import { AuthProvider, useAuth } from './context/AuthContext';
import { api } from './lib/api';

function MainLayout() {
  const { user, token, isLoading } = useAuth();
  const [currentTab, setCurrentTab] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam === 'interviews') return 'interview-center';
      return tabParam || 'dashboard';
    } catch {
      return 'dashboard';
    }
  });
  const [prepareJobId, setPrepareJobId] = useState<number | null>(null);
  const [isIngestModalOpen, setIsIngestModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState<any[]>([]);

  const [counts, setCounts] = useState<Record<string, number>>({});

  const loadNotifications = async () => {
    try {
      const data = await api.getNotifications();
      setNotifications(data || []);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  };

  const loadLiveCounts = async () => {
    try {
      const [funnelData, prioritiesData] = await Promise.all([
        api.getFunnelAnalytics().catch(() => null),
        api.getTodayPriorities().catch(() => null)
      ]);
      setCounts({
        jobs: funnelData?.jobs_found ?? 0,
        applications: funnelData?.applications_submitted ?? 0,
        followups: prioritiesData?.summary_count?.follow_ups ?? 0,
        interviews: funnelData?.interviews_attended ?? 0,
        learning: prioritiesData?.summary_count?.learn_topics ?? 0,
        offers: funnelData?.offers_received ?? 0
      });
    } catch (err) {
      console.error('Failed to load live counts:', err);
    }
  };

  const handleOpenPrepare = (jobId: number) => {
    setPrepareJobId(jobId);
  };

  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam === 'interviews') setCurrentTab('interview-center');
      else if (tabParam) setCurrentTab(tabParam);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    if (token && user) {
      loadNotifications();
      loadLiveCounts();
    }
  }, [token, user, currentTab]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentTab]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 space-y-3">
        <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold">Initializing Agentic Career OS...</p>
      </div>
    );
  }

  // If visitor is not authenticated, show Brand Homepage
  if (!token || !user) {
    return <LandingPage />;
  }

  const renderActiveView = () => {
    switch (currentTab) {
      case 'dashboard':
        return <DashboardView onNavigateTab={setCurrentTab} onOpenPrepare={handleOpenPrepare} />;
      case 'profile':
        return <ProfileView />;
      case 'discovery':
        return <DiscoveryView onOpenPrepare={handleOpenPrepare} onOpenIngest={() => setIsIngestModalOpen(true)} />;
      case 'jobs':
        return <JobsTableView onOpenPrepare={handleOpenPrepare} onOpenIngest={() => setIsIngestModalOpen(true)} />;
      case 'applications':
        return <ApplicationsView />;
      case 'companies':
        return <CompaniesView />;
      case 'recruiters':
        return <RecruitersView />;
      case 'resumes':
        return <ResumesView />;
      case 'projects':
        return <ProjectsView />;
      case 'interview-center':
      case 'interviews':
        return <InterviewCenterView onNavigateTab={setCurrentTab} />;
      case 'mock-interview':
        return <MockInterviewView />;
      case 'learning':
        return <LearningView />;
      case 'market':
        return <MarketIntelligenceView />;
      case 'career-agent':
        return <CareerAgentView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'follow-ups':
        return <FollowupsView />;
      case 'offers':
        return <OffersView />;
      case 'settings':
        return <SettingsView />;
      case 'audit-logs':
        return <AuditLogsView />;
      default:
        return <DashboardView onNavigateTab={setCurrentTab} onOpenPrepare={handleOpenPrepare} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-emerald-500 selection:text-white">
      {/* Sidebar Navigation */}
      <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} counts={counts} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          onQuickIngest={() => setIsIngestModalOpen(true)}
          notifications={notifications}
          onOpenNotifications={() => {}}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onNavigateTab={setCurrentTab}
        />

        <PriorityBar
          onNavigateTab={setCurrentTab}
          applyCount={4}
          followupCount={3}
          interviewCount={1}
        />

        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {renderActiveView()}
          </div>
        </main>
      </div>

      {/* Modals */}
      {prepareJobId && (
        <PrepareApplicationModal
          jobId={prepareJobId}
          onClose={() => setPrepareJobId(null)}
          onApplicationCreated={() => {
            loadNotifications();
            setCurrentTab('applications');
          }}
        />
      )}

      <IngestJobModal
        isOpen={isIngestModalOpen}
        onClose={() => setIsIngestModalOpen(false)}
        onJobIngested={() => {
          loadNotifications();
          setCurrentTab('jobs');
        }}
      />

      <AuthModal />
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}

export default App;
