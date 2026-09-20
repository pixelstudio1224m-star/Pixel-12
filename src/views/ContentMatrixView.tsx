import React, { useState, useMemo, useRef } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import { Post, ContentFormat, ContentPillar, PostStatus, Platform } from '../types';
import * as XLSX from 'xlsx';
import {
  Table as TableIcon,
  Download,
  Upload,
  Search,
  Trash2,
  Edit3,
  CheckCircle2,
  Sparkles,
  FileSpreadsheet,
  CheckSquare,
  Square,
  Calendar,
  CalendarPlus,
  AlertCircle,
  AlertTriangle,
  X,
  RefreshCw,
  Clock,
  Building2,
  Layers,
  ArrowRight
} from 'lucide-react';

// Official standardized column names required by Pixel 12 OS
export const OFFICIAL_COLUMNS = [
  'FECHA',
  'CLIENTE',
  'PLATAFORMA',
  'TIPO_DE_CONTENIDO',
  'PILAR',
  'OBJETIVO',
  'TEMA',
  'HOOK',
  'COPY',
  'CTA',
  'HASHTAGS',
  'FORMATO',
  'ESTADO'
] as const;

interface ParsedRowResult {
  rowNumber: number;
  raw: Record<string, any>;
  post?: Partial<Post>;
  targetBrandId: string;
  targetBrandName: string;
  isValid: boolean;
  errors: string[];
  warnings: string[];
  isDuplicate: boolean;
}

