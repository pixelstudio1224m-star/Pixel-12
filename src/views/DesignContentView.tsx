import React, { useState } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import { generateDesignContentAI } from '../lib/api';
import {
  DesignFormatType,
  DesignPillarType,
  DesignStyleType,
  GeneratedDesignContent,
  DesignSlide,
  Post
} from '../types';
import {
  Sparkles,
  CheckCircle2,
  Calendar,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  Share2,
  Layers,
  Wand2,
  FileText,
  Video,
  Eye,
  Edit3,
  Flame,
  ArrowRight,
  Clock,
  ShieldCheck,
  Building2,
  Send,
  RefreshCw,
  PlusCircle,
  RotateCcw,
  Coins,
  AlertCircle,
  Image as ImageIcon,
  Layout,
  Sliders,
  Maximize2,
  Heart,
  MessageCircle,
  Bookmark
} from 'lucide-react';
import { SlideImagePickerModal } from '../components/design/SlideImagePickerModal';
import {
  getRecommendedSlideImage,
  P12_DYNAMIC_SLIDE_IMAGES,
  P12_AUTHOR_AVATAR
} from '../lib/dynamicImageBank';

const formatOptions: Array<{ id: DesignFormatType; label: string; icon: string }> = [
  { id: 'Carrusel', label: 'Carrusel', icon: '🖼️' },
  { id: 'Post', label: 'Post', icon: '📌' },
  { id: 'Creativo de pauta', label: 'Creativo de pauta', icon: '📣' },
  { id: 'Guion de Reel', label: 'Guion de Reel', icon: '🎬' },
  { id: 'Blog SEO', label: 'Blog SEO', icon: '📝' },
];

const pillarOptions: DesignPillarType[] = ['Educativo', 'Venta', 'Comunidad'];

const styleOptions: DesignStyleType[] = [
  'Pixel 12 Luxury (Negro, Oro, Plata)',
  'Cinematográfico',
  'Con capturas reales',
  'Tipográfico',
];

const quickTopics = [
  'Cómo la Asistencia Virtual libera 15h semanales a fundadores y directivos',
  'Estrategia de contenidos en redes: Del engagement a clientes calificados',
  'Diagnóstico de marketing digital: 3 fugas que frenan la facturación mensual',
  'Sistemas de delegación: Cómo estructurar la operación de tu negocio con IA',
];

