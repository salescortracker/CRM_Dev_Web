import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '../../../services/api.service';
import { Contact } from '../../../core/models/contact';
import { AddContactComponent } from '../add-contact/add-contact.component';
import { ContactMergeComponent } from '../contact-merge/contact-merge.component';
import { AddDealsComponent } from '../../deals/add-deals.component';

@Component({
  selector: 'app-contact-list',
  standalone: false,
  templateUrl: './contact-list.component.html',
  styleUrls: ['./contact-list.component.css']
})
export class ContactListComponent implements OnInit {
contacts: Contact[] = [
    {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phoneMobile: '+1 555-123-4567',
      jobTitle: 'Manager',
      leadStatus: 'prospect',
      rating: 5,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '2',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com',
      phoneMobile: '+1 555-987-6543',
      jobTitle: 'Director',
      leadStatus: 'customer',
      rating: 4,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  loading = false;
  currentPage = 1;
  pageSize = 20;
  totalRecords = 2;
  searchQuery = '';
  selectedContacts: Set<string> = new Set();
  selectedContact: Contact | null = null;
  activityMessage = '';
  editMode = false;
  routeContactId: string | null = null;
  companyContextId = '';
  companyContextName = '';
  contactEvents: Record<string, Array<{ icon: string; title: string; detail: string; time: string }>> = {};
  activeContactAction: 'schedule' | null = null;
  contactMeetingProvider = 'Zoom';
  contactMeetingPurpose = 'Follow-up';
  contactMeetingDate = '';
  contactMeetingTime = '';
  contactMeetingReminder = '30 minutes before';
  contactMeetingNotes = '';
  showContactUpcomingMeetings = false;
  contactMeetingProviders = [
    { name: 'Phone Call', icon: 'fa-phone', connected: true },
    { name: 'Google Meet', icon: 'fa-video', connected: true },
    { name: 'Zoom', icon: 'fa-video', connected: true },
    { name: 'Microsoft Teams', icon: 'fa-users', connected: false },
    { name: 'In-person Meeting', icon: 'fa-location-dot', connected: true },
  ];
  contactMeetingPurposes = ['Follow-up', 'Discovery call', 'Product demo', 'Account check-in', 'Renewal discussion'];
  contactMeetingReminders = ['At meeting time', '15 minutes before', '30 minutes before', '1 hour before', '1 day before'];
  private addModalOpenedFromRoute = false;
  private editModalOpenedFromRoute = false;

  filters = {
    leadStatus: '',
    leadSource: '',
    rating: '',
  };

  constructor(
    private apiService: ApiService,
    private router: Router,
    private route: ActivatedRoute,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.routeContactId = this.route.snapshot.paramMap.get('id');
    this.editMode = this.route.snapshot.routeConfig?.path === 'contacts/:id/edit';
    this.companyContextId = this.route.snapshot.queryParamMap.get('companyId') || '';
    this.companyContextName = this.route.snapshot.queryParamMap.get('companyName') || '';
    this.loadContacts();
    if (this.route.snapshot.data['openNewContactModal']) {
      setTimeout(() => this.openNewContactModal(true));
    }
  }

  // loadContacts(): void {
  //   this.loading = true;
  //   // Simulated loading for demo
  //   setTimeout(() => {
  //     this.loading = false;
  //   }, 500);
  // }

  loadContacts(): void {
    this.loading = true;
    const requestFilters = {
      ...this.filters,
      searchQuery: this.searchQuery,
      companyId: this.companyContextId,
    };

    this.apiService
      .getContacts(this.currentPage, this.pageSize, requestFilters)
      .subscribe(
        (response) => {
          if (response.success) {
            this.contacts = response.data;
            this.totalRecords = response.pagination?.total || 0;
            this.selectContactFromRoute();
            if (this.companyContextId) {
              this.showActivity(`Showing contacts for ${this.companyContextName || 'selected company'}.`);
            }
          }
          this.loading = false;
        },
        (error) => {
          console.error('Error loading contacts', error);
          this.loading = false;
        }
      );
  }

  openNewContactModal(fromRoute = false): void {
    if (fromRoute && this.addModalOpenedFromRoute) {
      return;
    }
    this.addModalOpenedFromRoute = fromRoute;

    const modalRef = this.modalService.open(AddContactComponent, {
      size: 'lg',
      backdrop: 'static',
      keyboard: false,
    });

    modalRef.result.then(
      (result) => {
        if (result) {
          this.loadContacts();
          this.selectedContact = result;
          this.showActivity(`${result.firstName} ${result.lastName} was created as a contact.`);
          if (fromRoute) {
            this.router.navigate(['/contacts', result.id]);
          }
        }
      },
      (reason) => {
        if (fromRoute) {
          this.router.navigate(['/contacts']);
        }
      }
    );
  }

  openEditContactModal(contact: Contact): void {
    const modalRef = this.modalService.open(AddContactComponent, {
      size: 'lg',
      backdrop: 'static',
      keyboard: false,
    });
    modalRef.componentInstance.contactToEdit = contact;

    modalRef.result.then(
      (result) => {
        if (result) {
          this.selectedContact = result;
          this.loadContacts();
          this.showActivity(`${result.firstName} ${result.lastName} was updated.`);
        }
      },
      () => {}
    );
  }

  openMergeContactsModal(): void {
    const modalRef = this.modalService.open(ContactMergeComponent, {
      size: 'lg',
      backdrop: 'static',
      keyboard: false,
    });

    modalRef.result.then(
      (result) => {
        if (result) {
          alert('Contacts merged successfully!');
          this.loadContacts();
        }
      },
      (reason) => {
        // Modal dismissed
      }
    );
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadContacts();
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadContacts();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadContacts();
  }

  editContact(id: string): void {
    const contact = this.contacts.find((item) => item.id === id);
    if (contact) {
      this.selectedContact = contact;
      this.editMode = true;
      this.router.navigate(['/contacts', id, 'edit']);
      this.openEditContactModal(contact);
      this.showActivity(`Edit mode opened for ${contact.firstName} ${contact.lastName}.`);
    }
  }

  clearCompanyContext(): void {
    this.companyContextId = '';
    this.companyContextName = '';
    this.router.navigate(['/contacts']);
    this.loadContacts();
  }

  viewContact(id: string): void {
    const contact = this.contacts.find((item) => item.id === id);
    if (contact) {
      this.selectedContact = contact;
      this.editMode = false;
      this.router.navigate(['/contacts', id]);
      this.showActivity(`Opened contact profile for ${contact.firstName} ${contact.lastName}.`);
    }
  }

  closeContactProfile(): void {
    this.selectedContact = null;
    this.editMode = false;
    this.routeContactId = null;
    this.router.navigate(['/contacts']);
    this.showActivity('Closed contact profile and returned to the contacts list.');
  }

  isSelectedContact(contact: Contact): boolean {
    return this.selectedContact?.id === contact.id;
  }

  createDealForContact(contact: Contact): void {
    const modalRef = this.modalService.open(AddDealsComponent, {
      size: 'lg',
      backdrop: 'static',
      keyboard: false,
    });
    modalRef.componentInstance.preselectedContactId = contact.id;
    modalRef.componentInstance.preselectedCompanyId = contact.companyId || '';

    modalRef.result.then(
      (result) => {
        if (result) {
          this.showActivity(`Deal ${result.name} created for ${contact.firstName} ${contact.lastName}.`);
          this.router.navigate(['/deals']);
        }
      },
      () => {}
    );
  }

  openCompany(contact: Contact): void {
    const companyId = contact.companyId || '1';
    if (!contact.companyId) {
      this.showActivity(`${contact.firstName} ${contact.lastName} is not linked to a company, opening demo account Acme Corp.`);
    }
    this.router.navigate(['/companies', companyId, 'details']);
  }

  logActivity(contact: Contact): void {
    this.addContactEvent(contact.id, {
      icon: 'fa-list',
      title: 'Activity logged',
      detail: `New CRM activity captured for ${contact.firstName} ${contact.lastName}.`,
      time: 'Just now',
    });
    this.showActivity(`Activity logged for ${contact.firstName} ${contact.lastName}.`);
  }

  createTask(contact: Contact): void {
    this.addContactEvent(contact.id, {
      icon: 'fa-tasks',
      title: 'Follow-up task created',
      detail: `Sales follow-up task assigned for ${contact.firstName} ${contact.lastName}.`,
      time: 'Just now',
    });
    this.showActivity(`Follow-up task created for ${contact.firstName} ${contact.lastName}.`);
  }

  scheduleMeeting(contact: Contact): void {
    this.selectedContact = contact;
    this.activeContactAction = 'schedule';
    this.showContactUpcomingMeetings = false;
    const next = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
    this.contactMeetingDate = next.toISOString().slice(0, 10);
    this.contactMeetingTime = '11:00';
    this.contactMeetingProvider = 'Zoom';
    this.contactMeetingPurpose = contact.leadStatus === 'customer' ? 'Account check-in' : 'Discovery call';
    this.contactMeetingReminder = '30 minutes before';
    this.contactMeetingNotes = `Discuss next step with ${contact.firstName} ${contact.lastName} at ${this.getContactCompanyName(contact)}.`;
  }

  saveContactMeeting(): void {
    if (!this.selectedContact || !this.contactMeetingDate || !this.contactMeetingTime) {
      this.showActivity('Choose a meeting date and time.');
      return;
    }

    const provider = this.contactMeetingProviders.find((item) => item.name === this.contactMeetingProvider);
    if (!provider?.connected) {
      this.showActivity(`${this.contactMeetingProvider} is not connected for this tenant. Choose another option.`);
      return;
    }

    const date = new Date(`${this.contactMeetingDate}T${this.contactMeetingTime}`);
    this.addContactEvent(this.selectedContact.id, {
      icon: 'fa-calendar-check',
      title: `${this.contactMeetingPurpose} scheduled`,
      detail: `${this.contactMeetingProvider} meeting on ${date.toLocaleString()}. ${this.contactMeetingNotes}`,
      time: 'Just now',
    });
    this.showActivity(`${this.contactMeetingPurpose} scheduled for ${this.selectedContact.firstName} ${this.selectedContact.lastName} via ${this.contactMeetingProvider}.`);
    this.activeContactAction = null;
  }

  get selectedContactUpcomingMeetings(): Array<{ title: string; date: Date; provider: string; purpose: string; owner: string }> {
    if (!this.selectedContact) {
      return [];
    }

    return [
      {
        title: `${this.selectedContact.firstName} ${this.selectedContact.lastName} account check-in`,
        date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        provider: 'Zoom',
        purpose: 'Account check-in',
        owner: this.getContactOwner(this.selectedContact)
      }
    ];
  }

  // deleteContact(id: string): void {
  //   if (confirm('Are you sure you want to delete this contact?')) {
  //     this.contacts = this.contacts.filter((c) => c.id !== id);
  //   }
  // }

  deleteContact(id: string): void {
    if (confirm('Are you sure you want to delete this contact?')) {
      this.apiService.deleteContact(id).subscribe(
        (response) => {
          if (response.success) {
            this.loadContacts();
            if (this.selectedContact?.id === id) {
              this.selectedContact = null;
            }
          }
        },
        (error) => console.error('Error deleting contact', error)
      );
    }
  }

  selectContact(id: string, event: any): void {
    if (event.target.checked) {
      this.selectedContacts.add(id);
    } else {
      this.selectedContacts.delete(id);
    }
  }

  selectAll(event: any): void {
    if (event.target.checked) {
      this.contacts.forEach((contact) => this.selectedContacts.add(contact.id));
    } else {
      this.selectedContacts.clear();
    }
  }

  getTotalPages(): number {
    return Math.ceil(this.totalRecords / this.pageSize);
  }

  getContactCompanyName(contact: Contact): string {
    if (contact.company?.name) {
      return contact.company.name;
    }

    const companyMap: Record<string, string> = {
      '1': 'Acme Corp',
      '2': 'TechStart Inc',
    };
    return companyMap[contact.companyId || ''] || 'Not linked yet';
  }

  getContactOwner(contact: Contact): string {
    return contact.createdBy
      ? `${contact.createdBy.firstName} ${contact.createdBy.lastName}`
      : contact.leadStatus === 'customer'
        ? 'Account Management Team'
        : 'Sales Development Team';
  }

  getLifecycleStage(contact: Contact): string {
    if (contact.tags?.includes('Converted Lead')) {
      return 'Converted Lead';
    }
    if (contact.leadStatus === 'customer') {
      return 'Customer';
    }
    if (contact.leadStatus === 'prospect' || contact.leadStatus === 'Prospect') {
      return 'Prospect';
    }
    return contact.leadStatus || 'Active Contact';
  }

  getRecentActivity(contact: Contact): Array<{ icon: string; title: string; detail: string; time: string }> {
    return [
      ...(this.contactEvents[contact.id] || []),
      {
        icon: 'fa-user-check',
        title: 'Profile reviewed',
        detail: `${contact.firstName} ${contact.lastName} is ready for account follow-up.`,
        time: 'Today',
      },
      {
        icon: 'fa-envelope',
        title: 'Email touchpoint',
        detail: `Sent introduction and product overview to ${contact.email}.`,
        time: 'Yesterday',
      },
      {
        icon: 'fa-phone',
        title: 'Discovery call',
        detail: `Captured need, budget fit, and next decision step.`,
        time: '3 days ago',
      },
    ];
  }

  getRelatedDeals(contact: Contact): Array<{ name: string; stage: string; value: number }> {
    return [
      {
        name: `${this.getContactCompanyName(contact)} Starter Opportunity`,
        stage: contact.leadStatus === 'customer' ? 'Proposal' : 'Qualification',
        value: (contact.rating || 3) * 8500,
      },
      {
        name: 'Expansion Discussion',
        stage: 'Discovery',
        value: (contact.rating || 3) * 4200,
      },
    ];
  }

  private selectContactFromRoute(): void {
    const contactId = this.routeContactId;
    if (!contactId) {
      return;
    }

    const contact = this.contacts.find((item) => item.id === contactId);
    if (contact) {
      this.selectedContact = contact;
      this.showActivity(this.editMode ? `Edit mode opened for ${contact.firstName} ${contact.lastName}.` : `Opened contact profile for ${contact.firstName} ${contact.lastName}.`);
      if (this.editMode && !this.editModalOpenedFromRoute) {
        this.editModalOpenedFromRoute = true;
        setTimeout(() => this.openEditContactModal(contact));
      }
    }
  }

  private showActivity(message: string): void {
    this.activityMessage = message;
    setTimeout(() => {
      this.activityMessage = '';
    }, 4500);
  }

  private addContactEvent(contactId: string, event: { icon: string; title: string; detail: string; time: string }): void {
    this.contactEvents[contactId] = [event, ...(this.contactEvents[contactId] || [])];
  }
}
