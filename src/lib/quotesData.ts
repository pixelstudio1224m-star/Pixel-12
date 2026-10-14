import {
  AgencyPlan,
  AgencyCustomService,
  QuoteProposal,
  QuoteItem,
  RoadmapPhase,
  CommercialSettings,
  ImageLibraryItem,
} from '../types/quotes';

export const initialAgencyPlans: AgencyPlan[] = [
  {
    id: 'plan_social_growth',
    name: 'Plan Social Growth & Contenido',
    tagline: 'Crecimiento de comunidad y autoridad con diseño prémium de alta costura digital',
    description:
      'Gestión integral de presencia en redes sociales (Instagram, LinkedIn y Facebook) con 16 piezas de contenido mensuales, carruseles de autoridad, reels guionados y community management activo.',
    price: 650,
    currency: 'USD',
    cadence: 'Mensual',
    badge: 'MÁS POPULAR EN REDES',
    isPopular: false,
    order: 1,
    isActive: true,
    imageUrl:
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    includedServices: [
      '16 Publicaciones mensuales (Carruseles de alta conversión, Posts estáticos y Reels)',
      'Diseño visual con identidad editorial de alta gama (Paleta Negro, Oro, Plata y Blanco)',
      'Copywriting persuasivo con metodología AIDA y optimización de hashtags',
      'Community Management diario (Respuesta a comentarios y DMs en <30 min)',
      'Programación y distribución multicanal automatizada',
      'Reporte mensual de métricas de alcance, interacción y crecimiento orgánico',
    ],
    benefits: [
      'Posicionamiento inmediato como referente indiscutible en tu sector',
      'Recuperación de +20 horas al mes que antes perdías diseñando y publicando',
      'Consistencia visual y de mensaje sin fallar un solo día en la parrilla',
      'Atracción de prospectos calificados interesados en tus servicios de alto valor',
    ],
    features: [
      'Reunión mensual de alineación estratégica (45 min)',
      'Tablero en vivo de aprobaciones antes de publicar en redes',
      'Acceso al Brand Kit exclusivo y assets adaptados a tu audiencia',
    ],
    conditions: [
      'Compromiso mínimo sugerido de 3 meses para consolidación de algoritmo',
      'El cliente aprueba las piezas de la semana con al menos 48h de anticipación',
      'No incluye inversión directa en pauta publicitaria (Meta Ads / Ads spend)',
    ],
  },
  {
    id: 'plan_asistencia_virtual',
    name: 'Plan Asistencia Virtual Ejecutiva',
    tagline: 'Delegación operativa total para fundadores y directores de empresa',
    description:
      'Asistente virtual bilingüe dedicada y altamente capacitada para absorber tu agenda, atención a prospectos en WhatsApp/DMs, facturación, seguimiento comercial y gestión de clientes.',
    price: 850,
    currency: 'USD',
    cadence: 'Mensual',
    badge: 'ALTA EFICIENCIA',
    isPopular: false,
    order: 2,
    isActive: true,
    imageUrl:
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop&q=80',
    includedServices: [
      '80 Horas mensuales de asistencia virtual ejecutiva dedicada (Lunes a Viernes)',
      'Gestión de agenda ejecutiva, reuniones y confirmación de citas en Google Calendar/Calendly',
      'Atención y filtro de prospectos calificados en WhatsApp Business, DMs y correo corporativo',
      'Emisión de cotizaciones, seguimiento a propuestas y facturación básica',
      'Organización de archivos en Google Drive / Notion y transcripción de minutas',
      'Supervisión continua por parte del Project Manager Senior de Pixel 12',
    ],
    benefits: [
      'Recuperas entre 15 y 20 horas operativas semanales para enfocarte en ventas y visión',
      'Cero cargas patronales, contratos laborales rígidos ni costos de liquidación',
      'Atención inmediata a clientes potenciales evitando fugas de ventas por demoras',
      'Onboarding y manual de operaciones documentado y operativo en solo 48 horas',
    ],
    features: [
      'Asistente bilingüe (Español nativo / Inglés intermedio-avanzado)',
      'Control de tiempo transparente medido y verificado con software de productividad',
      'Sustitución inmediata sin costo en caso de vacaciones o contingencias',
    ],
    conditions: [
      'Horario de servicio de lunes a viernes en jornada acordada (América/Bogotá/Quito/Miami)',
      'Horas no acumulables de un mes a otro salvo acuerdo previo por proyecto extraordinario',
      'Preaviso de 15 días para cancelación o modificación del plan',
    ],
  },
  {
    id: 'plan_scale_360',
    name: 'Plan Scale 360 (Marketing + Asistencia)',
    tagline: 'La solución definitiva: agencia de marketing + equipo operativo integrado',
    description:
      'El ecosistema completo de Pixel 12: estrategia de contenidos de autoridad, pauta publicitaria en Meta Ads, y asistente virtual ejecutiva encargada de cerrar y agendar a los prospectos que llegan.',
    price: 1450,
    currency: 'USD',
    cadence: 'Mensual',
    badge: '⭐ RECOMENDADO / MÁS VENDIDO',
    isPopular: true,
    order: 3,
    isActive: true,
    imageUrl:
      'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&auto=format&fit=crop&q=80',
    includedServices: [
      '24 Piezas de contenido mensual (carruseles editoriales, reels y posts de autoridad)',
      'Setup, segmentación y optimización semanal de campañas de Meta Ads (Facebook e Instagram)',
      '100 Horas mensuales de Asistente Virtual dedicada para atención comercial y operaciones',
      'Embudo de conversión con respuestas automatizadas en ManyChat / WhatsApp API',
      'Diseño de landing page o lead magnet de captura de prospectos',
      'Dashboard ejecutivo en tiempo real con KPIs de retorno de inversión (ROAS y CAC)',
    ],
    benefits: [
      'Generación predecible de llamadas comerciales con prospectos calificados listos para comprar',
      'Tu asistente virtual filtra y atiende al lead en los primeros 5 minutos del contacto',
      'Ahorro del 65% frente a contratar una agencia tradicional y personal interno por separado',
      'Acompañamiento directo con un Director de Crecimiento de Pixel 12',
    ],
    features: [
      '2 Sesiones mensuales de estrategia y optimización comercial (1 hora c/u)',
      'Canal privado de Slack / WhatsApp VIP con respuesta prioritaria en menos de 15 min',
      'Copywriting de venta directa y scripts telefónicos para tu equipo',
    ],
    conditions: [
      'Presupuesto de publicidad (Ad spend) corre por cuenta del cliente (mínimo recomendado $300/mes)',
      'Facturación mensual prepagada al inicio de cada ciclo operativo',
      'Acuerdo de confidencialidad y propiedad total de los activos digitales para el cliente',
    ],
  },
  {
    id: 'plan_branding_premium',
    name: 'Plan Branding & Identidad Visual Premium',
    tagline: 'Construcción de marca de lujo con acabado editorial y manual de identidad',
    description:
      'Desarrollo completo de la identidad corporativa y visual de tu marca: desde logotipo, paleta cromática de alta gama, tipografías y templates para redes hasta papelería y deck comercial.',
    price: 1200,
    currency: 'USD',
    cadence: 'Pago único',
    badge: 'PAGO ÚNICO',
    isPopular: false,
    order: 4,
    isActive: true,
    imageUrl:
      'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80',
    includedServices: [
      'Manual de Marca Completo (Brand Guidelines) de más de 35 páginas',
      'Logotipo principal, versiones secundarias, isotipo y monograma vectorial',
      'Paleta de color corporativa y código tipográfico con jerarquías claras',
      'Pack de 12 plantillas editables en Canva / Figma para publicaciones y carruseles',
      'Diseño de presentación comercial institucional (Pitch Deck) de 10 diapositivas',
      'Firma de correo corporativa y cabeceras para LinkedIn, Facebook y YouTube',
    ],
    benefits: [
      'Transforma la percepción de tu negocio en una marca de autoridad y lujo que cobra más caro',
      'Elimina para siempre la improvisación visual de tu equipo de ventas',
      'Archivos vectoriales maestros listos para impresión en gran formato y medios digitales',
    ],
    features: [
      'Entrega de activos en formatos SVG, PNG transparente, AI, EPS y PDF alta resolución',
      'Hasta 3 rondas de ajustes finos basadas en tus requerimientos y feedback',
      'Sesión de entrega y capacitación sobre el uso del manual de marca',
    ],
    conditions: [
      'Tiempo estimado de ejecución: 15 a 21 días hábiles desde el onboarding',
      'Forma de pago: 50% anticipo al iniciar y 50% contra entrega final de los archivos fuente',
    ],
  },
  {
    id: 'plan_pauta_ads',
    name: 'Plan Pauta Digital & Captación de Leads',
    tagline: 'Campañas de Meta Ads y Google Search orientadas a conversión directa',
    description:
      'Diseño, copywriting y optimización científica de pauta digital para generar flujo constante de prospectos interesados a tu WhatsApp, llamada de ventas o página web.',
    price: 500,
    currency: 'USD',
    cadence: 'Mensual',
    badge: 'ALTO ROAS',
    isPopular: false,
    order: 5,
    isActive: true,
    imageUrl:
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80',
    includedServices: [
      'Creación y configuración del Píxel de Meta, API de Conversiones y Google Tag Manager',
      'Diseño de 6 creativos publicitarios mensuales (imágenes estáticas y videos cortos)',
      'Redacción de copies persuasivos con pruebas A/B de ganchos y ángulos de dolor',
      'Monitoreo y optimización diaria de presupuesto, pujas y segmentaciones de audiencia',
      'Reporte quincenal con métricas transparentes de costo por lead (CPL) y retorno',
    ],
    benefits: [
      'Multiplica las oportunidades de venta sin depender del alcance orgánico',
      'Optimización continua del costo por adquisición de cada cliente potencial',
      'Cero desperdicio de presupuesto gracias a exclusiones de audiencias negativas',
    ],
    features: [
      'Acceso como socio en Business Manager de Meta garantizando la propiedad de tu cuenta',
      'Estrategia de retargeting a personas que visitaron tu perfil o página web',
    ],
    conditions: [
      'Inversión publicitaria sugerida: desde $300 USD al mes pagados directamente a Meta/Google',
      'Honorarios de gestión mensual de Pixel 12: $500 USD facturados mensualmente',
    ],
  },
];

