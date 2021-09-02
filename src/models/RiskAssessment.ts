export class RiskAssessment {
  constructor(
    public riskAssessmentId: number,
    public proposalPk: number,
    public scheduledEventId: number,
    public creatorUserId: number,
    public questionaryId: number,
    public status: RiskAssessmentStatus,
    public createdAt: Date
  ) {}
}

export enum RiskAssessmentStatus {
  'DRAFT' = 'DRAFT',
  'SUBMITTED' = 'SUBMITTED',
}
