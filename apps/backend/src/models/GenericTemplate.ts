export class GenericTemplate {
  constructor(
    public id: number,
    public title: string,
    public creatorId: number,
    public proposalPk: number,
    public questionaryId: number,
    public questionId: string,
    public created: Date
  ) {}
}
