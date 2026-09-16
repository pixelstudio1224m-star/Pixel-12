import type {
  QuoteProposal,
  AgencyPlan,
  AgencyCustomService,
  CommercialSettings,
  ImageLibraryItem
} from './quotes';
import type {
  CrmContact,
  CrmCompany,
  CrmDeal,
  CrmPipeline,
  CrmActivity,
  CrmFollowUp
} from './crm';

export * from './quotes';
export * from './crm';

export type Role =
  | 'Owner'
  | 'Admin'
  | 'Manager'
  | 'Editor'
  | 'Designer'
  | 'Copywriter'
  | 'Community Manager'
  | 'Viewer';

export type Platform = 'instagram' | 'facebook' | 'linkedin' | 'youtube' | 'tiktok';

export type ContentFormat =
  | 'Static Post'
  | 'Carousel'
  | 'Reel'
  | 'Short'
  | 'Video'
  | 'Story'
  | 'Text Post'
  | 'LinkedIn Post'
  | 'YouTube Video'
  | 'YouTube Short';

export type ContentPillar =
  | 'Marketing Digital'
  | 'Asistencia Virtual'
  | 'Autoridad'
  | 'Conversión'
  | 'Engagement'
  | 'Educativo'
  | 'Venta'
  | 'Entretenimiento'
  | 'Comunidad'
  | 'Detrás de Escena'
  | 'Testimonios';

export type PostStatus =
  | 'DRAFT'
  | 'IN_REVIEW'
  | 'CHANGES_REQUESTED'
  | 'APPROVED'
  | 'SCHEDULED'
  | 'PUBLISHED'
  | 'REJECTED'
  | 'FAILED';

export type TaskStatus =
  | 'TODO'
  | 'IN_PROGRESS'
  | 'IN_REVIEW'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'OVERDUE';

export type TaskPriority = 'HIGH' | 'MEDIUM' | 'LOW';

export interface Member {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: Role;
  title?: string;
  status: 'active' | 'invited' | 'inactive';
  invitedAt?: string;
  invitedBy?: string;
  deactivatedAt?: string;
}

export type TeamRole = Role;
export type TeamMember = Member;

export interface TeamInvitation {
  id: string;
  email: string;
  name: string;
  role: Role;
  token: string;
  status: 'pending' | 'accepted' | 'expired' | 'revoked';
  invitedBy: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  expiresAt: string;
  acceptedAt?: string;
  emailSent: boolean;
  emailDeliveryError?: string;
}

export interface BrandVoice {
  tone: string;
  personality: string[];
  powerWords: string[];
  forbiddenWords: string[];
  emojisAllowed: boolean;
  preferredCTAs: string[];
  styleGuidelines: string;
}

export interface Brand {
  id: string;
  name: string;
  tagline: string;
  industry: string;
  category?: string;
  description: string;
  services: string[];
  targetAudience: string;
  logoUrl?: string;
  logoDarkUrl?: string;
  logoLightUrl?: string;
  faviconUrl?: string;
  typography?: {
    display: string;
    body: string;
  };
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background?: string;
    text?: string;
    gold?: string;
    silver?: string;
  };
  primaryColor?: string;
  pillars?: ContentPillar[];
  voice: BrandVoice;
  isDefault?: boolean;
}

export interface PostVersion {
  version: number;
  timestamp: string;
  authorName: string;
  changesSummary: string;
  caption: string;
  hook: string;
  cta: string;
}

export interface ApprovalEntry {
  id: string;
  reviewerId: string;
  reviewerName: string;
  action: 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED' | 'SUBMITTED';
  comment?: string;
  timestamp: string;
}

export interface PlatformAdaptation {
  platform: Platform;
  caption: string;
  hook: string;
  cta: string;
  hashtags: string[];
  notes?: string;
}

export interface Post {
  id: string;
  brandId: string;
  internalTitle: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  platforms: Platform[];
  format: ContentFormat;
  pillar: ContentPillar;
  theme: string;
  objective: string;
  hook: string;
  caption: string;
  cta: string;
  hashtags: string[];
  visualText?: string;
  visualDescription?: string;
  imagePrompt?: string;
  imageUrl?: string;
  script?: string; // For reels/shorts
  internalNotes?: string;
  status: PostStatus;
  assigneeId?: string;
  assigneeName?: string;
  campaignId?: string;
  campaignName?: string;
  relatedTaskIds: string[];
  approvalHistory: ApprovalEntry[];
  versions: PostVersion[];
  platformAdapitations?: Record<Platform, PlatformAdaptation>;
  slides?: DesignSlide[];
  hasGeneratedDesign?: boolean;
  sourceFromMatrix?: boolean;
  designCreditCost?: number;
  createdAt: string;
  updatedAt: string;
}

