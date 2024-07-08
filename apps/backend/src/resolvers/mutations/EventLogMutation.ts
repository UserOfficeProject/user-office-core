import { Arg, Ctx, Int, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { EventLog } from '../types/EventLog';

@Resolver()
export class EventLogMutation {
  @Mutation(() => EventLog)
  replayEventLog(
    @Arg('id', () => Int) id: number,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.eventLogs.replayEventLog(context.user, id);
  }
}
