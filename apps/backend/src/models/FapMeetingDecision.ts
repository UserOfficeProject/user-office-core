import { ProposalEndStatus } from './Proposal';

export class FapMeetingDecision {
  constructor(
    public proposalPk: number,
    public recommendation: ProposalEndStatus,
    public commentForUser: string,
    public commentForManagement: string,
    public submitted: boolean,
    public submittedBy: number | null,
    public recommendedInstrumentId: number,
    public fapId: number,
    public recommendedTimeAllocation: number | null,
    public fapProposalId: number,
    public meetingScore: string | null
  ) {}
}
