// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-lead-management',
//   standalone: false,
//   templateUrl: './lead-management.component.html',
//   styleUrl: './lead-management.component.css'
// })
// export class LeadManagementComponent {
// mainTab: string = 'creation';

//   lead: any = {};
//   leads: any[] = [];

//   queue = [
//     { name: 'Kumar', status: 'New', assigned: 'Admin' }
//   ];

//   social: any = {};
//   socialLeads: any[] = [];

//   setMainTab(tab: string) {
//     this.mainTab = tab;
//   }

//   addLead() {
//     this.leads.push({ ...this.lead });
//     this.lead = {};
//   }

//   addSocialLead() {
//     this.socialLeads.push({ ...this.social });
//     this.social = {};
//   }
// }

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '../../../services/api.service';
import { Lead } from '../../../core/models/contact';
import { AddLeadsComponent } from '../add-leads/add-leads.component';
import { PlatformStorageService } from '../../../services/platform-storage.service';

type LeadDetailTab = 'overview' | 'activity' | 'notes';
type LeadTimelineType = 'call' | 'email' | 'meeting' | 'qualification' | 'conversion' | 'system';

interface LeadTimelineItem {
  id: string;
  leadId: string;
  type: LeadTimelineType;
  subject: string;
  description: string;
  time: string;
}

interface LeadNote {
  id: string;
  leadId: string;
  author: string;
  badge: string;
  body: string;
  createdAt: string;
}

@Component({
  selector: 'app-lead-management',
  standalone: false,
  templateUrl: './lead-management.component.html',
  styleUrls: ['./lead-management.component.css'],
})
export class LeadManagementComponent implements OnInit {
  private readonly leadWorkspaceStorageKey = 'lead-profile-workspace';
  leads: Lead[] = [];
  lead: any = {};
  // leads: any[] = [];
  loading = true;
  currentPage = 1;
  pageSize = 20;
  totalRecords = 0;
  searchQuery = '';
  selectedLeads: Set<string> = new Set();
  selectedLead: Lead | null = null;
  activeLeadAction: 'call' | 'email' | 'followup' | 'qualify' | 'convert' | null = null;
  activeLeadTab: LeadDetailTab = 'overview';
  activeQuickFilter = 'all';
  activityMessage = '';
  routeLeadId: string | null = null;
  editMode = false;
  private addModalOpenedFromRoute = false;
  leadActivities: Record<string, LeadTimelineItem[]> = {};
  leadNotes: Record<string, LeadNote[]> = {};
  newLeadNote = '';
  leadEditDraft: Partial<Lead> = {};

  leadStats = {
    totalLeads: 0,
    highScore: 0,
    mediumScore: 0,
    lowScore: 0,
    avgMonthlyLeads: 0,
    averageScore: 0,
    newLeadsThisMonth: 0,
    convertedThisMonth: 0,
    conversionRate: 0,
  };

  filters = {
    leadStatus: '',
    leadSource: '',
    territory: '',
    assignment: '',
    scoreRange: '',
  };

  leadSources = ['Website', 'Email', 'Referral', 'Cold Call', 'Ad', 'Facebook Ads', 'LinkedIn Ads', 'IndiaMART', 'Other'];
  territories = ['North', 'South', 'East', 'West', 'Central'];
  assignmentOptions = [
    { label: 'All', value: '' },
    { label: 'Unassigned', value: 'unassigned' },
    { label: 'Assigned', value: 'assigned' },
  ];

  leadStatuses = [
    'New',
    'Contacted',
    'Qualified',
    'Unqualified',
    'Converted',
    'Not Interested',
  ];

  scoreRanges = [
    { label: 'High Score (80+)', value: 'high' },
    { label: 'Medium Score (50-79)', value: 'medium' },
    { label: 'Low Score (<50)', value: 'low' },
  ];

  assignmentUsers = [
    'Rohit Kumar',
    'Priya Nair',
    'Deepak Sharma',
    'Anita Patel',
    'Mohit Singh',
  ];

  selectedAssignmentLeadId: string | null = null;
  selectedAssignmentUser = '';
  callOutcome = 'Connected';
  callNotes = '';
  emailSubject = '';
  emailMessage = '';
  followUpDate = '';
  followUpTime = '';
  followUpProvider = 'Google Meet';
  followUpPurpose = 'Lead qualification';
  followUpReminder = '30 minutes before';
  followUpNotes = '';
  followUpProviders = [
    { name: 'Phone Call', icon: 'fa-phone', connected: true },
    { name: 'Google Meet', icon: 'fa-video', connected: true },
    { name: 'Zoom', icon: 'fa-video', connected: true },
    { name: 'Microsoft Teams', icon: 'fa-users', connected: false },
    { name: 'In-person Meeting', icon: 'fa-location-dot', connected: true },
  ];
  followUpPurposes = ['Lead qualification', 'Follow-up', 'Product demo', 'Proposal review', 'Renewal discussion'];
  followUpReminders = ['At meeting time', '15 minutes before', '30 minutes before', '1 hour before', '1 day before'];
  showLeadUpcomingMeetings = false;

