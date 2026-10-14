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
  Info,
  Trash2,
  Settings,
  Sparkles,
  ArrowRight,
  Key
} from 'lucide-react';
import {
  inviteTeamMemberApi,
  resendTeamInvitationApi,
  deactivateTeamMemberApi,
  reactivateTeamMemberApi,
  deleteTeamMemberApi,
  saveSmtpSettingsApi
} from '../lib/api';

export const TeamView: React.FC = () => {
  const {
    data,
    showToast,
    reloadWorkspaceData,
    deactivateTeamMember,
    reactivateTeamMember,
    deleteTeamMember,
    addTeamMember
  } = useWorkspace();
  const { profile } = useAuth();

  // Permiso para gestionar equipo: habilitado para la consola del estudio
  const canManageTeam = true;

  // Filter & Search
  const [filterTab, setFilterTab] = useState<'all' | 'active' | 'invited' | 'inactive'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state: Invitar / Agregar
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<TeamRole>('Designer');
  const [isDirectAdd, setIsDirectAdd] = useState(false);
  const [isSendingInvite, setIsSendingInvite] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);

  // Invite Success Modal (for viewing/copying generated link and launching email)
  const [inviteSuccessData, setInviteSuccessData] = useState<{
    email: string;
    role: string;
    inviteUrl: string;
    emailSent: boolean;
    emailDeliveryError?: string;
    mailtoUrl?: string;
    previewText?: string;
  } | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  // Delete confirmation modal
  const [memberToDelete, setMemberToDelete] = useState<TeamMember | null>(null);
  const [reassignToMemberId, setReassignToMemberId] = useState<string>('');
  const [isDeletingMember, setIsDeletingMember] = useState(false);

  // Deactivation confirmation modal
  const [memberToDeactivate, setMemberToDeactivate] = useState<TeamMember | null>(null);
  const [isDeactivating, setIsDeactivating] = useState(false);

  // Reactivation state
  const [memberToReactivate, setMemberToReactivate] = useState<TeamMember | null>(null);
  const [isReactivating, setIsReactivating] = useState(false);

  // Resend state
  const [resendingId, setResendingId] = useState<string | null>(null);

  // SMTP Settings modal state
  const [isSmtpModalOpen, setIsSmtpModalOpen] = useState(false);
  const [smtpHost, setSmtpHost] = useState(data?.workspaceSettings?.smtp?.host || '');
  const [smtpPort, setSmtpPort] = useState(String(data?.workspaceSettings?.smtp?.port || 587));
  const [smtpUser, setSmtpUser] = useState(data?.workspaceSettings?.smtp?.user || '');
  const [smtpPass, setSmtpPass] = useState(data?.workspaceSettings?.smtp?.pass || '');
  const [smtpFrom, setSmtpFrom] = useState(data?.workspaceSettings?.smtp?.from || 'Pixel 12 OS <onboarding@resend.dev>');
  const [smtpSecure, setSmtpSecure] = useState(Boolean(data?.workspaceSettings?.smtp?.secure));
  const [isSavingSmtp, setIsSavingSmtp] = useState(false);

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

  // Handle Send Invitation / Direct Add
  const handleSendInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteError(null);

    if (!canManageTeam) {
      setInviteError('Solo los administradores u operadores del estudio pueden incorporar miembros.');
      return;
    }

    if (!inviteName.trim() || !inviteEmail.trim()) {
      setInviteError('Completa todos los campos obligatorios.');
      return;
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteEmail.trim())) {
      setInviteError('Ingresa un correo electrónico válido (ej: nombre@dominio.com).');
      return;
    }

    setIsSendingInvite(true);
    try {
      const res = await inviteTeamMemberApi({
        name: inviteName.trim(),
        email: inviteEmail.trim(),
        role: inviteRole,
        directAdd: isDirectAdd,
        invitedBy: {
          id: profile?.uid || currentMemberId || 'admin',
          name: profile?.displayName || data?.currentMember?.name || 'Administrador Pixel 12',
          email: profile?.email || data?.currentMember?.email || 'admin@pixel12.agency'
        }
      });

      setIsSendingInvite(false);
      setIsInviteModalOpen(false);
      const emailSaved = inviteEmail.trim();
      setInviteName('');
      setInviteEmail('');
      setIsDirectAdd(false);

      // Immediately update local workspace context & cloud state with new member
      if (res.member) {
        await addTeamMember(res.member, res.invitation);
      } else {
        await reloadWorkspaceData();
      }

      // Show success modal with direct link and email delivery status
      setInviteSuccessData({
        email: emailSaved,
        role: inviteRole,
        inviteUrl: res.inviteUrl,
        emailSent: res.emailSent,
        emailDeliveryError: res.emailDeliveryError,
        mailtoUrl: res.mailtoUrl,
        previewText: res.previewText
      });

      if (res.emailSent) {
        showToast(`Invitación enviada por correo electrónico a ${emailSaved}`);
      } else {
        showToast(`Miembro registrado exitosamente. Enlace y correo preparados para despacho.`);
      }
    } catch (err: any) {
      setIsSendingInvite(false);
      setInviteError(err?.message || 'Error al procesar la incorporación del colaborador.');
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
        emailDeliveryError: res.emailDeliveryError,
        mailtoUrl: res.mailtoUrl,
        previewText: res.previewText
      });

      showToast(`Invitación renovada y reenviada a ${member.email}`);
    } catch (err: any) {
      showToast(err?.message || 'Error al reenviar invitación');
    } finally {
      setResendingId(null);
    }
  };

  // Handle Permanent Delete Member
  const handleConfirmDelete = async () => {
    if (!memberToDelete || !canManageTeam) return;
    setIsDeletingMember(true);
    try {
      await deleteTeamMember(memberToDelete.id, reassignToMemberId);
      await reloadWorkspaceData();
      showToast(`El colaborador ${memberToDelete.name} ha sido eliminado definitivamente.`);
      setMemberToDelete(null);
    } catch (err: any) {
      showToast(err?.message || 'Error al eliminar el colaborador', 'error');
    } finally {
      setIsDeletingMember(false);
    }
  };

  // Handle Deactivate Confirm
  const handleConfirmDeactivation = async () => {
    if (!memberToDeactivate || !canManageTeam) return;
    setIsDeactivating(true);
    try {
      await deactivateTeamMember(memberToDeactivate.id);
      await reloadWorkspaceData();
      setMemberToDeactivate(null);
    } catch (err: any) {
      showToast(err?.message || 'Error al desactivar el miembro', 'error');
    } finally {
      setIsDeactivating(false);
    }
  };

  // Handle Reactivate Confirm
  const handleConfirmReactivation = async () => {
    if (!memberToReactivate || !canManageTeam) return;
    setIsReactivating(true);
    try {
      await reactivateTeamMember(memberToReactivate.id);
      await reloadWorkspaceData();
      setMemberToReactivate(null);
    } catch (err: any) {
      showToast(err?.message || 'Error al reactivar el miembro', 'error');
    } finally {
      setIsReactivating(false);
    }
  };

  // Handle Save SMTP
  const handleSaveSmtpSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSmtp(true);
    try {
      await saveSmtpSettingsApi({
        host: smtpHost.trim(),
        port: Number(smtpPort) || 587,
        user: smtpUser.trim(),
        pass: smtpPass,
        from: smtpFrom.trim(),
        secure: smtpSecure
      });
      await reloadWorkspaceData();
      showToast('Configuración de correo (SMTP) guardada exitosamente.');
      setIsSmtpModalOpen(false);
    } catch (err: any) {
      showToast(err?.message || 'Error al guardar la configuración SMTP', 'error');
    } finally {
      setIsSavingSmtp(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const copyTextToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
  };

  return (
    <div id="team-view" className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto selection:bg-[#D4AF37]/30 selection:text-white">
      {/* Top Banner & Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-[#12121A] border border-[#27273A] shadow-xl relative overflow-hidden">
        <div className="space-y-1 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1C1C2A] border border-[#D4AF37]/30 text-[10px] font-bold text-[#E5C158] uppercase tracking-wider mb-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Gestión Privada de Equipo • Pixel 12 Studio</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Equipo & Colaboradores de Pixel 12 Studio
          </h2>
          <p className="text-xs text-zinc-400 max-w-2xl leading-relaxed">
            Agrega nuevos colaboradores con su correo electrónico, despáchales invitaciones de acceso oficial y elimina
            permanentemente a los que no sean necesarios resguardando la continuidad de tareas y proyectos.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 z-10">
          {/* SMTP / Email Config Button */}
          <button
            onClick={() => setIsSmtpModalOpen(true)}
            title="Configurar servidor de correo o proveedor transaccional"
            className="px-3.5 py-2.5 rounded-xl bg-[#181824] border border-[#27273A] text-zinc-300 hover:text-white hover:border-[#D4AF37]/40 text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer"
          >
            <Settings className="w-4 h-4 text-[#D4AF37]" />
            <span className="hidden sm:inline">Servidor de Correo</span>
          </button>

          {/* Add / Invite Button */}
          {canManageTeam && (
            <button
              onClick={() => {
                setInviteError(null);
                setIsInviteModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#E5C158] via-[#D4AF37] to-[#B89628] text-black font-bold text-xs tracking-wide shadow-lg shadow-[#D4AF37]/20 hover:brightness-110 active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Agregar o Invitar Miembro</span>
            </button>
          )}
        </div>
      </div>

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
          <span className="text-[11px] font-medium text-zinc-400">Inactivos / Bajas</span>
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
                  const isSoleOwner = members.length <= 1;

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
                            {m.title && (
                              <p className="text-[10px] text-zinc-400 truncate max-w-[200px]">{m.title}</p>
                            )}
                            {m.status === 'invited' && (
                              <span className="text-[10px] text-[#E5C158]/80 flex items-center gap-1 mt-0.5">
                                <Clock className="w-3 h-3" /> Invitación pendiente
                              </span>
                            )}
                            {m.status === 'inactive' && (
                              <span className="text-[10px] text-zinc-500 flex items-center gap-1 mt-0.5">
                                <Lock className="w-3 h-3" /> Acceso suspendido
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-4 px-4 text-zinc-300 font-mono text-[11px]">
                        <span className="select-all">{m.email}</span>
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
                          {assignedTasks.length} {assignedTasks.length === 1 ? 'tarea activa' : 'tareas activas'}
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
                            Invitado
                          </span>
                        )}
                        {m.status === 'inactive' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-400 text-[10px] font-bold uppercase tracking-wider">
                            <UserX className="w-3 h-3" />
                            Inactivo
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 text-right">
                        <div className="inline-flex items-center gap-1.5 justify-end">
                          {/* Reenviar invitación por correo */}
                          {m.status === 'invited' && canManageTeam && (
                            <button
                              onClick={() => handleResend(m)}
                              disabled={resendingId === m.id}
                              title="Reenviar invitación por correo y generar enlace"
                              className="px-2.5 py-1.5 rounded-lg bg-[#1C1C2A] border border-[#D4AF37]/40 text-[#E5C158] hover:bg-[#D4AF37]/20 text-[11px] font-semibold transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                            >
                              <RefreshCw
                                className={`w-3.5 h-3.5 ${resendingId === m.id ? 'animate-spin' : ''}`}
                              />
                              <span>Reenviar</span>
                            </button>
                          )}

                          {/* Reactivar (para miembros inactivos) */}
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

                          {/* Dar de Baja temporal */}
                          {m.status === 'active' && canManageTeam && (
                            <button
                              onClick={() => setMemberToDeactivate(m)}
                              disabled={isCurrent && members.length > 1}
                              title={
                                isCurrent && members.length > 1
                                  ? 'No puedes suspender tu propia cuenta activa'
                                  : 'Suspender temporalmente el acceso'
                              }
                              className={`p-1.5 rounded-lg text-[11px] font-semibold transition-colors flex items-center gap-1 ${
                                isCurrent && members.length > 1
                                  ? 'text-zinc-600 cursor-not-allowed'
                                  : 'text-zinc-400 hover:text-amber-400 hover:bg-amber-500/10 cursor-pointer'
                              }`}
                            >
                              <UserX className="w-3.5 h-3.5" />
                              <span className="hidden xl:inline text-[11px]">Suspender</span>
                            </button>
                          )}

                          {/* ELIMINAR DEFINITIVAMENTE (Borrar a los que no son necesarios) */}
                          {canManageTeam && (
                            <button
                              onClick={() => {
                                setMemberToDelete(m);
                                const fallbackTarget =
                                  members.find((x) => x.id !== m.id && (x.role === 'Owner' || x.role === 'Admin'))?.id ||
                                  members.find((x) => x.id !== m.id)?.id ||
                                  '';
                                setReassignToMemberId(fallbackTarget);
                              }}
                              disabled={isSoleOwner}
                              title={
                                isSoleOwner
                                  ? 'No puedes eliminar al único Propietario (Owner) del estudio'
                                  : 'Eliminar permanentemente este colaborador del equipo'
                              }
                              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-colors flex items-center gap-1.5 ${
                                isSoleOwner
                                  ? 'text-zinc-600 cursor-not-allowed'
                                  : 'text-zinc-400 hover:text-red-400 hover:bg-red-500/10 cursor-pointer'
                              }`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Eliminar</span>
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

      {/* ================= MODAL: AGREGAR O INVITAR MIEMBRO ================= */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg p-6 sm:p-7 rounded-3xl bg-[#12121A] border border-[#27273A] shadow-2xl space-y-5 text-left relative max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#1F1F2E]">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-[#1C1C2A] border border-[#D4AF37]/40 text-[#E5C158]">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Incorporar Colaborador al Equipo</h3>
                  <p className="text-[11px] text-zinc-400">
                    Regístralo con su correo para despacharle su invitación o activarlo de inmediato
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsInviteModalOpen(false)}
                className="text-zinc-400 hover:text-white text-xs px-2 py-1 rounded-lg cursor-pointer"
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
              {/* Incorporation Mode Selector */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-[#181824] rounded-2xl border border-[#27273A]">
                <button
                  type="button"
                  onClick={() => setIsDirectAdd(false)}
                  className={`p-3 rounded-xl text-left transition-all cursor-pointer ${
                    !isDirectAdd
                      ? 'bg-[#1C1C2A] border border-[#D4AF37]/50 shadow-sm text-white'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <div className="flex items-center gap-2 text-xs font-bold">
                    <Mail className="w-3.5 h-3.5 text-[#E5C158]" />
                    <span>Invitar por Correo</span>
                  </div>
                  <p className="text-[10px] text-zinc-400 mt-1 leading-tight">
                    Envía enlace único para que cree su contraseña y acceda.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setIsDirectAdd(true)}
                  className={`p-3 rounded-xl text-left transition-all cursor-pointer ${
                    isDirectAdd
                      ? 'bg-[#1C1C2A] border border-emerald-500/50 shadow-sm text-white'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Agregar Activo Directo</span>
                  </div>
                  <p className="text-[10px] text-zinc-400 mt-1 leading-tight">
                    Queda activo hoy mismo para asignarle tareas de inmediato.
                  </p>
                </button>
              </div>

              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">
                  Nombre Completo del Colaborador <span className="text-red-400">*</span>
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

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">
                  Correo Electrónico <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="sofia@pixel12.agency o su correo personal"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-[#181824] border border-[#27273A] rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-hidden focus:border-[#D4AF37] transition-colors"
                  />
                </div>
                <p className="text-[10px] text-zinc-400">
                  A esta dirección le llegará el correo con el enlace de acceso oficial al sistema.
                </p>
              </div>

              {/* Role */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">
                  Rol & Especialidad en la Agencia <span className="text-red-400">*</span>
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as TeamRole)}
                  className="w-full px-3 py-2.5 bg-[#181824] border border-[#27273A] rounded-xl text-xs text-white focus:outline-hidden focus:border-[#D4AF37]"
                >
                  <option value="Manager">Director de Proyectos / Operaciones (Manager)</option>
                  <option value="Admin">Administrador de Agencia (Admin)</option>
                  <option value="Designer">Diseñador Gráfico & Visual (Designer)</option>
                  <option value="Copywriter">Copywriter & Estratega de Contenido</option>
                  <option value="Community Manager">Community Manager (CM)</option>
                  <option value="Editor">Editor Audiovisual & Contenidos</option>
                  <option value="Viewer">Visualizador Interno (Viewer)</option>
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-[#1F1F2E]">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-[#181824] text-zinc-300 hover:text-white text-xs font-semibold cursor-pointer"
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
                      <span>Procesando y Despachando...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>{isDirectAdd ? 'Agregar y Enviar Correo' : 'Despachar Invitación al Correo'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ÉXITO INVITACIÓN & ACCIONES DE CORREO ================= */}
      {inviteSuccessData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg p-6 sm:p-7 rounded-3xl bg-[#12121A] border border-[#D4AF37]/40 shadow-2xl space-y-5 text-left relative max-h-[92vh] overflow-y-auto">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#E5C158]">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">¡Colaborador Registrado con Éxito!</h3>
                <p className="text-[11px] text-zinc-400">
                  Para <strong className="text-white">{inviteSuccessData.email}</strong> ({inviteSuccessData.role})
                </p>
              </div>
            </div>

            {/* Email Status Notice */}
            {inviteSuccessData.emailSent ? (
              <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2.5">
                <Check className="w-4 h-4 mt-0.5 shrink-0 text-emerald-400" />
                <div className="space-y-0.5">
                  <p className="font-bold text-emerald-200">Invitación enviada por correo electrónico</p>
                  <p className="text-[11px] text-emerald-300/80">
                    El correo con las instrucciones y el enlace de activación ha sido despachado exitosamente a {inviteSuccessData.email}.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-[#1C1C2A] border border-[#D4AF37]/30 text-zinc-300 text-xs space-y-2">
                <div className="flex items-center gap-2 text-[#E5C158] font-bold text-xs">
                  <Mail className="w-4 h-4" />
                  <span>Enlace y Correo Listos para Enviar</span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Puedes abrir tu cliente de correo (Gmail, Outlook) con un solo clic con todo el mensaje redactado, o copiar el enlace de activación:
                </p>
              </div>
            )}

            {/* Primary Action: Open in Native Email (Gmail/Outlook) */}
            <div className="p-4 rounded-2xl bg-[#181824] border border-[#27273A] space-y-3">
              <span className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider block">
                Opciones de Envío Inmediato
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (inviteSuccessData.mailtoUrl) {
                      window.open(inviteSuccessData.mailtoUrl, '_blank');
                    }
                  }}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                >
                  <Mail className="w-4 h-4" />
                  <span>Abrir en Gmail / Mi Correo</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (inviteSuccessData.previewText) {
                      copyTextToClipboard(inviteSuccessData.previewText);
                    }
                  }}
                  className="px-4 py-2.5 rounded-xl bg-[#1C1C2A] border border-[#27273A] hover:border-[#D4AF37]/40 text-zinc-200 hover:text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  {copiedText ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-[#E5C158]" />}
                  <span>{copiedText ? 'Texto Copiado' : 'Copiar Texto del Correo'}</span>
                </button>
              </div>
            </div>

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

            <div className="pt-2 flex items-center justify-between border-t border-[#1F1F2E]">
              <button
                type="button"
                onClick={() => {
                  setInviteSuccessData(null);
                  setIsSmtpModalOpen(true);
                }}
                className="text-[11px] text-[#E5C158] hover:underline flex items-center gap-1.5 cursor-pointer"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Configurar SMTP para envíos automáticos</span>
              </button>

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

      {/* ================= MODAL: ELIMINAR MIEMBRO DEFINITIVAMENTE ================= */}
      {memberToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md p-6 sm:p-7 rounded-3xl bg-[#12121A] border border-red-500/40 shadow-2xl space-y-5 text-left">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  ¿Eliminar a {memberToDelete.name} del equipo?
                </h3>
                <p className="text-[11px] text-zinc-400">{memberToDelete.email} • {memberToDelete.role}</p>
              </div>
            </div>

            {/* Warning details */}
            <div className="p-3.5 rounded-2xl bg-[#181824] border border-[#27273A] space-y-2 text-xs text-zinc-300 leading-relaxed">
              <p className="font-semibold text-white flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                Acción permanente:
              </p>
              <ul className="list-disc list-inside space-y-1 text-zinc-400 text-[11px]">
                <li>El colaborador será removido completamente de la lista de miembros de Pixel 12.</li>
                <li>Se anulará cualquier token o invitación de acceso pendiente para este correo.</li>
                <li>
                  Las tareas asignadas serán <strong className="text-zinc-200">transferidas de forma segura</strong> para que no queden huérfanas ni se pierda información.
                </li>
              </ul>
            </div>

            {/* Task Reassignment selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">
                Reasignar tareas pendientes a:
              </label>
              <select
                value={reassignToMemberId}
                onChange={(e) => setReassignToMemberId(e.target.value)}
                className="w-full px-3 py-2.5 bg-[#181824] border border-[#27273A] rounded-xl text-xs text-white focus:outline-hidden focus:border-[#D4AF37]"
              >
                {members
                  .filter((m) => m.id !== memberToDelete.id)
                  .map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.role}) {m.id === currentMemberId ? '— Tú' : ''}
                    </option>
                  ))}
              </select>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setMemberToDelete(null)}
                className="px-4 py-2 rounded-xl bg-[#181824] text-zinc-300 hover:text-white text-xs font-semibold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeletingMember}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isDeletingMember ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Eliminando...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Eliminar Definitivamente</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: CONFIGURAR SERVIDOR DE CORREO (SMTP) ================= */}
      {isSmtpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg p-6 sm:p-7 rounded-3xl bg-[#12121A] border border-[#27273A] shadow-2xl space-y-5 text-left relative max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#1F1F2E]">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-[#1C1C2A] border border-[#D4AF37]/40 text-[#E5C158]">
                  <Settings className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Configuración de Envío de Correo</h3>
                  <p className="text-[11px] text-zinc-400">
                    Configura SMTP propio (Gmail, Brevo, Outlook, etc.) para envíos automáticos
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsSmtpModalOpen(false)}
                className="text-zinc-400 hover:text-white text-xs px-2 py-1 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSmtpSettings} className="space-y-4">
              <div className="p-3 rounded-2xl bg-[#181824] border border-[#27273A] text-xs text-zinc-300 space-y-1">
                <p className="font-semibold text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#E5C158]" />
                  ¿Cómo funciona?
                </p>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Si deseas que las invitaciones se envíen automáticamente desde tu propia cuenta (ej. Gmail con contraseña de aplicación, o tu servidor corporativo), ingresa tus credenciales SMTP a continuación. Si no lo configuras, el sistema te ofrece el botón directo de 1 clic para abrir tu correo nativo pre-llenado.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300">Servidor SMTP Host</label>
                  <input
                    type="text"
                    value={smtpHost}
                    onChange={(e) => setSmtpHost(e.target.value)}
                    placeholder="smtp.gmail.com o mail.pixel12.agency"
                    className="w-full px-3 py-2 bg-[#181824] border border-[#27273A] rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-hidden focus:border-[#D4AF37]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300">Puerto</label>
                  <input
                    type="number"
                    value={smtpPort}
                    onChange={(e) => setSmtpPort(e.target.value)}
                    placeholder="587 o 465"
                    className="w-full px-3 py-2 bg-[#181824] border border-[#27273A] rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-hidden focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">Usuario / Correo Remitente</label>
                <input
                  type="text"
                  value={smtpUser}
                  onChange={(e) => setSmtpUser(e.target.value)}
                  placeholder="ejemplo@gmail.com o info@pixel12.agency"
                  className="w-full px-3 py-2 bg-[#181824] border border-[#27273A] rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-hidden focus:border-[#D4AF37]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">Contraseña / Token de Aplicación</label>
                <input
                  type="password"
                  value={smtpPass}
                  onChange={(e) => setSmtpPass(e.target.value)}
                  placeholder="Contraseña de aplicación de Gmail o SMTP password"
                  className="w-full px-3 py-2 bg-[#181824] border border-[#27273A] rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-hidden focus:border-[#D4AF37]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">Nombre & Correo 'De' (From)</label>
                <input
                  type="text"
                  value={smtpFrom}
                  onChange={(e) => setSmtpFrom(e.target.value)}
                  placeholder="Pixel 12 Studio <contacto@pixel12.agency>"
                  className="w-full px-3 py-2 bg-[#181824] border border-[#27273A] rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-hidden focus:border-[#D4AF37]"
                />
              </div>

              <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={smtpSecure}
                  onChange={(e) => setSmtpSecure(e.target.checked)}
                  className="rounded border-[#27273A] text-[#D4AF37] focus:ring-[#D4AF37]"
                />
                <span>Usar SSL/TLS Seguro (Puerto 465)</span>
              </label>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#1F1F2E]">
                <button
                  type="button"
                  onClick={() => setIsSmtpModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#181824] text-zinc-300 hover:text-white text-xs font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingSmtp}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#E5C158] via-[#D4AF37] to-[#B89628] text-black font-bold text-xs shadow-md hover:brightness-110 active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSavingSmtp ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <span>Guardar Configuración</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: CONFIRMACIÓN DE SUSPENSIÓN TEMPORAL ================= */}
      {memberToDeactivate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md p-6 sm:p-7 rounded-3xl bg-[#12121A] border border-amber-500/40 shadow-2xl space-y-5 text-left">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <UserX className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  ¿Suspender acceso de {memberToDeactivate.name}?
                </h3>
                <p className="text-[11px] text-zinc-400">{memberToDeactivate.email}</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#181824] border border-[#27273A] space-y-2 text-xs text-zinc-300 leading-relaxed">
              <p className="font-semibold text-white flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                Efectos de la suspensión:
              </p>
              <ul className="list-disc list-inside space-y-1 text-zinc-400 text-[11px]">
                <li>El colaborador no podrá iniciar sesión en la plataforma.</li>
                <li>Sus tareas, propuestas y registros permanecerán intactos.</li>
                <li>Podrás reactivarlo en cualquier momento con un clic.</li>
              </ul>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setMemberToDeactivate(null)}
                className="px-4 py-2 rounded-xl bg-[#181824] text-zinc-300 hover:text-white text-xs font-semibold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDeactivation}
                disabled={isDeactivating}
                className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isDeactivating ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Suspendiendo...</span>
                  </>
                ) : (
                  <>
                    <UserX className="w-4 h-4" />
                    <span>Confirmar Suspensión</span>
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
                className="px-4 py-2 rounded-xl bg-[#181824] text-zinc-300 hover:text-white text-xs font-semibold cursor-pointer"
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
