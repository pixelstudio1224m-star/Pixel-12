import React, { useState, useEffect } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import { Brand, ContentPillar } from '../types';
import {
  Palette,
  Building2,
  Plus,
  Sparkles,
  Check,
  Globe,
  Type,
  Image as ImageIcon,
  MessageSquare,
  Shield,
  Layers,
  Trash2,
  ExternalLink,
  Crown,
  Eye,
  Sliders,
  CheckCircle2,
  RefreshCw,
  Hash,
  Smile,
  AlertOctagon,
  Copy,
  ChevronRight
} from 'lucide-react';

const PRESET_PILLARS: ContentPillar[] = [
  'Marketing Digital',
  'Asistencia Virtual',
  'Autoridad',
  'Conversión',
  'Engagement',
  'Educativo',
  'Venta',
  'Detrás de Escena',
  'Testimonios',
  'Comunidad',
  'Entretenimiento'
];

const PRESET_DISPLAY_FONTS = [
  { id: 'Outfit', label: 'Outfit (Modern Tech / Luxury)' },
  { id: 'Montserrat', label: 'Montserrat (Geometric / Bold)' },
  { id: 'Cinzel', label: 'Cinzel (Editorial / High Luxury)' },
  { id: 'Cabinet Grotesk', label: 'Cabinet Grotesk (Neo-Grotesk)' },
  { id: 'Playfair Display', label: 'Playfair Display (Classic Luxury Serif)' }
];

const PRESET_BODY_FONTS = [
  { id: 'Plus Jakarta Sans', label: 'Plus Jakarta Sans (Ultra Clean)' },
  { id: 'Inter', label: 'Inter (Versatile / Crisp)' },
  { id: 'DM Sans', label: 'DM Sans (Friendly Geometric)' },
  { id: 'Space Grotesk', label: 'Space Grotesk (Tech Forward)' }
];

