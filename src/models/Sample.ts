export class Sample {
  constructor(
    public id: number,
    public title: string,
    public creatorId: number,
    public questionaryId: number,
    public safetyStatus: SampleStatus,
    public safetyComment: string,
    public created: Date
  ) {}
}

export enum SampleStatus {
  PENDING_EVALUATION = 0,
  LOW_RISK,
  ELEVATED_RISK,
  HIGH_RISK,
}
