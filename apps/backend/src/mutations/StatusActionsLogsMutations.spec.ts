import 'reflect-metadata';
import { container } from 'tsyringe';

import StatusActionsLogsMutations from './StatusActionsLogsMutations';
import { Tokens } from '../config/Tokens';
import { dummyStatusActionsLog } from '../datasources/mockups/StatusActionsLogsDataSource';
import { dummyUserOfficerWithRole } from '../datasources/mockups/UserDataSource';
import { StatusActionsDataSource } from '../datasources/StatusActionsDataSource';
import { Rejection } from '../models/Rejection';

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

  test('Replaying a status actions log whose connection/action no longer exists should be rejected, not throw', async () => {
    const statusActionsDataSource = container.resolve<StatusActionsDataSource>(
      Tokens.StatusActionsDataSource
    );
    const getConnectionStatusActionSpy = jest
      .spyOn(statusActionsDataSource, 'getConnectionStatusAction')
      .mockResolvedValueOnce(null);

    const result = await statusActionsLogsMutations.replayStatusActionsLog(
      dummyUserOfficerWithRole,
      dummyStatusActionsLog.statusActionsLogId
    );

    expect(result).toBeInstanceOf(Rejection);

    getConnectionStatusActionSpy.mockRestore();
  });
});
