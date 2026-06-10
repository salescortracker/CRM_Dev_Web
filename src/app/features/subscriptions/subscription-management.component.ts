import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

type SubStatus = 'Active' | 'Trial' | 'Suspended' | 'Cancelled' | 'Past Due';
type PayStatus = 'Paid' | 'Pending' | 'Failed' | 'Refunded';
type SubPlan = 'Starter' | 'Premium' | 'Enterprise';

interface SubscriptionRecord {
  id: string;
  company: string;
  plan: SubPlan;
  status: SubStatus;
  paymentStatus: PayStatus;
  expiryDate: string;
  amount: number;
  seats: number;
  autoRenew: boolean;
  billing: 'Monthly' | 'Annual';
  startedDate: string;
}

@Component({
  selector: 'app-subscription-management',
  standalone: false,
  templateUrl: './subscription-management.component.html',
  styleUrls: ['./subscription-management.component.css']
})
export class SubscriptionManagementComponent implements OnInit {
  readonly planPrice: Record<SubPlan, number> = {
    Starter: 18000,
    Premium: 95000,
    Enterprise: 420000
  };

  readonly planOrder: SubPlan[] = ['Starter', 'Premium', 'Enterprise'];
  readonly statuses: Array<SubStatus | 'All'> = ['All', 'Active', 'Trial', 'Suspended', 'Cancelled', 'Past Due'];
  readonly paymentStatuses: PayStatus[] = ['Paid', 'Pending', 'Failed', 'Refunded'];
  readonly billings: Array<'Monthly' | 'Annual'> = ['Monthly', 'Annual'];

  readonly statusDot: Record<SubStatus, string> = {
    Active: 'dot-emerald',
    Trial: 'dot-blue',
    Suspended: 'dot-amber',
    Cancelled: 'dot-slate',
    'Past Due': 'dot-red'
  };

  readonly statusRing: Record<SubStatus, string> = {
    Active: 'ring-emerald',
    Trial: 'ring-blue',
    Suspended: 'ring-amber',
    Cancelled: 'ring-slate',
    'Past Due': 'ring-red'
  };

  readonly paymentRing: Record<PayStatus, string> = {
    Paid: 'ring-emerald',
    Pending: 'ring-amber',
    Failed: 'ring-red',
    Refunded: 'ring-slate'
  };

  readonly planGradient: Record<SubPlan, string> = {
    Starter: 'hero-starter',
    Premium: 'hero-premium',
    Enterprise: 'hero-enterprise'
  };

  subscriptions: SubscriptionRecord[] = [];
  selectedId: string | null = null;
  showForm = false;
  isEditing = false;
  search = '';
  statusFilter: SubStatus | 'All' = 'All';
  activityMessage = '';
  form: Partial<SubscriptionRecord> = this.blankForm();

