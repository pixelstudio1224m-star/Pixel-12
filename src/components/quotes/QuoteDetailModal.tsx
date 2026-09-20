import React, { useState } from 'react';
import { QuoteProposal, QuoteItem, QuoteStatus, RoadmapPhase } from '../../types';
import { useWorkspace } from '../../context/WorkspaceContext';
import {
  X,
  Printer,
  Copy,
  Check,
  Edit3,
  Eye,
  Calendar,
  Building2,
  Phone,
  Mail,
  MapPin,
  FileCheck,
  ShieldCheck,
  Sparkles,
  Plus,
  Trash2,
  ChevronDown,
  Layers,
  ArrowRight,
  CreditCard,
  Briefcase,
  Award
} from 'lucide-react';

interface QuoteDetailModalProps {
  quote: QuoteProposal;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedQuote: QuoteProposal) => void;
  initialEditMode?: boolean;
}

export const QuoteDetailModal: React.FC<QuoteDetailModalProps> = ({
  quote,
  isOpen,
  onClose,
  onUpdate,
  initialEditMode = false
}) => {
  const { addToast, data } = useWorkspace();
  const [isEditing, setIsEditing] = useState(initialEditMode);
  const [editedQuote, setEditedQuote] = useState<QuoteProposal>(quote);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  // Handle printing
  const handlePrint = () => {
    window.print();
  };

  // Copy proposal summary to clipboard
  const handleCopySummary = () => {
    const summaryText = `*PROPUESTA COMERCIAL PIXEL 12*
Folio: ${quote.folio}
Cliente: ${quote.client.company} (${quote.client.name})
Total Inversión: $${quote.total} ${quote.currency}
Validez: Hasta el ${quote.validUntil}

*Servicios Incluidos:*
${(quote.items || []).map((i) => `• ${i.name} ($${i.total})`).join('\n')}

*Condiciones de Pago:*
${quote.paymentTerms}

Para revisar el documento completo, contáctanos en Pixel 12.`;

    navigator.clipboard.writeText(summaryText);
    setCopiedLink(true);
    addToast('Resumen de propuesta copiado al portapapeles', 'success');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Recalculate financial totals when editing
  const recalculateTotals = (
    items: QuoteItem[],
    discountPercent: number,
    taxPercent: number
  ) => {
    const subtotal = items.reduce((sum, item) => sum + (Number(item.total) || 0), 0);
    const discountAmount = Number(((subtotal * (discountPercent || 0)) / 100).toFixed(2));
    const taxableBase = subtotal - discountAmount;
    const taxAmount = Number(((taxableBase * (taxPercent || 0)) / 100).toFixed(2));
    const total = Number((taxableBase + taxAmount).toFixed(2));

    return { subtotal, discountAmount, taxAmount, total };
  };

  const handleItemChange = (index: number, field: keyof QuoteItem, val: any) => {
    const newItems = [...(editedQuote.items || [])];
    const currentItem = { ...newItems[index], [field]: val };

    if (field === 'quantity' || field === 'unitPrice') {
      const q = Number(field === 'quantity' ? val : currentItem.quantity) || 1;
      const p = Number(field === 'unitPrice' ? val : currentItem.unitPrice) || 0;
      currentItem.total = Number((q * p).toFixed(2));
    }

    newItems[index] = currentItem;
    const { subtotal, discountAmount, taxAmount, total } = recalculateTotals(
      newItems,
      editedQuote.discountPercent,
      editedQuote.taxPercent
    );

    setEditedQuote({
      ...editedQuote,
      items: newItems,
      subtotal,
      discountAmount,
      taxAmount,
      total
    });
  };

  const handleAddItem = () => {
    const newItem: QuoteItem = {
      id: `item_${Date.now()}`,
      type: 'SERVICE',
      name: 'Nuevo Servicio Personalizado',
      description: 'Descripción detallada del servicio o entregables',
      quantity: 1,
      unitPrice: 150,
      total: 150,
      deliverables: ['Entregable 1', 'Entregable 2']
    };

    const newItems = [...editedQuote.items, newItem];
    const { subtotal, discountAmount, taxAmount, total } = recalculateTotals(
      newItems,
      editedQuote.discountPercent,
      editedQuote.taxPercent
    );

    setEditedQuote({
      ...editedQuote,
      items: newItems,
      subtotal,
      discountAmount,
      taxAmount,
      total
    });
  };

  const handleRemoveItem = (index: number) => {
    const newItems = editedQuote.items.filter((_, i) => i !== index);
    const { subtotal, discountAmount, taxAmount, total } = recalculateTotals(
      newItems,
      editedQuote.discountPercent,
      editedQuote.taxPercent
    );

    setEditedQuote({
      ...editedQuote,
      items: newItems,
      subtotal,
      discountAmount,
      taxAmount,
      total
    });
  };

  const handleSaveEdits = () => {
    onUpdate(editedQuote);
    setIsEditing(false);
    addToast('Propuesta comercial actualizada con éxito', 'success');
  };

  const agencySettings = data.commercialSettings;

  return (
    <div
      id="quote-detail-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto print:p-0 print:bg-white print:static print:inset-auto"
    >
      {/* Modal Container */}
      <div className="relative w-full max-w-5xl my-auto bg-[#0E0E12] border border-zinc-800 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden print:border-none print:shadow-none print:max-h-none print:w-full print:bg-white print:text-black">
        {/* Top Control Bar (Hidden on Print) */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between gap-4 bg-[#121217] flex-wrap print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg p12-gold-gradient flex items-center justify-center font-black text-black text-xs font-mono">
              P12
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold text-[#D4AF37]">{quote.folio}</span>
                <span className="text-xs text-zinc-400">|</span>
                <span className="text-xs font-semibold text-zinc-200 truncate max-w-xs">{quote.client.company}</span>
              </div>
              <span className="text-[11px] text-zinc-400">Propuesta Comercial Oficial Pixel 12</span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Status selector */}
            <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-700/80 rounded-lg px-2.5 py-1">
              <span className="text-[11px] text-zinc-400">Estado:</span>
              <select
                value={isEditing ? editedQuote.status : quote.status}
                onChange={(e) => {
                  const newStatus = e.target.value as QuoteStatus;
                  if (isEditing) {
                    setEditedQuote({ ...editedQuote, status: newStatus });
                  } else {
                    onUpdate({ ...quote, status: newStatus });
                    addToast(`Estado actualizado a ${newStatus}`, 'info');
                  }
                }}
                className="bg-transparent text-xs font-semibold text-[#E5C158] focus:outline-none cursor-pointer"
              >
                <option value="DRAFT" className="bg-zinc-900 text-zinc-300">Borrador</option>
                <option value="SENT" className="bg-zinc-900 text-blue-400">Enviada</option>
                <option value="ACCEPTED" className="bg-zinc-900 text-[#D4AF37]">Aprobada</option>
                <option value="REJECTED" className="bg-zinc-900 text-red-400">Rechazada</option>
                <option value="EXPIRED" className="bg-zinc-900 text-amber-400">Vencida</option>
              </select>
            </div>

            {/* Toggle Edit Mode */}
            <button
              onClick={() => {
                if (isEditing) {
                  handleSaveEdits();
                } else {
                  setIsEditing(true);
                  setEditedQuote(quote);
                }
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                isEditing
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  : 'bg-zinc-800 hover:bg-zinc-750 text-zinc-200 border border-zinc-700'
              }`}
            >
              {isEditing ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Guardar Cambios</span>
                </>
              ) : (
                <>
                  <Edit3 className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Editar Propuesta</span>
                </>
              )}
            </button>

            {/* Copy Summary */}
            <button
              onClick={handleCopySummary}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-750 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 border border-zinc-700 transition-colors"
              title="Copiar resumen para WhatsApp o correo"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Copiado' : 'Copiar'}</span>
            </button>

            {/* Print / PDF button */}
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg p12-gold-gradient text-black text-xs font-bold flex items-center gap-1.5 shadow-md hover:brightness-110 transition-all"
              title="Imprimir o guardar como PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Descargar PDF</span>
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto flex-1 p-6 md:p-10 space-y-8 bg-[#09090B] print:p-4 print:bg-white print:text-black">
          {/* ===================== VIEW MODE (PROPOSAL DOCUMENT) ===================== */}
          {!isEditing ? (
            <div id="printable-proposal" className="space-y-8 max-w-4xl mx-auto">
              {/* Proposal Header */}
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-6 border-b border-zinc-800 print:border-zinc-300">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl p12-gold-gradient flex items-center justify-center font-black text-black text-lg tracking-tight shadow-lg shadow-[#D4AF37]/20 print:shadow-none">
                      P12
                    </div>
                    <div>
                      <h1 className="text-xl md:text-2xl font-black text-white print:text-black tracking-tight flex items-center gap-2">
                        PIXEL 12
                        <span className="text-xs font-normal text-[#D4AF37] px-2 py-0.5 rounded bg-[#D4AF37]/10 border border-[#D4AF37]/30 print:border-zinc-400">
                          AGENCIA DE MARKETING & CONTENIDO
                        </span>
                      </h1>
                      <p className="text-xs text-zinc-400 print:text-zinc-600">
                        Estrategia Digital • Redes Sociales • Creación de Contenido • Asistencia Virtual
                      </p>
                    </div>
                  </div>
                  <div className="pt-2">
                    <p className="text-lg font-bold text-white print:text-black">{quote.title}</p>
                  </div>
                </div>

                {/* Folio and Meta Box */}
                <div className="bg-[#121217] border border-zinc-800 rounded-xl p-4 text-right print:bg-zinc-50 print:border-zinc-300 min-w-[240px]">
                  <span className="text-[10px] uppercase font-bold text-[#D4AF37] tracking-wider block">
                    Cotización Comercial
                  </span>
                  <p className="text-lg font-black font-mono text-white print:text-black">{quote.folio}</p>
                  <div className="mt-2 text-xs text-zinc-400 print:text-zinc-600 space-y-0.5">
                    <p>
                      <span className="text-zinc-400 print:text-zinc-700">Emisión:</span> {quote.issueDate}
                    </p>
                    <p>
                      <span className="text-zinc-400 print:text-zinc-700">Válida hasta:</span>{' '}
                      <span className="text-zinc-200 font-semibold print:text-black">{quote.validUntil}</span>
                    </p>
                    <p>
                      <span className="text-zinc-400 print:text-zinc-700">Moneda:</span> {quote.currency}
                    </p>
                  </div>
                </div>
              </div>

              {/* Client & Agency Dual Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Prepared For (Client) */}
                <div className="bg-[#121217] border border-zinc-800 rounded-xl p-5 print:bg-zinc-50 print:border-zinc-300">
                  <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-wider block mb-2">
                    Propuesta preparada para:
                  </span>
                  <h3 className="text-base font-bold text-white print:text-black mb-1">
                    {quote.client.company}
                  </h3>
                  <div className="space-y-1 text-xs text-zinc-400 print:text-zinc-700">
                    <p className="flex items-center gap-2">
                      <span className="text-zinc-400">Atención:</span>
                      <span className="font-semibold text-zinc-200 print:text-black">{quote.client.name}</span>
                    </p>
                    {quote.client.taxId && (
                      <p className="flex items-center gap-2">
                        <span className="text-zinc-400">RUC / NIT:</span>
                        <span>{quote.client.taxId}</span>
                      </p>
                    )}
                    <p className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-zinc-400" />
                      <span>{quote.client.email}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-zinc-400" />
                      <span>{quote.client.phone}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                      <span>{quote.client.cityCountry}</span>
                    </p>
                  </div>
                </div>

                {/* Prepared By (Pixel 12) */}
                <div className="bg-[#121217] border border-zinc-800 rounded-xl p-5 print:bg-zinc-50 print:border-zinc-300">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-2">
                    Emitido por la agencia:
                  </span>
                  <h3 className="text-base font-bold text-white print:text-black mb-1">
                    PIXEL 12 MARKETING AGENCY
                  </h3>
                  <div className="space-y-1 text-xs text-zinc-400 print:text-zinc-700">
                    <p className="flex items-center gap-2">
                      <span className="text-zinc-400">RUC:</span>
                      <span>0992847192001</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-zinc-400" />
                      <span>contacto@pixel12.agency</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-zinc-400" />
                      <span>+593 98 421 9988</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Guayaquil, Ecuador (Atención Internacional)</span>
                    </p>
                    <p className="text-[11px] text-[#D4AF37]">
                      Consultor Asignado: Dirección Comercial Pixel 12
                    </p>
                  </div>
                </div>
              </div>

              {/* Executive Summary & Presentation */}
              <div className="bg-[#121217] border border-zinc-800/80 rounded-xl p-6 print:bg-zinc-50 print:border-zinc-300 space-y-4">
                <div>
                  <h2 className="text-sm font-bold text-[#D4AF37] uppercase tracking-wider flex items-center gap-2 mb-2">
                    <Award className="w-4 h-4" />
                    1. Resumen Ejecutivo & Enfoque Estratégico
                  </h2>
                  <p className="text-sm text-zinc-300 print:text-zinc-800 leading-relaxed">
                    {quote.executiveSummary}
                  </p>
                </div>

                {quote.presentationText && (
                  <div className="pt-3 border-t border-zinc-800/80 print:border-zinc-300">
                    <p className="text-xs text-zinc-400 print:text-zinc-700 leading-relaxed italic">
                      "{quote.presentationText}"
                    </p>
                  </div>
                )}
              </div>

              {/* Client Needs & Proposed Solution */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Needs */}
                <div className="bg-[#121217] border border-zinc-800 rounded-xl p-5 print:bg-zinc-50 print:border-zinc-300">
                  <h3 className="text-xs font-bold text-zinc-200 print:text-black uppercase tracking-wider mb-3 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                    Diagnóstico & Necesidades Detectadas
                  </h3>
                  <ul className="space-y-2 text-xs text-zinc-300 print:text-zinc-700">
                    {quote.clientNeeds && quote.clientNeeds.length > 0 ? (
                      quote.clientNeeds.map((need, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-[#D4AF37] font-bold">•</span>
                          <span>{need}</span>
                        </li>
                      ))
                    ) : (
                      <li>Fortalecimiento de posicionamiento de marca y generación de prospectos calificados.</li>
                    )}
                  </ul>
                </div>

                {/* Solution */}
                <div className="bg-[#121217] border border-zinc-800 rounded-xl p-5 print:bg-zinc-50 print:border-zinc-300">
                  <h3 className="text-xs font-bold text-zinc-200 print:text-black uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                    Solución Integral Propuesta por Pixel 12
                  </h3>
                  <p className="text-xs text-zinc-300 print:text-zinc-700 leading-relaxed">
                    {quote.proposedSolution ||
                      'Implementación de sistema ágil multicanal que combina dirección de arte, redacción persuasiva y optimización continua de pauta publicitaria.'}
                  </p>
                </div>
              </div>

              {/* Table of Services / Plan */}
              <div className="bg-[#121217] border border-zinc-800 rounded-xl overflow-hidden print:bg-zinc-50 print:border-zinc-300">
                <div className="p-4 bg-zinc-900/80 border-b border-zinc-800 print:bg-zinc-100 print:border-zinc-300 flex items-center justify-between">
                  <h2 className="text-sm font-bold text-[#D4AF37] uppercase tracking-wider flex items-center gap-2">
                    <Layers className="w-4 h-4" />
                    2. Desglose de Servicios & Plan de Inversión
                  </h2>
                  <span className="text-xs text-zinc-400 font-mono">Moneda: {quote.currency}</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-zinc-800 bg-zinc-900/40 text-zinc-400 uppercase font-mono text-[10px] print:border-zinc-300 print:text-zinc-600">
                        <th className="p-3">Servicio / Entregables</th>
                        <th className="p-3 text-center w-16">Cant.</th>
                        <th className="p-3 text-right w-28">Precio Unit.</th>
                        <th className="p-3 text-right w-28">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60 print:divide-zinc-200">
                      {(quote.items || []).map((item, idx) => (
                        <tr key={idx} className="hover:bg-zinc-900/30">
                          <td className="p-3">
                            <div className="font-bold text-white print:text-black flex items-center gap-2">
                              {item.name}
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 print:bg-zinc-200 print:text-zinc-700">
                                {item.type === 'PLAN' ? 'Plan Mensual' : 'Servicio'}
                              </span>
                            </div>
                            {item.description && (
                              <p className="text-[11px] text-zinc-400 print:text-zinc-600 mt-0.5 leading-relaxed">
                                {item.description}
                              </p>
                            )}
                            {item.deliverables && item.deliverables.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1.5">
                                {item.deliverables.map((del, dIdx) => (
                                  <span
                                    key={dIdx}
                                    className="text-[10px] bg-[#D4AF37]/10 text-[#E5C158] border border-[#D4AF37]/20 px-2 py-0.5 rounded print:bg-zinc-100 print:text-zinc-800 print:border-zinc-300"
                                  >
                                    ✓ {del}
                                  </span>
                                ))}
                              </div>
                            )}
                          </td>
                          <td className="p-3 text-center font-mono text-zinc-300 print:text-black">
                            {item.quantity}
                          </td>
                          <td className="p-3 text-right font-mono text-zinc-300 print:text-black">
                            ${item.unitPrice.toFixed(2)}
                          </td>
                          <td className="p-3 text-right font-mono font-bold text-white print:text-black">
                            ${item.total.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Subtotal, Taxes, Discounts & Total */}
                <div className="p-4 bg-zinc-900/50 border-t border-zinc-800 print:bg-zinc-100 print:border-zinc-300 flex flex-col items-end">
                  <div className="w-full max-w-xs space-y-1.5 text-xs">
                    <div className="flex justify-between text-zinc-400 print:text-zinc-600">
                      <span>Subtotal:</span>
                      <span className="font-mono font-medium text-zinc-200 print:text-black">
                        ${quote.subtotal.toFixed(2)}
                      </span>
                    </div>

                    {quote.discountPercent > 0 && (
                      <div className="flex justify-between text-emerald-400 print:text-emerald-700">
                        <span>Descuento ({quote.discountPercent}%):</span>
                        <span className="font-mono font-medium">-${quote.discountAmount.toFixed(2)}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-zinc-400 print:text-zinc-600">
                      <span>IVA ({quote.taxPercent}%):</span>
                      <span className="font-mono font-medium text-zinc-200 print:text-black">
                        ${quote.taxAmount.toFixed(2)}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-zinc-800 print:border-zinc-300 flex justify-between items-baseline">
                      <span className="text-sm font-bold text-white print:text-black">Total Inversión:</span>
                      <span className="text-xl font-black font-mono text-[#D4AF37] print:text-black">
                        ${quote.total.toFixed(2)} <span className="text-xs text-zinc-400">{quote.currency}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Implementation Roadmap */}
              {quote.roadmap && quote.roadmap.length > 0 && (
                <div className="bg-[#121217] border border-zinc-800 rounded-xl p-5 print:bg-zinc-50 print:border-zinc-300">
                  <h2 className="text-sm font-bold text-[#D4AF37] uppercase tracking-wider flex items-center gap-2 mb-4">
                    <Calendar className="w-4 h-4" />
                    3. Cronograma de Trabajo & Fases de Implementación
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {quote.roadmap.map((phase, pIdx) => (
                      <div
                        key={pIdx}
                        className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-4 print:bg-white print:border-zinc-300 relative"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-bold text-[#D4AF37] px-2 py-0.5 rounded bg-[#D4AF37]/10 font-mono">
                            {phase.duration}
                          </span>
                          <span className="text-xs font-black text-zinc-400">0{pIdx + 1}</span>
                        </div>
                        <h4 className="text-xs font-bold text-white print:text-black mb-1">
                          {phase.phase}
                        </h4>
                        <p className="text-[11px] text-zinc-400 print:text-zinc-600 leading-relaxed mb-3">
                          {phase.description}
                        </p>
                        {phase.deliverables && (
                          <div className="space-y-1 border-t border-zinc-800/80 print:border-zinc-200 pt-2">
                            {phase.deliverables.map((item, dIdx) => (
                              <p key={dIdx} className="text-[10px] text-zinc-300 print:text-zinc-700 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
                                <span>{item}</span>
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Visual Assets & Mockups of the Proposal */}
              {quote.visuals && quote.visuals.length > 0 && (
                <div className="bg-[#121217] border border-zinc-800 rounded-xl p-5 print:bg-zinc-50 print:border-zinc-300">
                  <h2 className="text-sm font-bold text-[#D4AF37] uppercase tracking-wider flex items-center gap-2 mb-4">
                    <Sparkles className="w-4 h-4" />
                    4. Dirección Visual & Estilo de Contenido
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {quote.visuals.map((vis, vIdx) => (
                      <div
                        key={vIdx}
                        className="rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900 group print:border-zinc-300"
                      >
                        <div className="h-36 overflow-hidden relative">
                          <img
                            src={vis.imageUrl}
                            alt={vis.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            referrerPolicy="no-referrer"
                          />
                          <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 text-[10px] text-[#E5C158] font-semibold backdrop-blur-xs">
                            {vis.type === 'cover' ? 'Portada' : vis.type === 'mockup' ? 'Mockup' : 'Servicio'}
                          </span>
                        </div>
                        <div className="p-3">
                          <h4 className="text-xs font-bold text-zinc-100 print:text-black line-clamp-1">
                            {vis.title}
                          </h4>
                          {vis.concept && (
                            <p className="text-[11px] text-zinc-400 print:text-zinc-600 mt-1 line-clamp-2 leading-relaxed">
                              {vis.concept}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Commercial Conditions & Bank Accounts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#121217] border border-zinc-800 rounded-xl p-5 print:bg-zinc-50 print:border-zinc-300">
                  <h3 className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider mb-2 flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    Condiciones Comerciales & Forma de Pago
                  </h3>
                  <p className="text-xs text-zinc-300 print:text-zinc-700 leading-relaxed mb-3">
                    {quote.paymentTerms}
                  </p>
                  <p className="text-[11px] text-zinc-400 print:text-zinc-600 leading-relaxed">
                    {quote.termsAndConditions}
                  </p>
                </div>

                <div className="bg-[#121217] border border-zinc-800 rounded-xl p-5 print:bg-zinc-50 print:border-zinc-300">
                  <h3 className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Datos para Transferencia Bancaria
                  </h3>
                  <div className="p-3 bg-zinc-900 rounded-lg border border-zinc-800 text-xs text-zinc-300 print:bg-white print:border-zinc-300 font-mono whitespace-pre-line leading-relaxed">
                    {quote.paymentMethods}
                  </div>
                  {quote.notes && (
                    <p className="text-[11px] text-zinc-400 print:text-zinc-600 mt-2 italic">
                      Nota: {quote.notes}
                    </p>
                  )}
                </div>
              </div>

              {/* Signatures & Acceptance Block */}
              <div className="pt-8 border-t border-zinc-800 print:border-zinc-300">
                <div className="grid grid-cols-2 gap-12 text-center text-xs">
                  <div>
                    <div className="border-b border-zinc-700 print:border-zinc-400 h-16 flex items-end justify-center pb-2">
                      <span className="font-serif italic text-zinc-400 print:text-black">Pixel 12 Agency</span>
                    </div>
                    <p className="font-bold text-white print:text-black mt-2">DIRECCIÓN COMERCIAL</p>
                    <p className="text-[11px] text-zinc-400 print:text-zinc-600">Pixel 12 Agency</p>
                  </div>

                  <div>
                    <div className="border-b border-zinc-700 print:border-zinc-400 h-16 flex items-end justify-center pb-2">
                      <span className="text-[10px] text-zinc-400">Firma de Aprobación & Aceptación</span>
                    </div>
                    <p className="font-bold text-white print:text-black mt-2">
                      {quote.client.name.toUpperCase()}
                    </p>
                    <p className="text-[11px] text-zinc-400 print:text-zinc-600">{quote.client.company}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* ===================== EDIT MODE (FULL MANUAL CONTROL) ===================== */
            <div className="space-y-6 max-w-4xl mx-auto">
              <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Edit3 className="w-5 h-5 text-[#D4AF37]" />
                    Editor de Cotización Comercial
                  </h2>
                  <p className="text-xs text-zinc-400">
                    Modifica cualquier parámetro, textos persuasivos, servicios o valores de la propuesta.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-3 py-1.5 text-xs text-zinc-400 hover:text-white rounded-lg bg-zinc-800"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSaveEdits}
                    className="px-4 py-1.5 text-xs font-bold text-black rounded-lg p12-gold-gradient shadow-md"
                  >
                    Guardar y Previsualizar
                  </button>
                </div>
              </div>

              {/* Title & Dates */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#121217] p-4 rounded-xl border border-zinc-800">
                <div className="md:col-span-2">
                  <label className="text-xs text-zinc-400 block mb-1">Título de la Propuesta</label>
                  <input
                    type="text"
                    value={editedQuote.title}
                    onChange={(e) => setEditedQuote({ ...editedQuote, title: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Fecha de Validez</label>
                  <input
                    type="date"
                    value={editedQuote.validUntil}
                    onChange={(e) => setEditedQuote({ ...editedQuote, validUntil: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              {/* Client Info Section */}
              <div className="bg-[#121217] p-4 rounded-xl border border-zinc-800 space-y-3">
                <h3 className="text-xs font-bold text-[#D4AF37] uppercase">Datos del Cliente</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] text-zinc-400 block mb-1">Empresa</label>
                    <input
                      type="text"
                      value={editedQuote.client.company}
                      onChange={(e) =>
                        setEditedQuote({
                          ...editedQuote,
                          client: { ...editedQuote.client, company: e.target.value }
                        })
                      }
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-zinc-400 block mb-1">Contacto Principal</label>
                    <input
                      type="text"
                      value={editedQuote.client.name}
                      onChange={(e) =>
                        setEditedQuote({
                          ...editedQuote,
                          client: { ...editedQuote.client, name: e.target.value }
                        })
                      }
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-zinc-400 block mb-1">Email</label>
                    <input
                      type="email"
                      value={editedQuote.client.email}
                      onChange={(e) =>
                        setEditedQuote({
                          ...editedQuote,
                          client: { ...editedQuote.client, email: e.target.value }
                        })
                      }
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-zinc-400 block mb-1">Teléfono / WhatsApp</label>
                    <input
                      type="text"
                      value={editedQuote.client.phone}
                      onChange={(e) =>
                        setEditedQuote({
                          ...editedQuote,
                          client: { ...editedQuote.client, phone: e.target.value }
                        })
                      }
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-zinc-400 block mb-1">Ciudad / País</label>
                    <input
                      type="text"
                      value={editedQuote.client.cityCountry}
                      onChange={(e) =>
                        setEditedQuote({
                          ...editedQuote,
                          client: { ...editedQuote.client, cityCountry: e.target.value }
                        })
                      }
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-zinc-400 block mb-1">RUC / Identificación Fiscal</label>
                    <input
                      type="text"
                      value={editedQuote.client.taxId || ''}
                      onChange={(e) =>
                        setEditedQuote({
                          ...editedQuote,
                          client: { ...editedQuote.client, taxId: e.target.value }
                        })
                      }
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Items & Services Table Editor */}
              <div className="bg-[#121217] p-4 rounded-xl border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-[#D4AF37] uppercase">Ítems & Servicios de la Cotización</h3>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="px-2.5 py-1 rounded-lg bg-[#D4AF37]/15 hover:bg-[#D4AF37]/25 text-[#E5C158] text-xs font-semibold flex items-center gap-1 border border-[#D4AF37]/30"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Agregar Ítem</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {(editedQuote.items || []).map((item, idx) => (
                    <div
                      key={item.id || idx}
                      className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 space-y-2 relative"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
                        <div className="md:col-span-5">
                          <input
                            type="text"
                            placeholder="Nombre del servicio o plan"
                            value={item.name}
                            onChange={(e) => handleItemChange(idx, 'name', e.target.value)}
                            className="w-full bg-zinc-850 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-semibold"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <select
                            value={item.type}
                            onChange={(e) => handleItemChange(idx, 'type', e.target.value)}
                            className="w-full bg-zinc-850 border border-zinc-700 rounded-lg px-2 py-1.5 text-xs text-zinc-300"
                          >
                            <option value="PLAN">Plan</option>
                            <option value="SERVICE">Servicio</option>
                          </select>
                        </div>
                        <div className="md:col-span-2">
                          <input
                            type="number"
                            min="1"
                            placeholder="Cant."
                            value={item.quantity}
                            onChange={(e) => handleItemChange(idx, 'quantity', Number(e.target.value))}
                            className="w-full bg-zinc-850 border border-zinc-700 rounded-lg px-2 py-1.5 text-xs text-white font-mono text-center"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <div className="relative">
                            <span className="absolute left-2 top-1.5 text-zinc-400 text-xs">$</span>
                            <input
                              type="number"
                              min="0"
                              placeholder="Precio"
                              value={item.unitPrice}
                              onChange={(e) => handleItemChange(idx, 'unitPrice', Number(e.target.value))}
                              className="w-full bg-zinc-850 border border-zinc-700 rounded-lg pl-5 pr-2 py-1.5 text-xs text-white font-mono text-right"
                            />
                          </div>
                        </div>
                        <div className="md:col-span-1 flex justify-end">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="p-1.5 text-zinc-500 hover:text-red-400 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div>
                        <textarea
                          placeholder="Descripción del servicio y alcance..."
                          rows={2}
                          value={item.description}
                          onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                          className="w-full bg-zinc-850 border border-zinc-700 rounded-lg px-2.5 py-1 text-xs text-zinc-300 resize-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Tax, Discount & Total controls */}
                <div className="pt-3 border-t border-zinc-800 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[11px] text-zinc-400 block mb-1">Descuento (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={editedQuote.discountPercent}
                      onChange={(e) => {
                        const dp = Number(e.target.value);
                        const { subtotal, discountAmount, taxAmount, total } = recalculateTotals(
                          editedQuote.items,
                          dp,
                          editedQuote.taxPercent
                        );
                        setEditedQuote({
                          ...editedQuote,
                          discountPercent: dp,
                          subtotal,
                          discountAmount,
                          taxAmount,
                          total
                        });
                      }}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-zinc-400 block mb-1">IVA / Impuesto (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={editedQuote.taxPercent}
                      onChange={(e) => {
                        const tp = Number(e.target.value);
                        const { subtotal, discountAmount, taxAmount, total } = recalculateTotals(
                          editedQuote.items,
                          editedQuote.discountPercent,
                          tp
                        );
                        setEditedQuote({
                          ...editedQuote,
                          taxPercent: tp,
                          subtotal,
                          discountAmount,
                          taxAmount,
                          total
                        });
                      }}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                    />
                  </div>

                  <div className="flex flex-col justify-end text-right">
                    <span className="text-xs text-zinc-400">Total Calculado:</span>
                    <span className="text-xl font-bold font-mono text-[#D4AF37]">
                      ${editedQuote.total.toFixed(2)} {editedQuote.currency}
                    </span>
                  </div>
                </div>
              </div>

              {/* Narrative Content Editor */}
              <div className="bg-[#121217] p-4 rounded-xl border border-zinc-800 space-y-3">
                <h3 className="text-xs font-bold text-[#D4AF37] uppercase">Textos Persuasivos de la Propuesta</h3>
                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">Resumen Ejecutivo</label>
                  <textarea
                    rows={3}
                    value={editedQuote.executiveSummary}
                    onChange={(e) => setEditedQuote({ ...editedQuote, executiveSummary: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-xs text-zinc-200"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">Solución Propuesta</label>
                  <textarea
                    rows={3}
                    value={editedQuote.proposedSolution}
                    onChange={(e) => setEditedQuote({ ...editedQuote, proposedSolution: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-xs text-zinc-200"
                  />
                </div>
              </div>

              {/* Payment Terms & Bank Info */}
              <div className="bg-[#121217] p-4 rounded-xl border border-zinc-800 space-y-3">
                <h3 className="text-xs font-bold text-[#D4AF37] uppercase">Condiciones & Cuentas Bancarias</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-zinc-400 block mb-1">Condiciones de Pago</label>
                    <textarea
                      rows={2}
                      value={editedQuote.paymentTerms}
                      onChange={(e) => setEditedQuote({ ...editedQuote, paymentTerms: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-xs text-zinc-200"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-zinc-400 block mb-1">Datos Bancarios para Transferencias</label>
                    <textarea
                      rows={2}
                      value={editedQuote.paymentMethods}
                      onChange={(e) => setEditedQuote({ ...editedQuote, paymentMethods: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-xs text-zinc-200 font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
