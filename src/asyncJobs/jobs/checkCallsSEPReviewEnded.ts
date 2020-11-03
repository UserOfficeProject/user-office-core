import { callDataSource } from '../../datasources';
import { eventBus } from '../../events';
import { Event } from '../../events/event.enum';
import { logger } from '../../utils/Logger';
import { UserOfficeAsyncJob } from '../startAsyncJobs';

const checkCallsSEPReviewEnded = async () => {
  try {
    const sepReviewNotEndedCalls = await callDataSource.getCalls({
      isSEPReviewEnded: false,
    });

    const currentDate = new Date();

    const callsThatShouldEndSEPReview = sepReviewNotEndedCalls.filter(
      sepReviewNotEndedCall =>
        sepReviewNotEndedCall.endSEPReview.getTime() <= currentDate.getTime()
    );

    callsThatShouldEndSEPReview.forEach(async callThatShouldEndSEPReview => {
      const updatedCall = await callDataSource.update({
        ...callThatShouldEndSEPReview,
        callSEPReviewEnded: true,
      });

      // NOTE: Fire the "CALL_SEP_REVIEW_ENDED" event.
      eventBus.publish({
        type: Event.CALL_SEP_REVIEW_ENDED,
        call: updatedCall,
        isRejection: false,
        key: 'call',
        loggedInUserId: 0,
      });
    });
  } catch (error) {
    logger.logError('Checking and ending calls review failed: ', error);
  }
};

// NOTE: Run every day at 00:07
const options = { timeToRun: '7 0 * * *' };

const checkCallsSEPReviewEndedJob: UserOfficeAsyncJob = {
  functionToRun: checkCallsSEPReviewEnded,
  options,
};

export default checkCallsSEPReviewEndedJob;
