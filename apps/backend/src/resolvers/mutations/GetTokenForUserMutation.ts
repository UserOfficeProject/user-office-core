import { Arg, Ctx, Int, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';

@Resolver()
export class GetTokenForUserMutation {
  @Mutation(() => String)
  getTokenForUser(
    @Arg('userId', () => Int) userId: number,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.user.getTokenForUser(context.user, { userId });
  }
}
