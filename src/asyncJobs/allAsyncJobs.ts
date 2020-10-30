import checkCallsEndedJob from './jobs/checkCallsEnded';
import { UserOfficeAsyncJob } from './startAsyncJobs';

const ALL_AYNC_JOBS: UserOfficeAsyncJob[] = [checkCallsEndedJob];

export default ALL_AYNC_JOBS;
