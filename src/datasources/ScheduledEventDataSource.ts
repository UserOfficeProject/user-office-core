import { ScheduledEventCore } from '../models/ScheduledEventCore';
import { ScheduledEventsFilter } from '../resolvers/queries/ScheduledEventsQuery';

export interface ScheduledEventDataSource {
  getScheduledEvents(
    filter: ScheduledEventsFilter
  ): Promise<ScheduledEventCore[]>;
  getScheduledEvent(id: number): Promise<ScheduledEventCore | null>;
}