  constructor(
    private apiService: ApiService,
    private router: Router,
    private route: ActivatedRoute,
    private modalService: NgbModal,
    private storage: PlatformStorageService
  ) {}

  ngOnInit(): void {
    this.routeLeadId = this.route.snapshot.paramMap.get('id');
    this.editMode = this.route.snapshot.routeConfig?.path === 'leads/:id/edit';
    this.loadLeadWorkspace();
    this.loadLeads();
    this.loadLeadStats();

    if (this.route.snapshot.data['openNewLeadModal']) {
      setTimeout(() => this.openNewLeadModal(true));
    }
  }

  loadLeads(): void {
    this.loading = true;
    const requestFilters = {
      ...this.filters,
      searchQuery: this.searchQuery,
      quickFilter: this.activeQuickFilter === 'all' ? '' : this.activeQuickFilter,
    };

    this.apiService
      .getLeads(this.currentPage, this.pageSize, requestFilters)
      .subscribe(
        (response) => {
          if (response.success) {
            this.leads = response.data;
            this.totalRecords = response.pagination?.total || 0;
            this.selectLeadFromRoute();
            this.syncSelectedLead();
          }
          this.loading = false;
        },
        (error) => {
          console.error('Error loading leads', error);
          this.loading = false;
        }
      );
  }

  loadLeadStats(): void {
    this.apiService.getLeadStats().subscribe(
      (response) => {
        if (response.success) {
          this.leadStats = response.data;
        }
      },
      (error) => console.error('Error loading lead stats', error)
    );
  }

  openNewLeadModal(fromRoute = false): void {
    if (fromRoute && this.addModalOpenedFromRoute) {
      return;
    }
    this.addModalOpenedFromRoute = fromRoute;

    const modalRef = this.modalService.open(
      AddLeadsComponent, {
      size: 'lg',
      backdrop: 'static',
      keyboard: false,
    });

    modalRef.result.then(
      (result) => {
        if (result) {
          this.loadLeads();
          this.loadLeadStats();
          this.selectedLead = result;
          this.showActivity(`${result.firstName} ${result.lastName} was added to the lead queue.`);
          if (fromRoute) {
            this.router.navigate(['/leads', result.id]);
          }
        }
      },
      (reason) => {
        if (fromRoute) {
          this.router.navigate(['/leads']);
        }
      }
    );
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadLeads();
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadLeads();
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.activeQuickFilter = 'all';
    this.filters = {
      leadStatus: '',
      leadSource: '',
      territory: '',
      assignment: '',
      scoreRange: '',
    };
    this.loadLeads();
  }

  applyQuickFilter(filter: string): void {
    this.activeQuickFilter = filter;
    this.currentPage = 1;
    this.loadLeads();
  }

  get unassignedLeads(): Lead[] {
    return this.leads.filter((lead) => lead.leadQueueStatus === 'unassigned');
  }

  get agedLeads(): Lead[] {
    return this.leads.filter(
      (lead) =>
        lead.leadQueueStatus === 'unassigned' &&
        lead.lastContactDate &&
        this.calculateLeadAge(lead.lastContactDate) >= 4
    );
  }

  calculateLeadAge(date: Date): number {
    const diff = Date.now() - new Date(date).getTime();
    return Math.round(diff / (1000 * 60 * 60 * 24));
  }

  assignmentByTerritory(territory?: string): string {
    const map: Record<string, string> = {
      North: 'Rohit Kumar',
      South: 'Priya Nair',
      East: 'Deepak Sharma',
      West: 'Anita Patel',
      Central: 'Mohit Singh',
    };
    return map[territory || ''] || 'TBD Sales';
  }

  autoAssignLeads(): void {
    const updates = this.leads
      .filter((lead) => lead.leadQueueStatus === 'unassigned')
      .map((lead) => ({
        ...lead,
        leadQueueStatus: 'assigned' as const,
        assignedTo: this.assignmentByTerritory(lead.territory),
        assignedAt: new Date(),
        autoAssigned: true,
      }));

    updates.forEach((lead) => {
      this.apiService.updateLead(lead.id, lead).subscribe();
    });

    this.leads = this.leads.map((lead) => {
      if (lead.leadQueueStatus === 'unassigned') {
        return updates.find((item) => item.id === lead.id) || lead;
      }
      return lead;
    });
    this.syncSelectedLead();
    this.showActivity(`${updates.length} unassigned lead${updates.length === 1 ? '' : 's'} auto-assigned by territory.`);
  }

  openLeadAssignment(lead: Lead): void {
    if (lead.leadQueueStatus !== 'unassigned') {
      return;
    }

    this.selectedAssignmentLeadId = lead.id;
    this.selectedAssignmentUser = '';
  }

  confirmLeadAssignment(): void {
    const lead = this.leads.find((item) => item.id === this.selectedAssignmentLeadId);
    if (!lead) {
      return;
    }

    if (!this.selectedAssignmentUser) {
      alert('Please choose a user to assign this lead to.');
      return;
    }

    this.patchLead(lead.id, {
      leadQueueStatus: 'assigned',
      assignedTo: this.selectedAssignmentUser,
      assignedAt: new Date(),
      autoAssigned: false,
    });
    this.showActivity(`Assigned ${lead.firstName} ${lead.lastName} to ${this.selectedAssignmentUser}.`);
    this.cancelLeadAssignmentSelection();
  }

