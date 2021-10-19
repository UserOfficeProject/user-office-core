import { Arg, Ctx, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { ExternalLogoutTokenWrap } from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';

@Resolver()
export class ExternalLogoutTokenMutation {
  @Mutation(() => ExternalLogoutTokenWrap)
  ExternalLogoutToken(
    @Arg('externalToken') externalToken: string,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.user.logout(externalToken),
      ExternalLogoutTokenWrap
    );
  }
}
