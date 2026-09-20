import {
  WorkspaceData,
  Post,
  Task,
  GeneratedDesignContent,
  DesignFormatType,
  DesignPillarType,
  DesignStyleType,
  BlogPost,
  QuoteProposal,
  AgencyPlan,
  AgencyCustomService,
  CommercialSettings,
  ImageLibraryItem
} from '../types';
import { initialWorkspaceData } from './defaultData';
import { getWorkspaceFromFirestore, saveWorkspaceToFirestore } from './firebase';

export function sanitizeWorkspaceData(data: Partial<WorkspaceData> | null | undefined): WorkspaceData {
  if (!data) return initialWorkspaceData;
  return {
    ...initialWorkspaceData,
    ...data,
    brands: Array.isArray(data.brands) && data.brands.length > 0 ? data.brands : initialWorkspaceData.brands,
    members: Array.isArray(data.members) && data.members.length > 0 ? data.members : initialWorkspaceData.members,
    posts: Array.isArray(data.posts) ? data.posts : (initialWorkspaceData.posts || []),
    tasks: Array.isArray(data.tasks) ? data.tasks : (initialWorkspaceData.tasks || []),
    campaigns: Array.isArray(data.campaigns) ? data.campaigns : (initialWorkspaceData.campaigns || []),
    notifications: Array.isArray(data.notifications) ? data.notifications : (initialWorkspaceData.notifications || []),
    invitations: Array.isArray(data.invitations) ? data.invitations : [],
    quotes: Array.isArray(data.quotes) ? data.quotes : (initialWorkspaceData.quotes || []),
    plans: Array.isArray(data.plans) ? data.plans : (initialWorkspaceData.plans || []),
    customServices: Array.isArray(data.customServices) ? data.customServices : (initialWorkspaceData.customServices || []),
    crmContacts: Array.isArray(data.crmContacts) ? data.crmContacts : (initialWorkspaceData.crmContacts || []),
    crmCompanies: Array.isArray(data.crmCompanies) ? data.crmCompanies : (initialWorkspaceData.crmCompanies || []),
    crmDeals: Array.isArray(data.crmDeals) ? data.crmDeals : (initialWorkspaceData.crmDeals || []),
    crmPipelines: Array.isArray(data.crmPipelines) ? data.crmPipelines : (initialWorkspaceData.crmPipelines || []),
    crmFollowUps: Array.isArray(data.crmFollowUps) ? data.crmFollowUps : (initialWorkspaceData.crmFollowUps || []),
    crmActivities: Array.isArray(data.crmActivities) ? data.crmActivities : (initialWorkspaceData.crmActivities || []),
    blogPosts: Array.isArray(data.blogPosts) ? data.blogPosts : (initialWorkspaceData.blogPosts || []),
    auditLogs: Array.isArray(data.auditLogs) ? data.auditLogs : (initialWorkspaceData.auditLogs || []),
  };
}

export async function getWorkspace(): Promise<WorkspaceData> {
  // 1. First attempt: Read primary live data from Firebase Firestore
  try {
    const firestoreData = await getWorkspaceFromFirestore();
    if (firestoreData && firestoreData.brands && firestoreData.brands.length > 0) {
      const sanitized = sanitizeWorkspaceData(firestoreData);
      localStorage.setItem('pixel12_workspace_cache', JSON.stringify(sanitized));
      return sanitized;
    }
  } catch (err) {
    console.warn('[Firestore] Error reading from primary cloud database:', err);
  }

  // 2. Second attempt: Fetch server workspace.json and auto-migrate to Firestore
  try {
    const res = await fetch('/api/workspace');
    if (res.ok) {
      const serverData: WorkspaceData = await res.json();
      if (serverData && serverData.brands) {
        const sanitized = sanitizeWorkspaceData(serverData);
        // Safe auto-migration to Firestore so cloud database is populated
        saveWorkspaceToFirestore(sanitized).catch((e) =>
          console.warn('[Migration] Could not auto-sync server data to Firestore:', e)
        );
        localStorage.setItem('pixel12_workspace_cache', JSON.stringify(sanitized));
        return sanitized;
      }
    }
  } catch (err) {
    console.warn('Using local fallback workspace data:', err);
  }

  // 3. Fallback: LocalStorage cache
  const local = localStorage.getItem('pixel12_workspace_cache');
  if (local) {
    try {
      return sanitizeWorkspaceData(JSON.parse(local));
    } catch (e) {
      // ignore
    }
  }
  return initialWorkspaceData;
}

