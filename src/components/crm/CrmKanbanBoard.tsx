import React, { useState } from 'react';
import {
  Plus,
  Layers,
  DollarSign,
  User,
  Building2,
  Calendar,
  Sparkles,
  CheckCircle2,
  XCircle,
  MoreVertical,
  ChevronRight,
  ChevronLeft,
  Tag,
  FileText,
  AlertCircle,
  TrendingUp,
  Settings,
  Trash2
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { CrmDeal, CrmPipeline, CrmStage } from '../../types';

interface CrmKanbanBoardProps {
  onOpenNewDeal: (stageId?: string, pipelineId?: string) => void;
  onEditDeal: (deal: CrmDeal) => void;
  onOpenContactDetail: (contactId: string) => void;
  onOpenPipelineSettings: () => void;
}

export const CrmKanbanBoard: React.FC<CrmKanbanBoardProps> = ({
  onOpenNewDeal,
  onEditDeal,
  onOpenContactDetail,
  onOpenPipelineSettings
}) => {
  const {
    crmPipelines,
    crmDeals,
    crmContacts,
    updateDealStage,
    deleteDeal,
    openCommercialAI,
    setIsCreateQuoteOpen,
    setSelectedQuote,
    quotes
  } = useWorkspace();

  const [activePipelineId, setActivePipelineId] = useState<string>(
    crmPipelines[0]?.id || 'pipeline_sales_p12'
  );
  const [lostModalDealId, setLostModalDealId] = useState<string | null>(null);
  const [lostReasonInput, setLostReasonInput] = useState('');

  const rawActivePipeline =
    (crmPipelines || []).find((p) => p.id === activePipelineId) || (crmPipelines || [])[0];

  const activePipeline = {
    id: rawActivePipeline?.id || 'default',
    name: rawActivePipeline?.name || 'Pipeline General',
    isDefault: rawActivePipeline?.isDefault ?? true,
    stages: rawActivePipeline?.stages && Array.isArray(rawActivePipeline.stages) ? rawActivePipeline.stages : []
  };

  const pipelineDeals = (crmDeals || []).filter(
    (d) => d && (d.pipelineId === activePipeline.id || (!d.pipelineId && activePipeline.isDefault))
  );

  // Financial calculations
  const totalPipelineValue = pipelineDeals.reduce((acc, d) => acc + (d.value || 0), 0);
  const weightedPipelineValue = pipelineDeals.reduce(
    (acc, d) => acc + ((d.value || 0) * (d.probability || 50)) / 100,
    0
  );
  const wonDeals = pipelineDeals.filter((d) => {
    const stage = activePipeline?.stages?.find((s) => s.id === d.stageId);
    return d.stageId === 'WON' || stage?.winState === 'WON';
  });
  const wonValue = wonDeals.reduce((acc, d) => acc + (d.value || 0), 0);

  const handleMoveStage = async (deal: CrmDeal, targetStageId: string) => {
    const targetStage = activePipeline?.stages?.find((s) => s.id === targetStageId);
    await updateDealStage(deal.id, targetStageId, {
      probability: targetStage ? targetStage.probability : deal.probability
    });
  };

  const handleConfirmLost = async () => {
    if (!lostModalDealId) return;
    const lostStage = activePipeline?.stages?.find((s) => s.winState === 'LOST') || { id: 'LOST' };
    await updateDealStage(lostModalDealId, lostStage.id, {
      lostReason: lostReasonInput || 'No especificado',
      probability: 0
    });
    setLostModalDealId(null);
    setLostReasonInput('');
  };

  return (
    <div className="space-y-6">
      {/* Top Pipeline Switcher & Metrics Ribbon */}
      <div className="bg-[#101018] border border-[#222232] rounded-2xl p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Pipeline Selector */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#E5C158]">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider block">
              Pipeline Comercial Activo
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <select
                value={activePipelineId}
                onChange={(e) => setActivePipelineId(e.target.value)}
                className="bg-[#181826] border border-[#2A2A3E] rounded-xl px-3 py-1.5 text-sm font-bold text-white focus:outline-none focus:border-[#D4AF37]"
              >
                {(crmPipelines || []).map((pipe) => (
                  <option key={pipe.id} value={pipe.id}>
                    {pipe.name} ({(pipe.stages || []).length} etapas)
                  </option>
                ))}
              </select>
              <button
                onClick={onOpenPipelineSettings}
                className="p-1.5 rounded-lg border border-[#2A2A3E] text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-colors"
                title="Personalizar etapas del pipeline"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Aggregate KPI Badges */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-[#141420] border border-[#202030] rounded-xl px-3.5 py-2">
            <span className="text-[10px] text-zinc-400 font-semibold uppercase block">
              Valor Total Pipeline
            </span>
            <span className="text-sm sm:text-base font-bold text-[#E5C158] font-mono">
              ${totalPipelineValue.toLocaleString()} USD
            </span>
          </div>

          <div className="bg-[#141420] border border-[#202030] rounded-xl px-3.5 py-2">
            <span className="text-[10px] text-zinc-400 font-semibold uppercase block">
              Ponderado (Forecast)
            </span>
            <span className="text-sm sm:text-base font-bold text-white font-mono">
              ${Math.round(weightedPipelineValue).toLocaleString()} USD
            </span>
          </div>

          <div className="bg-[#141420] border border-[#202030] rounded-xl px-3.5 py-2">
            <span className="text-[10px] text-zinc-400 font-semibold uppercase block">
              Ganados (Cerrados)
            </span>
            <span className="text-sm sm:text-base font-bold text-emerald-400 font-mono">
              ${wonValue.toLocaleString()} USD
            </span>
          </div>
        </div>

        {/* CTA Button */}
        <button
          onClick={() => onOpenNewDeal(undefined, activePipeline.id)}
          className="px-4 py-2.5 rounded-xl p12-gold-gradient text-black font-semibold text-xs sm:text-sm hover:brightness-110 shadow-lg shadow-[#D4AF37]/20 flex items-center justify-center gap-2 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" /> Nueva Oportunidad
        </button>
      </div>

      {/* Kanban Board Horizontal Columns Container */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-[1200px] items-start">
          {activePipeline.stages.map((stage, stageIndex) => {
            const stageDeals = pipelineDeals.filter((d) => d.stageId === stage.id);
            const stageTotalValue = stageDeals.reduce((acc, d) => acc + (d.value || 0), 0);

            return (
              <div
                key={stage.id}
                className="w-80 shrink-0 bg-[#0E0E16] border border-[#202030] rounded-2xl flex flex-col max-h-[75vh]"
              >
                {/* Column Header */}
                <div className="p-3.5 border-b border-[#1E1E2C] bg-[#12121D] rounded-t-2xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: stage.color || '#D4AF37' }}
                    />
                    <h3 className="text-xs font-bold text-white tracking-wide uppercase">
                      {stage.name}
                    </h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1C1C2A] text-zinc-400 font-mono font-bold">
                      {stageDeals.length}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onOpenNewDeal(stage.id, activePipeline.id)}
                      className="p-1 rounded-md text-zinc-400 hover:text-[#D4AF37] hover:bg-zinc-800 transition-colors"
                      title="Agregar oportunidad a esta etapa"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Sub-header with Total and Probability */}
                <div className="px-3.5 py-2 bg-[#0F0F1A] border-b border-[#1A1A28] flex items-center justify-between text-[11px]">
                  <span className="font-mono font-bold text-[#E5C158]">
                    ${stageTotalValue.toLocaleString()} USD
                  </span>
                  <span className="text-zinc-500 font-mono">
                    Prob: {stage.probability}%
                  </span>
                </div>

                {/* Deal Cards Container */}
                <div className="p-3 overflow-y-auto flex-1 space-y-3">
                  {stageDeals.length > 0 ? (
                    stageDeals.map((deal) => {
                      const priorityColor = {
                        LOW: 'border-zinc-700 text-zinc-400',
                        MEDIUM: 'border-blue-500/40 text-blue-400',
                        HIGH: 'border-[#D4AF37]/50 text-[#E5C158]',
                        URGENT: 'border-rose-500/50 text-rose-400 bg-rose-500/10'
                      }[deal.priority || 'MEDIUM'];

                      const linkedQuote = deal.associatedQuoteId
                        ? quotes.find((q) => q.id === deal.associatedQuoteId)
                        : null;

                      return (
                        <div
                          key={deal.id}
                          className="bg-[#151522] border border-[#242436] rounded-xl p-3.5 shadow-md hover:border-[#D4AF37]/60 transition-all group flex flex-col gap-2.5"
                        >
                          {/* Top Row: Title and Value */}
                          <div className="flex items-start justify-between gap-2">
                            <h4
                              onClick={() => onEditDeal(deal)}
                              className="text-xs font-bold text-white hover:text-[#E5C158] cursor-pointer transition-colors line-clamp-2 leading-tight"
                            >
                              {deal.title}
                            </h4>
                            <span className="text-xs font-mono font-black text-[#E5C158] shrink-0">
                              ${deal.value?.toLocaleString()}
                            </span>
                          </div>

                          {/* Contact and Company */}
                          {(deal.contactName || deal.companyName) && (
                            <div className="flex flex-col gap-0.5 text-[11px] text-zinc-400">
                              {deal.contactName && (
                                <button
                                  onClick={() => deal.contactId && onOpenContactDetail(deal.contactId)}
                                  className="text-left text-zinc-300 hover:text-[#D4AF37] flex items-center gap-1 truncate transition-colors"
                                >
                                  <User className="w-3 h-3 text-[#D4AF37] shrink-0" />
                                  <span className="truncate">{deal.contactName}</span>
                                </button>
                              )}
                              {deal.companyName && (
                                <span className="flex items-center gap-1 text-zinc-400 truncate">
                                  <Building2 className="w-3 h-3 text-zinc-500 shrink-0" />
                                  <span className="truncate">{deal.companyName}</span>
                                </span>
                              )}
                            </div>
                          )}

                          {/* Tags & Linked Quote */}
                          <div className="flex flex-wrap items-center gap-1">
                            {deal.priority && (
                              <span
                                className={`text-[9px] px-1.5 py-0.5 rounded border uppercase font-bold tracking-wider ${priorityColor}`}
                              >
                                {deal.priority}
                              </span>
                            )}
                            {linkedQuote && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30 flex items-center gap-1">
                                <FileText className="w-2.5 h-2.5" /> Cotización
                              </span>
                            )}
                            {deal.tags?.map((tag, tIdx) => (
                              <span
                                key={tIdx}
                                className="text-[9px] px-1.5 py-0.5 rounded bg-[#202030] text-zinc-400 border border-[#2B2B3E]"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>

                          {/* Probability Bar */}
                          <div>
                            <div className="flex justify-between text-[10px] text-zinc-500 mb-1">
                              <span>Probabilidad</span>
                              <span className="font-mono text-zinc-300 font-bold">
                                {deal.probability}%
                              </span>
                            </div>
                            <div className="w-full h-1 bg-[#202030] rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-[#D4AF37] to-[#E5C158]"
                                style={{ width: `${deal.probability}%` }}
                              />
                            </div>
                          </div>

                          {/* Bottom Action Bar */}
                          <div className="pt-2 border-t border-[#202032] flex items-center justify-between gap-1">
                            {/* Move Left */}
                            <button
                              disabled={stageIndex === 0 || !activePipeline?.stages?.[stageIndex - 1]}
                              onClick={() => {
                                const prevStage = activePipeline?.stages?.[stageIndex - 1];
                                if (prevStage) handleMoveStage(deal, prevStage.id);
                              }}
                              className="p-1 rounded text-zinc-500 hover:text-white disabled:opacity-20 transition-colors"
                              title="Mover a etapa previa"
                            >
                              <ChevronLeft className="w-3.5 h-3.5" />
                            </button>

                            {/* Quick Action Buttons */}
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() =>
                                  openCommercialAI({
                                    clientName: deal.contactName,
                                    companyName: deal.companyName,
                                    industry: 'Comercial',
                                    generationType: 'WHATSAPP_CLOSING'
                                  })
                                }
                                className="p-1 rounded text-zinc-400 hover:text-[#D4AF37] hover:bg-zinc-800 transition-colors"
                                title="Generar mensaje de cierre con IA"
                              >
                                <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                              </button>

                              <button
                                onClick={() => handleMoveStage(deal, 'WON')}
                                className="p-1 rounded text-zinc-400 hover:text-emerald-400 hover:bg-zinc-800 transition-colors"
                                title="Marcar como Ganado (Won)"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => setLostModalDealId(deal.id)}
                                className="p-1 rounded text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 transition-colors"
                                title="Marcar como Perdido (Lost)"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => deleteDeal(deal.id)}
                                className="p-1 rounded text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 transition-colors"
                                title="Eliminar oportunidad"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Move Right */}
                            <button
                              disabled={!activePipeline?.stages || stageIndex >= activePipeline.stages.length - 1}
                              onClick={() => {
                                const nextStage = activePipeline?.stages?.[stageIndex + 1];
                                if (nextStage) handleMoveStage(deal, nextStage.id);
                              }}
                              className="p-1 rounded text-zinc-500 hover:text-white disabled:opacity-20 transition-colors"
                              title="Mover a siguiente etapa"
                            >
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="py-8 text-center text-zinc-600 text-xs border border-dashed border-[#1E1E2C] rounded-xl">
                      Sin oportunidades en esta etapa
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mark as Lost Modal Dialog */}
      {lostModalDealId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fadeIn">
          <div className="bg-[#12121C] border border-[#2E2E42] w-full max-w-md rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <XCircle className="w-4 h-4 text-rose-500" /> Marcar Oportunidad como Perdida
            </h3>
            <p className="text-xs text-zinc-400">
              Registra el motivo para análisis de conversión comercial y optimización de futuras propuestas.
            </p>
            <input
              type="text"
              placeholder="Ej. Precio fuera de presupuesto / Eligió competidor / Sin respuesta"
              value={lostReasonInput}
              onChange={(e) => setLostReasonInput(e.target.value)}
              className="w-full bg-[#181826] border border-[#2A2A3E] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setLostModalDealId(null)}
                className="px-4 py-2 rounded-xl text-xs text-zinc-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmLost}
                className="px-4 py-2 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-white text-xs font-semibold"
              >
                Confirmar Pérdida
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
