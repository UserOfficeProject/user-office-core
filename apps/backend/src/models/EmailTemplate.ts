export class EmailTemplate {
  constructor(
    public id: number,
    public createdByUserId: number,
    public name: string,
    public description: string,
    public useTemplateFile: boolean,
    public subject: string,
    public body: string
  ) {}
}
