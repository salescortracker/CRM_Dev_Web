import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

type Channel = 'Email' | 'Call' | 'SMS' | 'WhatsApp' | 'Meeting';
type Outcome = 'Sent' | 'Replied' | 'Connected' | 'Scheduled' | 'Needs Follow-up';
type MeetingProvider = 'Phone Call' | 'Google Meet' | 'Zoom' | 'Microsoft Teams' | 'In-person Meeting';

interface EngagementItem {
  id: string;
  title: string;
  person: string;
  company: string;
  channel: Channel;
  outcome: Outcome;
  relatedType: 'lead' | 'contact' | 'deal' | 'task';
  relatedId: string;
  relatedName: string;
  time: string;
  notes: string;
  nextAction: string;
}

interface EngagementMeeting {
  id: string;
  title: string;
  date: string;
  time: string;
  provider: MeetingProvider;
  purpose: string;
  relatedType: EngagementItem['relatedType'];
  relatedId: string;
}

@Component({
  selector: 'app-engagement-center',
  standalone: false,
  templateUrl: './engagement-center.component.html',
  styleUrls: ['./engagement-center.component.css']
})
export class EngagementCenterComponent implements OnInit {
  engagements: EngagementItem[] = [];
  selectedEngagement: EngagementItem | null = null;
  activityMessage = '';
  activeComposer: Channel | null = null;

