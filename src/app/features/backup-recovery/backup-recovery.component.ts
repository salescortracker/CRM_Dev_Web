import { Component, OnInit } from '@angular/core';
import { AuditLogService } from '../../services/audit-log.service';
import { PlatformStorageService } from '../../services/platform-storage.service';

type BackupStatus = 'Completed' | 'Running' | 'Failed' | 'Scheduled';

interface RestorePoint {
  id: string;
  name: string;
  tenant: string;
  createdAt: string;
  size: string;
  status: BackupStatus;
  location: string;
  reason: string;
  snapshotKey?: string;
}

interface BackupRecoveryState {
  backupFrequency: string;
  retentionDays: number;
  storageRegion: string;
  restorePoints: RestorePoint[];
  backupLogs: Array<{ time: string; event: string; result: string }>;
}

@Component({
  selector: 'app-backup-recovery',
  standalone: false,
  templateUrl: './backup-recovery.component.html',
  styleUrls: ['./backup-recovery.component.css']
})
export class BackupRecoveryComponent implements OnInit {
  private readonly storageKey = 'backup-recovery';
  activityMessage = '';
  backupFrequency = 'Daily';
  retentionDays = 30;
  storageRegion = 'US East';
  selectedRestoreId = 'restore-2';

  restorePoints: RestorePoint[] = [
    { id: 'restore-1', name: 'Nightly tenant backup', tenant: 'ABC Pvt Ltd', createdAt: 'Today, 2:00 AM', size: '18.4 GB', status: 'Completed', location: 'S3 / US East', reason: 'Automatic scheduled backup' },
    { id: 'restore-2', name: 'Before bulk lead import', tenant: 'Global Retail Group', createdAt: 'Yesterday, 5:30 PM', size: '24.1 GB', status: 'Completed', location: 'S3 / US East', reason: 'Manual restore point before importing 5,000 leads' },
    { id: 'restore-3', name: 'Subscription migration backup', tenant: 'TechStart Inc', createdAt: 'May 30, 2026', size: '11.7 GB', status: 'Completed', location: 'Azure Blob / Central US', reason: 'Plan upgrade and billing migration' },
    { id: 'restore-4', name: 'Weekly full backup', tenant: 'All Tenants', createdAt: 'Running now', size: '143 GB', status: 'Running', location: 'S3 / US East', reason: 'Weekly full platform backup' }
  ];

  backupLogs: Array<{ time: string; event: string; result: string }> = [
    { time: 'Today, 2:00 AM', event: 'ABC Pvt Ltd backup completed', result: 'Success' },
    { time: 'Yesterday, 5:30 PM', event: 'Manual restore point created before bulk import', result: 'Success' },
    { time: 'May 30, 2026', event: 'TechStart migration restore point created', result: 'Success' },
    { time: 'May 29, 2026', event: 'Old failed backup retried automatically', result: 'Recovered' }
  ];

  constructor(
    private storage: PlatformStorageService,
    private audit: AuditLogService
  ) {}

  ngOnInit(): void {
    const saved = this.storage.get<BackupRecoveryState | null>(this.storageKey, null);
    if (saved) {
      this.backupFrequency = saved.backupFrequency;
      this.retentionDays = saved.retentionDays;
      this.storageRegion = saved.storageRegion;
      this.restorePoints = saved.restorePoints;
      this.backupLogs = saved.backupLogs;
      this.selectedRestoreId = saved.restorePoints[0]?.id || this.selectedRestoreId;
      return;
    }

    this.persist();
  }

  get selectedRestore(): RestorePoint {
    return this.restorePoints.find((point) => point.id === this.selectedRestoreId) || this.restorePoints[0];
  }

  get completedCount(): number {
    return this.restorePoints.filter((point) => point.status === 'Completed').length;
  }

  get runningCount(): number {
    return this.restorePoints.filter((point) => point.status === 'Running').length;
  }

