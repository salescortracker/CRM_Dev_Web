import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Deal, DealLineItem, Invoice, Quote, RevenueSplit } from '../../../core/models/contact';
import { ApiService } from '../../../services/api.service';

type MeetingProvider = 'Phone Call' | 'Google Meet' | 'Zoom' | 'Microsoft Teams' | 'In-person Meeting';

interface ProductMeeting {
  id: string;
  title: string;
  date: string;
  time: string;
  provider: MeetingProvider;
  purpose: string;
  owner: string;
  recordId: string;
}

@Component({
  selector: 'app-deal-products',
  standalone: false,
  templateUrl: './deal-products.component.html',
  styleUrls: ['./deal-products.component.css']
})
export class DealProductsComponent implements OnInit {
  deal: Deal | null = null;
  quote: Quote | null = null;
  invoice: Invoice | null = null;
  loading = false;
  showLineItemForm = false;
  showRevenueSplitForm = false;
  showSchedulePanel = false;
  showUpcomingMeetings = false;
  message: { type: 'success' | 'warning' | 'danger' | 'info'; text: string } | null = null;

  workflowStages = ['Discovery', 'Qualification', 'Proposal', 'Negotiation', 'Closure'];
  currencies = ['USD', 'EUR', 'GBP', 'INR', 'AED', 'CAD', 'AUD'];
  productCategories = ['Software', 'Service', 'Add-on', 'Hardware', 'Consulting'];
  meetingProvider: MeetingProvider = 'Google Meet';
  meetingPurpose = 'Product and quote review';
  meetingDate = this.formatFutureDate(1);
  meetingTime = '12:00';
  meetingReminder = '30 minutes before';
  meetingNotes = '';
  meetingProviders: Array<{ name: MeetingProvider; icon: string; connected: boolean }> = [
    { name: 'Phone Call', icon: 'fa-phone', connected: true },
    { name: 'Google Meet', icon: 'fa-video', connected: true },
    { name: 'Zoom', icon: 'fa-video', connected: true },
    { name: 'Microsoft Teams', icon: 'fa-users', connected: false },
    { name: 'In-person Meeting', icon: 'fa-location-dot', connected: true },
  ];
  meetingPurposes = ['Product and quote review', 'Discount approval call', 'Invoice readiness review', 'Implementation scope review'];
  scheduledMeetings: ProductMeeting[] = [];