export const BrandsView: React.FC = () => {
  const { data, activeBrand, setActiveBrandId, updateBrand, addBrand, showToast } = useWorkspace();

  // Active subtab
  const [activeTab, setActiveTab] = useState<'general' | 'visual' | 'pillars' | 'voice' | 'preview'>('general');

  // Form states initialized with activeBrand
  const [name, setName] = useState(activeBrand.name);
  const [tagline, setTagline] = useState(activeBrand.tagline || '');
  const [industry, setIndustry] = useState(activeBrand.industry || '');
  const [description, setDescription] = useState(activeBrand.description || '');
  const [targetAudience, setTargetAudience] = useState(activeBrand.targetAudience || '');
  const [services, setServices] = useState<string[]>(activeBrand.services || []);
  const [newServiceInput, setNewServiceInput] = useState('');

  // Visual & Logo states
  const [logoUrl, setLogoUrl] = useState(activeBrand.logoUrl || '');
  const [logoDarkUrl, setLogoDarkUrl] = useState(activeBrand.logoDarkUrl || '');
  const [logoLightUrl, setLogoLightUrl] = useState(activeBrand.logoLightUrl || '');
  const [faviconUrl, setFaviconUrl] = useState(activeBrand.faviconUrl || '');
  const [displayFont, setDisplayFont] = useState(activeBrand.typography?.display || 'Outfit');
  const [bodyFont, setBodyFont] = useState(activeBrand.typography?.body || 'Plus Jakarta Sans');

  // Colors
  const [primaryColor, setPrimaryColor] = useState(activeBrand.colors?.primary || '#D4AF37');
  const [secondaryColor, setSecondaryColor] = useState(activeBrand.colors?.secondary || '#CBD5E1');
  const [accentColor, setAccentColor] = useState(activeBrand.colors?.accent || '#D4AF37');
  const [goldColor, setGoldColor] = useState(activeBrand.colors?.gold || '#D4AF37');
  const [silverColor, setSilverColor] = useState(activeBrand.colors?.silver || '#CBD5E1');
  const [backgroundColor, setBackgroundColor] = useState(activeBrand.colors?.background || '#09090B');
  const [textColor, setTextColor] = useState(activeBrand.colors?.text || '#FFFFFF');

  // Pillars
  const [pillars, setPillars] = useState<ContentPillar[]>(activeBrand.pillars || []);
  const [newPillarInput, setNewPillarInput] = useState('');

  // Voice & Copilot
  const [tone, setTone] = useState(activeBrand.voice?.tone || '');
  const [personality, setPersonality] = useState<string[]>(activeBrand.voice?.personality || []);
  const [newPersonalityInput, setNewPersonalityInput] = useState('');
  const [powerWords, setPowerWords] = useState<string[]>(activeBrand.voice?.powerWords || []);
  const [newPowerWordInput, setNewPowerWordInput] = useState('');
  const [forbiddenWords, setForbiddenWords] = useState<string[]>(activeBrand.voice?.forbiddenWords || []);
  const [newForbiddenWordInput, setNewForbiddenWordInput] = useState('');
  const [emojisAllowed, setEmojisAllowed] = useState<boolean>(activeBrand.voice?.emojisAllowed ?? true);
  const [preferredCTAs, setPreferredCTAs] = useState<string[]>(activeBrand.voice?.preferredCTAs || []);
  const [newCTAInput, setNewCTAInput] = useState('');
  const [styleGuidelines, setStyleGuidelines] = useState(activeBrand.voice?.styleGuidelines || '');

  // Modal for new brand
  const [isNewBrandModalOpen, setIsNewBrandModalOpen] = useState(false);
  const [newBrandName, setNewBrandName] = useState('');
  const [newBrandTagline, setNewBrandTagline] = useState('');
  const [newBrandIndustry, setNewBrandIndustry] = useState('Marketing Digital');

  // Sync state when activeBrand changes
  useEffect(() => {
    setName(activeBrand.name);
    setTagline(activeBrand.tagline || '');
    setIndustry(activeBrand.industry || '');
    setDescription(activeBrand.description || '');
    setTargetAudience(activeBrand.targetAudience || '');
    setServices(activeBrand.services || []);
    setLogoUrl(activeBrand.logoUrl || '');
    setLogoDarkUrl(activeBrand.logoDarkUrl || '');
    setLogoLightUrl(activeBrand.logoLightUrl || '');
    setFaviconUrl(activeBrand.faviconUrl || '');
    setDisplayFont(activeBrand.typography?.display || 'Outfit');
    setBodyFont(activeBrand.typography?.body || 'Plus Jakarta Sans');
    setPrimaryColor(activeBrand.colors?.primary || '#D4AF37');
    setSecondaryColor(activeBrand.colors?.secondary || '#CBD5E1');
    setAccentColor(activeBrand.colors?.accent || '#D4AF37');
    setGoldColor(activeBrand.colors?.gold || '#D4AF37');
    setSilverColor(activeBrand.colors?.silver || '#CBD5E1');
    setBackgroundColor(activeBrand.colors?.background || '#09090B');
    setTextColor(activeBrand.colors?.text || '#FFFFFF');
    setPillars(activeBrand.pillars || []);
    setTone(activeBrand.voice?.tone || '');
    setPersonality(activeBrand.voice?.personality || []);
    setPowerWords(activeBrand.voice?.powerWords || []);
    setForbiddenWords(activeBrand.voice?.forbiddenWords || []);
    setEmojisAllowed(activeBrand.voice?.emojisAllowed ?? true);
    setPreferredCTAs(activeBrand.voice?.preferredCTAs || []);
    setStyleGuidelines(activeBrand.voice?.styleGuidelines || '');
  }, [activeBrand]);

  // Save changes
  const handleSaveBrand = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const updated: Brand = {
      ...activeBrand,
      name,
      tagline,
      industry,
      description,
      targetAudience,
      services,
      logoUrl,
      logoDarkUrl,
      logoLightUrl,
      faviconUrl,
      typography: {
        display: displayFont,
        body: bodyFont
      },
      colors: {
        primary: primaryColor,
        secondary: secondaryColor,
        accent: accentColor,
        gold: goldColor,
        silver: silverColor,
        background: backgroundColor,
        text: textColor
      },
      primaryColor,
      pillars,
      voice: {
        tone,
        personality,
        powerWords,
        forbiddenWords,
        emojisAllowed,
        preferredCTAs,
        styleGuidelines
      }
    };
    await updateBrand(updated);
    showToast(`Identidad de ${name} actualizada exitosamente`);
  };

  // Helper functions for tags
  const addService = () => {
    if (newServiceInput.trim() && !services.includes(newServiceInput.trim())) {
      setServices([...services, newServiceInput.trim()]);
      setNewServiceInput('');
    }
  };

  const removeService = (idx: number) => {
    setServices(services.filter((_, i) => i !== idx));
  };

  const addPillar = (pillar: ContentPillar) => {
    if (!pillars.includes(pillar)) {
      setPillars([...pillars, pillar]);
    }
  };

  const removePillar = (pillar: ContentPillar) => {
    setPillars(pillars.filter((p) => p !== pillar));
  };

  const addPersonality = () => {
    if (newPersonalityInput.trim() && !personality.includes(newPersonalityInput.trim())) {
      setPersonality([...personality, newPersonalityInput.trim()]);
      setNewPersonalityInput('');
    }
  };

  const removePersonality = (idx: number) => {
    setPersonality(personality.filter((_, i) => i !== idx));
  };

  const addPowerWord = () => {
    if (newPowerWordInput.trim() && !powerWords.includes(newPowerWordInput.trim())) {
      setPowerWords([...powerWords, newPowerWordInput.trim()]);
      setNewPowerWordInput('');
    }
  };

  const removePowerWord = (idx: number) => {
    setPowerWords(powerWords.filter((_, i) => i !== idx));
  };

  const addForbiddenWord = () => {
    if (newForbiddenWordInput.trim() && !forbiddenWords.includes(newForbiddenWordInput.trim())) {
      setForbiddenWords([...forbiddenWords, newForbiddenWordInput.trim()]);
      setNewForbiddenWordInput('');
    }
  };

  const removeForbiddenWord = (idx: number) => {
    setForbiddenWords(forbiddenWords.filter((_, i) => i !== idx));
  };

  const addCTA = () => {
    if (newCTAInput.trim()) {
      setPreferredCTAs([...preferredCTAs, newCTAInput.trim()]);
      setNewCTAInput('');
    }
  };

  const removeCTA = (idx: number) => {
    setPreferredCTAs(preferredCTAs.filter((_, i) => i !== idx));
  };

  // Apply default Pixel 12 Luxury Palette
  const applyPixel12LuxuryPalette = () => {
    setPrimaryColor('#D4AF37');
    setSecondaryColor('#CBD5E1');
    setAccentColor('#D4AF37');
    setGoldColor('#D4AF37');
    setSilverColor('#CBD5E1');
    setBackgroundColor('#09090B');
    setTextColor('#FFFFFF');
    setDisplayFont('Outfit');
    setBodyFont('Plus Jakarta Sans');
    showToast('Paleta Pixel 12 Luxury aplicada');
  };

  // Create new brand
  const handleCreateBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBrandName.trim()) return;

    const newBrandId = `brand_${Date.now()}`;
    const newB: Brand = {
      id: newBrandId,
      name: newBrandName.trim(),
      tagline: newBrandTagline.trim() || 'Gestión digital y escalamiento con Pixel 12',
      industry: newBrandIndustry,
      description: `Operaciones y campañas gestionadas bajo la suite estratégica de Pixel 12.`,
      services: ['Marketing digital', 'Gestión de redes', 'Estrategia de contenidos'],
      targetAudience: 'Clientes de alto valor y empresas que demandan excelencia y retorno.',
      typography: {
        display: 'Outfit',
        body: 'Plus Jakarta Sans'
      },
      colors: {
        primary: '#D4AF37',
        secondary: '#CBD5E1',
        accent: '#D4AF37',
        gold: '#D4AF37',
        silver: '#CBD5E1',
        background: '#09090B',
        text: '#FFFFFF'
      },
      primaryColor: '#D4AF37',
      pillars: ['Marketing Digital', 'Autoridad', 'Conversión', 'Engagement'],
      voice: {
        tone: 'Profesional, Estratégico, Seguro y Persuasivo',
        personality: ['Estratégico', 'Elegante', 'Resolutivo'],
        powerWords: ['Sistemas', 'Estrategia', 'Conversión', 'Crecimiento'],
        forbiddenWords: ['Hacks milagrosos', 'Gratis sin esfuerzo'],
        emojisAllowed: true,
        preferredCTAs: [
          'Agenda una llamada estratégica con nuestro equipo 📩',
          'Escríbenos para recibir el diagnóstico estratégico de tu marca ⚡'
        ],
        styleGuidelines: 'Aperturas concisas, propuesta de valor nítida y llamado a la acción enfocado en resultados.'
      }
    };

    await addBrand(newB);
    setActiveBrandId(newBrandId);
    setIsNewBrandModalOpen(false);
    setNewBrandName('');
    setNewBrandTagline('');
    showToast(`Nueva marca "${newB.name}" creada e incorporada al Workspace`);
  };

  return (
    <div id="brands-view" className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header & Brand Switcher */}
      <div className="bg-[#101018] p-5 sm:p-6 rounded-3xl border border-[#222234] shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-start sm:items-center gap-4">
          <div className="relative">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-black text-lg shadow-lg"
              style={{
                background: `linear-gradient(135deg, ${activeBrand.colors?.primary || '#D4AF37'}, ${activeBrand.colors?.secondary || '#CBD5E1'})`
              }}
            >
              {activeBrand.name.slice(0, 2).toUpperCase()}
            </div>
            {activeBrand.id === 'brand_pixel12' && (
              <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#09090B] border border-[#D4AF37] flex items-center justify-center shadow-xs">
                <Crown className="w-3 h-3 text-[#D4AF37]" />
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg sm:text-xl font-black text-white font-display">
                {activeBrand.name}
              </h2>
              {activeBrand.id === 'brand_pixel12' ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full p12-gold-gradient text-black">
                  MARCA MATRIZ PIXEL 12
                </span>
              ) : (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#181826] text-zinc-300 border border-[#26263A]">
                  CUENTA CLIENTE
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              {activeBrand.tagline || 'Estrategia Digital & Asistencia Virtual de Alto Nivel'}
            </p>
          </div>
        </div>

        {/* Brand Selector Pills + Add Brand Button */}
        <div className="flex flex-wrap items-center gap-2">
          {data.brands.map((b) => (
            <button
              key={b.id}
              onClick={() => setActiveBrandId(b.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border ${
                b.id === activeBrand.id
                  ? 'p12-gold-gradient text-black border-[#D4AF37] shadow-md shadow-[#D4AF37]/20 scale-102'
                  : 'bg-[#141420] text-zinc-300 border-[#222234] hover:bg-[#1C1C2C] hover:text-white'
              }`}
            >
              {b.id === 'brand_pixel12' && <Crown className="w-3.5 h-3.5" />}
              <span>{b.name}</span>
            </button>
          ))}

          <button
            onClick={() => setIsNewBrandModalOpen(true)}
            className="px-3 py-2 rounded-xl bg-[#141420] hover:bg-[#1C1C2C] text-[#E5C158] border border-[#2C2C40] text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            title="Crear nueva marca o cliente"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nueva Marca</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-[#222234]">
        {[
          { id: 'general', label: 'General & Posicionamiento', icon: Building2 },
          { id: 'visual', label: 'Identidad Visual & Logos', icon: Palette },
          { id: 'pillars', label: 'Pilares de Contenido', icon: Layers },
          { id: 'voice', label: 'Voz de Marca & Copiloto IA', icon: MessageSquare },
          { id: 'preview', label: 'Vista Previa en Vivo', icon: Eye }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'p12-gold-gradient text-black shadow-md shadow-[#D4AF37]/20 font-black'
                  : 'text-zinc-400 hover:text-white hover:bg-[#141420]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Settings Form Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          {/* TAB 1: GENERAL & POSICIONAMIENTO */}
          {activeTab === 'general' && (
            <div className="bg-[#101018] p-6 rounded-3xl border border-[#222234] shadow-xl space-y-6">
              <div className="border-b border-[#1F1F30] pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#D4AF37]" />
                  <span>Datos Generales de la Empresa</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Esta información define el contexto que el Copiloto IA utiliza para contextualizar cada propuesta y post.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5">Nombre de la Marca</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl bg-[#141420] border border-[#27273C] text-white focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
                    placeholder="Ej: Pixel 12"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5">Eslogan / Tagline Comercial</label>
                  <input
                    type="text"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl bg-[#141420] border border-[#27273C] text-white focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
                    placeholder="Ej: Marketing Digital, Estrategia & Asistencia Virtual"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5">Industria / Nicho de Mercado</label>
                  <input
                    type="text"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl bg-[#141420] border border-[#27273C] text-white focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
                    placeholder="Ej: Marketing Digital, Asistencia Virtual & Consultoría"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5">Descripción de la Marca</label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl bg-[#141420] border border-[#27273C] text-white focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] leading-relaxed"
                    placeholder="Explica qué hace la empresa, su propuesta de valor única y qué problemas resuelve..."
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                    Público Objetivo (Buyer Persona Ideal)
                  </label>
                  <textarea
                    rows={3}
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl bg-[#141420] border border-[#27273C] text-white focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] leading-relaxed"
                    placeholder="Define quién es el cliente ideal: perfil profesional, dolores, aspiraciones y objeciones..."
                  />
                </div>

                {/* Servicios Ofrecidos */}
                <div className="md:col-span-2 space-y-2.5 pt-2 border-t border-[#1F1F30]">
                  <label className="block text-xs font-bold text-zinc-300">Servicios o Soluciones Principales</label>
                  <div className="flex flex-wrap gap-2">
                    {services.map((srv, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#181826] text-zinc-200 border border-[#2C2C40] text-xs font-semibold"
                      >
                        <span>{srv}</span>
                        <button
                          type="button"
                          onClick={() => removeService(idx)}
                          className="text-zinc-500 hover:text-rose-400 ml-1 cursor-pointer"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="text"
                      value={newServiceInput}
                      onChange={(e) => setNewServiceInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addService();
                        }
                      }}
                      placeholder="Agregar nuevo servicio (Ej: Automatización con IA)..."
                      className="flex-1 text-xs p-2.5 rounded-xl bg-[#141420] border border-[#27273C] text-white focus:outline-none focus:border-[#D4AF37]"
                    />
                    <button
                      type="button"
                      onClick={addService}
                      className="px-4 py-2.5 rounded-xl p12-gold-gradient text-black text-xs font-bold cursor-pointer hover:brightness-105"
                    >
                      Añadir
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: IDENTIDAD VISUAL & LOGOS */}
          {activeTab === 'visual' && (
            <div className="bg-[#101018] p-6 rounded-3xl border border-[#222234] shadow-xl space-y-6">
              <div className="flex items-center justify-between border-b border-[#1F1F30] pb-3">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Palette className="w-4 h-4 text-[#D4AF37]" />
                    <span>Sistema de Identidad Visual & Logos</span>
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Configura la paleta de lujo, tipografías y enlaces a los logotipos vectoriales de la marca.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={applyPixel12LuxuryPalette}
                  className="px-3 py-1.5 rounded-xl bg-[#161624] hover:bg-[#1E1E30] text-[#E5C158] border border-[#D4AF37]/30 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Aplicar Preset Pixel 12</span>
                </button>
              </div>

              {/* Logotipos */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Activos de Marca & Logos</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1">Logo Principal (URL)</label>
                    <input
                      type="text"
                      value={logoUrl}
                      onChange={(e) => setLogoUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full text-xs p-2.5 rounded-xl bg-[#141420] border border-[#27273C] text-white focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1">Logo para Fondo Oscuro (URL)</label>
                    <input
                      type="text"
                      value={logoDarkUrl}
                      onChange={(e) => setLogoDarkUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full text-xs p-2.5 rounded-xl bg-[#141420] border border-[#27273C] text-white focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1">Logo para Fondo Claro (URL)</label>
                    <input
                      type="text"
                      value={logoLightUrl}
                      onChange={(e) => setLogoLightUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full text-xs p-2.5 rounded-xl bg-[#141420] border border-[#27273C] text-white focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1">Favicon / Ícono de Perfil (URL)</label>
                    <input
                      type="text"
                      value={faviconUrl}
                      onChange={(e) => setFaviconUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full text-xs p-2.5 rounded-xl bg-[#141420] border border-[#27273C] text-white focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                </div>
              </div>

              {/* Sistema Cromático */}
              <div className="space-y-4 pt-4 border-t border-[#1F1F30]">
                <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                  Paleta de Color Oficial (Pixel 12 Luxury)
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                  {/* Primario / Dorado */}
                  <div className="p-3 rounded-2xl bg-[#141420] border border-[#27273C] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-zinc-300">Primario (Oro)</span>
                      <input
                        type="color"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="w-7 h-7 rounded-lg border-0 cursor-pointer bg-transparent"
                      />
                    </div>
                    <div
                      className="h-10 rounded-xl flex items-center justify-center font-mono text-xs font-bold text-black shadow-inner"
                      style={{ backgroundColor: primaryColor }}
                    >
                      {primaryColor}
                    </div>
                  </div>

                  {/* Secundario / Plata */}
                  <div className="p-3 rounded-2xl bg-[#141420] border border-[#27273C] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-zinc-300">Secundario (Plata)</span>
                      <input
                        type="color"
                        value={secondaryColor}
                        onChange={(e) => setSecondaryColor(e.target.value)}
                        className="w-7 h-7 rounded-lg border-0 cursor-pointer bg-transparent"
                      />
                    </div>
                    <div
                      className="h-10 rounded-xl flex items-center justify-center font-mono text-xs font-bold text-black shadow-inner"
                      style={{ backgroundColor: secondaryColor }}
                    >
                      {secondaryColor}
                    </div>
                  </div>

                  {/* Fondo / Obsidian */}
                  <div className="p-3 rounded-2xl bg-[#141420] border border-[#27273C] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-zinc-300">Fondo Base</span>
                      <input
                        type="color"
                        value={backgroundColor}
                        onChange={(e) => setBackgroundColor(e.target.value)}
                        className="w-7 h-7 rounded-lg border-0 cursor-pointer bg-transparent"
                      />
                    </div>
                    <div
                      className="h-10 rounded-xl flex items-center justify-center font-mono text-xs font-bold text-white shadow-inner border border-[#333348]"
                      style={{ backgroundColor: backgroundColor }}
                    >
                      {backgroundColor}
                    </div>
                  </div>

                  {/* Acento */}
                  <div className="p-3 rounded-2xl bg-[#141420] border border-[#27273C] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-zinc-300">Acento</span>
                      <input
                        type="color"
                        value={accentColor}
                        onChange={(e) => setAccentColor(e.target.value)}
                        className="w-7 h-7 rounded-lg border-0 cursor-pointer bg-transparent"
                      />
                    </div>
                    <div
                      className="h-10 rounded-xl flex items-center justify-center font-mono text-xs font-bold text-black shadow-inner"
                      style={{ backgroundColor: accentColor }}
                    >
                      {accentColor}
                    </div>
                  </div>
                </div>
              </div>

              {/* Sistema Tipográfico */}
              <div className="space-y-4 pt-4 border-t border-[#1F1F30]">
                <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                  <Type className="w-4 h-4 text-[#D4AF37]" />
                  <span>Sistema Tipográfico Editorial</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                      Tipografía Display (Titulares & Portadas)
                    </label>
                    <select
                      value={displayFont}
                      onChange={(e) => setDisplayFont(e.target.value)}
                      className="w-full text-xs p-3 rounded-xl bg-[#141420] border border-[#27273C] text-white focus:outline-none focus:border-[#D4AF37]"
                    >
                      {PRESET_DISPLAY_FONTS.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                      Tipografía de Lectura (Cuerpo & Copys)
                    </label>
                    <select
                      value={bodyFont}
                      onChange={(e) => setBodyFont(e.target.value)}
                      className="w-full text-xs p-3 rounded-xl bg-[#141420] border border-[#27273C] text-white focus:outline-none focus:border-[#D4AF37]"
                    >
                      {PRESET_BODY_FONTS.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PILARES DE CONTENIDO */}
          {activeTab === 'pillars' && (
            <div className="bg-[#101018] p-6 rounded-3xl border border-[#222234] shadow-xl space-y-6">
              <div className="border-b border-[#1F1F30] pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#D4AF37]" />
                  <span>Pilares Editoriales de Contenido</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Los pilares equilibran la parrilla de contenidos entre captación, autoridad, educación y venta directa.
                </p>
              </div>

              {/* Pilares Actuales */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-zinc-300">Pilares Activos en esta Marca</label>
                <div className="flex flex-wrap gap-2.5">
                  {pillars.map((pil) => (
                    <span
                      key={pil}
                      className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#141420] border border-[#D4AF37]/40 text-[#E5C158] text-xs font-bold shadow-xs"
                    >
                      <Hash className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>{pil}</span>
                      <button
                        type="button"
                        onClick={() => removePillar(pil)}
                        className="text-zinc-500 hover:text-rose-400 ml-1 cursor-pointer font-black"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Añadir Pilar Predefinido o Personalizado */}
              <div className="space-y-3 pt-3 border-t border-[#1F1F30]">
                <label className="block text-xs font-bold text-zinc-400">
                  Añadir pilares recomendados con un clic:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_PILLARS.filter((p) => !pillars.includes(p)).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => addPillar(p)}
                      className="px-2.5 py-1 rounded-lg bg-[#141420] hover:bg-[#1E1E2E] text-zinc-300 hover:text-white border border-[#27273C] text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Plus className="w-3 h-3 text-[#D4AF37]" />
                      <span>{p}</span>
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="text"
                    value={newPillarInput}
                    onChange={(e) => setNewPillarInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (newPillarInput.trim()) {
                          addPillar(newPillarInput.trim() as any);
                          setNewPillarInput('');
                        }
                      }
                    }}
                    placeholder="Escribir otro pilar personalizado..."
                    className="flex-1 text-xs p-2.5 rounded-xl bg-[#141420] border border-[#27273C] text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newPillarInput.trim()) {
                        addPillar(newPillarInput.trim() as any);
                        setNewPillarInput('');
                      }
                    }}
                    className="px-4 py-2.5 rounded-xl p12-gold-gradient text-black text-xs font-bold cursor-pointer hover:brightness-105"
                  >
                    Añadir
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: VOZ DE MARCA & COPILOTO IA */}
          {activeTab === 'voice' && (
            <div className="bg-[#101018] p-6 rounded-3xl border border-[#222234] shadow-xl space-y-6">
              <div className="border-b border-[#1F1F30] pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-[#D4AF37]" />
                  <span>Voz de Marca & Parámetros del Copiloto IA</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  El motor de IA de Pixel 12 adopta estrictamente este tono, reglas léxicas y llamadas a la acción.
                </p>
              </div>

              <div className="space-y-5">
                {/* Tono de Voz */}
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5">Tono de Voz Principal</label>
                  <input
                    type="text"
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    placeholder="Ej: Profesional, Estratégico, Cercano, Inteligente, Claro, Moderno, Seguro, Persuasivo"
                    className="w-full text-xs p-3 rounded-xl bg-[#141420] border border-[#27273C] text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                {/* Rasgos de Personalidad */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-zinc-300">Rasgos de Personalidad de Marca</label>
                  <div className="flex flex-wrap gap-2">
                    {personality.map((trait, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#161624] text-[#E5C158] border border-[#D4AF37]/30 text-xs font-semibold"
                      >
                        <span>{trait}</span>
                        <button
                          type="button"
                          onClick={() => removePersonality(idx)}
                          className="text-zinc-500 hover:text-rose-400 ml-1 cursor-pointer"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="text"
                      value={newPersonalityInput}
                      onChange={(e) => setNewPersonalityInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addPersonality();
                        }
                      }}
                      placeholder="Nuevo rasgo (Ej: Resolutivo, Tecnológico)..."
                      className="flex-1 text-xs p-2.5 rounded-xl bg-[#141420] border border-[#27273C] text-white focus:outline-none focus:border-[#D4AF37]"
                    />
                    <button
                      type="button"
                      onClick={addPersonality}
                      className="px-3.5 py-2 rounded-xl p12-gold-gradient text-black text-xs font-bold cursor-pointer hover:brightness-105"
                    >
                      Añadir
                    </button>
                  </div>
                </div>

                {/* Palabras de Poder & Prohibidas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-3 border-t border-[#1F1F30]">
                  {/* Palabras de poder */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-emerald-400">
                      Palabras de Poder (Favorecidas por la IA)
                    </label>
                    <div className="flex flex-wrap gap-1.5 min-h-[44px]">
                      {powerWords.map((pw, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-emerald-950/40 text-emerald-300 border border-emerald-800/40 text-[11px] font-medium"
                        >
                          <span>{pw}</span>
                          <button
                            type="button"
                            onClick={() => removePowerWord(idx)}
                            className="text-emerald-500 hover:text-emerald-200 cursor-pointer"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newPowerWordInput}
                        onChange={(e) => setNewPowerWordInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addPowerWord();
                          }
                        }}
                        placeholder="Ej: Rentabilidad, Sistemas..."
                        className="flex-1 text-xs p-2 rounded-xl bg-[#141420] border border-[#27273C] text-white focus:outline-none focus:border-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={addPowerWord}
                        className="px-3 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Palabras prohibidas */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-rose-400">
                      Palabras Prohibidas (Baneadas en Copys)
                    </label>
                    <div className="flex flex-wrap gap-1.5 min-h-[44px]">
                      {forbiddenWords.map((fw, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-rose-950/40 text-rose-300 border border-rose-800/40 text-[11px] font-medium"
                        >
                          <span>{fw}</span>
                          <button
                            type="button"
                            onClick={() => removeForbiddenWord(idx)}
                            className="text-rose-500 hover:text-rose-200 cursor-pointer"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newForbiddenWordInput}
                        onChange={(e) => setNewForbiddenWordInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addForbiddenWord();
                          }
                        }}
                        placeholder="Ej: Hacks milagrosos, Spam..."
                        className="flex-1 text-xs p-2 rounded-xl bg-[#141420] border border-[#27273C] text-white focus:outline-none focus:border-rose-500"
                      />
                      <button
                        type="button"
                        onClick={addForbiddenWord}
                        className="px-3 py-2 rounded-xl bg-rose-800 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {/* Emojis Allowed Toggle */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-[#141420] border border-[#27273C]">
                  <div className="flex items-center gap-3">
                    <Smile className="w-5 h-5 text-[#D4AF37]" />
                    <div>
                      <span className="text-xs font-bold text-white block">Permitir Emojis Estratégicos</span>
                      <span className="text-[11px] text-zinc-400">
                        La IA incluirá emojis con moderación para viñetas y ganchos visuales.
                      </span>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={emojisAllowed}
                      onChange={(e) => setEmojisAllowed(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-[#26263A] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D4AF37]" />
                  </label>
                </div>

                {/* Llamadas a la Acción Frecuentes (CTAs) */}
                <div className="space-y-3 pt-3 border-t border-[#1F1F30]">
                  <label className="block text-xs font-bold text-zinc-300">
                    Llamadas a la Acción Preferidas (CTAs Oficiales)
                  </label>
                  <div className="space-y-2">
                    {preferredCTAs.map((cta, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-[#141420] border border-[#27273C] text-xs text-zinc-200"
                      >
                        <span className="leading-snug italic">"{cta}"</span>
                        <button
                          type="button"
                          onClick={() => removeCTA(idx)}
                          className="text-zinc-500 hover:text-rose-400 ml-2 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="text"
                      value={newCTAInput}
                      onChange={(e) => setNewCTAInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addCTA();
                        }
                      }}
                      placeholder="Nueva llamada a la acción (Ej: Comenta 'ESCALAR' para enviarte la guía)..."
                      className="flex-1 text-xs p-2.5 rounded-xl bg-[#141420] border border-[#27273C] text-white focus:outline-none focus:border-[#D4AF37]"
                    />
                    <button
                      type="button"
                      onClick={addCTA}
                      className="px-3.5 py-2 rounded-xl p12-gold-gradient text-black text-xs font-bold cursor-pointer hover:brightness-105"
                    >
                      Añadir
                    </button>
                  </div>
                </div>

                {/* Directrices de Estilo Editorial */}
                <div className="pt-2">
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                    Directrices de Estilo Editorial & Reglas de Formato
                  </label>
                  <textarea
                    rows={3}
                    value={styleGuidelines}
                    onChange={(e) => setStyleGuidelines(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl bg-[#141420] border border-[#27273C] text-white focus:outline-none focus:border-[#D4AF37] leading-relaxed"
                    placeholder="Instrucciones específicas para el copywriter de IA (Ej: Hooks directos de dolor en 2 seg, párrafos de máx 2 líneas, cierre con ROI cuantificable)..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: VISTA PREVIA EN VIVO */}
          {activeTab === 'preview' && (
            <div className="bg-[#101018] p-6 rounded-3xl border border-[#222234] shadow-xl space-y-6">
              <div className="border-b border-[#1F1F30] pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Eye className="w-4 h-4 text-[#D4AF37]" />
                  <span>Renderizado de Marca en Vivo (Brand Sheet)</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Visualización consolidada de cómo se presenta la marca en el ecosistema Pixel 12.
                </p>
              </div>

              {/* Tarjeta de Presentación de Marca */}
              <div
                className="p-6 rounded-2xl border-2 shadow-2xl relative overflow-hidden transition-all"
                style={{
                  backgroundColor: backgroundColor,
                  borderColor: primaryColor,
                  color: textColor
                }}
              >
                <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-base shadow-md"
                      style={{
                        backgroundColor: primaryColor,
                        color: '#000000'
                      }}
                    >
                      {name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-base font-black uppercase tracking-wider" style={{ fontFamily: displayFont }}>
                        {name}
                      </h4>
                      <p className="text-[11px] opacity-80" style={{ fontFamily: bodyFont }}>
                        {tagline}
                      </p>
                    </div>
                  </div>
                  <span
                    className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase"
                    style={{
                      backgroundColor: `${primaryColor}25`,
                      color: primaryColor,
                      border: `1px solid ${primaryColor}60`
                    }}
                  >
                    {industry}
                  </span>
                </div>

                <div className="py-4 space-y-3">
                  <p className="text-xs leading-relaxed opacity-90" style={{ fontFamily: bodyFont }}>
                    {description}
                  </p>

                  <div className="flex flex-wrap gap-2 pt-2">
                    {pillars.map((pil, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-bold px-2 py-0.5 rounded-md"
                        style={{
                          backgroundColor: `${primaryColor}20`,
                          color: primaryColor
                        }}
                      >
                        #{pil}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-[11px] opacity-75">
                  <span>Tipografía Display: {displayFont}</span>
                  <span>Tipografía Body: {bodyFont}</span>
                </div>
              </div>

              {/* Muestras de Color */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-zinc-300 block">Paleta cromática activa:</span>
                <div className="grid grid-cols-4 gap-2">
                  <div className="p-3 rounded-xl bg-[#141420] border border-[#27273C] text-center">
                    <div className="w-full h-8 rounded-lg mb-1.5" style={{ backgroundColor: primaryColor }} />
                    <span className="text-[10px] font-mono text-zinc-300 block">{primaryColor}</span>
                    <span className="text-[9px] text-zinc-500 uppercase">Primario</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#141420] border border-[#27273C] text-center">
                    <div className="w-full h-8 rounded-lg mb-1.5" style={{ backgroundColor: secondaryColor }} />
                    <span className="text-[10px] font-mono text-zinc-300 block">{secondaryColor}</span>
                    <span className="text-[9px] text-zinc-500 uppercase">Secundario</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#141420] border border-[#27273C] text-center">
                    <div className="w-full h-8 rounded-lg mb-1.5" style={{ backgroundColor: accentColor }} />
                    <span className="text-[10px] font-mono text-zinc-300 block">{accentColor}</span>
                    <span className="text-[9px] text-zinc-500 uppercase">Acento</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#141420] border border-[#27273C] text-center">
                    <div className="w-full h-8 rounded-lg mb-1.5" style={{ backgroundColor: backgroundColor }} />
                    <span className="text-[10px] font-mono text-zinc-300 block">{backgroundColor}</span>
                    <span className="text-[9px] text-zinc-500 uppercase">Fondo</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Botón de Guardado General */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-[#101018] border border-[#222234] shadow-md">
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />
              <span>Sincronizado con Copiloto IA y Generador de Campañas</span>
            </div>

            <button
              type="button"
              onClick={() => handleSaveBrand()}
              className="px-6 py-2.5 rounded-xl p12-gold-gradient text-black font-black text-xs sm:text-sm hover:brightness-105 transition-all shadow-lg shadow-[#D4AF37]/20 cursor-pointer active:scale-98"
            >
              Guardar Configuración de Marca
            </button>
          </div>
        </div>

        {/* SIDEBAR DERECHO: RESUMEN Y ESTADO DE IA */}
        <div className="lg:col-span-4 space-y-6">
          {/* Card Resumen de la Marca */}
          <div className="bg-[#101018] p-5 rounded-3xl border border-[#222234] shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-base shadow-md"
                style={{
                  backgroundColor: primaryColor,
                  color: '#000000'
                }}
              >
                {name.slice(0, 2).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <h4 className="font-bold text-white text-sm truncate">{name}</h4>
                <p className="text-[11px] text-zinc-400 truncate">{industry}</p>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-[#1F1F30] text-xs">
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Pilares editoriales:</span>
                <span className="font-bold text-[#E5C158]">{pillars.length} activos</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Servicios clave:</span>
                <span className="font-bold text-zinc-200">{services.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Palabras clave de poder:</span>
                <span className="font-bold text-emerald-400">{powerWords.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">CTAs registrados:</span>
                <span className="font-bold text-zinc-200">{preferredCTAs.length}</span>
              </div>
            </div>

            {/* Badge de Certificación IA */}
            <div className="p-3.5 rounded-2xl bg-[#141422] border border-[#2E2E44] space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-[#E5C158]">
                <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                <span>Listo para Generación IA</span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-tight">
                El motor de Pixel 12 adaptará automáticamente carruseles, posts, reels y copys respetando esta voz y colores.
              </p>
            </div>
          </div>

          {/* Quick CTA Snippet Tester */}
          <div className="bg-[#101018] p-5 rounded-3xl border border-[#222234] shadow-xl space-y-3">
            <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>CTA Recomendado</span>
            </h4>
            <div className="p-3 rounded-xl bg-[#141420] border border-[#27273C] text-xs text-zinc-200 italic leading-relaxed">
              "{preferredCTAs[0] || 'Escríbenos por DM para auditar tu marca 📩'}"
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Crear Nueva Marca */}
      {isNewBrandModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#101018] border border-[#28283C] rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-[#222234] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl p12-gold-gradient flex items-center justify-center font-bold text-black text-sm">
                  <Plus className="w-4 h-4 text-black" />
                </div>
                <h3 className="font-bold text-sm text-white">Incorporar Nueva Marca</h3>
              </div>
              <button
                onClick={() => setIsNewBrandModalOpen(false)}
                className="text-zinc-400 hover:text-white cursor-pointer font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateBrand} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">Nombre Comercial</label>
                <input
                  type="text"
                  required
                  value={newBrandName}
                  onChange={(e) => setNewBrandName(e.target.value)}
                  placeholder="Ej: Apex Logistics, Soluciones Bio..."
                  className="w-full text-xs p-3 rounded-xl bg-[#141420] border border-[#27273C] text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">Eslogan o Propuesta Corta</label>
                <input
                  type="text"
                  value={newBrandTagline}
                  onChange={(e) => setNewBrandTagline(e.target.value)}
                  placeholder="Ej: Eficiencia logística para e-commerce"
                  className="w-full text-xs p-3 rounded-xl bg-[#141420] border border-[#27273C] text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">Industria o Rubro</label>
                <input
                  type="text"
                  value={newBrandIndustry}
                  onChange={(e) => setNewBrandIndustry(e.target.value)}
                  placeholder="Ej: E-commerce, Salud, Bienes Raíces..."
                  className="w-full text-xs p-3 rounded-xl bg-[#141420] border border-[#27273C] text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#222234]">
                <button
                  type="button"
                  onClick={() => setIsNewBrandModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl p12-gold-gradient text-black font-bold text-xs hover:brightness-105 transition-all shadow-md cursor-pointer"
                >
                  Crear e Iniciar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
