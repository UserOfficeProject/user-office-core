import { EventLog } from '../models/EventLog';

export interface EventLogsDataSource {
  set(
    changedBy: number | null,
    eventType: string,
    rowData: string,
    changedObjectId: string,
    description?: string
  ): Promise<EventLog>;
  get(filter: EventLogFilter): Promise<EventLog[]>;
}

export interface EventLogFilter {
  changedObjectId: string;
  eventType: string;
}
