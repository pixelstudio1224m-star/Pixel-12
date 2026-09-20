import React, { useState } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import { Post } from '../types';
import {
  CheckCircle2,
  AlertTriangle,
  Clock,
  Calendar,
  Layers,
  Check,
  Settings2,
  Trash2,
  Sparkles,
  Eye,
  Edit3,
  CheckSquare,
  Square
} from 'lucide-react';

export const ApprovalsView: React.FC = () => {
  const {
    data,
    activeBrand,
    openPostDetail,
    changePostStatus,
    deletePost,
    bulkDeletePosts,
    updateSettings,
    showToast
  } = useWorkspace();

  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const posts = data?.posts || [];
  const pendingPosts = posts.filter((p) => p && (p.status === 'IN_REVIEW' || p.status === 'DRAFT'));
  const approvedPosts = posts.filter((p) => p && (p.status === 'APPROVED' || p.status === 'SCHEDULED' || p.status === 'PUBLISHED'));
  const rejectedPosts = posts.filter((p) => p && (p.status === 'REJECTED' || p.status === 'CHANGES_REQUESTED'));

  const currentList =
    activeTab === 'pending'
      ? pendingPosts
      : activeTab === 'approved'
      ? approvedPosts
      : rejectedPosts;

  const handleApprove = async (postId: string) => {
    await changePostStatus(postId, 'APPROVED');
  };

  const handleRequestChanges = async (postId: string) => {
    const feedback = prompt('Indica las correcciones requeridas:');
    if (feedback) {
      await changePostStatus(postId, 'CHANGES_REQUESTED', feedback);
    }
  };

  // Immediate deletion when not approved / rejected
  const handleRejectAndDelete = async (postId: string) => {
    await changePostStatus(postId, 'REJECTED');
    setSelectedIds((prev) => prev.filter((id) => id !== postId));
  };

  const handleDeleteDirect = async (postId: string) => {
    await deletePost(postId);
    setSelectedIds((prev) => prev.filter((id) => id !== postId));
  };

  const toggleSelectPost = (postId: string) => {
    setSelectedIds((prev) =>
      prev.includes(postId) ? prev.filter((id) => id !== postId) : [...prev, postId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === currentList.length && currentList.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(currentList.map((p) => p.id));
    }
  };

  const handleBulkApprove = async () => {
    for (const id of selectedIds) {
      await changePostStatus(id, 'APPROVED');
    }
    showToast(`${selectedIds.length} publicaciones aprobadas`, 'success');
    setSelectedIds([]);
  };

  const handleBulkDelete = async () => {
    await bulkDeletePosts(selectedIds);
    setSelectedIds([]);
  };

  return (
    <div id="approvals-view" className="p-6 space-y-5 max-w-7xl mx-auto">
      {/* Top Banner with Auto-Delete Rule & Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#12121C] p-5 rounded-2xl border border-[#222234] shadow-lg">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">
                Control de Aprobaciones & Depuración
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Edita, aprueba o elimina contenido para <strong className="text-white font-semibold">{activeBrand.name}</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Setting: Auto delete rejected */}
        <div className="flex items-center gap-3 bg-[#181826] px-4 py-2.5 rounded-xl border border-[#28283E]">
          <Settings2 className="w-4 h-4 text-[#D4AF37]" />
          <div className="text-xs">
            <span className="font-bold text-white block leading-tight">
              Auto-borrado al no aprobar
            </span>
            <span className="text-[11px] text-slate-400">
              {data?.workspaceSettings?.autoDeleteRejectedPosts ? 'Activo: Se borran de inmediato' : 'Desactivado'}
            </span>
          </div>

          <label className="relative inline-flex items-center cursor-pointer ml-2">
            <input
              type="checkbox"
              checked={!!data?.workspaceSettings?.autoDeleteRejectedPosts}
              onChange={(e) => {
                updateSettings({ autoDeleteRejectedPosts: e.target.checked });
                showToast(
                  e.target.checked
                    ? 'Regla activada: Las publicaciones no aprobadas se eliminan en el acto'
                    : 'Regla desactivada'
                );
              }}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-[#2A2A3E] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#D4AF37]" />
          </label>
        </div>
      </div>

      {/* Tabs Bar & Bulk Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#222234] pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setActiveTab('pending');
              setSelectedIds([]);
            }}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'pending'
                ? 'bg-[#D4AF37] text-black shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-[#181826]'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Pendientes ({pendingPosts.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('approved');
              setSelectedIds([]);
            }}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'approved'
                ? 'bg-[#D4AF37] text-black shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-[#181826]'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Aprobadas ({approvedPosts.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('rejected');
              setSelectedIds([]);
            }}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'rejected'
                ? 'bg-[#D4AF37] text-black shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-[#181826]'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>Observadas ({rejectedPosts.length})</span>
          </button>
        </div>

        {/* Bulk Selection Bar */}
        {currentList.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={toggleSelectAll}
              className="px-3 py-1.5 rounded-lg border border-[#28283E] text-slate-300 hover:text-white hover:bg-[#181826] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {selectedIds.length === currentList.length && currentList.length > 0 ? (
                <CheckSquare className="w-3.5 h-3.5 text-[#D4AF37]" />
              ) : (
                <Square className="w-3.5 h-3.5 text-slate-400" />
              )}
              <span>Seleccionar todos</span>
            </button>

            {selectedIds.length > 0 && (
              <div className="flex items-center gap-2 animate-in fade-in">
                <span className="text-xs font-bold text-[#D4AF37] bg-[#D4AF37]/10 px-2.5 py-1 rounded-lg border border-[#D4AF37]/30">
                  {selectedIds.length} seleccionados
                </span>
                <button
                  onClick={handleBulkApprove}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Aprobar lote</span>
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="px-3 py-1.5 rounded-lg bg-rose-600/90 hover:bg-rose-600 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                  title="Eliminar permanentemente todos los seleccionados"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Eliminar lote</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Posts Review Cards */}
      <div className="space-y-4">
        {currentList.length === 0 ? (
          <div className="p-12 text-center bg-[#12121C] rounded-2xl border border-[#222234] space-y-2.5">
            <CheckCircle2 className="w-8 h-8 text-[#D4AF37] mx-auto opacity-80" />
            <h4 className="text-sm font-bold text-white">¡Bandeja al día!</h4>
            <p className="text-xs text-slate-400">No hay publicaciones en esta sección actualmente.</p>
          </div>
        ) : (
          currentList.map((post) => {
            const isSelected = selectedIds.includes(post.id);
            return (
              <div
                key={post.id}
                className={`p-5 rounded-2xl bg-[#12121C] border transition-all flex flex-col lg:flex-row lg:items-start justify-between gap-6 ${
                  isSelected ? 'border-[#D4AF37] ring-1 ring-[#D4AF37]/40' : 'border-[#222234] hover:border-[#323248]'
                }`}
              >
                {/* Main Content Details */}
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggleSelectPost(post.id)}
                      className="cursor-pointer text-slate-400 hover:text-white mr-1"
                    >
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-[#D4AF37]" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-500" />
                      )}
                    </button>

                    <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-[#1A1A28] text-amber-400 border border-amber-500/20">
                      {post.format}
                    </span>
                    <span className="text-xs font-bold text-slate-300 bg-[#1E1E2C] px-2 py-0.5 rounded border border-[#2A2A3E]">
                      {post.pillar}
                    </span>
                    <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      {post.date} · {post.time}
                    </span>
                    <span className="text-xs text-slate-600">|</span>
                    <span className="text-xs font-medium text-slate-400">
                      {post.platforms.join(', ')}
                    </span>
                  </div>

                  <h4
                    onClick={() => openPostDetail(post)}
                    className="text-sm font-bold text-white hover:text-[#D4AF37] cursor-pointer leading-snug transition-colors"
                  >
                    {post.internalTitle}
                  </h4>

                  {/* Hook Box */}
                  <div className="p-3 rounded-xl bg-[#181826] border border-[#28283E] text-xs text-amber-200/90 font-medium">
                    <span className="font-bold text-[#D4AF37]">Gancho / Hook (3s): </span>
                    "{post.hook}"
                  </div>

                  {/* Caption preview */}
                  <div className="p-3.5 rounded-xl bg-[#141420] border border-[#202030] text-xs text-slate-300 whitespace-pre-line leading-relaxed max-h-36 overflow-y-auto">
                    {post.caption}
                  </div>

                  {/* Slides preview if generated */}
                  {post.slides && post.slides.length > 0 ? (
                    <div className="p-3.5 rounded-xl bg-[#0E0E16] border border-[#222234] space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Layers className="w-3.5 h-3.5 text-[#D4AF37]" />
                          <span className="text-xs font-bold text-white">
                            Carrusel con {post.slides.length} slides generadas
                          </span>
                        </div>
                        <button
                          onClick={() => openPostDetail(post)}
                          className="text-[11px] font-bold text-[#D4AF37] hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Ver y editar slides</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-6 gap-1.5">
                        {post.slides.map((s, idx) => (
                          <div
                            key={idx}
                            onClick={() => openPostDetail(post)}
                            className="p-1.5 rounded-lg bg-[#161622] hover:bg-[#1E1E2C] border border-[#262638] cursor-pointer transition-colors text-left"
                            title={`Slide #${idx + 1}: ${s.headline}`}
                          >
                            <span className="text-[9px] font-mono font-bold text-[#D4AF37] block">
                              0{idx + 1}
                            </span>
                            <p className="text-[9px] font-bold text-slate-200 truncate leading-tight mt-0.5">
                              {s.headline}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-[#161624] border border-[#2A2A3E] flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-[#D4AF37] shrink-0" />
                        <span className="text-slate-300 font-medium">
                          Pieza pendiente de diseño. Ábrela para generar sus slides con IA.
                        </span>
                      </div>
                      <button
                        onClick={() => openPostDetail(post)}
                        className="px-3 py-1.5 rounded-lg bg-[#D4AF37] hover:bg-[#C29E30] text-black font-bold text-xs shrink-0 cursor-pointer transition-colors"
                      >
                        Generar diseño
                      </button>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                    <span>
                      CTA: <strong className="text-slate-200">{post.cta}</strong>
                    </span>
                    <span>
                      Responsable: <strong className="text-slate-200">{post.assigneeName || 'Sin asignar'}</strong>
                    </span>
                  </div>
                </div>

                {/* Direct Action Buttons */}
                <div className="flex flex-col gap-2 shrink-0 lg:w-52 pt-3 lg:pt-0 border-t lg:border-t-0 lg:border-l border-[#222234] lg:pl-5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Acciones de Control
                  </span>

                  {post.status !== 'APPROVED' && (
                    <button
                      onClick={() => handleApprove(post.id)}
                      className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>Aprobar Publicación</span>
                    </button>
                  )}

                  {/* Immediate delete when not approved */}
                  <button
                    onClick={() => handleRejectAndDelete(post.id)}
                    className="w-full py-2 px-3 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    title="No aprobar y eliminar inmediatamente del sistema"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>No Aprobar (Borrar)</span>
                  </button>

                  <button
                    onClick={() => openPostDetail(post)}
                    className="w-full py-2 px-3 rounded-xl bg-[#1A1A28] hover:bg-[#222234] border border-[#2E2E42] text-slate-200 hover:text-white text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>Editar Publicación</span>
                  </button>

                  <button
                    onClick={() => handleDeleteDirect(post.id)}
                    className="w-full py-1.5 px-3 rounded-xl border border-transparent hover:border-rose-500/30 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 text-[11px] font-semibold transition-all flex items-center justify-center gap-1 cursor-pointer"
                    title="Eliminar del sistema"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Eliminar permanentemente</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