export async function saveWorkspace(data: WorkspaceData): Promise<boolean> {
  // Update local cache immediately
  try {
    localStorage.setItem('pixel12_workspace_cache', JSON.stringify(data));
  } catch (e) {
    // ignore
  }

  // 1. Primary write: Firebase Firestore
  let firestoreSuccess = false;
  try {
    firestoreSuccess = await saveWorkspaceToFirestore(data);
  } catch (err) {
    console.warn('[Firestore] Could not write to Firestore:', err);
  }

  // 2. Secondary backup write: server workspace.json
  try {
    const res = await fetch('/api/workspace', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return firestoreSuccess || res.ok;
  } catch (err) {
    console.error('Error saving workspace to server:', err);
    return firestoreSuccess;
  }
}

export async function resetWorkspaceData(): Promise<WorkspaceData> {
  try {
    const res = await fetch('/api/workspace/reset', { method: 'POST' });
    const data = await res.json();
    localStorage.removeItem('pixel12_workspace_cache');
    return data.data || initialWorkspaceData;
  } catch (err) {
    localStorage.removeItem('pixel12_workspace_cache');
    return initialWorkspaceData;
  }
}

export interface FullCampaignAIResponse {
  strategySummary: string;
  targetAudience: string;
  contentPillars: string[];
  weeklyFrequency: string;
  posts: Array<{
    internalTitle: string;
    date: string;
    time: string;
    platforms: Array<'instagram' | 'facebook' | 'linkedin' | 'youtube' | 'tiktok'>;
    format: any;
    pillar: any;
    theme: string;
    objective: string;
    hook: string;
    caption: string;
    cta: string;
    hashtags: string[];
    visualText?: string;
    visualDescription?: string;
    imagePrompt?: string;
    script?: string;
  }>;
  tasks: Array<{
    title: string;
    description: string;
    assignedRole: 'Designer' | 'Copywriter' | 'Community Manager';
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    daysBeforePost: number;
  }>;
}

export async function generateFullCampaignAI(params: {
  prompt: string;
  brandName: string;
  targetMonth?: string;
  targetPlatforms?: string[];
  frequency?: string;
  tone?: string;
  postCount?: number;
}): Promise<FullCampaignAIResponse> {
  const res = await fetch('/api/ai/full-campaign', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Error del servidor' }));
    throw new Error(err.error || 'Fallo al generar campaña con IA');
  }

  return await res.json();
}

export async function chatWithCopilotAI(params: {
  message: string;
  history?: Array<{ role: string; content?: string; text?: string }>;
  brandName?: string;
  brandVoice?: string;
  brandAudience?: string;
}): Promise<{ response: string }> {
  const res = await fetch('/api/ai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: params.message,
      history: params.history || [],
      brandName: params.brandName || 'Pixel 12',
      brandVoice: params.brandVoice,
      brandAudience: params.brandAudience,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: 'Error al conectar con el copiloto de IA' }));
    throw new Error(errorData.error || 'Error al conectar con el copiloto de IA');
  }

  const data = await res.json();
  return { response: data.reply || '' };
}

export async function sendCopilotChat(
  message: string,
  history: Array<{ role: string; text: string }>,
  brandName: string
): Promise<string> {
  const res = await chatWithCopilotAI({ message, history, brandName });
  return res.response;
}

export async function repurposePostAI(
  originalPost: Post,
  targetFormat: string,
  targetPlatform: string
) {
  const res = await fetch('/api/ai/repurpose', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ originalPost, targetFormat, targetPlatform }),
  });

  if (!res.ok) {
    throw new Error('Error al adaptar contenido');
  }

  return await res.json();
}

