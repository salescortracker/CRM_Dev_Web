import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class PlatformStorageService {
  private readonly prefix = 'crm-platform:';

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  get<T>(key: string, fallback: T): T {
    if (!this.canUseStorage()) {
      return fallback;
    }

    const raw = localStorage.getItem(this.prefixed(key));
    if (!raw) {
      return fallback;
    }

    try {
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  }

  set<T>(key: string, value: T): void {
    if (!this.canUseStorage()) {
      return;
    }

    localStorage.setItem(this.prefixed(key), JSON.stringify(value));
  }

  remove(key: string): void {
    if (!this.canUseStorage()) {
      return;
    }

    localStorage.removeItem(this.prefixed(key));
  }

  createId(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  }

  createSnapshot(label: string): string {
    const snapshotKey = this.createId('snapshot');
    if (!this.canUseStorage()) {
      return snapshotKey;
    }

    const snapshot: Record<string, string> = {};
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.prefix)) {
        snapshot[key] = localStorage.getItem(key) || '';
      }
    }

    this.set(`backup-snapshot:${snapshotKey}`, {
      label,
      createdAt: new Date().toISOString(),
      data: snapshot
    });

    return snapshotKey;
  }

  restoreSnapshot(snapshotKey: string): boolean {
    if (!this.canUseStorage()) {
      return false;
    }

    const snapshot = this.get<{ data: Record<string, string> } | null>(`backup-snapshot:${snapshotKey}`, null);
    if (!snapshot?.data) {
      return false;
    }

    Object.keys(localStorage)
      .filter((key) => key.startsWith(this.prefix) && !key.startsWith(`${this.prefix}backup-snapshot:`))
      .forEach((key) => localStorage.removeItem(key));

    Object.entries(snapshot.data).forEach(([key, value]) => localStorage.setItem(key, value));
    return true;
  }

  private prefixed(key: string): string {
    return `${this.prefix}${key}`;
  }

  private canUseStorage(): boolean {
    return isPlatformBrowser(this.platformId) && typeof localStorage !== 'undefined';
  }
}
