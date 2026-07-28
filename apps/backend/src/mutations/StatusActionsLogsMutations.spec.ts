import 'reflect-metadata';
import { container } from 'tsyringe';

import StatusActionsLogsMutations from './StatusActionsLogsMutations';
import { Tokens } from '../config/Tokens';
import {
  dummyStatusActionsLog,
  dummyStatusActionsLogReplay,
} from '../datasources/mockups/StatusActionsLogsDataSource';
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

  test('A logged in user officer should be able to replay multiple status actions logs successfully', async () => {
    const result = await statusActionsLogsMutations.replayStatusActionsLogs(
      dummyUserOfficerWithRole,
      [
        dummyStatusActionsLog.statusActionsLogId,
        dummyStatusActionsLogReplay.statusActionsLogId,
      ]
    );

    expect(result.totalRequested).toBe(2);
    expect(result.successful.sort()).toEqual(
      [
        dummyStatusActionsLog.statusActionsLogId,
        dummyStatusActionsLogReplay.statusActionsLogId,
      ].sort()
    );
    expect(result.failed).toHaveLength(0);
  });

  test('Replaying multiple status actions logs should report partial failures without failing the whole request', async () => {
    const statusActionsDataSource = container.resolve<StatusActionsDataSource>(
      Tokens.StatusActionsDataSource
    );
    const getConnectionStatusActionSpy = jest
      .spyOn(statusActionsDataSource, 'getConnectionStatusAction')
      .mockResolvedValueOnce(null);

    const result = await statusActionsLogsMutations.replayStatusActionsLogs(
      dummyUserOfficerWithRole,
      [
        dummyStatusActionsLog.statusActionsLogId,
        dummyStatusActionsLogReplay.statusActionsLogId,
      ]
    );

    expect(result.totalRequested).toBe(2);
    expect(result.successful).toEqual([
      dummyStatusActionsLogReplay.statusActionsLogId,
    ]);
    expect(result.failed).toEqual([
      {
        logId: dummyStatusActionsLog.statusActionsLogId,
        error: expect.any(String),
      },
    ]);

    getConnectionStatusActionSpy.mockRestore();
  });

  test('Replaying an empty list of status actions logs should return zero counts', async () => {
    const result = await statusActionsLogsMutations.replayStatusActionsLogs(
      dummyUserOfficerWithRole,
      []
    );

    expect(result).toEqual({
      totalRequested: 0,
      successful: [],
      failed: [],
    });
  });
});
