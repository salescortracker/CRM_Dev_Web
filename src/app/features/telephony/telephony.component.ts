import { Component } from '@angular/core';
import { Router } from '@angular/router';

type CallOutcome = 'Connected' | 'Missed' | 'Voicemail' | 'Follow-up Needed';

interface CallLog {
  id: string;
  person: string;
  company: string;
  relatedType: 'lead' | 'contact' | 'deal';
  relatedId: string;
  relatedName: string;
  phone: string;
  outcome: CallOutcome;
  duration: string;
  recording: 'Available' | 'Processing' | 'Disabled';
  transcript: string;
  nextAction: string;
}

@Component({
  selector: 'app-telephony',
  standalone: false,
  templateUrl: './telephony.component.html',
  styleUrls: ['./telephony.component.css']
})
export class TelephonyComponent {
  activityMessage = '';
  selectedCallId = 'call-2';

  providers = [
    { name: 'Twilio Voice', status: 'Connected', number: '+1 555-0100', health: 'Recording enabled', icon: 'fa-phone-volume' },
    { name: 'Aircall', status: 'Ready', number: '+1 555-0134', health: 'Missed call sync active', icon: 'fa-headset' },
    { name: 'CloudTalk', status: 'Not connected', number: 'No number assigned', health: 'OAuth setup required', icon: 'fa-cloud' }
  ];

  callLogs: CallLog[] = [
    { id: 'call-1', person: 'John Smith', company: 'ABC Corp', relatedType: 'lead', relatedId: '1', relatedName: 'John Smith lead', phone: '+1 555-1234', outcome: 'Connected', duration: '08:42', recording: 'Available', transcript: 'Discovery call completed. Customer needs a CRM demo and pricing range.', nextAction: 'Schedule discovery meeting' },
    { id: 'call-2', person: 'Operations VP', company: 'Acme Corporation', relatedType: 'deal', relatedId: '6', relatedName: 'Manufacturing Support Retainer', phone: '+1 555-2288', outcome: 'Follow-up Needed', duration: '12:18', recording: 'Available', transcript: 'Customer requested quarterly billing, revised SLA, and counter offer review.', nextAction: 'Open negotiation workspace' },
    { id: 'call-3', person: 'Jane Smith', company: 'TechStart Inc', relatedType: 'contact', relatedId: '2', relatedName: 'Jane Smith', phone: '+1 555-5678', outcome: 'Missed', duration: '00:00', recording: 'Disabled', transcript: 'Missed inbound call. No voicemail captured.', nextAction: 'Create callback task' },
    { id: 'call-4', person: 'Finance Director', company: 'BrightPath Education', relatedType: 'deal', relatedId: '5', relatedName: 'Education Portal Subscription', phone: '+1 555-7711', outcome: 'Voicemail', duration: '01:06', recording: 'Processing', transcript: 'Voicemail says finance needs quote validity extension.', nextAction: 'Create proposal task' }
  ];

  callbackTasks = 2;

  constructor(private router: Router) {}

  get selectedCall(): CallLog {
    return this.callLogs.find((call) => call.id === this.selectedCallId) || this.callLogs[0];
  }

  get missedCalls(): number {
    return this.callLogs.filter((call) => ['Missed', 'Voicemail'].includes(call.outcome)).length;
  }

  get recordings(): number {
    return this.callLogs.filter((call) => call.recording === 'Available').length;
  }

  startCall(call: CallLog): void {
    this.selectedCallId = call.id;
    call.outcome = 'Connected';
    call.duration = '00:01';
    this.showActivity(`Calling ${call.person} from ${call.relatedName}.`);
  }

  createCallbackTask(call: CallLog): void {
    this.callbackTasks += 1;
    this.showActivity(`Callback task created for ${call.person}.`);
  }

  openRecord(call: CallLog): void {
    if (call.relatedType === 'lead') {
      this.router.navigate(['/leads', call.relatedId]);
      return;
    }
    if (call.relatedType === 'contact') {
      this.router.navigate(['/contacts', call.relatedId]);
      return;
    }
    this.router.navigate(['/deals', call.relatedId]);
  }

  openNextStep(call: CallLog): void {
    if (call.relatedType === 'deal' && call.nextAction.toLowerCase().includes('negotiation')) {
      this.router.navigate(['/deals', call.relatedId, 'negotiate']);
      return;
    }
    this.createCallbackTask(call);
  }

  private showActivity(message: string): void {
    this.activityMessage = message;
    setTimeout(() => this.activityMessage = '', 4000);
  }
}