  cancelLeadAssignmentSelection(): void {
    this.selectedAssignmentLeadId = null;
    this.selectedAssignmentUser = '';
  }

  assignLead(lead: Lead): void {
    if (lead.leadQueueStatus !== 'unassigned') {
      return;
    }

    const assignedTo = this.assignmentByTerritory(lead.territory);
    this.patchLead(lead.id, {
      leadQueueStatus: 'assigned',
      assignedTo,
      assignedAt: new Date(),
      autoAssigned: true,
    });
    this.showActivity(`Assigned ${lead.firstName} ${lead.lastName} to ${assignedTo}.`);
  }

  recycleLead(lead: Lead): void {
    this.patchLead(lead.id, {
      leadQueueStatus: 'assigned',
      assignedTo: 'Reassigned Team',
      assignedAt: new Date(),
      leadStatus: 'Contacted',
    });
    this.showActivity(`${lead.firstName} ${lead.lastName} was recycled and reassigned.`);
  }

  scheduleFollowUp(lead: Lead): void {
    this.selectedLead = lead;
    this.activeLeadAction = 'followup';
    this.showLeadUpcomingMeetings = false;
    const next = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
    this.followUpDate = next.toISOString().slice(0, 10);
    this.followUpTime = '10:00';
    this.followUpProvider = 'Google Meet';
    this.followUpPurpose = lead.leadStatus === 'Qualified' ? 'Product demo' : 'Lead qualification';
    this.followUpReminder = '30 minutes before';
    this.followUpNotes = `Discuss next step with ${lead.firstName} ${lead.lastName}${lead.companyName ? ' from ' + lead.companyName : ''}.`;
  }

  get selectedLeadUpcomingMeetings(): Array<{ title: string; date: Date; provider: string; purpose: string; owner: string }> {
    if (!this.selectedLead?.nextFollowupDate) {
      return [];
    }

    const date = new Date(this.selectedLead.nextFollowupDate);
    if (date < new Date()) {
      return [];
    }

    return [{
      title: `${this.selectedLead.firstName} ${this.selectedLead.lastName} follow-up`,
      date,
      provider: 'Google Meet',
      purpose: this.selectedLead.leadStatus === 'Qualified' ? 'Product demo' : 'Lead qualification',
      owner: this.selectedLead.assignedTo || 'Sales owner'
    }];
  }

  saveFollowUp(): void {
    if (!this.selectedLead || !this.followUpDate || !this.followUpTime) {
      this.showActivity('Choose a follow-up date and time.');
      return;
    }

    const nextFollowupDate = new Date(`${this.followUpDate}T${this.followUpTime}`);
    const provider = this.followUpProviders.find((item) => item.name === this.followUpProvider);
    if (!provider?.connected) {
      this.showActivity(`${this.followUpProvider} is not connected for this tenant. Choose another option or connect it in Calendar Integrations.`);
      return;
    }

    this.patchLead(this.selectedLead.id, {
      nextFollowupDate,
      leadStatus: this.selectedLead.leadStatus === 'New' ? 'Contacted' : this.selectedLead.leadStatus,
      scoreReason: `${this.followUpPurpose} scheduled via ${this.followUpProvider}. ${this.followUpNotes}`,
    });
    this.addLeadActivity(
      this.selectedLead,
      'meeting',
      this.followUpPurpose,
      `${this.followUpPurpose} scheduled via ${this.followUpProvider}. Reminder: ${this.followUpReminder}. ${this.followUpNotes}`
    );
    this.showActivity(`${this.followUpPurpose} scheduled for ${this.selectedLead.firstName} ${this.selectedLead.lastName} via ${this.followUpProvider} on ${nextFollowupDate.toLocaleString()}. Reminder: ${this.followUpReminder}.`);
    this.closeLeadAction();
  }

  quickScheduleFollowUp(lead: Lead): void {
    const nextFollowupDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
    this.patchLead(lead.id, {
      nextFollowupDate,
      leadStatus: lead.leadStatus === 'New' ? 'Contacted' : lead.leadStatus,
    });
    this.addLeadActivity(lead, 'meeting', 'Quick follow-up scheduled', `Follow-up scheduled for ${nextFollowupDate.toLocaleDateString()}.`);
    this.showActivity(`Follow-up scheduled for ${lead.firstName} ${lead.lastName} on ${nextFollowupDate.toLocaleDateString()}.`);
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadLeads();
  }

  getLeadScoreBadge(score: number): string {
    if (score >= 80) return 'danger';
    if (score >= 50) return 'warning';
    return 'secondary';
  }

  getLeadScoreStars(score: number): number {
    return Math.ceil(score / 20);
  }

  getLeadInitials(lead: Lead): string {
    return `${lead.firstName?.[0] || ''}${lead.lastName?.[0] || ''}`.toUpperCase() || 'LD';
  }

  getLeadScoreClass(score: number): string {
    if (score >= 80) return 'score-red';
    if (score >= 50) return 'score-amber';
    return 'score-gray';
  }

