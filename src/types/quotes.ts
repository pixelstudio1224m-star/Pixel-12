export type QuoteStatus =
  | 'DRAFT'
  | 'SENT'
  | 'VIEWED'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'EXPIRED';

export type PlanCadence =
  | 'Mensual'
  | 'Trimestral'
  | 'Pago único'
  | 'Por horas'
  | 'Semestral'
  | 'Anual'
  | string;

export interface AgencyPlan {
  id: string;
  name: string;
  tagline?: string;
  description: string;
  price: number;
  currency?: string;
  cadence?: PlanCadence;
  period?: string;
  services?: string[];
  includedServices?: string[];
  benefits: string[];
  features?: string[];
  conditions?: string[];
  deliverables?: string[];
  imageUrl?: string;
  badge?: string;
  isPopular?: boolean;
  order?: number;
  isActive?: boolean;
}

export interface AgencyCustomService {
  id: string;
  name: string;
  description: string;
  category: string;
  basePrice?: number;
  defaultPrice?: number;
  unit?: string;
  deliverables?: string[];
  isActive?: boolean;
}

export interface QuoteItem {
  id: string;
  type: 'PLAN' | 'SERVICE';
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  total: number;
  planId?: string;
  serviceId?: string;
  deliverables?: string[];
}

export interface ProposalVisual {
  id: string;
  type: 'cover' | 'concept' | 'solution' | 'service' | 'editorial' | 'mockup';
  title: string;
  subtitle?: string;
  imageUrl: string;
  concept?: string;
  prompt?: string;
  aspectRatio?: '1:1' | '4:5' | '16:9' | '9:16';
  category?: string;
  style?: string;
  tags?: string[];
}

export interface RoadmapPhase {
  phase: string;
  title?: string;
  duration: string;
  description: string;
  deliverables: string[];
}

export interface QuoteProposal {
  id: string;
  folio: string; // e.g. "P12-COT-2026-001"
  brandId: string;
  status: QuoteStatus;
  title?: string;
  client: {
    name: string;
    company: string;
    email: string;
    phone: string;
    cityCountry: string;
    taxId?: string;
    sector?: string;
    logoUrl?: string;
    website?: string;
  };
  issueDate?: string;
  validUntil?: string;
  currency?: string;
  executiveSummary?: string;
  presentationText?: string;
  clientNeeds?: string[];
  proposedSolution?: string;
  selectedPlan?: AgencyPlan;
  items?: QuoteItem[];
  subtotal?: number;
  taxPercent?: number;
  taxAmount?: number;
  discountPercent?: number;
  discountAmount?: number;
  total?: number;
  paymentTerms?: string;
  paymentMethods?: string;
  termsAndConditions?: string | string[];
  roadmap?: RoadmapPhase[];
  visuals?: ProposalVisual[];
  notes?: string;
  sentAt?: string;
  acceptedAt?: string;
  rejectedAt?: string;
  createdAt: string;
  updatedAt: string;

  // Optional compat fields for legacy or alternate references
  author?: {
    name: string;
    role: string;
    email: string;
    phone: string;
    avatar?: string;
  };
  dates?: {
    issueDate: string;
    validUntilDate: string;
    estimatedStartDate?: string;
    estimatedDelivery?: string;
  };
  commercial?: {
    selectedPlanIds: string[];
    items: any[];
    subtotal: number;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    discountAmount: number;
    taxEnabled: boolean;
    taxPercentage: number;
    taxAmount: number;
    totalPrice: number;
    currency: string;
    paymentMethod: string;
    paymentTerms: string;
    deliveryTimeframe: string;
    observations?: string;
    additionalNotes?: string;
  };
  aiNarrative?: {
    title?: string;
    executiveSummary: string;
    agencyIntro: string;
    clientDiagnosis: string;
    proposedSolution: string;
    roadmapPhases: RoadmapPhase[];
    valueJustification: string;
    deliverablesList: string[];
    roiBenefits: string[];
    recommendedAddons: string[];
    closingCta: string;
    commercialNotes: string;
  };
}

export interface CommercialSettings {
  defaultCurrency: string;
  taxPercent?: number;
  taxEnabled?: boolean;
  defaultTaxPercentage?: number;
  validityDays?: number;
  defaultValidityDays?: number;
  paymentTermsDefault?: string;
  defaultPaymentMethod?: string;
  defaultPaymentTerms?: string;
  bankDetails: any;
  termsAndConditions?: string | string[];
  agencyInfo?: {
    name: string;
    tagline: string;
    email: string;
    phone: string;
    website: string;
    address: string;
    logoUrl: string;
  };
  defaultTerms?: string[];
}

export type ImageCategoryType =
  | 'Cotizaciones'
  | 'Propuestas'
  | 'Redes sociales'
  | 'Marketing'
  | 'Branding'
  | 'Asistencia virtual'
  | 'Campañas'
  | 'Otros';

export interface ImageLibraryItem {
  id: string;
  title: string;
  prompt: string;
  imageUrl: string;
  category: ImageCategoryType | string;
  aspectRatio: string;
  style: string;
  tags: string[];
  sector?: string;
  client?: string;
  visualDirection?: string;
  createdAt: string;
}
