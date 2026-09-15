import React, { useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { QuoteProposal, AgencyPlan, AgencyCustomService } from '../../types';
import {
  X,
  Sparkles,
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  Layers,
  FileText,
  DollarSign,
  Loader2,
  Calendar,
  Briefcase
} from 'lucide-react';

interface CreateQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (newQuote: QuoteProposal) => void;
}

export const CreateQuoteModal: React.FC<CreateQuoteModalProps> = ({
  isOpen,
  onClose,
  onCreated
}) => {
  const { data, createQuote, generateAIQuote, addToast } = useWorkspace();

  const [mode, setMode] = useState<'AI' | 'MANUAL'>('AI');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [clientName, setClientName] = useState('');
  const [clientCompany, setClientCompany] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientCityCountry, setClientCityCountry] = useState('Guayaquil, Ecuador');
  const [clientTaxId, setClientTaxId] = useState('');
  const [clientSector, setClientSector] = useState('Servicios & Comercio');

  // Plan and services selection
  const plans = data.plans || [];
  const customServices = data.customServices || [];

  const [selectedPlanId, setSelectedPlanId] = useState<string>(
    plans.find((p) => p.isPopular)?.id || plans[0]?.id || 'plan_pro'
  );
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [customPrompt, setCustomPrompt] = useState('');
  const [customNeeds, setCustomNeeds] = useState('');

  if (!isOpen) return null;

  const toggleService = (serviceId: string) => {
    setSelectedServiceIds((prev) =>
      prev.includes(serviceId) ? prev.filter((id) => id !== serviceId) : [...prev, serviceId]
    );
  };

  const handleGenerateAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientCompany.trim()) {
      addToast('Por favor ingresa el nombre de la empresa del cliente', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const generated = await generateAIQuote({
        client: {
          name: clientName.trim() || 'Estimado Cliente',
          company: clientCompany.trim(),
          email: clientEmail.trim(),
          phone: clientPhone.trim(),
          cityCountry: clientCityCountry.trim(),
          taxId: clientTaxId.trim(),
          sector: clientSector.trim()
        },
        selectedPlanIds: selectedPlanId ? [selectedPlanId] : [],
        selectedServiceIds,
        customNeeds,
        prompt: customPrompt
      });

      if (generated) {
        addToast('¡Propuesta comercial generada con IA exitosamente!', 'success');
        onCreated(generated);
        onClose();
      }
    } catch (err) {
      addToast('Error al generar la propuesta comercial con IA', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientCompany.trim()) {
      addToast('Por favor ingresa el nombre de la empresa del cliente', 'error');
      return;
    }

    const selectedPlan = plans.find((p) => p.id === selectedPlanId);
    const chosenServices = customServices.filter((s) => selectedServiceIds.includes(s.id));

    const lineItems = [];
    if (selectedPlan) {
      lineItems.push({
        id: `item_${Date.now()}_plan`,
        type: 'PLAN' as const,
        name: selectedPlan.name,
        description: selectedPlan.description,
        quantity: 1,
        unitPrice: selectedPlan.price,
        total: selectedPlan.price,
        planId: selectedPlan.id,
        deliverables: selectedPlan.deliverables
      });
    }
    chosenServices.forEach((s) => {
      lineItems.push({
        id: `item_${Date.now()}_${s.id}`,
        type: 'SERVICE' as const,
        name: s.name,
        description: s.description,
        quantity: 1,
        unitPrice: s.basePrice,
        total: s.basePrice,
        serviceId: s.id,
        deliverables: s.deliverables
      });
    });

    if (lineItems.length === 0) {
      lineItems.push({
        id: `item_${Date.now()}_def`,
        type: 'SERVICE' as const,
        name: 'Servicio Estratégico Pixel 12',
        description: 'Servicio personalizado de marketing digital',
        quantity: 1,
        unitPrice: 450,
        total: 450,
        deliverables: ['Estrategia inicial', 'Producción de contenidos']
      });
    }

    const subtotal = lineItems.reduce((acc, i) => acc + i.total, 0);
    const taxPercent = data.commercialSettings?.taxPercent ?? 15;
    const taxAmount = Number(((subtotal * taxPercent) / 100).toFixed(2));
    const total = Number((subtotal + taxAmount).toFixed(2));

    const folio = `P12-COT-${new Date().getFullYear()}-${String((data.quotes?.length || 0) + 1).padStart(3, '0')}`;
    const now = new Date().toISOString();
    const validUntil = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const manualQuote: QuoteProposal = {
      id: `quote_${Date.now()}`,
      brandId: 'brand_pixel12',
      folio,
      title: `Propuesta Comercial Estratégica — ${clientCompany}`,
      status: 'DRAFT',
      client: {
        name: clientName || 'Contacto Comercial',
        company: clientCompany,
        email: clientEmail || 'contacto@empresa.com',
        phone: clientPhone || '+593 99 999 9999',
        cityCountry: clientCityCountry,
        taxId: clientTaxId,
        sector: clientSector
      },
      issueDate: now.split('T')[0],
      validUntil,
      currency: 'USD',
      executiveSummary: `Propuesta comercial formulada exclusivamente para ${clientCompany} por Pixel 12. Diseñada para potenciar su posicionamiento digital, generar autoridad y optimizar la captación comercial.`,
      presentationText: `En Pixel 12 ponemos a disposición de ${clientCompany} un equipo multidisciplinario enfocado en resultados medibles y excelencia visual.`,
      clientNeeds: [
        'Desarrollo de una identidad digital atractiva y congruente.',
        'Generación de prospectos y autoridad en canales clave.',
        'Acompañamiento profesional y ejecución confiable.'
      ],
      proposedSolution: `Plan integral combinando creación de contenidos audiovisuales, copys persuasivos y monitoreo táctico.`,
      selectedPlan,
      items: lineItems,
      subtotal,
      taxPercent,
      taxAmount,
      discountPercent: 0,
      discountAmount: 0,
      total,
      paymentTerms: data.commercialSettings?.paymentTermsDefault || '50% anticipo al iniciar y 50% al corte mensual.',
      paymentMethods: data.commercialSettings?.bankDetails || 'Banco Pichincha - Cta. Cte. #2100234589 Pixel 12 Agency.',
      termsAndConditions: data.commercialSettings?.termsAndConditions || 'Validez 15 días. Sujeto a cronograma aprobado.',
      roadmap: [
        {
          phase: 'Fase 1: Onboarding y Setup Estratégico',
          duration: 'Semana 1',
          description: 'Diagnóstico y análisis inicial de activos, recopilación de insumos y definición de calendario.',
          deliverables: ['Briefing inicial', 'Parrilla de lanzamiento']
        },
        {
          phase: 'Fase 2: Producción Creativa y Despliegue',
          duration: 'Semanas 2 y 3',
          description: 'Diseño de artes en alta resolución y activación de contenidos.',
          deliverables: ['Creativos publicitarios', 'Contenidos orgánicos']
        },
        {
          phase: 'Fase 3: Medición y Optimización',
          duration: 'Semana 4',
          description: 'Revisión de KPIs, retroalimentación y plan para el siguiente ciclo.',
          deliverables: ['Reporte mensual de desempeño']
        }
      ],
      visuals: [
        {
          id: `vis_${Date.now()}_1`,
          title: 'Portada de Marca Pixel 12',
          imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
          concept: 'Línea gráfica con identidad de lujo en negro y dorado.',
          type: 'cover'
        }
      ],
      notes: 'Soporte prioritario incluido durante días laborables.',
      createdAt: now,
      updatedAt: now
    };

    createQuote(manualQuote);
    addToast('Cotización creada exitosamente', 'success');
    onCreated(manualQuote);
    onClose();
  };

  return (
    <div
      id="create-quote-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-5 overflow-y-auto"
    >
      <div className="relative w-full max-w-3xl my-auto bg-[#0E0E12] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between bg-[#121217]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl p12-gold-gradient flex items-center justify-center font-black text-black text-sm">
              <Sparkles className="w-5 h-5 text-black" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                Nueva Cotización Comercial Pixel 12
              </h2>
              <p className="text-xs text-zinc-400">
                Crea una propuesta visual de alto impacto adaptada a las necesidades de tu cliente
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

        {/* Mode Selector Tabs */}
        <div className="flex border-b border-zinc-800 bg-[#0B0B0F] p-2 gap-2">
          <button
            type="button"
            onClick={() => setMode('AI')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              mode === 'AI'
                ? 'bg-[#D4AF37]/15 text-[#E5C158] border border-[#D4AF37]/40 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
            }`}
          >
            <Sparkles className="w-4 h-4 text-[#D4AF37]" />
            <span>Generar Propuesta con IA Pixel 12 (Recomendado)</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('MANUAL')}
            className={`py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              mode === 'MANUAL'
                ? 'bg-zinc-800 text-white border border-zinc-700'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Creación Manual</span>
          </button>
        </div>

        {/* Form Body */}
        <form
          onSubmit={mode === 'AI' ? handleGenerateAI : handleCreateManual}
          className="overflow-y-auto flex-1 p-5 sm:p-6 space-y-6"
        >
          {/* Section 1: Client Information */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-4 h-4" />
              1. Datos del Cliente o Empresa
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-zinc-400 block mb-1">
                  Empresa / Negocio <span className="text-[#D4AF37]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: OdontoPlus Dental Clinic"
                  value={clientCompany}
                  onChange={(e) => setClientCompany(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-1">Nombre del Contacto / Decisor</label>
                <input
                  type="text"
                  placeholder="Ej: Dra. Andrea Morales (Directora)"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  placeholder="gerencia@odontoplus.com"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-1">Teléfono / WhatsApp</label>
                <input
                  type="text"
                  placeholder="+593 99 876 5432"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-1">Ciudad y País</label>
                <input
                  type="text"
                  placeholder="Guayaquil, Ecuador"
                  value={clientCityCountry}
                  onChange={(e) => setClientCityCountry(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-1">Sector o Rubro</label>
                <input
                  type="text"
                  placeholder="Ej: Salud, Bienes Raíces, Retail, Gastronomía"
                  value={clientSector}
                  onChange={(e) => setClientSector(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Plan Selection */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4" />
              2. Selecciona un Plan Pixel 12 Base
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {plans.map((plan) => {
                const isSelected = selectedPlanId === plan.id;
                return (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedPlanId(isSelected ? '' : plan.id)}
                    className={`cursor-pointer rounded-xl p-3.5 border transition-all relative ${
                      isSelected
                        ? 'bg-[#D4AF37]/10 border-[#D4AF37] shadow-md shadow-[#D4AF37]/10'
                        : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="font-bold text-xs text-white flex items-center gap-1.5">
                        {plan.name}
                        {plan.isPopular && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#D4AF37]/20 text-[#E5C158] font-semibold">
                            POPULAR
                          </span>
                        )}
                      </span>
                      <div className="text-right">
                        <span className="text-xs font-mono font-bold text-[#D4AF37]">${plan.price}</span>
                        <span className="text-[10px] text-zinc-500 block">{plan.period}</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed mb-2">
                      {plan.description}
                    </p>

                    <div className="flex flex-wrap gap-1">
                      {plan.services.slice(0, 3).map((s, idx) => (
                        <span key={idx} className="text-[9px] bg-zinc-800/80 text-zinc-400 px-1.5 py-0.5 rounded">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 3: Add-on Custom Services */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
              <Briefcase className="w-4 h-4 text-zinc-400" />
              3. Servicios Adicionales Personalizados (Opcional)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {customServices.map((service) => {
                const isSelected = selectedServiceIds.includes(service.id);
                return (
                  <div
                    key={service.id}
                    onClick={() => toggleService(service.id)}
                    className={`cursor-pointer rounded-xl p-2.5 border transition-all flex items-center justify-between gap-2 ${
                      isSelected
                        ? 'bg-[#D4AF37]/10 border-[#D4AF37]/60'
                        : 'bg-zinc-900/40 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                          isSelected ? 'bg-[#D4AF37] border-[#D4AF37]' : 'border-zinc-700'
                        }`}
                      >
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-black" />}
                      </div>
                      <div>
                        <p className="text-xs font-medium text-white">{service.name}</p>
                        <span className="text-[10px] text-zinc-500">{service.category}</span>
                      </div>
                    </div>

                    <span className="text-xs font-mono font-semibold text-zinc-300">
                      +${service.basePrice}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 4: AI Directives (Visible in AI mode) */}
          {mode === 'AI' && (
            <div className="space-y-3 bg-[#121217] p-4 rounded-xl border border-zinc-800">
              <h3 className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                4. Contexto & Necesidades para la IA
              </h3>

              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">
                  Problemas o metas principales del cliente:
                </label>
                <textarea
                  rows={2}
                  placeholder="Ej: No tienen tiempo para redes, quieren captar pacientes de implantes dentales y renovar su imagen a algo más premium."
                  value={customNeeds}
                  onChange={(e) => setCustomNeeds(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37] resize-none"
                />
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">
                  Instrucción o tono especial (Opcional):
                </label>
                <input
                  type="text"
                  placeholder="Ej: Tono persuasivo de alta confianza, destacar garantía de entrega y soporte."
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
            </div>
          )}

          {/* Footer Submit Button */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-zinc-400 hover:text-white rounded-xl bg-zinc-800 transition-colors"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 text-xs font-bold text-black rounded-xl p12-gold-gradient shadow-lg hover:brightness-110 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                  <span>Generando Propuesta Comercial Pixel 12...</span>
                </>
              ) : mode === 'AI' ? (
                <>
                  <Sparkles className="w-4 h-4 text-black" />
                  <span>Generar Propuesta con IA</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-black" />
                  <span>Crear Cotización</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