  getLeadSourceClass(source: string | undefined): string {
    const normalized = (source || '').toLowerCase();
    if (normalized.includes('website')) return 'tag-cyan';
    if (normalized.includes('referral')) return 'tag-green';
    if (normalized.includes('linkedin')) return 'tag-purple';
    if (normalized.includes('facebook')) return 'tag-blue';
    if (normalized.includes('event')) return 'tag-orange';
    return 'tag-slate';
  }

  getLeadStatusClass(status: string | undefined): string {
    const normalized = (status || '').toLowerCase().replace(/\s+/g, '-');
    return `status-${normalized || 'new'}`;
  }

  getLeadTemperatureLabel(score: number): string {
    if (score >= 80) return 'Hot';
    if (score >= 50) return 'Warm';
    return 'Cold';
  }

  getLeadTemperatureClass(score: number): string {
    if (score >= 80) return 'hot';
    if (score >= 50) return 'warm';
    return 'cold';
  }

  getLeadProfileTags(lead: Lead): string[] {
    const tags = [
      ...(lead.tags || []),
      lead.companyName ? 'Company lead' : '',
      lead.leadStatus,
      lead.leadSource
    ].filter(Boolean) as string[];

    return Array.from(new Set(tags)).slice(0, 3);
  }

  getLeadNextStepTitle(lead: Lead): string {
    if (lead.convertedContactId) return 'Open contact';
    if (lead.leadStatus === 'Qualified' && lead.leadScore >= 85) return 'Send contract';
    if (lead.leadStatus === 'Qualified') return 'Prepare proposal';
    if (lead.nextFollowupDate) return 'Attend follow-up';
    if (lead.leadStatus === 'Contacted') return 'Schedule product demo';
    if (lead.leadStatus === 'New') return 'Log first call';
    return 'Review lead';
  }

  getLeadNextStepNote(lead: Lead): string {
    if (lead.convertedContactId) return 'Lead already converted';
    if (lead.leadStatus === 'Qualified' && lead.leadScore >= 85) return 'Awaiting legal sign-off';
    if (lead.leadStatus === 'Qualified') return 'Ready to move toward deal creation';
    if (lead.nextFollowupDate) return 'Meeting linked to this lead';
    if (lead.leadStatus === 'Contacted') return 'Keep momentum with a product conversation';
    if (lead.leadStatus === 'New') return 'No sales touchpoint recorded yet';
    return lead.scoreReason || 'Review the latest lead context';
  }

  getLeadNextStepDate(lead: Lead): Date | undefined {
    return lead.nextFollowupDate || lead.updatedAt || lead.createdAt;
  }

  getLeadMeetingsCount(lead: Lead): number {
    this.ensureLeadWorkspace(lead);
    const today = Date.now();
    const meetingsHeld = (this.leadActivities[lead.id] || []).filter((activity) =>
      activity.type === 'meeting' && new Date(activity.time).getTime() <= today
    ).length;

    return meetingsHeld || Math.min(2, Math.floor((lead.contactCount || 0) / 2));
  }

  getLeadEngagementNote(lead: Lead): string {
    if (lead.lastContactDate && this.calculateLeadAge(lead.lastContactDate) === 0) {
      return 'Responded same day';
    }
    if (lead.emailOpens >= 5 || lead.contactCount >= 3) {
      return 'Active buying conversation';
    }
    if (!lead.lastContactDate) {
      return 'No response yet';
    }
    return this.getLeadAgeLabel(lead);
  }

  getLeadOwnerNote(lead: Lead): string {
    if (!lead.assignedTo) {
      return 'Waiting in assignment queue';
    }
    if (lead.leadScore >= 80) {
      return 'Ready for close';
    }
    if (lead.leadStatus === 'Qualified') {
      return 'Ready for deal creation';
    }
    return 'Ready for sales follow-up';
  }

  getLeadScoreWidth(score: number): number {
    return Math.min(100, Math.max(0, score || 0));
  }

  getStatusBadgeColor(status: string): string {
    switch (status) {
      case 'New':
        return 'info';
      case 'Contacted':
        return 'primary';
      case 'Qualified':
        return 'success';
      case 'Unqualified':
        return 'danger';
      case 'Converted':
        return 'success';
      case 'Not Interested':
        return 'dark';
      default:
        return 'secondary';
    }
  }

  editLead(id: string): void {
    const lead = this.leads.find((item) => item.id === id);
    if (lead) {
      this.selectedLead = lead;
      this.ensureLeadWorkspace(lead);
      this.editMode = true;
      this.activeLeadTab = 'overview';
      this.activeLeadAction = null;
      this.prepareLeadEditDraft(lead);
      this.router.navigate(['/leads', id, 'edit']);
      this.showActivity(`Edit mode opened for ${lead.firstName} ${lead.lastName}.`);
    }
  }

  viewLead(id: string): void {
    const lead = this.leads.find((item) => item.id === id);
    if (lead) {
      this.selectedLead = lead;
      this.activeLeadAction = null;
      this.activeLeadTab = 'overview';
      this.ensureLeadWorkspace(lead);
      this.editMode = false;
      this.router.navigate(['/leads', id]);
      this.showActivity(`Opened profile for ${lead.firstName} ${lead.lastName}.`);
    }
  }

