/* eslint-disable jest/no-done-callback */
import 'reflect-metadata';
import sinon from 'sinon';

import { CallDataSourceMock } from '../datasources/mockups/CallDataSource';
import checkCallsEndedJob from './jobs/checkAllCallsEnded';
import checkCallsFAPReviewEndedJob from './jobs/checkCallsFAPReviewEnded';
import checkCallsReviewEndedJob from './jobs/checkCallsReviewEnded';
import { runAsyncJobs } from './startAsyncJobs';

describe('Test if predefined async jobs are running correctly', () => {
  let clock: sinon.SinonFakeTimers;
  const callDataSourceMock = new CallDataSourceMock();

  beforeEach(() => {
    clock = sinon.useFakeTimers();
  });

  afterEach(() => {
    sinon.restore();
  });

  it('Should call mocked job once in one minute', () => {
    const mockJobFunction = jest.fn();

    // NOTE: Run cron-job on every minute for testing.
    const pattern = '* * * * *';
    const allJobs = [
      {
        functionToRun: mockJobFunction,
        options: { timeToRun: pattern },
      },
    ];

    runAsyncJobs(allJobs);

    clock.tick(1 * 60 * 1000);

    clock.restore();

    expect(mockJobFunction.mock.calls.length).toBe(1);
  });

  it('Should run callEnded job once an hour', () => {
    const functionWithMockedDataSource = async () => {
      const callsThatAreEnded = await checkCallsEndedJob.functionToRun(
        callDataSourceMock
      );

      expect(callsThatAreEnded.length).toBeGreaterThan(0);

      for (const callThatEnded of callsThatAreEnded) {
        expect(callThatEnded).toHaveProperty('callEnded', true);
      }
    };

    const mockedFunction = jest.spyOn(checkCallsEndedJob, 'functionToRun');

    const allJobs = [
      {
        functionToRun: functionWithMockedDataSource,
        options: checkCallsEndedJob.options,
      },
    ];

    runAsyncJobs(allJobs);

    clock.tick(24 * 60 * 60 * 1000);

    clock.restore();

    expect(mockedFunction).toHaveBeenCalledTimes(24);
  });

  it('Should run callReviewEnded job once in 24 hours', (done) => {
    const functionWithMockedDataSource = async () => {
      const callsWithEndedReview = await checkCallsReviewEndedJob.functionToRun(
        callDataSourceMock
      );

      expect(callsWithEndedReview.length).toBeGreaterThan(0);

      for (const callWithEndedReview of callsWithEndedReview) {
        expect(callWithEndedReview).toHaveProperty('callReviewEnded', true);
      }

      done();
    };

    const mockedFunction = jest.spyOn(
      checkCallsReviewEndedJob,
      'functionToRun'
    );

    const allJobs = [
      {
        functionToRun: functionWithMockedDataSource,
        options: checkCallsReviewEndedJob.options,
      },
    ];

    runAsyncJobs(allJobs);

    clock.tick(24 * 60 * 60 * 1000);

    clock.restore();

    expect(mockedFunction).toHaveBeenCalledTimes(1);
  });

  it('Should run callFapReviewEnded job once in 24 hours', (done) => {
    const functionWithMockedDataSource = async () => {
      const callsWithEndedFAPReview =
        await checkCallsFAPReviewEndedJob.functionToRun(callDataSourceMock);

      expect(callsWithEndedFAPReview.length).toBeGreaterThan(0);

      for (const callWithEndedFAPReview of callsWithEndedFAPReview) {
        expect(callWithEndedFAPReview).toHaveProperty(
          'callFapReviewEnded',
          true
        );
      }

      done();
    };

    const mockedFunction = jest.spyOn(
      checkCallsFAPReviewEndedJob,
      'functionToRun'
    );

    const allJobs = [
      {
        functionToRun: functionWithMockedDataSource,
        options: checkCallsFAPReviewEndedJob.options,
      },
    ];

    runAsyncJobs(allJobs);

    clock.tick(24 * 60 * 60 * 1000);

    clock.restore();

    expect(mockedFunction).toHaveBeenCalledTimes(1);
  });
});
