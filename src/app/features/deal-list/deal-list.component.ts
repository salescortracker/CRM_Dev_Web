import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Deal } from '../../core/models/contact';
import { ApiService } from '../../services/api.service';
import { AddDealsComponent } from '../deals/add-deals.component';

type DealView = Deal & { company?: { id?: string; name?: string }; contact?: any };
type MeetingProvider = 'Phone Call' | 'Google Meet' | 'Zoom' | 'Microsoft Teams' | 'In-person Meeting';
type DealProfileTab = 'overview' | 'timeline' | 'health' | 'notes';

interface InlineMeeting {
  id: string;
  title: string;
  date: string;
  time: string;
  provider: MeetingProvider;
  purpose: string;
  owner: string;
  recordId: string;
  notes: string;
}

interface DealProfileNote {
  id: string;
  dealId: string;
  author: string;
  badge: string;
  stage: string;
  body: string;
  createdAt: Date;
}

@Component({
  selector: 'app-deal-list',
  standalone: false,
  templateUrl: './deal-list.component.html',
  styleUrls: ['./deal-list.component.css']
})
export class DealListComponent implements OnInit {
  deals: DealView[] = [];
  selectedDeal: DealView | null = null;
  loading = false;
  currentPage = 1;
  pageSize = 20;
  totalRecords = 0;
  viewMode: 'table' | 'kanban' = 'table';
  dealSearch = '';
  profileTab: DealProfileTab = 'overview';
  activityMessage = '';
  dealProfileNotes: Record<string, DealProfileNote[]> = {};
  newDealNote = '';
  showSchedulePanel = false;
  showUpcomingMeetings = false;
  meetingProvider: MeetingProvider = 'Google Meet';
  meetingPurpose = 'Proposal review';
  meetingDate = this.formatFutureDate(1);
  meetingTime = '11:00';
  meetingReminder = '30 minutes before';
  meetingNotes = '';
  meetingProviders: Array<{ name: MeetingProvider; icon: string; connected: boolean }> = [
    { name: 'Phone Call', icon: 'fa-phone', connected: true },
    { name: 'Google Meet', icon: 'fa-video', connected: true },
    { name: 'Zoom', icon: 'fa-video', connected: true },
    { name: 'Microsoft Teams', icon: 'fa-users', connected: false },
    { name: 'In-person Meeting', icon: 'fa-location-dot', connected: true },
  ];
  meetingPurposes = ['Proposal review', 'Pricing discussion', 'Contract review', 'Renewal discussion', 'Product scope review'];
  scheduledMeetings: InlineMeeting[] = [
    {
      id: 'deal-meet-1',
      title: 'Proposal review with Acme procurement',
      date: this.formatFutureDate(1),
      time: '11:00',
      provider: 'Zoom',
      purpose: 'Proposal review',
      owner: 'Rohit Kumar',
      recordId: '1',
      notes: 'Review products, discount, approval timeline, and procurement checklist.'
    },
    {
      id: 'deal-meet-2',
      title: 'Renewal pricing discussion',
      date: this.formatFutureDate(2),
      time: '15:30',
      provider: 'Google Meet',
      purpose: 'Renewal discussion',
      owner: 'Maria Lopez',
      recordId: '6',
      notes: 'Discuss renewal package, SLA scope, and quarterly billing request.'
    }
  ];

  filters = {
    stage: '',
    owner: '',
    minAmount: '',
    maxAmount: '',
  };

