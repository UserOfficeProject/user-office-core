export class StatusChangingEvent {
  constructor(
    public statusChangingEventId: number,
    public proposalWorkflowConnectionId: number,
    public statusChangingEvent: string
  ) {}
}
