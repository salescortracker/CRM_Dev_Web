import { Component, OnInit } from '@angular/core';
import { AuditLogService } from '../../services/audit-log.service';
import { PlatformStorageService } from '../../services/platform-storage.service';

interface BusinessRule {
  name: string;
  description: string;
  enabled: boolean;
}

interface CrmConfigSettings {
  currency: string;
  timeZone: string;
  fiscalYearStart: string;
  brandName: string;
  primaryColor: string;
  dateFormat: string;
}

interface CrmConfigState {
  settings: CrmConfigSettings;
  rules: BusinessRule[];
}

@Component({
  selector: 'app-crm-config',
  standalone: false,
  templateUrl: './crm-config.component.html',
  styleUrls: ['./crm-config.component.css']
})
export class CrmConfigComponent implements OnInit {
  private readonly storageKey = 'crm-config';
  activityMessage = '';
  settings: CrmConfigSettings = {
    currency: 'INR',
    timeZone: 'Asia/Kolkata',
    fiscalYearStart: 'April',
    brandName: 'CRM System',
    primaryColor: '#c9143f',
    dateFormat: 'DD/MM/YYYY'
  };

  rules: BusinessRule[] = [
    { name: 'Discount Approval', description: 'Deal discount above 20% requires manager approval.', enabled: true },
    { name: 'Duplicate Lead Prevention', description: 'Block leads with matching email or phone.', enabled: true },
    { name: 'Required Contact Email', description: 'Contacts cannot be saved without email.', enabled: true },
    { name: 'Stale Lead Auto Close', description: 'Auto-close leads with no activity for 45 days.', enabled: false },
    { name: 'Mandatory Deal Products', description: 'Proposal stage requires at least one product line item.', enabled: true }
  ];

  currencies = ['INR', 'USD', 'EUR', 'GBP'];
  timeZones = ['Asia/Kolkata', 'America/Denver', 'America/New_York', 'Europe/London'];
  fiscalMonths = ['January', 'April', 'July', 'October'];

  constructor(
    private storage: PlatformStorageService,
    private audit: AuditLogService
  ) {}

  ngOnInit(): void {
    const saved = this.storage.get<CrmConfigState | null>(this.storageKey, null);
    if (saved) {
      this.settings = saved.settings;
      this.rules = saved.rules;
      return;
    }

    this.persist();
  }

  toggleRule(rule: BusinessRule): void {
    rule.enabled = !rule.enabled;
    this.persist();
    this.audit.record(
      'CRM Config',
      rule.enabled ? 'Business Rule Enabled' : 'Business Rule Disabled',
      `${rule.name} ${rule.enabled ? 'enabled' : 'disabled'}.`,
      rule.enabled ? 'Info' : 'Warning',
      '/crm-config'
    );
  }

  saveSettings(): void {
    this.persist();
    this.audit.record(
      'CRM Config',
      'Configuration Saved',
      `${this.settings.brandName} configuration saved using ${this.settings.currency}, ${this.settings.timeZone}, fiscal year from ${this.settings.fiscalYearStart}.`,
      'Info',
      '/crm-config'
    );
    this.activityMessage = 'CRM configuration saved.';
    setTimeout(() => this.activityMessage = '', 3500);
  }

  private persist(): void {
    this.storage.set<CrmConfigState>(this.storageKey, {
      settings: this.settings,
      rules: this.rules
    });
  }
}