export const initialAgencyServices: AgencyCustomService[] = [
  {
    id: 'srv_reels_pack',
    name: 'Pack Adicional de 8 Reels / TikToks Editados',
    description:
      'Edición dinámica con cortes rápidos, subtítulos animados prémium, efectos de sonido y b-roll cinematográfico a partir de videos crudos del cliente.',
    category: 'Contenido & Copywriting',
    defaultPrice: 380,
    unit: '/pack',
    deliverables: ['8 Reels en formato 9:16', 'Subtítulos animados', 'Exportación 4K/1080p'],
    isActive: true,
  },
  {
    id: 'srv_community_manager',
    name: 'Community Management Extendido (Fines de semana y festivos)',
    description:
      'Cobertura 7 días a la semana de interacciones, comentarios en anuncios y mensajes directos para no dejar prospectos desatendidos.',
    category: 'Marketing Digital',
    defaultPrice: 250,
    unit: '/mes',
    deliverables: ['Respuesta en <15 min', 'Derivación a WhatsApp', 'Filtro de spam'],
    isActive: true,
  },
  {
    id: 'srv_whatsapp_automation',
    name: 'Automatización y Chatbot en WhatsApp Business API / ManyChat',
    description:
      'Flujo automatizado de bienvenida, calificación de prospectos, envío de catálogo y derivación con la asistente virtual.',
    category: 'Asistencia Virtual',
    defaultPrice: 350,
    unit: 'pago único',
    deliverables: ['Setup de cuenta oficial', 'Árbol de decisiones', 'Integración CRM'],
    isActive: true,
  },
  {
    id: 'srv_landing_page',
    name: 'Diseño y Desarrollo de Landing Page de Conversión',
    description:
      'Página de aterrizaje optimizada para captura de leads o venta de servicios con alta velocidad de carga y diseño Negro/Oro prémium.',
    category: 'Diseño & Branding',
    defaultPrice: 450,
    unit: 'pago único',
    deliverables: ['Diseño responsive', 'Formulario conectado a CRM/Email', 'Setup de hosting/dominio'],
    isActive: true,
  },
  {
    id: 'srv_extra_hours_va',
    name: 'Bolsa Extra de 20 Horas de Asistencia Virtual',
    description:
      'Horas adicionales para contingencias operativas, campañas especiales o picos de trabajo.',
    category: 'Asistencia Virtual',
    defaultPrice: 220,
    unit: '/pack 20h',
    deliverables: ['Reporte de tareas', 'Disponibilidad inmediata', 'Diagnóstico PM'],
    isActive: true,
  },
  {
    id: 'srv_seo_blog',
    name: 'Redacción de 4 Artículos de Blog SEO Long-Form',
    description:
      'Artículos de +1,200 palabras optimizados para palabras clave de alta intención de compra, con schema JSON-LD y tabla de contenidos.',
    category: 'Contenido & Copywriting',
    defaultPrice: 280,
    unit: '/mes',
    deliverables: ['Investigación de palabras clave', 'Metadatos listos', 'Redacción en Markdown/HTML'],
    isActive: true,
  },
];

