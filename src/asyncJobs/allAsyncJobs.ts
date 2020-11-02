import checkCallsEndedJob from './jobs/checkCallsEnded';
import checkCallsReviewEndedJob from './jobs/checkCallsReviewEnded';
import { UserOfficeAsyncJob } from './startAsyncJobs';

const ALL_AYNC_JOBS: UserOfficeAsyncJob[] = [
  checkCallsEndedJob,
  checkCallsReviewEndedJob,
];

export default ALL_AYNC_JOBS;
