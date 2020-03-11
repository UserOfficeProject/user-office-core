import 'reflect-metadata';
import { UserAuthorization } from '../utils/UserAuthorization';
import {
  eventLogsDataSource,
  dummyEventLogUserUpdated,
  dummyEventLogs,
  dummyEventLogProposalCreated,
} from '../datasources/mockups/EventLogsDataSource';
import { reviewDataSource } from '../datasources/mockups/ReviewDataSource';
import {
  userDataSource,
  dummyUser,
  dummyUserOfficer,
} from '../datasources/mockups/UserDataSource';
import EventLogQueries from './EventLogQueries';

const dummyEventLogDataSource = new eventLogsDataSource();
const userAuthorization = new UserAuthorization(
  new userDataSource(),
  new reviewDataSource()
);
const eventLogQueries = new EventLogQueries(
  dummyEventLogDataSource,
  userAuthorization
);

describe('Test EventLogQueries', () => {
  test('A userofficer can get all event logs if no filter is passed', () => {
    return expect(
      eventLogQueries.getAll(dummyUserOfficer)
    ).resolves.toStrictEqual(dummyEventLogs);
  });

  test('A userofficer can get all `USER` related event logs if eventType `USER` is passed as filter', () => {
    return expect(
      eventLogQueries.getAll(dummyUserOfficer, {
        eventType: 'USER',
        changedObjectId: '*',
      })
    ).resolves.toStrictEqual([dummyEventLogUserUpdated]);
  });

  test('A userofficer can get all `PROPOSAL_CREATED` event logs if eventType `PROPOSAL_CREATED` is passed as filter', () => {
    return expect(
      eventLogQueries.getAll(dummyUserOfficer, {
        eventType: 'PROPOSAL_CREATED',
        changedObjectId: '*',
      })
    ).resolves.toStrictEqual([dummyEventLogProposalCreated]);
  });

  test('A userofficer can get all event logs related to some object(user, proposal...) if changedObjectId is passed in the filter', () => {
    return expect(
      eventLogQueries.getAll(dummyUserOfficer, {
        eventType: '*',
        changedObjectId: '1',
      })
    ).resolves.toStrictEqual([dummyEventLogUserUpdated]);
  });

  test('A user cannot query all proposals', () => {
    return expect(eventLogQueries.getAll(dummyUser)).resolves.toBe(null);
  });
});
