export class Review {
  constructor(
    public id: number,
    public proposalPk: number,
    public userID: number,
    public comment: string,
    public grade: string,
    public status: number,
    public fapID: number,
    public questionaryID: number,
    public dateAssigned: Date,
    public reassigned: boolean,
    public dateReassigned: Date | null,
    public emailSent: boolean,
    public rank: number | null
  ) {}
}

export enum ReviewStatus {
  DRAFT = 0,
  SUBMITTED = 1,
}

export enum ReviewerFilter {
  ME = 0,
  ALL = 1,
}
