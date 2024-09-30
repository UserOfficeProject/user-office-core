export class Review {
  constructor(
    public id: number,
    public proposalPk: number,
    public userID: number,
    public comment: string,
    public grade: number,
    public status: number,
    public fapID: number,
    public questionaryID: number
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
