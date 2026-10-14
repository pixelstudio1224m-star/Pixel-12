import React, { useState } from 'react';
import { Tag as TagIcon, Plus, X, Check, Building2, Flame, Sparkles } from 'lucide-react';

export interface PresetTag {
  name: string;
  category: 'department' | 'priority' | 'status';
  description?: string;
}

export const PRESET_TAG_CATEGORIES: {
  id: 'department' | 'priority' | 'status';
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  tags: PresetTag[];
}[] = [
  {
    id: 'department',
    label: 'Departamentos',
    icon: Building2,
    tags: [
      { name: 'Diseño', category: 'department', description: 'Arte, piezas gráficas y carruseles' },
      { name: 'Estrategia', category: 'department', description: 'Planificación, branding y análisis' },
      { name: 'Copywriting', category: 'department', description: 'Textos persuasivos y guiones' },
      { name: 'Desarrollo', category: 'department', description: 'Tech, web y automatizaciones' },
      { name: 'Marketing', category: 'department', description: 'Campañas, pauta y crecimiento' },
      { name: 'Audiovisual', category: 'department', description: 'Edición de vídeo, reels y audio' },
      { name: 'Community Manager', category: 'department', description: 'Publicación e interacción' },
    ],
  },
  {
    id: 'priority',
    label: 'Prioridad y Urgencia',
    icon: Flame,
    tags: [
      { name: 'Urgente', category: 'priority', description: 'Atención inmediata requerida' },
      { name: 'Prioridad Alta', category: 'priority', description: 'Impacto clave en el proyecto' },
      { name: 'Bloqueante', category: 'priority', description: 'Frena el avance de otras tareas' },
    ],
  },
  {
    id: 'status',
    label: 'Flujo y Aprobaciones',
    icon: Sparkles,
    tags: [
      { name: 'Revisión Cliente', category: 'status', description: 'Pendiente de feedback de cliente' },
      { name: 'Aprobación', category: 'status', description: 'Listo para visto bueno interno' },
      { name: 'Sprint Activo', category: 'status', description: 'Compromiso de entrega de este sprint' },
    ],
  },
];

