import React, { useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import {
  X,
  Sparkles,
  Link2,
  FileText,
  Lightbulb,
  CheckCircle2,
  Loader2,
  BookOpen,
  Share2,
  Compass,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

interface CreateBlogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateBlogModal: React.FC<CreateBlogModalProps> = ({ isOpen, onClose }) => {
  const { generateBlogWithAI, activeBrand, showToast } = useWorkspace();

  const [sourceType, setSourceType] = useState<'topic' | 'url'>('topic');
  const [topic, setTopic] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [category, setCategory] = useState('Marketing Digital & Redes');
  const [tone, setTone] = useState('Profesional, Estratégico, Cercano y Persuasivo (Voz Pixel 12)');
  const [author, setAuthor] = useState('Camila Pinto');
  const [authorRole, setAuthorRole] = useState('Directora de Estrategia & CEO · Pixel 12');
  const [targetLength, setTargetLength] = useState(1800);
  const [focusKeyword, setFocusKeyword] = useState('');
  const [autoRepurpose, setAutoRepurpose] = useState(true);

  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState('');

  if (!isOpen) return null;

  const topicSuggestions = [
    'Cómo delegar el 70% de tus tareas operativas a una Asistente Virtual en 48 horas',
    'Estrategia de contenidos en Instagram y LinkedIn para agencias y empresas de servicios',
    'Protocolo de respuesta a prospectos en redes: Cómo cerrar ventas en menos de 15 minutos',
    'De fundador agotado a líder estratégico: Sistemas de productividad y gestión delegada',
    'Por qué contratar una agencia con asistencia virtual triplica la retención de clientes'
  ];

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (sourceType === 'topic' && !topic.trim()) {
      showToast('Por favor escribe un tema para el artículo', 'error');
      return;
    }

    if (sourceType === 'url' && !sourceUrl.trim()) {
      showToast('Por favor introduce la URL de referencia', 'error');
      return;
    }

    setIsGenerating(true);
    setGenerationStep('Analizando fuentes y estructurando esquema SEO Pixel 12...');

    try {
      setTimeout(() => {
        setGenerationStep('Redactando artículo estratégico en profundidad con tablas y metodología...');
      }, 1400);

      setTimeout(() => {
        setGenerationStep('Auditando factores SEO y generando Carrusel Pixel 12, Guion de Reel y Stories...');
      }, 2800);

      await generateBlogWithAI({
        topic: sourceType === 'topic' ? topic : undefined,
        sourceUrl: sourceType === 'url' ? sourceUrl : undefined,
        sourceType,
        category,
        tone,
        author,
        authorRole,
        targetLength,
        brandId: activeBrand.id
      });

      onClose();
      // Reset
      setTopic('');
      setSourceUrl('');
      setFocusKeyword('');
    } catch (err: any) {
      // Error handled by context toast
    } finally {
      setIsGenerating(false);
      setGenerationStep('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl my-8 bg-zinc-950 border border-[#D4AF37]/40 rounded-2xl shadow-2xl overflow-hidden text-zinc-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800 bg-zinc-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37]">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Generador de Artículos de Blog & Estrategia SEO
                </h2>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30">
                  Pixel 12 OS
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Una URL o un tema → artículo de blog, carrusel de 5 slides, guion de reel e historias en 1 clic
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isGenerating}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleGenerate} className="p-6 space-y-6">
          
          {/* Source Type Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
              Modo de Entrada
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSourceType('topic')}
                className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${
                  sourceType === 'topic'
                    ? 'bg-[#D4AF37]/15 border-[#D4AF37] text-white shadow-sm'
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                }`}
              >
                <div className={`p-2 rounded-lg ${sourceType === 'topic' ? 'bg-[#D4AF37] text-black' : 'bg-zinc-800 text-zinc-300'}`}>
                  <Lightbulb className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">Por Tema o Tesis Estratégica</div>
                  <div className="text-xs text-zinc-400">Escribe el concepto, servicio o problema a resolver</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSourceType('url')}
                className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${
                  sourceType === 'url'
                    ? 'bg-[#D4AF37]/15 border-[#D4AF37] text-white shadow-sm'
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                }`}
              >
                <div className={`p-2 rounded-lg ${sourceType === 'url' ? 'bg-[#D4AF37] text-black' : 'bg-zinc-800 text-zinc-300'}`}>
                  <Link2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">Por URL de Referencia</div>
                  <div className="text-xs text-zinc-400">Analiza y transforma un link externo o caso de estudio</div>
                </div>
              </button>
            </div>
          </div>

          {/* Dynamic Input based on Source */}
          {sourceType === 'topic' ? (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                  Tema, Título o Pregunta de Negocio *
                </label>
                <span className="text-[11px] text-zinc-400">
                  Sé descriptivo para un mejor resultado
                </span>
              </div>
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Ej: Cómo una Asistente Virtual calificada permite al CEO recuperar 18 horas semanales y cerrar más prospectos..."
                rows={3}
                required
                className="w-full px-4 py-3 bg-zinc-900/80 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-colors"
              />

              {/* Suggestions */}
              <div className="mt-3">
                <div className="text-[11px] font-semibold text-zinc-400 mb-1.5 flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-[#D4AF37]" />
                  Temas sugeridos para Pixel 12:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {topicSuggestions.map((sug, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setTopic(sug)}
                      className="text-xs text-left px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition-colors"
                    >
                      {sug.length > 52 ? sug.slice(0, 52) + '...' : sug}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-2">
                URL del Artículo, Caso o Noticia de Negocio *
              </label>
              <div className="relative">
                <Link2 className="absolute left-3.5 top-3.5 w-4 h-4 text-zinc-500" />
                <input
                  type="url"
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                  placeholder="https://ejemplo.com/articulo-estrategia-crecimiento-digital..."
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-900/80 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
                />
              </div>
              <p className="text-xs text-zinc-400 mt-2">
                El motor extraerá los puntos clave del contenido y los redactará como una publicación estratégica original con la voz de marca ejecutiva de Pixel 12.
              </p>
            </div>
          )}

          {/* Configuration Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-zinc-800">
            
            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Categoría del Blog
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-zinc-900/80 border border-zinc-800 rounded-xl text-sm text-zinc-200 focus:outline-none focus:border-[#D4AF37]"
              >
                <option value="Marketing Digital & Redes">Marketing Digital & Redes</option>
                <option value="Asistencia Virtual & Delegación">Asistencia Virtual & Delegación</option>
                <option value="Estrategia de Contenidos">Estrategia de Contenidos</option>
                <option value="Productividad & Automatización">Productividad & Automatización</option>
                <option value="Casos de Éxito & Clientes">Casos de Éxito & Clientes</option>
              </select>
            </div>

            {/* Tone of voice */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Tono de Voz
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-zinc-900/80 border border-zinc-800 rounded-xl text-sm text-zinc-200 focus:outline-none focus:border-[#D4AF37]"
              >
                <option value="Profesional, Estratégico, Cercano y Persuasivo (Voz Pixel 12)">
                  Profesional, Estratégico, Cercano y Persuasivo (Voz Pixel 12)
                </option>
                <option value="Ejecutivo & Directivo (Enfocado a CEOs y Fundadores)">
                  Ejecutivo & Directivo (Enfocado a CEOs y Fundadores)
                </option>
                <option value="Didáctico & Accionable (Paso a Paso)">
                  Didáctico & Accionable (Paso a Paso)
                </option>
              </select>
            </div>

            {/* Author */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Autor Asignado
              </label>
              <div className="flex items-center gap-2 px-3 py-2 bg-zinc-900/80 border border-zinc-800 rounded-xl">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                  alt="Camila Pinto"
                  className="w-6 h-6 rounded-full object-cover border border-[#D4AF37]/60"
                />
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="bg-transparent text-sm text-white focus:outline-none flex-1 font-medium"
                />
              </div>
            </div>

            {/* Target Words */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Extensión y Profundidad
              </label>
              <select
                value={targetLength}
                onChange={(e) => setTargetLength(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-zinc-900/80 border border-zinc-800 rounded-xl text-sm text-zinc-200 focus:outline-none focus:border-[#D4AF37]"
              >
                <option value={1200}>1,200 palabras (Guía Rápida / 5 min)</option>
                <option value={1800}>1,800 palabras (Estándar Estratégico / 7 min)</option>
                <option value={2500}>2,500+ palabras (Pilar Exhaustivo / 10 min)</option>
              </select>
            </div>
          </div>

          {/* Repurposing Guarantee Banner */}
          <div className="p-4 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-start gap-3">
            <Share2 className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-bold text-white block mb-0.5">
                Generación Multicanal Automática en 1 Clic
              </span>
              <span className="text-zinc-300">
                Al generar el blog, Pixel 12 OS creará automáticamente el <strong>Carrusel de 5 slides con identidad Negro/Dorado</strong>, el <strong>Guion de Reel de 60s</strong>, las <strong>Stories de Instagram</strong> y el <strong>Post de LinkedIn</strong>.
              </span>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isGenerating}
              className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isGenerating}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#E5C158] text-black font-bold text-sm shadow-lg shadow-[#D4AF37]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                  <span>{generationStep || 'Generando con IA...'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-black" />
                  <span>Generar Blog + Redes</span>
                  <ArrowRight className="w-4 h-4 text-black" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
