import React, { useState } from 'react';
import {
  Search,
  Plus,
  User,
  Building2,
  Mail,
  Phone,
  Filter,
  Sparkles,
  FileText,
  Trash2,
  Edit3,
  ExternalLink,
  MessageSquare,
  Tag,
  CheckCircle2
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { CrmContact, ContactLifecycleStage } from '../../types';

interface CrmContactsTableProps {
  onOpenNewContact: () => void;
  onSelectContact: (contact: CrmContact) => void;
  onEditContact: (contact: CrmContact) => void;
}

export const CrmContactsTable: React.FC<CrmContactsTableProps> = ({
  onOpenNewContact,
  onSelectContact,
  onEditContact
}) => {
  const {
    crmContacts,
    crmDeals,
    deleteContact,
    openCommercialAI,
    setIsCreateQuoteOpen,
    setSelectedQuote
  } = useWorkspace();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStageFilter, setSelectedStageFilter] = useState<string>('ALL');

  const filteredContacts = crmContacts.filter((c) => {
    const matchesSearch =
      c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.companyName && c.companyName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.phone && c.phone.includes(searchTerm)) ||
      (c.tags && c.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase())));

    const matchesStage =
      selectedStageFilter === 'ALL' || c.lifecycleStage === selectedStageFilter;

    return matchesSearch && matchesStage;
  });

  const stageBadgeStyle: Record<ContactLifecycleStage, { label: string; cls: string }> = {
    LEAD: { label: 'Lead', cls: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
    PROSPECT: { label: 'Prospecto', cls: 'bg-[#D4AF37]/15 text-[#E5C158] border-[#D4AF37]/30' },
    OPPORTUNITY: { label: 'Oportunidad', cls: 'bg-purple-500/15 text-purple-400 border-purple-500/30' },
    CUSTOMER: { label: 'Cliente', cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
    CHURNED: { label: 'Inactivo', cls: 'bg-zinc-700/30 text-zinc-400 border-zinc-600' }
  };

  return (
    <div className="space-y-4">
      {/* Top Filter & Search Bar */}
      <div className="bg-[#101018] border border-[#222232] rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por nombre, empresa, email, teléfono o etiqueta..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#161622] border border-[#28283C] rounded-xl pl-9 pr-4 py-2 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          {/* Stage Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'ALL', label: 'Todos' },
              { id: 'LEAD', label: 'Leads' },
              { id: 'PROSPECT', label: 'Prospectos' },
              { id: 'OPPORTUNITY', label: 'Oportunidades' },
              { id: 'CUSTOMER', label: 'Clientes' }
            ].map((stage) => {
              const isSelected = selectedStageFilter === stage.id;
              return (
                <button
                  key={stage.id}
                  onClick={() => setSelectedStageFilter(stage.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    isSelected
                      ? 'bg-[#D4AF37]/20 border border-[#D4AF37] text-[#E5C158]'
                      : 'bg-[#161622] border border-[#242436] text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {stage.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Create Contact CTA */}
        <button
          onClick={onOpenNewContact}
          className="px-4 py-2.5 rounded-xl p12-gold-gradient text-black font-semibold text-xs sm:text-sm hover:brightness-110 shadow-lg shadow-[#D4AF37]/20 flex items-center justify-center gap-2 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" /> Nuevo Contacto / Lead
        </button>
      </div>

      {/* Contacts Table / Grid */}
      <div className="bg-[#0E0E16] border border-[#222232] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#141420] border-b border-[#222234] text-[11px] uppercase tracking-wider text-zinc-400 font-bold">
                <th className="py-3.5 px-4">Contacto / Cargo</th>
                <th className="py-3.5 px-4">Empresa</th>
                <th className="py-3.5 px-4">Etapa</th>
                <th className="py-3.5 px-4">Lead Score</th>
                <th className="py-3.5 px-4">Contacto Directo</th>
                <th className="py-3.5 px-4">Deals / Valor</th>
                <th className="py-3.5 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1C1C2C] text-xs">
              {filteredContacts.length > 0 ? (
                filteredContacts.map((contact) => {
                  const deals = crmDeals.filter((d) => d.contactId === contact.id);
                  const dealsVal = deals.reduce((acc, d) => acc + (d.value || 0), 0);
                  const stageInfo =
                    stageBadgeStyle[contact.lifecycleStage] || stageBadgeStyle.LEAD;

                  return (
                    <tr
                      key={contact.id}
                      className="hover:bg-[#141422] transition-colors group"
                    >
                      {/* Name & Role */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => onSelectContact(contact)}
                            className="w-9 h-9 rounded-xl p12-gold-gradient flex items-center justify-center text-black font-bold text-sm shrink-0 shadow-sm"
                          >
                            {contact.fullName.charAt(0)}
                          </button>
                          <div>
                            <button
                              onClick={() => onSelectContact(contact)}
                              className="font-bold text-white hover:text-[#E5C158] text-sm text-left block transition-colors"
                            >
                              {contact.fullName}
                            </button>
                            <span className="text-[11px] text-zinc-400">
                              {contact.position || 'Sin cargo'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Company */}
                      <td className="py-3.5 px-4 text-zinc-300">
                        {contact.companyName ? (
                          <div className="flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-[#D4AF37]" />
                            <span className="font-medium text-white">{contact.companyName}</span>
                          </div>
                        ) : (
                          <span className="text-zinc-600">--</span>
                        )}
                      </td>

                      {/* Stage Badge */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${stageInfo.cls}`}
                        >
                          {stageInfo.label}
                        </span>
                      </td>

                      {/* Score */}
                      <td className="py-3.5 px-4">
                        <span className="text-xs font-mono font-bold text-[#E5C158]">
                          🔥 {contact.leadScore || 70}/100
                        </span>
                      </td>

                      {/* Direct Contact (WA & Email) */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          {contact.phone && (
                            <a
                              href={`https://wa.me/${contact.phone.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                              title="WhatsApp directo"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </a>
                          )}
                          {contact.email && (
                            <a
                              href={`mailto:${contact.email}`}
                              className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors"
                              title="Enviar correo"
                            >
                              <Mail className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </td>

                      {/* Deals / Total Value */}
                      <td className="py-3.5 px-4">
                        {deals.length > 0 ? (
                          <div>
                            <span className="font-mono font-bold text-[#E5C158] block">
                              ${dealsVal.toLocaleString()}
                            </span>
                            <span className="text-[10px] text-zinc-500">
                              {deals.length} {deals.length === 1 ? 'deal' : 'deals'}
                            </span>
                          </div>
                        ) : (
                          <span className="text-zinc-600 text-[11px]">Sin deals</span>
                        )}
                      </td>

                      {/* Action CTAs */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* Ficha 360 */}
                          <button
                            onClick={() => onSelectContact(contact)}
                            className="px-2.5 py-1.5 rounded-lg bg-[#1F1F2E] hover:bg-[#2A2A3E] text-zinc-200 hover:text-white border border-[#2E2E42] text-xs font-medium transition-colors"
                            title="Abrir ficha completa del cliente"
                          >
                            Ver Ficha
                          </button>

                          {/* IA Generator */}
                          <button
                            onClick={() =>
                              openCommercialAI({
                                clientName: contact.fullName,
                                companyName: contact.companyName,
                                clientEmail: contact.email,
                                clientPhone: contact.phone,
                                industry: contact.companyName || 'General',
                                generationType: 'WHATSAPP_CLOSING'
                              })
                            }
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-[#D4AF37] hover:bg-zinc-800 transition-colors"
                            title="Generar copy o mensaje con IA"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => onEditContact(contact)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                            title="Editar contacto"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => deleteContact(contact.id)}
                            className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 transition-colors"
                            title="Eliminar contacto"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-500 text-xs">
                    No se encontraron contactos con los filtros seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