export async function publishPostToSocial(postId: string, platforms: string[]) {
  const res = await fetch('/api/social/publish', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ postId, platforms }),
  });

  return await res.json();
}

export async function generateDesignContentAI(params: {
  format: DesignFormatType;
  pillar: DesignPillarType;
  style: DesignStyleType;
  topic: string;
  brandName?: string;
  authorName?: string;
}): Promise<GeneratedDesignContent> {
  const res = await fetch('/api/ai/design-content', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: 'Error al generar diseño y contenido' }));
    throw new Error(errorData.error || 'Error al conectar con la IA de diseño');
  }

  return await res.json();
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  try {
    const res = await fetch('/api/blog-posts');
    if (!res.ok) throw new Error('Failed to fetch blog posts');
    return await res.json();
  } catch (e) {
    console.warn('Error fetching blog posts from server:', e);
    return [];
  }
}

export async function saveBlogPost(post: Partial<BlogPost>): Promise<BlogPost> {
  const res = await fetch('/api/blog-posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(post)
  });
  if (!res.ok) throw new Error('Error al guardar el artículo de blog');
  const json = await res.json();
  return json.post;
}

export async function updateBlogPostApi(id: string, updates: Partial<BlogPost>): Promise<BlogPost> {
  const res = await fetch(`/api/blog-posts/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });
  if (!res.ok) throw new Error('Error al actualizar el artículo de blog');
  const json = await res.json();
  return json.post;
}

export async function deleteBlogPostApi(id: string): Promise<boolean> {
  const res = await fetch(`/api/blog-posts/${id}`, { method: 'DELETE' });
  return res.ok;
}

export async function generateBlogAI(params: {
  topic?: string;
  sourceUrl?: string;
  sourceType: 'topic' | 'url';
  category?: string;
  tone?: string;
  author?: string;
  authorRole?: string;
  targetLength?: number;
  brandId?: string;
}): Promise<BlogPost> {
  const res = await fetch('/api/ai/blog', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Error en generación de blog' }));
    throw new Error(err.error || 'Error al conectar con la IA de blog');
  }
  return await res.json();
}

// ---------------- POST DESIGN GENERATION & SLIDE REGENERATION ----------------
export async function generatePostDesignAI(postId: string): Promise<{
  success: boolean;
  post: Post;
  aiCredits: number;
  message: string;
}> {
  const res = await fetch('/api/ai/generate-post-design', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ postId })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Error al generar el diseño' }));
    throw new Error(err.error || 'Error al generar el diseño con IA');
  }
  return await res.json();
}

export async function regenerateSingleSlideAI(
  postId: string,
  slideIndex: number,
  changePrompt: string
): Promise<{
  success: boolean;
  slide: any;
  post: Post;
  aiCredits: number;
  message: string;
}> {
  const res = await fetch('/api/ai/regenerate-single-slide', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ postId, slideIndex, changePrompt })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Error al rehacer la slide' }));
    throw new Error(err.error || 'Error al rehacer la slide con IA');
  }
  return await res.json();
}

export async function regenerateAllSlidesAI(postId: string): Promise<{
  success: boolean;
  post: Post;
  aiCredits: number;
  message: string;
}> {
  const res = await fetch('/api/ai/regenerate-all-slides', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ postId })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Error al regenerar el carrusel' }));
    throw new Error(err.error || 'Error al regenerar el carrusel con IA');
  }
  return await res.json();
}

// ---------------- COTIZACIONES & PROPUESTAS API ----------------
export async function getQuotesApi(): Promise<QuoteProposal[]> {
  try {
    const res = await fetch('/api/quotes');
    if (!res.ok) throw new Error('Failed to fetch quotes');
    return await res.json();
  } catch (e) {
    console.warn('Error fetching quotes from server:', e);
    return [];
  }
}

export async function saveQuoteApi(quote: Partial<QuoteProposal>): Promise<QuoteProposal> {
  const res = await fetch('/api/quotes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(quote)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Error al guardar la cotización' }));
    throw new Error(err.error || 'Error al guardar la cotización');
  }
  const json = await res.json();
  return json.quote;
}

export async function deleteQuoteApi(id: string): Promise<boolean> {
  const res = await fetch(`/api/quotes/${id}`, { method: 'DELETE' });
  return res.ok;
}

export async function generateQuoteProposalAI(params: {
  prompt: string;
  client: {
    name: string;
    company: string;
    email?: string;
    phone?: string;
    cityCountry?: string;
    sector?: string;
  };
  selectedPlanIds?: string[];
  selectedServiceIds?: string[];
  customNeeds?: string;
  budgetExpectation?: string;
  brandName?: string;
}): Promise<QuoteProposal> {
  const res = await fetch('/api/quotes/generate-ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Error al generar la propuesta con IA' }));
    throw new Error(err.error || 'Error al generar la cotización con IA');
  }
  const json = await res.json();
  return json.proposal;
}

// ---------------- GENERADOR DE IMÁGENES CON IA ----------------
export interface GenerateQuoteImageParams {
  type: string;
  objective?: string;
  client?: string;
  sector?: string;
  targetAudience?: string;
  service?: string;
  style?: string;
  tone?: string;
  aspectRatio?: '1:1' | '4:5' | '16:9' | '9:16';
  prompt?: string;
  brandName?: string;
}

export async function generateQuoteImageAI(params: GenerateQuoteImageParams): Promise<{
  id: string;
  title: string;
  imageUrl: string;
  prompt: string;
  category: any;
  aspectRatio: '1:1' | '4:5' | '16:9' | '9:16';
  style: string;
  tags: string[];
  sector?: string;
  visualDirection?: string;
}> {
  const res = await fetch('/api/ai/generate-quote-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Error al generar imagen con IA' }));
    throw new Error(err.error || 'Error al generar la imagen');
  }
  return await res.json();
}

// ---------------- CATÁLOGO DE PLANES Y SERVICIOS ----------------
export async function getPlansApi(): Promise<AgencyPlan[]> {
  const res = await fetch('/api/plans');
  if (!res.ok) return [];
  return await res.json();
}

export async function savePlanApi(plan: AgencyPlan): Promise<AgencyPlan> {
  const res = await fetch('/api/plans', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(plan)
  });
  if (!res.ok) throw new Error('Error al guardar plan');
  const json = await res.json();
  return json.plan;
}

export async function deletePlanApi(id: string): Promise<boolean> {
  const res = await fetch(`/api/plans/${id}`, { method: 'DELETE' });
  return res.ok;
}

export async function getServicesApi(): Promise<AgencyCustomService[]> {
  const res = await fetch('/api/services');
  if (!res.ok) return [];
  return await res.json();
}

export async function saveServiceApi(service: AgencyCustomService): Promise<AgencyCustomService> {
  const res = await fetch('/api/services', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(service)
  });
  if (!res.ok) throw new Error('Error al guardar servicio');
  const json = await res.json();
  return json.service;
}

export async function deleteServiceApi(id: string): Promise<boolean> {
  const res = await fetch(`/api/services/${id}`, { method: 'DELETE' });
  return res.ok;
}

export async function saveCommercialSettingsApi(settings: Partial<CommercialSettings>): Promise<CommercialSettings> {
  const res = await fetch('/api/commercial-settings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings)
  });
  if (!res.ok) throw new Error('Error al guardar ajustes comerciales');
  const json = await res.json();
  return json.settings;
}

export async function getImageLibraryApi(): Promise<ImageLibraryItem[]> {
  const res = await fetch('/api/library/images');
  if (!res.ok) return [];
  return await res.json();
}

export async function saveImageToLibraryApi(item: Partial<ImageLibraryItem>): Promise<ImageLibraryItem> {
  const res = await fetch('/api/library/images', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item)
  });
  if (!res.ok) throw new Error('Error al guardar imagen en biblioteca');
  const json = await res.json();
  return json.item;
}

export async function deleteImageFromLibraryApi(id: string): Promise<boolean> {
  const res = await fetch(`/api/library/images/${id}`, { method: 'DELETE' });
  return res.ok;
}

// ---------------- CRM GOHIGHLEVEL-STYLE API ----------------
import type {
  CrmContact,
  CrmCompany,
  CrmDeal,
  CrmPipeline,
  CrmActivity,
  CrmFollowUp,
  CommercialAIGenerateRequest,
  CommercialAIGenerateResponse
} from '../types/crm';

export async function getCrmAllApi(): Promise<{
  contacts: CrmContact[];
  companies: CrmCompany[];
  deals: CrmDeal[];
  pipelines: CrmPipeline[];
  activities: CrmActivity[];
  followUps: CrmFollowUp[];
}> {
  const res = await fetch('/api/crm/all');
  if (!res.ok) throw new Error('Error al cargar datos de CRM');
  return await res.json();
}

export async function saveCrmContactApi(contact: CrmContact): Promise<CrmContact> {
  const res = await fetch('/api/crm/contacts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(contact)
  });
  if (!res.ok) throw new Error('Error al guardar contacto en CRM');
  const json = await res.json();
  return json.contact;
}

export async function deleteCrmContactApi(id: string): Promise<boolean> {
  const res = await fetch(`/api/crm/contacts/${id}`, { method: 'DELETE' });
  return res.ok;
}

export async function saveCrmCompanyApi(company: CrmCompany): Promise<CrmCompany> {
  const res = await fetch('/api/crm/companies', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(company)
  });
  if (!res.ok) throw new Error('Error al guardar empresa en CRM');
  const json = await res.json();
  return json.company;
}

export async function deleteCrmCompanyApi(id: string): Promise<boolean> {
  const res = await fetch(`/api/crm/companies/${id}`, { method: 'DELETE' });
  return res.ok;
}

export async function saveCrmDealApi(deal: CrmDeal): Promise<CrmDeal> {
  const res = await fetch('/api/crm/deals', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(deal)
  });
  if (!res.ok) throw new Error('Error al guardar oportunidad');
  const json = await res.json();
  return json.deal;
}

export async function updateCrmDealStageApi(
  id: string,
  stageId: string,
  extras?: { lostReason?: string; probability?: number }
): Promise<CrmDeal> {
  const res = await fetch(`/api/crm/deals/${id}/stage`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ stageId, ...extras })
  });
  if (!res.ok) throw new Error('Error al actualizar etapa de la oportunidad');
  const json = await res.json();
  return json.deal;
}

export async function deleteCrmDealApi(id: string): Promise<boolean> {
  const res = await fetch(`/api/crm/deals/${id}`, { method: 'DELETE' });
  return res.ok;
}

export async function saveCrmPipelineApi(pipeline: CrmPipeline): Promise<CrmPipeline> {
  const res = await fetch('/api/crm/pipelines', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(pipeline)
  });
  if (!res.ok) throw new Error('Error al guardar pipeline');
  const json = await res.json();
  return json.pipeline;
}

export async function deleteCrmPipelineApi(id: string): Promise<boolean> {
  const res = await fetch(`/api/crm/pipelines/${id}`, { method: 'DELETE' });
  return res.ok;
}

export async function saveCrmFollowUpApi(followUp: CrmFollowUp): Promise<CrmFollowUp> {
  const res = await fetch('/api/crm/follow-ups', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(followUp)
  });
  if (!res.ok) throw new Error('Error al guardar seguimiento');
  const json = await res.json();
  return json.followUp;
}

export async function updateCrmFollowUpStatusApi(
  id: string,
  status: 'PENDING' | 'DONE' | 'CANCELLED'
): Promise<CrmFollowUp> {
  const res = await fetch(`/api/crm/follow-ups/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  if (!res.ok) throw new Error('Error al actualizar seguimiento');
  const json = await res.json();
  return json.followUp;
}

export async function deleteCrmFollowUpApi(id: string): Promise<boolean> {
  const res = await fetch(`/api/crm/follow-ups/${id}`, { method: 'DELETE' });
  return res.ok;
}

export async function saveCrmActivityApi(activity: CrmActivity): Promise<CrmActivity> {
  const res = await fetch('/api/crm/activities', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(activity)
  });
  if (!res.ok) throw new Error('Error al guardar actividad');
  const json = await res.json();
  return json.activity;
}

