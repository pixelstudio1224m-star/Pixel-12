import React, { useState } from 'react';
import {
  Lock,
  Mail,
  User,
  ShieldCheck,
  Building2,
  Sparkles,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Briefcase,
  Layers,
  KeyRound
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../lib/firebase';

export const AuthView: React.FC = () => {
  const { login, register, quickLoginMasterAdmin } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('pixelstudio1224m@gmail.com');
  const [password, setPassword] = useState('Pixel12OS*2026');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState<UserRole>('ADMIN');
  const [companyName, setCompanyName] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleQuickMasterAdmin = async () => {
    setErrorMessage(null);
    setIsLoading(true);
    try {
      await quickLoginMasterAdmin();
    } catch (err: any) {
      setErrorMessage('No se pudo ingresar automáticamente: ' + (err?.message || ''));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      if (isRegister) {
        if (!displayName.trim()) {
          throw new Error('Por favor ingresa tu nombre completo');
        }
        if (password.length < 6) {
          throw new Error('La contraseña debe tener al menos 6 caracteres');
        }
        await register(email, password, displayName, role, companyName);
      } else {
        await login(email, password);
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      let msg = err?.message || 'Error de autenticación';
      if (msg.includes('user-not-found') || msg.includes('wrong-password') || msg.includes('invalid-credential')) {
        msg = 'Credenciales no coinciden. Haz clic en "Crear Cuenta" para registrarte o usa el acceso directo.';
      } else if (msg.includes('email-already-in-use')) {
        msg = 'Este correo ya está registrado. Inicia sesión con tu contraseña.';
      } else if (msg.includes('weak-password')) {
        msg = 'La contraseña es demasiado débil. Usa al menos 6 caracteres.';
      } else if (msg.includes('invalid-email')) {
        msg = 'Por favor ingresa un correo electrónico válido.';
      }
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#09090B] text-zinc-100 flex flex-col justify-center items-center p-4 relative overflow-hidden selection:bg-[#D4AF37]/30 selection:text-white">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-b from-[#D4AF37]/10 via-[#181824]/40 to-transparent blur-3xl pointer-events-none rounded-full" />

      {/* Main Container */}
      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-b from-[#1C1C2A] to-[#12121A] border border-[#D4AF37]/40 shadow-xl shadow-[#D4AF37]/10 mb-2">
            <ShieldCheck className="w-8 h-8 text-[#E5C158]" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center justify-center gap-2">
            Pixel 12 <span className="text-[#E5C158]">OS</span>
          </h1>
          <p className="text-xs text-zinc-400 max-w-xs mx-auto">
            Plataforma Operativa Integral de Inteligencia Comercial, CRM y Marketing con IA
          </p>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#12121A] border border-[#262638] text-[10px] text-zinc-400 font-mono">
            <Lock className="w-3 h-3 text-[#E5C158]" />
            <span>Acceso Seguro con Firebase Auth</span>
          </div>
        </div>

        {/* Card Form */}
        <div className="bg-[#101018] border border-[#222232] rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative">
          {/* Quick Access Button for Agency Admin */}
          <div className="mb-6">
            <button
              id="auth-quick-admin-btn"
              type="button"
              onClick={handleQuickMasterAdmin}
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-[#181824] hover:bg-[#202030] active:scale-98 border border-[#D4AF37]/50 text-white font-semibold text-xs tracking-wide flex items-center justify-between transition-all group shadow-md shadow-[#D4AF37]/5"
            >
              <div className="flex items-center gap-2.5 text-left">
                <div className="p-1.5 rounded-lg bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#E5C158]">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-white text-xs font-medium flex items-center gap-1.5">
                    <span>Acceso Inmediato Propietario</span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] bg-[#D4AF37]/20 text-[#E5C158] border border-[#D4AF37]/40 font-mono font-bold">ADMIN</span>
                  </div>
                  <div className="text-[10px] text-zinc-400 font-mono">pixelstudio1224m@gmail.com</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#E5C158] group-hover:translate-x-0.5 transition-transform" />
            </button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#1F1F2C]" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-mono">
                <span className="bg-[#101018] px-2.5 text-zinc-500">O usa tu cuenta personalizada</span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-[#0B0B10] border border-[#1A1A26] rounded-xl mb-6 text-xs font-semibold">
            <button
              id="auth-tab-login"
              type="button"
              onClick={() => {
                setIsRegister(false);
                setErrorMessage(null);
              }}
              className={`py-2 rounded-lg transition-all ${
                !isRegister
                  ? 'bg-[#181826] text-[#E5C158] border border-[#D4AF37]/30 shadow'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              id="auth-tab-register"
              type="button"
              onClick={() => {
                setIsRegister(true);
                setErrorMessage(null);
              }}
              className={`py-2 rounded-lg transition-all ${
                isRegister
                  ? 'bg-[#181826] text-[#E5C158] border border-[#D4AF37]/30 shadow'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Crear Cuenta
            </button>
          </div>

          {errorMessage && (
            <div className="mb-5 p-3 rounded-xl bg-red-950/40 border border-red-800/40 text-red-200 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-zinc-400" />
                    Nombre Completo
                  </label>
                  <input
                    id="auth-input-name"
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Ej. Camila Pinto"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#09090E] border border-[#222232] focus:border-[#D4AF37] focus:outline-none text-xs text-white placeholder:text-zinc-600 transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-zinc-400" />
                    Rol en la Plataforma
                  </label>
                  <select
                    id="auth-select-role"
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#09090E] border border-[#222232] focus:border-[#D4AF37] focus:outline-none text-xs text-white transition-colors"
                  >
                    <option value="ADMIN">Administrador (Acceso total & Finanzas)</option>
                    <option value="TEAM">Equipo Agencia (CRM, Contenido & Cotizaciones)</option>
                    <option value="CLIENT">Cliente / Marca (Portal de Aprobaciones)</option>
                  </select>
                </div>

                {role === 'CLIENT' && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-zinc-400" />
                      Nombre de la Empresa o Marca
                    </label>
                    <input
                      id="auth-input-company"
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Ej. EcoHome Soluciones"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#09090E] border border-[#222232] focus:border-[#D4AF37] focus:outline-none text-xs text-white placeholder:text-zinc-600 transition-colors"
                    />
                  </div>
                )}
              </>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-zinc-400" />
                Correo Electrónico
              </label>
              <input
                id="auth-input-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@pixel12.agency"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#09090E] border border-[#222232] focus:border-[#D4AF37] focus:outline-none text-xs text-white placeholder:text-zinc-600 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-zinc-400" />
                Contraseña
              </label>
              <input
                id="auth-input-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#09090E] border border-[#222232] focus:border-[#D4AF37] focus:outline-none text-xs text-white placeholder:text-zinc-600 transition-colors"
              />
            </div>

            <button
              id="auth-submit-btn"
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#E5C158] hover:brightness-110 active:scale-98 text-black font-bold text-xs tracking-wide shadow-lg shadow-[#D4AF37]/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>{isRegister ? 'Crear Cuenta y Acceder' : 'Ingresar a Pixel 12 OS'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Sandbox Tip */}
          <div className="mt-6 pt-5 border-t border-[#1C1C28] text-center">
            <p className="text-[11px] text-zinc-500">
              ¿Primera vez? Puedes registrar tu cuenta corporativa arriba o usar tu correo habitual. La base de datos persistirá tus accesos de forma segura en Firestore.
            </p>
          </div>
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between text-[11px] text-zinc-500 px-2 font-mono">
          <span>PIXEL 12 ARCHITECTURE</span>
          <span>ENTERPRISE READY</span>
        </div>
      </div>
    </div>
  );
};
