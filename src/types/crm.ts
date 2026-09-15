export type CrmContactStatus = 'LEAD' | 'PROSPECT' | 'CLIENT' | 'CHURNED' | 'PARTNER';

export type ContactLifecycleStage =
  | 'LEAD'
  | 'PROSPECT'
  | 'OPPORTUNITY'
  | 'CUSTOMER'
  | 'CHURNED';

export type CrmLeadSource =
  | 'Web'
  | 'Instagram'
  | 'LinkedIn'
  | 'WhatsApp'
  | 'Referral'
  | 'Meta Ads'
  | 'Google Ads'
  | 'Evento'
  | 'Outbound'
  | 'Otro'
  | string;

export interface CrmContractedService {
  id: string;
  name: string;
  type: 'PLAN' | 'SERVICE' | 'CUSTOM';
  monthlyPrice: number;
  billingCadence: string; // e.g. "Mensual", "Pago único", "Trimestral"
  startDate: string;
  endDate?: string;
  status: 'ACTIVE' | 'PAUSED' | 'CANCELLED';
  deliverables?: string[];
  quoteId?: string;
}

export interface CrmContact {
  id: string;
  firstName?: string;
  lastName?: string;
  fullName: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  position?: string;
  companyId?: string;
  companyName?: string;
  avatarUrl?: string;
  cityCountry?: string;
  linkedinUrl?: string;
  notes?: string;
  tags: string[];
  status?: CrmContactStatus;
  lifecycleStage?: ContactLifecycleStage;
  source?: string;
  leadSource?: CrmLeadSource;
  leadScore: number; // 0 - 100
  assignedToId?: string;
  assignedToMemberId?: string;
  assignedToName?: string;
  contractedServices?: CrmContractedService[];
  associatedQuoteIds?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CrmCompany {
  id: string;
  name: string;
  tradeName?: string;
  taxId?: string;
  sector?: string;
  industry?: string;
  website?: string;
  address?: string;
  cityCountry?: string;
  city?: string;
  country?: string;
  phone?: string;
  email?: string;
  logoUrl?: string;
  employeeCount?: string;
  estimatedRevenue?: string;
  annualRevenue?: string;
  notes?: string;
  tags?: string[];
  clientStatus?: 'PROSPECT' | 'ACTIVE_CLIENT' | 'FORMER_CLIENT';
  contactIds?: string[];
  contractedServices?: CrmContractedService[];
  lifetimeValue?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CrmPipelineStage {
  id: string;
  name: string;
  color: string; // hex or tailwind class
  order: number;
  probability: number; // percentage 0-100
  winState?: 'OPEN' | 'WON' | 'LOST';
}

export type CrmStage = CrmPipelineStage;

export interface CrmPipeline {
  id: string;
  name: string;
  description?: string;
  isDefault: boolean;
  stages: CrmPipelineStage[];
  createdAt: string;
}

export interface CrmDeal {
  id: string;
  title: string;
  pipelineId: string;
  stageId: string;
  contactId?: string;
  contactName?: string;
  companyId?: string;
  companyName?: string;
  value: number;
  currency: string;
  expectedCloseDate?: string;
  probability: number; // 0 - 100
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  assignedTo?: string;
  assignedToId?: string;
  assignedToName?: string;
  tags: string[];
  associatedQuoteId?: string;
  associatedQuoteIds?: string[];
  notes?: string;
  lostReason?: string;
  createdAt: string;
  updatedAt: string;
}

export type CrmActivityType =
  | 'NOTE'
  | 'CALL'
  | 'WHATSAPP'
  | 'EMAIL'
  | 'MEETING'
  | 'STAGE_CHANGE'
  | 'QUOTE_CREATED'
  | 'QUOTE_ACCEPTED'
  | 'SERVICE_ACTIVATED'
  | 'TASK_COMPLETED'
  | 'FOLLOW_UP'
  | string;

export interface CrmActivity {
  id: string;
  entityType: 'CONTACT' | 'COMPANY' | 'DEAL';
  entityId: string;
  type: CrmActivityType;
  title: string;
  description: string;
  authorName: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export type CrmFollowUpChannel = 'WHATSAPP' | 'CALL' | 'EMAIL' | 'MEETING' | 'PROPOSAL_REVIEW' | string;

export interface CrmFollowUp {
  id: string;
  dealId?: string;
  contactId?: string;
  companyId?: string;
  contactName?: string;
  companyName?: string;
  title: string;
  type?: string;
  channel?: CrmFollowUpChannel;
  dueDate: string; // YYYY-MM-DD or ISO
  dueTime?: string; // HH:mm
  status: 'PENDING' | 'DONE' | 'CANCELLED';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  notes?: string;
  assignedTo?: string;
  assignedToName?: string;
  createdAt: string;
}

export type CommercialAIType =
  | 'quote'
  | 'proposal'
  | 'copy'
  | 'hook'
  | 'cta'
  | 'hashtags'
  | 'email'
  | 'followup'
  | 'content_ideas'
  | 'image_prompt'
  | 'EMAIL_PITCH'
  | 'WHATSAPP_CLOSING'
  | 'PROPOSAL_OUTLINE'
  | 'SOCIAL_SALES_COPY'
  | 'VISUAL_PROMPT_CREATIVE'
  | string;

export interface CommercialAIGenerateRequest {
  type: CommercialAIType;
  prompt?: string;
  clientName?: string;
  companyName?: string;
  industry?: string;
  selectedPlans?: string[];
  goal?: string;
  tone?: string;
  customInstructions?: string;
  clientContext?: {
    contactId?: string;
    clientName?: string;
    companyName?: string;
    sector?: string;
    tone?: string;
    selectedService?: string;
    dealValue?: number;
    channel?: string;
    goal?: string;
  };
}

export interface CommercialAIGenerateResponse {
  type: CommercialAIType;
  resultTitle?: string;
  primaryContent?: string;
  headline?: string;
  body?: string;
  callToAction?: string;
  followUpRecommendation?: string;
  imageGenerations?: Array<{ prompt: string; url?: string }>;
  structuredData?: Record<string, any>;
  suggestions?: string[];
  alternatives?: string[];
  createdAt: string;
}
