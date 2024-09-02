export class StatusActionsLog {
  full_count: any;
  constructor(
    public statusActionsLogId: number,
    public connectionId: number,
    public actionId: number,
    public emailStatusActionRecipient: string,
    public statusActionsBy: number | null,
    public statusActionsSuccessful: boolean,
    public statusActionsMessage: string,
    public statusActionsTstamp: Date
  ) {}
}

export class StatusActionsLogHasProposal {
  constructor(
    public statusActionsLogId: number,
    public proposalPk: number
  ) {}
}
