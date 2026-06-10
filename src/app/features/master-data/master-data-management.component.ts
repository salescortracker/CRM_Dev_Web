import { Component, OnInit } from '@angular/core';
import { PlatformStorageService } from '../../services/platform-storage.service';
import { AuditLogService } from '../../services/audit-log.service';

type MasterType = 'Countries' | 'States' | 'Industries' | 'Currencies' | 'Departments';

interface MasterRecord {
  id: string;
  type: MasterType;
  name: string;
  code: string;
  usedIn: string;
  status: 'Active' | 'Inactive';
  updatedBy: string;
}

@Component({
  selector: 'app-master-data-management',
  standalone: false,
  templateUrl: './master-data-management.component.html',
  styleUrls: ['./master-data-management.component.css']
})
export class MasterDataManagementComponent implements OnInit {
  activityMessage = '';
  activeType: MasterType = 'Industries';
  selectedRecordId = 'industry-1';
  newName = '';
  newCode = '';

  records: MasterRecord[] = [
    { id: 'country-1', type: 'Countries', name: 'United States', code: 'US', usedIn: 'Tenant address, tax setup', status: 'Active', updatedBy: 'Admin User' },
    { id: 'country-2', type: 'Countries', name: 'India', code: 'IN', usedIn: 'Tenant address, lead territory', status: 'Active', updatedBy: 'Admin User' },
    { id: 'state-1', type: 'States', name: 'Colorado', code: 'CO', usedIn: 'ABC territory mapping', status: 'Active', updatedBy: 'Rohit Kumar' },
    { id: 'state-2', type: 'States', name: 'Karnataka', code: 'KA', usedIn: 'South sales region', status: 'Active', updatedBy: 'Rohit Kumar' },
    { id: 'industry-1', type: 'Industries', name: 'Software and SaaS', code: 'SAAS', usedIn: 'ABC Corp, TechStart Inc', status: 'Active', updatedBy: 'Admin User' },
    { id: 'industry-2', type: 'Industries', name: 'Healthcare', code: 'HLTH', usedIn: 'Healthcare CRM Migration', status: 'Active', updatedBy: 'Nate Hill' },
    { id: 'currency-1', type: 'Currencies', name: 'US Dollar', code: 'USD', usedIn: 'Deals, quotes, invoices', status: 'Active', updatedBy: 'Finance Admin' },
    { id: 'currency-2', type: 'Currencies', name: 'Indian Rupee', code: 'INR', usedIn: 'Tenant billing, reports', status: 'Active', updatedBy: 'Finance Admin' },
    { id: 'department-1', type: 'Departments', name: 'Sales', code: 'SALES', usedIn: 'Users, approval routing', status: 'Active', updatedBy: 'Admin User' },
    { id: 'department-2', type: 'Departments', name: 'Finance', code: 'FIN', usedIn: 'Invoice approvals', status: 'Active', updatedBy: 'Admin User' }
  ];

  constructor(
    private storage: PlatformStorageService,
    private audit: AuditLogService
  ) {}

  ngOnInit(): void {
    this.records = this.storage.get<MasterRecord[]>('master-data-records', this.records);
    this.selectedRecordId = this.filteredRecords[0]?.id || this.records[0]?.id || this.selectedRecordId;
  }

  get masterTypes(): MasterType[] {
    return ['Countries', 'States', 'Industries', 'Currencies', 'Departments'];
  }

  get filteredRecords(): MasterRecord[] {
    return this.records.filter((record) => record.type === this.activeType);
  }

  get selectedRecord(): MasterRecord {
    return this.records.find((record) => record.id === this.selectedRecordId) || this.filteredRecords[0] || this.records[0];
  }

  getTypeCount(type: MasterType): number {
    return this.records.filter((record) => record.type === type).length;
  }

  selectType(type: MasterType): void {
    this.activeType = type;
    this.selectedRecordId = this.filteredRecords[0]?.id || this.records[0].id;
  }

  addRecord(): void {
    if (!this.newName.trim() || !this.newCode.trim()) {
      this.showActivity('Add name and code before saving master data.');
      return;
    }
    const record: MasterRecord = {
      id: `${this.activeType.toLowerCase()}-${Date.now()}`,
      type: this.activeType,
      name: this.newName.trim(),
      code: this.newCode.trim().toUpperCase(),
      usedIn: 'New master value ready for CRM forms',
      status: 'Active',
      updatedBy: 'Admin User'
    };
    this.records.unshift(record);
    this.selectedRecordId = record.id;
    this.newName = '';
    this.newCode = '';
    this.persist();
    this.audit.record('Master Data', 'Value Added', `${record.name} (${record.code}) added to ${record.type}.`, 'Info', '/master-data');
    this.showActivity(`${record.name} added to ${record.type}.`);
  }

  toggleStatus(record: MasterRecord): void {
    record.status = record.status === 'Active' ? 'Inactive' : 'Active';
    record.updatedBy = 'Admin User';
    this.persist();
    this.audit.record('Master Data', 'Status Changed', `${record.name} marked ${record.status}.`, record.status === 'Inactive' ? 'Warning' : 'Info', '/master-data');
    this.showActivity(`${record.name} marked ${record.status}.`);
  }

  saveSelected(): void {
    this.selectedRecord.updatedBy = 'Admin User';
    this.persist();
    this.audit.record('Master Data', 'Value Updated', `${this.selectedRecord.name} updated in ${this.selectedRecord.type}.`, 'Info', '/master-data');
    this.showActivity(`${this.selectedRecord.name} updated.`);
  }

  private persist(): void {
    this.storage.set('master-data-records', this.records);
  }

  private showActivity(message: string): void {
    this.activityMessage = message;
    setTimeout(() => this.activityMessage = '', 4000);
  }
}
