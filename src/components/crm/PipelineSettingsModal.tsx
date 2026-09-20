import React, { useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { CrmPipeline, CrmPipelineStage } from '../../types/crm';
import {
  X,
  Plus,
  Trash2,
  Settings2,
  Check,
  MoveUp,
  MoveDown,
  Layers,
  Palette
} from 'lucide-react';

interface PipelineSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPipelineId?: string;
  onSelectPipeline?: (id: string) => void;
}

const STAGE_COLORS = [
  '#3b82f6', // blue
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#f59e0b', // amber
  '#10b981', // emerald
  '#ef4444', // red
  '#06b6d4', // cyan
];

export const PipelineSettingsModal: React.FC<PipelineSettingsModalProps> = ({
  isOpen,
  onClose,
  currentPipelineId,
  onSelectPipeline
}) => {
  const { crmPipelines, savePipeline, deletePipeline, showToast } = useWorkspace();

  const [selectedPipelineId, setSelectedPipelineId] = useState<string>(
    currentPipelineId || crmPipelines[0]?.id || ''
  );

  const activePipeline =
    crmPipelines.find((p) => p.id === selectedPipelineId) || crmPipelines[0];

  const [pipelineName, setPipelineName] = useState(activePipeline?.name || '');
  const [pipelineDesc, setPipelineDesc] = useState(activePipeline?.description || '');
  const [stages, setStages] = useState<CrmPipelineStage[]>(
    activePipeline?.stages || []
  );

  // Sync state when activePipeline changes
  React.useEffect(() => {
    if (activePipeline) {
      setPipelineName(activePipeline.name);
      setPipelineDesc(activePipeline.description || '');
      setStages(activePipeline.stages || []);
      setSelectedPipelineId(activePipeline.id);
    }
  }, [activePipeline?.id]);

  if (!isOpen) return null;

  const handleCreateNewPipeline = () => {
    const newId = `pipe_${Date.now()}`;
    const newPipe: CrmPipeline = {
      id: newId,
      name: 'Nuevo Embudo Comercial',
      description: 'Embudo de ventas personalizado',
      isDefault: false,
      stages: [
        { id: `stg_${Date.now()}_1`, name: 'Prospecto Calificado', color: '#3b82f6', order: 1, probability: 20, winState: 'OPEN' },
        { id: `stg_${Date.now()}_2`, name: 'Reunión / Diagnóstico', color: '#8b5cf6', order: 2, probability: 40, winState: 'OPEN' },
        { id: `stg_${Date.now()}_3`, name: 'Propuesta Presentada', color: '#f59e0b', order: 3, probability: 70, winState: 'OPEN' },
        { id: `stg_${Date.now()}_4`, name: 'Cerrado Ganado', color: '#10b981', order: 4, probability: 100, winState: 'WON' },
        { id: `stg_${Date.now()}_5`, name: 'Cerrado Perdido', color: '#ef4444', order: 5, probability: 0, winState: 'LOST' },
      ],
      createdAt: new Date().toISOString()
    };
    savePipeline(newPipe);
    setSelectedPipelineId(newId);
    setPipelineName(newPipe.name);
    setPipelineDesc(newPipe.description || '');
    setStages(newPipe.stages);
    showToast('Nuevo embudo creado');
  };

  const handleAddStage = () => {
    const newStage: CrmPipelineStage = {
      id: `stg_${Date.now()}`,
      name: 'Nueva Etapa',
      color: STAGE_COLORS[stages.length % STAGE_COLORS.length],
      order: stages.length + 1,
      probability: 50,
      winState: 'OPEN'
    };
    setStages([...stages, newStage]);
  };

  const handleUpdateStage = (id: string, updates: Partial<CrmPipelineStage>) => {
    setStages(stages.map((stg) => (stg.id === id ? { ...stg, ...updates } : stg)));
  };

  const handleDeleteStage = (id: string) => {
    if (stages.length <= 2) {
      showToast('Un embudo debe tener al menos 2 etapas', 'error');
      return;
    }
    setStages(stages.filter((s) => s.id !== id));
  };

  const handleMoveStage = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= stages.length) return;
    const reordered = [...stages];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIdx, 0, moved);
    const updated = reordered.map((s, idx) => ({ ...s, order: idx + 1 }));
    setStages(updated);
  };

  const handleSaveAll = async () => {
    if (!pipelineName.trim()) {
      showToast('El nombre del embudo es requerido', 'error');
      return;
    }
    if (stages.length < 2) {
      showToast('El embudo debe tener al menos 2 etapas', 'error');
      return;
    }

    const updatedPipeline: CrmPipeline = {
      ...activePipeline,
      name: pipelineName.trim(),
      description: pipelineDesc.trim(),
      stages: stages.map((s, idx) => ({ ...s, order: idx + 1 }))
    };

    await savePipeline(updatedPipeline);
    showToast(`Embudo "${updatedPipeline.name}" guardado correctamente`);
    if (onSelectPipeline) {
      onSelectPipeline(updatedPipeline.id);
    }
    onClose();
  };

  const handleDeleteActivePipeline = async () => {
    if (crmPipelines.length <= 1) {
      showToast('No puedes eliminar el único embudo del CRM', 'error');
      return;
    }
    if (confirm(`¿Seguro que deseas eliminar el embudo "${activePipeline.name}"?`)) {
      await deletePipeline(activePipeline.id);
      showToast('Embudo eliminado');
      const nextPipe = crmPipelines.find((p) => p.id !== activePipeline.id);
      if (nextPipe) {
        setSelectedPipelineId(nextPipe.id);
        if (onSelectPipeline) onSelectPipeline(nextPipe.id);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div className="bg-[#101018] border border-[#262638] rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-[#1E1E2C] flex items-center justify-between bg-[#141420]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#1E1E2E] border border-[#2E2E44] flex items-center justify-center text-[#D4AF37]">
              <Settings2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-display">Configuración de Embudos de Venta</h3>
              <p className="text-xs text-zinc-400">Personaliza tus pipelines comerciales, etapas y probabilidades de cierre</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-[#202030] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Pipeline Selector / Tabs */}
          <div>
            <label className="text-xs font-semibold text-zinc-300 mb-2 block">
              Selecciona o crea un embudo comercial
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {crmPipelines.map((pipe) => (
                <button
                  key={pipe.id}
                  type="button"
                  onClick={() => setSelectedPipelineId(pipe.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 border ${
                    pipe.id === selectedPipelineId
                      ? 'bg-[#1C1C2C] border-[#D4AF37] text-white shadow-md shadow-[#D4AF37]/10'
                      : 'bg-[#12121C] border-[#222234] text-zinc-400 hover:text-white'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>{pipe.name}</span>
                  {pipe.isDefault && (
                    <span className="text-[9px] px-1.5 py-0.2 bg-[#D4AF37]/20 text-[#E5C158] rounded">Predeterminado</span>
                  )}
                </button>
              ))}

              <button
                type="button"
                onClick={handleCreateNewPipeline}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#181828] border border-dashed border-[#3A3A52] text-[#E5C158] hover:border-[#D4AF37] transition-all flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Crear Nuevo Embudo</span>
              </button>
            </div>
          </div>

          {/* Pipeline Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#141420] p-4 rounded-2xl border border-[#222234]">
            <div>
              <label className="text-xs text-zinc-400 block mb-1">Nombre del Embudo</label>
              <input
                type="text"
                value={pipelineName}
                onChange={(e) => setPipelineName(e.target.value)}
                className="w-full px-3 py-2 bg-[#0E0E16] border border-[#28283E] rounded-xl text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                placeholder="Ej. Ventas High-Ticket"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-400 block mb-1">Descripción / Objetivo</label>
              <input
                type="text"
                value={pipelineDesc}
                onChange={(e) => setPipelineDesc(e.target.value)}
                className="w-full px-3 py-2 bg-[#0E0E16] border border-[#28283E] rounded-xl text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                placeholder="Ej. Proceso comercial para clientes corporativos"
              />
            </div>
          </div>

          {/* Stages List */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Etapas del Embudo ({stages.length})</h4>
                <p className="text-[11px] text-zinc-400">Ordena el flujo comercial de izquierda a derecha</p>
              </div>
              <button
                type="button"
                onClick={handleAddStage}
                className="px-3 py-1.5 rounded-xl bg-[#1C1C2C] border border-[#2E2E46] text-xs font-semibold text-zinc-200 hover:text-white flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-[#E5C158]" />
                <span>Añadir Etapa</span>
              </button>
            </div>

            <div className="space-y-2">
              {stages.map((stage, idx) => (
                <div
                  key={stage.id}
                  className="bg-[#12121C] border border-[#222234] rounded-xl p-3 flex flex-wrap items-center gap-3 justify-between hover:border-[#303046] transition-colors"
                >
                  <div className="flex items-center gap-2.5 flex-1 min-w-[200px]">
                    <div className="flex flex-col gap-0.5 text-zinc-500">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMoveStage(idx, 'up')}
                        className="hover:text-white disabled:opacity-20"
                      >
                        <MoveUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === stages.length - 1}
                        onClick={() => handleMoveStage(idx, 'down')}
                        className="hover:text-white disabled:opacity-20"
                      >
                        <MoveDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div
                      className="w-4 h-4 rounded-full shrink-0 border border-white/20"
                      style={{ backgroundColor: stage.color }}
                    />

                    <input
                      type="text"
                      value={stage.name}
                      onChange={(e) => handleUpdateStage(stage.id, { name: e.target.value })}
                      className="bg-transparent border-b border-transparent hover:border-[#333348] focus:border-[#D4AF37] px-1 py-0.5 text-xs text-white font-medium focus:outline-none flex-1"
                    />
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="text-zinc-500 text-[11px]">Prob:</span>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={stage.probability}
                        onChange={(e) => handleUpdateStage(stage.id, { probability: Number(e.target.value) })}
                        className="w-14 px-1.5 py-1 bg-[#0E0E16] border border-[#28283E] rounded-lg text-center text-xs text-white"
                      />
                      <span className="text-zinc-500">%</span>
                    </div>

                    <select
                      value={stage.winState || 'OPEN'}
                      onChange={(e) => handleUpdateStage(stage.id, { winState: e.target.value as any })}
                      className="px-2 py-1 bg-[#0E0E16] border border-[#28283E] rounded-lg text-[11px] text-zinc-300"
                    >
                      <option value="OPEN">En progreso</option>
                      <option value="WON">Ganado (Won)</option>
                      <option value="LOST">Perdido (Lost)</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => handleDeleteStage(stage.id)}
                      className="p-1.5 text-zinc-500 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-colors"
                      title="Eliminar etapa"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#1E1E2C] bg-[#141420] flex items-center justify-between">
          <button
            type="button"
            onClick={handleDeleteActivePipeline}
            disabled={crmPipelines.length <= 1}
            className="px-3 py-2 text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors disabled:opacity-30 flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Eliminar este Embudo</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-zinc-400 hover:text-white rounded-xl hover:bg-[#1E1E2E] transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSaveAll}
              className="px-5 py-2 text-xs font-black text-black p12-gold-gradient rounded-xl hover:brightness-105 shadow-md shadow-[#D4AF37]/20 flex items-center gap-1.5 transition-all"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Guardar Cambios</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
