import { EventLog } from '../../models/EventLog';
import { EventLogsDataSource } from '../EventLogsDataSource';

export const dummyEventLog = new EventLog(
  1,
  10,
  'USER_UPDATED',
  'data that is updated',
  'datetime',
  2
);

export class eventLogsDataSource implements EventLogsDataSource {
  async set(
    changedBy: number,
    eventType: string,
    rowData: string,
    eventTStamp: string,
    changedObjectId: number
  ) {
    return dummyEventLog;
  }

  async get(id: number) {
    return [dummyEventLog];
  }
}
