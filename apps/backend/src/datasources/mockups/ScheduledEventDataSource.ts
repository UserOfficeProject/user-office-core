import { DateTime } from 'luxon';

import { ScheduledEventCore } from '../../models/ScheduledEventCore';
import { ScheduledEventDataSource } from '../ScheduledEventDataSource';
import { ScheduledEventsCoreArgs } from './../../resolvers/queries/ScheduledEventsCoreQuery';
import {
  ScheduledEventBookingType,
  ProposalBookingStatusCore,
} from './../../resolvers/types/ProposalBooking';

export default class ScheduledEventDataSourceMock
  implements ScheduledEventDataSource
{
  scheduledEvents: ScheduledEventCore[];
  constructor() {
    this.init();
  }

  public init() {
    this.scheduledEvents = [
      new ScheduledEventCore(
        1,
        ScheduledEventBookingType.USER_OPERATIONS,
        DateTime.now().toJSDate(),
        DateTime.now().plus({ days: 2 }).toJSDate(),
        1,
        1,
        ProposalBookingStatusCore.ACTIVE,
        1
      ),
      new ScheduledEventCore(
        2,
        ScheduledEventBookingType.USER_OPERATIONS,
        DateTime.now().toJSDate(),
        DateTime.now().plus({ days: 2 }).toJSDate(),
        2,
        2,
        ProposalBookingStatusCore.ACTIVE,
        1
      ),
      // old completed event
      new ScheduledEventCore(
        3,
        ScheduledEventBookingType.USER_OPERATIONS,
        DateTime.now().plus({ days: -366 }).toJSDate(),
        DateTime.now().plus({ days: -365 }).toJSDate(),
        3,
        3,
        ProposalBookingStatusCore.COMPLETED,
        1
      ),
      // recent completed event
      new ScheduledEventCore(
        4,
        ScheduledEventBookingType.USER_OPERATIONS,
        DateTime.now().plus({ days: -28 }).toJSDate(),
        DateTime.now().plus({ days: -27 }).toJSDate(),
        4,
        4,
        ProposalBookingStatusCore.COMPLETED,
        1
      ),
    ];
  }

  async getScheduledEventCore(id: number): Promise<ScheduledEventCore | null> {
    return this.scheduledEvents.find((esi) => esi.id === id) || null;
  }

  async getScheduledEventsCore({
    filter,
  }: ScheduledEventsCoreArgs): Promise<ScheduledEventCore[]> {
    return this.scheduledEvents
      .filter((esi) => {
        if (filter?.endsBefore) {
          return esi.endsAt < filter.endsBefore;
        }

        return true;
      })
      .filter((esi) => {
        if (filter?.endsAfter) {
          return esi.endsAt > filter.endsAfter;
        }

        return true;
      });
  }
}
