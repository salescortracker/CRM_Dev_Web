import { Component, OnInit } from '@angular/core';
import { PlatformStorageService } from '../../services/platform-storage.service';
import { AuditLogService } from '../../services/audit-log.service';

interface ActiveSession {
  id: string;
  user: string;
  role: string;
  device: string;
  ip: string;
  location: string;
  lastActive: string;
  trusted: boolean;
}

@Component({
  selector: 'app-security-compliance',
  standalone: false,
  templateUrl: './security-compliance.component.html',
  styleUrls: ['./security-compliance.component.css']
})
export class SecurityComplianceComponent implements OnInit {
  activityMessage = '';
  mfaRequired = true;
  passwordExpiryDays = 60;
  sessionTimeout = 30;
  encryptionAtRest = true;
  auditRetention = 365;
  newIp = '';

  ipRules = [
    { ip: '203.0.113.10', label: 'Head office', action: 'Allow' },
    { ip: '198.51.100.25', label: 'Support VPN', action: 'Allow' },
    { ip: '45.33.12.90', label: 'Suspicious login source', action: 'Block' }
  ];

  sessions: ActiveSession[] = [
    { id: 'sess-1', user: 'Admin User', role: 'Super Admin', device: 'Chrome on Windows', ip: '203.0.113.10', location: 'Denver, US', lastActive: 'Just now', trusted: true },
    { id: 'sess-2', user: 'Rohit Kumar', role: 'Sales Manager', device: 'Edge on Windows', ip: '198.51.100.25', location: 'Bangalore, IN', lastActive: '18 minutes ago', trusted: true },
    { id: 'sess-3', user: 'Jane Doe', role: 'Sales Rep', device: 'Safari on iPhone', ip: '45.33.12.90', location: 'Unknown', lastActive: '1 hour ago', trusted: false }
  ];

  complianceChecks = [
    { name: 'Data encryption', status: 'Enabled', detail: 'Tenant records encrypted at rest and in transit.' },
    { name: 'Audit log retention', status: '365 days', detail: 'CRUD, login, export, and admin actions are retained.' },
    { name: 'MFA coverage', status: '92%', detail: 'Sales users without MFA are flagged for enforcement.' },
    { name: 'Session policy', status: '30 min timeout', detail: 'Idle sessions expire automatically.' }
  ];

  constructor(
    private storage: PlatformStorageService,
    private audit: AuditLogService
  ) {}

  ngOnInit(): void {
    const saved = this.storage.get<any>('security-compliance', null);
    if (saved) {
      this.mfaRequired = saved.mfaRequired;
      this.passwordExpiryDays = saved.passwordExpiryDays;
      this.sessionTimeout = saved.sessionTimeout;
      this.encryptionAtRest = saved.encryptionAtRest;
      this.auditRetention = saved.auditRetention;
      this.ipRules = saved.ipRules || this.ipRules;
      this.sessions = saved.sessions || this.sessions;
    } else {
      this.persist();
    }
  }

  addIpRule(action: 'Allow' | 'Block'): void {
    if (!this.newIp.trim()) {
      this.showActivity('Enter an IP address before adding a rule.');
      return;
    }
    this.ipRules.unshift({ ip: this.newIp.trim(), label: 'Manual security rule', action });
    this.newIp = '';
    this.persist();
    this.audit.record('Security', `${action} IP Rule`, `${action} rule added for ${this.ipRules[0].ip}.`, action === 'Block' ? 'Warning' : 'Info', '/security-compliance');
    this.showActivity(`${action} rule added.`);
  }

  forceLogout(session: ActiveSession): void {
    this.sessions = this.sessions.filter((item) => item.id !== session.id);
    this.persist();
    this.audit.record('Security', 'Force Logout', `${session.user} session ended from ${session.ip}.`, 'Warning', '/security-compliance');
    this.showActivity(`${session.user} session ended.`);
  }

  trustSession(session: ActiveSession): void {
    session.trusted = true;
    this.persist();
    this.audit.record('Security', 'Trust Device', `${session.user} device marked trusted.`, 'Info', '/security-compliance');
    this.showActivity(`${session.user} device marked trusted.`);
  }

  savePolicy(): void {
    this.persist();
    this.audit.record('Security', 'Policy Saved', `MFA ${this.mfaRequired ? 'enabled' : 'disabled'}, session timeout ${this.sessionTimeout} minutes, audit retention ${this.auditRetention} days.`, 'Info', '/security-compliance');
    this.showActivity('Security policy saved for all tenants.');
  }

  private persist(): void {
    this.storage.set('security-compliance', {
      mfaRequired: this.mfaRequired,
      passwordExpiryDays: this.passwordExpiryDays,
      sessionTimeout: this.sessionTimeout,
      encryptionAtRest: this.encryptionAtRest,
      auditRetention: this.auditRetention,
      ipRules: this.ipRules,
      sessions: this.sessions
    });
  }

  private showActivity(message: string): void {
    this.activityMessage = message;
    setTimeout(() => this.activityMessage = '', 4000);
  }
}
