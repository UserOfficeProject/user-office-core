import { Arg, Ctx, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { wrapResponse } from '../wrapResponse';
import { TokenResponseWrap } from './../types/CommonWrappers';

@Resolver()
export class LogoutMutation {
  @Mutation(() => TokenResponseWrap)
  logout(@Arg('token') token: string, @Ctx() context: ResolverContext) {
    return wrapResponse(
      context.mutations.user.logout(token),
      TokenResponseWrap
    );
  }
}
