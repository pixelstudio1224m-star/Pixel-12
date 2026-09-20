import React, { useState, useMemo } from 'react';
import { useWorkspace, ViewType } from '../../context/WorkspaceContext';
import { Search, X, Calendar, Kanban, Megaphone, FileText, User } from 'lucide-react';

export const GlobalSearchModal: React.FC = () => {
  const {
    isGlobalSearchOpen,
    closeGlobalSearch,
    data,
    openPostDetail,
    openTaskDetail,
    setActiveView
  } = useWorkspace();

  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    if (!query.trim()) return { posts: [], tasks: [], campaigns: [] };
    const q = query.toLowerCase();

    const posts = (data?.posts || []).filter(
      (p) =>
        p && (
          (p.internalTitle && p.internalTitle.toLowerCase().includes(q)) ||
          (p.hook && p.hook.toLowerCase().includes(q)) ||
          (p.caption && p.caption.toLowerCase().includes(q)) ||
          (p.theme && p.theme.toLowerCase().includes(q))
        )
    );

    const tasks = (data?.tasks || []).filter(
      (t) =>
        t && (
          (t.title && t.title.toLowerCase().includes(q)) ||
          (t.description && t.description.toLowerCase().includes(q)) ||
          (t.assigneeName && t.assigneeName.toLowerCase().includes(q))
        )
    );

    const campaigns = (data?.campaigns || []).filter(
      (c) =>
        c && (
          (c.name && c.name.toLowerCase().includes(q)) ||
          (c.objective && c.objective.toLowerCase().includes(q))
        )
    );

    return { posts, tasks, campaigns };
  }, [query, data]);

  if (!isGlobalSearchOpen) return null;

  return (
    <div
      id="global-search-modal"
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-start justify-center pt-20 p-4"
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input */}
        <div className="p-4 border-b border-slate-200 flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            autoFocus
            type="text"
            placeholder="Buscar por tema, hook, copy, responsable o campaña..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 text-sm outline-none text-slate-900 placeholder:text-slate-400 font-medium"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={closeGlobalSearch}
            className="text-xs font-semibold px-2 py-1 rounded bg-slate-100 text-slate-500 hover:text-slate-800"
          >
            Esc
          </button>
        </div>

        {/* Results Body */}
        <div className="max-h-96 overflow-y-auto p-4 space-y-4">
          {!query.trim() ? (
            <div className="py-8 text-center text-xs text-slate-400 space-y-1">
              <p>Escribe cualquier término para buscar en todo el sistema.</p>
              <p className="text-[11px] text-slate-400">
                Ejemplos: "delegar", "asistente", "carrusel", "anuncios", "Mateo"
              </p>
            </div>
          ) : (results.posts || []).length === 0 &&
            (results.tasks || []).length === 0 &&
            (results.campaigns || []).length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No se encontraron resultados para "{query}".
            </div>
          ) : (
            <>
              {(results.posts || []).length > 0 && (
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    Publicaciones ({(results.posts || []).length})
                  </span>
                  <div className="space-y-1.5">
                    {(results.posts || []).map((post) => (
                      <div
                        key={post.id}
                        onClick={() => {
                          closeGlobalSearch();
                          openPostDetail(post);
                        }}
                        className="p-2.5 rounded-lg border border-slate-100 hover:bg-slate-50 cursor-pointer flex items-center justify-between text-xs transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-sky-600 shrink-0" />
                          <div>
                            <p className="font-bold text-slate-900 line-clamp-1">{post.internalTitle}</p>
                            <span className="text-[11px] text-slate-500 font-medium">
                              {post.format} · {post.date} · Hook: "{post.hook}"
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                          {post.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(results.tasks || []).length > 0 && (
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    Tareas ({(results.tasks || []).length})
                  </span>
                  <div className="space-y-1.5">
                    {(results.tasks || []).map((task) => (
                      <div
                        key={task.id}
                        onClick={() => {
                          closeGlobalSearch();
                          openTaskDetail(task);
                        }}
                        className="p-2.5 rounded-lg border border-slate-100 hover:bg-slate-50 cursor-pointer flex items-center justify-between text-xs transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Kanban className="w-4 h-4 text-indigo-600 shrink-0" />
                          <div>
                            <p className="font-bold text-slate-900 line-clamp-1">{task.title}</p>
                            <span className="text-[11px] text-slate-500 font-medium">
                              Asignado a: {task.assigneeName} · Vence: {task.deadlineDate}
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                          {task.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(results.campaigns || []).length > 0 && (
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    Campañas ({(results.campaigns || []).length})
                  </span>
                  <div className="space-y-1.5">
                    {(results.campaigns || []).map((camp) => (
                      <div
                        key={camp.id}
                        onClick={() => {
                          closeGlobalSearch();
                          setActiveView('campaigns');
                        }}
                        className="p-2.5 rounded-lg border border-slate-100 hover:bg-slate-50 cursor-pointer flex items-center justify-between text-xs transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Megaphone className="w-4 h-4 text-orange-600 shrink-0" />
                          <div>
                            <p className="font-bold text-slate-900 line-clamp-1">{camp.name}</p>
                            <span className="text-[11px] text-slate-500 font-medium">
                              {camp.startDate} - {camp.endDate}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
