import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Building2,
  Mail,
  Phone,
  Briefcase,
  Target,
  Tag,
  CheckCircle2,
  FileText,
  DollarSign
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { CrmContact, ContactLifecycleStage } from '../../types';

interface ContactModalProps {
  contact: CrmContact | null;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (saved: CrmContact) => void;
}

export const ContactModal: React.FC<ContactModalProps> = ({
  contact,
  isOpen,
  onClose,
  onSave
}) => {
  const { crmCompanies, plans, customServices, saveContact, data } = useWorkspace();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [position, setPosition] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [lifecycleStage, setLifecycleStage] = useState<ContactLifecycleStage>('LEAD');
  const [source, setSource] = useState('Website Pixel 12');
  const [leadScore, setLeadScore] = useState<number>(75);
  const [tagsInput, setTagsInput] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedPlanIds, setSelectedPlanIds] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (contact) {
      setFullName(contact.fullName || '');
      setEmail(contact.email || '');
      setPhone(contact.phone || '');
      setPosition(contact.position || '');
      setCompanyId(contact.companyId || '');
      setLifecycleStage(contact.lifecycleStage || 'LEAD');
      setSource(contact.source || 'Website Pixel 12');
      setLeadScore(contact.leadScore ?? 75);
      setTagsInput(contact.tags ? contact.tags.join(', ') : '');
      setNotes(contact.notes || '');
      setSelectedPlanIds(
        contact.contractedServices ? contact.contractedServices.map((s) => s.serviceName) : []
      );
    } else {
      setFullName('');
      setEmail('');
      setPhone('');
      setPosition('');
      setCompanyId('');
      setLifecycleStage('LEAD');
      setSource('Instagram Ads');
      setLeadScore(80);
      setTagsInput('Lead Calificado, E-commerce');
      setNotes('');
      setSelectedPlanIds([]);
    }
  }, [contact, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    setIsSaving(true);
    try {
      const selectedCompany = crmCompanies.find((c) => c.id === companyId);
      const parsedTags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const contractedServices = selectedPlanIds.map((planName) => {
        const foundPlan = plans.find((p) => p.name === planName);
        return {
          id: `serv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          serviceName: planName,
          status: 'ACTIVE' as const,
          monthlyFee: foundPlan ? foundPlan.price : 1500,
          startDate: new Date().toISOString()
        };
      });

      const newContact: CrmContact = {
        id: contact?.id || `cont_${Date.now()}`,
        fullName: fullName.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        position: position.trim() || undefined,
        companyId: companyId || undefined,
        companyName: selectedCompany?.name || undefined,
        lifecycleStage,
        source,
        leadScore: Number(leadScore) || 70,
        tags: parsedTags,
        notes: notes.trim(),
        contractedServices: contractedServices.length > 0 ? contractedServices : contact?.contractedServices || [],
        assignedToId: data.currentMember.id,
        assignedToName: data.currentMember.name,
        createdAt: contact?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const saved = await saveContact(newContact);
      if (onSave) onSave(saved);
      onClose();
    } catch (err) {
      console.error(err);
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
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide font-display">
                {contact ? 'Editar Contacto / Lead' : 'Nuevo Contacto / Lead'}
              </h2>
              <p className="text-xs text-zinc-400">
                Ficha central de cliente para CRM comercial Pixel 12
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
          {/* Full Name & Position */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
                Nombre Completo *
              </label>
              <input
                type="text"
                required
                placeholder="Ej. Sofia Martínez"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-[#181824] border border-[#2D2D42] rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
                Cargo / Rol
              </label>
              <input
                type="text"
                placeholder="Ej. Directora de Marketing"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="w-full bg-[#181824] border border-[#2D2D42] rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
          </div>

          {/* Email & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#D4AF37]" /> Correo Electrónico
              </label>
              <input
                type="email"
                placeholder="sofia@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#181824] border border-[#2D2D42] rounded-xl px-4 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#D4AF37]" /> Teléfono / WhatsApp
              </label>
              <input
                type="tel"
                placeholder="+52 55 1234 5678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-[#181824] border border-[#2D2D42] rounded-xl px-4 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
          </div>

          {/* Company & Lifecycle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-[#D4AF37]" /> Empresa Asociada
              </label>
              <select
                value={companyId}
                onChange={(e) => setCompanyId(e.target.value)}
                className="w-full bg-[#181824] border border-[#2D2D42] rounded-xl px-3 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-[#D4AF37]"
              >
                <option value="">-- Sin empresa asignada --</option>
                {crmCompanies.map((comp) => (
                  <option key={comp.id} value={comp.id}>
                    {comp.name} {comp.industry ? `(${comp.industry})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
                Etapa del Ciclo de Vida
              </label>
              <select
                value={lifecycleStage}
                onChange={(e) => setLifecycleStage(e.target.value as ContactLifecycleStage)}
                className="w-full bg-[#181824] border border-[#2D2D42] rounded-xl px-3 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-[#D4AF37]"
              >
                <option value="LEAD">Lead (Nuevo Prospecto)</option>
                <option value="PROSPECT">Prospecto Calificado</option>
                <option value="OPPORTUNITY">Oportunidad en Negociación</option>
                <option value="CUSTOMER">Cliente Activo</option>
                <option value="CHURNED">Inactivo / Cancelado</option>
              </select>
            </div>
          </div>

          {/* Source & Lead Score */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-[#D4AF37]" /> Canal de Origen (Fuente)
              </label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full bg-[#181824] border border-[#2D2D42] rounded-xl px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-[#D4AF37]"
              >
                <option value="Website Pixel 12">Website / Landing Page</option>
                <option value="Meta Ads">Anuncios Meta (Instagram/FB)</option>
                <option value="Google Ads">Google Search / Performance Max</option>
                <option value="Referral">Recomendación / Referido</option>
                <option value="LinkedIn Outbound">LinkedIn Outbound</option>
                <option value="Evento / Networking">Evento / Conferencia</option>
                <option value="Otro">Otro</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider flex items-center justify-between">
                <span>Lead Score</span>
                <span className="text-[#D4AF37] font-bold">{leadScore}/100</span>
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={leadScore}
                onChange={(e) => setLeadScore(parseInt(e.target.value, 10))}
                className="w-full accent-[#D4AF37] cursor-pointer mt-2"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-[#D4AF37]" /> Etiquetas (separadas por coma)
            </label>
            <input
              type="text"
              placeholder="VIP, Decisor, Interés Alto, E-commerce"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full bg-[#181824] border border-[#2D2D42] rounded-xl px-4 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          {/* Contracted Plans Quick Select */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-[#D4AF37]" /> Servicios / Planes Contratados
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {plans.map((p) => {
                const isSelected = selectedPlanIds.includes(p.name);
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        setSelectedPlanIds(selectedPlanIds.filter((name) => name !== p.name));
                      } else {
                        setSelectedPlanIds([...selectedPlanIds, p.name]);
                      }
                    }}
                    className={`text-xs p-2.5 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                      isSelected
                        ? 'bg-[#D4AF37]/15 border-[#D4AF37] text-white'
                        : 'bg-[#181824] border-[#2B2B3E] text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <span className="font-semibold truncate">{p.name}</span>
                    <span className="text-[11px] text-[#E5C158] font-mono">${p.price}/mes</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
              Notas y Contexto del Cliente
            </label>
            <textarea
              rows={3}
              placeholder="Historial de contacto, presupuesto disponible, objeciones previas..."
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
                  {contact ? 'Actualizar Contacto' : 'Crear Contacto'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