  private activityTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.subscriptions = [
      { id: 'sub-001', company: 'Cyberdyne Systems', plan: 'Enterprise', status: 'Active', paymentStatus: 'Paid', expiryDate: '2026-12-01', amount: 420000, seats: 200, autoRenew: true, billing: 'Monthly', startedDate: '2024-01-15' },
      { id: 'sub-002', company: 'Acme Corporation', plan: 'Premium', status: 'Active', paymentStatus: 'Paid', expiryDate: '2026-09-15', amount: 95000, seats: 100, autoRenew: true, billing: 'Monthly', startedDate: '2024-06-10' },
      { id: 'sub-003', company: 'NovaStar Agency', plan: 'Starter', status: 'Trial', paymentStatus: 'Pending', expiryDate: '2026-07-01', amount: 0, seats: 20, autoRenew: false, billing: 'Monthly', startedDate: '2026-06-01' },
      { id: 'sub-004', company: 'FinEdge Capital', plan: 'Enterprise', status: 'Active', paymentStatus: 'Paid', expiryDate: '2027-01-20', amount: 4200000, seats: 250, autoRenew: true, billing: 'Annual', startedDate: '2023-11-05' },
      { id: 'sub-005', company: 'BrightPath Schools', plan: 'Premium', status: 'Past Due', paymentStatus: 'Failed', expiryDate: '2026-05-10', amount: 95000, seats: 75, autoRenew: false, billing: 'Monthly', startedDate: '2025-02-20' },
      { id: 'sub-006', company: 'MedCore Systems', plan: 'Enterprise', status: 'Active', paymentStatus: 'Paid', expiryDate: '2026-11-30', amount: 420000, seats: 150, autoRenew: true, billing: 'Monthly', startedDate: '2024-03-01' },
      { id: 'sub-007', company: 'Quantum Retail', plan: 'Starter', status: 'Trial', paymentStatus: 'Pending', expiryDate: '2026-06-25', amount: 0, seats: 20, autoRenew: false, billing: 'Monthly', startedDate: '2026-05-28' },
      { id: 'sub-008', company: 'Innovate Inc', plan: 'Premium', status: 'Suspended', paymentStatus: 'Failed', expiryDate: '2026-04-30', amount: 95000, seats: 50, autoRenew: false, billing: 'Monthly', startedDate: '2025-01-12' }
    ];
    this.selectedId = this.subscriptions[0]?.id || null;
  }

  get selectedSubscription(): SubscriptionRecord | null {
    return this.subscriptions.find((subscription) => subscription.id === this.selectedId) || null;
  }

  get activeCount(): number {
    return this.subscriptions.filter((subscription) => subscription.status === 'Active').length;
  }

  get trialCount(): number {
    return this.subscriptions.filter((subscription) => subscription.status === 'Trial').length;
  }

  get failedPayments(): number {
    return this.subscriptions.filter((subscription) => subscription.paymentStatus === 'Failed').length;
  }

  get recurringRevenue(): number {
    return this.subscriptions
      .filter((subscription) => subscription.status === 'Active')
      .reduce((sum, subscription) => sum + (subscription.billing === 'Annual' ? subscription.amount / 12 : subscription.amount), 0);
  }

  get filteredSubscriptions(): SubscriptionRecord[] {
    const query = this.search.trim().toLowerCase();
    return this.subscriptions.filter((subscription) => {
      const matchesSearch = !query || subscription.company.toLowerCase().includes(query);
      const matchesStatus = this.statusFilter === 'All' || subscription.status === this.statusFilter;
      return matchesSearch && matchesStatus;
    });
  }

  get cycleProgress(): number {
    const selected = this.selectedSubscription;
    if (!selected) {
      return 0;
    }

    const start = new Date(`${selected.startedDate}T00:00:00`).getTime();
    const end = new Date(`${selected.expiryDate}T00:00:00`).getTime();
    const now = Date.now();

    if (now <= start) {
      return 0;
    }
    if (now >= end) {
      return 100;
    }
    return Math.round(((now - start) / (end - start)) * 100);
  }

  get expiryDays(): number {
    const selected = this.selectedSubscription;
    if (!selected) {
      return 0;
    }
    const expiry = new Date(`${selected.expiryDate}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Math.ceil((expiry.getTime() - today.getTime()) / 86400000);
  }

  selectSubscription(subscription: SubscriptionRecord): void {
    this.selectedId = subscription.id;
    this.showForm = false;
  }

  openAddForm(): void {
    this.form = this.blankForm();
    this.isEditing = false;
    this.showForm = true;
  }

  openEditForm(subscription: SubscriptionRecord): void {
    this.form = { ...subscription };
    this.isEditing = true;
    this.showForm = true;
  }

  cancelForm(): void {
    this.showForm = false;
  }

  onPlanChange(plan: string): void {
    const nextPlan = plan as SubPlan;
    this.form.plan = nextPlan;
    this.form.amount = this.planPrice[nextPlan];
  }

  saveSubscription(): void {
    if (!this.form.company?.trim()) {
      this.showActivity('Company is required.');
      return;
    }

    if (this.isEditing && this.form.id) {
      const index = this.subscriptions.findIndex((subscription) => subscription.id === this.form.id);
      if (index >= 0) {
        this.subscriptions[index] = { ...this.subscriptions[index], ...this.form } as SubscriptionRecord;
        this.selectedId = this.subscriptions[index].id;
      }
      this.showActivity(`${this.form.company} updated.`);
    } else {
      const subscription: SubscriptionRecord = {
        id: `sub-${Date.now()}`,
        company: this.form.company,
        plan: this.form.plan || 'Starter',
        status: this.form.status || 'Trial',
        paymentStatus: this.form.paymentStatus || 'Pending',
        expiryDate: this.form.expiryDate || '2026-06-30',
        amount: this.form.amount || 0,
        seats: this.form.seats || 20,
        autoRenew: !!this.form.autoRenew,
        billing: this.form.billing || 'Monthly',
        startedDate: new Date().toISOString().slice(0, 10)
      };
      this.subscriptions.unshift(subscription);
      this.selectedId = subscription.id;
      this.showActivity(`${subscription.company} created.`);
    }

    this.showForm = false;
  }

  renew(subscription: SubscriptionRecord): void {
    subscription.status = 'Active';
    subscription.paymentStatus = 'Paid';
    subscription.autoRenew = true;
    subscription.expiryDate = '2027-05-26';
    this.showActivity(`${subscription.company} renewed until May 26, 2027.`);
  }

  upgrade(subscription: SubscriptionRecord): void {
    const nextPlan = this.planOrder[Math.min(this.planOrder.indexOf(subscription.plan) + 1, this.planOrder.length - 1)];
    if (nextPlan === subscription.plan) {
      this.showActivity(`${subscription.company} is already on the top plan.`);
      return;
    }
    subscription.plan = nextPlan;
    subscription.amount = this.planPrice[nextPlan];
    this.showActivity(`${subscription.company} upgraded to ${nextPlan}.`);
  }

  downgrade(subscription: SubscriptionRecord): void {
    const previousPlan = this.planOrder[Math.max(this.planOrder.indexOf(subscription.plan) - 1, 0)];
    if (previousPlan === subscription.plan) {
      this.showActivity(`${subscription.company} is already on the lowest plan.`);
      return;
    }
    subscription.plan = previousPlan;
    subscription.amount = this.planPrice[previousPlan];
    this.showActivity(`${subscription.company} downgraded to ${previousPlan}.`);
  }

  toggleAutoRenew(subscription: SubscriptionRecord): void {
    subscription.autoRenew = !subscription.autoRenew;
    this.showActivity(`Auto-renew ${subscription.autoRenew ? 'enabled' : 'disabled'} for ${subscription.company}.`);
  }

  suspend(subscription: SubscriptionRecord): void {
    subscription.status = 'Suspended';
    subscription.autoRenew = false;
    this.showActivity(`${subscription.company} suspended.`);
  }

  goToOrganizations(): void {
    this.router.navigate(['/organizations']);
  }

  goToPlans(): void {
    this.router.navigate(['/plans']);
  }

  formatMoney(value: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
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

  priceLabel(subscription: SubscriptionRecord): string {
    if (subscription.amount === 0) {
      return 'Trial';
    }
    return `${this.formatMoney(subscription.amount)}/${subscription.billing === 'Annual' ? 'yr' : 'mo'}`;
  }

  trackBySubscriptionId(_: number, subscription: SubscriptionRecord): string {
    return subscription.id;
  }

  private blankForm(): Partial<SubscriptionRecord> {
    return {
      company: '',
      plan: 'Starter',
      status: 'Trial',
      paymentStatus: 'Pending',
      expiryDate: '2026-06-30',
      amount: 18000,
      seats: 20,
      autoRenew: false,
      billing: 'Monthly'
    };
  }

  private showActivity(message: string): void {
    this.activityMessage = message;
    if (this.activityTimer) {
      clearTimeout(this.activityTimer);
    }
    this.activityTimer = setTimeout(() => this.activityMessage = '', 3000);
  }
}
