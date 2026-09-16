import React, { useState, useEffect } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { Post, Platform, PostStatus, ContentFormat, ContentPillar, DesignSlide } from '../../types';
import {
  X,
  Calendar,
  Clock,
  Share2,
  CheckCircle2,
  Instagram,
  Facebook,
  Linkedin,
  Youtube,
  Sparkles,
  Building2,
  Layers,
  FileText,
  Send,
  Eye
} from 'lucide-react';

interface ScheduleContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: {
    internalTitle?: string;
    caption?: string;
    cta?: string;
    hook?: string;
    hashtags?: string[];
    imageUrl?: string;
    slides?: DesignSlide[];
    format?: ContentFormat;
    pillar?: ContentPillar;
    theme?: string;
    brandId?: string;
    date?: string;
    time?: string;
    status?: PostStatus;
    platforms?: Platform[];
  };
  onScheduled?: (post: Post) => void;
}

export const ScheduleContentModal: React.FC<ScheduleContentModalProps> = ({
  isOpen,
  onClose,
  initialData,
  onScheduled,
}) => {
  const { data, activeBrand, addPost, showToast, setActiveView } = useWorkspace();

  // Tomorrow's date in YYYY-MM-DD
  const defaultDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  const [selectedBrandId, setSelectedBrandId] = useState<string>(activeBrand.id);
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>(['instagram', 'linkedin']);
  const [title, setTitle] = useState<string>('');
  const [scheduledDate, setScheduledDate] = useState<string>(defaultDate());
  const [scheduledTime, setScheduledTime] = useState<string>('10:00');
  const [caption, setCaption] = useState<string>('');
  const [hook, setHook] = useState<string>('');
  const [cta, setCta] = useState<string>('');
  const [hashtagsStr, setHashtagsStr] = useState<string>('');
  const [status, setStatus] = useState<PostStatus>('SCHEDULED');
  const [format, setFormat] = useState<ContentFormat>('Carousel');
  const [pillar, setPillar] = useState<ContentPillar>('Educativo');
  const [theme, setTheme] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedBrandId(initialData?.brandId || activeBrand.id);
      setSelectedPlatforms(
        initialData?.platforms && initialData.platforms.length > 0
          ? initialData.platforms
          : ['instagram', 'linkedin']
      );
      setTitle(initialData?.internalTitle || initialData?.theme || 'Nueva Publicación Programada');
      setScheduledDate(initialData?.date || defaultDate());
      setScheduledTime(initialData?.time || '10:00');
      setCaption(initialData?.caption || '');
      setHook(initialData?.hook || '');
      setCta(initialData?.cta || '');
      setHashtagsStr(initialData?.hashtags ? initialData.hashtags.join(' ') : '#Pixel12');
      setStatus(initialData?.status || 'SCHEDULED');
      setFormat(initialData?.format || 'Carousel');
      setPillar(initialData?.pillar || 'Educativo');
      setTheme(initialData?.theme || initialData?.internalTitle || '');
      setImageUrl(initialData?.imageUrl || (initialData?.slides?.[0]?.imageUrl || ''));
    }
  }, [isOpen, initialData, activeBrand.id]);

  if (!isOpen) return null;

  const togglePlatform = (p: Platform) => {
    setSelectedPlatforms((prev) =>
      prev.includes(p) ? (prev.length > 1 ? prev.filter((x) => x !== p) : prev) : [...prev, p]
    );
  };

  const platformIcons: Record<Platform, any> = {
    instagram: Instagram,
    facebook: Facebook,
    linkedin: Linkedin,
    youtube: Youtube,
    tiktok: Sparkles,
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('El título de la publicación es obligatorio', 'error');
      return;
    }
    if (!scheduledDate) {
      showToast('Selecciona una fecha de publicación', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const parsedHashtags = hashtagsStr
        .split(/[,\s]+/)
        .map((h) => h.trim())
        .filter((h) => h.length > 0)
        .map((h) => (h.startsWith('#') ? h : `#${h}`));

      const newPost: Post = {
        id: 'post_p12_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        brandId: selectedBrandId,
        internalTitle: title.trim(),
        date: scheduledDate,
        time: scheduledTime || '10:00',
        platforms: selectedPlatforms,
        format: format,
        pillar: pillar,
        theme: theme.trim() || title.trim(),
        objective: `Estrategia de contenido para ${data.brands.find((b) => b.id === selectedBrandId)?.name || 'marca'}`,
        hook: hook.trim(),
        caption: caption.trim(),
        cta: cta.trim(),
        hashtags: parsedHashtags.length > 0 ? parsedHashtags : ['#Pixel12'],
        status: status,
        assigneeName: data.currentMember.name || 'Especialista Pixel 12',
        assigneeId: data.currentMember.id,
        relatedTaskIds: [],
        slides: initialData?.slides || [],
        hasGeneratedDesign: Boolean(imageUrl || (initialData?.slides && initialData.slides.length > 0)),
        imageUrl: imageUrl || initialData?.slides?.[0]?.imageUrl || '',
        approvalHistory: [
          {
            id: 'app_' + Date.now(),
            reviewerId: data.currentMember.id,
            reviewerName: data.currentMember.name,
            action: status === 'APPROVED' || status === 'SCHEDULED' ? 'APPROVED' : 'CHANGES_REQUESTED',
            comment: `Programado directamente con estado ${status}`,
            timestamp: new Date().toISOString(),
          },
        ],
        versions: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await addPost(newPost);
      showToast('¡Contenido guardado y programado en el Calendario exitosamente!', 'success');
      if (onScheduled) {
        onScheduled(newPost);
      }
      onClose();
    } catch (err: any) {
      showToast('Error al programar publicación: ' + err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      id="schedule-content-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto"
    >
      <div className="bg-[#0D0D14] border border-[#26263A] rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-5 border-b border-[#202030] flex items-center justify-between bg-[#12121C]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl p12-gold-gradient text-black flex items-center justify-center font-bold shadow-md shadow-[#D4AF37]/20 shrink-0">
              <Calendar className="w-5 h-5 text-black" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-display">Programar en Calendario</h3>
              <p className="text-xs text-zinc-400">
                Flujo directo: Contenido & Diseño → Publicación → Calendario de Marca
              </p>
            </div>
          </div>
          <button
            id="close-schedule-modal"
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white hover:bg-[#1A1A28] rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSave} className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* Row 1: Brand & Platforms */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-zinc-300 font-semibold mb-1.5 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-[#D4AF37]" />
                Cliente / Marca
              </label>
              <select
                value={selectedBrandId}
                onChange={(e) => setSelectedBrandId(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[#28283E] bg-[#141420] text-white outline-none focus:border-[#D4AF37]"
              >
                {data.brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.industry || 'Cliente'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-zinc-300 font-semibold mb-1.5 flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5 text-[#D4AF37]" />
                Plataformas de Publicación
              </label>
              <div className="flex flex-wrap gap-2">
                {(['instagram', 'facebook', 'linkedin', 'youtube', 'tiktok'] as Platform[]).map((plat) => {
                  const Icon = platformIcons[plat];
                  const isSelected = selectedPlatforms.includes(plat);
                  return (
                    <button
                      type="button"
                      key={plat}
                      onClick={() => togglePlatform(plat)}
                      className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-[#E5C158] font-bold shadow-xs'
                          : 'bg-[#141420] border-[#252538] text-zinc-400 hover:text-white'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span className="capitalize">{plat}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Row 2: Title, Date, Time */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-1">
              <label className="block text-zinc-300 font-semibold mb-1">Título de la Publicación</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: Carrusel 5 Errores Dentales"
                className="w-full p-2.5 rounded-xl border border-[#28283E] bg-[#141420] text-white outline-none focus:border-[#D4AF37]"
              />
            </div>
            <div>
              <label className="block text-zinc-300 font-semibold mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-[#D4AF37]" />
                Fecha
              </label>
              <input
                type="date"
                required
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[#28283E] bg-[#141420] text-white outline-none focus:border-[#D4AF37]"
              />
            </div>
            <div>
              <label className="block text-zinc-300 font-semibold mb-1 flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#D4AF37]" />
                Hora
              </label>
              <input
                type="time"
                required
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[#28283E] bg-[#141420] text-white outline-none focus:border-[#D4AF37]"
              />
            </div>
          </div>

          {/* Row 3: Format, Pillar, Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-zinc-300 font-semibold mb-1">Formato</label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value as ContentFormat)}
                className="w-full p-2.5 rounded-xl border border-[#28283E] bg-[#141420] text-white outline-none focus:border-[#D4AF37]"
              >
                <option value="Carousel">Carrusel</option>
                <option value="Static Post">Post Estático</option>
                <option value="Reel">Reel / Video Corto</option>
                <option value="Story">Historia</option>
                <option value="LinkedIn Post">Artículo / Post LinkedIn</option>
              </select>
            </div>
            <div>
              <label className="block text-zinc-300 font-semibold mb-1">Pilar de Contenido</label>
              <select
                value={pillar}
                onChange={(e) => setPillar(e.target.value as ContentPillar)}
                className="w-full p-2.5 rounded-xl border border-[#28283E] bg-[#141420] text-white outline-none focus:border-[#D4AF37]"
              >
                <option value="Educativo">Educativo</option>
                <option value="Venta">Venta / Conversión</option>
                <option value="Comunidad">Comunidad</option>
                <option value="Marketing Digital">Marketing Digital</option>
                <option value="Asistencia Virtual">Asistencia Virtual</option>
              </select>
            </div>
            <div>
              <label className="block text-zinc-300 font-semibold mb-1">Estado</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as PostStatus)}
                className="w-full p-2.5 rounded-xl border border-[#28283E] bg-[#141420] text-white outline-none focus:border-[#D4AF37] font-semibold"
              >
                <option value="SCHEDULED">Programado (Listo para publicación)</option>
                <option value="APPROVED">Aprobado</option>
                <option value="IN_REVIEW">Pendiente de aprobación</option>
                <option value="DRAFT">Borrador</option>
              </select>
            </div>
          </div>

          {/* Hook / Gancho */}
          <div>
            <label className="block text-zinc-300 font-semibold mb-1">Gancho / Hook (Primeros 3 segundos)</label>
            <input
              type="text"
              value={hook}
              onChange={(e) => setHook(e.target.value)}
              placeholder="El titular que detiene el scroll..."
              className="w-full p-2.5 rounded-xl border border-[#28283E] bg-[#141420] text-white outline-none focus:border-[#D4AF37]"
            />
          </div>

          {/* Caption / Copy */}
          <div>
            <label className="block text-zinc-300 font-semibold mb-1">Caption / Copy Completo</label>
            <textarea
              rows={4}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Texto completo para la red social..."
              className="w-full p-2.5 rounded-xl border border-[#28283E] bg-[#141420] text-white outline-none focus:border-[#D4AF37] font-sans leading-relaxed"
            />
          </div>

          {/* CTA & Hashtags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-zinc-300 font-semibold mb-1">Llamada a la Acción (CTA)</label>
              <input
                type="text"
                value={cta}
                onChange={(e) => setCta(e.target.value)}
                placeholder="Ej: Comenta 'CITA' para agendar valoración"
                className="w-full p-2.5 rounded-xl border border-[#28283E] bg-[#141420] text-white outline-none focus:border-[#D4AF37]"
              />
            </div>
            <div>
              <label className="block text-zinc-300 font-semibold mb-1">Hashtags</label>
              <input
                type="text"
                value={hashtagsStr}
                onChange={(e) => setHashtagsStr(e.target.value)}
                placeholder="#SaludDental #SonrisaPerfecta #Odontologia"
                className="w-full p-2.5 rounded-xl border border-[#28283E] bg-[#141420] text-white outline-none focus:border-[#D4AF37]"
              />
            </div>
          </div>

          {/* Design / Image preview if available */}
          {imageUrl && (
            <div className="p-3 rounded-2xl bg-[#141420] border border-[#242436] flex items-center gap-3">
              <img
                src={imageUrl}
                alt="Diseño"
                className="w-16 h-16 rounded-xl object-cover border border-[#333346]"
              />
              <div className="flex-1 min-w-0">
                <span className="text-[11px] font-bold text-white block">Diseño Vinculado</span>
                <span className="text-[10px] text-zinc-400 block truncate">
                  {initialData?.slides?.length ? `${initialData.slides.length} diapositivas listas` : 'Imagen principal lista'}
                </span>
                <span className="text-[10px] text-[#E5C158] font-mono">Aspecto optimizado Pixel 12</span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="pt-3 border-t border-[#202030] flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-[#2A2A3E] text-zinc-300 hover:text-white hover:bg-[#181826] transition-colors"
            >
              Cancelar
            </button>
            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl p12-gold-gradient text-black font-bold flex items-center gap-2 shadow-lg shadow-[#D4AF37]/20 hover:brightness-110 transition-all cursor-pointer disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4 text-black" />
                <span>{isSubmitting ? 'Guardando...' : 'Guardar y Programar en Calendario'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