export async function generateCommercialAIApi(
  req: CommercialAIGenerateRequest
): Promise<CommercialAIGenerateResponse> {
  const res = await fetch('/api/ai/commercial-generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Error al generar contenido comercial con IA' }));
    throw new Error(err.error || 'Error al generar contenido comercial');
  }
  return await res.json();
}

// ---------------- GESTIÓN DE EQUIPO & INVITACIONES (CLIENTE) ----------------

export interface InviteMemberResponse {
  success: boolean;
  emailSent: boolean;
  emailDeliveryError?: string;
  inviteUrl: string;
  token: string;
  message?: string;
}

export async function inviteTeamMemberApi(payload: {
  email: string;
  name: string;
  role: string;
  invitedBy?: { id: string; name: string; email: string };
}): Promise<InviteMemberResponse> {
  const res = await fetch('/api/team/invite', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Error al enviar la invitación');
  }
  return data;
}

export async function resendTeamInvitationApi(payload: {
  memberId?: string;
  email?: string;
}): Promise<InviteMemberResponse> {
  const res = await fetch('/api/team/resend-invite', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Error al reenviar la invitación');
  }
  return data;
}

export async function deactivateTeamMemberApi(memberId: string, callerRole?: string): Promise<{ success: boolean; message: string; member?: any; members?: any[] }> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (callerRole) headers['x-user-role'] = callerRole;

  const res = await fetch('/api/team/deactivate', {
    method: 'POST',
    headers,
    body: JSON.stringify({ memberId })
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Error al desactivar el miembro');
  }
  return data;
}

