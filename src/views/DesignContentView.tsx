import React, { useState } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import {
  generateDesignContentAI,
  parseFreeformPromptAI,
  refineCopyAI,
  regenerateSingleSlideAI,
  generateSlideImageAI,
  regenerateAllImagesAI,
  regenerateCopyAI,
  saveDraftContentAI,
  submitContentForApprovalAI
} from '../lib/api';
import {
  DesignFormatType,
  DesignPillarType,
  DesignStyleType,
  GeneratedDesignContent,
  DesignSlide,
  Post,
  CreativeBrief
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
  Bookmark,
  Target,
  Users,
  Compass,
  Megaphone,
  Trash2,
  HelpCircle,
  Zap,
  CheckCheck
} from 'lucide-react';
import { SlideImagePickerModal } from '../components/design/SlideImagePickerModal';
import {
  getRecommendedSlideImage,
  P12_DYNAMIC_SLIDE_IMAGES,
  P12_AUTHOR_AVATAR
} from '../lib/dynamicImageBank';
import { ScheduleContentModal } from '../components/calendar/ScheduleContentModal';

const formatOptions: Array<{ id: DesignFormatType; label: string; icon: string; desc: string }> = [
  { id: 'Carrusel', label: 'Carrusel', icon: '🖼️', desc: '5-8 slides narrativas, sin repetir textos' },
  { id: 'Post', label: 'Post Editorial', icon: '📌', desc: '1 concepto visual potente + copy estratégico' },
  { id: 'Guion de Reel', label: 'Guion de Reel', icon: '🎬', desc: '0-30s segundo a segundo con voz y visuales' },
  { id: 'Historia / Stories', label: 'Secuencia Stories', icon: '📱', desc: '3-5 stories con stickers interactivos' },
  { id: 'Creativo de pauta', label: 'Creativo de Pauta', icon: '📣', desc: 'Arte publicitario orientado a conversión' },
  { id: 'Blog SEO', label: 'Blog SEO', icon: '📝', desc: 'Artículo largo optimizado para motores' },
];

const pillarOptions: DesignPillarType[] = [
  'Marketing Digital',
  'Asistencia Virtual',
  'Autoridad',
  'Conversión',
  'Engagement',
  'Educativo',
  'Venta',
];

const styleOptions: DesignStyleType[] = [
  'Pixel 12 Luxury (Negro, Oro, Plata)',
  'Cinematográfico',
  'Con capturas reales',
  'Tipográfico',
];

const objectivePresets = [
  'Educar y generar interés en servicios',
  'Generar leads y mensajes directos',
  'Vender servicios de Marketing y Asistencia',
  'Crear autoridad y credibilidad de marca',
  'Generar interacción y debate en comentarios',
  'Llevar tráfico a la web o blog',
];

const quickBriefExamples = [
  {
    label: '3 Errores de Contenido sin Clientes',
    format: 'Carrusel' as DesignFormatType,
    topic: '3 errores que están haciendo que tu contenido no consiga clientes',
    hook: 'Si publicas todos los días y nadie te compra, probablemente estás cometiendo uno de estos errores.',
    objective: 'Educar y generar interés en los servicios de marketing digital y asistencia de Pixel 12.',
    cta: 'Escríbenos por DM y te ayudamos a auditar tu estrategia.',
    audience: 'Emprendedores, consultores y fundadores B2B',
    tone: 'Cercano, profesional, directo y persuasivo',
  },
  {
    label: 'Cómo la Asistencia Virtual libera 15h',
    format: 'Carrusel' as DesignFormatType,
    topic: 'Cómo implementar Asistencia Virtual calificada para recuperar 15 horas a la semana',
    hook: 'Trabajar más horas no es escalar: es convertirte en el empleado más agotado de tu propia empresa.',
    objective: 'Posicionar el servicio de Asistencia Virtual de Pixel 12 y captar leads directos.',
    cta: 'Comenta "DELEGAR" y te enviamos la guía metodológica sin costo.',
    audience: 'Dueños de agencia, CEOs y líderes de PyMEs',
    tone: 'Estratégico, premium y enfocado en números',
  },
  {
    label: 'Reel: Por qué tus DMs están vacíos',
    format: 'Guion de Reel' as DesignFormatType,
    topic: 'Por qué publicas contenido todos los días pero nadie te escribe por DM',
    hook: '¿Por qué tienes seguidores pero nadie te pregunta por tus precios?',
    objective: 'Demostrar que sin llamadas a la acción claras y seguimiento rápido se pierden clientes.',
    cta: 'Escribe "SISTEMA" en los comentarios para revisar tu embudo.',
    audience: 'Marcas personales y negocios en Instagram',
    tone: 'Dinámico, revelador y persuasivo',
  },
];