export const ContentMatrixView: React.FC = () => {
  const {
    data,
    activeBrand,
    setActiveBrandId,
    openPostDetail,
    openCreateWithAI,
    deletePost,
    bulkDeletePosts,
    updatePost,
    bulkImportPosts,
    schedulePostToCalendar,
    scheduleAllPostsToCalendar,
    showToast
  } = useWorkspace();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filters & State
  const [search, setSearch] = useState('');
  const [selectedBrandFilter, setSelectedBrandFilter] = useState<string>('ALL');
  const [formatFilter, setFormatFilter] = useState('ALL');
  const [pillarFilter, setPillarFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Preview & Import Modal State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importFileName, setImportFileName] = useState('');
  const [importDetectedSheet, setImportDetectedSheet] = useState('');
  const [parsedRows, setParsedRows] = useState<ParsedRowResult[]>([]);
  const [duplicateStrategy, setDuplicateStrategy] = useState<'skip' | 'update' | 'create'>('skip');
  const [isProcessingImport, setIsProcessingImport] = useState(false);

  // Quick Date/Time Edit Popover/Modal
  const [editingSchedulePost, setEditingSchedulePost] = useState<Post | null>(null);
  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState('');

  // Filtered posts list
  const filteredPosts = useMemo(() => {
    const posts = data?.posts || [];
    return posts.filter((p) => {
      if (!p) return false;
      if (selectedBrandFilter !== 'ALL' && p.brandId !== selectedBrandFilter) return false;
      if (formatFilter !== 'ALL' && p.format !== formatFilter) return false;
      if (pillarFilter !== 'ALL' && p.pillar !== pillarFilter) return false;
      if (statusFilter !== 'ALL' && p.status !== statusFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          (p.internalTitle && p.internalTitle.toLowerCase().includes(q)) ||
          (p.hook && p.hook.toLowerCase().includes(q)) ||
          (p.caption && p.caption.toLowerCase().includes(q)) ||
          (p.cta && p.cta.toLowerCase().includes(q)) ||
          (p.theme && p.theme.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [data?.posts, selectedBrandFilter, formatFilter, pillarFilter, statusFilter, search]);

  // Selection handlers
  const toggleSelectPost = (postId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(postId) ? prev.filter((id) => id !== postId) : [...prev, postId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredPosts.length && filteredPosts.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredPosts.map((p) => p.id));
    }
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`¿Seguro que deseas eliminar las ${selectedIds.length} publicaciones seleccionadas?`)) {
      await bulkDeletePosts(selectedIds);
      setSelectedIds([]);
    }
  };

  // Mass add to calendar
  const handleMassAddToCalendar = async () => {
    const targetPosts = selectedIds.length > 0
      ? filteredPosts.filter((p) => selectedIds.includes(p.id))
      : filteredPosts;

    if (targetPosts.length === 0) {
      showToast('No hay publicaciones para agregar al calendario', 'error');
      return;
    }

    const unScheduled = targetPosts.filter((p) => p.status !== 'SCHEDULED');
    await scheduleAllPostsToCalendar(targetPosts.map((p) => p.id));
    showToast(`${targetPosts.length} publicaciones agregadas/sincronizadas con el calendario`, 'success');
  };

  // Quick single schedule
  const handleScheduleSingle = async (post: Post, e: React.MouseEvent) => {
    e.stopPropagation();
    await schedulePostToCalendar(post.id, post.date, post.time || '11:00');
    showToast(`"${post.internalTitle}" agregada al calendario para el ${post.date}`, 'success');
  };

  // Save quick date/time edit
  const handleSaveScheduleEdit = async () => {
    if (!editingSchedulePost) return;
    const updated: Post = {
      ...editingSchedulePost,
      date: editDate || editingSchedulePost.date,
      time: editTime || editingSchedulePost.time,
      status: 'SCHEDULED',
      updatedAt: new Date().toISOString()
    };
    await updatePost(updated);
    setEditingSchedulePost(null);
    showToast(`Fecha y hora actualizadas. Sincronizado con el calendario.`);
  };

  // Download official Excel template
  const downloadExcelTemplate = () => {
    const templateRows = [
      {
        FECHA: '2026-09-20',
        CLIENTE: activeBrand.name || 'Pixel 12 Studio',
        PLATAFORMA: 'instagram, linkedin',
        TIPO_DE_CONTENIDO: 'Educativo',
        PILAR: 'Marketing Digital',
        OBJETIVO: 'Posicionamiento y generación de demanda calificada',
        TEMA: '5 Automatizaciones con IA para Escalar Agencias',
        HOOK: 'El 80% de los directores de agencia pierden 12 horas a la semana apagando fuegos.',
        COPY: 'Si tu equipo sigue creando propuestas a mano y diseñando posts uno a uno, estás frenando tu margen. Con Pixel 12 OS centralizamos la prospección y contenidos.',
        CTA: 'Comenta "SISTEMA" y te enviamos la guía gratuita de automatización.',
        HASHTAGS: '#Pixel12 #InteligenciaArtificial #MarketingDigital #Growth',
        FORMATO: 'Carousel',
        ESTADO: 'DRAFT'
      },
      {
        FECHA: '2026-09-22',
        CLIENTE: activeBrand.name || 'Pixel 12 Studio',
        PLATAFORMA: 'instagram, tiktok',
        TIPO_DE_CONTENIDO: 'Autoridad',
        PILAR: 'Asistencia Virtual',
        OBJETIVO: 'Demostración de retorno y confianza comercial',
        TEMA: 'Cómo una Asistente Virtual Ejecutiva multiplica la agenda de un CEO',
        HOOK: 'No necesitas trabajar 14 horas al día para facturar 6 cifras.',
        COPY: 'Descubre el método de delegación estratégica que utilizamos en Pixel 12 para liberar la agenda ejecutiva de directores comerciales.',
        CTA: 'Agenda tu sesión estratégica en el enlace del perfil.',
        HASHTAGS: '#AsistenteVirtual #Liderazgo #Productividad #CEO',
        FORMATO: 'Reel',
        ESTADO: 'SCHEDULED'
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateRows, {
      header: [
        'FECHA',
        'CLIENTE',
        'PLATAFORMA',
        'TIPO_DE_CONTENIDO',
        'PILAR',
        'OBJETIVO',
        'TEMA',
        'HOOK',
        'COPY',
        'CTA',
        'HASHTAGS',
        'FORMATO',
        'ESTADO'
      ]
    });

    worksheet['!cols'] = [
      { wch: 14 },
      { wch: 18 },
      { wch: 22 },
      { wch: 20 },
      { wch: 20 },
      { wch: 30 },
      { wch: 38 },
      { wch: 42 },
      { wch: 55 },
      { wch: 32 },
      { wch: 28 },
      { wch: 16 },
      { wch: 14 }
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Plantilla Matriz');
    XLSX.writeFile(workbook, 'plantilla_matriz_contenido_pixel12.xlsx');
    showToast('Plantilla oficial de Excel descargada');
  };

  // Export current filtered posts to Excel
  const exportToExcel = () => {
    const rows = filteredPosts.map((p) => {
      const brand = (data?.brands || []).find((b) => b.id === p.brandId);
      return {
        FECHA: p.date,
        CLIENTE: brand?.name || activeBrand.name,
        PLATAFORMA: p.platforms.join(', '),
        TIPO_DE_CONTENIDO: p.pillar,
        PILAR: p.pillar,
        OBJETIVO: p.objective,
        TEMA: p.internalTitle || p.theme,
        HOOK: p.hook,
        COPY: p.caption,
        CTA: p.cta,
        HASHTAGS: p.hashtags.join(' '),
        FORMATO: p.format,
        ESTADO: p.status
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Matriz Contenido');
    XLSX.writeFile(
      workbook,
      `Matriz_${activeBrand.name.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.xlsx`
    );
    showToast('Archivo Excel exportado exitosamente');
  };

  // Export current filtered posts to CSV
  const exportToCSV = () => {
    const rows = filteredPosts.map((p) => {
      const brand = (data?.brands || []).find((b) => b.id === p.brandId);
      return {
        FECHA: p.date,
        CLIENTE: `"${(brand?.name || activeBrand.name).replace(/"/g, '""')}"`,
        PLATAFORMA: `"${p.platforms.join(';').replace(/"/g, '""')}"`,
        TIPO_DE_CONTENIDO: `"${p.pillar.replace(/"/g, '""')}"`,
        PILAR: `"${p.pillar.replace(/"/g, '""')}"`,
        OBJETIVO: `"${p.objective.replace(/"/g, '""')}"`,
        TEMA: `"${(p.internalTitle || p.theme).replace(/"/g, '""')}"`,
        HOOK: `"${p.hook.replace(/"/g, '""')}"`,
        COPY: `"${p.caption.replace(/"/g, '""')}"`,
        CTA: `"${p.cta.replace(/"/g, '""')}"`,
        HASHTAGS: `"${p.hashtags.join(' ').replace(/"/g, '""')}"`,
        FORMATO: p.format,
        ESTADO: p.status
      };
    });

    if (rows.length === 0) {
      showToast('No hay publicaciones para exportar', 'error');
      return;
    }

    const headers = Object.keys(rows[0]).join(',');
    const body = rows.map((r) => Object.values(r).join(',')).join('\n');
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + encodeURIComponent(headers + '\n' + body);
    const link = document.createElement('a');
    link.setAttribute('href', csvContent);
    link.setAttribute('download', `Matriz_${activeBrand.name.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Archivo CSV exportado exitosamente');
  };

  // Helper: Normalize column header names to match official schema
  const normalizeHeader = (rawKey: string): string => {
    if (!rawKey) return '';
    const clean = rawKey
      .toString()
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '');

    if (['fecha', 'date', 'fechapublicacion', 'dia', 'publishdate', 'fechaprogramada'].includes(clean)) {
      return 'FECHA';
    }
    if (['cliente', 'marca', 'brand', 'client', 'cuenta', 'empresa'].includes(clean)) {
      return 'CLIENTE';
    }
    if (['plataforma', 'plataformas', 'red', 'redes', 'canal', 'canales', 'platform', 'platforms', 'social'].includes(clean)) {
      return 'PLATAFORMA';
    }
    if (['tipodecontenido', 'tipocontenido', 'tipo', 'contenttype', 'clase'].includes(clean)) {
      return 'TIPO_DE_CONTENIDO';
    }
    if (['pilar', 'pillar', 'pilardecontenido', 'categoria', 'category'].includes(clean)) {
      return 'PILAR';
    }
    if (['objetivo', 'objective', 'goal', 'meta', 'proposito'].includes(clean)) {
      return 'OBJETIVO';
    }
    if (['tema', 'titulo', 'titulointerno', 'title', 'topic', 'asunto', 'temaidea'].includes(clean)) {
      return 'TEMA';
    }
    if (['hook', 'gancho', 'ganchohook', 'hook3s', 'llamado', 'intro', 'frasegancho'].includes(clean)) {
      return 'HOOK';
    }
    if (['copy', 'caption', 'texto', 'captioncompleto', 'cuerpo', 'descripcion', 'text'].includes(clean)) {
      return 'COPY';
    }
    if (['cta', 'calltoaction', 'llamadoalaaccion', 'accion'].includes(clean)) {
      return 'CTA';
    }
    if (['hashtags', 'etiquetas', 'tags', 'hash'].includes(clean)) {
      return 'HASHTAGS';
    }
    if (['formato', 'format', 'tipoformato'].includes(clean)) {
      return 'FORMATO';
    }
    if (['estado', 'status', 'fase', 'estatus'].includes(clean)) {
      return 'ESTADO';
    }

    return rawKey.trim().toUpperCase();
  };

  // Helper: Parse Excel Dates (serial, ISO, DD/MM/YYYY)
  const parseExcelDate = (val: any): { date: string; valid: boolean; error?: string } => {
    if (val === undefined || val === null || val === '') {
      return { date: '', valid: false, error: 'Fecha vacía' };
    }

    // If numeric Excel Serial
    if (typeof val === 'number') {
      try {
        const utcDays = Math.round(val - 25569);
        const dateObj = new Date(utcDays * 86400 * 1000);
        if (!isNaN(dateObj.getTime())) {
          const y = dateObj.getUTCFullYear();
          const m = String(dateObj.getUTCMonth() + 1).padStart(2, '0');
          const d = String(dateObj.getUTCDate()).padStart(2, '0');
          return { date: `${y}-${m}-${d}`, valid: true };
        }
      } catch (e) {}
    }

    const str = String(val).trim();

    // Format YYYY-MM-DD
    if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(str)) {
      const [y, m, d] = str.split('-').map(Number);
      if (m >= 1 && m <= 12 && d >= 1 && d <= 31) {
        return {
          date: `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
          valid: true
        };
      }
    }

    // Format DD/MM/YYYY or DD-MM-YYYY
    if (/^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}$/.test(str)) {
      const parts = str.split(/[\/\-]/).map(Number);
      const day = parts[0];
      const month = parts[1];
      const year = parts[2];
      if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
        return {
          date: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
          valid: true
        };
      }
    }

    // General Date parse fallback
    const parsed = new Date(str);
    if (!isNaN(parsed.getTime()) && parsed.getFullYear() > 2000 && parsed.getFullYear() < 2100) {
      const y = parsed.getFullYear();
      const m = String(parsed.getMonth() + 1).padStart(2, '0');
      const d = String(parsed.getDate()).padStart(2, '0');
      return { date: `${y}-${m}-${d}`, valid: true };
    }

    return { date: '', valid: false, error: `Fecha inválida ("${str}")` };
  };

  // Handle file selection and parse workbook with automatic sheet & column detection
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFileName(file.name);
    const reader = new FileReader();

    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary', cellDates: false });

        // Auto-detect sheet: find sheet named 'matriz', 'contenido', 'posts', or the first with valid headers
        let targetSheetName = wb.SheetNames[0];
        for (const sheetName of wb.SheetNames) {
          const lower = sheetName.toLowerCase();
          if (lower.includes('matriz') || lower.includes('contenido') || lower.includes('post') || lower.includes('plan')) {
            targetSheetName = sheetName;
            break;
          }
        }
        setImportDetectedSheet(targetSheetName);

        const ws = wb.Sheets[targetSheetName];
        const rawJson: any[] = XLSX.utils.sheet_to_json(ws, { defval: '' });

        if (rawJson.length === 0) {
          showToast('La hoja seleccionada está vacía', 'error');
          return;
        }

        // Parse and validate row by row
        const results: ParsedRowResult[] = [];

        rawJson.forEach((rawRow, idx) => {
          const rowNumber = idx + 2; // Excel row numbering (header is row 1)
          const normalizedRow: Record<string, any> = {};

          Object.keys(rawRow).forEach((origKey) => {
            const normKey = normalizeHeader(origKey);
            normalizedRow[normKey] = rawRow[origKey];
          });

          const errors: string[] = [];
          const warnings: string[] = [];

          // 1. FECHA validation
          const dateResult = parseExcelDate(normalizedRow['FECHA']);
          if (!dateResult.valid) {
            errors.push(dateResult.error || `Fila ${rowNumber}: fecha de publicación inválida o vacía`);
          }

          // 2. TEMA / Título validation
          const tema = (normalizedRow['TEMA'] || normalizedRow['TITULO'] || '').toString().trim();
          if (!tema) {
            errors.push(`Fila ${rowNumber}: falta TEMA o Título interno`);
          }

          // 3. COPY / Caption validation
          const copy = (normalizedRow['COPY'] || normalizedRow['CAPTION'] || '').toString().trim();
          if (!copy) {
            errors.push(`Fila ${rowNumber}: falta COPY o Caption de la publicación`);
          }

          // 4. CTA check (warn if empty)
          let cta = (normalizedRow['CTA'] || '').toString().trim();
          if (!cta) {
            warnings.push(`Fila ${rowNumber}: falta CTA (se asignará llamado a la acción predeterminado)`);
            cta = 'Escríbenos por mensaje directo para más información';
          }

          // 5. HOOK check
          let hook = (normalizedRow['HOOK'] || '').toString().trim();
          if (!hook) {
            warnings.push(`Fila ${rowNumber}: falta Hook (se tomará el tema como gancho)`);
            hook = tema;
          }

          // 6. CLIENTE match
          const rawClient = (normalizedRow['CLIENTE'] || '').toString().trim();
          let matchedBrand = activeBrand;
          if (rawClient) {
            const found = (data?.brands || []).find(
              (b) => b.name.toLowerCase() === rawClient.toLowerCase() || b.id === rawClient
            );
            if (found) {
              matchedBrand = found;
            } else {
              warnings.push(`Fila ${rowNumber}: Cliente "${rawClient}" no existe. Se asignará a ${activeBrand.name}.`);
            }
          }

          // 7. FORMATO normalization
          const rawFormat = (normalizedRow['FORMATO'] || '').toString().trim().toLowerCase();
          let format: ContentFormat = 'Carousel';
          if (rawFormat.includes('reel')) format = 'Reel';
          else if (rawFormat.includes('carrusel') || rawFormat.includes('carousel')) format = 'Carousel';
          else if (rawFormat.includes('estatico') || rawFormat.includes('static')) format = 'Static Post';
          else if (rawFormat.includes('linkedin')) format = 'LinkedIn Post';
          else if (rawFormat.includes('story') || rawFormat.includes('historia')) format = 'Story';
          else if (rawFormat.includes('short')) format = 'Short';
          else if (rawFormat.includes('video')) format = 'Video';

          // 8. PILAR normalization
          const rawPilar = (normalizedRow['PILAR'] || normalizedRow['TIPO_DE_CONTENIDO'] || '').toString().trim();
          let pillar: ContentPillar = 'Marketing Digital';
          if (rawPilar) {
            const knownPillars: ContentPillar[] = [
              'Marketing Digital',
              'Asistencia Virtual',
              'Educativo',
              'Venta',
              'Autoridad',
              'Conversión',
              'Engagement',
              'Testimonios',
              'Comunidad',
              'Entretenimiento'
            ];
            const foundPillar = knownPillars.find(
              (p) => p.toLowerCase() === rawPilar.toLowerCase()
            );
            pillar = foundPillar || 'Marketing Digital';
          }

          // 9. PLATAFORMA normalization
          const rawPlat = (normalizedRow['PLATAFORMA'] || 'instagram').toString().toLowerCase();
          const platforms: Platform[] = [];
          if (rawPlat.includes('instagram')) platforms.push('instagram');
          if (rawPlat.includes('linkedin')) platforms.push('linkedin');
          if (rawPlat.includes('facebook')) platforms.push('facebook');
          if (rawPlat.includes('tiktok')) platforms.push('tiktok');
          if (rawPlat.includes('youtube')) platforms.push('youtube');
          if (platforms.length === 0) platforms.push('instagram');

          // 10. ESTADO normalization
          const rawStatus = (normalizedRow['ESTADO'] || 'DRAFT').toString().trim().toUpperCase();
          const validStatuses: PostStatus[] = [
            'DRAFT',
            'IN_REVIEW',
            'CHANGES_REQUESTED',
            'APPROVED',
            'SCHEDULED',
            'PUBLISHED'
          ];
          const status: PostStatus = validStatuses.includes(rawStatus as PostStatus)
            ? (rawStatus as PostStatus)
            : 'DRAFT';

          // 11. HASHTAGS
          const rawHashtags = (normalizedRow['HASHTAGS'] || '').toString().trim();
          const hashtags = rawHashtags
            ? rawHashtags.split(/[,\s]+/).filter((h: string) => h.length > 0).map((h: string) => (h.startsWith('#') ? h : `#${h}`))
            : ['#Pixel12'];

          // 12. Duplicate check (cliente + fecha + plataforma + tema + tipo)
          const allPosts = data?.posts || [];
          const isDuplicate = allPosts.some(
            (p) =>
              p &&
              p.brandId === matchedBrand.id &&
              p.date === dateResult.date &&
              p.internalTitle &&
              p.internalTitle.toLowerCase() === tema.toLowerCase() &&
              Array.isArray(p.platforms) &&
              p.platforms.some((pl) => platforms.includes(pl))
          );

          const isValid = errors.length === 0;

          const postData: Partial<Post> | undefined = isValid
            ? {
                brandId: matchedBrand.id,
                internalTitle: tema,
                theme: tema,
                objective: normalizedRow['OBJETIVO'] || 'Estrategia de matriz de contenido',
                date: dateResult.date,
                time: '11:00',
                platforms,
                format,
                pillar,
                hook,
                caption: copy,
                cta,
                hashtags,
                status,
                relatedTaskIds: [],
                approvalHistory: [],
                versions: []
              }
            : undefined;

          results.push({
            rowNumber,
            raw: normalizedRow,
            post: postData,
            targetBrandId: matchedBrand.id,
            targetBrandName: matchedBrand.name,
            isValid,
            errors,
            warnings,
            isDuplicate
          });
        });

        setParsedRows(results);
        setIsImportModalOpen(true);
      } catch (err: any) {
        showToast('Error al procesar el archivo: ' + err.message, 'error');
      } finally {
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };

    reader.readAsBinaryString(file);
  };

  // Execute the confirmed import
  const handleExecuteImport = async () => {
    const validRows = parsedRows.filter((r) => r.isValid && r.post);
    if (validRows.length === 0) {
      showToast('No hay registros válidos para importar', 'error');
      return;
    }

    setIsProcessingImport(true);
    try {
      const postsToImport: Partial<Post>[] = validRows.map((r) => r.post!);
      const count = await bulkImportPosts(postsToImport, activeBrand.id, duplicateStrategy);
      setIsImportModalOpen(false);
      setParsedRows([]);
      showToast(`¡Éxito! Se procesaron ${count} publicaciones en la matriz`, 'success');
    } catch (err: any) {
      showToast('Error al importar publicaciones: ' + (err?.message || 'Error desconocido'), 'error');
    } finally {
      setIsProcessingImport(false);
    }
  };

  const statusColors: Record<PostStatus, { bg: string; text: string; label: string }> = {
    DRAFT: { bg: 'bg-amber-500/15', text: 'text-amber-400 border border-amber-500/30', label: 'Borrador' },
    IN_REVIEW: { bg: 'bg-indigo-500/15', text: 'text-indigo-400 border border-indigo-500/30', label: 'En Revisión' },
    CHANGES_REQUESTED: { bg: 'bg-rose-500/15', text: 'text-rose-400 border border-rose-500/30', label: 'Cambios' },
    APPROVED: { bg: 'bg-emerald-500/15', text: 'text-emerald-400 border border-emerald-500/30', label: 'Aprobado' },
    SCHEDULED: { bg: 'bg-sky-500/15', text: 'text-sky-400 border border-sky-500/30', label: 'Programado' },
    PUBLISHED: { bg: 'bg-emerald-600/30', text: 'text-emerald-300 border border-emerald-500/40', label: 'Publicado' },
    REJECTED: { bg: 'bg-red-500/20', text: 'text-red-400 border border-red-500/30', label: 'Rechazado' },
    FAILED: { bg: 'bg-red-600/30', text: 'text-red-300 border border-red-500/40', label: 'Fallido' },
  };

  return (
    <div id="content-matrix-view" className="p-4 sm:p-6 space-y-5 max-w-7xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#101018] p-5 rounded-3xl border border-[#222234] shadow-xl">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl p12-gold-gradient flex items-center justify-center font-bold text-black text-sm shadow-md">
              <TableIcon className="w-5 h-5 text-black" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>Matriz de Contenido</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#1A1A28] border border-[#2E2E44] text-[#E5C158]">
                  {data?.posts?.length || 0} piezas totales
                </span>
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Importa, normaliza y programa tus parrillas de contenido conectadas directamente con el Calendario.
              </p>
            </div>
          </div>
        </div>

        {/* Global Matrix Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Download Official Template */}
          <button
            onClick={downloadExcelTemplate}
            className="px-3.5 py-2 rounded-xl bg-[#161624] hover:bg-[#1E1E30] text-[#E5C158] border border-[#2E2E44] text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            title="Descargar plantilla Excel oficial con columnas estandarizadas"
          >
            <Download className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Descargar Plantilla Excel</span>
          </button>

          {/* Import File Button */}
          <label className="cursor-pointer px-3.5 py-2 rounded-xl p12-gold-gradient text-black text-xs font-bold flex items-center gap-1.5 hover:brightness-105 transition-all shadow-md cursor-pointer">
            <Upload className="w-3.5 h-3.5 text-black" />
            <span>Importar XLSX / CSV</span>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
              onChange={handleImportFile}
              className="hidden"
            />
          </label>

          {/* Mass Add to Calendar */}
          <button
            onClick={handleMassAddToCalendar}
            className="px-3.5 py-2 rounded-xl bg-sky-950/40 hover:bg-sky-900/60 text-sky-300 border border-sky-500/40 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            title="Agregar todas las publicaciones filtradas al calendario"
          >
            <CalendarPlus className="w-3.5 h-3.5 text-sky-400" />
            <span>Agregar al Calendario ({filteredPosts.length})</span>
          </button>
        </div>
      </div>

      {/* Control Bar: Filters & Search */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-[#12121C] p-4 rounded-2xl border border-[#222234] shadow-md">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por título, hook, copy o CTA..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-[#2A2A3E] bg-[#161624] text-white placeholder-slate-500 focus:border-[#D4AF37] outline-none transition-colors"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Brand Selector */}
          <div className="flex items-center gap-1 bg-[#161624] border border-[#2A2A3E] rounded-xl px-2.5 py-1.5">
            <Building2 className="w-3.5 h-3.5 text-[#D4AF37]" />
            <select
              value={selectedBrandFilter}
              onChange={(e) => setSelectedBrandFilter(e.target.value)}
              className="text-xs font-medium bg-transparent text-slate-200 outline-none cursor-pointer"
            >
              <option value="ALL">Todas las marcas</option>
              {(data?.brands || []).map((b) => (
                <option key={b.id} value={b.id} className="bg-[#141420]">
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* Formats */}
          <select
            value={formatFilter}
            onChange={(e) => setFormatFilter(e.target.value)}
            className="text-xs p-2 rounded-xl border border-[#2A2A3E] bg-[#161624] text-slate-200 outline-none cursor-pointer"
          >
            <option value="ALL">Todos los formatos</option>
            <option value="Carousel">Carrusel</option>
            <option value="Reel">Reel</option>
            <option value="Static Post">Estático</option>
            <option value="LinkedIn Post">LinkedIn</option>
            <option value="Story">Historia</option>
          </select>

          {/* Pillars */}
          <select
            value={pillarFilter}
            onChange={(e) => setPillarFilter(e.target.value)}
            className="text-xs p-2 rounded-xl border border-[#2A2A3E] bg-[#161624] text-slate-200 outline-none cursor-pointer"
          >
            <option value="ALL">Todos los pilares</option>
            <option value="Marketing Digital">Marketing Digital</option>
            <option value="Asistencia Virtual">Asistencia Virtual</option>
            <option value="Educativo">Educativo</option>
            <option value="Venta">Venta</option>
            <option value="Autoridad">Autoridad</option>
            <option value="Conversión">Conversión</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs p-2 rounded-xl border border-[#2A2A3E] bg-[#161624] text-slate-200 outline-none cursor-pointer"
          >
            <option value="ALL">Todos los estados</option>
            <option value="DRAFT">Borradores</option>
            <option value="IN_REVIEW">En Revisión</option>
            <option value="APPROVED">Aprobados</option>
            <option value="SCHEDULED">Programados</option>
            <option value="PUBLISHED">Publicados</option>
          </select>

          {/* Export Buttons */}
          <button
            onClick={exportToExcel}
            className="text-xs font-semibold px-3 py-2 rounded-xl border border-[#2A2A3E] text-slate-200 hover:text-white hover:bg-[#1A1A28] flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Exportar registros filtrados a Excel"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Exportar Excel</span>
          </button>

          <button
            onClick={exportToCSV}
            className="text-xs font-semibold px-3 py-2 rounded-xl border border-[#2A2A3E] text-slate-200 hover:text-white hover:bg-[#1A1A28] flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Exportar a CSV"
          >
            <Download className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>CSV</span>
          </button>
        </div>
      </div>

      {/* Bulk Selection Bar */}
      {selectedIds.length > 0 && (
        <div className="p-3 bg-[#181826] border border-[#2A2A3E] rounded-xl flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-[#D4AF37]" />
            <span className="text-xs font-bold text-white">
              {selectedIds.length} {selectedIds.length === 1 ? 'publicación seleccionada' : 'publicaciones seleccionadas'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleMassAddToCalendar}
              className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <CalendarPlus className="w-3.5 h-3.5" />
              <span>Programar seleccionadas ({selectedIds.length})</span>
            </button>
            <button
              onClick={() => setSelectedIds([])}
              className="px-3 py-1.5 rounded-lg border border-[#32324A] text-slate-300 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              Deseleccionar
            </button>
            <button
              onClick={handleBulkDelete}
              className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Eliminar ({selectedIds.length})</span>
            </button>
          </div>
        </div>
      )}

      {/* Matrix Table */}
      <div className="bg-[#12121C] rounded-2xl border border-[#222234] shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#161624] border-b border-[#222234] text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-3 w-10 text-center">
                  <button
                    type="button"
                    onClick={toggleSelectAll}
                    className="cursor-pointer text-slate-400 hover:text-white"
                  >
                    {selectedIds.length === filteredPosts.length && filteredPosts.length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-[#D4AF37]" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-500" />
                    )}
                  </button>
                </th>
                <th className="py-3 px-4">Fecha & Hora</th>
                <th className="py-3 px-3">Cliente / Marca</th>
                <th className="py-3 px-3">Formato</th>
                <th className="py-3 px-3">Pilar</th>
                <th className="py-3 px-4 min-w-[180px]">Título / Tema</th>
                <th className="py-3 px-4 min-w-[200px]">Gancho / Hook (3s)</th>
                <th className="py-3 px-4 min-w-[220px]">Caption / Copy</th>
                <th className="py-3 px-3 min-w-[140px]">CTA</th>
                <th className="py-3 px-3">Estado</th>
                <th className="py-3 px-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E1E2E]">
              {filteredPosts.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-500">
                    No hay publicaciones en la matriz con los filtros aplicados.
                  </td>
                </tr>
              ) : (
                filteredPosts.map((post) => {
                  const isSelected = selectedIds.includes(post.id);
                  const statusStyle = statusColors[post.status] || {
                    bg: 'bg-slate-800',
                    text: 'text-slate-300',
                    label: post.status
                  };
                  const brand = (data?.brands || []).find((b) => b.id === post.brandId);

                  return (
                    <tr
                      key={post.id}
                      onClick={() => openPostDetail(post)}
                      className={`hover:bg-[#181826] cursor-pointer transition-colors group ${
                        isSelected ? 'bg-[#181828]' : ''
                      }`}
                    >
                      <td className="py-3 px-3 text-center" onClick={(e) => toggleSelectPost(post.id, e)}>
                        <button type="button" className="cursor-pointer text-slate-400 hover:text-white">
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-[#D4AF37]" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-500" />
                          )}
                        </button>
                      </td>

                      <td className="py-3 px-4 font-semibold text-slate-200 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span>{post.date}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingSchedulePost(post);
                              setEditDate(post.date);
                              setEditTime(post.time || '11:00');
                            }}
                            className="text-slate-500 hover:text-amber-400 p-0.5 rounded"
                            title="Cambiar fecha / hora"
                          >
                            <Clock className="w-3 h-3" />
                          </button>
                        </div>
                        <span className="text-[10px] text-slate-400 font-normal">{post.time}</span>
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="font-semibold text-zinc-300 text-[11px] bg-[#1A1A26] px-2 py-0.5 rounded border border-[#27273A]">
                          {brand?.name || 'Pixel 12'}
                        </span>
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="font-extrabold px-2 py-0.5 rounded bg-[#1A1A28] text-amber-400 border border-amber-500/20 text-[10px]">
                          {post.format}
                        </span>
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="font-semibold text-slate-300 bg-[#1E1E2C] px-2 py-0.5 rounded border border-[#2A2A3E] text-[10px]">
                          {post.pillar}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-bold text-white group-hover:text-[#D4AF37] transition-colors leading-snug">
                        {post.internalTitle || post.theme}
                      </td>

                      <td className="py-3 px-4 text-amber-200/90 font-medium italic text-[11px] leading-relaxed">
                        "{post.hook}"
                      </td>

                      <td className="py-3 px-4 text-slate-300 line-clamp-2 text-[11px] leading-relaxed">
                        {post.caption}
                      </td>

                      <td className="py-3 px-3 text-slate-300 font-medium text-[11px]">
                        {post.cta}
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusStyle.bg} ${statusStyle.text}`}
                        >
                          {statusStyle.label}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          {/* Add to Calendar button */}
                          {post.status !== 'SCHEDULED' && post.status !== 'PUBLISHED' ? (
                            <button
                              onClick={(e) => handleScheduleSingle(post, e)}
                              className="px-2 py-1 rounded-md bg-sky-950/40 hover:bg-sky-900/60 text-sky-300 border border-sky-500/40 text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                              title="Agregar y programar en Calendario"
                            >
                              <CalendarPlus className="w-3 h-3 text-sky-400" />
                              <span>Programar</span>
                            </button>
                          ) : (
                            <span
                              className="px-2 py-1 rounded-md bg-emerald-950/30 text-emerald-400 border border-emerald-500/30 text-[10px] font-semibold flex items-center gap-1"
                              title="Publicación activa en Calendario"
                            >
                              <Calendar className="w-3 h-3 text-emerald-400" />
                              <span>En Calendario</span>
                            </span>
                          )}

                          <button
                            onClick={() => openPostDetail(post)}
                            className="p-1.5 text-slate-400 hover:text-[#D4AF37] hover:bg-[#1A1A28] rounded transition-colors"
                            title="Editar detalle de la pieza"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={async () => {
                              if (window.confirm(`¿Eliminar la publicación "${post.internalTitle}"?`)) {
                                await deletePost(post.id);
                                setSelectedIds((prev) => prev.filter((id) => id !== post.id));
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors"
                            title="Eliminar publicación"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-[#141420] border-t border-[#222234] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
          <span>Mostrando {filteredPosts.length} publicaciones</span>
          <span>
            Parrilla activa: <strong className="text-white">{activeBrand.name}</strong>
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: VISTA PREVIA Y VALIDACIÓN DE IMPORTACIÓN EXCEL / CSV              */}
      {/* ========================================================================= */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#101018] border border-[#28283C] rounded-3xl p-6 max-w-4xl w-full shadow-2xl space-y-5 max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-[#222234] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl p12-gold-gradient flex items-center justify-center text-black font-bold shrink-0">
                  <FileSpreadsheet className="w-5 h-5 text-black" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>Validación de Importación: {importFileName}</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#1C1C2A] text-amber-400 border border-amber-500/30">
                      Hoja: {importDetectedSheet}
                    </span>
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Se analizaron las 13 columnas estandarizadas y se verificó la integridad de cada fila.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsImportModalOpen(false)}
                className="text-zinc-400 hover:text-white text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Metrics & Duplicates Control */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="bg-[#161624] p-3 rounded-xl border border-[#262638]">
                <span className="text-[11px] text-zinc-400">Total Filas</span>
                <p className="text-lg font-bold text-white">{parsedRows.length}</p>
              </div>

              <div className="bg-emerald-950/20 p-3 rounded-xl border border-emerald-500/30">
                <span className="text-[11px] text-emerald-400">Filas Válidas</span>
                <p className="text-lg font-bold text-emerald-300">
                  {parsedRows.filter((r) => r.isValid).length}
                </p>
              </div>

              <div className="bg-amber-950/20 p-3 rounded-xl border border-amber-500/30">
                <span className="text-[11px] text-amber-400">Posibles Duplicados</span>
                <p className="text-lg font-bold text-amber-300">
                  {parsedRows.filter((r) => r.isDuplicate).length}
                </p>
              </div>

              <div className="bg-rose-950/20 p-3 rounded-xl border border-rose-500/30">
                <span className="text-[11px] text-rose-400">Filas con Errores</span>
                <p className="text-lg font-bold text-rose-300">
                  {parsedRows.filter((r) => !r.isValid).length}
                </p>
              </div>
            </div>

            {/* Duplicate Strategy Option */}
            <div className="bg-[#161624] p-3.5 rounded-xl border border-[#28283C] space-y-2">
              <div className="text-xs font-bold text-zinc-200">
                Gestión de Duplicados (cliente + fecha + plataforma + tema):
              </div>
              <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-300">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="dupStrategy"
                    checked={duplicateStrategy === 'skip'}
                    onChange={() => setDuplicateStrategy('skip')}
                    className="accent-[#D4AF37]"
                  />
                  <span>Omitir duplicados existentes (Recomendado)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="dupStrategy"
                    checked={duplicateStrategy === 'update'}
                    onChange={() => setDuplicateStrategy('update')}
                    className="accent-[#D4AF37]"
                  />
                  <span>Actualizar publicaciones existentes</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="dupStrategy"
                    checked={duplicateStrategy === 'create'}
                    onChange={() => setDuplicateStrategy('create')}
                    className="accent-[#D4AF37]"
                  />
                  <span>Crear como nuevas de todos modos</span>
                </label>
              </div>
            </div>

            {/* Rows Table Preview */}
            <div className="flex-1 overflow-y-auto border border-[#222234] rounded-xl bg-[#12121C]">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#181826] sticky top-0 border-b border-[#222234] text-zinc-400 text-[10px] font-bold uppercase">
                  <tr>
                    <th className="p-3 w-16 text-center">Fila</th>
                    <th className="p-3">Estado</th>
                    <th className="p-3">Fecha</th>
                    <th className="p-3">Cliente</th>
                    <th className="p-3">Tema / Título</th>
                    <th className="p-3">Formato / Pilar</th>
                    <th className="p-3">Detalle / Diagnóstico</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1F1F2E]">
                  {parsedRows.map((row) => (
                    <tr
                      key={row.rowNumber}
                      className={`hover:bg-[#161624] ${
                        !row.isValid
                          ? 'bg-rose-950/15'
                          : row.isDuplicate
                          ? 'bg-amber-950/10'
                          : ''
                      }`}
                    >
                      <td className="p-3 text-center font-mono text-zinc-400">
                        #{row.rowNumber}
                      </td>

                      <td className="p-3 whitespace-nowrap">
                        {row.isValid ? (
                          <span className="px-2 py-0.5 rounded bg-emerald-950/40 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                            Válida
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-rose-950/40 text-rose-300 border border-rose-500/30 text-[10px] font-bold">
                            Error
                          </span>
                        )}
                      </td>

                      <td className="p-3 font-semibold text-zinc-200 whitespace-nowrap">
                        {row.post?.date || (row.raw['FECHA'] ? String(row.raw['FECHA']) : '—')}
                      </td>

                      <td className="p-3 text-zinc-300 whitespace-nowrap">
                        {row.targetBrandName}
                      </td>

                      <td className="p-3 font-bold text-white max-w-[200px] truncate">
                        {row.post?.internalTitle || row.raw['TEMA'] || row.raw['TITULO'] || '—'}
                      </td>

                      <td className="p-3 whitespace-nowrap text-zinc-300">
                        <span className="font-semibold text-amber-400">{row.post?.format || 'Carousel'}</span>
                        <span className="text-zinc-500 mx-1">/</span>
                        <span className="text-zinc-400">{row.post?.pillar || 'Educativo'}</span>
                      </td>

                      <td className="p-3">
                        {(row.errors || []).length > 0 && (
                          <div className="space-y-0.5">
                            {(row.errors || []).map((err, i) => (
                              <div key={i} className="text-rose-400 font-semibold text-[11px] flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3 shrink-0" />
                                <span>{err}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {(row.errors || []).length === 0 && (row.warnings || []).length > 0 && (
                          <div className="text-amber-400 text-[11px]">
                            {row.warnings[0]}
                          </div>
                        )}
                        {(row.errors || []).length === 0 && (row.warnings || []).length === 0 && (
                          <span className="text-emerald-400 text-[11px] flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Correcta</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-[#222234]">
              <span className="text-xs text-zinc-400">
                Se importarán únicamente las filas válidas (
                <strong className="text-white font-bold">
                  {parsedRows.filter((r) => r.isValid).length} de {parsedRows.length}
                </strong>
                ).
              </span>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(false)}
                  disabled={isProcessingImport}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleExecuteImport}
                  disabled={isProcessingImport || parsedRows.filter((r) => r.isValid).length === 0}
                  className="px-5 py-2.5 rounded-xl p12-gold-gradient text-black font-bold text-xs hover:brightness-105 transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-40"
                >
                  {isProcessingImport ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Guardando en Matriz...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-black" />
                      <span>
                        Confirmar e Importar ({parsedRows.filter((r) => r.isValid).length} publicaciones)
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CAMBIO RÁPIDO DE FECHA / HORA PARA CALENDARIO                      */}
      {/* ========================================================================= */}
      {editingSchedulePost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#12121C] border border-[#28283C] rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#222234] pb-3">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#D4AF37]" />
                <span>Programar en Calendario</span>
              </h3>
              <button
                onClick={() => setEditingSchedulePost(null)}
                className="text-zinc-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <div>
              <p className="text-xs text-zinc-400 font-semibold">Publicación:</p>
              <p className="text-xs text-white font-bold truncate mt-0.5">
                {editingSchedulePost.internalTitle}
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Fecha de publicación</label>
                <input
                  type="date"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl bg-[#161624] border border-[#2A2A3E] text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Hora de publicación</label>
                <input
                  type="time"
                  value={editTime}
                  onChange={(e) => setEditTime(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl bg-[#161624] border border-[#2A2A3E] text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#222234]">
              <button
                onClick={() => setEditingSchedulePost(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveScheduleEdit}
                className="px-4 py-2 rounded-xl p12-gold-gradient text-black font-bold text-xs hover:brightness-105"
              >
                Guardar y Sincronizar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
