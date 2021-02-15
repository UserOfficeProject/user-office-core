export class TechnicalReview {
  constructor(
    public id: number,
    public proposalID: number,
    public comment: string,
    public publicComment: string,
    public timeAllocation: number,
    public status: number,
    public submitted: boolean
  ) {}
}

export enum TechnicalReviewStatus {
  FEASIBLE = 0,
  PARTIALLY_FEASIBLE = 1,
  UNFEASIBLE = 2,
}
