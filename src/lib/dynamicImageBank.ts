export interface CuratedImage {
  id: string;
  title: string;
  category: 'marketing' | 'virtual_assistant' | 'business' | 'luxury_dark' | 'analytics' | 'strategy';
  url: string;
  thumbnailUrl: string;
  alt: string;
  recommendedFor: ('cover' | 'problem' | 'solution' | 'case_study' | 'cta')[];
}

export const CURATED_DYNAMIC_IMAGES: CuratedImage[] = [
  // Marketing & Strategy
  {
    id: 'img_mkt_1',
    title: 'Estrategia Digital & Laptop Pro',
    category: 'marketing',
    url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop&q=85',
    thumbnailUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=300&auto=format&fit=crop&q=80',
    alt: 'Estrategia digital y análisis de métricas en pantalla',
    recommendedFor: ['cover', 'problem', 'solution']
  },
  {
    id: 'img_mkt_2',
    title: 'Planificación de Campañas & Agencia',
    category: 'marketing',
    url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&auto=format&fit=crop&q=85',
    thumbnailUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=300&auto=format&fit=crop&q=80',
    alt: 'Equipo de estrategia revisando propuesta de marketing',
    recommendedFor: ['cover', 'solution', 'case_study']
  },
  {
    id: 'img_mkt_3',
    title: 'Embudos de Conversión & Pauta Digital',
    category: 'marketing',
    url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop&q=85',
    thumbnailUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300&auto=format&fit=crop&q=80',
    alt: 'Dashboard de métricas financieras y conversión de anuncios',
    recommendedFor: ['case_study', 'solution', 'problem']
  },
  {
    id: 'img_mkt_4',
    title: 'Redes Sociales & Smartphone Mockup',
    category: 'marketing',
    url: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=1200&auto=format&fit=crop&q=85',
    thumbnailUrl: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=300&auto=format&fit=crop&q=80',
    alt: 'Feed de redes sociales en smartphone de alta gama',
    recommendedFor: ['cover', 'solution']
  },

  // Asistencia Virtual & Productividad
  {
    id: 'img_va_1',
    title: 'Asistente Ejecutiva en Estación Moderna',
    category: 'virtual_assistant',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1200&auto=format&fit=crop&q=85',
    thumbnailUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
    alt: 'Asistente ejecutiva trabajando con tecnología y organización',
    recommendedFor: ['cover', 'solution', 'cta']
  },
  {
    id: 'img_va_2',
    title: 'Gestión de Operaciones & Agenda Ejecutiva',
    category: 'virtual_assistant',
    url: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=1200&auto=format&fit=crop&q=85',
    thumbnailUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=300&auto=format&fit=crop&q=80',
    alt: 'Profesional coordinando tareas administrativas y soporte',
    recommendedFor: ['problem', 'solution']
  },
  {
    id: 'img_va_3',
    title: 'Soporte y Atención VIP a Clientes',
    category: 'virtual_assistant',
    url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&auto=format&fit=crop&q=85',
    thumbnailUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=300&auto=format&fit=crop&q=80',
    alt: 'Equipo de asistencia coordinando operaciones en tiempo real',
    recommendedFor: ['solution', 'case_study']
  },

  // Negocios & PyMEs
  {
    id: 'img_biz_1',
    title: 'Fundador & Toma de Decisiones',
    category: 'business',
    url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1200&auto=format&fit=crop&q=85',
    thumbnailUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=300&auto=format&fit=crop&q=80',
    alt: 'Líder de empresa analizando expansión y estrategia',
    recommendedFor: ['cover', 'problem', 'cta']
  },
  {
    id: 'img_biz_2',
    title: 'Reunión de Crecimiento & Cierre de Ventas',
    category: 'business',
    url: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1200&auto=format&fit=crop&q=85',
    thumbnailUrl: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=300&auto=format&fit=crop&q=80',
    alt: 'Reunión de negocios con gráficos de crecimiento',
    recommendedFor: ['case_study', 'solution']
  },
  {
    id: 'img_biz_3',
    title: 'Escritorio Minimalista & Alta Dirección',
    category: 'business',
    url: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=1200&auto=format&fit=crop&q=85',
    thumbnailUrl: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=300&auto=format&fit=crop&q=80',
    alt: 'Oficina ejecutiva moderna y productiva',
    recommendedFor: ['cover', 'cta']
  },

  // Lujo Negro Obsidiana & Oro (Pixel 12 Aesthetic)
  {
    id: 'img_lux_1',
    title: 'Atmósfera Negro Obsidiana & Líneas Doradas',
    category: 'luxury_dark',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=85',
    thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&auto=format&fit=crop&q=80',
    alt: 'Textura abstracta negra con iluminación dorada cálida',
    recommendedFor: ['cover', 'cta']
  },
  {
    id: 'img_lux_2',
    title: 'Estructura Geométrica de Alto Nivel',
    category: 'luxury_dark',
    url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=1200&auto=format&fit=crop&q=85',
    thumbnailUrl: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=300&auto=format&fit=crop&q=80',
    alt: 'Diseño geométrico de lujo oscuro con reflejos metálicos',
    recommendedFor: ['cover', 'solution', 'problem']
  },
  {
    id: 'img_lux_3',
    title: 'Estudio Creativo & Luces Cinematográficas',
    category: 'luxury_dark',
    url: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=1200&auto=format&fit=crop&q=85',
    thumbnailUrl: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=300&auto=format&fit=crop&q=80',
    alt: 'Fondo cinematográfico oscuro con bokeh dorado cálido',
    recommendedFor: ['cover', 'cta']
  },

  // Analytics & Resultados
  {
    id: 'img_ana_1',
    title: 'Curva de Crecimiento & Métricas 140%',
    category: 'analytics',
    url: 'https://images.unsplash.com/photo-1551836022-4c4c79ecde51?w=1200&auto=format&fit=crop&q=85',
    thumbnailUrl: 'https://images.unsplash.com/photo-1551836022-4c4c79ecde51?w=300&auto=format&fit=crop&q=80',
    alt: 'Gráfico ascendente de ingresos y conversiones',
    recommendedFor: ['case_study', 'solution']
  },
  {
    id: 'img_ana_2',
    title: 'Dashboard de Diagnóstico y ROI',
    category: 'analytics',
    url: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=1200&auto=format&fit=crop&q=85',
    thumbnailUrl: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=300&auto=format&fit=crop&q=80',
    alt: 'Análisis de datos, embudos de venta y retorno de inversión',
    recommendedFor: ['problem', 'case_study']
  }
];

