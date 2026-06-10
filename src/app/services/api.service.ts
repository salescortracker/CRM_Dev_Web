import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { ApiResponse, Company, Contact, Lead} from '../core/models/contact';
@Injectable({
  providedIn: 'root'
})
export class ApiService {
// For Bolt.new, use empty baseUrl (simulated responses)
  private baseUrl = '';
  private mockCompanies: Company[] = [
    {
      id: '1',
      name: 'Acme Corporation',
      website: 'https://acmecorp.com',
      industry: 'Technology',
      companySize: '500-1000',
      annualRevenue: 50000000,
      phone: '+1 555-123-4567',
      email: 'contact@acmecorp.com',
      city: 'New York',
      state: 'NY',
      country: 'USA',
      creditLimit: 500000,
      creditUsed: 320000,
      accountStatus: 'active',
      accountManager: 'Rohit Kumar',
      tags: ['Enterprise', 'Strategic', 'Expansion'],
      addresses: [
        { id: 'addr-1', type: 'billing', street: '123 Business Ave', city: 'New York', state: 'NY', zipCode: '10001', country: 'USA', isDefault: true },
        { id: 'addr-2', type: 'shipping', street: '456 Commerce St', city: 'Boston', state: 'MA', zipCode: '02101', country: 'USA', isDefault: false },
      ],
      activitySummary: {
        totalInteractions: 24,
        lastInteractionDate: new Date(),
        emailsSent: 12,
        callsMade: 5,
        meetingsScheduled: 3,
        tasksCompleted: 18,
        openTasks: 2,
        upcomingDeals: 3
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '2',
      name: 'TechStart Inc',
      website: 'https://techstart.example.com',
      industry: 'Software',
      companySize: '51-200',
      annualRevenue: 12000000,
      phone: '+1 555-222-8800',
      email: 'hello@techstart.example.com',
      city: 'San Francisco',
      state: 'CA',
      country: 'USA',
      creditLimit: 180000,
      creditUsed: 65000,
      accountStatus: 'active',
      accountManager: 'Priya Nair',
      tags: ['SaaS', 'Growth', 'Warm Account'],
      addresses: [
        { id: 'addr-3', type: 'billing', street: '88 Market Street', city: 'San Francisco', state: 'CA', zipCode: '94105', country: 'USA', isDefault: true },
      ],
      activitySummary: {
        totalInteractions: 16,
        lastInteractionDate: new Date(),
        emailsSent: 9,
        callsMade: 4,
        meetingsScheduled: 2,
        tasksCompleted: 10,
        openTasks: 1,
        upcomingDeals: 2
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '3',
      name: 'Global Retail Group',
      website: 'https://globalretail.example.com',
      industry: 'Retail',
      companySize: '1000+',
      annualRevenue: 98000000,
      phone: '+1 555-777-1200',
      email: 'accounts@globalretail.example.com',
      city: 'Chicago',
      state: 'IL',
      country: 'USA',
      creditLimit: 750000,
      creditUsed: 610000,
      accountStatus: 'active',
      accountManager: 'Anita Patel',
      tags: ['Retail', 'High Value', 'Credit Review'],
      addresses: [
        { id: 'addr-4', type: 'billing', street: '900 Lake Shore Dr', city: 'Chicago', state: 'IL', zipCode: '60611', country: 'USA', isDefault: true },
      ],
      activitySummary: {
        totalInteractions: 38,
        lastInteractionDate: new Date(),
        emailsSent: 20,
        callsMade: 11,
        meetingsScheduled: 5,
        tasksCompleted: 26,
        openTasks: 4,
        upcomingDeals: 4
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '4',
      name: 'HealthSync Labs',
      website: 'https://healthsync.example.com',
      industry: 'Healthcare',
      companySize: '201-500',
      annualRevenue: 26000000,
      phone: '+1 555-330-9110',
      email: 'ops@healthsync.example.com',
      city: 'Denver',
      state: 'CO',
      country: 'USA',
      creditLimit: 240000,
      creditUsed: 88000,
      accountStatus: 'active',
      accountManager: 'Deepak Sharma',
      tags: ['Healthcare', 'Compliance', 'Implementation'],
      addresses: [
        { id: 'addr-5', type: 'billing', street: '42 Research Parkway', city: 'Denver', state: 'CO', zipCode: '80202', country: 'USA', isDefault: true },
      ],
      activitySummary: {
        totalInteractions: 19,
        lastInteractionDate: new Date(),
        emailsSent: 8,
        callsMade: 6,
        meetingsScheduled: 3,
        tasksCompleted: 13,
        openTasks: 2,
        upcomingDeals: 1
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '5',
      name: 'BrightPath Education',
      website: 'https://brightpath.example.com',
      industry: 'Education',
      companySize: '51-200',
      annualRevenue: 8400000,
      phone: '+1 555-440-6022',
      email: 'admin@brightpath.example.com',
      city: 'Austin',
      state: 'TX',
      country: 'USA',
      creditLimit: 90000,
      creditUsed: 21000,
      accountStatus: 'inactive',
      accountManager: 'Mohit Singh',
      tags: ['Education', 'Renewal', 'Nurture'],
      addresses: [
        { id: 'addr-6', type: 'billing', street: '12 Learning Lane', city: 'Austin', state: 'TX', zipCode: '78701', country: 'USA', isDefault: true },
      ],
      activitySummary: {
        totalInteractions: 9,
        lastInteractionDate: new Date(),
        emailsSent: 5,
        callsMade: 2,
        meetingsScheduled: 1,
        tasksCompleted: 7,
        openTasks: 1,
        upcomingDeals: 1
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  private mockLeads: Lead[] = [
    {
      id: '1',
      firstName: 'John',
      lastName: 'Smith',
      email: 'john@example.com',
      phone: '+1 555-1234',
      companyName: 'ABC Corp',
      jobTitle: 'Director',
      leadSource: 'Website',
      leadStatus: 'Contacted',
      leadScore: 85,
      scoreReason: 'High engagement, perfect fit',
      lastContactDate: new Date(),
      contactCount: 2,
      emailOpens: 5,
      websiteVisits: 12,
      nextFollowupDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
      updatedAt: new Date(),
      territory: 'North',
      utmSource: 'Google Ads',
      utmCampaign: 'Spring Push',
      utmMedium: 'CPC',
      sourceCategory: 'Website',
      leadQueueStatus: 'assigned',
      assignedTo: 'Rohit Kumar',
      assignedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      id: '2',
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@example.com',
      phone: '+1 555-5678',
      companyName: 'XYZ Inc',
      jobTitle: 'Manager',
      leadSource: 'Facebook Ads',
      leadStatus: 'New',
      leadScore: 92,
      scoreReason: 'Excellent fit, hot lead',
      lastContactDate: undefined,
      contactCount: 0,
      emailOpens: 0,
      websiteVisits: 3,
      nextFollowupDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
      updatedAt: new Date(),
      territory: 'South',
      utmSource: 'Facebook',
      utmCampaign: 'Summer Sale',
      utmMedium: 'Social',
      sourceCategory: 'Social',
      leadQueueStatus: 'unassigned',
    },
    {
      id: '3',
      firstName: 'Bob',
      lastName: 'Jones',
      email: 'bob@example.com',
      phone: '+1 555-9999',
      companyName: 'Tech Start',
      jobTitle: 'Owner',
      leadSource: 'IndiaMART',
      leadStatus: 'Unqualified',
      leadScore: 45,
      scoreReason: 'Budget constraints',
      lastContactDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      contactCount: 1,
      emailOpens: 0,
      websiteVisits: 1,
      nextFollowupDate: undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
      territory: 'East',
      utmSource: 'IndiaMART',
      utmCampaign: 'B2B Lead',
      utmMedium: 'Marketplace',
      sourceCategory: 'Marketplace',
      leadQueueStatus: 'unassigned',
    },
  ];

  private mockContacts: Contact[] = [
    {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phoneMobile: '+1 555-123-4567',
      jobTitle: 'Manager',
      companyId: '1',
      company: { id: '1', name: 'Acme Corp', createdAt: new Date(), updatedAt: new Date() },
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
      companyId: '2',
      company: { id: '2', name: 'TechStart Inc', createdAt: new Date(), updatedAt: new Date() },
      leadStatus: 'customer',
      rating: 4,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  private mockDeals: any[] = [
    {
      id: '1',
      name: 'Enterprise Software License',
      amount: 50000,
      stage: 'Proposal',
      status: 'proposal_sent',
      probability: 75,
      companyId: '1',
      contactId: '1',
      company: { id: '1', name: 'Acme Corporation' },
      ownerId: 'user-1',
      owner: { id: 'user-1', email: 'rohit.kumar@example.com', firstName: 'Rohit', lastName: 'Kumar', role: 'user' },
      description: 'Annual enterprise license renewal with product expansion.',
      lineItems: [
        { id: 'li-1', productName: 'Software License', quantity: 10, unitPrice: 5000, discount: 0, tax: 0, total: 50000 }
      ],
      revenueSplits: [
        { id: 'rs-1', dealId: '1', userId: 'user-1', user: { id: 'user-1', email: 'rohit.kumar@example.com', firstName: 'Rohit', lastName: 'Kumar', role: 'user' }, splitPercentage: 100, splitAmount: 50000, commission: 2500 }
      ],
      quoteId: 'quote-001',
      invoiceId: undefined,
      paymentStatus: undefined,
      negotiationNotes: [
        { id: 'nn-101', dealId: '1', note: 'Procurement asked for final quote terms.', negotiationPoint: 'Renewal pricing', proposedBy: 'Rohit Kumar', respondedBy: 'Acme Procurement', response: 'Need final approval packet', status: 'proposed', createdAt: new Date() }
      ],
      tags: ['Renewal', 'Enterprise'],
      expectedCloseDate: new Date(new Date().setDate(new Date().getDate() + 21)),
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '2',
      name: 'Consulting Services',
      amount: 25000,
      stage: 'Negotiation',
      status: 'negotiation',
      probability: 60,
      companyId: '2',
      contactId: '2',
      company: { id: '2', name: 'TechStart Inc' },
      ownerId: 'user-2',
      owner: { id: 'user-2', email: 'jane.doe@example.com', firstName: 'Jane', lastName: 'Doe', role: 'user' },
      description: 'Implementation consulting package for TechStart expansion.',
      lineItems: [
        { id: 'li-2', productName: 'Consulting Hours', quantity: 100, unitPrice: 250, discount: 0, tax: 0, total: 25000 }
      ],
      revenueSplits: [
        { id: 'rs-2', dealId: '2', userId: 'user-2', user: { id: 'user-2', email: 'jane.doe@example.com', firstName: 'Jane', lastName: 'Doe', role: 'user' }, splitPercentage: 60, splitAmount: 15000, commission: 1500 },
        { id: 'rs-3', dealId: '2', userId: 'user-3', user: { id: 'user-3', email: 'john.smith@example.com', firstName: 'John', lastName: 'Smith', role: 'user' }, splitPercentage: 40, splitAmount: 10000, commission: 1000 }
      ],
      quoteId: undefined,
      invoiceId: undefined,
      paymentStatus: undefined,
      negotiationNotes: [
        { id: 'nn-1', dealId: '2', note: 'Initial proposal at $25k', negotiationPoint: 'Scope and pricing', proposedBy: 'Jane Doe', respondedBy: undefined, status: 'proposed', proposalDetails: 'Initial proposal at $25k', createdAt: new Date() }
      ],
      tags: ['Implementation', 'Services'],
      expectedCloseDate: new Date(new Date().setDate(new Date().getDate() + 14)),
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '3',
      name: 'Retail Analytics Rollout',
      amount: 82000,
      stage: 'Prospecting',
      status: 'open',
      probability: 25,
      companyId: '3',
      company: { id: '3', name: 'Global Retail Group' },
      ownerId: 'user-4',
      owner: { id: 'user-4', email: 'maria.lopez@example.com', firstName: 'Maria', lastName: 'Lopez', role: 'user' },
      description: 'Early-stage analytics platform discussion across 40 store locations.',
      lineItems: [],
      revenueSplits: [],
      quoteId: undefined,
      invoiceId: undefined,
      paymentStatus: undefined,
      negotiationNotes: [],
      tags: ['Analytics', 'Discovery'],
      expectedCloseDate: new Date(new Date().setDate(new Date().getDate() + 45)),
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '4',
      name: 'Healthcare CRM Migration',
      amount: 64000,
      stage: 'Qualification',
      status: 'open',
      probability: 45,
      companyId: '4',
      company: { id: '4', name: 'HealthSync Labs' },
      ownerId: 'user-5',
      owner: { id: 'user-5', email: 'nate.hill@example.com', firstName: 'Nate', lastName: 'Hill', role: 'user' },
      description: 'Qualification call completed; compliance and data migration scope under review.',
      lineItems: [
        { id: 'li-4a', productName: 'Data Migration', quantity: 1, unitPrice: 28000, discount: 5, tax: 3, total: 28742 },
        { id: 'li-4b', productName: 'CRM Configuration', quantity: 1, unitPrice: 36000, discount: 0, tax: 3, total: 37080 }
      ],
      revenueSplits: [
        { id: 'rs-4', dealId: '4', userId: 'user-5', user: { id: 'user-5', email: 'nate.hill@example.com', firstName: 'Nate', lastName: 'Hill', role: 'user' }, splitPercentage: 100, splitAmount: 64000, commission: 3200 }
      ],
      quoteId: undefined,
      invoiceId: undefined,
      paymentStatus: undefined,
      negotiationNotes: [
        { id: 'nn-4', dealId: '4', note: 'Client wants security review before proposal.', negotiationPoint: 'Compliance review', proposedBy: 'Nate Hill', status: 'proposed', createdAt: new Date() }
      ],
      tags: ['Healthcare', 'Migration'],
      expectedCloseDate: new Date(new Date().setDate(new Date().getDate() + 30)),
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '5',
      name: 'Education Portal Subscription',
      amount: 38000,
      stage: 'Proposal',
      status: 'quote_pending',
      probability: 70,
      companyId: '5',
      company: { id: '5', name: 'BrightPath Education' },
      ownerId: 'user-6',
      owner: { id: 'user-6', email: 'emma.davis@example.com', firstName: 'Emma', lastName: 'Davis', role: 'user' },
      description: 'Proposal prepared for annual student engagement portal subscription.',
      lineItems: [
        { id: 'li-5a', productName: 'Portal Subscription', quantity: 1, unitPrice: 40000, discount: 8, tax: 3, total: 37904 }
      ],
      revenueSplits: [
        { id: 'rs-5', dealId: '5', userId: 'user-6', user: { id: 'user-6', email: 'emma.davis@example.com', firstName: 'Emma', lastName: 'Davis', role: 'user' }, splitPercentage: 100, splitAmount: 38000, commission: 1900 }
      ],
      quoteId: 'quote-005',
      invoiceId: undefined,
      paymentStatus: undefined,
      negotiationNotes: [
        { id: 'nn-5', dealId: '5', note: 'Finance requested quote validity extension to 30 days.', negotiationPoint: 'Quote validity', proposedBy: 'Emma Davis', respondedBy: 'Finance Director', response: 'Extend quote window', status: 'counter_proposed', createdAt: new Date() }
      ],
      tags: ['Education', 'Subscription'],
      expectedCloseDate: new Date(new Date().setDate(new Date().getDate() + 18)),
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '6',
      name: 'Manufacturing Support Retainer',
      amount: 72000,
      stage: 'Negotiation',
      status: 'negotiation',
      probability: 80,
      companyId: '1',
      company: { id: '1', name: 'Acme Corporation' },
      ownerId: 'user-1',
      owner: { id: 'user-1', email: 'rohit.kumar@example.com', firstName: 'Rohit', lastName: 'Kumar', role: 'user' },
      description: 'Retainer deal with pricing, payment terms, and SLA under negotiation.',
      lineItems: [
        { id: 'li-6a', productName: 'Premium Support Retainer', quantity: 12, unitPrice: 6000, discount: 3, tax: 2, total: 71237 }
      ],
      revenueSplits: [
        { id: 'rs-6a', dealId: '6', userId: 'user-1', user: { id: 'user-1', email: 'rohit.kumar@example.com', firstName: 'Rohit', lastName: 'Kumar', role: 'user' }, splitPercentage: 70, splitAmount: 50400, commission: 2520 },
        { id: 'rs-6b', dealId: '6', userId: 'user-4', user: { id: 'user-4', email: 'maria.lopez@example.com', firstName: 'Maria', lastName: 'Lopez', role: 'user' }, splitPercentage: 30, splitAmount: 21600, commission: 1080 }
      ],
      quoteId: 'quote-006',
      invoiceId: undefined,
      paymentStatus: undefined,
      negotiationNotes: [
        { id: 'nn-6a', dealId: '6', note: 'Customer requested quarterly billing instead of annual prepay.', negotiationPoint: 'Payment terms', proposedBy: 'Rohit Kumar', respondedBy: 'Operations VP', response: 'Quarterly billing preferred', status: 'counter_proposed', createdAt: new Date() },
        { id: 'nn-6b', dealId: '6', note: 'SLA response window accepted at 4 business hours.', negotiationPoint: 'SLA commitment', proposedBy: 'Maria Lopez', respondedBy: 'Operations VP', response: 'Accepted', status: 'accepted', createdAt: new Date() }
      ],
      tags: ['Retainer', 'SLA'],
      expectedCloseDate: new Date(new Date().setDate(new Date().getDate() + 10)),
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '7',
      name: 'TechStart Expansion Add-on',
      amount: 31000,
      stage: 'Closed Won',
      status: 'closed_won',
      probability: 100,
      companyId: '2',
      company: { id: '2', name: 'TechStart Inc' },
      ownerId: 'user-2',
      owner: { id: 'user-2', email: 'jane.doe@example.com', firstName: 'Jane', lastName: 'Doe', role: 'user' },
      description: 'Expansion add-on approved after product review.',
      lineItems: [
        { id: 'li-7a', productName: 'Expansion Seats', quantity: 50, unitPrice: 620, discount: 0, tax: 0, total: 31000 }
      ],
      revenueSplits: [
        { id: 'rs-7', dealId: '7', userId: 'user-2', user: { id: 'user-2', email: 'jane.doe@example.com', firstName: 'Jane', lastName: 'Doe', role: 'user' }, splitPercentage: 100, splitAmount: 31000, commission: 1550 }
      ],
      quoteId: 'quote-007',
      invoiceId: 'inv-007',
      paymentStatus: 'unpaid',
      negotiationNotes: [
        { id: 'nn-7', dealId: '7', note: 'Final commercial terms accepted.', negotiationPoint: 'Approval', proposedBy: 'Jane Doe', respondedBy: 'TechStart CFO', response: 'Approved', status: 'accepted', createdAt: new Date() }
      ],
      tags: ['Closed Won', 'Expansion'],
      expectedCloseDate: new Date(),
      actualCloseDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '8',
      name: 'Retail Training Package',
      amount: 18000,
      stage: 'Closed Lost',
      status: 'closed_lost',
      probability: 0,
      companyId: '3',
      company: { id: '3', name: 'Global Retail Group' },
      ownerId: 'user-4',
      owner: { id: 'user-4', email: 'maria.lopez@example.com', firstName: 'Maria', lastName: 'Lopez', role: 'user' },
      description: 'Training package paused because client moved budget to next quarter.',
      lineItems: [
        { id: 'li-8a', productName: 'Admin Training Package', quantity: 3, unitPrice: 6000, discount: 0, tax: 0, total: 18000 }
      ],
      revenueSplits: [],
      quoteId: 'quote-008',
      invoiceId: undefined,
      paymentStatus: undefined,
      negotiationNotes: [
        { id: 'nn-8', dealId: '8', note: 'Budget moved to next quarter; revisit after planning cycle.', negotiationPoint: 'Budget timing', proposedBy: 'Maria Lopez', respondedBy: 'Retail Program Lead', response: 'Revisit later', status: 'rejected', createdAt: new Date() }
      ],
      tags: ['Closed Lost', 'Budget'],
      expectedCloseDate: new Date(),
      actualCloseDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    },
  ];

  constructor(private http: HttpClient) {}

  // ============ LEADS ============
  getLeads(page = 1, limit = 20, filters?: any): Observable<any> {
    const filtered = this.mockLeads.filter((lead) => {
      const query = filters?.searchQuery?.toLowerCase?.().trim();
      if (query) {
        const searchable = [
          lead.firstName,
          lead.lastName,
          lead.email,
          lead.phone,
          lead.companyName,
          lead.leadSource,
          lead.territory,
          lead.assignedTo,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        if (!searchable.includes(query)) {
          return false;
        }
      }
      if (filters?.leadStatus && lead.leadStatus !== filters.leadStatus) {
        return false;
      }
      if (filters?.leadSource && lead.leadSource !== filters.leadSource) {
        return false;
      }
      if (filters?.territory && lead.territory !== filters.territory) {
        return false;
      }
      if (filters?.assignment) {
        if (filters.assignment === 'unassigned') {
          return lead.leadQueueStatus === 'unassigned';
        }
        if (filters.assignment === 'assigned') {
          return lead.leadQueueStatus === 'assigned';
        }
      }
      if (filters?.scoreRange) {
        if (filters.scoreRange === 'high') {
          return lead.leadScore >= 80;
        }
        if (filters.scoreRange === 'medium') {
          return lead.leadScore >= 50 && lead.leadScore < 80;
        }
        if (filters.scoreRange === 'low') {
          return lead.leadScore < 50;
        }
      }
      if (filters?.quickFilter) {
        if (filters.quickFilter === 'hot') {
          return lead.leadScore >= 80;
        }
        if (filters.quickFilter === 'unassigned') {
          return lead.leadQueueStatus === 'unassigned';
        }
        if (filters.quickFilter === 'assigned') {
          return lead.leadQueueStatus === 'assigned';
        }
        if (filters.quickFilter === 'aged') {
          const lastContact = lead.lastContactDate ? new Date(lead.lastContactDate).getTime() : 0;
          const age = lastContact ? Math.round((Date.now() - lastContact) / (1000 * 60 * 60 * 24)) : 999;
          return lead.leadQueueStatus === 'unassigned' && age >= 4;
        }
      }
      return true;
    });

    return of({
      success: true,
      data: filtered,
      pagination: {
        page,
        limit,
        total: filtered.length,
        totalPages: 1,
      },
    });
  }

  getLead(id: string): Observable<ApiResponse<any>> {
    const lead = this.mockLeads.find((item) => item.id === id);
    return of({
      success: true,
      statusCode: 200,
      message: 'Success',
      data: lead || {
        id,
        firstName: 'John',
        lastName: 'Smith',
        email: 'john@example.com',
        leadScore: 85,
      },
    });
  }

  checkDuplicateLead(email: string, phone?: string): Observable<ApiResponse<any>> {
    const existing = this.mockLeads.find(
      (lead) => lead.email === email || (phone && lead.phone === phone)
    );
    return of({
      success: true,
      statusCode: 200,
      message: 'Duplicate check completed',
      data: { isDuplicate: !!existing, existingLead: existing },
    });
  }

  createLead(lead: any): Observable<ApiResponse<any>> {
    const duplicate = this.mockLeads.find(
      (item) => item.email === lead.email || (lead.phone && item.phone === lead.phone)
    );
    if (duplicate) {
      return of({
        success: false,
        statusCode: 409,
        message: 'Duplicate lead found',
        data: duplicate,
      });
    }

    const newLead = {
      ...lead,
      id: `lead-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      leadQueueStatus: lead.assignedTo ? 'assigned' : 'unassigned',
      assignedAt: lead.assignedTo ? new Date() : undefined,
    };
    this.mockLeads.unshift(newLead);
    return of({
      success: true,
      statusCode: 201,
      message: 'Lead created',
      data: newLead,
    });
  }

  updateLead(id: string, lead: any): Observable<ApiResponse<any>> {
    const index = this.mockLeads.findIndex((item) => item.id === id);
    const updatedLead = {
      ...(this.mockLeads[index] || {}),
      ...lead,
      id,
      updatedAt: new Date(),
    };

    if (index >= 0) {
      this.mockLeads[index] = updatedLead;
    }

    return of({
      success: true,
      statusCode: 200,
      message: 'Lead updated',
      data: updatedLead,
    });
  }

  deleteLead(id: string): Observable<ApiResponse<any>> {
    this.mockLeads = this.mockLeads.filter((lead) => lead.id !== id);

    return of({
      success: true,
      statusCode: 200,
      message: 'Lead deleted',
      data: {},
    });
  }

  convertLeadToContact(leadId: string): Observable<ApiResponse<any>> {
    const lead = this.mockLeads.find((item) => item.id === leadId);
    const contactId = `contact-${leadId}`;

    if (lead) {
      lead.leadStatus = 'Converted';
      lead.convertedContactId = contactId;
      lead.convertedAt = new Date();
      lead.updatedAt = new Date();

      const convertedContact: Contact = {
        id: contactId,
        firstName: lead.firstName,
        lastName: lead.lastName,
        email: lead.email,
        phoneMobile: lead.phone,
        jobTitle: lead.jobTitle,
        companyId: lead.territory === 'South' ? '2' : '1',
        company: lead.territory === 'South'
          ? { id: '2', name: 'TechStart Inc', createdAt: new Date(), updatedAt: new Date() }
          : { id: '1', name: 'Acme Corp', createdAt: new Date(), updatedAt: new Date() },
        leadSource: lead.leadSource,
        leadStatus: 'customer',
        rating: Math.max(1, Math.ceil(lead.leadScore / 20)),
        tags: ['Converted Lead', lead.leadSource, lead.territory || 'No Territory'].filter(Boolean),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const existingContactIndex = this.mockContacts.findIndex((contact) => contact.id === contactId);
      if (existingContactIndex >= 0) {
        this.mockContacts[existingContactIndex] = convertedContact;
      } else {
        this.mockContacts.unshift(convertedContact);
      }
    }

    return of({
      success: true,
      statusCode: 200,
      message: 'Lead converted to contact',
      data: { leadId, contactId, lead },
    });
  }

  getLeadStats(): Observable<ApiResponse<any>> {
    const totalLeads = this.mockLeads.length;
    const convertedThisMonth = this.mockLeads.filter((lead) => lead.leadStatus === 'Converted').length;

    return of({
      success: true,
      statusCode: 200,
      message: 'Success',
      data: {
        totalLeads,
        highScore: this.mockLeads.filter((lead) => lead.leadScore >= 80).length,
        mediumScore: this.mockLeads.filter((lead) => lead.leadScore >= 50 && lead.leadScore < 80).length,
        lowScore: this.mockLeads.filter((lead) => lead.leadScore < 50).length,
        avgMonthlyLeads: totalLeads,
        averageScore: totalLeads
          ? Math.round(this.mockLeads.reduce((sum, lead) => sum + lead.leadScore, 0) / totalLeads)
          : 0,
        newLeadsThisMonth: this.mockLeads.filter((lead) => lead.leadStatus === 'New').length,
        convertedThisMonth,
        conversionRate: totalLeads ? Math.round((convertedThisMonth / totalLeads) * 100) : 0,
      },
    });
  }

  // ============ CONTACTS ============
  getContacts(page = 1, limit = 20, filters?: any): Observable<any> {
    const filtered = this.mockContacts.filter((contact) => {
      const query = filters?.searchQuery?.toLowerCase?.().trim();
      if (query) {
        const searchable = [
          contact.firstName,
          contact.lastName,
          contact.email,
          contact.phoneMobile,
          contact.jobTitle,
          contact.company?.name,
          contact.leadStatus,
          contact.leadSource,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        if (!searchable.includes(query)) {
          return false;
        }
      }
      if (filters?.leadStatus && contact.leadStatus !== filters.leadStatus) {
        return false;
      }
      if (filters?.companyId && contact.companyId !== filters.companyId) {
        return false;
      }
      if (filters?.leadSource && contact.leadSource !== filters.leadSource) {
        return false;
      }
      if (filters?.rating && String(contact.rating || '') !== String(filters.rating)) {
        return false;
      }
      return true;
    });

    return of({
      success: true,
      data: filtered,
      pagination: {
        page: 1,
        limit: 20,
        total: filtered.length,
        totalPages: 1,
      },
    });
  }

  getContact(id: string): Observable<ApiResponse<any>> {
    const contact = this.mockContacts.find((item) => item.id === id);

    return of({
      success: true,
      statusCode: 200,
      message: 'Success',
      data: contact || null,
    });
  }

  createContact(contact: any): Observable<ApiResponse<any>> {
    const newContact = {
      ...contact,
      id: `contact-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.mockContacts.unshift(newContact);

    return of({
      success: true,
      statusCode: 201,
      message: 'Contact created',
      data: newContact,
    });
  }

  updateContact(id: string, contact: any): Observable<ApiResponse<any>> {
    const index = this.mockContacts.findIndex((item) => item.id === id);
    const updatedContact = {
      ...(this.mockContacts[index] || {}),
      ...contact,
      id,
      updatedAt: new Date(),
    };
    if (index >= 0) {
      this.mockContacts[index] = updatedContact;
    }

    return of({
      success: true,
      statusCode: 200,
      message: 'Contact updated',
      data: updatedContact,
    });
  }

  deleteContact(id: string): Observable<ApiResponse<any>> {
    this.mockContacts = this.mockContacts.filter((contact) => contact.id !== id);

    return of({
      success: true,
      statusCode: 200,
      message: 'Contact deleted',
      data: {},
    });
  }

  // ============ COMPANIES ============
  getCompanies(page = 1, limit = 20): Observable<any> {
    return of({
      success: true,
      data: this.mockCompanies,
    });
  }

  getCompany(id: string): Observable<ApiResponse<any>> {
    const company = this.mockCompanies.find((item) => item.id === id);

    return of({
      success: true,
      statusCode: 200,
      message: 'Success',
      data: company || null,
    });
  }

  createCompany(company: any): Observable<ApiResponse<any>> {
    const newCompany: Company = {
      ...company,
      id: `company-${Date.now()}`,
      tags: Array.isArray(company.tags) ? company.tags : (company.tags || '').split(',').map((tag: string) => tag.trim()).filter(Boolean),
      addresses: company.address ? [
        {
          id: `addr-${Date.now()}`,
          type: 'billing',
          street: company.address,
          city: company.city || '',
          state: company.state || '',
          country: company.country || '',
          zipCode: company.zipCode || '',
          isDefault: true,
        }
      ] : [],
      creditLimit: Number(company.creditLimit) || 100000,
      creditUsed: Number(company.creditUsed) || 0,
      accountStatus: company.accountStatus || 'active',
      activitySummary: {
        totalInteractions: 0,
        emailsSent: 0,
        callsMade: 0,
        meetingsScheduled: 0,
        tasksCompleted: 0,
        openTasks: 0,
        upcomingDeals: 0,
        lastInteractionDate: new Date(),
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.mockCompanies.unshift(newCompany);

    return of({
      success: true,
      statusCode: 201,
      message: 'Company created',
      data: newCompany,
    });
  }

  updateCompany(id: string, company: any): Observable<ApiResponse<any>> {
    const index = this.mockCompanies.findIndex((item) => item.id === id);
    const updatedCompany: Company = {
      ...(this.mockCompanies[index] || {}),
      ...company,
      id,
      tags: Array.isArray(company.tags) ? company.tags : (company.tags || '').split(',').map((tag: string) => tag.trim()).filter(Boolean),
      updatedAt: new Date(),
      createdAt: this.mockCompanies[index]?.createdAt || new Date(),
    };
    if (index >= 0) {
      this.mockCompanies[index] = updatedCompany;
    }

    return of({
      success: true,
      statusCode: 200,
      message: 'Company updated',
      data: updatedCompany,
    });
  }

  deleteCompany(id: string): Observable<ApiResponse<any>> {
    this.mockCompanies = this.mockCompanies.filter((company) => company.id !== id);

    return of({
      success: true,
      statusCode: 200,
      message: 'Company deleted',
      data: {},
    });
  }

  // ============ DEALS ============
  getDeals(page = 1, limit = 20, filters?: any): Observable<any> {
    const filtered = this.mockDeals.filter((deal) => {
      if (filters?.stage && deal.stage !== filters.stage) {
        return false;
      }
      if (filters?.minAmount && deal.amount < Number(filters.minAmount)) {
        return false;
      }
      if (filters?.maxAmount && deal.amount > Number(filters.maxAmount)) {
        return false;
      }
      return true;
    });

    return of({
      success: true,
      data: filtered,
      pagination: {
        page,
        limit,
        total: filtered.length,
        totalPages: 1,
      },
    });
  }

  getDeal(id: string): Observable<ApiResponse<any>> {
    const deal = this.mockDeals.find((item) => item.id === id);

    return of({
      success: true,
      statusCode: 200,
      message: 'Success',
      data: deal || null,
    });
  }

  createDeal(deal: any): Observable<ApiResponse<any>> {
    const company = this.mockCompanies.find((item) => item.id === deal.companyId);
    const contact = this.mockContacts.find((item) => item.id === deal.contactId);
    const newDeal = {
      ...deal,
      id: `deal-${Date.now()}`,
      amount: Number(deal.amount) || 0,
      probability: Number(deal.probability) || 50,
      status: this.normalizeDealStatus(deal.status),
      stage: deal.stage || 'Prospecting',
      ownerId: 'user-1',
      owner: { id: 'user-1', email: 'sales.owner@example.com', firstName: 'Sales', lastName: 'Owner', role: 'user' },
      company: company ? { id: company.id, name: company.name } : undefined,
      contact,
      lineItems: [],
      revenueSplits: [],
      negotiationNotes: [],
      tags: deal.tags || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.mockDeals.unshift(newDeal);

    return of({
      success: true,
      statusCode: 201,
      message: 'Deal created',
      data: newDeal,
    });
  }

  updateDeal(id: string, deal: any): Observable<ApiResponse<any>> {
    const index = this.mockDeals.findIndex((item) => item.id === id);
    const company = this.mockCompanies.find((item) => item.id === deal.companyId);
    const contact = this.mockContacts.find((item) => item.id === deal.contactId);
    const updatedDeal = {
      ...(this.mockDeals[index] || {}),
      ...deal,
      id,
      amount: Number(deal.amount) || 0,
      probability: Number(deal.probability) || 50,
      status: this.normalizeDealStatus(deal.status),
      company: company ? { id: company.id, name: company.name } : this.mockDeals[index]?.company,
      contact: contact || this.mockDeals[index]?.contact,
      updatedAt: new Date(),
      createdAt: this.mockDeals[index]?.createdAt || new Date(),
    };

    if (index >= 0) {
      this.mockDeals[index] = updatedDeal;
    }

    return of({
      success: true,
      statusCode: 200,
      message: 'Deal updated',
      data: updatedDeal,
    });
  }

  updateDealStage(id: string, stage: string): Observable<ApiResponse<any>> {
    const deal = this.mockDeals.find((item) => item.id === id);
    if (deal) {
      deal.stage = stage;
      deal.updatedAt = new Date();
    }

    return of({
      success: true,
      statusCode: 200,
      message: 'Deal stage updated',
      data: deal || { id, stage },
    });
  }

  deleteDeal(id: string): Observable<ApiResponse<any>> {
    this.mockDeals = this.mockDeals.filter((deal) => deal.id !== id);

    return of({
      success: true,
      statusCode: 200,
      message: 'Deal deleted',
      data: {},
    });
  }

  private normalizeDealStatus(status: string): string {
    const statusMap: Record<string, string> = {
      Open: 'open',
      'In Progress': 'negotiation',
      'Closed Won': 'closed_won',
      'Closed Lost': 'closed_lost',
    };
    return statusMap[status] || status || 'open';
  }

  getPipelineSummary(): Observable<any> {
    return of({
      success: true,
      data: [
        { name: 'Prospecting', dealCount: 25, totalValue: 150000 },
        { name: 'Qualification', dealCount: 18, totalValue: 120000 },
        { name: 'Proposal', dealCount: 12, totalValue: 100000 },
        { name: 'Negotiation', dealCount: 8, totalValue: 80000 },
        { name: 'Closed Won', dealCount: 6, totalValue: 60000 },
        { name: 'Closed Lost', dealCount: 5, totalValue: 0 },
      ],
    });
  }

  // ============ ACTIVITIES ============
  getActivities(page = 1, limit = 20): Observable<any> {
    return of({
      success: true,
      data: [],
    });
  }

  getActivity(id: string): Observable<ApiResponse<any>> {
    return of({
      success: true,
      statusCode: 200,
      message: 'Success',
      data: { id },
    });
  }

  createActivity(activity: any): Observable<ApiResponse<any>> {
    return of({
      success: true,
      statusCode: 201,
      message: 'Activity created',
      data: { ...activity, id: 'new-id' },
    });
  }

  getContactActivities(contactId: string): Observable<any> {
    return of({
      success: true,
      data: [],
    });
  }

  // ============ TASKS ============
  getTasks(page = 1, limit = 20, filters?: any): Observable<any> {
    return of({
      success: true,
      data: [],
    });
  }

  getTask(id: string): Observable<ApiResponse<any>> {
    return of({
      success: true,
      statusCode: 200,
      message: 'Success',
      data: { id },
    });
  }

  createTask(task: any): Observable<ApiResponse<any>> {
    return of({
      success: true,
      statusCode: 201,
      message: 'Task created',
      data: { ...task, id: 'new-id' },
    });
  }

  updateTask(id: string, task: any): Observable<ApiResponse<any>> {
    return of({
      success: true,
      statusCode: 200,
      message: 'Task updated',
      data: { ...task, id },
    });
  }

  updateTaskStatus(id: string, status: string): Observable<ApiResponse<any>> {
    return of({
      success: true,
      statusCode: 200,
      message: 'Task status updated',
      data: { id, status },
    });
  }

  // ============ DASHBOARD ============
  getDashboardMetrics(): Observable<any> {
    return of({
      success: true,
      data: {
        totalPipelineValue: 500000,
        expectedRevenue: 350000,
        dealsClosedThisMonth: 12,
        monthlyWinRate: 68,
        winRate: 45,
      },
    });
  }

  getPipelineForecast(): Observable<any> {
    return of({
      success: true,
      data: [],
    });
  }

  // ============ SEARCH ============
  globalSearch(query: string): Observable<any> {
    return of({
      success: true,
      data: [],
    });
  }

  // ============ CONTACT MERGE ============
  mergeContacts(primaryContactId: string, secondaryContactIds: string[]): Observable<ApiResponse<any>> {
    return of({
      success: true,
      statusCode: 200,
      message: 'Contacts merged successfully',
      data: {
        primaryContactId,
        mergedContactIds: secondaryContactIds,
        status: 'completed',
        mergedAt: new Date()
      }
    });
  }

  // ============ BULK IMPORT ============
  importContactsFromCsv(file: File): Observable<ApiResponse<any>> {
    return of({
      success: true,
      statusCode: 202,
      message: 'Import job started',
      data: {
        jobId: 'import-job-' + Date.now(),
        status: 'processing',
        totalRecords: 100,
        processedRecords: 0,
        successRecords: 0,
        failedRecords: 0
      }
    });
  }

  getImportJobStatus(jobId: string): Observable<ApiResponse<any>> {
    return of({
      success: true,
      statusCode: 200,
      message: 'Job status',
      data: {
        jobId,
        status: 'completed',
        totalRecords: 100,
        processedRecords: 100,
        successRecords: 95,
        failedRecords: 5,
        errors: [
          { rowNumber: 5, field: 'email', error: 'Invalid email format' },
          { rowNumber: 12, field: 'phone', error: 'Invalid phone number' },
          { rowNumber: 25, field: 'email', error: 'Duplicate email' },
          { rowNumber: 48, field: 'required', error: 'Missing required field: firstName' },
          { rowNumber: 99, field: 'email', error: 'Invalid email format' }
        ]
      }
    });
  }

  // ============ DEAL PRODUCTS ============
  addDealLineItem(dealId: string, lineItem: any): Observable<ApiResponse<any>> {
    const item = {
      ...lineItem,
      id: 'li-' + Date.now()
    };
    const deal = this.mockDeals.find((item) => item.id === dealId);
    if (deal) {
      deal.lineItems = [...(deal.lineItems || []), item];
      deal.amount = deal.lineItems.reduce((sum: number, entry: any) => sum + (Number(entry.total) || 0), 0);
      deal.updatedAt = new Date();
    }

    return of({
      success: true,
      statusCode: 201,
      message: 'Line item added',
      data: item
    });
  }

  updateDealLineItem(dealId: string, lineItemId: string, lineItem: any): Observable<ApiResponse<any>> {
    return of({
      success: true,
      statusCode: 200,
      message: 'Line item updated',
      data: { ...lineItem, id: lineItemId }
    });
  }

  deleteDealLineItem(dealId: string, lineItemId: string): Observable<ApiResponse<any>> {
    const deal = this.mockDeals.find((item) => item.id === dealId);
    if (deal) {
      deal.lineItems = (deal.lineItems || []).filter((item: any) => item.id !== lineItemId);
      deal.amount = deal.lineItems.reduce((sum: number, entry: any) => sum + (Number(entry.total) || 0), 0);
      deal.updatedAt = new Date();
    }

    return of({
      success: true,
      statusCode: 200,
      message: 'Line item deleted',
      data: { lineItemId }
    });
  }

  addRevenueSplit(dealId: string, split: any): Observable<ApiResponse<any>> {
    const revenueSplit = {
      ...split,
      id: 'rs-' + Date.now()
    };
    const deal = this.mockDeals.find((item) => item.id === dealId);
    if (deal) {
      deal.revenueSplits = [...(deal.revenueSplits || []), revenueSplit];
      deal.updatedAt = new Date();
    }

    return of({
      success: true,
      statusCode: 201,
      message: 'Revenue split added',
      data: revenueSplit
    });
  }

  updateRevenueSplit(dealId: string, splitId: string, split: any): Observable<ApiResponse<any>> {
    return of({
      success: true,
      statusCode: 200,
      message: 'Revenue split updated',
      data: { ...split, id: splitId }
    });
  }

  deleteRevenueSplit(dealId: string, splitId: string): Observable<ApiResponse<any>> {
    return of({
      success: true,
      statusCode: 200,
      message: 'Revenue split deleted',
      data: { splitId }
    });
  }

  createQuoteFromDeal(dealId: string, quoteData: any): Observable<ApiResponse<any>> {
    const quote = {
      ...quoteData,
      id: quoteData.id || 'quote-' + Date.now(),
      dealId,
      quoteNumber: quoteData.quoteNumber || 'QT-' + Date.now(),
      status: quoteData.status || 'draft',
      createdAt: quoteData.createdAt || new Date(),
      updatedAt: new Date()
    };
    const deal = this.mockDeals.find((item) => item.id === dealId);
    if (deal) {
      deal.quoteId = quote.id;
      deal.status = 'quote_pending';
      deal.stage = 'Proposal';
      deal.updatedAt = new Date();
    }

    return of({
      success: true,
      statusCode: 201,
      message: 'Quote created',
      data: quote
    });
  }

  createInvoiceFromQuote(quoteId: string, invoiceData: any): Observable<ApiResponse<any>> {
    return of({
      success: true,
      statusCode: 201,
      message: 'Invoice created',
      data: {
        id: 'invoice-' + Date.now(),
        quoteId,
        invoiceNumber: 'INV-' + Date.now(),
        status: 'draft',
        lineItems: invoiceData.lineItems,
        subtotal: invoiceData.subtotal,
        tax: invoiceData.tax,
        total: invoiceData.total,
        dueDate: invoiceData.dueDate,
        createdAt: new Date()
      }
    });
  }

  recordPayment(invoiceId: string, payment: any): Observable<ApiResponse<any>> {
    return of({
      success: true,
      statusCode: 201,
      message: 'Payment recorded',
      data: {
        id: 'payment-' + Date.now(),
        invoiceId,
        amount: payment.amount,
        paymentDate: new Date(),
        paymentMethod: payment.paymentMethod,
        status: 'completed'
      }
    });
  }

  // ============ DEAL NEGOTIATIONS ============
  addNegotiationNote(dealId: string, note: any): Observable<ApiResponse<any>> {
    const negotiationNote = {
      id: 'nn-' + Date.now(),
      dealId,
      ...note,
      createdAt: new Date()
    };
    const deal = this.mockDeals.find((item) => item.id === dealId);
    if (deal) {
      deal.negotiationNotes = [negotiationNote, ...(deal.negotiationNotes || [])];
      deal.status = 'negotiation';
      deal.stage = 'Negotiation';
      deal.updatedAt = new Date();
    }

    return of({
      success: true,
      statusCode: 201,
      message: 'Negotiation note added',
      data: negotiationNote
    });
  }

  updateNegotiationNote(dealId: string, noteId: string, note: any): Observable<ApiResponse<any>> {
    return of({
      success: true,
      statusCode: 200,
      message: 'Negotiation note updated',
      data: { id: noteId, ...note }
    });
  }

  sendProposal(dealId: string, proposal: any): Observable<ApiResponse<any>> {
    const deal = this.mockDeals.find((item) => item.id === dealId);
    if (deal) {
      deal.status = 'proposal_sent';
      deal.stage = 'Proposal';
      deal.probability = Math.max(Number(deal.probability) || 0, 70);
      deal.negotiationNotes = [
        {
          id: 'nn-' + Date.now(),
          dealId,
          note: proposal?.note || 'Proposal sent to customer for review.',
          negotiationPoint: proposal?.negotiationPoint || 'Proposal sent',
          proposedBy: proposal?.proposedBy || 'Sales Owner',
          status: 'proposed',
          createdAt: new Date(),
        },
        ...(deal.negotiationNotes || [])
      ];
      deal.updatedAt = new Date();
    }

    return of({
      success: true,
      statusCode: 200,
      message: 'Proposal sent',
      data: {
        dealId,
        proposalId: 'prop-' + Date.now(),
        status: 'sent',
        sentAt: new Date()
      }
    });
  }

  closeDeal(dealId: string, closureData: any): Observable<ApiResponse<any>> {
    const deal = this.mockDeals.find((item) => item.id === dealId);
    if (deal) {
      deal.status = closureData.status;
      deal.stage = closureData.status === 'closed_won' ? 'Closed Won' : 'Closed Lost';
      deal.probability = closureData.status === 'closed_won' ? 100 : 0;
      deal.actualCloseDate = new Date();
      deal.negotiationNotes = [
        {
          id: 'nn-' + Date.now(),
          dealId,
          note: closureData.notes || closureData.reason || 'Deal closed.',
          negotiationPoint: closureData.status === 'closed_won' ? 'Closed won' : 'Closed lost',
          proposedBy: 'Sales Owner',
          response: closureData.reason,
          status: closureData.status === 'closed_won' ? 'accepted' : 'rejected',
          createdAt: new Date(),
        },
        ...(deal.negotiationNotes || [])
      ];
      deal.updatedAt = new Date();
    }

    return of({
      success: true,
      statusCode: 200,
      message: 'Deal closed',
      data: deal || {
        dealId,
        status: closureData.status,
        closedAt: new Date(),
        closureReason: closureData.reason,
        notes: closureData.notes
      }
    });
  }

  // ============ COMPANY MANAGEMENT ============
  addCompanyAddress(companyId: string, address: any): Observable<ApiResponse<any>> {
    return of({
      success: true,
      statusCode: 201,
      message: 'Address added',
      data: {
        id: 'addr-' + Date.now(),
        companyId,
        ...address
      }
    });
  }

  updateCompanyAddress(companyId: string, addressId: string, address: any): Observable<ApiResponse<any>> {
    return of({
      success: true,
      statusCode: 200,
      message: 'Address updated',
      data: { id: addressId, ...address }
    });
  }

  deleteCompanyAddress(companyId: string, addressId: string): Observable<ApiResponse<any>> {
    return of({
      success: true,
      statusCode: 200,
      message: 'Address deleted',
      data: { addressId }
    });
  }

  updateCompanyCreditLimit(companyId: string, creditLimit: number): Observable<ApiResponse<any>> {
    return of({
      success: true,
      statusCode: 200,
      message: 'Credit limit updated',
      data: { companyId, creditLimit }
    });
  }

  getCompanyActivitySummary(companyId: string): Observable<ApiResponse<any>> {
    return of({
      success: true,
      statusCode: 200,
      message: 'Activity summary',
      data: {
        totalInteractions: 24,
        lastInteractionDate: new Date(),
        emailsSent: 12,
        callsMade: 5,
        meetingsScheduled: 3,
        tasksCompleted: 18,
        openTasks: 2,
        upcomingDeals: 3
      }
    });
  }
}
