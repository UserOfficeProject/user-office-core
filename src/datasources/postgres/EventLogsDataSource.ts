/* eslint-disable @typescript-eslint/camelcase */
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

        /**
         * NOTE: Like this with '|' we can support query against multiple eventTypes.
         * This is needed in scenarios like get all USER events and EMAIL_INVITE on the user logs.
         */
        const eventTypes = filter.eventType.split('|');

        if (filter.eventType && filter.eventType !== '*') {
          eventTypes.forEach((element, index) => {
            if (index === 0) {
              queryBuilder.where(
                'event_type',
                'like',
                `${eventTypes[0].trim()}%`
              );
            } else {
              queryBuilder.orWhere('event_type', 'like', `${element.trim()}%`);
            }
          });
        }
      })
      .then((eventLogs: EventLogRecord[]) => {
        return eventLogs.map(eventLog => this.createEventLogObject(eventLog));
      });
  }
}
