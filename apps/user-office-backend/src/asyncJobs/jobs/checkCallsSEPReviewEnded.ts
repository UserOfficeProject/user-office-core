import { logger } from '@user-office-software/duo-logger';

import { CallDataSource } from '../../datasources/CallDataSource';
import { eventBus } from '../../events';
import { Event } from '../../events/event.enum';
import { UserOfficeAsyncJob } from '../startAsyncJobs';

const checkCallsSEPReviewEnded = async (dataSource: CallDataSource) => {
  const isTestingMode = process.env.NODE_ENV === 'test';

  try {
    const sepReviewNotEndedCalls = await dataSource.getCalls({
      isSEPReviewEnded: false,
    });

    const currentDate = new Date();

    const callsThatShouldEndSEPReview = sepReviewNotEndedCalls.filter(
      (sepReviewNotEndedCall) =>
        sepReviewNotEndedCall.endSEPReview.getTime() <= currentDate.getTime()
    );

    const updatedCalls = [];

    for (const callThatShouldEndSEPReview of callsThatShouldEndSEPReview) {
      const updatedCall = await dataSource.update({
        ...callThatShouldEndSEPReview,
        callSEPReviewEnded: true,
      });

      if (!isTestingMode) {
        // NOTE: Fire the "CALL_SEP_REVIEW_ENDED" event.
        eventBus.publish({
          type: Event.CALL_SEP_REVIEW_ENDED,
          call: updatedCall,
          isRejection: false,
          key: 'call',
          loggedInUserId: 0,
        });
      }

      updatedCalls.push(updatedCall);
    }

    return updatedCalls;
  } catch (error) {
    logger.logException('Checking and ending calls SEP review failed: ', error);
  }
};

// NOTE: Run every day at 00:07
const options = { timeToRun: '7 0 * * *' };

const checkCallsSEPReviewEndedJob: UserOfficeAsyncJob = {
  functionToRun: checkCallsSEPReviewEnded,
  options,
};

export default checkCallsSEPReviewEndedJob;
