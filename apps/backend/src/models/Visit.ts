import 'reflect-metadata';

export class Visit {
  constructor(
    public id: number,
    public proposalPk: number,
    public creatorId: number,
    public teamLeadUserId: number,
    public created: Date,
    public experimentPk: number
  ) {}
}
