/* eslint-disable @typescript-eslint/no-explicit-any */
import { CronJob } from 'cron';
import { container } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { CallDataSource } from '../datasources/CallDataSource';
import ALL_AYNC_JOBS from './allAsyncJobs';

const callDataSource = container.resolve<CallDataSource>(Tokens.CallDataSource);

export type UserOfficeAsyncJob = {
  functionToRun: (dataSource: any) => Promise<any>;
  options: { timeToRun: string | Date };
};

export const runAsyncJobs = (allJobs: UserOfficeAsyncJob[]) => {
  allJobs.forEach((job) => {
    const cronJob = new CronJob(
      job.options.timeToRun,
      async () => await job.functionToRun(callDataSource),
      null,
      true
    );

    cronJob.start();
  });
};

export const startAsyncJobs = () => {
  runAsyncJobs(ALL_AYNC_JOBS);
};

export default startAsyncJobs;
