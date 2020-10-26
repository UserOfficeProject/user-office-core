export enum ProposalEndStatus {
  UNSET = 0,
  ACCEPTED,
  RESERVED,
  REJECTED,
}

export enum ProposalPublicStatus {
  draft = 'draft',
  submitted = 'submitted',
  accepted = 'accepted',
  rejected = 'rejected',
  unknown = 'unknown',
  reserved = 'reserved',
}

export class Proposal {
  constructor(
    public id: number,
    public title: string,
    public abstract: string,
    public proposerId: number,
    public statusId: number,
    public created: Date,
    public updated: Date,
    public shortCode: string,
    public rankOrder: number,
    public finalStatus: ProposalEndStatus,
    public callId: number,
    public questionaryId: number,
    public commentForUser: string,
    public commentForManagement: string,
    public notified: boolean,
    public submitted: boolean
  ) {}
}
