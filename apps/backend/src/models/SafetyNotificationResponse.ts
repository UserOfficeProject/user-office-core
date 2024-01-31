import { Proposal } from './Proposal';

export class SafetyNotificationResponse {
  constructor(
    public proposal: Proposal,
    public safetyManagerEmails: string[],
    public templateId: string
  ) {}
}
