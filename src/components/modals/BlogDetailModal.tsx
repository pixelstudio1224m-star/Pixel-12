import React, { useState } from 'react';
import { BlogPost } from '../../types';
import { useWorkspace } from '../../context/WorkspaceContext';
import {
  X,
  Edit3,
  Eye,
  CheckCircle2,
  Copy,
  Download,
  Share2,
  Search,
  BookOpen,
  Calendar,
  Clock,
  User,
  Sparkles,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  Video,
  Layers,
  Code,
  Globe,
  Check,
  Smartphone,
  Monitor,
  HelpCircle,
  Hash,
  ArrowUpRight
} from 'lucide-react';

interface BlogDetailModalProps {
  post: BlogPost | null;
  isOpen: boolean;
  onClose: () => void;
}

export const BlogDetailModal: React.FC<BlogDetailModalProps> = ({ post, isOpen, onClose }) => {
  const { updateBlogPost, deleteBlogPost, addPost, showToast } = useWorkspace();

  const [activeTab, setActiveTab] = useState<'article' | 'seo' | 'repurpose' | 'faq'>('article');
  const [isEditing, setIsEditing] = useState(false);
  
  // Local edit states
  const [editedTitle, setEditedTitle] = useState('');
  const [editedExcerpt, setEditedExcerpt] = useState('');
  const [editedContent, setEditedContent] = useState('');
  const [editedCategory, setEditedCategory] = useState('');
  const [editedMetaTitle, setEditedMetaTitle] = useState('');
  const [editedMetaDesc, setEditedMetaDesc] = useState('');
  const [editedSlug, setEditedSlug] = useState('');
  const [editedKeyword, setEditedKeyword] = useState('');

  // Repurposing slide viewer
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [repurposeTab, setRepurposeTab] = useState<'carousel' | 'reel' | 'stories' | 'linkedin'>('carousel');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Initialize editing state when post changes
  React.useEffect(() => {
    if (post) {
      setEditedTitle(post.title);
      setEditedExcerpt(post.excerpt);
      setEditedContent(post.content);
      setEditedCategory(post.category);
      setEditedMetaTitle(post.seo?.metaTitle || post.title);
      setEditedMetaDesc(post.seo?.metaDescription || post.excerpt);
      setEditedSlug(post.slug);
      setEditedKeyword(post.seo?.focusKeyword || '');
      setActiveSlideIndex(0);
    }
  }, [post]);

  if (!isOpen || !post) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showToast('Copiado al portapapeles', 'info');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSaveEdits = async () => {
    try {
      await updateBlogPost(post.id, {
        title: editedTitle,
        excerpt: editedExcerpt,
        content: editedContent,
        category: editedCategory,
        slug: editedSlug,
        seo: {
          ...post.seo,
          metaTitle: editedMetaTitle,
          metaDescription: editedMetaDesc,
          focusKeyword: editedKeyword
        }
      });
      setIsEditing(false);
    } catch (e) {
      // error handled in context
    }
  };

  const handleStatusChange = async (newStatus: BlogPost['status']) => {
    await updateBlogPost(post.id, { status: newStatus });
  };

  // Convert Repurposed Carousel to a Workspace Post
  const handleExportCarouselToPosts = async () => {
    if (!post.repurposed?.carousel) return;
    const carouselData = post.repurposed.carousel;
    
    const newPostItem = {
      id: 'post-' + Date.now(),
      brandId: post.brandId,
      campaignId: undefined,
      internalTitle: `Carrusel: ${post.title.slice(0, 45)}...`,
      targetDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
      targetTime: '18:30',
      platforms: ['instagram', 'linkedin'] as ('instagram' | 'linkedin')[],
      format: 'CAROUSEL' as const,
      pillar: 'EDUCATIONAL' as const,
      theme: post.category,
      objective: 'Posicionamiento y Autoridad Pixel 12',
      hook: carouselData.slides[0]?.headline || post.title,
      caption: `${carouselData.slides[0]?.headline}\n\n${post.excerpt}\n\nDesliza para ver los 5 puntos estratégicos ➡️\n\n¿Te ha servido? Guarda este carrusel y compártelo con tu equipo directivo.\n\nEn Pixel 12 transformamos tu presencia digital y optimizamos tu operación con asistencia virtual calificada.`,
      cta: 'Lee el artículo completo en el link de nuestra biografía o escríbenos por DM.',
      hashtags: ['#Pixel12', '#MarketingDigital', '#AsistenciaVirtual', '#EstrategiaDigital', '#CrecimientoEmpresarial'],
      status: 'APPROVED' as const,
      assignedMemberId: 'member-camila',
      carouselSlides: carouselData.slides.map((s) => ({
        slideNumber: s.slideNumber,
        headline: s.headline,
        bodyText: s.bodyText,
        visualHint: s.visualCue
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      await addPost(newPostItem);
      showToast('¡Carrusel enviado a Publicaciones con éxito!', 'success');
    } catch (e) {
      showToast('Error al exportar', 'error');
    }
  };

  // Convert Repurposed Reel to a Workspace Post
  const handleExportReelToPosts = async () => {
    if (!post.repurposed?.reelScript) return;
    const reel = post.repurposed.reelScript;

    const newPostItem = {
      id: 'post-' + Date.now(),
      brandId: post.brandId,
      campaignId: undefined,
      internalTitle: `Reel (60s): ${post.title.slice(0, 45)}...`,
      targetDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
      targetTime: '19:00',
      platforms: ['instagram', 'tiktok', 'youtube'] as ('instagram' | 'tiktok' | 'youtube')[],
      format: 'REEL' as const,
      pillar: 'EDUCATIONAL' as const,
      theme: post.category,
      objective: 'Autoridad & Conversión de Clientes',
      hook: reel.hook,
      caption: `🚨 ${reel.hook}\n\nEn este video te mostramos en 60 segundos cómo optimizar este proceso en tu negocio.\n\nComenta "PIXEL" si deseas un diagnóstico inicial de tu estrategia digital o visita el enlace del perfil.`,
      cta: reel.callToAction,
      hashtags: ['#Pixel12', '#ReelMarketing', '#TipsDeNegocio', '#AsistenteVirtual', '#Productividad'],
      status: 'APPROVED' as const,
      assignedMemberId: 'member-camila',
      videoScript: reel.scenes.map((s) => `[${s.timeRange}] [${s.visualAction}] -> ${s.speech}`).join('\n\n'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      await addPost(newPostItem);
      showToast('¡Guion de Reel guardado en Publicaciones!', 'success');
    } catch (e) {
      showToast('Error al exportar', 'error');
    }
  };

  const currentSlides = post.repurposed?.carousel?.slides || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/90 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl my-4 bg-zinc-950 border border-[#D4AF37]/40 rounded-2xl shadow-2xl overflow-hidden text-zinc-100 flex flex-col max-h-[92vh]">
        
        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-zinc-800 bg-zinc-900/80">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30">
              {post.category}
            </span>
            <div className="flex items-center gap-1.5 text-xs text-zinc-400">
              <Clock className="w-3.5 h-3.5" />
              <span>{post.readTime}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-zinc-400">
              <Calendar className="w-3.5 h-3.5" />
              <span>{post.publishedAt || post.createdAt.split('T')[0]}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Status Selector */}
            <select
              value={post.status}
              onChange={(e) => handleStatusChange(e.target.value as BlogPost['status'])}
              className="px-3 py-1.5 text-xs font-bold rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-200 focus:outline-none focus:border-[#D4AF37]"
            >
              <option value="DRAFT">⚪ Borrador</option>
              <option value="IN_REVIEW">🟡 En Revisión</option>
              <option value="APPROVED">🟢 Aprobado</option>
              <option value="PUBLISHED">🚀 Publicado</option>
            </select>

            {/* SEO Score pill */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>SEO {post.seo?.score || 94}/100</span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-6 border-b border-zinc-800 bg-zinc-950">
          <button
            onClick={() => setActiveTab('article')}
            className={`flex items-center gap-2 py-3 px-3 text-sm font-semibold border-b-2 transition-all ${
              activeTab === 'article'
                ? 'border-[#D4AF37] text-[#D4AF37]'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Artículo & Editor</span>
          </button>

          <button
            onClick={() => setActiveTab('repurpose')}
            className={`flex items-center gap-2 py-3 px-3 text-sm font-semibold border-b-2 transition-all ${
              activeTab === 'repurpose'
                ? 'border-[#D4AF37] text-[#D4AF37]'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Share2 className="w-4 h-4" />
            <span>Blog → Redes (Multicanal)</span>
            <span className="px-1.5 py-0.2 text-[10px] rounded bg-[#D4AF37]/20 text-[#D4AF37] font-bold">
              5 slides + Reel
            </span>
          </button>

          <button
            onClick={() => setActiveTab('seo')}
            className={`flex items-center gap-2 py-3 px-3 text-sm font-semibold border-b-2 transition-all ${
              activeTab === 'seo'
                ? 'border-[#D4AF37] text-[#D4AF37]'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Análisis SEO & Google SERP</span>
          </button>

          <button
            onClick={() => setActiveTab('faq')}
            className={`flex items-center gap-2 py-3 px-3 text-sm font-semibold border-b-2 transition-all ${
              activeTab === 'faq'
                ? 'border-[#D4AF37] text-[#D4AF37]'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>FAQs & Schema JSON-LD</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-black/40">
          
          {/* TAB 1: ARTICLE & EDITOR */}
          {activeTab === 'article' && (
            <div className="space-y-6 max-w-4xl mx-auto">
              
              {/* Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(!isEditing)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      isEditing
                        ? 'bg-[#D4AF37] text-black font-bold'
                        : 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700'
                    }`}
                  >
                    {isEditing ? (
                      <>
                        <Eye className="w-3.5 h-3.5" />
                        <span>Ver Vista Previa</span>
                      </>
                    ) : (
                      <>
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Editar Contenido</span>
                      </>
                    )}
                  </button>

                  {isEditing && (
                    <button
                      onClick={handleSaveEdits}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#D4AF37] hover:bg-[#E5C158] text-black"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Guardar Cambios</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(post.content, 'copy_markdown')}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                  >
                    {copiedKey === 'copy_markdown' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Copiar Markdown</span>
                  </button>

                  <button
                    onClick={() => {
                      const blob = new Blob([`# ${post.title}\n\n${post.content}`], { type: 'text/markdown' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `${post.slug || 'articulo-pixel12'}.md`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Descargar .md</span>
                  </button>
                </div>
              </div>

              {/* Editing Mode */}
              {isEditing ? (
                <div className="space-y-4 bg-zinc-900/90 p-5 rounded-2xl border border-zinc-800">
                  <div>
                    <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                      Título H1
                    </label>
                    <input
                      type="text"
                      value={editedTitle}
                      onChange={(e) => setEditedTitle(e.target.value)}
                      className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-700 rounded-xl text-white font-bold text-base focus:border-[#D4AF37] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                      Extracto / Resumen Estratégico
                    </label>
                    <textarea
                      value={editedExcerpt}
                      onChange={(e) => setEditedExcerpt(e.target.value)}
                      rows={2}
                      className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-700 rounded-xl text-zinc-200 text-sm focus:border-[#D4AF37] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                      Cuerpo del Artículo (Formato Markdown con metodología Pixel 12)
                    </label>
                    <textarea
                      value={editedContent}
                      onChange={(e) => setEditedContent(e.target.value)}
                      rows={16}
                      className="w-full font-mono text-sm p-4 bg-zinc-950 border border-zinc-700 rounded-xl text-zinc-100 focus:border-[#D4AF37] focus:outline-none"
                    />
                  </div>
                </div>
              ) : (
                /* Editorial Read View */
                <article className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-6 md:p-10 shadow-xl space-y-6">
                  
                  {/* Title & Author */}
                  <div className="space-y-4 border-b border-zinc-800 pb-6">
                    <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-snug">
                      {post.title}
                    </h1>

                    <div className="flex items-center gap-3">
                      <img
                        src={post.authorAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80"}
                        alt={post.author}
                        className="w-10 h-10 rounded-full object-cover border-2 border-[#D4AF37]/80 shadow-md"
                      />
                      <div>
                        <div className="text-sm font-bold text-white flex items-center gap-1.5">
                          <span>{post.author}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30 font-semibold">
                            Firma Pixel 12
                          </span>
                        </div>
                        <div className="text-xs text-zinc-400">{post.authorRole}</div>
                      </div>
                    </div>

                    {/* Excerpt Lead */}
                    <div className="p-4 rounded-xl bg-[#D4AF37]/10 border-l-4 border-[#D4AF37] text-sm text-zinc-200 leading-relaxed font-medium">
                      {post.excerpt}
                    </div>
                  </div>

                  {/* Featured Image */}
                  {post.featuredImage && (
                    <div className="relative rounded-xl overflow-hidden border border-zinc-800">
                      <img
                        src={post.featuredImage}
                        alt={post.title}
                        className="w-full h-64 md:h-80 object-cover"
                      />
                      <div className="absolute bottom-2 right-2 px-2.5 py-1 rounded bg-black/80 text-[10px] text-zinc-300 backdrop-blur-sm border border-zinc-700">
                        Pixel 12 · Marketing Digital & Asistencia Virtual
                      </div>
                    </div>
                  )}

                  {/* Markdown Parsed Content */}
                  <div className="prose prose-invert max-w-none space-y-4 text-zinc-300 text-sm leading-relaxed whitespace-pre-line">
                    {post.content}
                  </div>

                  {/* Tags */}
                  {post.tags && post.tags.length > 0 && (
                    <div className="pt-6 border-t border-zinc-800 flex items-center flex-wrap gap-2">
                      <Hash className="w-4 h-4 text-zinc-500" />
                      {post.tags.map((tag, i) => (
                        <span
                          key={i}
                          className="text-xs px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-300 border border-zinc-700/60"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </article>
              )}
            </div>
          )}

          {/* TAB 2: REPURPOSING MULTICANAL */}
          {activeTab === 'repurpose' && (
            <div className="space-y-6 max-w-4xl mx-auto">
              {/* Repurpose sub-navigation */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-900 border border-slate-800 rounded-xl">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setRepurposeTab('carousel')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                      repurposeTab === 'carousel'
                        ? 'bg-[#ca7520] text-black'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Carrusel Pixel 12 (5 Diapositivas)</span>
                  </button>

                  <button
                    onClick={() => setRepurposeTab('reel')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                      repurposeTab === 'reel'
                        ? 'bg-[#ca7520] text-black'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Guion Reel (60s)</span>
                  </button>

                  <button
                    onClick={() => setRepurposeTab('stories')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                      repurposeTab === 'stories'
                        ? 'bg-[#ca7520] text-black'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>3 Historias</span>
                  </button>

                  <button
                    onClick={() => setRepurposeTab('linkedin')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                      repurposeTab === 'linkedin'
                        ? 'bg-[#ca7520] text-black'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>Post LinkedIn</span>
                  </button>
                </div>
              </div>

              {/* Sub-view: CAROUSEL */}
              {repurposeTab === 'carousel' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <span>Carrusel Oficial Pixel 12</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30">
                          Identidad Black & Gold
                        </span>
                      </h3>
                      <p className="text-xs text-zinc-400">
                        Diseñado con base negro obsidiana (#09090B), acento dorado (#D4AF37) y detalles en plata.
                      </p>
                    </div>

                    <button
                      onClick={handleExportCarouselToPosts}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#D4AF37] hover:bg-[#E5C158] text-black font-bold text-xs shadow-md transition-colors"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Exportar a Publicaciones</span>
                    </button>
                  </div>

                  {/* Carousel Interactive Stage */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                    
                    {/* Live Slide Mockup */}
                    <div className="md:col-span-7 bg-zinc-950 border-2 border-[#D4AF37]/60 rounded-2xl p-6 shadow-2xl relative min-h-[380px] flex flex-col justify-between overflow-hidden">
                      
                      {/* Brand Header */}
                      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={post.authorAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"}
                            alt="Camila"
                            className="w-8 h-8 rounded-full object-cover border border-[#D4AF37]"
                          />
                          <div>
                            <div className="text-xs font-black tracking-wider text-white">
                              PIXEL <span className="text-[#D4AF37]">12</span>
                            </div>
                            <div className="text-[10px] text-zinc-400">
                              Agencia Digital & Asistencia Virtual
                            </div>
                          </div>
                        </div>

                        <div className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-[#D4AF37]">
                          Slide {activeSlideIndex + 1} / {currentSlides.length || 5}
                        </div>
                      </div>

                      {/* Active Slide Body */}
                      <div className="my-auto py-6 space-y-3">
                        {currentSlides[activeSlideIndex] ? (
                          <>
                            <div className="text-[11px] font-bold tracking-wider uppercase text-[#D4AF37]">
                              {activeSlideIndex === 0 ? 'INSIGHT CLAVE / TÍTULO' : `ESTRATEGIA 0${activeSlideIndex}`}
                            </div>
                            <h4 className="text-xl md:text-2xl font-black text-white leading-tight tracking-tight">
                              {currentSlides[activeSlideIndex].headline}
                            </h4>
                            <p className="text-xs md:text-sm text-zinc-300 leading-relaxed font-medium">
                              {currentSlides[activeSlideIndex].bodyText}
                            </p>
                            {currentSlides[activeSlideIndex].visualCue && (
                              <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-400 italic">
                                🎨 Dirección Visual: {currentSlides[activeSlideIndex].visualCue}
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="text-center text-zinc-500 py-12">
                            No hay diapositivas generadas para este post.
                          </div>
                        )}
                      </div>

                      {/* Slide Footer */}
                      <div className="pt-3 border-t border-zinc-800 flex items-center justify-between text-[11px] text-zinc-400">
                        <span className="text-[#D4AF37] font-bold">@pixel12.agency</span>
                        <div className="flex items-center gap-1.5">
                          <span>Desliza para continuar</span>
                          <ChevronRight className="w-3.5 h-3.5 text-[#D4AF37]" />
                        </div>
                      </div>
                    </div>

                    {/* Slide Selector & Navigation List */}
                    <div className="md:col-span-5 space-y-2">
                      <div className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                        Diapositivas ({currentSlides.length})
                      </div>
                      <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                        {currentSlides.map((slide, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setActiveSlideIndex(idx)}
                            className={`w-full text-left p-3 rounded-xl border transition-all ${
                              activeSlideIndex === idx
                                ? 'bg-[#D4AF37]/15 border-[#D4AF37] text-white shadow'
                                : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                            }`}
                          >
                            <div className="flex items-center justify-between text-xs font-bold mb-1">
                              <span className={activeSlideIndex === idx ? 'text-[#D4AF37]' : 'text-zinc-400'}>
                                Slide {slide.slideNumber || idx + 1}
                              </span>
                              {activeSlideIndex === idx && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#D4AF37] text-black font-bold">
                                  Activo
                                </span>
                              )}
                            </div>
                            <div className="text-xs font-semibold text-zinc-200 line-clamp-1">
                              {slide.headline}
                            </div>
                          </button>
                        ))}
                      </div>

                      {/* Copy Carousel Text Button */}
                      <button
                        onClick={() => {
                          const fullText = currentSlides
                            .map((s) => `[SLIDE ${s.slideNumber}]\n${s.headline}\n${s.bodyText}\n(Visual: ${s.visualCue})`)
                            .join('\n\n');
                          handleCopy(fullText, 'copy_carousel');
                        }}
                        className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-xs font-semibold text-zinc-200 border border-zinc-800 transition-colors mt-3"
                      >
                        {copiedKey === 'copy_carousel' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        <span>Copiar Contenido Completo del Carrusel</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Sub-view: REEL SCRIPT */}
              {repurposeTab === 'reel' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <span>Guion de Reel / TikTok (60 Segundos)</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          Alta Retención
                        </span>
                      </h3>
                      <p className="text-xs text-slate-400">
                        Estructurado con gancho visual, desglose técnico y CTA para el link de la biografía.
                      </p>
                    </div>

                    <button
                      onClick={handleExportReelToPosts}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#D4AF37] hover:bg-[#E5C158] text-black font-bold text-xs shadow-md transition-colors"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Guardar como Reel en Publicaciones</span>
                    </button>
                  </div>

                  {post.repurposed?.reelScript ? (
                    <div className="space-y-4">
                      {/* Hook & CTA cards */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                          <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-wider block mb-1">
                            🎣 Gancho de los Primeros 3 Segundos (Hook)
                          </span>
                          <p className="text-sm font-bold text-white">
                            "{post.repurposed.reelScript.hook}"
                          </p>
                        </div>

                        <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block mb-1">
                            🎯 Llamado a la Acción (CTA Final)
                          </span>
                          <p className="text-sm font-bold text-white">
                            "{post.repurposed.reelScript.callToAction}"
                          </p>
                        </div>
                      </div>

                      {/* Scene by Scene Timeline */}
                      <div className="bg-zinc-900/90 rounded-2xl border border-zinc-800 p-5 space-y-4">
                        <div className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                          Escaleta Escena por Escena
                        </div>

                        <div className="space-y-3">
                          {post.repurposed.reelScript.scenes.map((scene, i) => (
                            <div
                              key={i}
                              className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800/80 flex flex-col md:flex-row md:items-center gap-3"
                            >
                              <div className="px-2.5 py-1 rounded-lg bg-[#D4AF37]/20 text-[#D4AF37] font-mono text-xs font-bold shrink-0 self-start md:self-auto border border-[#D4AF37]/30">
                                {scene.timeRange}
                              </div>
                              <div className="flex-1 text-xs text-zinc-300">
                                <div className="text-[11px] text-zinc-400 font-semibold mb-0.5">
                                  🎬 Acción en Cámara: <span className="text-zinc-200">{scene.visualAction}</span>
                                </div>
                                <div className="text-sm font-medium text-white italic">
                                  "{scene.speech}"
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Copy script */}
                      <button
                        onClick={() => {
                          const script = `HOOK: ${post.repurposed?.reelScript?.hook}\n\n` +
                            post.repurposed?.reelScript?.scenes.map(s => `[${s.timeRange}] ${s.visualAction}\nVOZ: ${s.speech}`).join('\n\n') +
                            `\n\nCTA: ${post.repurposed?.reelScript?.callToAction}`;
                          handleCopy(script, 'copy_reel');
                        }}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-200 border border-zinc-700 transition-colors"
                      >
                        {copiedKey === 'copy_reel' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        <span>Copiar Guion Completo</span>
                      </button>
                    </div>
                  ) : (
                    <div className="text-center text-zinc-500 py-12">
                      No hay guion generado para este artículo.
                    </div>
                  )}
                </div>
              )}

              {/* Sub-view: STORIES */}
              {repurposeTab === 'stories' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-base font-bold text-white">
                      Secuencia de 3 Historias de Instagram
                    </h3>
                    <p className="text-xs text-zinc-400">
                      Formato 9:16 optimizado para conversión, retención y clicks al sticker de contacto.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {post.repurposed?.stories && post.repurposed.stories.length > 0 ? (
                      post.repurposed.stories.map((story, i) => (
                        <div
                          key={i}
                          className="bg-zinc-950 border border-[#D4AF37]/30 rounded-2xl p-5 flex flex-col justify-between min-h-[300px] shadow-lg"
                        >
                          <div>
                            <div className="flex items-center justify-between text-xs font-bold text-[#D4AF37] mb-3">
                              <span>HISTORIA 0{i + 1}</span>
                              <span className="text-zinc-500 font-mono">9:16</span>
                            </div>
                            <div className="text-sm font-bold text-white mb-2">
                              {story.text}
                            </div>
                          </div>

                          <div className="space-y-2 pt-4 border-t border-zinc-800">
                            {story.sticker && (
                              <div className="px-3 py-1.5 rounded-lg bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 text-xs font-bold text-center">
                                🔘 {story.sticker}
                              </div>
                            )}
                            <div className="text-[11px] text-zinc-400 text-center">
                              {story.linkText || 'Toca el enlace para contactar'}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-3 text-center text-zinc-500 py-8">
                        No hay historias generadas.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Sub-view: LINKEDIN POST */}
              {repurposeTab === 'linkedin' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-white">
                        Post Profesional para LinkedIn
                      </h3>
                      <p className="text-xs text-zinc-400">
                        Optimizado con la voz ejecutiva de Pixel 12 para fundadores, directores de marketing y marcas.
                      </p>
                    </div>

                    <button
                      onClick={() => handleCopy(post.repurposed?.linkedinPost || '', 'copy_linkedin')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#D4AF37] hover:bg-[#E5C158] text-black font-bold text-xs shadow-md transition-colors"
                    >
                      {copiedKey === 'copy_linkedin' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Copiar para LinkedIn</span>
                    </button>
                  </div>

                  <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-5 font-sans text-sm text-zinc-200 whitespace-pre-line leading-relaxed">
                    {post.repurposed?.linkedinPost || `${post.title}\n\n${post.excerpt}\n\nDescubre el enfoque completo de Pixel 12 en nuestro blog oficial.`}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ANÁLISIS SEO & SERP */}
          {activeTab === 'seo' && (
            <div className="space-y-6 max-w-4xl mx-auto">
              
              {/* Score card */}
              <div className="p-6 rounded-2xl bg-gradient-to-r from-zinc-900 to-black border border-zinc-800 flex flex-wrap items-center justify-between gap-6">
                <div>
                  <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider block mb-1">
                    Diagnóstico Automático de Optimización
                  </span>
                  <h3 className="text-xl font-bold text-white">
                    Puntuación SEO Técnica: {post.seo?.score || 94}/100
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1 max-w-lg">
                    Cumple con los estándares de indexación de Google, semántica H1-H3, metadatos y enlaces internos.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-full border-4 border-[#D4AF37] flex items-center justify-center font-black text-xl text-white shadow-lg shadow-[#D4AF37]/10">
                    {post.seo?.score || 94}
                  </div>
                </div>
              </div>

              {/* Google SERP Simulator */}
              <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                      Simulador de Google SERP Snippet
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-500">
                    Vista previa de cómo aparecerá en las búsquedas
                  </span>
                </div>

                {/* Google Result Card */}
                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1 max-w-2xl font-sans">
                  <div className="flex items-center gap-2 text-xs text-zinc-400">
                    <div className="w-4 h-4 rounded-full bg-[#D4AF37] flex items-center justify-center text-[9px] text-black font-black">
                      P12
                    </div>
                    <span>https://pixel12.agency &gt; blog &gt; {post.slug}</span>
                  </div>
                  <div className="text-base text-blue-400 hover:underline cursor-pointer font-medium leading-snug">
                    {post.seo?.metaTitle || post.title}
                  </div>
                  <div className="text-xs text-zinc-300 line-clamp-2 leading-relaxed">
                    {post.seo?.metaDescription || post.excerpt}
                  </div>
                </div>
              </div>

              {/* Checklist */}
              <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6 space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                  Checklist de Factores SEO Evaluados
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-zinc-950/80 border border-zinc-800/80 text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-zinc-300">Palabra clave objetivo presente en H1</span>
                  </div>
                  <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-zinc-950/80 border border-zinc-800/80 text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-zinc-300">Meta descripción optimizada (&lt;160 caracteres)</span>
                  </div>
                  <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-zinc-950/80 border border-zinc-800/80 text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-zinc-300">Estructura jerárquica con encabezados H2 y H3</span>
                  </div>
                  <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-zinc-950/80 border border-zinc-800/80 text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-zinc-300">Schema FAQPage listo para fragmentos enriquecidos</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: FAQS & SCHEMA */}
          {activeTab === 'faq' && (
            <div className="space-y-6 max-w-4xl mx-auto">
              <div>
                <h3 className="text-base font-bold text-white">
                  Preguntas Frecuentes (FAQ) & Schema JSON-LD
                </h3>
                <p className="text-xs text-zinc-400">
                  Responde las dudas comunes de clientes para posicionamiento orgánico en Google.
                </p>
              </div>

              {/* FAQs Accordion */}
              <div className="space-y-3">
                {post.faqItems && post.faqItems.length > 0 ? (
                  post.faqItems.map((faq, i) => (
                    <div key={i} className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1.5">
                      <div className="text-sm font-bold text-white flex items-center gap-2">
                        <span className="text-xs px-2 py-0.5 rounded bg-[#D4AF37]/20 text-[#D4AF37] font-mono border border-[#D4AF37]/30">
                          Q{i + 1}
                        </span>
                        <span>{faq.question}</span>
                      </div>
                      <div className="text-xs text-zinc-300 pl-8 leading-relaxed">
                        {faq.answer}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-zinc-500 py-8">
                    No hay preguntas frecuentes registradas.
                  </div>
                )}
              </div>

              {/* JSON-LD Schema Snippet */}
              <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                    <Code className="w-4 h-4 text-[#D4AF37]" />
                    Schema FAQPage (JSON-LD para Google)
                  </span>

                  <button
                    onClick={() => {
                      const schema = {
                        "@context": "https://schema.org",
                        "@type": "FAQPage",
                        "mainEntity": (post.faqItems || []).map(f => ({
                          "@type": "Question",
                          "name": f.question,
                          "acceptedAnswer": {
                            "@type": "Answer",
                            "text": f.answer
                          }
                        }))
                      };
                      handleCopy(JSON.stringify(schema, null, 2), 'copy_schema');
                    }}
                    className="flex items-center gap-1.5 px-3 py-1 text-xs rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700"
                  >
                    {copiedKey === 'copy_schema' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Copiar Schema JSON-LD</span>
                  </button>
                </div>

                <pre className="p-3.5 rounded-xl bg-zinc-950 font-mono text-[11px] text-[#D4AF37] overflow-x-auto max-h-48 border border-zinc-800">
                  {JSON.stringify(
                    {
                      "@context": "https://schema.org",
                      "@type": "FAQPage",
                      "mainEntity": (post.faqItems || []).map(f => ({
                        "@type": "Question",
                        "name": f.question,
                        "acceptedAnswer": {
                          "@type": "Answer",
                          "text": f.answer
                        }
                      }))
                    },
                    null,
                    2
                  )}
                </pre>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-800 bg-zinc-900/90">
          <button
            onClick={() => {
              if (window.confirm('¿Deseas eliminar este artículo de blog?')) {
                deleteBlogPost(post.id);
                onClose();
              }
            }}
            className="text-xs text-rose-400 hover:text-rose-300 font-semibold transition-colors"
          >
            Eliminar Artículo
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-zinc-300 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors"
            >
              Cerrar
            </button>

            <button
              onClick={() => {
                showToast(`Artículo "${post.title.slice(0, 30)}..." listo para producción`, 'success');
                onClose();
              }}
              className="px-5 py-2 text-xs font-bold rounded-xl bg-[#D4AF37] hover:bg-[#E5C158] text-black shadow-lg shadow-[#D4AF37]/20 transition-all"
            >
              Aceptar & Guardar
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
