import React, { useState, useEffect } from 'react';
import { Post, DesignSlide } from '../../types';
import { useWorkspace } from '../../context/WorkspaceContext';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  RefreshCw,
  Layers,
  Flame,
  ShieldCheck,
  Coins,
  Check,
  Image as ImageIcon,
  Layout,
  Edit3,
  Copy,
  Zap,
  Sliders,
  Eye
} from 'lucide-react';
import { SlideImagePickerModal } from './SlideImagePickerModal';
import { getRecommendedSlideImage, P12_AUTHOR_AVATAR } from '../../lib/dynamicImageBank';

interface CarouselSlideViewerProps {
  post: Post;
  onPostUpdated?: (updatedPost: Post) => void;
  readOnly?: boolean;
}

export const CarouselSlideViewer: React.FC<CarouselSlideViewerProps> = ({
  post,
  onPostUpdated,
  readOnly = false
}) => {
  const { regenerateSingleSlide, regenerateAllSlides, data, showToast } = useWorkspace();
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [changePrompt, setChangePrompt] = useState('');
  const [isRegeneratingSlide, setIsRegeneratingSlide] = useState(false);
  const [isRegeneratingAll, setIsRegeneratingAll] = useState(false);
  const [copied, setCopied] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isImagePickerOpen, setIsImagePickerOpen] = useState(false);
  const [isEditingText, setIsEditingText] = useState(false);

  useEffect(() => {
    setCurrentSlideIndex(0);
  }, [post?.id]);

  const slides: DesignSlide[] = post?.slides && post.slides.length > 0 ? post.slides : [];
  const safeIndex = Math.min(currentSlideIndex, Math.max(0, slides.length - 1));
  const currentSlide: DesignSlide | undefined = slides[safeIndex];
  const aiCredits = data?.workspaceSettings?.aiCredits ?? 120;

  if (slides.length === 0 || !currentSlide) {
    return null;
  }

  // Active slide image resolution: use slide.imageUrl or recommended fallback
  const activeSlideImage = currentSlide?.imageUrl || getRecommendedSlideImage(
    currentSlide?.slideType || 'cover',
    safeIndex,
    post.theme || post.internalTitle
  );

  // Layout mode (default: 'full_background' or 'split_top' depending on slide type)
  const currentLayout = currentSlide?.layoutMode || (currentSlide?.slideType === 'problem' || currentSlide?.slideType === 'case_study' ? 'split_top' : 'full_background');
  const currentOverlay = currentSlide?.overlayOpacity ?? 70;

  const handleUpdateSlide = (partial: Partial<DesignSlide>) => {
    const updatedSlides = [...slides];
    if (!updatedSlides[safeIndex]) return;
    updatedSlides[safeIndex] = {
      ...updatedSlides[safeIndex],
      ...partial
    };
    const updatedPost: Post = {
      ...post,
      slides: updatedSlides,
      updatedAt: new Date().toISOString()
    };
    if (onPostUpdated) onPostUpdated(updatedPost);
  };

  const handleSelectImage = (imageUrl: string) => {
    handleUpdateSlide({ imageUrl });
    showToast('Imagen de la slide actualizada exitosamente');
  };

  const handleRehacerSlide = async () => {
    if (!changePrompt.trim()) {
      showToast('Escribe qué deseas cambiar en la slide antes de pulsar Rehacer', 'info');
      return;
    }

    if (aiCredits < 1) {
      showToast('No tienes suficientes créditos de IA disponibles', 'error');
      return;
    }

    setIsRegeneratingSlide(true);
    setElapsedSeconds(0);

    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    try {
      const updatedPost = await regenerateSingleSlide(post.id, currentSlideIndex, changePrompt);
      if (onPostUpdated) onPostUpdated(updatedPost);
      setChangePrompt('');
      showToast(`Slide #${currentSlideIndex + 1} actualizada con IA`);
    } catch (err: any) {
      console.error(err);
      showToast('Error al regenerar slide con IA', 'error');
    } finally {
      clearInterval(timer);
      setIsRegeneratingSlide(false);
    }
  };

  const handleRegenerarTodo = async () => {
    if (aiCredits < 6) {
      showToast('Se requieren 6 créditos para regenerar el carrusel completo', 'error');
      return;
    }

    const confirmRegen = window.confirm(
      '¿Regenerar las 6 diapositivas del carrusel con IA? Se consumirán 6 créditos.'
    );
    if (!confirmRegen) return;

    setIsRegeneratingAll(true);
    try {
      const updatedPost = await regenerateAllSlides(post.id);
      if (onPostUpdated) onPostUpdated(updatedPost);
      setCurrentSlideIndex(0);
      showToast('Carrusel completo regenerado con éxito');
    } catch (err: any) {
      console.error(err);
      showToast('Error al regenerar carrusel', 'error');
    } finally {
      setIsRegeneratingAll(false);
    }
  };

  const copySlideText = () => {
    if (!currentSlide) return;
    const text = `${currentSlide.headline}\n${currentSlide.subtitle || ''}\n${(currentSlide.bodyPoints || []).join('\n')}`;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    showToast('Texto de la slide copiado al portapapeles');
  };

  return (
    <div className="space-y-4">
      {/* Barra superior de control y créditos */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-[#0F0F18] text-white border border-[#26263A] shadow-lg">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl p12-gold-gradient text-black flex items-center justify-center font-black text-xs shadow-md">
            <Layers className="w-4 h-4 text-black" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white font-display">
                Diapositiva {currentSlideIndex + 1} de {slides.length}
              </span>
              <span className="text-[10px] bg-[#1A1A28] text-[#E5C158] px-2 py-0.5 rounded-full font-mono font-bold border border-[#D4AF37]/30">
                PIXEL 12 · DINÁMICO
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
              <Coins className="w-3.5 h-3.5 text-[#E5C158]" />
              <span>
                Créditos de IA: <strong className="text-white">{aiCredits}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Acciones de diseño de slide */}
        <div className="flex items-center gap-2">
          {!readOnly && (
            <>
              <button
                onClick={() => setIsImagePickerOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-[#181826] hover:bg-[#222236] border border-[#2E2E44] text-[#E5C158] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Cambiar la imagen de esta slide"
              >
                <ImageIcon className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Cambiar Foto</span>
              </button>

              <button
                onClick={() => setIsEditingText(!isEditingText)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  isEditingText
                    ? 'bg-[#D4AF37] text-black border-[#D4AF37] font-bold'
                    : 'bg-[#181826] hover:bg-[#222236] border-[#2E2E44] text-zinc-300'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{isEditingText ? 'Ver Diseño' : 'Editar Textos'}</span>
              </button>

              <button
                onClick={handleRegenerarTodo}
                disabled={isRegeneratingAll || isRegeneratingSlide}
                title="Regenera las 6 diapositivas con IA"
                className="px-3 py-1.5 rounded-xl bg-[#161624] hover:bg-[#1E1E30] border border-[#2A2A3E] text-zinc-300 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-40"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-[#D4AF37] ${isRegeneratingAll ? 'animate-spin' : ''}`} />
                <span>{isRegeneratingAll ? 'Regenerando...' : 'Rehacer Todo (-6)'}</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Selectores de formato visual / Layout de la diapositiva */}
      {!readOnly && (
        <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-[#11111B] border border-[#202032] text-xs">
          <div className="flex items-center gap-1.5 text-zinc-400">
            <Layout className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span className="font-semibold text-zinc-300">Diseño:</span>
            {[
              { id: 'full_background', label: 'Fondo Completo' },
              { id: 'split_top', label: 'Mitad Foto / Mitad Texto' },
              { id: 'floating_card', label: 'Tarjeta Flotante' },
            ].map((layout) => (
              <button
                key={layout.id}
                onClick={() => handleUpdateSlide({ layoutMode: layout.id as any })}
                className={`px-2 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                  currentLayout === layout.id
                    ? 'bg-[#D4AF37] text-black font-bold shadow-xs'
                    : 'bg-[#181826] text-zinc-300 hover:bg-[#222234]'
                }`}
              >
                {layout.label}
              </button>
            ))}
          </div>

          {/* Opacidad del Overlay */}
          <div className="flex items-center gap-1.5 text-zinc-400">
            <Sliders className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span className="text-[11px] text-zinc-400">Contraste:</span>
            {[50, 70, 85].map((op) => (
              <button
                key={op}
                onClick={() => handleUpdateSlide({ overlayOpacity: op })}
                className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors cursor-pointer ${
                  currentOverlay === op
                    ? 'bg-[#E5C158] text-black font-bold'
                    : 'bg-[#181826] text-zinc-400 hover:text-white'
                }`}
              >
                {op}%
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Visor de la Slide Actual en Vivo (Relación 4:5 de Instagram/LinkedIn) */}
      <div className="relative mx-auto w-full max-w-[440px] aspect-[4/5] rounded-2xl overflow-hidden bg-[#09090B] text-white shadow-2xl border-2 border-[#26263A] flex flex-col justify-between select-none transition-all group">
        {/* Capa de Imagen Fotográfica Dinámica */}
        {currentLayout === 'full_background' && (
          <div className="absolute inset-0 z-0">
            <img
              src={activeSlideImage}
              alt={currentSlide?.headline || 'Pixel 12 Slide'}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            {/* Gradiente cinemático oscuro y oro Pixel 12 */}
            <div
              className="absolute inset-0 bg-gradient-to-t from-black via-black/85 to-black/60"
              style={{ opacity: currentOverlay / 100 }}
            />
            <div className="absolute inset-0 bg-[radial-gradient(#D4AF37_0.75px,transparent_0.75px)] opacity-10 [background-size:20px_20px] pointer-events-none" />
          </div>
        )}

        {currentLayout === 'split_top' && (
          <div className="absolute top-0 left-0 right-0 h-[44%] z-0 overflow-hidden">
            <img
              src={activeSlideImage}
              alt={currentSlide?.headline || 'Pixel 12 Slide'}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#09090B] via-transparent to-black/40" />
            <div className="absolute inset-0 bg-[#09090B]/20" />
          </div>
        )}

        {currentLayout === 'floating_card' && (
          <div className="absolute inset-0 z-0 bg-[#0A0A10]">
            <div className="absolute inset-0 bg-[radial-gradient(#D4AF37_0.75px,transparent_0.75px)] opacity-15 [background-size:16px_16px] pointer-events-none" />
          </div>
        )}

        {/* Header del Slide */}
        <div className="relative z-10 p-5 pb-3 flex items-center justify-between border-b border-white/10 backdrop-blur-xs">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg p12-gold-gradient text-black flex items-center justify-center font-black text-[11px] shadow-sm">
              P12
            </div>
            <div>
              <span className="text-[11px] font-black tracking-wider text-white block uppercase font-display">
                PIXEL 12
              </span>
              <span className="text-[9px] text-[#E5C158] font-bold tracking-wide">
                {currentSlide?.tag || 'MARKETING & ASISTENCIA'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={copySlideText}
              className="p-1 text-zinc-400 hover:text-white rounded transition-colors cursor-pointer"
              title="Copiar texto"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            <span className="text-xs font-mono font-bold text-[#E5C158] bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-[#D4AF37]/30">
              {String(currentSlideIndex + 1).padStart(2, '0')}/{String(slides.length).padStart(2, '0')}
            </span>
          </div>
        </div>

        {/* Contenido Visual Intermedio para Layout Floating Card */}
        {currentLayout === 'floating_card' && (
          <div className="relative z-10 px-5 pt-3">
            <div className="relative aspect-16/9 rounded-xl overflow-hidden border border-[#D4AF37]/40 shadow-xl">
              <img
                src={activeSlideImage}
                alt={currentSlide?.headline || 'Slide image'}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              {currentSlide?.highlightBadge && (
                <span className="absolute top-2 left-2 text-[9px] font-black uppercase px-2 py-0.5 rounded-md p12-gold-gradient text-black shadow-md">
                  {currentSlide.highlightBadge}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Cuerpo del Slide */}
        <div className={`relative z-10 px-6 my-auto space-y-3.5 ${currentLayout === 'split_top' ? 'mt-auto pt-6' : ''}`}>
          {currentSlide?.highlightBadge && currentLayout !== 'floating_card' && (
            <span className="inline-flex items-center gap-1 text-[10px] uppercase font-black px-2.5 py-0.5 rounded-md p12-gold-gradient text-black shadow-sm">
              <Flame className="w-3 h-3 text-black" />
              {currentSlide.highlightBadge}
            </span>
          )}

          {isEditingText ? (
            <div className="space-y-2 bg-black/80 p-3 rounded-xl border border-[#D4AF37]/50 backdrop-blur-md">
              <label className="text-[10px] font-bold text-[#E5C158] block">Titular (Headline):</label>
              <input
                type="text"
                value={currentSlide?.headline || ''}
                onChange={(e) => handleUpdateSlide({ headline: e.target.value })}
                className="w-full text-xs p-2 rounded bg-[#161622] border border-[#2E2E44] text-white"
              />

              <label className="text-[10px] font-bold text-[#E5C158] block">Subtítulo:</label>
              <input
                type="text"
                value={currentSlide?.subtitle || ''}
                onChange={(e) => handleUpdateSlide({ subtitle: e.target.value })}
                className="w-full text-xs p-2 rounded bg-[#161622] border border-[#2E2E44] text-white"
              />

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-[#E5C158] block">Métrica:</label>
                  <input
                    type="text"
                    value={currentSlide?.metricNumber || ''}
                    onChange={(e) => handleUpdateSlide({ metricNumber: e.target.value })}
                    placeholder="+140%, -15h, 3.5x"
                    className="w-full text-xs p-2 rounded bg-[#161622] border border-[#2E2E44] text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[#E5C158] block">Etiqueta Métrica:</label>
                  <input
                    type="text"
                    value={currentSlide?.metricLabel || ''}
                    onChange={(e) => handleUpdateSlide({ metricLabel: e.target.value })}
                    placeholder="Horas liberadas"
                    className="w-full text-xs p-2 rounded bg-[#161622] border border-[#2E2E44] text-white"
                  />
                </div>
              </div>
            </div>
          ) : (
            <>
              <h3 className="text-lg sm:text-xl font-black leading-tight tracking-tight text-white font-display drop-shadow-md">
                {currentSlide?.headline}
              </h3>

              {currentSlide?.subtitle && (
                <p className="text-xs text-zinc-300 font-normal leading-relaxed drop-shadow-xs">
                  {currentSlide.subtitle}
                </p>
              )}

              {/* Métrica destacada si existe */}
              {currentSlide?.metricNumber && (
                <div className="p-3 rounded-xl bg-black/60 border border-[#D4AF37]/40 flex items-center gap-3 backdrop-blur-md shadow-inner">
                  <span className="text-2xl sm:text-3xl font-black text-[#E5C158] font-mono">
                    {currentSlide.metricNumber}
                  </span>
                  <span className="text-xs text-zinc-200 font-medium leading-tight">
                    {currentSlide.metricLabel}
                  </span>
                </div>
              )}

              {/* Puntos clave */}
              {currentSlide?.bodyPoints && currentSlide.bodyPoints.length > 0 && (
                <ul className="space-y-1.5 pt-1">
                  {currentSlide.bodyPoints.map((point, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-zinc-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] mt-1.5 shrink-0" />
                      <span className="leading-snug drop-shadow-xs">{point}</span>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>

        {/* Footer del Slide con Estratega Oficial de Pixel 12 */}
        <div className="relative z-10 p-5 pt-3 border-t border-white/10 backdrop-blur-xs flex items-center justify-between">
          {currentSlide?.showAuthorBadge !== false ? (
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <img
                  src={P12_AUTHOR_AVATAR}
                  alt="Estratega Pixel 12"
                  referrerPolicy="no-referrer"
                  className="w-8 h-8 rounded-full object-cover border-2 border-[#D4AF37] shadow-sm"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border border-black" />
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold text-white">Alejandro Morales</span>
                  <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
                </div>
                <span className="text-[10px] text-zinc-400 block leading-none">
                  {currentSlide?.authorBadgeTitle || 'Director de Estrategia · Pixel 12'}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-[11px] text-zinc-300">
              <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Estrategia Validada Pixel 12</span>
            </div>
          )}

          <div className="flex items-center gap-1 text-[10px] font-bold text-[#E5C158] bg-[#D4AF37]/15 px-2.5 py-1 rounded-md border border-[#D4AF37]/30">
            <span>Desliza 👉</span>
          </div>
        </div>
      </div>

      {/* Controles de Navegación de Diapositivas */}
      <div className="flex items-center justify-between pt-1">
        <button
          onClick={() => setCurrentSlideIndex((prev) => Math.max(0, prev - 1))}
          disabled={currentSlideIndex === 0}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#2A2A3E] bg-[#141420] text-xs font-semibold text-zinc-300 hover:bg-[#1E1E2E] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4 text-[#D4AF37]" />
          <span>Anterior</span>
        </button>

        {/* Indicadores */}
        <div className="flex items-center gap-1.5">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlideIndex(i)}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                currentSlideIndex === i ? 'w-6 bg-[#D4AF37]' : 'w-2 bg-[#26263A] hover:bg-[#383852]'
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

      {/* Miniaturas dinámicas de las diapositivas con sus imágenes reales */}
      <div className="grid grid-cols-6 gap-2 pt-1">
        {slides.map((s, idx) => {
          const thumbImage = s.imageUrl || getRecommendedSlideImage(s.slideType, idx, post.theme);
          return (
            <button
              key={idx}
              onClick={() => setCurrentSlideIndex(idx)}
              className={`group relative aspect-4/3 rounded-xl overflow-hidden border transition-all cursor-pointer text-left ${
                currentSlideIndex === idx
                  ? 'border-[#D4AF37] ring-2 ring-[#D4AF37]/50 shadow-md'
                  : 'border-[#242436] hover:border-[#D4AF37]/40'
              }`}
            >
              <img
                src={thumbImage}
                alt={`Slide ${idx + 1}`}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/60 group-hover:bg-black/40 transition-colors" />
              <div className="absolute inset-0 p-1.5 flex flex-col justify-between">
                <span className="text-[9px] font-bold font-mono text-[#E5C158] bg-black/70 px-1 rounded w-max">
                  0{idx + 1}
                </span>
                <p className="text-[9px] font-bold text-white line-clamp-1 leading-tight">
                  {s.headline}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* REHACER UNA SOLA SLIDE (Pixel 12 IA Engine)                               */}
      {/* ========================================================================= */}
      {!readOnly && (
        <div className="p-4 rounded-2xl bg-[#12121E] border border-[#27273C] shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#E5C158]" />
              <h4 className="text-xs font-bold text-white font-display">
                ¿Qué cambiar en la slide #{currentSlideIndex + 1}?
              </h4>
            </div>
            <span className="text-[10px] font-bold bg-[#D4AF37]/15 text-[#E5C158] px-2 py-0.5 rounded-full border border-[#D4AF37]/30">
              Gasta 1 crédito
            </span>
          </div>

          <p className="text-[11px] text-zinc-400 leading-tight">
            Escribe qué ajustar (imagen, textos o datos). Se regenerará únicamente esta slide con el estilo dinámico de Pixel 12.
          </p>

          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={changePrompt}
                onChange={(e) => setChangePrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !isRegeneratingSlide) {
                    handleRehacerSlide();
                  }
                }}
                disabled={isRegeneratingSlide}
                placeholder='ejemplo: "más visual con foto de marketing", "enfocar en asistencia virtual", "resumir puntos"'
                className="flex-1 text-xs px-3.5 py-2.5 rounded-xl border border-[#2E2E44] bg-[#0A0A12] text-white placeholder-zinc-500 focus:outline-hidden focus:border-[#D4AF37]"
              />

              <button
                onClick={handleRehacerSlide}
                disabled={isRegeneratingSlide || !changePrompt.trim()}
                className="px-4 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#E5C158] text-black font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                {isRegeneratingSlide ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Rehaciendo...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5 text-black fill-black" />
                    <span>Rehacer Slide</span>
                  </>
                )}
              </button>
            </div>

            {/* Sugerencias Rápidas de Ajuste Pixel 12 */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] font-bold text-zinc-500 mr-0.5">Sugerencias:</span>
              {[
                'más fotográfica y dinámica',
                'enfocar en asistencia virtual',
                'destacar métrica de ROI',
                'estilo lujo negro y oro',
                'menos texto, más directo',
                'cambiar a llamado a la acción'
              ].map((sug, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setChangePrompt(sug)}
                  className="text-[10px] bg-[#161624] hover:bg-[#202034] text-zinc-300 border border-[#28283C] px-2 py-0.5 rounded-md transition-colors cursor-pointer"
                >
                  {sug}
                </button>
              ))}
            </div>
          </div>

          {/* Loader de progreso */}
          {isRegeneratingSlide && (
            <div className="p-3 rounded-xl bg-[#161624] border border-[#D4AF37]/30 flex items-center gap-3 animate-pulse">
              <div className="w-6 h-6 rounded-full bg-[#D4AF37] text-black flex items-center justify-center font-bold text-xs shrink-0">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-white">
                  Regenerando slide #{currentSlideIndex + 1} con IA... ({elapsedSeconds}s)
                </p>
                <p className="text-[10px] text-zinc-400">
                  Integrando imagen fotográfica y tipografía Pixel 12. Las demás slides quedan intactas.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal de selección de imagen */}
      <SlideImagePickerModal
        isOpen={isImagePickerOpen}
        onClose={() => setIsImagePickerOpen(false)}
        currentImageUrl={activeSlideImage}
        onSelectImage={handleSelectImage}
        title={`Cambiar Imagen para Slide #${currentSlideIndex + 1}`}
        suggestedPrompt={currentSlide?.imagePrompt || currentSlide?.visualDescription}
      />
    </div>
  );
};
