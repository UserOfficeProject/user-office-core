export class StatusChangingEvent {
  constructor(
    public workflowConnectionId: number,
    public statusChangingEvent: string
  ) {}
}
