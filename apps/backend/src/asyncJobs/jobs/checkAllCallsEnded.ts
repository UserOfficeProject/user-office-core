import { logger } from '@user-office-software/duo-logger';

import { CallDataSource } from '../../datasources/CallDataSource';
import { resolveApplicationEventBus } from '../../events';
import { Event } from '../../events/event.enum';
import { UserOfficeAsyncJob } from '../startAsyncJobs';

const checkCallsEnded = async (dataSource: CallDataSource) => {
  const updatedCalls = [];
  try {
    const eventBus = resolveApplicationEventBus();
    const notEndedCalls = await dataSource.getCalls({
      isCallEndedByEvent: false,
    });

    const currentDate = new Date();

    const callsThatShouldEnd = notEndedCalls.filter(
      (notEndedCall) => notEndedCall.endCall.getTime() <= currentDate.getTime()
    );

    for (const callThatShouldEnd of callsThatShouldEnd) {
      const updatedCall = await dataSource.update({
        ...callThatShouldEnd,
        callEnded: true,
      });

      eventBus.publish({
        type: Event.CALL_ENDED,
        call: updatedCall,
        isRejection: false,
        key: 'call',
        loggedInUserId: 0,
      });

      updatedCalls.push(updatedCall);
    }
  } catch (error) {
    logger.logException('Checking and ending calls failed: ', error);
  } finally {
    return updatedCalls;
  }
};
const checkCallsEndedInternal = async (dataSource: CallDataSource) => {
  const eventBus = resolveApplicationEventBus();
  const updatedCalls = [];
  try {
    const notEndedInternalCalls = await dataSource.getCalls({
      isEndedInternal: false,
    });

    const currentDate = new Date();

    const callsThatShouldEndInternal = notEndedInternalCalls.filter(
      (notEndedCall) =>
        notEndedCall.endCallInternal.getTime() <= currentDate.getTime()
    );

    for (const callThatShouldEndInternal of callsThatShouldEndInternal) {
      const updatedCall = await dataSource.update({
        ...callThatShouldEndInternal,
        callEndedInternal: true,
      });

      eventBus.publish({
        type: Event.CALL_ENDED_INTERNAL,
        call: updatedCall,
        isRejection: false,
        key: 'call',
        loggedInUserId: 0,
      });

      updatedCalls.push(updatedCall);
    }
  } catch (error) {
    logger.logException('Checking and ending calls internal failed: ', error);
  } finally {
    return updatedCalls;
  }
};

const checkAllCallsEnded = async (dataSource: CallDataSource) => {
  return [
    ...(await checkCallsEnded(dataSource)),
    ...(await checkCallsEndedInternal(dataSource)),
  ];
};
// NOTE: Run each hour at minute 0
const options = { timeToRun: '0 * * * *' };

const checkAllCallsEndedJob: UserOfficeAsyncJob = {
  functionToRun: checkAllCallsEnded,
  options,
};

export default checkAllCallsEndedJob;
