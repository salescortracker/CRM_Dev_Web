import { Component } from '@angular/core';
import { Router } from '@angular/router';

interface ReportMetric {
  title: string;
  value: string;
  detail: string;
  icon: string;
}

interface ReportSection {
  title: string;
  description: string;
  value: string;
  trend: string;
  route: string;
}

@Component({
  selector: 'app-reports',
  standalone: false,
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent {
  activityMessage = '';
  selectedPeriod = 'This Month';

  metrics: ReportMetric[] = [
    { title: 'Pipeline Value', value: '$380k', detail: 'Open and active opportunities', icon: 'fa-stream' },
    { title: 'Won Revenue', value: '$31k', detail: 'Closed won demo revenue', icon: 'fa-trophy' },
    { title: 'Forecast', value: '$246k', detail: 'Weighted by probability', icon: 'fa-bullseye' },
    { title: 'Task Risk', value: '4', detail: 'Overdue or high priority', icon: 'fa-triangle-exclamation' }
  ];

  stagePerformance = [
    { stage: 'Prospecting', count: 1, value: 82000, percent: 25 },
    { stage: 'Qualification', count: 1, value: 64000, percent: 45 },
    { stage: 'Proposal', count: 2, value: 88000, percent: 70 },
    { stage: 'Negotiation', count: 2, value: 97000, percent: 80 },
    { stage: 'Closed Won', count: 1, value: 31000, percent: 100 },
    { stage: 'Closed Lost', count: 1, value: 18000, percent: 0 }
  ];

  reportSections: ReportSection[] = [
    { title: 'Sales Pipeline Report', description: 'Stage value, deal count, and forecast movement.', value: '$380k', trend: '+18%', route: '/pipeline' },
    { title: 'Deal Product & Quote Report', description: 'Products, discount percentage, quote readiness, and invoice gaps.', value: '7 quotes', trend: '+3', route: '/deals' },
    { title: 'Task Productivity', description: 'Follow-ups, approvals, and overdue work tied to live deals.', value: '5 active', trend: '2 urgent', route: '/tasks' },
    { title: 'Lead-to-Deal Flow', description: 'How leads become contacts, companies, and opportunities.', value: '23%', trend: '+4%', route: '/leads' }
  ];

  performers = [
    { name: 'Rohit Kumar', role: 'Sales Owner', metric: '$122k pipeline', note: 'Owns Acme renewal and support retainer' },
    { name: 'Jane Doe', role: 'Account Executive', metric: '$56k closed/active', note: 'TechStart expansion and consulting flow' },
    { name: 'Maria Lopez', role: 'Solutions Lead', metric: '2 negotiation tasks', note: 'Counter offer and analytics rollout' }
  ];

  constructor(private router: Router) {}

  exportReport(): void {
    this.showActivity(`${this.selectedPeriod} report export prepared.`);
  }

  openReport(section: ReportSection): void {
    this.router.navigate([section.route]);
  }

  openDeals(): void {
    this.router.navigate(['/deals']);
  }

  openPipeline(): void {
    this.router.navigate(['/pipeline']);
  }

  private showActivity(message: string): void {
    this.activityMessage = message;
    setTimeout(() => this.activityMessage = '', 4000);
  }
}
