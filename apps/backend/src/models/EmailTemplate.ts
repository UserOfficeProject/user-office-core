export class EmailTemplate {
  constructor(
    public id: number,
    public createdByUserId: number,
    public name: string,
    public description: string,
    public subject: string,
    public body: string
  ) {}
}
