import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WorkspaceProvider, useWorkspace } from './context/WorkspaceContext';
import { AuthView } from './components/auth/AuthView';
import { AcceptInvitationView } from './components/auth/AcceptInvitationView';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { ToastContainer } from './components/layout/ToastContainer';
import { DevicePreviewBar } from './components/layout/DevicePreviewBar';
import { MobileBottomNav } from './components/layout/MobileBottomNav';

// Modals
import { CreateWithAIModal } from './components/modals/CreateWithAIModal';
import { ManualPostModal } from './components/modals/ManualPostModal';
import { PostDetailModal } from './components/modals/PostDetailModal';
import { TaskDetailModal } from './components/modals/TaskDetailModal';
import { GlobalSearchModal } from './components/modals/GlobalSearchModal';

// Views
import { DashboardView } from './views/DashboardView';
import { BlogView } from './views/BlogView';
import { DesignContentView } from './views/DesignContentView';
import { CopilotView } from './views/CopilotView';
import { AiStudioView } from './views/AiStudioView';
import { ContentCalendarView } from './views/ContentCalendarView';
import { ContentMatrixView } from './views/ContentMatrixView';
import { PostsView } from './views/PostsView';
import { CampaignsView } from './views/CampaignsView';
import { ApprovalsView } from './views/ApprovalsView';
import { TasksKanbanView } from './views/TasksKanbanView';
import { TeamCalendarView } from './views/TeamCalendarView';
import { MyCalendarView } from './views/MyCalendarView';
import { GoogleAdsView } from './views/GoogleAdsView';
import { AnalyticsView } from './views/AnalyticsView';
import { SocialAccountsView } from './views/SocialAccountsView';
import { BrandsView } from './views/BrandsView';
import { TeamView } from './views/TeamView';
import { SettingsView } from './views/SettingsView';
import { QuotesView } from './views/QuotesView';
import { CrmView } from './views/CrmView';

