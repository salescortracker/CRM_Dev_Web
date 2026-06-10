import { Component } from '@angular/core';
import { Router } from '@angular/router';

type TemplateType = 'Lead' | 'Deal' | 'Invoice' | 'Renewal';

interface EmailTemplate {
  id: string;
  name: string;
  type: TemplateType;
  subject: string;
  recordName: string;
  owner: string;
  body: string;
  opens: number;
  clicks: number;
  replies: number;
}

interface BulkEmailJob {
  id: string;
  audience: string;
  template: string;
  status: 'Draft' | 'Scheduled' | 'Sending' | 'Completed';
  recipients: number;
  sent: number;
  opened: number;
  clicked: number;
}

@Component({
  selector: 'app-email-management',
  standalone: false,
  templateUrl: './email-management.component.html',
  styleUrls: ['./email-management.component.css']
})
export class EmailManagementComponent {
  activityMessage = '';
  selectedTemplateId = 'proposal-follow-up';
  selectedJobId = 'bulk-1';
  composeSubject = '';
  composeBody = '';

  smtpConnections = [
    { name: 'Gmail Workspace', status: 'Connected', sender: 'sales@acmecrm.com', health: 'DKIM/SPF verified', icon: 'fa-google' },
    { name: 'Outlook 365', status: 'Ready', sender: 'renewals@acmecrm.com', health: 'Domain warm-up active', icon: 'fa-envelope' },
    { name: 'Custom SMTP', status: 'Needs password', sender: 'billing@acmecrm.com', health: 'Auth failed 2 hours ago', icon: 'fa-server' }
  ];

  templates: EmailTemplate[] = [
    {
      id: 'lead-welcome',
      name: 'Lead Welcome',
      type: 'Lead',
      subject: 'Thanks for your interest, {{lead.firstName}}',
      recordName: 'John Smith | ABC Corp',
      owner: 'Rohit Kumar',
      body: 'Hi John, thanks for requesting a CRM demo. I will share the discovery agenda and available time slots.',
      opens: 78,
      clicks: 31,
      replies: 16
    },
    {
      id: 'proposal-follow-up',
      name: 'Proposal Follow-up',
      type: 'Deal',
      subject: 'Next step for Enterprise Software License',
      recordName: 'Enterprise Software License',
      owner: 'Rohit Kumar',
      body: 'Hi procurement team, sharing the proposal summary, quote approval link, and implementation timeline for review.',
      opens: 91,
      clicks: 48,
      replies: 22
    },
    {
      id: 'invoice-reminder',
      name: 'Invoice Reminder',
      type: 'Invoice',
      subject: 'Invoice reminder for TechStart Expansion',
      recordName: 'TechStart Expansion Add-on',
      owner: 'Jane Doe',
      body: 'Hello, this is a friendly reminder that invoice I-207 is pending payment after the closed-won expansion.',
      opens: 64,
      clicks: 18,
      replies: 9
    },
    {
      id: 'renewal-nurture',
      name: 'Renewal Nurture',
      type: 'Renewal',
      subject: 'Renewal options for Manufacturing Support Retainer',
      recordName: 'Manufacturing Support Retainer',
      owner: 'Maria Lopez',
      body: 'Hi team, here are renewal pricing options and SLA additions discussed during negotiation.',
      opens: 83,
      clicks: 39,
      replies: 14
    }
  ];

  bulkJobs: BulkEmailJob[] = [
    { id: 'bulk-1', audience: 'Hot leads from website forms', template: 'Lead Welcome', status: 'Scheduled', recipients: 126, sent: 0, opened: 0, clicked: 0 },
    { id: 'bulk-2', audience: 'Proposal stage deals', template: 'Proposal Follow-up', status: 'Sending', recipients: 42, sent: 31, opened: 21, clicked: 9 },
    { id: 'bulk-3', audience: 'Unpaid invoices', template: 'Invoice Reminder', status: 'Completed', recipients: 18, sent: 18, opened: 13, clicked: 7 }
  ];

  constructor(private router: Router) {}

  get selectedTemplate(): EmailTemplate {
    return this.templates.find((template) => template.id === this.selectedTemplateId) || this.templates[0];
  }

  get selectedJob(): BulkEmailJob {
    return this.bulkJobs.find((job) => job.id === this.selectedJobId) || this.bulkJobs[0];
  }

  useTemplate(template: EmailTemplate): void {
    this.selectedTemplateId = template.id;
    this.composeSubject = template.subject;
    this.composeBody = template.body;
    this.showActivity(`${template.name} loaded for ${template.recordName}.`);
  }

  scheduleBulkJob(): void {
    this.selectedJob.status = 'Scheduled';
    this.showActivity(`${this.selectedJob.template} scheduled for ${this.selectedJob.audience}.`);
  }

  sendTest(): void {
    this.showActivity(`Test email sent to ${this.selectedTemplate.owner}.`);
  }

  openRecord(template: EmailTemplate): void {
    if (template.type === 'Lead') {
      this.router.navigate(['/leads', '1']);
      return;
    }
    this.router.navigate(['/deals', template.id === 'invoice-reminder' ? '7' : template.id === 'renewal-nurture' ? '6' : '1']);
  }

  private showActivity(message: string): void {
    this.activityMessage = message;
    setTimeout(() => this.activityMessage = '', 4000);
  }
}