export interface TaskChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface TaskComment {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  text: string;
  timestamp: string;
}

export interface TaskHistoryEntry {
  id: string;
  authorName: string;
  action: string;
  timestamp: string;
}

export interface Task {
  id: string;
  brandId: string;
  title: string;
  description: string;
  assigneeId: string;
  assigneeName: string;
  creatorId: string;
  creatorName: string;
  priority: TaskPriority;
  startDate: string;
  deadlineDate: string; // YYYY-MM-DD
  deadlineTime: string; // HH:mm
  status: TaskStatus;
  tags: string[];
  checklist: TaskChecklistItem[];
  comments: TaskComment[];
  relatedPostId?: string;
  relatedPostTitle?: string;
  relatedCampaignId?: string;
  relatedCampaignName?: string;
  history: TaskHistoryEntry[];
  createdAt: string;
}

export type CampaignStatus = 'PLANNING' | 'ACTIVE' | 'COMPLETED' | 'PAUSED' | 'ARCHIVED';

export interface Campaign {
  id: string;
  brandId: string;
  name: string;
  objective: string;
  description?: string;
  startDate: string;
  endDate: string;
  audience?: string;
  targetAudience?: string;
  budget?: number;
  spent?: number;
  platforms?: Platform[];
  status: CampaignStatus;
  postIds: string[];
  taskIds: string[];
  quoteIds?: string[];
  services?: string[];
  memberIds?: string[];
  createdAt?: string;
  archivedAt?: string;
  notes?: string;
}

export interface SocialAccount {
  id: string;
  platform: Platform;
  platformName?: string;
  accountName: string;
  handle: string;
  accountHandle?: string;
  profilePic?: string;
  isConnected: boolean;
  accountId?: string;
  pageId?: string;
  lastSync?: string;
  requiresConfig?: boolean;
  requiredCredentials?: string[];
  missingCredentialsReason?: string;
  credentials?: {
    accessToken?: string;
    appId?: string;
  };
}

export interface GoogleAdsCampaign {
  id: string;
  name: string;
  status: 'ENABLED' | 'PAUSED';
  budgetDaily: number;
  impressions: number;
  clicks: number;
  cpc: number;
  conversions: number;
  cost: number;
}

export interface GoogleAdsAccount {
  isConnected: boolean;
  customerId?: string;
  currency: string;
  statusMessage: string;
  campaigns: GoogleAdsCampaign[];
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'task' | 'post' | 'approval' | 'system' | 'schedule';
  read: boolean;
  timestamp: string;
  linkView?: string;
}

export interface AuditLog {
  id: string;
  actorName: string;
  action: string;
  entityType: 'post' | 'task' | 'approval' | 'campaign' | 'settings' | 'ai';
  entityId: string;
  details: string;
  timestamp: string;
}