export const P12_AUTHOR_AVATAR = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80';
export const P12_CONSULTANT_AVATAR = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80';
export const P12_DYNAMIC_SLIDE_IMAGES: string[] = CURATED_DYNAMIC_IMAGES.map((img) => img.url);

/**
 * Returns a suitable dynamic image for a slide based on its type and index.
 */
export function getRecommendedSlideImage(slideType: string, index: number, topicHint?: string): string {
  const normalized = (topicHint || '').toLowerCase();
  
  if (normalized.includes('asistencia') || normalized.includes('delegar') || normalized.includes('soporte') || normalized.includes('agenda')) {
    const vaImages = CURATED_DYNAMIC_IMAGES.filter(i => i.category === 'virtual_assistant');
    return vaImages[index % vaImages.length]?.url || CURATED_DYNAMIC_IMAGES[0].url;
  }
  
  if (normalized.includes('pauta') || normalized.includes('ads') || normalized.includes('metas') || normalized.includes('anuncio') || normalized.includes('conversion') || normalized.includes('embudo')) {
    const mktImages = CURATED_DYNAMIC_IMAGES.filter(i => i.category === 'marketing' || i.category === 'analytics');
    return mktImages[index % mktImages.length]?.url || CURATED_DYNAMIC_IMAGES[0].url;
  }

  // General matching by slide type
  switch (slideType) {
    case 'cover':
      return CURATED_DYNAMIC_IMAGES[0].url; // Laptop & strategy
    case 'problem':
      return CURATED_DYNAMIC_IMAGES[5].url; // Overwhelmed / multi-tasking
    case 'solution':
      return CURATED_DYNAMIC_IMAGES[4].url; // Professional VA / clean workspace
    case 'case_study':
      return CURATED_DYNAMIC_IMAGES[11].url; // Analytics / +140% growth curve
    case 'cta':
      return CURATED_DYNAMIC_IMAGES[9].url; // Luxury obsidian & gold
    default:
      return CURATED_DYNAMIC_IMAGES[index % CURATED_DYNAMIC_IMAGES.length].url;
  }
}
