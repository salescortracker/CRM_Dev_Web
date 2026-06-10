import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

type TaskStatus = 'Open' | 'In Progress' | 'Waiting' | 'Approval Requested' | 'Completed';
type TaskPriority = 'Low' | 'Medium' | 'High' | 'Critical';
type TaskRelationType = 'lead' | 'contact' | 'company' | 'deal' | 'quote' | 'invoice';
type MeetingProvider = 'Phone Call' | 'Google Meet' | 'Zoom' | 'Microsoft Teams' | 'In-person Meeting';

interface TaskItem {
  id: number;
  title: string;
  dueDate: string;
  status: TaskStatus;
  assignee: string;
  priority: TaskPriority;
  notes: string;
  type: string;
  relationType: TaskRelationType;
  relationId: string;
  relationName: string;
  nextAction: string;
  approvalStatus: 'Not Required' | 'Pending' | 'Approved' | 'Rejected';
  completedAt?: string;
}

interface TaskTemplate {
  id: string;
  name: string;
  description: string;
  type: string;
  defaultPriority: TaskPriority;
  dueInDays: number;
  relationType: TaskRelationType;
  relationId: string;
  relationName: string;
  nextAction: string;
}

interface TaskMeeting {
  id: string;
  title: string;
  date: string;
  time: string;
  provider: MeetingProvider;
  purpose: string;
  owner: string;
  relationType: TaskRelationType;
  relationId: string;
}

@Component({
  selector: 'app-tasks',
  standalone: false,
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.css']
})
export class TasksComponent implements OnInit {
  tasks: TaskItem[] = [];
  selectedTask: TaskItem | null = null;
  activeFilter = 'all';
  activityMessage = '';
  showSchedulePanel = false;
  showUpcomingMeetings = false;
  meetingProvider: MeetingProvider = 'Google Meet';
  meetingPurpose = 'Follow-up';
  meetingDate = this.formatFutureDate(1);
  meetingTime = '10:30';
  meetingReminder = '30 minutes before';
  meetingNotes = '';
  meetingProviders: Array<{ name: MeetingProvider; icon: string; connected: boolean }> = [
    { name: 'Phone Call', icon: 'fa-phone', connected: true },
    { name: 'Google Meet', icon: 'fa-video', connected: true },
    { name: 'Zoom', icon: 'fa-video', connected: true },
    { name: 'Microsoft Teams', icon: 'fa-users', connected: false },
    { name: 'In-person Meeting', icon: 'fa-location-dot', connected: true },
  ];
  meetingPurposes = ['Follow-up', 'Approval reminder', 'Internal review', 'Customer callback', 'Proposal review'];
  scheduledMeetings: TaskMeeting[] = [
    {
      id: 'task-meet-1',
      title: 'Acme quote approval follow-up',
      date: this.formatFutureDate(0),
      time: '16:00',
      provider: 'Google Meet',
      purpose: 'Approval reminder',
      owner: 'Rohit Kumar',
      relationType: 'deal',
      relationId: '1'
    }
  ];

  taskTitle = '';
  taskAssignee = 'You';
  taskDueDate = this.formatFutureDate(3);
  taskPriority: TaskPriority = 'Medium';
  taskRelationType: TaskRelationType = 'deal';
  taskRelationId = '1';
  taskRelationName = 'Enterprise Software License';
  taskType = 'Follow-up';
  taskNotes = '';
  selectedTemplate = '';

  assignees = ['You', 'Rohit Kumar', 'Jane Doe', 'Maria Lopez', 'Emma Davis', 'Nate Hill'];
  priorities: TaskPriority[] = ['Low', 'Medium', 'High', 'Critical'];
  statuses: TaskStatus[] = ['Open', 'In Progress', 'Waiting', 'Approval Requested', 'Completed'];
  relationTypes: TaskRelationType[] = ['lead', 'contact', 'company', 'deal', 'quote', 'invoice'];

  filters = {
    search: ''
  };