export function getTagColor(tag: string): {
  bg: string;
  text: string;
  border: string;
  dot: string;
  hover: string;
} {
  const normalized = (tag || '').toLowerCase().trim();

  // Urgent / Blocker (Red / Rose)
  if (normalized.includes('urgente') || normalized.includes('urgent') || normalized.includes('bloqueante')) {
    return {
      bg: 'bg-rose-50',
      text: 'text-rose-700',
      border: 'border-rose-200',
      dot: 'bg-rose-500',
      hover: 'hover:bg-rose-100',
    };
  }

  // Priority High (Amber / Orange)
  if (normalized.includes('alta') || normalized.includes('high') || normalized.includes('prioridad')) {
    return {
      bg: 'bg-amber-50',
      text: 'text-amber-800',
      border: 'border-amber-200',
      dot: 'bg-amber-500',
      hover: 'hover:bg-amber-100',
    };
  }

  // Design / Creatives (Violet / Purple)
  if (
    normalized.includes('diseño') ||
    normalized.includes('design') ||
    normalized.includes('arte') ||
    normalized.includes('carrusel') ||
    normalized.includes('grafic')
  ) {
    return {
      bg: 'bg-violet-50',
      text: 'text-violet-700',
      border: 'border-violet-200',
      dot: 'bg-violet-500',
      hover: 'hover:bg-violet-100',
    };
  }

  // Strategy / Planning (Sky / Blue)
  if (
    normalized.includes('estrategia') ||
    normalized.includes('strategy') ||
    normalized.includes('plan') ||
    normalized.includes('branding')
  ) {
    return {
      bg: 'bg-sky-50',
      text: 'text-sky-700',
      border: 'border-sky-200',
      dot: 'bg-sky-500',
      hover: 'hover:bg-sky-100',
    };
  }

  // Copywriting / Editorial (Teal)
  if (
    normalized.includes('copy') ||
    normalized.includes('guion') ||
    normalized.includes('redacción') ||
    normalized.includes('texto')
  ) {
    return {
      bg: 'bg-teal-50',
      text: 'text-teal-700',
      border: 'border-teal-200',
      dot: 'bg-teal-500',
      hover: 'hover:bg-teal-100',
    };
  }

  // Development / Tech (Emerald)
  if (
    normalized.includes('desarrollo') ||
    normalized.includes('dev') ||
    normalized.includes('tech') ||
    normalized.includes('código')
  ) {
    return {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
      dot: 'bg-emerald-500',
      hover: 'hover:bg-emerald-100',
    };
  }

  // Marketing & Ads (Orange)
  if (
    normalized.includes('marketing') ||
    normalized.includes('ads') ||
    normalized.includes('campaña') ||
    normalized.includes('pauta')
  ) {
    return {
      bg: 'bg-orange-50',
      text: 'text-orange-700',
      border: 'border-orange-200',
      dot: 'bg-orange-500',
      hover: 'hover:bg-orange-100',
    };
  }

  // Audiovisual / Video (Fuchsia)
  if (
    normalized.includes('audiovisual') ||
    normalized.includes('video') ||
    normalized.includes('reel') ||
    normalized.includes('tiktok') ||
    normalized.includes('edición')
  ) {
    return {
      bg: 'bg-fuchsia-50',
      text: 'text-fuchsia-700',
      border: 'border-fuchsia-200',
      dot: 'bg-fuchsia-500',
      hover: 'hover:bg-fuchsia-100',
    };
  }

  // Community / Social (Pink / Rose)
  if (
    normalized.includes('community') ||
    normalized.includes('redes') ||
    normalized.includes('instagram') ||
    normalized.includes('linkedin')
  ) {
    return {
      bg: 'bg-pink-50',
      text: 'text-pink-700',
      border: 'border-pink-200',
      dot: 'bg-pink-500',
      hover: 'hover:bg-pink-100',
    };
  }

  // Review / Approvals (Indigo)
  if (
    normalized.includes('revisión') ||
    normalized.includes('aprobación') ||
    normalized.includes('cliente') ||
    normalized.includes('sprint')
  ) {
    return {
      bg: 'bg-indigo-50',
      text: 'text-indigo-700',
      border: 'border-indigo-200',
      dot: 'bg-indigo-500',
      hover: 'hover:bg-indigo-100',
    };
  }

  // Fallback hash color
  const palette = [
    { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', dot: 'bg-slate-400', hover: 'hover:bg-slate-100' },
    { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200', dot: 'bg-cyan-500', hover: 'hover:bg-cyan-100' },
    { bg: 'bg-lime-50', text: 'text-lime-700', border: 'border-lime-200', dot: 'bg-lime-500', hover: 'hover:bg-lime-100' },
  ];
  let sum = 0;
  for (let i = 0; i < tag.length; i++) {
    sum += tag.charCodeAt(i);
  }
  return palette[sum % palette.length];
}

interface TaskTagBadgeProps {
  tag: string;
  onRemove?: () => void;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
}

export const TaskTagBadge: React.FC<TaskTagBadgeProps> = ({
  tag,
  onRemove,
  size = 'sm',
  className = '',
}) => {
  const colors = getTagColor(tag);

  const sizeClasses = {
    xs: 'text-[9px] px-1.5 py-0.5 gap-1',
    sm: 'text-[10px] px-2 py-0.5 gap-1.5',
    md: 'text-xs px-2.5 py-1 gap-2',
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-md font-semibold border ${colors.bg} ${colors.text} ${colors.border} ${sizeClasses} ${className} transition-all`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${colors.dot}`} />
      <span className="truncate max-w-[140px]">{tag}</span>
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="hover:opacity-75 p-0.5 rounded-full hover:bg-black/5 -mr-0.5 cursor-pointer"
          title={`Eliminar etiqueta ${tag}`}
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </span>
  );
};

interface TaskTagsSelectorProps {
  tags: string[];
  onChange: (newTags: string[]) => void;
  className?: string;
  readonly?: boolean;
}

export const TaskTagsSelector: React.FC<TaskTagsSelectorProps> = ({
  tags = [],
  onChange,
  className = '',
  readonly = false,
}) => {
  const [activeCategory, setActiveCategory] = useState<'department' | 'priority' | 'status'>('department');
  const [customTagInput, setCustomTagInput] = useState('');
  const [showPicker, setShowPicker] = useState(false);

  const currentTags = Array.isArray(tags) ? tags : [];

  const handleToggleTag = (tagName: string) => {
    if (readonly) return;
    const exists = currentTags.some((t) => t.toLowerCase() === tagName.toLowerCase());
    let next: string[];
    if (exists) {
      next = currentTags.filter((t) => t.toLowerCase() !== tagName.toLowerCase());
    } else {
      next = [...currentTags, tagName];
    }
    onChange(next);
  };

  const handleRemoveTag = (tagName: string) => {
    if (readonly) return;
    const next = currentTags.filter((t) => t.toLowerCase() !== tagName.toLowerCase());
    onChange(next);
  };

  const handleAddCustomTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (readonly) return;
    const trimmed = customTagInput.trim();
    if (!trimmed) return;
    const exists = currentTags.some((t) => t.toLowerCase() === trimmed.toLowerCase());
    if (!exists) {
      onChange([...currentTags, trimmed]);
    }
    setCustomTagInput('');
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Header and Toggle Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <TagIcon className="w-3.5 h-3.5 text-indigo-600" />
          <span className="text-xs font-bold text-slate-800">
            Etiquetas y Categorización ({currentTags.length})
          </span>
        </div>

        {!readonly && (
          <button
            type="button"
            onClick={() => setShowPicker(!showPicker)}
            className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer flex items-center gap-1"
          >
            {showPicker ? 'Ocultar catálogo' : '+ Categorizar'}
          </button>
        )}
      </div>

      {/* Active Tags Pills */}
      <div className="flex flex-wrap items-center gap-1.5 min-h-[26px]">
        {currentTags.length === 0 ? (
          <span className="text-[11px] text-slate-400 italic">
            Sin etiquetas asignadas. Añade una para clasificar por departamento o prioridad.
          </span>
        ) : (
          currentTags.map((tag) => (
            <TaskTagBadge
              key={tag}
              tag={tag}
              size="sm"
              onRemove={readonly ? undefined : () => handleRemoveTag(tag)}
            />
          ))
        )}
      </div>

      {/* Selection System Panel (Collapsible or visible) */}
      {!readonly && showPicker && (
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/90 space-y-3 animate-in fade-in slide-in-from-top-1 duration-150">
          {/* Category Tabs */}
          <div className="flex items-center gap-1 border-b border-slate-200 pb-2">
            {PRESET_TAG_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-white text-indigo-700 shadow-2xs border border-indigo-200/60'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Preset Buttons for Selected Category */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
              Seleccionar o alternar etiquetas sugeridas:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_TAG_CATEGORIES.find((c) => c.id === activeCategory)?.tags.map((preset) => {
                const isSelected = currentTags.some((t) => t.toLowerCase() === preset.name.toLowerCase());
                const colors = getTagColor(preset.name);

                return (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => handleToggleTag(preset.name)}
                    title={preset.description}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                      isSelected
                        ? `${colors.bg} ${colors.text} ${colors.border} ring-2 ring-indigo-400/40 shadow-2xs font-bold`
                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-100/70'
                    }`}
                  >
                    {isSelected ? (
                      <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                    ) : (
                      <Plus className="w-3 h-3 text-slate-400 shrink-0" />
                    )}
                    <span>{preset.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Tag Input */}
          <form onSubmit={handleAddCustomTag} className="flex items-center gap-2 pt-2 border-t border-slate-200">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Escribe otra etiqueta personalizada (e.g. Legal, Campaña Q4)..."
                value={customTagInput}
                onChange={(e) => setCustomTagInput(e.target.value)}
                className="w-full text-xs py-1.5 px-2.5 rounded-lg border border-slate-300 bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none placeholder:text-slate-400"
              />
            </div>
            <button
              type="submit"
              disabled={!customTagInput.trim()}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-xs font-bold transition-colors flex items-center gap-1 shrink-0 cursor-pointer shadow-2xs"
            >
              <Plus className="w-3 h-3" />
              <span>Añadir</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
