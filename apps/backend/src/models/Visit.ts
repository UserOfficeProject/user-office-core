import 'reflect-metadata';

export class Visit {
  constructor(
    public id: number,
    public proposalPk: number,
    public status: VisitStatus,
    public creatorId: number,
    public teamLeadUserId: number,
    public created: Date,
    public experimentPk: number
  ) {}
}

export enum VisitStatus {
  'DRAFT' = 'DRAFT',
  'ACCEPTED' = 'ACCEPTED',
  'SUBMITTED' = 'SUBMITTED',
}
