import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuditLogService } from '../../services/audit-log.service';
import { PlatformStorageService } from '../../services/platform-storage.service';

type ApprovalType = 'Deal' | 'Discount' | 'Invoice' | 'Expense';
type ApprovalStatus = 'Pending' | 'Approved' | 'Rejected' | 'Escalated';

interface ApprovalRule {
  id: string;
  name: string;
  type: ApprovalType;
  condition: string;
  levels: string[];
  active: boolean;
}

interface ApprovalRequest {
  id: string;
  title: string;
  type: ApprovalType;
  relatedId: string;
  relatedName: string;
  amount: number;
  requestedBy: string;
  currentApprover: string;
  status: ApprovalStatus;
  reason: string;
  timeline: Array<{ actor: string; note: string; time: string }>;
}

interface ApprovalWorkflowState {
  rules: ApprovalRule[];
  requests: ApprovalRequest[];
}

@Component({
  selector: 'app-approval-workflows',
  standalone: false,
  templateUrl: './approval-workflows.component.html',
  styleUrls: ['./approval-workflows.component.css']
})
export class ApprovalWorkflowsComponent implements OnInit {
  private readonly storageKey = 'approval-workflows';
  activityMessage = '';
  selectedRequestId = 'approval-1';
  selectedRuleId = 'rule-2';
  newRuleName = '';
  newRuleCondition = '';

  rules: ApprovalRule[] = [
    { id: 'rule-1', name: 'Standard deal approval', type: 'Deal', condition: 'Deal amount above $50,000', levels: ['Sales Manager', 'Executive Admin'], active: true },
    { id: 'rule-2', name: 'Discount above 15%', type: 'Discount', condition: 'Discount percent greater than 15%', levels: ['Sales Manager', 'Finance Admin', 'Executive Admin'], active: true },
    { id: 'rule-3', name: 'Invoice correction approval', type: 'Invoice', condition: 'Invoice change after sent status', levels: ['Finance Admin'], active: true },
    { id: 'rule-4', name: 'Expense reimbursement', type: 'Expense', condition: 'Expense above $1,000', levels: ['Department Head', 'Finance Admin'], active: false }
  ];

  requests: ApprovalRequest[] = [
    {
      id: 'approval-1',
      title: 'Manufacturing renewal discount',
      type: 'Discount',
      relatedId: '6',
      relatedName: 'Manufacturing Support Retainer',
      amount: 46000,
      requestedBy: 'Maria Lopez',
      currentApprover: 'Finance Admin',
      status: 'Pending',
      reason: 'Customer requested 18% discount and quarterly billing during negotiation.',
      timeline: [
        { actor: 'Maria Lopez', note: 'Submitted discount approval after counter offer.', time: 'Today, 11:10 AM' },
        { actor: 'Sales Manager', note: 'Approved pricing strategy, sent to finance.', time: 'Today, 11:45 AM' }
      ]
    },
    {
      id: 'approval-2',
      title: 'Enterprise proposal approval',
      type: 'Deal',
      relatedId: '1',
      relatedName: 'Enterprise Software License',
      amount: 50000,
      requestedBy: 'Rohit Kumar',
      currentApprover: 'Executive Admin',
      status: 'Pending',
      reason: 'Proposal value requires executive approval before final quote is sent.',
      timeline: [
        { actor: 'Rohit Kumar', note: 'Submitted final quote packet.', time: 'Today, 9:30 AM' }
      ]
    },
    {
      id: 'approval-3',
      title: 'TechStart invoice correction',
      type: 'Invoice',
      relatedId: '7',
      relatedName: 'TechStart Expansion Add-on',
      amount: 25000,
      requestedBy: 'Jane Doe',
      currentApprover: 'Finance Admin',
      status: 'Escalated',
      reason: 'Support ticket says payment link is not opening, invoice may need regeneration.',
      timeline: [
        { actor: 'Jane Doe', note: 'Requested invoice correction.', time: 'Yesterday, 5:20 PM' },
        { actor: 'Support Lead', note: 'Escalated due payment deadline.', time: 'Today, 11:55 AM' }
      ]
    }
  ];

  constructor(
    private router: Router,
    private storage: PlatformStorageService,
    private audit: AuditLogService
  ) {}

  ngOnInit(): void {
    const saved = this.storage.get<ApprovalWorkflowState | null>(this.storageKey, null);
    if (saved) {
      this.rules = saved.rules;
      this.requests = saved.requests;
      this.selectedRequestId = saved.requests[0]?.id || this.selectedRequestId;
      this.selectedRuleId = saved.rules[0]?.id || this.selectedRuleId;
      return;
    }

    this.persist();
  }

