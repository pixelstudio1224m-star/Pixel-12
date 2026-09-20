import React, { useState, useMemo } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import { Post, ContentFormat, PostStatus } from '../types';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Sparkles,
  Filter,
  Instagram,
  Facebook,
  Linkedin,
  Clock,
  CheckCircle2,
  AlertCircle,
  Eye,
  X,
  Layers,
  Coins,
  ArrowRight,
  Building2
} from 'lucide-react';
import { ScheduleContentModal } from '../components/calendar/ScheduleContentModal';

export const ContentCalendarView: React.FC = () => {
  const { data, activeBrand, openPostDetail, openManualPost, openCreateWithAI, updatePost, showToast } =
    useWorkspace();

  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(8); // 8 = September (0-indexed)
  const [formatFilter, setFormatFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [brandFilter, setBrandFilter] = useState<string>('ALL'); // 'ALL' or specific brandId
  const [viewMode, setViewMode] = useState<'month' | 'list'>('month');
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduleModalDate, setScheduleModalDate] = useState<string>('');
  const [selectedDayModal, setSelectedDayModal] = useState<{
    dayNumber: number;
    dateString: string;
    posts: Post[];
  } | null>(null);

  const monthNames = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  // Filter posts
  const filteredPosts = useMemo(() => {
    const posts = data?.posts || [];
    return posts.filter((p) => {
      if (!p) return false;
      if (brandFilter !== 'ALL' && p.brandId !== brandFilter) return false;
      if (formatFilter !== 'ALL' && p.format !== formatFilter) return false;
      if (statusFilter !== 'ALL' && p.status !== statusFilter) return false;
      return true;
    });
  }, [data?.posts, brandFilter, formatFilter, statusFilter]);

  // Calendar Grid Calculation (Monday to Sunday)
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);

    // In JS, 0 = Sunday, 1 = Monday. We want 0 = Monday, ..., 6 = Sunday.
    let startDayOfWeek = firstDayOfMonth.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6;

    const daysInMonth = lastDayOfMonth.getDate();

    const days: Array<{
      dateString: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      posts: Post[];
    }> = [];

    // Leading days from previous month
    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const prevDay = prevMonthLastDay - i;
      const prevMonthStr = String(currentMonth === 0 ? 12 : currentMonth).padStart(2, '0');
      const prevYearStr = currentMonth === 0 ? currentYear - 1 : currentYear;
      const dateStr = `${prevYearStr}-${prevMonthStr}-${String(prevDay).padStart(2, '0')}`;
      days.push({
        dateString: dateStr,
        dayNumber: prevDay,
        isCurrentMonth: false,
        posts: [],
      });
    }

    // Days of current month
    for (let d = 1; d <= daysInMonth; d++) {
      const monthStr = String(currentMonth + 1).padStart(2, '0');
      const dayStr = String(d).padStart(2, '0');
      const dateStr = `${currentYear}-${monthStr}-${dayStr}`;

      const daysPosts = filteredPosts.filter((p) => p.date === dateStr);
      days.push({
        dateString: dateStr,
        dayNumber: d,
        isCurrentMonth: true,
        posts: daysPosts,
      });
    }

    // Trailing days to fill 35 or 42 grid cells
    const remaining = (7 - (days.length % 7)) % 7;
    for (let r = 1; r <= remaining; r++) {
      const nextMonthStr = String(currentMonth === 11 ? 1 : currentMonth + 2).padStart(2, '0');
      const nextYearStr = currentMonth === 11 ? currentYear + 1 : currentYear;
      const dateStr = `${nextYearStr}-${nextMonthStr}-${String(r).padStart(2, '0')}`;
      days.push({
        dateString: dateStr,
        dayNumber: r,
        isCurrentMonth: false,
        posts: [],
      });
    }

    return days;
  }, [currentYear, currentMonth, filteredPosts]);

  const formatBadgeColors: Partial<Record<ContentFormat, { bg: string; text: string; border: string }>> = {
    Carousel: { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200' },
    Reel: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
    'Static Post': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
    'LinkedIn Post': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    Story: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
    Short: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
    Video: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
    'Text Post': { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' },
    'YouTube Video': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
    'YouTube Short': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  };

  const statusDots: Record<PostStatus, string> = {
    DRAFT: 'bg-amber-400',
    IN_REVIEW: 'bg-indigo-500',
    CHANGES_REQUESTED: 'bg-rose-500',
    APPROVED: 'bg-emerald-500',
    SCHEDULED: 'bg-sky-500',
    PUBLISHED: 'bg-emerald-600 ring-2 ring-emerald-300',
    REJECTED: 'bg-red-600',
    FAILED: 'bg-rose-600',
  };

  const dayLabels = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  return (
    <div id="content-calendar-view" className="p-3 sm:p-5 md:p-6 lg:p-8 space-y-4 max-w-7xl mx-auto">
      {/* Calendar Control Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-xs">
        {/* Month Navigation */}
        <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-3 flex-wrap">
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrevMonth}
              aria-label="Mes anterior"
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 px-1 sm:px-2 min-w-[140px] sm:min-w-[170px] text-center">
              {monthNames[currentMonth]} {currentYear}
            </h3>
            <button
              onClick={handleNextMonth}
              aria-label="Mes siguiente"
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => {
              setCurrentYear(2026);
              setCurrentMonth(8);
            }}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            Hoy
          </button>
        </div>

        {/* Filters & Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Brand/Client Filter */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-300 rounded-lg px-2 py-1">
            <Building2 className="w-3.5 h-3.5 text-[#D4AF37]" />
            <select
              aria-label="Filtrar por cliente"
              value={brandFilter}
              onChange={(e) => setBrandFilter(e.target.value)}
              className="text-xs font-semibold bg-transparent outline-none text-slate-800"
            >
              <option value="ALL">Todas las Marcas</option>
              {(data?.brands || []).map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* Format filter */}
          <select
            aria-label="Filtrar por formato"
            value={formatFilter}
            onChange={(e) => setFormatFilter(e.target.value)}
            className="text-xs font-medium p-1.5 sm:p-2 rounded-lg border border-slate-300 bg-white outline-none"
          >
            <option value="ALL">Formatos</option>
            <option value="Carousel">Carruseles</option>
            <option value="Reel">Reels</option>
            <option value="Static Post">Posts estáticos</option>
            <option value="LinkedIn Post">LinkedIn</option>
            <option value="Story">Historias</option>
          </select>

          {/* Status filter */}
          <select
            aria-label="Filtrar por estado"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs font-medium p-1.5 sm:p-2 rounded-lg border border-slate-300 bg-white outline-none"
          >
            <option value="ALL">Estados</option>
            <option value="DRAFT">Borradores</option>
            <option value="IN_REVIEW">En revisión</option>
            <option value="APPROVED">Aprobados</option>
            <option value="SCHEDULED">Programados</option>
            <option value="PUBLISHED">Publicados</option>
          </select>

          {/* View mode toggle */}
          <div className="flex rounded-lg border border-slate-300 overflow-hidden bg-slate-50 p-0.5">
            <button
              onClick={() => setViewMode('month')}
              className={`px-2.5 py-1 text-xs font-bold rounded-md transition-colors cursor-pointer ${
                viewMode === 'month' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500'
              }`}
            >
              Mes
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-2.5 py-1 text-xs font-bold rounded-md transition-colors cursor-pointer ${
                viewMode === 'list' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500'
              }`}
            >
              Lista
            </button>
          </div>

          <button
            onClick={() => {
              setScheduleModalDate('');
              setIsScheduleModalOpen(true);
            }}
            className="px-3.5 py-1.5 text-xs font-bold rounded-xl p12-gold-gradient text-black shadow-xs flex items-center gap-1.5 hover:brightness-105 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-black" />
            <span>Programar</span>
          </button>

          <button
            onClick={openCreateWithAI}
            className="hidden sm:flex px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-900 text-white shadow-xs items-center gap-1.5 hover:bg-slate-800 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Crear IA</span>
          </button>
        </div>
      </div>

      {/* View Mode: Month Grid */}
      {viewMode === 'month' ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-center py-2 text-[11px] sm:text-xs font-bold text-slate-600">
            {dayLabels.map((day, idx) => (
              <div key={idx} className="tracking-wide">
                <span className="hidden sm:inline">{day}</span>
                <span className="sm:hidden">{day.slice(0, 3)}</span>
              </div>
            ))}
          </div>

          {/* Calendar Grid Cells */}
          <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100 bg-slate-100">
            {calendarDays.map((cell, idx) => {
              const isToday = cell.dateString === '2026-09-03';
              const hasPosts = cell.posts.length > 0;
              return (
                <div
                  key={idx}
                  onClick={() => {
                    if (hasPosts) {
                      setSelectedDayModal({
                        dayNumber: cell.dayNumber,
                        dateString: cell.dateString,
                        posts: cell.posts
                      });
                    } else if (cell.isCurrentMonth) {
                      setScheduleModalDate(cell.dateString);
                      setIsScheduleModalOpen(true);
                    }
                  }}
                  className={`min-h-[90px] sm:min-h-[110px] md:min-h-[130px] p-1.5 sm:p-2 flex flex-col justify-between transition-colors group relative cursor-pointer ${
                    cell.isCurrentMonth ? 'bg-white hover:bg-slate-50/80' : 'bg-slate-50/70 opacity-50'
                  } ${hasPosts ? 'hover:ring-1 hover:ring-[#D4AF37]' : ''}`}
                >
                  {/* Cell Day Header */}
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full transition-transform group-hover:scale-105 ${
                          isToday
                            ? 'p12-gold-gradient text-black shadow-xs font-black'
                            : cell.isCurrentMonth
                            ? 'text-slate-800'
                            : 'text-slate-400'
                        }`}
                      >
                        {cell.dayNumber}
                      </span>
                      {hasPosts && (
                        <span className="text-[10px] font-bold text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                          Ver ({cell.posts.length})
                        </span>
                      )}
                    </div>

                    {/* Quick Add Button on Hover */}
                    {cell.isCurrentMonth && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setScheduleModalDate(cell.dateString);
                          setIsScheduleModalOpen(true);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-black hover:bg-[#D4AF37] rounded transition-all cursor-pointer"
                        title="Programar contenido en este día"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {/* Post Chips in this day */}
                  <div className="flex-1 space-y-1 overflow-y-auto max-h-24">
                    {cell.posts.map((post) => {
                      const badgeStyle = formatBadgeColors[post.format] || {
                        bg: 'bg-slate-50',
                        text: 'text-slate-700',
                        border: 'border-slate-200',
                      };
                      const hasSlides = post.slides && post.slides.length > 0;
                      return (
                        <div
                          key={post.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            openPostDetail(post);
                          }}
                          className={`p-1.5 rounded-lg border text-left cursor-pointer transition-all hover:scale-[1.02] shadow-2xs ${badgeStyle.bg} ${badgeStyle.border}`}
                        >
                          <div className="flex items-center justify-between gap-1 mb-0.5">
                            <div className="flex items-center gap-1 truncate">
                              <span
                                className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                  statusDots[post.status] || 'bg-slate-400'
                                }`}
                              />
                              <span className={`text-[9px] font-extrabold uppercase ${badgeStyle.text}`}>
                                {post.format}
                              </span>
                            </div>
                            <span className="text-[9px] text-slate-400 font-medium shrink-0">
                              {post.time}
                            </span>
                          </div>

                          <p className="text-[10px] font-bold text-slate-900 line-clamp-1 leading-tight">
                            {post.internalTitle}
                          </p>

                          {/* Indicator: Has generated slides or needs generation */}
                          <div className="mt-1 flex items-center justify-between gap-1">
                            {hasSlides ? (
                              <span className="text-[8px] font-bold px-1 py-0.2 rounded bg-emerald-100 text-emerald-800 flex items-center gap-0.5">
                                <Layers className="w-2.5 h-2.5" />
                                <span>6 slides</span>
                              </span>
                            ) : (
                              <span className="text-[8px] font-bold px-1 py-0.2 rounded bg-amber-100 text-amber-800 flex items-center gap-0.5">
                                <Sparkles className="w-2.5 h-2.5" />
                                <span>Sin imágenes</span>
                              </span>
                            )}
                            <span className="text-[8px] font-semibold text-sky-600 hover:underline">
                              Ver completo
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* View Mode: Chronological List */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs divide-y divide-slate-100">
          {filteredPosts.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400">
              No hay publicaciones que coincidan con los filtros.
            </div>
          ) : (
            filteredPosts.map((post) => (
              <div
                key={post.id}
                onClick={() => openPostDetail(post)}
                className="p-4 hover:bg-slate-50/80 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-sky-100 text-sky-800">
                      {post.format}
                    </span>
                    <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                      {post.pillar}
                    </span>
                    <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {post.date} a las {post.time}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900">{post.internalTitle}</h4>
                  <p className="text-xs text-slate-600 line-clamp-1 italic">"{post.hook}"</p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {post.slides && post.slides.length > 0 ? (
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200 flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5" />
                      6 slides
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded-md border border-amber-200 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      Generar diseño
                    </span>
                  )}
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      post.status === 'APPROVED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : post.status === 'IN_REVIEW'
                        ? 'bg-indigo-100 text-indigo-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {post.status}
                  </span>
                  <span className="text-xs font-bold text-sky-600 hover:underline flex items-center gap-0.5">
                    Ver completo →
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: PINCHAR EL DÍA → VER COMPLETO (Flujo de la Matriz de Contenido)   */}
      {/* ========================================================================= */}
      {selectedDayModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-fadeIn">
            {/* Modal Header */}
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold bg-orange-500 text-white px-2 py-0.5 rounded-md">
                    DÍA {selectedDayModal.dayNumber}
                  </span>
                  <h3 className="text-base font-bold text-white">
                    {monthNames[currentMonth]} {currentYear}
                  </h3>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  {(selectedDayModal.posts || []).length} publicación(es) programada(s) para esta fecha
                </p>
              </div>

              <button
                onClick={() => setSelectedDayModal(null)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Banner de ayuda del flujo matriz */}
            <div className="p-4 bg-amber-50/90 border-b border-amber-200 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
              <div className="text-xs text-amber-950 leading-relaxed">
                <strong>Flujo de la Matriz:</strong> Las piezas llegan al calendario con el copy y la hora, pero sin imágenes. Pulsa <strong>"Ver completo"</strong> para abrirlas y generar el carrusel o post con IA.
              </div>
            </div>

            {/* Lista de publicaciones del día */}
            <div className="p-5 max-h-[60vh] overflow-y-auto space-y-3">
              {(selectedDayModal.posts || []).map((post) => {
                const hasSlides = post.slides && post.slides.length > 0;
                return (
                  <div
                    key={post.id}
                    className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 shadow-xs space-y-3 transition-all"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800">
                          {post.format}
                        </span>
                        <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {post.time}
                        </span>
                      </div>

                      {hasSlides ? (
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          6 Slides Listas
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                          Sin imágenes aún
                        </span>
                      )}
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-900 leading-snug">
                        {post.internalTitle}
                      </h4>
                      {post.hook && (
                        <p className="text-xs text-slate-600 italic mt-0.5">"{post.hook}"</p>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <span className="text-xs text-slate-500 font-medium">
                        Canales: {post.platforms.join(', ')}
                      </span>

                      {/* Botón Ver completo */}
                      <button
                        onClick={() => {
                          setSelectedDayModal(null);
                          openPostDetail(post);
                        }}
                        className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer ${
                          hasSlides
                            ? 'bg-slate-900 hover:bg-slate-800 text-white'
                            : 'bg-amber-400 hover:bg-amber-500 text-slate-950'
                        }`}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Ver completo</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => {
                  const dayDate = selectedDayModal.dateString;
                  setSelectedDayModal(null);
                  setScheduleModalDate(dayDate);
                  setIsScheduleModalOpen(true);
                }}
                className="px-3.5 py-1.5 rounded-xl p12-gold-gradient text-black text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-black" />
                <span>Programar en este día</span>
              </button>
              <button
                onClick={() => setSelectedDayModal(null)}
                className="px-4 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Central Content Scheduling Modal */}
      <ScheduleContentModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        initialData={{
          date: scheduleModalDate,
          brandId: brandFilter !== 'ALL' ? brandFilter : activeBrand.id,
        }}
        onScheduled={() => {
          showToast('Publicación y tarea programadas con éxito en el calendario', 'success');
        }}
      />
    </div>
  );
};
