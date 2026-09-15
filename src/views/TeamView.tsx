import React, { useState } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import { TeamMember, TeamRole } from '../types';
import { Users, Plus, Shield, Mail, CheckCircle2 } from 'lucide-react';

export const TeamView: React.FC = () => {
  const { data, showToast } = useWorkspace();

  const [isInviting, setIsInviting] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<TeamRole>('Designer');

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !inviteName.trim()) return;

    const newMember: TeamMember = {
      id: 'mem_' + Date.now(),
      name: inviteName.trim(),
      email: inviteEmail.trim(),
      role: inviteRole,
      avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
      status: 'active',
    };

    data.members.push(newMember);
    setIsInviting(false);
    setInviteName('');
    setInviteEmail('');
    showToast(`Invitación enviada a ${newMember.email} con rol ${newMember.role}`);
  };

  return (
    <div id="team-view" className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Equipo & Roles de Pixel 12</h3>
            <p className="text-xs text-slate-500">
              Administración de miembros, asignaciones automáticas y permisos de aprobación
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsInviting(true)}
          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ Invitar Miembro</span>
        </button>
      </div>

      {/* Invite Modal */}
      {isInviting && (
        <form
          onSubmit={handleInvite}
          className="p-5 rounded-2xl bg-white border border-purple-300 shadow-md space-y-4 animate-in fade-in duration-150"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h4 className="text-xs font-bold text-slate-900">+ Invitar Nuevo Colaborador</h4>
            <button
              type="button"
              onClick={() => setIsInviting(false)}
              className="text-xs text-slate-400 hover:text-slate-700"
            >
              Cancelar
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nombre Completo</label>
              <input
                type="text"
                required
                placeholder="Ej: Andrés Morales"
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-slate-300 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Correo Electrónico</label>
              <input
                type="email"
                required
                placeholder="andres@pixel12.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-slate-300 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Rol / Especialidad</label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as TeamRole)}
                className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
              >
                <option value="Designer">Diseñador Gráfico / Visual</option>
                <option value="Copywriter">Copywriter / Redactor</option>
                <option value="Community Manager">Community Manager (CM)</option>
                <option value="Manager">Project Manager / Director</option>
                <option value="Editor">Editor de Contenido</option>
                <option value="Viewer">Visualizador / Cliente</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsInviting(false)}
              className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold"
            >
              Enviar Invitación
            </button>
          </div>
        </form>
      )}

      {/* Members Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Miembro</th>
                <th className="py-3 px-3">Correo</th>
                <th className="py-3 px-3">Rol</th>
                <th className="py-3 px-3">Tareas Activas</th>
                <th className="py-3 px-3">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.members.map((m) => {
                const assignedTasks = data.tasks.filter((t) => t.assigneeId === m.id && t.status !== 'COMPLETED');
                return (
                  <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={m.avatar}
                          alt={m.name}
                          className="w-8 h-8 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <h5 className="font-bold text-slate-900">{m.name}</h5>
                          {m.id === data.currentMember.id && (
                            <span className="text-[10px] font-semibold text-sky-600">(Tú)</span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3 text-slate-600">{m.email}</td>

                    <td className="py-3 px-3">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {m.role}
                      </span>
                    </td>

                    <td className="py-3 px-3 font-semibold text-slate-800">
                      {assignedTasks.length} tareas pendientes
                    </td>

                    <td className="py-3 px-3">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        {m.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
