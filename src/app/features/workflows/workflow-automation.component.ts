import { Component, OnInit } from '@angular/core';

interface Workflow {
  id: string;
  name: string;
  trigger: string;
  actions: string[];
  status: 'Active' | 'Paused';
  runs: number;
  successRate: number;
  sla: string;
}

@Component({
  selector: 'app-workflow-automation',
  standalone: false,
  templateUrl: './workflow-automation.component.html',
  styleUrls: ['./workflow-automation.component.css']
})
export class WorkflowAutomationComponent implements OnInit {
  workflows: Workflow[] = [];
  selectedWorkflow: Workflow | null = null;
  activityMessage = '';
  triggers = ['Lead created', 'Deal moved to Proposal', 'Task overdue', 'Invoice unpaid', 'Subscription expiring'];

  ngOnInit(): void {
    this.workflows = [
      { id: 'wf-001', name: 'New Lead Welcome Flow', trigger: 'Lead created', actions: ['Auto assign owner', 'Send welcome email', 'Create follow-up task'], status: 'Active', runs: 342, successRate: 96, sla: 'Respond within 2 hours' },
      { id: 'wf-002', name: 'Proposal Approval Reminder', trigger: 'Deal moved to Proposal', actions: ['Notify manager', 'Create approval task', 'Send quote email'], status: 'Active', runs: 88, successRate: 91, sla: 'Approval within 1 day' },
      { id: 'wf-003', name: 'Overdue Task Escalation', trigger: 'Task overdue', actions: ['Notify owner', 'Escalate to manager'], status: 'Paused', runs: 41, successRate: 84, sla: 'Escalate after 24 hours' }
    ];
    this.selectedWorkflow = this.workflows[0];
  }

  get activeWorkflows(): number {
    return this.workflows.filter((workflow) => workflow.status === 'Active').length;
  }

  selectWorkflow(workflow: Workflow): void {
    this.selectedWorkflow = workflow;
  }

  toggleWorkflow(workflow: Workflow): void {
    workflow.status = workflow.status === 'Active' ? 'Paused' : 'Active';
    this.showActivity(`${workflow.name} ${workflow.status.toLowerCase()}.`);
  }

  addAction(workflow: Workflow, action: string): void {
    if (action && !workflow.actions.includes(action)) {
      workflow.actions = [...workflow.actions, action];
    }
  }

  simulateRun(workflow: Workflow): void {
    workflow.runs += 1;
    this.showActivity(`${workflow.name} simulated successfully.`);
  }

  private showActivity(message: string): void {
    this.activityMessage = message;
    setTimeout(() => this.activityMessage = '', 3500);
  }
}
