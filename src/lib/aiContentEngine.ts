import {
  CreativeBrief,
  GeneratedDesignContent,
  DesignSlide,
  ReelScriptScene,
  StorySequenceItem,
  DesignFormatType,
  DesignPillarType,
  DesignStyleType
} from '../types';

export const PIXEL12_BRAND_KIT = {
  name: 'PIXEL 12 STUDIO',
  services: ['Marketing Digital', 'Asistencia Virtual', 'Estrategia de Contenidos'],
  tagline: 'Sistemas predecibles de crecimiento, marketing de autoridad y delegación operativa',
  voice: {
    authorName: 'Alejandro Morales',
    authorRole: 'Director de Estrategia · Pixel 12',
    style: ['Profesional', 'Creativo', 'Cercano', 'Moderno', 'Persuasivo']
  },
  colors: {
    black: '#09090B',
    gold: '#D4AF37',
    silver: '#CBD5E1',
    white: '#FFFFFF',
    borderDark: '#222234'
  },
  typography: {
    display: 'Outfit, sans-serif',
    body: 'Inter, sans-serif'
  },
  visualStyle: 'Fondo negro obsidiana (#09090B), tipografía con estilo dorado con destellos plateados, iluminación cinematográfica, fotografía editorial ejecutiva, estética premium, bordes finos y alto contraste.'
};

/**
 * Normalizes and builds a structured Creative Brief from user inputs or freeform text.
 */
export function buildCreativeBrief(input: Partial<CreativeBrief>): CreativeBrief {
  const format: DesignFormatType = input.format || 'Carrusel';
  const pillar: DesignPillarType = input.pillar || 'Marketing Digital';
  const style: DesignStyleType = input.style || 'Pixel 12 Luxury (Negro, Oro, Plata)';
  const topic = (input.topic || input.freeformPrompt || '').trim();

  return {
    format,
    pillar,
    style,
    topic,
    objective: (input.objective || 'Educar y generar clientes calificados').trim(),
    hook: (input.hook || '').trim(),
    cta: (input.cta || "Escríbenos por mensaje directo y te ayudamos a escalar tu estrategia.").trim(),
    audience: (input.audience || 'Emprendedores, fundadores de negocio y directores comerciales').trim(),
    tone: (input.tone || 'Profesional, cercano, directo y persuasivo').trim(),
    additionalInstructions: (input.additionalInstructions || '').trim(),
    freeformPrompt: (input.freeformPrompt || '').trim(),
    slidesCount: input.slidesCount || (format === 'Carrusel' ? 6 : format === 'Historia / Stories' ? 4 : 1),
    brandName: input.brandName || PIXEL12_BRAND_KIT.name,
    authorName: input.authorName || PIXEL12_BRAND_KIT.voice.authorName,
    brandKit: {
      name: PIXEL12_BRAND_KIT.name,
      services: PIXEL12_BRAND_KIT.services,
      colors: PIXEL12_BRAND_KIT.colors,
      styleDescription: PIXEL12_BRAND_KIT.visualStyle
    }
  };
}

/**
 * Validates generated content to strictly enforce the Zero Repetition & Creative Brief rules:
 * 1. Hook must NOT be repeated on subsequent slides.
 * 2. CTA must NOT be repeated in intermediate slides.
 * 3. Theme/topic must NOT be used verbatim as the title of every slide.
 * 4. Each slide must provide fresh, progressive value.
 */
