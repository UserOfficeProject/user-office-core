/* eslint-disable jest/no-done-callback */
import 'reflect-metadata';
import sinon from 'sinon';

import { CallDataSourceMock } from '../datasources/mockups/CallDataSource';
import checkCallsEndedJob from './jobs/checkCallsEnded';
import checkCallsReviewEndedJob from './jobs/checkCallsReviewEnded';
import checkCallsSEPReviewEndedJob from './jobs/checkCallsSEPReviewEnded';
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

  it('Should run callSEPReviewEnded job once in 24 hours', (done) => {
    const functionWithMockedDataSource = async () => {
      const callsWithEndedSEPReview =
        await checkCallsSEPReviewEndedJob.functionToRun(callDataSourceMock);

      expect(callsWithEndedSEPReview.length).toBeGreaterThan(0);

      for (const callWithEndedSEPReview of callsWithEndedSEPReview) {
        expect(callWithEndedSEPReview).toHaveProperty(
          'callSEPReviewEnded',
          true
        );
      }

      done();
    };

    const mockedFunction = jest.spyOn(
      checkCallsSEPReviewEndedJob,
      'functionToRun'
    );

    const allJobs = [
      {
        functionToRun: functionWithMockedDataSource,
        options: checkCallsSEPReviewEndedJob.options,
      },
    ];

    runAsyncJobs(allJobs);

    clock.tick(24 * 60 * 60 * 1000);

    clock.restore();

    expect(mockedFunction).toHaveBeenCalledTimes(1);
  });
});
