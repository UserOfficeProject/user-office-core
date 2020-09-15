export enum ProposalStatusEnum {
  BLANK = -1,
  DRAFT = 0,
  SUBMITTED = 1,
}

export enum ProposalEndStatus {
  UNSET = 0,
  ACCEPTED = 1,
  RESERVED = 2,
  REJECTED = 3,
}
export class Proposal {
  constructor(
    public id: number,
    public title: string,
    public abstract: string,
    public proposerId: number,
    public status: ProposalStatusEnum,
    public created: Date,
    public updated: Date,
    public shortCode: string,
    public rankOrder: number,
    public finalStatus: number, // Should use ProposalEndStatus enum here
    public callId: number,
    public questionaryId: number,
    public commentForUser: string,
    public commentForManagement: string,
    public notified: boolean
  ) {}
}
