import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  WorkspaceData,
  Post,
  Task,
  Campaign,
  Brand,
  PostStatus,
  TaskStatus,
  NotificationItem,
  BlogPost,
  QuoteProposal,
  AgencyPlan,
  AgencyCustomService,
  CommercialSettings,
  ImageLibraryItem,
  QuoteStatus,
  CrmContact,
  CrmCompany,
  CrmDeal,
  CrmPipeline,
  CrmActivity,
  CrmFollowUp,
  CommercialAIGenerateRequest,
  CommercialAIGenerateResponse
} from '../types';
import { initialWorkspaceData } from '../lib/defaultData';
import { initialBlogPosts } from '../lib/blogData';
import {
  initialQuoteProposals,
  initialAgencyPlans,
  initialAgencyServices,
  initialCommercialSettings,
  initialImageLibraryItems
} from '../lib/quotesData';
import {
  initialCrmPipelines,
  initialCrmCompanies,
  initialCrmContacts,
  initialCrmDeals,
  initialCrmFollowUps,
  initialCrmActivities
} from '../lib/crmData';
import {
  getWorkspace,
  saveWorkspace,
  getBlogPosts,
  saveBlogPost,
  updateBlogPostApi,
  deleteBlogPostApi,
  generateBlogAI,
  generatePostDesignAI,
  regenerateSingleSlideAI,
  regenerateAllSlidesAI,
  getQuotesApi,
  saveQuoteApi,
  deleteQuoteApi,
  generateQuoteProposalAI,
  generateQuoteImageAI,
  getPlansApi,
  savePlanApi,
  deletePlanApi,
  getServicesApi,
  saveServiceApi,
  deleteServiceApi,
  saveCommercialSettingsApi,
  getImageLibraryApi,
  saveImageToLibraryApi,
  deleteImageFromLibraryApi,
  getCrmAllApi,
  saveCrmContactApi,
  deleteCrmContactApi,
  saveCrmCompanyApi,
  deleteCrmCompanyApi,
  saveCrmDealApi,
  updateCrmDealStageApi,
  deleteCrmDealApi,
  saveCrmPipelineApi,
  deleteCrmPipelineApi,
  saveCrmFollowUpApi,
  updateCrmFollowUpStatusApi,
  deleteCrmFollowUpApi,
  saveCrmActivityApi,
  generateCommercialAIApi
} from '../lib/api';

export type ViewType =
  | 'dashboard'
  | 'crm'
  | 'quotes'
  | 'blog'
  | 'design-content'
  | 'copilot'
  | 'calendar'
  | 'matrix'
  | 'posts'
  | 'tasks'
  | 'team-calendar'
  | 'my-calendar'
  | 'approvals'
  | 'campaigns'
  | 'social-accounts'
  | 'google-ads'
  | 'analytics'
  | 'brands'
  | 'team'
  | 'settings';

export type DeviceMode = 'responsive' | 'mobile' | 'tablet' | 'desktop';
export type DeviceOrientation = 'portrait' | 'landscape';

interface ToastInfo {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface WorkspaceContextType {
  data: WorkspaceData;
  isLoading: boolean;
  activeView: ViewType;
  setActiveView: (view: ViewType) => void;
  activeBrand: Brand;
  setActiveBrandId: (brandId: string) => void;
  // Mobile & Device Preview States
  isMobileDrawerOpen: boolean;
  setIsMobileDrawerOpen: (open: boolean) => void;
  toggleMobileDrawer: () => void;
  deviceMode: DeviceMode;
  setDeviceMode: (mode: DeviceMode) => void;
  deviceOrientation: DeviceOrientation;
  toggleDeviceOrientation: () => void;
  // Post Operations
  addPost: (post: Post) => Promise<void>;
  updatePost: (post: Post) => Promise<void>;
  deletePost: (postId: string) => Promise<void>;
  bulkDeletePosts: (postIds: string[]) => Promise<void>;
  changePostStatus: (postId: string, status: PostStatus, comment?: string) => Promise<void>;
  // Task Operations
  addTask: (task: Task) => Promise<void>;
  updateTask: (task: Task) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  changeTaskStatus: (taskId: string, status: TaskStatus) => Promise<void>;
  // Campaign Operations
  addCampaign: (campaign: Campaign) => Promise<void>;
  updateCampaign: (campaign: Campaign) => Promise<void>;
  // Brand Operations
  addBrand: (brand: Brand) => Promise<void>;
  updateBrand: (brand: Brand) => Promise<void>;
  // Settings
  updateSettings: (settings: Partial<WorkspaceData['workspaceSettings']>) => Promise<void>;
  // Modals
  isCreateWithAIOpen: boolean;
  openCreateWithAI: () => void;
  closeCreateWithAI: () => void;
  isManualPostOpen: boolean;
  openManualPost: () => void;
  closeManualPost: () => void;
  selectedPost: Post | null;
  openPostDetail: (post: Post) => void;
  closePostDetail: () => void;
  selectedTask: Task | null;
  openTaskDetail: (task: Task) => void;
  closeTaskDetail: () => void;
  isGlobalSearchOpen: boolean;
  openGlobalSearch: () => void;
  closeGlobalSearch: () => void;
  // Toast notifications
  toasts: ToastInfo[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  dismissToast: (id: string) => void;
  // Bulk Post Import
  bulkImportPosts: (newPosts: Post[]) => Promise<void>;
  // Blog Operations (Pixel 12 Engine)
  blogPosts: BlogPost[];
  selectedBlog: BlogPost | null;
  setSelectedBlog: (post: BlogPost | null) => void;
  isCreateBlogOpen: boolean;
  setIsCreateBlogOpen: (open: boolean) => void;
  createBlogPost: (post: Partial<BlogPost>) => Promise<BlogPost>;
  updateBlogPost: (id: string, updates: Partial<BlogPost>) => Promise<BlogPost>;
  deleteBlogPost: (id: string) => Promise<void>;
  generateBlogWithAI: (params: {
    topic?: string;
    sourceUrl?: string;
    sourceType: 'topic' | 'url';
    category?: string;
    tone?: string;
    author?: string;
    authorRole?: string;
    targetLength?: number;
    brandId?: string;
  }) => Promise<BlogPost>;
  // Post Design & Slide Regeneration (Pixel 12 Engine)
  generatePostDesign: (postId: string) => Promise<Post>;
  regenerateSingleSlide: (postId: string, slideIndex: number, changePrompt: string) => Promise<Post>;
  regenerateAllSlides: (postId: string) => Promise<Post>;
  // Quotes & Commercial Proposals (Pixel 12 OS)
  quotes: QuoteProposal[];
  plans: AgencyPlan[];
  customServices: AgencyCustomService[];
  commercialSettings: CommercialSettings;
  imageLibrary: ImageLibraryItem[];
  selectedQuote: QuoteProposal | null;
  setSelectedQuote: (quote: QuoteProposal | null) => void;
  isCreateQuoteOpen: boolean;
  setIsCreateQuoteOpen: (open: boolean) => void;
  createQuote: (quote: Partial<QuoteProposal>) => Promise<QuoteProposal>;
  updateQuote: (id: string, updates: Partial<QuoteProposal>) => Promise<QuoteProposal>;
  deleteQuote: (id: string) => Promise<void>;
  duplicateQuote: (id: string) => Promise<QuoteProposal>;
  updateQuoteStatus: (id: string, status: QuoteStatus) => Promise<void>;
  generateQuoteWithAI: (params: {
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
  }) => Promise<QuoteProposal>;
  generateImageWithAI: (params: any) => Promise<any>;
  savePlan: (plan: AgencyPlan) => Promise<void>;
  deletePlan: (planId: string) => Promise<void>;
  saveCustomService: (service: AgencyCustomService) => Promise<void>;
  deleteCustomService: (serviceId: string) => Promise<void>;
  updateCommercialSettings: (settings: Partial<CommercialSettings>) => Promise<void>;
  saveImageToLibrary: (item: Partial<ImageLibraryItem>) => Promise<ImageLibraryItem>;
  deleteImageFromLibrary: (id: string) => Promise<void>;
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  // CRM Commercial Engine (GoHighLevel style)
  crmContacts: CrmContact[];
  crmCompanies: CrmCompany[];
  crmDeals: CrmDeal[];
  crmPipelines: CrmPipeline[];
  crmActivities: CrmActivity[];
  crmFollowUps: CrmFollowUp[];
  selectedContact: CrmContact | null;
  setSelectedContact: (contact: CrmContact | null) => void;
  selectedDeal: CrmDeal | null;
  setSelectedDeal: (deal: CrmDeal | null) => void;
  saveContact: (contact: CrmContact) => Promise<CrmContact>;
  deleteContact: (id: string) => Promise<void>;
  saveCompany: (company: CrmCompany) => Promise<CrmCompany>;
  deleteCompany: (id: string) => Promise<void>;
  saveDeal: (deal: CrmDeal) => Promise<CrmDeal>;
  deleteDeal: (id: string) => Promise<void>;
  updateDealStage: (id: string, stageId: string, extras?: { lostReason?: string; probability?: number }) => Promise<void>;
  savePipeline: (pipeline: CrmPipeline) => Promise<void>;
  deletePipeline: (id: string) => Promise<void>;
  saveFollowUp: (followUp: CrmFollowUp) => Promise<void>;
  updateFollowUpStatus: (id: string, status: 'PENDING' | 'DONE' | 'CANCELLED') => Promise<void>;
  deleteFollowUp: (id: string) => Promise<void>;
  saveActivity: (activity: CrmActivity) => Promise<void>;
  generateCommercialContent: (req: CommercialAIGenerateRequest) => Promise<CommercialAIGenerateResponse>;
  isCommercialAIOpen: boolean;
  setIsCommercialAIOpen: (open: boolean) => void;
  commercialAIInitialData: any;
  openCommercialAI: (initialData?: any) => void;
  closeCommercialAI: () => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<WorkspaceData>(initialWorkspaceData);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeView, setActiveViewRaw] = useState<ViewType>('dashboard');
  const [toasts, setToasts] = useState<ToastInfo[]>([]);

