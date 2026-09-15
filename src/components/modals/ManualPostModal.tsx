import React, { useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { Post, Platform, ContentFormat, ContentPillar } from '../../types';
import { X, Plus, Calendar, Clock, Image as ImageIcon, Upload } from 'lucide-react';

export const ManualPostModal: React.FC = () => {
  const { isManualPostOpen, closeManualPost, activeBrand, data, addPost, showToast } = useWorkspace();

  const [title, setTitle] = useState('');
  const [format, setFormat] = useState<ContentFormat>('Carousel');
  const [pillar, setPillar] = useState<ContentPillar>('Educativo');
  const [date, setDate] = useState('2026-09-12');
  const [time, setTime] = useState('11:00');
  const [platforms, setPlatforms] = useState<Platform[]>(['instagram', 'linkedin']);
  const [hook, setHook] = useState('');
  const [caption, setCaption] = useState('');
  const [cta, setCta] = useState('');
  const [hashtagsStr, setHashtagsStr] = useState('#Pixel12 #MarketingDigital #PyMEs');
  const [visualDescription, setVisualDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [assigneeId, setAssigneeId] = useState(data.members[0]?.id || '');
  const [campaignId, setCampaignId] = useState(data.campaigns[0]?.id || '');

  if (!isManualPostOpen) return null;

  const togglePlatform = (p: Platform) => {
    if (platforms.includes(p)) {
      if (platforms.length > 1) setPlatforms(platforms.filter((x) => x !== p));
    } else {
      setPlatforms([...platforms, p]);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setImageUrl(reader.result as string);
      showToast('Imagen cargada correctamente');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('El título interno es obligatorio', 'error');
      return;
    }

    const assignee = data.members.find((m) => m.id === assigneeId);
    const campaign = data.campaigns.find((c) => c.id === campaignId);

    const hashtags = hashtagsStr
      .split(' ')
      .map((t) => t.trim())
      .filter((t) => t.length > 1);

    const newPost: Post = {
      id: 'post_man_' + Date.now(),
      brandId: activeBrand.id,
      internalTitle: title,
      date,
      time,
      platforms,
      format,
      pillar,
      theme: title,
      objective: 'Generar alcance y engagement con audiencia objetivo',
      hook: hook || title,
      caption: caption || title,
      cta: cta || activeBrand.voice.preferredCTAs[0] || 'Escríbenos por DM',
      hashtags,
      visualDescription,
      imageUrl: imageUrl || undefined,
      status: 'DRAFT',
      assigneeId: assignee?.id,
      assigneeName: assignee?.name,
      campaignId: campaign?.id,
      campaignName: campaign?.name,
      relatedTaskIds: [],
      approvalHistory: [],
      versions: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await addPost(newPost);
    closeManualPost();
  };

  return (
    <div
      id="manual-post-modal"
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
          <div>
            <h3 className="text-base font-bold text-slate-900">+ Crear Publicación Manualmente</h3>
            <p className="text-xs text-slate-500">Para la marca activa: {activeBrand.name}</p>
          </div>
          <button
            onClick={closeManualPost}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Título interno</label>
            <input
              type="text"
              required
              placeholder="Ej: 5 errores al contratar una asistente virtual"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:border-sky-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Formato</label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value as ContentFormat)}
                className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
              >
                <option value="Carousel">Carrusel</option>
                <option value="Reel">Reel / Video corto</option>
                <option value="Static Post">Post estático</option>
                <option value="LinkedIn Post">LinkedIn Post</option>
                <option value="Story">Historia</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Pilar de contenido</label>
              <select
                value={pillar}
                onChange={(e) => setPillar(e.target.value as ContentPillar)}
                className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
              >
                <option value="Educativo">Educativo</option>
                <option value="Venta">Venta</option>
                <option value="Autoridad">Autoridad</option>
                <option value="Entretenimiento">Entretenimiento</option>
                <option value="Comunidad">Comunidad</option>
                <option value="Testimonios">Testimonios</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Fecha de publicación</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Hora (Ecuador)</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
              />
            </div>
          </div>

          {/* Platforms */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Plataformas</label>
            <div className="flex flex-wrap gap-2">
              {(['instagram', 'facebook', 'linkedin', 'youtube', 'tiktok'] as Platform[]).map((plat) => (
                <button
                  key={plat}
                  type="button"
                  onClick={() => togglePlatform(plat)}
                  className={`px-3 py-1 text-xs rounded-lg font-medium border transition-all ${
                    platforms.includes(plat)
                      ? 'bg-sky-50 border-sky-500 text-sky-700 font-semibold'
                      : 'bg-white border-slate-200 text-slate-500'
                  }`}
                >
                  {plat}
                </button>
              ))}
            </div>
          </div>

          {/* Hook */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Gancho / Hook inicial (Primeros 3 segundos o línea 1)
            </label>
            <input
              type="text"
              placeholder="Ej: Si respondes correos a las 11 PM, tu negocio te está consumiendo."
              value={hook}
              onChange={(e) => setHook(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:border-sky-500 outline-none"
            />
          </div>

          {/* Caption */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Texto del Post / Caption</label>
            <textarea
              rows={4}
              placeholder="Escribe el copy completo con saltos de línea y emojis..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:border-sky-500 outline-none"
            />
          </div>

          {/* CTA & Hashtags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Llamada a la Acción (CTA)</label>
              <input
                type="text"
                placeholder="Ej: Comenta DELEGAR y te enviamos la guía por DM"
                value={cta}
                onChange={(e) => setCta(e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-slate-300 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Hashtags</label>
              <input
                type="text"
                value={hashtagsStr}
                onChange={(e) => setHashtagsStr(e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-slate-300 outline-none"
              />
            </div>
          </div>

          {/* Visual Concept / File Upload */}
          <div className="border border-dashed border-slate-300 rounded-xl p-4 bg-slate-50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-sky-600" />
                Material Visual / Arte
              </span>
              <label className="cursor-pointer text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1">
                <Upload className="w-3.5 h-3.5" />
                <span>Subir archivo desde equipo</span>
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>

            {imageUrl && (
              <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-slate-200">
                <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}

            <input
              type="text"
              placeholder="O pega una URL directa de imagen (Unsplash, Drive, CDN)..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white"
            />
          </div>

          {/* Assignee & Campaign */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Responsable asignado</label>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
              >
                {data.members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.role})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Vincular a campaña</label>
              <select
                value={campaignId}
                onChange={(e) => setCampaignId(e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
              >
                <option value="">Sin campaña específica</option>
                {data.campaigns.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={closeManualPost}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md cursor-pointer transition-colors"
            >
              Guardar en Calendario
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
