import React, { useState } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import { useAuth } from '../context/AuthContext';
import { saveWorkspaceToFirestore } from '../lib/firebase';
import {
  Settings,
  Clock,
  Trash2,
  Database,
  Shield,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  Sliders,
  Cloud,
  RefreshCw,
  UserCheck,
  LogOut,
  Server
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { data, updateSettings, showToast } = useWorkspace();
  const { user, profile, role, logout } = useAuth();

  const [timezone, setTimezone] = useState(data.workspaceSettings.timezone || 'America/Guayaquil');
  const [agencyType, setAgencyType] = useState(data.workspaceSettings.agencyType || 'Agencia de Marketing Digital & Asistencia Virtual');
  const [autoDelete, setAutoDelete] = useState(data.workspaceSettings.autoDeleteRejectedPosts);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      timezone,
      agencyType,
      autoDeleteRejectedPosts: autoDelete,
    });
    showToast('Configuraciones del Workspace guardadas');
  };

  const handleManualSyncFirestore = async () => {
    setIsSyncing(true);
    try {
      const ok = await saveWorkspaceToFirestore(data);
      if (ok) {
        showToast('¡Datos sincronizados con éxito a Google Cloud Firestore!');
      } else {
        showToast('Error sincronizando con Firestore. Verifique la conexión.');
      }
    } catch (err) {
      showToast('Error durante la sincronización a Firestore');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleResetData = () => {
    if (
      confirm(
        '¿Deseas restablecer todos los datos del workspace a los valores predeterminados de Pixel 12?'
      )
    ) {
      localStorage.removeItem('pixel12_workspace_cache');
      window.location.reload();
    }
  };

  return (
    <div id="settings-view" className="p-4 sm:p-6 space-y-6 max-w-4xl mx-auto">
      {/* Title Header */}
      <div className="bg-[#101018] p-5 sm:p-6 rounded-3xl border border-[#222234] shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl p12-gold-gradient text-black flex items-center justify-center font-bold shadow-lg shadow-[#D4AF37]/20 shrink-0">
            <Settings className="w-5 h-5 text-black" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-white font-display">Configuración de Pixel 12 OS</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#D4AF37]/15 text-[#E5C158] border border-[#D4AF37]/30">
                PRO
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Gestión de sesión, base de datos Firebase Firestore, zona horaria y reglas operativas
            </p>
          </div>
        </div>

        {/* Current user badge & quick logout */}
        <div className="flex items-center gap-3 bg-[#161622] px-3.5 py-2 rounded-2xl border border-[#28283E]">
          <div className="flex flex-col text-right">
            <span className="text-xs font-bold text-white">{profile?.displayName || user?.displayName || user?.email}</span>
            <span className="text-[10px] font-mono font-bold text-[#E5C158]">ROL: {role}</span>
          </div>
          <button
            onClick={logout}
            className="p-1.5 text-zinc-400 hover:text-rose-400 hover:bg-[#201518] rounded-xl transition-colors cursor-pointer"
            title="Cerrar sesión"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="bg-[#101018] p-6 sm:p-7 rounded-3xl border border-[#222234] shadow-xl space-y-6">
        {/* Persistence & Cloud Database status */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider border-b border-[#1F1F30] pb-2 flex items-center gap-2">
            <Cloud className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Base de Datos Firestore & Despliegue Cloud</span>
          </h4>

          <div className="p-4 rounded-2xl bg-[#141422] border border-[#2A2A3E] text-xs space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white block">Google Cloud Firestore Activo</span>
                  <p className="text-zinc-300 leading-relaxed mt-0.5 text-[11px]">
                    Base de datos oficial de persistencia conectada. CRM, cotizaciones, tareas, marcas y publicaciones sincronizadas con la nube y protegidas con reglas de seguridad estrictas.
                  </p>
                </div>
              </div>

              <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold shrink-0">
                ONLINE
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-[#202030] text-[11px] text-zinc-400 font-mono">
              <div className="flex items-center gap-2">
                <Server className="w-3.5 h-3.5 text-zinc-500" />
                <span>Proyecto: <strong className="text-zinc-200">gen-lang-client-0652715108</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Database className="w-3.5 h-3.5 text-zinc-500" />
                <span>Base de Datos: <strong className="text-zinc-200">ai-studio-pixel12os</strong></span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={handleManualSyncFirestore}
                disabled={isSyncing}
                className="px-3.5 py-1.5 rounded-xl bg-[#1C1C2C] hover:bg-[#25253A] text-zinc-200 text-xs font-semibold flex items-center gap-2 border border-[#303046] transition-colors cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-[#D4AF37] ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Sincronizando...' : 'Migrar / Guardar en Firestore ahora'}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider border-b border-[#1F1F30] pb-2 flex items-center gap-2">
            <Sliders className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>General & Horario de Operación</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                Tipo o Giro de Agencia
              </label>
              <input
                type="text"
                value={agencyType}
                onChange={(e) => setAgencyType(e.target.value)}
                className="w-full text-xs p-3 rounded-xl bg-[#141420] border border-[#27273C] text-white focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                Zona Horaria del Sistema
              </label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full text-xs p-3 rounded-xl bg-[#141420] border border-[#27273C] text-white focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
              >
                <option value="America/Guayaquil">America/Guayaquil (Ecuador / GMT-5)</option>
                <option value="America/Bogota">America/Bogota (Colombia / GMT-5)</option>
                <option value="America/Lima">America/Lima (Perú / GMT-5)</option>
                <option value="America/Mexico_City">America/Mexico_City (México / GMT-6)</option>
                <option value="America/Santiago">America/Santiago (Chile / GMT-3)</option>
                <option value="America/Argentina/Buenos_Aires">America/Buenos_Aires (Argentina / GMT-3)</option>
                <option value="Europe/Madrid">Europe/Madrid (España / GMT+2)</option>
                <option value="America/New_York">America/New_York (Miami / GMT-4)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Editorial Rules */}
        <div className="space-y-4 pt-2">
          <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider border-b border-[#1F1F30] pb-2 flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Reglas de Aprobación Editorial</span>
          </h4>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-[#141420] border border-[#27273C]">
            <div>
              <span className="text-xs font-bold text-white block">
                Eliminar automáticamente publicaciones rechazadas
              </span>
              <p className="text-[11px] text-zinc-400 max-w-lg mt-0.5 leading-relaxed">
                Al activar esta regla, cuando un director o cliente rechace una publicación en el módulo de
                aprobaciones, se removerá inmediatamente del calendario y la base de datos sin quedar archivada.
              </p>
            </div>

            <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-4">
              <input
                type="checkbox"
                checked={autoDelete}
                onChange={(e) => setAutoDelete(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-[#26263A] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D4AF37]" />
            </label>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-[#1F1F30]">
          <button
            type="button"
            onClick={handleResetData}
            className="text-xs text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restablecer datos predeterminados</span>
          </button>

          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl p12-gold-gradient text-black font-black text-xs sm:text-sm hover:brightness-105 transition-all shadow-md shadow-[#D4AF37]/20 cursor-pointer active:scale-98"
          >
            Guardar Cambios
          </button>
        </div>
      </form>
    </div>
  );
};
