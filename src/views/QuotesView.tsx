import React, { useState } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import { QuoteProposal, QuoteStatus } from '../types';
import { QuoteCard } from '../components/quotes/QuoteCard';
import { QuoteDetailModal } from '../components/quotes/QuoteDetailModal';
import { CreateQuoteModal } from '../components/quotes/CreateQuoteModal';
import { PlansCatalogModal } from '../components/quotes/PlansCatalogModal';
import { ImageGeneratorModal } from '../components/quotes/ImageGeneratorModal';
import { ImageLibraryModal } from '../components/quotes/ImageLibraryModal';
import {
  Plus,
  Sparkles,
  Search,
  Filter,
  Layers,
  DollarSign,
  TrendingUp,
  FileCheck,
  Clock,
  Send,
  CheckCircle2,
  XCircle,
  Briefcase,
  Image as ImageIcon,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';

export const QuotesView: React.FC = () => {
  const { data, duplicateQuote, deleteQuote, updateQuote, addToast } = useWorkspace();

  const quotes = data.quotes || [];

  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'NEWEST' | 'AMOUNT_HIGH' | 'AMOUNT_LOW'>('NEWEST');

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [selectedQuoteForDetail, setSelectedQuoteForDetail] = useState<QuoteProposal | null>(null);
  const [initialEditForDetail, setInitialEditForDetail] = useState(false);

  // Financial KPI calculations
  const totalQuotesCount = quotes.length;
  const acceptedQuotes = quotes.filter((q) => q.status === 'ACCEPTED');
  const sentQuotes = quotes.filter((q) => q.status === 'SENT');

  const totalAcceptedAmount = acceptedQuotes.reduce((sum, q) => sum + (Number(q.total) || 0), 0);
  const totalSentAmount = sentQuotes.reduce((sum, q) => sum + (Number(q.total) || 0), 0);

  const conversionRate =
    totalQuotesCount > 0
      ? Math.round((acceptedQuotes.length / totalQuotesCount) * 100)
      : 0;

  // Filtered quotes list
  const filteredQuotes = quotes
    .filter((quote) => {
      const matchesSearch =
        !searchQuery.trim() ||
        quote.client.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        quote.client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        quote.folio.toLowerCase().includes(searchQuery.toLowerCase()) ||
        quote.title.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = selectedStatus === 'ALL' || quote.status === selectedStatus;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'AMOUNT_HIGH') return b.total - a.total;
      if (sortBy === 'AMOUNT_LOW') return a.total - b.total;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const handleOpenDetail = (quote: QuoteProposal, editMode = false) => {
    setSelectedQuoteForDetail(quote);
    setInitialEditForDetail(editMode);
  };

  const handleDuplicate = (id: string) => {
    duplicateQuote(id);
  };

  const handleDelete = (id: string) => {
    deleteQuote(id);
  };

  const handleStatusChange = (id: string, newStatus: QuoteStatus) => {
    const target = quotes.find((q) => q.id === id);
    if (target) {
      updateQuote({ ...target, status: newStatus });
      addToast(`Estado de cotización actualizado a ${newStatus}`, 'info');
    }
  };

  return (
    <div id="quotes-view" className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 space-y-6">
      {/* Header & Main Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              Cotizaciones Pixel 12
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#D4AF37]/20 text-[#E5C158] border border-[#D4AF37]/40">
              COMERCIAL PRO
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Crea propuestas comerciales de alto impacto, administra tu catálogo de planes y genera visuales con IA
          </p>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Visual Library */}
          <button
            onClick={() => setIsLibraryOpen(true)}
            className="px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold flex items-center gap-1.5 border border-zinc-800 transition-colors"
            title="Biblioteca de imágenes de la agencia"
          >
            <ImageIcon className="w-3.5 h-3.5 text-zinc-400" />
            <span className="hidden sm:inline">Biblioteca Visual</span>
          </button>

          {/* AI Image Generator */}
          <button
            onClick={() => setIsGeneratorOpen(true)}
            className="px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-[#E5C158] text-xs font-semibold flex items-center gap-1.5 border border-[#D4AF37]/30 transition-colors"
            title="Generador de conceptos visuales con IA"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span className="hidden sm:inline">Generador Visual IA</span>
          </button>

          {/* Plans & Settings */}
          <button
            onClick={() => setIsCatalogOpen(true)}
            className="px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold flex items-center gap-1.5 border border-zinc-800 transition-colors"
            title="Administrar catálogo de planes y servicios"
          >
            <Layers className="w-3.5 h-3.5 text-zinc-400" />
            <span>Catálogo & Ajustes</span>
          </button>

          {/* New Quote Primary CTA */}
          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-4 py-2 rounded-xl p12-gold-gradient text-black text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-[#D4AF37]/15 hover:brightness-110 transition-all"
          >
            <Plus className="w-4 h-4 text-black" />
            <span>Nueva Cotización</span>
          </button>
        </div>
      </div>

      {/* KPI Metrics Dashboard Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Quotes */}
        <div className="p-4 rounded-2xl bg-[#121217] border border-zinc-800/80 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Propuestas</span>
            <div className="p-1.5 rounded-lg bg-zinc-800/60 text-zinc-300">
              <FileCheck className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-black text-white font-mono">{totalQuotesCount}</span>
            <span className="text-[11px] text-zinc-500 block mt-0.5">Propuestas registradas</span>
          </div>
        </div>

        {/* Accepted Revenue */}
        <div className="p-4 rounded-2xl bg-[#121217] border border-[#D4AF37]/30 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#D4AF37] mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Cerradas / Aprobadas</span>
            <div className="p-1.5 rounded-lg bg-[#D4AF37]/10 text-[#D4AF37]">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-white font-mono flex items-baseline gap-1">
              <span className="text-[#D4AF37] text-lg font-bold">$</span>
              <span>
                {new Intl.NumberFormat('en-US').format(totalAcceptedAmount)}
              </span>
              <span className="text-xs text-zinc-500 font-normal">USD</span>
            </div>
            <span className="text-[11px] text-[#E5C158] block mt-0.5">
              {acceptedQuotes.length} cotizaciones ganadas
            </span>
          </div>
        </div>

        {/* In Negotiation */}
        <div className="p-4 rounded-2xl bg-[#121217] border border-zinc-800/80 flex flex-col justify-between">
          <div className="flex items-center justify-between text-blue-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">En Negociación</span>
            <div className="p-1.5 rounded-lg bg-blue-950/40 text-blue-400">
              <Send className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-white font-mono flex items-baseline gap-1">
              <span className="text-blue-400 text-lg font-bold">$</span>
              <span>
                {new Intl.NumberFormat('en-US').format(totalSentAmount)}
              </span>
              <span className="text-xs text-zinc-500 font-normal">USD</span>
            </div>
            <span className="text-[11px] text-zinc-400 block mt-0.5">
              {sentQuotes.length} enviadas en seguimiento
            </span>
          </div>
        </div>

        {/* Win Rate */}
        <div className="p-4 rounded-2xl bg-[#121217] border border-zinc-800/80 flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Tasa de Conversión</span>
            <div className="p-1.5 rounded-lg bg-emerald-950/40 text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-black text-white font-mono">{conversionRate}%</span>
            <span className="text-[11px] text-zinc-500 block mt-0.5">Efectividad de cierre</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3 sm:p-4 rounded-2xl bg-[#121217] border border-zinc-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {[
            { id: 'ALL', label: 'Todas' },
            { id: 'DRAFT', label: 'Borrador' },
            { id: 'SENT', label: 'Enviadas' },
            { id: 'ACCEPTED', label: 'Aprobadas' },
            { id: 'REJECTED', label: 'Rechazadas' },
            { id: 'EXPIRED', label: 'Vencidas' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedStatus(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedStatus === tab.id
                  ? 'bg-[#D4AF37]/20 text-[#E5C158] border border-[#D4AF37]/40'
                  : 'text-zinc-400 hover:text-zinc-200 bg-zinc-900/60 border border-zinc-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Sort Controls */}
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-zinc-500" />
            <input
              type="text"
              placeholder="Buscar cliente, empresa o folio..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-zinc-900 border border-zinc-700/80 text-zinc-300 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-[#D4AF37]"
          >
            <option value="NEWEST">Más recientes</option>
            <option value="AMOUNT_HIGH">Mayor valor</option>
            <option value="AMOUNT_LOW">Menor valor</option>
          </select>
        </div>
      </div>

      {/* Quotes Cards Grid */}
      {filteredQuotes.length === 0 ? (
        <div className="py-16 text-center rounded-2xl border border-dashed border-zinc-800 bg-[#0E0E12] p-8 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-600">
            <FileCheck className="w-6 h-6 text-zinc-500" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-200">No hay cotizaciones para mostrar</h3>
            <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
              Crea tu primera cotización comercial profesional seleccionando planes o usando el asistente de IA.
            </p>
          </div>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-4 py-2 rounded-xl p12-gold-gradient text-black text-xs font-bold inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5 text-black" />
            <span>Crear Cotización</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredQuotes.map((quote) => (
            <QuoteCard
              key={quote.id}
              quote={quote}
              onView={(q) => handleOpenDetail(q, false)}
              onEdit={(q) => handleOpenDetail(q, true)}
              onDuplicate={handleDuplicate}
              onDelete={handleDelete}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}

      {/* ===================== MODALS ===================== */}
      {/* Create Quote Modal */}
      <CreateQuoteModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={(newQuote) => {
          setSelectedQuoteForDetail(newQuote);
          setInitialEditForDetail(false);
        }}
      />

      {/* Quote Detail / Proposal Preview Modal */}
      {selectedQuoteForDetail && (
        <QuoteDetailModal
          quote={selectedQuoteForDetail}
          isOpen={Boolean(selectedQuoteForDetail)}
          onClose={() => setSelectedQuoteForDetail(null)}
          onUpdate={(updatedQuote) => {
            updateQuote(updatedQuote);
            setSelectedQuoteForDetail(updatedQuote);
          }}
          initialEditMode={initialEditForDetail}
        />
      )}

      {/* Plans Catalog & Commercial Settings Modal */}
      <PlansCatalogModal
        isOpen={isCatalogOpen}
        onClose={() => setIsCatalogOpen(false)}
      />

      {/* AI Image Generator Modal */}
      <ImageGeneratorModal
        isOpen={isGeneratorOpen}
        onClose={() => setIsGeneratorOpen(false)}
      />

      {/* Image Library Modal */}
      <ImageLibraryModal
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        onOpenGenerator={() => setIsGeneratorOpen(true)}
      />
    </div>
  );
};
