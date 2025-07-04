import { EventLog } from '../../models/EventLog';
import { EventLogsDataSource, EventLogFilter } from '../EventLogsDataSource';
import database from './database';
import { EventLogRecord } from './records';

export default class PostgresEventLogsDataSource
  implements EventLogsDataSource
{
  private createEventLogObject(eventLog: EventLogRecord) {
    return new EventLog(
      eventLog.id,
      eventLog.changed_by,
      eventLog.event_type,
      eventLog.row_data,
      eventLog.event_tstamp,
      eventLog.changed_object_id,
      eventLog.description
    );
  }

  async set(
    changedBy: number,
    eventType: string,
    rowData: string,
    changedObjectId: string,
    description?: string,
    impersonatingUserId?: number
  ) {
    const isImpersonating =
      impersonatingUserId != null && impersonatingUserId !== changedBy;

    const actingUserId = impersonatingUserId ?? changedBy;

    const updatedDescription = isImpersonating
      ? `${description || ''} (userId:${impersonatingUserId} impersonating userId:${changedBy})`
      : description;

    return database
      .insert({
        changed_by: actingUserId,
        event_type: eventType,
        row_data: rowData,
        changed_object_id: changedObjectId,
        description: updatedDescription,
        impersonating_user_id: impersonatingUserId,
      })
      .returning('*')
      .into('event_logs')
      .then((records: EventLogRecord[]) =>
        this.createEventLogObject(records[0])
      );
  }

  async get(filter: EventLogFilter) {
    let whereRawQuery = '';

    if (filter.changedObjectId && filter.changedObjectId !== '*') {
      whereRawQuery += `changed_object_id = '${filter.changedObjectId}'`;
    }

    /** NOTE: This should make OR operator possible in eventTypes.
     * For example we can have something like this in the end:
     * select * from event_logs where changed_object_id = '3' and (event_type like 'USER%' or event_type like 'EMAIL_INVITE%')
     */
    if (filter.eventType && filter.eventType !== '*') {
      const eventTypes = filter.eventType.split('|');
      eventTypes.forEach((element, index) => {
        if (index === 0) {
          whereRawQuery += ` and (event_type like '${element.trim()}%')`;
        } else {
          whereRawQuery = whereRawQuery.replace(
            ')',
            ` or event_type like '${element.trim()}%')`
          );
        }
      });
    }

    return database
      .select('*')
      .from('event_logs')
      .whereRaw(whereRawQuery)
      .orderBy('event_tstamp', 'asc')
      .then((eventLogs: EventLogRecord[]) => {
        return eventLogs.map((eventLog) => this.createEventLogObject(eventLog));
      });
  }
}
