import { Component } from '@angular/core';

type IntegrationStatus = 'Connected' | 'Needs OAuth' | 'Disconnected' | 'Sync Issue';

interface IntegrationApp {
  id: string;
  name: string;
  category: string;
  status: IntegrationStatus;
  usedIn: string;
  lastSync: string;
  icon: string;
  scopes: string[];
}

@Component({
  selector: 'app-integration-marketplace',
  standalone: false,
  templateUrl: './integration-marketplace.component.html',
  styleUrls: ['./integration-marketplace.component.css']
})
export class IntegrationMarketplaceComponent {
  activityMessage = '';
  selectedId = 'zoom';

  integrations: IntegrationApp[] = [
    { id: 'gmail', name: 'Gmail Workspace', category: 'Email', status: 'Connected', usedIn: 'Email templates, campaign replies', lastSync: '8 minutes ago', icon: 'fa-envelope-open-text', scopes: ['Send email', 'Read replies', 'Track opens'] },
    { id: 'outlook', name: 'Outlook 365', category: 'Email', status: 'Needs OAuth', usedIn: 'Email templates, calendar invites', lastSync: 'Token expired', icon: 'fa-envelope', scopes: ['Send email', 'Calendar read/write'] },
    { id: 'zoom', name: 'Zoom Meetings', category: 'Calendar', status: 'Connected', usedIn: 'Lead follow-ups, deal negotiation meetings', lastSync: 'Just now', icon: 'fa-video', scopes: ['Create meeting', 'Read registrants'] },
    { id: 'teams', name: 'Microsoft Teams', category: 'Calendar', status: 'Disconnected', usedIn: 'Meeting scheduler provider option', lastSync: 'Not connected', icon: 'fa-users', scopes: ['Create meeting', 'Send invite'] },
    { id: 'whatsapp', name: 'WhatsApp Business', category: 'Messaging', status: 'Connected', usedIn: 'Quote reminders, lead nurture', lastSync: 'Today, 10:20 AM', icon: 'fa-comments', scopes: ['Send template', 'Read replies'] },
    { id: 'twilio', name: 'Twilio Voice/SMS', category: 'Telephony', status: 'Sync Issue', usedIn: 'Click-to-call, SMS reminders', lastSync: 'Failed 2 hours ago', icon: 'fa-phone-volume', scopes: ['Call logs', 'SMS send', 'Recording'] },
    { id: 'stripe', name: 'Payment Gateway', category: 'Billing', status: 'Connected', usedIn: 'Invoices, subscription billing', lastSync: 'Today, 9:44 AM', icon: 'fa-credit-card', scopes: ['Payment status', 'Invoice paid event'] }
  ];

  syncLogs = [
    { app: 'Zoom Meetings', event: 'Created negotiation meeting for Manufacturing Support Retainer', result: 'Success', time: 'Just now' },
    { app: 'WhatsApp Business', event: 'Synced reply for quote reminder', result: 'Success', time: '18 minutes ago' },
    { app: 'Twilio Voice/SMS', event: 'Recording webhook delivery failed', result: 'Retrying', time: '2 hours ago' },
    { app: 'Payment Gateway', event: 'Invoice I-207 payment status synced', result: 'Success', time: 'Today, 9:44 AM' }
  ];

  get selectedIntegration(): IntegrationApp {
    return this.integrations.find((integration) => integration.id === this.selectedId) || this.integrations[0];
  }

  connect(app: IntegrationApp): void {
    app.status = 'Connected';
    app.lastSync = 'Just now';
    this.selectedId = app.id;
    this.showActivity(`${app.name} connected and available in ${app.usedIn}.`);
  }

  disconnect(app: IntegrationApp): void {
    app.status = 'Disconnected';
    app.lastSync = 'Disconnected just now';
    this.showActivity(`${app.name} disconnected.`);
  }

  testSync(app: IntegrationApp): void {
    app.status = 'Connected';
    app.lastSync = 'Just now';
    this.syncLogs.unshift({ app: app.name, event: `Manual sync test for ${app.usedIn}`, result: 'Success', time: 'Just now' });
    this.showActivity(`${app.name} sync test completed.`);
  }

  private showActivity(message: string): void {
    this.activityMessage = message;
    setTimeout(() => this.activityMessage = '', 4000);
  }
}
