import React, { useState, useMemo } from 'react';
import {
  Building2,
  Users,
  Kanban,
  DollarSign,
  TrendingUp,
  Plus,
  Sparkles,
  Search,
  Filter,
  Layers,
  Calendar,
  CheckCircle2,
  Clock,
  MessageSquare,
  Mail,
  Phone,
  Receipt,
  FileText,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Briefcase
} from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import {
  CrmDeal,
  CrmContact,
  CrmCompany,
  CrmFollowUp,
  ContactLifecycleStage
} from '../types';
import { CrmKanbanBoard } from '../components/crm/CrmKanbanBoard';
import { CrmContactsTable } from '../components/crm/CrmContactsTable';
import { CrmCompaniesList } from '../components/crm/CrmCompaniesList';
import { DealModal } from '../components/crm/DealModal';
import { ContactModal } from '../components/crm/ContactModal';
import { ContactDetailModal } from '../components/crm/ContactDetailModal';
import { PipelineSettingsModal } from '../components/crm/PipelineSettingsModal';
import { CommercialAIModal } from '../components/crm/CommercialAIModal';

type CrmTab = 'pipeline' | 'contacts' | 'companies' | 'followups';

export const CrmView: React.FC = () => {
  const {
    crmDeals,
    crmContacts,
    crmCompanies,
    crmPipelines,
    crmFollowUps,
    saveFollowUp,
    updateFollowUpStatus,
    deleteFollowUp,
    isCommercialAIOpen,
    setIsCommercialAIOpen,
    commercialAIInitialData,
    openCommercialAI,
    closeCommercialAI,
    setIsCreateQuoteOpen,
    setSelectedQuote,
    addToast
  } = useWorkspace();

  const [activeTab, setActiveTab] = useState<CrmTab>('pipeline');

  // Deal Modal State
  const [isDealModalOpen, setIsDealModalOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<CrmDeal | null>(null);
  const [dealInitialStageId, setDealInitialStageId] = useState<string | undefined>(undefined);
  const [dealInitialPipelineId, setDealInitialPipelineId] = useState<string | undefined>(undefined);
  const [dealInitialContactId, setDealInitialContactId] = useState<string | undefined>(undefined);

  // Contact Modal State
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<CrmContact | null>(null);

  // Contact Detail Modal State
  const [isContactDetailOpen, setIsContactDetailOpen] = useState(false);
  const [selectedContactForDetail, setSelectedContactForDetail] = useState<CrmContact | null>(null);

  // Follow-up Filter State
  const [followUpFilter, setFollowUpFilter] = useState<'ALL' | 'PENDING' | 'DONE'>('PENDING');

  // Pipeline Settings Modal State (simple stub toggle)
  const [isPipelineSettingsOpen, setIsPipelineSettingsOpen] = useState(false);

  // Metrics Calculations
  const metrics = useMemo(() => {
    const deals = crmDeals || [];
    const contacts = crmContacts || [];
    const followUps = crmFollowUps || [];

    const activeDeals = deals.filter(
      (d) => d && d.stageId !== 'won' && d.stageId !== 'lost' && d.stageId !== 'stage_won' && d.stageId !== 'stage_lost'
    );
    const wonDeals = deals.filter(
      (d) => d && (d.stageId === 'won' || d.stageId === 'stage_won')
    );
    const pipelineValue = activeDeals.reduce((sum, d) => sum + (Number(d.value) || 0), 0);
    const wonValue = wonDeals.reduce((sum, d) => sum + (Number(d.value) || 0), 0);
    const totalFinished = wonDeals.length + deals.filter(d => d && (d.stageId === 'lost' || d.stageId === 'stage_lost')).length;
    const winRate = totalFinished > 0 ? Math.round((wonDeals.length / totalFinished) * 100) : 45;

    const pendingFollowUps = followUps.filter((f) => f && f.status === 'PENDING').length;
    const totalClients = contacts.filter((c) => c && c.lifecycleStage === 'CUSTOMER').length;

    return {
      activeDealsCount: activeDeals.length,
      pipelineValue,
      wonValue,
      winRate,
      pendingFollowUps,
      totalContacts: contacts.length,
      totalClients
    };
  }, [crmDeals, crmContacts, crmFollowUps]);

  // Handlers for Deals
  const handleOpenNewDeal = (stageId?: string, pipelineId?: string, contactId?: string) => {
    setEditingDeal(null);
    setDealInitialStageId(stageId);
    setDealInitialPipelineId(pipelineId);
    setDealInitialContactId(contactId);
    setIsDealModalOpen(true);
  };

  const handleEditDeal = (deal: CrmDeal) => {
    setEditingDeal(deal);
    setDealInitialStageId(deal.stageId);
    setDealInitialPipelineId(deal.pipelineId);
    setDealInitialContactId(deal.contactId);
    setIsDealModalOpen(true);
  };

  // Handlers for Contacts
  const handleOpenNewContact = () => {
    setEditingContact(null);
    setIsContactModalOpen(true);
  };

  const handleEditContact = (contact: CrmContact) => {
    setEditingContact(contact);
    setIsContactModalOpen(true);
  };

  const handleSelectContactDetail = (contact: CrmContact) => {
    setSelectedContactForDetail(contact);
    setIsContactDetailOpen(true);
  };

  const handleOpenContactDetailById = (contactId: string) => {
    const found = crmContacts.find((c) => c.id === contactId);
    if (found) {
      handleSelectContactDetail(found);
    }
  };

  return (
    <div className="min-h-full bg-[#09090B] text-zinc-100 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Header & High-Level Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#1E1E2C] pb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#D4AF37]/20 to-[#E5C158]/5 border border-[#D4AF37]/30 text-[#E5C158] shadow-lg shadow-[#D4AF37]/10">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
                CRM & Pipeline Comercial
                <span className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded-full bg-[#D4AF37]/15 text-[#E5C158] border border-[#D4AF37]/30">
                  Pixel 12 OS
                </span>
              </h1>
              <p className="text-xs text-zinc-400 mt-0.5">
                Gestión integral de prospectos, embudos de venta B2B, seguimiento omnicanal e inteligencia comercial con IA.
              </p>
            </div>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            id="crm-open-commercial-ai-btn"
            type="button"
            onClick={() => openCommercialAI({ generationType: 'EMAIL_PITCH' })}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#E5C158] text-black font-semibold text-xs shadow-lg shadow-[#D4AF37]/20 hover:brightness-110 active:scale-95 transition-all"
          >
            <Sparkles className="w-4 h-4 text-black" />
            <span>Copiloto Comercial IA</span>
          </button>

          <button
            id="crm-open-new-contact-btn"
            type="button"
            onClick={handleOpenNewContact}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#151520] hover:bg-[#1C1C2C] border border-[#2A2A3E] text-zinc-200 text-xs font-medium transition-colors"
          >
            <Users className="w-3.5 h-3.5 text-[#E5C158]" />
            <span>+ Contacto</span>
          </button>

          <button
            id="crm-open-new-deal-btn"
            type="button"
            onClick={() => handleOpenNewDeal()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#181826] hover:bg-[#202034] border border-[#D4AF37]/40 text-[#E5C158] text-xs font-semibold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ Nuevo Trato</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Pipeline Value */}
        <div className="bg-[#101018] border border-[#1E1E2C] rounded-2xl p-4 flex flex-col justify-between hover:border-[#D4AF37]/30 transition-colors">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider">Valor en Pipeline</span>
            <DollarSign className="w-4 h-4 text-[#E5C158]" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-white tracking-tight">
              ${metrics.pipelineValue.toLocaleString()}
            </div>
            <div className="text-[11px] text-zinc-400 mt-0.5">
              {metrics.activeDealsCount} tratos activos en curso
            </div>
          </div>
        </div>

        {/* Tratos Ganados */}
        <div className="bg-[#101018] border border-[#1E1E2C] rounded-2xl p-4 flex flex-col justify-between hover:border-emerald-500/30 transition-colors">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider">Ventas Cerradas</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-400 tracking-tight">
              ${metrics.wonValue.toLocaleString()}
            </div>
            <div className="text-[11px] text-zinc-400 mt-0.5">
              Tasa de éxito ~{metrics.winRate}%
            </div>
          </div>
        </div>

        {/* Contactos & Prospectos */}
        <div className="bg-[#101018] border border-[#1E1E2C] rounded-2xl p-4 flex flex-col justify-between hover:border-[#2E2E44] transition-colors">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider">Directorio Contactos</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-white tracking-tight">
              {metrics.totalContacts}
            </div>
            <div className="text-[11px] text-zinc-400 mt-0.5">
              {metrics.totalClients} clientes formalizados
            </div>
          </div>
        </div>

        {/* Empresas Activas */}
        <div className="bg-[#101018] border border-[#1E1E2C] rounded-2xl p-4 flex flex-col justify-between hover:border-[#2E2E44] transition-colors">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider">Cuentas Empresa</span>
            <Building2 className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-white tracking-tight">
              {crmCompanies?.length || 0}
            </div>
            <div className="text-[11px] text-zinc-400 mt-0.5">
              Marcas B2B registradas
            </div>
          </div>
        </div>

        {/* Tareas de Seguimiento */}
        <div className="col-span-2 sm:col-span-1 bg-[#101018] border border-[#1E1E2C] rounded-2xl p-4 flex flex-col justify-between hover:border-amber-500/30 transition-colors">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider">Seguimientos Pendientes</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-amber-400 tracking-tight">
              {metrics.pendingFollowUps}
            </div>
            <div className="text-[11px] text-zinc-400 mt-0.5">
              WhatsApp, llamadas & propuestas
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-[#1E1E2C] pb-px overflow-x-auto no-scrollbar">
        {[
          { id: 'pipeline', label: 'Pipeline de Ventas (Kanban)', icon: Kanban, count: metrics.activeDealsCount },
          { id: 'contacts', label: 'Contactos & Leads', icon: Users, count: metrics.totalContacts },
          { id: 'companies', label: 'Empresas & Cuentas', icon: Building2, count: (crmCompanies || []).length },
          { id: 'followups', label: 'Seguimientos & Agenda', icon: Clock, count: metrics.pendingFollowUps, alert: metrics.pendingFollowUps > 0 }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`crm-tab-${tab.id}`}
              type="button"
              onClick={() => setActiveTab(tab.id as CrmTab)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all relative border-b-2 whitespace-nowrap ${
                isActive
                  ? 'border-[#D4AF37] text-[#E5C158] bg-[#141420]'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-[#101018]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                    isActive
                      ? 'bg-[#D4AF37]/20 text-[#E5C158]'
                      : tab.alert
                      ? 'bg-amber-500/20 text-amber-300'
                      : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content Panes */}
      <div className="pt-2">
        {activeTab === 'pipeline' && (
          <CrmKanbanBoard
            onOpenNewDeal={handleOpenNewDeal}
            onEditDeal={handleEditDeal}
            onOpenContactDetail={handleOpenContactDetailById}
            onOpenPipelineSettings={() => setIsPipelineSettingsOpen(true)}
          />
        )}

        {activeTab === 'contacts' && (
          <CrmContactsTable
            onOpenNewContact={handleOpenNewContact}
            onSelectContact={handleSelectContactDetail}
            onEditContact={handleEditContact}
          />
        )}

        {activeTab === 'companies' && (
          <CrmCompaniesList />
        )}

        {activeTab === 'followups' && (
          <div className="space-y-4">
            {/* Follow-ups Filter Controls */}
            <div className="bg-[#101018] border border-[#222232] rounded-2xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-zinc-300">Mostrar:</span>
                {(['ALL', 'PENDING', 'DONE'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setFollowUpFilter(mode)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      followUpFilter === mode
                        ? 'bg-[#D4AF37]/20 text-[#E5C158] border border-[#D4AF37]/40'
                        : 'bg-[#181826] text-zinc-400 hover:text-white border border-transparent'
                    }`}
                  >
                    {mode === 'ALL' && 'Todos'}
                    {mode === 'PENDING' && 'Pendientes'}
                    {mode === 'DONE' && 'Completados'}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => {
                  if ((crmContacts?.length || 0) > 0) {
                    handleSelectContactDetail(crmContacts[0]);
                  } else {
                    handleOpenNewContact();
                  }
                }}
                className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#181826] border border-[#2C2C40] text-xs text-zinc-200 hover:text-white hover:border-[#D4AF37]/40 transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-[#E5C158]" />
                <span>Programar Seguimiento</span>
              </button>
            </div>

            {/* Follow-ups List */}
            <div className="space-y-2.5">
              {(crmFollowUps || [])
                .filter((f) => f && (followUpFilter === 'ALL' ? true : f.status === followUpFilter))
                .map((item) => {
                  const isDone = item.status === 'DONE';
                  const isHigh = item.priority === 'HIGH';

                  return (
                    <div
                      key={item.id}
                      className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isDone
                          ? 'bg-[#0E0E14] border-[#1C1C28] opacity-75'
                          : 'bg-[#12121C] border-[#222234] hover:border-[#D4AF37]/30 shadow-md'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <button
                          type="button"
                          onClick={() => updateFollowUpStatus(item.id, isDone ? 'PENDING' : 'DONE')}
                          className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                            isDone
                              ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                              : 'border-zinc-600 hover:border-[#D4AF37] text-transparent'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </button>

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h4
                              className={`text-xs sm:text-sm font-semibold ${
                                isDone ? 'line-through text-zinc-500' : 'text-zinc-100'
                              }`}
                            >
                              {item.title}
                            </h4>

                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-md font-mono font-medium ${
                                isHigh
                                  ? 'bg-red-500/15 text-red-400 border border-red-500/20'
                                  : 'bg-zinc-800 text-zinc-400'
                              }`}
                            >
                              {item.channel || item.type || 'SEGUIMIENTO'}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-3 text-[11px] text-zinc-400 mt-1">
                            {item.contactName && (
                              <span className="flex items-center gap-1 text-zinc-300">
                                <Users className="w-3 h-3 text-[#E5C158]" />
                                {item.contactName}
                              </span>
                            )}
                            {item.companyName && (
                              <span className="flex items-center gap-1 text-zinc-400">
                                <Building2 className="w-3 h-3" />
                                {item.companyName}
                              </span>
                            )}
                            <span className="flex items-center gap-1 text-zinc-400 font-mono">
                              <Calendar className="w-3 h-3" />
                              {item.dueDate ? new Date(item.dueDate).toLocaleDateString() : 'Sin fecha'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() => {
                            openCommercialAI({
                              clientName: item.contactName,
                              companyName: item.companyName,
                              generationType: 'WHATSAPP_CLOSING'
                            });
                          }}
                          className="px-2.5 py-1 rounded-lg bg-[#1A1A28] hover:bg-[#D4AF37]/20 border border-[#2E2E44] hover:border-[#D4AF37]/50 text-[11px] text-zinc-300 hover:text-[#E5C158] flex items-center gap-1.5 transition-colors"
                        >
                          <Sparkles className="w-3 h-3 text-[#E5C158]" />
                          <span>Mensaje IA</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => deleteFollowUp(item.id)}
                          className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          title="Eliminar"
                        >
                          <AlertCircle className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}

              {(crmFollowUps?.length || 0) === 0 && (
                <div className="text-center py-12 bg-[#101018] rounded-2xl border border-dashed border-[#222232] text-zinc-500">
                  <Clock className="w-8 h-8 mx-auto mb-2 text-zinc-600" />
                  <p className="text-xs font-medium">No hay seguimientos registrados aún.</p>
                  <p className="text-[11px] text-zinc-600 mt-0.5">
                    Programa llamadas, mensajes o revisiones de propuesta desde la ficha de cualquier contacto.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {/* 1. Deal Modal */}
      {isDealModalOpen && (
        <DealModal
          deal={editingDeal}
          initialStageId={dealInitialStageId}
          initialPipelineId={dealInitialPipelineId}
          initialContactId={dealInitialContactId}
          isOpen={isDealModalOpen}
          onClose={() => setIsDealModalOpen(false)}
        />
      )}

      {/* 2. Contact Create / Edit Modal */}
      {isContactModalOpen && (
        <ContactModal
          contact={editingContact}
          isOpen={isContactModalOpen}
          onClose={() => setIsContactModalOpen(false)}
        />
      )}

      {/* 3. Contact Detail Modal */}
      {isContactDetailOpen && selectedContactForDetail && (
        <ContactDetailModal
          contact={selectedContactForDetail}
          isOpen={isContactDetailOpen}
          onClose={() => {
            setIsContactDetailOpen(false);
            setSelectedContactForDetail(null);
          }}
          onEdit={(c) => {
            setIsContactDetailOpen(false);
            handleEditContact(c);
          }}
        />
      )}

      {/* 4. Commercial AI Modal */}
      <CommercialAIModal
        isOpen={isCommercialAIOpen}
        onClose={closeCommercialAI}
        initialData={commercialAIInitialData}
      />

      {/* 5. Pipeline Settings Modal */}
      <PipelineSettingsModal
        isOpen={isPipelineSettingsOpen}
        onClose={() => setIsPipelineSettingsOpen(false)}
      />
    </div>
  );
};
