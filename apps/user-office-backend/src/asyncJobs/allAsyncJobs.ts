import checkCallsEndedJob from './jobs/checkCallsEnded';
import checkCallsReviewEndedJob from './jobs/checkCallsReviewEnded';
import checkCallsSEPReviewEndedJob from './jobs/checkCallsSEPReviewEnded';
import { UserOfficeAsyncJob } from './startAsyncJobs';

const ALL_ASYNC_JOBS: UserOfficeAsyncJob[] = [
  checkCallsEndedJob,
  checkCallsReviewEndedJob,
  checkCallsSEPReviewEndedJob,
];

export default ALL_ASYNC_JOBS;
