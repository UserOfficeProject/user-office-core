import { Arg, Ctx, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { LogoutTokenWrap } from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';

@Resolver()
export class LogoutMutation {
  @Mutation(() => LogoutTokenWrap)
  logout(@Arg('token') token: string, @Ctx() context: ResolverContext) {
    return wrapResponse(context.mutations.user.logout(token), LogoutTokenWrap);
  }
}
