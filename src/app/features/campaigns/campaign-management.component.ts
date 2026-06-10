import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

interface Campaign {
  id: string;
  name: string;
  owner: string;
  status: 'Planning' | 'Active' | 'Paused' | 'Completed';
  channels: string[];
  audience: string;
  goal: string;
  startDate: string;
  endDate: string;
  budget: number;
  spend: number;
  leadsGenerated: number;
  sentMessages: number;
  openRate: number;
  conversionRate: number;
  revenue: number;
  nextStep: string;
}

interface CampaignTemplate {
  id: string;
  name: string;
  description: string;
  channels: string[];
  target: string;
  budget: number;
}

@Component({
  selector: 'app-campaign-management',
  standalone: false,
  templateUrl: './campaign-management.component.html',
  styleUrls: ['./campaign-management.component.css']
})
export class CampaignManagementComponent implements OnInit {
  campaigns: Campaign[] = [];
  selectedCampaign: Campaign | null = null;
  activityMessage = '';
  detailMode = false;
  showBuilder = false;
  showRoiPanel = false;

  campaignName = '';
  campaignOwner = 'Rohit Kumar';
  campaignChannels: string[] = [];
  campaignGoal = 'Lead generation';
  campaignBudget = 15000;
  campaignAudience = 'Hot leads';
  campaignStartDate = this.formatToday();
  campaignEndDate = this.formatFutureDate(30);
  selectedTemplateDescription = '';

  allChannels = ['Email', 'SMS', 'LinkedIn', 'Referral', 'Web', 'Call'];
  campaignGoals = ['Lead generation', 'Nurture', 'Renewal', 'Conversion', 'Event promotion'];

  templates: CampaignTemplate[] = [
    { id: 'template-1', name: 'Lead Nurture Sequence', description: 'Multi-touch email and SMS journey for new leads.', channels: ['Email', 'SMS'], target: 'Warm leads', budget: 12000 },
    { id: 'template-2', name: 'LinkedIn Prospecting', description: 'Connect, message, and move high-fit prospects into leads.', channels: ['LinkedIn', 'Email'], target: 'Enterprise prospects', budget: 18000 },
    { id: 'template-3', name: 'Renewal Drive', description: 'Reach existing customers before renewal and route replies to deals.', channels: ['Email', 'Call'], target: 'Renewal accounts', budget: 9000 }
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadCampaigns();
  }

  loadCampaigns(): void {
    this.campaigns = [
      { id: 'camp-001', name: 'Acme Renewal Nurture', owner: 'Rohit Kumar', status: 'Active', channels: ['Email', 'Call'], audience: 'Renewal accounts', goal: 'Renewal', startDate: '2026-05-01', endDate: '2026-05-30', budget: 18000, spend: 12350, leadsGenerated: 42, sentMessages: 620, openRate: 48, conversionRate: 18, revenue: 54000, nextStep: 'Open engagement replies and create follow-up tasks' },
      { id: 'camp-002', name: 'LinkedIn Enterprise Outreach', owner: 'Maria Lopez', status: 'Planning', channels: ['LinkedIn', 'Email'], audience: 'Enterprise prospects', goal: 'Lead generation', startDate: '2026-06-10', endDate: '2026-08-05', budget: 42000, spend: 0, leadsGenerated: 0, sentMessages: 0, openRate: 0, conversionRate: 0, revenue: 0, nextStep: 'Launch campaign and capture new leads' },
      { id: 'camp-003', name: 'Education Portal Follow-up', owner: 'Emma Davis', status: 'Paused', channels: ['Email', 'SMS'], audience: 'Proposal contacts', goal: 'Conversion', startDate: '2026-04-15', endDate: '2026-05-15', budget: 9500, spend: 7100, leadsGenerated: 21, sentMessages: 280, openRate: 35, conversionRate: 9, revenue: 21800, nextStep: 'Review quote validity responses' },
      { id: 'camp-004', name: 'Referral Partner Push', owner: 'Jane Doe', status: 'Completed', channels: ['Referral', 'Email'], audience: 'Partner network', goal: 'Lead generation', startDate: '2026-03-01', endDate: '2026-04-01', budget: 8000, spend: 7600, leadsGenerated: 33, sentMessages: 140, openRate: 52, conversionRate: 14, revenue: 31000, nextStep: 'Review generated deals' }
    ];
    this.selectedCampaign = this.campaigns[0];
  }

  get activeCampaigns(): number {
    return this.campaigns.filter((campaign) => campaign.status === 'Active').length;
  }

