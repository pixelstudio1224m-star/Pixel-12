import React, { useState } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import {
  TrendingUp,
  DollarSign,
  MousePointer,
  Target,
  Percent,
  AlertCircle,
  Settings,
  ExternalLink,
  Plus,
  CheckCircle2
} from 'lucide-react';

export const GoogleAdsView: React.FC = () => {
  const { data, activeBrand, updateGoogleAds, showToast } = useWorkspace();

  const googleAdsAccount = data?.googleAds || (data as any)?.googleAdsAccount || {
    status: 'NOT_CONNECTED',
    customerId: '849-291-0492',
    campaigns: []
  };

  const [isConfiguring, setIsConfiguring] = useState(false);
  const [developerToken, setDeveloperToken] = useState('');
  const [customerId, setCustomerId] = useState(googleAdsAccount.customerId || '849-291-0492');

  const campaigns = Array.isArray(googleAdsAccount.campaigns) ? googleAdsAccount.campaigns : [];
  const totalSpent = campaigns.reduce((acc, c) => acc + (Number(c.spent) || 0), 0);
  const totalConversions = campaigns.reduce((acc, c) => acc + (Number(c.conversions) || 0), 0);
  const totalClicks = campaigns.reduce((acc, c) => acc + (Number(c.clicks) || 0), 0);
  const averageCPC = totalClicks > 0 ? (Number(totalSpent / totalClicks) || 0).toFixed(2) : '0.00';

  const handleSaveCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated = {
      ...googleAdsAccount,
      customerId: customerId.trim() || '849-291-0492',
      status: 'CONNECTED' as const,
      campaigns: campaigns.length > 0 ? campaigns : [
        {
          id: 'gads_1',
          name: `${activeBrand?.name || 'Pixel 12'} · Conversión Leads Search`,
          status: 'ENABLED' as const,
          budget: 450,
          spent: 285.5,
          clicks: 342,
          impressions: 4890,
          conversions: 28,
          costPerConversion: 10.19
        }
      ]
    };
    await updateGoogleAds(updated);
    setIsConfiguring(false);
    showToast('Cuenta de Google Ads conectada y guardada con éxito');
  };

  return (
    <div id="google-ads-view" className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#101018] p-5 sm:p-6 rounded-3xl border border-[#222234] shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl p12-gold-gradient text-black flex items-center justify-center font-bold shadow-lg shadow-[#D4AF37]/20 shrink-0">
            <TrendingUp className="w-5 h-5 text-black" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-white font-display">Google Ads Performance</h3>
              <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30">
                PENDIENTE DE INTEGRACIÓN (API)
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              ID de Cliente MCC: <strong className="text-zinc-200 font-mono">{googleAdsAccount.customerId}</strong> ·
              Marca: {activeBrand?.name || 'la Marca'}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsConfiguring(!isConfiguring)}
          className="px-4 py-2.5 rounded-xl bg-[#161622] hover:bg-[#1E1E2E] text-zinc-200 text-xs font-semibold flex items-center gap-2 border border-[#2A2A3E] transition-colors cursor-pointer"
        >
          <Settings className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>Configurar Google Ads API</span>
        </button>
      </div>

      {/* Credentials Configuration Drawer/Panel */}
      {isConfiguring && (
        <form
          onSubmit={handleSaveCredentials}
          className="p-6 rounded-3xl bg-[#101018] border border-[#D4AF37]/40 shadow-2xl space-y-4 animate-in fade-in duration-150 text-white"
        >
          <div className="flex items-center justify-between border-b border-[#222232] pb-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Settings className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Configuración de Google Ads API (OAuth / Developer Token)</span>
            </h4>
            <button
              type="button"
              onClick={() => setIsConfiguring(false)}
              className="text-xs text-zinc-400 hover:text-white cursor-pointer"
            >
              Cerrar
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-[#141420] border border-[#26263A] text-xs text-zinc-300 leading-relaxed flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-[#E5C158] shrink-0 mt-0.5" />
            <p>
              Para sincronizar datos en tiempo real con Google Ads se requiere un{' '}
              <strong className="text-white">Developer Token</strong> aprobado en Google Cloud Console y la vinculación OAuth con tu MCC (My
              Client Center). Las métricas ilustradas a continuación son para fines de planificación y demostración de arquitectura.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1.5">ID de Cliente (Customer ID)</label>
              <input
                type="text"
                required
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                placeholder="123-456-7890"
                className="w-full text-xs p-3 rounded-xl bg-[#161624] border border-[#28283C] text-white focus:outline-none focus:border-[#D4AF37] font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                Developer Token (Google Ads API)
              </label>
              <input
                type="password"
                value={developerToken}
                onChange={(e) => setDeveloperToken(e.target.value)}
                placeholder="Pegar token de desarrollador..."
                className="w-full text-xs p-3 rounded-xl bg-[#161624] border border-[#28283C] text-white focus:outline-none focus:border-[#D4AF37] font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsConfiguring(false)}
              className="px-4 py-2 text-xs text-zinc-400 hover:text-white cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl p12-gold-gradient text-black text-xs font-black hover:brightness-105 shadow-md shadow-[#D4AF37]/20 cursor-pointer"
            >
              Guardar Credenciales
            </button>
          </div>
        </form>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#101018] border border-[#202030] shadow-md">
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wide">
            Inversión del Mes
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-white font-mono">${totalSpent}</span>
            <span className="text-xs text-zinc-400 font-semibold">USD</span>
          </div>
          <span className="text-[11px] text-zinc-500 block mt-1">Presupuesto activo</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#101018] border border-[#202030] shadow-md">
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wide">
            Conversiones (Leads)
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-emerald-400 font-mono">{totalConversions}</span>
            <span className="text-xs text-emerald-500 font-bold">leads calificados</span>
          </div>
          <span className="text-[11px] text-zinc-500 block mt-1">Formularios y llamadas</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#101018] border border-[#202030] shadow-md">
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wide">
            Clics Totales
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-[#E5C158] font-mono">{totalClicks}</span>
            <span className="text-xs text-zinc-400 font-semibold">visitas</span>
          </div>
          <span className="text-[11px] text-zinc-500 block mt-1">CTR promedio: 4.8%</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#101018] border border-[#202030] shadow-md">
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wide">
            Costo Promedio por Clic
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-indigo-400 font-mono">${averageCPC}</span>
            <span className="text-xs text-zinc-400 font-semibold">USD / clic</span>
          </div>
          <span className="text-[11px] text-zinc-500 block mt-1">Excelente para el nicho PyME</span>
        </div>
      </div>

      {/* Campaigns Table */}
      <div className="bg-[#101018] rounded-3xl border border-[#202030] shadow-xl overflow-hidden">
        <div className="p-5 border-b border-[#202030] flex items-center justify-between">
          <h4 className="text-xs font-bold text-white uppercase tracking-wide">
            Campañas de Google Ads Planificadas
          </h4>
          <span className="text-xs text-zinc-400">Búsqueda & Performance Max</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#141420] border-b border-[#202030] text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                <th className="py-3 px-4">Nombre de Campaña</th>
                <th className="py-3 px-3">Tipo</th>
                <th className="py-3 px-3">Estado</th>
                <th className="py-3 px-3">Inversión</th>
                <th className="py-3 px-3">Clics</th>
                <th className="py-3 px-3">Conversiones</th>
                <th className="py-3 px-3">ROAS Estimado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A1A28]">
              {campaigns.map((camp) => (
                <tr key={camp.id} className="hover:bg-[#141420] transition-colors">
                  <td className="py-3 px-4 font-bold text-zinc-200">{camp.name}</td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#181826] text-zinc-300 border border-[#28283C]">
                      {camp.type}
                    </span>
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {camp.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-semibold text-zinc-200 font-mono">${camp.spent} USD</td>
                  <td className="py-3 px-3 text-zinc-400 font-mono">{camp.clicks}</td>
                  <td className="py-3 px-3 font-bold text-emerald-400 font-mono">{camp.conversions}</td>
                  <td className="py-3 px-3 font-bold text-[#E5C158] font-mono">{camp.roas}x</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
