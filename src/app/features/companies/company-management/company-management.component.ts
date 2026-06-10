import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Address, Company } from '../../../core/models/contact';
import { ApiService } from '../../../services/api.service';
import { AddDealsComponent } from '../../deals/add-deals.component';

@Component({
  selector: 'app-company-management',
  standalone: false,
  templateUrl: './company-management.component.html',
  styleUrls: ['./company-management.component.css']
})
export class CompanyManagementComponent implements OnInit {
  companies: Company[] = [];
  selectedCompany: Company | null = null;
  company: Partial<Company> & { tagsText?: string } = {};
  editingCompanyId?: string;
  loading = false;
  searchQuery = '';
  activityMessage = '';
  companyEvents: Record<string, Array<{ icon: string; title: string; detail: string; time: string }>> = {};

  industries = ['Technology', 'Software', 'Retail', 'Healthcare', 'Education', 'Manufacturing', 'Finance'];
  statuses: Array<NonNullable<Company['accountStatus']>> = ['active', 'inactive', 'suspended'];

  constructor(
    private apiService: ApiService,
    private router: Router,
    private route: ActivatedRoute,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.loadCompanies();
  }

  loadCompanies(): void {
    this.loading = true;
    this.apiService.getCompanies().subscribe(
      (response) => {
        if (response.success) {
          this.companies = response.data;
          this.selectCompanyFromRoute();
        }
        this.loading = false;
      },
      (error) => {
        console.error('Error loading companies', error);
        this.loading = false;
      }
    );
  }

  get filteredCompanies(): Company[] {
    const query = this.searchQuery.trim().toLowerCase();
    if (!query) {
      return this.companies;
    }

    return this.companies.filter((company) =>
      [company.name, company.industry, company.city, company.country, company.accountManager, ...(company.tags || [])]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(query)
    );
  }

  selectCompany(company: Company): void {
    this.selectedCompany = company;
    this.editingCompanyId = undefined;
    this.router.navigate(['/companies', company.id]);
    this.showActivity(`Opened account profile for ${company.name}.`);
  }

  closeCompanyProfile(): void {
    this.selectedCompany = null;
    this.editingCompanyId = undefined;
    this.router.navigate(['/companies']);
  }

  saveCompany(): void {
    const payload = this.buildCompanyPayload();
    this.apiService.createCompany(payload).subscribe((response) => {
      if (response.success) {
        this.companies = [response.data, ...this.companies];
        this.selectedCompany = response.data;
        this.resetForm();
        this.showActivity(`${response.data.name} was added as a company account.`);
      }
    });
  }

  editCompany(company: Company): void {
    this.selectedCompany = company;
    this.editingCompanyId = company.id;
    this.company = {
      ...company,
      tagsText: company.tags?.join(', ') || ''
    };
    this.showActivity(`Editing ${company.name}.`);
  }

  updateCompany(): void {
    if (!this.editingCompanyId) {
      return;
    }

    const payload = this.buildCompanyPayload();
    this.apiService.updateCompany(this.editingCompanyId, payload).subscribe((response) => {
      if (response.success) {
        this.companies = this.companies.map((company) => company.id === response.data.id ? response.data : company);
        this.selectedCompany = response.data;
        this.resetForm();
        this.editingCompanyId = undefined;
        this.showActivity(`${response.data.name} was updated.`);
      }
    });
  }

  deleteCompany(id: string): void {
    if (!confirm('Delete this company account?')) {
      return;
    }

    this.apiService.deleteCompany(id).subscribe((response) => {
      if (response.success) {
        this.companies = this.companies.filter((company) => company.id !== id);
        if (this.selectedCompany?.id === id) {
          this.selectedCompany = null;
        }
        this.showActivity('Company account deleted.');
      }
    });
  }

  resetForm(): void {
    this.company = {};
    this.editingCompanyId = undefined;
  }

  viewContacts(company: Company): void {
    this.router.navigate(['/contacts'], {
      queryParams: {
        companyId: company.id,
        companyName: company.name
      }
    });
  }

