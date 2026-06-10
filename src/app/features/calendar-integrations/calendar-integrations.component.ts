import { Component } from '@angular/core';
import { Router } from '@angular/router';

interface CalendarProvider {
  name: string;
  type: 'Calendar' | 'Meeting';
  status: 'Connected' | 'Not Connected';
  lastSync: string;
}

interface MeetingItem {
  title: string;
  contact: string;
  owner: string;
  relatedType: 'Lead' | 'Contact' | 'Company' | 'Deal' | 'Negotiation' | 'Task';
  relatedId: string;
  relatedName: string;
  purpose: string;
  date: string;
  time: string;
  provider: string;
  reminder: string;
  nextAction: string;
  status: 'Scheduled' | 'Needs Prep' | 'Completed';
}

@Component({
  selector: 'app-calendar-integrations',
  standalone: false,
  templateUrl: './calendar-integrations.component.html',
  styleUrls: ['./calendar-integrations.component.css']
})
export class CalendarIntegrationsComponent {
  activityMessage = '';
  meetingTitle = 'Discovery call';
  meetingDate = new Date().toISOString().slice(0, 10);
  meetingTime = '10:30';
  selectedProvider = 'Zoom';
  selectedRelatedType: MeetingItem['relatedType'] = 'Lead';
  selectedRelatedId = 'lead-001';
  selectedPurpose = 'Lead qualification';
  showMatchingMeetings = false;

  relatedTypes: MeetingItem['relatedType'][] = ['Lead', 'Contact', 'Company', 'Deal', 'Negotiation', 'Task'];
  purposes = ['Lead qualification', 'Follow-up', 'Product demo', 'Deal negotiation', 'Counter offer review', 'Proposal review', 'Renewal discussion', 'Onboarding', 'Approval review'];

  relatedRecords = [
    { id: 'lead-001', type: 'Lead', name: 'John Smith - ABC Corp', route: '/leads/lead-001', contact: 'John Smith', owner: 'Rohit Kumar' },
    { id: 'lead-002', type: 'Lead', name: 'Jane Doe - XYZ Trial', route: '/leads/lead-002', contact: 'Jane Doe', owner: 'Priya Nair' },
    { id: 'contact-001', type: 'Contact', name: 'John Smith - ABC Corp', route: '/contacts/contact-001', contact: 'John Smith', owner: 'Sales Development Team' },
    { id: 'company-001', type: 'Company', name: 'ABC Pvt Ltd', route: '/companies/company-001/details', contact: 'Admin team', owner: 'Rohit Kumar' },
    { id: 'deal-101', type: 'Deal', name: 'Acme Renewal Deal', route: '/deals/deal-101', contact: 'John Smith', owner: 'Rohit Kumar' },
    { id: 'deal-202', type: 'Deal', name: 'Education Portal Subscription', route: '/deals/deal-202', contact: 'Emma Davis', owner: 'Maria Lopez' },
    { id: 'neg-202', type: 'Negotiation', name: 'Education Counter Offer', route: '/deals/deal-202/negotiate', contact: 'Finance Director', owner: 'Maria Lopez' },
    { id: 'neg-101', type: 'Negotiation', name: 'Acme Discount Approval', route: '/deals/deal-101/negotiate', contact: 'Procurement Lead', owner: 'Rohit Kumar' },
    { id: 'task-001', type: 'Task', name: 'Proposal approval follow-up', route: '/tasks', contact: 'Rohit Kumar', owner: 'Rohit Kumar' }
  ];

  providers: CalendarProvider[] = [
    { name: 'Google Calendar', type: 'Calendar', status: 'Connected', lastSync: 'Today 9:20 AM' },
    { name: 'Outlook Calendar', type: 'Calendar', status: 'Not Connected', lastSync: '-' },
    { name: 'Zoom', type: 'Meeting', status: 'Connected', lastSync: 'Today 8:45 AM' },
    { name: 'Microsoft Teams', type: 'Meeting', status: 'Not Connected', lastSync: '-' }
  ];

  meetings: MeetingItem[] = [
    { title: 'Lead qualification call', contact: 'John Smith', owner: 'Rohit Kumar', relatedType: 'Lead', relatedId: 'lead-001', relatedName: 'John Smith - ABC Corp', purpose: 'Lead qualification', date: '2026-05-28', time: '10:00', provider: 'Google Meet', reminder: '30 minutes before', nextAction: 'Update lead score and qualification status', status: 'Scheduled' },
    { title: 'Product demo for trial lead', contact: 'Jane Doe', owner: 'Priya Nair', relatedType: 'Lead', relatedId: 'lead-002', relatedName: 'Jane Doe - XYZ Trial', purpose: 'Product demo', date: '2026-05-28', time: '14:30', provider: 'Zoom', reminder: '1 hour before', nextAction: 'Send demo recap and convert if qualified', status: 'Needs Prep' },
    { title: 'Contact discovery check-in', contact: 'John Smith', owner: 'Sales Development Team', relatedType: 'Contact', relatedId: 'contact-001', relatedName: 'John Smith - ABC Corp', purpose: 'Follow-up', date: '2026-05-29', time: '09:30', provider: 'Phone Call', reminder: '15 minutes before', nextAction: 'Log notes and create account task', status: 'Scheduled' },
    { title: 'ABC quarterly business review', contact: 'Admin team', owner: 'Rohit Kumar', relatedType: 'Company', relatedId: 'company-001', relatedName: 'ABC Pvt Ltd', purpose: 'Renewal discussion', date: '2026-05-29', time: '16:00', provider: 'Microsoft Teams', reminder: '1 hour before', nextAction: 'Update company health and renewal plan', status: 'Needs Prep' },
    { title: 'Acme proposal review', contact: 'John Smith', owner: 'Rohit Kumar', relatedType: 'Deal', relatedId: 'deal-101', relatedName: 'Acme Renewal Deal', purpose: 'Proposal review', date: '2026-05-30', time: '11:00', provider: 'Zoom', reminder: '30 minutes before', nextAction: 'Send revised quote or request approval', status: 'Scheduled' },
    { title: 'Education counter offer review', contact: 'Finance Director', owner: 'Maria Lopez', relatedType: 'Negotiation', relatedId: 'neg-202', relatedName: 'Education Counter Offer', purpose: 'Counter offer review', date: '2026-05-30', time: '15:00', provider: 'Google Meet', reminder: '30 minutes before', nextAction: 'Update negotiation terms and approval risk', status: 'Scheduled' },
    { title: 'Proposal approval follow-up', contact: 'Rohit Kumar', owner: 'Rohit Kumar', relatedType: 'Task', relatedId: 'task-001', relatedName: 'Proposal approval follow-up', purpose: 'Approval review', date: '2026-06-01', time: '12:00', provider: 'Phone Call', reminder: '15 minutes before', nextAction: 'Close approval task after decision', status: 'Scheduled' }
  ];

