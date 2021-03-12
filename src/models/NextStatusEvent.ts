export class NextStatusEvent {
  constructor(
    public nextStatusEventId: number,
    public proposalWorkflowConnectionId: number,
    public nextStatusEvent: string
  ) {}
}
