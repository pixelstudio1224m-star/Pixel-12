import React from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';

export const Footer: React.FC = () => {
  const { data } = useWorkspace();

  return (
    <footer
      id="main-footer"
      className="h-10 bg-[#09090B] border-t border-[#222232] px-6 flex items-center justify-between text-[10px] text-zinc-400 font-medium shrink-0 select-none"
    >
      <div className="flex items-center gap-4">
        <span className="font-bold text-[#E5C158] flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
          © 2026 PIXEL 12 OS
        </span>
        <span className="hidden sm:inline text-zinc-400">
          Infraestructura:{' '}
          <span className="text-emerald-400 font-semibold uppercase">Operativa</span>
        </span>
        <span className="hidden md:inline text-zinc-400">
          Motor IA:{' '}
          <span className="text-[#D4AF37] font-semibold uppercase">Gemini 2.5 Active</span>
        </span>
      </div>
      <div className="flex items-center gap-4">
        <span>TZ: {data.workspaceSettings.timezone || 'America/Guayaquil'}</span>
        <span className="font-mono text-zinc-400">v1.4.2 · Luxury Edition</span>
      </div>
    </footer>
  );
};