export const initialCommercialSettings: CommercialSettings = {
  defaultCurrency: 'USD',
  taxEnabled: true,
  defaultTaxPercentage: 15, // standard IVA in LATAM/Ecuador/etc or configurable
  defaultValidityDays: 15,
  defaultPaymentMethod: 'Transferencia Bancaria Internacional / Stripe / Tarjeta',
  defaultPaymentTerms: '50% de anticipo para inicio de actividades y 50% a los 30 días / Renovación mensual recurrente',
  agencyInfo: {
    name: 'Pixel 12 Agency OS',
    tagline: 'Agencia de Marketing Digital, Estrategia de Contenidos & Asistencia Virtual Ejecutiva',
    email: 'contacto@pixel12.agency',
    phone: '+593 99 876 5432',
    website: 'https://pixel12.agency',
    address: 'Edificio Metropolitan Business Center, Piso 9, Quito - Ecuador / Miami, FL',
    logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80',
  },
  bankDetails: {
    bankName: 'Banco Pichincha / Chase Bank USA',
    accountNumber: '21008945612 / Routing 021000021',
    accountType: 'Cuenta Corriente Empresarial',
    beneficiaryName: 'PIXEL 12 DIGITAL SOLUTIONS S.A.S.',
    taxId: 'RUC: 1792948271001',
    email: 'pagos@pixel12.agency',
    stripeOrLink: 'https://buy.stripe.com/pixel12_agency_checkout',
  },
  defaultTerms: [
    'Esta propuesta tiene una vigencia de 15 días calendario a partir de su fecha de emisión.',
    'Los precios se encuentran expresados en dólares americanos (USD).',
    'El inicio de los servicios se activa formalmente dentro de las 48 horas posteriores a la confirmación del pago de anticipo.',
    'La inversión en pauta publicitaria (Meta Ads / Google Ads) se liquida directamente con la tarjeta corporativa del cliente.',
    'Toda la propiedad intelectual de diseños, manuales y copys generados pertenecerá 100% al cliente una vez cancelado el servicio.',
    'Pixel 12 garantiza estrictos acuerdos de confidencialidad (NDA) para toda la información compartida durante la ejecución.',
  ],
};

export function formatBankDetails(bank: any): string {
  if (!bank) return '';
  if (typeof bank === 'string') return bank;
  if (typeof bank === 'object') {
    const parts: string[] = [];
    if (bank.bankName) parts.push(`Banco: ${bank.bankName}`);
    if (bank.accountType) parts.push(`Tipo de Cuenta: ${bank.accountType}`);
    if (bank.accountNumber) parts.push(`N° de Cuenta: ${bank.accountNumber}`);
    if (bank.beneficiaryName) parts.push(`Beneficiario: ${bank.beneficiaryName}`);
    if (bank.taxId) parts.push(`Identificación / RUC: ${bank.taxId}`);
    if (bank.email) parts.push(`Email de Confirmación: ${bank.email}`);
    if (bank.stripeOrLink) parts.push(`Link de Pago Online: ${bank.stripeOrLink}`);

    if (parts.length > 0) {
      return parts.join('\n');
    }
    return Object.entries(bank)
      .map(([k, v]) => `${k}: ${v}`)
      .join('\n');
  }
  return String(bank);
}

export function formatTerms(terms: any): string {
  if (!terms) return '';
  if (typeof terms === 'string') return terms;
  if (Array.isArray(terms)) {
    return terms
      .map((t) => (typeof t === 'string' ? `• ${t}` : JSON.stringify(t)))
      .join('\n');
  }
  if (typeof terms === 'object') {
    return Object.values(terms)
      .filter((v) => typeof v === 'string' || typeof v === 'number')
      .join('\n');
  }
  return String(terms);
}

