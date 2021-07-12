export class Review {
  constructor(
    public id: number,
    public proposalPk: number,
    public userID: number,
    public comment: string,
    public grade: number,
    public status: number
  ) {}
}
