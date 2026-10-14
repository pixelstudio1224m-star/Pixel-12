import React, { useState, useRef, useEffect } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import { chatWithCopilotAI } from '../lib/api';
import { Post, ContentFormat } from '../types';
import {
  Sparkles,
  Send,
  User,
  Copy,
  PlusCircle,
  Lightbulb,
  Building2,
  Check,
  RefreshCw,
  FileText,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';
import { ScheduleContentModal } from '../components/calendar/ScheduleContentModal';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

const suggestedPrompts = [
  'Créame un carrusel para una clínica dental sobre 5 errores que dañan tus dientes, tono amigable, 6 slides, CTA para agendar cita y estilo premium.',
  'Crea 5 ganchos demoledores de 3 segundos para un Reel vendiendo Asistencia Virtual para PyMEs saturadas.',
  'Escribe un carrusel de 5 diapositivas con tono de autoridad sobre por qué delegar operaciones duplica la rentabilidad.',
  'Redacta un post para LinkedIn dirigido a CEOs sobre cómo implementar sistemas de captación predecibles.',
];

export const CopilotView: React.FC = () => {
  const { activeBrand, addPost, showToast, setActiveView } = useWorkspace();
  const brandName = activeBrand?.name || 'Pixel 12 Media';
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init_msg',
      sender: 'assistant',
      text: `¡Hola! Soy el Copiloto Creativo y Estratégico de **Pixel 12 OS** para **${brandName}**.\n\nPuedo interpretar solicitudes en lenguaje natural y transformarlas en:\n• Carruseles con estructura y diapositivas completas\n• Posts para redes sociales con ganchos y CTAs medidos\n• Guiones dinámicos para Reels y Shorts\n• Artículos de blog optimizados para SEO\n• Campañas y propuestas comerciales\n\n¿Qué contenido o campaña deseas planificar hoy?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modal for scheduling
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduleModalData, setScheduleModalData] = useState<any>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: 'usr_' + Date.now(),
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const history = messages
        .filter((m) => m.id !== 'init_msg' && !m.id.startsWith('init_'))
        .map((m) => ({
          role: m.sender === 'user' ? 'user' : 'model',
          content: m.text,
        }));

      const res = await chatWithCopilotAI({
        message: userMsg.text,
        brandName: activeBrand?.name || 'Pixel 12 Media',
        brandVoice: activeBrand?.voice?.tone || 'Profesional y Estratégico',
        brandAudience: activeBrand?.targetAudience || 'Clientes y Audiencia General',
        history,
      });

      const aiMsg: ChatMessage = {
        id: 'ai_' + Date.now(),
        sender: 'assistant',
        text: res.response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsLoading(false);
    } catch (err: any) {
      setIsLoading(false);
      showToast(err.message || 'Error comunicándose con el copiloto', 'error');
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    showToast('Copiado al portapapeles');
  };

  const handleOpenSchedule = (text: string) => {
    const lines = text.split('\n').filter((l) => l.trim().length > 0);
    const titleCandidate = lines[0]?.replace(/[#*]/g, '').slice(0, 70) || 'Publicación desde Copiloto';
    const hookCandidate = lines.find((l) => l.toLowerCase().includes('gancho') || l.toLowerCase().includes('hook')) || lines[0] || '';
    const isCarousel = text.toLowerCase().includes('carrusel') || text.toLowerCase().includes('slide');
    const isReel = text.toLowerCase().includes('reel') || text.toLowerCase().includes('short') || text.toLowerCase().includes('guion');

    setScheduleModalData({
      internalTitle: titleCandidate,
      caption: text,
      hook: hookCandidate.replace(/^.*?:/i, '').replace(/["']/g, '').trim(),
      cta: activeBrand?.voice?.preferredCTAs?.[0] || 'Comenta para más información',
      hashtags: ['#Pixel12', '#Marketing', '#Estrategia'],
      format: isCarousel ? 'Carousel' : isReel ? 'Reel' : 'Static Post',
      pillar: 'Educativo',
      brandId: activeBrand?.id || 'brand_p12',
      status: 'SCHEDULED',
    });
    setIsScheduleModalOpen(true);
  };

  const handleSendToDesignStudio = (text: string) => {
    const lines = text.split('\n').filter((l) => l.trim().length > 0);
    const titleCandidate = lines[0]?.replace(/[#*]/g, '').slice(0, 80) || 'Estrategia de Contenido';
    // Navigate to design-content with topic
    setActiveView('design-content');
    showToast(`Abriendo Estudio de Diseño para: "${titleCandidate.slice(0, 35)}..."`, 'info');
  };

  return (
    <div id="copilot-view" className="h-full min-h-[450px] flex flex-col max-w-5xl mx-auto p-3 sm:p-5 select-none space-y-4">
      {/* Top Brand Context Bar - Obsidian + Gold + Silver */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-[#0D0D14] border border-[#222234] flex items-center justify-between shrink-0 shadow-xl">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl p12-gold-gradient text-black flex items-center justify-center font-black shadow-md shadow-[#D4AF37]/20 shrink-0">
            <Sparkles className="w-4 h-4 text-black" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-extrabold text-white font-display truncate">
                Copiloto de IA: {activeBrand?.name || 'Pixel 12 Media'}
              </span>
              <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-[#D4AF37]/15 text-[#E5C158] border border-[#D4AF37]/30 font-bold shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse" />
                PIXEL 12 · GEMINI 3.1
              </span>
            </div>
            <p className="text-xs text-zinc-400 truncate max-w-md mt-0.5">
              Tono: <span className="text-zinc-200 font-medium">{activeBrand?.voice?.tone || 'Estratégico'}</span> · Audiencia:{' '}
              <span className="text-zinc-200 font-medium">{activeBrand?.targetAudience || 'General'}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveView('ai-studio')}
            className="px-3 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/40 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-300" />
            <span className="hidden sm:inline">Estudio Multimodal IA</span>
          </button>
          <button
            onClick={() => {
              setMessages([
                {
                  id: 'init_' + Date.now(),
                  sender: 'assistant',
                  text: `Historial reiniciado. Estoy listo para ayudarte con contenido fresco y estratégico para **${activeBrand?.name || 'Pixel 12 Media'}**.`,
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                },
              ]);
              showToast('Conversación reiniciada');
            }}
            className="px-3 py-1.5 text-zinc-400 hover:text-white hover:bg-[#1A1A28] rounded-xl border border-[#28283C] transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
            title="Reiniciar chat"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span className="hidden sm:inline">Limpiar</span>
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'assistant' && (
              <div className="w-8 h-8 rounded-xl p12-gold-gradient flex items-center justify-center text-black shrink-0 shadow-md shadow-[#D4AF37]/20 mt-1">
                <Sparkles className="w-4 h-4 text-black" />
              </div>
            )}

            <div
              className={`max-w-2xl rounded-2xl p-4 text-xs leading-relaxed space-y-3 shadow-lg ${
                msg.sender === 'user'
                  ? 'bg-[#181826] text-white border border-[#2D2D42] rounded-br-xs'
                  : 'bg-[#11111A] border border-[#222234] text-zinc-200 rounded-bl-xs'
              }`}
            >
              <div className="whitespace-pre-line font-sans leading-relaxed text-zinc-100">{msg.text}</div>

              <div className="flex items-center justify-between pt-3 border-t border-[#1C1C2A] text-[10px] text-zinc-500">
                <span className="font-mono">{msg.timestamp}</span>

                {msg.sender === 'assistant' && (
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => copyToClipboard(msg.text, msg.id)}
                      className="hover:text-white text-zinc-400 flex items-center gap-1 font-medium transition-colors cursor-pointer"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400 font-bold">Copiado</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copiar</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleOpenSchedule(msg.text)}
                      className="text-[#E5C158] hover:text-white hover:bg-[#D4AF37]/20 px-2 py-1 rounded-lg border border-[#D4AF37]/30 flex items-center gap-1.5 font-bold transition-all cursor-pointer"
                    >
                      <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>Programar en Calendario</span>
                    </button>

                    <button
                      onClick={() => handleSendToDesignStudio(msg.text)}
                      className="text-zinc-300 hover:text-white hover:bg-[#202032] px-2 py-1 rounded-lg border border-[#2A2A3E] flex items-center gap-1.5 font-semibold transition-all cursor-pointer"
                    >
                      <Layers className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Estudio de Diseño</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {msg.sender === 'user' && (
              <div className="w-8 h-8 rounded-xl bg-[#202030] border border-[#2E2E44] flex items-center justify-center text-[#D4AF37] shrink-0 mt-1">
                <User className="w-4 h-4 text-[#D4AF37]" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 items-center text-xs text-zinc-400 p-3 bg-[#101018] rounded-2xl border border-[#202030] w-fit">
            <div className="w-6 h-6 rounded-lg p12-gold-gradient flex items-center justify-center text-black animate-spin">
              <Sparkles className="w-3.5 h-3.5 text-black" />
            </div>
            <span className="font-semibold text-zinc-300">
              El Copiloto está estructurando la respuesta estratégica...
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts if few messages */}
      {messages.length <= 2 && (
        <div className="py-2 shrink-0">
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
            <Lightbulb className="w-3.5 h-3.5 text-[#D4AF37]" />
            Prompts de ejemplo en lenguaje natural:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {suggestedPrompts.map((sug, i) => (
              <button
                key={i}
                onClick={() => handleSend(sug)}
                className="text-left p-2.5 rounded-xl bg-[#11111A] hover:bg-[#181826] border border-[#202032] hover:border-[#D4AF37]/50 text-xs text-zinc-300 hover:text-white transition-all line-clamp-1 cursor-pointer"
              >
                "{sug}"
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Box */}
      <div className="pt-2 border-t border-[#202030] shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2 bg-[#12121C] rounded-2xl border border-[#2A2A3E] p-1.5 shadow-xl focus-within:border-[#D4AF37] transition-all"
        >
          <input
            type="text"
            placeholder="Pide carruseles, posts, reels, hooks, propuestas para clientes o campañas..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 text-xs px-3 py-2 outline-none text-white placeholder:text-zinc-500 font-medium bg-transparent"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-2.5 rounded-xl p12-gold-gradient text-black font-bold disabled:opacity-40 hover:brightness-110 transition-all shadow-md shadow-[#D4AF37]/20 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5 text-black" />
          </button>
        </form>
      </div>

      {/* Schedule Modal Integration */}
      <ScheduleContentModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        initialData={scheduleModalData}
        onScheduled={() => {
          showToast('¡Publicación agendada exitosamente en el calendario!', 'success');
        }}
      />
    </div>
  );
};
