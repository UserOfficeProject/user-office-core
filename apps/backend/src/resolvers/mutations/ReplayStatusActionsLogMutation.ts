import { Arg, Ctx, Int, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';

@Resolver()
export class ReplayStatusActionsLogMutation {
  @Mutation(() => Boolean)
  replayStatusActionsLog(
    @Arg('statusActionsLogId', () => Int) statusActionsLogId: number,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.statusActionsLogs.replayStatusActionsLog(
      context.user,
      statusActionsLogId
    );
  }
}
