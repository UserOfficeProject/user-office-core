import { EventStatus } from '../events/applicationEvents';
import { EventLog } from '../models/EventLog';

export interface EventLogsDataSource {
  set(
    eventId: string | null,
    changedBy: number | null,
    eventType: string,
    rowData: string,
    changedObjectId: string,
    eventStatus: EventStatus | null,
    description?: string
  ): Promise<EventLog>;
  get(filter: EventLogFilter): Promise<EventLog[]>;
}

export interface EventLogFilter {
  changedObjectId: string;
  eventType: string;
  id?: number;
}
