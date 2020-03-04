import { EventLog } from '../models/EventLog';

export interface EventLogsDataSource {
  set(
    changedBy: number,
    eventType: string,
    rowData: string,
    eventTStamp: string,
    changedObjectId: number
  ): Promise<EventLog>;
  get(id: number): Promise<EventLog[] | null>;
}
