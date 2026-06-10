import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Deal, PipelineStage } from '../../core/models/contact';
import { ApiService } from '../../services/api.service';

type PipelineDeal = Deal & { company?: { id?: string; name?: string } };

@Component({
  selector: 'app-pipeline-kanban',
  standalone: false,
  templateUrl: './pipeline-kanban.component.html',
  styleUrls: ['./pipeline-kanban.component.css']
})
export class PipelineKanbanComponent implements OnInit {
  stages: PipelineStage[] = [];
  allDeals: PipelineDeal[] = [];
  draggedDeal: PipelineDeal | null = null;
  dragOverStage = '';
  selectedDeal: PipelineDeal | null = null;
  activityMessage = '';
  searchQuery = '';

  stageNames = ['Prospecting', 'Qualification', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'];

  constructor(private apiService: ApiService, private router: Router) {}

  ngOnInit(): void {
    this.loadPipelineData();
  }

  loadPipelineData(): void {
    this.apiService.getDeals().subscribe(
      (response: any) => {
        this.allDeals = response.success ? response.data : [];
        this.buildStages();
        this.selectedDeal = this.filteredDeals[0] || null;
      },
      (error) => {
        console.error('Error loading deals', error);
        this.allDeals = [];
        this.buildStages();
      }
    );
  }

  get filteredDeals(): PipelineDeal[] {
    const query = this.searchQuery.trim().toLowerCase();
    if (!query) {
      return this.allDeals;
    }
    return this.allDeals.filter((deal) =>
      [deal.name, this.getCompanyName(deal), deal.stage, deal.status, deal.owner?.firstName, deal.owner?.lastName]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(query)
    );
  }

  get totalPipelineValue(): number {
    return this.allDeals.reduce((sum, deal) => sum + (Number(deal.amount) || 0), 0);
  }

  get weightedForecast(): number {
    return this.allDeals.reduce((sum, deal) => sum + ((Number(deal.amount) || 0) * (Number(deal.probability) || 0) / 100), 0);
  }

  get highRiskDeals(): number {
    return this.allDeals.filter((deal) => deal.status === 'negotiation' || deal.stage === 'Closed Lost').length;
  }

  buildStages(): void {
    this.stages = this.stageNames.map((name, index) => {
      const deals = this.allDeals.filter((deal) => deal.stage === name);
      return {
        id: name,
        name,
        probability: name === 'Closed Won' ? 100 : name === 'Closed Lost' ? 0 : Math.min(90, (index + 1) * 18),
        dealCount: deals.length,
        totalValue: deals.reduce((sum, deal) => sum + (Number(deal.amount) || 0), 0)
      };
    });
  }

  getDealsByStage(stageId: string): PipelineDeal[] {
    return this.filteredDeals.filter((deal) => deal.stage === stageId);
  }

  onDragStart(event: DragEvent, deal: PipelineDeal): void {
    this.draggedDeal = deal;
    event.dataTransfer?.setData('text/plain', deal.id);
    event.dataTransfer!.effectAllowed = 'move';
  }

  allowDrop(event: DragEvent, stageId: string): void {
    event.preventDefault();
    event.dataTransfer!.dropEffect = 'move';
    this.dragOverStage = stageId;
  }

  clearDragState(): void {
    this.dragOverStage = '';
  }

  onDrop(event: DragEvent, stageId: string): void {
    event.preventDefault();
    event.stopPropagation();
    const droppedDealId = event.dataTransfer?.getData('text/plain');
    const dealToMove = this.draggedDeal || this.allDeals.find((deal) => deal.id === droppedDealId) || null;
    this.dragOverStage = '';

    if (!dealToMove) {
      return;
    }

    const probability = stageId === 'Closed Won' ? 100 : stageId === 'Closed Lost' ? 0 : this.getStageProbability(stageId);
    const status = this.getStatusForStage(stageId);
    const updatedDeal: PipelineDeal = {
      ...dealToMove,
      stage: stageId,
      probability,
      status,
      updatedAt: new Date()
    };

    this.allDeals = this.allDeals.map((deal) => deal.id === updatedDeal.id ? updatedDeal : deal);
    this.selectedDeal = updatedDeal;
    this.buildStages();

    this.apiService.updateDeal(dealToMove.id, updatedDeal).subscribe((response) => {
      if (response.success) {
        this.allDeals = this.allDeals.map((deal) => deal.id === updatedDeal.id ? response.data : deal);
        this.selectedDeal = response.data;
        this.buildStages();
        this.showActivity(`${updatedDeal.name} moved to ${stageId}.`);
      }
    });
    this.draggedDeal = null;
  }

  openDeal(deal: PipelineDeal): void {
    this.router.navigate(['/deals', deal.id]);
  }

  selectDeal(deal: PipelineDeal): void {
    this.selectedDeal = deal;
  }

  addNewDeal(): void {
    this.router.navigate(['/deals/new']);
  }

  openProducts(deal: PipelineDeal): void {
    this.router.navigate(['/deals', deal.id, 'products']);
  }

  openNegotiation(deal: PipelineDeal): void {
    this.router.navigate(['/deals', deal.id, 'negotiate']);
  }

  getCompanyName(deal: PipelineDeal): string {
    return deal.company?.name || deal.companyId || 'Company account';
  }

  getDealStatusColor(status: string): string {
    const colors: Record<string, string> = {
      open: 'info',
      negotiation: 'warning',
      proposal_sent: 'primary',
      quote_pending: 'info',
      closed_won: 'success',
      closed_lost: 'danger'
    };
    return colors[status] || 'secondary';
  }

  getStatusLabel(status: string | undefined): string {
    return (status || 'open').replace(/_/g, ' ');
  }

  getNextAction(deal: PipelineDeal): string {
    if (!deal.lineItems?.length) {
      return 'Add products';
    }
    if (!deal.quoteId) {
      return 'Create quote';
    }
    if (deal.stage === 'Negotiation') {
      return 'Review negotiation';
    }
    if (deal.stage === 'Closed Won' && !deal.invoiceId) {
      return 'Create invoice';
    }
    return 'Open deal profile';
  }

  private getStageProbability(stage: string): number {
    const map: Record<string, number> = {
      Prospecting: 25,
      Qualification: 45,
      Proposal: 70,
      Negotiation: 80,
    };
    return map[stage] || 50;
  }

  private getStatusForStage(stage: string): Deal['status'] {
    const map: Record<string, Deal['status']> = {
      Prospecting: 'open',
      Qualification: 'open',
      Proposal: 'proposal_sent',
      Negotiation: 'negotiation',
      'Closed Won': 'closed_won',
      'Closed Lost': 'closed_lost',
    };
    return map[stage] || 'open';
  }

  private showActivity(message: string): void {
    this.activityMessage = message;
    setTimeout(() => {
      this.activityMessage = '';
    }, 4000);
  }
}
