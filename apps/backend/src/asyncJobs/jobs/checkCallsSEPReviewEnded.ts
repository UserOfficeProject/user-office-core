import { logger } from '@user-office-software/duo-logger';
import { DateTime } from 'luxon';
import { container } from 'tsyringe';

import { Tokens } from '../../config/Tokens';
import { CallDataSource } from '../../datasources/CallDataSource';
import { SEPDataSource } from '../../datasources/SEPDataSource';
import { resolveApplicationEventBus } from '../../events';
import { Event } from '../../events/event.enum';
import { Call } from '../../models/Call';
import { ReviewStatus } from '../../models/Review';
import { UserOfficeAsyncJob } from '../startAsyncJobs';

const DAYS_BEFORE_SENDING_NOTIFICATION_EMAILS = 2;
const sepDataSource = container.resolve<SEPDataSource>(Tokens.SEPDataSource);

const checkAndNotifySEPReviewersBeforeReviewEnds = async (
  sepReviewNotEndedCalls: Call[],
  currentDate: DateTime
) => {
  const eventBus = resolveApplicationEventBus();
  const callsThatShouldSendEmailsToSEPReviewers = sepReviewNotEndedCalls.filter(
    (sepReviewNotEndedCall) =>
      sepReviewNotEndedCall.endSEPReview.getTime() <=
      currentDate
        .plus({ days: DAYS_BEFORE_SENDING_NOTIFICATION_EMAILS })
        .toMillis()
  );

  const sepReviewsThatShouldBeNotified =
    await sepDataSource.getSEPReviewsByCallAndStatus(
      callsThatShouldSendEmailsToSEPReviewers.map((call) => call.id),
      ReviewStatus.DRAFT
    );

  for (const sepReviewThatShouldBeNotified of sepReviewsThatShouldBeNotified) {
    // NOTE: Fire the "SEP_REVIEWER_NOTIFIED" event.
    eventBus.publish({
      type: Event.SEP_REVIEWER_NOTIFIED,
      sepReview: sepReviewThatShouldBeNotified,
      isRejection: false,
      key: 'sepReview',
      loggedInUserId: 0,
    });
  }
};

// NOTE: This check is for call SEP review ended and for notifying SEP reviewers 2 days before sep review ends.
const checkCallsSEPReviewEnded = async (dataSource: CallDataSource) => {
  const eventBus = resolveApplicationEventBus();
  try {
    const sepReviewNotEndedCalls = await dataSource.getCalls({
      isSEPReviewEnded: false,
    });

    const currentDate = DateTime.now();

    const callsThatShouldEndSEPReview = sepReviewNotEndedCalls.filter(
      (sepReviewNotEndedCall) =>
        sepReviewNotEndedCall.endSEPReview.getTime() <= currentDate.toMillis()
    );

    // NOTE: Check if there is any SEP review that is not submitted 2 days before the SEP review ends on a call.
    await checkAndNotifySEPReviewersBeforeReviewEnds(
      sepReviewNotEndedCalls,
      currentDate
    );

    const updatedCalls = [];

    for (const callThatShouldEndSEPReview of callsThatShouldEndSEPReview) {
      const updatedCall = await dataSource.update({
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