const WorkspaceShell: React.FC = () => {
  const { user, isLoadingAuth } = useAuth();
  const { activeView, isLoading, deviceMode, deviceOrientation } = useWorkspace();

  if (isLoadingAuth) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#09090B] text-white">
        <div className="w-12 h-12 rounded-2xl p12-gold-gradient flex items-center justify-center font-black text-black text-lg shadow-xl shadow-[#D4AF37]/25 animate-pulse mb-3 tracking-tight">
          P12
        </div>
        <p className="text-xs font-bold p12-silver-text tracking-wide uppercase">PIXEL 12 OS</p>
        <span className="text-[11px] text-zinc-400 mt-1">Iniciando plataforma y verificando credenciales...</span>
      </div>
    );
  }

  // If an invitation token is present in the URL and user is not logged in, show the invitation acceptance view
  const inviteToken = new URLSearchParams(window.location.search).get('invite_token');
  if (inviteToken && !user) {
    return <AcceptInvitationView token={inviteToken} />;
  }

  // Route protection: If user is not authenticated, immediately render login/register screen
  if (!user) {
    return <AuthView />;
  }

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#09090B] text-white">
        <div className="w-12 h-12 rounded-2xl p12-gold-gradient flex items-center justify-center font-black text-black text-lg shadow-xl shadow-[#D4AF37]/25 animate-pulse mb-3 tracking-tight">
          P12
        </div>
        <p className="text-xs font-bold p12-silver-text tracking-wide uppercase">PIXEL 12 OS</p>
        <span className="text-[11px] text-zinc-400 mt-1">Cargando datos del espacio de trabajo...</span>
      </div>
    );
  }

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardView />;
      case 'blog':
        return <BlogView />;
      case 'ai-studio':
        return <AiStudioView />;
      case 'design-content':
        return <DesignContentView />;
      case 'copilot':
        return <CopilotView />;
      case 'calendar':
        return <ContentCalendarView />;
      case 'matrix':
        return <ContentMatrixView />;
      case 'posts':
        return <PostsView />;
      case 'campaigns':
        return <CampaignsView />;
      case 'approvals':
        return <ApprovalsView />;
      case 'tasks':
        return <TasksKanbanView />;
      case 'team-calendar':
        return <TeamCalendarView />;
      case 'my-calendar':
        return <MyCalendarView />;
      case 'google-ads':
        return <GoogleAdsView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'social-accounts':
        return <SocialAccountsView />;
      case 'brands':
        return <BrandsView />;
      case 'team':
        return <TeamView />;
      case 'quotes':
        return <QuotesView />;
      case 'crm':
        return <CrmView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  // The inner application workspace (shared between native layout & device preview frame)
  const appContent = (
    <div className="flex h-full w-full overflow-hidden bg-[#0B0B0F] font-sans text-zinc-100 relative">
      {/* Sidebar Navigation (Desk static or Mobile off-canvas drawer) */}
      <Sidebar />

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative">
        <Header />
        <main className="flex-1 overflow-y-auto bg-[#0E0E14] pb-16 lg:pb-0">
          {renderActiveView()}
        </main>
        <div className="hidden lg:block">
          <Footer />
        </div>
      </div>

      {/* Mobile Thumb Navigation Bar */}
      <MobileBottomNav />
    </div>
  );

  // When simulated in Mobile or Tablet Preview Mode on desktop
  const isSimulated = deviceMode === 'mobile' || deviceMode === 'tablet';

  const getDeviceDimensions = () => {
    if (deviceMode === 'mobile') {
      return deviceOrientation === 'portrait'
        ? 'w-[390px] h-[820px]'
        : 'w-[820px] h-[390px]';
    }
    // Tablet
    return deviceOrientation === 'portrait'
      ? 'w-[768px] h-[920px]'
      : 'w-[920px] h-[640px]';
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#09090B] font-sans">
      {/* Device Preview Switcher Bar */}
      <DevicePreviewBar />

      {/* Main View Area */}
      {isSimulated ? (
        <div className="flex-1 flex items-center justify-center p-2 sm:p-6 overflow-auto bg-[#070709] bg-radial from-[#12121C] to-[#070709]">
          {/* Simulated Device Frame */}
          <div
            id="simulated-device-frame"
            className={`${getDeviceDimensions()} max-w-full max-h-[calc(100vh-3.5rem)] bg-[#0B0B0F] rounded-[36px] shadow-2xl border-[10px] border-[#181826] ring-1 ring-[#D4AF37]/30 flex flex-col overflow-hidden relative transition-all duration-300`}
          >
            {/* Simulated Phone/Tablet Top Notch / Dynamic Island */}
            <div className="h-6 bg-[#09090B] w-full flex items-center justify-between px-6 shrink-0 select-none border-b border-[#1C1C2C]">
              <span className="text-[10px] font-bold text-[#E5C158] font-mono">09:41</span>
              <div className="w-20 h-3 bg-black rounded-full mx-auto border border-[#222234]" />
              <div className="flex items-center gap-1.5 text-zinc-300">
                <span className="text-[9px] font-mono font-bold">5G</span>
                <div className="w-3.5 h-2 rounded-[2px] border border-zinc-400 p-0.2 flex items-center">
                  <div className="w-full h-full bg-[#D4AF37] rounded-[1px]" />
                </div>
              </div>
            </div>

            {/* Inner App Canvas */}
            <div className="flex-1 flex flex-col min-h-0 relative overflow-hidden">
              {appContent}
            </div>

            {/* Simulated Home Indicator Bar */}
            <div className="h-4 bg-[#09090B] flex items-center justify-center shrink-0 border-t border-[#181826]">
              <div className="w-32 h-1 bg-[#D4AF37]/60 rounded-full" />
            </div>
          </div>
        </div>
      ) : (
        // Native 100% Fluid Screen Layout
        <div className="flex-1 flex flex-col h-full min-h-0 overflow-hidden relative">
          {appContent}
        </div>
      )}

      {/* Global Modals & Notifications */}
      <CreateWithAIModal />
      <ManualPostModal />
      <PostDetailModal />
      <TaskDetailModal />
      <GlobalSearchModal />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <WorkspaceProvider>
        <WorkspaceShell />
      </WorkspaceProvider>
    </AuthProvider>
  );
}
