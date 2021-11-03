import { ScheduledEventCore } from '../models/ScheduledEventCore';

export interface ScheduledEventDataSource {
  getScheduledEvent(id: number): Promise<ScheduledEventCore | null>;
}
