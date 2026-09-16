import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Lock,
  Mail,
  User,
  ArrowRight,
  Sparkles,
  KeyRound,
  Eye,
  EyeOff
} from 'lucide-react';
import { verifyInvitationTokenApi } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

interface AcceptInvitationViewProps {
  token: string;
  onClose?: () => void;
}

export const AcceptInvitationView: React.FC<AcceptInvitationViewProps> = ({ token, onClose }) => {
  const { acceptInvitation } = useAuth();

  const [loadingVerify, setLoadingVerify] = useState(true);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [invitationData, setInvitationData] = useState<{
    email: string;
    name: string;
    role: string;
    expiresAt: string;
    invitedBy?: { name: string; email: string };
  } | null>(null);

  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function verify() {
      setLoadingVerify(true);
      setVerifyError(null);
      try {
        const res = await verifyInvitationTokenApi(token);
        if (!isMounted) return;
        if (res.valid && res.invitation) {
          setInvitationData(res.invitation);
          setDisplayName(res.invitation.name || '');
        } else {
          setVerifyError(res.message || 'El enlace de invitación no es válido o ya fue utilizado.');
        }
      } catch (err: any) {
        if (!isMounted) return;
        setVerifyError(err?.message || 'Error al verificar la invitación');
      } finally {
        if (isMounted) setLoadingVerify(false);
      }
    }
    verify();
    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!displayName.trim()) {
      setFormError('Por favor ingresa tu nombre completo');
      return;
    }
    if (password.length < 6) {
      setFormError('La contraseña debe tener un mínimo de 6 caracteres');
      return;
    }
    if (password !== confirmPassword) {
      setFormError('Las contraseñas no coinciden');
      return;
    }

    setSubmitting(true);
    try {
      await acceptInvitation(token, password, displayName.trim());
      setSuccess(true);
      // Clean query param from URL without reload
      if (window.history?.replaceState) {
        const url = new URL(window.location.href);
        url.searchParams.delete('invite_token');
        window.history.replaceState({}, '', url.pathname + (url.search ? url.search : ''));
      }
      if (onClose) {
        setTimeout(onClose, 1000);
      }
    } catch (err: any) {
      setFormError(err?.message || 'Error al aceptar la invitación');
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#09090B] text-zinc-100 flex flex-col justify-center items-center p-4 relative overflow-hidden selection:bg-[#D4AF37]/30 selection:text-white">
      {/* Ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-b from-[#D4AF37]/15 via-[#181824]/40 to-transparent blur-3xl pointer-events-none rounded-full" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3.5 rounded-2xl bg-gradient-to-b from-[#1C1C2A] to-[#12121A] border border-[#D4AF37]/40 shadow-xl shadow-[#D4AF37]/10 mb-2">
            <ShieldCheck className="w-9 h-9 text-[#E5C158]" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center justify-center gap-2">
            Pixel 12 <span className="text-[#E5C158]">OS</span>
          </h1>
          <p className="text-xs text-zinc-400 max-w-xs mx-auto">
            Configuración de Acceso Oficial para Miembro del Equipo
          </p>
        </div>

        {/* Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#12121A]/95 backdrop-blur-xl border border-[#27273A] shadow-2xl space-y-5">
          {loadingVerify ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-10 h-10 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-zinc-400">Verificando autenticidad de la invitación...</p>
            </div>
          ) : verifyError ? (
            <div className="space-y-4 py-4 text-center">
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto text-red-400">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-white">Invitación No Válida</h3>
                <p className="text-xs text-zinc-400 leading-relaxed max-w-xs mx-auto">
                  {verifyError}
                </p>
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    // Remove param and reload to login
                    const url = new URL(window.location.href);
                    url.searchParams.delete('invite_token');
                    window.location.href = url.pathname;
                  }}
                  className="px-5 py-2.5 rounded-xl bg-[#1C1C2A] border border-[#27273A] hover:border-[#D4AF37]/40 text-xs font-semibold text-zinc-200 transition-colors"
                >
                  Ir al Inicio de Sesión
                </button>
              </div>
            </div>
          ) : success ? (
            <div className="space-y-4 py-6 text-center">
              <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/15 border border-[#D4AF37]/40 flex items-center justify-center mx-auto text-[#E5C158]">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-white">¡Bienvenido al Equipo!</h3>
                <p className="text-xs text-zinc-400">
                  Tu acceso ha sido configurado exitosamente. Ingresando a la plataforma...
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Invitation Summary Banner */}
              <div className="p-3.5 rounded-2xl bg-[#181824] border border-[#27273A] space-y-1 text-left">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#E5C158]">
                    Invitación de Equipo
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#E5C158] font-semibold">
                    {invitationData?.role}
                  </span>
                </div>
                <p className="text-xs text-zinc-300 font-medium">
                  {invitationData?.email}
                </p>
                {invitationData?.invitedBy?.name && (
                  <p className="text-[11px] text-zinc-500">
                    Invitado por: <span className="text-zinc-400">{invitationData.invitedBy.name}</span>
                  </p>
                )}
              </div>

              {formError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Display Name */}
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-semibold text-zinc-300">
                  Tu Nombre Completo
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Ej. Juan Pérez"
                    className="w-full pl-10 pr-3 py-2.5 bg-[#181824] border border-[#27273A] rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-hidden focus:border-[#D4AF37] transition-colors"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-semibold text-zinc-300">
                  Crea tu Contraseña
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full pl-10 pr-10 py-2.5 bg-[#181824] border border-[#27273A] rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-hidden focus:border-[#D4AF37] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-semibold text-zinc-300">
                  Confirmar Contraseña
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repite tu contraseña"
                    className="w-full pl-10 pr-3 py-2.5 bg-[#181824] border border-[#27273A] rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-hidden focus:border-[#D4AF37] transition-colors"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#E5C158] via-[#D4AF37] to-[#B89628] text-black font-bold text-xs tracking-wide shadow-lg shadow-[#D4AF37]/20 hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>Activando Cuenta...</span>
                  </>
                ) : (
                  <>
                    <span>Activar Acceso & Unirme al Equipo</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-2 text-center">
                <p className="text-[11px] text-zinc-500">
                  Pixel 12 Studio — Plataforma Privada de Operaciones
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
