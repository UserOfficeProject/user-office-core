export class PredefinedMessage {
  constructor(
    public id: number,
    public shortCode: string,
    public message: string,
    public dateModified: Date,
    public lastModifiedBy: number
  ) {}
}
