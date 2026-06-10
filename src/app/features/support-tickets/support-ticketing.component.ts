import { Component } from '@angular/core';
import { Router } from '@angular/router';

type TicketStatus = 'Open' | 'In Progress' | 'Waiting on Customer' | 'Escalated' | 'Resolved';
type TicketPriority = 'Low' | 'Medium' | 'High' | 'Critical';

interface SupportTicket {
  id: string;
  title: string;
  customer: string;
  company: string;
  status: TicketStatus;
  priority: TicketPriority;
  sla: 'On Track' | 'At Risk' | 'Breached';
  owner: string;
  relatedType: 'company' | 'deal' | 'invoice';
  relatedId: string;
  relatedName: string;
  summary: string;
  comments: Array<{ author: string; note: string; time: string }>;
}

@Component({
  selector: 'app-support-ticketing',
  standalone: false,
  templateUrl: './support-ticketing.component.html',
  styleUrls: ['./support-ticketing.component.css']
})
export class SupportTicketingComponent {
  activityMessage = '';
  selectedTicketId = 'ticket-2';
  newComment = '';

  tickets: SupportTicket[] = [
    {
      id: 'ticket-1',
      title: 'Lead import mapping issue',
      customer: 'Marketing Ops',
      company: 'ABC Corp',
      status: 'In Progress',
      priority: 'Medium',
      sla: 'On Track',
      owner: 'Rohit Kumar',
      relatedType: 'company',
      relatedId: '1',
      relatedName: 'ABC Corp',
      summary: 'Website lead form import is missing territory mapping for North region.',
      comments: [
        { author: 'Rohit Kumar', note: 'Checked lead source mapping and found missing territory rule.', time: 'Today, 9:10 AM' }
      ]
    },
    {
      id: 'ticket-2',
      title: 'Invoice payment link not opening',
      customer: 'Jane Smith',
      company: 'TechStart Inc',
      status: 'Escalated',
      priority: 'Critical',
      sla: 'At Risk',
      owner: 'Jane Doe',
      relatedType: 'invoice',
      relatedId: '7',
      relatedName: 'TechStart Expansion Add-on',
      summary: 'Customer cannot open the payment link for invoice I-207 after closed-won expansion.',
      comments: [
        { author: 'Jane Doe', note: 'Billing gateway sync is healthy, checking customer browser error.', time: 'Today, 11:35 AM' },
        { author: 'Support Lead', note: 'Escalated to billing operations because payment deadline is tomorrow.', time: 'Today, 11:55 AM' }
      ]
    },
    {
      id: 'ticket-3',
      title: 'Renewal SLA document requested',
      customer: 'Operations VP',
      company: 'Acme Corporation',
      status: 'Waiting on Customer',
      priority: 'High',
      sla: 'On Track',
      owner: 'Maria Lopez',
      relatedType: 'deal',
      relatedId: '6',
      relatedName: 'Manufacturing Support Retainer',
      summary: 'Customer requested revised SLA details during negotiation before accepting counter offer.',
      comments: [
        { author: 'Maria Lopez', note: 'Attached revised SLA and asked for procurement approval timeline.', time: 'Yesterday, 4:20 PM' }
      ]
    }
  ];

  constructor(private router: Router) {}

  get selectedTicket(): SupportTicket {
    return this.tickets.find((ticket) => ticket.id === this.selectedTicketId) || this.tickets[0];
  }

  get breachedCount(): number {
    return this.tickets.filter((ticket) => ticket.sla === 'Breached' || ticket.sla === 'At Risk').length;
  }

  get criticalCount(): number {
    return this.tickets.filter((ticket) => ticket.priority === 'Critical').length;
  }

  addComment(): void {
    if (!this.newComment.trim()) {
      this.showActivity('Add a comment before saving.');
      return;
    }
    this.selectedTicket.comments.unshift({ author: this.selectedTicket.owner, note: this.newComment.trim(), time: 'Just now' });
    this.newComment = '';
    this.showActivity('Ticket comment added.');
  }

  escalate(ticket: SupportTicket): void {
    ticket.status = 'Escalated';
    ticket.sla = 'At Risk';
    this.showActivity(`${ticket.title} escalated to support lead.`);
  }

  resolve(ticket: SupportTicket): void {
    ticket.status = 'Resolved';
    ticket.sla = 'On Track';
    this.showActivity(`${ticket.title} resolved.`);
  }

  createTask(ticket: SupportTicket): void {
    this.showActivity(`Follow-up task created for ${ticket.title}.`);
  }

  openRelated(ticket: SupportTicket): void {
    if (ticket.relatedType === 'company') {
      this.router.navigate(['/companies', ticket.relatedId]);
      return;
    }
    this.router.navigate(['/deals', ticket.relatedId]);
  }

  private showActivity(message: string): void {
    this.activityMessage = message;
    setTimeout(() => this.activityMessage = '', 4000);
  }
}
