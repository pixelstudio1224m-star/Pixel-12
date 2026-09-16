import React, { useState, useRef } from 'react';
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
  Server,
  Upload,
  Image as ImageIcon,
  Check,
  ExternalLink,
  Layers,
  Palette
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { data, updateSettings, showToast } = useWorkspace();
  const { user, profile, role, logout } = useAuth();

  const [timezone, setTimezone] = useState(data.workspaceSettings.timezone || 'America/Guayaquil');
  const [agencyType, setAgencyType] = useState(data.workspaceSettings.agencyType || 'Agencia de Marketing Digital & Asistencia Virtual');
  const [autoDelete, setAutoDelete] = useState(data.workspaceSettings.autoDeleteRejectedPosts);
  const [isSyncing, setIsSyncing] = useState(false);

  // Brand Identity / Logo State
  const currentLogo = data.workspaceSettings.brandIdentity?.officialLogoUrl || '';
  const [logoPreview, setLogoPreview] = useState<string>(currentLogo);
  const [logoUrlInput, setLogoUrlInput] = useState<string>(currentLogo);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Por favor selecciona un archivo de imagen válido (PNG, SVG, JPG, WebP)', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('La imagen excede el límite de 5MB', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setLogoPreview(result);
      setLogoUrlInput(result);
      showToast('Logo cargado. Recuerda hacer clic en "Guardar Identidad y Ajustes".', 'info');
    };
    reader.readAsDataURL(file);
  };

  const handleApplyLogoUrl = () => {
    if (!logoUrlInput.trim()) {
      showToast('Ingresa una URL válida', 'error');
      return;
    }
    setLogoPreview(logoUrlInput.trim());
    showToast('Vista previa de URL actualizada', 'info');
  };

  const handleResetLogoToDefault = () => {
    setLogoPreview('');
    setLogoUrlInput('');
    showToast('Se restablecerá el emblema nativo de Pixel 12 al guardar', 'info');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSettings({
      timezone,
      agencyType,
      autoDeleteRejectedPosts: autoDelete,
      brandIdentity: {
        ...data.workspaceSettings.brandIdentity,
        officialLogoUrl: logoPreview.trim() || undefined,
        updatedAt: new Date().toISOString(),
        updatedBy: profile?.displayName || user?.displayName || 'Admin',
      },
    });
    showToast('Configuraciones e identidad visual de Pixel 12 guardadas con éxito', 'success');
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
              Gestión de sesión, base de datos Firestore, logo oficial, zona horaria y reglas operativas
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
        
        {/* ========================================================= */}
        {/* LOGO E IDENTIDAD VISUAL DE PIXEL 12 OS                     */}
        {/* ========================================================= */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-[#1F1F30] pb-2">
            <h4 className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
              <Palette className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Logo Oficial e Identidad de Pixel 12 OS</span>
            </h4>
            <span className="text-[10px] text-[#E5C158] font-mono font-semibold">
              Estética Obsidian · Oro · Plata
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center p-4 rounded-2xl bg-[#141422] border border-[#26263A]">
            {/* Visual Preview Box */}
            <div className="md:col-span-4 flex flex-col items-center justify-center p-4 rounded-2xl bg-[#09090E] border border-[#252538] text-center space-y-2">
              <span className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider">
                Previsualización en Barra Lateral
              </span>
              
              <div className="w-full py-4 px-3 rounded-xl bg-[#0D0D14] border border-[#1F1F30] flex items-center justify-center min-h-[80px]">
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt="Logo Pixel 12 OS"
                    className="max-h-12 max-w-full object-contain filter drop-shadow-[0_2px_8px_rgba(212,175,55,0.2)]"
                    onError={() => {
                      showToast('Error al cargar la imagen del logo. Verifique la URL.', 'error');
                      setLogoPreview('');
                    }}
                  />
                ) : (
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl p12-gold-gradient flex items-center justify-center font-black text-black text-xs shadow-md shadow-[#D4AF37]/20 shrink-0">
                      P12
                    </div>
                    <div className="text-left">
                      <span className="font-extrabold text-sm tracking-tight p12-silver-text leading-none block font-display">
                        PIXEL 12 OS
                      </span>
                      <span className="text-[9px] text-zinc-400 font-mono block mt-0.5">
                        Emblema Nativo
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <span className="text-[10px] text-zinc-400">
                {logoPreview ? 'Logo personalizado activo' : 'Usando emblema nativo dorado'}
              </span>
            </div>

            {/* Controls & Upload Actions */}
            <div className="md:col-span-8 space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-white block">
                  Subir o vincular logo oficial
                </label>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Carga el archivo del logo oficial de Pixel 12 OS (PNG transparente, SVG, WebP o JPG). Se sincronizará inmediatamente en la barra lateral, reportes y cotizaciones.
                </p>
              </div>

              {/* Upload Options */}
              <div className="flex flex-wrap gap-2 pt-1">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/png,image/svg+xml,image/webp,image/jpeg"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 rounded-xl bg-[#202032] hover:bg-[#282840] border border-[#34344E] text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs"
                >
                  <Upload className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Subir Archivo de Imagen</span>
                </button>

                {logoPreview && (
                  <button
                    type="button"
                    onClick={handleResetLogoToDefault}
                    className="px-3 py-2 rounded-xl bg-transparent hover:bg-[#1E1E2C] border border-[#2D2D40] text-zinc-300 hover:text-white text-xs font-medium transition-colors cursor-pointer"
                  >
                    Restablecer Emblema P12
                  </button>
                )}
              </div>

              {/* URL Input Fallback */}
              <div className="pt-2">
                <label className="text-[11px] text-zinc-400 block mb-1">
                  O pegar URL directa de la imagen (HTTPS):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={logoUrlInput}
                    onChange={(e) => setLogoUrlInput(e.target.value)}
                    placeholder="https://tudominio.com/logo-pixel12.png"
                    className="flex-1 text-xs p-2.5 rounded-xl bg-[#101018] border border-[#28283E] text-white outline-none focus:border-[#D4AF37]"
                  />
                  <button
                    type="button"
                    onClick={handleApplyLogoUrl}
                    className="px-3 py-2.5 rounded-xl bg-[#1C1C2C] hover:bg-[#242438] border border-[#32324A] text-xs font-semibold text-zinc-200 cursor-pointer"
                  >
                    Aplicar URL
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Persistence & Cloud Database status */}
        <div className="space-y-3 pt-2">
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

        {/* General & Working Hours */}
        <div className="space-y-4 pt-2">
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

          <div className="flex items-center justify-between p-4 rounded-2xl bg-[#141422] border border-[#27273C]">
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
            Guardar Identidad y Ajustes
          </button>
        </div>
      </form>
    </div>
  );
};
