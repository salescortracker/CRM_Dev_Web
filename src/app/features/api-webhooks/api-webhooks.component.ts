import { Component } from '@angular/core';

interface ApiKey {
  id: string;
  name: string;
  key: string;
  scopes: string[];
  owner: string;
  status: 'Active' | 'Revoked';
  lastUsed: string;
}

interface Webhook {
  id: string;
  event: string;
  endpoint: string;
  status: 'Active' | 'Paused' | 'Failed';
  lastDelivery: string;
  failures: number;
  samplePayload: string;
}

@Component({
  selector: 'app-api-webhooks',
  standalone: false,
  templateUrl: './api-webhooks.component.html',
  styleUrls: ['./api-webhooks.component.css']
})
export class ApiWebhooksComponent {
  activityMessage = '';
  selectedWebhookId = 'hook-2';
  newEndpoint = 'https://client.example.com/webhooks/crm';

  apiKeys: ApiKey[] = [
    { id: 'key-1', name: 'Website Lead Forms', key: 'crm_live_****_8F42', scopes: ['leads:create', 'contacts:read'], owner: 'ABC Pvt Ltd', status: 'Active', lastUsed: '5 minutes ago' },
    { id: 'key-2', name: 'Billing Portal', key: 'crm_live_****_A912', scopes: ['invoices:read', 'subscriptions:update'], owner: 'TechStart Inc', status: 'Active', lastUsed: 'Today, 10:14 AM' },
    { id: 'key-3', name: 'Legacy Importer', key: 'crm_live_****_771B', scopes: ['contacts:write'], owner: 'Global Retail Group', status: 'Revoked', lastUsed: 'May 12, 2026' }
  ];

  webhooks: Webhook[] = [
    { id: 'hook-1', event: 'lead.created', endpoint: 'https://abc.example.com/leads', status: 'Active', lastDelivery: '2 minutes ago', failures: 0, samplePayload: '{"event":"lead.created","lead":{"name":"John Smith","source":"Website"}}' },
    { id: 'hook-2', event: 'deal.stage_changed', endpoint: 'https://client.example.com/deals/stage', status: 'Active', lastDelivery: 'Today, 11:20 AM', failures: 0, samplePayload: '{"event":"deal.stage_changed","deal":{"name":"Enterprise Software License","stage":"Proposal"}}' },
    { id: 'hook-3', event: 'invoice.paid', endpoint: 'https://billing.example.com/paid', status: 'Failed', lastDelivery: 'Yesterday, 4:48 PM', failures: 3, samplePayload: '{"event":"invoice.paid","invoice":{"id":"I-207","amount":25000}}' },
    { id: 'hook-4', event: 'message.replied', endpoint: 'https://engage.example.com/replies', status: 'Paused', lastDelivery: 'May 24, 2026', failures: 1, samplePayload: '{"event":"message.replied","channel":"WhatsApp","reply":"Need quarterly billing"}' }
  ];

  usageLogs = [
    { tenant: 'ABC Pvt Ltd', requests: 12450, errors: 12, latency: '128ms', limit: '80%' },
    { tenant: 'XYZ Tech', requests: 6320, errors: 4, latency: '96ms', limit: '41%' },
    { tenant: 'Global Retail Group', requests: 18800, errors: 31, latency: '172ms', limit: '92%' }
  ];

  get selectedWebhook(): Webhook {
    return this.webhooks.find((webhook) => webhook.id === this.selectedWebhookId) || this.webhooks[0];
  }

  regenerateKey(key: ApiKey): void {
    key.key = `crm_live_****_${Math.random().toString(16).slice(2, 6).toUpperCase()}`;
    key.status = 'Active';
    key.lastUsed = 'Just now';
    this.showActivity(`${key.name} API key regenerated.`);
  }

  revokeKey(key: ApiKey): void {
    key.status = 'Revoked';
    this.showActivity(`${key.name} API key revoked.`);
  }

  testWebhook(): void {
    this.selectedWebhook.lastDelivery = 'Just now';
    this.selectedWebhook.status = 'Active';
    this.selectedWebhook.failures = 0;
    this.showActivity(`${this.selectedWebhook.event} test delivered successfully.`);
  }

  addWebhook(): void {
    this.webhooks.unshift({
      id: `hook-${Date.now()}`,
      event: 'task.completed',
      endpoint: this.newEndpoint,
      status: 'Active',
      lastDelivery: 'Not sent yet',
      failures: 0,
      samplePayload: '{"event":"task.completed","task":{"title":"Follow up quote","status":"Completed"}}'
    });
    this.selectedWebhookId = this.webhooks[0].id;
    this.showActivity('Task completed webhook created.');
  }

  private showActivity(message: string): void {
    this.activityMessage = message;
    setTimeout(() => this.activityMessage = '', 4000);
  }
}
