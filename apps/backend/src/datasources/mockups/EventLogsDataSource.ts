import { EventStatus } from '../../events/applicationEvents';
import { EventLog } from '../../models/EventLog';
import { EventLogsDataSource, EventLogFilter } from '../EventLogsDataSource';

export const dummyEventLogUserUpdated = new EventLog(
  1,
  '1',
  1,
  'USER_UPDATED',
  EventStatus.SUCCESSFUL,
  'row data that is updated',
  new Date('2020-03-09 08:25:12.23043+00'),
  '1',
  ''
);

export const dummyEventLogProposalCreated = new EventLog(
  1,
  '2',
  2,
  'PROPOSAL_CREATED',
  EventStatus.SUCCESSFUL,
  'row data of created proposal',
  new Date('2020-03-09 08:30:12.23043+00'),
  '2',
  ''
);

export const dummyEventLogs = [
  dummyEventLogUserUpdated,
  dummyEventLogProposalCreated,
];

export class EventLogsDataSourceMock implements EventLogsDataSource {
  async set(
    eventId: string,
    changedBy: number,
    eventType: string,
    rowData: string,
    changedObjectId: string,
    eventStatus: EventStatus,
    description?: string
  ) {
    return dummyEventLogUserUpdated;
  }

  async get(filter: EventLogFilter) {
    let dummyEventLogsCopy = [...dummyEventLogs];

    if (filter.changedObjectId && filter.changedObjectId !== '*') {
      dummyEventLogsCopy = dummyEventLogsCopy.filter(
        (eventLog) => eventLog.changedObjectId === filter.changedObjectId
      );
    }

    if (filter.eventType && filter.eventType !== '*') {
      dummyEventLogsCopy = dummyEventLogsCopy.filter((eventLog) =>
        eventLog.eventType.includes(filter.eventType)
      );
    }

    return dummyEventLogsCopy;
  }
}
