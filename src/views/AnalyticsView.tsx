import React from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import { BarChart3, TrendingUp, Users, Eye, ThumbsUp, Share2, Instagram, Linkedin, Facebook } from 'lucide-react';

export const AnalyticsView: React.FC = () => {
  const { data, activeBrand } = useWorkspace();

  const platformStats = [
    { name: 'Instagram', followers: '14,820', reach: '48,200', engagement: '4.2%', icon: Instagram, color: 'text-pink-600' },
    { name: 'LinkedIn', followers: '8,450', reach: '32,100', engagement: '5.8%', icon: Linkedin, color: 'text-sky-700' },
    { name: 'Facebook', followers: '19,300', reach: '24,500', engagement: '2.1%', icon: Facebook, color: 'text-blue-600' },
  ];

  const formatPerformance = [
    { format: 'Carrusel Educativo', saves: 420, shares: 195, avgReach: '6,400', bestFor: 'Retención y autoridad' },
    { format: 'Reel Dinámico', saves: 290, shares: 540, avgReach: '12,800', bestFor: 'Alcance viral' },
    { format: 'Post Estático Frase', saves: 110, shares: 85, avgReach: '3,200', bestFor: 'Comunidad rápida' },
    { format: 'Artículo LinkedIn', saves: 310, shares: 140, avgReach: '5,100', bestFor: 'Conversión B2B' },
  ];

  return (
    <div id="analytics-view" className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center font-bold">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Métricas & Analítica de Redes</h3>
            <p className="text-xs text-slate-500">
              Rendimiento multicanal consolidado para {activeBrand.name}
            </p>
          </div>
        </div>

        <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600">
          Últimos 30 días
        </span>
      </div>

      {/* Overview Numbers */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Alcance Total</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-slate-900">104.8K</span>
            <span className="text-xs text-emerald-600 font-bold">+18.4%</span>
          </div>
          <span className="text-[11px] text-slate-500 block mt-1">Cuentas alcanzadas</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Tasa de Interacción</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-indigo-600">4.7%</span>
            <span className="text-xs text-emerald-600 font-bold">+0.6%</span>
          </div>
          <span className="text-[11px] text-slate-500 block mt-1">Engagement promedio</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Contenido Guardado</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-orange-600">1,130</span>
            <span className="text-xs text-emerald-600 font-bold">+32%</span>
          </div>
          <span className="text-[11px] text-slate-500 block mt-1">Saves en carruseles</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Seguidores Netos</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-emerald-600">+890</span>
            <span className="text-xs text-slate-500 font-semibold">este mes</span>
          </div>
          <span className="text-[11px] text-slate-500 block mt-1">Orgánicos + Ads</span>
        </div>
      </div>

      {/* Platform Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {platformStats.map((plat) => {
          const Icon = plat.icon;
          return (
            <div key={plat.name} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className={`w-5 h-5 ${plat.color}`} />
                  <h4 className="text-sm font-bold text-slate-900">{plat.name}</h4>
                </div>
                <span className="text-xs font-bold text-slate-700">{plat.followers} seguidores</span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                <div className="flex justify-between">
                  <span>Alcance mensual:</span>
                  <strong className="text-slate-800">{plat.reach}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Engagement rate:</span>
                  <strong className="text-indigo-600">{plat.engagement}</strong>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Format Performance */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
            Efectividad por Formato de Contenido
          </h4>
          <span className="text-xs text-slate-500">Métricas acumuladas del calendario</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Formato</th>
                <th className="py-3 px-3">Alcance Promedio</th>
                <th className="py-3 px-3">Guardados (Saves)</th>
                <th className="py-3 px-3">Compartidos (Shares)</th>
                <th className="py-3 px-3">Objetivo Estratégico</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {formatPerformance.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900">{item.format}</td>
                  <td className="py-3 px-3 font-semibold text-slate-800">{item.avgReach}</td>
                  <td className="py-3 px-3 text-emerald-600 font-bold">{item.saves}</td>
                  <td className="py-3 px-3 text-sky-600 font-bold">{item.shares}</td>
                  <td className="py-3 px-3 text-slate-600">{item.bestFor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
