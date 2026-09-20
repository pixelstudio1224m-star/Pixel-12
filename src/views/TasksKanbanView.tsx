import React, { useState, useMemo } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import { Task, TaskStatus, TaskPriority } from '../types';
import {
  Kanban as KanbanIcon,
  Plus,
  Calendar,
  Clock,
  User,
  CheckCircle2,
  FileText,
  ArrowRight,
  ArrowLeft,
  Filter,
  CheckSquare
} from 'lucide-react';

export const TasksKanbanView: React.FC = () => {
  const { data, activeBrand, openTaskDetail, openPostDetail, addTask, changeTaskStatus, showToast } =
    useWorkspace();

  const [memberFilter, setMemberFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [isCreatingTask, setIsCreatingTask] = useState(false);

  // New task form state
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newAssigneeId, setNewAssigneeId] = useState(data.members[0]?.id || '');
  const [newPriority, setNewPriority] = useState<TaskPriority>('HIGH');
  const [newDeadlineDate, setNewDeadlineDate] = useState('2026-09-10');
  const [newDeadlineTime, setNewDeadlineTime] = useState('17:00');

  const filteredTasks = useMemo(() => {
    const tasks = data?.tasks || [];
    return tasks.filter((t) => {
      if (!t) return false;
      if (memberFilter !== 'ALL' && t.assigneeId !== memberFilter) return false;
      if (priorityFilter !== 'ALL' && t.priority !== priorityFilter) return false;
      return true;
    });
  }, [data?.tasks, memberFilter, priorityFilter]);

  const columns: Array<{ id: TaskStatus; label: string; color: string; border: string }> = [
    { id: 'TODO', label: 'Por hacer (TODO)', color: 'bg-slate-100 text-slate-700', border: 'border-slate-200' },
    { id: 'IN_PROGRESS', label: 'En progreso', color: 'bg-sky-100 text-sky-800', border: 'border-sky-300' },
    { id: 'IN_REVIEW', label: 'En revisión', color: 'bg-indigo-100 text-indigo-800', border: 'border-indigo-300' },
    { id: 'COMPLETED', label: 'Completadas', color: 'bg-emerald-100 text-emerald-800', border: 'border-emerald-300' },
  ];

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const assignee = data.members.find((m) => m.id === newAssigneeId) || data.members[0];

    const newTask: Task = {
      id: 'task_manual_' + Date.now(),
      brandId: activeBrand.id,
      title: newTitle.trim(),
      description: newDescription.trim(),
      assigneeId: assignee.id,
      assigneeName: assignee.name,
      creatorId: data.currentMember.id,
      creatorName: data.currentMember.name,
      priority: newPriority,
      startDate: '2026-09-02',
      deadlineDate: newDeadlineDate,
      deadlineTime: newDeadlineTime,
      status: 'TODO',
      tags: [assignee.role],
      checklist: [
        { id: 'c1', text: 'Revisar requerimientos', completed: false },
        { id: 'c2', text: 'Ejecutar entregable', completed: false },
      ],
      comments: [],
      history: [],
      createdAt: new Date().toISOString(),
    };

    await addTask(newTask);
    setIsCreatingTask(false);
    setNewTitle('');
    setNewDescription('');
  };

  const getNextStatus = (current: TaskStatus): TaskStatus | null => {
    if (current === 'TODO') return 'IN_PROGRESS';
    if (current === 'IN_PROGRESS') return 'IN_REVIEW';
    if (current === 'IN_REVIEW') return 'COMPLETED';
    return null;
  };

  const getPrevStatus = (current: TaskStatus): TaskStatus | null => {
    if (current === 'COMPLETED') return 'IN_REVIEW';
    if (current === 'IN_REVIEW') return 'IN_PROGRESS';
    if (current === 'IN_PROGRESS') return 'TODO';
    return null;
  };

  return (
    <div id="tasks-kanban-view" className="p-3 sm:p-5 md:p-6 lg:p-8 space-y-4 max-w-7xl mx-auto">
      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <KanbanIcon className="w-5 h-5 text-indigo-600 shrink-0" />
          <div>
            <h3 className="text-sm font-bold text-slate-900">Tablero Kanban del Equipo</h3>
            <p className="text-xs text-slate-500 truncate">
              {filteredTasks.length} tareas vinculadas a {activeBrand?.name || 'la Marca'}
            </p>
          </div>
        </div>

        {/* Filters & Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Member Filter */}
          <select
            aria-label="Filtrar por miembro"
            value={memberFilter}
            onChange={(e) => setMemberFilter(e.target.value)}
            className="text-xs p-1.5 sm:p-2 rounded-lg border border-slate-300 bg-white"
          >
            <option value="ALL">Todo el equipo</option>
            {data.members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.role})
              </option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            aria-label="Filtrar por prioridad"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="text-xs p-1.5 sm:p-2 rounded-lg border border-slate-300 bg-white"
          >
            <option value="ALL">Todas las prioridades</option>
            <option value="HIGH">Alta (HIGH)</option>
            <option value="MEDIUM">Media (MEDIUM)</option>
            <option value="LOW">Baja (LOW)</option>
          </select>

          <button
            onClick={() => setIsCreatingTask(true)}
            className="px-3 py-1.5 sm:py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Nueva Tarea</span>
          </button>
        </div>
      </div>

      {/* New Task Inline Modal/Form */}
      {isCreatingTask && (
        <div className="p-4 rounded-2xl bg-white border border-indigo-200 shadow-md animate-in fade-in duration-150">
          <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
            <h4 className="text-xs font-bold text-slate-900">+ Crear Tarea Operativa</h4>
            <button
              onClick={() => setIsCreatingTask(false)}
              className="text-xs text-slate-400 hover:text-slate-700"
            >
              Cancelar
            </button>
          </div>

          <form onSubmit={handleCreateTask} className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Título de la tarea</label>
              <input
                type="text"
                required
                placeholder="Ej: Diseñar carrusel de 8 láminas en Figma..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-slate-300 outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Descripción / Brief</label>
              <textarea
                rows={2}
                placeholder="Especificaciones, formato 1080x1350, colores y texto a incluir..."
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-slate-300 outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Asignar a</label>
                <select
                  value={newAssigneeId}
                  onChange={(e) => setNewAssigneeId(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                >
                  {data.members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Prioridad</label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as TaskPriority)}
                  className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                >
                  <option value="HIGH">Alta (HIGH)</option>
                  <option value="MEDIUM">Media (MEDIUM)</option>
                  <option value="LOW">Baja (LOW)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Fecha de entrega</label>
                <input
                  type="date"
                  value={newDeadlineDate}
                  onChange={(e) => setNewDeadlineDate(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Hora límite</label>
                <input
                  type="time"
                  value={newDeadlineTime}
                  onChange={(e) => setNewDeadlineTime(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsCreatingTask(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
              >
                Crear Tarea
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Kanban Columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 items-start">
        {columns.map((col) => {
          const colTasks = filteredTasks.filter((t) => t.status === col.id);
          return (
            <div
              key={col.id}
              className="bg-slate-50/80 rounded-2xl border border-slate-200 p-3 flex flex-col min-h-[500px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${col.color}`}>
                    {col.label}
                  </span>
                  <span className="text-xs font-bold text-slate-400">{colTasks.length}</span>
                </div>
              </div>

              {/* Task Cards in Column */}
              <div className="space-y-3 flex-1 overflow-y-auto">
                {colTasks.length === 0 ? (
                  <div className="h-32 flex items-center justify-center border border-dashed border-slate-200 rounded-xl text-xs text-slate-400">
                    Sin tareas
                  </div>
                ) : (
                  colTasks.map((task) => {
                    const nextStatus = getNextStatus(task.status);
                    const prevStatus = getPrevStatus(task.status);
                    const completedCheck = (task.checklist || []).filter((c) => c.completed).length;
                    const totalCheck = (task.checklist || []).length;

                    return (
                      <div
                        key={task.id}
                        onClick={() => openTaskDetail(task)}
                        className="p-3.5 rounded-xl bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-xs transition-all cursor-pointer space-y-2.5 group"
                      >
                        {/* Priority & Tags */}
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded uppercase ${
                              task.priority === 'HIGH'
                                ? 'bg-rose-100 text-rose-700'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {task.priority}
                          </span>

                          <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {task.deadlineDate}
                          </span>
                        </div>

                        {/* Title & Desc */}
                        <div>
                          <h5 className="text-xs font-bold text-slate-900 leading-snug group-hover:text-indigo-600 transition-colors line-clamp-2">
                            {task.title}
                          </h5>
                          {task.description && (
                            <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                              {task.description}
                            </p>
                          )}
                        </div>

                        {/* Linked Post Chip */}
                        {task.relatedPostTitle && (
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              const post = data.posts.find((p) => p.id === task.relatedPostId);
                              if (post) openPostDetail(post);
                            }}
                            className="p-1.5 rounded-lg bg-sky-50/70 border border-sky-100 hover:bg-sky-100/70 flex items-center gap-1.5 text-[10px] font-semibold text-sky-800 transition-colors"
                          >
                            <FileText className="w-3 h-3 text-sky-600 shrink-0" />
                            <span className="truncate">{task.relatedPostTitle}</span>
                          </div>
                        )}

                        {/* Checklist & Assignee */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                          <div className="flex items-center gap-1 text-slate-500">
                            <User className="w-3 h-3 text-slate-400" />
                            <span className="font-semibold text-slate-700">{task.assigneeName}</span>
                          </div>

                          {totalCheck > 0 && (
                            <span className="text-[10px] text-slate-400 font-medium flex items-center gap-0.5">
                              <CheckSquare className="w-3 h-3" />
                              {completedCheck}/{totalCheck}
                            </span>
                          )}
                        </div>

                        {/* Move Columns Controls */}
                        <div
                          className="flex items-center justify-between pt-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {prevStatus ? (
                            <button
                              onClick={() => changeTaskStatus(task.id, prevStatus)}
                              className="text-[10px] text-slate-400 hover:text-slate-700 flex items-center gap-0.5"
                            >
                              <ArrowLeft className="w-3 h-3" />
                              <span>Retroceder</span>
                            </button>
                          ) : (
                            <span />
                          )}

                          {nextStatus && (
                            <button
                              onClick={() => changeTaskStatus(task.id, nextStatus)}
                              className="text-[10px] text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-0.5"
                            >
                              <span>Avanzar</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