export interface BrandIdentityConfig {
  officialLogoUrl?: string;
  logoDarkUrl?: string;
  logoLightUrl?: string;
  faviconUrl?: string;
  brandName?: string;
  primaryColor?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface WorkspaceSettings {
  workspaceName: string;
  agencyType: string;
  timezone: string;
  autoDeleteRejectedPosts: boolean;
  defaultApprovalRequired: boolean;
  notifyOnTaskAssignment: boolean;
  notifyOnApprovalNeeded: boolean;
  notifyOnScheduleFailure: boolean;
  aiCredits?: number;
  brandIdentity?: BrandIdentityConfig;
}

export interface WorkspaceData {
  currentMember: Member;
  workspaceSettings: WorkspaceSettings;
  brands: Brand[];
  activeBrandId: string;
  members: Member[];
  posts: Post[];
  tasks: Task[];
  campaigns: Campaign[];
  socialAccounts: SocialAccount[];
  googleAds: GoogleAdsAccount;
  notifications: NotificationItem[];
  auditLogs: AuditLog[];
  blogPosts?: BlogPost[];
  quotes?: QuoteProposal[];
  plans?: AgencyPlan[];
  customServices?: AgencyCustomService[];
  commercialSettings?: CommercialSettings;
  imageLibrary?: ImageLibraryItem[];
  crmContacts?: CrmContact[];
  crmCompanies?: CrmCompany[];
  crmDeals?: CrmDeal[];
  crmPipelines?: CrmPipeline[];
  crmActivities?: CrmActivity[];
  crmFollowUps?: CrmFollowUp[];
  invitations?: TeamInvitation[];
}

export interface BlogSEOCheck {
  label: string;
  passed: boolean;
  tip: string;
}

export interface BlogFAQItem {
  question: string;
  answer: string;
}

export interface BlogPost {
  id: string;
  brandId: string;
  title: string;
  slug: string;
  status: 'DRAFT' | 'IN_REVIEW' | 'APPROVED' | 'PUBLISHED';
  author: string;
  authorRole: string;
  authorAvatar?: string;
  category: string;
  sourceType: 'topic' | 'url';
  sourceUrl?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  coverImage?: string;
  excerpt: string;
  contentMarkdown: string;
  seo: {
    metaTitle: string;
    metaDescription: string;
    focusKeyword: string;
    secondaryKeywords: string[];
    readingTime: string;
    wordCount: number;
    score: number;
    checklist: BlogSEOCheck[];
  };
  faqs?: BlogFAQItem[];
  repurposed?: {
    carousel?: DesignSlide[];
    reelScript?: ReelScriptScene[];
    stories?: Array<{
      slideNumber: number;
      headline: string;
      text: string;
      stickerIdea: string;
      cta: string;
    }>;
    linkedInPost?: string;
  };
  tableOfContents?: Array<{
    id: string;
    title: string;
    level: number;
  }>;
}

export type DesignFormatType =
  | 'Carrusel'
  | 'Post'
  | 'Creativo de pauta'
  | 'Guion de Reel'
  | 'Blog SEO';

export type DesignPillarType =
  | 'Marketing Digital'
  | 'Asistencia Virtual'
  | 'Autoridad'
  | 'Conversión'
  | 'Engagement'
  | 'Educativo'
  | 'Venta'
  | 'Comunidad';

export type DesignStyleType =
  | 'Pixel 12 Gold & Black (Oficial)'
  | 'Pixel 12 Luxury (Negro, Oro, Plata)'
  | 'Tecnológico Minimalista'
  | 'Editorial Ejecutivo'
  | 'Tipográfico de Alto Impacto'
  | 'Tipográfico'
  | 'Con capturas reales'
  | 'Pixel 12 Studio (Oficial)'
  | 'Cinematográfico';

export type AIRefinementAction =
  | 'improve'
  | 'rewrite'
  | 'shorten'
  | 'expand'
  | 'change_tone'
  | 'make_persuasive'
  | 'make_professional'
  | 'make_engaging'
  | 'generate_cta'
  | 'generate_visual_concept';

export interface DesignSlide {
  slideNumber: number;
  slideType: 'cover' | 'problem' | 'solution' | 'case_study' | 'cta';
  tag?: string;
  headline: string;
  subtitle?: string;
  bodyPoints?: string[];
  imageUrl?: string;
  imagePrompt?: string;
  layoutMode?: 'full_background' | 'split_top' | 'split_side' | 'floating_card' | 'quote_portrait';
  overlayOpacity?: number; // 0 to 100
  showAuthorBadge?: boolean;
  authorBadgeName?: string;
  authorBadgeTitle?: string;
  authorAvatar?: string;
  showOfficialLogo?: boolean;
  visualDescription?: string;
  highlightBadge?: string;
  accentColor?: string;
  metricNumber?: string;
  metricLabel?: string;
}

export interface ReelScriptScene {
  secondRange: string;
  shotType: string;
  visualDirection: string;
  voiceover: string;
}

export interface BlogSEOContent {
  metaTitle: string;
  metaDescription: string;
  readingTime: string;
  targetKeywords: string[];
  h1: string;
  outline: string[];
  summary: string;
  articleBody?: string;
}

export interface GeneratedDesignContent {
  id: string;
  title: string;
  theme: string;
  format: DesignFormatType;
  pillar: DesignPillarType;
  style: DesignStyleType;
  hook: string;
  caption: string;
  cta: string;
  hashtags: string[];
  visualConcept?: string;
  slides: DesignSlide[];
  reelScript?: ReelScriptScene[];
  blogSEO?: BlogSEOContent;
  suggestedTasks?: Array<{
    title: string;
    description: string;
    assignedRole: 'Designer' | 'Copywriter' | 'Community Manager';
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
  }>;
  createdAt: string;
}

export * from './quotes';

