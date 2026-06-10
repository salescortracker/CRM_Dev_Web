import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Contact } from '../../../core/models/contact';
// import { Router } from '@angular/router';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-add-contact',
  standalone: false,
  templateUrl: './add-contact.component.html',
  styleUrls: ['./add-contact.component.css']
})
export class AddContactComponent implements OnInit {
  @Input() contactToEdit: Contact | null = null;
  contactForm!: FormGroup;
  loading = false;
  companies: any[] = [];
  formTitle = 'New Contact';

  leadSources = [
    'Website',
    'Referral',
    'Cold Call',
    'Trade Show',
    'Partnership',
    'Other',
  ];

  leadStatuses = ['Prospect', 'Customer', 'Lost'];

  constructor(
    public activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadCompanies();
    if (this.contactToEdit) {
      this.formTitle = 'Edit Contact';
      this.contactForm.patchValue(this.contactToEdit);
    }
  }

  initializeForm(): void {
    this.contactForm = this.formBuilder.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phoneMobile: ['', Validators.pattern(/^\+?[0-9\s\-()]+$/)],
      phoneOffice: ['', Validators.pattern(/^\+?[0-9\s\-()]+$/)],
      jobTitle: [''],
      department: [''],
      companyId: [''],
      leadSource: ['Website'],
      leadStatus: ['Prospect'],
      rating: [3],
      address: [''],
      city: [''],
      state: [''],
      country: [''],
      zipCode: [''],
    });
  }

  loadCompanies(): void {
    this.apiService.getCompanies().subscribe(
      (response) => {
        if (response.success) {
          this.companies = response.data;
        }
      },
      (error) => console.error('Error loading companies', error)
    );
  }

  onSubmit(): void {
    if (this.contactForm.invalid) {
      this.markFormGroupTouched(this.contactForm);
      return;
    }

    this.loading = true;
    const contactData = this.contactForm.value;

    const request = this.contactToEdit
      ? this.apiService.updateContact(this.contactToEdit.id, contactData)
      : this.apiService.createContact(contactData);

    request.subscribe(
      (response) => {
        if (response.success) {
          this.activeModal.close(response.data);
        }
        this.loading = false;
      },
      (error) => {
        console.error('Error creating contact', error);
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
    const field = this.contactForm.get(fieldName);
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
    const field = this.contactForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }
}

//   saveContact() {
//     console.log('Saved Contact:', this.contact);
//     alert('Contact saved successfully');
//     this.router.navigate(['/contacts']);
//   }

//   resetForm() {
//     this.contact = {
//       id: '',
//       firstName: '',
//       lastName: '',
//       email: '',
//       createdAt: new Date(),
//       updatedAt: new Date()
//     };
//   }

//   goBack() {
//     this.router.navigate(['/contacts']);
//   }
// }
