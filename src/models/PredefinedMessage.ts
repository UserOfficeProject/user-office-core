export class PredefinedMessage {
  constructor(
    public id: number,
    public title: string,
    public message: string,
    public dateModified: Date,
    public lastModifiedBy: number
  ) {}
}
