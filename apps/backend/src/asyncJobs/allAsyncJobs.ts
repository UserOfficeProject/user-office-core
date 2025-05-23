import checkAllCallsEndedJob from './jobs/checkAllCallsEnded';
import checkCallsFAPReviewEndedJob from './jobs/checkCallsFAPReviewEnded';
import checkCallsReviewEndedJob from './jobs/checkCallsReviewEnded';
import checkInviteReminderJob from './jobs/checkInviteReminderJob';
import { UserOfficeAsyncJob } from './startAsyncJobs';

const ALL_ASYNC_JOBS: UserOfficeAsyncJob[] = [
  checkAllCallsEndedJob,
  checkCallsReviewEndedJob,
  checkCallsFAPReviewEndedJob,
  checkInviteReminderJob,
];

export default ALL_ASYNC_JOBS;
