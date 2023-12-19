import { logger } from '@user-office-software/duo-logger';
import { DateTime } from 'luxon';
import { container } from 'tsyringe';

import { Tokens } from '../../config/Tokens';
import { CallDataSource } from '../../datasources/CallDataSource';
import { FapDataSource } from '../../datasources/FapDataSource';
import { resolveApplicationEventBus } from '../../events';
import { Event } from '../../events/event.enum';
import { Call } from '../../models/Call';
import { ReviewStatus } from '../../models/Review';
import { UserOfficeAsyncJob } from '../startAsyncJobs';

const DAYS_BEFORE_SENDING_NOTIFICATION_EMAILS = 2;
const fapDataSource = container.resolve<FapDataSource>(Tokens.FapDataSource);

const checkAndNotifyFapReviewersBeforeReviewEnds = async (
  fapReviewNotEndedCalls: Call[],
  currentDate: DateTime
) => {
  const eventBus = resolveApplicationEventBus();
  const callsThatShouldSendEmailsToFapReviewers = fapReviewNotEndedCalls.filter(
    (fapReviewNotEndedCall) =>
      fapReviewNotEndedCall.endFapReview.getTime() <=
      currentDate
        .plus({ days: DAYS_BEFORE_SENDING_NOTIFICATION_EMAILS })
        .toMillis()
  );

  const fapReviewsThatShouldBeNotified =
    await fapDataSource.getFapReviewsByCallAndStatus(
      callsThatShouldSendEmailsToFapReviewers.map((call) => call.id),
      ReviewStatus.DRAFT
    );

  for (const fapReviewThatShouldBeNotified of fapReviewsThatShouldBeNotified) {
    eventBus.publish({
      type: Event.FAP_REVIEWER_NOTIFIED,
      fapReview: fapReviewThatShouldBeNotified,
      isRejection: false,
      key: 'fapReview',
      loggedInUserId: 0,
    });
  }
};

// NOTE: This check is for call Fap review ended and for notifying Fap reviewers 2 days before fap review ends.
const checkCallsFapReviewEnded = async (dataSource: CallDataSource) => {
  const eventBus = resolveApplicationEventBus();
  try {
    const fapReviewNotEndedCalls = await dataSource.getCalls({
      isFapReviewEnded: false,
    });

    const currentDate = DateTime.now();

    const callsThatShouldEndFapReview = fapReviewNotEndedCalls.filter(
      (fapReviewNotEndedCall) =>
        fapReviewNotEndedCall.endFapReview.getTime() <= currentDate.toMillis()
    );

    // NOTE: Check if there is any Fap review that is not submitted 2 days before the Fap review ends on a call.
    await checkAndNotifyFapReviewersBeforeReviewEnds(
      fapReviewNotEndedCalls,
      currentDate
    );

    const updatedCalls = [];

    for (const callThatShouldEndFapReview of callsThatShouldEndFapReview) {
      const updatedCall = await dataSource.update({
        ...callThatShouldEndFapReview,
        callFapReviewEnded: true,
      });

      eventBus.publish({
        type: Event.CALL_FAP_REVIEW_ENDED,
        call: updatedCall,
        isRejection: false,
        key: 'call',
        loggedInUserId: 0,
      });

      updatedCalls.push(updatedCall);
    }

    return updatedCalls;
  } catch (error) {
    logger.logException('Checking and ending calls Fap review failed: ', error);
  }
};

// NOTE: Run every day at 00:07
const options = { timeToRun: '7 0 * * *' };

const checkCallsFapReviewEndedJob: UserOfficeAsyncJob = {
  functionToRun: checkCallsFapReviewEnded,
  options,
};

export default checkCallsFapReviewEndedJob;
