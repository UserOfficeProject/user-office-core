export class Call {
  constructor(
    public id: number,
    public shortCode: string,
    public startCall: Date,
    public endCall: Date,
    public startReview: Date,
    public endReview: Date,
    public startSEPReview: Date,
    public endSEPReview: Date,
    public startNotify: Date,
    public endNotify: Date,
    public startCycle: Date,
    public endCycle: Date,
    public cycleComment: string,
    public surveyComment: string,
    public referenceNumberFormat: string,
    public proposalSequence: number,
    public proposalWorkflowId: number,
    public callEnded: boolean,
    public callReviewEnded: boolean,
    public callSEPReviewEnded: boolean,
    public templateId: number
  ) {}
}