  createRestorePoint(): void {
    const snapshotKey = this.storage.createSnapshot('Manual CRM safety point');
    const restorePoint: RestorePoint = {
      id: this.storage.createId('restore'),
      name: 'Manual CRM safety point',
      tenant: 'All Tenants',
      createdAt: 'Just now',
      size: 'Local template snapshot',
      status: 'Completed',
      location: `${this.storageRegion} secure storage`,
      reason: 'Created before admin configuration change',
      snapshotKey
    };
    this.restorePoints.unshift(restorePoint);
    this.selectedRestoreId = restorePoint.id;
    this.backupLogs.unshift({ time: 'Just now', event: 'Manual CRM safety point created', result: 'Snapshot ready' });
    this.persist();
    this.audit.record(
      'Backup',
      'Restore Point Created',
      `${restorePoint.name} created for ${restorePoint.tenant}.`,
      'Info',
      '/backup-recovery'
    );
    this.showActivity('Manual restore point created.');
  }

  simulateRestore(): void {
    this.backupLogs.unshift({ time: 'Just now', event: `Restore simulation for ${this.selectedRestore.tenant}`, result: 'Passed' });
    this.persist();
    this.audit.record(
      'Backup',
      'Restore Simulation Run',
      `Restore simulation started for ${this.selectedRestore.tenant}.`,
      'Info',
      '/backup-recovery'
    );
    this.showActivity(`Restore simulation started for ${this.selectedRestore.tenant}.`);
  }

  restoreSnapshot(): void {
    if (!this.selectedRestore.snapshotKey) {
      this.showActivity('This restore point is a sample record. Create a manual restore point to restore template data.');
      return;
    }

    const restoreName = this.selectedRestore.name;
    const restoreTenant = this.selectedRestore.tenant;
    const snapshotKey = this.selectedRestore.snapshotKey;
    const confirmed = confirm(`Restore template state from ${restoreName}? Current local template changes will be replaced.`);
    if (!confirmed) {
      return;
    }

    const restored = this.storage.restoreSnapshot(snapshotKey);
    if (!restored) {
      this.showActivity('Snapshot could not be restored.');
      return;
    }

    const restoredState = this.storage.get<BackupRecoveryState | null>(this.storageKey, null);
    if (restoredState) {
      restoredState.backupLogs.unshift({ time: 'Just now', event: `Restored ${restoreName}`, result: 'Success' });
      this.backupFrequency = restoredState.backupFrequency;
      this.retentionDays = restoredState.retentionDays;
      this.storageRegion = restoredState.storageRegion;
      this.restorePoints = restoredState.restorePoints;
      this.backupLogs = restoredState.backupLogs;
      this.selectedRestoreId = restoredState.restorePoints[0]?.id || this.selectedRestoreId;
      this.storage.set<BackupRecoveryState>(this.storageKey, restoredState);
    }
    this.audit.record(
      'Backup',
      'Snapshot Restored',
      `${restoreName} restored for ${restoreTenant}.`,
      'Critical',
      '/backup-recovery'
    );
    this.showActivity(`${restoreName} restored.`);
  }

  saveSchedule(): void {
    this.persist();
    this.audit.record(
      'Backup',
      'Schedule Saved',
      `${this.backupFrequency} backups saved with ${this.retentionDays} day retention in ${this.storageRegion}.`,
      'Info',
      '/backup-recovery'
    );
    this.showActivity(`${this.backupFrequency} backup schedule saved with ${this.retentionDays} day retention.`);
  }

  private persist(): void {
    this.storage.set<BackupRecoveryState>(this.storageKey, {
      backupFrequency: this.backupFrequency,
      retentionDays: this.retentionDays,
      storageRegion: this.storageRegion,
      restorePoints: this.restorePoints,
      backupLogs: this.backupLogs.slice(0, 50)
    });
  }

  private showActivity(message: string): void {
    this.activityMessage = message;
    setTimeout(() => this.activityMessage = '', 4000);
  }
}
