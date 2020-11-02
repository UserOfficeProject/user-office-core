import { callDataSource } from '../../datasources';
import { eventBus } from '../../events';
import { Event } from '../../events/event.enum';
import { logger } from '../../utils/Logger';
import { UserOfficeAsyncJob } from '../startAsyncJobs';

const checkCallsEnded = async () => {
  try {
    const notEndedCalls = await callDataSource.getCalls({
      isEnded: false,
    });

    const currentDate = new Date();

    const callsThatShouldEnd = notEndedCalls.filter(
      notEndedCall => notEndedCall.endCall.getTime() <= currentDate.getTime()
    );

    callsThatShouldEnd.forEach(async callThatShouldEnd => {
      const updatedCall = await callDataSource.update({
        ...callThatShouldEnd,
        callEnded: true,
      });

      // NOTE: Fire the "CALL_ENDED" event.
      eventBus.publish({
        type: Event.CALL_ENDED,
        call: updatedCall,
        isRejection: false,
        key: 'call',
        loggedInUserId: 0,
      });
    });
  } catch (error) {
    logger.logError('Checking and ending calls failed: ', error);
  }
};

// NOTE: Run every day at 00:05
const options = { timeToRun: '5 0 * * *' };

const checkCallsEndedJob: UserOfficeAsyncJob = {
  functionToRun: checkCallsEnded,
  options,
};

export default checkCallsEndedJob;
