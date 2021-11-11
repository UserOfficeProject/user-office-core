import { ScheduledEventCore } from '../../models/ScheduledEventCore';
import { ScheduledEventDataSource } from '../ScheduledEventDataSource';
import database from './database';
import { createScheduledEventObject, ScheduledEventRecord } from './records';

export default class PostgresScheduledEventDataSource
  implements ScheduledEventDataSource
{
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
