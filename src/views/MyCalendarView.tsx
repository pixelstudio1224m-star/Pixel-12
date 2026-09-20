import React from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import { UserCheck, CheckCircle2, Clock, Calendar, FileText, Kanban } from 'lucide-react';

export const MyCalendarView: React.FC = () => {
  const { data, openTaskDetail, openPostDetail } = useWorkspace();

  const currentMember = data?.currentMember || {
    id: 'user-default',
    name: 'Usuario',
    email: 'user@pixel12.agency',
    role: 'Editor',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  };

  const tasks = data?.tasks || [];
  const posts = data?.posts || [];

  const myTasks = tasks.filter((t) => t && t.assigneeId === currentMember.id);
  const myPosts = posts.filter((p) => p && p.assigneeId === currentMember.id);

  return (
    <div id="my-calendar-view" className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Profile summary card */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img
            src={currentMember.avatar}
            alt={currentMember.name}
            className="w-12 h-12 rounded-full object-cover border-2 border-sky-500 shadow-xs"
          />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">{currentMember.name}</h3>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-sky-100 text-sky-800">
                {currentMember.role}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Panel personal con tus tareas asignadas y publicaciones bajo tu responsabilidad
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-center">
          <div>
            <span className="text-xl font-black text-slate-900 block">{myTasks.length}</span>
            <span className="text-[11px] text-slate-400 font-semibold uppercase">Tareas</span>
          </div>
          <div className="w-px h-8 bg-slate-200" />
          <div>
            <span className="text-xl font-black text-slate-900 block">{myPosts.length}</span>
            <span className="text-[11px] text-slate-400 font-semibold uppercase">Posts</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Tasks */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Kanban className="w-4 h-4 text-indigo-600" />
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              Mis Tareas Asignadas ({myTasks.length})
            </h4>
          </div>

          <div className="space-y-2.5">
            {myTasks.length === 0 ? (
              <p className="text-xs text-slate-400 p-6 text-center">No tienes tareas asignadas.</p>
            ) : (
              myTasks.map((t) => (
                <div
                  key={t.id}
                  onClick={() => openTaskDetail(t)}
                  className="p-3 rounded-xl border border-slate-100 hover:border-indigo-300 hover:bg-slate-50 cursor-pointer transition-all flex items-center justify-between text-xs"
                >
                  <div>
                    <h5 className="font-bold text-slate-900">{t.title}</h5>
                    <span className="text-[11px] text-amber-600 font-medium">
                      Vence: {t.deadlineDate} a las {t.deadlineTime}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    {t.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* My Posts */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-sky-600" />
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              Mis Publicaciones ({myPosts.length})
            </h4>
          </div>

          <div className="space-y-2.5">
            {myPosts.length === 0 ? (
              <p className="text-xs text-slate-400 p-6 text-center">No tienes publicaciones asignadas.</p>
            ) : (
              myPosts.map((p) => (
                <div
                  key={p.id}
                  onClick={() => openPostDetail(p)}
                  className="p-3 rounded-xl border border-slate-100 hover:border-sky-300 hover:bg-slate-50 cursor-pointer transition-all flex items-center justify-between text-xs"
                >
                  <div>
                    <h5 className="font-bold text-slate-900">{p.internalTitle}</h5>
                    <span className="text-[11px] text-slate-500 font-medium">
                      {p.format} · {p.date} a las {p.time}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-50 text-sky-800">
                    {p.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
