import { ProposalStatus } from './ProposalStatus';

export class Review {
  constructor(
    public id: number,
    public proposalPk: number,
    public userID: number,
    public comment: string,
    public grade: number,
    public status: number,
    public sepID: number
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

export class ReviewWithNextProposalStatus {
  constructor(
    public id: number,
    public proposalPk: number,
    public userID: number,
    public comment: string,
    public grade: number,
    public status: number,
    public sepID: number,
    public nextProposalStatus: ProposalStatus | null
  ) {}
}
