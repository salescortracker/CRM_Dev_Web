import { Component } from '@angular/core';
import { Router } from '@angular/router';

type ActivityStatus = 'Pending' | 'Completed' | 'Needs Review';
type ActivityType = 'Lead' | 'Contact' | 'Company' | 'Deal' | 'Quote' | 'Task' | 'Negotiation';
type RelatedType = 'leads' | 'contacts' | 'companies' | 'deals' | 'tasks';

interface ActivityItem {
  id: number;
  title: string;
  type: ActivityType;
  relatedType: RelatedType;
  relatedId: string;
  relatedName: string;
  date: string;
  status: ActivityStatus;
  owner: string;
  note: string;
  nextAction: string;
}

@Component({
  selector: 'app-activity',
  standalone: false,
  templateUrl: './activity.component.html',
  styleUrls: ['./activity.component.css']
})
export class ActivityComponent {
  filterStatus = '';
  filterType = '';
  activityMessage = '';
  selectedActivity: ActivityItem | null = null;

  activityItems: ActivityItem[] = [
    { id: 1, title: 'Lead qualified and converted', type: 'Lead', relatedType: 'leads', relatedId: '1', relatedName: 'Acme website inquiry', date: 'Today, 9:15 AM', status: 'Completed', owner: 'Rohit Kumar', note: 'Lead score crossed threshold and contact was created.', nextAction: 'Open lead history' },
    { id: 2, title: 'Deal created from company profile', type: 'Deal', relatedType: 'deals', relatedId: '1', relatedName: 'Enterprise Software License', date: 'Today, 10:05 AM', status: 'Completed', owner: 'Rohit Kumar', note: 'Opportunity connected to Acme Corporation account.', nextAction: 'Open deal profile' },
    { id: 3, title: 'Products added to quote', type: 'Quote', relatedType: 'deals', relatedId: '5', relatedName: 'Education Portal Subscription', date: 'Today, 11:20 AM', status: 'Pending', owner: 'Emma Davis', note: 'Quote is pending final commercial review.', nextAction: 'Review products and quote' },
    { id: 4, title: 'Counter offer received', type: 'Negotiation', relatedType: 'deals', relatedId: '6', relatedName: 'Manufacturing Support Retainer', date: 'Yesterday, 4:40 PM', status: 'Needs Review', owner: 'Maria Lopez', note: 'Customer requested quarterly billing and revised SLA language.', nextAction: 'Open negotiation workspace' },
    { id: 5, title: 'Follow-up task completed', type: 'Task', relatedType: 'tasks', relatedId: '2', relatedName: 'Reply to manufacturing counter offer', date: 'Yesterday, 2:10 PM', status: 'Completed', owner: 'Maria Lopez', note: 'Task marked complete after counter was drafted.', nextAction: 'View task queue' },
    { id: 6, title: 'Company account reviewed', type: 'Company', relatedType: 'companies', relatedId: '2', relatedName: 'TechStart Inc', date: 'May 17, 2026', status: 'Completed', owner: 'Jane Doe', note: 'Account health and expansion deal were reviewed.', nextAction: 'Open company profile' }
  ];

  constructor(private router: Router) {
    this.selectedActivity = this.activityItems[0];
  }

  get filteredActivities(): ActivityItem[] {
    return this.activityItems.filter((item) => {
      const statusMatch = this.filterStatus ? item.status === this.filterStatus : true;
      const typeMatch = this.filterType ? item.type === this.filterType : true;
      return statusMatch && typeMatch;
    });
  }

  get pendingCount(): number {
    return this.activityItems.filter((item) => item.status === 'Pending' || item.status === 'Needs Review').length;
  }

  get completedCount(): number {
    return this.activityItems.filter((item) => item.status === 'Completed').length;
  }

  get dealActivityCount(): number {
    return this.activityItems.filter((item) => ['Deal', 'Quote', 'Negotiation'].includes(item.type)).length;
  }

  selectActivity(item: ActivityItem): void {
    this.selectedActivity = item;
  }

  markComplete(item: ActivityItem): void {
    item.status = 'Completed';
    this.selectedActivity = item;
    this.showActivity(`${item.title} completed.`);
  }

  createFollowUp(item: ActivityItem): void {
    this.showActivity(`Follow-up task created for ${item.relatedName}.`);
    this.router.navigate(['/tasks']);
  }

  logCall(item: ActivityItem): void {
    this.activityItems.unshift({
      id: Date.now(),
      title: `Call logged for ${item.relatedName}`,
      type: item.type,
      relatedType: item.relatedType,
      relatedId: item.relatedId,
      relatedName: item.relatedName,
      date: 'Just now',
      status: 'Completed',
      owner: item.owner,
      note: 'Call outcome captured from Activity timeline.',
      nextAction: 'Review related record'
    });
    this.selectedActivity = this.activityItems[0];
    this.showActivity('Call activity logged.');
  }

  openRelated(item: ActivityItem): void {
    if (item.relatedType === 'tasks') {
      this.router.navigate(['/tasks']);
      return;
    }
    this.router.navigate(['/', item.relatedType, item.relatedId]);
  }

  openNext(item: ActivityItem): void {
    if (item.type === 'Quote') {
      this.router.navigate(['/deals', item.relatedId, 'products']);
      return;
    }
    if (item.type === 'Negotiation') {
      this.router.navigate(['/deals', item.relatedId, 'negotiate']);
      return;
    }
    this.openRelated(item);
  }

  getStatusClass(status: ActivityStatus): string {
    return `status-${status.toLowerCase().replace(/\s+/g, '-')}`;
  }

  getTypeIcon(type: ActivityType): string {
    const icons: Record<ActivityType, string> = {
      Lead: 'fa-bullhorn',
      Contact: 'fa-address-book',
      Company: 'fa-building',
      Deal: 'fa-handshake',
      Quote: 'fa-file-signature',
      Task: 'fa-list-check',
      Negotiation: 'fa-comments'
    };
    return icons[type];
  }

  private showActivity(message: string): void {
    this.activityMessage = message;
    setTimeout(() => this.activityMessage = '', 4000);
  }
}
