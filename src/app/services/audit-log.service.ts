import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { PlatformStorageService } from './platform-storage.service';
import { AuthService } from './auth.service';

export type AuditSeverity = 'Info' | 'Warning' | 'Critical';

export interface AuditLogEntry {
  id: string;
  module: string;
  action: string;
  severity: AuditSeverity;
  user: string;
  detail: string;
  relatedRoute?: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuditLogService {
  private readonly storageKey = 'audit-logs';

  constructor(
    private storage: PlatformStorageService,
    private authService: AuthService,
    private router: Router
  ) {}

  list(): AuditLogEntry[] {
    return this.storage.get<AuditLogEntry[]>(this.storageKey, this.seedLogs());
  }

  record(module: string, action: string, detail: string, severity: AuditSeverity = 'Info', relatedRoute?: string): AuditLogEntry {
    const entry: AuditLogEntry = {
      id: this.storage.createId('audit'),
      module,
      action,
      severity,
      user: this.getUserName(),
      detail,
      relatedRoute,
      createdAt: new Date().toISOString()
    };
    this.storage.set(this.storageKey, [entry, ...this.list()].slice(0, 300));
    return entry;
  }

  open(entry: AuditLogEntry): void {
    if (entry.relatedRoute) {
      this.router.navigateByUrl(entry.relatedRoute);
    }
  }

  private getUserName(): string {
    const user = this.authService.getCurrentUser();
    if (!user) {
      return 'System';
    }
    return `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'System';
  }

  private seedLogs(): AuditLogEntry[] {
    return [
      {
        id: 'audit-seed-1',
        module: 'Security',
        action: 'Policy Loaded',
        severity: 'Info',
        user: 'System',
        detail: 'Default MFA, session, and IP policy loaded for the template tenant.',
        relatedRoute: '/security-compliance',
        createdAt: new Date().toISOString()
      },
      {
        id: 'audit-seed-2',
        module: 'Approvals',
        action: 'Approval Queue Created',
        severity: 'Info',
        user: 'System',
        detail: 'Seed approval queue initialized for deals, discounts, and invoices.',
        relatedRoute: '/approval-workflows',
        createdAt: new Date().toISOString()
      }
    ];
  }
}