export function validateAndCleanContent(
  raw: any,
  brief: CreativeBrief
): { isValid: boolean; issues: string[]; cleaned: GeneratedDesignContent } {
  const issues: string[] = [];
  const normalizedBrief = buildCreativeBrief(brief);

  const cleanHook = (raw.hook || normalizedBrief.hook || 'La clave para transformar tu presencia en clientes reales').trim();
  const cleanCta = (raw.cta || normalizedBrief.cta || 'Escríbenos para recibir tu diagnóstico estratégico').trim();
  const cleanTopic = (raw.theme || normalizedBrief.topic || 'Estrategia Digital y Delegación').trim();
  const cleanTitle = (raw.title || `Estrategia: ${cleanTopic}`).trim();

  let slides: DesignSlide[] = Array.isArray(raw.slides)
    ? raw.slides
    : Array.isArray(raw.diapositivas)
    ? raw.diapositivas
    : Array.isArray(raw.carousel)
    ? raw.carousel
    : [];

  // Enforce format slide counts
  if (normalizedBrief.format === 'Post' || normalizedBrief.format === 'Creativo de pauta') {
    if (slides.length === 0) {
      slides = [
        {
          slideNumber: 1,
          slideType: 'cover',
          role: 'hook',
          tag: 'PIXEL 12 · POST ESTRATÉGICO',
          headline: raw.headline || cleanHook,
          subtitle: raw.subtitle || cleanTopic,
          bodyPoints: raw.bodyPoints || ['Enfoque estratégico validado', 'Resultado medible sin improvisación'],
          visualConcept: raw.visualConcept || 'Composición publicitaria ejecutiva de alto contraste, fondo negro obsidiana y titular dorado brillante',
          imagePrompt: raw.imagePrompt || 'Luxury modern dark office, cinematic dramatic studio lighting, obsidian black atmosphere with gold and metallic accents, 8k resolution'
        }
      ];
    } else {
      // Keep only 1 slide for single post
      slides = [slides[0]];
      slides[0].slideNumber = 1;
      slides[0].slideType = 'cover';
      slides[0].role = 'hook';
    }
  } else if (normalizedBrief.format === 'Carrusel') {
    if (slides.length === 0) {
      // Synthesize full professional carousel adhering to Zero-Repetition rule
      const targetCount = normalizedBrief.slidesCount && normalizedBrief.slidesCount >= 4 ? normalizedBrief.slidesCount : 6;
      slides = [
        {
          slideNumber: 1,
          slideType: 'cover',
          role: 'hook',
          tag: `PIXEL 12 · ${normalizedBrief.pillar.toUpperCase()}`,
          headline: cleanHook,
          subtitle: `Descubre por qué ocurre este error y la metodología estratégica para revertirlo.`,
          visualConcept: 'Composición de apertura editorial: Fondo negro obsidiana (#09090B), marco perimetral fino plateado y titular en tipografía bold con acento en oro pulido (#D4AF37)',
          imagePrompt: `Cinematic editorial photography of modern entrepreneur facing ambitious challenges, dark luxury atmosphere, subtle gold reflections, 8k resolution, minimalist black background`,
          highlightBadge: 'ESTUDIO 2026'
        },
        {
          slideNumber: 2,
          slideType: 'problem',
          role: 'problem',
          tag: 'PIXEL 12 · DIAGNÓSTICO',
          headline: 'Error #1: Publicar sin un sistema de captación claro',
          subtitle: 'El contenido sin embudo genera alcance efímero pero cero consultas de clientes reales.',
          bodyPoints: [
            'Invertir horas en crear piezas que no tienen ruta de conversión',
            'Tratar a todas las plataformas con el mismo formato genérico',
            'Seguidores pasivos que consumen pero no toman acción'
          ],
          visualConcept: 'Composición dividida: fotografía superior en blanco y negro con acentos dorados, tarjeta inferior con puntos de fricción',
          imagePrompt: `Professional entrepreneur feeling overwhelmed in front of laptop with messy notifications, dark executive moody lighting, obsidian and metallic textures`
        },
        {
          slideNumber: 3,
          slideType: 'case_study',
          role: 'development',
          tag: 'PIXEL 12 · ESTRATEGIA',
          headline: 'Error #2: Hablar de tus servicios en lugar del dolor del cliente',
          subtitle: 'Tu cliente ideal busca resolver un cuello de botella específico, no leer una lista técnica.',
          bodyPoints: [
            'Enfocar los textos en características y no en el beneficio tangible',
            'No abordar las dudas y objeciones que retrasan la contratación',
            'Mensajes impersonales que no generan urgencia ni empatía'
          ],
          visualConcept: 'Diseño editorial con jerarquía clara y tarjeta oscura con micro-detalles en plata metálica',
          imagePrompt: `Executive business workspace, clean digital workflow interfaces on screen, elegant dramatic lighting, black and gold color palette, professional modern atmosphere`
        },
        {
          slideNumber: 4,
          slideType: 'case_study',
          role: 'development',
          tag: 'PIXEL 12 · CONVERSIÓN',
          headline: 'Error #3: No ofrecer una llamada a la acción de baja fricción',
          subtitle: 'Si el siguiente paso resulta confuso o invasivo, el prospecto postergará el contacto.',
          bodyPoints: [
            'Pedir llamadas de 1 hora cuando un diagnóstico ágil es más efectivo',
            'Falta de enlaces directos o canales conversacionales como DM',
            'Perder el impulso de compra por falta de seguimiento'
          ],
          visualConcept: 'Infografía sobria y minimalista destacando el recorrido del cliente sin fricciones',
          imagePrompt: `Strategic business meeting, focused marketing team discussing growth roadmap, dramatic rim light, dark premium agency aesthetic`
        },
        {
          slideNumber: 5,
          slideType: 'solution',
          role: 'solution',
          tag: 'PIXEL 12 · METODOLOGÍA',
          headline: 'La Solución: Estandarizar, Delegar y Convertir',
          subtitle: 'Un equipo especializado que diseña tu estrategia y ejecuta el contenido sin consumir tu tiempo.',
          bodyPoints: [
            'Diseño visual y copy adaptados a decisores de negocio',
            'Asistencia virtual especializada para liberar más de 15h semanales',
            'Seguimiento analítico quincenal para escalar lo que funciona'
          ],
          metricNumber: '+140%',
          metricLabel: 'Incremento en consultas calificadas registradas en los primeros 60 días',
          visualConcept: 'Tarjeta flotante con métrica dorada (#E5C158) en gran tamaño y sello de calidad corporativa',
          imagePrompt: `Executive woman smiling confidently with tablet in modern sleek corporate office, warm gold lighting highlights, black matte interior`
        },
        {
          slideNumber: 6,
          slideType: 'cta',
          role: 'cta',
          tag: 'PIXEL 12 · ACCIÓN INMEDIATA',
          headline: '¿Listo para escalar tus resultados con Pixel 12?',
          subtitle: cleanCta,
          bodyPoints: [
            'Agenda tu sesión de diagnóstico estratégico sin costo',
            'Revisamos tu presencia digital y detectamos oportunidades clave',
            'Escribe "ESTRATEGIA" al DM para recibir la hoja de ruta'
          ],
          visualConcept: 'Slide de cierre prémium con insignia oficial Pixel 12 Studio, marco dorado y llamada a la acción prominente',
          imagePrompt: `Luxury obsidian black background with elegant floating gold metallic seal and polished silver accents, executive studio lighting, high contrast, clean minimalist framing`,
          highlightBadge: 'ACCIÓN INMEDIATA'
        }
      ];
      if (targetCount > 6) {
        // Add additional development slide if requested
        slides.splice(4, 0, {
          slideNumber: 5,
          slideType: 'case_study',
          role: 'development',
          tag: 'PIXEL 12 · EJECUCIÓN',
          headline: 'Paso Clave: Medir métricas de negocio, no métricas de vanidad',
          subtitle: 'Los likes no pagan nóminas. Las consultas de calidad y los acuerdos cerrados sí.',
          bodyPoints: [
            'Tasa de respuesta y mensajes directos calificados',
            'Conversión de lector pasivo a prospecto en agenda',
            'Retorno medible sobre el tiempo invertido en comunicación'
          ],
          visualConcept: 'Panel de control analítico con indicadores clave de rendimiento en tonos oro y esmeralda',
          imagePrompt: `Clean modern digital dashboard interface displaying analytics growth metrics, obsidian black and gold ambient lighting, executive boardroom vibe`
        });
      }
    } else if (slides.length < 4) {
      issues.push('El carrusel tiene menos de 4 diapositivas');
    }
  }

  // Check and clean slides
  const seenHeadlines = new Set<string>();
  const hookWords = cleanHook.toLowerCase().split(/\s+/).filter(w => w.length > 3);

  slides = slides.map((slide: any, index: number) => {
    const slideNumber = index + 1;
    const isFirst = index === 0;
    const isLast = index === slides.length - 1;
    const isPenultimate = index === slides.length - 2;

    let role = slide.role;
    if (!role) {
      if (isFirst) role = 'hook';
      else if (index === 1) role = 'problem';
      else if (isLast) role = 'cta';
      else if (isPenultimate) role = 'solution';
      else role = 'development';
    }

    let headline = (slide.headline || '').trim();
    let subtitle = (slide.subtitle || '').trim();
    let bodyPoints: string[] = Array.isArray(slide.bodyPoints) ? slide.bodyPoints.map((b: any) => String(b).trim()).filter(Boolean) : [];

    // RULE 1: HOOK MUST NOT BE REPEATED IN SLIDES 2+
    if (!isFirst && headline) {
      const headlineLower = headline.toLowerCase();
      // Check for verbatim or near-verbatim hook repeat
      const matchCount = hookWords.filter(w => headlineLower.includes(w)).length;
      const matchRatio = hookWords.length > 0 ? matchCount / hookWords.length : 0;
      if (matchRatio > 0.65 || headlineLower === cleanHook.toLowerCase()) {
        issues.push(`Slide ${slideNumber} repetía el gancho inicial. Corregido a contenido de desarrollo.`);
        headline = role === 'problem'
          ? 'El obstáculo habitual que frena tu crecimiento'
          : `Clave #${index}: Estandarización y enfoque sin dispersión`;
      }
    }

    // RULE 2: CTA MUST NOT BE REPEATED IN SLIDES 1 to N-1
    if (!isLast && headline) {
      const ctaWords = cleanCta.toLowerCase().split(/\s+/).filter(w => w.length > 3);
      const matchCount = ctaWords.filter(w => headline.toLowerCase().includes(w)).length;
      if (matchCount >= 3 || headline.toLowerCase().includes('escríbenos') || headline.toLowerCase().includes('agenda')) {
        issues.push(`Slide ${slideNumber} tenía una llamada a la acción prematura.`);
        headline = `Paso estratégico #${index}: Ejecución y control de calidad`;
      }
    }

    // RULE 3: THEME MUST NOT BE COPIED VERBATIM AS EVERY SLIDE'S HEADLINE
    if (!isFirst && headline.toLowerCase() === cleanTopic.toLowerCase()) {
      issues.push(`Slide ${slideNumber} copiaba el tema literalmente.`);
      headline = `Profundización #${index}: Cómo implementarlo paso a paso`;
    }

    // RULE 4: ZERO DUPLICATE HEADLINES
    if (seenHeadlines.has(headline.toLowerCase())) {
      issues.push(`Slide ${slideNumber} tenía un titular duplicado.`);
      headline = `${headline} — Paso ${slideNumber}`;
    }
    seenHeadlines.add(headline.toLowerCase());

    // Ensure First Slide has the Hook
    if (isFirst && !headline) {
      headline = cleanHook;
    }

    // Ensure Last Slide has the CTA
    if (isLast && normalizedBrief.format === 'Carrusel') {
      role = 'cta';
      if (!headline || headline === cleanHook) {
        headline = '¿Listo para implementar este sistema en tu negocio?';
      }
      if (!subtitle) {
        subtitle = cleanCta;
      }
    }

    // Ensure each slide has its own bespoke visual description & image prompt
    const visualConcept = slide.visualConcept || slide.visualDescription || (
      isFirst
        ? `Visual impactante de apertura: Fondo negro obsidiana, marco fino plateado, tipografía bold con acento dorado (#D4AF37) representando el gancho.`
        : isLast
        ? `Slide de cierre prémium con badge oficial Pixel 12, llamada a la acción destacada y estética editorial en oro y negro.`
        : `Composición editorial limpia con tarjeta oscura, tipografía en alto contraste y detalles visuales que representan el concepto ${slideNumber}.`
    );

    const imagePrompt = slide.imagePrompt || (
      isFirst
        ? `Cinematic editorial photography of modern entrepreneur facing ambitious challenges, dark luxury atmosphere, subtle gold reflections, 8k resolution, minimalist black background`
        : isLast
        ? `Luxury obsidian black background with elegant floating gold metallic seal and polished silver accents, executive studio lighting, high contrast, clean minimalist framing`
        : `Executive business workspace, clean digital workflow interfaces on screen, elegant dramatic lighting, black and gold color palette, professional modern atmosphere`
    );

    return {
      slideNumber,
      slideType: (isFirst ? 'cover' : isLast ? 'cta' : role === 'problem' ? 'problem' : role === 'solution' ? 'solution' : 'case_study') as any,
      role: role as any,
      tag: slide.tag || `PIXEL 12 · ${normalizedBrief.pillar.toUpperCase()}`,
      headline,
      subtitle: subtitle || undefined,
      bodyPoints: bodyPoints.length > 0 ? bodyPoints.slice(0, 3) : undefined,
      imageUrl: slide.imageUrl,
      imagePrompt,
      visualConcept,
      visualDescription: visualConcept,
      layoutMode: slide.layoutMode || (index === 1 || index === 3 ? 'split_top' : 'full_background'),
      overlayOpacity: slide.overlayOpacity ?? 70,
      showAuthorBadge: isFirst || isLast,
      authorBadgeName: slide.authorBadgeName || normalizedBrief.authorName,
      authorBadgeTitle: slide.authorBadgeTitle || 'Director de Estrategia · Pixel 12',
      showOfficialLogo: true,
      highlightBadge: isFirst ? 'ESTUDIO 2026' : isLast ? 'ACCIÓN INMEDIATA' : undefined,
      accentColor: PIXEL12_BRAND_KIT.colors.gold,
      metricNumber: slide.metricNumber,
      metricLabel: slide.metricLabel
    };
  });

  // Check Reel Script if format is Reel
  let reelScript: ReelScriptScene[] | undefined = undefined;
  if (normalizedBrief.format === 'Guion de Reel') {
    if (Array.isArray(raw.reelScript) && raw.reelScript.length > 0) {
      reelScript = raw.reelScript.map((sc: any, idx: number) => ({
        secondRange: sc.secondRange || (idx === 0 ? '00:00 - 00:03' : idx === 1 ? '00:03 - 00:08' : idx === 2 ? '00:08 - 00:20' : idx === 3 ? '00:20 - 00:28' : '00:28 - 00:30'),
        shotType: sc.shotType || (idx === 0 ? 'Primer plano directo a cámara (Hook)' : idx === 1 ? 'B-roll problema' : 'Demostración de solución'),
        visualDirection: sc.visualDirection || 'Texto en pantalla tipografía bold oro sobre negro obsidiana',
        voiceover: sc.voiceover || cleanHook,
        onScreenText: sc.onScreenText || sc.textOnScreen || (idx === 0 ? cleanHook : undefined)
      }));
    } else {
      reelScript = [
        {
          secondRange: '00:00 - 00:03',
          shotType: 'Primer plano a cámara con iluminación dramática',
          visualDirection: 'Texto dinámico en oro (#D4AF37) y blanco sobre fondo negro: "' + cleanHook.slice(0, 45) + '..."',
          voiceover: cleanHook,
          onScreenText: cleanHook
        },
        {
          secondRange: '00:03 - 00:08',
          shotType: 'B-roll de fundador en escritorio con notificaciones y cuello de botella',
          visualDirection: 'Transición rápida mostrando la fricción operativa real',
          voiceover: `El gran error es creer que más horas de trabajo solucionan un problema de falta de sistemas claros.`,
          onScreenText: 'El cuello de botella que nadie te cuenta'
        },
        {
          secondRange: '00:08 - 00:20',
          shotType: 'Pantalla dividida con flujo de trabajo organizado y métricas',
          visualDirection: 'Puntos clave numerados que aparecen con animación fluida y detalles en plata metálica',
          voiceover: `Cuando estandarizas tus procesos y delegas la operación a especialistas calificados, tu contenido convierte y tu agenda se llena de prospectos reales.`,
          onScreenText: '1. Estandarizar | 2. Delegar | 3. Convertir'
        },
        {
          secondRange: '00:20 - 00:27',
          shotType: 'Demostración del resultado y retorno de inversión',
          visualDirection: 'Gráficas en verde esmeralda y oro con crecimiento de clientes calificados',
          voiceover: `Los clientes de Pixel 12 liberan hasta 15 horas semanales y multiplican sus consultas comerciales en menos de 60 días.`,
          onScreenText: '+140% citas calificadas en 60 días'
        },
        {
          secondRange: '00:27 - 00:30',
          shotType: 'Cierre con logotipo Pixel 12 Studio y llamada a la acción',
          visualDirection: 'Badge dorado con el texto de acción y destellos plateados sutiles',
          voiceover: cleanCta,
          onScreenText: cleanCta
        }
      ];
    }
  }

  // Stories sequence if format is stories
  let storiesSequence: StorySequenceItem[] | undefined = undefined;
  if (normalizedBrief.format === 'Historia / Stories') {
    if (Array.isArray(raw.storiesSequence) && raw.storiesSequence.length > 0) {
      storiesSequence = raw.storiesSequence;
    } else {
      storiesSequence = [
        {
          number: 1,
          role: 'hook',
          headline: cleanHook,
          body: '¿Te ha pasado esto en tu negocio en los últimos meses?',
          stickerType: 'question',
          stickerText: '¿Cuál ha sido tu mayor reto?',
          visualConcept: 'Historia vertical 9:16 con fondo negro mate, texto en oro y sticker de pregunta centrado'
        },
        {
          number: 2,
          role: 'development',
          headline: 'La realidad de la mayoría de fundadores',
          body: 'Publicar sin estrategia ni asistencia termina consumiendo más del 60% de tu tiempo productivo.',
          stickerType: 'slider',
          stickerText: 'Nivel de saturación semanal 🔥',
          visualConcept: 'Gráfico visual de distribución de tiempo con estética minimalista oscura'
        },
        {
          number: 3,
          role: 'interaction',
          headline: '¿Qué preferirías resolver esta misma semana?',
          body: 'Vota para ver cómo lo resuelven las marcas que trabajan con Pixel 12:',
          stickerType: 'poll',
          stickerText: 'Tu prioridad número 1:',
          stickerOptions: ['Tener más clientes calificados', 'Liberar 15h semanales'],
          visualConcept: 'Encuesta interactiva con tipografía premium y contraste absoluto'
        },
        {
          number: 4,
          role: 'solution',
          headline: 'El sistema integrado de Pixel 12',
          body: 'Asistente virtual entrenada + máquina de contenidos de alta conversión sin estrés operativo.',
          stickerType: 'quiz',
          stickerText: '¿Sabías que podemos implementarlo en 48h?',
          stickerOptions: ['¡No lo sabía!', 'Quiero saber más'],
          visualConcept: 'Captura de flujo de trabajo elegante con bordes dorados pulidos'
        },
        {
          number: 5,
          role: 'cta',
          headline: 'Diagnóstico estratégico sin costo',
          body: cleanCta,
          stickerType: 'link',
          stickerText: 'Escríbenos por DM 🚀',
          visualConcept: 'Cierre con botón dorado interactivo y contacto directo con el equipo Pixel 12'
        }
      ];
    }
  }

  const cleaned: GeneratedDesignContent = {
    id: raw.id || 'gen_' + Date.now(),
    title: cleanTitle,
    theme: cleanTopic,
    concept: raw.concept || `Pieza estratégica de ${normalizedBrief.format} diseñada para ${normalizedBrief.objective.toLowerCase()}`,
    format: normalizedBrief.format,
    pillar: normalizedBrief.pillar,
    style: normalizedBrief.style,
    hook: cleanHook,
    caption: (raw.caption || `${cleanHook}\n\n${cleanTopic}\n\n${cleanCta}`).trim(),
    cta: cleanCta,
    hashtags: Array.isArray(raw.hashtags) && raw.hashtags.length > 0
      ? raw.hashtags
      : ['#Pixel12', '#MarketingDigital', '#AsistenciaVirtual', '#EstrategiaEmpresarial'],
    visualConcept: raw.visualConcept || PIXEL12_BRAND_KIT.visualStyle,
    imagePrompt: raw.imagePrompt || slides[0]?.imagePrompt,
    slides,
    reelScript,
    storiesSequence,
    blogSEO: raw.blogSEO,
    brief: normalizedBrief,
    suggestedTasks: raw.suggestedTasks || [
      {
        title: `Diseñar artes oficiales en 1080x1350 para ${cleanTitle.slice(0, 30)}`,
        description: `Exportar y maquetar con identidad Pixel 12 (Negro, Oro, Plata y Blanco)`,
        assignedRole: 'Designer',
        priority: 'HIGH'
      },
      {
        title: `Programar publicación y activar respuestas en DMs`,
        description: `Configurar palabra clave del CTA y agendar en calendario de contenidos`,
        assignedRole: 'Copywriter',
        priority: 'MEDIUM'
      }
    ],
    createdAt: raw.createdAt || new Date().toISOString()
  };

  return {
    isValid: issues.length === 0,
    issues,
    cleaned
  };
}

