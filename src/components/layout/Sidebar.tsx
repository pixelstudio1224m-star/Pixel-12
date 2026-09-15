import React, { useState } from 'react';
import { useWorkspace, ViewType } from '../../context/WorkspaceContext';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Sparkles,
  Calendar,
  Table,
  FileText,
  Megaphone,
  CheckCircle2,
  Kanban,
  CalendarRange,
  UserCheck,
  TrendingUp,
  BarChart3,
  Share2,
  Palette,
  Users,
  Settings,
  Plus,
  ChevronDown,
  Building2,
  LogOut,
  Bell,
  X,
  Wand2,
  BookOpen,
  Receipt,
  Shield
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const {
    data,
    activeView,
    setActiveView,
    activeBrand,
    setActiveBrandId,
    openCreateWithAI,
    isMobileDrawerOpen,
    setIsMobileDrawerOpen
  } = useWorkspace();

  const { user, profile, role, logout, canAccessCrm, canManageSettings, isClient } = useAuth();
  const [brandDropdownOpen, setBrandDropdownOpen] = useState(false);

  const pendingApprovalsCount = data.posts.filter((p) => p.status === 'IN_REVIEW').length;
  const myPendingTasksCount = data.tasks.filter(
    (t) => t.assigneeId === data.currentMember.id && t.status !== 'COMPLETED' && t.status !== 'CANCELLED'
  ).length;
  const activeDealsCount = data.crmDeals ? data.crmDeals.filter((d) => !['LOST', 'WON'].includes(d.stageId)).length : 0;

  // Role-based navigation partitions
  const navGroups = isClient
    ? [
        {
          title: 'PORTAL DE CLIENTE',
          items: [
            { id: 'dashboard' as ViewType, label: 'Inicio', icon: LayoutDashboard },
            {
              id: 'approvals' as ViewType,
              label: 'Aprobaciones',
              icon: CheckCircle2,
              badge: pendingApprovalsCount > 0 ? String(pendingApprovalsCount) : undefined,
              badgeColor: 'bg-[#D4AF37]/20 text-[#E5C158] border-[#D4AF37]/40',
            },
            { id: 'calendar' as ViewType, label: 'Calendario Editorial', icon: Calendar },
            { id: 'campaigns' as ViewType, label: 'Campañas de Marca', icon: Megaphone },
          ],
        },
        {
          title: 'PROPUESTAS & RESULTADOS',
          items: [
            {
              id: 'quotes' as ViewType,
              label: 'Mis Cotizaciones',
              icon: Receipt,
              badge: 'PRO',
              badgeColor: 'bg-[#D4AF37]/20 text-[#E5C158] border-[#D4AF37]/40',
            },
            { id: 'analytics' as ViewType, label: 'Métricas & KPIs', icon: BarChart3 },
          ],
        },
      ]
    : [
        {
          title: 'INICIO',
          items: [
            { id: 'dashboard' as ViewType, label: 'Inicio', icon: LayoutDashboard },
          ],
        },
        {
          title: 'CONTENIDO',
          items: [
            {
              id: 'blog' as ViewType,
              label: 'Blog & Artículos SEO',
              icon: BookOpen,
              badge: 'IA',
              badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
            },
            {
              id: 'design-content' as ViewType,
              label: 'Diseño & Contenido',
              icon: Wand2,
              badge: 'P12',
              badgeColor: 'bg-[#D4AF37]/20 text-[#E5C158] border-[#D4AF37]/40'
            },
            { id: 'copilot' as ViewType, label: 'Copiloto IA', icon: Sparkles, badge: 'IA', badgeColor: 'bg-[#D4AF37]/20 text-[#E5C158] border-[#D4AF37]/40' },
            { id: 'calendar' as ViewType, label: 'Calendario', icon: Calendar },
            { id: 'matrix' as ViewType, label: 'Matriz de Contenido', icon: Table },
            { id: 'posts' as ViewType, label: 'Publicaciones', icon: FileText },
            { id: 'campaigns' as ViewType, label: 'Campañas', icon: Megaphone },
            {
              id: 'approvals' as ViewType,
              label: 'Aprobaciones',
              icon: CheckCircle2,
              badge: pendingApprovalsCount > 0 ? String(pendingApprovalsCount) : undefined,
              badgeColor: 'bg-[#D4AF37]/20 text-[#E5C158] border-[#D4AF37]/40',
            },
          ],
        },
        {
          title: 'EQUIPO',
          items: [
            { id: 'tasks' as ViewType, label: 'Tareas del equipo', icon: Kanban },
            { id: 'team-calendar' as ViewType, label: 'Calendario del equipo', icon: CalendarRange },
            {
              id: 'my-calendar' as ViewType,
              label: 'Mi Calendario',
              icon: UserCheck,
              badge: myPendingTasksCount > 0 ? String(myPendingTasksCount) : undefined,
            },
          ],
        },
        {
          title: 'VENTAS & COMERCIAL',
          items: [
            ...(canAccessCrm
              ? [
                  {
                    id: 'crm' as ViewType,
                    label: 'CRM & Pipeline',
                    icon: Building2,
                    badge: activeDealsCount > 0 ? String(activeDealsCount) : 'PRO',
                    badgeColor: 'bg-[#D4AF37]/20 text-[#E5C158] border-[#D4AF37]/40'
                  },
                ]
              : []),
            {
              id: 'quotes' as ViewType,
              label: 'Cotizaciones Pixel 12',
              icon: Receipt,
              badge: 'PRO',
              badgeColor: 'bg-[#D4AF37]/20 text-[#E5C158] border-[#D4AF37]/40'
            },
            { id: 'google-ads' as ViewType, label: 'Google Ads', icon: TrendingUp },
            { id: 'analytics' as ViewType, label: 'Métricas & KPIs', icon: BarChart3 },
          ],
        },
        {
          title: 'SISTEMA',
          items: [
            { id: 'social-accounts' as ViewType, label: 'Integraciones Redes', icon: Share2 },
            { id: 'brands' as ViewType, label: 'Identidad de Marca', icon: Palette },
            ...(canManageSettings ? [{ id: 'team' as ViewType, label: 'Equipo & Roles', icon: Users }] : []),
            ...(canManageSettings ? [{ id: 'settings' as ViewType, label: 'Configuración', icon: Settings }] : []),
          ],
        },
      ];

  return (
    <>
      {/* Mobile Drawer Backdrop Overlay */}
      {isMobileDrawerOpen && (
        <div
          id="sidebar-backdrop"
          onClick={() => setIsMobileDrawerOpen(false)}
          className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      <aside
        id="main-sidebar"
        className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-[#09090B] text-white flex flex-col h-full border-r border-[#222232] select-none shrink-0 shadow-2xl transition-transform duration-300 ease-in-out lg:static lg:w-64 lg:translate-x-0 ${
          isMobileDrawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 sm:p-5 flex flex-col gap-3 border-b border-[#222232]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg p12-gold-gradient flex items-center justify-center font-black text-black text-xs shadow-md shadow-[#D4AF37]/20 shrink-0 tracking-tighter">
                P12
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-extrabold text-base tracking-tight p12-silver-text leading-none font-display">
                  PIXEL 12 OS
                </span>
                <span className="text-[10px] text-zinc-400 font-medium truncate mt-1">
                  {data.workspaceSettings.agencyType || 'Marketing & Content Studio'}
                </span>
              </div>
            </div>

            {/* Mobile Close Drawer Button */}
            <button
              id="sidebar-close-btn"
              onClick={() => setIsMobileDrawerOpen(false)}
              className="lg:hidden p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
              title="Cerrar menú"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Brand Switcher Button */}
        <div className="relative">
          <button
            id="brand-switcher-btn"
            onClick={() => setBrandDropdownOpen(!brandDropdownOpen)}
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-[#14141E] border border-[#28283A] hover:border-[#D4AF37]/50 text-xs font-medium text-zinc-200 transition-colors"
          >
            <div className="flex items-center gap-2 truncate">
              <Building2 className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
              <span className="truncate">{activeBrand.name}</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
          </button>

          {brandDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-[#101018] border border-[#2A2A3C] rounded-xl shadow-2xl py-1 z-50">
              <div className="px-3 py-1 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                Marcas del Workspace
              </div>
              {data.brands.map((b) => (
                <button
                  key={b.id}
                  onClick={() => {
                    setActiveBrandId(b.id);
                    setBrandDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-[#1A1A28] transition-colors ${
                    b.id === activeBrand.id ? 'text-[#E5C158] font-bold bg-[#171724]' : 'text-zinc-300'
                  }`}
                >
                  <span className="truncate">{b.name}</span>
                  {b.id === activeBrand.id && <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]"></span>}
                </button>
              ))}
              <div className="border-t border-[#222232] mt-1 pt-1">
                <button
                  onClick={() => {
                    setBrandDropdownOpen(false);
                    setActiveView('brands');
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs text-[#E5C158] hover:bg-[#1A1A28] transition-colors flex items-center gap-1.5 font-medium"
                >
                  <Plus className="w-3 h-3" />
                  <span>Configurar identidad de marca</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Navigation List */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
        {navGroups.map((group) => (
          <div key={group.title} className="space-y-1">
            <div className="px-3 py-1 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
              {group.title}
            </div>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    id={`nav-item-${item.id}`}
                    onClick={() => setActiveView(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#181824] text-white border border-[#2D2D42] shadow-xs'
                        : 'text-zinc-400 hover:bg-[#12121C] hover:text-zinc-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon
                        className={`w-4 h-4 transition-colors ${
                          isActive ? 'text-[#D4AF37]' : 'text-zinc-400'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold border ${
                          item.badgeColor || 'bg-[#D4AF37]/20 text-[#E5C158] border-[#D4AF37]/40'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* AI Quick Callout Button in sidebar */}
      <div className="p-3 border-t border-[#222232]">
        <button
          id="sidebar-create-ai-btn"
          onClick={openCreateWithAI}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl p12-gold-gradient hover:brightness-105 text-black text-xs font-black shadow-md shadow-[#D4AF37]/15 transition-all active:scale-[0.99] cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-black fill-black" />
          <span>Crear con IA</span>
        </button>
      </div>

      {/* User Footer Profile & Auth Actions */}
      <div className="p-3 border-t border-[#222232] flex items-center justify-between bg-[#0B0B0F]">
        <div className="flex items-center gap-2.5 overflow-hidden min-w-0">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#1E1E2C] to-[#2E2E44] border border-[#D4AF37]/40 flex items-center justify-center text-xs font-black text-[#E5C158] shrink-0">
            {profile?.displayName
              ? profile.displayName.charAt(0).toUpperCase()
              : user?.email
              ? user.email.charAt(0).toUpperCase()
              : 'U'}
          </div>
          <div className="truncate min-w-0">
            <span className="text-xs font-bold text-zinc-200 block truncate leading-tight">
              {profile?.displayName || user?.displayName || user?.email?.split('@')[0] || 'Usuario'}
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span
                className={`text-[9px] font-black px-1.5 py-0.2 rounded font-mono ${
                  role === 'ADMIN'
                    ? 'bg-[#D4AF37]/20 text-[#E5C158] border border-[#D4AF37]/30'
                    : role === 'TEAM'
                    ? 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                    : 'bg-sky-950 text-sky-400 border border-sky-800'
                }`}
              >
                {role === 'ADMIN' ? 'ADMIN' : role === 'TEAM' ? 'EQUIPO' : 'CLIENTE'}
              </span>
              <span className="text-[10px] text-zinc-400 truncate max-w-[90px]">
                {user?.email}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {canManageSettings && (
            <button
              id="sidebar-settings-shortcut"
              onClick={() => setActiveView('settings')}
              className="p-1.5 text-zinc-400 hover:text-[#D4AF37] hover:bg-[#181824] rounded-lg transition-colors cursor-pointer"
              title="Ajustes del Sistema"
            >
              <Settings className="w-4 h-4" />
            </button>
          )}

          <button
            id="sidebar-logout-btn"
            onClick={logout}
            className="p-1.5 text-zinc-400 hover:text-rose-400 hover:bg-[#1C1418] rounded-lg transition-colors cursor-pointer"
            title="Cerrar sesión segura"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
    </>
  );
};
