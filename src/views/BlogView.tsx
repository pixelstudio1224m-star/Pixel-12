import React, { useState, useMemo } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import { BlogPost } from '../types';
import { CreateBlogModal } from '../components/modals/CreateBlogModal';
import { BlogDetailModal } from '../components/modals/BlogDetailModal';
import {
  BookOpen,
  Sparkles,
  Search,
  Plus,
  Filter,
  CheckCircle2,
  Clock,
  Calendar,
  Share2,
  Edit3,
  Trash2,
  ExternalLink,
  Layers,
  Video,
  FileText,
  SlidersHorizontal,
  ChevronRight,
  TrendingUp,
  Globe
} from 'lucide-react';

export const BlogView: React.FC = () => {
  const {
    blogPosts,
    deleteBlogPost,
    selectedBlog,
    setSelectedBlog,
    isCreateBlogOpen,
    setIsCreateBlogOpen,
    activeBrand,
    showToast
  } = useWorkspace();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'DRAFT' | 'IN_REVIEW' | 'APPROVED' | 'PUBLISHED'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  // Metrics
  const metrics = useMemo(() => {
    const total = blogPosts.length;
    const published = blogPosts.filter((b) => b.status === 'PUBLISHED').length;
    const inReview = blogPosts.filter((b) => b.status === 'IN_REVIEW' || b.status === 'APPROVED').length;
    const avgSeo = total > 0
      ? Math.round(blogPosts.reduce((acc, b) => acc + (b.seo?.score || 90), 0) / total)
      : 92;
    return { total, published, inReview, avgSeo };
  }, [blogPosts]);

  // Categories list
  const categories = useMemo(() => {
    const set = new Set<string>();
    blogPosts.forEach((b) => {
      if (b.category) set.add(b.category);
    });
    return Array.from(set);
  }, [blogPosts]);

  // Filtered posts
  const filteredPosts = useMemo(() => {
    return blogPosts.filter((post) => {
      const matchesSearch =
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (post.seo?.focusKeyword && post.seo.focusKeyword.toLowerCase().includes(searchQuery.toLowerCase())) ||
        post.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'ALL' || post.status === statusFilter;
      const matchesCategory = categoryFilter === 'ALL' || post.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [blogPosts, searchQuery, statusFilter, categoryFilter]);

  const getStatusBadge = (status: BlogPost['status']) => {
    switch (status) {
      case 'PUBLISHED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            Publicado
          </span>
        );
      case 'APPROVED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
            Aprobado
          </span>
        );
      case 'IN_REVIEW':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
            En Revisión
          </span>
        );
      case 'DRAFT':
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-700 text-slate-300 border border-slate-600">
            Borrador
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Value Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-zinc-950 via-zinc-900 to-black border border-[#D4AF37]/30 p-6 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30">
                MÓDULO DE BLOG ESTRATÉGICO & SEO
              </span>
              <span className="text-xs text-zinc-400">
                Pixel 12 OS · Content Engine
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              De una URL o tema a todo tu ecosistema de contenido
            </h1>
            <p className="text-sm text-zinc-300 leading-relaxed">
              Genera artículos de alta autoridad con la voz ejecutiva de Pixel 12, auditados para posicionar en Google y automáticamente adaptados a <strong>carruseles de 5 diapositivas, guiones de Reel y stories</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => setIsCreateBlogOpen(true)}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#D4AF37] hover:bg-[#E5C158] text-black font-bold text-sm shadow-lg shadow-[#D4AF37]/20 transition-all hover:scale-[1.02]"
            >
              <Sparkles className="w-4 h-4 text-black" />
              <span>Generar con IA (URL o Tema)</span>
            </button>
          </div>
        </div>

        {/* Ambient Glow */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800">
          <div className="flex items-center justify-between text-xs text-zinc-400 font-semibold mb-1">
            <span>Total Artículos</span>
            <BookOpen className="w-4 h-4 text-[#D4AF37]" />
          </div>
          <div className="text-2xl font-black text-white">{metrics.total}</div>
          <div className="text-[11px] text-zinc-500 mt-1">Biblioteca editorial activa</div>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800">
          <div className="flex items-center justify-between text-xs text-zinc-400 font-semibold mb-1">
            <span>Publicados en Web</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">{metrics.published}</div>
          <div className="text-[11px] text-zinc-500 mt-1">Indexados en Google</div>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800">
          <div className="flex items-center justify-between text-xs text-zinc-400 font-semibold mb-1">
            <span>En Revisión / Aprobados</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400">{metrics.inReview}</div>
          <div className="text-[11px] text-zinc-500 mt-1">Listos para programar</div>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800">
          <div className="flex items-center justify-between text-xs text-zinc-400 font-semibold mb-1">
            <span>Promedio SEO Score</span>
            <TrendingUp className="w-4 h-4 text-[#D4AF37]" />
          </div>
          <div className="text-2xl font-black text-white">{metrics.avgSeo} <span className="text-xs text-zinc-400 font-normal">/ 100</span></div>
          <div className="text-[11px] text-emerald-400 mt-1">Calidad técnica óptima</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-zinc-900/80 border border-zinc-800 rounded-2xl">
        <div className="flex items-center gap-3 flex-1 min-w-[280px]">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por título, keyword SEO o contenido..."
              className="w-full pl-10 pr-4 py-2 bg-zinc-950/80 border border-zinc-800 rounded-xl text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          {/* Category Dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-zinc-950/80 border border-zinc-800 rounded-xl text-xs text-zinc-300 focus:outline-none focus:border-[#D4AF37]"
          >
            <option value="ALL">Todas las categorías</option>
            {categories.map((cat, i) => (
              <option key={i} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(['ALL', 'PUBLISHED', 'APPROVED', 'IN_REVIEW', 'DRAFT'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                statusFilter === st
                  ? 'bg-zinc-800 text-[#D4AF37] border border-[#D4AF37]/30'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {st === 'ALL' ? 'Todos' : st === 'PUBLISHED' ? 'Publicados' : st === 'APPROVED' ? 'Aprobados' : st === 'IN_REVIEW' ? 'En Revisión' : 'Borradores'}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Articles */}
      {filteredPosts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => (
            <div
              key={post.id}
              className="group bg-zinc-900/90 border border-zinc-800 hover:border-[#D4AF37]/40 rounded-2xl overflow-hidden shadow-lg flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl"
            >
              <div>
                {/* Post Cover & Header */}
                <div className="relative h-48 overflow-hidden bg-zinc-950">
                  <img
                    src={post.featuredImage || "https://images.unsplash.com/photo-1541888946425-d0fbb186156a?w=800&auto=format&fit=crop&q=80"}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-black/40" />
                  
                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-black/70 text-zinc-200 backdrop-blur-sm border border-white/10">
                      {post.category}
                    </span>
                    {getStatusBadge(post.status)}
                  </div>

                  {/* SEO Score Gauge in bottom-right of image */}
                  <div className="absolute bottom-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/80 text-emerald-400 text-xs font-bold backdrop-blur-sm border border-emerald-500/30">
                    <Sparkles className="w-3 h-3" />
                    <span>SEO {post.seo?.score || 94}</span>
                  </div>

                  <div className="absolute bottom-3 left-3 flex items-center gap-1 text-[11px] text-zinc-300 bg-black/60 px-2 py-0.5 rounded backdrop-blur-sm">
                    <Clock className="w-3 h-3" />
                    <span>{post.readTime}</span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 space-y-3">
                  <h3
                    onClick={() => setSelectedBlog(post)}
                    className="text-base font-bold text-white group-hover:text-[#D4AF37] transition-colors line-clamp-2 cursor-pointer leading-snug"
                  >
                    {post.title}
                  </h3>

                  <p className="text-xs text-zinc-400 line-clamp-3 leading-relaxed">
                    {post.excerpt}
                  </p>

                  {/* Multichannel Repurposed Pills */}
                  {post.repurposed && (
                    <div className="pt-2 border-t border-zinc-800/80 flex items-center gap-2 text-[11px] text-zinc-400">
                      <span className="font-semibold text-zinc-500">Redes:</span>
                      {post.repurposed.carousel && (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-950 text-[#D4AF37] border border-[#D4AF37]/30 font-medium">
                          <Layers className="w-3 h-3" />
                          <span>Carrusel (5)</span>
                        </span>
                      )}
                      {post.repurposed.reelScript && (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-950 text-emerald-400 border border-emerald-500/30 font-medium">
                          <Video className="w-3 h-3" />
                          <span>Reel</span>
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer */}
              <div className="px-5 py-4 border-t border-zinc-800/80 bg-zinc-950/60 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img
                    src={post.authorAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80"}
                    alt={post.author}
                    className="w-6 h-6 rounded-full object-cover border border-[#D4AF37]/60"
                  />
                  <div className="text-xs text-zinc-300 font-medium truncate max-w-[120px]">
                    {post.author}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setSelectedBlog(post)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-[#D4AF37] hover:text-black text-xs font-bold text-zinc-200 transition-colors"
                  >
                    <span>Ver / Editar</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => {
                      if (window.confirm('¿Eliminar este artículo de blog?')) {
                        deleteBlogPost(post.id);
                      }
                    }}
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 transition-colors"
                    title="Eliminar artículo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="p-12 text-center rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-[#D4AF37] flex items-center justify-center mx-auto">
            <BookOpen className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">
              No se encontraron artículos de blog
            </h3>
            <p className="text-xs text-zinc-400 max-w-md mx-auto">
              {searchQuery
                ? 'Ningún artículo coincide con tu búsqueda o filtros actuales.'
                : 'Empieza introduciendo un tema o pegando una URL para generar un artículo completo con carrusel de 5 diapositivas, guion de reel y stories con la identidad de Pixel 12.'}
            </p>
          </div>

          <button
            onClick={() => setIsCreateBlogOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#E5C158] text-black font-bold text-xs shadow-md transition-all"
          >
            <Sparkles className="w-4 h-4 text-black" />
            <span>Crear Primer Artículo de Blog</span>
          </button>
        </div>
      )}

      {/* Modals */}
      <CreateBlogModal
        isOpen={isCreateBlogOpen}
        onClose={() => setIsCreateBlogOpen(false)}
      />

      <BlogDetailModal
        post={selectedBlog}
        isOpen={Boolean(selectedBlog)}
        onClose={() => setSelectedBlog(null)}
      />

    </div>
  );
};
