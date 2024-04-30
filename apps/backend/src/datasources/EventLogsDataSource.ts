import { EventLog } from '../models/EventLog';

export interface EventLogsDataSource {
  set(
    changedBy: number | null,
    eventType: string,
    rowData: string,
    changedObjectId: string
  ): Promise<EventLog>;
  get(filter: EventLogFilter): Promise<EventLog[] | null>;
}

export interface EventLogFilter {
  changedObjectId: string;
  eventType: string;
}
