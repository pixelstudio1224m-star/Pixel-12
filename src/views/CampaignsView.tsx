import React, { useState } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import { Campaign, CampaignStatus } from '../types';
import {
  Megaphone,
  Plus,
  Calendar,
  DollarSign,
  Users,
  CheckCircle2,
  FileText,
  Kanban,
  Trash2,
  Sparkles
} from 'lucide-react';

export const CampaignsView: React.FC = () => {
  const { data, activeBrand, addCampaign, openPostDetail, openCreateWithAI, showToast } =
    useWorkspace();

  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState('');
  const [objective, setObjective] = useState('');
  const [targetAudience, setTargetAudience] = useState(activeBrand.targetAudience);
  const [startDate, setStartDate] = useState('2026-09-01');
  const [endDate, setEndDate] = useState('2026-09-30');
  const [budget, setBudget] = useState(1200);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newCamp: Campaign = {
      id: 'camp_' + Date.now(),
      brandId: activeBrand.id,
      name: name.trim(),
      objective: objective.trim() || 'Generar clientes potenciales para el servicio estrella',
      targetAudience: targetAudience.trim(),
      startDate,
      endDate,
      status: 'ACTIVE',
      budget,
      spent: 0,
      postIds: [],
      taskIds: [],
      createdAt: new Date().toISOString(),
    };

    await addCampaign(newCamp);
    setIsCreating(false);
    setName('');
    setObjective('');
    showToast('Campaña creada exitosamente');
  };

  return (
    <div id="campaigns-view" className="p-6 space-y-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
            <Megaphone className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Campañas Estratégicas</h3>
            <p className="text-xs text-slate-500">
              Campañas para agrupar objetivos, presupuestos de pauta, posts y tareas operativas
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsCreating(true)}
          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ Nueva Campaña</span>
        </button>
      </div>

      {/* Inline Create Form */}
      {isCreating && (
        <form
          onSubmit={handleCreate}
          className="p-5 rounded-2xl bg-white border border-sky-300 shadow-md space-y-4 animate-in fade-in duration-150"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h4 className="text-xs font-bold text-slate-900">+ Crear Nueva Campaña Estratégica</h4>
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="text-xs text-slate-400 hover:text-slate-700"
            >
              Cancelar
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nombre de la campaña</label>
              <input
                type="text"
                required
                placeholder="Ej: Lanzamiento Asistencia Virtual 2.0"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-slate-300 outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Objetivo principal</label>
              <input
                type="text"
                placeholder="Ej: Captar 15 PyMEs interesadas en delegar administración"
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-slate-300 outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Público objetivo</label>
              <input
                type="text"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-slate-300 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Presupuesto ($ USD)</label>
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full text-xs p-2 rounded-lg border border-slate-300 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Fecha de inicio</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Fecha de fin</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800"
            >
              Guardar Campaña
            </button>
          </div>
        </form>
      )}

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.campaigns.map((camp) => {
          const linkedPosts = data.posts.filter((p) => p.campaignId === camp.id);
          const linkedTasks = data.tasks.filter((t) => t.relatedPostId && linkedPosts.some((lp) => lp.id === t.relatedPostId));

          return (
            <div
              key={camp.id}
              className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4 hover:border-slate-300 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase">
                  {camp.status}
                </span>
                <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {camp.startDate} al {camp.endDate}
                </span>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-900">{camp.name}</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{camp.objective}</p>
              </div>

              {/* Budget bar */}
              {camp.budget && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                  <div className="flex justify-between font-semibold">
                    <span className="text-slate-600">Presupuesto de Ads:</span>
                    <span className="text-slate-900">${camp.spent || 0} / ${camp.budget} USD</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className="h-full bg-orange-500 rounded-full"
                      style={{ width: `${Math.min(100, ((camp.spent || 0) / camp.budget) * 100)}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Linked Items Summary */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
                <div className="flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-sky-600" />
                  <span>{linkedPosts.length} publicaciones</span>
                </div>

                <div className="flex items-center gap-1">
                  <Kanban className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{linkedTasks.length} tareas</span>
                </div>

                <button
                  onClick={openCreateWithAI}
                  className="text-xs font-bold text-sky-600 hover:underline flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Generar más posts</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