  get sentMessages(): number {
    return this.campaigns.reduce((sum, campaign) => sum + campaign.sentMessages, 0);
  }

  get totalLeadsGenerated(): number {
    return this.campaigns.reduce((sum, campaign) => sum + campaign.leadsGenerated, 0);
  }

  get averageOpenRate(): number {
    const active = this.campaigns.filter((campaign) => campaign.sentMessages > 0);
    return active.length ? Math.round(active.reduce((sum, campaign) => sum + campaign.openRate, 0) / active.length) : 0;
  }

  get totalConversions(): number {
    return this.campaigns.reduce((sum, campaign) => sum + Math.round(campaign.leadsGenerated * (campaign.conversionRate / 100)), 0);
  }

  selectCampaign(campaign: Campaign): void {
    this.selectedCampaign = campaign;
    this.detailMode = true;
    this.showBuilder = false;
    this.showRoiPanel = false;
  }

  closeCampaignProfile(): void {
    this.detailMode = false;
    this.showRoiPanel = false;
  }

  openBuilder(): void {
    this.showBuilder = true;
    this.detailMode = false;
    this.showRoiPanel = false;
  }

  closeBuilder(): void {
    this.showBuilder = false;
  }

  showRoi(): void {
    this.showRoiPanel = true;
    this.showActivity('Campaign ROI summary opened.');
  }

  selectTemplate(templateId: string): void {
    const template = this.templates.find((item) => item.id === templateId);
    if (!template) {
      this.selectedTemplateDescription = '';
      return;
    }
    this.campaignName = template.name;
    this.campaignChannels = [...template.channels];
    this.campaignAudience = template.target;
    this.campaignBudget = template.budget;
    this.selectedTemplateDescription = template.description;
  }

  toggleChannel(channel: string): void {
    this.campaignChannels = this.campaignChannels.includes(channel)
      ? this.campaignChannels.filter((item) => item !== channel)
      : [...this.campaignChannels, channel];
  }

  createCampaign(): void {
    if (!this.campaignName.trim() || !this.campaignChannels.length) {
      this.showActivity('Add a campaign name and at least one channel.');
      return;
    }

    const campaign: Campaign = {
      id: `camp-${Date.now()}`,
      name: this.campaignName.trim(),
      owner: this.campaignOwner,
      status: 'Planning',
      channels: [...this.campaignChannels],
      audience: this.campaignAudience,
      goal: this.campaignGoal,
      startDate: this.campaignStartDate,
      endDate: this.campaignEndDate,
      budget: this.campaignBudget,
      spend: 0,
      leadsGenerated: 0,
      sentMessages: 0,
      openRate: 0,
      conversionRate: 0,
      revenue: 0,
      nextStep: 'Launch campaign and monitor engagement'
    };
    this.campaigns.unshift(campaign);
    this.selectedCampaign = campaign;
    this.detailMode = true;
    this.showBuilder = false;
    this.showRoiPanel = false;
    this.resetCampaignForm();
    this.showActivity('Campaign created.');
  }

  toggleCampaign(campaign: Campaign): void {
    campaign.status = campaign.status === 'Active' ? 'Paused' : 'Active';
    this.selectedCampaign = campaign;
    this.showActivity(`${campaign.name} ${campaign.status === 'Active' ? 'launched' : 'paused'}.`);
  }

  createFollowUpTask(): void {
    this.router.navigate(['/tasks']);
  }

  openLeads(): void {
    this.router.navigate(['/leads']);
  }

  openEngagement(): void {
    this.router.navigate(['/engagement']);
  }

  trackROI(campaign: Campaign): string {
    if (!campaign.revenue || campaign.spend === 0) {
      return 'TBD';
    }
    return `${(((campaign.revenue - campaign.spend) / campaign.spend) * 100).toFixed(0)}%`;
  }

  getStatusClass(status: Campaign['status']): string {
    return status.toLowerCase();
  }

  resetCampaignForm(): void {
    this.campaignName = '';
    this.campaignChannels = [];
    this.campaignGoal = 'Lead generation';
    this.campaignAudience = 'Hot leads';
    this.campaignBudget = 15000;
    this.campaignStartDate = this.formatToday();
    this.campaignEndDate = this.formatFutureDate(30);
    this.selectedTemplateDescription = '';
  }

  private showActivity(message: string): void {
    this.activityMessage = message;
    setTimeout(() => this.activityMessage = '', 4000);
  }

  private formatToday(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private formatFutureDate(days: number): string {
    const future = new Date();
    future.setDate(future.getDate() + days);
    return future.toISOString().slice(0, 10);
  }
}
