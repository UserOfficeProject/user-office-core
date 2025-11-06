import 'reflect-metadata';
import { container } from 'tsyringe';

import StatusActionsLogsMutations from './StatusActionsLogsMutations';
import { dummyStatusActionsLog } from '../datasources/mockups/StatusActionsLogsDataSource';
import { dummyUserOfficerWithRole } from '../datasources/mockups/UserDataSource';

const statusActionsLogsMutations = container.resolve(
  StatusActionsLogsMutations
);

describe('Test Status Actions Logs Mutations', () => {
  test('A logged in user officer should be able to replay status actions logs', () => {
    return expect(
      statusActionsLogsMutations.replayStatusActionsLog(
        dummyUserOfficerWithRole,
        dummyStatusActionsLog.statusActionsLogId
      )
    ).resolves.toBeTruthy();
  });
});