  closeLeadProfile(): void {
    this.selectedLead = null;
    this.activeLeadAction = null;
    this.activeLeadTab = 'overview';
    this.editMode = false;
    this.leadEditDraft = {};
    this.router.navigate(['/leads']);
  }

  setLeadTab(tab: LeadDetailTab): void {
    this.activeLeadTab = tab;
    if (tab !== 'overview') {
      this.activeLeadAction = null;
      this.editMode = false;
      this.leadEditDraft = {};
    }
    if (this.selectedLead) {
      this.ensureLeadWorkspace(this.selectedLead);
    }
  }

  cancelLeadEdit(): void {
    this.editMode = false;
    this.leadEditDraft = {};
    if (this.selectedLead) {
      this.router.navigate(['/leads', this.selectedLead.id]);
      this.showActivity(`Edit cancelled for ${this.selectedLead.firstName} ${this.selectedLead.lastName}.`);
    }
  }

  saveLeadEdit(): void {
    if (!this.selectedLead) {
      return;
    }

    const firstName = (this.leadEditDraft.firstName || '').trim();
    const lastName = (this.leadEditDraft.lastName || '').trim();
    const email = (this.leadEditDraft.email || '').trim();

    if (!firstName || !lastName || !email) {
      this.showActivity('First name, last name, and email are required.');
      return;
    }

    const leadScore = Math.min(100, Math.max(0, Number(this.leadEditDraft.leadScore ?? this.selectedLead.leadScore)));
    const changes: Partial<Lead> = {
      firstName,
      lastName,
      email,
      phone: (this.leadEditDraft.phone || '').trim(),
      companyName: (this.leadEditDraft.companyName || '').trim(),
      jobTitle: (this.leadEditDraft.jobTitle || '').trim(),
      leadSource: this.leadEditDraft.leadSource || this.selectedLead.leadSource,
      leadStatus: this.leadEditDraft.leadStatus || this.selectedLead.leadStatus,
      territory: this.leadEditDraft.territory || this.selectedLead.territory,
      assignedTo: (this.leadEditDraft.assignedTo || '').trim(),
      leadQueueStatus: this.leadEditDraft.assignedTo ? 'assigned' : this.selectedLead.leadQueueStatus,
      leadScore,
      scoreReason: (this.leadEditDraft.scoreReason || '').trim()
    };

    this.patchLead(this.selectedLead.id, changes);
    this.addLeadActivity({ ...this.selectedLead, ...changes }, 'system', 'Lead details updated', 'Profile fields were updated from the lead workspace.');
    this.editMode = false;
    this.leadEditDraft = {};
    this.router.navigate(['/leads', this.selectedLead.id]);
    this.showActivity(`${firstName} ${lastName} was updated.`);
  }

  logCall(lead: Lead): void {
    this.selectedLead = lead;
    this.activeLeadAction = 'call';
    this.callOutcome = 'Connected';
    this.callNotes = `Discussed interest with ${lead.firstName}.`;
  }

  saveCallLog(): void {
    if (!this.selectedLead) {
      return;
    }

    const scoreIncrease = this.callOutcome === 'Connected' ? 5 : 2;
    this.patchLead(this.selectedLead.id, {
      leadStatus: this.selectedLead.leadStatus === 'New' ? 'Contacted' : this.selectedLead.leadStatus,
      contactCount: (this.selectedLead.contactCount || 0) + 1,
      lastContactDate: new Date(),
      scoreReason: this.callNotes || `Call outcome: ${this.callOutcome}.`,
      leadScore: Math.min(100, this.selectedLead.leadScore + scoreIncrease),
    });
    this.addLeadActivity(
      this.selectedLead,
      'call',
      `${this.callOutcome} call`,
      this.callNotes || `Call outcome: ${this.callOutcome}.`
    );
    this.showActivity(`Call logged for ${this.selectedLead.firstName} ${this.selectedLead.lastName}.`);
    this.closeLeadAction();
  }

  quickLogCall(lead: Lead): void {
    this.patchLead(lead.id, {
      leadStatus: lead.leadStatus === 'New' ? 'Contacted' : lead.leadStatus,
      contactCount: (lead.contactCount || 0) + 1,
      lastContactDate: new Date(),
      scoreReason: 'Call logged. Interest and buying intent confirmed.',
      leadScore: Math.min(100, lead.leadScore + 5),
    });
    this.addLeadActivity(lead, 'call', 'Quick call logged', 'Interest and buying intent confirmed.');
    this.showActivity(`Call logged for ${lead.firstName} ${lead.lastName}.`);
  }

  sendEmail(lead: Lead): void {
    this.selectedLead = lead;
    this.activeLeadAction = 'email';
    this.emailSubject = `Following up with ${lead.companyName || 'your team'}`;
    this.emailMessage = `Hi ${lead.firstName},\n\nThanks for your interest. I wanted to share the next steps and schedule a quick discussion.`;
  }

