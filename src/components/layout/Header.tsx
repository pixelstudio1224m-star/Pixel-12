import React, { useState, useEffect } from 'react';
import { useWorkspace, ViewType } from '../../context/WorkspaceContext';
import {
  Sparkles,
  Plus,
  Search,
  Bell,
  Clock,
  CheckCheck,
  Check,
  Calendar,
  AlertCircle,
  Menu
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    activeView,
    setActiveView,
    activeBrand,
    openCreateWithAI,
    openManualPost,
    openGlobalSearch,
    data,
    updateSettings,
    showToast,
    toggleMobileDrawer
  } = useWorkspace();

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState('');

  // Update clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('es-EC', {
          timeZone: data.workspaceSettings.timezone || 'America/Guayaquil',
          hour: '2-digit',
          minute: '2-digit',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, [data.workspaceSettings.timezone]);

  // Keyboard shortcut Ctrl+K / Cmd+K for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        openGlobalSearch();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [openGlobalSearch]);

  const unreadNotifs = data.notifications.filter((n) => !n.read);

  const viewTitles: Record<ViewType, { title: string; subtitle: string; tag?: string }> = {
    dashboard: {
      title: 'Panel General',
      subtitle: `Visión estratégica y métricas clave para ${activeBrand.name}`,
      tag: 'RESUMEN',
    },
    crm: {
      title: 'CRM & Pipelines Comerciales',
      subtitle: 'Gestión 360° de Leads, Clientes, Pipelines de Ventas, Tareas y Seguimientos con IA',
      tag: 'PIXEL 12 CRM',
    },
    blog: {
      title: 'Blog & Artículos SEO',
      subtitle: 'Una URL o un tema → blog, carrusel, guion e historias con la voz de Pixel 12 listos para publicar',
      tag: 'PIXEL 12',
    },
    'design-content': {
      title: 'Crear diseño y contenido',
      subtitle: 'Elige qué crear, dale un tema y el sistema lo diseña con la identidad Pixel 12 (Negro, Dorado, Plateado y Blanco)',
      tag: 'PIXEL 12',
    },
    copilot: {
      title: 'Copiloto de IA',
      subtitle: 'Asistente creativo para redactar copies, ganchos y guiones en segundos',
      tag: 'INTELIGENCIA ARTIFICIAL',
    },
    calendar: {
      title: 'Calendario Editorial',
      subtitle: 'La parrilla del mes con tus pilares y formatos sincronizados',
      tag: 'ESTRATEGIA MENSUAL',
    },
    matrix: {
      title: 'Matriz de Contenido',
      subtitle: 'Vista en tabla completa, edición masiva y exportación CSV / XLSX',
      tag: 'TABLA DE CONTROL',
    },
    posts: {
      title: 'Publicaciones',
      subtitle: 'Todas las piezas de contenido, estados de aprobación y adaptaciones',
      tag: 'PIEZAS DE CONTENIDO',
    },
    campaigns: {
      title: 'Campañas Estratégicas',
      subtitle: 'Campañas con objetivos, presupuestos, posts y tareas vinculadas',
      tag: 'CAMPAÑAS',
    },
    approvals: {
      title: 'Aprobaciones de Contenido',
      subtitle: 'Revisa, comenta, aprueba o solicita cambios antes de programar',
      tag: 'CONTROL DE CALIDAD',
    },
    tasks: {
      title: 'Tareas del Equipo (Kanban)',
      subtitle: 'Flujo de trabajo para diseñadores, copywriters y community managers',
      tag: 'GESTIÓN DE EQUIPO',
    },
    'team-calendar': {
      title: 'Calendario del Equipo',
      subtitle: 'Fechas de entrega y carga de trabajo distribuida por miembro',
      tag: 'DEADLINES',
    },
    'my-calendar': {
      title: 'Mi Calendario & Tareas',
      subtitle: `Contenido y tareas asignadas directamente a ${data.currentMember.name}`,
      tag: 'MI ESPACIO',
    },
    'google-ads': {
      title: 'Google Ads',
      subtitle: 'Rendimiento de campañas de búsqueda y Performance Max',
      tag: 'PUBLICIDAD',
    },
    analytics: {
      title: 'Métricas & KPIs',
      subtitle: 'Analítica de alcance, interacción y crecimiento multicanal',
      tag: 'ANALYTICS',
    },
    'social-accounts': {
      title: 'Redes Sociales & APIs',
      subtitle: 'Estado de conexión de Instagram, Facebook, LinkedIn, YouTube y TikTok',
      tag: 'INTEGRACIONES',
    },
    brands: {
      title: 'Identidad de Marca & Tono',
      subtitle: 'Paleta, servicios, audiencia y voz de marca para alimentar a la IA',
      tag: 'BRAND KIT',
    },
    team: {
      title: 'Equipo & Roles',
      subtitle: 'Permisos, miembros activos y asignación de responsabilidades',
      tag: 'COLABORACIÓN',
    },
    quotes: {
      title: 'Cotizaciones Pixel 12',
      subtitle: 'Generador de propuestas comerciales de alto impacto, planes de agencia y visuales IA',
      tag: 'COMERCIAL PRO',
    },
    settings: {
      title: 'Configuración del Workspace',
      subtitle: 'Zona horaria, reglas de auto-eliminación y preferencias del sistema',
      tag: 'AJUSTES',
    },
  };

  const currentMeta = viewTitles[activeView] || {
    title: 'Pixel 12 OS',
    subtitle: 'Gestión inteligente de marketing',
  };

  return (
    <header
      id="main-header"
      className="h-14 sm:h-16 bg-[#09090B] border-b border-[#222232] px-3 sm:px-6 lg:px-8 flex items-center justify-between z-20 shrink-0 select-none gap-2"
    >
      {/* Title & Mobile Hamburger */}
      <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
        <button
          id="header-mobile-drawer-btn"
          onClick={toggleMobileDrawer}
          aria-label="Abrir menú de navegación"
          className="lg:hidden p-2 -ml-1 text-zinc-400 hover:text-white hover:bg-[#151520] rounded-lg transition-colors cursor-pointer shrink-0"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2">
            {currentMeta.tag && (
              <span className="text-[9px] sm:text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full bg-[#D4AF37]/15 text-[#E5C158] border border-[#D4AF37]/30 shrink-0">
                {currentMeta.tag}
              </span>
            )}
            <h2 className="text-sm sm:text-base font-extrabold text-white tracking-tight truncate font-display">
              {currentMeta.title}
            </h2>
          </div>
          <p className="text-xs text-zinc-400 font-normal hidden md:block truncate max-w-md">
            {currentMeta.subtitle}
          </p>
        </div>
      </div>

      {/* Center/Right Actions */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        {/* Mobile Quick Search Button */}
        <button
          id="header-mobile-search-btn"
          onClick={openGlobalSearch}
          aria-label="Buscar"
          className="md:hidden p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-[#151520] transition-colors cursor-pointer"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Global Search Button */}
        <button
          id="header-search-btn"
          onClick={openGlobalSearch}
          className="hidden md:flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-[#12121C] hover:bg-[#171724] border border-[#252538] text-xs text-zinc-400 transition-colors w-64 lg:w-80 justify-between cursor-pointer focus:border-[#D4AF37]/50"
        >
          <div className="flex items-center gap-2 truncate">
            <Search className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            <span className="truncate">Buscar campañas, tareas o contenido...</span>
          </div>
          <kbd className="text-[10px] bg-[#1B1B28] px-1.5 py-0.5 rounded-md border border-[#303046] font-mono text-zinc-400 shadow-2xs">
            Ctrl+K
          </kbd>
        </button>

        {/* Timezone Badge */}
        <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#12121C] border border-[#252538] text-[11px] text-zinc-300 font-medium">
          <Clock className="w-3 h-3 text-[#D4AF37]" />
          <span className="font-semibold text-white">{currentTime || '11:00'}</span>
          <span className="text-zinc-600">|</span>
          <span className="text-zinc-400 truncate max-w-[110px]">
            {data.workspaceSettings.timezone.replace('_', ' ')}
          </span>
        </div>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            id="header-notifications-btn"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-[#151520] relative transition-colors cursor-pointer"
            title="Notificaciones"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifs.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#D4AF37] ring-2 ring-[#09090B] animate-pulse" />
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-[#101018] border border-[#2A2A3E] rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="px-4 py-2 border-b border-[#222232] flex items-center justify-between">
                <span className="text-xs font-bold text-white">Notificaciones</span>
                {unreadNotifs.length > 0 && (
                  <button
                    onClick={() => {
                      data.notifications.forEach((n) => (n.read = true));
                      setNotificationsOpen(false);
                      showToast('Todas marcadas como leídas');
                    }}
                    className="text-[11px] text-[#E5C158] hover:underline flex items-center gap-1 font-medium cursor-pointer"
                  >
                    <CheckCheck className="w-3 h-3" />
                    <span>Marcar leídas</span>
                  </button>
                )}
              </div>

              <div className="max-h-64 overflow-y-auto divide-y divide-[#1D1D2C]">
                {data.notifications.length === 0 ? (
                  <div className="px-4 py-6 text-center text-xs text-zinc-400">
                    No hay notificaciones pendientes
                  </div>
                ) : (
                  data.notifications.slice(0, 8).map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => {
                        notif.read = true;
                        setNotificationsOpen(false);
                        if (notif.linkView) {
                          setActiveView(notif.linkView as ViewType);
                        }
                      }}
                      className={`px-4 py-2.5 text-xs hover:bg-[#161622] cursor-pointer transition-colors ${
                        !notif.read ? 'bg-[#D4AF37]/5 font-medium' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-semibold text-zinc-200">{notif.title}</span>
                        <span className="text-[10px] text-zinc-500">
                          {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-zinc-400 text-[11px] leading-relaxed line-clamp-2">{notif.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Quick Pixel 12 Design & Content Button */}
        <button
          id="header-p12-design-btn"
          onClick={() => setActiveView('design-content')}
          className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
            activeView === 'design-content'
              ? 'bg-[#181824] text-[#E5C158] border-[#D4AF37]/50 shadow-xs'
              : 'bg-[#13131D] hover:bg-[#1C1C2A] text-zinc-200 border-[#28283C]'
          }`}
          title="Crear diseño y contenido con identidad Pixel 12"
        >
          <span>🖼️</span>
          <span className="hidden sm:inline">Diseño P12</span>
        </button>

        {/* Primary Star CTA: Crear con IA */}
        <button
          id="header-ai-create-btn"
          onClick={openCreateWithAI}
          className="p12-gold-gradient hover:brightness-105 text-black px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-black flex items-center gap-1.5 sm:gap-2 shadow-md shadow-[#D4AF37]/15 transition-all cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-black fill-black" />
          <span className="hidden xs:inline">Crear con IA</span>
          <span className="xs:hidden">Crear IA</span>
        </button>

        {/* Divider */}
        <div className="hidden sm:block w-px h-6 bg-[#222232]" />

        {/* Secondary CTA: Manual Post */}
        <button
          id="header-manual-create-btn"
          onClick={openManualPost}
          className="hidden sm:block text-zinc-400 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
        >
          Manual Post
        </button>
      </div>
    </header>
  );
};
