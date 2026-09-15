import React, { useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { ImageLibraryItem, ImageCategoryType } from '../../types';
import {
  X,
  Search,
  Filter,
  Trash2,
  Copy,
  Check,
  Eye,
  Sparkles,
  ExternalLink,
  Plus
} from 'lucide-react';

interface ImageLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImage?: (imageUrl: string, title: string) => void;
  onOpenGenerator: () => void;
}

const CATEGORIES: ('TODAS' | ImageCategoryType)[] = [
  'TODAS',
  'Cotizaciones',
  'Propuestas',
  'Redes sociales',
  'Marketing',
  'Branding',
  'Asistencia virtual'
];

export const ImageLibraryModal: React.FC<ImageLibraryModalProps> = ({
  isOpen,
  onClose,
  onSelectImage,
  onOpenGenerator
}) => {
  const { data, deleteLibraryImage, addToast } = useWorkspace();
  const [selectedCategory, setSelectedCategory] = useState<'TODAS' | ImageCategoryType>('TODAS');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const library = data.imageLibrary || [];

  const filteredImages = library.filter((img) => {
    const matchesCat = selectedCategory === 'TODAS' || img.category === selectedCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      img.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      img.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (img.client && img.client.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const handleCopyPrompt = (id: string, promptText: string) => {
    navigator.clipboard.writeText(promptText);
    setCopiedId(id);
    addToast('Prompt copiado al portapapeles', 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div
      id="image-library-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-3 sm:p-5 overflow-y-auto"
    >
      <div className="relative w-full max-w-5xl my-auto bg-[#0E0E12] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between bg-[#121217]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl p12-gold-gradient flex items-center justify-center font-black text-black">
              <Sparkles className="w-5 h-5 text-black" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                Biblioteca Visual Pixel 12 ({library.length} recursos)
              </h2>
              <p className="text-xs text-zinc-400">
                Imágenes de alta resolución, mockups y creativos generados para cotizaciones y marcas
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onOpenGenerator();
              }}
              className="px-3 py-1.5 rounded-xl p12-gold-gradient text-black text-xs font-bold flex items-center gap-1.5 shadow-sm hover:brightness-110"
            >
              <Plus className="w-3.5 h-3.5 text-black" />
              <span>Generar Nuevo Visual</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filters & Search Bar */}
        <div className="p-4 border-b border-zinc-800 bg-[#0B0B0F] flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Categories */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-[#D4AF37]/20 text-[#E5C158] border border-[#D4AF37]/40'
                    : 'text-zinc-400 hover:text-zinc-200 bg-zinc-900 border border-zinc-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-zinc-500" />
            <input
              type="text"
              placeholder="Buscar visual, tag, cliente..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700/80 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
            />
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="overflow-y-auto flex-1 p-5 sm:p-6">
          {filteredImages.length === 0 ? (
            <div className="text-center py-12 text-zinc-500">
              <p className="text-sm">No se encontraron imágenes con los filtros seleccionados.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {filteredImages.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl overflow-hidden border border-zinc-800 bg-[#121217] flex flex-col justify-between group hover:border-[#D4AF37]/40 transition-all shadow-md"
                >
                  <div className="relative aspect-video overflow-hidden bg-black">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-2 left-2 flex items-center gap-1">
                      <span className="px-2 py-0.5 rounded bg-black/75 text-[10px] text-[#E5C158] font-semibold backdrop-blur-xs">
                        {item.category}
                      </span>
                      {item.aspectRatio && (
                        <span className="px-1.5 py-0.5 rounded bg-black/75 text-[10px] text-zinc-300 font-mono">
                          {item.aspectRatio}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-3.5 space-y-2">
                    <h4 className="text-xs font-bold text-white line-clamp-1">{item.title}</h4>
                    {item.client && (
                      <span className="text-[10px] text-zinc-400 block">Cliente: {item.client}</span>
                    )}

                    <div className="flex flex-wrap gap-1">
                      {item.tags.slice(0, 3).map((tag, tIdx) => (
                        <span key={tIdx} className="text-[9px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded">
                          #{tag}
                        </span>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-zinc-800 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleCopyPrompt(item.id, item.prompt)}
                          className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors text-xs flex items-center gap-1"
                          title="Copiar prompt"
                        >
                          {copiedId === item.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>

                        <a
                          href={item.imageUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                          title="Ver en nueva pestaña"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {onSelectImage && (
                          <button
                            onClick={() => {
                              onSelectImage(item.imageUrl, item.title);
                              addToast('Imagen seleccionada para la propuesta', 'success');
                              onClose();
                            }}
                            className="px-2.5 py-1 rounded-lg p12-gold-gradient text-black text-[11px] font-bold"
                          >
                            Usar
                          </button>
                        )}

                        <button
                          onClick={() => deleteLibraryImage(item.id)}
                          className="p-1.5 rounded-lg hover:bg-red-950/40 text-zinc-500 hover:text-red-400 transition-colors"
                          title="Eliminar de biblioteca"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