  saveEmail(): void {
    if (!this.selectedLead || !this.emailSubject.trim()) {
      this.showActivity('Add an email subject before sending.');
      return;
    }

    this.patchLead(this.selectedLead.id, {
      leadStatus: this.selectedLead.leadStatus === 'New' ? 'Contacted' : this.selectedLead.leadStatus,
      emailOpens: (this.selectedLead.emailOpens || 0) + 1,
      lastContactDate: new Date(),
      scoreReason: `Email sent: ${this.emailSubject}`,
      leadScore: Math.min(100, this.selectedLead.leadScore + 3),
    });
    this.addLeadActivity(this.selectedLead, 'email', this.emailSubject, this.emailMessage || `Email sent: ${this.emailSubject}`);
    this.showActivity(`Email sent to ${this.selectedLead.firstName} ${this.selectedLead.lastName}.`);
    this.closeLeadAction();
  }

  quickSendEmail(lead: Lead): void {
    this.patchLead(lead.id, {
      leadStatus: lead.leadStatus === 'New' ? 'Contacted' : lead.leadStatus,
      emailOpens: (lead.emailOpens || 0) + 1,
      lastContactDate: new Date(),
      scoreReason: 'Email sent from the lead workspace.',
      leadScore: Math.min(100, lead.leadScore + 3),
    });
    this.addLeadActivity(lead, 'email', 'Email touchpoint recorded', 'Email sent from the lead workspace.');
    this.showActivity(`Email touchpoint recorded for ${lead.firstName} ${lead.lastName}.`);
  }

  qualifyLead(lead: Lead): void {
    this.selectedLead = lead;
    this.activeLeadAction = 'qualify';
  }

  confirmQualification(): void {
    if (!this.selectedLead) {
      return;
    }

    const lead = this.selectedLead;
    this.patchLead(lead.id, {
      leadStatus: 'Qualified',
      leadScore: Math.max(lead.leadScore, 82),
      scoreReason: 'Qualified after fit, interest, and timing review.',
      lastContactDate: new Date(),
    });
    this.addLeadActivity(lead, 'qualification', 'Lead qualified', 'Qualified after fit, interest, and timing review.');
    this.showActivity(`${lead.firstName} ${lead.lastName} moved to Qualified.`);
    this.closeLeadAction();
  }

  quickQualifyLead(lead: Lead): void {
    this.patchLead(lead.id, {
      leadStatus: 'Qualified',
      leadScore: Math.max(lead.leadScore, 82),
      scoreReason: 'Qualified after fit, interest, and timing review.',
      lastContactDate: new Date(),
    });
    this.addLeadActivity(lead, 'qualification', 'Lead qualified', 'Qualified after fit, interest, and timing review.');
    this.showActivity(`${lead.firstName} ${lead.lastName} moved to Qualified.`);
  }

  convertLead(id: string): void {
    const lead = this.leads.find((item) => item.id === id);
    if (lead) {
      this.selectedLead = lead;
      this.activeLeadAction = 'convert';
    }
  }

  confirmConvertLead(): void {
    if (!this.selectedLead) {
      return;
    }

    const id = this.selectedLead.id;
    this.apiService.convertLeadToContact(id).subscribe(
      (response) => {
        if (response.success) {
          const convertedLead = response.data.lead as Lead | undefined;
          if (convertedLead) {
            this.updateLeadInView(convertedLead);
            this.selectedLead = convertedLead;
            this.addLeadActivity(convertedLead, 'conversion', 'Converted to contact', `Converted to contact ${response.data.contactId}.`);
            this.showActivity(`${convertedLead.firstName} ${convertedLead.lastName} converted to contact ${response.data.contactId}.`);
          }
          this.loadLeadStats();
          this.closeLeadAction();
        }
      },
      (error) => console.error('Error converting lead', error)
    );
  }

  quickConvertLead(id: string): void {
    this.apiService.convertLeadToContact(id).subscribe(
      (response) => {
        if (response.success) {
          const convertedLead = response.data.lead as Lead | undefined;
          if (convertedLead) {
            this.updateLeadInView(convertedLead);
            this.selectedLead = convertedLead;
            this.addLeadActivity(convertedLead, 'conversion', 'Converted to contact', `Converted to contact ${response.data.contactId}.`);
            this.showActivity(`${convertedLead.firstName} ${convertedLead.lastName} converted to contact ${response.data.contactId}.`);
          }
          this.loadLeadStats();
        }
      },
      (error) => console.error('Error converting lead', error)
    );
  }

  closeLeadAction(): void {
    this.activeLeadAction = null;
  }

  get selectedLeadActivities(): LeadTimelineItem[] {
    if (!this.selectedLead) {
      return [];
    }

    this.ensureLeadWorkspace(this.selectedLead);
    return this.leadActivities[this.selectedLead.id] || [];
  }

  get selectedLeadNotes(): LeadNote[] {
    if (!this.selectedLead) {
      return [];
    }

    this.ensureLeadWorkspace(this.selectedLead);
    return this.leadNotes[this.selectedLead.id] || [];
  }

