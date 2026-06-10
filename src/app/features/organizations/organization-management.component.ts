import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

type OrgStatus = 'Active' | 'Trial' | 'Inactive' | 'Suspended';
type OrgPlan = 'Free' | 'Starter' | 'Professional' | 'Enterprise';

interface OrgFeature {
  key: string;
  label: string;
  icon: string;
}

interface TenantOrganization {
  id: string;
  name: string;
  domain: string;
  adminEmail: string;
  plan: OrgPlan;
  status: OrgStatus;
  users: number;
  maxUsers: number;
  storageUsedGB: number;
  maxStorageGB: number;
  monthlyRevenue: number;
  currency: string;
  renewalDate: string;
  createdDate: string;
  brandingColor: string;
  industry: string;
  country: string;
  features: Record<string, boolean>;
}

@Component({
  selector: 'app-organization-management',
  standalone: false,
  templateUrl: './organization-management.component.html',
  styleUrls: ['./organization-management.component.css']
})
export class OrganizationManagementComponent implements OnInit {
  readonly allFeatures: OrgFeature[] = [
    { key: 'leads', label: 'Leads', icon: 'fa-user-plus' },
    { key: 'contacts', label: 'Contacts', icon: 'fa-address-book' },
    { key: 'deals', label: 'Deals', icon: 'fa-handshake' },
    { key: 'campaigns', label: 'Campaigns', icon: 'fa-bullhorn' },
    { key: 'reports', label: 'Reports', icon: 'fa-chart-line' },
    { key: 'apiAccess', label: 'API Access', icon: 'fa-code' },
    { key: 'emailSync', label: 'Email Integration', icon: 'fa-envelope' },
    { key: 'automations', label: 'Automations', icon: 'fa-bolt' }
  ];

  readonly plans: OrgPlan[] = ['Free', 'Starter', 'Professional', 'Enterprise'];
  readonly statuses: OrgStatus[] = ['Active', 'Trial', 'Inactive', 'Suspended'];

  readonly planMeta: Record<OrgPlan, { cls: string }> = {
    Free: { cls: 'plan-free' },
    Starter: { cls: 'plan-starter' },
    Professional: { cls: 'plan-pro' },
    Enterprise: { cls: 'plan-enterprise' }
  };

  readonly statusMeta: Record<OrgStatus, { cls: string; dot: string }> = {
    Active: { cls: 'status-active', dot: 'dot-emerald' },
    Trial: { cls: 'status-trial', dot: 'dot-blue' },
    Inactive: { cls: 'status-inactive', dot: 'dot-slate' },
    Suspended: { cls: 'status-suspended', dot: 'dot-red' }
  };

  organizations: TenantOrganization[] = [];
  selectedOrganization: TenantOrganization | null = null;
  showForm = false;
  isEditing = false;
  search = '';
  statusFilter: OrgStatus | 'All' = 'All';
  planFilter: OrgPlan | 'All' = 'All';
  activityMessage = '';

  form: Partial<TenantOrganization> & { features: Record<string, boolean> } = this.blankForm();

