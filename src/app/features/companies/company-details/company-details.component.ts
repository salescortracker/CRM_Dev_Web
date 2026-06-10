import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Company, Address, AccountActivity } from '../../../core/models/contact';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-company-details',
  standalone: false,
  templateUrl: './company-details.component.html',
  styleUrls: ['./company-details.component.css']
})
export class CompanyDetailsComponent implements OnInit {
  company: Company | null = null;
  activity: AccountActivity | null | undefined = null;

  metrics: Array<{ label: string; key: keyof AccountActivity }> = [
    { label: 'Total Interactions', key: 'totalInteractions' },
    { label: 'Emails Sent', key: 'emailsSent' },
    { label: 'Calls Made', key: 'callsMade' },
    { label: 'Meetings', key: 'meetingsScheduled' },
    { label: 'Tasks Completed', key: 'tasksCompleted' },
    { label: 'Open Tasks', key: 'openTasks' }
  ];


  sampleCompany: Company = {
    id: 'company-123',
    name: 'Acme Corporation',
    website: 'https://acme.example.com',
    industry: 'Technology',
    companySize: '51-200',
    annualRevenue: 12500000,
    phone: '+1 (555) 123-4567',
    email: 'info@acme.example.com',
    address: '123 Innovation Drive',
    city: 'Austin',
    state: 'TX',
    country: 'USA',
    zipCode: '78701',
    creditLimit: 500000,
    creditUsed: 180000,
    accountStatus: 'active',
    accountManager: 'Oliver Parker',
    activitySummary: {
      totalInteractions: 42,
      lastInteractionDate: new Date(),
      emailsSent: 22,
      callsMade: 8,
      meetingsScheduled: 4,
      tasksCompleted: 29,
      openTasks: 3,
      upcomingDeals: 2
    },
    createdAt: new Date(),
    updatedAt: new Date()
  };

  constructor(
    private apiService: ApiService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const companyId = this.route.snapshot.paramMap.get('id');
    if (companyId) {
      this.loadCompany(companyId);
    } else {
      this.company = this.sampleCompany;
      this.activity = this.sampleCompany.activitySummary || this.sampleCompany.activitySummary;
    }
  }

  loadCompany(companyId: string): void {
    this.apiService.getCompany(companyId).subscribe(
      (response: any) => {
        if (response.success && response.data) {
          this.company = response.data;
          this.activity = response.data.activitySummary || this.sampleCompany.activitySummary;
        } else {
          this.company = this.sampleCompany;
          this.activity = this.sampleCompany.activitySummary;
        }
      },
      (error) => {
        console.error('Error loading company', error);
        this.company = this.sampleCompany;
        this.activity = this.sampleCompany.activitySummary;
      }
    );
  }

  getStatusColor(status: Company['accountStatus']): string {
    const colors: Record<NonNullable<Company['accountStatus']>, string> = {
      active: 'success',
      inactive: 'secondary',
      suspended: 'danger'
    };
    return colors[status || 'inactive'] || 'secondary';
  }

  getCreditUsagePercent(): number {
    if (!this.company?.creditLimit) return 0;
    return (this.company.creditUsed || 0) / this.company.creditLimit * 100;
  }

  getCreditUsageColor(): string {
    const percent = this.getCreditUsagePercent();
    if (percent > 80) return 'bg-danger';
    if (percent > 60) return 'bg-warning';
    return 'bg-success';
  }

  getAvailableCredit(): number {
    if (!this.company) return 0;
    return (this.company.creditLimit || 0) - (this.company.creditUsed || 0);
  }

  editCompany(): void {
    if (this.company?.id) {
      this.router.navigate(['/companies', this.company.id, 'edit']);
    }
  }

  viewAll(): void {
    if (this.company?.id) {
      this.router.navigate(['/contacts'], {
        queryParams: {
          companyId: this.company.id,
          companyName: this.company.name
        }
      });
    }
  }

  addAddress(): void {
    alert('Add address dialog would open here');
  }

  editAddress(address: Address): void {
    alert(`Edit address: ${address.street}`);
  }

  deleteAddress(addressId: string | undefined): void {
    if (addressId) {
      alert('Address deleted');
    }
  }
}
