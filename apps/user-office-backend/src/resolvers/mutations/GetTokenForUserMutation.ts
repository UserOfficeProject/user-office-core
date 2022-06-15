import { Arg, Ctx, Int, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { TokenResponseWrap } from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';

@Resolver()
export class GetTokenForUserMutation {
  @Mutation(() => TokenResponseWrap)
  getTokenForUser(
    @Arg('userId', () => Int) userId: number,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.user.getTokenForUser(context.user, { userId }),
      TokenResponseWrap
    );
  }
}
