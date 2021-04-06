import 'reflect-metadata';
import { container } from 'tsyringe';

import {
  dummyEventLogUserUpdated,
  dummyEventLogs,
  dummyEventLogProposalCreated,
} from '../datasources/mockups/EventLogsDataSource';
import {
  dummyUserOfficerWithRole,
  dummyUserWithRole,
} from '../datasources/mockups/UserDataSource';
import EventLogQueries from './EventLogQueries';

const eventLogQueries = container.resolve(EventLogQueries);

describe('Test EventLogQueries', () => {
  test('A userofficer can get all event logs if no filter is passed', () => {
    return expect(
      eventLogQueries.getAll(dummyUserOfficerWithRole)
    ).resolves.toStrictEqual(dummyEventLogs);
  });

  test('A userofficer can get all `USER` related event logs if eventType `USER` is passed as filter', () => {
    return expect(
      eventLogQueries.getAll(dummyUserOfficerWithRole, {
        eventType: 'USER',
        changedObjectId: '*',
      })
    ).resolves.toStrictEqual([dummyEventLogUserUpdated]);
  });

  test('A userofficer can get all `PROPOSAL_CREATED` event logs if eventType `PROPOSAL_CREATED` is passed as filter', () => {
    return expect(
      eventLogQueries.getAll(dummyUserOfficerWithRole, {
        eventType: 'PROPOSAL_CREATED',
        changedObjectId: '*',
      })
    ).resolves.toStrictEqual([dummyEventLogProposalCreated]);
  });

  test('A userofficer can get all event logs related to some object(user, proposal...) if changedObjectId is passed in the filter', () => {
    return expect(
      eventLogQueries.getAll(dummyUserOfficerWithRole, {
        eventType: '*',
        changedObjectId: '1',
      })
    ).resolves.toStrictEqual([dummyEventLogUserUpdated]);
  });

  test('A user cannot query all proposals', () => {
    return expect(eventLogQueries.getAll(dummyUserWithRole)).resolves.toBe(
      null
    );
  });
});
