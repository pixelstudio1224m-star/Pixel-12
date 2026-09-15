import React, { useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { generateFullCampaignAI, FullCampaignAIResponse } from '../../lib/api';
import { Post, Task, Platform, ContentFormat, ContentPillar } from '../../types';
import {
  Sparkles,
  X,
  Calendar,
  CheckCircle2,
  Clock,
  Instagram,
  Facebook,
  Linkedin,
  Youtube,
  ArrowRight,
  Layers,
  Users,
  Lightbulb,
  FileCheck
} from 'lucide-react';

const examplePrompts = [
  'Crea el contenido de Pixel 12 para septiembre. Quiero atraer pequeñas empresas que necesiten marketing digital y asistencia virtual. Publica 4 veces por semana en Instagram, Facebook y LinkedIn. Tono cercano, educativo y profesional.',
  'Campaña de autoridad para lanzar Asistencia Virtual 2.0. Enfocada en fundadores saturados de tareas administrativas. Reels con ganchos de 3 segundos y carruseles desglosando el ahorro en horas.',
  'Estrategia de conversión rápida para consultores y negocios de servicios. Queremos agendar diagnósticos estratégicos gratuitos con llamadas a la acción por DM y testimonios verificados.',
];

export const CreateWithAIModal: React.FC = () => {
  const { isCreateWithAIOpen, closeCreateWithAI, activeBrand, data, addPost, addTask, showToast } =
    useWorkspace();

  const [prompt, setPrompt] = useState(
    'Crea el contenido de Pixel 12 para septiembre. Quiero atraer pequeñas empresas que necesiten marketing digital y asistencia virtual. Publica 4 veces por semana en Instagram, Facebook y LinkedIn. Quiero contenido educativo, cercano y profesional.'
  );
  const [targetMonth, setTargetMonth] = useState('Septiembre 2026');
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([
    'instagram',
    'facebook',
    'linkedin',
  ]);
  const [frequency, setFrequency] = useState('4 veces por semana');
  const [tone, setTone] = useState('Cercano, Profesional y Estratégico');
  const [postCount, setPostCount] = useState(6);

  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  const [generatedResult, setGeneratedResult] = useState<FullCampaignAIResponse | null>(null);
  const [activeTab, setActiveTab] = useState<'posts' | 'tasks' | 'strategy'>('posts');
  const [isInserting, setIsInserting] = useState(false);

  if (!isCreateWithAIOpen) return null;

  const togglePlatform = (p: Platform) => {
    if (selectedPlatforms.includes(p)) {
      if (selectedPlatforms.length > 1) {
        setSelectedPlatforms(selectedPlatforms.filter((x) => x !== p));
      }
    } else {
      setSelectedPlatforms([...selectedPlatforms, p]);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      showToast('Por favor escribe una instrucción para la IA', 'error');
      return;
    }

    setIsGenerating(true);
    setGenerationStep(1);

    const stepInterval = setInterval(() => {
      setGenerationStep((prev) => (prev < 3 ? prev + 1 : prev));
    }, 1200);

    try {
      const res = await generateFullCampaignAI({
        prompt,
        brandName: activeBrand.name,
        targetMonth,
        targetPlatforms: selectedPlatforms,
        frequency,
        tone,
        postCount,
      });

      clearInterval(stepInterval);
      setGeneratedResult(res);
      setIsGenerating(false);
    } catch (err: any) {
      clearInterval(stepInterval);
      setIsGenerating(false);
      showToast(err.message || 'Error al generar campaña', 'error');
    }
  };

  const handleInsertAll = async () => {
    if (!generatedResult) return;
    setIsInserting(true);

    try {
      // Find default members
      const designer = data.members.find((m) => m.role === 'Designer') || data.members[0];
      const copywriter = data.members.find((m) => m.role === 'Copywriter') || data.members[0];
      const cm = data.members.find((m) => m.role === 'Community Manager') || data.members[0];

      // Convert generated posts to workspace posts
      const createdPosts: Post[] = [];

      for (let i = 0; i < generatedResult.posts.length; i++) {
        const p = generatedResult.posts[i];
        const newPost: Post = {
          id: 'post_ai_' + Date.now() + '_' + i,
          brandId: activeBrand.id,
          internalTitle: p.internalTitle || `Publicación #${i + 1} - ${activeBrand.name}`,
          date: p.date || `2026-09-${String(4 + i * 3).padStart(2, '0')}`,
          time: p.time || '11:00',
          platforms: p.platforms || selectedPlatforms,
          format: (p.format as ContentFormat) || 'Carousel',
          pillar: (p.pillar as ContentPillar) || 'Educativo',
          theme: p.theme || 'Crecimiento de negocio',
          objective: p.objective || 'Autoridad y captación',
          hook: p.hook || 'Gancho de impacto',
          caption: p.caption || '',
          cta: p.cta || 'Contáctanos para más información',
          hashtags: p.hashtags || ['#Pixel12', '#MarketingDigital'],
          visualText: p.visualText,
          visualDescription: p.visualDescription,
          imagePrompt: p.imagePrompt,
          imageUrl:
            p.format === 'Reel'
              ? 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&auto=format&fit=crop&q=80'
              : 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&auto=format&fit=crop&q=80',
          script: p.script,
          status: 'DRAFT',
          assigneeId: designer.id,
          assigneeName: designer.name,
          relatedTaskIds: [],
          approvalHistory: [],
          versions: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        await addPost(newPost);
        createdPosts.push(newPost);
      }

      // Convert generated tasks and connect them
      for (let j = 0; j < (generatedResult.tasks || []).length; j++) {
        const t = generatedResult.tasks[j];
        let assignedMember = designer;
        if (t.assignedRole === 'Copywriter') assignedMember = copywriter;
        if (t.assignedRole === 'Community Manager') assignedMember = cm;

        const newTask: Task = {
          id: 'task_ai_' + Date.now() + '_' + j,
          brandId: activeBrand.id,
          title: t.title,
          description: t.description,
          assigneeId: assignedMember.id,
          assigneeName: assignedMember.name,
          creatorId: data.currentMember.id,
          creatorName: data.currentMember.name,
          priority: t.priority || 'HIGH',
          startDate: '2026-09-02',
          deadlineDate: `2026-09-${String(5 + j * 3).padStart(2, '0')}`,
          deadlineTime: '17:00',
          status: 'TODO',
          tags: [t.assignedRole, 'Campaña IA'],
          checklist: [
            { id: 'c1', text: 'Revisar especificaciones de marca', completed: false },
            { id: 'c2', text: 'Ejecutar entregable y adjuntar', completed: false },
          ],
          comments: [],
          relatedPostId: createdPosts[j % createdPosts.length]?.id,
          relatedPostTitle: createdPosts[j % createdPosts.length]?.internalTitle,
          history: [
            {
              id: 'h1',
              authorName: 'Pixel 12 IA',
              action: 'Tarea autogenerada a partir de estrategia de contenido',
              timestamp: new Date().toISOString(),
            },
          ],
          createdAt: new Date().toISOString(),
        };

        await addTask(newTask);
      }

      setIsInserting(false);
      closeCreateWithAI();
      showToast(
        `¡Estrategia completa generada e insertada! (${createdPosts.length} posts y ${generatedResult.tasks?.length || 0} tareas)`
      );
    } catch (e: any) {
      setIsInserting(false);
      showToast('Error al insertar en el workspace: ' + e.message, 'error');
    }
  };

  return (
    <div
      id="create-with-ai-modal"
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-orange-500 flex items-center justify-center shadow-lg shadow-sky-500/30">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold tracking-tight">Crear con IA — Pixel 12 OS</h3>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/40">
                  ESTRATEGIA COMPLETA
                </span>
              </div>
              <p className="text-xs text-slate-300 font-normal">
                Genera estrategia, parrilla editorial de posts y tareas del equipo con un solo prompt.
              </p>
            </div>
          </div>

          <button
            id="close-ai-modal-btn"
            onClick={closeCreateWithAI}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {!generatedResult ? (
            /* Step 1: Prompt & Configurations */
            <div className="space-y-5">
              {/* Prompt Textarea */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center justify-between">
                  <span>¿Qué contenido deseas generar para {activeBrand.name}?</span>
                  <span className="text-[11px] text-slate-400 font-normal">Prompt libre en lenguaje natural</span>
                </label>
                <textarea
                  id="ai-prompt-input"
                  rows={4}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Escribe tu requerimiento libremente. Por ejemplo: 'Crea el contenido de septiembre para captar PyMEs...'"
                  className="w-full text-xs text-slate-800 p-3.5 rounded-xl border border-slate-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 outline-none leading-relaxed transition-all"
                />

                {/* Example prompt pills */}
                <div className="mt-2.5">
                  <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1 mb-1.5">
                    <Lightbulb className="w-3 h-3 text-amber-500" />
                    Ejemplos recomendados (haz clic para usar):
                  </span>
                  <div className="space-y-1">
                    {examplePrompts.map((ex, idx) => (
                      <button
                        key={idx}
                        onClick={() => setPrompt(ex)}
                        className="w-full text-left text-[11px] text-slate-600 hover:text-sky-700 bg-slate-50 hover:bg-sky-50/60 p-2 rounded-lg border border-slate-200/80 transition-colors line-clamp-1"
                      >
                        "{ex}"
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Param Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                {/* Target Month */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Mes objetivo</label>
                  <input
                    type="text"
                    value={targetMonth}
                    onChange={(e) => setTargetMonth(e.target.value)}
                    className="w-full text-xs p-2 bg-white rounded-lg border border-slate-300 focus:border-sky-500 outline-none"
                  />
                </div>

                {/* Frequency */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Frecuencia</label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                    className="w-full text-xs p-2 bg-white rounded-lg border border-slate-300 focus:border-sky-500 outline-none"
                  >
                    <option value="3 veces por semana">3 veces por semana</option>
                    <option value="4 veces por semana">4 veces por semana</option>
                    <option value="5 veces por semana">5 veces por semana</option>
                    <option value="Diario (7 días)">Diario (7 días)</option>
                  </select>
                </div>

                {/* Tone */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Tono de voz</label>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    className="w-full text-xs p-2 bg-white rounded-lg border border-slate-300 focus:border-sky-500 outline-none"
                  >
                    <option value="Cercano, Profesional y Estratégico">Cercano & Profesional</option>
                    <option value="Educativo y de Alto Valor">Educativo & Didáctico</option>
                    <option value="Venta Persuasiva y Directa">Venta & Conversión</option>
                    <option value="Autoridad Disruptiva">Autoridad & Opinión</option>
                  </select>
                </div>

                {/* Post Count */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Cantidad ({postCount} posts)
                  </label>
                  <input
                    type="range"
                    min={4}
                    max={12}
                    step={1}
                    value={postCount}
                    onChange={(e) => setPostCount(Number(e.target.value))}
                    className="w-full accent-sky-600 mt-2 cursor-pointer"
                  />
                </div>
              </div>

              {/* Channels Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-2">Canales de publicación</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'instagram' as Platform, label: 'Instagram', icon: Instagram, color: 'text-pink-600' },
                    { id: 'facebook' as Platform, label: 'Facebook', icon: Facebook, color: 'text-blue-600' },
                    { id: 'linkedin' as Platform, label: 'LinkedIn', icon: Linkedin, color: 'text-sky-700' },
                    { id: 'youtube' as Platform, label: 'YouTube', icon: Youtube, color: 'text-red-600' },
                    { id: 'tiktok' as Platform, label: 'TikTok', icon: Sparkles, color: 'text-slate-900' },
                  ].map((plat) => {
                    const isSelected = selectedPlatforms.includes(plat.id);
                    const Icon = plat.icon;
                    return (
                      <button
                        key={plat.id}
                        type="button"
                        onClick={() => togglePlatform(plat.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                          isSelected
                            ? 'bg-sky-50 border-sky-500 text-sky-800 shadow-xs'
                            : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                        }`}
                      >
                        <Icon className={`w-3.5 h-3.5 ${isSelected ? plat.color : 'text-slate-400'}`} />
                        <span>{plat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Loading State Overlay */}
              {isGenerating && (
                <div className="p-6 rounded-xl bg-sky-50/80 border border-sky-200 text-center space-y-3 animate-pulse">
                  <Sparkles className="w-8 h-8 text-sky-600 mx-auto animate-spin" />
                  <div className="font-bold text-slate-800 text-sm">
                    {generationStep === 1 && '1/3 Analizando propuesta de valor y pilares de marca...'}
                    {generationStep === 2 && '2/3 Redactando hooks de 3 segundos, copys y llamadas a la acción...'}
                    {generationStep >= 3 && '3/3 Generando tareas de diseño, redacción y programación para el equipo...'}
                  </div>
                  <p className="text-xs text-slate-500">
                    La IA está orquestando estrategia, calendario, publicaciones y tareas en una sola pasada.
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* Step 2: Result Preview & Verification */
            <div className="space-y-4">
              {/* Strategy Highlights */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-sky-50 to-indigo-50 border border-sky-200">
                <div className="flex items-center gap-2 mb-1">
                  <FileCheck className="w-4 h-4 text-sky-600" />
                  <h4 className="text-xs font-bold text-sky-900 uppercase tracking-wide">
                    Estrategia Generada con Éxito
                  </h4>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">{generatedResult.strategySummary}</p>
                <div className="mt-2.5 flex flex-wrap gap-2 text-[11px]">
                  <span className="font-semibold text-slate-600">Público:</span>
                  <span className="text-slate-800 bg-white/80 px-2 py-0.5 rounded border border-sky-100">
                    {generatedResult.targetAudience}
                  </span>
                  <span className="font-semibold text-slate-600 ml-2">Pilares:</span>
                  {generatedResult.contentPillars?.map((p, idx) => (
                    <span
                      key={idx}
                      className="bg-white/90 text-sky-800 font-medium px-2 py-0.5 rounded border border-sky-200"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>

              {/* Result Tabs */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab('posts')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
                      activeTab === 'posts'
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Publicaciones ({generatedResult.posts.length})</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('tasks')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
                      activeTab === 'tasks'
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Tareas del Equipo ({generatedResult.tasks?.length || 0})</span>
                  </button>
                </div>

                <button
                  onClick={() => setGeneratedResult(null)}
                  className="text-xs text-sky-600 hover:underline font-medium"
                >
                  ← Modificar prompt o parámetros
                </button>
              </div>

              {/* Tab Contents */}
              {activeTab === 'posts' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto p-1">
                  {generatedResult.posts.map((post, i) => (
                    <div
                      key={i}
                      className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-sky-300 transition-all shadow-xs space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-sky-100 text-sky-800">
                          {post.format}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {post.date} · {post.time}
                        </span>
                      </div>

                      <h5 className="text-xs font-bold text-slate-900 leading-snug line-clamp-1">
                        {post.internalTitle}
                      </h5>

                      <div className="text-[11px] p-2 rounded-lg bg-slate-50 border border-slate-100 text-slate-700">
                        <span className="font-bold text-orange-600">Gancho: </span>
                        "{post.hook}"
                      </div>

                      <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                        {post.caption}
                      </p>

                      <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px] text-slate-500">
                        <span className="font-semibold text-indigo-600">{post.pillar}</span>
                        <span>{post.platforms?.join(', ')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'tasks' && (
                <div className="space-y-2 max-h-96 overflow-y-auto p-1">
                  {(generatedResult.tasks || []).map((t, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between gap-3 shadow-xs"
                    >
                      <div className="space-y-0.5 flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              t.assignedRole === 'Designer'
                                ? 'bg-purple-100 text-purple-700'
                                : t.assignedRole === 'Copywriter'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {t.assignedRole}
                          </span>
                          <span
                            className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                              t.priority === 'HIGH'
                                ? 'bg-rose-100 text-rose-700'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {t.priority}
                          </span>
                          <h5 className="text-xs font-bold text-slate-800">{t.title}</h5>
                        </div>
                        <p className="text-[11px] text-slate-600 pl-1">{t.description}</p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[10px] font-semibold text-slate-500 block">
                          Entrega sugerida:
                        </span>
                        <span className="text-xs font-bold text-slate-800">
                          {t.daysBeforePost} días antes del post
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          {!generatedResult ? (
            <>
              <button
                type="button"
                onClick={closeCreateWithAI}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                id="execute-generate-ai-btn"
                type="button"
                disabled={isGenerating}
                onClick={handleGenerate}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 via-indigo-600 to-orange-500 hover:from-sky-500 hover:to-orange-400 text-white text-xs font-bold shadow-md shadow-sky-500/20 disabled:opacity-50 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isGenerating ? 'Generando Estrategia...' : 'Generar Plan Completo con IA'}</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setGeneratedResult(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition-colors"
              >
                ← Regenerar
              </button>
              <button
                id="commit-ai-campaign-btn"
                type="button"
                disabled={isInserting}
                onClick={handleInsertAll}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 disabled:opacity-50 transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {isInserting
                    ? 'Insertando en el sistema...'
                    : 'Insertar todo en el Workspace (Calendario y Tareas)'}
                </span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
