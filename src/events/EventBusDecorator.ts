import { eventBus } from '../buildContext';
import { Rejection, isRejection } from '../rejection';
import { User } from '../resolvers/types/User';
import { ApplicationEvent } from './applicationEvents';
import { Event } from './event.enum';

export const EventBusDecorator = (eventType: Event) => {
  return (
    target: object,
    name: string,
    descriptor: {
      value?: (agent: User, args: any) => Promise<Rejection | any>;
    }
  ) => {
    const inner = descriptor.value;

    descriptor.value = async function(...args) {
      let [loggedInUser] = args;

      const result = await inner?.apply(this, args);

      // NOTE: Get the name of the object or class like: 'SEP', 'USER', 'Proposal' and lowercase it.
      const resultKey = (result.constructor.name as string).toLowerCase();

      // NOTE: This needs to be checked because there are mutations where we don't have loggedIn user. Example: ResetPasswordEmailMutation.
      if (!loggedInUser) {
        loggedInUser = result.user;
      }

      const event = {
        type: eventType,
        [resultKey]: result,
        loggedInUserId: loggedInUser.id,
        userId: result.userId || null,
        inviterId: result.inviterId || null,
        role: result.role || null,
        isRejection: isRejection(result),
      } as ApplicationEvent;

      eventBus.publish(event);

      return result;
    };
  };
};
