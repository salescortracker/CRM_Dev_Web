export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneOffice?: string;
  phoneMobile?: string;
  jobTitle?: string;
  department?: string;
  companyId?: string;
  company?: Company;
  leadSource?: string;
  leadStatus?: string;
  rating?: number;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  addresses?: Address[];
  tags?: string[];
  mergedFrom?: string[];
  mergedWith?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: User;
}

export interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  companyName?: string;
  jobTitle?: string;
  leadSource: string; // Website, Email, Referral, Cold Call, Ad, Other
  leadStatus: string; // New, Contacted, Qualified, Unqualified, Converted, Not Interested
  leadScore: number; // 0-100
  scoreReason?: string;
  lastContactDate?: Date;
  contactCount: number;
  emailOpens: number;
  websiteVisits: number;
  nextFollowupDate?: Date;
  territory?: string;
  utmSource?: string;
  utmCampaign?: string;
  utmMedium?: string;
  sourceCategory?: string;
  leadQueueStatus?: 'unassigned' | 'assigned';
  assignedTo?: string;
  assignedToUser?: User;
  assignedAt?: Date;
  autoAssigned?: boolean;
  convertedContactId?: string;
  convertedAt?: Date;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Company {
  id: string;
  name: string;
  website?: string;
  industry?: string;
  companySize?: string;
  annualRevenue?: number;
  foundedYear?: number;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  addresses?: Address[];
  creditLimit?: number;
  creditUsed?: number;
  accountStatus?: 'active' | 'inactive' | 'suspended';
  accountManager?: string;
  activitySummary?: AccountActivity;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Deal {
  id: string;
  name: string;
  companyId: string;
  contactId?: string;
  amount: number;
  currency?: string;
  stage: string;
  probability: number;
  expectedCloseDate?: Date;
  actualCloseDate?: Date;
  status: 'open' | 'negotiation' | 'proposal_sent' | 'quote_pending' | 'closed_won' | 'closed_lost';
  ownerId: string;
  owner?: User;
  description?: string;
  lineItems?: DealLineItem[];
  revenueSplits?: RevenueSplit[];
  quoteId?: string;
  invoiceId?: string;
  paymentStatus?: 'unpaid' | 'partially_paid' | 'paid';
  negotiationNotes?: NegotiationNote[];
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Activity {
  id: string;
  activityType: string;
  subject: string;
  description?: string;
  contactId?: string;
  companyId?: string;
  dealId?: string;
  activityDate: Date;
  durationMinutes?: number;
  outcome?: string;
  followUpRequired: boolean;
  followUpDate?: Date;
  createdBy: User;
  createdAt: Date;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  assignedTo: string;
  assignedToUser?: User;
  priority: 'high' | 'medium' | 'low';
  status: 'open' | 'in_progress' | 'completed';
  dueDate: Date;
  contactId?: string;
  dealId?: string;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'super-admin' | 'admin' | 'user';
  permissions?: string[];
  avatar?: string;
  phone?: string;
  department?: string;
  lastLogin?: Date;
}

export interface PipelineStage {
  id: string;
  name: string;
  probability: number;
  dealCount: number;
  totalValue: number;
}

export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/* ============ NEW INTERFACES FOR MISSING FEATURES ============ */

// Contact & Company Management
export interface Address {
  id?: string;
  type: 'billing' | 'shipping' | 'other';
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  isDefault?: boolean;
  createdAt?: Date;
}

export interface AccountActivity {
  totalInteractions: number;
  lastInteractionDate?: Date;
  emailsSent: number;
  callsMade: number;
  meetingsScheduled: number;
  tasksCompleted: number;
  openTasks: number;
  upcomingDeals: number;
}

export interface ContactMergeRequest {
  primaryContactId: string;
  secondaryContactIds: string[];
  mergeStrategy: 'keep_primary' | 'most_recent' | 'manual_select';
  fieldMappings?: Record<string, string>;
  createdAt: Date;
  status: 'pending' | 'approved' | 'completed';
}

export interface BulkImportJob {
  id: string;
  fileName: string;
  totalRows: number;
  successfulRows: number;
  failedRows: number;
  validationErrors: ValidationError[];
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: Date;
  completedAt?: Date;
}

export interface ValidationError {
  rowNumber: number;
  field: string;
  value: string;
  errorMessage: string;
}

// Deal Management
export interface DealLineItem {
  id?: string;
  productId: string;
  productName: string;
  productCategory?: string;
  quantity: number;
  unitPrice: number;
  currency?: string;
  discount?: number;
  tax?: number;
  total: number;
  description?: string;
}

export interface RevenueSplit {
  id?: string;
  dealId: string;
  userId: string;
  user?: User;
  splitPercentage: number;
  splitAmount: number;
  commission?: number;
}

export interface Quote {
  id: string;
  dealId: string;
  quoteNumber: string;
  companyId: string;
  contactId: string;
  lineItems: DealLineItem[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  currency?: string;
  validUntil?: Date;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  sentDate?: Date;
  respondedDate?: Date;
  notes?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Invoice {
  id: string;
  dealId: string;
  quoteId?: string;
  invoiceNumber: string;
  companyId: string;
  contactId: string;
  lineItems: DealLineItem[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  currency?: string;
  invoiceDate: Date;
  dueDate: Date;
  paymentTerms?: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  sentDate?: Date;
  paidDate?: Date;
  notes?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Payment {
  id: string;
  invoiceId: string;
  dealId: string;
  amount: number;
  currency?: string;
  paymentMethod: 'credit_card' | 'bank_transfer' | 'check' | 'cash' | 'other';
  referenceNumber?: string;
  paymentDate: Date;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  notes?: string;
  recordedBy: string;
  createdAt: Date;
}

export interface NegotiationNote {
  id?: string;
  dealId: string;
  // note: string;
  // id: number;
  note: string;
  // createdAt: string;
  negotiationPoint: string;
  proposedBy: string;
  respondedBy?: string;
  response?: string;
  proposalDetails?: string;
  status: 'proposed' | 'accepted' | 'rejected' | 'counter_proposed';
  createdAt: Date;
  updatedAt?: Date;
}

export interface PipelineBoard {
  id: string;
  name: string;
  stages: PipelineStage[];
  deals: Deal[];
  lastUpdated: Date;
}

