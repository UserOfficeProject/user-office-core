import { logger } from '@user-office-software/duo-logger';

import { CallDataSource } from '../../datasources/CallDataSource';
import { eventBus } from '../../events';
import { Event } from '../../events/event.enum';
import { UserOfficeAsyncJob } from '../startAsyncJobs';

const checkCallsEnded = async (dataSource: CallDataSource) => {
  const isTestingMode = process.env.NODE_ENV === 'test';

  try {
    const notEndedCalls = await dataSource.getCalls({
      isEnded: false,
    });

    const currentDate = new Date();

    const callsThatShouldEnd = notEndedCalls.filter(
      (notEndedCall) => notEndedCall.endCall.getTime() <= currentDate.getTime()
    );

    const updatedCalls = [];

    for (const callThatShouldEnd of callsThatShouldEnd) {
      const updatedCall = await dataSource.update({
        ...callThatShouldEnd,
        callEnded: true,
      });

      if (!isTestingMode) {
        // NOTE: Fire the "CALL_ENDED" event if not in testing mode.
        eventBus.publish({
          type: Event.CALL_ENDED,
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
    logger.logException('Checking and ending calls failed: ', error);
  }
};

// NOTE: Run each hour at minute 0
const options = { timeToRun: '0 * * * *' };

const checkCallsEndedJob: UserOfficeAsyncJob = {
  functionToRun: checkCallsEnded,
  options,
};

export default checkCallsEndedJob;
