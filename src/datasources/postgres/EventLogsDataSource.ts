import database from './database';
import { EventLogsDataSource } from '../EventLogsDataSource';
import { EventLog } from '../../models/EventLog';

export default class PostgresEventLogsDataSource
  implements EventLogsDataSource {
  private createEventLogObject(eventLog: EventLog) {
    return new EventLog(
      eventLog.id,
      eventLog.changedBy,
      eventLog.eventType,
      eventLog.rowData,
      eventLog.eventTStamp,
      eventLog.changedObjectId
    );
  }

  async set(
    changedBy: number,
    eventType: string,
    rowData: string,
    eventTStamp: string,
    changedObjectId: number
  ) {
    return database
      .insert({
        changedBy,
        eventType,
        rowData,
        eventTStamp,
        changedObjectId,
      })
      .returning('*')
      .into('event_logs')
      .then((records: EventLog[]) => this.createEventLogObject(records[0]));
  }

  async get(id: number) {
    return database
      .select()
      .from('event_logs')
      .where('changed_object_id', id)
      .then((eventLogs: EventLog[]) => {
        return eventLogs.map(
          (eventLog: EventLog) =>
            new EventLog(
              eventLog.id,
              eventLog.changedBy,
              eventLog.eventType,
              eventLog.rowData,
              eventLog.eventTStamp,
              eventLog.changedObjectId
            )
        );
      });
  }
}
