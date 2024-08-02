export class StatusActionsLog {
  constructor(
    public statusActionsLogId: number,
    public parentStatusActionsLogId: number | null,
    public connectionId: number,
    public actionId: number,
    public statusActionsStep: string,
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
