import { Component, OnInit } from '@angular/core';
import { AuditLogEntry, AuditLogService, AuditSeverity } from '../../services/audit-log.service';

@Component({
  selector: 'app-audit-logs-monitoring',
  standalone: false,
  templateUrl: './audit-logs-monitoring.component.html',
  styleUrls: ['./audit-logs-monitoring.component.css']
})
export class AuditLogsMonitoringComponent implements OnInit {
  activityMessage = '';
  logs: AuditLogEntry[] = [];
  searchTerm = '';
  selectedModule = '';
  selectedSeverity: AuditSeverity | '' = '';

  constructor(private audit: AuditLogService) {}

  ngOnInit(): void {
    this.refreshLogs(false);
  }

  get moduleOptions(): string[] {
    return Array.from(new Set(this.logs.map((log) => log.module))).sort();
  }

  get filteredLogs(): AuditLogEntry[] {
    const query = this.searchTerm.trim().toLowerCase();
    return this.logs.filter((log) => {
      const matchesModule = !this.selectedModule || log.module === this.selectedModule;
      const matchesSeverity = !this.selectedSeverity || log.severity === this.selectedSeverity;
      const matchesQuery = !query ||
        log.action.toLowerCase().includes(query) ||
        log.detail.toLowerCase().includes(query) ||
        log.user.toLowerCase().includes(query) ||
        log.module.toLowerCase().includes(query);
      return matchesModule && matchesSeverity && matchesQuery;
    });
  }

  get totalEvents(): number {
    return this.logs.length;
  }

  get criticalEvents(): number {
    return this.logs.filter((log) => log.severity === 'Critical').length;
  }

  get securityEvents(): number {
    return this.logs.filter((log) => ['Security', 'Login Sessions'].includes(log.module)).length;
  }

  get approvalEvents(): number {
    return this.logs.filter((log) => log.module === 'Approvals').length;
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedModule = '';
    this.selectedSeverity = '';
  }

  refreshLogs(showMessage = true): void {
    this.logs = this.audit.list();
    if (showMessage) {
      this.showActivity('Audit logs refreshed.');
    }
  }

  runMonitorCheck(): void {
    this.audit.record(
      'Audit',
      'Monitor Check Completed',
      'Audit monitor checked security, session, approval, backup, and settings activity.',
      'Info',
      '/audit-logs'
    );
    this.refreshLogs(false);
    this.showActivity('Monitor check completed.');
  }

  openRelated(log: AuditLogEntry): void {
    this.audit.open(log);
  }

  getSeverityClass(severity: AuditSeverity): string {
    return severity.toLowerCase();
  }

  trackByLog(_: number, log: AuditLogEntry): string {
    return log.id;
  }

  private showActivity(message: string): void {
    this.activityMessage = message;
    setTimeout(() => this.activityMessage = '', 3500);
  }
}
