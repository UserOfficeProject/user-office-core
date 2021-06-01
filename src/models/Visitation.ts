import 'reflect-metadata';

export class Visitation {
  constructor(
    public id: number,
    public proposalId: number,
    public status: VisitationStatus,
    public questionaryId: number,
    public visitorId: number,
    public created: Date
  ) {}
}

export enum VisitationStatus {
  'DRAFT' = 'DRAFT',
  'ACCEPTED' = 'ACCEPTED',
  'SUBMITTED' = 'SUBMITTED',
}