/**
 * Builds the strict, multi-persona Gemini Prompt for generating the content.
 * Enforces:
 * - BRIEF AS CREATIVE DIRECTION, NEVER LITERAL REPETITION.
 * - Hook exclusively on slide 1.
 * - CTA exclusively at the end.
 * - New idea per slide.
 * - Specific visual prompts for every slide.
 */
export function buildGeminiContentPrompt(briefInput: Partial<CreativeBrief>): string {
  const brief = buildCreativeBrief(briefInput);

  return `ERES EL DIRECTOR CREATIVO, ESTRATEGA DE CONTENIDO SENIOR Y COPYWRITER PRINCIPAL DE "${PIXEL12_BRAND_KIT.name}".
PIXEL 12 es una agencia internacional boutique de alta gama especializada en:
1. Marketing Digital y Estrategia de Contenidos de Autoridad
2. Asistencia Virtual Ejecutiva y Delegación de Procesos Operativos

IDENTIDAD VISUAL Y BRAND KIT DE PIXEL 12:
- Paleta: Negro Obsidiana (#09090B), Dorado Prestigio (#D4AF37), Plateado Metálico (#CBD5E1), Blanco Puro (#FFFFFF).
- Títulos visuales: Tipografía display bold en estilo dorado con destellos plateados sobre fondos oscuros profundos.
- Fotografía: Estilo editorial cinematográfico, iluminación de estudio, composición elegante y moderna, alta resolución.

================================================================================
REGLA CARDINAL ABSOLUTA: LAS ENTRADAS SON UN BRIEF CREATIVO, NO TEXTO PARA COPIAR
================================================================================
El usuario te ha entregado un BRIEF con lo que desea comunicar.
TU TRABAJO ES PENSAR, ESTRUCTURAR, REDACTAR Y PROPONER EL CONTENIDO COMPLETO.

ESTÁ ESTRICTAMENTE PROHIBIDO:
❌ Copiar el Hook en todas las diapositivas.
❌ Copiar el Tema literalmente en cada slide.
❌ Copiar el CTA en todas las diapositivas.
❌ Devolver texto repetitivo o párrafos pesados.
❌ Usar el mismo concepto visual o imagen en todas las diapositivas.

BRIEF CREATIVO RECIBIDO:
{
  "format": "${brief.format}",
  "pillar": "${brief.pillar}",
  "style": "${brief.style}",
  "topic": "${brief.topic}",
  "objective": "${brief.objective}",
  "hook": "${brief.hook || 'Dedúcelo de manera irresistible según el tema'}",
  "cta": "${brief.cta}",
  "audience": "${brief.audience}",
  "tone": "${brief.tone}",
  "additionalInstructions": "${brief.additionalInstructions || 'Ninguna'}",
  "targetSlidesCount": ${brief.slidesCount}
}

INSTRUCCIONES DE DESARROLLO SEGÚN EL FORMATO:

${brief.format === 'Carrusel' ? `
FORMATO CARRUSEL (Crea entre 5 y 7 diapositivas secuenciales):
- Slide 1 (ROLE: "hook"):
  * Headline: El HOOK demoledor de apertura que detenga el scroll en seco.
  * Subtitle: Breve promesa de valor o contexto inmediato (1 línea).
  * Tag: "PIXEL 12 · ${brief.pillar.toUpperCase()}"
  * visualConcept: Dirección de arte específica del hook.
  * imagePrompt: Prompt en inglés hiperrealista y cinemático para la imagen de apertura.
- Slide 2 (ROLE: "problem"):
  * Headline: El cuello de botella, costo o dolor que el público ignora.
  * Subtitle: Explicación breve y clara del impacto negativo.
  * bodyPoints: 2 o 3 viñetas concisas con el problema.
  * metricNumber: Métrica de fricción (ej: "-15h", "85%", "-40%").
  * visualConcept: Visual representando el caos operativo o frustración antes del cambio.
  * imagePrompt: Prompt en inglés específico para esta diapositiva.
- Slides Intermedios (ROLE: "development"):
  * Cada slide DEBE DESARROLLAR UNA IDEA NUEVA (ej: "Error #1: ...", "Error #2: ...", o "Paso 1: ...", "Paso 2: ...").
  * Títulos cortos y directos (máximo 8-10 palabras).
  * Subtítulo con explicación clara.
  * 2-3 puntos breves de valor.
  * CADA SLIDE TIENE SU PROPIO visualConcept e imagePrompt ÚNICO.
- Penúltimo Slide (ROLE: "solution"):
  * La solución integrada, conclusión o método estratégico de Pixel 12.
  * Métrica positiva (ej: "+140%", "3.5x").
  * visualConcept e imagePrompt sobre el éxito y orden alcanzado.
- Último Slide (ROLE: "cta"):
  * Cierre directo con la llamada a la acción ("${brief.cta}").
  * Qué debe hacer el lector (comentar, escribir al DM, agendar).
  * Badge dorado de acción inmediata.
` : brief.format === 'Guion de Reel' ? `
FORMATO GUION DE REEL:
- 00:00 - 00:03: HOOK magnético directo a cámara.
- 00:03 - 00:08: Planteamiento del dolor / problema.
- 00:08 - 00:20: Desarrollo de los 3 puntos clave con dinamismo.
- 00:20 - 00:27: Solución y resultado comprobado.
- 00:27 - 00:30: CTA final y palabra clave a comentar.
` : brief.format === 'Historia / Stories' ? `
FORMATO HISTORIAS / STORIES (Secuencia de 4 o 5 stories):
- Story 1: Gancho de atención y apertura.
- Story 2: Desarrollo del contexto o error.
- Story 3: Interacción con sticker (Encuesta, Pregunta, Slider de fuego o Quiz).
- Story 4: Solución y método Pixel 12.
- Story 5: CTA final con enlace o invitación a DM.
` : `
FORMATO POST SIMPLE / CREATIVO DE PAUTA:
- EXACTAMENTE 1 ARTE VISUAL.
- Headline de alto impacto.
- Subtitle y 2-3 puntos clave concisos.
- visualConcept cinematográfico en negro y oro.
- imagePrompt detallado en inglés.
- Caption completo y persuasivo para Instagram/LinkedIn con emojis, espacios limpios y CTA al final.
`}

REGLA DE NO REPETICIÓN (OBLIGATORIA):
Cada slide o escena debe aportar información NUEVA. Antes de emitir cada elemento, comprueba mentalmente: "¿Esta información ya apareció?". Si la respuesta es SÍ, NO la repitas; ofrece un ángulo complementario.

RESPONDE EXCLUSIVAMENTE EN FORMATO JSON VÁLIDO CON LA SIGUIENTE ESTRUCTURA:
{
  "title": "Título conciso y estratégico de la pieza",
  "theme": "${brief.topic}",
  "concept": "Concepto creativo general",
  "format": "${brief.format}",
  "pillar": "${brief.pillar}",
  "style": "${brief.style}",
  "hook": "El gancho maestro de apertura",
  "caption": "Copy completo y persuasivo para redes, con saltos de línea, valor real y llamado a la acción al final",
  "cta": "${brief.cta}",
  "hashtags": ["#Pixel12", "#MarketingDigital", "#AsistenciaVirtual", "#EstrategiaEmpresarial", "#NegociosEscalables"],
  "visualConcept": "Dirección de arte general (Negro Obsidiana, Dorado #D4AF37, Plateado #CBD5E1 y Blanco)",
  "imagePrompt": "Prompt maestro en inglés para Midjourney / Imagen 3",
  "slides": [
    {
      "slideNumber": 1,
      "slideType": "cover",
      "role": "hook",
      "tag": "PIXEL 12 · ${brief.pillar.toUpperCase()}",
      "headline": "Titular grande, corto y magnético",
      "subtitle": "Subtítulo de apertura que amplía el gancho",
      "bodyPoints": ["Punto 1", "Punto 2"],
      "visualConcept": "Descripción de arte para esta diapositiva",
      "imagePrompt": "Detailed photographic prompt in English for this specific slide",
      "metricNumber": null,
      "metricLabel": null
    }
  ],
  "reelScript": [
    {
      "secondRange": "00:00 - 00:03",
      "shotType": "Primer plano a cámara con texto llamativo",
      "visualDirection": "Texto en pantalla bold oro sobre fondo negro obsidiana",
      "voiceover": "Texto hablado para esta escena",
      "onScreenText": "Texto visible en pantalla"
    }
  ],
  "storiesSequence": [
    {
      "number": 1,
      "role": "hook",
      "headline": "Titular de la story",
      "body": "Texto breve",
      "stickerType": "question",
      "stickerText": "Texto del sticker interactivo",
      "stickerOptions": ["Opción A", "Opción B"],
      "visualConcept": "Arte 9:16 para la story"
    }
  ]
}`;
}
