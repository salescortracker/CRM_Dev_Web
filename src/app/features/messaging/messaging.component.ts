import { Component } from '@angular/core';
import { Router } from '@angular/router';

type MessageChannel = 'WhatsApp' | 'SMS';

interface MessageTemplate {
  id: string;
  name: string;
  channel: MessageChannel;
  useCase: string;
  relatedType: 'lead' | 'deal' | 'invoice' | 'otp';
  relatedId: string;
  relatedName: string;
  body: string;
  delivered: number;
  read: number;
  replies: number;
}

interface Conversation {
  id: string;
  person: string;
  company: string;
  channel: MessageChannel;
  relatedType: 'lead' | 'deal' | 'contact';
  relatedId: string;
  relatedName: string;
  lastMessage: string;
  status: 'Delivered' | 'Read' | 'Replied' | 'Failed';
  nextAction: string;
}

@Component({
  selector: 'app-messaging',
  standalone: false,
  templateUrl: './messaging.component.html',
  styleUrls: ['./messaging.component.css']
})
export class MessagingComponent {
  activityMessage = '';
  selectedTemplateId = 'quote-reminder';
  selectedConversationId = 'msg-2';
  draftMessage = '';

  channels = [
    { name: 'WhatsApp Business', status: 'Connected', sender: '+1 555-0200', health: 'Template approval active', icon: 'fa-comments' },
    { name: 'SMS Gateway', status: 'Connected', sender: 'CRMDEMO', health: 'DLT/10DLC verified', icon: 'fa-message' },
    { name: 'OTP Service', status: 'Ready', sender: 'CRM-OTP', health: 'Login OTP enabled', icon: 'fa-key' }
  ];

  templates: MessageTemplate[] = [
    { id: 'lead-follow-up', name: 'Lead Follow-up', channel: 'WhatsApp', useCase: 'New lead nurture', relatedType: 'lead', relatedId: '1', relatedName: 'John Smith lead', body: 'Hi John, thanks for your CRM interest. Can we schedule a 15-minute discovery call?', delivered: 96, read: 82, replies: 24 },
    { id: 'meeting-reminder', name: 'Meeting Reminder', channel: 'SMS', useCase: 'Upcoming meeting', relatedType: 'deal', relatedId: '3', relatedName: 'Retail Analytics Rollout', body: 'Reminder: your CRM discovery meeting is scheduled tomorrow at 11:00 AM.', delivered: 99, read: 0, replies: 7 },
    { id: 'quote-reminder', name: 'Quote Reminder', channel: 'WhatsApp', useCase: 'Proposal follow-up', relatedType: 'deal', relatedId: '6', relatedName: 'Manufacturing Support Retainer', body: 'Hi team, sharing a quick reminder to review the revised quote and SLA terms.', delivered: 94, read: 73, replies: 18 },
    { id: 'payment-reminder', name: 'Payment Reminder', channel: 'SMS', useCase: 'Invoice collection', relatedType: 'invoice', relatedId: '7', relatedName: 'TechStart Expansion Add-on', body: 'Your invoice I-207 is pending. Please use the payment link shared by email.', delivered: 98, read: 0, replies: 5 },
    { id: 'otp-login', name: 'Login OTP', channel: 'SMS', useCase: 'Secure login', relatedType: 'otp', relatedId: 'auth', relatedName: 'CRM Login', body: 'Your CRM login OTP is {{otp}}. It expires in 5 minutes.', delivered: 100, read: 0, replies: 0 }
  ];

  conversations: Conversation[] = [
    { id: 'msg-1', person: 'John Smith', company: 'ABC Corp', channel: 'WhatsApp', relatedType: 'lead', relatedId: '1', relatedName: 'John Smith lead', lastMessage: 'Yes, please share demo slots.', status: 'Replied', nextAction: 'Schedule lead discovery' },
    { id: 'msg-2', person: 'Operations VP', company: 'Acme Corporation', channel: 'WhatsApp', relatedType: 'deal', relatedId: '6', relatedName: 'Manufacturing Support Retainer', lastMessage: 'Need confirmation on quarterly billing.', status: 'Read', nextAction: 'Open negotiation workspace' },
    { id: 'msg-3', person: 'Finance Director', company: 'BrightPath Education', channel: 'SMS', relatedType: 'deal', relatedId: '5', relatedName: 'Education Portal Subscription', lastMessage: 'Please extend quote validity.', status: 'Replied', nextAction: 'Create proposal task' }
  ];

  constructor(private router: Router) {}

  get selectedTemplate(): MessageTemplate {
    return this.templates.find((template) => template.id === this.selectedTemplateId) || this.templates[0];
  }

  get selectedConversation(): Conversation {
    return this.conversations.find((conversation) => conversation.id === this.selectedConversationId) || this.conversations[0];
  }

  loadTemplate(template: MessageTemplate): void {
    this.selectedTemplateId = template.id;
    this.draftMessage = template.body;
    this.showActivity(`${template.name} loaded for ${template.relatedName}.`);
  }

  sendMessage(): void {
    const conversation = this.selectedConversation;
    conversation.status = 'Delivered';
    conversation.lastMessage = this.draftMessage || this.selectedTemplate.body;
    this.showActivity(`${this.selectedTemplate.channel} sent to ${conversation.person}.`);
  }

  sendBulk(): void {
    this.showActivity(`${this.selectedTemplate.name} bulk send queued for ${this.selectedTemplate.useCase}.`);
  }

  openRecord(): void {
    const item = this.selectedConversation;
    if (item.relatedType === 'lead') {
      this.router.navigate(['/leads', item.relatedId]);
      return;
    }
    if (item.relatedType === 'contact') {
      this.router.navigate(['/contacts', item.relatedId]);
      return;
    }
    this.router.navigate(['/deals', item.relatedId]);
  }

  openNextStep(): void {
    if (this.selectedConversation.nextAction.toLowerCase().includes('negotiation')) {
      this.router.navigate(['/deals', this.selectedConversation.relatedId, 'negotiate']);
      return;
    }
    if (this.selectedConversation.nextAction.toLowerCase().includes('task')) {
      this.router.navigate(['/tasks']);
      return;
    }
    this.openRecord();
  }

  private showActivity(message: string): void {
    this.activityMessage = message;
    setTimeout(() => this.activityMessage = '', 4000);
  }
}
