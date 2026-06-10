import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

type PlanStatus = 'Active' | 'Draft';
type PlanAccent = 'slate' | 'blue' | 'purple' | 'rose';
type FeatureKey =
  | 'Leads'
  | 'Contacts'
  | 'Companies'
  | 'Deals'
  | 'Pipeline'
  | 'Campaigns'
  | 'Reports'
  | 'API Access'
  | 'Automation'
  | 'Integrations';

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  status: PlanStatus;
  price: number;
  userLimit: number;
  storageLimit: number;
  apiLimit: number;
  accent: PlanAccent;
  features: Record<FeatureKey, boolean>;
}

@Component({
  selector: 'app-plan-management',
  standalone: false,
  templateUrl: './plan-management.component.html',
  styleUrls: ['./plan-management.component.css']
})
export class PlanManagementComponent implements OnInit {
  readonly allFeatures: FeatureKey[] = [
    'Leads',
    'Contacts',
    'Companies',
    'Deals',
    'Pipeline',
    'Campaigns',
    'Reports',
    'API Access',
    'Automation',
    'Integrations'
  ];

  readonly accentKeys: PlanAccent[] = ['slate', 'blue', 'purple', 'rose'];

  plans: SubscriptionPlan[] = [];
  formOpen = false;
  isEditing = false;
  activityMessage = '';
  form: SubscriptionPlan = this.blankPlan();

  private activityTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.plans = [
      {
        id: 'plan-004',
        name: 'Free Trial',
        description: '14-day evaluation with core CRM access.',
        status: 'Draft',
        price: 0,
        userLimit: 5,
        storageLimit: 2,
        apiLimit: 1000,
        accent: 'slate',
        features: this.buildFeatureMap(['Leads', 'Contacts', 'Deals'])
      },
      {
        id: 'plan-001',
        name: 'Starter',
        description: 'Essential CRM for small sales teams.',
        status: 'Active',
        price: 18000,
        userLimit: 20,
        storageLimit: 10,
        apiLimit: 10000,
        accent: 'blue',
        features: this.buildFeatureMap(['Leads', 'Contacts', 'Companies', 'Deals', 'Pipeline'])
      },
      {
        id: 'plan-002',
        name: 'Premium',
        description: 'Advanced tooling for growing teams.',
        status: 'Active',
        price: 95000,
        userLimit: 100,
        storageLimit: 100,
        apiLimit: 100000,
        accent: 'purple',
        features: this.buildFeatureMap(['Leads', 'Contacts', 'Companies', 'Deals', 'Pipeline', 'Campaigns', 'Reports', 'Automation'])
      },
      {
        id: 'plan-003',
        name: 'Enterprise',
        description: 'Unlimited scale with full integrations and API access.',
        status: 'Active',
        price: 420000,
        userLimit: -1,
        storageLimit: 500,
        apiLimit: -1,
        accent: 'rose',
        features: this.buildFeatureMap(this.allFeatures)
      }
    ];
  }

  get totalPlans(): number {
    return this.plans.length;
  }

  get activePlans(): number {
    return this.plans.filter((plan) => plan.status === 'Active').length;
  }

  get apiEnabledPlans(): number {
    return this.plans.filter((plan) => plan.features['API Access']).length;
  }

  get topStorage(): string {
    const topPlan = this.plans.reduce<SubscriptionPlan | null>((top, plan) => {
      return !top || plan.storageLimit > top.storageLimit ? plan : top;
    }, null);
    return topPlan ? `${topPlan.name} (${this.storageLabel(topPlan.storageLimit)})` : '-';
  }

  openAddForm(): void {
    this.form = this.blankPlan();
    this.isEditing = false;
    this.formOpen = true;
  }

  openEditForm(plan: SubscriptionPlan): void {
    this.form = { ...plan, features: { ...plan.features } };
    this.isEditing = true;
    this.formOpen = true;
  }

  closeForm(): void {
    this.formOpen = false;
  }

  savePlan(): void {
    if (!this.form.name.trim()) {
      this.showActivity('Plan name is required.');
      return;
    }

    if (this.isEditing && this.form.id) {
      const index = this.plans.findIndex((plan) => plan.id === this.form.id);
      if (index >= 0) {
        this.plans[index] = { ...this.form, features: { ...this.form.features } };
      }
      this.showActivity(`${this.form.name} updated.`);
    } else {
      this.plans.push({
        ...this.form,
        id: `plan-${Date.now()}`,
        features: { ...this.form.features }
      });
      this.showActivity(`${this.form.name} created.`);
    }

    this.formOpen = false;
  }

  toggleStatus(plan: SubscriptionPlan): void {
    plan.status = plan.status === 'Active' ? 'Draft' : 'Active';
    this.showActivity(`${plan.name} moved to ${plan.status}.`);
  }

  toggleFeature(plan: SubscriptionPlan, feature: FeatureKey): void {
    plan.features[feature] = !plan.features[feature];
  }

  toggleFormFeature(feature: FeatureKey): void {
    this.form.features[feature] = !this.form.features[feature];
  }

  enabledFeatures(plan: SubscriptionPlan): FeatureKey[] {
    return this.allFeatures.filter((feature) => plan.features[feature]);
  }

  isPopular(plan: SubscriptionPlan): boolean {
    return plan.name === 'Premium';
  }

  goToSubscriptions(): void {
    this.router.navigate(['/subscriptions']);
  }

  formatMoney(value: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  }

  priceLabel(plan: SubscriptionPlan): string {
    return plan.price === 0 ? 'Free' : `${this.formatMoney(plan.price)}/mo`;
  }

  limitLabel(value: number): string {
    return value === -1 ? 'Unlimited' : value.toLocaleString('en-IN');
  }

  storageLabel(value: number): string {
    return value >= 1000 ? `${value / 1000} TB` : `${value} GB`;
  }

  trackByPlanId(_: number, plan: SubscriptionPlan): string {
    return plan.id;
  }

  trackByFeature(_: number, feature: FeatureKey): string {
    return feature;
  }

  private blankPlan(): SubscriptionPlan {
    return {
      id: '',
      name: '',
      description: '',
      status: 'Draft',
      price: 0,
      userLimit: 10,
      storageLimit: 10,
      apiLimit: 10000,
      accent: 'blue',
      features: this.buildFeatureMap([])
    };
  }

  private buildFeatureMap(enabledFeatures: FeatureKey[]): Record<FeatureKey, boolean> {
    return this.allFeatures.reduce<Record<FeatureKey, boolean>>((features, feature) => {
      features[feature] = enabledFeatures.includes(feature);
      return features;
    }, {} as Record<FeatureKey, boolean>);
  }

  private showActivity(message: string): void {
    this.activityMessage = message;
    if (this.activityTimer) {
      clearTimeout(this.activityTimer);
    }
    this.activityTimer = setTimeout(() => this.activityMessage = '', 3000);
  }
}
