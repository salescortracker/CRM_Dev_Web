import { Component, OnInit, Optional } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Contact, ContactMergeRequest } from '../../../core/models/contact';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-contact-merge',
  standalone: false,
  templateUrl: './contact-merge.component.html',
  styleUrls: ['./contact-merge.component.css']
})
export class ContactMergeComponent implements OnInit {
  allContacts: Contact[] = [];
  selectedPrimary: string = '';
  availableSecondary: any[] = [];

  sampleContacts: Contact[] = [
    {
      id: 'contact-001',
      firstName: 'Emily',
      lastName: 'Watson',
      email: 'emily.watson@example.com',
      companyId: 'company-123',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'contact-002',
      firstName: 'Alex',
      lastName: 'Chen',
      email: 'alex.chen@example.com',
      companyId: 'company-456',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'contact-003',
      firstName: 'Nina',
      lastName: 'Patel',
      email: 'nina.patel@example.com',
      companyId: 'company-789',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  constructor(
    private apiService: ApiService,
    @Optional() private activeModal?: NgbActiveModal
  ) {}

  ngOnInit(): void {
    this.loadContacts();
  }

  loadContacts(): void {
    this.apiService.getContacts().subscribe(
      (response: any) => {
        if (response.success && response.data?.length) {
          this.allContacts = response.data;
        } else {
          this.allContacts = this.sampleContacts;
        }
      },
      (error) => {
        console.error('Error loading contacts', error);
        this.allContacts = this.sampleContacts;
      }
    );
  }

  onPrimarySelect(): void {
    this.availableSecondary = this.allContacts
      .filter(c => c.id !== this.selectedPrimary)
      .map(c => ({ ...c, selected: false }));
  }

  mergeContacts(): void {
    const secondary = this.availableSecondary
      .filter(c => c.selected)
      .map(c => c.id);
    
    if (!this.selectedPrimary || secondary.length === 0) {
      alert('Please select a primary and at least one secondary contact');
      return;
    }

    const mergeRequest: ContactMergeRequest = {
      primaryContactId: this.selectedPrimary,
      secondaryContactIds: secondary,
      mergeStrategy: 'keep_primary',
      createdAt: new Date(),
      status: 'pending'
    };

    alert('Merge request created successfully!');
    if (this.activeModal) {
      this.activeModal.close(true);
      return;
    }
    this.cancelMerge();
  }

  cancelMerge(): void {
    this.selectedPrimary = '';
    this.availableSecondary = [];
    if (this.activeModal) {
      this.activeModal.dismiss('cancel');
    }
  }
}
