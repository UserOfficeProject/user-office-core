import { ScheduledEventCore } from '../../models/ScheduledEventCore';
import { ScheduledEventsFilter } from '../../resolvers/queries/ScheduledEventsQuery';
import { ScheduledEventDataSource } from '../ScheduledEventDataSource';
import database from './database';
import { createScheduledEventObject, ScheduledEventRecord } from './records';

export default class PostgresScheduledEventDataSource
  implements ScheduledEventDataSource
{
  async getScheduledEvents(
    filter: ScheduledEventsFilter
  ): Promise<ScheduledEventCore[]> {
    return database
      .select('*')
      .from('scheduled_events')
      .where((query) => {
        if (filter.endsBefore) {
          query.where('ends_at', '<', filter.endsBefore);
        }
        if (filter.endsAfter) {
          query.where('ends_at', '>', filter.endsAfter);
        }
      })
      .then((rows: ScheduledEventRecord[]) =>
        rows.map((row) => createScheduledEventObject(row))
      );
  }
  async getScheduledEvent(id: number): Promise<ScheduledEventCore | null> {
    return database
      .select('*')
      .from('scheduled_events')
      .where('scheduled_event_id', id)
      .first()
      .then((row: ScheduledEventRecord) =>
        row ? createScheduledEventObject(row) : null
      );
  }
}