  saveLeadNote(): void {
    if (!this.selectedLead || !this.newLeadNote.trim()) {
      this.showActivity('Add a note before saving.');
      return;
    }

    const note: LeadNote = {
      id: this.storage.createId('lead-note'),
      leadId: this.selectedLead.id,
      author: this.selectedLead.assignedTo || 'Admin User',
      badge: 'Internal',
      body: this.newLeadNote.trim(),
      createdAt: new Date().toISOString()
    };

    this.leadNotes[this.selectedLead.id] = [note, ...(this.leadNotes[this.selectedLead.id] || [])];
    this.addLeadActivity(this.selectedLead, 'system', 'Note added', note.body);
    this.newLeadNote = '';
    this.persistLeadWorkspace();
    this.showActivity(`Note saved for ${this.selectedLead.firstName} ${this.selectedLead.lastName}.`);
  }

  getLeadSummaryNote(lead: Lead): string {
    if (lead.scoreReason) {
      return lead.scoreReason;
    }
    return `${getName(lead)} is a ${this.getLeadTemperatureLabel(lead.leadScore).toLowerCase()} lead from ${lead.leadSource || 'unknown source'}${lead.companyName ? ' at ' + lead.companyName : ''}. Next action: ${this.getLeadNextStepTitle(lead)}.`;
  }

  getTimelineIcon(type: LeadTimelineType): string {
    const icons: Record<LeadTimelineType, string> = {
      call: 'fa-phone',
      email: 'fa-envelope',
      meeting: 'fa-comments',
      qualification: 'fa-star',
      conversion: 'fa-user-check',
      system: 'fa-clipboard'
    };
    return icons[type];
  }

  getTimelineClass(type: LeadTimelineType): string {
    const classes: Record<LeadTimelineType, string> = {
      call: 'tl-icon-blue',
      email: 'tl-icon-green',
      meeting: 'tl-icon-purple',
      qualification: 'tl-icon-amber',
      conversion: 'tl-icon-green',
      system: 'tl-icon-slate'
    };
    return classes[type];
  }

  deleteLead(id: string): void {
    if (confirm('Are you sure you want to delete this lead?')) {
      this.apiService.deleteLead(id).subscribe(
        (response) => {
          if (response.success) {
            this.loadLeads();
            if (this.selectedLead?.id === id) {
              this.selectedLead = null;
              this.activeLeadAction = null;
              this.activeLeadTab = 'overview';
              this.editMode = false;
              this.router.navigate(['/leads']);
            }
            delete this.leadActivities[id];
            delete this.leadNotes[id];
            this.persistLeadWorkspace();
          }
        },
        (error) => console.error('Error deleting lead', error)
      );
    }
  }

  selectLead(id: string, event: any): void {
    if (event.target.checked) {
      this.selectedLeads.add(id);
    } else {
      this.selectedLeads.delete(id);
    }
  }

  selectAll(event: any): void {
    if (event.target.checked) {
      this.leads.forEach((lead) => this.selectedLeads.add(lead.id));
    } else {
      this.selectedLeads.clear();
    }
  }

  getTotalPages(): number {
    return Math.max(1, Math.ceil(this.totalRecords / this.pageSize));
  }