  templates: TaskTemplate[] = [
    {
      id: 'proposal-review',
      name: 'Review proposal before sending',
      description: 'Check pricing, discount, products, and customer terms.',
      type: 'Proposal Review',
      defaultPriority: 'Critical',
      dueInDays: 1,
      relationType: 'deal',
      relationId: '1',
      relationName: 'Enterprise Software License',
      nextAction: 'Open products and confirm quote'
    },
    {
      id: 'counter-offer',
      name: 'Respond to counter offer',
      description: 'Review customer counter and prepare revised terms.',
      type: 'Negotiation',
      defaultPriority: 'High',
      dueInDays: 1,
      relationType: 'deal',
      relationId: '6',
      relationName: 'Manufacturing Support Retainer',
      nextAction: 'Open negotiation workspace'
    },
    {
      id: 'invoice-reminder',
      name: 'Send invoice reminder',
      description: 'Follow up on unpaid invoice after closed-won deal.',
      type: 'Invoice',
      defaultPriority: 'Medium',
      dueInDays: 3,
      relationType: 'invoice',
      relationId: '7',
      relationName: 'TechStart Expansion Add-on',
      nextAction: 'Open deal and review invoice'
    }
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadTasks();
    this.selectedTask = this.tasks[0] || null;
  }

  private loadTasks(): void {
    this.tasks = [
      {
        id: 1,
        title: 'Review Acme renewal quote',
        dueDate: this.formatFutureDate(0),
        status: 'Approval Requested',
        assignee: 'Rohit Kumar',
        priority: 'Critical',
        notes: 'Confirm products, renewal pricing, and final approval packet.',
        type: 'Quote Approval',
        relationType: 'deal',
        relationId: '1',
        relationName: 'Enterprise Software License',
        nextAction: 'Open products and send final quote',
        approvalStatus: 'Pending'
      },
      {
        id: 2,
        title: 'Reply to manufacturing counter offer',
        dueDate: this.formatFutureDate(1),
        status: 'In Progress',
        assignee: 'Maria Lopez',
        priority: 'High',
        notes: 'Customer requested quarterly billing and SLA terms.',
        type: 'Negotiation',
        relationType: 'deal',
        relationId: '6',
        relationName: 'Manufacturing Support Retainer',
        nextAction: 'Open negotiation and revise counter',
        approvalStatus: 'Not Required'
      },
      {
        id: 3,
        title: 'Create invoice for won expansion deal',
        dueDate: this.formatFutureDate(2),
        status: 'Open',
        assignee: 'Jane Doe',
        priority: 'Medium',
        notes: 'Closed-won expansion needs invoice follow-up.',
        type: 'Invoice',
        relationType: 'deal',
        relationId: '7',
        relationName: 'TechStart Expansion Add-on',
        nextAction: 'Open products and create invoice',
        approvalStatus: 'Not Required'
      },
      {
        id: 4,
        title: 'Follow up with HealthSync compliance team',
        dueDate: this.formatFutureDate(-1),
        status: 'Waiting',
        assignee: 'Nate Hill',
        priority: 'High',
        notes: 'Waiting for security review before proposal.',
        type: 'Follow-up',
        relationType: 'deal',
        relationId: '4',
        relationName: 'Healthcare CRM Migration',
        nextAction: 'Open deal and check qualification notes',
        approvalStatus: 'Not Required'
      },
      {
        id: 5,
        title: 'Convert education portal approval into next task',
        dueDate: this.formatFutureDate(4),
        status: 'Open',
        assignee: 'Emma Davis',
        priority: 'Medium',
        notes: 'Quote validity extension requested by finance director.',
        type: 'Proposal',
        relationType: 'deal',
        relationId: '5',
        relationName: 'Education Portal Subscription',
        nextAction: 'Open negotiation or quote status',
        approvalStatus: 'Not Required'
      }
    ];
  }

  get filteredTasks(): TaskItem[] {
    return this.tasks.filter((task) => {
      const search = this.filters.search.trim().toLowerCase();
      const matchesSearch = !search || [task.title, task.notes, task.relationName, task.assignee, task.type]
        .join(' ')
        .toLowerCase()
        .includes(search);
      const matchesFilter = this.activeFilter === 'all'
        || (this.activeFilter === 'today' && this.isDueToday(task))
        || (this.activeFilter === 'overdue' && this.isOverdue(task))
        || (this.activeFilter === 'deal' && task.relationType === 'deal')
        || (this.activeFilter === 'approval' && task.approvalStatus === 'Pending')
        || (this.activeFilter === 'completed' && task.status === 'Completed');
      return matchesSearch && matchesFilter;
    });
  }

