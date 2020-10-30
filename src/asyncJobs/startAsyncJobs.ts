import { CronCommand, CronJob } from 'cron';

export type UserOfficeAsyncJob = {
  functionToRun: CronCommand;
  options: { timeToRun: string | Date };
};

const startAsyncJobs = (allJobs: UserOfficeAsyncJob[]) => {
  allJobs.forEach(job => {
    const cronJob = new CronJob(
      job.options.timeToRun,
      job.functionToRun,
      null,
      true
    );

    cronJob.start();
  });
};

export default startAsyncJobs;
