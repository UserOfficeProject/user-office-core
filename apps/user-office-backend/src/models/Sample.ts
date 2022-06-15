export class Sample {
  constructor(
    public id: number,
    public title: string,
    public creatorId: number,
    public proposalPk: number,
    public questionaryId: number,
    public questionId: string,
    public isPostProposalSubmission: boolean,
    public safetyStatus: SampleStatus,
    public safetyComment: string,
    public created: Date,
    public shipmentId: number | null
  ) {}
}

export enum SampleStatus {
  PENDING_EVALUATION = 0,
  LOW_RISK,
  ELEVATED_RISK,
  HIGH_RISK,
}
