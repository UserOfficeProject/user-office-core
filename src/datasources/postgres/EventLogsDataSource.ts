import { EventLog } from '../../models/EventLog';
import { EventLogsDataSource, EventLogFilter } from '../EventLogsDataSource';
import database from './database';
import { EventLogRecord } from './records';

export default class PostgresEventLogsDataSource
  implements EventLogsDataSource {
  private createEventLogObject(eventLog: EventLogRecord) {
    return new EventLog(
      eventLog.id,
      eventLog.changed_by,
      eventLog.event_type,
      eventLog.row_data,
      eventLog.event_tstamp,
      eventLog.changed_object_id
    );
  }

  async set(
    changedBy: number,
    eventType: string,
    rowData: string,
    changedObjectId: string
  ) {
    return database
      .insert({
        changed_by: changedBy,
        event_type: eventType,
        row_data: rowData,
        changed_object_id: changedObjectId,
      })
      .returning('*')
      .into('event_logs')
      .then((records: EventLogRecord[]) =>
        this.createEventLogObject(records[0])
      );
  }

  async get(filter: EventLogFilter) {
    return database
      .select()
      .from('event_logs')
      .modify(queryBuilder => {
        if (filter.changedObjectId && filter.changedObjectId !== '*') {
          queryBuilder.where('changed_object_id', filter.changedObjectId);
        }

        if (filter.eventType && filter.eventType !== '*') {
          queryBuilder.where('event_type', 'like', `${filter.eventType}%`);
        }
      })
      .then((eventLogs: EventLogRecord[]) => {
        return eventLogs.map(eventLog => this.createEventLogObject(eventLog));
      });
  }
}
