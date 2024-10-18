import 'reflect-metadata';
import { container } from 'tsyringe';

import { dummyStatusActionsLog } from '../datasources/mockups/StatusActionsLogsDataSource';
import { dummyUserOfficerWithRole } from '../datasources/mockups/UserDataSource';
import StatusActionsLogsQueries from './StatusActionsLogsQueries';

const statusActionsLogsQueries = container.resolve(StatusActionsLogsQueries);

describe('Test Status Actions Logs Queries', () => {
  test('A userofficer can get Status actions logs', async () => {
    return expect(
      statusActionsLogsQueries.getStatusActionsLogs(
        dummyUserOfficerWithRole,
        {}
      )
    ).resolves.toEqual(
      expect.objectContaining({
        totalCount: 1,
        statusActionsLogs: [dummyStatusActionsLog],
      })
    );
  });

  test('A userofficer can get Status actions log by id', () => {
    return expect(
      statusActionsLogsQueries.getStatusActionsLog(dummyUserOfficerWithRole, 1)
    ).resolves.toEqual(dummyStatusActionsLog);
  });
});
