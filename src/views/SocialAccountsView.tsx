import React, { useState } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import { SocialAccount, Platform } from '../types';
import {
  Share2,
  Instagram,
  Facebook,
  Linkedin,
  Youtube,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Key,
  ExternalLink,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';

export const SocialAccountsView: React.FC = () => {
  const { data, activeBrand, updateSocialAccount, showToast } = useWorkspace();

  const [selectedAccount, setSelectedAccount] = useState<SocialAccount | null>(null);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [appIdInput, setAppIdInput] = useState('');

  const platformIcons: Record<Platform, any> = {
    instagram: Instagram,
    facebook: Facebook,
    linkedin: Linkedin,
    youtube: Youtube,
    tiktok: Sparkles,
  };

  const handleOpenConfig = (account: SocialAccount) => {
    setSelectedAccount(account);
    setApiKeyInput(account.credentials?.accessToken || '');
    setAppIdInput(account.credentials?.appId || '');
  };

  const handleSaveConnection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccount) return;

    const isNowConnected = apiKeyInput.trim().length > 0;
    const updated: SocialAccount = {
      ...selectedAccount,
      isConnected: isNowConnected,
      credentials: {
        accessToken: apiKeyInput.trim() || undefined,
        appId: appIdInput.trim() || undefined,
      },
    };

    updateSocialAccount(updated);
    setSelectedAccount(null);
    showToast(
      isNowConnected
        ? `¡Cuenta de ${updated.platformName} conectada con éxito!`
        : `Cuenta de ${updated.platformName} actualizada`
    );
  };

  return (
    <div id="social-accounts-view" className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-[#101018] p-5 sm:p-6 rounded-3xl border border-[#222234] shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl p12-gold-gradient text-black flex items-center justify-center font-bold shadow-lg shadow-[#D4AF37]/20 shrink-0">
            <Share2 className="w-5 h-5 text-black" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-white font-display">Integración con Redes Sociales</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#D4AF37]/15 text-[#E5C158] border border-[#D4AF37]/30">
                PRO
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Conexión directa con APIs oficiales para publicación y sincronización en los canales de {activeBrand?.name || 'la Marca'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-[#E5C158] bg-[#161622] px-3.5 py-2 rounded-xl border border-[#2A2A3E]">
          <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
          <span>Arquitectura OAuth & Webhooks lista</span>
        </div>
      </div>

      {/* Official Policy Banner */}
      <div className="p-4.5 rounded-2xl bg-[#12121C] border border-[#26263A] text-white flex items-start gap-3.5 text-xs leading-relaxed">
        <AlertCircle className="w-5 h-5 text-[#E5C158] shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-white mb-0.5">Transparencia y Seguridad de APIs Oficiales:</h4>
          <p className="text-zinc-300">
            Pixel 12 OS no simula publicaciones falsas. Los canales a continuación se encuentran marcados como{' '}
            <span className="text-[#E5C158] font-bold">pendientes de integración</span> hasta que se configuren los identificadores y tokens de acceso oficiales (Meta Graph API para Instagram/Facebook, LinkedIn Developer Portal, TikTok for Developers o YouTube Data API v3). Al ingresar tus credenciales oficiales de desarrollador, el sistema despacha las publicaciones en la hora exacta con la zona horaria del workspace.
          </p>
        </div>
      </div>

      {/* Accounts List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(data?.socialAccounts || []).map((acc) => {
          const Icon = platformIcons[acc.platform] || Share2;
          const isReallyConnected = acc.isConnected && !!acc.credentials?.accessToken;
          return (
            <div
              key={acc.id}
              className="p-5 rounded-3xl bg-[#101018] border border-[#202030] shadow-lg space-y-4 hover:border-[#303046] transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-[#161624] border border-[#28283C] flex items-center justify-center">
                      <Icon className="w-5 h-5 text-[#E5C158]" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{acc.platformName}</h4>
                      <p className="text-xs text-zinc-400">{acc.accountHandle}</p>
                    </div>
                  </div>

                  <span
                    className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                      isReallyConnected
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                    }`}
                  >
                    {isReallyConnected ? 'CONECTADA (API)' : 'PENDIENTE DE INTEGRACIÓN'}
                  </span>
                </div>

                <div className="text-xs text-zinc-400 space-y-1.5 pt-2.5 border-t border-[#1C1C2A]">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-zinc-500">Páginas / Perfiles:</span>
                    <strong className="text-zinc-300">{acc.accountHandle}</strong>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-zinc-500">Alcance de Permisos:</span>
                    <span className="text-zinc-400 font-mono text-[10px]">publish_to_feed, pages_read</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-zinc-500">Estado de la Conexión:</span>
                    <span className={isReallyConnected ? 'text-emerald-400' : 'text-amber-400'}>
                      {isReallyConnected ? 'Token activo' : 'Pendiente de credenciales'}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleOpenConfig(acc)}
                className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
                  isReallyConnected
                    ? 'bg-[#161622] hover:bg-[#1E1E2E] text-zinc-200 border-[#2A2A3E]'
                    : 'p12-gold-gradient text-black font-black hover:brightness-105 border-transparent shadow-md shadow-[#D4AF37]/15'
                }`}
              >
                <Key className="w-3.5 h-3.5" />
                <span>{isReallyConnected ? 'Gestionar credenciales API' : 'Configurar API Oficial'}</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Configuration Modal */}
      {selectedAccount && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveConnection}
            className="bg-[#101018] rounded-3xl shadow-2xl border border-[#28283E] w-full max-w-lg p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150 text-white"
          >
            <div className="flex items-center justify-between border-b border-[#202030] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#181826] border border-[#2C2C3E] flex items-center justify-center text-[#E5C158] text-xs font-bold">
                  API
                </div>
                <h4 className="text-sm font-bold text-white">
                  Conectar {selectedAccount.platformName} ({selectedAccount.accountHandle})
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAccount(null)}
                className="text-xs text-zinc-400 hover:text-white"
              >
                Cerrar
              </button>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              Ingresa los identificadores de la API oficial de desarrollador ({selectedAccount.platformName}) para permitir la publicación directa desde el calendario editorial sin simulaciones.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">
                  App ID / Client ID de Desarrollador
                </label>
                <input
                  type="text"
                  value={appIdInput}
                  onChange={(e) => setAppIdInput(e.target.value)}
                  placeholder="Ej: 19482938472918"
                  className="w-full text-xs p-2.5 rounded-xl bg-[#141420] border border-[#27273C] text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">
                  Access Token (Token de larga duración / Bearer Token)
                </label>
                <input
                  type="password"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="EAAG... o bearer_token..."
                  className="w-full text-xs p-2.5 rounded-xl bg-[#141420] border border-[#27273C] text-white focus:outline-none focus:border-[#D4AF37] font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#202030]">
              {selectedAccount.isConnected && (
                <button
                  type="button"
                  onClick={() => {
                    setApiKeyInput('');
                    setAppIdInput('');
                  }}
                  className="text-xs text-rose-400 font-semibold hover:underline"
                >
                  Desvincular cuenta
                </button>
              )}

              <div className="flex gap-2 ml-auto">
                <button
                  type="button"
                  onClick={() => setSelectedAccount(null)}
                  className="px-3 py-2 text-xs text-zinc-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl p12-gold-gradient text-black text-xs font-black hover:brightness-105"
                >
                  Guardar Credenciales
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
