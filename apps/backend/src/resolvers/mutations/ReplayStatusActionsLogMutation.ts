import {
  Arg,
  Ctx,
  Field,
  Int,
  Mutation,
  ObjectType,
  Resolver,
} from 'type-graphql';

import { ResolverContext } from '../../context';

@ObjectType()
export class ReplayStatusLogFailure {
  @Field(() => Int)
  logId: number;

  @Field(() => String)
  error: string;
}

@ObjectType()
export class ReplayStatusActionsLogsResult {
  @Field(() => Int)
  totalRequested: number;

  @Field(() => [Int])
  successful: number[];

  @Field(() => [ReplayStatusLogFailure])
  failed: ReplayStatusLogFailure[];
}

@Resolver()
export class ReplayStatusActionsLogMutation {
  @Mutation(() => ReplayStatusActionsLogsResult)
  replayStatusActionsLogs(
    @Arg('statusActionsLogIds', () => [Int]) statusActionsLogIds: number[],
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.statusActionsLogs.replayStatusActionsLogs(
      context.user,
      statusActionsLogIds
    );
  }
}
