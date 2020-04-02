import { eventBus } from '../buildContext';
import { ResolverContext } from '../context';
import { User } from '../resolvers/types/User';
import { ApplicationEvent } from './applicationEvents';

export const EventBus = (eventType: Event) => {
  return (
    target: object,
    name: string,
    descriptor: {
      value?: (inputArgs: any, context: ResolverContext) => Promise<any>;
    }
  ) => {
    const inner = descriptor.value;

    descriptor.value = async function(...args) {
      let context;
      /** NOTE: This needs to be checked because there are mutations where we don't have inputArgs just the context. Example: createProposal mutation.
       * args = [inputArgs, context]; args[1] should be context
       */
      if (args[1]) {
        [, context] = args;
      } else {
        [context] = args;
      }

      let loggedInUser = context.user as User;
      const result = await inner?.apply(this, args);

      // NOTE: This needs to be checked because there are mutations where we don't have loggedIn user. Example: ResetPasswordEmailMutation.
      if (!loggedInUser) {
        loggedInUser = result.success.user;
      }

      const [resultFirstKey] = Object.keys(result);
      const event = {
        type: eventType,
        [resultFirstKey]: result[resultFirstKey],
        loggedInUserId: loggedInUser ? loggedInUser.id : null,
        userId: loggedInUser.id,
        inviterId: result[resultFirstKey].inviterId,
        role: result[resultFirstKey].role,
      } as ApplicationEvent;

      eventBus.publish(event);

      return result;
    };
  };
};
