import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuditLogService } from '../../../services/audit-log.service';
import { PlatformStorageService } from '../../../services/platform-storage.service';

interface SystemSettings {
  appName: string;
  appVersion: string;
  maxLoginAttempts: number;
  sessionTimeout: number;
  enableNotifications: boolean;
  enableTwoFactor: boolean;
}

@Component({
  selector: 'app-settings',
  standalone: false,
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  private readonly storageKey = 'system-settings';
  settings: SystemSettings = this.getDefaultSettings();

  constructor(
    private router: Router,
    private storage: PlatformStorageService,
    private audit: AuditLogService
  ) {}

  ngOnInit(): void {
    this.settings = this.storage.get<SystemSettings>(this.storageKey, this.getDefaultSettings());
  }

  saveSettings(): void {
    this.storage.set<SystemSettings>(this.storageKey, this.settings);
    this.audit.record(
      'Settings',
      'System Settings Saved',
      `${this.settings.appName} settings saved. Session timeout: ${this.settings.sessionTimeout} minutes.`,
      'Info',
      '/settings'
    );
    alert('Settings saved successfully!');
  }

  resetSettings(): void {
    this.settings = this.getDefaultSettings();
    this.storage.set<SystemSettings>(this.storageKey, this.settings);
    this.audit.record(
      'Settings',
      'System Settings Reset',
      'System settings reset to the production template defaults.',
      'Warning',
      '/settings'
    );
    alert('Settings reset to defaults!');
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  private getDefaultSettings(): SystemSettings {
    return {
      appName: 'CRM System',
      appVersion: '1.0.0',
      maxLoginAttempts: 5,
      sessionTimeout: 30,
      enableNotifications: true,
      enableTwoFactor: false
    };
  }
}
