export class TechnicalReview {
  constructor(
    public id: number,
    public proposalID: number,
    public comment: string,
    public publicComment: string,
    public timeAllocation: number,
    public status: TechnicalReviewStatus,
    public submitted: boolean,
    public reviewerId: number
  ) {}
}

export enum TechnicalReviewStatus {
  FEASIBLE = 0,
  PARTIALLY_FEASIBLE = 1,
  UNFEASIBLE = 2,
}
