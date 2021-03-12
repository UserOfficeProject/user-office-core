/* eslint-disable @typescript-eslint/no-explicit-any */
import { CronJob } from 'cron';

import { callDataSource } from '../datasources';
import { CallDataSource } from '../datasources/CallDataSource';
import ALL_AYNC_JOBS from './allAsyncJobs';

export type UserOfficeAsyncJob = {
  functionToRun: (dataSource: any) => Promise<any>;
  options: { timeToRun: string | Date };
};

export const runAsyncJobs = (
  allJobs: UserOfficeAsyncJob[],
  dataSources: { callDataSource: CallDataSource }
) => {
  allJobs.forEach((job) => {
    const cronJob = new CronJob(
      job.options.timeToRun,
      async () => await job.functionToRun(dataSources.callDataSource),
      null,
      true
    );

    cronJob.start();
  });
};

export const startAsyncJobs = () => {
  runAsyncJobs(ALL_AYNC_JOBS, { callDataSource });
};

export default startAsyncJobs;