  private activityTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.organizations = [
      {
        id: 'org-001',
        name: 'Cyberdyne Systems',
        domain: 'cyberdyne.crm.local',
        adminEmail: 'sarah@cyberdyne.com',
        plan: 'Enterprise',
        status: 'Active',
        users: 142,
        maxUsers: 200,
        storageUsedGB: 18.4,
        maxStorageGB: 50,
        monthlyRevenue: 420000,
        currency: 'INR',
        renewalDate: '2026-12-01',
        createdDate: '2024-01-15',
        brandingColor: '#c9143f',
        industry: 'Technology',
        country: 'United States',
        features: this.buildFeatureMap(['leads', 'contacts', 'deals', 'campaigns', 'reports', 'apiAccess', 'emailSync', 'automations'])
      },
      {
        id: 'org-002',
        name: 'Acme Corporation',
        domain: 'acme.crm.local',
        adminEmail: 'admin@acme.com',
        plan: 'Professional',
        status: 'Active',
        users: 58,
        maxUsers: 100,
        storageUsedGB: 9.2,
        maxStorageGB: 25,
        monthlyRevenue: 180000,
        currency: 'INR',
        renewalDate: '2026-09-15',
        createdDate: '2024-06-10',
        brandingColor: '#3b82f6',
        industry: 'Trade',
        country: 'United Kingdom',
        features: this.buildFeatureMap(['leads', 'contacts', 'deals', 'reports', 'emailSync'])
      },
      {
        id: 'org-003',
        name: 'NovaStar Agency',
        domain: 'novastar.crm.local',
        adminEmail: 'hello@novastar.io',
        plan: 'Starter',
        status: 'Trial',
        users: 8,
        maxUsers: 20,
        storageUsedGB: 1.1,
        maxStorageGB: 5,
        monthlyRevenue: 0,
        currency: 'INR',
        renewalDate: '2026-07-01',
        createdDate: '2026-06-01',
        brandingColor: '#a855f7',
        industry: 'Marketing',
        country: 'Canada',
        features: this.buildFeatureMap(['leads', 'contacts'])
      },
      {
        id: 'org-004',
        name: 'FinEdge Capital',
        domain: 'finedge.crm.local',
        adminEmail: 'ops@finedge.com',
        plan: 'Enterprise',
        status: 'Active',
        users: 210,
        maxUsers: 250,
        storageUsedGB: 41,
        maxStorageGB: 100,
        monthlyRevenue: 890000,
        currency: 'INR',
        renewalDate: '2027-01-20',
        createdDate: '2023-11-05',
        brandingColor: '#10b981',
        industry: 'Finance',
        country: 'UAE',
        features: this.buildFeatureMap(['leads', 'contacts', 'deals', 'campaigns', 'reports', 'apiAccess', 'emailSync', 'automations'])
      },
      {
        id: 'org-005',
        name: 'BrightPath Schools',
        domain: 'brightpath.crm.local',
        adminEmail: 'admin@brightpath.edu',
        plan: 'Professional',
        status: 'Inactive',
        users: 31,
        maxUsers: 75,
        storageUsedGB: 3.8,
        maxStorageGB: 20,
        monthlyRevenue: 0,
        currency: 'INR',
        renewalDate: '2026-05-10',
        createdDate: '2025-02-20',
        brandingColor: '#f59e0b',
        industry: 'Education',
        country: 'Australia',
        features: this.buildFeatureMap(['leads', 'contacts', 'reports'])
      },
      {
        id: 'org-006',
        name: 'MedCore Systems',
        domain: 'medcore.crm.local',
        adminEmail: 'tech@medcore.health',
        plan: 'Enterprise',
        status: 'Suspended',
        users: 88,
        maxUsers: 150,
        storageUsedGB: 22,
        maxStorageGB: 50,
        monthlyRevenue: 550000,
        currency: 'INR',
        renewalDate: '2026-11-30',
        createdDate: '2024-03-01',
        brandingColor: '#0ea5e9',
        industry: 'Healthcare',
        country: 'Germany',
        features: this.buildFeatureMap(['leads', 'contacts', 'deals', 'reports', 'apiAccess', 'emailSync'])
      }
    ];

