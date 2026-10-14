import React, { useState } from 'react';
import { useWorkspace, ViewType } from '../context/WorkspaceContext';
import { Platform } from '../types';
import { getTaskProgress, TaskProgressBar } from '../components/tasks/TaskProgressBar';
import {
  Sparkles,
  Calendar,
  Table,
  CheckCircle2,
  Kanban,
  FileText,
  Share2,
  ArrowRight,
  TrendingUp,
  Clock,
  AlertCircle,
  Plus,
  MoreHorizontal,
  Wand2,
  BookOpen,
  Crown
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const {
    data,
    activeBrand,
    setActiveView,
    openCreateWithAI,
    openManualPost,
    openPostDetail,
    openTaskDetail
  } = useWorkspace();

  const [platformFilter, setPlatformFilter] = useState<string>('ALL');

  const posts = data?.posts || [];
  const tasks = data?.tasks || [];

  const totalPosts = posts.length;
  const inReviewPosts = posts.filter((p) => p && p.status === 'IN_REVIEW');
  const approvedPosts = posts.filter((p) => p && (p.status === 'APPROVED' || p.status === 'SCHEDULED'));
  const pendingTasks = tasks.filter((t) => t && t.status !== 'COMPLETED' && t.status !== 'CANCELLED');

  const filteredPosts = posts.filter((p) => {
    if (!p) return false;
    if (platformFilter === 'ALL') return true;
    return p.platform === platformFilter;
  });

  const getPlatformBadge = (platform: Platform) => {
    switch (platform) {
      case 'instagram':
        return <span className="bg-pink-950/50 text-pink-300 border border-pink-700/40 px-2 py-0.5 rounded text-[10px] font-bold">INSTAGRAM</span>;
      case 'linkedin':
        return <span className="bg-blue-950/50 text-blue-300 border border-blue-700/40 px-2 py-0.5 rounded text-[10px] font-bold">LINKEDIN</span>;
      case 'youtube':
        return <span className="bg-red-950/50 text-red-300 border border-red-700/40 px-2 py-0.5 rounded text-[10px] font-bold">YOUTUBE</span>;
      case 'tiktok':
        return <span className="bg-zinc-800 text-white border border-zinc-700 px-2 py-0.5 rounded text-[10px] font-bold">TIKTOK</span>;
      case 'facebook':
        return <span className="bg-indigo-950/50 text-indigo-300 border border-indigo-700/40 px-2 py-0.5 rounded text-[10px] font-bold">FACEBOOK</span>;
      default:
        return <span className="bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded text-[10px] font-bold uppercase">{platform}</span>;
    }
  };

  const getStatusDot = (status: string) => {
    switch (status) {
      case 'APPROVED':
      case 'SCHEDULED':
      case 'PUBLISHED':
        return { color: 'bg-emerald-400', label: 'Aprobado' };
      case 'IN_REVIEW':
        return { color: 'bg-amber-400', label: 'En Revisión' };
      case 'CHANGES_REQUESTED':
        return { color: 'bg-orange-400', label: 'Con Cambios' };
      case 'REJECTED':
        return { color: 'bg-rose-500', label: 'Rechazado' };
      default:
        return { color: 'bg-zinc-500', label: 'Borrador' };
    }
  };

  const modules = [
    {
      id: 'design-content' as ViewType,
      title: 'Diseño & Contenido (Pixel 12)',
      tagline: 'Genera carruseles, posts y guiones con identidad Pixel 12 Luxury',
      badge: 'OFICIAL',
      icon: Wand2,
      color: 'p12-gold-gradient text-black',
    },
    {
      id: 'copilot' as ViewType,
      title: 'Copiloto de IA Pixel 12',
      tagline: 'Asistente estratégico de copies, hooks y guiones de alta conversión',
      badge: 'ACTIVO',
      icon: Sparkles,
      color: 'bg-[#181828] text-[#E5C158] border border-[#D4AF37]/30',
    },
    {
      id: 'blog' as ViewType,
      title: 'Blog & Artículos SEO',
      tagline: 'Una URL o tema → artículo SEO, carrusel y guion de Reel en segundos',
      badge: 'IA SEO',
      icon: BookOpen,
      color: 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/30',
    },
    {
      id: 'calendar' as ViewType,
      title: 'Estrategia Mensual',
      tagline: 'Parrilla de contenidos con pilares y formatos sincronizados',
      badge: 'CALENDARIO',
      icon: Calendar,
      color: 'bg-[#181828] text-zinc-300 border border-[#2E2E44]',
    },
    {
      id: 'matrix' as ViewType,
      title: 'Matriz de Contenido',
      tagline: 'Edición rápida en tabla interactiva y exportación CSV',
      badge: 'TABLA',
      icon: Table,
      color: 'bg-[#181828] text-zinc-300 border border-[#2E2E44]',
    },
    {
      id: 'approvals' as ViewType,
      title: 'Aprobación Editorial',
      tagline: `${inReviewPosts.length} pendientes de control de calidad por clientes`,
      badge: inReviewPosts.length > 0 ? `${inReviewPosts.length} PENDIENTES` : 'AL DÍA',
      icon: CheckCircle2,
      color: 'bg-[#181828] text-zinc-300 border border-[#2E2E44]',
    },
    {
      id: 'tasks' as ViewType,
      title: 'Tareas del Equipo',
      tagline: `${pendingTasks.length} tareas activas en el tablero Kanban`,
      badge: 'KANBAN',
      icon: Kanban,
      color: 'bg-[#181828] text-zinc-300 border border-[#2E2E44]',
    },
    {
      id: 'google-ads' as ViewType,
      title: 'Google Ads & Retorno',
      tagline: 'Campañas de búsqueda y Performance Max con tracking de ROAS',
      badge: 'VENTAS',
      icon: TrendingUp,
      color: 'bg-[#181828] text-zinc-300 border border-[#2E2E44]',
    },
  ];

  return (
    <div id="dashboard-view" className="p-3 sm:p-5 md:p-6 lg:p-8 space-y-4 sm:space-y-6 max-w-7xl mx-auto animate-in fade-in duration-150">
      {/* Banner de Acceso Rápido a Crear Diseño y Contenido Pixel 12 Luxury */}
      <div className="bg-gradient-to-r from-[#101018] via-[#141424] to-[#101018] rounded-3xl p-5 sm:p-6 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 border border-[#2A2A3E] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="space-y-1.5 relative z-10">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full p12-gold-gradient text-black text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm">
              <Crown className="w-3 h-3 text-black" />
              IDENTIDAD OFICIAL PIXEL 12
            </span>
            <span className="text-xs text-zinc-400">Marketing Digital & Asistencia Virtual</span>
          </div>
          <h2 className="text-base sm:text-lg font-black text-white font-display">
            Crear diseño y contenido con identidad Pixel 12 Luxury
          </h2>
          <p className="text-xs text-zinc-300 max-w-2xl leading-relaxed">
            Genera carruseles, publicaciones individuales y guiones de reels con la estética Negro Obsidian, Acentos Dorados y Tipografía Editorial Oficial.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 relative z-10 shrink-0">
          <button
            onClick={() => setActiveView('ai-studio')}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-purple-600/25 transition-all cursor-pointer whitespace-nowrap"
          >
            <Sparkles className="w-4 h-4 text-purple-200" />
            <span>Estudio Multimodal IA</span>
          </button>
          <button
            onClick={() => setActiveView('design-content')}
            className="px-4 py-2.5 rounded-2xl p12-gold-gradient text-black font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-[#D4AF37]/20 hover:brightness-105 transition-all cursor-pointer whitespace-nowrap"
          >
            <Wand2 className="w-4 h-4 text-black" />
            <span>Creador Pixel 12</span>
          </button>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-[#101018] border border-[#222234] shadow-md">
          <span className="text-[10px] sm:text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
            Total en Campaña
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl sm:text-2xl font-black text-white font-display">{totalPosts}</span>
            <span className="text-[11px] sm:text-xs text-[#E5C158] font-bold">posts activos</span>
          </div>
          <span className="text-[10px] sm:text-[11px] text-zinc-500 block mt-1 truncate">En {activeBrand.name}</span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-[#101018] border border-[#222234] shadow-md">
          <span className="text-[10px] sm:text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
            Aprobado
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl sm:text-2xl font-black text-emerald-400 font-display">{approvedPosts.length}</span>
            <span className="text-[11px] sm:text-xs text-zinc-400 font-semibold">listos para salir</span>
          </div>
          <span className="text-[10px] sm:text-[11px] text-zinc-500 block mt-1 truncate">Calidad verificada</span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-[#101018] border border-[#222234] shadow-md">
          <span className="text-[10px] sm:text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
            En Revisión
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl sm:text-2xl font-black text-amber-400 font-display">{inReviewPosts.length}</span>
            <span className="text-[11px] sm:text-xs text-amber-400 font-bold">pendientes</span>
          </div>
          <span className="text-[10px] sm:text-[11px] text-zinc-500 block mt-1 truncate">Control de calidad</span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-[#101018] border border-[#222234] shadow-md">
          <span className="text-[10px] sm:text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
            Tareas de Asistencia
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl sm:text-2xl font-black text-white font-display">{pendingTasks.length}</span>
            <span className="text-[11px] sm:text-xs text-zinc-400 font-semibold">en ejecución</span>
          </div>
          <span className="text-[10px] sm:text-[11px] text-zinc-500 block mt-1 truncate">Equipo operativo</span>
        </div>
      </div>

      {/* Main High Density 12-Column Grid */}
      <div className="grid grid-cols-12 gap-4 sm:gap-6">
        {/* Left Column: Scheduled Content Matrix Table (col-span-12 lg:col-span-8) */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-4 sm:gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h2 className="text-base sm:text-lg font-bold text-white font-display">Matriz de Contenido Programado</h2>
            <div className="flex gap-2 flex-wrap">
              <select
                aria-label="Filtrar por plataforma"
                value={platformFilter}
                onChange={(e) => setPlatformFilter(e.target.value)}
                className="bg-[#141420] border border-[#27273C] text-xs px-3 py-1.5 rounded-xl text-zinc-300 outline-none focus:border-[#D4AF37]"
              >
                <option value="ALL">Todas las plataformas</option>
                <option value="instagram">Instagram</option>
                <option value="linkedin">LinkedIn</option>
                <option value="youtube">YouTube</option>
                <option value="tiktok">TikTok</option>
                <option value="facebook">Facebook</option>
              </select>
              <select
                aria-label="Seleccionar periodo"
                className="bg-[#141420] border border-[#27273C] text-xs px-3 py-1.5 rounded-xl text-zinc-300 outline-none focus:border-[#D4AF37]"
              >
                <option>Septiembre 2026</option>
                <option>Octubre 2026</option>
              </select>
            </div>
          </div>

          {/* High Density Table */}
          <div className="bg-[#101018] border border-[#222234] rounded-2xl shadow-xl overflow-hidden flex flex-col">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-[#141420] text-[11px] uppercase text-zinc-400 font-bold border-b border-[#222234]">
                  <tr>
                    <th className="px-4 py-3">Fecha/Hora</th>
                    <th className="px-4 py-3">Red</th>
                    <th className="px-4 py-3">Pilar</th>
                    <th className="px-4 py-3">Formato</th>
                    <th className="px-4 py-3">Estado</th>
                    <th className="px-4 py-3 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1F1F30] text-sm">
                  {(!filteredPosts || filteredPosts.length === 0) ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-xs text-zinc-500">
                        No hay publicaciones programadas con los filtros actuales
                      </td>
                    </tr>
                  ) : (
                    (filteredPosts || []).slice(0, 5).map((post) => {
                      const statusDot = getStatusDot(post.status);
                      return (
                        <tr
                          key={post.id}
                          onClick={() => openPostDetail(post)}
                          className="hover:bg-[#161626] cursor-pointer transition-colors"
                        >
                          <td className="px-4 py-3 font-mono text-xs text-zinc-300 whitespace-nowrap">
                            {post.date} {post.time}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            {getPlatformBadge(post.platform)}
                          </td>
                          <td className="px-4 py-3 font-semibold text-white text-xs max-w-[150px] truncate">
                            {post.pillar}
                          </td>
                          <td className="px-4 py-3 text-xs text-zinc-300 whitespace-nowrap">
                            {post.format}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="flex items-center gap-1.5">
                              <span className={`w-2 h-2 rounded-full ${statusDot.color}`}></span>
                              <span className="text-xs text-zinc-300">{statusDot.label}</span>
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right whitespace-nowrap">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openPostDetail(post);
                              }}
                              className="text-zinc-400 hover:text-[#E5C158] p-1 transition-colors cursor-pointer"
                              title="Detalles"
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-[#141420] border-t border-[#222234] flex items-center justify-between text-xs text-zinc-400 font-medium">
              <p>Mostrando {Math.min(filteredPosts.length, 5)} de {totalPosts} posts de la estrategia mensual.</p>
              <button
                onClick={() => setActiveView('matrix')}
                className="text-[#E5C158] hover:underline font-bold cursor-pointer"
              >
                Ver matriz completa →
              </button>
            </div>
          </div>

          {/* Module Grid */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Módulos del Sistema Pixel 12
              </h3>
              <span className="text-xs text-zinc-400">Herramientas estratégicas y operativas</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {modules.map((mod) => {
                const Icon = mod.icon;
                return (
                  <div
                    key={mod.id}
                    onClick={() => setActiveView(mod.id)}
                    className="group p-4 rounded-2xl bg-[#101018] border border-[#222234] hover:border-[#D4AF37]/50 hover:shadow-lg hover:shadow-[#D4AF37]/5 cursor-pointer transition-all duration-150 space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className={`w-8 h-8 rounded-xl ${mod.color} flex items-center justify-center shadow-xs`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#181826] text-zinc-300 border border-[#2C2C40]">
                        {mod.badge}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-white group-hover:text-[#E5C158] transition-colors">
                        {mod.title}
                      </h4>
                      <p className="text-[11px] text-zinc-400 mt-0.5 line-clamp-1">{mod.tagline}</p>
                    </div>

                    <div className="flex items-center text-[11px] font-bold text-[#E5C158] group-hover:translate-x-1 transition-transform pt-1">
                      <span>Abrir</span>
                      <ArrowRight className="w-3 h-3 ml-1" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Team Activity & Tasks + Quick Analytics */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
          {/* Team Activity & Tasks Card */}
          <div className="bg-[#101018] border border-[#222234] rounded-2xl shadow-xl flex flex-col">
            <div className="p-4 border-b border-[#222234] flex items-center justify-between">
              <h3 className="font-bold text-sm text-white">Actividad y Tareas del Equipo</h3>
              <span className="text-[10px] font-bold bg-[#141420] text-[#E5C158] border border-[#2C2C40] px-2 py-0.5 rounded-full">
                {pendingTasks.length} ACTIVAS
              </span>
            </div>

            <div className="p-4 space-y-3.5 max-h-[310px] overflow-y-auto">
              {(!pendingTasks || pendingTasks.length === 0) ? (
                <div className="text-xs text-zinc-500 text-center py-6">
                  No hay tareas pendientes en el equipo
                </div>
              ) : (
                (pendingTasks || []).slice(0, 4).map((task) => {
                  const barColor =
                    task.priority === 'HIGH'
                      ? 'bg-rose-500'
                      : task.priority === 'MEDIUM'
                      ? 'bg-[#D4AF37]'
                      : 'bg-emerald-400';

                  return (
                    <div
                      key={task.id}
                      onClick={() => openTaskDetail(task)}
                      className="flex gap-3 items-start cursor-pointer group"
                    >
                      <div className={`w-1 ${barColor} rounded-full h-full min-h-[36px] shrink-0`}></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-white group-hover:text-[#E5C158] transition-colors line-clamp-1">
                          {task.title}
                        </p>
                        <p className="text-[10px] text-zinc-400 truncate mt-0.5">
                          {task.assigneeName} · Vence {task.deadlineDate} {task.deadlineTime}
                        </p>
                        <div className="mt-2" onClick={(e) => e.stopPropagation()}>
                          <TaskProgressBar
                            progress={getTaskProgress(task)}
                            taskTitle={task.title}
                            interactive={false}
                            size="sm"
                            showLabel={true}
                          />
                        </div>

                        <div className="flex items-center gap-2 mt-1.5">
                          {task.priority === 'HIGH' ? (
                            <div className="px-2 py-0.5 bg-rose-950/40 rounded text-[9px] text-rose-300 font-bold inline-block border border-rose-800/40">
                              ALTA PRIORIDAD
                            </div>
                          ) : (
                            <div className="px-2 py-0.5 bg-[#181826] rounded text-[9px] text-zinc-300 font-semibold inline-block border border-[#2A2A3E]">
                              PRIORIDAD {task.priority}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="p-3 border-t border-[#222234] bg-[#141420] flex justify-end">
              <button
                onClick={() => setActiveView('tasks')}
                className="text-xs font-bold text-[#E5C158] hover:underline cursor-pointer"
              >
                Ver tablero Kanban →
              </button>
            </div>
          </div>

          {/* Quick Analytics Luxury Widget */}
          <div className="bg-[#101018] text-white border border-[#222234] rounded-2xl shadow-xl flex flex-col p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-black text-[#E5C158] tracking-widest uppercase">
                Métricas Rápidas Pixel 12
              </span>
              <div className="flex items-center gap-1.5 text-[10px] bg-[#181828] border border-[#28283E] px-2.5 py-1 rounded-full text-zinc-300">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                Datos en Vivo
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 flex-1">
              <div className="bg-[#141420] border border-[#222234] rounded-xl p-3">
                <p className="text-[10px] text-zinc-400 font-medium">Alcance Estimado</p>
                <p className="text-xl font-bold text-white mt-0.5">38.4k</p>
                <p className="text-[10px] text-emerald-400 mt-1 font-semibold">+18.5% vs mes anterior</p>
              </div>

              <div className="bg-[#141420] border border-[#222234] rounded-xl p-3">
                <p className="text-[10px] text-zinc-400 font-medium">Contenido Generado</p>
                <p className="text-xl font-bold text-white mt-0.5">{totalPosts}</p>
                <p className="text-[10px] text-[#E5C158] mt-1 font-semibold">100% Calidad Pixel 12</p>
              </div>

              <div className="bg-[#141420] border border-[#222234] rounded-xl p-3 flex flex-col justify-center items-center col-span-2 relative overflow-hidden">
                <div className="text-center z-10 w-full">
                  <p className="text-[10px] text-zinc-400 font-medium">Créditos de Generación IA</p>
                  <p className="text-xl font-bold text-white mt-0.5">8,450 / 10,000</p>
                  <div className="w-full max-w-[220px] h-1.5 bg-zinc-800 rounded-full mt-2 overflow-hidden mx-auto">
                    <div className="w-[84%] h-full p12-gold-gradient rounded-full"></div>
                  </div>
                </div>
                <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-[#D4AF37]/10 blur-2xl rounded-full pointer-events-none"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