  get selectedRequest(): ApprovalRequest {
    return this.requests.find((request) => request.id === this.selectedRequestId) || this.requests[0];
  }

  get selectedRule(): ApprovalRule {
    return this.rules.find((rule) => rule.id === this.selectedRuleId) || this.rules[0];
  }

  get pendingCount(): number {
    return this.requests.filter((request) => request.status === 'Pending').length;
  }

  get escalatedCount(): number {
    return this.requests.filter((request) => request.status === 'Escalated').length;
  }

  approve(request: ApprovalRequest): void {
    request.status = 'Approved';
    request.timeline.unshift({ actor: request.currentApprover, note: 'Approved workflow request.', time: 'Just now' });
    this.persist();
    this.audit.record(
      'Approvals',
      'Request Approved',
      `${request.title} approved for ${request.relatedName}.`,
      'Info',
      this.getRelatedRoute(request)
    );
    this.showActivity(`${request.title} approved.`);
  }

  reject(request: ApprovalRequest): void {
    request.status = 'Rejected';
    request.timeline.unshift({ actor: request.currentApprover, note: 'Rejected and returned for revision.', time: 'Just now' });
    this.persist();
    this.audit.record(
      'Approvals',
      'Request Rejected',
      `${request.title} rejected and returned for revision.`,
      'Warning',
      this.getRelatedRoute(request)
    );
    this.showActivity(`${request.title} rejected.`);
  }

  escalate(request: ApprovalRequest): void {
    request.status = 'Escalated';
    request.currentApprover = 'Executive Admin';
    request.timeline.unshift({ actor: 'System', note: 'Escalated to executive approval.', time: 'Just now' });
    this.persist();
    this.audit.record(
      'Approvals',
      'Request Escalated',
      `${request.title} escalated to Executive Admin.`,
      'Critical',
      this.getRelatedRoute(request)
    );
    this.showActivity(`${request.title} escalated.`);
  }

  toggleRule(rule: ApprovalRule): void {
    rule.active = !rule.active;
    this.persist();
    this.audit.record(
      'Approvals',
      rule.active ? 'Rule Activated' : 'Rule Paused',
      `${rule.name} rule ${rule.active ? 'activated' : 'paused'}.`,
      rule.active ? 'Info' : 'Warning',
      '/approval-workflows'
    );
    this.showActivity(`${rule.name} ${rule.active ? 'activated' : 'paused'}.`);
  }

  addRule(): void {
    if (!this.newRuleName.trim() || !this.newRuleCondition.trim()) {
      this.showActivity('Add rule name and condition before saving.');
      return;
    }
    const rule: ApprovalRule = {
      id: `rule-${Date.now()}`,
      name: this.newRuleName.trim(),
      type: 'Deal',
      condition: this.newRuleCondition.trim(),
      levels: ['Sales Manager', 'Executive Admin'],
      active: true
    };
    this.rules.unshift(rule);
    this.selectedRuleId = rule.id;
    this.newRuleName = '';
    this.newRuleCondition = '';
    this.persist();
    this.audit.record(
      'Approvals',
      'Rule Created',
      `${rule.name} created with condition: ${rule.condition}.`,
      'Info',
      '/approval-workflows'
    );
    this.showActivity(`${rule.name} approval rule created.`);
  }

  openRelated(request: ApprovalRequest): void {
    if (request.type === 'Invoice' || request.type === 'Deal') {
      this.router.navigate(['/deals', request.relatedId, 'products']);
      return;
    }
    if (request.type === 'Discount') {
      this.router.navigate(['/deals', request.relatedId, 'negotiate']);
      return;
    }
    this.router.navigate(['/tasks']);
  }

  private persist(): void {
    this.storage.set<ApprovalWorkflowState>(this.storageKey, {
      rules: this.rules,
      requests: this.requests
    });
  }

  private getRelatedRoute(request: ApprovalRequest): string {
    if (request.type === 'Invoice' || request.type === 'Deal') {
      return `/deals/${request.relatedId}/products`;
    }
    if (request.type === 'Discount') {
      return `/deals/${request.relatedId}/negotiate`;
    }
    return '/tasks';
  }

  private showActivity(message: string): void {
    this.activityMessage = message;
    setTimeout(() => this.activityMessage = '', 4000);
  }
}
