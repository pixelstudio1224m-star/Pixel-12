import React, { useState, useEffect } from 'react';
import {
  X,
  DollarSign,
  Calendar,
  Building2,
  User,
  Tag,
  AlertCircle,
  FileText,
  CheckCircle2,
  Sparkles,
  Layers
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { CrmDeal } from '../../types';

interface DealModalProps {
  deal: CrmDeal | null;
  initialStageId?: string;
  initialPipelineId?: string;
  initialContactId?: string;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (saved: CrmDeal) => void;
}

export const DealModal: React.FC<DealModalProps> = ({
  deal,
  initialStageId,
  initialPipelineId,
  initialContactId,
  isOpen,
  onClose,
  onSave
}) => {
  const {
    crmPipelines,
    crmContacts,
    crmCompanies,
    quotes,
    saveDeal,
    showToast,
    data
  } = useWorkspace();

  const [title, setTitle] = useState('');
  const [pipelineId, setPipelineId] = useState('');
  const [stageId, setStageId] = useState('');
  const [contactId, setContactId] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [value, setValue] = useState<number>(0);
  const [currency, setCurrency] = useState('USD');
  const [probability, setProbability] = useState<number>(50);
  const [expectedCloseDate, setExpectedCloseDate] = useState('');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('MEDIUM');
  const [tagsInput, setTagsInput] = useState('');
  const [notes, setNotes] = useState('');
  const [associatedQuoteId, setAssociatedQuoteId] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (deal) {
      setTitle(deal.title || '');
      setPipelineId(deal.pipelineId || (crmPipelines[0]?.id ?? ''));
      setStageId(deal.stageId || '');
      setContactId(deal.contactId || '');
      setCompanyId(deal.companyId || '');
      setValue(deal.value || 0);
      setCurrency(deal.currency || 'USD');
      setProbability(deal.probability ?? 50);
      setExpectedCloseDate(deal.expectedCloseDate ? deal.expectedCloseDate.substring(0, 10) : '');
      setPriority(deal.priority || 'MEDIUM');
      setTagsInput(deal.tags ? deal.tags.join(', ') : '');
      setNotes(deal.notes || '');
      setAssociatedQuoteId(deal.associatedQuoteId || '');
    } else {
      const defaultPipeline = crmPipelines.find((p) => p.id === initialPipelineId) || crmPipelines[0];
      const defaultStage = initialStageId || defaultPipeline?.stages[0]?.id || 'LEAD';
      setTitle('');
      setPipelineId(defaultPipeline?.id || 'pipeline_sales_p12');
      setStageId(defaultStage);
      setContactId(initialContactId || '');
      setCompanyId('');
      setValue(3500);
      setCurrency('USD');
      setProbability(40);
      const inTwoWeeks = new Date(Date.now() + 14 * 86400000).toISOString().substring(0, 10);
      setExpectedCloseDate(inTwoWeeks);
      setPriority('HIGH');
      setTagsInput('Marketing, Plan Mensual');
      setNotes('');
      setAssociatedQuoteId('');
    }
  }, [deal, initialStageId, initialPipelineId, initialContactId, crmPipelines, isOpen]);

  // When pipeline changes, adapt stage
  const currentPipeline = (crmPipelines || []).find((p) => p.id === pipelineId) || (crmPipelines || [])[0];

  useEffect(() => {
    if (currentPipeline?.stages && currentPipeline.stages.length > 0) {
      if (!currentPipeline.stages.some((s) => s.id === stageId)) {
        setStageId(currentPipeline.stages[0].id);
      }
    }
  }, [pipelineId, currentPipeline, stageId]);

  // When contact changes, auto-fill company if available
  const handleContactChange = (cId: string) => {
    setContactId(cId);
    const selected = crmContacts.find((c) => c.id === cId);
    if (selected?.companyId) {
      setCompanyId(selected.companyId);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSaving(true);
    try {
      const selectedContact = crmContacts.find((c) => c.id === contactId);
      const selectedCompany = crmCompanies.find((c) => c.id === companyId);

      const parsedTags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const newDeal: CrmDeal = {
        id: deal?.id || `deal_${Date.now()}`,
        title: title.trim(),
        pipelineId: pipelineId || currentPipeline?.id || 'pipeline_sales_p12',
        stageId: stageId || currentPipeline?.stages[0]?.id || 'LEAD',
        contactId: contactId || undefined,
        contactName: selectedContact?.fullName || undefined,
        companyId: companyId || undefined,
        companyName: selectedCompany?.name || undefined,
        value: Number(value) || 0,
        currency: currency || 'USD',
        probability: Number(probability) || 50,
        expectedCloseDate: expectedCloseDate ? new Date(expectedCloseDate).toISOString() : undefined,
        priority,
        tags: parsedTags,
        notes: notes.trim(),
        assignedToId: data?.currentMember?.id || 'mem_1',
        assignedToName: data?.currentMember?.name || 'Pixel 12 Specialist',
        associatedQuoteId: associatedQuoteId || undefined,
        createdAt: deal?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const saved = await saveDeal(newDeal);
      if (onSave) onSave(saved);
      onClose();
    } catch (err: any) {
      console.error('Error saving deal:', err);
      showToast(err?.message || 'Error al guardar la oportunidad en el CRM', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="bg-[#12121A] border border-[#2A2A3C] w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#222232] flex items-center justify-between bg-[#161622]/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#E5C158]">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide font-display">
                {deal ? 'Editar Oportunidad Comercial' : 'Nueva Oportunidad Comercial'}
              </h2>
              <p className="text-xs text-zinc-400">
                Registra y gestiona el progreso de venta en el pipeline de Pixel 12
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[78vh] overflow-y-auto">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
              Título del Negocio / Oportunidad *
            </label>
            <input
              type="text"
              required
              placeholder="Ej. Plan Growth Anual + Google Ads - InnovaTech"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#181824] border border-[#2D2D42] rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all"
            />
          </div>

          {/* Pipeline & Stage */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
                Pipeline de Venta
              </label>
              <select
                value={pipelineId}
                onChange={(e) => setPipelineId(e.target.value)}
                className="w-full bg-[#181824] border border-[#2D2D42] rounded-xl px-3 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-[#D4AF37]"
              >
                {crmPipelines.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
                Etapa del Pipeline *
              </label>
              <select
                value={stageId}
                onChange={(e) => setStageId(e.target.value)}
                className="w-full bg-[#181824] border border-[#2D2D42] rounded-xl px-3 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-[#D4AF37]"
              >
                {currentPipeline?.stages.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.probability}%)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Contact & Company */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#D4AF37]" /> Contacto Principal
              </label>
              <select
                value={contactId}
                onChange={(e) => handleContactChange(e.target.value)}
                className="w-full bg-[#181824] border border-[#2D2D42] rounded-xl px-3 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-[#D4AF37]"
              >
                <option value="">-- Sin contacto asignado --</option>
                {crmContacts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.fullName} ({c.email || c.phone || 'Sin email'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-[#D4AF37]" /> Empresa / Cuenta
              </label>
              <select
                value={companyId}
                onChange={(e) => setCompanyId(e.target.value)}
                className="w-full bg-[#181824] border border-[#2D2D42] rounded-xl px-3 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-[#D4AF37]"
              >
                <option value="">-- Sin empresa asignada --</option>
                {crmCompanies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.industry ? `• ${c.industry}` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Value, Currency & Probability */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-[#D4AF37]" /> Valor Estimado
              </label>
              <input
                type="number"
                min="0"
                step="50"
                value={value}
                onChange={(e) => setValue(parseFloat(e.target.value) || 0)}
                className="w-full bg-[#181824] border border-[#2D2D42] rounded-xl px-4 py-2 text-sm text-white font-mono focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
                Moneda
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full bg-[#181824] border border-[#2D2D42] rounded-xl px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-[#D4AF37]"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="MXN">MXN ($)</option>
                <option value="COP">COP ($)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
                Probabilidad ({probability}%)
              </label>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={probability}
                onChange={(e) => setProbability(parseInt(e.target.value, 10))}
                className="w-full accent-[#D4AF37] cursor-pointer mt-2"
              />
            </div>
          </div>

          {/* Close Date & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" /> Cierre Estimado
              </label>
              <input
                type="date"
                value={expectedCloseDate}
                onChange={(e) => setExpectedCloseDate(e.target.value)}
                className="w-full bg-[#181824] border border-[#2D2D42] rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
                Prioridad
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const).map((p) => {
                  const isSelected = priority === p;
                  const labels = {
                    LOW: 'Baja',
                    MEDIUM: 'Media',
                    HIGH: 'Alta',
                    URGENT: 'Urgente'
                  };
                  const colors = {
                    LOW: 'border-zinc-700 text-zinc-400',
                    MEDIUM: 'border-blue-500/40 text-blue-400',
                    HIGH: 'border-[#D4AF37]/50 text-[#E5C158]',
                    URGENT: 'border-rose-500/50 text-rose-400 bg-rose-500/10'
                  };
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`text-xs py-2 rounded-lg border font-medium transition-all ${
                        isSelected
                          ? `bg-[#222234] ${colors[p]} font-bold shadow-sm`
                          : 'border-[#262638] text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      {labels[p]}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Link to Quote */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-[#D4AF37]" /> Vincular con Cotización Existente (Opcional)
            </label>
            <select
              value={associatedQuoteId}
              onChange={(e) => setAssociatedQuoteId(e.target.value)}
              className="w-full bg-[#181824] border border-[#2D2D42] rounded-xl px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-[#D4AF37]"
            >
              <option value="">-- Ninguna cotización vinculada --</option>
              {quotes.map((q) => (
                <option key={q.id} value={q.id}>
                  {q.number || q.id} - {q.client.name} ({q.currency} ${q.total.toLocaleString()})
                </option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-[#D4AF37]" /> Etiquetas (separadas por coma)
            </label>
            <input
              type="text"
              placeholder="Google Ads, Meta, SEO, Plan Premium"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full bg-[#181824] border border-[#2D2D42] rounded-xl px-4 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
              Notas y Requerimientos Clave
            </label>
            <textarea
              rows={3}
              placeholder="Detalles sobre las necesidades del cliente, fecha tentativa de firma o condiciones especiales..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-[#181824] border border-[#2D2D42] rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#D4AF37] resize-none"
            />
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-[#222232] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-[#2C2C3E] text-zinc-300 hover:text-white hover:bg-zinc-800/50 text-sm font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl p12-gold-gradient text-black font-semibold text-sm hover:brightness-110 shadow-lg shadow-[#D4AF37]/20 flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {isSaving ? (
                <>Guardando...</>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  {deal ? 'Actualizar Oportunidad' : 'Crear Oportunidad'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