    this.selectedOrganization = this.organizations[0];
  }

  get totalTenants(): number {
    return this.organizations.length;
  }

  get activeTenants(): number {
    return this.organizations.filter((organization) => organization.status === 'Active').length;
  }

  get trialTenants(): number {
    return this.organizations.filter((organization) => organization.status === 'Trial').length;
  }

  get monthlyRevenue(): number {
    return this.organizations.reduce((sum, organization) => sum + organization.monthlyRevenue, 0);
  }

  get filteredOrganizations(): TenantOrganization[] {
    const query = this.search.trim().toLowerCase();
    return this.organizations.filter((organization) => {
      const matchesSearch = !query ||
        organization.name.toLowerCase().includes(query) ||
        organization.domain.toLowerCase().includes(query) ||
        organization.adminEmail.toLowerCase().includes(query);
      const matchesStatus = this.statusFilter === 'All' || organization.status === this.statusFilter;
      const matchesPlan = this.planFilter === 'All' || organization.plan === this.planFilter;
      return matchesSearch && matchesStatus && matchesPlan;
    });
  }

  get enabledFeatureCount(): number {
    if (!this.selectedOrganization) {
      return 0;
    }
    return Object.values(this.selectedOrganization.features).filter(Boolean).length;
  }

  get renewalDays(): number {
    if (!this.selectedOrganization) {
      return 0;
    }
    const renewalDate = new Date(`${this.selectedOrganization.renewalDate}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Math.ceil((renewalDate.getTime() - today.getTime()) / 86400000);
  }

  selectOrganization(organization: TenantOrganization): void {
    this.selectedOrganization = organization;
    this.showForm = false;
  }

  openAddForm(): void {
    this.form = this.blankForm();
    this.isEditing = false;
    this.showForm = true;
  }

  openEditForm(organization: TenantOrganization): void {
    this.form = { ...organization, features: { ...organization.features } };
    this.isEditing = true;
    this.showForm = true;
  }

  saveOrganization(): void {
    if (!this.form.name?.trim() || !this.form.domain?.trim()) {
      this.showActivity('Name and domain are required.');
      return;
    }

    if (this.isEditing && this.form.id) {
      const index = this.organizations.findIndex((organization) => organization.id === this.form.id);
      if (index >= 0) {
        this.organizations[index] = { ...this.organizations[index], ...this.form } as TenantOrganization;
        this.selectedOrganization = this.organizations[index];
      }
      this.showActivity(`${this.form.name} updated.`);
    } else {
      const organization: TenantOrganization = {
        id: `org-${Date.now()}`,
        name: this.form.name,
        domain: this.form.domain,
        adminEmail: this.form.adminEmail || '',
        plan: this.form.plan || 'Starter',
        status: this.form.status || 'Trial',
        users: 0,
        maxUsers: this.form.maxUsers || 20,
        storageUsedGB: 0,
        maxStorageGB: this.form.maxStorageGB || 5,
        monthlyRevenue: 0,
        currency: 'INR',
        renewalDate: this.form.renewalDate || '2026-06-30',
        createdDate: new Date().toISOString().slice(0, 10),
        brandingColor: this.form.brandingColor || '#c9143f',
        industry: this.form.industry || '',
        country: this.form.country || '',
        features: { ...this.form.features }
      };
      this.organizations.unshift(organization);
      this.selectedOrganization = organization;
      this.showActivity(`${organization.name} created.`);
    }

    this.showForm = false;
  }

  cancelForm(): void {
    this.showForm = false;
  }

  toggleTenant(organization: TenantOrganization): void {
    organization.status = organization.status === 'Active' ? 'Inactive' : 'Active';
    if (this.selectedOrganization?.id === organization.id) {
      this.selectedOrganization = organization;
    }
    this.showActivity(`${organization.name} is now ${organization.status}.`);
  }

  toggleFeature(key: string): void {
    if (!this.selectedOrganization) {
      return;
    }
    this.selectedOrganization.features = {
      ...this.selectedOrganization.features,
      [key]: !this.selectedOrganization.features[key]
    };
  }

  toggleFormFeature(key: string): void {
    this.form.features = {
      ...this.form.features,
      [key]: !this.form.features[key]
    };
  }

  openSubscriptions(): void {
    this.router.navigate(['/subscriptions']);
  }

  getStoragePercent(organization: TenantOrganization): number {
    return Math.min(100, Math.round((organization.storageUsedGB / organization.maxStorageGB) * 100));
  }

  getUserPercent(organization: TenantOrganization): number {
    return Math.min(100, Math.round((organization.users / organization.maxUsers) * 100));
  }

  getUsageClass(percent: number): string {
    if (percent >= 90) {
      return 'bar-red';
    }
    if (percent >= 70) {
      return 'bar-amber';
    }
    return 'bar-emerald';
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }

  formatMoney(value: number, currency = 'INR'): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0
    }).format(value);
  }

  formatDate(value: string): string {
    if (!value) {
      return '-';
    }
    return new Date(`${value}T00:00:00`).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  trackByOrganizationId(_: number, organization: TenantOrganization): string {
    return organization.id;
  }

  private blankForm(): Partial<TenantOrganization> & { features: Record<string, boolean> } {
    return {
      name: '',
      domain: '',
      adminEmail: '',
      plan: 'Starter',
      status: 'Trial',
      users: 0,
      maxUsers: 20,
      storageUsedGB: 0,
      maxStorageGB: 5,
      monthlyRevenue: 0,
      currency: 'INR',
      renewalDate: '2026-06-30',
      createdDate: '',
      brandingColor: '#c9143f',
      industry: '',
      country: '',
      features: this.buildFeatureMap(['leads', 'contacts', 'deals'])
    };
  }

  private buildFeatureMap(enabledFeatures: string[]): Record<string, boolean> {
    return this.allFeatures.reduce<Record<string, boolean>>((features, feature) => {
      features[feature.key] = enabledFeatures.includes(feature.key);
      return features;
    }, {});
  }

  private showActivity(message: string): void {
    this.activityMessage = message;
    if (this.activityTimer) {
      clearTimeout(this.activityTimer);
    }
    this.activityTimer = setTimeout(() => this.activityMessage = '', 3000);
  }
}