  pipelineStages = ['Prospecting', 'Qualification', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'];
  kanbanStages = ['Prospecting', 'Qualification', 'Proposal', 'Negotiation', 'Closed Won'];
  funnelStages = ['Prospecting', 'Qualification', 'Proposal', 'Negotiation', 'Closed Won'];
  stageConversions: Record<string, string> = {
    Prospecting: '-',
    Qualification: '59%',
    Proposal: '89%',
    Negotiation: '21%',
    'Closed Won': '7%'
  };
  profilePipelineStages = ['Prospecting', 'Qualification', 'Proposal', 'Negotiation', 'Closed Won'];

  constructor(
    private apiService: ApiService,
    private router: Router,
    private route: ActivatedRoute,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.loadDeals();
  }

  loadDeals(): void {
    this.loading = true;
    this.apiService.getDeals(this.currentPage, this.pageSize, this.filters).subscribe(
      (response) => {
        if (response.success) {
          this.deals = response.data;
          this.totalRecords = response.pagination?.total || this.deals.length;
          this.selectDealFromRoute();
        }
        this.loading = false;
      },
      (error) => {
        console.error('Error loading deals', error);
        this.loading = false;
      }
    );
  }

  get filteredDeals(): DealView[] {
    const search = this.dealSearch.trim().toLowerCase();

    return this.deals.filter((deal) => {
      const ownerName = this.getOwnerName(deal);
      const companyName = this.getCompanyName(deal);
      const amount = Number(deal.amount) || 0;
      const minAmount = Number(this.filters.minAmount) || 0;
      const maxAmount = Number(this.filters.maxAmount) || 0;

      const matchesSearch = !search ||
        deal.name.toLowerCase().includes(search) ||
        companyName.toLowerCase().includes(search) ||
        ownerName.toLowerCase().includes(search);
      const matchesStage = !this.filters.stage || deal.stage === this.filters.stage;
      const matchesOwner = !this.filters.owner || ownerName === this.filters.owner;
      const matchesMin = !minAmount || amount >= minAmount;
      const matchesMax = !maxAmount || amount <= maxAmount;

      return matchesSearch && matchesStage && matchesOwner && matchesMin && matchesMax;
    });
  }

  get totalPipelineValue(): number {
    return this.activePipelineDeals.reduce((sum, deal) => sum + (Number(deal.amount) || 0), 0);
  }

  get weightedPipelineValue(): number {
    return this.activePipelineDeals.reduce((sum, deal) => sum + ((Number(deal.amount) || 0) * (Number(deal.probability) || 0) / 100), 0);
  }

  get activePipelineDeals(): DealView[] {
    return this.deals.filter((deal) => deal.stage !== 'Closed Lost');
  }

  get openDealsCount(): number {
    return this.deals.filter((deal) => deal.stage !== 'Closed Won' && deal.stage !== 'Closed Lost').length;
  }

  get closedWonDeals(): DealView[] {
    return this.deals.filter((deal) => deal.stage === 'Closed Won' || deal.status === 'closed_won');
  }

  get closedWonValue(): number {
    return this.closedWonDeals.reduce((sum, deal) => sum + (Number(deal.amount) || 0), 0);
  }

  get avgDealSize(): number {
    if (!this.activePipelineDeals.length) {
      return 0;
    }

    return this.totalPipelineValue / this.activePipelineDeals.length;
  }

  get ownerOptions(): string[] {
    return Array.from(new Set(this.deals.map((deal) => this.getOwnerName(deal)).filter(Boolean)));
  }

  get avgDealHealth(): number {
    if (!this.deals.length) {
      return 0;
    }

    const total = this.deals.reduce((sum, deal) => sum + this.getDealHealthScore(deal), 0);
    return Math.round(total / this.deals.length);
  }

  openNewDealModal(): void {
    this.openDealModal();
  }

  openDealModal(deal?: DealView): void {
    const modalRef = this.modalService.open(AddDealsComponent, {
      size: 'lg',
      backdrop: 'static',
      keyboard: false,
    });

    if (deal) {
      modalRef.componentInstance.existingDeal = deal;
    }

    modalRef.result.then(
      (result) => {
        if (result) {
          this.loadDeals();
          this.selectedDeal = result;
          this.showActivity(deal ? `${result.name} was updated.` : `${result.name} was created.`);
        }
      },
      () => {}
    );
  }

  onFilterChange(): void {
    this.currentPage = 1;
  }

  clearFilters(): void {
    this.dealSearch = '';
    this.filters = {
      stage: '',
      owner: '',
      minAmount: '',
      maxAmount: '',
    };
  }

  setStageFilter(stage: string): void {
    this.filters.stage = stage === 'All' ? '' : stage;
    this.onFilterChange();
  }

  switchViewMode(mode: 'table' | 'kanban'): void {
    this.viewMode = mode;
  }

  selectDeal(deal: DealView): void {
    this.selectedDeal = deal;
    this.profileTab = 'overview';
    this.ensureDealNotes(deal);
    this.showSchedulePanel = false;
    this.showUpcomingMeetings = false;
    this.router.navigate(['/deals', deal.id]);
  }

  setProfileTab(tab: DealProfileTab): void {
    this.profileTab = tab;
  }

  closeDealProfile(): void {
    this.selectedDeal = null;
    this.router.navigate(['/deals']);
  }

  editDeal(id: string, event?: Event): void {
    event?.stopPropagation();
    const deal = this.deals.find((item) => item.id === id);
    if (deal) {
      this.openDealModal(deal);
    }
  }

  viewDeal(id: string): void {
    const deal = this.deals.find((item) => item.id === id);
    if (deal) {
      this.selectDeal(deal);
    }
  }

  viewProducts(id: string, event?: Event): void {
    event?.stopPropagation();
    this.router.navigate(['/deals', id, 'products']);
  }

  negotiateDeal(id: string, event?: Event): void {
    event?.stopPropagation();
    this.router.navigate(['/deals', id, 'negotiate']);
  }

  openCompany(deal: DealView, event?: Event): void {
    event?.stopPropagation();
    if (deal.companyId) {
      this.router.navigate(['/companies', deal.companyId]);
    }
  }

  exportDeals(): void {
    const header = ['Deal', 'Company', 'Value', 'Stage', 'Probability', 'Rep', 'Close Date'];
    const rows = this.filteredDeals.map((deal) => [
      deal.name,
      this.getCompanyName(deal),
      String(deal.amount),
      deal.stage,
      `${deal.probability}%`,
      this.getOwnerName(deal),
      this.getCloseDateLabel(deal)
    ]);
    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'deals-export.csv';
    link.click();
    URL.revokeObjectURL(link.href);
    this.showActivity('Deals exported.');
  }

  advanceDealStage(deal: DealView, event?: Event): void {
    event?.stopPropagation();
    const currentIndex = this.pipelineStages.indexOf(deal.stage);

    if (currentIndex < 0 || currentIndex >= this.pipelineStages.length - 2) {
      this.showActivity(`${deal.name} is already in a closing stage.`);
      return;
    }

    const nextStage = this.pipelineStages[currentIndex + 1];
    const updatedDeal: DealView = {
      ...deal,
      stage: nextStage,
      probability: this.getProbabilityForStage(nextStage),
      status: nextStage === 'Negotiation' ? 'negotiation' : nextStage === 'Proposal' ? 'proposal_sent' : deal.status,
      updatedAt: new Date()
    };

    this.deals = this.deals.map((item) => item.id === deal.id ? updatedDeal : item);
    if (this.selectedDeal?.id === deal.id) {
      this.selectedDeal = updatedDeal;
    }

    this.apiService.updateDeal(deal.id, updatedDeal).subscribe(() => {});
    this.showActivity(`${deal.name} advanced to ${nextStage}.`);
  }

  toggleSchedulePanel(): void {
    if (!this.selectedDeal) {
      return;
    }

    this.showSchedulePanel = !this.showSchedulePanel;
    if (this.showSchedulePanel) {
      this.meetingPurpose = this.selectedDeal.stage === 'Negotiation' ? 'Pricing discussion' : 'Proposal review';
      this.meetingNotes = `Prepare meeting for ${this.selectedDeal.name}.`;
    }
  }

  selectMeetingProvider(provider: MeetingProvider): void {
    this.meetingProvider = provider;
  }

  saveMeeting(): void {
    if (!this.selectedDeal) {
      return;
    }

    this.scheduledMeetings.unshift({
      id: `deal-meet-${Date.now()}`,
      title: `${this.meetingPurpose} for ${this.selectedDeal.name}`,
      date: this.meetingDate,
      time: this.meetingTime,
      provider: this.meetingProvider,
      purpose: this.meetingPurpose,
      owner: this.selectedDeal.owner ? `${this.selectedDeal.owner.firstName} ${this.selectedDeal.owner.lastName}` : 'Sales owner',
      recordId: this.selectedDeal.id,
      notes: this.meetingNotes || `Discuss ${this.meetingPurpose.toLowerCase()} with ${this.getCompanyName(this.selectedDeal)}.`
    });
    this.showSchedulePanel = false;
    this.showUpcomingMeetings = true;
    this.showActivity(`${this.meetingPurpose} scheduled for ${this.selectedDeal.name}.`);
  }

  getSelectedDealMeetings(): InlineMeeting[] {
    if (!this.selectedDeal) {
      return [];
    }

    return this.scheduledMeetings.filter((meeting) => meeting.recordId === this.selectedDeal?.id);
  }

  deleteDeal(id: string, event?: Event): void {
    event?.stopPropagation();
    if (confirm('Delete this deal?')) {
      this.apiService.deleteDeal(id).subscribe(
        () => {
          if (this.selectedDeal?.id === id) {
            this.selectedDeal = null;
          }
          this.loadDeals();
          this.showActivity('Deal deleted.');
        },
        (error) => console.error('Error deleting deal', error)
      );
    }
  }

  markWon(deal: DealView): void {
    this.apiService.closeDeal(deal.id, {
      status: 'closed_won',
      reason: 'Client approved the proposal',
      notes: 'Deal marked won from the deal profile.'
    }).subscribe((response) => {
      if (response.success) {
        this.selectedDeal = response.data;
        this.loadDeals();
        this.showActivity(`${deal.name} marked as won.`);
      }
    });
  }

  markLost(deal: DealView): void {
    this.apiService.closeDeal(deal.id, {
      status: 'closed_lost',
      reason: 'Client declined the proposal',
      notes: 'Deal marked lost from the deal profile.'
    }).subscribe((response) => {
      if (response.success) {
        this.selectedDeal = response.data;
        this.loadDeals();
        this.showActivity(`${deal.name} marked as lost.`);
      }
    });
  }

  getDealsByStage(stage: string): DealView[] {
    return this.filteredDeals.filter((deal) => deal.stage === stage);
  }

  getStageCount(stage: string): number {
    return this.getDealsByStage(stage).length;
  }

  getFunnelStageCount(stage: string): number {
    return this.deals.filter((deal) => deal.stage === stage).length;
  }

  getStageValue(stage: string): number {
    return this.deals
      .filter((deal) => deal.stage === stage)
      .reduce((sum, deal) => sum + (Number(deal.amount) || 0), 0);
  }

  getStageFunnelPercent(stage: string): number {
    const maxValue = Math.max(...this.funnelStages.map((item) => this.getStageValue(item)), 1);
    return Math.max(6, Math.round((this.getStageValue(stage) / maxValue) * 100));
  }

  getStageConversion(stage: string): string {
    return this.stageConversions[stage] || '-';
  }

  getStageConversionClass(stage: string): string {
    const conversion = parseInt(this.getStageConversion(stage), 10);
    if (Number.isNaN(conversion)) {
      return 'conversion-muted';
    }
    if (conversion >= 55) {
      return 'conversion-good';
    }
    if (conversion >= 20) {
      return 'conversion-warning';
    }
    return 'conversion-low';
  }

  getShortCurrency(value: number): string {
    if (Math.abs(value) >= 1000000) {
      return `$${(value / 1000000).toFixed(value % 1000000 === 0 ? 0 : 1)}M`;
    }

    return `$${Math.round(value / 1000)}k`;
  }

  getStageToneClass(stage: string | undefined): string {
    return this.getStageClass(stage).replace('stage-', 'tone-');
  }

  getStageProfileClass(stage: string | undefined): string {
    return `profile-${this.getStageToneClass(stage)}`;
  }

  getStatusLabel(status: string | undefined): string {
    return (status || 'open').replace(/_/g, ' ');
  }

  getStatusClass(status: string | undefined): string {
    const classes: Record<string, string> = {
      open: 'status-open',
      negotiation: 'status-negotiation',
      proposal_sent: 'status-proposal',
      quote_pending: 'status-quote',
      closed_won: 'status-won',
      closed_lost: 'status-lost',
    };
    return classes[status || 'open'] || 'status-open';
  }

  getCompanyName(deal: DealView): string {
    return deal.company?.name || deal.companyId || 'Company account';
  }

  getOwnerName(deal: DealView): string {
    return deal.owner ? `${deal.owner.firstName} ${deal.owner.lastName}` : 'Unassigned';
  }

  getCompanyInitials(deal: DealView): string {
    return this.getInitials(this.getCompanyName(deal));
  }

  getOwnerInitials(deal: DealView): string {
    return this.getInitials(this.getOwnerName(deal));
  }

  getNoteInitials(author: string): string {
    return this.getInitials(author);
  }

  getDealDescription(deal: DealView): string {
    return deal.description || this.getNextAction(deal);
  }

  getCloseDateLabel(deal: DealView): string {
    const closeDate = this.getCloseDate(deal);
    return closeDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  getCloseDateShortLabel(deal: DealView): string {
    const closeDate = this.getCloseDate(deal);
    return closeDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  }

  getCloseDateStatus(deal: DealView): string {
    if (deal.status === 'closed_won') {
      return 'Closed';
    }
    if (deal.status === 'closed_lost') {
      return 'Lost';
    }

    const closeDate = this.getCloseDate(deal);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    closeDate.setHours(0, 0, 0, 0);
    const days = Math.round((closeDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (days < 0) {
      return `${Math.abs(days)}d overdue`;
    }
    if (days === 0) {
      return 'Due today';
    }
    return `${days}d remaining`;
  }

  getCloseDateStatusClass(deal: DealView): string {
    if (deal.status === 'closed_won') {
      return 'close-good';
    }
    if (deal.status === 'closed_lost') {
      return 'close-muted';
    }

    const closeDate = this.getCloseDate(deal);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    closeDate.setHours(0, 0, 0, 0);
    return closeDate.getTime() < today.getTime() ? 'close-overdue' : 'close-upcoming';
  }

  getContactName(deal: DealView): string {
    if (deal.contact?.firstName || deal.contact?.lastName) {
      return `${deal.contact.firstName || ''} ${deal.contact.lastName || ''}`.trim();
    }

    return deal.contactId || 'Primary contact pending';
  }

  getContactRole(deal: DealView): string {
    return deal.contact?.jobTitle || deal.contact?.role || 'Decision maker';
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

  getDealHealthScore(deal: DealView): number {
    const probability = Number(deal.probability) || 0;
    const productsScore = (deal.lineItems?.length || 0) > 0 ? 12 : -8;
    const quoteScore = deal.quoteId ? 10 : -6;
    const negotiationScore = (deal.negotiationNotes?.length || 0) > 0 ? 8 : 0;
    const statusBase = deal.status === 'closed_won' ? 100 : deal.status === 'closed_lost' ? 20 : probability;
    return Math.max(0, Math.min(100, Math.round((statusBase * 0.72) + productsScore + quoteScore + negotiationScore)));
  }

  getRiskLevel(deal: DealView): 'None' | 'Low' | 'Medium' | 'High' {
    const score = this.getDealHealthScore(deal);
    if (deal.status === 'closed_won') {
      return 'None';
    }
    if (score >= 75) {
      return 'Low';
    }
    if (score >= 45) {
      return 'Medium';
    }
    return 'High';
  }

  getRiskClass(deal: DealView): string {
    return `risk-${this.getRiskLevel(deal).toLowerCase()}`;
  }

  getRiskBadgeText(deal: DealView): string {
    const risk = this.getRiskLevel(deal);
    return risk === 'None' ? 'No Risk' : `${risk} Risk`;
  }

  getRiskAlertLabel(deal: DealView): string {
    if (deal.status === 'closed_won') {
      return 'Ready for customer handoff';
    }
    if (deal.stage === 'Proposal') {
      return 'Send revised proposal';
    }
    if (deal.stage === 'Negotiation') {
      return 'Review counter offer';
    }
    if (!deal.lineItems?.length) {
      return 'Add products to build quote';
    }
    return this.getNextAction(deal);
  }

  getProfileStageState(deal: DealView, stage: string): 'complete' | 'current' | 'upcoming' {
    const currentIndex = this.profilePipelineStages.indexOf(deal.stage);
    const stageIndex = this.profilePipelineStages.indexOf(stage);
    if (stageIndex < currentIndex || deal.stage === 'Closed Won') {
      return 'complete';
    }
    if (stageIndex === currentIndex) {
      return 'current';
    }
    return 'upcoming';
  }

  getProfileStageIcon(deal: DealView, stage: string): string {
    const state = this.getProfileStageState(deal, stage);
    if (state === 'complete') {
      return 'fa-check';
    }
    if (state === 'current') {
      return 'fa-bullseye';
    }
    return 'fa-circle';
  }

  getStageProbabilityColor(deal: DealView): string {
    if (deal.probability >= 75 || deal.status === 'closed_won') {
      return 'probability-good';
    }
    if (deal.probability >= 45) {
      return 'probability-warning';
    }
    return 'probability-muted';
  }

  getDealIntel(deal: DealView): string {
    if (deal.negotiationNotes?.length) {
      return deal.negotiationNotes[0].note || 'Commercial review in progress.';
    }
    if (deal.quoteId) {
      return 'Budget confirmed. Quote is ready for buyer review.';
    }
    if (deal.lineItems?.length) {
      return 'Products selected. Quote can be prepared for approval.';
    }
    return 'Discovery in progress. Confirm budget, timeline, and buying team.';
  }

  getWeightedValue(deal: DealView): number {
    return ((Number(deal.amount) || 0) * (Number(deal.probability) || 0)) / 100;
  }

  getDealTimeline(deal: DealView): Array<{ title: string; detail: string; time: string; icon: string }> {
    return [
      ...(deal.negotiationNotes || []).slice(0, 3).map((note) => ({
        title: note.negotiationPoint || 'Negotiation update',
        detail: note.note || note.response || 'Deal note captured.',
        time: 'Negotiation',
        icon: 'fa-comments'
      })),
      {
        title: 'Products and quote',
        detail: `${deal.lineItems?.length || 0} products attached${deal.quoteId ? `, quote ${deal.quoteId} ready` : ', quote not created yet'}.`,
        time: 'Quote flow',
        icon: 'fa-box'
      },
      {
        title: 'Company connection',
        detail: `Connected to ${this.getCompanyName(deal)} for account context.`,
        time: 'Account',
        icon: 'fa-building'
      },
      {
        title: 'Next action',
        detail: this.getNextAction(deal),
        time: 'Follow-up',
        icon: 'fa-calendar-check'
      }
    ];
  }

  getDealProfileNotes(deal: DealView): DealProfileNote[] {
    this.ensureDealNotes(deal);
    return this.dealProfileNotes[deal.id] || [];
  }

  saveDealProfileNote(): void {
    if (!this.selectedDeal) {
      return;
    }

    const body = this.newDealNote.trim();
    if (!body) {
      this.showActivity('Add a note before saving.');
      return;
    }

    const note: DealProfileNote = {
      id: `deal-note-${Date.now()}`,
      dealId: this.selectedDeal.id,
      author: this.getOwnerName(this.selectedDeal),
      badge: 'Internal note',
      stage: this.selectedDeal.stage || 'Deal',
      body,
      createdAt: new Date()
    };

    this.dealProfileNotes[this.selectedDeal.id] = [note, ...this.getDealProfileNotes(this.selectedDeal)];
    this.newDealNote = '';
    this.showActivity(`Note saved for ${this.selectedDeal.name}.`);
  }

  getNextAction(deal: DealView): string {
    if (deal.status === 'closed_won') {
      return 'Handoff to billing and customer success.';
    }
    if (deal.status === 'closed_lost') {
      return 'Capture loss reason and schedule nurture follow-up.';
    }
    if (!deal.lineItems?.length) {
      return 'Add products before quote creation.';
    }
    if (!deal.quoteId) {
      return 'Create quote and request approval if needed.';
    }
    if (deal.stage === 'Negotiation') {
      return 'Review counter terms and confirm final decision date.';
    }
    return 'Schedule the next buyer conversation.';
  }

  getTotalPages(): number {
    return Math.ceil(this.totalRecords / this.pageSize);
  }

  private selectDealFromRoute(): void {
    const dealId = this.route.snapshot.paramMap.get('id');
    if (!dealId) {
      return;
    }

    const deal = this.deals.find((item) => item.id === dealId);
    if (deal) {
      this.selectedDeal = deal;
      this.ensureDealNotes(deal);
      if (this.route.snapshot.routeConfig?.path === 'deals/:id/edit') {
        this.openDealModal(deal);
      }
    }
  }

  private formatFutureDate(days: number): string {
    const future = new Date();
    future.setDate(future.getDate() + days);
    return future.toISOString().slice(0, 10);
  }

  private getProbabilityForStage(stage: string): number {
    const probabilityMap: Record<string, number> = {
      Prospecting: 20,
      Qualification: 40,
      Proposal: 65,
      Negotiation: 80,
      'Closed Won': 100,
      'Closed Lost': 0
    };
    return probabilityMap[stage] ?? 20;
  }

  private showActivity(message: string): void {
    this.activityMessage = message;
    setTimeout(() => {
      this.activityMessage = '';
    }, 4500);
  }

  private ensureDealNotes(deal: DealView): void {
    if (!this.dealProfileNotes[deal.id]) {
      this.dealProfileNotes[deal.id] = this.createDefaultDealNotes(deal);
    }
  }

  private createDefaultDealNotes(deal: DealView): DealProfileNote[] {
    const negotiationNotes = (deal.negotiationNotes || []).slice(0, 2).map((note: any, index: number) => ({
      id: `deal-note-${deal.id}-${index}`,
      dealId: deal.id,
      author: note.proposedBy || this.getOwnerName(deal),
      badge: note.negotiationPoint || 'Negotiation',
      stage: note.stage || note.stageName || deal.stage || 'Deal',
      body: note.note || note.response || 'Commercial update captured for this deal.',
      createdAt: note.createdAt ? new Date(note.createdAt) : new Date()
    }));

    if (negotiationNotes.length) {
      return negotiationNotes;
    }

    return [
      {
        id: `deal-note-${deal.id}-summary`,
        dealId: deal.id,
        author: this.getOwnerName(deal),
        badge: 'Deal Intel',
        stage: deal.stage || 'Deal',
        body: this.getDealIntel(deal),
        createdAt: new Date()
      }
    ];
  }

  private getCloseDate(deal: DealView): Date {
    const rawDate = deal.expectedCloseDate || deal.actualCloseDate || deal.updatedAt || new Date();
    return new Date(rawDate);
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
