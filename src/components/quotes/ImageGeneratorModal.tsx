import React, { useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { ImageLibraryItem, ImageCategoryType } from '../../types';
import {
  X,
  Sparkles,
  Wand2,
  Copy,
  Check,
  Download,
  BookmarkPlus,
  Loader2,
  Layers,
  Palette,
  Eye,
  Sliders,
  Maximize2
} from 'lucide-react';

interface ImageGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImage?: (imageUrl: string, title: string) => void;
}

const CATEGORIES: ImageCategoryType[] = [
  'Cotizaciones',
  'Propuestas',
  'Redes sociales',
  'Marketing',
  'Branding',
  'Asistencia virtual'
];

const STYLES = [
  'Pixel 12 Luxury (Negro, Oro, Plata)',
  'Editorial The Mentors Style',
  'Minimal Studio',
  'Cyber Executive'
];

const OBJECTIVES = [
  'Autoridad & Prestigio',
  'Conversión & Cierre Comercial',
  'Branding & Posicionamiento',
  'Presentación Ejecutiva'
];

const SECTORS = [
  'Servicios Profesionales',
  'Inmobiliario / Real Estate',
  'Salud & Bienestar',
  'Gastronomía & Restaurantes',
  'E-commerce & Retail',
  'Educación & Capacitación',
  'Legal & Financiero'
];

const ASPECT_RATIOS = [
  { id: '1:1', label: '1:1 Cuadrado (Feed / Avatar)', class: 'aspect-square' },
  { id: '4:5', label: '4:5 Vertical (Instagram Feed)', class: 'aspect-[4/5]' },
  { id: '16:9', label: '16:9 Panorámico (Web / Propuesta)', class: 'aspect-video' },
  { id: '9:16', label: '9:16 Historia / Reel', class: 'aspect-[9/16]' }
];

