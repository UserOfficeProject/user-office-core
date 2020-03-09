export class EventLog {
  constructor(
    public id: number,
    public changedBy: number,
    public eventType: string,
    public rowData: string,
    public eventTStamp: Date,
    public changedObjectId: string
  ) {}
}
