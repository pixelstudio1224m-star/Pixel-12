import React, { useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { AgencyPlan, AgencyCustomService, CommercialSettings } from '../../types';
import {
  X,
  Plus,
  Edit3,
  Trash2,
  Check,
  Layers,
  Briefcase,
  Settings2,
  DollarSign,
  Save,
  Star
} from 'lucide-react';

interface PlansCatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PlansCatalogModal: React.FC<PlansCatalogModalProps> = ({
  isOpen,
  onClose
}) => {
  const { data, savePlan, deletePlan, saveCustomService, deleteCustomService, updateCommercialSettings, addToast } = useWorkspace();

  const [activeTab, setActiveTab] = useState<'PLANS' | 'SERVICES' | 'SETTINGS'>('PLANS');

  // Editing or creating a plan
  const [editingPlan, setEditingPlan] = useState<AgencyPlan | null>(null);
  const [editingService, setEditingService] = useState<AgencyCustomService | null>(null);

  // Settings state
  const [settings, setSettings] = useState<CommercialSettings>(
    data.commercialSettings || {
      defaultCurrency: 'USD',
      taxPercent: 15,
      validityDays: 15,
      paymentTermsDefault: '50% anticipo al iniciar y 50% al corte mensual.',
      bankDetails: 'Banco Pichincha - Cta. Corriente #2100234589 a nombre de Pixel 12 Agency.',
      termsAndConditions: 'Validez 15 días. Entregables sujetos a cronograma aprobado.'
    }
  );

  if (!isOpen) return null;

  // Plan Handlers
  const handleSavePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;
    savePlan(editingPlan);
    setEditingPlan(null);
    addToast('Plan guardado correctamente', 'success');
  };

  const handleNewPlan = () => {
    setEditingPlan({
      id: `plan_${Date.now()}`,
      name: 'Nuevo Plan Pixel 12',
      price: 490,
      period: 'mensual',
      description: 'Descripción estratégica del nuevo plan de marketing.',
      services: ['12 Publicaciones mensuales', 'Gestión de Instagram y Facebook', 'Reporte mensual de métricas'],
      benefits: ['Ahorro de más de 30 horas al mes', 'Diseño profesional alineado a tu marca'],
      deliverables: ['Parrilla mensual de contenidos', 'Copys y hashtags optimizados'],
      isPopular: false
    });
  };

  // Service Handlers
  const handleSaveService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService) return;
    saveCustomService(editingService);
    setEditingService(null);
    addToast('Servicio guardado correctamente', 'success');
  };

  const handleNewService = () => {
    setEditingService({
      id: `srv_${Date.now()}`,
      name: 'Nuevo Servicio Especializado',
      category: 'Marketing',
      basePrice: 180,
      description: 'Alcance detallado del nuevo servicio de la agencia.',
      deliverables: ['Entregable 1', 'Entregable 2']
    });
  };

  // Settings Handlers
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateCommercialSettings(settings);
    addToast('Ajustes comerciales actualizados', 'success');
  };

  return (
    <div
      id="plans-catalog-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-5 overflow-y-auto"
    >
      <div className="relative w-full max-w-4xl my-auto bg-[#0E0E12] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between bg-[#121217]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl p12-gold-gradient flex items-center justify-center font-black text-black text-sm">
              <Settings2 className="w-5 h-5 text-black" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                Catálogo de Planes, Servicios & Ajustes Comerciales
              </h2>
              <p className="text-xs text-zinc-400">
                Administra los precios, entregables y datos fiscales de Pixel 12
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

        {/* Tab Navigation */}
        <div className="flex border-b border-zinc-800 bg-[#0B0B0F] px-4 gap-2">
          <button
            onClick={() => setActiveTab('PLANS')}
            className={`py-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'PLANS'
                ? 'border-[#D4AF37] text-[#E5C158]'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Planes de Agencia ({data.plans?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('SERVICES')}
            className={`py-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'SERVICES'
                ? 'border-[#D4AF37] text-[#E5C158]'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Servicios Adicionales ({data.customServices?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('SETTINGS')}
            className={`py-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'SETTINGS'
                ? 'border-[#D4AF37] text-[#E5C158]'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Settings2 className="w-4 h-4" />
            <span>Ajustes Comerciales & Cuentas</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto flex-1 p-5 sm:p-6 space-y-6">
          {/* ======================= TAB 1: PLANS ======================= */}
          {activeTab === 'PLANS' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-zinc-400">
                  Configura los paquetes mensuales o recurrentes ofrecidos por Pixel 12.
                </p>
                <button
                  onClick={handleNewPlan}
                  className="px-3 py-1.5 rounded-xl p12-gold-gradient text-black text-xs font-bold flex items-center gap-1.5 shadow-sm hover:brightness-110"
                >
                  <Plus className="w-3.5 h-3.5 text-black" />
                  <span>Crear Nuevo Plan</span>
                </button>
              </div>

              {/* Plan Edit Form */}
              {editingPlan && (
                <form
                  onSubmit={handleSavePlan}
                  className="bg-[#121217] p-4 rounded-xl border border-[#D4AF37]/40 space-y-4 shadow-lg"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                    <h3 className="text-xs font-bold text-[#D4AF37] uppercase">
                      {editingPlan.id.startsWith('plan_') ? 'Editar / Configurar Plan' : 'Nuevo Plan'}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setEditingPlan(null)}
                      className="text-xs text-zinc-400 hover:text-white"
                    >
                      Cancelar
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="text-[11px] text-zinc-400 block mb-1">Nombre del Plan</label>
                      <input
                        type="text"
                        required
                        value={editingPlan.name}
                        onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-zinc-400 block mb-1">Precio ($ USD)</label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={editingPlan.price}
                        onChange={(e) => setEditingPlan({ ...editingPlan, price: Number(e.target.value) })}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] text-zinc-400 block mb-1">Descripción corta</label>
                    <textarea
                      rows={2}
                      value={editingPlan.description}
                      onChange={(e) => setEditingPlan({ ...editingPlan, description: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-zinc-400 block mb-1">
                        Servicios incluidos (uno por línea)
                      </label>
                      <textarea
                        rows={3}
                        value={(editingPlan.services || editingPlan.includedServices || []).join('\n')}
                        onChange={(e) =>
                          setEditingPlan({
                            ...editingPlan,
                            services: e.target.value.split('\n').filter((s) => s.trim())
                          })
                        }
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 resize-none font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-zinc-400 block mb-1">
                        Entregables tangibles (uno por línea)
                      </label>
                      <textarea
                        rows={3}
                        value={(editingPlan.deliverables || []).join('\n')}
                        onChange={(e) =>
                          setEditingPlan({
                            ...editingPlan,
                            deliverables: e.target.value.split('\n').filter((d) => d.trim())
                          })
                        }
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 resize-none font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-300">
                      <input
                        type="checkbox"
                        checked={editingPlan.isPopular}
                        onChange={(e) => setEditingPlan({ ...editingPlan, isPopular: e.target.checked })}
                        className="rounded border-zinc-700 text-[#D4AF37] focus:ring-[#D4AF37]"
                      />
                      <span>Destacar como "Plan Popular"</span>
                    </label>

                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-lg p12-gold-gradient text-black text-xs font-bold flex items-center gap-1"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Guardar Plan</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Plans List Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {data.plans?.map((plan) => (
                  <div
                    key={plan.id}
                    className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-sm font-bold text-white">{plan.name}</h4>
                            {plan.isPopular && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#D4AF37]/20 text-[#E5C158] font-bold">
                                POPULAR
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-[#D4AF37] font-mono font-bold">
                            ${plan.price} <span className="text-[10px] text-zinc-500 font-normal">/ {plan.period || plan.cadence || 'mes'}</span>
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setEditingPlan(plan)}
                            className="p-1 text-zinc-400 hover:text-white rounded"
                            title="Editar"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deletePlan(plan.id)}
                            className="p-1 text-zinc-500 hover:text-red-400 rounded"
                            title="Eliminar"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <p className="text-xs text-zinc-400 line-clamp-2 mb-3 leading-relaxed">
                        {plan.description}
                      </p>

                      <div className="space-y-1 mb-3">
                        <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold block">
                          Incluye:
                        </span>
                        {(plan.services || plan.includedServices || []).slice(0, 3).map((s, idx) => (
                          <p key={idx} className="text-xs text-zinc-300 flex items-center gap-1.5">
                            <span className="w-1 h-1 rounded-full bg-[#D4AF37]" />
                            <span className="truncate">{s}</span>
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ======================= TAB 2: SERVICES ======================= */}
          {activeTab === 'SERVICES' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-zinc-400">
                  Servicios complementarios o independientes que se pueden sumar a una cotización.
                </p>
                <button
                  onClick={handleNewService}
                  className="px-3 py-1.5 rounded-xl p12-gold-gradient text-black text-xs font-bold flex items-center gap-1.5 shadow-sm hover:brightness-110"
                >
                  <Plus className="w-3.5 h-3.5 text-black" />
                  <span>Crear Nuevo Servicio</span>
                </button>
              </div>

              {/* Service Edit Form */}
              {editingService && (
                <form
                  onSubmit={handleSaveService}
                  className="bg-[#121217] p-4 rounded-xl border border-[#D4AF37]/40 space-y-4 shadow-lg"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                    <h3 className="text-xs font-bold text-[#D4AF37] uppercase">
                      Configurar Servicio Adicional
                    </h3>
                    <button
                      type="button"
                      onClick={() => setEditingService(null)}
                      className="text-xs text-zinc-400 hover:text-white"
                    >
                      Cancelar
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] text-zinc-400 block mb-1">Nombre del Servicio</label>
                      <input
                        type="text"
                        required
                        value={editingService.name}
                        onChange={(e) => setEditingService({ ...editingService, name: e.target.value })}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-zinc-400 block mb-1">Categoría</label>
                      <input
                        type="text"
                        required
                        value={editingService.category}
                        onChange={(e) => setEditingService({ ...editingService, category: e.target.value })}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-zinc-400 block mb-1">Precio Base ($ USD)</label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={editingService.basePrice}
                        onChange={(e) =>
                          setEditingService({ ...editingService, basePrice: Number(e.target.value) })
                        }
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] text-zinc-400 block mb-1">Descripción</label>
                    <textarea
                      rows={2}
                      value={editingService.description}
                      onChange={(e) => setEditingService({ ...editingService, description: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 resize-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-zinc-400 block mb-1">
                      Entregables (uno por línea)
                    </label>
                    <textarea
                      rows={2}
                      value={editingService.deliverables.join('\n')}
                      onChange={(e) =>
                        setEditingService({
                          ...editingService,
                          deliverables: e.target.value.split('\n').filter((d) => d.trim())
                        })
                      }
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 resize-none font-mono"
                    />
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-lg p12-gold-gradient text-black text-xs font-bold flex items-center gap-1"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Guardar Servicio</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Services List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {data.customServices?.map((service) => (
                  <div
                    key={service.id}
                    className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-start justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-white">{service.name}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                          {service.category}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 line-clamp-2 mb-2 leading-relaxed">
                        {service.description}
                      </p>
                      <span className="text-xs font-mono font-bold text-[#D4AF37]">
                        ${service.basePrice} USD
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => setEditingService(service)}
                        className="p-1 text-zinc-400 hover:text-white rounded"
                        title="Editar"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteCustomService(service.id)}
                        className="p-1 text-zinc-500 hover:text-red-400 rounded"
                        title="Eliminar"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ======================= TAB 3: COMMERCIAL SETTINGS ======================= */}
          {activeTab === 'SETTINGS' && (
            <form onSubmit={handleSaveSettings} className="space-y-4 max-w-2xl">
              <p className="text-xs text-zinc-400">
                Ajusta las tasas impositivas por defecto, días de validez y datos bancarios que aparecerán en todas las cotizaciones de Pixel 12.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">Moneda por defecto</label>
                  <input
                    type="text"
                    value={settings.defaultCurrency}
                    onChange={(e) => setSettings({ ...settings, defaultCurrency: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-white uppercase font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">IVA / Impuesto (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={settings.taxPercent}
                    onChange={(e) => setSettings({ ...settings, taxPercent: Number(e.target.value) })}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">Días de Validez</label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={settings.validityDays}
                    onChange={(e) => setSettings({ ...settings, validityDays: Number(e.target.value) })}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">
                  Condición de pago por defecto
                </label>
                <textarea
                  rows={2}
                  value={settings.paymentTermsDefault}
                  onChange={(e) => setSettings({ ...settings, paymentTermsDefault: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">
                  Datos de Cuentas Bancarias para Transferencias
                </label>
                <textarea
                  rows={3}
                  value={settings.bankDetails}
                  onChange={(e) => setSettings({ ...settings, bankDetails: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">
                  Términos & Condiciones comerciales
                </label>
                <textarea
                  rows={3}
                  value={settings.termsAndConditions}
                  onChange={(e) => setSettings({ ...settings, termsAndConditions: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl p12-gold-gradient text-black text-xs font-bold flex items-center gap-1.5 shadow-md hover:brightness-110"
                >
                  <Save className="w-4 h-4 text-black" />
                  <span>Guardar Ajustes Comerciales</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