export function normalizeQuote(q: any): QuoteProposal {
  if (!q) return q;

  const items: QuoteItem[] = Array.isArray(q.items) && q.items.length > 0
    ? q.items.map((it: any, idx: number) => ({
        id: it.id || `item_${idx}`,
        type: it.type || 'SERVICE',
        name: it.name || it.title || 'Servicio Estratégico',
        description: it.description || '',
        quantity: Number(it.quantity) || 1,
        unitPrice: Number(it.unitPrice) || 0,
        total: Number(it.total ?? it.totalPrice ?? ((Number(it.quantity) || 1) * (Number(it.unitPrice) || 0))) || 0,
        deliverables: Array.isArray(it.deliverables) ? it.deliverables : []
      }))
    : Array.isArray(q.commercial?.items)
    ? q.commercial.items.map((it: any, idx: number) => ({
        id: it.id || `item_${idx}`,
        type: (it.type?.toUpperCase() === 'PLAN' ? 'PLAN' : 'SERVICE'),
        name: it.title || it.name || 'Servicio Estratégico',
        description: it.description || '',
        quantity: Number(it.quantity) || 1,
        unitPrice: Number(it.unitPrice) || 0,
        total: Number(it.totalPrice ?? it.total ?? ((Number(it.quantity) || 1) * (Number(it.unitPrice) || 0))) || 0,
        deliverables: Array.isArray(it.deliverables) ? it.deliverables : []
      }))
    : [];

  const subtotal = Number(q.subtotal ?? q.commercial?.subtotal ?? items.reduce((s, it) => s + (Number(it?.total) || 0), 0)) || 0;
  const discountPercent = Number(q.discountPercent ?? (q.commercial?.discountType === 'percentage' ? q.commercial?.discountValue : 0)) || 0;
  const discountAmount = Number(q.discountAmount ?? q.commercial?.discountAmount ?? ((subtotal * discountPercent) / 100)) || 0;
  const taxPercent = Number(q.taxPercent ?? q.commercial?.taxPercentage ?? 15) || 0;
  const taxableBase = Math.max(0, subtotal - discountAmount);
  const taxAmount = Number(q.taxAmount ?? q.commercial?.taxAmount ?? ((taxableBase * taxPercent) / 100)) || 0;
  const total = Number(q.total ?? q.commercial?.totalPrice ?? (taxableBase + taxAmount)) || 0;

  const roadmap: RoadmapPhase[] = Array.isArray(q.roadmap) && q.roadmap.length > 0
    ? q.roadmap
    : Array.isArray(q.aiNarrative?.roadmapPhases)
    ? q.aiNarrative.roadmapPhases.map((rp: any) => ({
        phase: rp.phase || 'Fase',
        title: rp.title || '',
        duration: rp.duration || '',
        description: rp.description || '',
        deliverables: Array.isArray(rp.deliverables) ? rp.deliverables : []
      }))
    : [];

  const rawPaymentMethods = q.paymentMethods ?? q.commercial?.paymentMethod;
  const safePaymentMethods = typeof rawPaymentMethods === 'string'
    ? rawPaymentMethods
    : formatBankDetails(rawPaymentMethods || 'Transferencia Bancaria / Tarjeta de Crédito');

  const rawTerms = q.termsAndConditions ?? q.commercial?.termsAndConditions ?? q.defaultTerms;
  const safeTermsAndConditions = typeof rawTerms === 'string'
    ? rawTerms
    : formatTerms(rawTerms || 'Validez 15 días calendario a partir de su emisión. Pagos no reembolsables una vez iniciada la fase estratégica.');

  const rawPaymentTerms = q.paymentTerms ?? q.commercial?.paymentTerms;
  const safePaymentTerms = typeof rawPaymentTerms === 'string'
    ? rawPaymentTerms
    : '50% anticipo al iniciar y 50% al corte mensual.';

  return {
    ...q,
    title: q.title || q.aiNarrative?.title || `Propuesta Comercial — ${q.client?.company || 'Cliente'}`,
    executiveSummary: q.executiveSummary || q.aiNarrative?.executiveSummary || '',
    presentationText: q.presentationText || q.aiNarrative?.agencyIntro || '',
    proposedSolution: q.proposedSolution || q.aiNarrative?.proposedSolution || '',
    clientNeeds: Array.isArray(q.clientNeeds) && q.clientNeeds.length > 0
      ? q.clientNeeds
      : (typeof q.aiNarrative?.clientDiagnosis === 'string'
          ? q.aiNarrative.clientDiagnosis.split('\n').filter(Boolean)
          : []),
    items,
    subtotal: Number(subtotal.toFixed(2)),
    discountPercent,
    discountAmount: Number(discountAmount.toFixed(2)),
    taxPercent,
    taxAmount: Number(taxAmount.toFixed(2)),
    total: Number(total.toFixed(2)),
    currency: q.currency || q.commercial?.currency || 'USD',
    issueDate: q.issueDate || q.dates?.issueDate || new Date().toISOString().split('T')[0],
    validUntil: q.validUntil || q.dates?.validUntilDate || new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
    paymentTerms: safePaymentTerms,
    paymentMethods: safePaymentMethods,
    termsAndConditions: safeTermsAndConditions,
    notes: typeof q.notes === 'string' ? q.notes : '',
    roadmap
  };
}