  sampleDeal: Deal = {
    id: 'deal-101',
    name: 'Mobile App Launch',
    companyId: 'company-123',
    amount: 27000,
    currency: 'USD',
    stage: 'Proposal',
    probability: 70,
    status: 'proposal_sent',
    ownerId: 'user-3',
    owner: { id: 'user-3', email: 'maria.lopez@example.com', firstName: 'Maria', lastName: 'Lopez', role: 'user' },
    lineItems: [
      { id: 'li-001', productId: 'prod-001', productName: 'Design Package', productCategory: 'Service', quantity: 1, unitPrice: 9500, currency: 'USD', discount: 0, tax: 0, total: 9500, description: 'UX, UI, prototype, and design system starter' },
      { id: 'li-002', productId: 'prod-002', productName: 'Development Package', productCategory: 'Consulting', quantity: 1, unitPrice: 14500, currency: 'USD', discount: 0, tax: 0, total: 14500, description: 'Frontend, backend integration, QA support' },
      { id: 'li-003', productId: 'prod-003', productName: 'Launch Enablement', productCategory: 'Add-on', quantity: 1, unitPrice: 3000, currency: 'USD', discount: 0, tax: 0, total: 3000, description: 'Store listing, handoff, and release checklist' }
    ],
    revenueSplits: [
      { id: 'split-001', dealId: 'deal-101', userId: 'user-3', user: { id: 'user-3', email: 'maria.lopez@example.com', firstName: 'Maria', lastName: 'Lopez', role: 'user' }, splitPercentage: 50, splitAmount: 13500, commission: 1350 },
      { id: 'split-002', dealId: 'deal-101', userId: 'user-4', user: { id: 'user-4', email: 'tom.young@example.com', firstName: 'Tom', lastName: 'Young', role: 'user' }, splitPercentage: 50, splitAmount: 13500, commission: 1350 }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  lineItemForm: DealLineItem = this.getEmptyLineItem();
  revenueSplitForm = {
    firstName: '',
    lastName: '',
    splitPercentage: 50,
    commissionRate: 10
  };

  constructor(
    private apiService: ApiService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const dealId = this.route.snapshot.paramMap.get('id');
    if (dealId) {
      this.loadDeal(dealId);
      return;
    }

    this.deal = this.sampleDeal;
  }

  loadDeal(dealId: string): void {
    this.loading = true;
    this.apiService.getDeal(dealId).subscribe(
      (response) => {
        this.deal = response.success && response.data ? this.normalizeDeal(response.data) : this.sampleDeal;
        this.loading = false;
      },
      (error) => {
        console.error('Error loading deal', error);
        this.deal = this.sampleDeal;
        this.loading = false;
        this.showMessage('warning', 'Using sample deal data because this deal could not be loaded.');
      }
    );
  }

  get dealTotal(): number {
    return this.deal?.lineItems?.reduce((sum, item) => sum + item.total, 0) || 0;
  }

  get discountTotal(): number {
    return this.deal?.lineItems?.reduce((sum, item) => sum + this.getDiscountAmount(item), 0) || 0;
  }

  get taxTotal(): number {
    return this.deal?.lineItems?.reduce((sum, item) => sum + this.getTaxAmount(item), 0) || 0;
  }

  get splitTotal(): number {
    return this.deal?.revenueSplits?.reduce((sum, split) => sum + split.splitPercentage, 0) || 0;
  }

  get isSplitBalanced(): boolean {
    return Math.round(this.splitTotal) === 100;
  }

  get approvalRisk(): 'Low' | 'Medium' | 'High' {
    if (this.getCreditUsagePercent() > 80 || !this.isSplitBalanced) {
      return 'High';
    }
    if (this.getCreditUsagePercent() > 60 || this.dealTotal > 25000) {
      return 'Medium';
    }
    return 'Low';
  }

  get quoteSubtotal(): number {
    return this.dealTotal + this.discountTotal - this.taxTotal;
  }

  get ownerName(): string {
    return this.deal?.owner ? `${this.deal.owner.firstName} ${this.deal.owner.lastName}` : 'Sales owner';
  }

  get companyName(): string {
    const dealWithCompany = this.deal as (Deal & { company?: { name?: string } }) | null;
    return dealWithCompany?.company?.name || this.deal?.companyId || 'Company Account';
  }

  get companyInitials(): string {
    return this.getInitials(this.companyName);
  }

  get closeDateLabel(): string {
    const closeDate = new Date(this.deal?.expectedCloseDate || this.deal?.updatedAt || new Date());
    return closeDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  getStageClass(stage: string | undefined): string {
    const classes: Record<string, string> = {
      Prospecting: 'stage-prospecting',
      Qualification: 'stage-qualification',
      Proposal: 'stage-proposal',
      Negotiation: 'stage-negotiation',
      'Closed Won': 'stage-won',
      'Closed Lost': 'stage-lost'
    };
    return classes[stage || ''] || 'stage-prospecting';
  }

  addLineItem(): void {
    this.lineItemForm = this.getEmptyLineItem();
    this.showLineItemForm = true;
  }

  saveLineItem(): void {
    if (!this.deal || !this.lineItemForm.productName.trim()) {
      this.showMessage('warning', 'Enter a product name before saving.');
      return;
    }

    const item: DealLineItem = {
      ...this.lineItemForm,
      productName: this.lineItemForm.productName.trim(),
      productCategory: this.lineItemForm.productCategory || 'Software',
      quantity: Number(this.lineItemForm.quantity) || 1,
      unitPrice: Number(this.lineItemForm.unitPrice) || 0,
      currency: this.lineItemForm.currency || this.deal.currency || 'USD',
      discount: Number(this.lineItemForm.discount) || 0,
      tax: Number(this.lineItemForm.tax) || 0,
      total: this.calculateLineTotal(this.lineItemForm)
    };

    this.apiService.addDealLineItem(this.deal.id, item).subscribe((response) => {
      const currentItems = (this.deal!.lineItems || []).filter((lineItem) => lineItem.id !== response.data.id);
      this.deal = {
        ...this.deal!,
        lineItems: [...currentItems, response.data as DealLineItem],
        updatedAt: new Date()
      };
      this.syncDealAmount();
      this.showLineItemForm = false;
      this.showMessage('success', 'Product added to this deal.');
    });
  }

  removeLineItem(itemId: string | undefined): void {
    if (!this.deal || !itemId) {
      return;
    }

    this.apiService.deleteDealLineItem(this.deal.id, itemId).subscribe(() => {
      this.deal = {
        ...this.deal!,
        lineItems: this.deal!.lineItems?.filter((item) => item.id !== itemId) || [],
        updatedAt: new Date()
      };
      this.syncDealAmount();
      this.showMessage('success', 'Product removed from this deal.');
    });
  }

  addRevenueSplit(): void {
    this.showRevenueSplitForm = true;
  }

  removeRevenueSplit(splitId: string | undefined): void {
    if (!this.deal || !splitId) {
      return;
    }

    this.apiService.deleteRevenueSplit(this.deal.id, splitId).subscribe(() => {
      this.deal = {
        ...this.deal!,
        revenueSplits: this.deal!.revenueSplits?.filter((split) => split.id !== splitId) || [],
        updatedAt: new Date()
      };
      this.showMessage(this.isSplitBalanced ? 'success' : 'warning', this.isSplitBalanced ? 'Revenue split removed and balanced.' : 'Revenue split removed. Total split should equal 100%.');
    });
  }

  saveRevenueSplit(): void {
    if (!this.deal) {
      return;
    }

    const firstName = this.revenueSplitForm.firstName.trim() || 'Sales';
    const lastName = this.revenueSplitForm.lastName.trim() || 'Rep';
    const percentage = Math.max(0, Math.min(100, Number(this.revenueSplitForm.splitPercentage) || 0));
    const splitAmount = (this.dealTotal * percentage) / 100;
    const commission = splitAmount * ((Number(this.revenueSplitForm.commissionRate) || 0) / 100);
    const userId = `user-${Date.now()}`;
    const split: RevenueSplit = {
      dealId: this.deal.id,
      userId,
      user: {
        id: userId,
        email: `${firstName}.${lastName}@example.com`.toLowerCase(),
        firstName,
        lastName,
        role: 'user'
      },
      splitPercentage: percentage,
      splitAmount,
      commission
    };

    this.apiService.addRevenueSplit(this.deal.id, split).subscribe((response) => {
      const currentSplits = (this.deal!.revenueSplits || []).filter((revenueSplit) => revenueSplit.id !== response.data.id);
      this.deal = {
        ...this.deal!,
        revenueSplits: [...currentSplits, response.data as RevenueSplit],
        updatedAt: new Date()
      };
      this.showRevenueSplitForm = false;
      this.revenueSplitForm = { firstName: '', lastName: '', splitPercentage: 50, commissionRate: 10 };
      this.showMessage(this.isSplitBalanced ? 'success' : 'warning', this.isSplitBalanced ? 'Revenue split added and balanced.' : 'Revenue split added. Total split should equal 100%.');
    });
  }

  createQuote(): void {
    if (!this.deal) {
      return;
    }

    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + 14);

    const quoteData: Quote = {
      id: `quote-${Date.now()}`,
      dealId: this.deal.id,
      quoteNumber: `QT-${Date.now()}`,
      companyId: this.deal.companyId,
      contactId: this.deal.contactId || '',
      lineItems: this.deal.lineItems || [],
      subtotal: this.dealTotal - this.taxTotal,
      taxAmount: this.taxTotal,
      discountAmount: this.discountTotal,
      totalAmount: this.dealTotal,
      currency: this.deal.currency || 'USD',
      validUntil,
      status: 'draft',
      notes: 'Generated from deal products',
      createdBy: this.deal.ownerId || 'system',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.apiService.createQuoteFromDeal(this.deal.id, quoteData).subscribe(() => {
      this.quote = quoteData;
      this.deal = { ...this.deal!, quoteId: quoteData.id, status: 'quote_pending', updatedAt: new Date() };
      this.showMessage('success', 'Quote draft created and ready to send.');
    });
  }

  createInvoice(): void {
    if (!this.deal || !this.quote) {
      this.showMessage('warning', 'Create a quote before creating an invoice.');
      return;
    }

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);

    this.invoice = {
      id: `inv-${Date.now()}`,
      dealId: this.deal.id,
      quoteId: this.quote.id,
      invoiceNumber: `INV-${Date.now()}`,
      companyId: this.deal.companyId,
      contactId: this.deal.contactId || '',
      lineItems: this.deal.lineItems || [],
      subtotal: this.dealTotal - this.taxTotal,
      taxAmount: this.taxTotal,
      discountAmount: this.discountTotal,
      totalAmount: this.dealTotal,
      currency: this.deal.currency || 'USD',
      invoiceDate: new Date(),
      dueDate,
      paymentTerms: 'Net 30',
      status: 'draft',
      notes: 'Generated from deal quote',
      createdBy: this.deal.ownerId || 'system',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.deal = { ...this.deal, invoiceId: this.invoice.id, paymentStatus: 'unpaid', updatedAt: new Date() };
    this.apiService.updateDeal(this.deal.id, this.deal).subscribe(() => {});
    this.showMessage('success', 'Invoice created from quote.');
  }

  goToDealProfile(): void {
    if (this.deal) {
      this.router.navigate(['/deals', this.deal.id]);
    }
  }

  goToNegotiation(): void {
    if (this.deal) {
      this.router.navigate(['/deals', this.deal.id, 'negotiate']);
    }
  }

  advanceStage(): void {
    if (!this.deal) {
      return;
    }

    const currentIndex = this.workflowStages.indexOf(this.getWorkflowStage(this.deal.stage));
    const nextIndex = Math.min(this.workflowStages.length - 1, currentIndex + 1);
    this.deal.stage = this.workflowStages[nextIndex];
    this.deal.probability = Math.min(100, (nextIndex + 1) * 20 + 20);
    this.deal.updatedAt = new Date();
    this.showMessage('success', `Deal moved to ${this.deal.stage}.`);
  }

  getWorkflowProgress(): number {
    if (!this.deal) {
      return 0;
    }

    const index = this.workflowStages.indexOf(this.getWorkflowStage(this.deal.stage));
    return ((index + 1) / this.workflowStages.length) * 100;
  }

  getStageState(stage: string): 'complete' | 'current' | 'upcoming' {
    const currentIndex = this.workflowStages.indexOf(this.getWorkflowStage(this.deal?.stage));
    const stageIndex = this.workflowStages.indexOf(stage);
    if (stageIndex < currentIndex) {
      return 'complete';
    }
    if (stageIndex === currentIndex) {
      return 'current';
    }
    return 'upcoming';
  }

  getWorkflowStage(stage: string | undefined): string {
    const normalized = (stage || '').toLowerCase();
    const stageMap: Record<string, string> = {
      prospecting: 'Discovery',
      discovery: 'Discovery',
      qualification: 'Qualification',
      proposal: 'Proposal',
      proposal_sent: 'Proposal',
      quote_pending: 'Proposal',
      negotiation: 'Negotiation',
      'closed won': 'Closure',
      closed_won: 'Closure',
      'closed lost': 'Closure',
      closed_lost: 'Closure',
      closure: 'Closure',
    };
    return stageMap[normalized] || 'Discovery';
  }

  getCreditUsagePercent(): number {
    if (!this.deal) {
      return 0;
    }
    return this.deal.amount ? Math.min(100, (this.deal.amount / 100000) * 100) : 0;
  }

  getCreditUsageClass(): string {
    const percent = this.getCreditUsagePercent();
    if (percent > 80) {
      return 'bg-danger';
    }
    if (percent > 60) {
      return 'bg-warning';
    }
    return 'bg-success';
  }

  getCreditUsageLabel(): string {
    const percent = this.getCreditUsagePercent();
    return `${percent.toFixed(0)}% of available credit used`;
  }

  requestApproval(): void {
    this.showMessage('info', 'Approval request submitted to the finance team.');
  }

  markWon(): void {
    this.closeDeal('closed_won', 'Customer approved products and quote.');
  }

  markLost(): void {
    this.closeDeal('closed_lost', 'Customer declined products and quote.');
  }

  toggleSchedulePanel(): void {
    if (!this.deal) {
      return;
    }

    this.showSchedulePanel = !this.showSchedulePanel;
    if (this.showSchedulePanel) {
      this.meetingPurpose = this.quote ? 'Invoice readiness review' : 'Product and quote review';
      this.meetingNotes = `Review products, pricing, discounts, tax, and quote readiness for ${this.deal.name}.`;
    }
  }

  selectMeetingProvider(provider: MeetingProvider): void {
    this.meetingProvider = provider;
  }

  saveMeeting(): void {
    if (!this.deal) {
      return;
    }

    this.scheduledMeetings.unshift({
      id: `products-meet-${Date.now()}`,
      title: `${this.meetingPurpose} for ${this.deal.name}`,
      date: this.meetingDate,
      time: this.meetingTime,
      provider: this.meetingProvider,
      purpose: this.meetingPurpose,
      owner: this.deal.owner ? `${this.deal.owner.firstName} ${this.deal.owner.lastName}` : 'Sales owner',
      recordId: this.deal.id
    });
    this.showSchedulePanel = false;
    this.showUpcomingMeetings = true;
    this.showMessage('success', `${this.meetingPurpose} scheduled.`);
  }

  getDealMeetings(): ProductMeeting[] {
    if (!this.deal) {
      return [];
    }

    return this.scheduledMeetings.filter((meeting) => meeting.recordId === this.deal?.id);
  }

  getStatusColor(status: string | undefined): string {
    const colors: Record<string, string> = {
      draft: 'secondary',
      sent: 'info',
      accepted: 'success',
      paid: 'success',
      rejected: 'danger',
      overdue: 'danger',
      quote_pending: 'warning',
      proposal_sent: 'info'
    };
    return colors[status || ''] || 'secondary';
  }

  updateLineItemTotal(): void {
    this.lineItemForm.total = this.calculateLineTotal(this.lineItemForm);
  }

  getDiscountAmount(item: DealLineItem): number {
    const base = (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
    const discountPercent = Math.max(0, Math.min(100, Number(item.discount) || 0));
    return (base * discountPercent) / 100;
  }

  getTaxAmount(item: DealLineItem): number {
    const base = (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
    const discountAmount = this.getDiscountAmount(item);
    const taxPercent = Math.max(0, Number(item.tax) || 0);
    return ((base - discountAmount) * taxPercent) / 100;
  }

  private calculateLineTotal(item: DealLineItem): number {
    const quantity = Number(item.quantity) || 0;
    const unitPrice = Number(item.unitPrice) || 0;
    const base = quantity * unitPrice;
    return Math.max(0, base - this.getDiscountAmount(item) + this.getTaxAmount(item));
  }

  private getEmptyLineItem(): DealLineItem {
    return {
      productId: `prod-${Date.now()}`,
      productName: '',
      productCategory: 'Software',
      quantity: 1,
      unitPrice: 0,
      currency: 'USD',
      discount: 0,
      tax: 0,
      total: 0,
      description: ''
    };
  }

  private normalizeDeal(apiDeal: Partial<Deal>): Deal {
    return {
      ...this.sampleDeal,
      ...apiDeal,
      companyId: apiDeal.companyId || this.sampleDeal.companyId,
      ownerId: apiDeal.ownerId || this.sampleDeal.ownerId,
      status: apiDeal.status || this.sampleDeal.status,
      stage: apiDeal.stage || this.sampleDeal.stage,
      probability: apiDeal.probability || this.sampleDeal.probability,
      lineItems: apiDeal.lineItems?.length ? apiDeal.lineItems : this.sampleDeal.lineItems,
      revenueSplits: apiDeal.revenueSplits?.length ? apiDeal.revenueSplits : this.sampleDeal.revenueSplits,
      createdAt: apiDeal.createdAt || this.sampleDeal.createdAt,
      updatedAt: apiDeal.updatedAt || new Date()
    };
  }

  private syncDealAmount(): void {
    if (this.deal) {
      this.deal.amount = this.dealTotal;
    }
  }

  private closeDeal(status: 'closed_won' | 'closed_lost', reason: string): void {
    if (!this.deal) {
      return;
    }

    this.apiService.closeDeal(this.deal.id, {
      status,
      reason,
      notes: status === 'closed_won' ? 'Products and quote approved.' : 'Deal closed from products and quote workspace.'
    }).subscribe((response) => {
      if (response.success) {
        this.deal = response.data;
        this.showMessage('success', `${this.deal?.name} marked as ${status === 'closed_won' ? 'won' : 'lost'}.`);
      }
    });
  }

  private formatFutureDate(days: number): string {
    const future = new Date();
    future.setDate(future.getDate() + days);
    return future.toISOString().slice(0, 10);
  }

  private showMessage(type: 'success' | 'warning' | 'danger' | 'info', text: string): void {
    this.message = { type, text };
    setTimeout(() => {
      this.message = null;
    }, 3500);
  }

  private getInitials(value: string): string {
    return value
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('') || 'NA';
  }
}
