import { Component, Input, OnInit, Optional } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Deal } from '../../core/models/contact';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-deals',
  standalone: false,
  templateUrl: './add-deals.component.html',
  styleUrls: ['./add-deals.component.css']
})
export class AddDealsComponent implements OnInit {
  @Input() preselectedContactId = '';
  @Input() preselectedCompanyId = '';
  @Input() existingDeal: Deal | null = null;

  dealForm!: FormGroup;
  loading = false;
  companies: any[] = [];
  contacts: any[] = [];
  formTitle = 'New Deal';

  dealStages = ['Prospecting', 'Qualification', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'];
  dealStatuses = [
    { label: 'Open', value: 'open' },
    { label: 'Negotiation', value: 'negotiation' },
    { label: 'Proposal Sent', value: 'proposal_sent' },
    { label: 'Quote Pending', value: 'quote_pending' },
    { label: 'Closed Won', value: 'closed_won' },
    { label: 'Closed Lost', value: 'closed_lost' }
  ];
  currencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'INR'];

  constructor(
    @Optional() public activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private apiService: ApiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadCompanies();
    this.loadContacts();

    if (this.existingDeal) {
      this.formTitle = 'Edit Deal';
      this.dealForm.patchValue({
        name: this.existingDeal.name,
        companyId: this.existingDeal.companyId,
        contactId: this.existingDeal.contactId || '',
        amount: this.existingDeal.amount,
        currency: this.existingDeal.currency || 'USD',
        stage: this.existingDeal.stage || 'Prospecting',
        probability: this.existingDeal.probability || 50,
        expectedCloseDate: this.formatDateInput(this.existingDeal.expectedCloseDate),
        status: this.existingDeal.status || 'open',
        description: this.existingDeal.description || ''
      });
      return;
    }

    this.dealForm.patchValue({
      contactId: this.preselectedContactId,
      companyId: this.preselectedCompanyId,
    });
  }

  initializeForm(): void {
    this.dealForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      companyId: ['', Validators.required],
      contactId: [''],
      amount: ['', [Validators.required, Validators.min(0)]],
      currency: ['USD'],
      stage: ['Prospecting'],
      probability: [50],
      expectedCloseDate: [''],
      status: ['open'],
      description: ['']
    });
  }

  loadCompanies(): void {
    this.apiService.getCompanies().subscribe(
      response => {
        if (response.success) {
          this.companies = response.data;
        }
      },
      error => console.error('Error loading companies', error)
    );
  }

  loadContacts(): void {
    this.apiService.getContacts().subscribe(
      response => {
        if (response.success) {
          this.contacts = response.data;
        }
      },
      error => console.error('Error loading contacts', error)
    );
  }

  onSubmit(): void {
    if (this.dealForm.invalid) {
      this.markFormGroupTouched(this.dealForm);
      return;
    }

    this.loading = true;
    const dealData = {
      ...this.dealForm.value,
      expectedCloseDate: this.dealForm.value.expectedCloseDate ? new Date(this.dealForm.value.expectedCloseDate) : undefined
    };
    const request$ = this.existingDeal
      ? this.apiService.updateDeal(this.existingDeal.id, dealData)
      : this.apiService.createDeal(dealData);

    request$.subscribe(
      response => {
        if (response.success) {
          if (this.activeModal) {
            this.activeModal.close(response.data);
          } else {
            this.router.navigate(['/deals', response.data.id]);
          }
        }
        this.loading = false;
      },
      error => {
        console.error('Error saving deal', error);
        this.loading = false;
      }
    );
  }

  markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.dealForm.get(fieldName);
    if (field?.hasError('required')) {
      return `${fieldName} is required`;
    }
    if (field?.hasError('minlength')) {
      return `${fieldName} must be at least 3 characters`;
    }
    if (field?.hasError('min')) {
      return 'Amount must be greater than 0';
    }
    return '';
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.dealForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  closeModal(): void {
    if (this.activeModal) {
      this.activeModal.dismiss();
      return;
    }
    this.router.navigate(['/deals']);
  }

  private formatDateInput(date: Date | string | undefined): string {
    if (!date) {
      return '';
    }
    return new Date(date).toISOString().slice(0, 10);
  }
}
