import React from 'react';
import { useWorkspace, ViewType } from '../../context/WorkspaceContext';
import {
  LayoutDashboard,
  Sparkles,
  Calendar,
  Kanban,
  Menu,
  Wand2
} from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const { activeView, setActiveView, toggleMobileDrawer, isMobileDrawerOpen, data } = useWorkspace();

  const pendingTasksCount = (data?.tasks || []).filter(
    (t) => t && t.status !== 'COMPLETED' && t.status !== 'CANCELLED'
  ).length;

  const navItems = [
    { id: 'dashboard' as ViewType, label: 'Inicio', icon: LayoutDashboard },
    { id: 'design-content' as ViewType, label: 'Diseño P12', icon: Wand2, badge: 'IA' },
    { id: 'copilot' as ViewType, label: 'Copiloto', icon: Sparkles },
    { id: 'calendar' as ViewType, label: 'Parrilla', icon: Calendar },
  ];

  return (
    <nav
      id="mobile-bottom-navigation"
      aria-label="Navegación móvil inferior"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#09090B]/95 backdrop-blur-md border-t border-[#222232] px-2 py-1.5 flex items-center justify-around shadow-2xl select-none"
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeView === item.id && !isMobileDrawerOpen;
        return (
          <button
            key={item.id}
            id={`mobile-nav-${item.id}`}
            onClick={() => setActiveView(item.id)}
            className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all cursor-pointer relative ${
              isActive ? 'text-[#E5C158] font-bold' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <div className="relative">
              <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 text-[#D4AF37]' : ''}`} />
              {item.badge && (
                <span className="absolute -top-1 -right-2 px-1 py-0.2 text-[9px] font-black rounded-full bg-[#D4AF37] text-black leading-none">
                  {item.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-1 tracking-tight leading-none truncate max-w-[64px]">
              {item.label}
            </span>
            {isActive && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] mt-0.5" />
            )}
          </button>
        );
      })}

      {/* Menu Drawer Toggle Button */}
      <button
        id="mobile-nav-menu-toggle"
        onClick={toggleMobileDrawer}
        className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all cursor-pointer ${
          isMobileDrawerOpen ? 'text-[#E5C158] font-bold' : 'text-zinc-400 hover:text-zinc-200'
        }`}
      >
        <div className="relative">
          <Menu className={`w-5 h-5 transition-transform ${isMobileDrawerOpen ? 'scale-110 text-[#D4AF37]' : ''}`} />
        </div>
        <span className="text-[10px] mt-1 tracking-tight leading-none">Menú</span>
        {isMobileDrawerOpen && (
          <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] mt-0.5" />
        )}
      </button>
    </nav>
  );
};