export async function reactivateTeamMemberApi(memberId: string, callerRole?: string): Promise<{ success: boolean; message: string; member?: any; members?: any[] }> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (callerRole) headers['x-user-role'] = callerRole;

  const res = await fetch('/api/team/reactivate', {
    method: 'POST',
    headers,
    body: JSON.stringify({ memberId })
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Error al reactivar el miembro');
  }
  return data;
}

export async function deleteClientApi(clientId: string, callerRole?: string): Promise<{
  success: boolean;
  message: string;
  deletedId: string;
  newActiveBrandId: string;
  remainingBrands: any[];
  stats?: { removedPosts: number; removedCampaigns: number };
}> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (callerRole) headers['x-user-role'] = callerRole;

  const res = await fetch(`/api/clients/${encodeURIComponent(clientId)}`, {
    method: 'DELETE',
    headers
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Error al eliminar cliente');
  }
  return data;
}

export async function bulkImportPostsApi(payload: {
  posts: any[];
  defaultBrandId?: string;
  duplicateStrategy?: 'skip' | 'update' | 'create';
}): Promise<{
  success: boolean;
  importedCount: number;
  updatedCount: number;
  skippedCount: number;
  totalWorkspacePosts: number;
}> {
  const res = await fetch('/api/posts/bulk', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Error en la importación masiva de publicaciones');
  }
  return data;
}

export async function verifyInvitationTokenApi(token: string): Promise<{
  valid: boolean;
  reason?: string;
  message?: string;
  invitation?: {
    email: string;
    name: string;
    role: string;
    expiresAt: string;
    invitedBy: { id: string; name: string; email: string };
  };
}> {
  const res = await fetch(`/api/invitations/verify?token=${encodeURIComponent(token)}`);
  return await res.json();
}

export async function acceptTeamInvitationApi(payload: {
  token: string;
  password: string;
  displayName: string;
}): Promise<{
  success: boolean;
  message: string;
  user: { uid: string; email: string; displayName: string; role: string };
}> {
  const res = await fetch('/api/invitations/accept', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Error al aceptar la invitación');
  }
  return data;
}

export async function checkAccountAccessApi(email: string): Promise<{
  allowed: boolean;
  reason?: string;
  message?: string;
}> {
  try {
    const res = await fetch('/api/auth/check-access', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    return await res.json();
  } catch (e) {
    return { allowed: true };
  }
}