  get dueTodayCount(): number {
    return this.tasks.filter((task) => this.isDueToday(task) && task.status !== 'Completed').length;
  }

  get overdueTasks(): number {
    return this.tasks.filter((task) => this.isOverdue(task)).length;
  }

  get highPriorityCount(): number {
    return this.tasks.filter((task) => ['High', 'Critical'].includes(task.priority) && task.status !== 'Completed').length;
  }

  get completedCount(): number {
    return this.tasks.filter((task) => task.status === 'Completed').length;
  }

  setFilter(filter: string): void {
    this.activeFilter = filter;
    this.selectedTask = this.filteredTasks[0] || null;
  }

  selectTask(task: TaskItem): void {
    this.selectedTask = task;
    this.showSchedulePanel = false;
    this.showUpcomingMeetings = false;
  }

  applyTemplate(templateId: string): void {
    const template = this.templates.find((tpl) => tpl.id === templateId);
    if (!template) {
      return;
    }
    this.selectedTemplate = template.id;
    this.taskTitle = template.name;
    this.taskPriority = template.defaultPriority;
    this.taskDueDate = this.formatFutureDate(template.dueInDays);
    this.taskType = template.type;
    this.taskRelationType = template.relationType;
    this.taskRelationId = template.relationId;
    this.taskRelationName = template.relationName;
    this.taskNotes = template.description;
  }

  createTask(): void {
    if (!this.taskTitle.trim()) {
      this.showActivity('Enter a task title before creating.');
      return;
    }

    const nextId = Math.max(0, ...this.tasks.map((task) => task.id)) + 1;
    const newTask: TaskItem = {
      id: nextId,
      title: this.taskTitle.trim(),
      dueDate: this.taskDueDate,
      status: 'Open',
      assignee: this.taskAssignee,
      priority: this.taskPriority,
      notes: this.taskNotes,
      type: this.taskType,
      relationType: this.taskRelationType,
      relationId: this.taskRelationId,
      relationName: this.taskRelationName,
      nextAction: 'Open related record',
      approvalStatus: this.taskPriority === 'Critical' ? 'Pending' : 'Not Required'
    };

    this.tasks.unshift(newTask);
    this.selectedTask = newTask;
    this.resetTaskForm();
    this.showActivity('Task created.');
  }

  resetTaskForm(): void {
    this.taskTitle = '';
    this.taskAssignee = 'You';
    this.taskDueDate = this.formatFutureDate(3);
    this.taskPriority = 'Medium';
    this.taskRelationType = 'deal';
    this.taskRelationId = '1';
    this.taskRelationName = 'Enterprise Software License';
    this.taskType = 'Follow-up';
    this.taskNotes = '';
    this.selectedTemplate = '';
  }

  markDone(task: TaskItem): void {
    task.status = 'Completed';
    task.approvalStatus = task.approvalStatus === 'Pending' ? 'Approved' : task.approvalStatus;
    task.completedAt = new Date().toISOString();
    this.showActivity(`${task.title} completed.`);
  }

  startTask(task: TaskItem): void {
    task.status = 'In Progress';
    this.selectedTask = task;
    this.showActivity(`${task.title} started.`);
  }

  snoozeTask(task: TaskItem): void {
    task.dueDate = this.formatDateFrom(new Date(task.dueDate), 2);
    task.status = 'Waiting';
    this.showActivity(`${task.title} snoozed by 2 days.`);
  }

  createFollowUp(task: TaskItem): void {
    const followUp: TaskItem = {
      ...task,
      id: Math.max(0, ...this.tasks.map((item) => item.id)) + 1,
      title: `Follow up: ${task.relationName}`,
      dueDate: this.formatFutureDate(3),
      status: 'Open',
      priority: 'Medium',
      notes: `Follow-up created from "${task.title}".`,
      approvalStatus: 'Not Required',
      completedAt: undefined
    };
    this.tasks.unshift(followUp);
    this.selectedTask = followUp;
    this.showActivity('Follow-up task created.');
  }

