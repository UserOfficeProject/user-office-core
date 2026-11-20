export class TechnicalReview {
  constructor(
    public id: number,
    public proposalPk: number,
    public comment: string | null,
    public publicComment: string | null,
    public timeAllocation: number | null,
    public status: TechnicalReviewStatus | null,
    public submitted: boolean,
    public reviewerId: number,
    public files: string | null,
    public technicalReviewAssigneeId: number | null,
    public instrumentId: number,
    public questionaryId: number
  ) {}
}

export enum TechnicalReviewStatus {
  FEASIBLE = 0,
  UNFEASIBLE = 2,
}
