import React, { useState } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import { Task } from '../types';
import { CalendarRange, Clock, User, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';

export const TeamCalendarView: React.FC = () => {
  const { data, activeBrand, openTaskDetail } = useWorkspace();

  const [selectedMember, setSelectedMember] = useState('ALL');

  const tasksList = data?.tasks || [];
  const tasks = tasksList.filter((t) => {
    if (!t) return false;
    if (selectedMember !== 'ALL' && t.assigneeId !== selectedMember) return false;
    return true;
  });

  return (
    <div id="team-calendar-view" className="p-6 space-y-4 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <CalendarRange className="w-5 h-5 text-indigo-600" />
          <div>
            <h3 className="text-sm font-bold text-slate-900">Calendario de Entregas del Equipo</h3>
            <p className="text-xs text-slate-500">
              Deadlines y compromisos de diseño, redacción y programación
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Filtrar por miembro:</span>
          <select
            value={selectedMember}
            onChange={(e) => setSelectedMember(e.target.value)}
            className="text-xs p-2 rounded-lg border border-slate-300 bg-white"
          >
            <option value="ALL">Todo el equipo</option>
            {(data?.members || []).map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.role})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Task Deadlines Timeline / Schedule List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs divide-y divide-slate-100">
        {tasks.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No hay tareas programadas para este filtro.
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              onClick={() => openTaskDetail(task)}
              className="p-4 hover:bg-slate-50 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${
                      task.priority === 'HIGH'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {task.priority}
                  </span>
                  <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    Vence: {task.deadlineDate} a las {task.deadlineTime}
                  </span>
                </div>

                <h4 className="text-xs font-bold text-slate-900">{task.title}</h4>
                <p className="text-[11px] text-slate-500 line-clamp-1">{task.description}</p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>{task.assigneeName}</span>
                </div>

                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  {task.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
