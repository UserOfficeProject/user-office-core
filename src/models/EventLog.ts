export class EventLog {
  constructor(
    public id: number,
    public changedBy: number,
    public eventType: string,
    public rowData: string,
    public eventTStamp: string,
    public changedObjectId: number
  ) {}
}
