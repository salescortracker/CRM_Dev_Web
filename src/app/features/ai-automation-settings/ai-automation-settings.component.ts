import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuditLogService } from '../../services/audit-log.service';
import { PlatformStorageService } from '../../services/platform-storage.service';

type RecommendationType = 'Lead Score' | 'Deal Action' | 'Reminder' | 'Assignment' | 'Chatbot';

interface AiRecommendation {
  id: string;
  type: RecommendationType;
  title: string;
  recordType: 'lead' | 'deal' | 'task';
  recordId: string;
  recordName: string;
  confidence: number;
  reason: string;
  action: string;
  applied?: boolean;
  appliedAt?: string;
}

interface AiLogEntry {
  time: string;
  event: string;
  result: string;
}

interface AiAutomationState {
  settings: {
    aiLeadScoring: boolean;
    nextBestAction: boolean;
    smartReminders: boolean;
    chatbotEnabled: boolean;
    autoAssignmentThreshold: number;
    staleLeadDays: number;
    dealRiskThreshold: number;
  };
  recommendations: AiRecommendation[];
  aiLogs: AiLogEntry[];
}

@Component({
  selector: 'app-ai-automation-settings',
  standalone: false,
  templateUrl: './ai-automation-settings.component.html',
  styleUrls: ['./ai-automation-settings.component.css']
})
export class AiAutomationSettingsComponent implements OnInit {
  private readonly storageKey = 'ai-automation-settings';
  activityMessage = '';
  selectedRecommendationId = 'ai-1';
  aiLeadScoring = true;
  nextBestAction = true;
  smartReminders = true;
  chatbotEnabled = false;
  autoAssignmentThreshold = 82;
  staleLeadDays = 3;
  dealRiskThreshold = 35;

  recommendations: AiRecommendation[] = [
    { id: 'ai-1', type: 'Lead Score', title: 'John Smith is ready for discovery', recordType: 'lead', recordId: '1', recordName: 'John Smith | ABC Corp', confidence: 94, reason: 'Website source, high score, and recent email engagement.', action: 'Schedule discovery meeting' },
    { id: 'ai-2', type: 'Deal Action', title: 'Counter offer needs manager review', recordType: 'deal', recordId: '6', recordName: 'Manufacturing Support Retainer', confidence: 89, reason: 'Discount request and SLA change are above normal approval limits.', action: 'Open negotiation workspace' },
    { id: 'ai-3', type: 'Reminder', title: 'Invoice follow-up is becoming urgent', recordType: 'deal', recordId: '7', recordName: 'TechStart Expansion Add-on', confidence: 86, reason: 'Payment link support ticket and invoice due date are close.', action: 'Create payment reminder task' },
    { id: 'ai-4', type: 'Assignment', title: 'Assign healthcare migration to Nate Hill', recordType: 'deal', recordId: '4', recordName: 'Healthcare CRM Migration', confidence: 78, reason: 'Nate owns healthcare territory and has recent compliance wins.', action: 'Assign owner' },
    { id: 'ai-5', type: 'Chatbot', title: 'Train bot on quote FAQ', recordType: 'task', recordId: '2', recordName: 'Proposal FAQ assistant', confidence: 72, reason: 'Customers repeatedly ask about pricing, billing, and SLA terms.', action: 'Update chatbot knowledge base' }
  ];

  aiLogs: AiLogEntry[] = [
    { time: 'Just now', event: 'Lead score recalculated for John Smith', result: 'Score 94' },
    { time: '18 minutes ago', event: 'Suggested counter offer approval workflow', result: 'High confidence' },
    { time: 'Today, 9:40 AM', event: 'Smart reminder created for invoice follow-up', result: 'Task suggested' },
    { time: 'Yesterday', event: 'Chatbot answered 23 website questions', result: '8 leads captured' }
  ];

  constructor(
    private router: Router,
    private storage: PlatformStorageService,
    private audit: AuditLogService
  ) {}

