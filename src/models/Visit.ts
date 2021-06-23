import 'reflect-metadata';

export class Visit {
  constructor(
    public id: number,
    public proposalPk: number,
    public status: VisitStatus,
    public questionaryId: number,
    public visitorId: number,
    public created: Date
  ) {}
}

export enum VisitStatus {
  'DRAFT' = 'DRAFT',
  'ACCEPTED' = 'ACCEPTED',
  'SUBMITTED' = 'SUBMITTED',
}
