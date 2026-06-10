import { Component, OnInit } from '@angular/core';
import { PlatformStorageService } from '../../services/platform-storage.service';
import { AuditLogService } from '../../services/audit-log.service';

type SessionStatus = 'Active' | 'Idle' | 'Expired' | 'Blocked';

interface ActiveSession {
  id: string;
  user: string;
  role: string;
  company: string;
  device: string;
  browser: string;
  ip: string;
  location: string;
  lastActive: string;
  status: SessionStatus;
  trusted: boolean;
  mfaVerified: boolean;
}

interface LoginEvent {
  user: string;
  event: string;
  device: string;
  ip: string;
  result: 'Success' | 'Failed' | 'Blocked';
  time: string;
}

@Component({
  selector: 'app-login-session-management',
  standalone: false,
  templateUrl: './login-session-management.component.html',
  styleUrls: ['./login-session-management.component.css']
})
export class LoginSessionManagementComponent implements OnInit {
  private readonly storageKey = 'login-sessions';
  activityMessage = '';
  selectedSessionId = 'sess-3';
  deviceSearchTerm = '';
  historySearchTerm = '';
  sessionTimeout = 30;
  maxFailedAttempts = 5;
  maxSessionDurationHours = 8;
  rememberTrustedDevices = true;
  requireMfa = true;

  sessions: ActiveSession[] = [
    { id: 'sess-1', user: 'Admin User', role: 'Super Admin', company: 'Platform Admin', device: 'Windows laptop', browser: 'Chrome 125', ip: '203.0.113.10', location: 'Denver, US', lastActive: 'Just now', status: 'Active', trusted: true, mfaVerified: true },
    { id: 'sess-2', user: 'Rohit Kumar', role: 'Sales Manager', company: 'ABC Pvt Ltd', device: 'Windows desktop', browser: 'Edge 125', ip: '198.51.100.25', location: 'Bangalore, IN', lastActive: '18 minutes ago', status: 'Idle', trusted: true, mfaVerified: true },
    { id: 'sess-3', user: 'Jane Doe', role: 'Sales Rep', company: 'TechStart Inc', device: 'iPhone', browser: 'Safari', ip: '45.33.12.90', location: 'Unknown', lastActive: '1 hour ago', status: 'Active', trusted: false, mfaVerified: false },
    { id: 'sess-4', user: 'Maria Lopez', role: 'Sales Manager', company: 'Acme Corporation', device: 'MacBook', browser: 'Chrome 125', ip: '203.0.113.42', location: 'Austin, US', lastActive: 'Yesterday', status: 'Expired', trusted: true, mfaVerified: true }
  ];

  loginEvents: LoginEvent[] = [
    { user: 'Admin User', event: 'MFA verified', device: 'Windows laptop', ip: '203.0.113.10', result: 'Success', time: 'Just now' },
    { user: 'Jane Doe', event: 'New device login', device: 'iPhone', ip: '45.33.12.90', result: 'Success', time: '1 hour ago' },
    { user: 'Unknown user', event: 'Password failed 5 times', device: 'Unknown', ip: '45.33.12.90', result: 'Blocked', time: '2 hours ago' },
    { user: 'Rohit Kumar', event: 'Session resumed', device: 'Windows desktop', ip: '198.51.100.25', result: 'Success', time: 'Today, 9:20 AM' }
  ];

  constructor(
    private storage: PlatformStorageService,
    private audit: AuditLogService
  ) {}

  ngOnInit(): void {
    const saved = this.storage.get<any>(this.storageKey, null);
    if (saved) {
      this.sessions = (saved.sessions || this.sessions).map((session: Partial<ActiveSession>) => this.normalizeSession(session));
      this.loginEvents = saved.loginEvents || this.loginEvents;
      this.sessionTimeout = saved.sessionTimeout ?? this.sessionTimeout;
      this.maxFailedAttempts = saved.maxFailedAttempts ?? this.maxFailedAttempts;
      this.maxSessionDurationHours = saved.maxSessionDurationHours ?? this.maxSessionDurationHours;
      this.rememberTrustedDevices = saved.rememberTrustedDevices ?? this.rememberTrustedDevices;
      this.requireMfa = saved.requireMfa ?? this.requireMfa;
      this.selectedSessionId = this.sessions[0]?.id || this.selectedSessionId;
    } else {
      this.persist();
    }
  }

  get selectedSession(): ActiveSession {
    return this.sessions.find((session) => session.id === this.selectedSessionId) || this.sessions[0];
  }

  get filteredSessions(): ActiveSession[] {
    const query = this.deviceSearchTerm.trim().toLowerCase();
    if (!query) {
      return this.sessions;
    }
    return this.sessions.filter((session) =>
      session.user.toLowerCase().includes(query) ||
      session.role.toLowerCase().includes(query) ||
      session.company.toLowerCase().includes(query) ||
      session.device.toLowerCase().includes(query) ||
      session.location.toLowerCase().includes(query) ||
      session.ip.toLowerCase().includes(query)
    );
  }

  get filteredLoginEvents(): LoginEvent[] {
    const query = this.historySearchTerm.trim().toLowerCase();
    if (!query) {
      return this.loginEvents;
    }
    return this.loginEvents.filter((event) =>
      event.user.toLowerCase().includes(query) ||
      event.event.toLowerCase().includes(query) ||
      event.device.toLowerCase().includes(query) ||
      event.ip.toLowerCase().includes(query) ||
      event.result.toLowerCase().includes(query)
    );
  }

