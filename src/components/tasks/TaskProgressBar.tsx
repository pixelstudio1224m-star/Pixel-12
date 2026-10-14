import React, { useState, useRef, useEffect } from 'react';
import { Check, CheckCircle2, Sliders, ChevronDown, Percent } from 'lucide-react';
import { Task } from '../../types';

export function getTaskProgress(task: Task): number {
  if (typeof task.progress === 'number' && !isNaN(task.progress)) {
    return Math.max(0, Math.min(100, Math.round(task.progress)));
  }
  const total = (task.checklist || []).length;
  if (total > 0) {
    const completed = task.checklist.filter((c) => c.completed).length;
    return Math.round((completed / total) * 100);
  }
  if (task.status === 'COMPLETED') return 100;
  if (task.status === 'IN_REVIEW') return 80;
  if (task.status === 'IN_PROGRESS') return 40;
  return 0;
}

export function getProgressColor(percent: number): {
  bar: string;
  badge: string;
  text: string;
  glow: string;
} {
  if (percent >= 100) {
    return {
      bar: 'bg-emerald-500',
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      text: 'text-emerald-700 font-bold',
      glow: 'shadow-[0_0_10px_rgba(16,185,129,0.35)]',
    };
  }
  if (percent >= 75) {
    return {
      bar: 'bg-teal-500',
      badge: 'bg-teal-50 text-teal-700 border-teal-200',
      text: 'text-teal-700 font-bold',
      glow: 'shadow-[0_0_8px_rgba(20,184,166,0.25)]',
    };
  }
  if (percent >= 40) {
    return {
      bar: 'bg-indigo-500',
      badge: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      text: 'text-indigo-700 font-semibold',
      glow: 'shadow-[0_0_8px_rgba(99,102,241,0.25)]',
    };
  }
  if (percent > 0) {
    return {
      bar: 'bg-amber-500',
      badge: 'bg-amber-50 text-amber-700 border-amber-200',
      text: 'text-amber-700 font-semibold',
      glow: 'shadow-[0_0_8px_rgba(245,158,11,0.25)]',
    };
  }
  return {
    bar: 'bg-slate-300',
    badge: 'bg-slate-100 text-slate-600 border-slate-200',
    text: 'text-slate-500 font-medium',
    glow: '',
  };
}

interface TaskProgressBarProps {
  progress: number;
  taskTitle?: string;
  interactive?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  showPresets?: boolean;
  onChange?: (newPercentage: number) => void;
  className?: string;
}

export const TaskProgressBar: React.FC<TaskProgressBarProps> = ({
  progress,
  taskTitle,
  interactive = false,
  size = 'md',
  showLabel = true,
  showPresets = false,
  onChange,
  className = '',
}) => {
  const clampedProgress = Math.max(0, Math.min(100, Math.round(progress)));
  const colors = getProgressColor(clampedProgress);
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(clampedProgress);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync internal temp value with external prop
  useEffect(() => {
    setTempValue(clampedProgress);
  }, [clampedProgress]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsEditing(false);
      }
    };
    if (isEditing) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isEditing]);

  const handleUpdate = (val: number) => {
    const nextVal = Math.max(0, Math.min(100, Math.round(val)));
    setTempValue(nextVal);
    if (onChange) {
      onChange(nextVal);
    }
  };

  const heightClasses = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-2.5',
  };

  const presetValues = [0, 25, 50, 75, 100];

  return (
    <div
      className={`w-full relative ${className}`}
      onClick={(e) => {
        // Prevent click bubbling up to parent card if interactive
        if (interactive) {
          e.stopPropagation();
        }
      }}
    >
      {/* Header with Title/Label and Percentage */}
      {showLabel && (
        <div className="flex items-center justify-between gap-1.5 mb-1.5 text-xs">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-[11px] font-semibold text-slate-600 truncate">Progreso</span>
            {clampedProgress === 100 && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-700 text-[9px] font-bold">
                <Check className="w-2.5 h-2.5 stroke-[3]" />
                Completado
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {interactive ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(!isEditing);
                }}
                title="Ajustar porcentaje de progreso"
                className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md border text-[11px] transition-colors cursor-pointer ${
                  colors.badge
                } hover:brightness-95`}
              >
                <span className="font-bold">{clampedProgress}%</span>
                <Sliders className="w-2.5 h-2.5 opacity-70" />
              </button>
            ) : (
              <span className={`text-[11px] font-bold ${colors.text}`}>
                {clampedProgress}%
              </span>
            )}
          </div>
        </div>
      )}

      {/* Progress Track */}
      <div
        role="progressbar"
        aria-valuenow={clampedProgress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={taskTitle ? `Progreso de ${taskTitle}` : 'Progreso de la tarea'}
        className={`w-full ${heightClasses[size]} bg-slate-100/90 rounded-full overflow-hidden border border-slate-200/70 p-[1px] relative`}
      >
        <div
          className={`h-full rounded-full transition-all duration-300 ease-out ${colors.bar} ${
            clampedProgress > 0 ? colors.glow : ''
          }`}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>

      {/* Quick Presets on Card if requested directly */}
      {showPresets && interactive && (
        <div className="flex items-center justify-between gap-1 mt-2">
          {presetValues.map((pct) => (
            <button
              key={pct}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleUpdate(pct);
              }}
              className={`flex-1 py-0.5 text-[10px] font-semibold rounded border transition-all ${
                clampedProgress === pct
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {pct}%
            </button>
          ))}
        </div>
      )}

      {/* Interactive Dropdown / Popover for Manual Control */}
      {interactive && isEditing && (
        <div
          ref={dropdownRef}
          onClick={(e) => e.stopPropagation()}
          className="absolute z-30 left-0 right-0 top-full mt-2 p-3 bg-white rounded-xl shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 text-slate-800"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1">
              <Percent className="w-3 h-3 text-indigo-600" />
              Actualizar Progreso
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full border ${colors.badge} font-bold`}>
              {tempValue}%
            </span>
          </div>

          {/* Slider input */}
          <div className="space-y-1 my-2">
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={tempValue}
              onChange={(e) => handleUpdate(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer h-2 bg-slate-100 rounded-lg"
            />
            <div className="flex justify-between text-[9px] text-slate-400 font-semibold px-0.5">
              <span>0%</span>
              <span>25%</span>
              <span>50%</span>
              <span>75%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Preset Buttons */}
          <div className="grid grid-cols-5 gap-1 mt-2.5">
            {presetValues.map((pct) => (
              <button
                key={pct}
                type="button"
                onClick={() => handleUpdate(pct)}
                className={`py-1 text-[10px] font-bold rounded-lg border transition-all ${
                  clampedProgress === pct
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200'
                }`}
              >
                {pct}%
              </button>
            ))}
          </div>

          {/* Stepper controls & Done button */}
          <div className="flex items-center justify-between gap-2 mt-3 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleUpdate(tempValue - 10)}
                disabled={tempValue <= 0}
                className="px-2 py-0.5 text-[10px] font-bold rounded bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-40"
              >
                -10%
              </button>
              <button
                type="button"
                onClick={() => handleUpdate(tempValue + 10)}
                disabled={tempValue >= 100}
                className="px-2 py-0.5 text-[10px] font-bold rounded bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-40"
              >
                +10%
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
            >
              Listo
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
