import React, { useState, useMemo } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import { Post, ContentFormat, ContentPillar, PostStatus } from '../types';
import * as XLSX from 'xlsx';
import {
  Table as TableIcon,
  Download,
  Upload,
  Search,
  Trash2,
  Edit3,
  CheckCircle2,
  Sparkles,
  FileSpreadsheet,
  CheckSquare,
  Square
} from 'lucide-react';

export const ContentMatrixView: React.FC = () => {
  const {
    data,
    activeBrand,
    openPostDetail,
    openCreateWithAI,
    deletePost,
    bulkDeletePosts,
    addPost,
    showToast
  } = useWorkspace();

  const [search, setSearch] = useState('');
  const [formatFilter, setFormatFilter] = useState('ALL');
  const [pillarFilter, setPillarFilter] = useState('ALL');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const filteredPosts = useMemo(() => {
    return data.posts.filter((p) => {
      if (formatFilter !== 'ALL' && p.format !== formatFilter) return false;
      if (pillarFilter !== 'ALL' && p.pillar !== pillarFilter) return false;
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
  }, [data.posts, formatFilter, pillarFilter, search]);

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

  const exportToExcel = () => {
    const rows = filteredPosts.map((p) => ({
      ID: p.id,
      Fecha: p.date,
      Hora: p.time,
      Formato: p.format,
      Pilar: p.pillar,
      Redes: p.platforms.join(', '),
      'Título Interno': p.internalTitle,
      'Gancho / Hook': p.hook,
      'Caption Completo': p.caption,
      CTA: p.cta,
      Hashtags: p.hashtags.join(' '),
      Responsable: p.assigneeName || 'Sin asignar',
      Estado: p.status,
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Matriz Contenido');
    XLSX.writeFile(workbook, `Matriz_${activeBrand.name}_${new Date().toISOString().slice(0, 10)}.xlsx`);
    showToast('Archivo Excel exportado exitosamente');
  };

  const exportToCSV = () => {
    const rows = filteredPosts.map((p) => ({
      Fecha: p.date,
      Hora: p.time,
      Formato: p.format,
      Pilar: p.pillar,
      Redes: p.platforms.join(';'),
      Titulo: p.internalTitle.replace(/"/g, '""'),
      Hook: p.hook.replace(/"/g, '""'),
      Caption: p.caption.replace(/"/g, '""'),
      CTA: p.cta.replace(/"/g, '""'),
      Hashtags: p.hashtags.join(' '),
      Estado: p.status,
    }));

    const header = Object.keys(rows[0] || {}).join(',');
    const body = rows.map((r) => Object.values(r).join(',')).join('\n');
    const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(header + '\n' + body);
    const link = document.createElement('a');
    link.setAttribute('href', csvContent);
    link.setAttribute('download', `Matriz_${activeBrand.name}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Archivo CSV exportado exitosamente');
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsName = wb.SheetNames[0];
        const ws = wb.Sheets[wsName];
        const rows: any[] = XLSX.utils.sheet_to_json(ws);

        let importedCount = 0;
        for (const r of rows) {
          const newPost: Post = {
            id: 'post_imp_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
            brandId: activeBrand.id,
            internalTitle: r.Titulo || r['Título Interno'] || r.Title || 'Post importado',
            date: r.Fecha || r.Date || '2026-09-15',
            time: r.Hora || r.Time || '11:00',
            platforms: ['instagram', 'linkedin'],
            format: (r.Formato as ContentFormat) || 'Carousel',
            pillar: (r.Pilar as ContentPillar) || 'Educativo',
            theme: r.Tema || r.Titulo || 'Tema importado',
            objective: 'Importado vía XLSX / CSV',
            hook: r.Hook || r['Gancho / Hook'] || '',
            caption: r.Caption || r['Caption Completo'] || '',
            cta: r.CTA || 'Contáctanos',
            hashtags: typeof r.Hashtags === 'string' ? r.Hashtags.split(' ') : ['#Pixel12'],
            status: 'DRAFT',
            relatedTaskIds: [],
            approvalHistory: [],
            versions: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          await addPost(newPost);
          importedCount++;
        }
        showToast(`Se importaron ${importedCount} publicaciones a la matriz`);
      } catch (err: any) {
        showToast('Error al importar archivo: ' + err.message, 'error');
      }
    };
    reader.readAsBinaryString(file);
  };

  const statusColors: Record<PostStatus, { bg: string; text: string }> = {
    DRAFT: { bg: 'bg-amber-500/15', text: 'text-amber-400 border border-amber-500/30' },
    IN_REVIEW: { bg: 'bg-indigo-500/15', text: 'text-indigo-400 border border-indigo-500/30' },
    CHANGES_REQUESTED: { bg: 'bg-rose-500/15', text: 'text-rose-400 border border-rose-500/30' },
    APPROVED: { bg: 'bg-emerald-500/15', text: 'text-emerald-400 border border-emerald-500/30' },
    SCHEDULED: { bg: 'bg-sky-500/15', text: 'text-sky-400 border border-sky-500/30' },
    PUBLISHED: { bg: 'bg-emerald-600/30', text: 'text-emerald-300 border border-emerald-500/40' },
    REJECTED: { bg: 'bg-red-500/20', text: 'text-red-400 border border-red-500/30' },
    FAILED: { bg: 'bg-red-600/30', text: 'text-red-300 border border-red-500/40' },
  };

  return (
    <div id="content-matrix-view" className="p-6 space-y-5 max-w-7xl mx-auto">
      {/* Control Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#12121C] p-4 rounded-2xl border border-[#222234] shadow-md">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por título, hook o caption..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-[#2A2A3E] bg-[#161624] text-white placeholder-slate-500 focus:border-[#D4AF37] outline-none transition-colors"
          />
        </div>

        {/* Filters & Export Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={formatFilter}
            onChange={(e) => setFormatFilter(e.target.value)}
            className="text-xs p-2 rounded-xl border border-[#2A2A3E] bg-[#161624] text-slate-200 outline-none cursor-pointer"
          >
            <option value="ALL">Todos los formatos</option>
            <option value="Carousel">Carrusel</option>
            <option value="Reel">Reel</option>
            <option value="Static Post">Estático</option>
            <option value="LinkedIn Post">LinkedIn</option>
            <option value="Story">Historia</option>
          </select>

          <select
            value={pillarFilter}
            onChange={(e) => setPillarFilter(e.target.value)}
            className="text-xs p-2 rounded-xl border border-[#2A2A3E] bg-[#161624] text-slate-200 outline-none cursor-pointer"
          >
            <option value="ALL">Todos los pilares</option>
            <option value="Marketing Digital">Marketing Digital</option>
            <option value="Asistencia Virtual">Asistencia Virtual</option>
            <option value="Educativo">Educativo</option>
            <option value="Venta">Venta</option>
            <option value="Autoridad">Autoridad</option>
            <option value="Conversión">Conversión</option>
          </select>

          {/* Import File Button */}
          <label className="cursor-pointer text-xs font-semibold px-3 py-2 rounded-xl border border-[#2A2A3E] text-slate-200 hover:text-white hover:bg-[#1A1A28] flex items-center gap-1.5 transition-colors">
            <Upload className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Importar CSV/XLSX</span>
            <input
              type="file"
              accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
              onChange={handleImportFile}
              className="hidden"
            />
          </label>

          {/* Export Dropdown / Buttons */}
          <button
            onClick={exportToExcel}
            className="text-xs font-semibold px-3 py-2 rounded-xl border border-[#2A2A3E] text-slate-200 hover:text-white hover:bg-[#1A1A28] flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Exportar Excel</span>
          </button>

          <button
            onClick={exportToCSV}
            className="text-xs font-semibold px-3 py-2 rounded-xl border border-[#2A2A3E] text-slate-200 hover:text-white hover:bg-[#1A1A28] flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>CSV</span>
          </button>
        </div>
      </div>

      {/* Bulk Selection Bar */}
      {selectedIds.length > 0 && (
        <div className="p-3 bg-[#181826] border border-[#2A2A3E] rounded-xl flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-[#D4AF37]" />
            <span className="text-xs font-bold text-white">
              {selectedIds.length} {selectedIds.length === 1 ? 'publicación seleccionada' : 'publicaciones seleccionadas'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedIds([])}
              className="px-3 py-1.5 rounded-lg border border-[#32324A] text-slate-300 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              Deseleccionar
            </button>
            <button
              onClick={handleBulkDelete}
              className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Eliminar seleccionadas ({selectedIds.length})</span>
            </button>
          </div>
        </div>
      )}

      {/* Matrix Table */}
      <div className="bg-[#12121C] rounded-2xl border border-[#222234] shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#161624] border-b border-[#222234] text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-3 w-10 text-center">
                  <button
                    type="button"
                    onClick={toggleSelectAll}
                    className="cursor-pointer text-slate-400 hover:text-white"
                  >
                    {selectedIds.length === filteredPosts.length && filteredPosts.length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-[#D4AF37]" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-500" />
                    )}
                  </button>
                </th>
                <th className="py-3 px-4">Fecha & Hora</th>
                <th className="py-3 px-3">Formato</th>
                <th className="py-3 px-3">Pilar</th>
                <th className="py-3 px-4 min-w-[180px]">Título Interno</th>
                <th className="py-3 px-4 min-w-[200px]">Gancho / Hook (3s)</th>
                <th className="py-3 px-4 min-w-[220px]">Caption / Copy</th>
                <th className="py-3 px-3 min-w-[140px]">CTA</th>
                <th className="py-3 px-3">Responsable</th>
                <th className="py-3 px-3">Estado</th>
                <th className="py-3 px-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E1E2E]">
              {filteredPosts.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-500">
                    No hay publicaciones en la matriz.
                  </td>
                </tr>
              ) : (
                filteredPosts.map((post) => {
                  const isSelected = selectedIds.includes(post.id);
                  const statusStyle = statusColors[post.status] || {
                    bg: 'bg-slate-800',
                    text: 'text-slate-300',
                  };
                  return (
                    <tr
                      key={post.id}
                      onClick={() => openPostDetail(post)}
                      className={`hover:bg-[#181826] cursor-pointer transition-colors group ${
                        isSelected ? 'bg-[#181828]' : ''
                      }`}
                    >
                      <td className="py-3 px-3 text-center" onClick={(e) => toggleSelectPost(post.id, e)}>
                        <button type="button" className="cursor-pointer text-slate-400 hover:text-white">
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-[#D4AF37]" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-500" />
                          )}
                        </button>
                      </td>

                      <td className="py-3 px-4 font-semibold text-slate-200 whitespace-nowrap">
                        <div>{post.date}</div>
                        <span className="text-[10px] text-slate-400 font-normal">{post.time}</span>
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="font-extrabold px-2 py-0.5 rounded bg-[#1A1A28] text-amber-400 border border-amber-500/20 text-[10px]">
                          {post.format}
                        </span>
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="font-semibold text-slate-300 bg-[#1E1E2C] px-2 py-0.5 rounded border border-[#2A2A3E] text-[10px]">
                          {post.pillar}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-bold text-white group-hover:text-[#D4AF37] transition-colors leading-snug">
                        {post.internalTitle}
                      </td>

                      <td className="py-3 px-4 text-amber-200/90 font-medium italic text-[11px] leading-relaxed">
                        "{post.hook}"
                      </td>

                      <td className="py-3 px-4 text-slate-300 line-clamp-2 text-[11px] leading-relaxed">
                        {post.caption}
                      </td>

                      <td className="py-3 px-3 text-slate-300 font-medium text-[11px]">
                        {post.cta}
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap text-slate-300 font-medium">
                        {post.assigneeName || 'Sin asignar'}
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusStyle.bg} ${statusStyle.text}`}
                        >
                          {post.status}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => openPostDetail(post)}
                            className="p-1.5 text-slate-400 hover:text-[#D4AF37] hover:bg-[#1A1A28] rounded transition-colors"
                            title="Editar detalle"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={async () => {
                              await deletePost(post.id);
                              setSelectedIds((prev) => prev.filter((id) => id !== post.id));
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors"
                            title="Eliminar publicación"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-[#141420] border-t border-[#222234] flex items-center justify-between text-xs text-slate-400">
          <span>Mostrando {filteredPosts.length} publicaciones</span>
          <span>Marca activa: <strong className="text-white">{activeBrand.name}</strong></span>
        </div>
      </div>
    </div>
  );
};
