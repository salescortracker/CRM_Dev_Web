import { Component } from '@angular/core';

interface PipelineStage {
  name: string;
  count: number;
  value: number;
  progress: number;
  color: string;
}

@Component({
  selector: 'app-pipeline',
  standalone: false,
  templateUrl: './pipeline.component.html',
  styleUrls: ['./pipeline.component.css']
})
export class PipelineComponent {
  stages: PipelineStage[] = [
    { name: 'Prospecting', count: 12, value: 92000, progress: 30, color: '#0d6efd' },
    { name: 'Qualification', count: 8, value: 74000, progress: 50, color: '#6f42c1' },
    { name: 'Proposal', count: 5, value: 56000, progress: 70, color: '#198754' },
    { name: 'Negotiation', count: 3, value: 38000, progress: 85, color: '#fd7e14' },
    { name: 'Closed', count: 6, value: 104000, progress: 100, color: '#20c997' }
  ];

  moveStage(stage: PipelineStage, target: string) {
    // placeholder for move action
    console.log(`Move ${stage.name} to ${target}`);
  }
}
