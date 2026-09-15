import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Send,
  Copy,
  Check,
  FileText,
  MessageSquare,
  Mail,
  Image as ImageIcon,
  Layers,
  Wand2,
  DollarSign,
  TrendingUp,
  Download,
  Share2,
  RefreshCw,
  Plus
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { CommercialAIGenerateRequest, CommercialAIGenerateResponse } from '../../types';

interface CommercialAIModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: {
    clientName?: string;
    companyName?: string;
    clientEmail?: string;
    clientPhone?: string;
    industry?: string;
    generationType?: 'EMAIL_PITCH' | 'WHATSAPP_CLOSING' | 'PROPOSAL_OUTLINE' | 'SOCIAL_SALES_COPY' | 'VISUAL_PROMPT_CREATIVE';
  };
}

export const CommercialAIModal: React.FC<CommercialAIModalProps> = ({
  isOpen,
  onClose,
  initialData
}) => {
  const {
    plans,
    crmContacts,
    generateCommercialContent,
    generateImageWithAI,
    saveImageToLibrary,
    saveActivity,
    setIsCreateQuoteOpen,
    setSelectedQuote,
    addToast,
    data
  } = useWorkspace();

  const [generationType, setGenerationType] = useState<
    'EMAIL_PITCH' | 'WHATSAPP_CLOSING' | 'PROPOSAL_OUTLINE' | 'SOCIAL_SALES_COPY' | 'VISUAL_PROMPT_CREATIVE'
  >('EMAIL_PITCH');

  const [clientName, setClientName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('E-commerce & Retail');
  const [selectedPlanNames, setSelectedPlanNames] = useState<string[]>([]);
  const [goal, setGoal] = useState('Aumentar leads calificados y ventas');
  const [tone, setTone] = useState<'consultative' | 'aggressive' | 'exclusive_vip' | 'educational'>('exclusive_vip');
  const [customInstructions, setCustomInstructions] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CommercialAIGenerateResponse | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Editable fields of result
  const [editableHeadline, setEditableHeadline] = useState('');
  const [editableBody, setEditableBody] = useState('');
  const [editableCta, setEditableCta] = useState('');
  const [editableFollowUp, setEditableFollowUp] = useState('');

  // Image Generation Sub-feature
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      if (initialData.clientName) setClientName(initialData.clientName);
      if (initialData.companyName) setCompanyName(initialData.companyName);
      if (initialData.industry) setIndustry(initialData.industry);
      if (initialData.generationType) setGenerationType(initialData.generationType);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const req: CommercialAIGenerateRequest = {
        type: generationType,
        clientName: clientName.trim() || undefined,
        companyName: companyName.trim() || undefined,
        industry: industry.trim() || undefined,
        selectedPlans: selectedPlanNames,
        goal: goal.trim() || undefined,
        tone,
        customInstructions: customInstructions.trim() || undefined
      };

      const res = await generateCommercialContent(req);
      setResult(res);
      setEditableHeadline(res.headline || '');
      setEditableBody(res.body || '');
      setEditableCta(res.callToAction || '');
      setEditableFollowUp(res.followUpRecommendation || '');
      if (res.imageGenerations && res.imageGenerations.length > 0) {
        setGeneratedImageUrl(res.imageGenerations[0].prompt || null);
      }
      addToast('Contenido comercial generado con éxito');
    } catch (err: any) {
      console.error(err);
      addToast('Error al contactar con la IA comercial', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    addToast('Copiado al portapapeles');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSaveToContactNote = async () => {
    const foundContact = crmContacts.find(
      (c) =>
        c.fullName.toLowerCase().includes(clientName.toLowerCase()) ||
        (companyName && c.companyName?.toLowerCase().includes(companyName.toLowerCase()))
    );
    if (!foundContact) {
      addToast('No se encontró un contacto específico para vincular esta nota', 'info');
      return;
    }

    await saveActivity({
      id: `act_${Date.now()}`,
      entityType: 'CONTACT',
      entityId: foundContact.id,
      type: 'NOTE',
      title: `Propuesta IA: ${editableHeadline || 'Estrategia Comercial'}`,
      description: `${editableBody}\n\nCTA: ${editableCta}`,
      authorName: data.currentMember.name,
      timestamp: new Date().toISOString()
    });

    addToast(`Nota guardada en la ficha de ${foundContact.fullName}`);
  };

  const handleTriggerImageGeneration = async (promptText: string) => {
    setIsGeneratingImage(true);
    try {
      const res = await generateImageWithAI({
        prompt: promptText,
        aspectRatio: '16:9',
        category: 'HERO_COVER'
      });
      if (res && res.imageUrl) {
        setGeneratedImageUrl(res.imageUrl);
        await saveImageToLibrary({
          title: `Creativo IA - ${clientName || companyName || 'Pixel 12'}`,
          url: res.imageUrl,
          category: 'HERO_COVER',
          tags: ['AI', 'Comercial', industry]
        });
        addToast('Imagen comercial generada y guardada en biblioteca');
      }
    } catch (e) {
      addToast('Error al generar la imagen', 'error');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="bg-[#0D0D14] border border-[#252538] w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden my-6 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-[#141420] border-b border-[#222232] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl p12-gold-gradient flex items-center justify-center text-black font-black shadow-md shadow-[#D4AF37]/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-wide font-display flex items-center gap-2">
                Asistente Comercial con IA • Pixel 12
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#E5C158] font-mono">
                  GEMINI COMMERCIAL
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Genera propuestas de alto cierre, mensajes de WhatsApp, correos y visuales editables
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1.5 rounded-lg hover:bg-zinc-800/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Generation Type Selector */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {[
              { id: 'EMAIL_PITCH', label: 'Email Comercial', icon: Mail },
              { id: 'WHATSAPP_CLOSING', label: 'WhatsApp Cierre', icon: MessageSquare },
              { id: 'PROPOSAL_OUTLINE', label: 'Propuesta / Pitch', icon: FileText },
              { id: 'SOCIAL_SALES_COPY', label: 'Copy & Anuncio', icon: Share2 },
              { id: 'VISUAL_PROMPT_CREATIVE', label: 'Creativo Visual', icon: ImageIcon }
            ].map((type) => {
              const Icon = type.icon;
              const isSelected = generationType === type.id;
              return (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setGenerationType(type.id as any)}
                  className={`p-3 rounded-2xl border text-xs font-semibold flex flex-col items-center gap-2 transition-all ${
                    isSelected
                      ? 'bg-[#D4AF37]/15 border-[#D4AF37] text-[#E5C158] shadow-lg shadow-[#D4AF37]/10'
                      : 'bg-[#12121C] border-[#222234] text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-center">{type.label}</span>
                </button>
              );
            })}
          </div>

          {/* Form Configuration Grid */}
          <form onSubmit={handleGenerate} className="bg-[#12121C] border border-[#222234] rounded-2xl p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                  Nombre del Cliente / Lead
                </label>
                <input
                  type="text"
                  placeholder="Ej. Sofia Martínez"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full bg-[#181826] border border-[#28283C] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                  Empresa o Marca
                </label>
                <input
                  type="text"
                  placeholder="Ej. InnovaTech Studio"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full bg-[#181826] border border-[#28283C] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                  Sector o Industria
                </label>
                <input
                  type="text"
                  placeholder="Ej. Finanzas, Moda, SaaS, Salud"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full bg-[#181826] border border-[#28283C] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                  Objetivo Comercial Principal
                </label>
                <input
                  type="text"
                  placeholder="Ej. Duplicar prospectos con Google Ads y mejorar diseño de marca"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  className="w-full bg-[#181826] border border-[#28283C] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                  Tono del Mensaje
                </label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value as any)}
                  className="w-full bg-[#181826] border border-[#28283C] rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-[#D4AF37]"
                >
                  <option value="exclusive_vip">Exclusivo VIP & Autoridad (Pixel 12 Luxury)</option>
                  <option value="consultative">Consultivo Estratégico (Orientado a ROI)</option>
                  <option value="aggressive">Directo & Enérgico (Llamado a la Acción Inmediato)</option>
                  <option value="educational">Educativo & Demostrativo</option>
                </select>
              </div>
            </div>

            {/* Select Plans to Include */}
            <div>
              <label className="block text-[11px] font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                Servicios o Planes Recomendados de Pixel 12
              </label>
              <div className="flex flex-wrap gap-2">
                {plans.map((p) => {
                  const isSelected = selectedPlanNames.includes(p.name);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          setSelectedPlanNames(selectedPlanNames.filter((n) => n !== p.name));
                        } else {
                          setSelectedPlanNames([...selectedPlanNames, p.name]);
                        }
                      }}
                      className={`text-xs px-3 py-1.5 rounded-xl border font-medium transition-all ${
                        isSelected
                          ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-white'
                          : 'bg-[#181826] border-[#2B2B3E] text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {p.name} (${p.price})
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Notes */}
            <div>
              <label className="block text-[11px] font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                Instrucciones Adicionales / Objeciones a Resolver
              </label>
              <textarea
                rows={2}
                placeholder="Ej. El cliente dice que probó otra agencia y no tuvo resultados; resaltar nuestra garantía y metodología de contenido dinámico con IA..."
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
                className="w-full bg-[#181826] border border-[#28283C] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37] resize-none"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2.5 rounded-xl p12-gold-gradient text-black font-semibold text-xs sm:text-sm hover:brightness-110 shadow-lg shadow-[#D4AF37]/25 flex items-center gap-2 transition-all disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Generando con IA...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    Generar Contenido Comercial
                  </>
                )}
              </button>
            </div>
          </form>

          {/* GENERATED RESULTS CONTAINER (FULLY EDITABLE) */}
          {result && (
            <div className="bg-[#12121C] border border-[#D4AF37]/30 rounded-2xl p-6 space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#242436] pb-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#E5C158] tracking-wider block">
                    Resultado Generado (Editable manualmente)
                  </span>
                  <h3 className="text-sm font-bold text-white">
                    Personaliza cualquier texto antes de enviar o registrar
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSaveToContactNote}
                    className="px-3 py-1.5 rounded-lg bg-[#1F1F2E] hover:bg-[#28283C] text-zinc-200 border border-[#2F2F44] text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#D4AF37]" />
                    Guardar en Ficha
                  </button>

                  <button
                    onClick={() => {
                      copyToClipboard(
                        `${editableHeadline}\n\n${editableBody}\n\n${editableCta}`,
                        'all'
                      );
                    }}
                    className="px-3.5 py-1.5 rounded-lg p12-gold-gradient text-black text-xs font-semibold flex items-center gap-1.5 hover:brightness-110 transition-all"
                  >
                    {copiedKey === 'all' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    Copiar Todo
                  </button>
                </div>
              </div>

              {/* Editable Headline */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                    Asunto / Titular de Alto Impacto
                  </label>
                  <button
                    onClick={() => copyToClipboard(editableHeadline, 'headline')}
                    className="text-[11px] text-zinc-400 hover:text-[#D4AF37] flex items-center gap-1"
                  >
                    {copiedKey === 'headline' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />} Copiar
                  </button>
                </div>
                <input
                  type="text"
                  value={editableHeadline}
                  onChange={(e) => setEditableHeadline(e.target.value)}
                  className="w-full bg-[#181826] border border-[#2A2A3E] rounded-xl px-4 py-2.5 text-sm font-bold text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              {/* Editable Body */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                    Cuerpo del Mensaje / Propuesta (Totalmente editable)
                  </label>
                  <button
                    onClick={() => copyToClipboard(editableBody, 'body')}
                    className="text-[11px] text-zinc-400 hover:text-[#D4AF37] flex items-center gap-1"
                  >
                    {copiedKey === 'body' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />} Copiar
                  </button>
                </div>
                <textarea
                  rows={8}
                  value={editableBody}
                  onChange={(e) => setEditableBody(e.target.value)}
                  className="w-full bg-[#181826] border border-[#2A2A3E] rounded-xl p-4 text-xs sm:text-sm text-zinc-200 leading-relaxed focus:outline-none focus:border-[#D4AF37] resize-y"
                />
              </div>

              {/* CTA & Followup recommendation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block mb-1.5">
                    Llamado a la Acción (CTA)
                  </label>
                  <input
                    type="text"
                    value={editableCta}
                    onChange={(e) => setEditableCta(e.target.value)}
                    className="w-full bg-[#181826] border border-[#2A2A3E] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block mb-1.5">
                    Recomendación de Seguimiento
                  </label>
                  <input
                    type="text"
                    value={editableFollowUp}
                    onChange={(e) => setEditableFollowUp(e.target.value)}
                    className="w-full bg-[#181826] border border-[#2A2A3E] rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              {/* Visual Creative Generator Sub-Box */}
              {result.imageGenerations && result.imageGenerations.length > 0 && (
                <div className="bg-[#181826] border border-[#2E2E44] rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-[#D4AF37]" /> Creativo Visual Recomendado para la Propuesta
                    </h4>
                    <span className="text-[10px] text-zinc-400">16:9 • Formato Portada</span>
                  </div>

                  <p className="text-xs text-zinc-300">
                    <strong className="text-white">Prompt Sugerido: </strong>
                    {result.imageGenerations[0].prompt}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      onClick={() => handleTriggerImageGeneration(result.imageGenerations![0].prompt)}
                      disabled={isGeneratingImage}
                      className="px-4 py-2 rounded-xl bg-[#D4AF37]/20 border border-[#D4AF37]/50 text-[#E5C158] hover:bg-[#D4AF37]/30 text-xs font-semibold flex items-center gap-2 transition-all disabled:opacity-50"
                    >
                      {isGeneratingImage ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          Generando Imagen con IA...
                        </>
                      ) : (
                        <>
                          <Wand2 className="w-3.5 h-3.5" />
                          Renderizar Imagen con IA
                        </>
                      )}
                    </button>

                    {generatedImageUrl && (
                      <span className="text-xs text-emerald-400 flex items-center gap-1 font-semibold">
                        <Check className="w-3.5 h-3.5" /> Imagen lista en Biblioteca
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
