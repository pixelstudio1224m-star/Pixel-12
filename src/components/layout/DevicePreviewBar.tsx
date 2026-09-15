import React, { useState } from 'react';
import { useWorkspace, DeviceMode } from '../../context/WorkspaceContext';
import {
  Monitor,
  Tablet,
  Smartphone,
  RotateCw,
  ChevronUp,
  ChevronDown,
  Info,
  Maximize2
} from 'lucide-react';

export const DevicePreviewBar: React.FC = () => {
  const {
    deviceMode,
    setDeviceMode,
    deviceOrientation,
    toggleDeviceOrientation
  } = useWorkspace();

  const [isCollapsed, setIsCollapsed] = useState(false);

  // Helper description of active resolution
  const getResolutionInfo = () => {
    if (deviceMode === 'mobile') {
      return deviceOrientation === 'portrait' ? '390 × 844 px (iPhone)' : '844 × 390 px (iPhone Apaisado)';
    }
    if (deviceMode === 'tablet') {
      return deviceOrientation === 'portrait' ? '768 × 1024 px (iPad)' : '1024 × 768 px (iPad Apaisado)';
    }
    return '100% Pantalla Fluida (Nativa)';
  };

  return (
    <div
      id="device-preview-bar-container"
      className="bg-[#09090B] text-zinc-200 border-b border-[#222232] text-xs select-none z-30 shrink-0 transition-all duration-200"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-1.5 flex items-center justify-between gap-2">
        {/* Left: Device Selector Buttons */}
        <div className="flex items-center gap-1 sm:gap-2">
          <span className="hidden sm:inline text-[11px] font-bold text-zinc-400 uppercase tracking-wider mr-1">
            Vista Previa:
          </span>

          {/* Desktop / Responsive */}
          <button
            id="preview-btn-desktop"
            onClick={() => setDeviceMode('responsive')}
            title="Vista de escritorio completa"
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
              deviceMode === 'responsive' || deviceMode === 'desktop'
                ? 'p12-gold-gradient text-black shadow-xs'
                : 'text-zinc-400 hover:text-white hover:bg-[#14141E]'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Escritorio</span>
          </button>

          {/* Tablet (iPad) */}
          <button
            id="preview-btn-tablet"
            onClick={() => setDeviceMode('tablet')}
            title="Vista previa Tablet (iPad 768x1024)"
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
              deviceMode === 'tablet'
                ? 'p12-gold-gradient text-black shadow-xs'
                : 'text-zinc-400 hover:text-white hover:bg-[#14141E]'
            }`}
          >
            <Tablet className="w-3.5 h-3.5" />
            <span>Tablet</span>
          </button>

          {/* Mobile (iPhone) */}
          <button
            id="preview-btn-mobile"
            onClick={() => setDeviceMode('mobile')}
            title="Vista previa Móvil (iPhone 390x844)"
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
              deviceMode === 'mobile'
                ? 'p12-gold-gradient text-black shadow-xs'
                : 'text-zinc-400 hover:text-white hover:bg-[#14141E]'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Móvil</span>
          </button>

          {/* Orientation Toggle Button (Only active when in mobile or tablet mode) */}
          {deviceMode !== 'responsive' && (
            <button
              id="preview-btn-rotate"
              onClick={toggleDeviceOrientation}
              title={`Rotar pantalla a ${deviceOrientation === 'portrait' ? 'Horizontal (Landscape)' : 'Vertical (Portrait)'}`}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#161622] hover:bg-[#1F1F2E] text-zinc-200 text-xs font-semibold border border-[#2B2B3E] transition-colors ml-1 cursor-pointer active:scale-95"
            >
              <RotateCw className={`w-3.5 h-3.5 text-[#D4AF37] transition-transform duration-300 ${deviceOrientation === 'landscape' ? 'rotate-90' : ''}`} />
              <span className="text-[10px] text-zinc-300">{deviceOrientation === 'portrait' ? 'Vertical' : 'Horizontal'}</span>
            </button>
          )}
        </div>

        {/* Right: Resolution Info & Help Tip */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-1.5 text-[11px] text-slate-400 font-mono bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/60">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>{getResolutionInfo()}</span>
          </div>

          {deviceMode !== 'responsive' && (
            <button
              onClick={() => setDeviceMode('responsive')}
              className="text-[11px] text-orange-400 hover:underline font-medium cursor-pointer"
            >
              Restablecer
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
