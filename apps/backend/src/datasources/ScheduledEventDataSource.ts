import { ScheduledEventCore } from '../models/ScheduledEventCore';
import { ScheduledEventsCoreArgs } from '../resolvers/queries/ScheduledEventsCoreQuery';

export interface ScheduledEventDataSource {
  getScheduledEventsCore(
    args: ScheduledEventsCoreArgs
  ): Promise<ScheduledEventCore[]>;
  getScheduledEventCore(id: number): Promise<ScheduledEventCore | null>;
}
