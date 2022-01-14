import { ScheduledEventCore } from '../models/ScheduledEventCore';
import { ScheduledEventsCoreFilter } from '../resolvers/queries/ScheduledEventsCoreQuery';

export interface ScheduledEventDataSource {
  getScheduledEventsCore(
    filter: ScheduledEventsCoreFilter
  ): Promise<ScheduledEventCore[]>;
  getScheduledEventCore(id: number): Promise<ScheduledEventCore | null>;
}
