import React, { useState } from 'react';
import {
  Building2,
  Plus,
  Globe,
  Users,
  MapPin,
  ExternalLink,
  DollarSign,
  Trash2,
  Edit3,
  X,
  CheckCircle2,
  Search
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { CrmCompany } from '../../types';

export const CrmCompaniesList: React.FC = () => {
  const { crmCompanies, crmContacts, crmDeals, saveCompany, deleteCompany } = useWorkspace();

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<CrmCompany | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [industry, setIndustry] = useState('');
  const [website, setWebsite] = useState('');
  const [employeeCount, setEmployeeCount] = useState<string>('11-50');
  const [annualRevenue, setAnnualRevenue] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('México');

  const openNewCompany = () => {
    setEditingCompany(null);
    setName('');
    setIndustry('Tecnología & Software');
    setWebsite('');
    setEmployeeCount('11-50');
    setAnnualRevenue('');
    setCity('CDMX');
    setCountry('México');
    setIsModalOpen(true);
  };

  const openEditCompany = (comp: CrmCompany) => {
    setEditingCompany(comp);
    setName(comp.name);
    setIndustry(comp.industry || '');
    setWebsite(comp.website || '');
    setEmployeeCount(comp.employeeCount || '11-50');
    setAnnualRevenue(comp.annualRevenue || '');
    setCity(comp.city || '');
    setCountry(comp.country || 'México');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newCompany: CrmCompany = {
      id: editingCompany?.id || `comp_${Date.now()}`,
      name: name.trim(),
      industry: industry.trim() || undefined,
      website: website.trim() || undefined,
      employeeCount: employeeCount || undefined,
      annualRevenue: annualRevenue.trim() || undefined,
      city: city.trim() || undefined,
      country: country.trim() || undefined,
      createdAt: editingCompany?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await saveCompany(newCompany);
    setIsModalOpen(false);
  };

  const filteredCompanies = crmCompanies.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.industry && c.industry.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-4">
      {/* Top Bar */}
      <div className="bg-[#101018] border border-[#222232] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar empresa o industria..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#161622] border border-[#28283C] rounded-xl pl-9 pr-4 py-2 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#D4AF37]"
          />
        </div>

        <button
          onClick={openNewCompany}
          className="px-4 py-2.5 rounded-xl p12-gold-gradient text-black font-semibold text-xs sm:text-sm hover:brightness-110 shadow-lg shadow-[#D4AF37]/20 flex items-center justify-center gap-2 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" /> Nueva Empresa
        </button>
      </div>

      {/* Grid of Companies */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCompanies.map((comp) => {
          const associatedContacts = crmContacts.filter((c) => c.companyId === comp.id);
          const associatedDeals = crmDeals.filter((d) => d.companyId === comp.id);
          const totalVal = associatedDeals.reduce((sum, d) => sum + (d.value || 0), 0);

          return (
            <div
              key={comp.id}
              className="bg-[#12121C] border border-[#242436] rounded-2xl p-5 hover:border-[#D4AF37]/50 transition-all flex flex-col justify-between space-y-4 shadow-lg"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#E5C158] font-bold text-base shrink-0">
                      {comp.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base leading-tight">
                        {comp.name}
                      </h3>
                      <span className="text-xs text-[#E5C158] font-medium block">
                        {comp.industry || 'Empresa Comercial'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditCompany(comp)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteCompany(comp.id)}
                      className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Details List */}
                <div className="mt-4 space-y-2 text-xs text-zinc-400">
                  {comp.website && (
                    <div className="flex items-center gap-2">
                      <Globe className="w-3.5 h-3.5 text-zinc-500" />
                      <a
                        href={comp.website.startsWith('http') ? comp.website : `https://${comp.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-zinc-300 hover:text-[#D4AF37] truncate"
                      >
                        {comp.website}
                      </a>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-zinc-500" />
                    <span>{associatedContacts.length} contactos asociados</span>
                  </div>

                  {(comp.city || comp.country) && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                      <span>{[comp.city, comp.country].filter(Boolean).join(', ')}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Pipeline Value */}
              <div className="pt-3 border-t border-[#202030] flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-semibold">
                    Pipeline Asociado
                  </span>
                  <span className="text-sm font-bold font-mono text-[#E5C158]">
                    ${totalVal.toLocaleString()} USD
                  </span>
                </div>
                <span className="text-[11px] text-zinc-400">
                  {associatedDeals.length} {associatedDeals.length === 1 ? 'oportunidad' : 'oportunidades'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Company Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#12121A] border border-[#2A2A3C] w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[#222232] flex items-center justify-between">
              <h2 className="text-base font-bold text-white font-display">
                {editingCompany ? 'Editar Empresa' : 'Nueva Empresa'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-zinc-300 font-semibold mb-1 uppercase tracking-wider">
                  Nombre de la Empresa *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Acme Global"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#181824] border border-[#2D2D42] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1 uppercase tracking-wider">
                    Industria / Sector
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Fintech, E-commerce"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full bg-[#181824] border border-[#2D2D42] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 font-semibold mb-1 uppercase tracking-wider">
                    Sitio Web
                  </label>
                  <input
                    type="text"
                    placeholder="https://ejemplo.com"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="w-full bg-[#181824] border border-[#2D2D42] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1 uppercase tracking-wider">
                    Ciudad
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Bogotá, CDMX, Miami"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-[#181824] border border-[#2D2D42] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 font-semibold mb-1 uppercase tracking-wider">
                    País
                  </label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full bg-[#181824] border border-[#2D2D42] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-[#222232] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-zinc-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl p12-gold-gradient text-black font-semibold text-xs hover:brightness-110 shadow-lg shadow-[#D4AF37]/20"
                >
                  Guardar Empresa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