  get activeCount(): number {
    return this.sessions.filter((session) => session.status === 'Active').length;
  }

  get idleCount(): number {
    return this.sessions.filter((session) => session.status === 'Idle').length;
  }

  get untrustedCount(): number {
    return this.sessions.filter((session) => !session.trusted && session.status !== 'Expired').length;
  }

  get blockedCount(): number {
    return this.sessions.filter((session) => session.status === 'Blocked').length;
  }

  forceLogout(session: ActiveSession): void {
    session.status = 'Expired';
    this.loginEvents.unshift({ user: session.user, event: 'Force logout by administrator', device: session.device, ip: session.ip, result: 'Blocked', time: 'Just now' });
    this.persist();
    this.audit.record('Login Sessions', 'Force Logout', `${session.user} was logged out from ${session.device}.`, 'Warning', '/login-sessions');
    this.showActivity(`${session.user} was logged out from ${session.device}.`);
  }

  trustDevice(session: ActiveSession): void {
    session.trusted = true;
    this.loginEvents.unshift({ user: session.user, event: 'Device trusted', device: session.device, ip: session.ip, result: 'Success', time: 'Just now' });
    this.persist();
    this.audit.record('Login Sessions', 'Trust Device', `${session.device} trusted for ${session.user}.`, 'Info', '/login-sessions');
    this.showActivity(`${session.device} trusted for ${session.user}.`);
  }

  blockSession(session: ActiveSession): void {
    session.status = 'Blocked';
    session.trusted = false;
    this.loginEvents.unshift({ user: session.user, event: 'IP blocked', device: session.device, ip: session.ip, result: 'Blocked', time: 'Just now' });
    this.persist();
    this.audit.record('Login Sessions', 'Block IP', `${session.ip} blocked for ${session.user}.`, 'Critical', '/login-sessions');
    this.showActivity(`${session.ip} blocked for suspicious activity.`);
  }

  revokeAllSessions(): void {
    const affectedSessions = this.sessions.filter((session) => session.status === 'Active' || session.status === 'Idle');
    if (!affectedSessions.length) {
      this.showActivity('No active sessions to revoke.');
      return;
    }

    affectedSessions.forEach((session) => {
      session.status = 'Expired';
      this.loginEvents.unshift({
        user: session.user,
        event: 'Session revoked by administrator',
        device: session.device,
        ip: session.ip,
        result: 'Blocked',
        time: 'Just now'
      });
    });
    this.persist();
    this.audit.record(
      'Login Sessions',
      'Revoke All Sessions',
      `${affectedSessions.length} active or idle sessions revoked by administrator.`,
      'Critical',
      '/login-sessions'
    );
    this.showActivity(`${affectedSessions.length} sessions revoked.`);
  }

  viewFullLog(session: ActiveSession): void {
    this.historySearchTerm = session.user;
    this.showActivity(`Login history filtered for ${session.user}.`);
  }

  savePolicy(): void {
    this.persist();
    this.audit.record('Login Sessions', 'Policy Saved', `Session timeout ${this.sessionTimeout} minutes, max duration ${this.maxSessionDurationHours} hours, failed login cap ${this.maxFailedAttempts}, MFA ${this.requireMfa ? 'required' : 'optional'}, trusted devices ${this.rememberTrustedDevices ? 'enabled' : 'disabled'}.`, 'Info', '/login-sessions');
    this.showActivity(`Session policy saved: ${this.sessionTimeout} min timeout, ${this.maxFailedAttempts} failed attempts.`);
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }

  getDeviceIcon(device: string): string {
    return device.toLowerCase().includes('iphone') ? 'fa-mobile-screen-button' : 'fa-desktop';
  }

  getStatusClass(status: SessionStatus): string {
    return `status-${status.toLowerCase()}`;
  }

  getResultClass(result: LoginEvent['result']): string {
    return result === 'Success' ? 'ls-success' : 'ls-blocked';
  }

  private persist(): void {
    this.storage.set(this.storageKey, {
      sessions: this.sessions,
      loginEvents: this.loginEvents,
      sessionTimeout: this.sessionTimeout,
      maxFailedAttempts: this.maxFailedAttempts,
      maxSessionDurationHours: this.maxSessionDurationHours,
      rememberTrustedDevices: this.rememberTrustedDevices,
      requireMfa: this.requireMfa
    });
  }

  private normalizeSession(session: Partial<ActiveSession>): ActiveSession {
    return {
      id: session.id || this.storage.createId('sess'),
      user: session.user || 'Unknown User',
      role: session.role || 'Unknown Role',
      company: session.company || 'Unknown Company',
      device: session.device || 'Unknown device',
      browser: session.browser || 'Unknown browser',
      ip: session.ip || '0.0.0.0',
      location: session.location || 'Unknown',
      lastActive: session.lastActive || 'Unknown',
      status: session.status || 'Active',
      trusted: session.trusted ?? false,
      mfaVerified: session.mfaVerified ?? session.trusted ?? false
    };
  }

  private showActivity(message: string): void {
    this.activityMessage = message;
    setTimeout(() => this.activityMessage = '', 4000);
  }
}