  ngOnInit(): void {
    const saved = this.storage.get<AiAutomationState | null>(this.storageKey, null);
    if (saved) {
      this.aiLeadScoring = saved.settings.aiLeadScoring;
      this.nextBestAction = saved.settings.nextBestAction;
      this.smartReminders = saved.settings.smartReminders;
      this.chatbotEnabled = saved.settings.chatbotEnabled;
      this.autoAssignmentThreshold = saved.settings.autoAssignmentThreshold;
      this.staleLeadDays = saved.settings.staleLeadDays;
      this.dealRiskThreshold = saved.settings.dealRiskThreshold;
      this.recommendations = saved.recommendations;
      this.aiLogs = saved.aiLogs;
      return;
    }

    this.persist();
  }

  get selectedRecommendation(): AiRecommendation {
    return this.recommendations.find((item) => item.id === this.selectedRecommendationId) || this.recommendations[0];
  }

  applyRecommendation(recommendation: AiRecommendation): void {
    this.selectedRecommendationId = recommendation.id;
    recommendation.applied = true;
    recommendation.appliedAt = new Date().toISOString();
    this.aiLogs.unshift({
      time: 'Just now',
      event: `${recommendation.action} applied for ${recommendation.recordName}`,
      result: `${recommendation.confidence}% confidence`
    });
    this.persist();
    this.audit.record(
      'AI Settings',
      'Recommendation Applied',
      `${recommendation.action} applied for ${recommendation.recordName}.`,
      recommendation.confidence >= 85 ? 'Info' : 'Warning',
      this.getRelatedRoute(recommendation)
    );
    this.showActivity(`${recommendation.action} applied for ${recommendation.recordName}.`);
  }

  openRecord(recommendation: AiRecommendation): void {
    if (recommendation.recordType === 'lead') {
      this.router.navigate(['/leads', recommendation.recordId]);
      return;
    }
    if (recommendation.recordType === 'deal' && recommendation.action.toLowerCase().includes('negotiation')) {
      this.router.navigate(['/deals', recommendation.recordId, 'negotiate']);
      return;
    }
    if (recommendation.recordType === 'deal') {
      this.router.navigate(['/deals', recommendation.recordId]);
      return;
    }
    this.router.navigate(['/tasks']);
  }

  saveSettings(): void {
    this.persist();
    this.audit.record(
      'AI Settings',
      'Settings Saved',
      `AI controls saved. Auto assignment threshold: ${this.autoAssignmentThreshold}%, stale lead days: ${this.staleLeadDays}.`,
      'Info',
      '/ai-automation-settings'
    );
    this.showActivity(`AI settings saved with ${this.autoAssignmentThreshold}% assignment threshold.`);
  }

  retrainModels(): void {
    this.aiLogs.unshift({ time: 'Just now', event: 'AI model retraining started from CRM activity data', result: 'Queued' });
    this.persist();
    this.audit.record(
      'AI Settings',
      'Model Retraining Queued',
      'AI retraining queued from leads, deals, activities, and task history.',
      'Info',
      '/ai-automation-settings'
    );
    this.showActivity('AI retraining queued.');
  }

  private persist(): void {
    this.storage.set<AiAutomationState>(this.storageKey, {
      settings: {
        aiLeadScoring: this.aiLeadScoring,
        nextBestAction: this.nextBestAction,
        smartReminders: this.smartReminders,
        chatbotEnabled: this.chatbotEnabled,
        autoAssignmentThreshold: this.autoAssignmentThreshold,
        staleLeadDays: this.staleLeadDays,
        dealRiskThreshold: this.dealRiskThreshold
      },
      recommendations: this.recommendations,
      aiLogs: this.aiLogs.slice(0, 50)
    });
  }

  private getRelatedRoute(recommendation: AiRecommendation): string {
    if (recommendation.recordType === 'lead') {
      return `/leads/${recommendation.recordId}`;
    }
    if (recommendation.recordType === 'deal' && recommendation.action.toLowerCase().includes('negotiation')) {
      return `/deals/${recommendation.recordId}/negotiate`;
    }
    if (recommendation.recordType === 'deal') {
      return `/deals/${recommendation.recordId}`;
    }
    return '/tasks';
  }

  private showActivity(message: string): void {
    this.activityMessage = message;
    setTimeout(() => this.activityMessage = '', 4000);
  }
}
