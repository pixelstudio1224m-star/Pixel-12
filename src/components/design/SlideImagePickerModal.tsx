import React, { useState } from 'react';
import { X, Image as ImageIcon, Sparkles, Check, Upload, Search, ExternalLink } from 'lucide-react';
import { CURATED_DYNAMIC_IMAGES, CuratedImage } from '../../lib/dynamicImageBank';

interface SlideImagePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentImageUrl?: string;
  onSelectImage: (imageUrl: string) => void;
  title?: string;
  suggestedPrompt?: string;
}

export const SlideImagePickerModal: React.FC<SlideImagePickerModalProps> = ({
  isOpen,
  onClose,
  currentImageUrl,
  onSelectImage,
  title = 'Seleccionar Imagen Dinámica para Diapositiva',
  suggestedPrompt
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [customUrl, setCustomUrl] = useState('');
  const [activeTab, setActiveTab] = useState<'curated' | 'custom' | 'upload'>('curated');

  if (!isOpen) return null;

  const filteredImages = selectedCategory === 'all'
    ? CURATED_DYNAMIC_IMAGES
    : CURATED_DYNAMIC_IMAGES.filter(img => img.category === selectedCategory);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const result = uploadEvent.target?.result as string;
        if (result) {
          onSelectImage(result);
          onClose();
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApplyCustomUrl = () => {
    if (customUrl.trim()) {
      onSelectImage(customUrl.trim());
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-[#0F0F17] border border-[#2B2B3E] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#202032] flex items-center justify-between bg-[#141420]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#E5C158]">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white font-display">
                {title}
              </h3>
              <p className="text-xs text-zinc-400">
                Selecciona una fotografía de alta resolución para enriquecer el diseño visual
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-[#1E1E2E] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-5 pt-3 border-b border-[#1E1E2E] bg-[#11111B]">
          <button
            onClick={() => setActiveTab('curated')}
            className={`pb-2.5 text-xs font-bold transition-colors border-b-2 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'curated'
                ? 'border-[#D4AF37] text-[#E5C158]'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Banco Prémium Pixel 12</span>
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`pb-2.5 text-xs font-bold transition-colors border-b-2 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'custom'
                ? 'border-[#D4AF37] text-[#E5C158]'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Enlace / URL Externa</span>
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`pb-2.5 text-xs font-bold transition-colors border-b-2 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'upload'
                ? 'border-[#D4AF37] text-[#E5C158]'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Subir Imagen</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {activeTab === 'curated' && (
            <div className="space-y-4">
              {/* Category Pills */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: 'all', label: 'Todas las fotos' },
                  { id: 'marketing', label: 'Marketing & Pauta' },
                  { id: 'virtual_assistant', label: 'Asistencia Virtual' },
                  { id: 'business', label: 'Negocios & PyMEs' },
                  { id: 'luxury_dark', label: 'Lujo Negro & Oro' },
                  { id: 'analytics', label: 'Métricas & Gráficos' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all cursor-pointer ${
                      selectedCategory === cat.id
                        ? 'bg-[#D4AF37] text-black border-[#D4AF37] font-bold shadow-xs'
                        : 'bg-[#161624] text-zinc-300 border-[#26263A] hover:bg-[#1E1E30]'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Grid of Images */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {filteredImages.map((img) => {
                  const isSelected = currentImageUrl === img.url;
                  return (
                    <div
                      key={img.id}
                      onClick={() => {
                        onSelectImage(img.url);
                        onClose();
                      }}
                      className={`group relative aspect-4/3 rounded-xl overflow-hidden border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-[#D4AF37] ring-2 ring-[#D4AF37]/50 shadow-lg'
                          : 'border-[#26263A] hover:border-[#D4AF37]/50 hover:scale-[1.02]'
                      }`}
                    >
                      <img
                        src={img.thumbnailUrl}
                        alt={img.alt}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                      {isSelected && (
                        <div className="absolute top-2 right-2 p-1 bg-[#D4AF37] text-black rounded-full shadow-md">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}

                      <div className="absolute bottom-2 left-2 right-2">
                        <p className="text-[11px] font-bold text-white line-clamp-1">
                          {img.title}
                        </p>
                        <span className="text-[9px] text-[#E5C158] font-semibold uppercase tracking-wider">
                          {img.category.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'custom' && (
            <div className="p-4 rounded-xl bg-[#141422] border border-[#26263A] space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-white block">
                  Pega la URL directa de la imagen (Unsplash, Pexels o enlace web)
                </label>
                <p className="text-[11px] text-zinc-400">
                  Usa imágenes horizontales o verticales de alta resolución para un mejor resultado estético.
                </p>
              </div>

              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  className="flex-1 text-xs px-3 py-2.5 rounded-lg bg-[#0D0D14] border border-[#2E2E44] text-white focus:border-[#D4AF37] outline-none"
                />
                <button
                  onClick={handleApplyCustomUrl}
                  disabled={!customUrl.trim()}
                  className="px-4 py-2.5 rounded-lg bg-[#D4AF37] text-black text-xs font-bold hover:bg-[#E5C158] disabled:opacity-40 transition-colors cursor-pointer"
                >
                  Aplicar
                </button>
              </div>

              {customUrl.trim() && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-zinc-400">Vista previa del enlace:</span>
                  <div className="aspect-video w-full max-w-sm rounded-lg overflow-hidden border border-[#2E2E44]">
                    <img
                      src={customUrl.trim()}
                      alt="Vista previa personalizada"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                      onError={() => alert('No se pudo cargar la imagen desde este enlace')}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'upload' && (
            <div className="p-8 rounded-xl bg-[#141422] border-2 border-dashed border-[#2E2E44] text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#E5C158] flex items-center justify-center mx-auto">
                <Upload className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white">Sube una foto o creativo desde tu equipo</h4>
                <p className="text-xs text-zinc-400">Formatos soportados: PNG, JPG, WebP hasta 10MB</p>
              </div>

              <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#E5C158] text-black font-bold text-xs cursor-pointer shadow-md transition-all">
                <Upload className="w-4 h-4" />
                <span>Explorar archivos</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          )}

          {suggestedPrompt && (
            <div className="p-3 rounded-xl bg-[#131320] border border-[#27273C] flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
              <div className="text-[11px] text-zinc-300">
                <strong className="text-white block font-medium">Prompt visual sugerido para esta slide:</strong>
                <span className="text-zinc-400 italic">"{suggestedPrompt}"</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#1E1E2E] bg-[#141420] flex items-center justify-between">
          <span className="text-[11px] text-zinc-400">
            Fotografía curada optimizada para relación 4:5 y 1:1 de Pixel 12.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[#1E1E2E] hover:bg-[#2A2A3E] text-xs font-semibold text-zinc-300 hover:text-white transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