const rawInitialQuoteProposals: QuoteProposal[] = [
  {
    id: 'quote_p12_001',
    folio: 'P12-COT-2026-001',
    brandId: 'brand_pixel12',
    status: 'SENT',
    client: {
      name: 'Dra. Valentina Morales',
      company: 'Clínica Dermatológica & Estética Aura',
      email: 'gerencia@auraclinic.com',
      phone: '+593 99 123 4567',
      cityCountry: 'Quito, Ecuador',
      sector: 'Salud, Estética & Dermatología Médica',
      website: 'www.auraclinic.com',
    },
    author: {
      name: 'Mateo Roldán',
      role: 'Director de Cuentas & Estrategia Comercial',
      email: 'mateo@pixel12.agency',
      phone: '+593 99 876 5432',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
    dates: {
      issueDate: '2026-09-10',
      validUntilDate: '2026-09-25',
      estimatedStartDate: '2026-09-28',
      estimatedDelivery: 'Recurrente mensual (Ciclos de 30 días)',
    },
    commercial: {
      selectedPlanIds: ['plan_scale_360'],
      items: [
        {
          id: 'item_1',
          type: 'plan',
          referenceId: 'plan_scale_360',
          title: 'Plan Scale 360 (Marketing de Autoridad + Asistencia Virtual)',
          description:
            'Ecosistema integral: 24 piezas de contenido estético editorial, pauta publicitaria en Meta Ads orientada a agendamiento de citas, y 100 horas de Asistente Virtual para atención de WhatsApp y confirmación médica.',
          quantity: 1,
          unitPrice: 1450,
          totalPrice: 1450,
          cadence: 'Mensual',
          deliverables: [
            '24 Contenidos visuales y carruseles médicos de alta autoridad',
            'Campaña de Meta Ads para captación de tratamientos estéticos de alto ticket',
            '100 Horas de Asistente Virtual dedicada en WhatsApp Business',
            'Embudo automatizado para agendamiento y confirmación de consultas',
          ],
        },
        {
          id: 'item_2',
          type: 'service',
          referenceId: 'srv_reels_pack',
          title: 'Pack Adicional de 8 Reels Educativos sobre Procedimientos',
          description:
            'Edición dinámica con subtítulos animados prémium sobre toxina botulínica, bioestimuladores y cuidado facial.',
          quantity: 1,
          unitPrice: 380,
          totalPrice: 380,
          cadence: 'Mensual',
          deliverables: ['8 Reels editados en 9:16 con gancho y llamada a la acción a la clínica'],
        },
      ],
      subtotal: 1830,
      discountType: 'fixed',
      discountValue: 130,
      discountAmount: 130,
      taxEnabled: true,
      taxPercentage: 15,
      taxAmount: 255,
      totalPrice: 1955,
      currency: 'USD',
      paymentMethod: 'Transferencia Bancaria Empresarial / Tarjeta de Crédito (Stripe)',
      paymentTerms: '50% anticipo al inicio de cada mes y 50% al día 15 del mes operativo.',
      deliveryTimeframe: 'Inicio en 48h tras anticipo. Parrilla de la primera quincena lista en 5 días.',
      observations:
        'Se asignará una Asistente Virtual con formación previa en protocolos de atención al paciente y confidencialidad médica.',
      additionalNotes:
        'La pauta publicitaria estimada sugerida para Meta Ads es de $400 USD mensuales administrados desde su propia cuenta publicitaria.',
    },
    aiNarrative: {
      title: 'Propuesta Estratégica de Crecimiento & Delegación para Clínica Aura',
      executiveSummary:
        'Clínica Aura posee una reputación médica intachable, pero su presencia digital actual y la demora de más de 4 horas en responder consultas por WhatsApp frenan la conversión de pacientes para tratamientos premium. Pixel 12 propone un sistema doble: contenido visual de lujo que eleve la percepción de valor, complementado por una asistente virtual dedicada que contacta al paciente en menos de 5 minutos y asegura la consulta médica en agenda.',
      agencyIntro:
        'Pixel 12 OS es una agencia especializada en la intersección de marketing digital de alto impacto, dirección de arte contemporánea y asistencia virtual ejecutiva. Nuestro modelo elimina la fricción entre atraer prospectos y atenderlos comercialmente, permitiendo a clínicas y empresas duplicar su captación sin sobrecargar al equipo médico.',
      clientDiagnosis:
        '1. Fuga de pacientes de alto ticket por tiempo de respuesta promedio de 4.2 horas en canales digitales.\n2. Contenido en redes intermitente que no refleja el nivel estético de las instalaciones ni la trayectoria médica.\n3. Ausencia de un embudo predecible con pauta segmentada a zonas de alto poder adquisitivo.',
      proposedSolution:
        'Implementar el Plan Scale 360: producción mensual de contenidos de autoridad médica con dirección de arte Negro/Oro/Blanco de Pixel 12, pauta segmentada en Meta Ads hacia audiencias VIP de la ciudad, y una Asistente Virtual calificada que gestionará la agenda en tiempo real y confirmará los recordatorios para reducir el ausentismo (no-show) a menos del 5%.',
      roadmapPhases: [
        {
          phase: 'Fase 1',
          title: 'Diagnóstico, Onboarding y Setup Operativo',
          duration: 'Días 1 a 4',
          description:
            'Capacitación de la asistente virtual en tratamientos y precios de la clínica. Configuración del Business Manager y accesos.',
          deliverables: ['Manual de respuestas rápidas', 'Setup de WhatsApp Business', 'Briefing visual'],
        },
        {
          phase: 'Fase 2',
          title: 'Producción de Contenido y Lanzamiento de Pauta',
          duration: 'Días 5 a 12',
          description:
            'Diseño de las primeras 12 piezas de contenido y activación de las campañas de captación en Instagram y Facebook.',
          deliverables: ['Parrilla quincenal aprobada', 'Campañas activas en Meta Ads', 'Pruebas de embudo'],
        },
        {
          phase: 'Fase 3',
          title: 'Optimización de Agendamiento y Escala',
          duration: 'Días 13 a 30',
          description:
            'Ajuste diario de pujas publicitarias y reporte continuo de pacientes agendados y confirmados.',
          deliverables: ['Dashboard de métricas en tiempo real', 'Reporte mensual ejecutivo'],
        },
      ],
      valueJustification:
        'Con solo 3 pacientes adicionales de tratamientos como toxina botulínica o armonización facial (ticket promedio $600 USD), la inversión mensual queda 100% amortizada y genera retorno neto para la clínica desde el primer mes.',
      deliverablesList: [
        '24 Publicaciones de autor con diseño editorial y copywriting médico',
        '8 Reels editados con b-roll cinematográfico y subtítulos dinámicos',
        '100 Horas de Asistencia Virtual dedicada para WhatsApp y agenda',
        'Setup y gestión de campañas en Meta Ads con pruebas A/B continuas',
        'Reporte de pacientes captados, costo por lead y tasa de cierre',
      ],
      roiBenefits: [
        '+45% Incremento estimado en consultas agendadas en los primeros 60 días',
        'Reducción del tiempo de respuesta a prospectos de 4 horas a < 5 minutos',
        'Eliminación del 90% del trabajo administrativo para la Dra. Valentina Morales',
        'Construcción de un activo digital de marca médica reconocida y respetada',
      ],
      recommendedAddons: [
        'Automatización con ManyChat para respuesta instantánea 24/7 en Instagram DMs ($350 pago único)',
        'Redacción de 4 artículos de blog SEO para posicionar la clínica en Google ($280/mes)',
      ],
      closingCta:
        'Acepta esta propuesta haciendo clic en el botón de confirmación para programar la sesión de onboarding y comenzar este lunes con la transferencia de tareas operativas.',
      commercialNotes:
        'Cualquier requerimiento no especificado se cotizará por separado bajo tarifa preferencial de cliente Pixel 12.',
    },
    visuals: [
      {
        id: 'vis_1',
        type: 'cover',
        title: 'Portada Ejecutiva: Propuesta Aura & Pixel 12',
        subtitle: 'Diseño Obsidiana & Oro con dirección de arte estética',
        imageUrl:
          'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1000&auto=format&fit=crop&q=80',
        aspectRatio: '16:9',
        category: 'Cotizaciones',
        style: 'Pixel 12 Luxury (Negro, Oro, Plata)',
      },
      {
        id: 'vis_2',
        type: 'concept',
        title: 'Concepto Visual: Autoridad Médica & Sofisticación',
        subtitle: 'Fotografía editorial de alta gama para procedimientos estéticos',
        imageUrl:
          'https://images.unsplash.com/photo-1512290900672-1f4a9b6c167e?w=800&auto=format&fit=crop&q=80',
        aspectRatio: '1:1',
        category: 'Propuestas',
        style: 'Editorial Ejecutivo',
      },
      {
        id: 'vis_3',
        type: 'solution',
        title: 'Flujo de Asistencia Virtual & Cierre de Citas',
        subtitle: 'Conexión entre lead en redes y paciente en camilla',
        imageUrl:
          'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop&q=80',
        aspectRatio: '4:5',
        category: 'Asistencia virtual',
        style: 'Pixel 12 Gold & Black (Oficial)',
      },
    ],
    termsAndConditions: [
      'Validez de la oferta: 15 días continuos desde el 10 de Septiembre de 2026.',
      'Forma de pago: 50% anticipo al confirmar y 50% a los 15 días de operaciones.',
      'El presupuesto publicitario en Meta Ads será abonado directamente por el cliente.',
      'Los derechos patrimoniales sobre todas las piezas creadas pertenecen al cliente.',
      'Ambas partes suscriben acuerdo de confidencialidad médica y comercial.',
    ],
    createdAt: '2026-09-10T14:30:00Z',
    updatedAt: '2026-09-11T16:00:00Z',
  },
  {
    id: 'quote_p12_002',
    folio: 'P12-COT-2026-002',
    brandId: 'brand_pixel12',
    status: 'ACCEPTED',
    client: {
      name: 'Sofía Carrión & Roberto Silva',
      company: 'Sartorial Luxury Studio',
      email: 'direccion@sartorialstudio.com',
      phone: '+593 98 765 4321',
      cityCountry: 'Guayaquil / Cuenca, Ecuador',
      sector: 'Moda Sostenible, Alta Costura & Diseño Textil',
      website: 'www.sartorialstudio.com',
    },
    author: {
      name: 'Mateo Roldán',
      role: 'Director Creativo & Estrategia Pixel 12',
      email: 'mateo@pixel12.agency',
      phone: '+593 99 876 5432',
    },
    dates: {
      issueDate: '2026-09-02',
      validUntilDate: '2026-09-17',
      estimatedStartDate: '2026-09-15',
      estimatedDelivery: 'Recurrente mensual',
    },
    commercial: {
      selectedPlanIds: ['plan_social_growth', 'plan_branding_premium'],
      items: [
        {
          id: 'item_s1',
          type: 'plan',
          referenceId: 'plan_social_growth',
          title: 'Plan Social Growth & Contenido Editorial (The Mentors Style)',
          description:
            '16 Piezas mensuales con estilo editorial de alta costura, tipografías condensadas bold, fichas técnicas y moodboards fotográficos.',
          quantity: 1,
          unitPrice: 650,
          totalPrice: 650,
          cadence: 'Mensual',
        },
        {
          id: 'item_s2',
          type: 'plan',
          referenceId: 'plan_branding_premium',
          title: 'Rebranding & Manual de Identidad Visual Sartorial',
          description:
            'Manual de marca de 35 páginas, códigos tipográficos para moda, monograma y 12 plantillas maestras en Figma.',
          quantity: 1,
          unitPrice: 1200,
          totalPrice: 1200,
          cadence: 'Pago único',
        },
      ],
      subtotal: 1850,
      discountType: 'percentage',
      discountValue: 10,
      discountAmount: 185,
      taxEnabled: true,
      taxPercentage: 15,
      taxAmount: 249.75,
      totalPrice: 1914.75,
      currency: 'USD',
      paymentMethod: 'Transferencia Bancaria Internacional / Tarjeta Corporativa',
      paymentTerms: '50% anticipo al iniciar y 50% al entregar el manual de marca.',
      deliveryTimeframe: 'Fase Branding: 18 días. Redes: inicio simultáneo.',
    },
    aiNarrative: {
      title: 'Propuesta de Rebranding Editorial & Estrategia de Contenidos Sartorial Studio',
      executiveSummary:
        'Sartorial Studio diseña prendas de calidad internacional pero su identidad visual en Instagram no comunicaba exclusividad. Diseñamos un nuevo universo de marca inspirado en revistas europeas de alta costura y carruseles editoriales tipo The Mentors, con fotografía en círculo y tipografía imponente.',
      agencyIntro: 'Pixel 12 OS - Crafting luxury narratives for forward-thinking brands.',
      clientDiagnosis:
        'Precios por debajo de su verdadero valor debido a una identidad gráfica desactualizada.',
      proposedSolution:
        'Rebranding integral + parrilla mensual de 16 publicaciones con estética editorial de alta costura.',
      roadmapPhases: [
        {
          phase: 'Fase 1',
          title: 'Brand Discovery & Moodboarding',
          duration: 'Semana 1',
          description: 'Definición de arquetipo de marca, paleta y tipografías display.',
          deliverables: ['Moodboard aprobado', 'Propuestas de logo'],
        },
        {
          phase: 'Fase 2',
          title: 'Manual de Marca & Templates',
          duration: 'Semana 2 y 3',
          description: 'Entrega de manual y plantillas de carrusel estilo editorial.',
          deliverables: ['Manual de 35 páginas', 'Templates Figma'],
        },
      ],
      valueJustification:
        'Elevar la percepción visual permite incrementar el precio de las colecciones entre un 30% y 50% sin resistencia del cliente.',
      deliverablesList: [
        'Manual de identidad y logotipo maestro',
        '16 Carruseles editoriales mensuales listos para publicar',
        'Copywriting en tono refinado y sofisticado',
      ],
      roiBenefits: [
        'Posicionamiento como marca de lujo y alta costura en la región',
        'Atracción de boutiques internacionales y clientes privados VIP',
      ],
      recommendedAddons: ['Sesión de fotos editorial en locación ($450)'],
      closingCta: 'Propuesta aceptada formalmente el 04 de Septiembre de 2026.',
      commercialNotes: 'Proyecto actualmente en fase de despliegue y producción.',
    },
    visuals: [
      {
        id: 'vis_sartorial_1',
        type: 'editorial',
        title: 'Lookbook Editorial Sartorial Studio',
        subtitle: 'Inspiración estilo The Mentors con tipografía bold y corte circular',
        imageUrl:
          'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=80',
        aspectRatio: '4:5',
        category: 'Branding',
        style: 'Editorial The Mentors Style',
      },
    ],
    termsAndConditions: [
      'Vigencia: aceptada y en ejecución.',
      'Pagos: anticipo cancelado el 04 de Septiembre de 2026.',
    ],
    createdAt: '2026-09-02T10:00:00Z',
    updatedAt: '2026-09-04T12:00:00Z',
  },
  {
    id: 'quote_p12_003',
    folio: 'P12-COT-2026-003',
    brandId: 'brand_pixel12',
    status: 'VIEWED',
    client: {
      name: 'Ing. Carlos Mendoza',
      company: 'Nexus Real Estate & Inversiones',
      email: 'carlos@nexusrealestate.ec',
      phone: '+593 99 999 8888',
      cityCountry: 'Quito, Ecuador',
      sector: 'Bienes Raíces & Desarrollos Inmobiliarios',
    },
    author: {
      name: 'Camila Torres',
      role: 'Operations & VA Lead Pixel 12',
      email: 'camila@pixel12.agency',
      phone: '+593 99 876 5432',
    },
    dates: {
      issueDate: '2026-09-11',
      validUntilDate: '2026-09-26',
      estimatedStartDate: '2026-10-01',
      estimatedDelivery: 'Mensual',
    },
    commercial: {
      selectedPlanIds: ['plan_asistencia_virtual'],
      items: [
        {
          id: 'item_va_1',
          type: 'plan',
          referenceId: 'plan_asistencia_virtual',
          title: 'Plan Asistencia Virtual Ejecutiva (80 Horas Mensuales)',
          description:
            'Asistente virtual dedicada para prospección y respuesta inmediata a interesados en proyectos inmobiliarios por WhatsApp y portales.',
          quantity: 1,
          unitPrice: 850,
          totalPrice: 850,
          cadence: 'Mensual',
        },
      ],
      subtotal: 850,
      discountType: 'percentage',
      discountValue: 0,
      discountAmount: 0,
      taxEnabled: true,
      taxPercentage: 15,
      taxAmount: 127.5,
      totalPrice: 977.5,
      currency: 'USD',
      paymentMethod: 'Transferencia Bancaria / Débito recurrente',
      paymentTerms: 'Mensualidad prepagada primeros 5 días de cada mes.',
      deliveryTimeframe: 'Onboarding e inicio operativo en 48 horas.',
    },
    aiNarrative: {
      title: 'Propuesta de Asistencia Virtual Operativa para Nexus Real Estate',
      executiveSummary:
        'Nexus Real Estate invierte miles de dólares en captar leads para sus proyectos residenciales, pero el 60% de los interesados se enfrían por falta de respuesta en los primeros 10 minutos. Una asistente virtual entrenada por Pixel 12 contactará y perfilará al inversionista al instante.',
      agencyIntro: 'Pixel 12 OS - Automatización, Asistencia y Marketing para bienes raíces.',
      clientDiagnosis: 'Pérdida de ventas millonarias por demora en atención de leads inmobiliarios.',
      proposedSolution: 'Asignación de asistente virtual dedicada en jornada continua de 80h/mes.',
      roadmapPhases: [
        {
          phase: 'Fase 1',
          title: 'Filtro y Scripting Inmobiliario',
          duration: '3 días',
          description: 'Carga de fichas de proyectos y precios.',
          deliverables: ['Scripts de calificación'],
        },
      ],
      valueJustification: 'Una sola venta de departamento adicional paga más de 3 años de asistencia virtual.',
      deliverablesList: ['80 Horas mensuales de atención', 'Calificación de inversionistas', 'Agendamiento de visitas'],
      roiBenefits: ['Respuesta en < 3 minutos', 'Aumento del 40% en visitas concretadas'],
      recommendedAddons: ['Automatización con WhatsApp CRM ($350)'],
      closingCta: 'Haz clic para aceptar la propuesta y coordinar el onboarding del equipo.',
      commercialNotes: 'Horario: 9am a 6pm de lunes a viernes.',
    },
    visuals: [
      {
        id: 'vis_nexus_1',
        type: 'solution',
        title: 'Asistencia Virtual Inmobiliaria',
        subtitle: 'Atención personalizada y agendamiento de visitas a proyectos',
        imageUrl:
          'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&auto=format&fit=crop&q=80',
        aspectRatio: '16:9',
        category: 'Asistencia virtual',
      },
    ],
    termsAndConditions: ['Vigencia: 15 días.', 'Facturación mensual prepagada.'],
    createdAt: '2026-09-11T11:00:00Z',
    updatedAt: '2026-09-12T15:20:00Z',
  },
];

export const initialQuoteProposals: QuoteProposal[] = rawInitialQuoteProposals.map(normalizeQuote);

export const initialImageLibraryItems: ImageLibraryItem[] = [
  {
    id: 'img_lib_01',
    title: 'Editorial The Mentors Style - Portafolio & Styling',
    prompt:
      'Editorial luxury fashion card, dark obsidian black background, bold condensed headline "STYLING", cream category tags "PRO TIPS", "MODA", "FASHION", circular photo cutout of person with high-fashion clothes, minimalist pills, bottom capsule "PIXEL 12 OS"',
    imageUrl:
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1000&auto=format&fit=crop&q=80',
    category: 'Redes sociales',
    aspectRatio: '4:5',
    style: 'Editorial The Mentors Style',
    tags: ['Moda', 'Editorial', 'The Mentors', 'Carrusel', 'Alta Costura'],
    sector: 'Moda & Diseño',
    createdAt: '2026-09-12T09:00:00Z',
  },
  {
    id: 'img_lib_02',
    title: 'Propuesta Comercial Premium - Obsidian & Gold',
    prompt:
      'Ultra luxury executive commercial proposal cover, dark obsidian black background, subtle brushed metallic gold accents (#D4AF37), modern geometric typography, Pixel 12 agency crest, sleek corporate branding',
    imageUrl:
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1000&auto=format&fit=crop&q=80',
    category: 'Cotizaciones',
    aspectRatio: '16:9',
    style: 'Pixel 12 Luxury (Negro, Oro, Plata)',
    tags: ['Cotización', 'Portada', 'Obsidiana', 'Oro', 'Corporativo'],
    sector: 'Marketing & Negocios',
    createdAt: '2026-09-11T12:00:00Z',
  },
  {
    id: 'img_lib_03',
    title: 'Asistencia Virtual Ejecutiva - Delegación de Alto Nivel',
    prompt:
      'Modern executive workspace, elegant bilingual virtual assistant working on laptop, minimal clean dark aesthetic, organized workflow dashboards, coffee cup, sleek stationery',
    imageUrl:
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1000&auto=format&fit=crop&q=80',
    category: 'Asistencia virtual',
    aspectRatio: '1:1',
    style: 'Pixel 12 Gold & Black (Oficial)',
    tags: ['Asistencia Virtual', 'Productividad', 'Operaciones', 'Delegar'],
    sector: 'Servicios Profesionales',
    createdAt: '2026-09-10T14:00:00Z',
  },
  {
    id: 'img_lib_04',
    title: 'Estrategia Digital & Analítica de Crecimiento',
    prompt:
      'Futuristic high tech marketing dashboard, glowing golden ROI graphs, dark glassmorphism, performance charts, business scale visualization',
    imageUrl:
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1000&auto=format&fit=crop&q=80',
    category: 'Marketing',
    aspectRatio: '16:9',
    style: 'Tecnológico Minimalista',
    tags: ['Métricas', 'Google Ads', 'Escalar', 'ROAS', 'Ventas'],
    sector: 'Comercial & Tech',
    createdAt: '2026-09-09T18:00:00Z',
  },
  {
    id: 'img_lib_05',
    title: 'Diseño Editorial de Moda - Portafolio de Marca',
    prompt:
      'High-fashion magazine collage with models in designer outfits, bold condensed typography "DISEÑO DE MODA", circular detail cutout, off-white and obsidian color palette',
    imageUrl:
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1000&auto=format&fit=crop&q=80',
    category: 'Branding',
    aspectRatio: '4:5',
    style: 'Editorial The Mentors Style',
    tags: ['Moda', 'Estilo', 'Revista', 'Boutique', 'Portafolio'],
    sector: 'Moda & Lujo',
    createdAt: '2026-09-08T10:00:00Z',
  },
  {
    id: 'img_lib_06',
    title: 'Clínica Médica & Estética - Concepto de Confianza y Lujo',
    prompt:
      'Modern architectural aesthetic dermatology clinic, clean luxury ambient lighting, sophisticated reception, gold accents, medical serenity',
    imageUrl:
      'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1000&auto=format&fit=crop&q=80',
    category: 'Propuestas',
    aspectRatio: '16:9',
    style: 'Pixel 12 Luxury (Negro, Oro, Plata)',
    tags: ['Salud', 'Estética', 'Clínica', 'Bienestar', 'Propuesta'],
    sector: 'Salud & Estética',
    createdAt: '2026-09-07T15:00:00Z',
  },
];
