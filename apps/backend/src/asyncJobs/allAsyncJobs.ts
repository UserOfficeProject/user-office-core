import checkAllCallsEndedJob from './jobs/checkAllCallsEnded';
import checkCallsReviewEndedJob from './jobs/checkCallsReviewEnded';
import checkCallsSEPReviewEndedJob from './jobs/checkCallsSEPReviewEnded';
import { UserOfficeAsyncJob } from './startAsyncJobs';

const ALL_ASYNC_JOBS: UserOfficeAsyncJob[] = [
  checkAllCallsEndedJob,
  checkCallsReviewEndedJob,
  checkCallsSEPReviewEndedJob,
];

export default ALL_ASYNC_JOBS;