  createDeal(company: Company): void {
    const modalRef = this.modalService.open(AddDealsComponent, {
      size: 'lg',
      backdrop: 'static',
      keyboard: false,
    });
    modalRef.componentInstance.preselectedCompanyId = company.id;

    modalRef.result.then(
      (result) => {
        if (result) {
          this.addCompanyEvent(company.id, {
            icon: 'fa-handshake',
            title: 'Deal created',
            detail: `${result.name} was created for ${company.name}.`,
            time: 'Just now',
          });
          this.router.navigate(['/deals', result.id]);
        }
      },
      () => {}
    );
  }

  addAddress(company: Company): void {
    const address: Address = {
      id: `addr-${Date.now()}`,
      type: 'shipping',
      street: '250 New Expansion Blvd',
      city: company.city || 'New York',
      state: company.state || 'NY',
      country: company.country || 'USA',
      zipCode: company.zipCode || '10001',
      isDefault: false,
    };

    const updatedCompany = {
      ...company,
      addresses: [...(company.addresses || []), address],
      updatedAt: new Date(),
    };
    this.apiService.updateCompany(company.id, updatedCompany).subscribe((response) => {
      if (response.success) {
        this.companies = this.companies.map((item) => item.id === company.id ? response.data : item);
        this.selectedCompany = response.data;
        this.showActivity(`Address added to ${company.name}.`);
      }
    });
  }

  logActivity(company: Company): void {
    this.addCompanyEvent(company.id, {
      icon: 'fa-list',
      title: 'Account activity logged',
      detail: `New account activity captured for ${company.name}.`,
      time: 'Just now',
    });
    this.showActivity(`Activity logged for ${company.name}.`);
  }

  getCreditUsagePercent(company: Company): number {
    if (!company.creditLimit) {
      return 0;
    }
    return Math.min(100, ((company.creditUsed || 0) / company.creditLimit) * 100);
  }

  getCreditUsageColor(company: Company): string {
    const percent = this.getCreditUsagePercent(company);
    if (percent > 80) {
      return 'bg-danger';
    }
    if (percent > 60) {
      return 'bg-warning';
    }
    return 'bg-success';
  }

  getAvailableCredit(company: Company): number {
    return (company.creditLimit || 0) - (company.creditUsed || 0);
  }

  getCompanyContactsCount(company: Company): number {
    const map: Record<string, number> = {
      '1': 4,
      '2': 3,
      '3': 6,
      '4': 2,
      '5': 2,
    };
    return map[company.id] || 1;
  }

  getOpenDealsValue(company: Company): number {
    const base = company.annualRevenue || 1000000;
    return Math.round(base * 0.08);
  }

  getCompanyTimeline(company: Company): Array<{ icon: string; title: string; detail: string; time: string }> {
    return [
      ...(this.companyEvents[company.id] || []),
      {
        icon: 'fa-phone',
        title: 'Account review call',
        detail: `${company.accountManager || 'Account owner'} reviewed account health and open opportunities.`,
        time: 'Today',
      },
      {
        icon: 'fa-envelope',
        title: 'Renewal email sent',
        detail: `Commercial summary sent to ${company.email || 'the account team'}.`,
        time: 'Yesterday',
      },
      {
        icon: 'fa-handshake',
        title: 'Opportunity identified',
        detail: `${company.name} has ${company.activitySummary?.upcomingDeals || 1} upcoming deal opportunities.`,
        time: 'This week',
      },
    ];
  }

  private buildCompanyPayload(): any {
    return {
      ...this.company,
      tags: (this.company.tagsText || '').split(',').map((tag) => tag.trim()).filter(Boolean),
      accountStatus: this.company.accountStatus || 'active',
      creditLimit: Number(this.company.creditLimit) || 100000,
      creditUsed: Number(this.company.creditUsed) || 0,
    };
  }

  private selectCompanyFromRoute(): void {
    const companyId = this.route.snapshot.paramMap.get('id');
    if (!companyId) {
      return;
    }

    const company = this.companies.find((item) => item.id === companyId);
    if (company) {
      this.selectedCompany = company;
      if (this.route.snapshot.routeConfig?.path === 'companies/:id/edit') {
        this.editCompany(company);
      }
    }
  }

  private addCompanyEvent(companyId: string, event: { icon: string; title: string; detail: string; time: string }): void {
    this.companyEvents[companyId] = [event, ...(this.companyEvents[companyId] || [])];
  }

  private showActivity(message: string): void {
    this.activityMessage = message;
    setTimeout(() => {
      this.activityMessage = '';
    }, 4500);
  }
}