  constructor(private router: Router) {}

  get connectedCount(): number {
    return this.providers.filter((provider) => provider.status === 'Connected').length;
  }

  get matchingUpcomingMeetings(): MeetingItem[] {
    return this.meetings.filter((meeting) =>
      meeting.relatedId === this.selectedRelatedId &&
      meeting.status !== 'Completed' &&
      new Date(`${meeting.date}T${meeting.time}`) >= new Date()
    );
  }

  toggleProvider(provider: CalendarProvider): void {
    provider.status = provider.status === 'Connected' ? 'Not Connected' : 'Connected';
    provider.lastSync = provider.status === 'Connected' ? 'Just now' : '-';
  }

  scheduleMeeting(): void {
    const relatedRecord = this.getSelectedRelatedRecord();
    this.meetings.unshift({
      title: this.meetingTitle,
      contact: relatedRecord?.contact || 'Selected CRM contact',
      owner: relatedRecord?.owner || 'Current user',
      relatedType: this.selectedRelatedType,
      relatedId: this.selectedRelatedId,
      relatedName: relatedRecord?.name || 'Selected CRM record',
      purpose: this.selectedPurpose,
      date: this.meetingDate,
      time: this.meetingTime,
      provider: this.selectedProvider,
      reminder: '30 minutes before',
      nextAction: this.getNextAction(this.selectedPurpose),
      status: 'Scheduled'
    });
    this.activityMessage = 'Meeting scheduled and reminder created.';
    setTimeout(() => this.activityMessage = '', 3500);
  }

  get filteredRelatedRecords(): typeof this.relatedRecords {
    return this.relatedRecords.filter((record) => record.type === this.selectedRelatedType);
  }

  onRelatedTypeChange(): void {
    const firstRecord = this.filteredRelatedRecords[0];
    this.selectedRelatedId = firstRecord?.id || '';
    this.showMatchingMeetings = false;
  }

  onRelatedRecordChange(): void {
    this.showMatchingMeetings = false;
  }

  openRelated(meeting: MeetingItem): void {
    const record = this.relatedRecords.find((item) => item.id === meeting.relatedId);
    if (record) {
      this.router.navigate([record.route]);
    }
  }

  createFollowUpTask(meeting: MeetingItem): void {
    this.activityMessage = `Follow-up task created for ${meeting.relatedName}.`;
    setTimeout(() => this.activityMessage = '', 3500);
    this.router.navigate(['/tasks']);
  }

  logActivity(meeting: MeetingItem): void {
    this.activityMessage = `Meeting activity logged for ${meeting.relatedName}.`;
    setTimeout(() => this.activityMessage = '', 3500);
  }

  markComplete(meeting: MeetingItem): void {
    meeting.status = 'Completed';
    this.activityMessage = `${meeting.title} marked completed.`;
    setTimeout(() => this.activityMessage = '', 3500);
  }

  useExistingMeeting(meeting: MeetingItem): void {
    this.meetingTitle = meeting.title;
    this.meetingDate = meeting.date;
    this.meetingTime = meeting.time;
    this.selectedProvider = meeting.provider;
    this.selectedPurpose = meeting.purpose;
    this.activityMessage = `Loaded existing meeting for ${meeting.relatedName}.`;
    setTimeout(() => this.activityMessage = '', 3500);
  }

  private getSelectedRelatedRecord(): typeof this.relatedRecords[number] | undefined {
    return this.relatedRecords.find((record) => record.id === this.selectedRelatedId);
  }

  private getNextAction(purpose: string): string {
    const actionMap: { [key: string]: string } = {
      'Lead qualification': 'Update lead score and qualification status',
      'Follow-up': 'Create next follow-up task',
      'Product demo': 'Send demo recap and create deal if qualified',
      'Deal negotiation': 'Open negotiation notes and update counter offer',
      'Proposal review': 'Send revised quote or request approval',
      'Renewal discussion': 'Update renewal deal and payment timeline',
      'Onboarding': 'Create onboarding task checklist'
    };
    return actionMap[purpose] || 'Create follow-up task';
  }
}