  getFormattedDate(date?: Date): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString();
  }

  getLeadAgeLabel(lead: Lead): string {
    if (!lead.lastContactDate) {
      return 'No contact yet';
    }
    const days = this.calculateLeadAge(lead.lastContactDate);
    return days === 0 ? 'Contacted today' : `${days} day${days === 1 ? '' : 's'} since last contact`;
  }

  openConvertedContact(lead: Lead): void {
    if (lead.convertedContactId) {
      this.router.navigate(['/contacts', lead.convertedContactId]);
    }
  }

  private patchLead(id: string, changes: Partial<Lead>): void {
    const existing = this.leads.find((lead) => lead.id === id);
    if (!existing) {
      return;
    }

    const updatedLead = {
      ...existing,
      ...changes,
      updatedAt: new Date(),
    };

    this.apiService.updateLead(id, updatedLead).subscribe((response) => {
      if (response.success) {
        this.updateLeadInView(response.data);
        this.loadLeadStats();
      }
    });
  }

  private updateLeadInView(updatedLead: Lead): void {
    this.leads = this.leads.map((lead) => (lead.id === updatedLead.id ? updatedLead : lead));
    if (this.selectedLead?.id === updatedLead.id) {
      this.selectedLead = updatedLead;
      this.ensureLeadWorkspace(updatedLead);
    }
  }

  private syncSelectedLead(): void {
    if (!this.selectedLead) {
      return;
    }

    this.selectedLead = this.leads.find((lead) => lead.id === this.selectedLead?.id) || this.selectedLead;
  }

  private selectLeadFromRoute(): void {
    if (!this.routeLeadId) {
      return;
    }

    const routeLead = this.leads.find((lead) => lead.id === this.routeLeadId);
    if (routeLead) {
      this.selectedLead = routeLead;
      this.ensureLeadWorkspace(routeLead);
      if (this.editMode) {
        this.prepareLeadEditDraft(routeLead);
      }
      this.showActivity(this.editMode ? `Edit mode opened for ${routeLead.firstName} ${routeLead.lastName}.` : `Opened profile for ${routeLead.firstName} ${routeLead.lastName}.`);
    }
  }

  private loadLeadWorkspace(): void {
    const saved = this.storage.get<{ activities: Record<string, LeadTimelineItem[]>; notes: Record<string, LeadNote[]> } | null>(this.leadWorkspaceStorageKey, null);
    if (saved) {
      this.leadActivities = saved.activities || {};
      this.leadNotes = saved.notes || {};
    }
  }

  private persistLeadWorkspace(): void {
    this.storage.set(this.leadWorkspaceStorageKey, {
      activities: this.leadActivities,
      notes: this.leadNotes
    });
  }

  private ensureLeadWorkspace(lead: Lead): void {
    let changed = false;
    if (!this.leadActivities[lead.id]) {
      this.leadActivities[lead.id] = this.createDefaultActivities(lead);
      changed = true;
    }
    if (!this.leadNotes[lead.id]) {
      this.leadNotes[lead.id] = this.createDefaultNotes(lead);
      changed = true;
    }
    if (changed) {
      this.persistLeadWorkspace();
    }
  }

  private addLeadActivity(lead: Lead, type: LeadTimelineType, subject: string, description: string): void {
    this.ensureLeadWorkspace(lead);
    const item: LeadTimelineItem = {
      id: this.storage.createId('lead-activity'),
      leadId: lead.id,
      type,
      subject,
      description,
      time: new Date().toISOString()
    };
    this.leadActivities[lead.id] = [item, ...(this.leadActivities[lead.id] || [])].slice(0, 30);
    this.persistLeadWorkspace();
  }

  private createDefaultActivities(lead: Lead): LeadTimelineItem[] {
    const items: LeadTimelineItem[] = [];
    if (lead.lastContactDate || lead.contactCount > 0) {
      items.push({
        id: `${lead.id}-default-call`,
        leadId: lead.id,
        type: 'call',
        subject: lead.contactCount > 1 ? 'Follow-up Call' : 'Discovery Call',
        description: lead.scoreReason || 'Sales touchpoint recorded for this lead.',
        time: this.toIso(lead.lastContactDate || lead.updatedAt)
      });
    }
    if (lead.emailOpens > 0) {
      items.push({
        id: `${lead.id}-default-email`,
        leadId: lead.id,
        type: 'email',
        subject: 'Email engagement recorded',
        description: `${lead.emailOpens} email touchpoint${lead.emailOpens === 1 ? '' : 's'} captured for this lead.`,
        time: this.toIso(lead.updatedAt)
      });
    }
    if (lead.nextFollowupDate) {
      items.push({
        id: `${lead.id}-default-meeting`,
        leadId: lead.id,
        type: 'meeting',
        subject: 'Follow-up scheduled',
        description: `Upcoming follow-up linked to ${getName(lead)}.`,
        time: this.toIso(lead.nextFollowupDate)
      });
    }
    if (lead.leadStatus === 'Qualified') {
      items.push({
        id: `${lead.id}-default-qualified`,
        leadId: lead.id,
        type: 'qualification',
        subject: 'Lead qualified',
        description: 'Lead marked qualified after fit and timing review.',
        time: this.toIso(lead.updatedAt)
      });
    }
    if (lead.convertedContactId) {
      items.push({
        id: `${lead.id}-default-converted`,
        leadId: lead.id,
        type: 'conversion',
        subject: 'Converted to contact',
        description: `Converted contact id: ${lead.convertedContactId}.`,
        time: this.toIso(lead.convertedAt || lead.updatedAt)
      });
    }
    items.push({
      id: `${lead.id}-default-created`,
      leadId: lead.id,
      type: 'system',
      subject: 'Lead created',
      description: `${getName(lead)} entered CRM from ${lead.leadSource || 'unknown source'}.`,
      time: this.toIso(lead.createdAt)
    });
    return items.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
  }

  private createDefaultNotes(lead: Lead): LeadNote[] {
    return [{
      id: `${lead.id}-default-note`,
      leadId: lead.id,
      author: lead.assignedTo || 'Sales Team',
      badge: lead.leadStatus === 'Qualified' ? 'Qualification note' : 'Internal',
      body: this.getLeadSummaryNote(lead),
      createdAt: this.toIso(lead.updatedAt)
    }];
  }

  private toIso(date?: Date | string): string {
    return new Date(date || Date.now()).toISOString();
  }

  private prepareLeadEditDraft(lead: Lead): void {
    this.leadEditDraft = {
      firstName: lead.firstName,
      lastName: lead.lastName,
      email: lead.email,
      phone: lead.phone,
      companyName: lead.companyName,
      jobTitle: lead.jobTitle,
      leadSource: lead.leadSource,
      leadStatus: lead.leadStatus,
      territory: lead.territory,
      assignedTo: lead.assignedTo,
      leadScore: lead.leadScore,
      scoreReason: lead.scoreReason
    };
  }

  private showActivity(message: string): void {
    this.activityMessage = message;
    setTimeout(() => {
      this.activityMessage = '';
    }, 4500);
  }
}

function getName(lead: Lead): string {
  return `${lead.firstName} ${lead.lastName}`.trim();
}

