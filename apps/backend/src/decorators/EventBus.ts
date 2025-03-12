import { logger } from '@user-office-software/duo-logger';

import { resolveApplicationEventBus } from '../events';
import { ApplicationEvent } from '../events/applicationEvents';
import { Event } from '../events/event.enum';
import { Rejection, isRejection } from '../models/Rejection';
import { UserWithRole } from '../models/User';

const EventBusDecorator = (eventType: Event) => {
  return (
    target: any,
    name: string,
    descriptor: {
      value?: (agent: UserWithRole, args: any) => Promise<Rejection | any>;
    }
  ) => {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args) {
      // eslint-disable-next-line prefer-const
      let [loggedInUser, ...restArgs] = args;

      const result = await originalMethod?.apply(this, args);

      // NOTE: This needs to be checked because there are mutations where we don't have loggedIn user
      if (!loggedInUser) {
        loggedInUser = result.user;
      }

      // NOTE: Do not log the event in testing environment.
      if (process.env.NODE_ENV !== 'test') {
        // NOTE: Get the name of the object or class like: 'Fap', 'USER', 'Proposal' and lowercase it.
        const resultKey = (result.constructor.name as string).toLowerCase();

        const event = {
          type: eventType,
          [resultKey]: result,
          key: resultKey,
          loggedInUserId: loggedInUser ? loggedInUser.id : null,
          isRejection: isRejection(result),
          inputArgs: JSON.stringify(restArgs),
        } as ApplicationEvent;

        const eventBus = resolveApplicationEventBus();
        eventBus
          .publish(event)
          .catch((e) =>
            logger.logError(`EventBus publish failed ${event.type}`, e)
          );
      }

      return result;
    };
  };
};

export default EventBusDecorator;
