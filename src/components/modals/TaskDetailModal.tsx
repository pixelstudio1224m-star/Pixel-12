import React, { useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { Task, TaskStatus, TaskPriority } from '../../types';
import {
  X,
  CheckCircle2,
  Clock,
  Calendar,
  User,
  AlertCircle,
  FileText,
  Send,
  Plus,
  Trash2,
  CheckSquare,
  Square
} from 'lucide-react';

export const TaskDetailModal: React.FC = () => {
  const {
    selectedTask,
    closeTaskDetail,
    updateTask,
    deleteTask,
    changeTaskStatus,
    openPostDetail,
    data,
    showToast
  } = useWorkspace();

  const [newChecklistText, setNewChecklistText] = useState('');
  const [commentInput, setCommentInput] = useState('');

  if (!selectedTask) return null;

  const linkedPost = selectedTask.relatedPostId
    ? data.posts.find((p) => p.id === selectedTask.relatedPostId)
    : null;

  const completedChecklistCount = (selectedTask.checklist || []).filter((c) => c.completed).length;
  const totalChecklistCount = (selectedTask.checklist || []).length;
  const progressPercent =
    totalChecklistCount > 0 ? Math.round((completedChecklistCount / totalChecklistCount) * 100) : 0;

  const toggleChecklistItem = async (itemId: string) => {
    const updatedChecklist = selectedTask.checklist.map((c) =>
      c.id === itemId ? { ...c, completed: !c.completed } : c
    );
    await updateTask({ ...selectedTask, checklist: updatedChecklist });
  };

  const addChecklistItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChecklistText.trim()) return;

    const newItem = {
      id: 'chk_' + Date.now(),
      text: newChecklistText.trim(),
      completed: false,
    };

    await updateTask({
      ...selectedTask,
      checklist: [...selectedTask.checklist, newItem],
    });
    setNewChecklistText('');
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;

    const newComment = {
      id: 'com_' + Date.now(),
      authorId: data.currentMember.id,
      authorName: data.currentMember.name,
      authorAvatar: data.currentMember.avatar,
      text: commentInput.trim(),
      timestamp: new Date().toISOString(),
    };

    await updateTask({
      ...selectedTask,
      comments: [...(selectedTask.comments || []), newComment],
    });
    setCommentInput('');
    showToast('Comentario añadido');
  };

  const priorityColors: Record<TaskPriority, { bg: string; text: string }> = {
    HIGH: { bg: 'bg-rose-100', text: 'text-rose-800' },
    MEDIUM: { bg: 'bg-amber-100', text: 'text-amber-800' },
    LOW: { bg: 'bg-slate-100', text: 'text-slate-800' },
  };

  return (
    <div
      id="task-detail-modal"
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <span
              className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                priorityColors[selectedTask.priority]?.bg || 'bg-slate-100'
              } ${priorityColors[selectedTask.priority]?.text || 'text-slate-700'}`}
            >
              {selectedTask.priority}
            </span>
            <span className="text-xs font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
              {selectedTask.status}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (confirm('¿Eliminar esta tarea?')) {
                  deleteTask(selectedTask.id);
                  closeTaskDetail();
                }
              }}
              className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={closeTaskDetail}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Title & Description */}
          <div>
            <h3 className="text-base font-bold text-slate-900 leading-snug">{selectedTask.title}</h3>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{selectedTask.description}</p>
          </div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] font-semibold uppercase">Asignado a</span>
              <div className="flex items-center gap-1.5 font-bold text-slate-800 mt-0.5">
                <User className="w-3.5 h-3.5 text-sky-600" />
                <span>{selectedTask.assigneeName}</span>
              </div>
            </div>

            <div>
              <span className="text-slate-400 block text-[10px] font-semibold uppercase">Fecha límite</span>
              <div className="flex items-center gap-1.5 font-bold text-slate-800 mt-0.5">
                <Calendar className="w-3.5 h-3.5 text-amber-600" />
                <span>
                  {selectedTask.deadlineDate} · {selectedTask.deadlineTime}
                </span>
              </div>
            </div>

            <div>
              <span className="text-slate-400 block text-[10px] font-semibold uppercase">Cambiar estado</span>
              <select
                value={selectedTask.status}
                onChange={(e) => changeTaskStatus(selectedTask.id, e.target.value as TaskStatus)}
                className="mt-0.5 text-xs font-semibold p-1 bg-white border border-slate-300 rounded outline-none w-full"
              >
                <option value="TODO">TODO (Por hacer)</option>
                <option value="IN_PROGRESS">IN PROGRESS (En progreso)</option>
                <option value="IN_REVIEW">IN REVIEW (En revisión)</option>
                <option value="COMPLETED">COMPLETED (Completada)</option>
                <option value="CANCELLED">CANCELLED (Cancelada)</option>
              </select>
            </div>
          </div>

          {/* Linked Post Card */}
          {linkedPost && (
            <div className="p-3.5 rounded-xl bg-sky-50/70 border border-sky-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4 text-sky-600 shrink-0" />
                <div>
                  <span className="text-[10px] uppercase tracking-wide font-bold text-sky-800 block">
                    Publicación Vinculada
                  </span>
                  <p className="text-xs font-bold text-slate-900 line-clamp-1">{linkedPost.internalTitle}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  closeTaskDetail();
                  openPostDetail(linkedPost);
                }}
                className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shrink-0 transition-colors"
              >
                Ver Post
              </button>
            </div>
          )}

          {/* Subtasks / Checklist */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">
                Checklist de Subtareas ({completedChecklistCount}/{totalChecklistCount})
              </span>
              <span className="text-xs font-semibold text-slate-500">{progressPercent}% completado</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Checklist Items */}
            <div className="space-y-1 mt-2">
              {(selectedTask.checklist || []).map((item) => (
                <div
                  key={item.id}
                  onClick={() => toggleChecklistItem(item.id)}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 cursor-pointer text-xs transition-colors"
                >
                  {item.completed ? (
                    <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-300 shrink-0" />
                  )}
                  <span
                    className={`leading-tight ${
                      item.completed ? 'line-through text-slate-400' : 'text-slate-700'
                    }`}
                  >
                    {item.text}
                  </span>
                </div>
              ))}
            </div>

            {/* Add Subtask Input */}
            <form onSubmit={addChecklistItem} className="flex gap-2 mt-2">
              <input
                type="text"
                placeholder="Añadir subtarea..."
                value={newChecklistText}
                onChange={(e) => setNewChecklistText(e.target.value)}
                className="flex-1 text-xs p-2 rounded-lg border border-slate-300 focus:border-sky-500 outline-none"
              />
              <button
                type="submit"
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Agregar</span>
              </button>
            </form>
          </div>

          {/* Comments Section */}
          <div className="space-y-3 pt-3 border-t border-slate-200">
            <span className="text-xs font-bold text-slate-800 block">Comentarios del Equipo</span>

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {(!selectedTask.comments || selectedTask.comments.length === 0) && (
                <p className="text-[11px] text-slate-400 italic">No hay comentarios en esta tarea aún.</p>
              )}
              {selectedTask.comments?.map((com) => (
                <div key={com.id} className="p-2.5 rounded-lg bg-slate-50 text-xs border border-slate-100">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-800">{com.authorName}</span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(com.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">{com.text}</p>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddComment} className="flex gap-2">
              <input
                type="text"
                placeholder="Escribe un comentario o actualización..."
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                className="flex-1 text-xs p-2 rounded-lg border border-slate-300 focus:border-sky-500 outline-none"
              />
              <button
                type="submit"
                className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors flex items-center gap-1"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
