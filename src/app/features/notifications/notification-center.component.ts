import { Component } from '@angular/core';
import { Router } from '@angular/router';

type NotificationCategory = 'Lead' | 'Deal' | 'Meeting' | 'Invoice' | 'API' | 'Support';

interface CrmNotification {
  id: string;
  title: string;
  detail: string;
  category: NotificationCategory;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  read: boolean;
  muted: boolean;
  relatedRoute: string[];
  time: string;
}

@Component({
  selector: 'app-notification-center',
  standalone: false,
  templateUrl: './notification-center.component.html',
  styleUrls: ['./notification-center.component.css']
})
export class NotificationCenterComponent {
  activityMessage = '';
  activeCategory: 'All' | NotificationCategory = 'All';

  notifications: CrmNotification[] = [
    { id: 'n-1', title: 'Lead assigned', detail: 'John Smith from ABC Corp assigned to Rohit Kumar.', category: 'Lead', priority: 'High', read: false, muted: false, relatedRoute: ['/leads', '1'], time: 'Just now' },
    { id: 'n-2', title: 'Deal stage changed', detail: 'Enterprise Software License moved to Proposal.', category: 'Deal', priority: 'Medium', read: false, muted: false, relatedRoute: ['/deals', '1'], time: '12 minutes ago' },
    { id: 'n-3', title: 'Meeting reminder', detail: 'Counter offer review starts in 30 minutes.', category: 'Meeting', priority: 'High', read: false, muted: false, relatedRoute: ['/calendar-integrations'], time: 'Today, 1:30 PM' },
    { id: 'n-4', title: 'Invoice overdue', detail: 'TechStart Expansion invoice follow-up is due.', category: 'Invoice', priority: 'Critical', read: false, muted: false, relatedRoute: ['/deals', '7', 'products'], time: 'Today, 10:00 AM' },
    { id: 'n-5', title: 'Webhook failed', detail: 'invoice.paid webhook failed three times.', category: 'API', priority: 'Critical', read: true, muted: false, relatedRoute: ['/api-webhooks'], time: 'Yesterday, 4:48 PM' },
    { id: 'n-6', title: 'Support SLA at risk', detail: 'Payment link ticket is at risk for TechStart.', category: 'Support', priority: 'Critical', read: false, muted: false, relatedRoute: ['/support-tickets'], time: 'Today, 11:55 AM' }
  ];

  settings = [
    { channel: 'In-app', enabled: true, detail: 'Bell alerts and notification center inbox' },
    { channel: 'Email', enabled: true, detail: 'Daily digest and urgent alerts' },
    { channel: 'SMS', enabled: false, detail: 'Critical invoice/support alerts only' },
    { channel: 'WhatsApp', enabled: true, detail: 'Meeting reminders and lead assignment alerts' }
  ];

  constructor(private router: Router) {}

  get categories(): Array<'All' | NotificationCategory> {
    return ['All', 'Lead', 'Deal', 'Meeting', 'Invoice', 'API', 'Support'];
  }

  get filteredNotifications(): CrmNotification[] {
    return this.notifications.filter((item) => this.activeCategory === 'All' || item.category === this.activeCategory);
  }

  get unreadCount(): number {
    return this.notifications.filter((item) => !item.read).length;
  }

  markRead(notification: CrmNotification): void {
    notification.read = true;
    this.showActivity(`${notification.title} marked as read.`);
  }

  toggleMute(notification: CrmNotification): void {
    notification.muted = !notification.muted;
    this.showActivity(`${notification.category} notification ${notification.muted ? 'muted' : 'unmuted'}.`);
  }

  toggleSetting(setting: { channel: string; enabled: boolean }): void {
    setting.enabled = !setting.enabled;
    this.showActivity(`${setting.channel} notifications ${setting.enabled ? 'enabled' : 'disabled'}.`);
  }

  openRelated(notification: CrmNotification): void {
    notification.read = true;
    this.router.navigate(notification.relatedRoute);
  }

  markAllRead(): void {
    this.notifications.forEach((item) => item.read = true);
    this.showActivity('All notifications marked as read.');
  }

  private showActivity(message: string): void {
    this.activityMessage = message;
    setTimeout(() => this.activityMessage = '', 4000);
  }
}
