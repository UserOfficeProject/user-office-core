export class ProposalEvents {
  constructor(
    public proposalPk: number,
    public proposalCreated: boolean,
    public proposalSubmitted: boolean,
    public callEnded: boolean,
    public proposalFapSelected: boolean,
    public proposalInstrumentSelected: boolean,
    public proposalFeasibilityReviewSubmitted: boolean,
    public proposalSampleReviewSubmitted: boolean,
    public proposalAllFapReviewersSelected: boolean,
    public proposalFapReviewSubmitted: boolean,
    public proposalFapMeetingSubmitted: boolean,
    public proposalInstrumentSubmitted: boolean,
    public proposalAccepted: boolean,
    public proposalRejected: boolean,
    public proposalNotified: boolean
  ) {}
}
