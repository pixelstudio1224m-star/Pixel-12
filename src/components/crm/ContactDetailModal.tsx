import React, { useState } from 'react';
import {
  X,
  User,
  Building2,
  Mail,
  Phone,
  Calendar,
  Sparkles,
  FileText,
  Briefcase,
  Layers,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  Tag,
  DollarSign,
  Send,
  MessageSquare,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Trash2,
  Edit3
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import {
  CrmContact,
  CrmDeal,
  CrmFollowUp,
  CrmActivity,
  ContactLifecycleStage
} from '../../types';

interface ContactDetailModalProps {
  contact: CrmContact;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (contact: CrmContact) => void;
  onOpenDealModal: (contactId: string) => void;
}

export const ContactDetailModal: React.FC<ContactDetailModalProps> = ({
  contact,
  isOpen,
  onClose,
  onEdit,
  onOpenDealModal
}) => {
  const {
    data,
    crmDeals,
    crmFollowUps,
    crmActivities,
    quotes,
    saveContact,
    saveFollowUp,
    updateFollowUpStatus,
    deleteFollowUp,
    saveActivity,
    openCommercialAI,
    setIsCreateQuoteOpen,
    setSelectedQuote
  } = useWorkspace();

  const [activeTab, setActiveTab] = useState<'overview' | 'deals' | 'quotes' | 'followups' | 'history'>('overview');
  const [newNote, setNewNote] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);

  // Quick FollowUp inline form
  const [showAddFollowUp, setShowAddFollowUp] = useState(false);
  const [fuTitle, setFuTitle] = useState('');
  const [fuType, setFuType] = useState<'CALL' | 'EMAIL' | 'WHATSAPP' | 'MEETING' | 'PROPOSAL_REVIEW'>('WHATSAPP');
  const [fuDueDate, setFuDueDate] = useState(
    new Date(Date.now() + 24 * 3600000).toISOString().substring(0, 16)
  );

  if (!isOpen) return null;

  const contactDeals = crmDeals.filter((d) => d.contactId === contact.id);
  const contactQuotes = quotes.filter(
    (q) =>
      q.client?.id === contact.id ||
      q.client?.email === contact.email ||
      q.client?.name?.toLowerCase() === contact.fullName.toLowerCase()
  );
  const contactFollowUps = crmFollowUps.filter((f) => f.contactId === contact.id);
  const contactActivities = crmActivities.filter(
    (a) =>
      (a.entityType === 'CONTACT' && a.entityId === contact.id) ||
      contactDeals.some((d) => a.entityId === d.id)
  );

  const totalDealsValue = contactDeals.reduce((sum, d) => sum + (d.value || 0), 0);

  // Lifecycle badge style
  const stageBadgeStyle: Record<ContactLifecycleStage, { label: string; cls: string }> = {
    LEAD: { label: 'Lead Nuevo', cls: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
    PROSPECT: { label: 'Prospecto Calificado', cls: 'bg-[#D4AF37]/15 text-[#E5C158] border-[#D4AF37]/30' },
    OPPORTUNITY: { label: 'En Negociación', cls: 'bg-purple-500/15 text-purple-400 border-purple-500/30' },
    CUSTOMER: { label: 'Cliente Activo', cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
    CHURNED: { label: 'Inactivo', cls: 'bg-zinc-700/30 text-zinc-400 border-zinc-600' }
  };

  const handleStageChange = async (newStage: ContactLifecycleStage) => {
    const updated: CrmContact = {
      ...contact,
      lifecycleStage: newStage,
      updatedAt: new Date().toISOString()
    };
    await saveContact(updated);
    await saveActivity({
      id: `act_${Date.now()}`,
      entityType: 'CONTACT',
      entityId: contact.id,
      type: 'STAGE_CHANGE',
      title: 'Cambio de etapa de cliente',
      description: `Etapa actualizada a ${stageBadgeStyle[newStage].label}`,
      authorName: data?.currentMember?.name || 'Pixel 12 Specialist',
      timestamp: new Date().toISOString()
    });
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    setIsAddingNote(true);

    const activity: CrmActivity = {
      id: `act_${Date.now()}`,
      entityType: 'CONTACT',
      entityId: contact.id,
      type: 'NOTE',
      title: 'Nota comercial',
      description: newNote.trim(),
      authorName: data?.currentMember?.name || 'Pixel 12 Specialist',
      timestamp: new Date().toISOString()
    };

    await saveActivity(activity);
    setNewNote('');
    setIsAddingNote(false);
  };

  const handleCreateFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fuTitle.trim()) return;

    const followUp: CrmFollowUp = {
      id: `fu_${Date.now()}`,
      contactId: contact.id,
      contactName: contact.fullName,
      companyId: contact.companyId,
      companyName: contact.companyName,
      title: fuTitle.trim(),
      type: fuType,
      dueDate: new Date(fuDueDate).toISOString(),
      priority: 'HIGH',
      status: 'PENDING',
      assignedToName: data?.currentMember?.name || 'Pixel 12 Specialist',
      createdAt: new Date().toISOString()
    };

    await saveFollowUp(followUp);
    await saveActivity({
      id: `act_${Date.now()}`,
      entityType: 'CONTACT',
      entityId: contact.id,
      type: 'FOLLOW_UP',
      title: `Nuevo seguimiento programado: ${fuTitle}`,
      description: `Canal: ${fuType} • Fecha: ${new Date(fuDueDate).toLocaleString()}`,
      authorName: data?.currentMember?.name || 'Pixel 12 Specialist',
      timestamp: new Date().toISOString()
    });

    setFuTitle('');
    setShowAddFollowUp(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="bg-[#0E0E16] border border-[#26263A] w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden my-6 flex flex-col max-h-[92vh]">
        {/* Header Hero Bar */}
        <div className="p-6 bg-gradient-to-r from-[#141422] via-[#12121E] to-[#181828] border-b border-[#242436] shrink-0">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Contact Ident */}
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-14 h-14 rounded-2xl p12-gold-gradient flex items-center justify-center text-black font-black text-xl shadow-lg shadow-[#D4AF37]/20 shrink-0">
                {contact.fullName.charAt(0)}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-display truncate">
                    {contact.fullName}
                  </h1>
                  {/* Stage Dropdown */}
                  <div className="relative">
                    <select
                      value={contact.lifecycleStage}
                      onChange={(e) => handleStageChange(e.target.value as ContactLifecycleStage)}
                      className={`text-xs font-semibold px-3 py-1 rounded-full border cursor-pointer focus:outline-none ${
                        stageBadgeStyle[contact.lifecycleStage].cls
                      } bg-transparent`}
                    >
                      <option value="LEAD" className="bg-[#12121A] text-blue-400">Lead Nuevo</option>
                      <option value="PROSPECT" className="bg-[#12121A] text-[#E5C158]">Prospecto</option>
                      <option value="OPPORTUNITY" className="bg-[#12121A] text-purple-400">En Negociación</option>
                      <option value="CUSTOMER" className="bg-[#12121A] text-emerald-400">Cliente Activo</option>
                      <option value="CHURNED" className="bg-[#12121A] text-zinc-400">Inactivo</option>
                    </select>
                  </div>
                  {/* Lead Score */}
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#E5C158] font-mono font-bold">
                    🔥 Score: {contact.leadScore || 80}/100
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400">
                  {contact.position && <span>{contact.position}</span>}
                  {contact.companyName && (
                    <span className="flex items-center gap-1 text-zinc-300 font-medium">
                      <Building2 className="w-3.5 h-3.5 text-[#D4AF37]" /> {contact.companyName}
                    </span>
                  )}
                  {contact.email && (
                    <a
                      href={`mailto:${contact.email}`}
                      className="flex items-center gap-1 hover:text-[#D4AF37] transition-colors"
                    >
                      <Mail className="w-3.5 h-3.5" /> {contact.email}
                    </a>
                  )}
                  {contact.phone && (
                    <a
                      href={`https://wa.me/${contact.phone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-emerald-400 hover:underline"
                    >
                      <Phone className="w-3.5 h-3.5" /> {contact.phone}
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Top Action CTAs */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() =>
                  openCommercialAI({
                    clientName: contact.fullName,
                    companyName: contact.companyName,
                    clientEmail: contact.email,
                    clientPhone: contact.phone,
                    industry: contact.companyName || 'Agencia & Negocios',
                    generationType: 'EMAIL_PITCH'
                  })
                }
                className="px-3 py-2 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/40 text-[#E5C158] hover:bg-[#D4AF37]/20 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
                title="Generar propuesta o email con IA"
              >
                <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                <span>IA Comercial</span>
              </button>

              <button
                onClick={() => {
                  setSelectedQuote(null);
                  setIsCreateQuoteOpen(true);
                }}
                className="px-3 py-2 rounded-xl bg-[#1C1C2C] border border-[#2E2E44] text-zinc-200 hover:text-white hover:border-[#D4AF37]/50 text-xs font-medium flex items-center gap-1.5 transition-all"
              >
                <FileText className="w-4 h-4 text-[#D4AF37]" />
                <span>+ Cotización</span>
              </button>

              <button
                onClick={() => onEdit(contact)}
                className="p-2 rounded-xl border border-[#2A2A3E] text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-colors"
                title="Editar datos del contacto"
              >
                <Edit3 className="w-4 h-4" />
              </button>

              <button
                onClick={onClose}
                className="p-2 rounded-xl border border-[#2A2A3E] text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Metrics Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-[#222234]">
            <div className="bg-[#10101A] border border-[#202030] rounded-xl p-2.5">
              <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold block">
                Total en Pipeline
              </span>
              <span className="text-base font-bold text-[#E5C158] font-mono">
                ${totalDealsValue.toLocaleString()} USD
              </span>
            </div>
            <div className="bg-[#10101A] border border-[#202030] rounded-xl p-2.5">
              <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold block">
                Oportunidades
              </span>
              <span className="text-base font-bold text-white">
                {contactDeals.length} {contactDeals.length === 1 ? 'Deal' : 'Deals'}
              </span>
            </div>
            <div className="bg-[#10101A] border border-[#202030] rounded-xl p-2.5">
              <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold block">
                Cotizaciones
              </span>
              <span className="text-base font-bold text-white">
                {contactQuotes.length} Creadas
              </span>
            </div>
            <div className="bg-[#10101A] border border-[#202030] rounded-xl p-2.5">
              <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold block">
                Seguimientos Pendientes
              </span>
              <span className="text-base font-bold text-amber-400">
                {contactFollowUps.filter((f) => f.status === 'PENDING').length}
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#222234] bg-[#0C0C14] px-6 shrink-0 overflow-x-auto">
          {[
            { id: 'overview', label: 'Visión 360° & Info', icon: User },
            { id: 'deals', label: `Negocios (${contactDeals.length})`, icon: Layers },
            { id: 'quotes', label: `Cotizaciones (${contactQuotes.length})`, icon: FileText },
            { id: 'followups', label: `Seguimientos (${contactFollowUps.length})`, icon: Clock },
            { id: 'history', label: `Historial (${contactActivities.length})`, icon: TrendingUp }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3.5 px-4 font-semibold text-xs sm:text-sm flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
                  isActive
                    ? 'border-[#D4AF37] text-[#E5C158] bg-[#D4AF37]/5'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left 2 Cols: Details & Services */}
              <div className="md:col-span-2 space-y-6">
                {/* Contracted Services */}
                <div className="bg-[#12121C] border border-[#242436] rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wider">
                      <Briefcase className="w-4 h-4 text-[#D4AF37]" /> Servicios & Planes Contratados
                    </h3>
                    <span className="text-xs text-zinc-400">
                      {contact.contractedServices?.length || 0} activos
                    </span>
                  </div>

                  {contact.contractedServices && contact.contractedServices.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {contact.contractedServices.map((service, idx) => (
                        <div
                          key={service.id || idx}
                          className="bg-[#181826] border border-[#2A2A3E] rounded-xl p-3.5 flex items-center justify-between"
                        >
                          <div>
                            <span className="text-xs font-bold text-white block">
                              {service.serviceName}
                            </span>
                            <span className="text-[11px] text-zinc-400">
                              Desde: {new Date(service.startDate).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-mono font-bold text-[#E5C158] block">
                              ${service.monthlyFee}/mes
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                              {service.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 border border-dashed border-[#2A2A3E] rounded-xl text-zinc-500 text-xs">
                      No tiene planes contratados registrados aún. Crea una cotización o añade servicios al editar la ficha.
                    </div>
                  )}
                </div>

                {/* Notes & Observation Block */}
                <div className="bg-[#12121C] border border-[#242436] rounded-2xl p-5">
                  <h3 className="text-sm font-bold text-white mb-3 uppercase tracking-wider flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-[#D4AF37]" /> Notas Comerciales & Observaciones
                  </h3>
                  <div className="bg-[#181826] border border-[#28283C] rounded-xl p-4 text-xs sm:text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
                    {contact.notes || 'Sin notas registradas aún en el perfil.'}
                  </div>
                </div>
              </div>

              {/* Right Col: Details card & Tags */}
              <div className="space-y-6">
                <div className="bg-[#12121C] border border-[#242436] rounded-2xl p-5 space-y-4">
                  <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                    Información de Contacto
                  </h3>

                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="text-zinc-500 block">Canal de Origen:</span>
                      <span className="text-zinc-200 font-semibold">{contact.source || 'Directo'}</span>
                    </div>

                    <div>
                      <span className="text-zinc-500 block">Asignado a:</span>
                      <span className="text-zinc-200 font-semibold">{contact.assignedToName || 'Equipo Pixel 12'}</span>
                    </div>

                    <div>
                      <span className="text-zinc-500 block">Fecha de Registro:</span>
                      <span className="text-zinc-200">
                        {new Date(contact.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div>
                      <span className="text-zinc-500 block">Último Contacto:</span>
                      <span className="text-zinc-200">
                        {contact.lastContactDate
                          ? new Date(contact.lastContactDate).toLocaleDateString()
                          : 'Hoy'}
                      </span>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="pt-3 border-t border-[#222234]">
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-2">
                      Etiquetas
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {contact.tags && contact.tags.length > 0 ? (
                        contact.tags.map((t, i) => (
                          <span
                            key={i}
                            className="text-[11px] px-2.5 py-1 rounded-lg bg-[#202030] text-zinc-300 border border-[#2E2E42]"
                          >
                            #{t}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-zinc-500">Sin etiquetas</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Direct Connect Card */}
                <div className="bg-[#12121C] border border-[#242436] rounded-2xl p-5">
                  <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">
                    Comunicación Rápida
                  </h3>
                  <div className="space-y-2">
                    {contact.phone && (
                      <a
                        href={`https://wa.me/${contact.phone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2 px-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 text-xs font-semibold flex items-center justify-between transition-colors"
                      >
                        <span className="flex items-center gap-2">
                          <MessageSquare className="w-4 h-4" /> Abrir WhatsApp
                        </span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {contact.email && (
                      <a
                        href={`mailto:${contact.email}`}
                        className="w-full py-2 px-3 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 text-xs font-semibold flex items-center justify-between transition-colors"
                      >
                        <span className="flex items-center gap-2">
                          <Mail className="w-4 h-4" /> Enviar Correo
                        </span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DEALS */}
          {activeTab === 'deals' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Negocios & Oportunidades</h3>
                  <p className="text-xs text-zinc-400">
                    Oportunidades abiertas o cerradas en los pipelines de venta
                  </p>
                </div>
                <button
                  onClick={() => onOpenDealModal(contact.id)}
                  className="px-3.5 py-2 rounded-xl p12-gold-gradient text-black font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-[#D4AF37]/20 hover:brightness-110 transition-all"
                >
                  <Plus className="w-4 h-4" /> Nueva Oportunidad
                </button>
              </div>

              {contactDeals.length > 0 ? (
                <div className="space-y-3">
                  {contactDeals.map((deal) => (
                    <div
                      key={deal.id}
                      className="bg-[#141420] border border-[#252538] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-[#D4AF37]/40 transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white">{deal.title}</h4>
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#222234] border border-[#303046] text-[#E5C158] font-semibold">
                            {deal.stageId}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300">
                            {deal.probability}% prob.
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400 mt-1">
                          Cierre estimado:{' '}
                          {deal.expectedCloseDate
                            ? new Date(deal.expectedCloseDate).toLocaleDateString()
                            : 'Sin fecha'}
                          {deal.notes ? ` • ${deal.notes}` : ''}
                        </p>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="text-base font-bold font-mono text-[#E5C158]">
                          ${(deal.value || 0).toLocaleString()} {deal.currency || 'USD'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 bg-[#12121A] border border-dashed border-[#242436] rounded-2xl space-y-3">
                  <Layers className="w-8 h-8 text-zinc-600 mx-auto" />
                  <p className="text-sm text-zinc-400">No hay oportunidades abiertas para este contacto.</p>
                  <button
                    onClick={() => onOpenDealModal(contact.id)}
                    className="px-4 py-2 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#E5C158] text-xs font-semibold hover:bg-[#D4AF37]/25 transition-colors"
                  >
                    + Crear Primera Oportunidad
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: QUOTES */}
          {activeTab === 'quotes' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Cotizaciones Asociadas</h3>
                  <p className="text-xs text-zinc-400">
                    Propuestas comerciales generadas para {contact.fullName}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSelectedQuote(null);
                    setIsCreateQuoteOpen(true);
                  }}
                  className="px-3.5 py-2 rounded-xl p12-gold-gradient text-black font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-[#D4AF37]/20 hover:brightness-110 transition-all"
                >
                  <Plus className="w-4 h-4" /> Crear Cotización
                </button>
              </div>

              {contactQuotes.length > 0 ? (
                <div className="space-y-3">
                  {contactQuotes.map((q) => (
                    <div
                      key={q.id}
                      className="bg-[#141420] border border-[#252538] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-[#D4AF37]/40 transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-[#E5C158]">
                            {q.number || q.id}
                          </span>
                          <span className="text-sm font-bold text-white">{q.title || 'Propuesta Pixel 12'}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/30 font-semibold">
                            {q.status}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400 mt-1">
                          Emitida: {new Date(q.createdAt).toLocaleDateString()} • Validez: {q.validUntil ? new Date(q.validUntil).toLocaleDateString() : '30 días'}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-base font-bold font-mono text-white">
                          ${q.total.toLocaleString()} {q.currency}
                        </span>
                        <button
                          onClick={() => setSelectedQuote(q)}
                          className="px-3 py-1.5 rounded-lg bg-[#202032] hover:bg-[#2A2A42] text-xs text-zinc-200 hover:text-white border border-[#303048] transition-colors"
                        >
                          Ver PDF / Detalle
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 bg-[#12121A] border border-dashed border-[#242436] rounded-2xl space-y-3">
                  <FileText className="w-8 h-8 text-zinc-600 mx-auto" />
                  <p className="text-sm text-zinc-400">No se han emitido cotizaciones para este cliente todavía.</p>
                  <button
                    onClick={() => {
                      setSelectedQuote(null);
                      setIsCreateQuoteOpen(true);
                    }}
                    className="px-4 py-2 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#E5C158] text-xs font-semibold hover:bg-[#D4AF37]/25 transition-colors"
                  >
                    Crear Nueva Propuesta Comercial
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: FOLLOW-UPS */}
          {activeTab === 'followups' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Seguimientos & Tareas Programadas</h3>
                  <p className="text-xs text-zinc-400">
                    Recordatorios de llamada, WhatsApp, reunión o revisión de propuesta
                  </p>
                </div>
                <button
                  onClick={() => setShowAddFollowUp((prev) => !prev)}
                  className="px-3.5 py-2 rounded-xl bg-[#202032] border border-[#32324A] text-zinc-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-4 h-4" /> {showAddFollowUp ? 'Cancelar' : 'Programar Seguimiento'}
                </button>
              </div>

              {/* Add FollowUp Inline Form */}
              {showAddFollowUp && (
                <form
                  onSubmit={handleCreateFollowUp}
                  className="bg-[#161624] border border-[#2D2D44] rounded-2xl p-4 space-y-3 animate-fadeIn"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                        Motivo del Seguimiento *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ej. Enviar mensaje de WhatsApp para revisar feedback de la propuesta"
                        value={fuTitle}
                        onChange={(e) => setFuTitle(e.target.value)}
                        className="w-full bg-[#11111A] border border-[#2A2A3E] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                        Canal
                      </label>
                      <select
                        value={fuType}
                        onChange={(e) => setFuType(e.target.value as any)}
                        className="w-full bg-[#11111A] border border-[#2A2A3E] rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-[#D4AF37]"
                      >
                        <option value="WHATSAPP">WhatsApp</option>
                        <option value="CALL">Llamada Telefónica</option>
                        <option value="EMAIL">Correo Electrónico</option>
                        <option value="MEETING">Reunión Virtual / Presencial</option>
                        <option value="PROPOSAL_REVIEW">Revisión de Propuesta</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                    <div className="flex items-center gap-2">
                      <label className="text-[11px] font-semibold text-zinc-400">Fecha y Hora:</label>
                      <input
                        type="datetime-local"
                        value={fuDueDate}
                        onChange={(e) => setFuDueDate(e.target.value)}
                        className="bg-[#11111A] border border-[#2A2A3E] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>

                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl p12-gold-gradient text-black font-semibold text-xs hover:brightness-110 shadow-md shadow-[#D4AF37]/20 transition-all"
                    >
                      Guardar Seguimiento
                    </button>
                  </div>
                </form>
              )}

              {/* Followups List */}
              {contactFollowUps.length > 0 ? (
                <div className="space-y-2">
                  {contactFollowUps.map((fu) => {
                    const isDone = fu.status === 'DONE';
                    return (
                      <div
                        key={fu.id}
                        className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                          isDone
                            ? 'bg-[#101018]/50 border-[#1C1C28] opacity-60'
                            : 'bg-[#141422] border-[#26263A]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={isDone}
                            onChange={(e) =>
                              updateFollowUpStatus(fu.id, e.target.checked ? 'DONE' : 'PENDING')
                            }
                            className="w-4 h-4 accent-[#D4AF37] rounded cursor-pointer"
                          />
                          <div>
                            <span
                              className={`text-xs sm:text-sm font-semibold block ${
                                isDone ? 'line-through text-zinc-500' : 'text-zinc-200'
                              }`}
                            >
                              {fu.title}
                            </span>
                            <span className="text-[11px] text-zinc-400 flex items-center gap-2 mt-0.5">
                              <span className="font-bold text-[#E5C158]">{fu.type}</span> • Fecha:{' '}
                              {new Date(fu.dueDate).toLocaleString()}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => deleteFollowUp(fu.id)}
                          className="text-zinc-500 hover:text-rose-400 p-1 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-10 bg-[#12121A] border border-dashed border-[#242436] rounded-2xl text-zinc-400 text-xs">
                  No hay seguimientos registrados. Programa recordatorios para no perder oportunidades de venta.
                </div>
              )}
            </div>
          )}

          {/* TAB 5: HISTORY & ACTIVITIES */}
          {activeTab === 'history' && (
            <div className="space-y-5">
              {/* Quick Note Add */}
              <form onSubmit={handleAddNote} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Escribe una nota rápida o resumen de conversación para la bitácora..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="flex-1 bg-[#141422] border border-[#26263A] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-[#D4AF37]"
                />
                <button
                  type="submit"
                  disabled={isAddingNote || !newNote.trim()}
                  className="px-4 py-2.5 rounded-xl p12-gold-gradient text-black font-semibold text-xs flex items-center gap-1.5 hover:brightness-110 transition-all disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" /> Registrar Nota
                </button>
              </form>

              {/* Timeline */}
              <div className="space-y-3 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-[#202030]">
                {contactActivities.length > 0 ? (
                  contactActivities.map((act) => (
                    <div key={act.id} className="relative flex items-start gap-4 pl-8">
                      <div className="absolute left-1.5 top-1.5 w-4 h-4 rounded-full bg-[#D4AF37] ring-4 ring-[#0E0E16]" />
                      <div className="bg-[#13131F] border border-[#222234] rounded-xl p-3.5 flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-white">{act.title}</span>
                          <span className="text-[10px] text-zinc-400">
                            {new Date(act.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-300">{act.description}</p>
                        <span className="text-[10px] text-zinc-500 mt-1 block">
                          Por: {act.authorName || 'Sistema'}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-zinc-500 text-xs pl-8">
                    Sin eventos registrados aún en el historial.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
