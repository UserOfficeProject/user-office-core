export class StatusChangingEvent {
  constructor(
    public statusChangingEventId: number,
    public workflowConnectionId: number,
    public statusChangingEvent: string,
    public entityType: 'proposal' | 'experiment'
  ) {}
}
