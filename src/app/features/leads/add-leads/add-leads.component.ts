import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '../../../services/api.service';

@Component({ 
  selector: 'app-add-leads',
  standalone: false,
  templateUrl: './add-leads.component.html',
  styleUrls: ['./add-leads.component.css'],
})
export class AddLeadsComponent implements OnInit {
  leadForm!: FormGroup;
  loading = false;
  formTitle = 'New Lead';

  leadSources = ['Website', 'Email', 'Referral', 'Cold Call', 'Ad', 'Facebook Ads', 'LinkedIn Ads', 'IndiaMART', 'Other'];
  territories = ['North', 'South', 'East', 'West', 'Central'];
  sourceCategories = ['Website', 'Social', 'Marketplace', 'Referral', 'Other'];

  leadStatuses = [
    'New',
    'Contacted',
    'Qualified',
    'Unqualified',
    'Not Interested',
  ];

  constructor(
    public activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm(): void {
    this.leadForm = this.formBuilder.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.pattern(/^\+?[0-9\s\-()]+$/)],
      companyName: [''],
      jobTitle: [''],
      leadSource: ['Website'],
      sourceCategory: ['Website'],
      territory: [''],
      utmSource: [''],
      assignedTo: [''],
      leadStatus: ['New'],
      leadScore: [50],
    });
  }

  onSubmit(): void {
    if (this.leadForm.invalid) {
      this.markFormGroupTouched(this.leadForm);
      return;
    }

    this.loading = true;
    const leadData = this.leadForm.value;

    this.apiService.createLead(leadData).subscribe(
      (response) => {
        if (response.success) {
          this.activeModal.close(response.data);
        }
        this.loading = false;
      },
      (error) => {
        console.error('Error creating lead', error);
        this.loading = false;
      }
    );
  }

  markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.leadForm.get(fieldName);
    if (field?.hasError('required')) {
      return `${fieldName} is required`;
    }
    if (field?.hasError('minlength')) {
      return `${fieldName} must be at least 2 characters`;
    }
    if (field?.hasError('email')) {
      return 'Invalid email address';
    }
    if (field?.hasError('pattern')) {
      return 'Invalid phone number format';
    }
    return '';
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.leadForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }
}