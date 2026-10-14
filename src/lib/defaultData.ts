import { WorkspaceData } from '../types';
import { initialBlogPosts } from './blogData';
import {
  initialAgencyPlans,
  initialAgencyServices,
  initialCommercialSettings,
  initialQuoteProposals,
  initialImageLibraryItems,
} from './quotesData';
import {
  initialCrmPipelines,
  initialCrmCompanies,
  initialCrmContacts,
  initialCrmDeals,
  initialCrmFollowUps,
  initialCrmActivities
} from './crmData';

export const initialWorkspaceData: WorkspaceData = {
  currentMember: {
    id: 'mem_1',
    name: 'Camila Pinto',
    email: 'camila@pixel12.agency',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    role: 'Owner',
    title: 'Directora de Estrategia & CEO',
    status: 'active',
  },
  workspaceSettings: {
    workspaceName: 'Pixel 12 Agency OS',
    agencyType: 'Agencia de Marketing Digital & Asistencia Virtual',
    timezone: 'America/Guayaquil',
    autoDeleteRejectedPosts: true,
    defaultApprovalRequired: true,
    notifyOnTaskAssignment: true,
    notifyOnApprovalNeeded: true,
    notifyOnScheduleFailure: true,
    aiCredits: 120,
  },
  activeBrandId: 'brand_pixel12',
  brands: [
    {
      id: 'brand_pixel12',
      name: 'Pixel 12',
      tagline: 'Marketing Digital, Estrategia & Asistencia Virtual de Alto Nivel',
      industry: 'Marketing Digital & Asistencia Virtual',
      category: 'Agencia de Marketing & Asistencia Virtual',
      description: 'Pixel 12 ayuda a empresas y negocios a gestionar profesionalmente su presencia digital, escalar su contenido de alta conversión y optimizar sus operaciones con asistencia virtual especializada.',
      services: [
        'Marketing digital',
        'Gestión de redes sociales',
        'Creación y gestión de contenido',
        'Estrategia digital',
        'Asistencia virtual',
        'Automatización de procesos'
      ],
      targetAudience: 'Dueños de empresas, directores de operaciones, consultores y PyMEs en crecimiento que buscan delegar con máxima rentabilidad, control y profesionalismo.',
      logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80',
      logoDarkUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80',
      logoLightUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80',
      faviconUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=64&auto=format&fit=crop&q=80',
      typography: {
        display: 'Outfit',
        body: 'Plus Jakarta Sans'
      },
      colors: {
        primary: '#D4AF37', // Dorado
        secondary: '#CBD5E1', // Plateado
        accent: '#D4AF37', // Dorado
        background: '#09090B', // Negro
        text: '#FFFFFF', // Blanco
        gold: '#D4AF37',
        silver: '#CBD5E1'
      },
      primaryColor: '#D4AF37',
      pillars: ['Marketing Digital', 'Asistencia Virtual', 'Autoridad', 'Conversión', 'Engagement'],
      voice: {
        tone: 'Profesional, Estratégico, Cercano, Inteligente, Claro, Moderno, Seguro, Persuasivo, Humano',
        personality: ['Estratégico', 'Elegante', 'Tecnológico', 'Resolutivo', 'Exclusivo'],
        powerWords: ['Sistemas', 'Estrategia', 'Conversión', 'Automatización', 'Productividad', 'Crecimiento', 'Delegar', 'Control'],
        forbiddenWords: ['Hacks milagrosos', 'Gratis sin esfuerzo', 'Spam', 'En el mundo actual'],
        emojisAllowed: true,
        preferredCTAs: [
          'Envíanos un DM para diagnosticar tu presencia digital 📩',
          'Agenda una sesión estratégica de 20 min con nuestro equipo 🚀',
          'Comenta "SISTEMAS" y te enviamos la guía de delegación por privado 💬',
          'Guarda este recurso para implementarlo con tu equipo 📌',
          'Escríbenos "ASISTENCIA" para conocer nuestros perfiles operativos ⚡'
        ],
        styleGuidelines: 'Hooks directos de alto dolor o rentabilidad en los primeros 2 segundos. Párrafos limpios y espaciados. Cierre con llamada a la acción clara y justificación de ROI.'
      },
      isDefault: true
    },
    {
      id: 'brand_soluciones_eco',
      name: 'EcoHome Sustentable',
      tagline: 'Energía limpia para hogares inteligentes.',
      industry: 'Energía Solar y Domótica',
      description: 'Instalación de paneles solares y eficiencia energética residencial.',
      services: ['Paneles solares', 'Diagnóstico energético', 'Baterías de respaldo'],
      targetAudience: 'Familias propietarias de casas interesadas en ahorro de luz y sustentabilidad.',
      colors: {
        primary: '#10b981',
        secondary: '#064e3b',
        accent: '#f59e0b',
      },
      voice: {
        tone: 'Educativo, Confiable y Práctico',
        personality: ['Sustentable', 'Técnico accesible', 'Cálido'],
        powerWords: ['Ahorro', 'Independencia energética', 'Futuro limpio'],
        forbiddenWords: ['Contaminante', 'Complicado'],
        emojisAllowed: true,
        preferredCTAs: ['Calcula tu ahorro gratis en el link', 'Escríbenos para cotizar'],
        styleGuidelines: 'Explicar términos técnicos en lenguaje cotidiano con números reales.'
      }
    },
    {
      id: 'brand_lumina',
      name: 'Lumina Tech Solutions',
      tagline: 'Infraestructura Cloud, Automatización e Inteligencia Artificial.',
      industry: 'Tecnología & Transformación Digital',
      description: 'Consultoría e implementación de arquitectura cloud empresarial, agentes de IA personalizados y modernización de sistemas legacy.',
      services: [
        'Desarrollo de Software y APIs Cloud Native',
        'Implementación de Agentes e IA Generativa',
        'Diagnósticos de Ciberseguridad y Rendimiento',
        'Modernización de Infraestructura en Google Cloud',
        'Automatización de Procesos de Negocio (RPA)'
      ],
      targetAudience: 'CTOs, Directores de Tecnología y Directores de Operaciones de empresas en crecimiento en América Latina.',
      colors: {
        primary: '#0F172A',
        secondary: '#1E293B',
        accent: '#06B6D4',
      },
      voice: {
        tone: 'Innovador, Técnico de Vanguardia, Confiable y Ejecutivo',
        personality: ['Experto', 'Metódico', 'Visionario', 'Preciso'],
        powerWords: ['Cloud Native', 'Automatización', 'Escalabilidad', 'Agentes IA', 'Rendimiento', 'Latencia'],
        forbiddenWords: ['Improvisado', 'Sin métricas', 'Inseguro'],
        emojisAllowed: true,
        preferredCTAs: [
          'Agenda una sesión de diagnóstico cloud para tu empresa 🚀',
          'Descarga el whitepaper de arquitectura de agentes de IA 📑',
          'Escríbenos para modernizar tus sistemas legacy ⚡'
        ],
        styleGuidelines: 'Aperturas concisas con impacto tecnológico. Respaldar propuestas con métricas de rendimiento y reducción de costos operativos.'
      }
    }
  ],
  members: [
    {
      id: 'mem_1',
      name: 'Camila Pinto',
      email: 'camila@pixel12.agency',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      role: 'Owner',
      title: 'Directora de Estrategia',
      status: 'active'
    },
    {
      id: 'mem_2',
      name: 'Carlos Mendoza',
      email: 'carlos@pixel12.agency',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      role: 'Admin',
      title: 'Director Creativo & Aprobador',
      status: 'active'
    },
    {
      id: 'mem_3',
      name: 'Valentina Ríos',
      email: 'valentina@pixel12.agency',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      role: 'Copywriter',
      title: 'Senior Copywriter & AI Specialist',
      status: 'active'
    },
    {
      id: 'mem_4',
      name: 'Mateo Silva',
      email: 'mateo@pixel12.agency',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      role: 'Designer',
      title: 'Lead Motion & Visual Designer',
      status: 'active'
    },
    {
      id: 'mem_5',
      name: 'Sofía Arboleda',
      email: 'sofia@pixel12.agency',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      role: 'Community Manager',
      title: 'Community Manager & Programación',
      status: 'active'
    },
    {
      id: 'mem_alejandro',
      name: 'Alejandro Morales',
      email: 'alejandro@pixel12.agency',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
      role: 'Manager',
      title: 'Head of Growth & Asistencia Virtual',
      status: 'active'
    }
  ],
  campaigns: [
    {
      id: 'camp_1',
      brandId: 'brand_pixel12',
      name: 'Campaña Captación PyMEs Septiembre 2026',
      objective: 'Generar 40 leads calificados para servicios de marketing y asistencia virtual.',
      description: 'Mix de reels educativos sobre delegación y carruseles desmitificando el costo de una agencia.',
      startDate: '2026-09-01',
      endDate: '2026-09-30',
      audience: 'PyMEs de servicios, consultores y directores de operaciones en Latam.',
      budget: 1200,
      platforms: ['instagram', 'linkedin', 'facebook'],
      status: 'ACTIVE',
      postIds: ['post_1', 'post_2', 'post_3'],
      taskIds: ['task_1', 'task_2', 'task_3', 'task_4'],
      memberIds: ['mem_1', 'mem_2', 'mem_3', 'mem_4', 'mem_5']
    },
    {
      id: 'camp_2',
      brandId: 'brand_pixel12',
      name: 'Lanzamiento Asistencia Virtual 2.0',
      objective: 'Posicionar el servicio de asistentes virtuales con IA para soporte y ventas.',
      description: 'Campañas de autoridad y casos de éxito reales.',
      startDate: '2026-09-15',
      endDate: '2026-10-15',
      audience: 'Emprendedores saturados de tareas operativas.',
      budget: 800,
      platforms: ['linkedin', 'instagram'],
      status: 'PLANNING',
      postIds: [],
      taskIds: [],
      memberIds: ['mem_1', 'mem_3']
    }
  ],
  posts: [
    {
      id: 'post_1',
      brandId: 'brand_pixel12',
      internalTitle: '5 tareas repetitivas que deberías delegar a una asistente virtual hoy',
      date: '2026-09-04',
      time: '11:00',
      platforms: ['instagram', 'linkedin', 'facebook'],
      format: 'Carousel',
      pillar: 'Educativo',
      theme: 'Delegación y Productividad con Asistencia Virtual',
      objective: 'Educar a dueños de negocio sobre el tiempo que pierden en micro-tareas administrativas.',
      hook: 'Si sigues respondiendo correos a las 11:00 PM, no tienes un negocio: tienes un empleo agotador.',
      caption: 'El error número 1 del fundador es creer que "ahorra dinero" haciendo todo por su cuenta.\n\nAquí tienes las 5 tareas operativas que una asistente virtual de Pixel 12 puede asumir desde el día uno:\n\n1️⃣ Filtrado de inbox y agendamiento de reuniones.\n2️⃣ Emisión y seguimiento de cobranzas.\n3️⃣ Atención inicial de DMs y WhatsApp comercial.\n4️⃣ Carga de datos y reportes semanales en CRM.\n5️⃣ Preparación de presentaciones y cotizaciones.\n\nDelegar no es un gasto: es la única forma de comprar tiempo para vender más.\n\n¿Cuál de estas 5 es tu mayor dolor de cabeza hoy?',
      cta: 'Comenta "DELEGAR" o escríbenos por DM y te enviamos nuestra guía de integración operativa de 48h 🚀',
      hashtags: ['#Pixel12', '#AsistenciaVirtual', '#ProductividadPyME', '#Delegar', '#EmprendimientoLatam'],
      visualText: 'Desliza para ver las 5 tareas que te están robando 15 horas a la semana 👉',
      visualDescription: 'Carrusel de 6 diapositivas estilo editorial moderno con fondo oscuro/azul petróleo, tipografía blanca bold y acentos en naranja Pixel 12.',
      imagePrompt: 'Modern minimalist carousel slide layout for digital marketing agency, slate blue background, crisp typography, professional productivity icons, high contrast.',
      imageUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&auto=format&fit=crop&q=80',
      status: 'APPROVED',
      assigneeId: 'mem_4',
      assigneeName: 'Mateo Silva',
      campaignId: 'camp_1',
      campaignName: 'Campaña Captación PyMEs Septiembre 2026',
      relatedTaskIds: ['task_1', 'task_2'],
      approvalHistory: [
        {
          id: 'appr_1',
          reviewerId: 'mem_2',
          reviewerName: 'Carlos Mendoza',
          action: 'APPROVED',
          comment: 'Excelente estructura y el hook está muy potente. Proceder a programación.',
          timestamp: '2026-09-02T14:30:00Z'
        }
      ],
      versions: [
        {
          version: 1,
          timestamp: '2026-09-01T10:00:00Z',
          authorName: 'Valentina Ríos',
          changesSummary: 'Borrador inicial generado por IA y refinado con voz de marca',
          caption: 'Versión inicial de caption...',
          hook: 'Si respondes correos tarde...',
          cta: 'Comenta DELEGAR'
        }
      ],
      platformAdapitations: {
        instagram: {
          platform: 'instagram',
          caption: 'El error número 1 del fundador es creer que "ahorra dinero" haciéndolo todo solo... Desliza 👉',
          hook: 'Si sigues respondiendo correos a las 11:00 PM, tu negocio te está absorbiendo.',
          cta: 'Comenta DELEGAR para enviarte el checklist por DM 📩',
          hashtags: ['#Pixel12', '#AsistenciaVirtual', '#PyME', '#Productividad']
        },
        linkedin: {
          platform: 'linkedin',
          caption: 'La rentabilidad de un director ejecutivo disminuye cada vez que dedica 2 horas diarias al filtrado manual de bandeja de entrada y agenda.',
          hook: 'El costo oculto de la micro-operación en empresas en crecimiento.',
          cta: '¿Cómo estructura tu equipo el soporte administrativo? Conversemos en comentarios o por mensaje directo.',
          hashtags: ['#Operaciones', '#Liderazgo', '#Productividad', '#Pixel12']
        },
        facebook: {
          platform: 'facebook',
          caption: '¿Sientes que el día no te alcanza para atender clientes y hacer crecer tu negocio? Descubre las 5 tareas clave que puedes delegar hoy mismo.',
          hook: 'Recupera hasta 15 horas a la semana con soporte virtual calificado.',
          cta: 'Envíanos un mensaje y te asesoramos paso a paso.',
          hashtags: ['#Pixel12', '#Negocios']
        },
        youtube: {
          platform: 'youtube',
          caption: '5 tareas administrativas que puedes delegar a una asistente virtual.',
          hook: 'Deja de perder tiempo en microtareas.',
          cta: 'Suscríbete al canal y descarga el recurso gratuito en la descripción.',
          hashtags: ['#Productividad', '#Pixel12']
        },
        tiktok: {
          platform: 'tiktok',
          caption: 'POV: Descubres que no necesitas contratar 3 empleados para ordenar tu negocio.',
          hook: 'POV: Trabajas 14 horas al día hasta que delegas esto.',
          cta: 'Link en bio para sesión estratégica gratis 🔥',
          hashtags: ['#trabajo', '#emprendedores', '#pixel12']
        }
      },
      createdAt: '2026-09-01T09:00:00Z',
      updatedAt: '2026-09-02T14:30:00Z'
    },
    {
      id: 'post_2',
      brandId: 'brand_pixel12',
      internalTitle: 'Reel: Por qué tus anuncios en Meta no venden (y cómo arreglarlo)',
      date: '2026-09-07',
      time: '18:30',
      platforms: ['instagram', 'facebook', 'tiktok'],
      format: 'Reel',
      pillar: 'Autoridad',
      theme: 'Optimización de Pauta en Meta Ads',
      objective: 'Demostrar autoridad en pauta digital y captar prospectos de diagnóstico estratégico gratuito.',
      hook: 'El 80% de las PyMEs apaga sus campañas en Meta diciendo que "los anuncios no sirven". Aquí el porqué real.',
      caption: 'No es el algoritmo. No es tu presupuesto de $10 al día.\n\nEs que estás cometiendo alguno de estos 3 fallos:\n\n1. Estás enviando tráfico frío directo a una página que tarda 8 segundos en cargar.\n2. Tu video empieza con el logo de tu empresa en vez de un hook de dolor.\n3. Tu oferta no es irresistible: pides matrimonio en la primera cita.\n\nEn Pixel 12 diagnosticamos campañas cada semana y el 90% se soluciona ajustando el gancho de los primeros 3 segundos y mejorando la fricción de WhatsApp.',
      cta: 'Escríbenos "DIAGNOSTICO" y revisamos tus campañas actuales sin costo ⚡',
      hashtags: ['#MetaAds', '#MarketingDigital', '#Pixel12', '#VentasOnline', '#PublicidadDigital'],
      script: '00:00-00:03: [Texto en pantalla gigante: "Tu pauta en Meta no funciona por esto"] - mirada a cámara directa.\n00:03-00:15: [B-Roll de pantalla de Administrador de Anuncios con métricas rojas]: "Apagas la campaña a los 3 días porque nadie compra..."\n00:15-00:35: [Corte rápido con texto]: "Punto 1: tu web es lenta. Punto 2: tu hook aburre. Punto 3: no tienes un CTA claro."\n00:35-00:45: [Aparece logo Pixel 12 sutil en esquina inferior]: "Comenta DIAGNOSTICO y revisamos tu embudo gratis."',
      imagePrompt: 'Professional high-contrast Reel cover frame, bold typography "POR QUÉ TU PUBLICIDAD NO VENDE", dark navy theme with orange neon accent, clean lighting.',
      imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80',
      status: 'IN_REVIEW',
      assigneeId: 'mem_3',
      assigneeName: 'Valentina Ríos',
      campaignId: 'camp_1',
      campaignName: 'Campaña Captación PyMEs Septiembre 2026',
      relatedTaskIds: ['task_3'],
      approvalHistory: [
        {
          id: 'appr_2',
          reviewerId: 'mem_3',
          reviewerName: 'Valentina Ríos',
          action: 'SUBMITTED',
          comment: 'Guion y caption terminados. Listo para revisión de Carlos.',
          timestamp: '2026-09-03T09:15:00Z'
        }
      ],
      versions: [],
      createdAt: '2026-09-02T11:00:00Z',
      updatedAt: '2026-09-03T09:15:00Z'
    },
    {
      id: 'post_3',
      brandId: 'brand_pixel12',
      internalTitle: 'Post Estático: Caso de Éxito Clínica Dental +140% Citas',
      date: '2026-09-10',
      time: '15:00',
      platforms: ['instagram', 'linkedin'],
      format: 'Static Post',
      pillar: 'Venta',
      theme: 'Casos de éxito y testimonios Pixel 12',
      objective: 'Prueba social tangible y conversión directa.',
      hook: 'De 12 citas al mes a tener la agenda llena con 3 semanas de anticipación.',
      caption: 'Cuando el Dr. Sánchez llegó a Pixel 12, dependía 100% de recomendaciones boca a boca.\n\nImplementamos un sistema de 3 partes:\n1. Contenido en Reels desmitificando tratamientos de ortodoncia invisible.\n2. Campañas geolocalizadas a 5 km de la clínica.\n3. Asistente virtual en WhatsApp respondiendo en menos de 90 segundos.\n\nResultado en 60 días: +140% citas agendadas y tasa de asistencia del 92%.\n\nEl marketing digital no tiene que ser complejo: tiene que estar integrado.',
      cta: '¿Quieres replicar este sistema en tu negocio de servicios? Agenda una llamada en el link de la bio 📈',
      hashtags: ['#CasoDeExito', '#Pixel12', '#CrecimientoEmpresarial', '#MarketingDeServicios'],
      visualText: '+140% Citas en 60 Días · Sistema Pixel 12',
      visualDescription: 'Gráfico limpio de crecimiento con tarjeta de testimonio verificada, estilo Linear/Notion minimalista con acento azul.',
      imageUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&auto=format&fit=crop&q=80',
      status: 'DRAFT',
      assigneeId: 'mem_4',
      assigneeName: 'Mateo Silva',
      campaignId: 'camp_1',
      campaignName: 'Campaña Captación PyMEs Septiembre 2026',
      relatedTaskIds: ['task_4'],
      approvalHistory: [],
      versions: [],
      createdAt: '2026-09-02T16:00:00Z',
      updatedAt: '2026-09-02T16:00:00Z'
    },
    {
      id: 'post_4',
      brandId: 'brand_pixel12',
      internalTitle: 'Carrusel: El mapa del embudo de ventas que toda PyME necesita en 2026',
      date: '2026-09-15',
      time: '10:00',
      platforms: ['instagram', 'linkedin', 'facebook'],
      format: 'Carousel',
      pillar: 'Educativo',
      theme: 'Embudo de Ventas Digital',
      objective: 'Generar guardados y compartidos masivos educando sobre el embudo.',
      hook: 'Deja de publicar al azar esperando que caigan ventas mágicas.',
      caption: 'Tener redes sociales sin un embudo es como abrir una tienda en el desierto.\n\nEste es el mapa exacto de 4 etapas que usamos en Pixel 12 para nuestros clientes:\n\n1. ATRACCIÓN: Reels y TikToks de dolor/gancho.\n2. NUTRICIÓN: Carruseles educativos y newsletters.\n3. CONVERSIÓN: Ofertas directas a WhatsApp / llamadas.\n4. RETENCIÓN: Seguimiento automatizado y soporte impecable.\n\nGuarda este carrusel para consultarlo cada vez que planifiques tu mes.',
      cta: 'Guarda este post y compártelo con tu socio 📌',
      hashtags: ['#EmbudoDeVentas', '#Pixel12', '#EstrategiaDigital'],
      imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80',
      status: 'SCHEDULED',
      assigneeId: 'mem_5',
      assigneeName: 'Sofía Arboleda',
      relatedTaskIds: [],
      approvalHistory: [
        {
          id: 'appr_4',
          reviewerId: 'mem_2',
          reviewerName: 'Carlos Mendoza',
          action: 'APPROVED',
          comment: 'Listo y programado en el scheduler de Pixel 12.',
          timestamp: '2026-09-01T17:00:00Z'
        }
      ],
      versions: [],
      createdAt: '2026-09-01T12:00:00Z',
      updatedAt: '2026-09-01T17:00:00Z'
    },
    {
      id: 'post_matrix_1',
      brandId: 'brand_pixel12',
      internalTitle: 'Carrusel: 4 Pasos para automatizar la captación de leads en WhatsApp sin perder el toque humano',
      date: '2026-09-08',
      time: '10:30',
      platforms: ['instagram', 'linkedin'],
      format: 'Carousel',
      pillar: 'Marketing Digital',
      theme: 'Sistemas de Conversión & Automatización',
      objective: 'Educar a dueños de negocio sobre cómo combinar pauta digital, bots inteligentes y atención humana.',
      hook: 'El 73% de los prospectos en WhatsApp compran al negocio que responde en menos de 5 minutos.',
      caption: 'Responder tarde a un prospecto calificado es literalmente regalarle dinero a tu competencia.\n\nEn Pixel 12 implementamos una arquitectura en 4 capas para nuestros clientes:\n\n1️⃣ Cualificación instantánea con disparadores inteligentes.\n2️⃣ Derivación prioritaria por valor estimado de cliente.\n3️⃣ Integración nativa con CRM y Google Sheets.\n4️⃣ Asistente virtual humana que cierra la llamada o venta.\n\nAutomatizar no significa sonar como un robot: significa garantizar velocidad y experiencia prémium.',
      cta: 'Comenta "SISTEMA" y te enviamos el diagrama del embudo por mensaje directo 🚀',
      hashtags: ['#Pixel12', '#MarketingDigital', '#Automatizacion', '#GrowthHacking', '#VentasB2B'],
      visualDescription: 'Carrusel prémium estilo Pixel 12 (fondo negro obsidiana, acentos dorados y plateados, tipografía bold)',
      status: 'DRAFT',
      sourceFromMatrix: true,
      hasGeneratedDesign: false,
      assigneeId: 'mem_alejandro',
      assigneeName: 'Alejandro Morales',
      approvalHistory: [],
      versions: [],
      relatedTaskIds: [],
      createdAt: '2026-09-03T10:00:00Z',
      updatedAt: '2026-09-03T10:00:00Z'
    },
    {
      id: 'post_matrix_2',
      brandId: 'brand_pixel12',
      internalTitle: 'Post Estático: Caso de Éxito Consultora B2B +$28,000 con Asistencia Virtual Especializada',
      date: '2026-09-18',
      time: '17:00',
      platforms: ['linkedin', 'instagram'],
      format: 'Static Post',
      pillar: 'Autoridad',
      theme: 'Caso de Éxito Pixel 12 Asistencia',
      objective: 'Demostrar el impacto medible en facturación y ahorro de horas al integrar una asistente virtual de Pixel 12.',
      hook: 'El fundador trabajaba 14 horas al día. Le asignamos una Asistente Virtual Pixel 12 y esto pasó en 60 días.',
      caption: 'El mayor freno de crecimiento en empresas de servicios no es la falta de ventas: es el cuello de botella operativo del fundador.\n\nCaso Real con cliente B2B:\n• Tareas delegadas: Gestión de agenda, follow-ups de propuestas, emisión de facturas y soporte VIP.\n• Horas liberadas al fundador: 18 horas semanales.\n• Impacto en ventas: +$28,000 en nuevos contratos cerrados gracias al tiempo enfocado en prospección.\n\nDelegar no es un gasto: es el multiplicador más rentable de tu negocio.',
      cta: 'Agenda una llamada de evaluación de 15 minutos en el enlace de la bio ⚡',
      hashtags: ['#Pixel12', '#AsistenciaVirtual', '#Productividad', '#EscalarNegocio', '#CasosDeExito'],
      visualDescription: 'Gráfico ejecutivo de alta gama con contrastes en negro y dorado',
      status: 'DRAFT',
      sourceFromMatrix: true,
      hasGeneratedDesign: false,
      assigneeId: 'mem_alejandro',
      assigneeName: 'Alejandro Morales',
      approvalHistory: [],
      versions: [],
      relatedTaskIds: [],
      createdAt: '2026-09-03T11:00:00Z',
      updatedAt: '2026-09-03T11:00:00Z'
    }
  ],
  tasks: [
    {
      id: 'task_1',
      brandId: 'brand_pixel12',
      title: 'Diseñar carrusel 6 slides: 5 tareas para delegar',
      description: 'Crear el diseño visual para el post del 4 de septiembre. Respetar paleta azul y naranja, contraste alto y legibilidad en mobile.',
      assigneeId: 'mem_4',
      assigneeName: 'Mateo Silva',
      creatorId: 'mem_1',
      creatorName: 'Camila Pinto',
      priority: 'HIGH',
      startDate: '2026-09-02',
      deadlineDate: '2026-09-03',
      deadlineTime: '14:00',
      status: 'COMPLETED',
      progress: 100,
      tags: ['Diseño', 'Carrusel', 'Instagram', 'Prioridad Alta'],
      checklist: [
        { id: 'chk_1', text: 'Portada con gancho grande', completed: true },
        { id: 'chk_2', text: '5 slides de contenido con iconos', completed: true },
        { id: 'chk_3', text: 'Slide final con CTA de Pixel 12', completed: true },
        { id: 'chk_4', text: 'Exportar en 1080x1350 PNG', completed: true }
      ],
      comments: [
        {
          id: 'com_1',
          authorId: 'mem_4',
          authorName: 'Mateo Silva',
          text: 'Archivos PNG listos y subidos en la publicación.',
          timestamp: '2026-09-03T11:00:00Z'
        }
      ],
      relatedPostId: 'post_1',
      relatedPostTitle: '5 tareas repetitivas que deberías delegar a una asistente virtual hoy',
      relatedCampaignId: 'camp_1',
      relatedCampaignName: 'Campaña Captación PyMEs Septiembre 2026',
      history: [
        { id: 'h_1', authorName: 'Camila Pinto', action: 'Tarea creada', timestamp: '2026-09-02T10:00:00Z' },
        { id: 'h_2', authorName: 'Mateo Silva', action: 'Estado cambiado a COMPLETED', timestamp: '2026-09-03T11:05:00Z' }
      ],
      createdAt: '2026-09-02T10:00:00Z'
    },
    {
      id: 'task_2',
      brandId: 'brand_pixel12',
      title: 'Programar post carrusel en Meta Suite y LinkedIn',
      description: 'Programar la publicación post_1 para el 4 de septiembre a las 11:00 am hora Ecuador (America/Guayaquil).',
      assigneeId: 'mem_5',
      assigneeName: 'Sofía Arboleda',
      creatorId: 'mem_2',
      creatorName: 'Carlos Mendoza',
      priority: 'HIGH',
      startDate: '2026-09-03',
      deadlineDate: '2026-09-04',
      deadlineTime: '09:00',
      status: 'IN_PROGRESS',
      progress: 50,
      tags: ['Estrategia', 'Community Manager', 'Marketing'],
      checklist: [
        { id: 'chk_21', text: 'Revisar hashtags adaptados para LinkedIn', completed: true },
        { id: 'chk_22', text: 'Confirmar hora 11:00 AM America/Guayaquil', completed: false }
      ],
      comments: [],
      relatedPostId: 'post_1',
      relatedPostTitle: '5 tareas repetitivas que deberías delegar a una asistente virtual hoy',
      relatedCampaignId: 'camp_1',
      relatedCampaignName: 'Campaña Captación PyMEs Septiembre 2026',
      history: [
        { id: 'h_21', authorName: 'Carlos Mendoza', action: 'Tarea creada', timestamp: '2026-09-02T15:00:00Z' }
      ],
      createdAt: '2026-09-02T15:00:00Z'
    },
    {
      id: 'task_3',
      brandId: 'brand_pixel12',
      title: 'Edición y subtitulado dinámico de Reel Meta Ads',
      description: 'Montar el guion de Valentina, agregar subtítulos estilo Alex Hormozi y efectos de sonido en puntos clave.',
      assigneeId: 'mem_4',
      assigneeName: 'Mateo Silva',
      creatorId: 'mem_3',
      creatorName: 'Valentina Ríos',
      priority: 'HIGH',
      startDate: '2026-09-03',
      deadlineDate: '2026-09-05',
      deadlineTime: '17:00',
      status: 'TODO',
      progress: 0,
      tags: ['Audiovisual', 'Video', 'Urgente'],
      checklist: [
        { id: 'chk_31', text: 'Subtítulos amarillos/blancos con resaltado', completed: false },
        { id: 'chk_32', text: 'B-roll en segundos 3 a 15', completed: false },
        { id: 'chk_33', text: 'Audio limpio y música de fondo sutil', completed: false }
      ],
      comments: [],
      relatedPostId: 'post_2',
      relatedPostTitle: 'Reel: Por qué tus anuncios en Meta no venden (y cómo arreglarlo)',
      relatedCampaignId: 'camp_1',
      relatedCampaignName: 'Campaña Captación PyMEs Septiembre 2026',
      history: [],
      createdAt: '2026-09-03T09:30:00Z'
    },
    {
      id: 'task_4',
      brandId: 'brand_pixel12',
      title: 'Diseñar gráfica de testimonio Dr. Sánchez',
      description: 'Preparar arte para el post estático con métricas verificadas de +140% citas.',
      assigneeId: 'mem_4',
      assigneeName: 'Mateo Silva',
      creatorId: 'mem_1',
      creatorName: 'Camila Pinto',
      priority: 'MEDIUM',
      startDate: '2026-09-05',
      deadlineDate: '2026-09-08',
      deadlineTime: '12:00',
      status: 'TODO',
      progress: 25,
      tags: ['Diseño', 'Marketing', 'Revisión Cliente'],
      checklist: [],
      comments: [],
      relatedPostId: 'post_3',
      relatedPostTitle: 'Post Estático: Caso de Éxito Clínica Dental +140% Citas',
      relatedCampaignId: 'camp_1',
      relatedCampaignName: 'Campaña Captación PyMEs Septiembre 2026',
      history: [],
      createdAt: '2026-09-02T16:10:00Z'
    },
    {
      id: 'task_5',
      brandId: 'brand_pixel12',
      title: 'Estrategia de contenidos y pilares de captación Q4',
      description: 'Definir pilares estratégicos de atracción, nutrición y conversión para la marca.',
      assigneeId: 'mem_1',
      assigneeName: 'Camila Pinto',
      creatorId: 'mem_1',
      creatorName: 'Camila Pinto',
      priority: 'HIGH',
      startDate: '2026-09-04',
      deadlineDate: '2026-09-12',
      deadlineTime: '18:00',
      status: 'IN_PROGRESS',
      progress: 65,
      tags: ['Estrategia', 'Marketing', 'Sprint Activo'],
      checklist: [
        { id: 'chk_51', text: 'Benchmark de competidores directos', completed: true },
        { id: 'chk_52', text: 'Definición de 4 ejes temáticos', completed: true },
        { id: 'chk_53', text: 'Presentación ejecutiva de estrategia', completed: false }
      ],
      comments: [],
      history: [],
      createdAt: '2026-09-04T10:00:00Z'
    }
  ],
  socialAccounts: [
    {
      id: 'soc_ig',
      platform: 'instagram',
      accountName: 'Pixel 12 Agencia Digital',
      handle: '@pixel12agency',
      profilePic: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
      isConnected: false,
      requiresConfig: true,
      requiredCredentials: ['Meta App ID', 'Meta App Secret', 'Instagram Graph API Access Token'],
      missingCredentialsReason: 'API credentials required. Para conectar Instagram Business se requiere configurar el Meta App ID y generar el token con permisos instagram_basic y instagram_content_publish.'
    },
    {
      id: 'soc_fb',
      platform: 'facebook',
      accountName: 'Pixel 12 Marketing Digital',
      handle: 'pixel12agency',
      profilePic: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
      isConnected: false,
      requiresConfig: true,
      requiredCredentials: ['Meta Page ID', 'Page Access Token (pages_manage_posts)'],
      missingCredentialsReason: 'Connect your account. Se requiere Page Access Token de Meta for Developers para publicar directamente en la Fanpage.'
    },
    {
      id: 'soc_li',
      platform: 'linkedin',
      accountName: 'Pixel 12 Agency',
      handle: 'company/pixel12',
      profilePic: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
      isConnected: false,
      requiresConfig: true,
      requiredCredentials: ['LinkedIn Client ID', 'Client Secret', 'Organization URN ID', 'w_member_social scope'],
      missingCredentialsReason: 'OAuth 2.0 requerido. Configura tus claves en LinkedIn Developer Portal para habilitar publicación en la página de empresa.'
    },
    {
      id: 'soc_yt',
      platform: 'youtube',
      accountName: 'Pixel 12 Studio',
      handle: '@pixel12studio',
      profilePic: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
      isConnected: false,
      requiresConfig: true,
      requiredCredentials: ['Google Cloud Client ID', 'Client Secret', 'youtube.upload OAuth Scope'],
      missingCredentialsReason: 'Integration not configured. Conecta tu proyecto de Google Cloud con la YouTube Data API v3 habilitada.'
    },
    {
      id: 'soc_tt',
      platform: 'tiktok',
      accountName: 'Pixel 12 OS',
      handle: '@pixel12os',
      profilePic: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
      isConnected: false,
      requiresConfig: true,
      requiredCredentials: ['TikTok Open Platform Client Key', 'Client Secret', 'video.publish scope'],
      missingCredentialsReason: 'Credenciales pendientes. Registra tu aplicación en TikTok for Developers para subir videos automáticamente.'
    }
  ],
  googleAds: {
    isConnected: false,
    currency: 'USD',
    statusMessage: 'Integration not configured. Para conectar Google Ads en producción ingresa tu Developer Token, OAuth Client Secret y Customer ID (10 dígitos). El sistema ya cuenta con la arquitectura de reporte y sincronización.',
    campaigns: [
      {
        id: 'gads_1',
        name: 'Search - Asistencia Virtual PyMEs Latam',
        status: 'PAUSED',
        budgetDaily: 25,
        impressions: 4200,
        clicks: 310,
        cpc: 0.82,
        conversions: 24,
        cost: 254.20
      },
      {
        id: 'gads_2',
        name: 'Performance Max - Agencia Marketing Digital',
        status: 'PAUSED',
        budgetDaily: 35,
        impressions: 12500,
        clicks: 580,
        cpc: 0.65,
        conversions: 41,
        cost: 377.00
      }
    ]
  },
  notifications: [
    {
      id: 'notif_1',
      title: 'Publicación en revisión',
      message: 'Valentina envió a revisión: "Reel: Por qué tus anuncios en Meta no venden"',
      type: 'approval',
      read: false,
      timestamp: '2026-09-03T09:15:00Z',
      linkView: 'approvals'
    },
    {
      id: 'notif_2',
      title: 'Tarea completada',
      message: 'Mateo completó "Diseñar carrusel 6 slides: 5 tareas para delegar"',
      type: 'task',
      read: false,
      timestamp: '2026-09-03T11:05:00Z',
      linkView: 'tasks'
    },
    {
      id: 'notif_3',
      title: 'Publicación Aprobada',
      message: 'Carlos aprobó el carrusel para el 4 de septiembre.',
      type: 'post',
      read: true,
      timestamp: '2026-09-02T14:30:00Z',
      linkView: 'calendar'
    }
  ],
  auditLogs: [
    {
      id: 'log_1',
      actorName: 'Camila Pinto',
      action: 'Creó campaña',
      entityType: 'campaign',
      entityId: 'camp_1',
      details: 'Campaña Captación PyMEs Septiembre 2026',
      timestamp: '2026-09-01T08:30:00Z'
    },
    {
      id: 'log_2',
      actorName: 'Carlos Mendoza',
      action: 'Aprobó publicación',
      entityType: 'approval',
      entityId: 'post_1',
      details: 'Aprobado para programación el 4 de septiembre',
      timestamp: '2026-09-02T14:30:00Z'
    },
    {
      id: 'log_3',
      actorName: 'Mateo Silva',
      action: 'Completó tarea',
      entityType: 'task',
      entityId: 'task_1',
      details: 'Diseñar carrusel 6 slides',
      timestamp: '2026-09-03T11:05:00Z'
    }
  ],
  blogPosts: initialBlogPosts,
  quotes: initialQuoteProposals,
  plans: initialAgencyPlans,
  customServices: initialAgencyServices,
  commercialSettings: initialCommercialSettings,
  imageLibrary: initialImageLibraryItems,
  crmContacts: initialCrmContacts,
  crmCompanies: initialCrmCompanies,
  crmDeals: initialCrmDeals,
  crmPipelines: initialCrmPipelines,
  crmActivities: initialCrmActivities,
  crmFollowUps: initialCrmFollowUps,
};
