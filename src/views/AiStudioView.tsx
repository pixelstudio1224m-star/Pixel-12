import React, { useState, useRef, useEffect } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import {
  multimodalChatAI,
  imageStudioAI,
  videoGenerateAI,
  videoStatusAI,
  videoDownloadAI,
  transcribeAudioAI,
  MultimodalChatMessage
} from '../lib/api';
import {
  Sparkles,
  MessageSquare,
  Image as ImageIcon,
  Video as VideoIcon,
  Mic,
  MicOff,
  Search,
  Send,
  Upload,
  Download,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  Layers,
  Wand2,
  Globe,
  FileAudio,
  AlertCircle,
  Play,
  RotateCcw,
  Sliders,
  CheckCircle2,
  Maximize2
} from 'lucide-react';

type StudioTab = 'chat' | 'image' | 'video' | 'transcribe' | 'search';

export const AiStudioView: React.FC = () => {
  const { activeBrand, showToast, addPost } = useWorkspace();
  const [activeTab, setActiveTab] = useState<StudioTab>('chat');

  // -------------------------------------------------------------
  // 1. MULTI-TURN CHAT STATE
  // -------------------------------------------------------------
  const [chatRole, setChatRole] = useState<'strategist' | 'art_director' | 'growth' | 'copywriter'>('strategist');
  const [chatModel, setChatModel] = useState<'gemini-3.1-pro-preview' | 'gemini-3.5-flash' | 'gemini-3.1-flash-lite'>('gemini-3.5-flash');
  const [enableSearchGrounding, setEnableSearchGrounding] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<Array<{
    id: string;
    sender: 'user' | 'model';
    text: string;
    modelUsed?: string;
    sources?: Array<{ title: string; uri: string }>;
    timestamp: string;
  }>>([
    {
      id: 'init_welcome',
      sender: 'model',
      text: `¡Bienvenido al **Estudio Multimodal IA** de Pixel 12! 🚀\n\nEstoy configurado con la suite oficial de **Gemini 3.x** y **Veo 3** para potenciar el marketing de **${activeBrand?.name || 'Pixel 12'}**.\n\nPuedes alternar entre roles especializados, consultar datos en vivo con **Google Search Grounding**, transcribir audios de voz y generar recursos visuales o de video en las pestañas superiores.\n\n¿En qué objetivo estratégico trabajamos hoy?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatScrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isChatLoading]);

  const handleSendChat = async (overrideText?: string) => {
    const textToSend = overrideText || chatInput;
    if (!textToSend.trim() || isChatLoading) return;

    const userMsgId = 'usr_' + Date.now();
    const newUserMsg = {
      id: userMsgId,
      sender: 'user' as const,
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, newUserMsg]);
    setChatInput('');
    setIsChatLoading(true);

    try {
      const historyTurns: MultimodalChatMessage[] = chatMessages
        .filter((m) => m.id !== 'init_welcome')
        .map((m) => ({
          role: m.sender,
          content: m.text,
        }));

      const res = await multimodalChatAI({
        message: textToSend.trim(),
        history: historyTurns,
        role: chatRole,
        model: enableSearchGrounding ? 'gemini-3.5-flash' : chatModel,
        enableSearchGrounding,
        brandName: activeBrand?.name || 'Pixel 12',
        brandVoice: activeBrand?.voice?.tone || 'Profesional y Estratégico',
        brandAudience: activeBrand?.targetAudience || 'PyMEs y Negocios Digitales'
      });

      const modelMsg = {
        id: 'mod_' + Date.now(),
        sender: 'model' as const,
        text: res.reply,
        modelUsed: res.modelUsed,
        sources: res.sources,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setChatMessages((prev) => [...prev, modelMsg]);
    } catch (err: any) {
      showToast(err.message || 'Error al comunicarse con Gemini', 'error');
    } finally {
      setIsChatLoading(false);
    }
  };

  // -------------------------------------------------------------
  // 2. IMAGE STUDIO (gemini-3.1-flash-image-preview)
  // -------------------------------------------------------------
  const [imageMode, setImageMode] = useState<'create' | 'edit'>('create');
  const [imagePrompt, setImagePrompt] = useState('');
  const [imageAspectRatio, setImageAspectRatio] = useState<'1:1' | '16:9' | '9:16' | '4:3' | '3:4'>('1:1');
  const [sourceImageBase64, setSourceImageBase64] = useState<string | null>(null);
  const [sourceImageMime, setSourceImageMime] = useState('image/png');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [generatedImageDetails, setGeneratedImageDetails] = useState<any>(null);

  const handleImageFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSourceImageMime(file.type || 'image/png');
    const reader = new FileReader();
    reader.onload = () => {
      setSourceImageBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleProcessImage = async () => {
    if (!imagePrompt.trim() || isGeneratingImage) return;
    setIsGeneratingImage(true);

    try {
      const res = await imageStudioAI({
        prompt: imagePrompt.trim(),
        base64Image: imageMode === 'edit' && sourceImageBase64 ? sourceImageBase64 : undefined,
        mimeType: sourceImageMime,
        aspectRatio: imageAspectRatio,
        mode: imageMode,
      });

      setGeneratedImageUrl(res.imageUrl);
      setGeneratedImageDetails(res);
      showToast(imageMode === 'create' ? 'Imagen creada exitosamente' : 'Imagen editada exitosamente');
    } catch (err: any) {
      showToast(err.message || 'Error al procesar imagen con Gemini 3.1', 'error');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // -------------------------------------------------------------
  // 3. VEO 3 VIDEO GENERATION (veo-3.1-fast-generate-preview)
  // -------------------------------------------------------------
  const [videoMode, setVideoMode] = useState<'text-to-video' | 'image-to-video'>('text-to-video');
  const [videoPrompt, setVideoPrompt] = useState('');
  const [videoAspectRatio, setVideoAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [videoSourceImage, setVideoSourceImage] = useState<string | null>(null);
  const [videoSourceMime, setVideoSourceMime] = useState('image/png');
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [videoOperationName, setVideoOperationName] = useState<string | null>(null);
  const [videoStatusText, setVideoStatusText] = useState<string>('');
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);

  const handleVideoImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setVideoSourceMime(file.type || 'image/png');
    const reader = new FileReader();
    reader.onload = () => {
      setVideoSourceImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleStartVideoGeneration = async () => {
    if (isGeneratingVideo) return;
    if (videoMode === 'text-to-video' && !videoPrompt.trim()) {
      showToast('Ingresa un prompt de video', 'error');
      return;
    }
    if (videoMode === 'image-to-video' && !videoSourceImage) {
      showToast('Sube una imagen para animar con Veo 3', 'error');
      return;
    }

    setIsGeneratingVideo(true);
    setGeneratedVideoUrl(null);
    setVideoStatusText('Enviando solicitud a Google Veo 3 (veo-3.1-fast-generate-preview)...');

    try {
      const initRes = await videoGenerateAI({
        prompt: videoPrompt.trim() || undefined,
        imageBase64: videoMode === 'image-to-video' && videoSourceImage ? videoSourceImage : undefined,
        imageMimeType: videoSourceMime,
        aspectRatio: videoAspectRatio,
        mode: videoMode,
      });

      setVideoOperationName(initRes.operationName);
      setVideoStatusText('Operación encolada. Renderizando fotogramas dinámicos (esto puede tomar 1-2 minutos)...');

      // Poll every 8 seconds
      let isDone = false;
      let attempts = 0;
      const maxAttempts = 35;

      while (!isDone && attempts < maxAttempts) {
        attempts++;
        await new Promise((r) => setTimeout(r, 8000));
        setVideoStatusText(`Procesando simulación física y cámara cinemática (${attempts * 8}s)...`);

        const statusRes = await videoStatusAI(initRes.operationName);
        if (statusRes.error) {
          throw new Error(statusRes.error.message || 'Error reportado por el motor Veo 3');
        }

        if (statusRes.done) {
          isDone = true;
          setVideoStatusText('¡Render finalizado! Descargando video MP4 de alta calidad...');
          const downloadRes = await videoDownloadAI(initRes.operationName);
          setGeneratedVideoUrl(downloadRes.videoUrl);
          showToast('Video generado exitosamente con Veo 3');
          break;
        }
      }

      if (!isDone) {
        throw new Error('La generación de video tomó más tiempo del esperado. Por favor reintenta.');
      }
    } catch (err: any) {
      showToast(err.message || 'Error durante la generación con Veo 3', 'error');
      setVideoStatusText('');
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  // -------------------------------------------------------------
  // 4. AUDIO TRANSCRIPTION (gemini-3.5-transcribe)
  // -------------------------------------------------------------
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptResult, setTranscriptResult] = useState('');
  const [audioUploadBase64, setAudioUploadBase64] = useState<string | null>(null);
  const [audioUploadMime, setAudioUploadMime] = useState('audio/webm');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<any>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64Audio = reader.result as string;
          await processAudioTranscription(base64Audio, 'audio/webm');
        };
        reader.readAsDataURL(audioBlob);

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      showToast('No se pudo acceder al micrófono: ' + (err.message || ''), 'error');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerIntervalRef.current);
    }
  };

  const handleAudioFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAudioUploadMime(file.type || 'audio/mp3');
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setAudioUploadBase64(base64);
      processAudioTranscription(base64, file.type || 'audio/mp3');
    };
    reader.readAsDataURL(file);
  };

  const processAudioTranscription = async (base64Data: string, mime: string) => {
    setIsTranscribing(true);
    try {
      const res = await transcribeAudioAI({
        audioBase64: base64Data,
        mimeType: mime,
      });
      setTranscriptResult(res.transcript);
      showToast('Audio transcrito con gemini-3.5-transcribe');
    } catch (err: any) {
      showToast(err.message || 'Error al transcribir audio', 'error');
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast('Copiado al portapapeles');
    setTimeout(() => setCopiedId(null), 2000);
  };

  // -------------------------------------------------------------
  // RENDER TABS CONTENT
  // -------------------------------------------------------------
  return (
    <div id="ai-studio-view" className="p-3 sm:p-5 md:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl p-5 sm:p-6 bg-gradient-to-r from-[#141420] via-[#1A1A2E] to-[#12121D] border border-[#2E2E44] shadow-xl">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-gradient-to-br from-indigo-500/20 to-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="p-1 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                <Wand2 className="w-4 h-4" />
              </span>
              <span className="text-[10px] font-black uppercase tracking-wider text-[#D4AF37]">
                Pixel 12 Multimodal Studio
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              Estudio Creativo Multimodal IA
              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold">
                Gemini 3.x & Veo 3
              </span>
            </h2>
            <p className="text-xs text-zinc-400 mt-1 max-w-2xl leading-relaxed">
              Genera y edita imágenes de alta fidelidad, anima fotos a video con Veo 3, chatea con razonamiento multi-turno fundamentado en Google Search y transcribe notas de voz en segundos.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="px-2.5 py-1 rounded-xl bg-[#0F0F17] text-zinc-300 border border-[#2A2A3E] font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Modelos Oficiales Activos
            </span>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap items-center gap-1.5 mt-5 pt-4 border-t border-[#242436]">
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'chat'
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-600/30'
                : 'bg-[#181826] text-zinc-300 hover:bg-[#202032] border border-[#2A2A3E]'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Chat Multiturno & Search</span>
          </button>

          <button
            onClick={() => setActiveTab('image')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'image'
                ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-md shadow-purple-600/30'
                : 'bg-[#181826] text-zinc-300 hover:bg-[#202032] border border-[#2A2A3E]'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Crear & Editar Imágenes</span>
            <span className="text-[9px] px-1 rounded bg-purple-900/60 text-purple-200">3.1</span>
          </button>

          <button
            onClick={() => setActiveTab('video')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'video'
                ? 'bg-gradient-to-r from-rose-600 to-rose-500 text-white shadow-md shadow-rose-600/30'
                : 'bg-[#181826] text-zinc-300 hover:bg-[#202032] border border-[#2A2A3E]'
            }`}
          >
            <VideoIcon className="w-3.5 h-3.5" />
            <span>Video Veo 3</span>
            <span className="text-[9px] px-1 rounded bg-rose-900/60 text-rose-200">Veo 3.1</span>
          </button>

          <button
            onClick={() => setActiveTab('transcribe')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'transcribe'
                ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-md shadow-emerald-600/30'
                : 'bg-[#181826] text-zinc-300 hover:bg-[#202032] border border-[#2A2A3E]'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Transcripción de Audio</span>
            <span className="text-[9px] px-1 rounded bg-emerald-900/60 text-emerald-200">3.5</span>
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* TAB 1: CHAT MULTITURNO CON ROLES Y GOOGLE SEARCH GROUNDING   */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'chat' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
          {/* Controls Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {/* Model Selector */}
            <div className="p-4 rounded-2xl bg-[#141420] border border-[#242436] space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                <Sliders className="w-4 h-4 text-indigo-400" />
                <span>Modelo Gemini</span>
              </div>
              <div className="space-y-1.5 text-xs">
                {[
                  {
                    id: 'gemini-3.5-flash',
                    title: 'Gemini 3.5 Flash',
                    badge: 'General & Veloz',
                    desc: 'Recomendado para la mayoría de tareas',
                  },
                  {
                    id: 'gemini-3.1-pro-preview',
                    title: 'Gemini 3.1 Pro Preview',
                    badge: 'Razonamiento Complejo',
                    desc: 'Estrategias densas y análisis profundo',
                  },
                  {
                    id: 'gemini-3.1-flash-lite',
                    title: 'Gemini 3.1 Flash Lite',
                    badge: 'Ultra Rápido',
                    desc: 'Respuestas inmediatas sin latencia',
                  },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setChatModel(m.id as any)}
                    className={`w-full text-left p-2.5 rounded-xl border transition-all cursor-pointer ${
                      chatModel === m.id
                        ? 'bg-indigo-950/40 border-indigo-500/60 text-white shadow-xs'
                        : 'bg-[#181826] border-[#2A2A3E] text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-white">{m.title}</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-semibold">
                        {m.badge}
                      </span>
                    </div>
                    <p className="text-[10px] text-zinc-400 mt-0.5 line-clamp-1">{m.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Role & Persona Selector */}
            <div className="p-4 rounded-2xl bg-[#141420] border border-[#242436] space-y-3">
              <span className="text-xs font-bold text-white block">Rol del Asistente</span>
              <div className="grid grid-cols-1 gap-1.5 text-xs">
                {[
                  { id: 'strategist', label: 'Estratega de Marca', emoji: '🎯' },
                  { id: 'art_director', label: 'Director de Arte', emoji: '🎨' },
                  { id: 'growth', label: 'Growth & Tendencias', emoji: '🚀' },
                  { id: 'copywriter', label: 'Copywriter Senior', emoji: '✍️' },
                ].map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setChatRole(r.id as any)}
                    className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-colors cursor-pointer ${
                      chatRole === r.id
                        ? 'bg-[#1E1E30] border-[#D4AF37] text-white font-bold'
                        : 'bg-[#181826] border-[#2A2A3E] text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <span>{r.emoji}</span>
                    <span>{r.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Search Grounding Switch */}
            <div className="p-4 rounded-2xl bg-[#141420] border border-[#242436] space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white">Google Search Grounding</span>
                </div>
                <button
                  type="button"
                  onClick={() => setEnableSearchGrounding(!enableSearchGrounding)}
                  className={`w-10 h-5 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                    enableSearchGrounding ? 'bg-emerald-600' : 'bg-zinc-700'
                  }`}
                >
                  <div
                    className={`bg-white w-3.5 h-3.5 rounded-full shadow-md transform transition-transform ${
                      enableSearchGrounding ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Usa <span className="text-emerald-300 font-semibold">gemini-3.5-flash</span> con la herramienta <span className="font-mono text-[10px] text-zinc-300">googleSearch</span> para contrastar información en tiempo real con la web.
              </p>
            </div>
          </div>

          {/* Chat Window */}
          <div className="lg:col-span-3 flex flex-col h-[650px] bg-[#141420] rounded-2xl border border-[#242436] overflow-hidden shadow-xl">
            {/* Top Bar */}
            <div className="px-4 py-3 bg-[#181828] border-b border-[#242436] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span className="font-bold text-white">Hilo Multiturno Activo</span>
                <span className="text-zinc-400 text-[11px]">· {enableSearchGrounding ? 'gemini-3.5-flash + Google Search' : chatModel}</span>
              </div>
              <button
                onClick={() => {
                  setChatMessages([
                    {
                      id: 'reset_' + Date.now(),
                      sender: 'model',
                      text: `Conversación reiniciada para ${activeBrand?.name || 'Pixel 12'}. ¿Qué tema deseas explorar?`,
                      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    }
                  ]);
                }}
                className="text-[11px] text-zinc-400 hover:text-white flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Limpiar hilo</span>
              </button>
            </div>

            {/* Messages Thread */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatMessages.map((m) => (
                <div
                  key={m.id}
                  className={`flex gap-3 max-w-3xl ${
                    m.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 text-xs font-black shadow-md ${
                      m.sender === 'user'
                        ? 'bg-gradient-to-tr from-indigo-600 to-indigo-400 text-white'
                        : 'bg-gradient-to-tr from-[#D4AF37] to-[#E5C158] text-black'
                    }`}
                  >
                    {m.sender === 'user' ? 'Tú' : 'AI'}
                  </div>

                  <div
                    className={`rounded-2xl p-4 text-xs space-y-2 border ${
                      m.sender === 'user'
                        ? 'bg-indigo-600/20 text-indigo-100 border-indigo-500/40 rounded-tr-none'
                        : 'bg-[#181826] text-zinc-100 border-[#2A2A3E] rounded-tl-none shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3 text-[10px] text-zinc-400 pb-1 border-b border-white/5">
                      <span className="font-semibold text-zinc-300">
                        {m.sender === 'user' ? 'Tú' : 'Pixel 12 Copilot'}
                      </span>
                      <div className="flex items-center gap-2">
                        {m.modelUsed && (
                          <span className="px-1.5 py-0.2 rounded bg-[#242436] text-[9px] font-mono text-zinc-300">
                            {m.modelUsed}
                          </span>
                        )}
                        <span>{m.timestamp}</span>
                      </div>
                    </div>

                    <div className="whitespace-pre-wrap leading-relaxed font-sans text-[12px]">
                      {m.text}
                    </div>

                    {/* Google Search Grounding Sources */}
                    {m.sources && m.sources.length > 0 && (
                      <div className="pt-2 border-t border-white/10 space-y-1.5">
                        <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                          <Globe className="w-3 h-3" />
                          Fuentes verificadas en Google:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {m.sources.map((s, idx) => (
                            <a
                              key={idx}
                              href={s.uri}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2 py-1 rounded bg-[#222234] hover:bg-[#2A2A40] text-[10px] text-zinc-300 hover:text-white border border-[#34344E] flex items-center gap-1 transition-colors"
                            >
                              <span className="truncate max-w-[180px]">{s.title}</span>
                              <ExternalLink className="w-2.5 h-2.5 text-zinc-400 shrink-0" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {m.sender === 'model' && (
                      <div className="flex items-center justify-end gap-2 pt-1 border-t border-white/5">
                        <button
                          onClick={() => handleCopyText(m.text, m.id)}
                          className="text-[10px] text-zinc-400 hover:text-white flex items-center gap-1 cursor-pointer"
                        >
                          {copiedId === m.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400">Copiado</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copiar</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isChatLoading && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-[#181826] border border-[#2A2A3E] text-xs text-zinc-400 animate-pulse w-fit">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                  <span>Generando respuesta con {enableSearchGrounding ? 'gemini-3.5-flash + Google Search' : chatModel}...</span>
                </div>
              )}
              <div ref={chatScrollRef} />
            </div>

            {/* Input Box */}
            <div className="p-3 bg-[#181828] border-t border-[#242436] space-y-2">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendChat();
                }}
                className="flex items-center gap-2"
              >
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder={
                      enableSearchGrounding
                        ? 'Pregunta con datos actualizados en Google Search...'
                        : 'Escribe tu solicitud creativa o estratégica...'
                    }
                    className="w-full text-xs p-3 pr-10 rounded-xl bg-[#12121C] border border-[#2A2A3E] text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (isRecording) {
                        stopRecording();
                      } else {
                        startRecording();
                      }
                    }}
                    title={isRecording ? 'Detener grabación de voz' : 'Grabar audio para transcribir al chat'}
                    className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-colors cursor-pointer ${
                      isRecording ? 'bg-rose-500 text-white animate-pulse' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={!chatInput.trim() || isChatLoading}
                  className="px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Enviar</span>
                </button>
              </form>

              {isRecording && (
                <div className="flex items-center justify-between text-[11px] text-rose-400 bg-rose-950/30 px-3 py-1.5 rounded-lg border border-rose-800/40">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                    Grabando micrófono ({recordingSeconds}s)... Habla y luego pulsa detener para transcribir con gemini-3.5-transcribe.
                  </span>
                  <button
                    type="button"
                    onClick={stopRecording}
                    className="font-bold underline text-white hover:text-rose-200 cursor-pointer"
                  >
                    Detener
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 2: CREAR Y EDITAR IMÁGENES CON gemini-3.1-flash-image-preview */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'image' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-4">
            <div className="p-5 rounded-2xl bg-[#141420] border border-[#242436] space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Wand2 className="w-4 h-4 text-purple-400" />
                  Generador y Editor Visual
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
                  gemini-3.1-flash-image-preview
                </span>
              </div>

              {/* Mode Toggle */}
              <div className="grid grid-cols-2 gap-2 bg-[#181826] p-1 rounded-xl border border-[#2A2A3E]">
                <button
                  type="button"
                  onClick={() => setImageMode('create')}
                  className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    imageMode === 'create'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Crear desde Texto
                </button>
                <button
                  type="button"
                  onClick={() => setImageMode('edit')}
                  className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    imageMode === 'edit'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Editar Imagen Existente
                </button>
              </div>

              {/* Source image upload if editing */}
              {imageMode === 'edit' && (
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-zinc-300 block">
                    1. Imagen base a editar
                  </label>
                  <div className="border border-dashed border-[#34344E] hover:border-purple-400 p-4 rounded-xl text-center bg-[#12121C] transition-colors relative cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileSelect}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    {sourceImageBase64 ? (
                      <div className="flex items-center gap-3">
                        <img
                          src={sourceImageBase64}
                          alt="Base"
                          className="w-16 h-16 rounded-lg object-cover border border-[#2A2A3E]"
                        />
                        <div className="text-left text-xs">
                          <p className="font-bold text-white">Imagen cargada</p>
                          <span className="text-[10px] text-purple-400 underline">Haz clic para cambiar</span>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <Upload className="w-5 h-5 mx-auto text-purple-400" />
                        <p className="text-xs font-bold text-zinc-300">Arrastra o sube una imagen</p>
                        <span className="text-[10px] text-zinc-500">PNG, JPG, WEBP hasta 10MB</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Prompt Input */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-zinc-300 block">
                  {imageMode === 'create' ? 'Prompt descriptivo para generar' : 'Instrucción de edición'}
                </label>
                <textarea
                  rows={4}
                  value={imagePrompt}
                  onChange={(e) => setImagePrompt(e.target.value)}
                  placeholder={
                    imageMode === 'create'
                      ? 'Ej: Fotografía editorial prémium de oficina ejecutiva minimalista, fondo negro obsidiana, destellos dorados sutiles, iluminación dramática...'
                      : 'Ej: Agrega partículas doradas flotantes alrededor y cambia el tono de la iluminación a luz cálida de estudio...'
                  }
                  className="w-full text-xs p-3 rounded-xl bg-[#12121C] border border-[#2A2A3E] text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Aspect Ratio Selector */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-zinc-300 block">Relación de Aspecto (Aspect Ratio)</label>
                <div className="grid grid-cols-5 gap-1.5 text-xs">
                  {(['1:1', '16:9', '9:16', '4:3', '3:4'] as const).map((ar) => (
                    <button
                      key={ar}
                      type="button"
                      onClick={() => setImageAspectRatio(ar)}
                      className={`py-1.5 rounded-lg border text-center font-bold text-[11px] transition-all cursor-pointer ${
                        imageAspectRatio === ar
                          ? 'bg-purple-600 text-white border-purple-500 shadow-xs'
                          : 'bg-[#181826] text-zinc-400 border-[#2A2A3E] hover:text-white'
                      }`}
                    >
                      {ar}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={handleProcessImage}
                disabled={!imagePrompt.trim() || isGeneratingImage}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md shadow-purple-600/25 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isGeneratingImage ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Procesando con gemini-3.1-flash-image-preview...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>{imageMode === 'create' ? 'Generar Imagen' : 'Aplicar Edición'}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Image Preview & Output */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center min-h-[480px] p-6 rounded-2xl bg-[#141420] border border-[#242436]">
            {isGeneratingImage ? (
              <div className="text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center mx-auto animate-pulse">
                  <Sparkles className="w-8 h-8 animate-spin" />
                </div>
                <p className="text-sm font-bold text-white">Generando imagen de alta fidelidad...</p>
                <p className="text-xs text-zinc-400 max-w-sm">
                  Procesando con el modelo de imagen multimodal oficial gemini-3.1-flash-image-preview.
                </p>
              </div>
            ) : generatedImageUrl ? (
              <div className="space-y-4 w-full flex flex-col items-center">
                <div className="relative group max-w-lg overflow-hidden rounded-2xl border border-[#2E2E44] shadow-2xl bg-black">
                  <img
                    src={generatedImageUrl}
                    alt="Generada"
                    className="w-full h-auto max-h-[440px] object-contain"
                  />
                  <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <a
                      href={generatedImageUrl}
                      download={`pixel12_${Date.now()}.png`}
                      className="p-2 rounded-lg bg-black/70 hover:bg-black text-white text-xs backdrop-blur-xs flex items-center gap-1"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Descargar PNG</span>
                    </a>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
                  <a
                    href={generatedImageUrl}
                    download={`pixel12_image_${Date.now()}.png`}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Descargar Imagen</span>
                  </a>
                  <button
                    onClick={() => {
                      addPost({
                        id: 'post_img_' + Date.now(),
                        brandId: activeBrand.id,
                        campaignId: '',
                        title: imagePrompt.slice(0, 50),
                        internalTitle: imagePrompt.slice(0, 50),
                        content: imagePrompt,
                        caption: imagePrompt,
                        hook: imagePrompt.slice(0, 40),
                        cta: 'Comenta para más información',
                        status: 'DRAFT',
                        scheduledDate: '2026-10-15',
                        scheduledTime: '10:00',
                        platforms: ['instagram', 'linkedin'],
                        imageUrl: generatedImageUrl,
                        tags: ['Diseño AI', 'Imagen'],
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                      });
                      showToast('Borrador de post creado con la imagen generada');
                    }}
                    className="px-4 py-2 rounded-xl bg-[#1E1E30] hover:bg-[#282840] text-zinc-200 border border-[#2E2E44] font-semibold transition-colors flex items-center gap-1.5"
                  >
                    <Layers className="w-3.5 h-3.5 text-purple-400" />
                    <span>Convertir en Publicación</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-2 text-zinc-500">
                <ImageIcon className="w-12 h-12 mx-auto stroke-1" />
                <p className="text-xs font-bold text-zinc-400">Ninguna imagen generada aún</p>
                <span className="text-[11px] block">Ingresa un prompt o sube una imagen para ver el resultado aquí</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 3: VIDEO GENERATION CON VEO 3 (veo-3.1-fast-generate-preview) */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'video' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-4">
            <div className="p-5 rounded-2xl bg-[#141420] border border-[#242436] space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <VideoIcon className="w-4 h-4 text-rose-400" />
                  Generador de Video Veo 3
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">
                  veo-3.1-fast-generate-preview
                </span>
              </div>

              {/* Video Mode */}
              <div className="grid grid-cols-2 gap-2 bg-[#181826] p-1 rounded-xl border border-[#2A2A3E]">
                <button
                  type="button"
                  onClick={() => setVideoMode('text-to-video')}
                  className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    videoMode === 'text-to-video'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Texto a Video
                </button>
                <button
                  type="button"
                  onClick={() => setVideoMode('image-to-video')}
                  className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    videoMode === 'image-to-video'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Animar Imagen a Video
                </button>
              </div>

              {/* Photo uploader if image to video */}
              {videoMode === 'image-to-video' && (
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-zinc-300 block">
                    1. Foto o arte a animar con Veo
                  </label>
                  <div className="border border-dashed border-[#34344E] hover:border-rose-400 p-4 rounded-xl text-center bg-[#12121C] transition-colors relative cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleVideoImageSelect}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    {videoSourceImage ? (
                      <div className="flex items-center gap-3">
                        <img
                          src={videoSourceImage}
                          alt="Video Source"
                          className="w-16 h-16 rounded-lg object-cover border border-[#2A2A3E]"
                        />
                        <div className="text-left text-xs">
                          <p className="font-bold text-white">Foto lista para animar</p>
                          <span className="text-[10px] text-rose-400 underline">Cambiar archivo</span>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <Upload className="w-5 h-5 mx-auto text-rose-400" />
                        <p className="text-xs font-bold text-zinc-300">Sube la foto para animar</p>
                        <span className="text-[10px] text-zinc-500">Formato cuadrado, paisaje o story</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Video Prompt */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-zinc-300 block">
                  {videoMode === 'text-to-video' ? 'Prompt cinemático' : 'Dirección de movimiento (Opcional)'}
                </label>
                <textarea
                  rows={3}
                  value={videoPrompt}
                  onChange={(e) => setVideoPrompt(e.target.value)}
                  placeholder={
                    videoMode === 'text-to-video'
                      ? 'Ej: Vista aérea cinemática de una ciudad futurista al amanecer, rascacielos iluminados con destellos dorados, movimiento de cámara suave y fluido...'
                      : 'Ej: Zoom lento hacia adelante con movimiento de partículas doradas e iluminación cinematográfica envolvente...'
                  }
                  className="w-full text-xs p-3 rounded-xl bg-[#12121C] border border-[#2A2A3E] text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500"
                />
              </div>

              {/* Aspect Ratio (MUST be 16:9 or 9:16) */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-zinc-300 block">
                  Aspect Ratio Requerido (Veo 3)
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setVideoAspectRatio('16:9')}
                    className={`py-2 px-3 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer ${
                      videoAspectRatio === '16:9'
                        ? 'bg-rose-600 text-white border-rose-500 shadow-xs'
                        : 'bg-[#181826] text-zinc-400 border-[#2A2A3E] hover:text-white'
                    }`}
                  >
                    16:9 (Horizontal / Paisaje)
                  </button>
                  <button
                    type="button"
                    onClick={() => setVideoAspectRatio('9:16')}
                    className={`py-2 px-3 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer ${
                      videoAspectRatio === '9:16'
                        ? 'bg-rose-600 text-white border-rose-500 shadow-xs'
                        : 'bg-[#181826] text-zinc-400 border-[#2A2A3E] hover:text-white'
                    }`}
                  >
                    9:16 (Vertical / Reels / TikTok)
                  </button>
                </div>
              </div>

              {/* Generate Button */}
              <button
                type="button"
                onClick={handleStartVideoGeneration}
                disabled={isGeneratingVideo}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md shadow-rose-600/25 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isGeneratingVideo ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Renderizando con Veo 3...</span>
                  </>
                ) : (
                  <>
                    <VideoIcon className="w-4 h-4" />
                    <span>{videoMode === 'text-to-video' ? 'Generar Video' : 'Animar Foto'}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Video Player Output */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center min-h-[480px] p-6 rounded-2xl bg-[#141420] border border-[#242436]">
            {isGeneratingVideo ? (
              <div className="text-center space-y-4 max-w-md">
                <div className="w-16 h-16 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto animate-pulse">
                  <VideoIcon className="w-8 h-8 animate-bounce" />
                </div>
                <div className="space-y-1.5">
                  <p className="text-sm font-bold text-white">Generando Video con Veo 3</p>
                  <p className="text-xs text-rose-300 font-medium">{videoStatusText}</p>
                </div>
                <div className="w-full bg-[#181826] rounded-full h-2 overflow-hidden border border-[#2A2A3E]">
                  <div className="h-full bg-gradient-to-r from-rose-500 to-purple-500 rounded-full animate-[pulse_1.5s_infinite] w-3/4" />
                </div>
                <span className="text-[10px] text-zinc-500 block">
                  La síntesis de video neuronal opera en resolución 720p optimizada con el modelo veo-3.1-fast-generate-preview.
                </span>
              </div>
            ) : generatedVideoUrl ? (
              <div className="space-y-4 w-full flex flex-col items-center">
                <div className="max-w-lg w-full rounded-2xl overflow-hidden border border-[#2E2E44] bg-black shadow-2xl">
                  <video
                    src={generatedVideoUrl}
                    controls
                    autoPlay
                    loop
                    className="w-full h-auto max-h-[440px] mx-auto object-contain"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={generatedVideoUrl}
                    download={`veo3_video_${Date.now()}.mp4`}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Descargar Video MP4</span>
                  </a>
                  <button
                    onClick={() => {
                      addPost({
                        id: 'post_vid_' + Date.now(),
                        brandId: activeBrand.id,
                        campaignId: '',
                        title: videoPrompt.slice(0, 50) || 'Video cinemático Veo 3',
                        internalTitle: videoPrompt.slice(0, 50) || 'Video cinemático Veo 3',
                        content: videoPrompt,
                        caption: videoPrompt,
                        hook: 'Mira este video generado con Veo 3',
                        cta: 'Comenta tu opinión',
                        status: 'DRAFT',
                        scheduledDate: '2026-10-18',
                        scheduledTime: '15:00',
                        platforms: ['instagram', 'tiktok'],
                        imageUrl: '',
                        videoUrl: generatedVideoUrl,
                        tags: ['Veo 3', 'Video IA'],
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                      });
                      showToast('Borrador de video añadido a tus publicaciones');
                    }}
                    className="px-4 py-2 rounded-xl bg-[#1E1E30] hover:bg-[#282840] text-zinc-200 border border-[#2E2E44] text-xs font-semibold transition-colors flex items-center gap-1.5"
                  >
                    <Layers className="w-3.5 h-3.5 text-rose-400" />
                    <span>Programar como Reel</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-2 text-zinc-500">
                <VideoIcon className="w-12 h-12 mx-auto stroke-1" />
                <p className="text-xs font-bold text-zinc-400">Sin video en cola</p>
                <span className="text-[11px] block">Configura el prompt o sube una foto para sintetizar video con Veo 3</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 4: TRANSCRIPCIÓN DE AUDIO (gemini-3.5-transcribe)         */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'transcribe' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-4">
            <div className="p-5 rounded-2xl bg-[#141420] border border-[#242436] space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Mic className="w-4 h-4 text-emerald-400" />
                  Grabación & Transcripción de Audio
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                  gemini-3.5-transcribe
                </span>
              </div>

              {/* Mic Live Recorder Card */}
              <div className="p-4 rounded-xl bg-[#181826] border border-[#2A2A3E] text-center space-y-3">
                <div
                  className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center transition-all ${
                    isRecording
                      ? 'bg-rose-500 text-white animate-pulse shadow-lg shadow-rose-500/40'
                      : 'bg-[#222234] text-emerald-400 border border-[#34344E]'
                  }`}
                >
                  <Mic className="w-7 h-7" />
                </div>

                <div>
                  <h4 className="text-xs font-bold text-white">
                    {isRecording ? `Grabando audio (${recordingSeconds}s)...` : 'Grabador de Micrófono en Vivo'}
                  </h4>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    {isRecording
                      ? 'Habla con naturalidad. Al detener, se procesará automáticamente.'
                      : 'Presiona para grabar notas de voz o dictar ideas para redes.'}
                  </p>
                </div>

                <div className="flex justify-center">
                  {isRecording ? (
                    <button
                      type="button"
                      onClick={stopRecording}
                      className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md"
                    >
                      <MicOff className="w-3.5 h-3.5" />
                      <span>Detener y Transcribir</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={startRecording}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md"
                    >
                      <Mic className="w-3.5 h-3.5" />
                      <span>Iniciar Grabación</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Or File Upload */}
              <div className="space-y-2 pt-2 border-t border-[#242436]">
                <label className="text-[11px] font-bold text-zinc-300 block">
                  O subir archivo de audio (MP3, WAV, WEBM, M4A)
                </label>
                <div className="border border-dashed border-[#34344E] hover:border-emerald-400 p-4 rounded-xl text-center bg-[#12121C] relative cursor-pointer">
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={handleAudioFileSelect}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <FileAudio className="w-6 h-6 mx-auto text-emerald-400 mb-1" />
                  <p className="text-xs font-bold text-zinc-300">Seleccionar archivo de audio</p>
                  <span className="text-[10px] text-zinc-500">Subir grabaciones de reuniones, briefs o podcasts</span>
                </div>
              </div>
            </div>
          </div>

          {/* Transcript Output Box */}
          <div className="lg:col-span-7 flex flex-col p-5 rounded-2xl bg-[#141420] border border-[#242436] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#242436]">
              <div className="flex items-center gap-2">
                <FileAudio className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-bold text-white">Transcripción Generada</h3>
              </div>
              {transcriptResult && (
                <button
                  onClick={() => handleCopyText(transcriptResult, 'transcript_main')}
                  className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  {copiedId === 'transcript_main' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-bold">Copiado</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar texto</span>
                    </>
                  )}
                </button>
              )}
            </div>

            <div className="flex-1 min-h-[300px] rounded-xl bg-[#12121C] p-4 border border-[#2A2A3E] overflow-y-auto">
              {isTranscribing ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-2 text-zinc-400">
                  <RefreshCw className="w-6 h-6 animate-spin text-emerald-400" />
                  <p className="text-xs font-bold text-white">Transcribiendo audio...</p>
                  <span className="text-[11px] text-zinc-500">
                    Analizando fonética y vocabulario técnico con gemini-3.5-transcribe
                  </span>
                </div>
              ) : transcriptResult ? (
                <div className="space-y-3 text-xs leading-relaxed text-zinc-200 whitespace-pre-wrap font-sans">
                  {transcriptResult}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-1.5 text-zinc-500">
                  <Mic className="w-8 h-8 stroke-1" />
                  <p className="text-xs font-semibold">Esperando grabación o archivo de audio</p>
                  <span className="text-[10px]">Graba con el micrófono o sube un archivo para ver la transcripción aquí</span>
                </div>
              )}
            </div>

            {transcriptResult && (
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('chat');
                    setChatInput(transcriptResult);
                    showToast('Transcripción cargada en el Chat IA');
                  }}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Enviar al Chat IA como prompt</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    addPost({
                      id: 'post_trans_' + Date.now(),
                      brandId: activeBrand.id,
                      campaignId: '',
                      title: 'Publicación desde nota de voz',
                      internalTitle: 'Transcripción: ' + transcriptResult.slice(0, 30),
                      content: transcriptResult,
                      caption: transcriptResult,
                      hook: transcriptResult.slice(0, 40),
                      cta: '¿Qué opinas sobre este punto?',
                      status: 'DRAFT',
                      scheduledDate: '2026-10-12',
                      scheduledTime: '11:00',
                      platforms: ['linkedin', 'instagram'],
                      tags: ['Voz', 'Transcripción'],
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString(),
                    });
                    showToast('Publicación creada a partir de la transcripción');
                  }}
                  className="px-3.5 py-2 rounded-xl bg-[#1E1E30] hover:bg-[#282840] text-zinc-200 border border-[#2E2E44] text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Layers className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Convertir en Borrador de Post</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