export const DesignContentView: React.FC = () => {
  const { activeBrand, addPost, addTask, showToast, setActiveView, data, updateSettings } = useWorkspace();

  // Selection states
  const [selectedFormat, setSelectedFormat] = useState<DesignFormatType>('Carrusel');
  const [selectedPillar, setSelectedPillar] = useState<DesignPillarType>('Educativo');
  const [selectedStyle, setSelectedStyle] = useState<DesignStyleType>('Pixel 12 Luxury (Negro, Oro, Plata)');
  const [topic, setTopic] = useState('');

  // Generation states
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  const [generatedContent, setGeneratedContent] = useState<GeneratedDesignContent | null>(null);

  // Viewer states
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [isApproved, setIsApproved] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);

  // Dynamic Image & Customization states
  const [isImagePickerOpen, setIsImagePickerOpen] = useState(false);
  const [imagePickerTarget, setImagePickerTarget] = useState<'slide' | 'singlePost'>('slide');
  const [singlePostAspectRatio, setSinglePostAspectRatio] = useState<'4:5' | '1:1' | '9:16'>('4:5');
  const [singlePostImageUrl, setSinglePostImageUrl] = useState<string>(P12_DYNAMIC_SLIDE_IMAGES[0]);

  // Editable slides state
  const [slides, setSlides] = useState<DesignSlide[]>([]);
  const [changePrompt, setChangePrompt] = useState('');
  const [isRegeneratingSlide, setIsRegeneratingSlide] = useState(false);
  const [isRegeneratingAll, setIsRegeneratingAll] = useState(false);

  // Generation step labels
  const stepLabels = [
    'Conectando con motor de IA Gemini...',
    'Estructurando gancho comercial y copy persuasivo...',
    'Componiendo diapositivas visuales con identidad Pixel 12...',
    'Integrando fotografía editorial, analítica y logotipo oficial...',
  ];

  const handleGenerate = async () => {
    if (!topic.trim()) {
      showToast('Escribe un tema o enlace para comenzar', 'error');
      return;
    }

    setIsGenerating(true);
    setGenerationStep(0);
    setIsApproved(false);

    const stepInterval = setInterval(() => {
      setGenerationStep((prev) => (prev < stepLabels.length - 1 ? prev + 1 : prev));
    }, 900);

    try {
      const result = await generateDesignContentAI({
        format: selectedFormat,
        pillar: selectedPillar,
        style: selectedStyle,
        topic,
        brandName: activeBrand.name,
        authorName: 'Alejandro Morales',
      });

      clearInterval(stepInterval);

      // Ensure every slide has dynamic images and layouts
      const ensuredSlides: DesignSlide[] = (result.slides || []).map((s: any, idx: number) => ({
        ...s,
        imageUrl: s.imageUrl || getRecommendedSlideImage(s.slideType, idx, topic),
        layoutMode: s.layoutMode || (idx === 1 || idx === 3 ? 'split_top' : 'full_background'),
        overlayOpacity: s.overlayOpacity ?? 70,
        authorAvatar: s.authorAvatar || P12_AUTHOR_AVATAR,
      }));

      setGeneratedContent(result);
      setSlides(ensuredSlides);
      setSinglePostImageUrl(ensuredSlides[0]?.imageUrl || P12_DYNAMIC_SLIDE_IMAGES[0]);
      setCurrentSlideIndex(0);
      setIsGenerating(false);
      showToast('¡Diseño y contenido generados con éxito!', 'success');
    } catch (err: any) {
      clearInterval(stepInterval);
      setIsGenerating(false);
      showToast(err.message || 'Error al generar el diseño con IA', 'error');
    }
  };

  const copyToClipboard = (text: string, sectionKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionKey);
    showToast('Copiado al portapapeles', 'info');
    setTimeout(() => setCopiedSection(null), 2500);
  };

  const handleApproveAndSchedule = async () => {
    if (!generatedContent) return;

    setIsScheduling(true);
    try {
      const targetDate = '2026-09-08';
      const newPost: Post = {
        id: 'post_p12_' + Date.now(),
        brandId: activeBrand.id,
        internalTitle: generatedContent.title,
        date: targetDate,
        time: '11:00',
        platforms: ['instagram', 'linkedin', 'facebook'],
        format: selectedFormat === 'Carrusel' ? 'Carousel' : selectedFormat === 'Guion de Reel' ? 'Reel' : 'Static Post',
        pillar: selectedPillar,
        theme: generatedContent.theme,
        objective: `Autoridad y captación estratégica en ${selectedPillar.toLowerCase()} para Pixel 12`,
        hook: generatedContent.hook,
        caption: generatedContent.caption,
        cta: generatedContent.cta,
        hashtags: generatedContent.hashtags,
        visualText: slides[0]?.headline || generatedContent.title,
        visualDescription: generatedContent.visualConcept,
        status: 'APPROVED',
        assigneeName: data.currentMember.name || 'Alejandro Morales',
        relatedTaskIds: [],
        slides: slides,
        hasGeneratedDesign: true,
        imageUrl: slides[0]?.imageUrl || singlePostImageUrl || P12_DYNAMIC_SLIDE_IMAGES[0],
        designCreditCost: selectedFormat === 'Carrusel' ? 6 : 1,
        approvalHistory: [
          {
            id: 'app_' + Date.now(),
            reviewerId: 'mem_1',
            reviewerName: 'Director Creativo Pixel 12',
            action: 'APPROVED',
            comment: 'Aprobado automáticamente con identidad Pixel 12 (Negro, Dorado y Plateado)',
            timestamp: new Date().toISOString(),
          },
        ],
        versions: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await addPost(newPost);

      // Create linked tasks
      if (generatedContent.suggestedTasks && generatedContent.suggestedTasks.length > 0) {
        for (const task of generatedContent.suggestedTasks) {
          await addTask({
            id: 'task_p12_' + Math.random().toString(36).substring(2, 9),
            brandId: activeBrand.id,
            title: task.title,
            description: task.description,
            priority: task.priority,
            status: 'TODO',
            assignedRole: task.assignedRole,
            dueDate: '2026-09-07',
            relatedPostId: newPost.id,
            relatedPostTitle: newPost.internalTitle,
            history: [],
            createdAt: new Date().toISOString(),
          });
        }
      }

      setIsApproved(true);
      showToast('¡Diseño aprobado y agendado en el Calendario de Contenido!', 'success');
    } catch (err: any) {
      showToast('Error al agendar el post', 'error');
    } finally {
      setIsScheduling(false);
    }
  };

  const handleUpdateCurrentSlide = (partial: Partial<DesignSlide>) => {
    if (!slides[currentSlideIndex]) return;
    const updated = [...slides];
    updated[currentSlideIndex] = { ...updated[currentSlideIndex], ...partial };
    setSlides(updated);
  };

  const handleSelectImage = (imageUrl: string) => {
    if (imagePickerTarget === 'slide') {
      handleUpdateCurrentSlide({ imageUrl });
      showToast('Imagen de la slide actualizada exitosamente', 'success');
    } else {
      setSinglePostImageUrl(imageUrl);
      showToast('Imagen del post actualizada exitosamente', 'success');
    }
  };

  const handleRehacerSlide = async () => {
    if (!changePrompt.trim()) {
      showToast('Escribe qué deseas cambiar en esta slide antes de pulsar Rehacer', 'info');
      return;
    }

    const currentCredits = data.workspaceSettings.aiCredits ?? 120;
    if (currentCredits < 1) {
      showToast('No dispones de créditos de IA suficientes (requiere 1 crédito)', 'error');
      return;
    }

    setIsRegeneratingSlide(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));

      const updated = [...slides];
      const target = updated[currentSlideIndex];
      if (target) {
        const lower = changePrompt.toLowerCase();
        let newHeadline = target.headline;
        let newBodyPoints = [...(target.bodyPoints || [])];

        if (lower.includes('foto') || lower.includes('imagen') || lower.includes('visual') || lower.includes('dinamico') || lower.includes('dinámico')) {
          const nextIdx = (currentSlideIndex + 1) % P12_DYNAMIC_SLIDE_IMAGES.length;
          target.imageUrl = P12_DYNAMIC_SLIDE_IMAGES[nextIdx];
          target.layoutMode = 'full_background';
          target.overlayOpacity = 70;
        } else if (lower.includes('asistencia virtual') || lower.includes('asistente')) {
          target.imageUrl = P12_DYNAMIC_SLIDE_IMAGES[2];
          target.headline = 'Asistente Virtual calificada: 15h semanales recuperadas';
          target.subtitle = 'Sincronizada con tu agenda, WhatsApp Business y procesos en 48 horas.';
          target.metricNumber = '+15h';
          target.metricLabel = 'Horas directas liberadas a dirección y estrategia';
        } else if (lower.includes('roi') || lower.includes('marketing') || lower.includes('conversion') || lower.includes('conversión')) {
          target.imageUrl = P12_DYNAMIC_SLIDE_IMAGES[3];
          target.metricNumber = '+140%';
          target.metricLabel = 'Incremento en agendamiento de prospectos calificados';
        } else if (lower.includes('menos texto') || lower.includes('limpio')) {
          newBodyPoints = newBodyPoints.slice(0, Math.max(1, newBodyPoints.length - 1));
          target.overlayOpacity = 80;
        } else if (lower.includes('sin el número') || lower.includes('sin numero')) {
          delete target.metricNumber;
          delete target.metricLabel;
        } else {
          newHeadline = `${target.headline} (${changePrompt.slice(0, 30)})`;
        }

        updated[currentSlideIndex] = {
          ...target,
          headline: newHeadline,
          bodyPoints: newBodyPoints,
          highlightBadge: target.highlightBadge ? `${target.highlightBadge} · AJUSTADO` : 'AJUSTADO',
        };
        setSlides(updated);
      }

      updateSettings({ aiCredits: Math.max(0, currentCredits - 1) });
      showToast(
        `Slide #${currentSlideIndex + 1} actualizada con el ajuste: "${changePrompt}". Las demás quedaron igual. (-1 crédito IA)`,
        'success'
      );
      setChangePrompt('');
    } catch (err) {
      showToast('Error al rehacer la slide', 'error');
    } finally {
      setIsRegeneratingSlide(false);
    }
  };

  const handleRegenerarTodo = async () => {
    const currentCredits = data.workspaceSettings.aiCredits ?? 120;
    if (currentCredits < 6) {
      showToast('Se requieren 6 créditos para regenerar el carrusel completo', 'error');
      return;
    }

    const confirmRegen = window.confirm(
      '¿Regenerar las 6 slides del carrusel con nuevas imágenes y copy? Consumirá 6 créditos de IA.'
    );
    if (!confirmRegen) return;

    setIsRegeneratingAll(true);
    try {
      await handleGenerate();
      updateSettings({ aiCredits: Math.max(0, currentCredits - 6) });
      showToast('Carrusel completo regenerado con nuevas fotos (-6 créditos IA)', 'success');
    } catch (err) {
      showToast('Error al regenerar el carrusel', 'error');
    } finally {
      setIsRegeneratingAll(false);
    }
  };

  const currentSlide: DesignSlide | undefined = slides[currentSlideIndex];
  const activeSlideImage =
    currentSlide?.imageUrl ||
    getRecommendedSlideImage(
      currentSlide?.slideType || 'cover',
      currentSlideIndex,
      topic || generatedContent?.title || ''
    );
  const currentLayout =
    currentSlide?.layoutMode ||
    (currentSlideIndex === 1 || currentSlideIndex === 3 ? 'split_top' : 'full_background');
  const currentOverlay = currentSlide?.overlayOpacity ?? 70;

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      {/* ========================================================================= */}
      {/* 1. SECCIÓN PRINCIPAL: GENERADOR DE DISEÑO Y CONTENIDO                    */}
      {/* ========================================================================= */}
      <div className="bg-[#101018] rounded-3xl p-6 sm:p-8 md:p-10 border border-[#222232] shadow-xl space-y-6 text-zinc-100">
        {/* Encabezado */}
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#E5C158] text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Pixel 12 Creative Studio</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight font-display">
            Crear diseño y contenido dinámico
          </h1>
          <p className="text-zinc-400 text-sm sm:text-base font-normal mt-1.5 leading-relaxed max-w-3xl">
            Genera piezas con <strong>textos persuasivos e imágenes de alto impacto</strong> sincronizadas en carrusel, posts y creativos. Todo con la identidad Pixel 12 (Negro, Dorado, Plateado y Blanco).
          </p>
        </div>

        {/* Fila 1: Formato de Contenido */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            1. Formato de Contenido
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
            {formatOptions.map((opt) => {
              const isSelected = selectedFormat === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSelectedFormat(opt.id)}
                  className={`flex items-center gap-2 px-3.5 py-3 rounded-2xl border text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#D4AF37] bg-[#D4AF37]/15 text-white shadow-lg ring-1 ring-[#D4AF37]/40 font-bold'
                      : 'border-[#242436] bg-[#141420] text-zinc-300 hover:border-[#35354E] hover:bg-[#1A1A2A]'
                  }`}
                >
                  <span className="text-base">{opt.icon}</span>
                  <span className="truncate">{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Fila 2: Pilar Estratégico y Estilo Visual */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Pilar */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              2. Pilar de Contenido
            </label>
            <div className="grid grid-cols-3 gap-2">
              {pillarOptions.map((pil) => {
                const isSelected = selectedPillar === pil;
                return (
                  <button
                    key={pil}
                    type="button"
                    onClick={() => setSelectedPillar(pil)}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer text-center ${
                      isSelected
                        ? 'border-[#D4AF37] bg-[#D4AF37]/15 text-white ring-1 ring-[#D4AF37]/40 font-bold'
                        : 'border-[#242436] bg-[#141420] text-zinc-300 hover:border-[#35354E]'
                    }`}
                  >
                    {pil}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Estilo Visual */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              3. Dirección de Arte Pixel 12
            </label>
            <div className="grid grid-cols-2 gap-2">
              {styleOptions.map((sty) => {
                const isSelected = selectedStyle === sty;
                return (
                  <button
                    key={sty}
                    type="button"
                    onClick={() => setSelectedStyle(sty)}
                    className={`py-2 px-2.5 rounded-xl border text-[11px] font-medium transition-all cursor-pointer text-center truncate ${
                      isSelected
                        ? 'border-[#D4AF37] bg-[#D4AF37]/15 text-white ring-1 ring-[#D4AF37]/40 font-bold'
                        : 'border-[#242436] bg-[#141420] text-zinc-300 hover:border-[#35354E]'
                    }`}
                  >
                    {sty}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Fila 3: Input de Tema o Enlace */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              4. Tema, idea o enlace web
            </label>
            <span className="text-[11px] text-zinc-500">
              El motor generará carrusel con fotos, ganchos, copy, CTA y hashtags
            </span>
          </div>

          <div className="relative">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleGenerate();
              }}
              placeholder="Ej: Cómo una asistente virtual calificada libera 15h semanales a directivos..."
              className="w-full bg-[#0D0D14] border border-[#27273C] rounded-2xl px-4 py-3.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] transition-all"
            />
          </div>

          {/* Sugerencias Rápidas */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] font-semibold text-zinc-500">Sugeridos Pixel 12:</span>
            {quickTopics.map((t, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setTopic(t)}
                className="text-[11px] bg-[#141422] hover:bg-[#1C1C30] text-zinc-300 hover:text-white px-2.5 py-1 rounded-lg border border-[#232336] transition-colors cursor-pointer"
              >
                {t.slice(0, 45)}...
              </button>
            ))}
          </div>
        </div>

        {/* Botón de Generación Principal */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating || !topic.trim()}
            className="w-full py-4 px-6 rounded-2xl p12-gold-gradient hover:brightness-105 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed text-black font-black text-base transition-all shadow-xl shadow-[#D4AF37]/15 flex items-center justify-center gap-2.5 cursor-pointer"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin text-black" />
                <span>Generando diseño y copy...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-black" />
                <span>Generar {selectedFormat} con imágenes y textos</span>
              </>
            )}
          </button>
        </div>

        {/* Progreso de la Generación */}
        {isGenerating && (
          <div className="p-4 rounded-2xl bg-[#09090F] border border-[#D4AF37]/30 space-y-2 animate-pulse">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-[#E5C158]">Paso {generationStep + 1} de {stepLabels.length}</span>
              <span className="text-zinc-400">Inteligencia Artificial Pixel 12</span>
            </div>
            <p className="text-sm font-medium text-white">{stepLabels[generationStep]}</p>
            <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="h-full p12-gold-gradient transition-all duration-500"
                style={{ width: `${((generationStep + 1) / stepLabels.length) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 2. RESULTADO VISUAL + TEXTUAL GENERADO                                    */}
      {/* ========================================================================= */}
      {generatedContent && (
        <div className="space-y-6">
          {/* Barra Superior con Estado y Acciones Rápidas */}
          <div className="bg-[#101018] rounded-2xl p-4 sm:p-5 border border-[#222234] flex flex-wrap items-center justify-between gap-4 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl p12-gold-gradient flex items-center justify-center text-black font-black text-sm shadow-md">
                P12
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-white font-display">
                  {generatedContent.title}
                </h2>
                <p className="text-xs text-zinc-400">
                  {selectedFormat} · {selectedPillar} · {slides.length > 0 ? `${slides.length} diapositivas dinámicas` : '1 arte visual con copy'}
                </p>
              </div>
            </div>

            {/* Botones de Aprobación y Agendado */}
            <div className="flex items-center gap-2.5 w-full md:w-auto">
              <button
                onClick={handleApproveAndSchedule}
                disabled={isApproved || isScheduling}
                className={`flex-1 md:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-black text-xs sm:text-sm transition-all shadow-md cursor-pointer ${
                  isApproved
                    ? 'bg-emerald-600 text-white shadow-emerald-900/30'
                    : 'p12-gold-gradient hover:brightness-105 text-black shadow-[#D4AF37]/20 active:scale-98'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isApproved ? '¡Aprobado en Calendario!' : 'Aprobar y Agendar en Calendario'}</span>
              </button>

              <button
                onClick={() => setActiveView('calendar')}
                className="px-3.5 py-2.5 rounded-xl bg-[#181826] hover:bg-[#202034] text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-[#2C2C40]"
                title="Ver en el Calendario"
              >
                <Calendar className="w-4 h-4 text-[#D4AF37]" />
                <span className="hidden sm:inline">Ver Calendario</span>
              </button>
            </div>
          </div>

          {/* Grid de 2 Columnas: Lado Visual (Diapositivas/Post) + Lado de Texto (Copy & Estrategia) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* ------------------------------------------------------------- */}
            {/* COLUMNA IZQUIERDA (7 Cols): VISOR VISUAL DINÁMICO             */}
            {/* ------------------------------------------------------------- */}
            <div className="lg:col-span-7 bg-[#101018] rounded-3xl border border-[#222234] p-5 sm:p-6 shadow-xl space-y-4">
              {/* Header de la columna */}
              <div className="flex items-center justify-between border-b border-[#1F1F30] pb-3">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#D4AF37]" />
                  <span className="font-bold text-sm text-white">
                    {selectedFormat === 'Carrusel' ? 'Diseño de Diapositivas con Imagen' : 'Arte Visual de Alto Impacto'}
                  </span>
                  {selectedFormat === 'Carrusel' && (
                    <span className="text-xs text-zinc-400 font-mono">
                      ({currentSlideIndex + 1} de {slides.length})
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {selectedFormat === 'Carrusel' ? (
                    <button
                      onClick={handleRegenerarTodo}
                      disabled={isRegeneratingAll}
                      className="text-xs text-zinc-300 hover:text-white font-semibold flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#2B2B3E] bg-[#161624] hover:bg-[#1E1E30] transition-colors cursor-pointer"
                      title="Regenerar carrusel completo"
                    >
                      <RotateCcw className={`w-3.5 h-3.5 ${isRegeneratingAll ? 'animate-spin text-[#D4AF37]' : 'text-[#D4AF37]'}`} />
                      <span>{isRegeneratingAll ? 'Regenerando...' : 'Regenerar todo (6 cr.)'}</span>
                    </button>
                  ) : null}

                  <button
                    onClick={() => {
                      setImagePickerTarget(selectedFormat === 'Carrusel' ? 'slide' : 'singlePost');
                      setIsImagePickerOpen(true);
                    }}
                    className="text-xs text-[#E5C158] hover:text-white flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 border border-[#D4AF37]/30 transition-colors cursor-pointer font-bold"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>Cambiar Foto</span>
                  </button>
                </div>
              </div>

              {/* ========================================================================= */}
              {/* CASO A: CARRUSEL MULTI-SLIDE                                              */}
              {/* ========================================================================= */}
              {selectedFormat === 'Carrusel' && currentSlide && (
                <div className="space-y-4">
                  {/* Barra de Controles Rápidos de la Slide (Layout y Opacidad) */}
                  <div className="flex flex-wrap items-center justify-between gap-2 p-2 rounded-xl bg-[#141420] border border-[#232336] text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-zinc-400 font-semibold">Composición:</span>
                      <button
                        onClick={() => handleUpdateCurrentSlide({ layoutMode: 'full_background' })}
                        className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                          currentLayout === 'full_background'
                            ? 'bg-[#D4AF37] text-black font-bold'
                            : 'bg-[#1D1D2C] text-zinc-300 hover:text-white'
                        }`}
                      >
                        Fondo Completo
                      </button>
                      <button
                        onClick={() => handleUpdateCurrentSlide({ layoutMode: 'split_top' })}
                        className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                          currentLayout === 'split_top'
                            ? 'bg-[#D4AF37] text-black font-bold'
                            : 'bg-[#1D1D2C] text-zinc-300 hover:text-white'
                        }`}
                      >
                        Foto Superior
                      </button>
                      <button
                        onClick={() => handleUpdateCurrentSlide({ layoutMode: 'floating_card' })}
                        className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                          currentLayout === 'floating_card'
                            ? 'bg-[#D4AF37] text-black font-bold'
                            : 'bg-[#1D1D2C] text-zinc-300 hover:text-white'
                        }`}
                      >
                        Tarjeta Flotante
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      <span className="text-[11px] text-zinc-400 font-semibold">Filtro:</span>
                      {[50, 70, 85].map((op) => (
                        <button
                          key={op}
                          onClick={() => handleUpdateCurrentSlide({ overlayOpacity: op })}
                          className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors cursor-pointer ${
                            currentOverlay === op
                              ? 'bg-[#D4AF37]/30 text-[#E5C158] font-bold border border-[#D4AF37]'
                              : 'text-zinc-400 hover:text-white'
                          }`}
                        >
                          {op}%
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Canvas de la Slide Renderizada en Vivo (4:5 Formato Instagram/LinkedIn) */}
                  <div className="relative mx-auto w-full max-w-[420px] aspect-[4/5] rounded-3xl overflow-hidden bg-[#09090B] text-white shadow-2xl border-4 border-[#222234] flex flex-col justify-between p-6 select-none transition-all">
                    {/* 1. MODO: FULL BACKGROUND */}
                    {currentLayout === 'full_background' && (
                      <>
                        <img
                          src={activeSlideImage}
                          alt="Slide Visual"
                          referrerPolicy="no-referrer"
                          className="absolute inset-0 w-full h-full object-cover z-0 transition-all duration-300"
                        />
                        <div
                          className="absolute inset-0 z-0 bg-gradient-to-t from-black via-black/85 to-black/60 pointer-events-none"
                          style={{ opacity: currentOverlay / 100 }}
                        />
                        <div className="absolute top-0 right-0 w-48 h-48 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none z-0" />
                      </>
                    )}

                    {/* 2. MODO: SPLIT TOP */}
                    {currentLayout === 'split_top' && (
                      <div className="absolute inset-0 z-0 flex flex-col pointer-events-none">
                        <div className="relative h-[42%] w-full overflow-hidden border-b-2 border-[#D4AF37]/40">
                          <img
                            src={activeSlideImage}
                            alt="Header Visual"
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
                        </div>
                        <div className="h-[58%] w-full bg-[#09090D] bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:16px_16px] opacity-95" />
                      </div>
                    )}

                    {/* 3. MODO: FLOATING CARD */}
                    {currentLayout === 'floating_card' && (
                      <>
                        <img
                          src={activeSlideImage}
                          alt="Ambient Background"
                          referrerPolicy="no-referrer"
                          className="absolute inset-0 w-full h-full object-cover blur-xs scale-105 z-0"
                        />
                        <div className="absolute inset-0 bg-black/75 z-0" />
                      </>
                    )}

                    {/* Header del Slide */}
                    <div className="relative z-10 flex items-center justify-between border-b border-white/10 pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg p12-gold-gradient flex items-center justify-center font-black text-black text-[11px] shadow-xs">
                          P12
                        </div>
                        <div>
                          <span className="text-[11px] font-black tracking-wider text-white block uppercase font-display drop-shadow-sm">
                            PIXEL 12
                          </span>
                          <span className="text-[9px] text-[#E5C158] font-bold tracking-wide drop-shadow-sm">
                            {currentSlide.tag || 'MARKETING & ASISTENCIA'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-mono font-bold text-[#E5C158] bg-[#101018]/90 px-2.5 py-1 rounded-full border border-[#D4AF37]/30 shadow-xs">
                          {String(currentSlideIndex + 1).padStart(2, '0')}/{String(slides.length).padStart(2, '0')}
                        </span>
                      </div>
                    </div>

                    {/* Cuerpo del Slide */}
                    <div
                      className={`relative z-10 my-auto space-y-3.5 ${
                        currentLayout === 'floating_card'
                          ? 'p-5 rounded-2xl bg-black/80 border border-[#D4AF37]/30 shadow-2xl backdrop-blur-md'
                          : ''
                      }`}
                    >
                      {currentSlide.highlightBadge && (
                        <span className="inline-flex items-center gap-1 text-[10px] uppercase font-black px-2.5 py-0.5 rounded-md p12-gold-gradient text-black shadow-xs">
                          <Flame className="w-3 h-3 text-black" />
                          {currentSlide.highlightBadge}
                        </span>
                      )}

                      <h2 className="text-xl sm:text-2xl font-black leading-tight tracking-tight text-white font-display drop-shadow-md">
                        {currentSlide.headline}
                      </h2>

                      {currentSlide.subtitle && (
                        <p className="text-xs sm:text-sm text-zinc-200 font-normal leading-relaxed drop-shadow-sm">
                          {currentSlide.subtitle}
                        </p>
                      )}

                      {/* Métrica destacada */}
                      {currentSlide.metricNumber && (
                        <div className="p-3 rounded-xl bg-black/60 border border-[#D4AF37]/40 flex items-center gap-3 shadow-inner backdrop-blur-sm">
                          <span className="text-2xl sm:text-3xl font-black text-[#E5C158] font-mono drop-shadow-xs">
                            {currentSlide.metricNumber}
                          </span>
                          <span className="text-xs text-zinc-200 font-medium leading-tight">
                            {currentSlide.metricLabel}
                          </span>
                        </div>
                      )}

                      {/* Puntos clave */}
                      {currentSlide.bodyPoints && currentSlide.bodyPoints.length > 0 && (
                        <ul className="space-y-1.5 pt-1">
                          {currentSlide.bodyPoints.map((point, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-xs text-zinc-100 drop-shadow-xs">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] mt-1.5 shrink-0 shadow-xs" />
                              <span className="leading-snug">{point}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {/* Footer del Slide con Autor Verificado Pixel 12 */}
                    <div className="relative z-10 pt-3 border-t border-white/10 flex items-center justify-between">
                      {currentSlide.showAuthorBadge !== false ? (
                        <div className="flex items-center gap-2.5">
                          <div className="relative">
                            <img
                              src={currentSlide.authorAvatar || P12_AUTHOR_AVATAR}
                              alt="Estratega Pixel 12"
                              referrerPolicy="no-referrer"
                              className="w-8 h-8 rounded-full object-cover border-2 border-[#D4AF37] shadow-xs"
                            />
                            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border border-black" />
                          </div>
                          <div>
                            <div className="flex items-center gap-1">
                              <span className="text-xs font-bold text-white drop-shadow-xs">
                                {currentSlide.authorBadgeName || 'Alejandro Morales'}
                              </span>
                              <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
                            </div>
                            <span className="text-[10px] text-zinc-300 block leading-none">
                              {currentSlide.authorBadgeTitle || 'Estratega Senior Pixel 12'}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-[11px] text-zinc-300">
                          <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
                          <span>Estrategia Validada Pixel 12</span>
                        </div>
                      )}

                      <div className="flex items-center gap-1 text-[10px] font-bold text-[#E5C158] bg-black/80 px-2.5 py-1 rounded-md border border-[#D4AF37]/30 shadow-xs">
                        <span>Desliza 👉</span>
                      </div>
                    </div>
                  </div>

                  {/* Controles de Navegación de Diapositivas */}
                  <div className="flex items-center justify-between pt-2">
                    <button
                      onClick={() => setCurrentSlideIndex((prev) => Math.max(0, prev - 1))}
                      disabled={currentSlideIndex === 0}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#2A2A3E] bg-[#141420] text-xs font-semibold text-zinc-300 hover:bg-[#1E1E2E] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4 text-[#D4AF37]" />
                      <span>Anterior</span>
                    </button>

                    {/* Indicadores numéricos */}
                    <div className="flex items-center gap-1.5">
                      {slides.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentSlideIndex(i)}
                          className={`h-2 rounded-full transition-all cursor-pointer ${
                            currentSlideIndex === i ? 'w-6 bg-[#D4AF37]' : 'w-2 bg-[#252538] hover:bg-[#35354C]'
                          }`}
                        />
                      ))}
                    </div>

                    <button
                      onClick={() => setCurrentSlideIndex((prev) => Math.min(slides.length - 1, prev + 1))}
                      disabled={currentSlideIndex === slides.length - 1}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#2A2A3E] bg-[#141420] text-xs font-semibold text-zinc-300 hover:bg-[#1E1E2E] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <span>Siguiente</span>
                      <ChevronRight className="w-4 h-4 text-[#D4AF37]" />
                    </button>
                  </div>

                  {/* Miniaturas de las Diapositivas */}
                  <div className="pt-2 border-t border-[#1E1E2E]">
                    <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
                      Todas las diapositivas con foto
                    </p>
                    <div className="grid grid-cols-6 gap-2">
                      {slides.map((s, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentSlideIndex(idx)}
                          className={`group relative aspect-[4/5] rounded-xl overflow-hidden border transition-all cursor-pointer ${
                            currentSlideIndex === idx
                              ? 'border-[#D4AF37] ring-2 ring-[#D4AF37]/50 shadow-md'
                              : 'border-[#222234] opacity-75 hover:opacity-100'
                          }`}
                        >
                          <img
                            src={s.imageUrl || P12_DYNAMIC_SLIDE_IMAGES[idx % P12_DYNAMIC_SLIDE_IMAGES.length]}
                            alt={`Slide ${idx + 1}`}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent p-1.5 flex flex-col justify-between">
                            <span className="text-[10px] font-mono font-bold text-[#E5C158] bg-black/80 px-1 rounded self-start">
                              0{idx + 1}
                            </span>
                            <p className="text-[9px] font-semibold text-white line-clamp-2 leading-tight">
                              {s.headline}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* REHACER UNA SOLA SLIDE CON IA */}
                  <div className="pt-3 border-t border-[#1E1E2E] space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">
                          ¿Qué cambiar en la slide #{currentSlideIndex + 1}?
                        </span>
                        <span className="text-[11px] text-zinc-400">
                          (Solo se modifica esta slide)
                        </span>
                      </div>
                      <span className="text-[11px] font-mono font-bold text-[#E5C158] bg-[#D4AF37]/15 border border-[#D4AF37]/30 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Coins className="w-3 h-3 text-[#D4AF37]" />
                        1 crédito IA
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={changePrompt}
                        onChange={(e) => setChangePrompt(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleRehacerSlide();
                        }}
                        placeholder='Ej: "más visual con foto", "asistencia virtual", "destacar ROI", "menos texto"...'
                        className="flex-1 bg-[#0D0D14] border border-[#27273C] rounded-xl px-3.5 py-2 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/40 focus:border-[#D4AF37] transition-all"
                      />
                      <button
                        onClick={handleRehacerSlide}
                        disabled={isRegeneratingSlide || !changePrompt.trim()}
                        className="px-4 py-2 rounded-xl p12-gold-gradient hover:brightness-105 disabled:opacity-40 disabled:cursor-not-allowed text-black text-xs font-black transition-all shadow-md flex items-center gap-1.5 cursor-pointer shrink-0"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isRegeneratingSlide ? 'animate-spin text-black' : 'text-black'}`} />
                        <span>{isRegeneratingSlide ? 'Ajustando...' : 'Rehacer'}</span>
                      </button>
                    </div>

                    {/* Chips de sugerencias rápidas de ajuste */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {[
                        '📷 Más visual con foto',
                        '👩‍💼 Asistente Virtual',
                        '📈 Destacar métrica ROI',
                        '✨ Fondo más limpio',
                      ].map((chip, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setChangePrompt(chip)}
                          className="text-[10px] bg-[#161626] hover:bg-[#202036] text-zinc-300 hover:text-white px-2 py-1 rounded-lg border border-[#2A2A40] transition-colors cursor-pointer"
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* CASO B: POST SIMPLE / CREATIVO DE PAUTA                                   */}
              {/* ========================================================================= */}
              {selectedFormat !== 'Carrusel' && (
                <div className="space-y-4">
                  {/* Selector de relación de aspecto */}
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#141420] border border-[#232336] text-xs">
                    <span className="text-zinc-400 font-medium">Relación de Aspecto:</span>
                    <div className="flex items-center gap-1.5">
                      {[
                        { id: '4:5', label: '4:5 Retrato (Feed)' },
                        { id: '1:1', label: '1:1 Cuadrado' },
                        { id: '9:16', label: '9:16 Historia' },
                      ].map((ar) => (
                        <button
                          key={ar.id}
                          onClick={() => setSinglePostAspectRatio(ar.id as any)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                            singlePostAspectRatio === ar.id
                              ? 'bg-[#D4AF37] text-black'
                              : 'bg-[#1D1D2C] text-zinc-300 hover:text-white'
                          }`}
                        >
                          {ar.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Mockup del Creativo */}
                  <div
                    className={`relative mx-auto w-full max-w-[420px] rounded-3xl overflow-hidden bg-[#09090B] text-white shadow-2xl border-4 border-[#222234] flex flex-col justify-between p-6 select-none transition-all ${
                      singlePostAspectRatio === '4:5'
                        ? 'aspect-[4/5]'
                        : singlePostAspectRatio === '1:1'
                        ? 'aspect-square'
                        : 'aspect-[9/16]'
                    }`}
                  >
                    {/* Imagen de fondo dinámica */}
                    <img
                      src={singlePostImageUrl}
                      alt="Creativo Pixel 12"
                      referrerPolicy="no-referrer"
                      className="absolute inset-0 w-full h-full object-cover z-0"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/50 z-0" />
                    <div className="absolute top-0 right-0 w-48 h-48 bg-[#D4AF37]/15 rounded-full blur-3xl pointer-events-none z-0" />

                    {/* Header */}
                    <div className="relative z-10 flex items-center justify-between border-b border-white/15 pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg p12-gold-gradient flex items-center justify-center font-black text-black text-xs shadow-md">
                          P12
                        </div>
                        <div>
                          <span className="text-xs font-black tracking-wider text-white uppercase font-display block">
                            PIXEL 12 OS
                          </span>
                          <span className="text-[10px] text-[#E5C158] font-bold">
                            {selectedPillar.toUpperCase()} · CREATIVO 2026
                          </span>
                        </div>
                      </div>

                      <span className="text-[10px] font-bold text-black p12-gold-gradient px-2.5 py-1 rounded-full uppercase">
                        OFICIAL
                      </span>
                    </div>

                    {/* Mensaje central */}
                    <div className="relative z-10 my-auto space-y-3">
                      <span className="inline-block px-3 py-1 rounded-lg bg-black/75 border border-[#D4AF37]/40 text-[#E5C158] text-xs font-bold tracking-wide">
                        {generatedContent.theme}
                      </span>
                      <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight tracking-tight font-display drop-shadow-md">
                        {generatedContent.hook}
                      </h2>
                      <p className="text-xs sm:text-sm text-zinc-200 line-clamp-3 leading-relaxed drop-shadow-sm">
                        {generatedContent.caption.split('\n')[0]}
                      </p>
                    </div>

                    {/* Footer y CTA */}
                    <div className="relative z-10 pt-3 border-t border-white/15 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <img
                            src={P12_AUTHOR_AVATAR}
                            alt="Autor"
                            referrerPolicy="no-referrer"
                            className="w-7 h-7 rounded-full object-cover border-2 border-[#D4AF37]"
                          />
                          <div>
                            <span className="text-xs font-bold text-white block leading-none">
                              {activeBrand.voice?.authorName || 'Alejandro Morales'}
                            </span>
                            <span className="text-[9px] text-zinc-300">Pixel 12 Strategy</span>
                          </div>
                        </div>

                        <span className="px-3 py-1.5 rounded-xl p12-gold-gradient text-black font-black text-xs shadow-md">
                          {generatedContent.cta.slice(0, 24)}
                        </span>
                      </div>

                      {/* Barra de interacción simulada */}
                      <div className="flex items-center justify-between pt-2 border-t border-white/10 text-zinc-300 text-xs">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> 1.8k</span>
                          <span className="flex items-center gap-1"><MessageCircle className="w-3.5 h-3.5 text-zinc-300" /> 245</span>
                          <span className="flex items-center gap-1"><Share2 className="w-3.5 h-3.5 text-zinc-300" /> 89</span>
                        </div>
                        <Bookmark className="w-3.5 h-3.5 text-[#D4AF37]" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ------------------------------------------------------------- */}
            {/* COLUMNA DERECHA (5 Cols): COPYWRITING, GANCHOS Y ESTRATEGIA  */}
            {/* ------------------------------------------------------------- */}
            <div className="lg:col-span-5 space-y-4">
              {/* Bloque 1: Gancho de Apertura */}
              <div className="bg-[#101018] rounded-2xl border border-[#222234] p-4 sm:p-5 shadow-xl space-y-2">
                <div className="flex items-center justify-between border-b border-[#1F1F30] pb-2">
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-[#D4AF37]" />
                    <span className="font-bold text-xs sm:text-sm text-white">Gancho de Apertura (Hook)</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(generatedContent.hook, 'hook')}
                    className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    {copiedSection === 'hook' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>Copiar</span>
                  </button>
                </div>
                <p className="text-xs sm:text-sm font-semibold text-zinc-100 bg-[#161622] p-3 rounded-xl border border-[#27273C] leading-relaxed">
                  "{generatedContent.hook}"
                </p>
              </div>

              {/* Bloque 2: Copy Completo para Redes */}
              <div className="bg-[#101018] rounded-2xl border border-[#222234] p-4 sm:p-5 shadow-xl space-y-3">
                <div className="flex items-center justify-between border-b border-[#1F1F30] pb-2">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#D4AF37]" />
                    <span className="font-bold text-xs sm:text-sm text-white">Copy completo para publicación</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(generatedContent.caption, 'caption')}
                    className="text-xs font-bold text-black flex items-center gap-1 p12-gold-gradient px-2.5 py-1 rounded-lg transition-all hover:brightness-105 shadow-xs cursor-pointer"
                  >
                    {copiedSection === 'caption' ? <Check className="w-3.5 h-3.5 text-black" /> : <Copy className="w-3.5 h-3.5 text-black" />}
                    <span>Copiar Copy</span>
                  </button>
                </div>

                <div className="max-h-[280px] overflow-y-auto pr-1">
                  <p className="text-xs sm:text-sm text-zinc-200 whitespace-pre-line leading-relaxed font-sans">
                    {generatedContent.caption}
                  </p>
                </div>
              </div>

              {/* Bloque 3: Llamada a la Acción (CTA) & Hashtags */}
              <div className="bg-[#101018] rounded-2xl border border-[#222234] p-4 shadow-xl space-y-3">
                <div>
                  <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                    Llamada a la Acción (CTA)
                  </span>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#141420] border border-[#242436]">
                    <p className="text-xs font-semibold text-zinc-100">{generatedContent.cta}</p>
                    <button
                      onClick={() => copyToClipboard(generatedContent.cta, 'cta')}
                      className="text-zinc-400 hover:text-white p-1 cursor-pointer"
                    >
                      {copiedSection === 'cta' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-zinc-400" />}
                    </button>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                    Hashtags Recomendados Pixel 12
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {generatedContent.hashtags.map((tag, i) => (
                      <span
                        key={i}
                        className="text-[11px] font-medium text-[#E5C158] bg-[#D4AF37]/10 border border-[#D4AF37]/30 px-2.5 py-0.5 rounded-md"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Guion de Reel si aplica */}
              {selectedFormat === 'Guion de Reel' && generatedContent.reelScript && (
                <div className="bg-[#101018] rounded-2xl border border-[#222234] p-4 shadow-xl space-y-3">
                  <div className="flex items-center gap-2 border-b border-[#1F1F30] pb-2">
                    <Video className="w-4 h-4 text-[#D4AF37]" />
                    <span className="font-bold text-xs sm:text-sm text-white">Guion de Reel Segundo a Segundo</span>
                  </div>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {generatedContent.reelScript.map((scene, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-[#141420] border border-[#27273C] text-xs space-y-1">
                        <div className="flex items-center justify-between font-mono font-bold text-[10px] text-[#E5C158]">
                          <span>{scene.secondRange}</span>
                          <span className="text-zinc-400 uppercase">{scene.shotType}</span>
                        </div>
                        <p className="font-medium text-zinc-200">
                          <span className="text-zinc-400">Voz:</span> "{scene.voiceover}"
                        </p>
                        <p className="text-[11px] text-zinc-400 italic">
                          <span className="font-semibold text-zinc-300">Visual:</span> {scene.visualDirection}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Selector de Imágenes para la Slide o el Post */}
      <SlideImagePickerModal
        isOpen={isImagePickerOpen}
        onClose={() => setIsImagePickerOpen(false)}
        onSelectImage={handleSelectImage}
        currentImageUrl={
          imagePickerTarget === 'slide'
            ? slides[currentSlideIndex]?.imageUrl
            : singlePostImageUrl
        }
      />
    </div>
  );
};
