import { EventStatus } from '../events/applicationEvents';

export class EventLog {
  constructor(
    public id: number,
    public eventId: string | null,
    public changedBy: number | null,
    public eventType: string,
    public eventStatus: EventStatus | null,
    public rowData: string,
    public eventTStamp: Date,
    public changedObjectId: string,
    public description: string
  ) {}
}
