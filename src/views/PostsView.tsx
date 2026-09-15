import React, { useState, useMemo } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import { Post, ContentFormat, PostStatus } from '../types';
import {
  FileText,
  Plus,
  Sparkles,
  Search,
  Calendar,
  Trash2,
  Edit3,
  CheckSquare,
  Square,
  Eye
} from 'lucide-react';

export const PostsView: React.FC = () => {
  const {
    data,
    activeBrand,
    openPostDetail,
    openManualPost,
    openCreateWithAI,
    deletePost,
    bulkDeletePosts
  } = useWorkspace();

  const [search, setSearch] = useState('');
  const [formatFilter, setFormatFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const filteredPosts = useMemo(() => {
    return data.posts.filter((p) => {
      if (formatFilter !== 'ALL' && p.format !== formatFilter) return false;
      if (statusFilter !== 'ALL' && p.status !== statusFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          p.internalTitle.toLowerCase().includes(q) ||
          p.hook.toLowerCase().includes(q) ||
          p.caption.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [data.posts, formatFilter, statusFilter, search]);

  const toggleSelectPost = (postId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(postId) ? prev.filter((id) => id !== postId) : [...prev, postId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredPosts.length && filteredPosts.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredPosts.map((p) => p.id));
    }
  };

  const handleBulkDelete = async () => {
    await bulkDeletePosts(selectedIds);
    setSelectedIds([]);
  };

  return (
    <div id="posts-view" className="p-6 space-y-5 max-w-7xl mx-auto">
      {/* Control Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#12121C] p-4 rounded-2xl border border-[#222234] shadow-md">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por título, gancho o copy..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-[#2A2A3E] bg-[#161624] text-white placeholder-slate-500 focus:border-[#D4AF37] outline-none transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={formatFilter}
            onChange={(e) => setFormatFilter(e.target.value)}
            className="text-xs p-2 rounded-xl border border-[#2A2A3E] bg-[#161624] text-slate-200 outline-none cursor-pointer"
          >
            <option value="ALL">Todos los formatos</option>
            <option value="Carousel">Carruseles</option>
            <option value="Reel">Reels</option>
            <option value="Static Post">Posts estáticos</option>
            <option value="LinkedIn Post">LinkedIn</option>
            <option value="Story">Historias</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs p-2 rounded-xl border border-[#2A2A3E] bg-[#161624] text-slate-200 outline-none cursor-pointer"
          >
            <option value="ALL">Todos los estados</option>
            <option value="DRAFT">Borradores</option>
            <option value="IN_REVIEW">En revisión</option>
            <option value="APPROVED">Aprobados</option>
            <option value="SCHEDULED">Programados</option>
            <option value="PUBLISHED">Publicados</option>
          </select>

          <button
            onClick={openManualPost}
            className="px-3.5 py-2 rounded-xl border border-[#2A2A3E] text-slate-200 hover:text-white hover:bg-[#1A1A28] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Crear manual</span>
          </button>

          <button
            onClick={openCreateWithAI}
            className="px-3.5 py-2 rounded-xl bg-[#D4AF37] hover:bg-[#C29E30] text-black font-bold text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Crear con IA</span>
          </button>
        </div>
      </div>

      {/* Bulk Selection Bar */}
      {filteredPosts.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 px-2">
          <div className="flex items-center gap-2">
            <button
              onClick={toggleSelectAll}
              className="px-3 py-1.5 rounded-lg border border-[#2A2A3E] text-slate-300 hover:text-white hover:bg-[#161624] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {selectedIds.length === filteredPosts.length && filteredPosts.length > 0 ? (
                <CheckSquare className="w-3.5 h-3.5 text-[#D4AF37]" />
              ) : (
                <Square className="w-3.5 h-3.5 text-slate-400" />
              )}
              <span>Seleccionar todos ({filteredPosts.length})</span>
            </button>

            {selectedIds.length > 0 && (
              <div className="flex items-center gap-2 animate-in fade-in">
                <span className="text-xs font-bold text-[#D4AF37] bg-[#D4AF37]/10 px-2.5 py-1 rounded-lg border border-[#D4AF37]/30">
                  {selectedIds.length} seleccionados
                </span>
                <button
                  onClick={handleBulkDelete}
                  className="px-3 py-1.5 rounded-lg bg-rose-600/90 hover:bg-rose-600 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                  title="Eliminar publicaciones seleccionadas"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Eliminar seleccionadas</span>
                </button>
              </div>
            )}
          </div>

          <div className="text-xs text-slate-400">
            Total: <strong className="text-white">{filteredPosts.length}</strong> publicaciones
          </div>
        </div>
      )}

      {/* Grid of Posts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPosts.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-[#12121C] rounded-2xl border border-[#222234] text-xs text-slate-400">
            No se encontraron publicaciones que coincidan con la búsqueda.
          </div>
        ) : (
          filteredPosts.map((post) => {
            const isSelected = selectedIds.includes(post.id);
            return (
              <div
                key={post.id}
                className={`bg-[#12121C] rounded-2xl border transition-all p-4 flex flex-col justify-between space-y-3 group ${
                  isSelected
                    ? 'border-[#D4AF37] ring-1 ring-[#D4AF37]/40'
                    : 'border-[#222234] hover:border-[#323248] hover:shadow-lg'
                }`}
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => toggleSelectPost(post.id, e)}
                        className="cursor-pointer text-slate-400 hover:text-white"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-[#D4AF37]" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-500" />
                        )}
                      </button>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#1A1A28] text-amber-400 border border-amber-500/20">
                        {post.format}
                      </span>
                    </div>
                    <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      {post.date}
                    </span>
                  </div>

                  <h4
                    onClick={() => openPostDetail(post)}
                    className="text-xs font-bold text-white group-hover:text-[#D4AF37] transition-colors leading-snug line-clamp-2 cursor-pointer"
                  >
                    {post.internalTitle}
                  </h4>

                  <div className="p-2.5 rounded-xl bg-[#161624] text-[11px] text-amber-200/90 font-medium line-clamp-2 border border-[#2A2A3E]">
                    <span className="font-bold text-[#D4AF37]">Hook: </span>
                    "{post.hook}"
                  </div>

                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{post.caption}</p>
                </div>

                <div className="pt-3 border-t border-[#1E1E2E] flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[10px] font-bold text-slate-300 bg-[#1A1A28] px-2 py-0.5 rounded border border-[#28283C]">
                      {post.pillar}
                    </span>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        post.status === 'APPROVED'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : post.status === 'IN_REVIEW'
                          ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30'
                          : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {post.status}
                    </span>
                  </div>

                  {/* Actions row: Edit and Delete */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => openPostDetail(post)}
                      className="flex-1 py-1.5 px-2.5 rounded-xl bg-[#1A1A28] hover:bg-[#222234] text-slate-200 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-[#2A2A3E]"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>Editar</span>
                    </button>
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        await deletePost(post.id);
                        setSelectedIds((prev) => prev.filter((id) => id !== post.id));
                      }}
                      className="py-1.5 px-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer border border-rose-500/30"
                      title="Eliminar publicación"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Eliminar</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
