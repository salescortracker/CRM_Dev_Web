import { Component, OnInit } from '@angular/core';

interface LeadSource {
  id: string;
  name: string;
  type: 'Website Form' | 'Facebook Leads' | 'Campaign' | 'Referral' | 'Marketplace';
  status: 'Active' | 'Paused';
  owner: string;
  mappedCampaign: string;
  leads: number;
  conversionRate: number;
  integrationStatus: 'Connected' | 'Needs Setup';
}

@Component({
  selector: 'app-lead-source-management',
  standalone: false,
  templateUrl: './lead-source-management.component.html',
  styleUrls: ['./lead-source-management.component.css']
})
export class LeadSourceManagementComponent implements OnInit {
  sources: LeadSource[] = [];
  selectedSource: LeadSource | null = null;
  showForm = false;
  activityMessage = '';
  form: Partial<LeadSource> = { type: 'Website Form', status: 'Active', integrationStatus: 'Needs Setup' };
  sourceTypes = ['Website Form', 'Facebook Leads', 'Campaign', 'Referral', 'Marketplace'];

  ngOnInit(): void {
    this.sources = [
      { id: 'src-001', name: 'Website Demo Request', type: 'Website Form', status: 'Active', owner: 'Rohit Kumar', mappedCampaign: 'Lead Nurture Sequence', leads: 126, conversionRate: 28, integrationStatus: 'Connected' },
      { id: 'src-002', name: 'Facebook Lead Ads', type: 'Facebook Leads', status: 'Active', owner: 'Maria Lopez', mappedCampaign: 'LinkedIn Enterprise Outreach', leads: 88, conversionRate: 21, integrationStatus: 'Connected' },
      { id: 'src-003', name: 'IndiaMART Imports', type: 'Marketplace', status: 'Paused', owner: 'Jane Doe', mappedCampaign: 'Referral Partner Push', leads: 43, conversionRate: 12, integrationStatus: 'Needs Setup' }
    ];
    this.selectedSource = this.sources[0];
  }

  get activeSources(): number {
    return this.sources.filter((source) => source.status === 'Active').length;
  }

  get totalLeads(): number {
    return this.sources.reduce((sum, source) => sum + source.leads, 0);
  }

  get averageConversion(): number {
    return Math.round(this.sources.reduce((sum, source) => sum + source.conversionRate, 0) / this.sources.length);
  }

  selectSource(source: LeadSource): void {
    this.selectedSource = source;
    this.showForm = false;
  }

  openForm(source?: LeadSource): void {
    this.form = source ? { ...source } : { type: 'Website Form', status: 'Active', integrationStatus: 'Needs Setup' };
    this.showForm = true;
  }

  saveSource(): void {
    if (!this.form.name) {
      this.showActivity('Add source name.');
      return;
    }
    if (this.form.id) {
      const index = this.sources.findIndex((source) => source.id === this.form.id);
      if (index >= 0) {
        this.sources[index] = { ...this.sources[index], ...this.form } as LeadSource;
        this.selectedSource = this.sources[index];
      }
      this.showActivity('Lead source updated.');
    } else {
      const source: LeadSource = {
        id: `src-${Date.now()}`,
        name: this.form.name,
        type: this.form.type || 'Website Form',
        status: this.form.status || 'Active',
        owner: this.form.owner || 'Unassigned',
        mappedCampaign: this.form.mappedCampaign || 'Not mapped',
        leads: 0,
        conversionRate: 0,
        integrationStatus: this.form.integrationStatus || 'Needs Setup'
      };
      this.sources.unshift(source);
      this.selectedSource = source;
      this.showActivity('Lead source created.');
    }
    this.showForm = false;
  }

  toggleSource(source: LeadSource): void {
    source.status = source.status === 'Active' ? 'Paused' : 'Active';
  }

  connect(source: LeadSource): void {
    source.integrationStatus = 'Connected';
    this.showActivity(`${source.name} connected.`);
  }

  private showActivity(message: string): void {
    this.activityMessage = message;
    setTimeout(() => this.activityMessage = '', 3500);
  }
}