  toggleSchedulePanel(): void {
    if (!this.selectedTask) {
      return;
    }

    this.showSchedulePanel = !this.showSchedulePanel;
    if (this.showSchedulePanel) {
      this.meetingPurpose = this.selectedTask.type === 'Negotiation' ? 'Customer callback' : 'Follow-up';
      this.meetingNotes = `Schedule around task: ${this.selectedTask.title}.`;
    }
  }

  selectMeetingProvider(provider: MeetingProvider): void {
    this.meetingProvider = provider;
  }

  saveMeeting(): void {
    if (!this.selectedTask) {
      return;
    }

    this.scheduledMeetings.unshift({
      id: `task-meet-${Date.now()}`,
      title: `${this.meetingPurpose}: ${this.selectedTask.relationName}`,
      date: this.meetingDate,
      time: this.meetingTime,
      provider: this.meetingProvider,
      purpose: this.meetingPurpose,
      owner: this.selectedTask.assignee,
      relationType: this.selectedTask.relationType,
      relationId: this.selectedTask.relationId
    });
    this.selectedTask.status = 'Waiting';
    this.showSchedulePanel = false;
    this.showUpcomingMeetings = true;
    this.showActivity(`Meeting scheduled for ${this.selectedTask.relationName}.`);
  }

  getSelectedTaskMeetings(): TaskMeeting[] {
    if (!this.selectedTask) {
      return [];
    }

    return this.scheduledMeetings.filter((meeting) =>
      meeting.relationType === this.selectedTask?.relationType && meeting.relationId === this.selectedTask?.relationId
    );
  }

  approveTask(task: TaskItem): void {
    task.approvalStatus = 'Approved';
    task.status = 'In Progress';
    this.showActivity(`${task.title} approved.`);
  }

  rejectTask(task: TaskItem): void {
    task.approvalStatus = 'Rejected';
    task.status = 'Waiting';
    this.showActivity(`${task.title} sent back for revision.`);
  }

  openRelated(task: TaskItem): void {
    if (task.relationType === 'deal' || task.relationType === 'quote' || task.relationType === 'invoice') {
      this.router.navigate(['/deals', task.relationId]);
      return;
    }
    if (task.relationType === 'company') {
      this.router.navigate(['/companies', task.relationId]);
      return;
    }
    if (task.relationType === 'contact') {
      this.router.navigate(['/contacts', task.relationId]);
      return;
    }
    if (task.relationType === 'lead') {
      this.router.navigate(['/leads', task.relationId]);
    }
  }

  openNextAction(task: TaskItem): void {
    if (task.type === 'Negotiation') {
      this.router.navigate(['/deals', task.relationId, 'negotiate']);
      return;
    }
    if (['Invoice', 'Quote Approval', 'Proposal'].includes(task.type)) {
      this.router.navigate(['/deals', task.relationId, 'products']);
      return;
    }
    this.openRelated(task);
  }

  isOverdue(task: TaskItem): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(task.dueDate);
    target.setHours(0, 0, 0, 0);
    return target < today && task.status !== 'Completed';
  }

  isDueToday(task: TaskItem): boolean {
    const today = new Date().toISOString().slice(0, 10);
    return task.dueDate === today;
  }

  getPriorityBadgeClass(priority: TaskPriority): string {
    return `priority-${priority.toLowerCase()}`;
  }

  getStatusClass(status: TaskStatus): string {
    return `status-${status.toLowerCase().replace(/\s+/g, '-')}`;
  }

  formatFutureDate(days: number): string {
    const future = new Date();
    future.setDate(future.getDate() + days);
    return future.toISOString().slice(0, 10);
  }

  private formatDateFrom(date: Date, days: number): string {
    const future = new Date(date);
    future.setDate(future.getDate() + days);
    return future.toISOString().slice(0, 10);
  }

  private showActivity(message: string): void {
    this.activityMessage = message;
    setTimeout(() => {
      this.activityMessage = '';
    }, 4000);
  }
}
