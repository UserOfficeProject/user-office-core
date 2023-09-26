import 'reflect-metadata';

export class Visit {
  constructor(
    public id: number,
    public proposalPk: number,
    public status: VisitStatus,
    public creatorId: number,
    public teamLeadUserId: number,
    public scheduledEventId: number,
    public created: Date
  ) {}
}

export enum VisitStatus {
  'DRAFT' = 'DRAFT',
  'ACCEPTED' = 'ACCEPTED',
  'SUBMITTED' = 'SUBMITTED',
}
