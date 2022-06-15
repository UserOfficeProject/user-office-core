export class ProposalEvents {
  constructor(
    public proposalPk: number,
    public proposalCreated: boolean,
    public proposalSubmitted: boolean,
    public callEnded: boolean,
    public proposalSepSelected: boolean,
    public proposalInstrumentSelected: boolean,
    public proposalFeasibilityReviewSubmitted: boolean,
    public proposalSampleReviewSubmitted: boolean,
    public proposalAllSepReviewersSelected: boolean,
    public proposalSepReviewSubmitted: boolean,
    public proposalSepMeetingSubmitted: boolean,
    public proposalInstrumentSubmitted: boolean,
    public proposalAccepted: boolean,
    public proposalRejected: boolean,
    public proposalNotified: boolean
  ) {}
}