  composeSubject = '';
  composeMessage = '';
  meetingDate = this.formatToday();
  meetingTime = '10:00';
  meetingProvider: MeetingProvider = 'Google Meet';
  meetingPurpose = 'Follow-up';
  meetingReminder = '30 minutes before';
  showUpcomingMeetings = false;
  callOutcome: Outcome = 'Connected';
  meetingProviders: Array<{ name: MeetingProvider; icon: string; connected: boolean }> = [
    { name: 'Phone Call', icon: 'fa-phone', connected: true },
    { name: 'Google Meet', icon: 'fa-video', connected: true },
    { name: 'Zoom', icon: 'fa-video', connected: true },
    { name: 'Microsoft Teams', icon: 'fa-users', connected: false },
    { name: 'In-person Meeting', icon: 'fa-location-dot', connected: true },
  ];
  meetingPurposes = ['Follow-up', 'Product demo', 'Deal negotiation', 'Proposal review', 'Renewal discussion'];
  scheduledMeetings: EngagementMeeting[] = [];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadEngagements();
  }

  loadEngagements(): void {
    this.engagements = [
      { id: 'eng-1', title: 'Renewal quote email sent', person: 'John Smith', company: 'Acme Corporation', channel: 'Email', outcome: 'Sent', relatedType: 'deal', relatedId: '1', relatedName: 'Enterprise Software License', time: 'Today, 9:45 AM', notes: 'Final approval packet shared with procurement.', nextAction: 'Track reply and create follow-up task' },
      { id: 'eng-2', title: 'Counter offer call completed', person: 'Operations VP', company: 'Acme Corporation', channel: 'Call', outcome: 'Connected', relatedType: 'deal', relatedId: '6', relatedName: 'Manufacturing Support Retainer', time: 'Today, 11:10 AM', notes: 'Discussed quarterly billing and SLA counter terms.', nextAction: 'Open negotiation workspace' },
      { id: 'eng-3', title: 'Education quote SMS reminder', person: 'Finance Director', company: 'BrightPath Education', channel: 'SMS', outcome: 'Needs Follow-up', relatedType: 'deal', relatedId: '5', relatedName: 'Education Portal Subscription', time: 'Yesterday, 3:20 PM', notes: 'Quote validity extension requested.', nextAction: 'Create task for proposal owner' },
      { id: 'eng-4', title: 'Discovery meeting scheduled', person: 'Retail Program Lead', company: 'Global Retail Group', channel: 'Meeting', outcome: 'Scheduled', relatedType: 'deal', relatedId: '3', relatedName: 'Retail Analytics Rollout', time: 'May 20, 2026', notes: 'Analytics discovery call booked.', nextAction: 'Open lead/deal profile before meeting' },
      { id: 'eng-5', title: 'WhatsApp reply received', person: 'Jane Smith', company: 'TechStart Inc', channel: 'WhatsApp', outcome: 'Replied', relatedType: 'contact', relatedId: '2', relatedName: 'Jane Smith', time: 'May 19, 2026', notes: 'Asked for implementation timeline.', nextAction: 'Open contact and create follow-up' }
    ];
    this.scheduledMeetings = [
      {
        id: 'eng-meet-1',
        title: 'Retail analytics discovery',
        date: '2026-05-28',
        time: '11:00',
        provider: 'Zoom',
        purpose: 'Product demo',
        relatedType: 'deal',
        relatedId: '3'
      }
    ];
    this.selectedEngagement = this.engagements[0];
  }

  get emailsSent(): number {
    return this.engagements.filter((item) => item.channel === 'Email').length;
  }

  get callsLogged(): number {
    return this.engagements.filter((item) => item.channel === 'Call').length;
  }

  get meetings(): number {
    return this.engagements.filter((item) => item.channel === 'Meeting').length;
  }

  get responses(): number {
    return this.engagements.filter((item) => ['Replied', 'Connected'].includes(item.outcome)).length;
  }

  selectEngagement(item: EngagementItem): void {
    this.selectedEngagement = item;
    this.activeComposer = null;
  }

  startComposer(channel: Channel): void {
    this.activeComposer = channel;
    this.composeSubject = channel === 'Email' ? `Follow-up: ${this.selectedEngagement?.relatedName || 'CRM update'}` : '';
    this.composeMessage = this.selectedEngagement?.notes || '';
    this.showUpcomingMeetings = false;
    if (channel === 'Meeting') {
      this.meetingPurpose = this.selectedEngagement?.relatedType === 'deal' ? 'Deal negotiation' : 'Follow-up';
      this.meetingProvider = 'Google Meet';
    }
  }

  saveComposer(): void {
    if (!this.selectedEngagement || !this.activeComposer) {
      return;
    }
    const channel = this.activeComposer;
    this.engagements.unshift({
      id: `eng-${Date.now()}`,
      title: `${channel} logged for ${this.selectedEngagement.person}`,
      person: this.selectedEngagement.person,
      company: this.selectedEngagement.company,
      channel,
      outcome: channel === 'Meeting' ? 'Scheduled' : channel === 'Call' ? this.callOutcome : 'Sent',
      relatedType: this.selectedEngagement.relatedType,
      relatedId: this.selectedEngagement.relatedId,
      relatedName: this.selectedEngagement.relatedName,
      time: 'Just now',
      notes: channel === 'Meeting'
        ? `${this.meetingPurpose} scheduled on ${this.meetingDate} at ${this.meetingTime} via ${this.meetingProvider}.`
        : this.composeMessage || 'Engagement captured.',
      nextAction: 'Create follow-up task'
    });
    if (channel === 'Meeting') {
      this.scheduledMeetings.unshift({
        id: `eng-meet-${Date.now()}`,
        title: `${this.meetingPurpose} with ${this.selectedEngagement.person}`,
        date: this.meetingDate,
        time: this.meetingTime,
        provider: this.meetingProvider,
        purpose: this.meetingPurpose,
        relatedType: this.selectedEngagement.relatedType,
        relatedId: this.selectedEngagement.relatedId
      });
    }
    this.selectedEngagement = this.engagements[0];
    this.activeComposer = null;
    this.showActivity(`${channel} saved.`);
  }

  selectMeetingProvider(provider: MeetingProvider): void {
    this.meetingProvider = provider;
  }

  getSelectedMeetings(): EngagementMeeting[] {
    if (!this.selectedEngagement) {
      return [];
    }

    return this.scheduledMeetings.filter((meeting) =>
      meeting.relatedType === this.selectedEngagement?.relatedType && meeting.relatedId === this.selectedEngagement?.relatedId
    );
  }

  createTask(): void {
    this.router.navigate(['/tasks']);
  }

  openEmailManagement(): void {
    this.router.navigate(['/email-management']);
  }

  openTelephony(): void {
    this.router.navigate(['/telephony']);
  }

  openMessaging(): void {
    this.router.navigate(['/messaging']);
  }

  openRelated(): void {
    if (!this.selectedEngagement) {
      return;
    }
    const item = this.selectedEngagement;
    if (item.relatedType === 'deal') {
      this.router.navigate(['/deals', item.relatedId]);
      return;
    }
    if (item.relatedType === 'contact') {
      this.router.navigate(['/contacts', item.relatedId]);
      return;
    }
    if (item.relatedType === 'lead') {
      this.router.navigate(['/leads', item.relatedId]);
      return;
    }
    this.router.navigate(['/tasks']);
  }

  openNextStep(): void {
    if (!this.selectedEngagement) {
      return;
    }
    if (this.selectedEngagement.relatedType === 'deal' && this.selectedEngagement.channel === 'Call') {
      this.router.navigate(['/deals', this.selectedEngagement.relatedId, 'negotiate']);
      return;
    }
    this.openRelated();
  }

  getChannelIcon(channel: Channel): string {
    const icons: Record<Channel, string> = {
      Email: 'fa-envelope',
      Call: 'fa-phone',
      SMS: 'fa-message',
      WhatsApp: 'fa-comments',
      Meeting: 'fa-calendar-check'
    };
    return icons[channel];
  }

  private showActivity(message: string): void {
    this.activityMessage = message;
    setTimeout(() => this.activityMessage = '', 4000);
  }

  private formatToday(): string {
    return new Date().toISOString().slice(0, 10);
  }
}