  // Mobile Drawer & Device Preview states
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState<boolean>(false);
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('responsive');
  const [deviceOrientation, setDeviceOrientation] = useState<DeviceOrientation>('portrait');

  const toggleMobileDrawer = useCallback(() => {
    setIsMobileDrawerOpen((prev) => !prev);
  }, []);

  const toggleDeviceOrientation = useCallback(() => {
    setDeviceOrientation((prev) => (prev === 'portrait' ? 'landscape' : 'portrait'));
  }, []);

  const setActiveView = useCallback((view: ViewType) => {
    setActiveViewRaw(view);
    setIsMobileDrawerOpen(false); // Auto-close drawer on mobile navigation
    if (typeof window !== 'undefined' && window.history?.pushState) {
      if (view === 'crm') {
        window.history.pushState(null, '', '/panel/crm');
      } else if (view === 'blog') {
        window.history.pushState(null, '', '/panel/blog');
      } else if (view === 'quotes') {
        window.history.pushState(null, '', '/panel/cotizaciones');
      } else if (view === 'dashboard') {
        window.history.pushState(null, '', '/');
      } else {
        window.history.pushState(null, '', `/#${view}`);
      }
    }
  }, []);

  // Sync initial URL on mount (e.g. /panel/crm, /panel/blog or hash)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (pathname.includes('/crm') || hash.includes('crm')) {
        setActiveViewRaw('crm');
      } else if (pathname.includes('/panel/blog') || pathname.includes('/blog') || hash.includes('blog')) {
        setActiveViewRaw('blog');
      } else if (
        pathname.includes('/cotizaciones') ||
        pathname.includes('/quotes') ||
        hash.includes('quotes') ||
        hash.includes('cotizaciones')
      ) {
        setActiveViewRaw('quotes');
      }
    }
  }, []);

  // Modals state
  const [isCreateWithAIOpen, setIsCreateWithAIOpen] = useState<boolean>(false);
  const [isManualPostOpen, setIsManualPostOpen] = useState<boolean>(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState<boolean>(false);

  // Blog states (Pixel 12 Engine)
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>(initialBlogPosts);
  const [selectedBlog, setSelectedBlog] = useState<BlogPost | null>(null);
  const [isCreateBlogOpen, setIsCreateBlogOpen] = useState<boolean>(false);

  // Quotes states (Pixel 12 OS)
  const [quotes, setQuotes] = useState<QuoteProposal[]>(initialQuoteProposals);
  const [plans, setPlans] = useState<AgencyPlan[]>(initialAgencyPlans);
  const [customServices, setCustomServices] = useState<AgencyCustomService[]>(initialAgencyServices);
  const [commercialSettings, setCommercialSettings] = useState<CommercialSettings>(initialCommercialSettings);
  const [imageLibrary, setImageLibrary] = useState<ImageLibraryItem[]>(initialImageLibraryItems);
  const [selectedQuote, setSelectedQuote] = useState<QuoteProposal | null>(null);
  const [isCreateQuoteOpen, setIsCreateQuoteOpen] = useState<boolean>(false);

  // CRM Commercial Engine States (GoHighLevel style)
  const [crmContacts, setCrmContacts] = useState<CrmContact[]>(initialCrmContacts);
  const [crmCompanies, setCrmCompanies] = useState<CrmCompany[]>(initialCrmCompanies);
  const [crmDeals, setCrmDeals] = useState<CrmDeal[]>(initialCrmDeals);
  const [crmPipelines, setCrmPipelines] = useState<CrmPipeline[]>(initialCrmPipelines);
  const [crmActivities, setCrmActivities] = useState<CrmActivity[]>(initialCrmActivities);
  const [crmFollowUps, setCrmFollowUps] = useState<CrmFollowUp[]>(initialCrmFollowUps);
  const [selectedContact, setSelectedContact] = useState<CrmContact | null>(null);
  const [selectedDeal, setSelectedDeal] = useState<CrmDeal | null>(null);
  const [isCommercialAIOpen, setIsCommercialAIOpen] = useState<boolean>(false);
  const [commercialAIInitialData, setCommercialAIInitialData] = useState<any>(null);

  const openCommercialAI = useCallback((initialData?: any) => {
    setCommercialAIInitialData(initialData || null);
    setIsCommercialAIOpen(true);
  }, []);

  const closeCommercialAI = useCallback(() => {
    setIsCommercialAIOpen(false);
    setCommercialAIInitialData(null);
  }, []);

  // Toast Helper
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Fetch initial data
  useEffect(() => {
    let isMounted = true;
    getWorkspace()
      .then((ws) => {
        if (isMounted) {
          setData(ws);
          if (ws.quotes && Array.isArray(ws.quotes) && ws.quotes.length > 0) {
            setQuotes(ws.quotes);
          }
          if (ws.plans && Array.isArray(ws.plans) && ws.plans.length > 0) {
            setPlans(ws.plans);
          }
          if (ws.customServices && Array.isArray(ws.customServices) && ws.customServices.length > 0) {
            setCustomServices(ws.customServices);
          }
          if (ws.commercialSettings) {
            setCommercialSettings(ws.commercialSettings);
          }
          if (ws.imageLibrary && Array.isArray(ws.imageLibrary) && ws.imageLibrary.length > 0) {
            setImageLibrary(ws.imageLibrary);
          }
          if (ws.crmContacts && Array.isArray(ws.crmContacts) && ws.crmContacts.length > 0) {
            setCrmContacts(ws.crmContacts);
          }
          if (ws.crmCompanies && Array.isArray(ws.crmCompanies) && ws.crmCompanies.length > 0) {
            setCrmCompanies(ws.crmCompanies);
          }
          if (ws.crmDeals && Array.isArray(ws.crmDeals) && ws.crmDeals.length > 0) {
            setCrmDeals(ws.crmDeals);
          }
          if (ws.crmPipelines && Array.isArray(ws.crmPipelines) && ws.crmPipelines.length > 0) {
            setCrmPipelines(ws.crmPipelines);
          }
          if (ws.crmActivities && Array.isArray(ws.crmActivities) && ws.crmActivities.length > 0) {
            setCrmActivities(ws.crmActivities);
          }
          if (ws.crmFollowUps && Array.isArray(ws.crmFollowUps) && ws.crmFollowUps.length > 0) {
            setCrmFollowUps(ws.crmFollowUps);
          }
          if (ws.blogPosts && Array.isArray(ws.blogPosts) && ws.blogPosts.length > 0) {
            setBlogPosts(ws.blogPosts);
          } else {
            getBlogPosts()
              .then((blogs) => {
                if (isMounted && blogs && blogs.length > 0) {
                  setBlogPosts(blogs);
                }
              })
              .catch(() => {});
          }
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Auto-save helper
  const persistState = useCallback(async (updated: WorkspaceData) => {
    setData(updated);
    await saveWorkspace(updated);
  }, []);

  const activeBrand =
    data.brands.find((b) => b.id === data.activeBrandId) || data.brands[0] || initialWorkspaceData.brands[0];

  const setActiveBrandId = useCallback(
    (brandId: string) => {
      setData((prev) => {
        const next = { ...prev, activeBrandId: brandId };
        saveWorkspace(next);
        return next;
      });
    },
    []
  );

  // Post Operations
  const addPost = useCallback(
    async (post: Post) => {
      const updated: WorkspaceData = {
        ...data,
        posts: [post, ...data.posts],
        auditLogs: [
          {
            id: 'log_' + Date.now(),
            actorName: data.currentMember.name,
            action: 'Creó publicación',
            entityType: 'post',
            entityId: post.id,
            details: post.internalTitle,
            timestamp: new Date().toISOString(),
          },
          ...data.auditLogs,
        ],
      };
      await persistState(updated);
      showToast('Publicación agregada al calendario');
    },
    [data, persistState, showToast]
  );

  const updatePost = useCallback(
    async (updatedPost: Post) => {
      const updated: WorkspaceData = {
        ...data,
        posts: data.posts.map((p) => (p.id === updatedPost.id ? updatedPost : p)),
        auditLogs: [
          {
            id: 'log_' + Date.now(),
            actorName: data.currentMember.name,
            action: 'Actualizó publicación',
            entityType: 'post',
            entityId: updatedPost.id,
            details: updatedPost.internalTitle,
            timestamp: new Date().toISOString(),
          },
          ...data.auditLogs,
        ],
      };
      await persistState(updated);
      if (selectedPost && selectedPost.id === updatedPost.id) {
        setSelectedPost(updatedPost);
      }
      showToast('Publicación actualizada');
    },
    [data, persistState, selectedPost, showToast]
  );

  const deletePost = useCallback(
    async (postId: string) => {
      const target = data.posts.find((p) => p.id === postId);
      const updated: WorkspaceData = {
        ...data,
        posts: data.posts.filter((p) => p.id !== postId),
        auditLogs: [
          {
            id: 'log_' + Date.now(),
            actorName: data.currentMember.name,
            action: 'Eliminó publicación',
            entityType: 'post',
            entityId: postId,
            details: target ? target.internalTitle : postId,
            timestamp: new Date().toISOString(),
          },
          ...data.auditLogs,
        ],
      };
      await persistState(updated);
      if (selectedPost && selectedPost.id === postId) {
        setSelectedPost(null);
      }
      showToast('Publicación eliminada', 'info');
    },
    [data, persistState, selectedPost, showToast]
  );

  const bulkDeletePosts = useCallback(
    async (postIds: string[]) => {
      if (!postIds || postIds.length === 0) return;
      const count = postIds.length;
      const updated: WorkspaceData = {
        ...data,
        posts: data.posts.filter((p) => !postIds.includes(p.id)),
        auditLogs: [
          {
            id: 'log_' + Date.now(),
            actorName: data.currentMember.name,
            action: 'Eliminó publicaciones en lote',
            entityType: 'post',
            entityId: postIds.join(','),
            details: `Eliminó ${count} publicaciones`,
            timestamp: new Date().toISOString(),
          },
          ...data.auditLogs,
        ],
      };
      await persistState(updated);
      if (selectedPost && postIds.includes(selectedPost.id)) {
        setSelectedPost(null);
      }
      showToast(`${count} ${count === 1 ? 'publicación eliminada' : 'publicaciones eliminadas'} del sistema`, 'info');
    },
    [data, persistState, selectedPost, showToast]
  );

  const changePostStatus = useCallback(
    async (postId: string, newStatus: PostStatus, comment?: string) => {
      const post = data.posts.find((p) => p.id === postId);
      if (!post) return;

      // When a post is NOT approved / rejected, delete it immediately from the workspace as instructed
      if (newStatus === 'REJECTED') {
        await deletePost(postId);
        showToast('Publicación no aprobada y eliminada inmediatamente del sistema', 'info');
        return;
      }

      const approvalEntry = {
        id: 'appr_' + Date.now(),
        reviewerId: data.currentMember.id,
        reviewerName: data.currentMember.name,
        action: (newStatus === 'APPROVED' ? 'APPROVED' : newStatus === 'CHANGES_REQUESTED' ? 'CHANGES_REQUESTED' : 'SUBMITTED') as any,
        comment: comment || `Estado cambiado a ${newStatus}`,
        timestamp: new Date().toISOString(),
      };

      const updatedPost: Post = {
        ...post,
        status: newStatus,
        updatedAt: new Date().toISOString(),
        approvalHistory: [approvalEntry, ...post.approvalHistory],
      };

      const newNotif: NotificationItem = {
        id: 'notif_' + Date.now(),
        title: `Estado de post: ${newStatus}`,
        message: `${data.currentMember.name} marcó "${post.internalTitle}" como ${newStatus}`,
        type: 'approval',
        read: false,
        timestamp: new Date().toISOString(),
        linkView: 'approvals',
      };

      const updated: WorkspaceData = {
        ...data,
        posts: data.posts.map((p) => (p.id === postId ? updatedPost : p)),
        notifications: [newNotif, ...data.notifications],
        auditLogs: [
          {
            id: 'log_' + Date.now(),
            actorName: data.currentMember.name,
            action: `Cambio de estado post a ${newStatus}`,
            entityType: 'approval',
            entityId: postId,
            details: comment || post.internalTitle,
            timestamp: new Date().toISOString(),
          },
          ...data.auditLogs,
        ],
      };

      await persistState(updated);
      if (selectedPost && selectedPost.id === postId) {
        setSelectedPost(updatedPost);
      }
      showToast(`Publicación marcada como ${newStatus}`);
    },
    [data, deletePost, persistState, selectedPost, showToast]
  );

  // Task Operations
  const addTask = useCallback(
    async (task: Task) => {
      const updated: WorkspaceData = {
        ...data,
        tasks: [task, ...data.tasks],
        auditLogs: [
          {
            id: 'log_' + Date.now(),
            actorName: data.currentMember.name,
            action: 'Creó tarea',
            entityType: 'task',
            entityId: task.id,
            details: task.title,
            timestamp: new Date().toISOString(),
          },
          ...data.auditLogs,
        ],
      };
      await persistState(updated);
      showToast('Tarea creada para el equipo');
    },
    [data, persistState, showToast]
  );

  const updateTask = useCallback(
    async (updatedTask: Task) => {
      const updated: WorkspaceData = {
        ...data,
        tasks: data.tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t)),
      };
      await persistState(updated);
      if (selectedTask && selectedTask.id === updatedTask.id) {
        setSelectedTask(updatedTask);
      }
      showToast('Tarea actualizada');
    },
    [data, persistState, selectedTask, showToast]
  );

  const deleteTask = useCallback(
    async (taskId: string) => {
      const updated: WorkspaceData = {
        ...data,
        tasks: data.tasks.filter((t) => t.id !== taskId),
      };
      await persistState(updated);
      if (selectedTask && selectedTask.id === taskId) {
        setSelectedTask(null);
      }
      showToast('Tarea eliminada', 'info');
    },
    [data, persistState, selectedTask, showToast]
  );

  const changeTaskStatus = useCallback(
    async (taskId: string, newStatus: TaskStatus) => {
      const task = data.tasks.find((t) => t.id === taskId);
      if (!task) return;

      const historyEntry = {
        id: 'h_' + Date.now(),
        authorName: data.currentMember.name,
        action: `Estado cambiado a ${newStatus}`,
        timestamp: new Date().toISOString(),
      };

      const updatedTask: Task = {
        ...task,
        status: newStatus,
        history: [historyEntry, ...task.history],
      };

      // Check if related post should advance to IN_REVIEW when task completed
      let updatedPosts = data.posts;
      if (newStatus === 'COMPLETED' && task.relatedPostId) {
        const relatedPost = data.posts.find((p) => p.id === task.relatedPostId);
        if (relatedPost && relatedPost.status === 'DRAFT') {
          // Check if all related tasks are completed
          const otherTasks = data.tasks.filter(
            (t) => t.relatedPostId === task.relatedPostId && t.id !== task.id
          );
          const allCompleted = otherTasks.every((t) => t.status === 'COMPLETED');
          if (allCompleted) {
            updatedPosts = data.posts.map((p) =>
              p.id === task.relatedPostId ? { ...p, status: 'IN_REVIEW' } : p
            );
            showToast(`El post "${relatedPost.internalTitle}" avanzó automáticamente a REVISIÓN`, 'info');
          }
        }
      }

      const updated: WorkspaceData = {
        ...data,
        tasks: data.tasks.map((t) => (t.id === taskId ? updatedTask : t)),
        posts: updatedPosts,
      };

      await persistState(updated);
      if (selectedTask && selectedTask.id === taskId) {
        setSelectedTask(updatedTask);
      }
      showToast(`Tarea marcada como ${newStatus}`);
    },
    [data, persistState, selectedTask, showToast]
  );

  // Campaign Operations
  const addCampaign = useCallback(
    async (campaign: Campaign) => {
      const updated: WorkspaceData = {
        ...data,
        campaigns: [campaign, ...data.campaigns],
      };
      await persistState(updated);
      showToast('Campaña creada exitosamente');
    },
    [data, persistState, showToast]
  );

  const updateCampaign = useCallback(
    async (campaign: Campaign) => {
      const updated: WorkspaceData = {
        ...data,
        campaigns: data.campaigns.map((c) => (c.id === campaign.id ? campaign : c)),
      };
      await persistState(updated);
      showToast('Campaña actualizada');
    },
    [data, persistState, showToast]
  );

  // Brand Operations
  const addBrand = useCallback(
    async (brand: Brand) => {
      const updated: WorkspaceData = {
        ...data,
        brands: [...data.brands, brand],
        activeBrandId: brand.id,
      };
      await persistState(updated);
      showToast(`Marca "${brand.name}" agregada`);
    },
    [data, persistState, showToast]
  );

  const updateBrand = useCallback(
    async (brand: Brand) => {
      const updated: WorkspaceData = {
        ...data,
        brands: data.brands.map((b) => (b.id === brand.id ? brand : b)),
      };
      await persistState(updated);
      showToast('Datos de marca actualizados');
    },
    [data, persistState, showToast]
  );

  // Settings
  const updateSettings = useCallback(
    async (newSettings: Partial<WorkspaceData['workspaceSettings']>) => {
      const updated: WorkspaceData = {
        ...data,
        workspaceSettings: {
          ...data.workspaceSettings,
          ...newSettings,
        },
      };
      await persistState(updated);
      showToast('Ajustes del espacio de trabajo guardados');
    },
    [data, persistState, showToast]
  );

  // Bulk import
  const bulkImportPosts = useCallback(
    async (newPosts: Post[]) => {
      const updated: WorkspaceData = {
        ...data,
        posts: [...newPosts, ...data.posts],
      };
      await persistState(updated);
      showToast(`Se importaron ${newPosts.length} publicaciones correctamente`);
    },
    [data, persistState, showToast]
  );

  // Blog Handlers (Pixel 12 Engine)
  const createBlogPost = useCallback(
    async (newBlog: Partial<BlogPost>): Promise<BlogPost> => {
      try {
        const saved = await saveBlogPost(newBlog);
        setBlogPosts((prev) => [saved, ...prev.filter((b) => b.id !== saved.id)]);
        // Also update workspace
        const updated: WorkspaceData = {
          ...data,
          blogPosts: [saved, ...(data.blogPosts || []).filter((b) => b.id !== saved.id)]
        };
        await persistState(updated);
        showToast(`Artículo "${saved.title.slice(0, 30)}..." guardado`);
        return saved;
      } catch (err: any) {
        showToast(err.message || 'Error al guardar el artículo', 'error');
        throw err;
      }
    },
    [data, persistState, showToast]
  );

  const updateBlogPost = useCallback(
    async (id: string, updates: Partial<BlogPost>): Promise<BlogPost> => {
      try {
        const updatedPost = await updateBlogPostApi(id, updates);
        setBlogPosts((prev) => prev.map((b) => (b.id === id ? updatedPost : b)));
        if (selectedBlog && selectedBlog.id === id) {
          setSelectedBlog(updatedPost);
        }
        const updated: WorkspaceData = {
          ...data,
          blogPosts: (data.blogPosts || []).map((b) => (b.id === id ? updatedPost : b))
        };
        await persistState(updated);
        showToast('Artículo de blog actualizado');
        return updatedPost;
      } catch (err: any) {
        showToast(err.message || 'Error al actualizar artículo', 'error');
        throw err;
      }
    },
    [data, selectedBlog, persistState, showToast]
  );

  const deleteBlogPost = useCallback(
    async (id: string) => {
      try {
        await deleteBlogPostApi(id);
        setBlogPosts((prev) => prev.filter((b) => b.id !== id));
        if (selectedBlog && selectedBlog.id === id) {
          setSelectedBlog(null);
        }
        const updated: WorkspaceData = {
          ...data,
          blogPosts: (data.blogPosts || []).filter((b) => b.id !== id)
        };
        await persistState(updated);
        showToast('Artículo eliminado del blog');
      } catch (err: any) {
        showToast(err.message || 'Error al eliminar', 'error');
      }
    },
    [data, selectedBlog, persistState, showToast]
  );

  const generateBlogWithAI = useCallback(
    async (params: {
      topic?: string;
      sourceUrl?: string;
      sourceType: 'topic' | 'url';
      category?: string;
      tone?: string;
      author?: string;
      authorRole?: string;
      targetLength?: number;
      brandId?: string;
    }): Promise<BlogPost> => {
      try {
        const generated = await generateBlogAI(params);
        setBlogPosts((prev) => [generated, ...prev]);
        const updated: WorkspaceData = {
          ...data,
          blogPosts: [generated, ...(data.blogPosts || [])]
        };
        await persistState(updated);
        showToast('¡Artículo y piezas multicanal generadas con éxito!');
        return generated;
      } catch (err: any) {
        showToast(err.message || 'Error al generar con IA', 'error');
        throw err;
      }
    },
    [data, persistState, showToast]
  );

  const generatePostDesign = useCallback(
    async (postId: string): Promise<Post> => {
      try {
        const res = await generatePostDesignAI(postId);
        const updatedPosts = data.posts.map((p) => (p.id === postId ? res.post : p));
        const updated: WorkspaceData = {
          ...data,
          posts: updatedPosts,
          workspaceSettings: {
            ...data.workspaceSettings,
            aiCredits: res.aiCredits
          }
        };
        await persistState(updated);
        if (selectedPost && selectedPost.id === postId) {
          setSelectedPost(res.post);
        }
        showToast(res.message);
        return res.post;
      } catch (err: any) {
        showToast(err.message || 'Error al generar diseño', 'error');
        throw err;
      }
    },
    [data, persistState, selectedPost, showToast]
  );

  const regenerateSingleSlide = useCallback(
    async (postId: string, slideIndex: number, changePrompt: string): Promise<Post> => {
      try {
        const res = await regenerateSingleSlideAI(postId, slideIndex, changePrompt);
        const updatedPosts = data.posts.map((p) => (p.id === postId ? res.post : p));
        const updated: WorkspaceData = {
          ...data,
          posts: updatedPosts,
          workspaceSettings: {
            ...data.workspaceSettings,
            aiCredits: res.aiCredits
          }
        };
        await persistState(updated);
        if (selectedPost && selectedPost.id === postId) {
          setSelectedPost(res.post);
        }
        showToast(res.message);
        return res.post;
      } catch (err: any) {
        showToast(err.message || 'Error al rehacer la slide', 'error');
        throw err;
      }
    },
    [data, persistState, selectedPost, showToast]
  );

  const regenerateAllSlides = useCallback(
    async (postId: string): Promise<Post> => {
      try {
        const res = await regenerateAllSlidesAI(postId);
        const updatedPosts = data.posts.map((p) => (p.id === postId ? res.post : p));
        const updated: WorkspaceData = {
          ...data,
          posts: updatedPosts,
          workspaceSettings: {
            ...data.workspaceSettings,
            aiCredits: res.aiCredits
          }
        };
        await persistState(updated);
        if (selectedPost && selectedPost.id === postId) {
          setSelectedPost(res.post);
        }
        showToast(res.message);
        return res.post;
      } catch (err: any) {
        showToast(err.message || 'Error al regenerar carrusel', 'error');
        throw err;
      }
    },
    [data, persistState, selectedPost, showToast]
  );

  // Quotes Handlers (Pixel 12 OS)
  const createQuote = useCallback(
    async (quoteData: Partial<QuoteProposal>): Promise<QuoteProposal> => {
      const folio =
        quoteData.folio ||
        `P12-COT-${new Date().getFullYear()}-${String(quotes.length + 1).padStart(3, '0')}`;
      const now = new Date().toISOString();
      const validUntil =
        quoteData.validUntil ||
        new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const newQuote: QuoteProposal = {
        id: quoteData.id || `quote_${Date.now()}`,
        brandId: quoteData.brandId || activeBrand.id,
        folio,
        title: quoteData.title || `Propuesta Comercial - ${quoteData.client?.company || 'Cliente'}`,
        status: quoteData.status || 'DRAFT',
        client: {
          name: quoteData.client?.name || 'Cliente',
          company: quoteData.client?.company || 'Empresa',
          email: quoteData.client?.email || '',
          phone: quoteData.client?.phone || '',
          cityCountry: quoteData.client?.cityCountry || 'Guayaquil, Ecuador',
          taxId: quoteData.client?.taxId || '',
          sector: quoteData.client?.sector || 'Servicios'
        },
        issueDate: quoteData.issueDate || now.split('T')[0],
        validUntil,
        currency: quoteData.currency || 'USD',
        executiveSummary:
          quoteData.executiveSummary ||
          'Propuesta estratégica diseñada para optimizar y escalar los canales digitales y la operación de su marca.',
        presentationText:
          quoteData.presentationText ||
          'En Pixel 12 nos especializamos en transformar la presencia digital de las empresas mediante estrategias de alto impacto, generación de contenido con narrativa persuasiva y asistencia virtual de alto desempeño.',
        clientNeeds: quoteData.clientNeeds || [
          'Aumentar la visibilidad y autoridad en redes sociales',
          'Generar clientes potenciales calificados mes a mes',
          'Delegar la gestión operativa de marketing con altos estándares de calidad'
        ],
        proposedSolution:
          quoteData.proposedSolution ||
          'Implementación de una estrategia 360° combinando marketing digital, diseño de identidad visual, creación sistemática de contenido y soporte operativo continuo.',
        selectedPlan: quoteData.selectedPlan,
        items: quoteData.items || [],
        subtotal: quoteData.subtotal ?? 0,
        taxPercent: quoteData.taxPercent ?? 15,
        taxAmount: quoteData.taxAmount ?? 0,
        discountPercent: quoteData.discountPercent ?? 0,
        discountAmount: quoteData.discountAmount ?? 0,
        total: quoteData.total ?? 0,
        paymentTerms:
          quoteData.paymentTerms ||
          '50% anticipo al aprobar la cotización y 50% al completar el primer entregable / corte mensual.',
        paymentMethods:
          quoteData.paymentMethods ||
          commercialSettings.bankDetails ||
          'Transferencia bancaria Banco Pichincha / Produbanco / Tarjeta de crédito internacional.',
        termsAndConditions:
          quoteData.termsAndConditions ||
          commercialSettings.termsAndConditions ||
          'Validez de la oferta 15 días calendario a partir de su emisión. Pagos no reembolsables una vez iniciada la fase estratégica.',
        roadmap: quoteData.roadmap || [
          {
            phase: 'Fase 1: Diagnóstico & Onboarding',
            duration: 'Semana 1',
            description: 'Diagnóstico de activos digitales, definición de buyer persona y setup de accesos.',
            deliverables: ['Brief estratégico', 'Manual de estilo', 'Planificación mensual']
          },
          {
            phase: 'Fase 2: Producción & Lanzamiento',
            duration: 'Semana 2 - 3',
            description: 'Creación de piezas de alto impacto, copys persuasivos y montaje de campañas.',
            deliverables: ['Calendario de publicaciones', 'Diseños aprobados', 'Setup publicitario']
          },
          {
            phase: 'Fase 3: Optimización & Crecimiento',
            duration: 'Semana 4 y continuo',
            description: 'Monitoreo de métricas, refinamiento de pauta y entrega de reportes ejecutivos.',
            deliverables: ['Dashboard de métricas', 'Reunión de balance mensual', 'Ajustes estratégicos']
          }
        ],
        visuals: quoteData.visuals || [],
        notes: quoteData.notes || '',
        createdAt: now,
        updatedAt: now
      };

      if (newQuote.items.length > 0) {
        const subtotal = newQuote.items.reduce((sum, item) => sum + item.total, 0);
        const discountAmount = subtotal * ((newQuote.discountPercent || 0) / 100);
        const baseAfterDiscount = subtotal - discountAmount;
        const taxAmount = baseAfterDiscount * ((newQuote.taxPercent || 0) / 100);
        const total = baseAfterDiscount + taxAmount;
        newQuote.subtotal = Number(subtotal.toFixed(2));
        newQuote.discountAmount = Number(discountAmount.toFixed(2));
        newQuote.taxAmount = Number(taxAmount.toFixed(2));
        newQuote.total = Number(total.toFixed(2));
      }

      try {
        const saved = await saveQuoteApi(newQuote);
        setQuotes((prev) => [saved, ...prev]);
        const updatedWorkspace: WorkspaceData = {
          ...data,
          quotes: [saved, ...quotes],
          auditLogs: [
            {
              id: 'log_' + Date.now(),
              actorName: data.currentMember.name,
              action: 'Creó cotización',
              entityType: 'post' as any,
              entityId: saved.id,
              details: `${saved.folio} - ${saved.client.company}`,
              timestamp: new Date().toISOString()
            },
            ...data.auditLogs
          ]
        };
        await persistState(updatedWorkspace);
        showToast(`Cotización ${saved.folio} guardada exitosamente`);
        return saved;
      } catch (e: any) {
        setQuotes((prev) => [newQuote, ...prev]);
        const updatedWorkspace: WorkspaceData = {
          ...data,
          quotes: [newQuote, ...quotes]
        };
        await persistState(updatedWorkspace);
        showToast(`Cotización guardada`);
        return newQuote;
      }
    },
    [quotes, activeBrand, commercialSettings, data, persistState, showToast]
  );

  const updateQuote = useCallback(
    async (id: string, updates: Partial<QuoteProposal>): Promise<QuoteProposal> => {
      const existing = quotes.find((q) => q.id === id);
      if (!existing) throw new Error('Cotización no encontrada');

      const updatedQuote: QuoteProposal = {
        ...existing,
        ...updates,
        updatedAt: new Date().toISOString()
      };

      if (updatedQuote.items) {
        const subtotal = updatedQuote.items.reduce((sum, item) => sum + item.total, 0);
        const discountAmount = subtotal * ((updatedQuote.discountPercent || 0) / 100);
        const baseAfterDiscount = subtotal - discountAmount;
        const taxAmount = baseAfterDiscount * ((updatedQuote.taxPercent || 0) / 100);
        const total = baseAfterDiscount + taxAmount;
        updatedQuote.subtotal = Number(subtotal.toFixed(2));
        updatedQuote.discountAmount = Number(discountAmount.toFixed(2));
        updatedQuote.taxAmount = Number(taxAmount.toFixed(2));
        updatedQuote.total = Number(total.toFixed(2));
      }

      try {
        await saveQuoteApi(updatedQuote);
      } catch (e) {
        console.warn('API save quote failed', e);
      }

      setQuotes((prev) => prev.map((q) => (q.id === id ? updatedQuote : q)));
      if (selectedQuote && selectedQuote.id === id) {
        setSelectedQuote(updatedQuote);
      }

      const updatedWorkspace: WorkspaceData = {
        ...data,
        quotes: quotes.map((q) => (q.id === id ? updatedQuote : q))
      };
      await persistState(updatedWorkspace);
      showToast(`Cotización ${updatedQuote.folio} actualizada`);
      return updatedQuote;
    },
    [quotes, selectedQuote, data, persistState, showToast]
  );

  const deleteQuote = useCallback(
    async (id: string): Promise<void> => {
      try {
        await deleteQuoteApi(id);
      } catch (e) {
        console.warn('API delete quote failed', e);
      }
      setQuotes((prev) => prev.filter((q) => q.id !== id));
      if (selectedQuote && selectedQuote.id === id) {
        setSelectedQuote(null);
      }
      const updatedWorkspace: WorkspaceData = {
        ...data,
        quotes: quotes.filter((q) => q.id !== id)
      };
      await persistState(updatedWorkspace);
      showToast('Cotización eliminada');
    },
    [quotes, selectedQuote, data, persistState, showToast]
  );

  const duplicateQuote = useCallback(
    async (id: string): Promise<QuoteProposal> => {
      const original = quotes.find((q) => q.id === id);
      if (!original) throw new Error('Cotización original no encontrada');

      const newId = `quote_${Date.now()}`;
      const newFolio = `P12-COT-${new Date().getFullYear()}-${String(quotes.length + 1).padStart(3, '0')}`;
      const now = new Date().toISOString();
      const validUntil = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const duplicated: QuoteProposal = {
        ...original,
        id: newId,
        folio: newFolio,
        title: `${original.title} (Copia)`,
        status: 'DRAFT',
        issueDate: now.split('T')[0],
        validUntil,
        sentAt: undefined,
        acceptedAt: undefined,
        rejectedAt: undefined,
        createdAt: now,
        updatedAt: now
      };

      try {
        await saveQuoteApi(duplicated);
      } catch (e) {}

      setQuotes((prev) => [duplicated, ...prev]);
      const updatedWorkspace: WorkspaceData = {
        ...data,
        quotes: [duplicated, ...quotes]
      };
      await persistState(updatedWorkspace);
      showToast(`Cotización duplicada con folio ${newFolio}`);
      return duplicated;
    },
    [quotes, data, persistState, showToast]
  );

  const updateQuoteStatus = useCallback(
    async (id: string, status: QuoteStatus): Promise<void> => {
      const updates: Partial<QuoteProposal> = { status };
      const now = new Date().toISOString();
      if (status === 'SENT') updates.sentAt = now;
      if (status === 'ACCEPTED') updates.acceptedAt = now;
      if (status === 'REJECTED') updates.rejectedAt = now;
      await updateQuote(id, updates);
    },
    [updateQuote]
  );

  const generateQuoteWithAI = useCallback(
    async (params: {
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
    }): Promise<QuoteProposal> => {
      try {
        const generated = await generateQuoteProposalAI({
          ...params,
          brandName: activeBrand.name
        });
        setQuotes((prev) => [generated, ...prev]);
        setSelectedQuote(generated);
        const updatedWorkspace: WorkspaceData = {
          ...data,
          quotes: [generated, ...quotes]
        };
        await persistState(updatedWorkspace);
        showToast(`¡Propuesta comercial generada con IA para ${generated.client.company}!`);
        return generated;
      } catch (err: any) {
        showToast(err.message || 'Error al generar propuesta con IA', 'error');
        throw err;
      }
    },
    [activeBrand.name, data, quotes, persistState, showToast]
  );

  const generateImageWithAI = useCallback(
    async (params: any): Promise<any> => {
      try {
        const res = await generateQuoteImageAI({
          ...params,
          brandName: activeBrand.name
        });
        const newItem: ImageLibraryItem = {
          id: res.id || `img_${Date.now()}`,
          title: res.title || 'Visual generado por Pixel 12 IA',
          imageUrl: res.imageUrl,
          prompt: res.prompt || '',
          category: (params.type as any) || 'Propuestas',
          aspectRatio: res.aspectRatio || '1:1',
          style: res.style || 'Pixel 12 Luxury',
          tags: res.tags || ['Pixel 12', 'IA'],
          createdAt: new Date().toISOString()
        };
        setImageLibrary((prev) => [newItem, ...prev]);
        const updatedWorkspace: WorkspaceData = {
          ...data,
          imageLibrary: [newItem, ...imageLibrary]
        };
        await persistState(updatedWorkspace);
        showToast('Imagen generada y guardada en la biblioteca');
        return res;
      } catch (err: any) {
        showToast(err.message || 'Error al generar imagen', 'error');
        throw err;
      }
    },
    [activeBrand.name, data, imageLibrary, persistState, showToast]
  );

  const savePlan = useCallback(
    async (plan: AgencyPlan): Promise<void> => {
      try {
        await savePlanApi(plan);
      } catch (e) {}
      setPlans((prev) => {
        const idx = prev.findIndex((p) => p.id === plan.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = plan;
          return next;
        }
        return [...prev, plan];
      });
      const updatedWorkspace: WorkspaceData = {
        ...data,
        plans: plans.some((p) => p.id === plan.id)
          ? plans.map((p) => (p.id === plan.id ? plan : p))
          : [...plans, plan]
      };
      await persistState(updatedWorkspace);
      showToast(`Plan "${plan.name}" guardado`);
    },
    [plans, data, persistState, showToast]
  );

  const deletePlan = useCallback(
    async (planId: string): Promise<void> => {
      try {
        await deletePlanApi(planId);
      } catch (e) {}
      setPlans((prev) => prev.filter((p) => p.id !== planId));
      const updatedWorkspace: WorkspaceData = {
        ...data,
        plans: plans.filter((p) => p.id !== planId)
      };
      await persistState(updatedWorkspace);
      showToast('Plan eliminado');
    },
    [plans, data, persistState, showToast]
  );

  const saveCustomService = useCallback(
    async (service: AgencyCustomService): Promise<void> => {
      try {
        await saveServiceApi(service);
      } catch (e) {}
      setCustomServices((prev) => {
        const idx = prev.findIndex((s) => s.id === service.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = service;
          return next;
        }
        return [...prev, service];
      });
      const updatedWorkspace: WorkspaceData = {
        ...data,
        customServices: customServices.some((s) => s.id === service.id)
          ? customServices.map((s) => (s.id === service.id ? service : s))
          : [...customServices, service]
      };
      await persistState(updatedWorkspace);
      showToast(`Servicio "${service.name}" guardado`);
    },
    [customServices, data, persistState, showToast]
  );

  const deleteCustomService = useCallback(
    async (serviceId: string): Promise<void> => {
      try {
        await deleteServiceApi(serviceId);
      } catch (e) {}
      setCustomServices((prev) => prev.filter((s) => s.id !== serviceId));
      const updatedWorkspace: WorkspaceData = {
        ...data,
        customServices: customServices.filter((s) => s.id !== serviceId)
      };
      await persistState(updatedWorkspace);
      showToast('Servicio eliminado');
    },
    [customServices, data, persistState, showToast]
  );

  const updateCommercialSettings = useCallback(
    async (settings: Partial<CommercialSettings>): Promise<void> => {
      const merged: CommercialSettings = {
        ...commercialSettings,
        ...settings
      };
      try {
        await saveCommercialSettingsApi(merged);
      } catch (e) {}
      setCommercialSettings(merged);
      const updatedWorkspace: WorkspaceData = {
        ...data,
        commercialSettings: merged
      };
      await persistState(updatedWorkspace);
      showToast('Ajustes comerciales actualizados');
    },
    [commercialSettings, data, persistState, showToast]
  );

  const saveImageToLibrary = useCallback(
    async (item: Partial<ImageLibraryItem>): Promise<ImageLibraryItem> => {
      const fullItem: ImageLibraryItem = {
        id: item.id || `img_${Date.now()}`,
        title: item.title || 'Imagen Pixel 12',
        imageUrl: item.imageUrl || '',
        prompt: item.prompt || '',
        category: item.category || 'Propuestas',
        aspectRatio: item.aspectRatio || '1:1',
        style: item.style || 'Pixel 12 Luxury',
        tags: item.tags || ['Pixel 12'],
        sector: item.sector,
        client: item.client,
        createdAt: item.createdAt || new Date().toISOString()
      };
      try {
        await saveImageToLibraryApi(fullItem);
      } catch (e) {}
      setImageLibrary((prev) => {
        const idx = prev.findIndex((i) => i.id === fullItem.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = fullItem;
          return next;
        }
        return [fullItem, ...prev];
      });
      const updatedWorkspace: WorkspaceData = {
        ...data,
        imageLibrary: imageLibrary.some((i) => i.id === fullItem.id)
          ? imageLibrary.map((i) => (i.id === fullItem.id ? fullItem : i))
          : [fullItem, ...imageLibrary]
      };
      await persistState(updatedWorkspace);
      showToast('Imagen guardada en la biblioteca');
      return fullItem;
    },
    [imageLibrary, data, persistState, showToast]
  );

  const deleteImageFromLibrary = useCallback(
    async (id: string): Promise<void> => {
      try {
        await deleteImageFromLibraryApi(id);
      } catch (e) {}
      setImageLibrary((prev) => prev.filter((i) => i.id !== id));
      const updatedWorkspace: WorkspaceData = {
        ...data,
        imageLibrary: imageLibrary.filter((i) => i.id !== id)
      };
      await persistState(updatedWorkspace);
      showToast('Imagen eliminada de la biblioteca');
    },
    [imageLibrary, data, persistState, showToast]
  );

  // CRM Commercial Engine Handlers (GoHighLevel style)
  const saveContact = useCallback(
    async (contact: CrmContact): Promise<CrmContact> => {
      let saved = contact;
      try {
        saved = await saveCrmContactApi(contact);
      } catch (err) {
        console.error('Error in saveCrmContactApi:', err);
      }
      setCrmContacts((prev) => {
        const idx = prev.findIndex((c) => c.id === saved.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = saved;
          return next;
        }
        return [saved, ...prev];
      });
      const updatedWorkspace: WorkspaceData = {
        ...data,
        crmContacts: crmContacts.some((c) => c.id === saved.id)
          ? crmContacts.map((c) => (c.id === saved.id ? saved : c))
          : [saved, ...crmContacts]
      };
      await persistState(updatedWorkspace);
      showToast(`Contacto "${saved.fullName}" guardado`);
      return saved;
    },
    [crmContacts, data, persistState, showToast]
  );

  const deleteContact = useCallback(
    async (id: string): Promise<void> => {
      try {
        await deleteCrmContactApi(id);
      } catch (e) {}
      setCrmContacts((prev) => prev.filter((c) => c.id !== id));
      if (selectedContact?.id === id) setSelectedContact(null);
      const updatedWorkspace: WorkspaceData = {
        ...data,
        crmContacts: crmContacts.filter((c) => c.id !== id)
      };
      await persistState(updatedWorkspace);
      showToast('Contacto eliminado del CRM');
    },
    [crmContacts, selectedContact, data, persistState, showToast]
  );

  const saveCompany = useCallback(
    async (company: CrmCompany): Promise<CrmCompany> => {
      let saved = company;
      try {
        saved = await saveCrmCompanyApi(company);
      } catch (err) {
        console.error('Error in saveCrmCompanyApi:', err);
      }
      setCrmCompanies((prev) => {
        const idx = prev.findIndex((c) => c.id === saved.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = saved;
          return next;
        }
        return [saved, ...prev];
      });
      const updatedWorkspace: WorkspaceData = {
        ...data,
        crmCompanies: crmCompanies.some((c) => c.id === saved.id)
          ? crmCompanies.map((c) => (c.id === saved.id ? saved : c))
          : [saved, ...crmCompanies]
      };
      await persistState(updatedWorkspace);
      showToast(`Empresa "${saved.name}" guardada`);
      return saved;
    },
    [crmCompanies, data, persistState, showToast]
  );

  const deleteCompany = useCallback(
    async (id: string): Promise<void> => {
      try {
        await deleteCrmCompanyApi(id);
      } catch (e) {}
      setCrmCompanies((prev) => prev.filter((c) => c.id !== id));
      const updatedWorkspace: WorkspaceData = {
        ...data,
        crmCompanies: crmCompanies.filter((c) => c.id !== id)
      };
      await persistState(updatedWorkspace);
      showToast('Empresa eliminada del CRM');
    },
    [crmCompanies, data, persistState, showToast]
  );

  const saveDeal = useCallback(
    async (deal: CrmDeal): Promise<CrmDeal> => {
      let saved = deal;
      try {
        saved = await saveCrmDealApi(deal);
      } catch (err) {
        console.error('Error in saveCrmDealApi:', err);
      }
      setCrmDeals((prev) => {
        const idx = prev.findIndex((d) => d.id === saved.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = saved;
          return next;
        }
        return [saved, ...prev];
      });
      const updatedWorkspace: WorkspaceData = {
        ...data,
        crmDeals: crmDeals.some((d) => d.id === saved.id)
          ? crmDeals.map((d) => (d.id === saved.id ? saved : d))
          : [saved, ...crmDeals]
      };
      await persistState(updatedWorkspace);
      showToast(`Oportunidad "${saved.title}" guardada`);
      return saved;
    },
    [crmDeals, data, persistState, showToast]
  );

  const updateDealStage = useCallback(
    async (id: string, stageId: string, extras?: { lostReason?: string; probability?: number }): Promise<void> => {
      try {
        await updateCrmDealStageApi(id, stageId, extras);
      } catch (e) {}
      setCrmDeals((prev) =>
        prev.map((d) => {
          if (d.id !== id) return d;
          return {
            ...d,
            stageId,
            lostReason: extras?.lostReason !== undefined ? extras.lostReason : d.lostReason,
            probability: extras?.probability !== undefined ? extras.probability : d.probability,
            updatedAt: new Date().toISOString()
          };
        })
      );
      // Also register an activity
      const activity: CrmActivity = {
        id: `act_${Date.now()}`,
        entityType: 'DEAL',
        entityId: id,
        type: 'STAGE_CHANGE',
        title: 'Movimiento de etapa en Pipeline',
        description: `Oportunidad actualizada a la etapa ${stageId}`,
        authorName: data.currentMember.name || 'Usuario Pixel 12',
        timestamp: new Date().toISOString()
      };
      setCrmActivities((prev) => [activity, ...prev]);
      showToast('Etapa del deal actualizada');
    },
    [data.currentMember.name, showToast]
  );

  const deleteDeal = useCallback(
    async (id: string): Promise<void> => {
      try {
        await deleteCrmDealApi(id);
      } catch (e) {}
      setCrmDeals((prev) => prev.filter((d) => d.id !== id));
      if (selectedDeal?.id === id) setSelectedDeal(null);
      const updatedWorkspace: WorkspaceData = {
        ...data,
        crmDeals: crmDeals.filter((d) => d.id !== id)
      };
      await persistState(updatedWorkspace);
      showToast('Oportunidad eliminada');
    },
    [crmDeals, selectedDeal, data, persistState, showToast]
  );

  const savePipeline = useCallback(
    async (pipeline: CrmPipeline): Promise<void> => {
      let saved = pipeline;
      try {
        saved = await saveCrmPipelineApi(pipeline);
      } catch (e) {}
      setCrmPipelines((prev) => {
        const idx = prev.findIndex((p) => p.id === saved.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = saved;
          return next;
        }
        return [...prev, saved];
      });
      const updatedWorkspace: WorkspaceData = {
        ...data,
        crmPipelines: crmPipelines.some((p) => p.id === saved.id)
          ? crmPipelines.map((p) => (p.id === saved.id ? saved : p))
          : [...crmPipelines, saved]
      };
      await persistState(updatedWorkspace);
      showToast(`Pipeline "${saved.name}" guardado`);
    },
    [crmPipelines, data, persistState, showToast]
  );

  const deletePipeline = useCallback(
    async (id: string): Promise<void> => {
      try {
        await deleteCrmPipelineApi(id);
      } catch (e) {}
      setCrmPipelines((prev) => prev.filter((p) => p.id !== id));
      const updatedWorkspace: WorkspaceData = {
        ...data,
        crmPipelines: crmPipelines.filter((p) => p.id !== id)
      };
      await persistState(updatedWorkspace);
      showToast('Pipeline eliminado');
    },
    [crmPipelines, data, persistState, showToast]
  );

  const saveFollowUp = useCallback(
    async (followUp: CrmFollowUp): Promise<void> => {
      let saved = followUp;
      try {
        saved = await saveCrmFollowUpApi(followUp);
      } catch (e) {}
      setCrmFollowUps((prev) => {
        const idx = prev.findIndex((f) => f.id === saved.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = saved;
          return next;
        }
        return [saved, ...prev];
      });
      const updatedWorkspace: WorkspaceData = {
        ...data,
        crmFollowUps: crmFollowUps.some((f) => f.id === saved.id)
          ? crmFollowUps.map((f) => (f.id === saved.id ? saved : f))
          : [saved, ...crmFollowUps]
      };
      await persistState(updatedWorkspace);
      showToast('Seguimiento programado con éxito');
    },
    [crmFollowUps, data, persistState, showToast]
  );

  const updateFollowUpStatus = useCallback(
    async (id: string, status: 'PENDING' | 'DONE' | 'CANCELLED'): Promise<void> => {
      try {
        await updateCrmFollowUpStatusApi(id, status);
      } catch (e) {}
      setCrmFollowUps((prev) =>
        prev.map((f) => (f.id === id ? { ...f, status } : f))
      );
      showToast(status === 'DONE' ? 'Seguimiento completado' : 'Seguimiento actualizado');
    },
    [showToast]
  );

  const deleteFollowUp = useCallback(
    async (id: string): Promise<void> => {
      try {
        await deleteCrmFollowUpApi(id);
      } catch (e) {}
      setCrmFollowUps((prev) => prev.filter((f) => f.id !== id));
      showToast('Seguimiento eliminado');
    },
    [showToast]
  );

  const saveActivity = useCallback(
    async (activity: CrmActivity): Promise<void> => {
      let saved = activity;
      try {
        saved = await saveCrmActivityApi(activity);
      } catch (e) {}
      setCrmActivities((prev) => [saved, ...prev]);
    },
    []
  );

  const generateCommercialContent = useCallback(
    async (req: CommercialAIGenerateRequest): Promise<CommercialAIGenerateResponse> => {
      return await generateCommercialAIApi(req);
    },
    []
  );

  return (
    <WorkspaceContext.Provider
      value={{
        data,
        isLoading,
        activeView,
        setActiveView,
        activeBrand,
        setActiveBrandId,
        isMobileDrawerOpen,
        setIsMobileDrawerOpen,
        toggleMobileDrawer,
        deviceMode,
        setDeviceMode,
        deviceOrientation,
        toggleDeviceOrientation,
        addPost,
        updatePost,
        deletePost,
        bulkDeletePosts,
        changePostStatus,
        addTask,
        updateTask,
        deleteTask,
        changeTaskStatus,
        addCampaign,
        updateCampaign,
        addBrand,
        updateBrand,
        updateSettings,
        isCreateWithAIOpen,
        openCreateWithAI: () => setIsCreateWithAIOpen(true),
        closeCreateWithAI: () => setIsCreateWithAIOpen(false),
        isManualPostOpen,
        openManualPost: () => setIsManualPostOpen(true),
        closeManualPost: () => setIsManualPostOpen(false),
        selectedPost,
        openPostDetail: (post) => setSelectedPost(post),
        closePostDetail: () => setSelectedPost(null),
        selectedTask,
        openTaskDetail: (task) => setSelectedTask(task),
        closeTaskDetail: () => setSelectedTask(null),
        isGlobalSearchOpen,
        openGlobalSearch: () => setIsGlobalSearchOpen(true),
        closeGlobalSearch: () => setIsGlobalSearchOpen(false),
        toasts,
        showToast,
        addToast: showToast,
        dismissToast,
        bulkImportPosts,
        // Blog Exports
        blogPosts,
        selectedBlog,
        setSelectedBlog,
        isCreateBlogOpen,
        setIsCreateBlogOpen,
        createBlogPost,
        updateBlogPost,
        deleteBlogPost,
        generateBlogWithAI,
        // Post Design & Slide Regeneration
        generatePostDesign,
        regenerateSingleSlide,
        regenerateAllSlides,
        // Quotes & Commercial Proposals (Pixel 12 OS)
        quotes,
        plans,
        customServices,
        commercialSettings,
        imageLibrary,
        selectedQuote,
        setSelectedQuote,
        isCreateQuoteOpen,
        setIsCreateQuoteOpen,
        createQuote,
        updateQuote,
        deleteQuote,
        duplicateQuote,
        updateQuoteStatus,
        generateQuoteWithAI,
        generateImageWithAI,
        savePlan,
        deletePlan,
        saveCustomService,
        deleteCustomService,
        updateCommercialSettings,
        saveImageToLibrary,
        deleteImageFromLibrary,
        // CRM Commercial Suite Exports
        crmContacts,
        crmCompanies,
        crmDeals,
        crmPipelines,
        crmActivities,
        crmFollowUps,
        selectedContact,
        setSelectedContact,
        selectedDeal,
        setSelectedDeal,
        saveContact,
        deleteContact,
        saveCompany,
        deleteCompany,
        saveDeal,
        deleteDeal,
        updateDealStage,
        savePipeline,
        deletePipeline,
        saveFollowUp,
        updateFollowUpStatus,
        deleteFollowUp,
        saveActivity,
        generateCommercialContent,
        isCommercialAIOpen,
        setIsCommercialAIOpen,
        commercialAIInitialData,
        openCommercialAI,
        closeCommercialAI,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
}
