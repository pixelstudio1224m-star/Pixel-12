import React, { useState, useMemo } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import { useAuth } from '../context/AuthContext';
import { TeamMember, TeamRole } from '../types';
import {
  Users,
  UserPlus,
  Shield,
  ShieldCheck,
  Mail,
  CheckCircle2,
  AlertTriangle,
  Send,
  Copy,
  Check,
  UserX,
  UserCheck,
  RefreshCw,
  Search,
  Lock,
  Clock,
  ExternalLink,
  Info
} from 'lucide-react';
import {
  inviteTeamMemberApi,
  resendTeamInvitationApi,
  deactivateTeamMemberApi,
  reactivateTeamMemberApi
} from '../lib/api';

export const TeamView: React.FC = () => {
  const { data, showToast, reloadWorkspaceData } = useWorkspace();
  const { profile, canManageTeam } = useAuth();

  // Filter & Search
  const [filterTab, setFilterTab] = useState<'all' | 'active' | 'invited' | 'inactive'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<TeamRole>('Designer');
  const [isSendingInvite, setIsSendingInvite] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);

  // Invite Success Modal (for viewing/copying generated link)
  const [inviteSuccessData, setInviteSuccessData] = useState<{
    email: string;
    role: string;
    inviteUrl: string;
    emailSent: boolean;
    emailDeliveryError?: string;
  } | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Deactivation confirmation modal
  const [memberToDeactivate, setMemberToDeactivate] = useState<TeamMember | null>(null);
  const [isDeactivating, setIsDeactivating] = useState(false);

  // Reactivation state
  const [memberToReactivate, setMemberToReactivate] = useState<TeamMember | null>(null);
  const [isReactivating, setIsReactivating] = useState(false);

  // Resend state
  const [resendingId, setResendingId] = useState<string | null>(null);

  // Safe members list
  const members = useMemo(() => {
    return Array.isArray(data?.members) ? data.members : [];
  }, [data?.members]);

  const currentMemberId = data?.currentMember?.id;

  // Filtered members
  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      // Filter by tab
      if (filterTab === 'active' && m.status !== 'active') return false;
      if (filterTab === 'invited' && m.status !== 'invited') return false;
      if (filterTab === 'inactive' && m.status !== 'inactive') return false;

      // Filter by search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = m.name?.toLowerCase().includes(q);
        const matchEmail = m.email?.toLowerCase().includes(q);
        const matchRole = m.role?.toLowerCase().includes(q);
        return matchName || matchEmail || matchRole;
      }
      return true;
    });
  }, [members, filterTab, searchQuery]);

  // Metric counts
  const totalCount = members.length;
  const activeCount = members.filter((m) => m.status === 'active').length;
  const invitedCount = members.filter((m) => m.status === 'invited').length;
  const inactiveCount = members.filter((m) => m.status === 'inactive').length;

  // Handle Send Invitation
  const handleSendInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteError(null);

    if (!canManageTeam) {
      setInviteError('Solo los administradores pueden invitar nuevos miembros.');
      return;
    }

    if (!inviteName.trim() || !inviteEmail.trim()) {
      setInviteError('Completa todos los campos obligatorios.');
      return;
    }

    setIsSendingInvite(true);
    try {
      const res = await inviteTeamMemberApi({
        name: inviteName.trim(),
        email: inviteEmail.trim(),
        role: inviteRole,
        invitedBy: {
          id: profile?.uid || currentMemberId || 'admin',
          name: profile?.displayName || data?.currentMember?.name || 'Administrador',
          email: profile?.email || 'admin@pixel12.agency'
        }
      });

      setIsSendingInvite(false);
      setIsInviteModalOpen(false);
      setInviteName('');
      setInviteEmail('');

      // Refresh workspace data to show new member in list
      await reloadWorkspaceData();

      // Show success modal with direct link and email delivery status
      setInviteSuccessData({
        email: inviteEmail.trim(),
        role: inviteRole,
        inviteUrl: res.inviteUrl,
        emailSent: res.emailSent,
        emailDeliveryError: res.emailDeliveryError
      });

      if (res.emailSent) {
        showToast(`Invitación enviada por correo a ${inviteEmail.trim()}`);
      } else {
        showToast(`Invitación generada. Copia el enlace para enviarlo manualmente.`);
      }
    } catch (err: any) {
      setIsSendingInvite(false);
      setInviteError(err?.message || 'Error al enviar la invitación.');
    }
  };

  // Handle Resend Invitation
  const handleResend = async (member: TeamMember) => {
    if (!canManageTeam) return;
    setResendingId(member.id);
    try {
      const res = await resendTeamInvitationApi({
        memberId: member.id,
        email: member.email
      });

      await reloadWorkspaceData();

      setInviteSuccessData({
        email: member.email,
        role: member.role,
        inviteUrl: res.inviteUrl,
        emailSent: res.emailSent,
        emailDeliveryError: res.emailDeliveryError
      });

      showToast(`Invitación reenviada a ${member.email}`);
    } catch (err: any) {
      showToast(err?.message || 'Error al reenviar invitación');
    } finally {
      setResendingId(null);
    }
  };

  // Handle Deactivate Confirm
  const handleConfirmDeactivation = async () => {
    if (!memberToDeactivate || !canManageTeam) return;
    setIsDeactivating(true);
    try {
      await deactivateTeamMemberApi(memberToDeactivate.id);
      await reloadWorkspaceData();
      showToast(`Acceso revocado para ${memberToDeactivate.name}. Sus tareas e historial se conservan.`);
      setMemberToDeactivate(null);
    } catch (err: any) {
      showToast(err?.message || 'Error al desactivar el miembro');
    } finally {
      setIsDeactivating(false);
    }
  };

  // Handle Reactivate Confirm
  const handleConfirmReactivation = async () => {
    if (!memberToReactivate || !canManageTeam) return;
    setIsReactivating(true);
    try {
      await reactivateTeamMemberApi(memberToReactivate.id);
      await reloadWorkspaceData();
      showToast(`Acceso restablecido para ${memberToReactivate.name}.`);
      setMemberToReactivate(null);
    } catch (err: any) {
      showToast(err?.message || 'Error al reactivar el miembro');
    } finally {
      setIsReactivating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div id="team-view" className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto selection:bg-[#D4AF37]/30 selection:text-white">
      {/* Top Banner & Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-[#12121A] border border-[#27273A] shadow-xl relative overflow-hidden">
        <div className="space-y-1 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1C1C2A] border border-[#D4AF37]/30 text-[10px] font-bold text-[#E5C158] uppercase tracking-wider mb-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Gestión Privada de Miembros • Pixel 12 OS</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Equipo & Colaboradores de Pixel 12 Studio
          </h2>
          <p className="text-xs text-zinc-400 max-w-2xl leading-relaxed">
            Administra el acceso interno mediante invitaciones seguras con token de un solo uso.
            El sistema de desactivación revoca credenciales de inmediato y resguarda la integridad de tareas, proyectos e historial.
          </p>
        </div>

        <div className="flex items-center gap-3 z-10">
          {canManageTeam && (
            <button
              onClick={() => {
                setInviteError(null);
                setIsInviteModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#E5C158] via-[#D4AF37] to-[#B89628] text-black font-bold text-xs tracking-wide shadow-lg shadow-[#D4AF37]/20 hover:brightness-110 active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Invitar Miembro</span>
            </button>
          )}
        </div>
      </div>

      {/* Security & Permissions Notice for non-admins */}
      {!canManageTeam && (
        <div className="p-3.5 rounded-2xl bg-[#1C1C2A]/60 border border-[#27273A] flex items-center gap-3 text-xs text-zinc-400">
          <Info className="w-4 h-4 text-[#D4AF37] shrink-0" />
          <span>
            Modo solo lectura: Tu rol actual no posee privilegios de administrador para emitir invitaciones o gestionar credenciales.
          </span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-[#12121A] border border-[#27273A] space-y-1">
          <span className="text-[11px] font-medium text-zinc-400">Total Miembros</span>
          <div className="flex items-center justify-between">
            <p className="text-2xl font-bold text-white">{totalCount}</p>
            <Users className="w-4 h-4 text-zinc-500" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#12121A] border border-emerald-950/40 space-y-1">
          <span className="text-[11px] font-medium text-emerald-400">Activos en Plataforma</span>
          <div className="flex items-center justify-between">
            <p className="text-2xl font-bold text-emerald-400">{activeCount}</p>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#12121A] border border-[#D4AF37]/30 space-y-1">
          <span className="text-[11px] font-medium text-[#E5C158]">Invitaciones Pendientes</span>
          <div className="flex items-center justify-between">
            <p className="text-2xl font-bold text-[#E5C158]">{invitedCount}</p>
            <Clock className="w-4 h-4 text-[#D4AF37]" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#12121A] border border-zinc-800 space-y-1">
          <span className="text-[11px] font-medium text-zinc-400">Desactivados</span>
          <div className="flex items-center justify-between">
            <p className="text-2xl font-bold text-zinc-400">{inactiveCount}</p>
            <UserX className="w-4 h-4 text-zinc-500" />
          </div>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-2 rounded-2xl bg-[#12121A] border border-[#27273A]">
        {/* Tabs */}
        <div className="flex items-center gap-1 w-full sm:w-auto overflow-x-auto p-1">
          <button
            onClick={() => setFilterTab('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              filterTab === 'all'
                ? 'bg-[#1C1C2A] text-white border border-[#D4AF37]/40 shadow-xs'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Todos ({totalCount})
          </button>
          <button
            onClick={() => setFilterTab('active')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              filterTab === 'active'
                ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/30'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Activos ({activeCount})
          </button>
          <button
            onClick={() => setFilterTab('invited')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              filterTab === 'invited'
                ? 'bg-[#D4AF37]/15 text-[#E5C158] border border-[#D4AF37]/40'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Pendientes ({invitedCount})
          </button>
          <button
            onClick={() => setFilterTab('inactive')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              filterTab === 'inactive'
                ? 'bg-red-950/30 text-red-300 border border-red-500/30'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Inactivos ({inactiveCount})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre, correo o rol..."
            className="w-full pl-9 pr-3 py-1.5 bg-[#181824] border border-[#27273A] rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-hidden focus:border-[#D4AF37] transition-colors"
          />
        </div>
      </div>

      {/* Members Table */}
      <div className="rounded-3xl bg-[#12121A] border border-[#27273A] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#181824] border-b border-[#27273A] text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                <th className="py-3.5 px-5">Miembro del Equipo</th>
                <th className="py-3.5 px-4">Correo Electrónico</th>
                <th className="py-3.5 px-4">Rol en Pixel 12</th>
                <th className="py-3.5 px-4">Carga de Tareas</th>
                <th className="py-3.5 px-4">Estado</th>
                <th className="py-3.5 px-5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F1F2E]">
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-500">
                    No se encontraron colaboradores con los criterios seleccionados.
                  </td>
                </tr>
              ) : (
                filteredMembers.map((m) => {
                  const assignedTasks = (data?.tasks || []).filter(
                    (t) => t.assigneeId === m.id && t.status !== 'COMPLETED'
                  );
                  const isCurrent = m.id === currentMemberId || m.email === profile?.email;
                  const isMasterAdmin = m.email === 'pixelstudio1224m@gmail.com';

                  return (
                    <tr key={m.id} className="hover:bg-[#161622] transition-colors group">
                      {/* Name & Avatar */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <img
                              src={
                                m.avatar ||
                                `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`
                              }
                              alt={m.name}
                              className={`w-9 h-9 rounded-xl object-cover border ${
                                m.status === 'active'
                                  ? 'border-emerald-500/40'
                                  : m.status === 'invited'
                                  ? 'border-[#D4AF37]/50'
                                  : 'border-zinc-700 opacity-60'
                              }`}
                            />
                            <div
                              className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-[#12121A] ${
                                m.status === 'active'
                                  ? 'bg-emerald-500'
                                  : m.status === 'invited'
                                  ? 'bg-[#D4AF37]'
                                  : 'bg-zinc-600'
                              }`}
                            />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white text-xs">{m.name}</span>
                              {isCurrent && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1C1C2A] border border-[#D4AF37]/40 text-[#E5C158] font-bold">
                                  Tú
                                </span>
                              )}
                            </div>
                            {m.status === 'invited' && (
                              <span className="text-[10px] text-[#E5C158]/80 flex items-center gap-1 mt-0.5">
                                <Clock className="w-3 h-3" /> Invitación pendiente
                              </span>
                            )}
                            {m.status === 'inactive' && (
                              <span className="text-[10px] text-zinc-500 flex items-center gap-1 mt-0.5">
                                <Lock className="w-3 h-3" /> Acceso revocado
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-4 px-4 text-zinc-300 font-mono text-[11px]">
                        {m.email}
                      </td>

                      {/* Role */}
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#181824] border border-[#27273A] text-zinc-300 text-[11px] font-medium">
                          {m.role}
                        </span>
                      </td>

                      {/* Tasks */}
                      <td className="py-4 px-4">
                        <span className="text-zinc-300 font-semibold text-xs">
                          {assignedTasks.length} {assignedTasks.length === 1 ? 'tarea' : 'tareas'}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        {m.status === 'active' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            Activo
                          </span>
                        )}
                        {m.status === 'invited' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#E5C158] text-[10px] font-bold uppercase tracking-wider">
                            <Clock className="w-3 h-3" />
                            Pendiente
                          </span>
                        )}
                        {m.status === 'inactive' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-400 text-[10px] font-bold uppercase tracking-wider">
                            <UserX className="w-3 h-3" />
                            Desactivado
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {/* Resend Invitation (for invited members) */}
                          {m.status === 'invited' && canManageTeam && (
                            <button
                              onClick={() => handleResend(m)}
                              disabled={resendingId === m.id}
                              title="Reenviar invitación por correo y ver enlace"
                              className="px-2.5 py-1.5 rounded-lg bg-[#1C1C2A] border border-[#D4AF37]/40 text-[#E5C158] hover:bg-[#D4AF37]/20 text-[11px] font-semibold transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                            >
                              <RefreshCw
                                className={`w-3.5 h-3.5 ${resendingId === m.id ? 'animate-spin' : ''}`}
                              />
                              <span>Reenviar</span>
                            </button>
                          )}

                          {/* Reactivate (for inactive members) */}
                          {m.status === 'inactive' && canManageTeam && (
                            <button
                              onClick={() => setMemberToReactivate(m)}
                              title="Reactivar acceso al sistema"
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-950/30 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/40 text-[11px] font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                              <span>Reactivar</span>
                            </button>
                          )}

                          {/* Deactivate / Revoke access (for active and invited members) */}
                          {m.status !== 'inactive' && canManageTeam && (
                            <button
                              onClick={() => setMemberToDeactivate(m)}
                              disabled={isCurrent || isMasterAdmin}
                              title={
                                isCurrent
                                  ? 'No puedes desactivarte a ti mismo'
                                  : isMasterAdmin
                                  ? 'El administrador principal no puede ser desactivado'
                                  : 'Desactivar y revocar acceso a Pixel 12 OS'
                              }
                              className={`p-1.5 rounded-lg text-[11px] font-semibold transition-colors flex items-center gap-1 ${
                                isCurrent || isMasterAdmin
                                  ? 'text-zinc-600 cursor-not-allowed'
                                  : 'text-zinc-400 hover:text-red-400 hover:bg-red-500/10 cursor-pointer'
                              }`}
                            >
                              <UserX className="w-4 h-4" />
                              <span className="hidden lg:inline text-[11px]">Dar de Baja</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= MODAL: INVITAR MIEMBRO ================= */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md p-6 sm:p-7 rounded-3xl bg-[#12121A] border border-[#27273A] shadow-2xl space-y-5 text-left relative">
            <div className="flex items-center justify-between pb-3 border-b border-[#1F1F2E]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#1C1C2A] border border-[#D4AF37]/40 text-[#E5C158]">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Invitar Nuevo Miembro</h3>
                  <p className="text-[11px] text-zinc-400">
                    Se generará un enlace de un solo uso y se enviará por email
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsInviteModalOpen(false)}
                className="text-zinc-400 hover:text-white text-xs px-2 py-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            {inviteError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{inviteError}</span>
              </div>
            )}

            <form onSubmit={handleSendInvitation} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">
                  Nombre Completo del Colaborador
                </label>
                <input
                  type="text"
                  required
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="Ej. Sofía Martínez"
                  className="w-full px-3.5 py-2.5 bg-[#181824] border border-[#27273A] rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-hidden focus:border-[#D4AF37] transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">
                  Correo Electrónico Corporativo / Personal
                </label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="sofia@pixel12.agency"
                  className="w-full px-3.5 py-2.5 bg-[#181824] border border-[#27273A] rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-hidden focus:border-[#D4AF37] transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">
                  Rol & Especialidad en la Agencia
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as TeamRole)}
                  className="w-full px-3 py-2.5 bg-[#181824] border border-[#27273A] rounded-xl text-xs text-white focus:outline-hidden focus:border-[#D4AF37]"
                >
                  <option value="Manager">Director de Proyectos / Operaciones (Manager)</option>
                  <option value="Designer">Diseñador Gráfico & Visual (Designer)</option>
                  <option value="Copywriter">Copywriter & Estratega de Contenido</option>
                  <option value="Community Manager">Community Manager (CM)</option>
                  <option value="Editor">Editor Audiovisual & Contenidos</option>
                  <option value="Viewer">Visualizador Interno (Viewer)</option>
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#1F1F2E]">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#181824] text-zinc-300 hover:text-white text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSendingInvite}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#E5C158] via-[#D4AF37] to-[#B89628] text-black font-bold text-xs shadow-lg shadow-[#D4AF37]/20 hover:brightness-110 active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSendingInvite ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      <span>Enviando Invitación...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Emitir Invitación</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ÉXITO INVITACIÓN & ENLACE DIRECTO ================= */}
      {inviteSuccessData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md p-6 rounded-3xl bg-[#12121A] border border-[#D4AF37]/40 shadow-2xl space-y-5 text-left relative">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#E5C158]">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Invitación Registrada</h3>
                <p className="text-[11px] text-zinc-400">
                  Para {inviteSuccessData.email} ({inviteSuccessData.role})
                </p>
              </div>
            </div>

            {/* Email Status Notice */}
            {inviteSuccessData.emailSent ? (
              <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2.5">
                <Mail className="w-4 h-4 mt-0.5 shrink-0" />
                <span>
                  El correo de invitación ha sido despachado exitosamente mediante el servicio transaccional configurado.
                </span>
              </div>
            ) : (
              <div className="p-3 rounded-2xl bg-[#1C1C2A] border border-[#D4AF37]/30 text-zinc-300 text-xs space-y-1">
                <div className="flex items-center gap-2 text-[#E5C158] font-semibold text-[11px]">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Envío directo por enlace activo</span>
                </div>
                <p className="text-[11px] text-zinc-400">
                  {inviteSuccessData.emailDeliveryError ||
                    'Puedes copiar el enlace seguro a continuación y compartirlo directamente con el miembro:'}
                </p>
              </div>
            )}

            {/* Direct Invitation Link */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider">
                Enlace Único de Activación (Válido 7 Días)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={inviteSuccessData.inviteUrl}
                  className="w-full px-3 py-2 bg-[#181824] border border-[#27273A] rounded-xl text-[11px] font-mono text-zinc-300 select-all"
                />
                <button
                  onClick={() => copyToClipboard(inviteSuccessData.inviteUrl)}
                  className="px-3.5 py-2 rounded-xl bg-[#1C1C2A] border border-[#D4AF37]/40 text-[#E5C158] hover:bg-[#D4AF37]/20 text-xs font-bold transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Copiado' : 'Copiar'}</span>
                </button>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setInviteSuccessData(null)}
                className="px-5 py-2.5 rounded-xl bg-[#1C1C2A] hover:bg-[#252538] text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: CONFIRMACIÓN DE DESACTIVACIÓN ================= */}
      {memberToDeactivate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md p-6 sm:p-7 rounded-3xl bg-[#12121A] border border-red-500/40 shadow-2xl space-y-5 text-left">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  ¿Desactivar acceso de {memberToDeactivate.name}?
                </h3>
                <p className="text-[11px] text-zinc-400">{memberToDeactivate.email}</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#181824] border border-[#27273A] space-y-2 text-xs text-zinc-300 leading-relaxed">
              <p className="font-semibold text-white flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-red-400" />
                Consecuencias inmediatas:
              </p>
              <ul className="list-disc list-inside space-y-1 text-zinc-400 text-[11px]">
                <li>El colaborador no podrá volver a iniciar sesión en Pixel 12 OS.</li>
                <li>
                  <strong className="text-zinc-200">Preservación total:</strong> No se borrarán sus publicaciones,
                  tareas asignadas, actividades de CRM ni cotizaciones creadas.
                </li>
                <li>Podrás reactivar o re-invitar a esta persona en el momento que lo decidas.</li>
              </ul>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setMemberToDeactivate(null)}
                className="px-4 py-2 rounded-xl bg-[#181824] text-zinc-300 hover:text-white text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDeactivation}
                disabled={isDeactivating}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isDeactivating ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Desactivando...</span>
                  </>
                ) : (
                  <>
                    <UserX className="w-4 h-4" />
                    <span>Confirmar Desactivación</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: CONFIRMACIÓN DE REACTIVACIÓN ================= */}
      {memberToReactivate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md p-6 sm:p-7 rounded-3xl bg-[#12121A] border border-emerald-500/40 shadow-2xl space-y-5 text-left">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  ¿Reactivar acceso a {memberToReactivate.name}?
                </h3>
                <p className="text-[11px] text-zinc-400">{memberToReactivate.email}</p>
              </div>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              Al reactivar a este colaborador, recuperará inmediatamente el acceso a Pixel 12 OS con su rol habitual ({memberToReactivate.role}).
            </p>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setMemberToReactivate(null)}
                className="px-4 py-2 rounded-xl bg-[#181824] text-zinc-300 hover:text-white text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmReactivation}
                disabled={isReactivating}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isReactivating ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Reactivando...</span>
                  </>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4" />
                    <span>Confirmar Reactivación</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
