import React, { useState, useEffect } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { Post, Task, ContentFormat, ContentPillar, Platform, PostStatus } from '../../types';
import { repurposePostAI, publishPostToSocial } from '../../lib/api';
import { CarouselSlideViewer } from '../design/CarouselSlideViewer';
import {
  X,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Share2,
  Users,
  History,
  Layers,
  Send,
  Trash2,
  Edit3,
  Coins,
  Wand2,
  RefreshCw,
  Zap,
  ArrowRight
} from 'lucide-react';

export const PostDetailModal: React.FC = () => {
  const {
    selectedPost,
    closePostDetail,
    updatePost,
    deletePost,
    changePostStatus,
    addTask,
    data,
    showToast,
    generatePostDesign,
    setActiveView
  } = useWorkspace();

  const [activeTab, setActiveTab] = useState<'content' | 'tasks' | 'repurpose' | 'history'>('content');
  const [isEditing, setIsEditing] = useState(false);
  const [commentText, setCommentText] = useState('');

  // Generation from Calendar state
  const [isGeneratingDesign, setIsGeneratingDesign] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  const [generationSeconds, setGenerationSeconds] = useState(0);
  const [justGenerated, setJustGenerated] = useState(false);

  // Editable fields
  const [title, setTitle] = useState(selectedPost?.internalTitle || '');
  const [hook, setHook] = useState(selectedPost?.hook || '');
  const [caption, setCaption] = useState(selectedPost?.caption || '');
  const [cta, setCta] = useState(selectedPost?.cta || '');
  const [date, setDate] = useState(selectedPost?.date || '');
  const [time, setTime] = useState(selectedPost?.time || '');
  const [script, setScript] = useState(selectedPost?.script || '');
  const [format, setFormat] = useState<ContentFormat>(selectedPost?.format || 'Carousel');
  const [pillar, setPillar] = useState<ContentPillar>(selectedPost?.pillar || 'Marketing Digital');
  const [platforms, setPlatforms] = useState<Platform[]>(selectedPost?.platforms || ['instagram']);
  const [hashtagsText, setHashtagsText] = useState<string>((selectedPost?.hashtags || []).join(' '));
  const [status, setStatus] = useState<PostStatus>(selectedPost?.status || 'DRAFT');

  useEffect(() => {
    if (selectedPost) {
      setTitle(selectedPost.internalTitle || '');
      setHook(selectedPost.hook || '');
      setCaption(selectedPost.caption || '');
      setCta(selectedPost.cta || '');
      setDate(selectedPost.date || '');
      setTime(selectedPost.time || '');
      setScript(selectedPost.script || '');
      setFormat(selectedPost.format);
      setPillar(selectedPost.pillar);
      setPlatforms(selectedPost.platforms || []);
      setHashtagsText((selectedPost.hashtags || []).join(' '));
      setStatus(selectedPost.status);
    }
  }, [selectedPost]);

  // Repurpose state
  const [targetRepurposeFormat, setTargetRepurposeFormat] = useState<ContentFormat>('Carousel');
  const [targetRepurposePlatform, setTargetRepurposePlatform] = useState<Platform>('linkedin');
  const [isRepurposing, setIsRepurposing] = useState(false);
  const [repurposedResult, setRepurposedResult] = useState<any>(null);

  // Publishing state
  const [isPublishing, setIsPublishing] = useState(false);

  if (!selectedPost) return null;

  const handleSaveChanges = async () => {
    const previousSnapshot = {
      version: (selectedPost.versions?.length || 0) + 1,
      timestamp: new Date().toISOString(),
      authorName: data.currentMember.name,
      changesSummary: 'Edición completa de contenido y parámetros',
      caption: selectedPost.caption,
      hook: selectedPost.hook,
      cta: selectedPost.cta,
    };

    const tagsArray = hashtagsText
      .split(/[\s,]+/)
      .map((t) => t.trim())
      .filter(Boolean)
      .map((t) => (t.startsWith('#') ? t : `#${t}`));

    const updated: Post = {
      ...selectedPost,
      internalTitle: title,
      hook,
      caption,
      cta,
      date,
      time,
      script,
      format,
      pillar,
      platforms,
      hashtags: tagsArray.length > 0 ? tagsArray : selectedPost.hashtags,
      status,
      versions: [previousSnapshot, ...(selectedPost.versions || [])],
      updatedAt: new Date().toISOString(),
    };

    await updatePost(updated);
    setIsEditing(false);
    showToast('Publicación actualizada exitosamente');
  };

  const handleGenerateOperationalTasks = async () => {
    const designer = data.members.find((m) => m.role === 'Designer') || data.members[0];
    const copywriter = data.members.find((m) => m.role === 'Copywriter') || data.members[0];
    const cm = data.members.find((m) => m.role === 'Community Manager') || data.members[0];

    const task1: Task = {
      id: 'task_gen_' + Date.now() + '_1',
      brandId: selectedPost.brandId,
      title: `Diseñar arte/carrusel: ${selectedPost.internalTitle}`,
      description: `Crear los visuales para ${selectedPost.format}. Concepto: ${
        selectedPost.visualDescription || selectedPost.hook
      }`,
      assigneeId: designer.id,
      assigneeName: designer.name,
      creatorId: data.currentMember.id,
      creatorName: data.currentMember.name,
      priority: 'HIGH',
      startDate: '2026-09-02',
      deadlineDate: selectedPost.date,
      deadlineTime: '12:00',
      status: 'TODO',
      tags: ['Diseño', selectedPost.format],
      checklist: [
        { id: 'c1', text: 'Elaborar arte en formato 1080x1350', completed: false },
        { id: 'c2', text: 'Subir entregable para revisión', completed: false },
      ],
      comments: [],
      relatedPostId: selectedPost.id,
      relatedPostTitle: selectedPost.internalTitle,
      history: [
        {
          id: 'h1',
          authorName: data.currentMember.name,
          action: 'Tarea generada desde el post',
          timestamp: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
    };

    const task2: Task = {
      id: 'task_gen_' + Date.now() + '_2',
      brandId: selectedPost.brandId,
      title: `Programar y verificar hashtags: ${selectedPost.internalTitle}`,
      description: `Programar para el ${selectedPost.date} a las ${selectedPost.time} en ${selectedPost.platforms.join(
        ', '
      )}.`,
      assigneeId: cm.id,
      assigneeName: cm.name,
      creatorId: data.currentMember.id,
      creatorName: data.currentMember.name,
      priority: 'MEDIUM',
      startDate: selectedPost.date,
      deadlineDate: selectedPost.date,
      deadlineTime: selectedPost.time,
      status: 'TODO',
      tags: ['Programación', 'CM'],
      checklist: [{ id: 'c21', text: 'Comprobar links y primer comentario', completed: false }],
      comments: [],
      relatedPostId: selectedPost.id,
      relatedPostTitle: selectedPost.internalTitle,
      history: [],
      createdAt: new Date().toISOString(),
    };

    await addTask(task1);
    await addTask(task2);

    const updatedPost: Post = {
      ...selectedPost,
      relatedTaskIds: [...selectedPost.relatedTaskIds, task1.id, task2.id],
    };
    await updatePost(updatedPost);

    showToast('Tareas de diseñador y community manager generadas y vinculadas');
  };

  const handleRepurpose = async () => {
    setIsRepurposing(true);
    try {
      const res = await repurposePostAI(selectedPost, targetRepurposeFormat, targetRepurposePlatform);
      setRepurposedResult(res);
      setIsRepurposing(false);
      showToast(`Contenido adaptado a ${targetRepurposeFormat} para ${targetRepurposePlatform}`);
    } catch (err: any) {
      setIsRepurposing(false);
      showToast(err.message || 'Error al adaptar contenido', 'error');
    }
  };

  const handleApplyRepurposedAsNewPost = async () => {
    if (!repurposedResult) return;
    const newPost: Post = {
      id: 'post_rep_' + Date.now(),
      brandId: selectedPost.brandId,
      internalTitle: `[Adaptación ${targetRepurposePlatform}]: ${selectedPost.internalTitle}`,
      date: selectedPost.date,
      time: selectedPost.time,
      platforms: [targetRepurposePlatform],
      format: targetRepurposeFormat,
      pillar: selectedPost.pillar,
      theme: selectedPost.theme,
      objective: selectedPost.objective,
      hook: repurposedResult.hook || selectedPost.hook,
      caption: repurposedResult.caption || selectedPost.caption,
      cta: repurposedResult.cta || selectedPost.cta,
      hashtags: repurposedResult.hashtags || selectedPost.hashtags,
      status: 'DRAFT',
      relatedTaskIds: [],
      approvalHistory: [],
      versions: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await updatePost(newPost);
    closePostDetail();
    showToast('Nueva publicación adaptada guardada en el calendario');
  };

  const handlePublishNow = async () => {
    setIsPublishing(true);
    try {
      const res = await publishPostToSocial(selectedPost.id, selectedPost.platforms);
      setIsPublishing(false);
      if (res.success) {
        showToast('Publicación enviada exitosamente');
      } else {
        showToast(res.message, 'error');
      }
    } catch (err: any) {
      setIsPublishing(false);
      showToast(err.message || 'Error al conectar con redes', 'error');
    }
  };

  const handleGenerateDesignFromCalendar = async () => {
    const isCarousel = selectedPost.format === 'Carousel';
    const cost = isCarousel ? 6 : 1;
    const currentCredits = data.workspaceSettings.aiCredits ?? 120;

    if (currentCredits < cost) {
      showToast(`No tienes suficientes créditos de IA (${currentCredits} disponibles, se requieren ${cost})`, 'error');
      return;
    }

    setIsGeneratingDesign(true);
    setGenerationSeconds(0);
    setGenerationStep(0);

    const stepInterval = setInterval(() => {
      setGenerationStep((prev) => Math.min(3, prev + 1));
    }, 12000);

    const timerInterval = setInterval(() => {
      setGenerationSeconds((prev) => prev + 1);
    }, 1000);

    try {
      await generatePostDesign(selectedPost.id);
      setJustGenerated(true);
      showToast(`¡Diseño generado! La pieza ahora aparece en Aprobación → Pendientes con sus slides.`);
    } catch (err: any) {
      console.error('Error generating post design:', err);
      showToast(err?.message || 'Error al generar el diseño con IA', 'error');
    } finally {
      clearInterval(stepInterval);
      clearInterval(timerInterval);
      setIsGeneratingDesign(false);
    }
  };

  const stepDescriptions = [
    'Analizando copy comercial y ganchos de alta conversión...',
    'Componiendo 6 diapositivas con identidad Pixel 12 (Negro, Dorado y Plateado)...',
    'Integrando fotografía editorial, analítica comercial y logotipo oficial Pixel 12...',
    'Renderizando tipografía de alta jerarquía y exportando artes listos para publicar...'
  ];

  const relatedTasks = (data?.tasks || []).filter((t) => t && t.relatedPostId === selectedPost.id);

  const statusColors: Record<PostStatus, { bg: string; text: string; label: string }> = {
    DRAFT: { bg: 'bg-amber-100', text: 'text-amber-800', label: 'Borrador' },
    IN_REVIEW: { bg: 'bg-indigo-100', text: 'text-indigo-800', label: 'En Revisión' },
    CHANGES_REQUESTED: { bg: 'bg-rose-100', text: 'text-rose-800', label: 'Cambios Solicitados' },
    APPROVED: { bg: 'bg-emerald-100', text: 'text-emerald-800', label: 'Aprobado' },
    SCHEDULED: { bg: 'bg-sky-100', text: 'text-sky-800', label: 'Programado' },
    PUBLISHED: { bg: 'bg-emerald-600', text: 'text-white', label: 'Publicado' },
    REJECTED: { bg: 'bg-red-100', text: 'text-red-800', label: 'Rechazado' },
    FAILED: { bg: 'bg-red-500', text: 'text-white', label: 'Error' },
  };

  const currStatus = statusColors[selectedPost.status] || {
    bg: 'bg-slate-100',
    text: 'text-slate-800',
    label: selectedPost.status,
  };

  return (
    <div
      id="post-detail-modal"
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
          <div className="flex items-center gap-3">
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-full ${currStatus.bg} ${currStatus.text}`}
            >
              {currStatus.label}
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-snug line-clamp-1">
                {selectedPost.internalTitle}
              </h3>
              <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                <span>{selectedPost.format}</span>
                <span>•</span>
                <span>{selectedPost.pillar}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  {selectedPost.date} {selectedPost.time}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 flex items-center gap-1 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isEditing ? 'Cancelar edición' : 'Editar'}</span>
            </button>
            <button
              onClick={async () => {
                await deletePost(selectedPost.id);
                closePostDetail();
              }}
              className="px-3 py-1.5 rounded-lg border border-rose-500/40 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Eliminar publicación del sistema"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Eliminar</span>
            </button>
            <button
              onClick={closePostDetail}
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="px-6 border-b border-slate-200 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab('content')}
              className={`py-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'content'
                  ? 'border-sky-600 text-sky-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Contenido & Visual</span>
            </button>
            <button
              onClick={() => setActiveTab('tasks')}
              className={`py-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'tasks'
                  ? 'border-sky-600 text-sky-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Tareas Vinculadas ({relatedTasks.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('repurpose')}
              className={`py-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'repurpose'
                  ? 'border-sky-600 text-sky-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-orange-500" />
              <span>Reutilizar con IA</span>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`py-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'history'
                  ? 'border-sky-600 text-sky-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Historial & Versiones ({selectedPost.versions?.length || 0})</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleGenerateOperationalTasks}
              className="text-xs font-bold text-sky-700 hover:text-sky-800 bg-sky-50 hover:bg-sky-100 px-3 py-1.5 rounded-lg border border-sky-200 transition-colors flex items-center gap-1"
            >
              <Users className="w-3.5 h-3.5" />
              <span>+ Generar tareas para equipo</span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'content' && (
            <div className="space-y-6">
              {/* Approval Quick Bar */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700">Flujo de Aprobación:</span>
                  <span className="text-xs text-slate-500">
                    Cambia el estado o agrega comentarios de retroalimentación
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {selectedPost.status !== 'APPROVED' && (
                    <button
                      onClick={() => changePostStatus(selectedPost.id, 'APPROVED')}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Aprobar</span>
                    </button>
                  )}

                  {selectedPost.status !== 'CHANGES_REQUESTED' && (
                    <button
                      onClick={() => {
                        const reason = prompt('Indica los cambios requeridos:');
                        if (reason) changePostStatus(selectedPost.id, 'CHANGES_REQUESTED', reason);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-white text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Pedir Cambios</span>
                    </button>
                  )}

                  {selectedPost.status !== 'REJECTED' && (
                    <button
                      onClick={async () => {
                        await changePostStatus(selectedPost.id, 'REJECTED');
                        closePostDetail();
                      }}
                      className="px-3 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/40 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                      title="No aprobar y eliminar inmediatamente del sistema"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>No Aprobar (Borrar)</span>
                    </button>
                  )}

                  {selectedPost.status === 'APPROVED' && (
                    <button
                      onClick={() => changePostStatus(selectedPost.id, 'SCHEDULED')}
                      className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Programar</span>
                    </button>
                  )}

                  {selectedPost.status === 'SCHEDULED' && (
                    <button
                      disabled={isPublishing}
                      onClick={handlePublishNow}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>{isPublishing ? 'Publicando...' : 'Publicar Ahora'}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Main Content & Visual Two-Column Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column: Copy, Hook, CTA */}
                <div className="space-y-4">
                  {/* Internal Title (when editing) */}
                  {isEditing && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Título Interno de la Publicación
                      </label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:border-sky-500 outline-none font-medium"
                      />
                    </div>
                  )}

                  {/* Format & Pillar (when editing) */}
                  {isEditing && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Formato</label>
                        <select
                          value={format}
                          onChange={(e) => setFormat(e.target.value as ContentFormat)}
                          className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                        >
                          <option value="Carousel">Carousel (Carrusel)</option>
                          <option value="Reel">Reel / Video Corto</option>
                          <option value="Static Post">Static Post</option>
                          <option value="LinkedIn Post">LinkedIn Post</option>
                          <option value="Story">Story</option>
                          <option value="Thread">Thread</option>
                          <option value="Blog Post">Blog Post</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Pilar</label>
                        <select
                          value={pillar}
                          onChange={(e) => setPillar(e.target.value as ContentPillar)}
                          className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                        >
                          <option value="Marketing Digital">Marketing Digital</option>
                          <option value="Asistencia Virtual">Asistencia Virtual</option>
                          <option value="Autoridad">Autoridad</option>
                          <option value="Conversión">Conversión</option>
                          <option value="Engagement">Engagement</option>
                          <option value="Educativo">Educativo</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Platforms selection (when editing) */}
                  {isEditing && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Canales / Redes Sociales</label>
                      <div className="flex flex-wrap gap-1.5">
                        {(['instagram', 'linkedin', 'facebook', 'youtube', 'tiktok'] as Platform[]).map((plat) => {
                          const isSelected = platforms.includes(plat);
                          return (
                            <button
                              key={plat}
                              type="button"
                              onClick={() => {
                                if (isSelected) {
                                  setPlatforms(platforms.filter((p) => p !== plat));
                                } else {
                                  setPlatforms([...platforms, plat]);
                                }
                              }}
                              className={`text-xs px-2.5 py-1 rounded-lg border font-semibold capitalize transition-colors cursor-pointer ${
                                isSelected
                                  ? 'bg-sky-600 text-white border-sky-600'
                                  : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                              }`}
                            >
                              {plat}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Date and Time (when editing) */}
                  {isEditing && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Fecha Programada</label>
                        <input
                          type="date"
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                          className="w-full text-xs p-2 rounded-lg border border-slate-300 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Hora</label>
                        <input
                          type="time"
                          value={time}
                          onChange={(e) => setTime(e.target.value)}
                          className="w-full text-xs p-2 rounded-lg border border-slate-300 outline-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* Hook */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Gancho / Hook inicial (Primeros 3 segundos)
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={hook}
                        onChange={(e) => setHook(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:border-sky-500 outline-none"
                      />
                    ) : (
                      <div className="p-3 rounded-lg bg-orange-50/70 border border-orange-200 text-xs text-orange-950 font-medium">
                        "{selectedPost.hook}"
                      </div>
                    )}
                  </div>

                  {/* Caption */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Caption / Copy</label>
                    {isEditing ? (
                      <textarea
                        rows={7}
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:border-sky-500 outline-none leading-relaxed"
                      />
                    ) : (
                      <div className="p-3.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 whitespace-pre-line leading-relaxed max-h-64 overflow-y-auto">
                        {selectedPost.caption}
                      </div>
                    )}
                  </div>

                  {/* CTA */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Llamada a la Acción (CTA)
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={cta}
                        onChange={(e) => setCta(e.target.value)}
                        className="w-full text-xs p-2 rounded-lg border border-slate-300 outline-none"
                      />
                    ) : (
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700">
                        {selectedPost.cta}
                      </div>
                    )}
                  </div>

                  {/* Hashtags */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Hashtags</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={hashtagsText}
                        onChange={(e) => setHashtagsText(e.target.value)}
                        placeholder="#Pixel12 #MarketingDigital #AsistenciaVirtual"
                        className="w-full text-xs p-2 rounded-lg border border-slate-300 outline-none"
                      />
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {selectedPost.hashtags?.map((tag, i) => (
                          <span
                            key={i}
                            className="text-[11px] font-medium text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Script if Reel or when editing */}
                  {(isEditing || selectedPost.script) && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Guion de Reel / Short
                      </label>
                      {isEditing ? (
                        <textarea
                          rows={4}
                          value={script}
                          onChange={(e) => setScript(e.target.value)}
                          placeholder="Texto del guion, indicaciones visuales y audio..."
                          className="w-full text-xs p-2 rounded-lg border border-slate-300 font-mono leading-relaxed"
                        />
                      ) : (
                        <div className="p-3 rounded-lg bg-slate-900 text-slate-200 text-[11px] font-mono whitespace-pre-line leading-relaxed">
                          {selectedPost.script}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Status selection (when editing) */}
                  {isEditing && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Estado</label>
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value as PostStatus)}
                        className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                      >
                        <option value="DRAFT">Borrador (DRAFT)</option>
                        <option value="IN_REVIEW">En Revisión (IN_REVIEW)</option>
                        <option value="APPROVED">Aprobado (APPROVED)</option>
                        <option value="SCHEDULED">Programado (SCHEDULED)</option>
                        <option value="PUBLISHED">Publicado (PUBLISHED)</option>
                      </select>
                    </div>
                  )}

                  {isEditing ? (
                    <div className="flex items-center gap-3 pt-2">
                      <button
                        onClick={handleSaveChanges}
                        className="flex-1 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        Guardar Cambios y Crear Versión
                      </button>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="py-2.5 px-4 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <div className="pt-2 flex items-center gap-3">
                      <button
                        onClick={() => setIsEditing(true)}
                        className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Editar esta Publicación</span>
                      </button>
                      <button
                        onClick={async () => {
                          await deletePost(selectedPost.id);
                          closePostDetail();
                        }}
                        className="py-2.5 px-4 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Eliminar</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Right Column: Visual Preview & Adaptations */}
                <div className="space-y-4">
                  {/* Si la pieza ya tiene slides generadas */}
                  {selectedPost.slides && selectedPost.slides.length > 0 ? (
                    <div className="space-y-3">
                      {justGenerated && (
                        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-center justify-between gap-3 shadow-xs">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                            <div>
                              <p className="text-xs font-bold text-emerald-900">
                                ¡Diseño generado con éxito!
                              </p>
                              <p className="text-[11px] text-emerald-700">
                                La pieza ahora aparece en <strong>Aprobación → Pendientes</strong> con sus 6 slides.
                              </p>
                            </div>
                          </div>

                          <button
                            onClick={() => changePostStatus(selectedPost.id, 'APPROVED')}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Aprobar Ahora</span>
                          </button>
                        </div>
                      )}

                      <CarouselSlideViewer
                        post={selectedPost}
                        onPostUpdated={(updated) => updatePost(updated)}
                      />
                    </div>
                  ) : (
                    /* 1) GENERAR EL DISEÑO DESDE EL CALENDARIO (Sin imágenes aún) */
                    <div className="space-y-4">
                      <div className="p-5 rounded-2xl bg-gradient-to-b from-amber-50/70 to-orange-50/50 border-2 border-dashed border-amber-300 shadow-xs space-y-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-500 text-white shadow-2xs">
                                Pieza de la Matriz
                              </span>
                              <span className="text-[11px] text-slate-500 font-medium">
                                Copy y hora listos · Sin imágenes
                              </span>
                            </div>
                            <h4 className="text-sm font-bold text-slate-900">
                              {selectedPost.format === 'Carousel'
                                ? 'Generar carrusel con IA (6 slides)'
                                : 'Generar post con IA'}
                            </h4>
                          </div>

                          <div className="flex items-center gap-1 text-xs font-bold bg-white px-2.5 py-1 rounded-xl border border-amber-200 text-amber-900 shadow-2xs">
                            <Coins className="w-3.5 h-3.5 text-amber-500" />
                            <span>{selectedPost.format === 'Carousel' ? '6 créditos' : '1 crédito'}</span>
                          </div>
                        </div>

                        {/* Explicación de la funcionalidad */}
                        <div className="p-3.5 rounded-xl bg-white/90 border border-amber-200 text-xs text-slate-700 space-y-2">
                          <p className="font-semibold text-slate-900">
                            Las piezas de la matriz llegan al calendario con el copy y la hora, pero sin imágenes. Ahora se generan ahí mismo:
                          </p>
                          <ul className="space-y-1 text-slate-600 text-[11px]">
                            <li className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                              <span>Calendario → pinchas el día → Ver completo</span>
                            </li>
                            <li className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                              <span>
                                Botón <strong>"Generar carrusel"</strong> (o "Generar post"). Demora 1 a 2 minutos
                              </span>
                            </li>
                            <li className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                              <span>
                                Cuando termina, la pieza aparece en <strong>Aprobación → Pendientes</strong> con sus slides
                              </span>
                            </li>
                            <li className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                              <span>La revisas y le das <strong>Aprobar</strong></span>
                            </li>
                          </ul>
                        </div>

                        {/* Botón de Generar Carrusel / Post */}
                        <div>
                          <button
                            onClick={handleGenerateDesignFromCalendar}
                            disabled={isGeneratingDesign}
                            className="w-full py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-500 active:scale-98 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                          >
                            {isGeneratingDesign ? (
                              <>
                                <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                                <span>Generando diseño con IA ({generationSeconds}s)...</span>
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-4 h-4 text-slate-950 fill-slate-950" />
                                <span>
                                  {selectedPost.format === 'Carousel' ? '✨ Generar carrusel' : '✨ Generar post'}
                                </span>
                                <span className="text-[11px] font-mono opacity-80">
                                  (Demora 1 a 2 minutos)
                                </span>
                              </>
                            )}
                          </button>
                        </div>

                        {/* Ticker de Progreso durante la generación */}
                        {isGeneratingDesign && (
                          <div className="p-3.5 rounded-xl bg-white border border-amber-300 space-y-2 animate-pulse">
                            <div className="flex items-center justify-between text-xs font-bold">
                              <span className="text-amber-900">Paso {generationStep + 1} de 4</span>
                              <span className="text-slate-500 font-mono">{generationSeconds}s transcurridos</span>
                            </div>
                            <p className="text-xs text-slate-800 font-medium">
                              {stepDescriptions[generationStep]}
                            </p>
                            <div className="w-full bg-amber-100 rounded-full h-1.5 overflow-hidden">
                              <div
                                className="bg-amber-500 h-1.5 rounded-full transition-all duration-500"
                                style={{ width: `${Math.min(95, ((generationStep + 1) / 4) * 100)}%` }}
                              />
                            </div>
                            <p className="text-[10px] text-slate-400 text-center">
                              Integrando identidad oficial Pixel 12 y lineamientos visuales de la marca...
                            </p>
                          </div>
                        )}

                        {/* Recordatorio de créditos */}
                        <div className="flex items-center gap-1.5 text-[11px] text-amber-800/80">
                          <Coins className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>
                            Cada imagen generada gasta crédito de la cuenta de IA. Rehacer una slide gasta 1, regenerar todo gasta 6.
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Target Platforms Preview */}
                  <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-2">
                    <span className="text-xs font-bold text-slate-700 block">Canales Programados:</span>
                    <div className="flex flex-wrap gap-2">
                      {selectedPost.platforms?.map((plat) => (
                        <span
                          key={plat}
                          className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 capitalize"
                        >
                          {plat}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tasks' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">
                  Tareas requeridas para que esta publicación esté lista:
                </span>
                <button
                  onClick={handleGenerateOperationalTasks}
                  className="text-xs font-semibold text-sky-600 hover:underline"
                >
                  + Agregar tareas predeterminadas
                </button>
              </div>

              {relatedTasks.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <p className="text-xs text-slate-500">
                    No hay tareas asignadas para este post todavía.
                  </p>
                  <button
                    onClick={handleGenerateOperationalTasks}
                    className="px-4 py-2 rounded-lg bg-sky-600 text-white text-xs font-bold hover:bg-sky-500"
                  >
                    Generar Tareas Operativas con 1 Clic
                  </button>
                </div>
              ) : (
                relatedTasks.map((t) => (
                  <div
                    key={t.id}
                    className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                          {t.status}
                        </span>
                        <h5 className="text-xs font-bold text-slate-900">{t.title}</h5>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Asignado a: <strong className="text-slate-700">{t.assigneeName}</strong> · Deadline:{' '}
                        {t.deadlineDate}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'repurpose' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-orange-50/70 border border-orange-200 space-y-1">
                <h4 className="text-xs font-bold text-orange-950 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-orange-600" />
                  Motor de Reutilización y Adaptación Inteligente
                </h4>
                <p className="text-xs text-orange-900/80 leading-relaxed">
                  Transforma automáticamente este {selectedPost.format} a otro formato o canal con la IA de
                  Pixel 12 manteniendo la esencia estratégica.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Formato destino</label>
                  <select
                    value={targetRepurposeFormat}
                    onChange={(e) => setTargetRepurposeFormat(e.target.value as ContentFormat)}
                    className="w-full text-xs p-2 bg-white rounded-lg border border-slate-300"
                  >
                    <option value="Carousel">Carrusel de 6-8 diapositivas</option>
                    <option value="Reel">Guion de Reel / TikTok dinámico</option>
                    <option value="LinkedIn Post">Artículo / Post largo de LinkedIn</option>
                    <option value="Static Post">Post estático con frase de impacto</option>
                    <option value="Story">Secuencia de 3 historias</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Plataforma destino</label>
                  <select
                    value={targetRepurposePlatform}
                    onChange={(e) => setTargetRepurposePlatform(e.target.value as Platform)}
                    className="w-full text-xs p-2 bg-white rounded-lg border border-slate-300"
                  >
                    <option value="linkedin">LinkedIn</option>
                    <option value="instagram">Instagram</option>
                    <option value="facebook">Facebook</option>
                    <option value="tiktok">TikTok</option>
                    <option value="youtube">YouTube Shorts</option>
                  </select>
                </div>
              </div>

              <button
                disabled={isRepurposing}
                onClick={handleRepurpose}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-sky-600 hover:from-orange-400 hover:to-sky-500 text-white text-xs font-bold shadow-md disabled:opacity-50 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isRepurposing ? 'Adaptando contenido con IA...' : 'Adaptar a nuevo formato'}</span>
              </button>

              {repurposedResult && (
                <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-3 animate-in fade-in duration-150">
                  <span className="text-xs font-bold text-slate-900 block">Resultado Adaptado:</span>
                  <div className="text-xs p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800">
                    <span className="font-bold text-orange-600 block mb-1">Hook adaptado:</span>
                    "{repurposedResult.hook}"
                  </div>
                  <div className="text-xs p-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 whitespace-pre-line leading-relaxed">
                    {repurposedResult.caption}
                  </div>

                  <button
                    onClick={handleApplyRepurposedAsNewPost}
                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
                  >
                    + Guardar como nueva publicación en Calendario
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-700 block">
                Historial de Versiones y Revisiones:
              </span>

              {(!selectedPost.versions || selectedPost.versions.length === 0) &&
              (!selectedPost.approvalHistory || selectedPost.approvalHistory.length === 0) ? (
                <p className="text-xs text-slate-500 p-6 text-center bg-slate-50 rounded-xl">
                  Esta publicación está en su versión inicial. Al editarla se registrarán automáticamente los
                  cambios.
                </p>
              ) : (
                <div className="space-y-2">
                  {selectedPost.approvalHistory?.map((appr) => (
                    <div
                      key={appr.id}
                      className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs flex items-center justify-between"
                    >
                      <div>
                        <span className="font-bold text-slate-800">{appr.reviewerName}</span>
                        <span className="text-slate-500 ml-1.5">marcó como {appr.action}</span>
                        {appr.comment && <p className="text-slate-600 mt-1 italic">"{appr.comment}"</p>}
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {new Date(appr.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  ))}

                  {selectedPost.versions?.map((ver, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-white border border-slate-200 text-xs flex items-center justify-between"
                    >
                      <div>
                        <span className="font-bold text-slate-800">Versión #{ver.version}</span>
                        <span className="text-slate-500 ml-2">por {ver.authorName}</span>
                        <p className="text-[11px] text-slate-600 mt-0.5">{ver.changesSummary}</p>
                      </div>
                      <button
                        onClick={() => {
                          setCaption(ver.caption);
                          setHook(ver.hook);
                          setCta(ver.cta);
                          setIsEditing(true);
                          setActiveTab('content');
                          showToast(`Versión #${ver.version} restaurada en el editor`);
                        }}
                        className="text-xs text-sky-600 font-semibold hover:underline"
                      >
                        Restaurar copia
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