export const ImageGeneratorModal: React.FC<ImageGeneratorModalProps> = ({
  isOpen,
  onClose,
  onSelectImage
}) => {
  const { generateQuoteImage, addToast } = useWorkspace();

  const [category, setCategory] = useState<ImageCategoryType>('Cotizaciones');
  const [client, setClient] = useState('');
  const [sector, setSector] = useState(SECTORS[0]);
  const [service, setService] = useState('Marketing Digital & Redes Sociales');
  const [style, setStyle] = useState(STYLES[0]);
  const [objective, setObjective] = useState(OBJECTIVES[0]);
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [prompt, setPrompt] = useState('');

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<ImageLibraryItem | null>(null);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    try {
      const asset = await generateQuoteImage({
        type: category,
        objective,
        client: client.trim() || 'Pixel 12 Client',
        sector,
        service,
        style,
        aspectRatio,
        prompt
      });

      if (asset) {
        setGeneratedResult(asset);
        addToast('Visual generado exitosamente y guardado en biblioteca', 'success');
      }
    } catch (err) {
      addToast('Error al generar el visual', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyPrompt = () => {
    if (!generatedResult?.prompt) return;
    navigator.clipboard.writeText(generatedResult.prompt);
    setCopiedPrompt(true);
    addToast('Prompt copiado al portapapeles', 'success');
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  return (
    <div
      id="image-generator-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-3 sm:p-5 overflow-y-auto"
    >
      <div className="relative w-full max-w-4xl my-auto bg-[#0E0E12] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between bg-[#121217]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl p12-gold-gradient flex items-center justify-center font-black text-black">
              <Wand2 className="w-5 h-5 text-black" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                Generador de Visuales & Conceptos IA — Pixel 12
              </h2>
              <p className="text-xs text-zinc-400">
                Diseña creativos comerciales, portadas para propuestas y piezas de marketing bajo la identidad Pixel 12
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto flex-1 p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls Column */}
          <form
            onSubmit={handleGenerate}
            className="lg:col-span-6 space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-4">
              {/* Category */}
              <div>
                <label className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider block mb-1.5">
                  1. Módulo o Categoría
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`p-2 rounded-xl text-xs font-semibold text-center border transition-all truncate ${
                        category === cat
                          ? 'bg-[#D4AF37]/15 text-[#E5C158] border-[#D4AF37]/40'
                          : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Client and Sector */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">Cliente / Proyecto</label>
                  <input
                    type="text"
                    placeholder="Ej: Inmobiliaria Altura"
                    value={client}
                    onChange={(e) => setClient(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">Sector / Industria</label>
                  <select
                    value={sector}
                    onChange={(e) => setSector(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-1.5 text-xs text-white"
                  >
                    {SECTORS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Style & Objective */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">Estilo Visual</label>
                  <select
                    value={style}
                    onChange={(e) => setStyle(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-1.5 text-xs text-white"
                  >
                    {STYLES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">Objetivo Comercial</label>
                  <select
                    value={objective}
                    onChange={(e) => setObjective(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-1.5 text-xs text-white"
                  >
                    {OBJECTIVES.map((obj) => (
                      <option key={obj} value={obj}>
                        {obj}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Aspect Ratio */}
              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">Formato de Imagen</label>
                <div className="grid grid-cols-2 gap-2">
                  {ASPECT_RATIOS.map((ar) => (
                    <button
                      key={ar.id}
                      type="button"
                      onClick={() => setAspectRatio(ar.id)}
                      className={`p-2 text-left rounded-lg border text-xs transition-colors ${
                        aspectRatio === ar.id
                          ? 'bg-[#D4AF37]/15 border-[#D4AF37]/50 text-[#E5C158] font-bold'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                      }`}
                    >
                      {ar.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Prompt Context */}
              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">
                  Detalles creativos específicos (Opcional):
                </label>
                <textarea
                  rows={2}
                  placeholder="Ej: Iluminación de estudio, laptop con dashboard de métricas, tonos dorados elegantes, sin ruido..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-xs text-white resize-none"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isGenerating}
                className="w-full py-2.5 rounded-xl p12-gold-gradient text-black text-xs font-bold flex items-center justify-center gap-2 shadow-lg hover:brightness-110 disabled:opacity-50 transition-all"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-black" />
                    <span>Creando Visual & Prompt Profesional...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-black" />
                    <span>Generar Visual con IA Pixel 12</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Preview & Output Column */}
          <div className="lg:col-span-6 flex flex-col justify-between bg-[#121217] rounded-2xl border border-zinc-800 p-4">
            {generatedResult ? (
              <div className="space-y-4">
                <div className="relative rounded-xl overflow-hidden border border-zinc-700 bg-black group max-h-72 flex items-center justify-center">
                  <img
                    src={generatedResult.imageUrl}
                    alt={generatedResult.title}
                    className="w-full h-full object-cover max-h-72"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-2 right-2 flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded bg-black/80 text-[10px] text-[#E5C158] font-bold border border-[#D4AF37]/30">
                      {generatedResult.aspectRatio}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-black/80 text-[10px] text-zinc-300 border border-zinc-700">
                      {generatedResult.category}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white mb-1">{generatedResult.title}</h3>
                  {generatedResult.visualDirection && (
                    <p className="text-xs text-[#E5C158] bg-[#D4AF37]/10 p-2.5 rounded-lg border border-[#D4AF37]/20 leading-relaxed mb-2">
                      <span className="font-bold">Dirección de Arte:</span> {generatedResult.visualDirection}
                    </p>
                  )}
                </div>

                {/* Prompt Box */}
                <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      Prompt Cinematográfico Generado
                    </span>
                    <button
                      onClick={handleCopyPrompt}
                      className="text-xs text-[#D4AF37] hover:text-[#E5C158] flex items-center gap-1"
                    >
                      {copiedPrompt ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedPrompt ? 'Copiado' : 'Copiar'}</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-zinc-300 font-mono line-clamp-3 leading-relaxed">
                    {generatedResult.prompt}
                  </p>
                </div>

                {/* Insertion & Actions */}
                <div className="flex items-center gap-2 pt-2">
                  {onSelectImage && (
                    <button
                      type="button"
                      onClick={() => {
                        onSelectImage(generatedResult.imageUrl, generatedResult.title);
                        addToast('Imagen insertada en la propuesta', 'success');
                        onClose();
                      }}
                      className="flex-1 py-2 rounded-xl p12-gold-gradient text-black text-xs font-bold shadow-md hover:brightness-110 flex items-center justify-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Usar en Cotización</span>
                    </button>
                  )}

                  <a
                    href={generatedResult.imageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 border border-zinc-700"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Ver HD</span>
                  </a>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-600">
                  <Sparkles className="w-8 h-8 text-[#D4AF37]/40" />
                </div>
                <h4 className="text-sm font-bold text-zinc-300">Generación de Visuales Pixel 12</h4>
                <p className="text-xs text-zinc-500 max-w-xs leading-relaxed">
                  Configura los parámetros a la izquierda y presiona el botón para generar el visual y su ficha técnica con IA.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
