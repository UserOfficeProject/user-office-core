import { EventLog } from '../models/EventLog';

export interface EventLogsDataSource {
  set(
    changedBy: number,
    eventType: string,
    rowData: string,
    changedObjectId: number
  ): Promise<EventLog>;
  get(filter: EventLogFilter): Promise<EventLog[] | null>;
}

export interface EventLogFilter {
  changedObjectId: string;
  eventType: string;
}
