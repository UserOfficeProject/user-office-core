import checkAllCallsEndedJob from './jobs/checkAllCallsEnded';
import checkCallsFAPReviewEndedJob from './jobs/checkCallsFAPReviewEnded';
import checkCallsReviewEndedJob from './jobs/checkCallsReviewEnded';
import { UserOfficeAsyncJob } from './startAsyncJobs';

const ALL_ASYNC_JOBS: UserOfficeAsyncJob[] = [
  checkAllCallsEndedJob,
  checkCallsReviewEndedJob,
  checkCallsFAPReviewEndedJob,
];

export default ALL_ASYNC_JOBS;
