import { ProposalEndStatus } from './Proposal';

export class FapMeetingDecision {
  constructor(
    public proposalPk: number,
    public rankOrder: number,
    public recommendation: ProposalEndStatus,
    public commentForUser: string,
    public commentForManagement: string,
    public submitted: boolean,
    public submittedBy: number | null,
    public instrumentId: number,
    public fapId: number
  ) {}
}
