import React from 'react';
import { QuoteProposal, QuoteStatus } from '../../types';
import {
  FileText,
  Calendar,
  Building2,
  DollarSign,
  Copy,
  Trash2,
  Edit3,
  Eye,
  CheckCircle2,
  Clock,
  Send,
  XCircle,
  Sparkles,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

interface QuoteCardProps {
  quote: QuoteProposal;
  onView: (quote: QuoteProposal) => void;
  onEdit: (quote: QuoteProposal) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: QuoteStatus) => void;
}

const statusConfig: Record<
  QuoteStatus,
  { label: string; color: string; bg: string; border: string; icon: any }
> = {
  DRAFT: {
    label: 'Borrador',
    color: 'text-zinc-400',
    bg: 'bg-zinc-800/60',
    border: 'border-zinc-700/60',
    icon: Clock
  },
  SENT: {
    label: 'Enviada',
    color: 'text-blue-400',
    bg: 'bg-blue-950/40',
    border: 'border-blue-700/50',
    icon: Send
  },
  VIEWED: {
    label: 'Vista por cliente',
    color: 'text-indigo-400',
    bg: 'bg-indigo-950/40',
    border: 'border-indigo-700/50',
    icon: Eye
  },
  ACCEPTED: {
    label: 'Aprobada',
    color: 'text-[#D4AF37]',
    bg: 'bg-[#D4AF37]/10',
    border: 'border-[#D4AF37]/40',
    icon: CheckCircle2
  },
  REJECTED: {
    label: 'Rechazada',
    color: 'text-red-400',
    bg: 'bg-red-950/40',
    border: 'border-red-700/50',
    icon: XCircle
  },
  EXPIRED: {
    label: 'Vencida',
    color: 'text-amber-400',
    bg: 'bg-amber-950/40',
    border: 'border-amber-700/50',
    icon: Clock
  }
};

export const QuoteCard: React.FC<QuoteCardProps> = ({
  quote,
  onView,
  onEdit,
  onDuplicate,
  onDelete,
  onStatusChange
}) => {
  const currentStatus = statusConfig[quote.status] || statusConfig.DRAFT;
  const StatusIcon = currentStatus.icon;

  const formattedTotal = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: quote.currency || 'USD',
    minimumFractionDigits: 0
  }).format(Number(quote.total) || 0);

  return (
    <div
      id={`quote-card-${quote.id}`}
      className="group relative rounded-2xl bg-[#121217] border border-zinc-800/80 hover:border-[#D4AF37]/50 transition-all duration-200 p-5 flex flex-col justify-between shadow-lg shadow-black/40 hover:shadow-[#D4AF37]/5"
    >
      {/* Top row: Folio and Status badge */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-[#D4AF37] px-2.5 py-1 rounded-md bg-[#D4AF37]/10 border border-[#D4AF37]/20">
              {quote.folio}
            </span>
            {quote.selectedPlan && (
              <span className="text-[11px] font-medium text-zinc-400 px-2 py-0.5 rounded bg-zinc-800/80 border border-zinc-700/50">
                {quote.selectedPlan.name}
              </span>
            )}
          </div>

          <div
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${currentStatus.bg} ${currentStatus.color} ${currentStatus.border}`}
          >
            <StatusIcon className="w-3.5 h-3.5" />
            <span>{currentStatus.label}</span>
          </div>
        </div>

        {/* Title and Client */}
        <h3
          onClick={() => onView(quote)}
          className="text-base font-semibold text-white group-hover:text-[#E5C158] transition-colors cursor-pointer line-clamp-1 mb-1"
          title={quote.title}
        >
          {quote.title}
        </h3>

        <div className="flex items-center gap-2 text-xs text-zinc-400 mb-3">
          <Building2 className="w-3.5 h-3.5 text-zinc-500" />
          <span className="font-medium text-zinc-300">{quote.client.company}</span>
          <span>•</span>
          <span className="truncate">{quote.client.name}</span>
        </div>

        {/* Executive summary snippet */}
        <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed mb-4">
          {quote.executiveSummary}
        </p>
      </div>

      {/* Financial & Items Summary */}
      <div className="pt-3 border-t border-zinc-800/80">
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">Inversión Total</span>
            <div className="text-lg font-black text-white font-mono flex items-baseline gap-1">
              <span className="text-[#D4AF37] text-sm font-bold">$</span>
              <span>{formattedTotal.replace('$', '')}</span>
              <span className="text-[11px] font-normal text-zinc-400">{quote.currency}</span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">Validez</span>
            <span className="text-xs text-zinc-300 font-medium flex items-center justify-end gap-1">
              <Calendar className="w-3 h-3 text-zinc-400" />
              {quote.validUntil}
            </span>
          </div>
        </div>

        {/* Deliverables snippet */}
        <div className="flex items-center gap-1.5 flex-wrap mb-4">
          <span className="text-[11px] text-zinc-500">{(quote.items || []).length} ítems incluidos</span>
          {quote.visuals && quote.visuals.length > 0 && (
            <span className="text-[10px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5 text-[#D4AF37]" />
              {(quote.visuals || []).length} visuales
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-1.5 pt-2 border-t border-zinc-850">
          <div className="flex items-center gap-1">
            <button
              id={`btn-view-${quote.id}`}
              onClick={() => onView(quote)}
              className="px-3 py-1.5 rounded-lg bg-[#D4AF37]/15 hover:bg-[#D4AF37]/25 text-[#E5C158] text-xs font-semibold flex items-center gap-1 transition-colors border border-[#D4AF37]/30"
              title="Ver propuesta comercial"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Ver Propuesta</span>
            </button>

            <button
              id={`btn-edit-${quote.id}`}
              onClick={() => onEdit(quote)}
              className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
              title="Editar cotización"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>

            <button
              id={`btn-dup-${quote.id}`}
              onClick={() => onDuplicate(quote.id)}
              className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
              title="Duplicar cotización"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-1">
            {/* Quick Status Dropdown */}
            <select
              value={quote.status}
              onChange={(e) => onStatusChange(quote.id, e.target.value as QuoteStatus)}
              className="bg-zinc-900 text-zinc-300 text-[11px] rounded-lg border border-zinc-700/60 px-2 py-1 focus:outline-none focus:border-[#D4AF37]"
              title="Cambiar estado"
            >
              <option value="DRAFT">Borrador</option>
              <option value="SENT">Enviada</option>
              <option value="ACCEPTED">Aprobada</option>
              <option value="REJECTED">Rechazada</option>
              <option value="EXPIRED">Vencida</option>
            </select>

            <button
              id={`btn-del-${quote.id}`}
              onClick={() => onDelete(quote.id)}
              className="p-1.5 rounded-lg hover:bg-red-950/50 text-zinc-500 hover:text-red-400 transition-colors"
              title="Eliminar"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