export const DesignContentView: React.FC = () => {
  const { activeBrand, addPost, addTask, showToast, setActiveView, data, updateSettings } = useWorkspace();

  // Brief Form States
  const [selectedFormat, setSelectedFormat] = useState<DesignFormatType>('Carrusel');
  const [selectedPillar, setSelectedPillar] = useState<DesignPillarType>('Marketing Digital');
  const [selectedStyle, setSelectedStyle] = useState<DesignStyleType>('Pixel 12 Luxury (Negro, Oro, Plata)');
  const [slidesCount, setSlidesCount] = useState<number>(6);

  // Creative Brief Fields
  const [topic, setTopic] = useState('');
  const [hook, setHook] = useState('');
  const [objective, setObjective] = useState('Educar y generar interés en servicios');
  const [cta, setCta] = useState('Escríbenos por DM y te ayudamos a mejorar tu estrategia.');
  const [audience, setAudience] = useState('Emprendedores, fundadores y marcas que buscan escalar');
  const [tone, setTone] = useState('Profesional, estratégico, cercano y persuasivo (Voz Pixel 12)');
  const [additionalInstructions, setAdditionalInstructions] = useState('');

  // Freeform command input
  const [freeformPrompt, setFreeformPrompt] = useState('');
  const [isParsingPrompt, setIsParsingPrompt] = useState(false);
  const [showAdvancedBrief, setShowAdvancedBrief] = useState(false);

  // Generation states
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  const [generatedContent, setGeneratedContent] = useState<GeneratedDesignContent | null>(null);

  // Viewer states
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [isApproved, setIsApproved] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

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

  // In-Place Slide Editor Modal
  const [isSlideEditorOpen, setIsSlideEditorOpen] = useState(false);
  const [editingSlideData, setEditingSlideData] = useState<Partial<DesignSlide>>({});

  // Quick Refine Copy state
  const [isRefiningCopy, setIsRefiningCopy] = useState(false);

  // Granular Actions and Real Image States
  const [isRetryingImage, setIsRetryingImage] = useState(false);
  const [isRegeneratingImages, setIsRegeneratingImages] = useState(false);
  const [isRegeneratingCopy, setIsRegeneratingCopy] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isSubmittingApproval, setIsSubmittingApproval] = useState(false);

  // Custom Visual Prompt Editor Modal
  const [isPromptEditorOpen, setIsPromptEditorOpen] = useState(false);
  const [editingPromptSlideIndex, setEditingPromptSlideIndex] = useState<number>(0);
  const [customImagePrompt, setCustomImagePrompt] = useState<string>('');
  const [customPromptAspectRatio, setCustomPromptAspectRatio] = useState<'1:1' | '3:4' | '4:3' | '9:16' | '16:9'>('1:1');

  // Generation step labels (Two-Phase Execution)
  const stepLabels = [
    'Fase 1: Interpretando brief estratégico con motor Gemini...',
    'Fase 1: Estructurando narrativa y regla de Cero Repetición...',
    'Fase 1: Componiendo titulares, viñetas y conceptos visuales...',
    'Fase 2: Conectando con motor de imágenes IA de Pixel 12...',
    'Fase 2: Generando composición visual y guardando assets en workspace...',
    'Fase 2: Finalizando y validando coherencia integral...'
  ];

  // AI Interpretation of freeform prompt
  const handleParseFreeformPrompt = async () => {
    if (!freeformPrompt.trim()) {
      showToast('Escribe tu idea o comando libre para interpretarlo', 'info');
      return;
    }

    setIsParsingPrompt(true);
    try {
      const parsed = await parseFreeformPromptAI(freeformPrompt);
      if (parsed.format) setSelectedFormat(parsed.format);
      if (parsed.topic) setTopic(parsed.topic);
      if (parsed.hook) setHook(parsed.hook);
      if (parsed.objective) setObjective(parsed.objective);
      if (parsed.cta) setCta(parsed.cta);
      if (parsed.audience) setAudience(parsed.audience);
      if (parsed.tone) setTone(parsed.tone);
      if (parsed.additionalInstructions) setAdditionalInstructions(parsed.additionalInstructions);
      if (parsed.slidesCount) setSlidesCount(parsed.slidesCount);

      setShowAdvancedBrief(true);
      showToast('¡Brief creativo interpretado y estructurado con éxito!', 'success');
    } catch (err: any) {
      // Fallback: use the prompt as topic directly
      setTopic(freeformPrompt);
      setShowAdvancedBrief(true);
      showToast('Texto asignado como tema principal. Puedes afinar los campos del brief.', 'info');
    } finally {
      setIsParsingPrompt(false);
    }
  };

  const applyBriefPreset = (preset: typeof quickBriefExamples[0]) => {
    setSelectedFormat(preset.format);
    setTopic(preset.topic);
    setHook(preset.hook);
    setObjective(preset.objective);
    setCta(preset.cta);
    setAudience(preset.audience);
    setTone(preset.tone);
    setShowAdvancedBrief(true);
    showToast(`Brief cargado: "${preset.label}"`, 'info');
  };

  const handleGenerate = async () => {
    const currentTopic = topic.trim() || freeformPrompt.trim();
    if (!currentTopic) {
      showToast('Por favor escribe un tema, idea o comando para generar', 'error');
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
        topic: currentTopic,
        hook: hook.trim(),
        objective: objective.trim(),
        cta: cta.trim(),
        audience: audience.trim(),
        tone: tone.trim(),
        additionalInstructions: additionalInstructions.trim(),
        slidesCount: selectedFormat === 'Carrusel' ? slidesCount : undefined,
        freeformPrompt: freeformPrompt.trim(),
        brandName: activeBrand?.name || 'Pixel 12 Studio',
        authorName: data?.currentMember?.name || 'Camila Pinto',
      });

      clearInterval(stepInterval);

      // Ensure every slide preserves real image status from the backend
      const ensuredSlides: DesignSlide[] = (result.slides || []).map((s: any, idx: number) => {
        const hasRealImage = s.imageStatus === 'IMAGE_GENERATED' && s.imageUrl;
        return {
          ...s,
          imageUrl: hasRealImage ? s.imageUrl : (s.imageUrl || getRecommendedSlideImage(s.slideType, idx, currentTopic)),
          imageStatus: s.imageStatus || (hasRealImage ? 'IMAGE_GENERATED' : 'IMAGE_FAILED'),
          imageError: s.imageError,
          layoutMode: s.layoutMode || (idx === 1 || idx === 3 ? 'split_top' : 'full_background'),
          overlayOpacity: s.overlayOpacity ?? 70,
          authorAvatar: s.authorAvatar || P12_AUTHOR_AVATAR,
        };
      });

      setGeneratedContent(result);
      setSlides(ensuredSlides);
      setSinglePostImageUrl(ensuredSlides[0]?.imageUrl || P12_DYNAMIC_SLIDE_IMAGES[0]);
      setCurrentSlideIndex(0);
      setIsGenerating(false);

      // Deduct credits in workspace settings
      const cost = selectedFormat === 'Carrusel' ? 6 : 1;
      const currentCredits = data?.workspaceSettings?.aiCredits ?? 120;
      updateSettings({ aiCredits: Math.max(0, currentCredits - cost) });

      const failedCount = ensuredSlides.filter((s) => s.imageStatus === 'IMAGE_FAILED').length;
      if (failedCount > 0) {
        showToast(
          `Estrategia y copy generados con éxito. ${failedCount} imagen(es) listas para reintentar o personalizar.`,
          'info'
        );
      } else {
        showToast(`¡Contenido completo generado con éxito! Regla de No Repetición validada (-${cost} créditos IA).`, 'success');
      }
    } catch (err: any) {
      clearInterval(stepInterval);
      setIsGenerating(false);
      showToast(err.message || 'Error al generar el contenido con IA', 'error');
    }
  };

  // Reintentar imagen individual con el proveedor de IA
  const handleRetrySlideImage = async (slideIdx: number) => {
    const targetSlide = slides[slideIdx];
    if (!targetSlide) return;

    setIsRetryingImage(true);
    try {
      const prompt = targetSlide.imagePrompt || `${targetSlide.headline}. ${targetSlide.visualConcept || ''}`;
      const res = await generateSlideImageAI({
        prompt,
        aspectRatio: selectedFormat === 'Historia / Stories' ? '9:16' : '1:1',
        style: selectedStyle,
        slideIndex: slideIdx,
        contentId: generatedContent?.id
      });

      const updated = [...slides];
      updated[slideIdx] = {
        ...updated[slideIdx],
        imageUrl: res.imageUrl || updated[slideIdx].imageUrl,
        imageStatus: res.status,
        imageError: res.error,
        assetId: res.asset?.id || updated[slideIdx].assetId
      };
      setSlides(updated);

      if (res.status === 'IMAGE_GENERATED') {
        showToast(`¡Imagen real generada exitosamente para la Slide #${slideIdx + 1}!`, 'success');
      } else {
        showToast(res.error || 'El proveedor de IA reportó cuota no disponible. Puedes reintentar.', 'info');
      }
    } catch (err: any) {
      showToast(err.message || 'Error al reintentar imagen', 'error');
    } finally {
      setIsRetryingImage(false);
    }
  };

  // Abrir editor de prompt visual para una slide
  const openPromptEditor = (slideIdx: number) => {
    const targetSlide = slides[slideIdx];
    if (!targetSlide) return;
    setEditingPromptSlideIndex(slideIdx);
    setCustomImagePrompt(targetSlide.imagePrompt || `${targetSlide.headline}. ${targetSlide.visualConcept || ''}`);
    setCustomPromptAspectRatio(selectedFormat === 'Historia / Stories' ? '9:16' : '1:1');
    setIsPromptEditorOpen(true);
  };

  // Guardar prompt visual personalizado y solicitar generación de imagen real
  const handleSaveAndGeneratePrompt = async () => {
    if (!customImagePrompt.trim()) {
      showToast('Escribe un prompt visual para generar la imagen', 'info');
      return;
    }
    setIsPromptEditorOpen(false);
    setIsRetryingImage(true);
    try {
      const res = await generateSlideImageAI({
        prompt: customImagePrompt.trim(),
        aspectRatio: customPromptAspectRatio,
        style: selectedStyle,
        slideIndex: editingPromptSlideIndex,
        contentId: generatedContent?.id
      });

      const updated = [...slides];
      updated[editingPromptSlideIndex] = {
        ...updated[editingPromptSlideIndex],
        imagePrompt: customImagePrompt.trim(),
        imageUrl: res.imageUrl || updated[editingPromptSlideIndex].imageUrl,
        imageStatus: res.status,
        imageError: res.error,
        assetId: res.asset?.id || updated[editingPromptSlideIndex].assetId
      };
      setSlides(updated);

      if (res.status === 'IMAGE_GENERATED') {
        showToast(`¡Imagen generada con el nuevo prompt para la Slide #${editingPromptSlideIndex + 1}!`, 'success');
      } else {
        showToast(res.error || 'El proveedor de IA reportó cuota no disponible. Puedes reintentar.', 'info');
      }
    } catch (err: any) {
      showToast(err.message || 'Error al generar imagen con prompt', 'error');
    } finally {
      setIsRetryingImage(false);
    }
  };

  // Regenerar todas las imágenes en paralelo manteniendo el copy intacto
  const handleRegenerateImagesOnly = async () => {
    if (slides.length === 0) return;
    setIsRegeneratingImages(true);
    try {
      const res = await regenerateAllImagesAI({
        contentId: generatedContent?.id,
        slides,
        format: selectedFormat,
        style: selectedStyle
      });

      if (res.slides && res.slides.length > 0) {
        setSlides(res.slides);
        showToast('Proceso de regeneración de imágenes finalizado en paralelo.', 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'Error al regenerar imágenes', 'error');
    } finally {
      setIsRegeneratingImages(false);
    }
  };

  // Regenerar copy respetando las imágenes y assets existentes
  const handleRegenerateCopyOnly = async () => {
    if (!generatedContent) return;
    setIsRegeneratingCopy(true);
    try {
      const res = await regenerateCopyAI({
        contentId: generatedContent.id,
        slides,
        brief: generatedContent.brief || {
          topic,
          hook,
          objective,
          cta,
          format: selectedFormat
        }
      });

      if (res.content) {
        setGeneratedContent(res.content);
        if (res.content.slides) setSlides(res.content.slides);
        showToast('Copy regenerado con éxito respetando las imágenes existentes.', 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'Error al regenerar copy', 'error');
    } finally {
      setIsRegeneratingCopy(false);
    }
  };

  // Guardar pieza como borrador en el workspace
  const handleSaveDraft = async () => {
    if (!generatedContent) return;
    setIsSavingDraft(true);
    try {
      const contentToSave: GeneratedDesignContent = {
        ...generatedContent,
        slides,
        theme: topic || generatedContent.theme,
        title: topic || generatedContent.title
      };
      await saveDraftContentAI(contentToSave, activeBrand?.id);
      showToast('¡Guardado como borrador en el workspace!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Error al guardar borrador', 'error');
    } finally {
      setIsSavingDraft(false);
    }
  };

  // Enviar contenido a Aprobación formal
  const handleSubmitApproval = async () => {
    if (!generatedContent) return;
    setIsSubmittingApproval(true);
    try {
      const contentToSave: GeneratedDesignContent = {
        ...generatedContent,
        slides,
        theme: topic || generatedContent.theme,
        title: topic || generatedContent.title
      };
      await submitContentForApprovalAI(contentToSave, activeBrand?.id);
      setIsApproved(true);
      showToast('¡Contenido enviado exitosamente a la cola de Aprobación → Pendientes!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Error al enviar a aprobación', 'error');
    } finally {
      setIsSubmittingApproval(false);
    }
  };

  const copyToClipboard = (text: string, sectionKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionKey);
    showToast('Copiado al portapapeles', 'info');
    setTimeout(() => setCopiedSection(null), 2500);
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

  // AI-Powered Single Slide Regeneration (Context-Aware, No Repetition)
  const handleRehacerSlide = async () => {
    if (!changePrompt.trim()) {
      showToast('Escribe qué deseas ajustar en esta slide antes de pulsar Rehacer', 'info');
      return;
    }

    const currentCredits = data?.workspaceSettings?.aiCredits ?? 120;
    if (currentCredits < 1) {
      showToast('No dispones de créditos de IA suficientes (requiere 1 crédito)', 'error');
      return;
    }

    setIsRegeneratingSlide(true);
    try {
      const response = await regenerateSingleSlideAI({
        slideIndex: currentSlideIndex,
        changePrompt,
        allSlides: slides,
        brief: generatedContent?.brief || {
          topic,
          hook,
          objective,
          cta,
          format: selectedFormat
        }
      });

      if (response.slide) {
        const updated = [...slides];
        updated[currentSlideIndex] = {
          ...updated[currentSlideIndex],
          ...response.slide,
          imageUrl: response.slide.imageUrl || updated[currentSlideIndex].imageUrl,
          authorAvatar: updated[currentSlideIndex].authorAvatar || P12_AUTHOR_AVATAR
        };
        setSlides(updated);
      }

      updateSettings({ aiCredits: Math.max(0, currentCredits - 1) });
      showToast(`Slide #${currentSlideIndex + 1} actualizada con IA respetando la coherencia del carrusel (-1 crédito IA)`, 'success');
      setChangePrompt('');
    } catch (err: any) {
      showToast(err.message || 'Error al rehacer la slide', 'error');
    } finally {
      setIsRegeneratingSlide(false);
    }
  };

  // Quick Refine Copy (Caption, Hook, CTA)
  const handleRefineCopy = async (action: 'improve' | 'shorten' | 'persuasive' | 'direct') => {
    if (!generatedContent) return;
    setIsRefiningCopy(true);
    try {
      const res = await refineCopyAI({
        text: generatedContent.caption,
        field: 'caption',
        action,
        brief: generatedContent.brief
      });
      if (res.refinedText) {
        setGeneratedContent({
          ...generatedContent,
          caption: res.refinedText
        });
        showToast('¡Copy refinado exitosamente con IA!', 'success');
      }
    } catch (err: any) {
      showToast('Error al refinar el copy', 'error');
    } finally {
      setIsRefiningCopy(false);
    }
  };

  // Open slide live editor
  const openSlideEditor = () => {
    if (!slides[currentSlideIndex]) return;
    setEditingSlideData({ ...slides[currentSlideIndex] });
    setIsSlideEditorOpen(true);
  };

  const saveSlideEditor = () => {
    if (!slides[currentSlideIndex]) return;
    const updated = [...slides];
    updated[currentSlideIndex] = {
      ...updated[currentSlideIndex],
      ...editingSlideData
    };
    setSlides(updated);
    setIsSlideEditorOpen(false);
    showToast('Slide actualizada correctamente', 'success');
  };

  const handleAddNewSlide = () => {
    const newSlide: DesignSlide = {
      slideNumber: slides.length + 1,
      slideType: 'solution',
      tag: 'PASO ESTRATÉGICO',
      headline: 'Nueva idea complementaria',
      subtitle: 'Explicación clara y directa orientada a valor',
      bodyPoints: ['Punto práctico de implementación', 'Métrica o beneficio directo'],
      imageUrl: P12_DYNAMIC_SLIDE_IMAGES[(slides.length) % P12_DYNAMIC_SLIDE_IMAGES.length],
      layoutMode: 'full_background',
      overlayOpacity: 70,
      showOfficialLogo: true,
      authorAvatar: P12_AUTHOR_AVATAR
    };
    const updated = [...slides, newSlide];
    setSlides(updated);
    setCurrentSlideIndex(updated.length - 1);
    showToast(`Slide #${updated.length} agregada al carrusel`, 'success');
  };

  const handleDeleteCurrentSlide = () => {
    if (slides.length <= 3) {
      showToast('El carrusel debe tener al menos 3 slides', 'info');
      return;
    }
    const updated = slides.filter((_, idx) => idx !== currentSlideIndex).map((s, i) => ({
      ...s,
      slideNumber: i + 1
    }));
    setSlides(updated);
    setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1));
    showToast('Slide eliminada', 'info');
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
      {/* 1. SECCIÓN PRINCIPAL: MOTOR DE GENERACIÓN CON BRIEF CREATIVO              */}
      {/* ========================================================================= */}
      <div className="bg-[#101018] rounded-3xl p-6 sm:p-8 md:p-10 border border-[#222232] shadow-xl space-y-6 text-zinc-100">
        {/* Encabezado con Brand Kit Oficial Pixel 12 */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1E1E2C] pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#E5C158] text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Pixel 12 Creative Studio · Motor Estratégico IA</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight font-display">
              Generador de Contenido y Diseño
            </h1>
            <p className="text-zinc-400 text-sm sm:text-base font-normal mt-1.5 leading-relaxed max-w-2xl">
              Estrategia, copy y dirección visual sincronizados. La IA interpreta tus entradas como un <strong>brief creativo profesional</strong>, garantizando <strong>cero repetición</strong> y aporte de valor en cada pieza.
            </p>
          </div>

          {/* Brand Kit Badge */}
          <div className="bg-[#141420] border border-[#262638] rounded-2xl p-3.5 space-y-2 shrink-0">
            <div className="flex items-center justify-between text-xs font-bold text-white">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                Brand Kit Pixel 12
              </span>
              <span className="text-[10px] text-[#E5C158] uppercase font-mono">Oficial</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-[#09090B] border border-zinc-700 shadow-xs" title="Negro Obsidiana" />
              <span className="w-5 h-5 rounded-md bg-[#D4AF37] border border-amber-300 shadow-xs" title="Dorado Metálico" />
              <span className="w-5 h-5 rounded-md bg-[#CBD5E1] border border-slate-300 shadow-xs" title="Plateado Destellos" />
              <span className="w-5 h-5 rounded-md bg-white border border-zinc-200 shadow-xs" title="Blanco Editorial" />
              <span className="text-[11px] text-zinc-400 font-mono pl-1">Negro · Oro · Plata · Blanco</span>
            </div>
          </div>
        </div>

        {/* MODO A: Entrada Rápida de Comando Libre */}
        <div className="space-y-3 bg-[#0C0C14] border border-[#232336] rounded-2xl p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#D4AF37]" />
              <span>Entrada Rápida / Comando en Lenguaje Natural</span>
            </label>
            <span className="text-[11px] text-zinc-500 hidden sm:inline">
              Puedes escribir o pegar tu brief y la IA separará el gancho, tema, objetivo y CTA
            </span>
          </div>

          <textarea
            rows={3}
            value={freeformPrompt}
            onChange={(e) => setFreeformPrompt(e.target.value)}
            placeholder='Ej: "Carrusel de 6 slides sobre 3 errores que hacen que tu contenido no consiga clientes. Hook: Si publicas todos los días y nadie te compra... Objetivo: educar y captar leads. CTA: Escríbenos por DM para auditar tu embudo."'
            className="w-full bg-[#12121D] border border-[#27273C] rounded-xl p-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] transition-all resize-none"
          />

          <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleParseFreeformPrompt}
                disabled={isParsingPrompt || !freeformPrompt.trim()}
                className="px-3.5 py-2 rounded-xl bg-[#1D1D2C] hover:bg-[#27273C] border border-[#3A3A52] text-xs font-bold text-white transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
              >
                {isParsingPrompt ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#D4AF37]" />
                ) : (
                  <Wand2 className="w-3.5 h-3.5 text-[#D4AF37]" />
                )}
                <span>Interpretar Brief con IA</span>
              </button>

              <button
                type="button"
                onClick={() => setShowAdvancedBrief(!showAdvancedBrief)}
                className="px-3 py-2 rounded-xl text-xs font-semibold text-[#E5C158] hover:text-white transition-colors cursor-pointer flex items-center gap-1"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>{showAdvancedBrief ? 'Ocultar campos del brief' : 'Ver y editar campos del brief'}</span>
              </button>
            </div>

            {/* Sugerencias Rápidas de Brief */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-bold text-zinc-500 uppercase">Ejemplos:</span>
              {quickBriefExamples.map((ex, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => applyBriefPreset(ex)}
                  className="text-[11px] bg-[#161626] hover:bg-[#202036] text-zinc-300 hover:text-white px-2.5 py-1 rounded-lg border border-[#27273C] transition-colors cursor-pointer"
                >
                  {ex.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Fila 1: Formato de Contenido */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            1. Formato de Contenido
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
            {formatOptions.map((opt) => {
              const isSelected = selectedFormat === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSelectedFormat(opt.id)}
                  className={`flex flex-col items-start gap-1 p-3 rounded-2xl border text-xs transition-all cursor-pointer text-left ${
                    isSelected
                      ? 'border-[#D4AF37] bg-[#D4AF37]/15 text-white shadow-lg ring-1 ring-[#D4AF37]/40 font-bold'
                      : 'border-[#242436] bg-[#141420] text-zinc-300 hover:border-[#35354E] hover:bg-[#1A1A2A]'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold">
                    <span className="text-base">{opt.icon}</span>
                    <span className="truncate">{opt.label}</span>
                  </div>
                  <span className="text-[10px] text-zinc-400 line-clamp-1">{opt.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Fila 2: Pilar Estratégico y Estilo Visual */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Pilar (5 cols) */}
          <div className="md:col-span-6 space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              2. Pilar de Contenido
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {pillarOptions.slice(0, 6).map((pil) => {
                const isSelected = selectedPillar === pil;
                return (
                  <button
                    key={pil}
                    type="button"
                    onClick={() => setSelectedPillar(pil)}
                    className={`py-2 px-2.5 rounded-xl border text-xs font-medium transition-all cursor-pointer text-center truncate ${
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

          {/* Dirección de Arte (6 cols) */}
          <div className="md:col-span-6 space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              3. Dirección de Arte & Estilo
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

        {/* Fila 3: DESGLOSE DEL BRIEF CREATIVO (Tema, Hook, Objetivo, CTA, Público, Tono) */}
        <div className="space-y-4 pt-2">
          {/* Campo de Tema Central (Siempre Visible) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Tema o Idea Central a Desarrollar</span>
              </label>
              <span className="text-[11px] text-zinc-400">
                La IA desarrollará el tema narrativamente (no lo repetirá como texto literal)
              </span>
            </div>

            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Ej: 3 errores que están haciendo que tu contenido no consiga clientes"
              className="w-full bg-[#0D0D14] border border-[#27273C] rounded-2xl px-4 py-3.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] transition-all"
            />
          </div>

          {/* Campos Expandibles del Brief */}
          {showAdvancedBrief && (
            <div className="p-4 sm:p-5 rounded-2xl bg-[#0B0B12] border border-[#232338] space-y-4 animate-in fade-in duration-300">
              <div className="flex items-center justify-between border-b border-[#1C1C2C] pb-2">
                <span className="text-xs font-black uppercase tracking-wider text-[#E5C158] flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-[#D4AF37]" />
                  Desglose de Instrucciones del Brief Creativo
                </span>
                <span className="text-[11px] text-zinc-400">
                  Regla de oro: Hook solo al inicio · CTA solo al final
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Hook */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300 flex items-center justify-between">
                    <span>Hook de Apertura (Solo Slide 1 / Primeros segundos)</span>
                    <span className="text-[10px] text-zinc-500">Apertura</span>
                  </label>
                  <input
                    type="text"
                    value={hook}
                    onChange={(e) => setHook(e.target.value)}
                    placeholder='Ej: "Si publicas todos los días y nadie te compra, estás cometiendo uno de estos errores."'
                    className="w-full bg-[#12121E] border border-[#2A2A40] rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                  />
                </div>

                {/* CTA */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300 flex items-center justify-between">
                    <span>Llamada a la Acción - CTA (Solo al final / Cierre)</span>
                    <span className="text-[10px] text-zinc-500">Cierre</span>
                  </label>
                  <input
                    type="text"
                    value={cta}
                    onChange={(e) => setCta(e.target.value)}
                    placeholder='Ej: "Escríbenos por DM y te ayudamos a auditar tu embudo."'
                    className="w-full bg-[#12121E] border border-[#2A2A40] rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                  />
                </div>

                {/* Objetivo */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300 flex items-center justify-between">
                    <span>Objetivo del Contenido</span>
                    <span className="text-[10px] text-zinc-500">Estrategia</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={objective}
                      onChange={(e) => setObjective(e.target.value)}
                      placeholder="Ej: Educar y generar clientes calificados"
                      className="w-full bg-[#12121E] border border-[#2A2A40] rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                    />
                  </div>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {objectivePresets.slice(0, 3).map((p, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setObjective(p)}
                        className="text-[10px] bg-[#181826] hover:bg-[#202034] text-zinc-400 hover:text-white px-2 py-0.5 rounded border border-[#27273C] transition-colors"
                      >
                        {p.split(' ')[0]} {p.split(' ')[1]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Público */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300 flex items-center justify-between">
                    <span>Público Objetivo (Buyer Persona)</span>
                    <span className="text-[10px] text-zinc-500">Audiencia</span>
                  </label>
                  <input
                    type="text"
                    value={audience}
                    onChange={(e) => setAudience(e.target.value)}
                    placeholder="Ej: Dueños de agencia, consultores y empresas de servicios"
                    className="w-full bg-[#12121E] border border-[#2A2A40] rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                  />
                </div>

                {/* Tono */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300">Tono de Voz</label>
                  <input
                    type="text"
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    placeholder="Ej: Cercano, profesional, persuasivo, directo"
                    className="w-full bg-[#12121E] border border-[#2A2A40] rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                  />
                </div>

                {/* Instrucciones Adicionales o Cantidad de Slides */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-zinc-300">
                      {selectedFormat === 'Carrusel' ? 'Número de Slides & Instrucciones' : 'Instrucciones Adicionales'}
                    </label>
                    {selectedFormat === 'Carrusel' && (
                      <div className="flex items-center gap-1">
                        {[5, 6, 7, 8].map((num) => (
                          <button
                            key={num}
                            type="button"
                            onClick={() => setSlidesCount(num)}
                            className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
                              slidesCount === num
                                ? 'bg-[#D4AF37] text-black font-bold'
                                : 'bg-[#181826] text-zinc-400 hover:text-white'
                            }`}
                          >
                            {num} slides
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <input
                    type="text"
                    value={additionalInstructions}
                    onChange={(e) => setAdditionalInstructions(e.target.value)}
                    placeholder="Ej: Incluir estadísticas de productividad, no usar tecnicismos excesivos"
                    className="w-full bg-[#12121E] border border-[#2A2A40] rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Botón de Generación Principal */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating || (!topic.trim() && !freeformPrompt.trim())}
            className="w-full py-4 px-6 rounded-2xl p12-gold-gradient hover:brightness-105 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed text-black font-black text-base transition-all shadow-xl shadow-[#D4AF37]/15 flex items-center justify-center gap-2.5 cursor-pointer"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin text-black" />
                <span>Generando con Inteligencia Creativa Pixel 12...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-black" />
                <span>Generar {selectedFormat} (Estrategia + Copy + Diseño)</span>
              </>
            )}
          </button>
        </div>

        {/* Barra de Progreso y Validación */}
        {isGenerating && (
          <div className="p-4 rounded-2xl bg-[#09090F] border border-[#D4AF37]/30 space-y-2 animate-pulse">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-[#E5C158]">Paso {generationStep + 1} de {stepLabels.length}</span>
              <span className="text-zinc-400">Motor Creativo Gemini 2.5</span>
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
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Banner de Validación de Cero Repetición */}
          <div className="bg-[#101018] rounded-2xl p-3.5 sm:p-4 border border-[#222234] flex flex-wrap items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <CheckCheck className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">
                  Validación Creativa Pixel 12 Aprobada
                </span>
                <span className="text-[11px] text-zinc-400">
                  Regla de Cero Repetición activa · Hook en Slide 1 · Desarrollo secuencial · CTA al cierre
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating}
                className="text-xs text-zinc-300 hover:text-white font-semibold flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#2B2B3E] bg-[#161624] hover:bg-[#1E1E30] transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Regenerar Todo</span>
              </button>

              <button
                type="button"
                onClick={() => setIsScheduleModalOpen(true)}
                className="px-4 py-1.5 rounded-xl p12-gold-gradient text-black font-black text-xs hover:brightness-105 flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Programar en Calendario</span>
              </button>
            </div>
          </div>

          {/* Grid de 2 Columnas: Lado Visual (Diapositivas/Post/Stories/Reel) + Lado de Copywriting */}
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
                    {selectedFormat === 'Carrusel'
                      ? 'Diseño de Diapositivas con Imagen'
                      : selectedFormat === 'Guion de Reel'
                      ? 'Estructura Audiovisual del Reel'
                      : selectedFormat === 'Historia / Stories'
                      ? 'Secuencia de Historias con Stickers'
                      : 'Arte Visual de Alto Impacto'}
                  </span>
                  {selectedFormat === 'Carrusel' && (
                    <span className="text-xs text-zinc-400 font-mono">
                      ({currentSlideIndex + 1} de {slides.length})
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {/* Status Badge de la Imagen de la Slide */}
                  {currentSlide?.imageStatus === 'IMAGE_GENERATING' && (
                    <span className="text-[10px] px-2 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold flex items-center gap-1">
                      <RefreshCw className="w-3 h-3 animate-spin text-amber-300" />
                      Generando...
                    </span>
                  )}
                  {currentSlide?.imageStatus === 'IMAGE_GENERATED' && (
                    <span className="text-[10px] px-2 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-emerald-400" />
                      Foto IA Real
                    </span>
                  )}
                  {currentSlide?.imageStatus === 'IMAGE_FAILED' && (
                    <span className="text-[10px] px-2 py-1 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-400 font-bold flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 text-rose-400" />
                      Fallo de Imagen
                    </span>
                  )}

                  {selectedFormat === 'Carrusel' && (
                    <>
                      <button
                        type="button"
                        onClick={() => openPromptEditor(currentSlideIndex)}
                        className="text-xs text-zinc-300 hover:text-white flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#161624] hover:bg-[#1E1E30] border border-[#2A2A3E] transition-colors cursor-pointer"
                        title="Ver o editar el prompt de generación de imagen"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span>Prompt</span>
                      </button>
                      <button
                        type="button"
                        onClick={openSlideEditor}
                        className="text-xs text-zinc-300 hover:text-white flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#161624] hover:bg-[#1E1E30] border border-[#2A2A3E] transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span>Editar Slide</span>
                      </button>
                    </>
                  )}

                  <button
                    type="button"
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
                        type="button"
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
                        type="button"
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
                        type="button"
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
                          type="button"
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
                            {currentSlide.tag || (currentSlideIndex === 0 ? 'APERTURA · GANCHO' : currentSlideIndex === slides.length - 1 ? 'LLAMADA A LA ACCIÓN' : 'ESTRATEGIA & SISTEMA')}
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
                                {currentSlide.authorBadgeName || 'Camila Pinto'}
                              </span>
                              <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
                            </div>
                            <span className="text-[10px] text-zinc-300 block leading-none">
                              {currentSlide.authorBadgeTitle || 'Estratega Senior · Pixel 12'}
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
                        <span>{currentSlideIndex === slides.length - 1 ? 'Guarda y Comparte 📌' : 'Desliza 👉'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Banner de Recuperación si la imagen falló en la API */}
                  {currentSlide.imageStatus === 'IMAGE_FAILED' && (
                    <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-800/50 space-y-2.5 shadow-lg animate-in fade-in duration-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-rose-300 font-bold text-xs">
                          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                          <span>No pudimos generar esta imagen con el proveedor de IA. Reintentar.</span>
                        </div>
                        <span className="text-[10px] text-zinc-400 font-mono bg-black/60 px-2 py-0.5 rounded">
                          IMAGE_FAILED
                        </span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-black/70 border border-rose-900/30 text-[11px] text-zinc-300 font-mono leading-relaxed">
                        <span className="text-zinc-500 block text-[10px] uppercase font-sans font-bold mb-0.5">
                          Prompt visual planificado:
                        </span>
                        "{currentSlide.imagePrompt || `${currentSlide.headline}. ${currentSlide.visualConcept || ''}`}"
                      </div>
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => handleRetrySlideImage(currentSlideIndex)}
                          disabled={isRetryingImage}
                          className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${isRetryingImage ? 'animate-spin' : ''}`} />
                          <span>Reintentar Imagen</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => openPromptEditor(currentSlideIndex)}
                          className="px-3.5 py-1.5 rounded-xl bg-[#1E1E2E] hover:bg-[#2A2A3E] text-zinc-200 border border-zinc-700 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-[#D4AF37]" />
                          <span>Editar Prompt y Generar</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setImagePickerTarget('slide');
                            setIsImagePickerOpen(true);
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-[#161626] hover:bg-[#222238] text-amber-300 border border-amber-500/30 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <ImageIcon className="w-3.5 h-3.5" />
                          <span>Seleccionar del Archivo</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Controles de Navegación de Diapositivas */}
                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
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
                          type="button"
                          onClick={() => setCurrentSlideIndex(i)}
                          className={`h-2 rounded-full transition-all cursor-pointer ${
                            currentSlideIndex === i ? 'w-6 bg-[#D4AF37]' : 'w-2 bg-[#252538] hover:bg-[#35354C]'
                          }`}
                        />
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => setCurrentSlideIndex((prev) => Math.min(slides.length - 1, prev + 1))}
                      disabled={currentSlideIndex === slides.length - 1}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#2A2A3E] bg-[#141420] text-xs font-semibold text-zinc-300 hover:bg-[#1E1E2E] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <span>Siguiente</span>
                      <ChevronRight className="w-4 h-4 text-[#D4AF37]" />
                    </button>
                  </div>

                  {/* Miniaturas de las Diapositivas con opción de añadir y quitar */}
                  <div className="pt-2 border-t border-[#1E1E2E] space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                        Diapositivas ({slides.length})
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleAddNewSlide}
                          className="text-[11px] text-[#E5C158] hover:text-white flex items-center gap-1 cursor-pointer font-semibold"
                        >
                          <PlusCircle className="w-3.5 h-3.5" />
                          <span>Añadir slide</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleDeleteCurrentSlide}
                          disabled={slides.length <= 3}
                          className="text-[11px] text-zinc-400 hover:text-rose-400 flex items-center gap-1 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Eliminar slide #{currentSlideIndex + 1}</span>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                      {slides.map((s, idx) => (
                        <button
                          key={idx}
                          type="button"
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
                            <div className="flex items-center justify-between w-full">
                              <span className="text-[10px] font-mono font-bold text-[#E5C158] bg-black/80 px-1 rounded">
                                0{idx + 1}
                              </span>
                              {s.imageStatus === 'IMAGE_GENERATED' && (
                                <span className="w-2 h-2 rounded-full bg-emerald-400 ring-1 ring-emerald-500/50" title="Imagen generada por IA" />
                              )}
                              {s.imageStatus === 'IMAGE_FAILED' && (
                                <span className="w-2 h-2 rounded-full bg-rose-500 ring-1 ring-rose-500/50 animate-pulse" title="Fallo de imagen (Reintentable)" />
                              )}
                            </div>
                            <p className="text-[9px] font-semibold text-white line-clamp-2 leading-tight">
                              {s.headline}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* REHACER UNA SOLA SLIDE CON IA (Context-Aware) */}
                  <div className="pt-3 border-t border-[#1E1E2E] space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">
                          ¿Qué ajustar en la slide #{currentSlideIndex + 1}?
                        </span>
                        <span className="text-[11px] text-zinc-400">
                          (La IA respetará el resto del carrusel y no repetirá textos)
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
                        placeholder='Ej: "enfocar más en ROI de marketing", "hacer el título más intrigante", "menos viñetas"...'
                        className="flex-1 bg-[#0D0D14] border border-[#27273C] rounded-xl px-3.5 py-2 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/40 focus:border-[#D4AF37] transition-all"
                      />
                      <button
                        type="button"
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
                        '📷 Fotografía más editorial',
                        '📈 Destacar métrica numérica',
                        '🎯 Hacer título más contundente',
                        '✨ Simplificar a 2 ideas clave',
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
              {(selectedFormat === 'Post' || selectedFormat === 'Creativo de pauta') && (
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
                          type="button"
                          onClick={() => setSinglePostAspectRatio(ar.id as any)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                            singlePostAspectRatio === ar.id
                              ? 'bg-[#D4AF37] text-black font-bold'
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
                            PIXEL 12 STUDIO
                          </span>
                          <span className="text-[10px] text-[#E5C158] font-bold">
                            {selectedPillar.toUpperCase()} · ESTRATEGIA 2026
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
                              {data?.currentMember?.name || 'Camila Pinto'}
                            </span>
                            <span className="text-[9px] text-zinc-300">Pixel 12 Strategy</span>
                          </div>
                        </div>

                        <span className="px-3 py-1.5 rounded-xl p12-gold-gradient text-black font-black text-xs shadow-md">
                          {(generatedContent.cta || 'Pixel 12').slice(0, 24)}
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

                  {/* Dirección del Prompt Visual de la imagen */}
                  <div className="p-3.5 rounded-xl bg-[#141420] border border-[#232338] space-y-1 text-xs">
                    <span className="text-[11px] font-bold text-[#E5C158] uppercase tracking-wide block">
                      Concepto & Dirección Visual del Arte:
                    </span>
                    <p className="text-zinc-300 italic">{generatedContent.visualConcept}</p>
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* CASO C: GUION DE REEL SEGUNDO A SEGUNDO                                   */}
              {/* ========================================================================= */}
              {selectedFormat === 'Guion de Reel' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-[#0E0E18] border border-[#26263A] space-y-3">
                    <div className="flex items-center justify-between border-b border-[#1E1E30] pb-2">
                      <div className="flex items-center gap-2">
                        <Video className="w-4 h-4 text-[#D4AF37]" />
                        <span className="text-xs font-bold text-white uppercase tracking-wider">
                          Estructura de Retención para Reel (0 a 30 segundos)
                        </span>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-[#E5C158] bg-[#D4AF37]/15 border border-[#D4AF37]/30 px-2 py-0.5 rounded">
                        4 Escenas Clave
                      </span>
                    </div>

                    <div className="space-y-3">
                      {(generatedContent.reelScript || []).map((scene, idx) => (
                        <div key={idx} className="p-3.5 rounded-xl bg-[#141422] border border-[#28283C] space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-mono font-bold text-[#E5C158] bg-black/60 px-2 py-0.5 rounded border border-[#D4AF37]/30">
                              ⏱️ {scene.secondRange}
                            </span>
                            <span className="text-[11px] font-semibold text-zinc-300 uppercase">
                              {scene.shotType}
                            </span>
                          </div>

                          <div className="space-y-1 text-xs">
                            <p className="text-zinc-200">
                              <strong className="text-white">🎙️ Voz en Off / Guion:</strong> "{scene.voiceover}"
                            </p>
                            <p className="text-zinc-400 text-[11px]">
                              <strong className="text-[#CBD5E1]">🎬 Visual en Pantalla:</strong> {scene.visualDirection}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* CASO D: SECUENCIA DE HISTORIAS / STORIES CON STICKERS                      */}
              {/* ========================================================================= */}
              {selectedFormat === 'Historia / Stories' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Secuencia de Stories (Función específica por story)
                    </span>
                    <span className="text-[11px] text-[#E5C158] font-mono">
                      {generatedContent.storiesSequence?.length || 4} Stories
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(generatedContent.storiesSequence || [
                      {
                        storyNumber: 1,
                        role: 'attention',
                        headline: generatedContent.hook,
                        visualIdea: 'Fondo negro con tipografía dorada en tamaño gigante',
                        stickerIdea: 'Sticker de encuesta: "¿Te pasa a ti?" (Sí / Muchísimo)'
                      },
                      {
                        storyNumber: 2,
                        role: 'problem',
                        headline: 'El error silencioso',
                        visualIdea: 'Captura de métricas con flecha señalando la caída',
                        stickerIdea: 'Sticker deslizador de fuego al 100%'
                      },
                      {
                        storyNumber: 3,
                        role: 'solution',
                        headline: 'La solución Pixel 12',
                        visualIdea: 'Foto del equipo o dashboard operativo',
                        stickerIdea: 'Sticker de caja de preguntas: "¿Cuál es tu mayor obstáculo?"'
                      },
                      {
                        storyNumber: 4,
                        role: 'cta',
                        headline: generatedContent.cta,
                        visualIdea: 'Logotipo Pixel 12 con botón directo',
                        stickerIdea: 'Sticker de enlace directo a DM / Agenda'
                      }
                    ]).map((story, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl bg-[#12121E] border border-[#27273C] space-y-2 relative overflow-hidden"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-mono font-bold text-[#E5C158] bg-black/80 px-2 py-0.5 rounded border border-[#D4AF37]/30">
                            Story 0{story.storyNumber || idx + 1}
                          </span>
                          <span className="text-[10px] uppercase font-bold text-zinc-400">
                            {story.role || 'Secuencia'}
                          </span>
                        </div>
                        <h3 className="text-sm font-black text-white leading-snug">
                          {story.headline}
                        </h3>
                        <p className="text-[11px] text-zinc-400">
                          <strong>Visual:</strong> {story.visualIdea}
                        </p>
                        {story.stickerIdea && (
                          <div className="p-2 rounded-lg bg-black/60 border border-[#D4AF37]/20 text-[11px] text-[#E5C158]">
                            <strong>Interacción:</strong> {story.stickerIdea}
                          </div>
                        )}
                      </div>
                    ))}
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
                    type="button"
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

              {/* Bloque 2: Copy Completo para Redes & Refinamiento IA */}
              <div className="bg-[#101018] rounded-2xl border border-[#222234] p-4 sm:p-5 shadow-xl space-y-3">
                <div className="flex items-center justify-between border-b border-[#1F1F30] pb-2">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#D4AF37]" />
                    <span className="font-bold text-xs sm:text-sm text-white">Copy completo para publicación</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(generatedContent.caption, 'caption')}
                    className="text-xs font-bold text-black flex items-center gap-1 p12-gold-gradient px-2.5 py-1 rounded-lg transition-all hover:brightness-105 shadow-xs cursor-pointer"
                  >
                    {copiedSection === 'caption' ? <Check className="w-3.5 h-3.5 text-black" /> : <Copy className="w-3.5 h-3.5 text-black" />}
                    <span>Copiar Copy</span>
                  </button>
                </div>

                <div className="max-h-[260px] overflow-y-auto pr-1">
                  <p className="text-xs sm:text-sm text-zinc-200 whitespace-pre-line leading-relaxed font-sans">
                    {generatedContent.caption}
                  </p>
                </div>

                {/* Acciones Rápidas de Refinamiento IA del Copy */}
                <div className="pt-2 border-t border-[#1C1C2C] space-y-1.5">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                    Refinar Copy con IA:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      disabled={isRefiningCopy}
                      onClick={() => handleRefineCopy('persuasive')}
                      className="text-[11px] bg-[#161624] hover:bg-[#202034] text-zinc-300 hover:text-white px-2.5 py-1 rounded-lg border border-[#28283E] transition-colors cursor-pointer disabled:opacity-50"
                    >
                      🔥 Más persuasivo
                    </button>
                    <button
                      type="button"
                      disabled={isRefiningCopy}
                      onClick={() => handleRefineCopy('shorten')}
                      className="text-[11px] bg-[#161624] hover:bg-[#202034] text-zinc-300 hover:text-white px-2.5 py-1 rounded-lg border border-[#28283E] transition-colors cursor-pointer disabled:opacity-50"
                    >
                      ✂️ Más conciso
                    </button>
                    <button
                      type="button"
                      disabled={isRefiningCopy}
                      onClick={() => handleRefineCopy('direct')}
                      className="text-[11px] bg-[#161624] hover:bg-[#202034] text-zinc-300 hover:text-white px-2.5 py-1 rounded-lg border border-[#28283E] transition-colors cursor-pointer disabled:opacity-50"
                    >
                      🎯 Enfoque comercial
                    </button>
                  </div>
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
                      type="button"
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

              {/* Bloque 4: Acciones Estratégicas y Flujo de Aprobación */}
              <div className="bg-[#101018] rounded-2xl border border-[#222234] p-4 sm:p-5 shadow-xl space-y-3.5">
                <div className="flex items-center justify-between border-b border-[#1F1F30] pb-2">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                    <span className="font-bold text-xs sm:text-sm text-white">
                      Flujo Operativo de la Pieza
                    </span>
                  </div>
                  <span className="text-[10px] text-[#E5C158] uppercase font-mono font-bold">
                    Workspace Pixel 12
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Guardar Borrador */}
                  <button
                    type="button"
                    onClick={handleSaveDraft}
                    disabled={isSavingDraft}
                    className="w-full py-2.5 px-3 rounded-xl bg-[#161624] hover:bg-[#1E1E30] text-zinc-200 hover:text-white border border-[#2E2E44] font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Download className={`w-3.5 h-3.5 ${isSavingDraft ? 'animate-spin' : 'text-[#D4AF37]'}`} />
                    <span>{isSavingDraft ? 'Guardando...' : 'Guardar Borrador'}</span>
                  </button>

                  {/* Enviar a Aprobación */}
                  <button
                    type="button"
                    onClick={handleSubmitApproval}
                    disabled={isSubmittingApproval || isApproved}
                    className="w-full py-2.5 px-3 rounded-xl p12-gold-gradient hover:brightness-105 active:scale-98 text-black font-black text-xs flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-50"
                  >
                    <Send className={`w-3.5 h-3.5 ${isSubmittingApproval ? 'animate-spin' : 'text-black'}`} />
                    <span>{isSubmittingApproval ? 'Enviando...' : isApproved ? 'Enviado a Revisión ✓' : 'Enviar a Aprobación'}</span>
                  </button>
                </div>

                {/* Regeneraciones Parciales Inteligentes */}
                <div className="pt-2 border-t border-[#1C1C2C] space-y-2">
                  <span className="text-[10px] uppercase font-bold text-zinc-400 block">
                    Regeneración Parcial (Separación de Capas):
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={handleRegenerateCopyOnly}
                      disabled={isRegeneratingCopy}
                      className="py-2 px-2.5 rounded-lg bg-[#141420] hover:bg-[#1B1B2C] text-zinc-300 hover:text-white border border-[#262638] text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                      title="Genera nuevos titulares, explicaciones y copy sin alterar las imágenes asignadas"
                    >
                      <RotateCcw className={`w-3 h-3 ${isRegeneratingCopy ? 'animate-spin text-[#D4AF37]' : 'text-[#D4AF37]'}`} />
                      <span>{isRegeneratingCopy ? 'Regenerando Copy...' : 'Regenerar Solo Copy'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleRegenerateImagesOnly}
                      disabled={isRegeneratingImages}
                      className="py-2 px-2.5 rounded-lg bg-[#141420] hover:bg-[#1B1B2C] text-zinc-300 hover:text-white border border-[#262638] text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                      title="Genera nuevas fotografías con IA para todas las slides en paralelo manteniendo los textos intactos"
                    >
                      <Sparkles className={`w-3 h-3 ${isRegeneratingImages ? 'animate-spin text-[#D4AF37]' : 'text-[#D4AF37]'}`} />
                      <span>{isRegeneratingImages ? 'Generando Fotos...' : 'Regenerar Imágenes'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. MODAL DE EDICIÓN EN VIVO DE LA SLIDE                                    */}
      {/* ========================================================================= */}
      {isSlideEditorOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#12121E] border border-[#2A2A40] rounded-3xl w-full max-w-lg p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[#232338] pb-3">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-[#D4AF37]" />
                <h3 className="text-base font-bold text-white">
                  Editar Slide #{currentSlideIndex + 1}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSlideEditorOpen(false)}
                className="text-zinc-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">Etiqueta Superior</label>
                <input
                  type="text"
                  value={editingSlideData.tag || ''}
                  onChange={(e) => setEditingSlideData({ ...editingSlideData, tag: e.target.value })}
                  placeholder="Ej: ERROR #1, PASO CLAVE, SOLUCIÓN"
                  className="w-full bg-[#181828] border border-[#2A2A40] rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">Titular Principal (Headline)</label>
                <input
                  type="text"
                  value={editingSlideData.headline || ''}
                  onChange={(e) => setEditingSlideData({ ...editingSlideData, headline: e.target.value })}
                  placeholder="Titular corto y directo"
                  className="w-full bg-[#181828] border border-[#2A2A40] rounded-xl px-3 py-2 text-xs text-white font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">Subtítulo / Contexto</label>
                <textarea
                  rows={2}
                  value={editingSlideData.subtitle || ''}
                  onChange={(e) => setEditingSlideData({ ...editingSlideData, subtitle: e.target.value })}
                  placeholder="Explicación concisa"
                  className="w-full bg-[#181828] border border-[#2A2A40] rounded-xl px-3 py-2 text-xs text-white resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-300">Métrica (opcional)</label>
                  <input
                    type="text"
                    value={editingSlideData.metricNumber || ''}
                    onChange={(e) => setEditingSlideData({ ...editingSlideData, metricNumber: e.target.value })}
                    placeholder="Ej: +15h, 84%, 3x"
                    className="w-full bg-[#181828] border border-[#2A2A40] rounded-xl px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-300">Texto de Métrica</label>
                  <input
                    type="text"
                    value={editingSlideData.metricLabel || ''}
                    onChange={(e) => setEditingSlideData({ ...editingSlideData, metricLabel: e.target.value })}
                    placeholder="Ej: Tiempo recuperado"
                    className="w-full bg-[#181828] border border-[#2A2A40] rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">Badge Destacado</label>
                <input
                  type="text"
                  value={editingSlideData.highlightBadge || ''}
                  onChange={(e) => setEditingSlideData({ ...editingSlideData, highlightBadge: e.target.value })}
                  placeholder="Ej: CLAVE, RECOMENDADO"
                  className="w-full bg-[#181828] border border-[#2A2A40] rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#232338]">
              <button
                type="button"
                onClick={() => setIsSlideEditorOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={saveSlideEditor}
                className="px-5 py-2 rounded-xl p12-gold-gradient text-black text-xs font-bold shadow-md hover:brightness-105"
              >
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. MODAL DE EDICIÓN DE PROMPT VISUAL Y GENERACIÓN DE IMAGEN REAL          */}
      {/* ========================================================================= */}
      {isPromptEditorOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#12121E] border border-[#2A2A40] rounded-3xl w-full max-w-lg p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[#232338] pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                <h3 className="text-base font-bold text-white">
                  Generar Imagen Real para Slide #{editingPromptSlideIndex + 1}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsPromptEditorOpen(false)}
                className="text-zinc-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">
                  Prompt Visual para el Motor de Imágenes IA
                </label>
                <textarea
                  rows={4}
                  value={customImagePrompt}
                  onChange={(e) => setCustomImagePrompt(e.target.value)}
                  placeholder="Describe la escena fotográfica, iluminación, atmósfera, composición y detalles visuales..."
                  className="w-full bg-[#181828] border border-[#2A2A40] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#D4AF37] font-mono leading-relaxed resize-none"
                />
                <p className="text-[11px] text-zinc-500">
                  El prompt se enviará a la API de generación fotográfica con el estilo de Pixel 12 Studio.
                </p>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-zinc-400 font-semibold">Relación de Aspecto:</span>
                <div className="flex gap-1.5">
                  {(['1:1', '3:4', '4:3', '9:16', '16:9'] as const).map((ar) => (
                    <button
                      key={ar}
                      type="button"
                      onClick={() => setCustomPromptAspectRatio(ar)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                        customPromptAspectRatio === ar
                          ? 'bg-[#D4AF37] text-black font-bold'
                          : 'bg-[#181828] text-zinc-400 hover:text-white'
                      }`}
                    >
                      {ar}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#232338]">
              <button
                type="button"
                onClick={() => setIsPromptEditorOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveAndGeneratePrompt}
                disabled={isRetryingImage || !customImagePrompt.trim()}
                className="px-5 py-2 rounded-xl p12-gold-gradient text-black font-bold text-xs flex items-center gap-1.5 shadow-md disabled:opacity-50 hover:brightness-105 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-black" />
                <span>Generar Imagen Real</span>
              </button>
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

      {/* Modal de Programación directa en Calendario */}
      <ScheduleContentModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        initialData={{
          internalTitle: generatedContent?.title,
          caption: generatedContent?.caption,
          cta: generatedContent?.cta,
          hook: generatedContent?.hook,
          hashtags: generatedContent?.hashtags,
          format: selectedFormat === 'Carrusel' ? 'Carousel' : selectedFormat === 'Guion de Reel' ? 'Reel' : 'Static Post',
          pillar: selectedPillar,
          theme: generatedContent?.theme || topic,
          brandId: activeBrand?.id || 'brand_p12',
          slides: slides,
          imageUrl: slides[0]?.imageUrl || singlePostImageUrl || P12_DYNAMIC_SLIDE_IMAGES[0],
          status: 'SCHEDULED',
        }}
        onScheduled={async (createdPost) => {
          setIsApproved(true);
          showToast('¡Contenido agendado exitosamente en el Calendario!', 'success');
          if (generatedContent?.suggestedTasks && generatedContent.suggestedTasks.length > 0) {
            for (const task of generatedContent.suggestedTasks) {
              await addTask({
                id: 'task_p12_' + Math.random().toString(36).substring(2, 9),
                brandId: activeBrand?.id || 'brand_p12',
                title: task.title,
                description: task.description,
                priority: task.priority,
                status: 'TODO',
                assignedRole: task.assignedRole,
                dueDate: createdPost.date,
                relatedPostId: createdPost.id,
                relatedPostTitle: createdPost.internalTitle,
                history: [],
                createdAt: new Date().toISOString(),
              });
            }
          }
        }}
      />
    </div>
  );
};
