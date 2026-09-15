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
  FileText
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

const suggestedPrompts = [
  'Crea 5 ganchos demoledores de 3 segundos para un Reel vendiendo Asistencia Virtual para PyMEs saturadas.',
  'Escribe un carrusel de 7 diapositivas con tono de autoridad sobre por qué contratar un freelance sale más caro que un equipo.',
  'Redacta un post para LinkedIn dirigido a CEOs sobre cómo delegar operaciones sin perder el control.',
  'Dame una idea de contenido educativo para Instagram con su gancho, guion visual y CTA para pedir diagnóstico estratégico.',
];

export const CopilotView: React.FC = () => {
  const { activeBrand, addPost, showToast, openPostDetail } = useWorkspace();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init_msg',
      sender: 'assistant',
      text: `¡Hola! Soy tu Copiloto de Inteligencia Artificial para **${activeBrand.name}**.\n\nTengo cargada toda la identidad de la marca: tono de voz *${activeBrand.voice.tone}*, público objetivo *${activeBrand.targetAudience}* y pilares de contenido.\n\nPuedes pedirme ganchos de alto impacto, redacción completa de carruseles, guiones para Reels o que reescriba copies existentes.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

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
      // Exclude initial greeting message so the conversation history begins cleanly
      const history = messages
        .filter((m) => m.id !== 'init_msg' && !m.id.startsWith('init_'))
        .map((m) => ({
          role: m.sender === 'user' ? 'user' : 'model',
          content: m.text,
        }));

      const res = await chatWithCopilotAI({
        message: userMsg.text,
        brandName: activeBrand.name,
        brandVoice: activeBrand.voice.tone,
        brandAudience: activeBrand.targetAudience,
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
      showToast(err.message || 'Error con el copiloto', 'error');
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    showToast('Copiado al portapapeles');
  };

  const convertMessageToPost = async (text: string) => {
    // Extract first line as hook / title
    const lines = text.split('\n').filter((l) => l.trim().length > 0);
    const titleCandidate = lines[0]?.replace(/[#*]/g, '').slice(0, 60) || 'Publicación creada con Copiloto';
    const hookCandidate = lines.find((l) => l.toLowerCase().includes('gancho') || l.toLowerCase().includes('hook')) || lines[0] || '';

    const newPost: Post = {
      id: 'post_copilot_' + Date.now(),
      brandId: activeBrand.id,
      internalTitle: titleCandidate,
      date: '2026-09-14',
      time: '11:00',
      platforms: ['instagram', 'linkedin'],
      format: text.toLowerCase().includes('carrusel') ? 'Carousel' : 'Static Post',
      pillar: 'Educativo',
      theme: titleCandidate,
      objective: 'Posicionamiento y generación de conversaciones',
      hook: hookCandidate.replace(/^.*?:/i, '').replace(/["']/g, '').trim(),
      caption: text,
      cta: activeBrand.voice.preferredCTAs[0] || 'Comenta para más información',
      hashtags: ['#Pixel12', '#MarketingDigital'],
      status: 'DRAFT',
      relatedTaskIds: [],
      approvalHistory: [],
      versions: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await addPost(newPost);
    openPostDetail(newPost);
    showToast('Publicación creada a partir de la respuesta de IA');
  };

  return (
    <div id="copilot-view" className="h-full min-h-[450px] flex flex-col max-w-5xl mx-auto p-2.5 sm:p-4 md:p-6 select-none">
      {/* Top Brand Context Bar */}
      <div className="p-2.5 sm:p-3.5 rounded-xl bg-slate-900 text-white border border-slate-800 flex items-center justify-between mb-3 shrink-0 shadow-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-tr from-sky-500 to-orange-500 flex items-center justify-center font-bold text-white shadow-xs shrink-0">
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <span className="text-xs font-bold text-white truncate">Copiloto: {activeBrand.name}</span>
              <span className="flex items-center gap-1 text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-medium shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                GEMINI 3.8
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-300 truncate max-w-xs sm:max-w-md">
              Tono: <span className="text-slate-100 font-medium">{activeBrand.voice.tone}</span> · Audiencia:{' '}
              <span className="text-slate-100 font-medium">{activeBrand.targetAudience}</span>
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setMessages([
              {
                id: 'init_' + Date.now(),
                sender: 'assistant',
                text: `Historial reiniciado. Estoy listo para ayudarte con contenido fresco para **${activeBrand.name}**.`,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              },
            ]);
            showToast('Conversación reiniciada');
          }}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1 text-xs"
          title="Reiniciar chat"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Limpiar chat</span>
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'assistant' && (
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-sky-500 to-orange-500 flex items-center justify-center text-white shrink-0 shadow-xs mt-1">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
            )}

            <div
              className={`max-w-2xl rounded-2xl p-4 text-xs leading-relaxed space-y-2 shadow-xs ${
                msg.sender === 'user'
                  ? 'bg-slate-900 text-white rounded-br-xs'
                  : 'bg-white border border-slate-200 text-slate-800 rounded-bl-xs'
              }`}
            >
              <div className="whitespace-pre-line font-sans leading-relaxed">{msg.text}</div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[10px] text-slate-400">
                <span>{msg.timestamp}</span>

                {msg.sender === 'assistant' && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copyToClipboard(msg.text, msg.id)}
                      className="hover:text-slate-700 flex items-center gap-1 font-medium transition-colors"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-600">Copiado</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copiar</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => convertMessageToPost(msg.text)}
                      className="text-sky-600 hover:text-sky-700 flex items-center gap-1 font-bold ml-2"
                    >
                      <PlusCircle className="w-3 h-3" />
                      <span>Crear Post desde aquí</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {msg.sender === 'user' && (
              <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-white shrink-0 mt-1">
                <User className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 items-center text-xs text-slate-500 p-2">
            <div className="w-7 h-7 rounded-lg bg-sky-100 flex items-center justify-center text-sky-600 animate-spin">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span className="font-semibold text-slate-600">El Copiloto está redactando...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Chips if few messages */}
      {messages.length <= 2 && (
        <div className="py-2 shrink-0">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
            <Lightbulb className="w-3 h-3 text-amber-500" />
            Sugerencias de prompts:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {suggestedPrompts.map((sug, i) => (
              <button
                key={i}
                onClick={() => handleSend(sug)}
                className="text-left p-2 rounded-lg bg-slate-50 hover:bg-sky-50 border border-slate-200/80 hover:border-sky-300 text-[11px] text-slate-600 hover:text-sky-800 transition-all line-clamp-1"
              >
                "{sug}"
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Box */}
      <div className="pt-3 border-t border-slate-200 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2 bg-white rounded-2xl border border-slate-300 p-1.5 shadow-sm focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-500/20 transition-all"
        >
          <input
            type="text"
            placeholder="Pide ganchos, copys de carruseles, guiones para Reels o adaptaciones..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 text-xs px-3 py-2 outline-none text-slate-900 placeholder:text-slate-400 font-medium"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-orange-500 hover:from-sky-500 hover:to-orange-400 text-white disabled:opacity-40 transition-all shadow-xs cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
