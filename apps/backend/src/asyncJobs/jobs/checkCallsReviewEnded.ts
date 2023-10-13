import { logger } from '@user-office-software/duo-logger';

import { CallDataSource } from '../../datasources/CallDataSource';
import { resolveApplicationEventBus } from '../../events';
import { Event } from '../../events/event.enum';
import { UserOfficeAsyncJob } from '../startAsyncJobs';

const checkCallsReviewEnded = async (dataSource: CallDataSource) => {
  const eventBus = resolveApplicationEventBus();

  try {
    const reviewNotEndedCalls = await dataSource.getCalls({
      isReviewEnded: false,
    });

    const currentDate = new Date();

    const callsThatShouldEndReview = reviewNotEndedCalls.filter(
      (reviewNotEndedCall) =>
        reviewNotEndedCall.endReview.getTime() <= currentDate.getTime()
    );

    const updatedCalls = [];

    for (const callThatShouldEndReview of callsThatShouldEndReview) {
      const updatedCall = await dataSource.update({
        ...callThatShouldEndReview,
        callReviewEnded: true,
      });

      eventBus.publish({
        type: Event.CALL_REVIEW_ENDED,
        call: updatedCall,
        isRejection: false,
        key: 'call',
        loggedInUserId: 0,
      });

      updatedCalls.push(updatedCall);
    }

    return updatedCalls;
  } catch (error) {
    logger.logException('Checking and ending calls review failed: ', error);
  }
};

// NOTE: Run every day at 00:06
const options = { timeToRun: '6 0 * * *' };

const checkCallsReviewEndedJob: UserOfficeAsyncJob = {
  functionToRun: checkCallsReviewEnded,
  options,
};

export default checkCallsReviewEndedJob;
